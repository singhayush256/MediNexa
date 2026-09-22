'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Pill,
  PackageCheck,
  AlertTriangle,
  Clock,
  FileText,
  Plus,
  RefreshCw,
  LogOut,
  CheckCircle2,
  Printer,
  Search,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';

interface MedicationItemData {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  dispensedQuantity: number;
  status: string;
  remarks?: string;
}

interface MedicationOrderData {
  id: string;
  status: string;
  totalItems: number;
  notes?: string;
  createdAt: string;
  patient?: { id: string; user?: { firstName: string; lastName: string } };
  doctor?: { id: string; user?: { firstName: string; lastName: string } };
  facility?: { id: string; name: string };
  items?: MedicationItemData[];
}

interface PharmacyInventoryData {
  id: string;
  medicineName: string;
  genericName?: string;
  batchNumber: string;
  manufacturer?: string;
  stockQuantity: number;
  reorderLevel: number;
  expiryDate: string;
  purchasePrice: number;
  sellingPrice: number;
}

export default function PharmacyPmsPage() {
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'ORDERS' | 'INVENTORY' | 'LOW_STOCK' | 'EXPIRY' | 'PURCHASE_ORDERS'
  >('DASHBOARD');

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('medinexa_token');
      localStorage.removeItem('token');
      localStorage.removeItem('medinexa_user');
      sessionStorage.removeItem('medinexa_token');
      document.cookie = 'medinexa_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.href = '/login';
    }
  };
  const [orders, setOrders] = useState<MedicationOrderData[]>([]);
  const [inventory, setInventory] = useState<PharmacyInventoryData[]>([]);
  const [lowStock, setLowStock] = useState<PharmacyInventoryData[]>([]);
  const [expiring, setExpiring] = useState<PharmacyInventoryData[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<MedicationOrderData | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Dispensing Form State
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [dispenseQtyMap, setDispenseQtyMap] = useState<Record<string, { inventoryId: string; qty: number }>>({});

  // Inventory Stock Modal State
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockForm, setStockForm] = useState({
    medicineName: 'Dolo 650 (Paracetamol 650mg)',
    genericName: 'Paracetamol',
    batchNumber: 'BATCH-2026-DL65',
    manufacturer: 'Micro Labs Ltd',
    stockQuantity: 100,
    reorderLevel: 25,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    purchasePrice: 1.8,
    sellingPrice: 3.5,
  });

  // Pharmacist: Adjust Stock Modal State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<PharmacyInventoryData | null>(null);
  const [adjustStockQty, setAdjustStockQty] = useState(0);
  const [adjustSellingPrice, setAdjustSellingPrice] = useState(0);
  const [adjustRemarks, setAdjustRemarks] = useState('');

  // Receipt Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Analytics Metrics
  const [analytics, setAnalytics] = useState({
    ordersToday: 24,
    medicinesDispensed: 185,
    revenue: 12450.0,
    lowStockCount: 3,
    expiringMedicinesCount: 2,
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const getHeaders = () => {
    const token = localStorage.getItem('medinexa_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

const DEMO_PHARMACY_INVENTORY: PharmacyInventoryData[] = [
  {
    id: 'inv-dolo',
    medicineName: 'Dolo 650 (Paracetamol 650mg)',
    genericName: 'Paracetamol',
    batchNumber: 'BATCH-2026-DL65',
    manufacturer: 'Micro Labs Ltd',
    stockQuantity: 420,
    reorderLevel: 50,
    expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
    purchasePrice: 18.0,
    sellingPrice: 32.5,
  },
  {
    id: 'inv-aug',
    medicineName: 'Augmentin 625 Duo (Amoxicillin + Clavulanate)',
    genericName: 'Amoxicillin + Potassium Clavulanate',
    batchNumber: 'BATCH-2026-AG62',
    manufacturer: 'GlaxoSmithKline (GSK)',
    stockQuantity: 180,
    reorderLevel: 40,
    expiryDate: new Date(Date.now() + 280 * 86400000).toISOString().slice(0, 10),
    purchasePrice: 165.0,
    sellingPrice: 204.0,
  },
  {
    id: 'inv-pan',
    medicineName: 'Pan 40 (Pantoprazole 40mg)',
    genericName: 'Pantoprazole Gastro-resistant',
    batchNumber: 'BATCH-2026-PN40',
    manufacturer: 'Alkem Laboratories',
    stockQuantity: 310,
    reorderLevel: 60,
    expiryDate: new Date(Date.now() + 450 * 86400000).toISOString().slice(0, 10),
    purchasePrice: 110.0,
    sellingPrice: 155.0,
  },
  {
    id: 'inv-azith',
    medicineName: 'Azithral 500 (Azithromycin 500mg)',
    genericName: 'Azithromycin Tablets IP',
    batchNumber: 'BATCH-2026-AZ50',
    manufacturer: 'Alembic Pharmaceuticals',
    stockQuantity: 14,
    reorderLevel: 30,
    expiryDate: new Date(Date.now() + 200 * 86400000).toISOString().slice(0, 10),
    purchasePrice: 85.0,
    sellingPrice: 118.0,
  },
  {
    id: 'inv-atorva',
    medicineName: 'Atorva 20 (Atorvastatin 20mg)',
    genericName: 'Atorvastatin Calcium',
    batchNumber: 'BATCH-2026-AT20',
    manufacturer: 'Zydus Cadila',
    stockQuantity: 220,
    reorderLevel: 45,
    expiryDate: new Date(Date.now() + 380 * 86400000).toISOString().slice(0, 10),
    purchasePrice: 125.0,
    sellingPrice: 175.0,
  },
  {
    id: 'inv-telma',
    medicineName: 'Telma 40 (Telmisartan 40mg)',
    genericName: 'Telmisartan Tablets',
    batchNumber: 'BATCH-2026-TL40',
    manufacturer: 'Glenmark Pharmaceuticals',
    stockQuantity: 18,
    reorderLevel: 35,
    expiryDate: new Date(Date.now() + 300 * 86400000).toISOString().slice(0, 10),
    purchasePrice: 95.0,
    sellingPrice: 142.0,
  },
];

const DEMO_PHARMACY_ORDERS: MedicationOrderData[] = [
  {
    id: 'ord-101',
    status: 'PENDING_DISPENSE',
    totalItems: 3,
    notes: 'Urgent OPD prescription for Acute Upper Respiratory Tract Infection',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    patient: { id: 'p-1', user: { firstName: 'Aarav', lastName: 'Sharma' } },
    doctor: { id: 'd-1', user: { firstName: 'Dr. Rajesh', lastName: 'Singh' } },
    facility: { id: 'f-1', name: 'MediNexa Super Speciality Hospital' },
    items: [
      { id: 'item-1', medicineName: 'Augmentin 625 Duo', dosage: '625mg', frequency: 'Twice daily (BD)', duration: '5 days', quantity: 10, dispensedQuantity: 0, status: 'PENDING' },
      { id: 'item-2', medicineName: 'Dolo 650', dosage: '650mg', frequency: 'SOS (When needed for fever)', duration: '3 days', quantity: 10, dispensedQuantity: 0, status: 'PENDING' },
      { id: 'item-3', medicineName: 'Pan 40', dosage: '40mg', frequency: 'Once daily before breakfast (OD)', duration: '5 days', quantity: 5, dispensedQuantity: 0, status: 'PENDING' },
    ],
  },
  {
    id: 'ord-102',
    status: 'DISPENSED',
    totalItems: 2,
    notes: 'Monthly chronic hypertension refill',
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
    patient: { id: 'p-2', user: { firstName: 'Meera', lastName: 'Patel' } },
    doctor: { id: 'd-2', user: { firstName: 'Dr. Sunita', lastName: 'Rao' } },
    facility: { id: 'f-1', name: 'MediNexa Super Speciality Hospital' },
    items: [
      { id: 'item-4', medicineName: 'Telma 40', dosage: '40mg', frequency: 'Once daily (OD)', duration: '30 days', quantity: 30, dispensedQuantity: 30, status: 'DISPENSED' },
      { id: 'item-5', medicineName: 'Atorva 20', dosage: '20mg', frequency: 'Nightly (HS)', duration: '30 days', quantity: 30, dispensedQuantity: 30, status: 'DISPENSED' },
    ],
  },
];

  const fetchPharmacyData = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) {
      setOrders(DEMO_PHARMACY_ORDERS);
      setInventory(DEMO_PHARMACY_INVENTORY);
      setLowStock(DEMO_PHARMACY_INVENTORY.filter((i) => i.stockQuantity <= i.reorderLevel));
      setSelectedOrder(DEMO_PHARMACY_ORDERS[0]);
      setLoading(false);
      return;
    }

    try {
      const [ordRes, invRes, lowRes, expRes, anaRes, poRes, rxRes] = await Promise.all([
        fetch(`${apiUrl}/pharmacy/orders`, { headers: getHeaders() }).then((r) => r.json()).catch(() => []),
        fetch(`${apiUrl}/pharmacy/inventory`, { headers: getHeaders() }).then((r) => r.json()).catch(() => []),
        fetch(`${apiUrl}/pharmacy/low-stock`, { headers: getHeaders() }).then((r) => r.json()).catch(() => []),
        fetch(`${apiUrl}/pharmacy/expiry-alerts`, { headers: getHeaders() }).then((r) => r.json()).catch(() => []),
        fetch(`${apiUrl}/pharmacy/analytics`, { headers: getHeaders() }).then((r) => r.json()).catch(() => null),
        fetch(`${apiUrl}/pharmacy/purchase-orders`, { headers: getHeaders() }).then((r) => r.json()).catch(() => []),
        fetch(`${apiUrl}/prescriptions`, { headers: getHeaders() }).then((r) => r.json()).catch(() => []),
      ]);

      const rxOrders: MedicationOrderData[] = Array.isArray(rxRes) ? rxRes.map((rx: any) => ({
        id: rx.id,
        status: rx.status === 'ISSUED' ? 'PENDING_DISPENSE' : rx.status || 'PENDING_DISPENSE',
        totalItems: rx.items?.length || 0,
        notes: rx.notes || `Prescription #${rx.prescriptionNumber || rx.id.slice(0, 8)}`,
        createdAt: rx.prescribedAt || rx.createdAt || new Date().toISOString(),
        patient: rx.patient,
        doctor: rx.doctor,
        facility: rx.facility,
        items: (rx.items || []).map((it: any) => ({
          id: it.id,
          medicineName: it.medication?.name || it.instructions || 'Prescribed Medication',
          dosage: it.dosage || '1 Tab',
          frequency: it.frequency || 'Daily',
          duration: it.duration || '5 Days',
          quantity: it.quantity || 10,
          dispensedQuantity: it.dispenses?.reduce((acc: number, d: any) => acc + (d.quantityDispensed || 0), 0) || 0,
          status: it.dispenses?.length > 0 ? 'DISPENSED' : 'PENDING',
          remarks: it.instructions || it.foodTiming,
        })),
      })) : [];

      const rawOrdList = Array.isArray(ordRes) && ordRes.length > 0 ? ordRes : [];
      const ordList = [...rxOrders, ...rawOrdList].length > 0 ? [...rxOrders, ...rawOrdList] : DEMO_PHARMACY_ORDERS;
      const invList = Array.isArray(invRes) && invRes.length > 0 ? invRes : DEMO_PHARMACY_INVENTORY;
      const lowStockList = Array.isArray(lowRes) && lowRes.length > 0 ? lowRes : invList.filter((i: any) => i.stockQuantity <= i.reorderLevel);

      setOrders(ordList);
      setInventory(invList);
      setLowStock(lowStockList);
      setExpiring(Array.isArray(expRes) ? expRes : []);
      setPurchaseOrders(Array.isArray(poRes) ? poRes : []);

      if (ordList.length > 0 && !selectedOrder) {
        setSelectedOrder(ordList[0]);
      }
      if (anaRes && typeof anaRes === 'object' && !anaRes.statusCode && (anaRes.ordersToday || anaRes.revenue)) {
        setAnalytics(anaRes);
      } else {
        setAnalytics({
          ordersToday: 24,
          medicinesDispensed: 185,
          revenue: 12450.0,
          lowStockCount: lowStockList.length,
          expiringMedicinesCount: 2,
        });
      }
    } catch (err) {
      console.error('Failed to load pharmacy PMS data, using demo baseline:', err);
      setOrders(DEMO_PHARMACY_ORDERS);
      setInventory(DEMO_PHARMACY_INVENTORY);
      setLowStock(DEMO_PHARMACY_INVENTORY.filter((i) => i.stockQuantity <= i.reorderLevel));
      setSelectedOrder(DEMO_PHARMACY_ORDERS[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacyData();
  }, []);

  const handleDispense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsSubmitting(true);
    setActionSuccess(null);
    setActionError(null);

    const dispensedItems = Object.entries(dispenseQtyMap).map(([itemId, val]) => ({
      itemId,
      inventoryId: val.inventoryId,
      dispenseQuantity: val.qty,
    }));

    try {
      const res = await fetch(`${apiUrl}/pharmacy/dispense`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          medicationOrderId: selectedOrder.id,
          dispensedItems,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Dispensing failed');

      setActionSuccess(`✓ Medication dispensed successfully! Status: ${data.status}`);
      setShowDispenseModal(false);
      fetchPharmacyData();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await fetch(`${apiUrl}/pharmacy/inventory`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(stockForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Stock addition failed');

      setActionSuccess(`✓ Stock added successfully! Batch #${data.batchNumber}`);
      setShowStockModal(false);
      fetchPharmacyData();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAdjustModal = (item: PharmacyInventoryData) => {
    setAdjustingItem(item);
    setAdjustStockQty(item.stockQuantity);
    setAdjustSellingPrice(item.sellingPrice);
    setAdjustRemarks('');
    setShowAdjustModal(true);
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;

    setIsSubmitting(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await fetch(`${apiUrl}/pharmacy/inventory/${adjustingItem.id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          stockQuantity: parseInt(String(adjustStockQty), 10),
          sellingPrice: parseFloat(String(adjustSellingPrice)),
          remarks: adjustRemarks || 'Stock adjustment via Pharmacist PMS console',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to adjust stock');

      setActionSuccess(`✓ Stock updated for ${adjustingItem.medicineName}! New Qty: ${data.stockQuantity} Units`);
      setShowAdjustModal(false);
      fetchPharmacyData();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPharmacyInvoice = async (order: MedicationOrderData) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Header Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text('APOLLO MEDINEXA SUPER SPECIALITY HOSPITAL', 14, 12);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(153, 246, 228);
      doc.text('OUTPATIENT & INPATIENT PHARMACY SERVICES (DL NO: 20B/21B-DL-4921)', 14, 18);
      doc.setTextColor(203, 213, 225);
      doc.text('Knowledge Park II, Greater Noida, UP | 24/7 Dispensary Helpline: +91 8114240263', 14, 24);

      // Tax Invoice Badge
      doc.setFillColor(16, 185, 129);
      doc.roundedRect(158, 6, 38, 18, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('TAX INVOICE', 166, 13);
      doc.setFontSize(7);
      doc.text('ORIGINAL BILL', 167, 19);

      // Invoice & Patient Demographics Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, 38, 182, 32, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('PATIENT INFORMATION', 18, 44);
      doc.text('DISPENSE & BILL DETAILS', 110, 44);

      doc.setDrawColor(203, 213, 225);
      doc.line(18, 46, 95, 46);
      doc.line(110, 46, 188, 46);

      const pName = `${order.patient?.user?.firstName || 'Ayush'} ${order.patient?.user?.lastName || 'Singh'}`;
      const docName = order.doctor?.user ? `Dr. ${order.doctor.user.firstName} ${order.doctor.user.lastName}` : 'Dr. Arvind Deshmukh';

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`Patient Name: ${pName}`, 18, 52);
      doc.text(`UHID / MRN: MDNX-${order.patient?.id?.slice(0, 8) || '2026-9041'}`, 18, 58);
      doc.text(`Prescribed By: ${docName}`, 18, 64);

      doc.text(`Invoice No: INV-PHARM-${order.id.slice(0, 8).toUpperCase()}`, 110, 52);
      doc.text(`Date & Time: ${new Date(order.createdAt).toLocaleString()}`, 110, 58);
      doc.text(`Dispense Status: ${order.status}`, 110, 64);

      // Items Table Header
      let y = 78;
      doc.setFillColor(30, 41, 59);
      doc.rect(14, y, 182, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('MEDICINE / FORMULATION', 18, y + 5.5);
      doc.text('DOSAGE & REGIMEN', 90, y + 5.5);
      doc.text('QTY', 140, y + 5.5);
      doc.text('RATE (₹)', 155, y + 5.5);
      doc.text('TOTAL (₹)', 175, y + 5.5);

      y += 8;
      let grandTotal = 0;
      (order.items || []).forEach((item, idx) => {
        const isAlt = idx % 2 === 1;
        if (isAlt) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y, 182, 8, 'F');
        }

        doc.setDrawColor(241, 245, 249);
        doc.line(14, y + 8, 196, y + 8);

        const unitRate = item.medicineName.includes('Augmentin') ? 22.0 : item.medicineName.includes('Pan 40') ? 11.0 : item.medicineName.includes('Dolo') ? 3.5 : 15.0;
        const lineTotal = item.quantity * unitRate;
        grandTotal += lineTotal;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(item.medicineName.length > 38 ? item.medicineName.slice(0, 38) + '...' : item.medicineName, 18, y + 5);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(`${item.dosage} | ${item.frequency}`, 90, y + 5);
        doc.text(String(item.quantity), 142, y + 5);
        doc.text(`₹${unitRate.toFixed(2)}`, 155, y + 5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`₹${lineTotal.toFixed(2)}`, 175, y + 5);

        y += 8;
      });

      // GST Calculation Summary
      const gstRate = 0.12;
      const taxableAmount = grandTotal / (1 + gstRate);
      const gstAmount = grandTotal - taxableAmount;
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;

      y += 6;
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(120, y, 76, 32, 2, 2, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Taxable Value:', 125, y + 7);
      doc.text(`₹${taxableAmount.toFixed(2)}`, 175, y + 7);

      doc.text('CGST (6.0%):', 125, y + 13);
      doc.text(`₹${cgst.toFixed(2)}`, 175, y + 13);

      doc.text('SGST (6.0%):', 125, y + 19);
      doc.text(`₹${sgst.toFixed(2)}`, 175, y + 19);

      doc.setDrawColor(203, 213, 225);
      doc.line(125, y + 22, 192, y + 22);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('Net Total Payable:', 125, y + 28);
      doc.setTextColor(16, 185, 129);
      doc.text(`₹${grandTotal.toFixed(2)}`, 175, y + 28);

      // Sign-off Block
      y += 42;
      doc.setDrawColor(148, 163, 184);
      doc.line(18, y + 10, 65, y + 10);
      doc.line(140, y + 10, 188, y + 10);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Authorized Pharmacist', 18, y + 15);
      doc.text('Dispensing Chemist & Stamp', 140, y + 15);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('Reg No: DL-PHARM-2024-88', 18, y + 19);
      doc.text('Apollo MediNexa Super Speciality Pharmacy', 140, y + 19);

      // Footer
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 282, 210, 15, 'F');
      doc.setTextColor(203, 213, 225);
      doc.setFontSize(7);
      doc.text('*** COMPUTER GENERATED TAX INVOICE • STATUTORY COMPLIANCE UNDER GST ACT 2017 ***', 25, 288);
      doc.text('Medicines once sold will only be taken back if within expiry and original sealed packaging.', 35, 292);

      doc.save(`Invoice_PHARM_${order.id.slice(0, 8)}.pdf`);
    } catch (err) {
      console.error('Invoice PDF error:', err);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 z-20">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <MediNexaLogo size="sm" subtitle="PHARMACY" href="/dashboard" />
        </div>

        {/* Staff Profile Card */}
        <div className="p-3 mx-3 mt-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800/80 dark:to-slate-800/40 border border-emerald-100 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              RS
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-slate-900 dark:text-white truncate">Rohan Sharma</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">Chief Pharmacist (B.Pharm)</div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Counter #01 Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-3 py-3 flex-1 overflow-y-auto space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">Navigation</div>
          {[
            { id: 'DASHBOARD', label: 'Station Dashboard', icon: LayoutDashboard },
            { id: 'ORDERS', label: 'Orders Queue', icon: Pill, badge: orders.filter((o) => o.status === 'PENDING').length },
            { id: 'INVENTORY', label: 'Drug Inventory', icon: PackageCheck, badge: inventory.length },
            { id: 'LOW_STOCK', label: 'Low Stock Reorder', icon: AlertTriangle, badge: lowStock.length },
            { id: 'EXPIRY', label: 'Expiry Warnings', icon: Clock, badge: expiring.length },
            { id: 'PURCHASE_ORDERS', label: 'Purchase Orders', icon: FileText, badge: purchaseOrders.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-slate-500">Theme</span>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out Station
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-lg border border-emerald-500/20 uppercase tracking-wide">
              Pharmacy Counter #01
            </span>
            <span className="text-xs font-bold text-slate-500">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowStockModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              + Add Stock Batch
            </button>
            <button
              onClick={fetchPharmacyData}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Global Action Notifications */}
        {actionSuccess && (
          <div className="max-w-7xl mx-auto px-6 pt-4 w-full">
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold shadow-sm flex items-center justify-between">
              <span>{actionSuccess}</span>
              <button onClick={() => setActionSuccess(null)} className="text-emerald-500 hover:text-emerald-700">✕</button>
            </div>
          </div>
        )}

        {actionError && (
          <div className="max-w-7xl mx-auto px-6 pt-4 w-full">
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold shadow-sm flex items-center justify-between">
              <span>{actionError}</span>
              <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700">✕</button>
            </div>
          </div>
        )}

        {/* Station Main Content */}
        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 flex-1">
          {/* Dashboard Tab Content */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-6">
              {/* Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white p-6 md:p-8 shadow-xl shadow-emerald-500/10">
                <div className="relative z-10 max-w-2xl space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold border border-white/20">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Pharmacy Dispensary Command • Store Counter #01</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                    Hospital Pharmacy & Medical Store
                  </h1>
                  <p className="text-emerald-100 text-xs md:text-sm font-medium leading-relaxed">
                    Digital prescription fulfilment, automated batch-level inventory deduction, cold-chain monitoring, low-stock reorders, and statutory GST billing.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setShowStockModal(true)}
                      className="px-4 py-2 bg-white text-emerald-800 font-bold text-xs rounded-xl shadow hover:bg-emerald-50 transition"
                    >
                      + Add Stock Batch
                    </button>
                    <button
                      onClick={() => setActiveTab('ORDERS')}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl backdrop-blur-md transition"
                    >
                      Dispense Queue ({orders.filter((o) => o.status === 'PENDING').length})
                    </button>
                    <button
                      onClick={() => setActiveTab('LOW_STOCK')}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl backdrop-blur-md transition"
                    >
                      Low Stock Alerts ({lowStock.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* KPI Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Orders Today</span>
                  <span className="text-2xl font-black text-sky-600 mt-1 block">{analytics.ordersToday}</span>
                  <span className="text-[11px] text-teal-600 font-semibold mt-0.5">OPD & IPD Prescriptions</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Medicines Dispensed</span>
                  <span className="text-2xl font-black text-emerald-600 mt-1 block">{analytics.medicinesDispensed}</span>
                  <span className="text-[11px] text-emerald-500 font-semibold mt-0.5">Units checked out</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Revenue (₹)</span>
                  <span className="text-2xl font-black text-purple-600 mt-1 block">₹{analytics.revenue.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">Today's cash & cashless</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Low Stock Items</span>
                  <span className="text-2xl font-black text-amber-500 mt-1 block">{analytics.lowStockCount}</span>
                  <span className="text-[11px] text-amber-600 font-semibold mt-0.5">Below threshold</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Expiring (&lt;90 Days)</span>
                  <span className="text-2xl font-black text-rose-500 mt-1 block">{analytics.expiringMedicinesCount}</span>
                  <span className="text-[11px] text-rose-600 font-semibold mt-0.5">Critical audit alert</span>
                </div>
              </div>

              {/* Operational Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Dispense Orders Snapshot */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Active Dispensing Queue</h3>
                      <p className="text-[11px] text-slate-500">Immediate patient prescriptions awaiting fulfillment</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('ORDERS')}
                      className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      Full Queue <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orders.slice(0, 5).map((ord) => {
                      const pName = ord.patient?.user ? `${ord.patient.user.firstName} ${ord.patient.user.lastName}` : 'Patient';
                      const docName = ord.doctor?.user ? `Dr. ${ord.doctor.user.firstName} ${ord.doctor.user.lastName}` : 'Doctor';
                      return (
                        <div key={ord.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs">
                              RX
                            </span>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">{pName}</div>
                              <div className="text-[11px] text-slate-500">{docName} • {ord.items?.length || 0} items prescribed</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ord.status === 'DISPENSED'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                            }`}>
                              {ord.status}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedOrder(ord);
                                setShowDispenseModal(true);
                              }}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition"
                            >
                              Dispense
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Formulary Stock & Storage Protocols */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Formulary Stock Health</h3>
                    <p className="text-[11px] text-slate-500">Fast-moving emergency drugs</p>
                  </div>
                  <div className="space-y-2.5">
                    {inventory.slice(0, 5).map((item) => (
                      <div key={item.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{item.medicineName}</div>
                          <div className="text-[10px] text-slate-500">Batch: {item.batchNumber} • MRP: ₹{item.sellingPrice}</div>
                        </div>
                        <div className="text-right">
                          <span className={`font-black text-xs ${item.stockQuantity <= item.reorderLevel ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {item.stockQuantity} units
                          </span>
                          <div className="text-[9px] text-slate-400">Min: {item.reorderLevel}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Storage Protocols</div>
                    <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <div>❄️ Cold Chain (2-8°C): <span className="text-emerald-600 font-bold">Vaccines & Insulin OK</span></div>
                      <div>🌡️ Room Ambient (&lt;25°C): <span className="text-emerald-600 font-bold">Tablets & Syrups OK</span></div>
                      <div>🔒 Schedule X & H1: <span className="text-purple-600 font-bold">Locked in Narcotic Vault</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

      {/* Tab Contents */}
      {activeTab === 'ORDERS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders Roster */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-600" />
                <span>Prescription Orders</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
                {orders.length} Total
              </span>
            </div>

            {/* Instant Patient Name / Phone Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => {
                  setOrderSearchQuery(e.target.value);
                  const q = e.target.value.toLowerCase();
                  if (q) {
                    const match = orders.find(
                      (o) =>
                        `${o.patient?.user?.firstName || ''} ${o.patient?.user?.lastName || ''}`.toLowerCase().includes(q) ||
                        o.id.toLowerCase().includes(q) ||
                        o.items?.some((i) => i.medicineName.toLowerCase().includes(q)),
                    );
                    if (match) setSelectedOrder(match);
                  }
                }}
                placeholder="Search patient name, phone, or RX #..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">Loading orders...</div>
            ) : (() => {
                const filteredOrders = orders.filter((ord) => {
                  if (!orderSearchQuery.trim()) return true;
                  const q = orderSearchQuery.toLowerCase();
                  const patName = `${ord.patient?.user?.firstName || ''} ${ord.patient?.user?.lastName || ''}`.toLowerCase();
                  const docName = `${ord.doctor?.user?.firstName || ''} ${ord.doctor?.user?.lastName || ''}`.toLowerCase();
                  const idMatch = ord.id?.toLowerCase().includes(q);
                  const noteMatch = ord.notes?.toLowerCase().includes(q);
                  const medMatch = ord.items?.some((i) => i.medicineName?.toLowerCase().includes(q));
                  return patName.includes(q) || docName.includes(q) || idMatch || noteMatch || medMatch;
                });

                if (filteredOrders.length === 0) {
                  return (
                    <div className="py-8 text-center text-slate-400 text-xs font-medium bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4">
                      No prescriptions found matching "{orderSearchQuery}".
                    </div>
                  );
                }

                return (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {filteredOrders.map((ord) => {
                      const isSelected = selectedOrder?.id === ord.id;
                      return (
                        <div
                          key={ord.id}
                          onClick={() => setSelectedOrder(ord)}
                          className={`p-4 rounded-2xl border transition cursor-pointer ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/70'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 dark:text-white text-xs">Order #{ord.id.slice(0, 8)}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              ord.status === 'DISPENSED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                              ord.status === 'PARTIALLY_DISPENSED' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                            }`}>
                              {ord.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1">
                            Patient: <span className="font-bold text-slate-900 dark:text-white">{ord.patient?.user?.firstName || 'Aarav'} {ord.patient?.user?.lastName || 'Sharma'}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                            <span>Dr. {ord.doctor?.user?.firstName || 'Singh'}</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{ord.totalItems} Prescribed Item(s)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            }
          </div>

          {/* Order Details & Dispensing Station */}
          <div className="lg:col-span-2 space-y-6">
            {selectedOrder ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">Medication Order Details</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Order ID: #{selectedOrder.id}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownloadPharmacyInvoice(selectedOrder)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center space-x-1"
                    >
                      <span>📥</span>
                      <span>GST Tax Invoice (PDF)</span>
                    </button>
                    <button
                      onClick={() => setShowReceiptModal(true)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl shadow-sm"
                    >
                      🧾 Print Receipt
                    </button>
                    {selectedOrder.status !== 'DISPENSED' && selectedOrder.status !== 'CANCELLED' && (
                      <button
                        onClick={() => {
                          const initialMap: Record<string, { inventoryId: string; qty: number }> = {};
                          selectedOrder.items?.forEach((i) => {
                            const invMatch = inventory.find((inv) => inv.medicineName.toLowerCase().includes(i.medicineName.toLowerCase())) || inventory[0];
                            initialMap[i.id] = {
                              inventoryId: invMatch?.id || '',
                              qty: i.quantity - i.dispensedQuantity,
                            };
                          });
                          setDispenseQtyMap(initialMap);
                          setShowDispenseModal(true);
                        }}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition"
                      >
                        💊 Dispense Medication
                      </button>
                    )}
                  </div>
                </div>

                {/* Items Roster */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900">Prescribed Medicine Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item) => {
                      const isBought = item.status === 'DISPENSED' || item.dispensedQuantity >= item.quantity;
                      return (
                        <div key={item.id} className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
                          isBought
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-amber-50/50 border-amber-300'
                        }`}>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900">{item.medicineName}</span>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                isBought
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                              }`}>
                                {isBought ? '✓ Medicine Bought & Dispensed' : '⚠️ Medicine Not Bought (Pending)'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                              Dosage: {item.dosage} | Frequency: {item.frequency} | Duration: {item.duration}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-right">
                            <div>
                              <span className="font-extrabold text-slate-800 block text-xs">
                                {item.dispensedQuantity} / {item.quantity} Dispensed
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {isBought ? 'Fully Paid & Picked Up' : 'Unpurchased by patient'}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const nextStatus = isBought ? 'ORDERED' : 'DISPENSED';
                                const nextQty = isBought ? 0 : item.quantity;
                                const updatedItems = selectedOrder.items?.map((it) =>
                                  it.id === item.id ? { ...it, status: nextStatus, dispensedQuantity: nextQty } : it
                                );
                                const updatedOrder = { ...selectedOrder, items: updatedItems };
                                setSelectedOrder(updatedOrder);
                                setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? updatedOrder : o)));

                                // Also sync to patient prescriptions localStorage
                                if (typeof window !== 'undefined') {
                                  try {
                                    const storedRx = JSON.parse(localStorage.getItem('medinexa_patient_prescriptions') || '[]');
                                    const nextPurchaseStatus = isBought ? 'NOT_BOUGHT' : 'BOUGHT';
                                    const updatedRx = storedRx.map((rx: any) => {
                                      if (rx.drugName?.toLowerCase().includes(item.medicineName.toLowerCase())) {
                                        return { ...rx, purchaseStatus: nextPurchaseStatus };
                                      }
                                      return rx;
                                    });
                                    localStorage.setItem('medinexa_patient_prescriptions', JSON.stringify(updatedRx));
                                  } catch (e) {}
                                }
                                setActionSuccess(`✓ Medicine purchase status toggled for '${item.medicineName}'!`);
                                setTimeout(() => setActionSuccess(null), 4000);
                              }}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition shadow-sm ${
                                isBought
                                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {isBought ? 'Mark as Not Bought' : 'Mark as Bought (Dispense)'}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center text-slate-400 font-medium text-xs">
                Select a medication order from the roster to view items and dispense.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'INVENTORY' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Pharmacy Stock Inventory Roster</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
                  <th className="py-3 px-4">Medicine Name</th>
                  <th className="py-3 px-4">Batch #</th>
                  <th className="py-3 px-4">Manufacturer</th>
                  <th className="py-3 px-4">Stock Quantity</th>
                  <th className="py-3 px-4">Reorder Level</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Selling Price</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((inv) => {
                  const isLow = inv.stockQuantity < inv.reorderLevel;
                  const isExpiring = new Date(inv.expiryDate) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-extrabold text-slate-900">{inv.medicineName}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{inv.batchNumber}</td>
                      <td className="py-3 px-4 text-slate-600">{inv.manufacturer || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`font-extrabold px-2.5 py-1 rounded-lg text-[11px] ${
                          isLow ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {inv.stockQuantity} Units
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{inv.reorderLevel}</td>
                      <td className="py-3 px-4 font-medium">
                        <span className={isExpiring ? 'text-red-600 font-bold' : 'text-slate-700'}>
                          {new Date(inv.expiryDate).toISOString().slice(0, 10)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-extrabold text-slate-800">₹{inv.sellingPrice.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenAdjustModal(inv)}
                          className="px-3 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-extrabold rounded-lg text-[11px] transition shadow-sm"
                        >
                          Update Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Low Stock Alerts Tab */}
      {activeTab === 'LOW_STOCK' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Low Stock Reorder Radar</h2>
              <p className="text-xs text-slate-500">Medicines currently below statutory reorder thresholds requiring procurement replenishment.</p>
            </div>
            <button
              onClick={() => setActiveTab('INVENTORY')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              View Full Inventory
            </button>
          </div>
          {lowStock.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold">
              ✓ All medicines currently meet or exceed safety buffer stock thresholds.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-amber-50/50">
                  <th className="py-3 px-4">Medicine</th>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Reorder Level</th>
                  <th className="py-3 px-4">Deficit Units</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStock.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/20">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.medicineName}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{item.batchNumber}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold">{item.stockQuantity} Units</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{item.reorderLevel} Units</td>
                    <td className="py-3 px-4 font-bold text-red-600">-{item.reorderLevel - item.stockQuantity} Units</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenAdjustModal(item)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition shadow-sm"
                      >
                        Refill Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Expiry Alerts Tab */}
      {activeTab === 'EXPIRY' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Drug Expiry Monitoring Station</h2>
              <p className="text-xs text-slate-500">Batches expiring within the next 90 days flagged for priority dispensing or manufacturer returns.</p>
            </div>
          </div>
          {expiring.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold">
              ✓ No near-expiry medication batches detected in current inventory.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-red-50/50">
                  <th className="py-3 px-4">Medicine Name</th>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Remaining Units</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expiring.map((item) => {
                  const daysLeft = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={item.id} className="hover:bg-red-50/20">
                      <td className="py-3 px-4 font-bold text-slate-900">{item.medicineName}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{item.batchNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{item.stockQuantity} Units</td>
                      <td className="py-3 px-4 font-bold text-red-600">{new Date(item.expiryDate).toISOString().slice(0, 10)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                          daysLeft <= 30 ? 'bg-red-200 text-red-900' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {daysLeft <= 30 ? `CRITICAL (${daysLeft} Days)` : `WARNING (${daysLeft} Days)`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenAdjustModal(item)}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[11px] transition shadow-sm"
                        >
                          Quarantine / Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Purchase Orders & Procurement History Tab */}
      {activeTab === 'PURCHASE_ORDERS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Procurement & Purchase Orders History</h2>
              <p className="text-xs text-slate-500">Historical supplier procurement invoices, pharmaceutical consignments, and vendor fulfilment audit.</p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
              {purchaseOrders.length} Procurement Records
            </span>
          </div>
          {purchaseOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold">
              No historical purchase orders recorded.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-purple-50/50">
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Wholesale Supplier / Distributor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Invoice Value</th>
                  <th className="py-3 px-4">Creation Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-purple-700">{po.poNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{po.supplierName}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                        po.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-800' :
                        po.status === 'APPROVED' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">₹{po.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(po.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
        </main>
      </div>

      {/* Dispense Medication Modal */}
      {showDispenseModal && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-extrabold text-slate-900">Dispense Medication Items</h2>
              <button onClick={() => setShowDispenseModal(false)} className="text-slate-400 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleDispense} className="space-y-4 text-xs">
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-extrabold text-slate-900 block">{item.medicineName} (Req: {item.quantity})</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Select Batch</label>
                      <select
                        value={dispenseQtyMap[item.id]?.inventoryId || ''}
                        onChange={(e) => setDispenseQtyMap((prev) => ({
                          ...prev,
                          [item.id]: { inventoryId: e.target.value, qty: prev[item.id]?.qty || 1 },
                        }))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                      >
                        {inventory.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.medicineName} (Batch: {inv.batchNumber}, Stock: {inv.stockQuantity})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Quantity to Dispense</label>
                      <input
                        type="number"
                        min="1"
                        max={item.quantity - item.dispensedQuantity}
                        value={dispenseQtyMap[item.id]?.qty || 1}
                        onChange={(e) => setDispenseQtyMap((prev) => ({
                          ...prev,
                          [item.id]: { inventoryId: prev[item.id]?.inventoryId || '', qty: parseInt(e.target.value) || 1 },
                        }))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDispenseModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-extrabold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow transition"
                >
                  Confirm Dispense & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-extrabold text-slate-900">Add Inventory Stock Batch</h2>
              <button onClick={() => setShowStockModal(false)} className="text-slate-400 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleAddStock} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Medicine Name</label>
                <input
                  type="text"
                  required
                  value={stockForm.medicineName}
                  onChange={(e) => setStockForm({ ...stockForm, medicineName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batch Number</label>
                  <input
                    type="text"
                    required
                    value={stockForm.batchNumber}
                    onChange={(e) => setStockForm({ ...stockForm, batchNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={stockForm.manufacturer}
                    onChange={(e) => setStockForm({ ...stockForm, manufacturer: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={stockForm.stockQuantity}
                    onChange={(e) => setStockForm({ ...stockForm, stockQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={stockForm.expiryDate}
                    onChange={(e) => setStockForm({ ...stockForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-extrabold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow transition"
                >
                  Add Batch Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pharmacist: Adjust Stock Modal */}
      {showAdjustModal && adjustingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Update Stock & Pricing</h2>
                <p className="text-xs text-slate-500 font-semibold">{adjustingItem.medicineName}</p>
              </div>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4 text-xs font-semibold">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1">
                <p><span className="font-bold">Batch Number:</span> {adjustingItem.batchNumber}</p>
                <p><span className="font-bold">Manufacturer:</span> {adjustingItem.manufacturer || 'N/A'}</p>
                <p><span className="font-bold">Expiry Date:</span> {new Date(adjustingItem.expiryDate).toLocaleDateString()}</p>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Stock Quantity (Units)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustStockQty}
                  onChange={(e) => setAdjustStockQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Selling Price (₹ per unit)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={adjustSellingPrice}
                  onChange={(e) => setAdjustSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Adjustment Reason / Notes</label>
                <input
                  type="text"
                  value={adjustRemarks}
                  onChange={(e) => setAdjustRemarks(e.target.value)}
                  placeholder="e.g. Shelf physical reconciliation, restock..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-extrabold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Save Stock Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
