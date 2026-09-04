'use client';

import React, { useEffect, useState } from 'react';

export default function BillingDashboardPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);

  // Active Tab: All Invoices | OPD | IPD | Lab | Pharmacy | Insurance Claims | Payments | Revenue | Analytics
  const [activeTab, setActiveTab] = useState<
    'invoices' | 'opd' | 'ipd' | 'lab' | 'pharmacy' | 'insurance' | 'payments' | 'revenue' | 'analytics'
  >('invoices');

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Common Form Feedback
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected Patient for Billing
  const [selectedPatientId, setSelectedPatientId] = useState('');

  // OPD Billing Form State
  const [opdDoctor, setOpdDoctor] = useState('Dr. Arvind Deshmukh (Internal Medicine)');
  const [opdConsultType, setOpdConsultType] = useState('SENIOR_CONSULTANT');
  const [opdFee, setOpdFee] = useState(800);
  const [opdNotes, setOpdNotes] = useState('Outpatient clinical consultation & general examination');

  // IPD Billing Form State
  const [ipdBedType, setIpdBedType] = useState('ICU');
  const [ipdBedRate, setIpdBedRate] = useState(4500);
  const [ipdBedDays, setIpdBedDays] = useState(3);
  const [ipdDocVisits, setIpdDocVisits] = useState(5);
  const [ipdDocRate, setIpdDocRate] = useState(1000);
  const [ipdProcedureName, setIpdProcedureName] = useState('Laparoscopic Cholecystectomy');
  const [ipdProcedureCharge, setIpdProcedureCharge] = useState(35000);
  const [ipdDiscount, setIpdDiscount] = useState(2000);

  // Lab Billing Form State
  const [selectedLabTests, setSelectedLabTests] = useState<Record<string, { name: string; price: number; selected: boolean }>>({
    cbc: { name: 'Complete Blood Count (CBC) with ESR', price: 650, selected: true },
    fbs: { name: 'Fasting Blood Sugar (FBS)', price: 450, selected: true },
    lft: { name: 'Liver Function Test (LFT) Comprehensive', price: 1100, selected: false },
    kft: { name: 'Kidney Function Test (KFT) with Electrolytes', price: 950, selected: false },
    thyroid: { name: 'Thyroid Profile Total (T3, T4, TSH)', price: 850, selected: false },
    urine: { name: 'Complete Urine Routine & Microscopy', price: 350, selected: false },
  });

  // Pharmacy Billing Form State
  const [pharmacyItems, setPharmacyItems] = useState([
    { name: 'Augmentin 625 Duo (Amoxicillin 500mg + Clavulanate 125mg)', qty: 2, price: 220.0, gstRate: 0.12 },
    { name: 'Pan 40 Gastro-resistant Tablets (Pantoprazole 40mg)', qty: 3, price: 165.0, gstRate: 0.12 },
    { name: 'Dolo 650 (Paracetamol 650mg)', qty: 3, price: 52.5, gstRate: 0.12 },
  ]);

  // Insurance Claim Form State
  const [claimPatientId, setClaimPatientId] = useState('');
  const [claimProviderId, setClaimProviderId] = useState('');
  const [claimPolicyNumber, setClaimPolicyNumber] = useState('POL-STAR-2026-88912');
  const [claimType, setClaimType] = useState('CASHLESS');
  const [claimAmount, setClaimAmount] = useState('51500');
  const [claimDiagnosis, setClaimDiagnosis] = useState('Acute Cholecystitis undergoing Laparoscopic Cholecystectomy');

  // Generic Manual Item Form states
  const [itemCategory, setItemCategory] = useState('OPD');
  const [itemDesc, setItemDesc] = useState('Clinical Consultation Fee');
  const [itemPrice, setItemPrice] = useState('500');
  const [itemQty, setItemQty] = useState('1');

  // Payment form states
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [payRef, setPayRef] = useState('');

  // Refund form states
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('Duplicate service billing correction');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const getHeaders = () => {
    const token = localStorage.getItem('medinexa_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/billing/invoices`, { headers: getHeaders() }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${apiUrl}/billing/payments`, { headers: getHeaders() }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${apiUrl}/billing/claims`, { headers: getHeaders() }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${apiUrl}/insurance/providers`, { headers: getHeaders() }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${apiUrl}/patients`, { headers: getHeaders() }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${apiUrl}/billing/revenue`, { headers: getHeaders() }).then((r) => (r.ok ? r.json() : null)),
      fetch(`${apiUrl}/billing/analytics`, { headers: getHeaders() }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([invs, pays, clms, provs, pts, rev, anal]) => {
        setInvoices(Array.isArray(invs) ? invs : []);
        setPayments(Array.isArray(pays) ? pays : []);
        setClaims(Array.isArray(clms) ? clms : []);
        setProviders(Array.isArray(provs) ? provs : []);
        const patientList = Array.isArray(pts) ? pts : Array.isArray(pts?.data) ? pts.data : [];
        setPatients(patientList);
        if (patientList.length > 0 && !selectedPatientId) {
          setSelectedPatientId(patientList[0].id);
          setClaimPatientId(patientList[0].id);
        }
        if (Array.isArray(provs) && provs.length > 0 && !claimProviderId) {
          setClaimProviderId(provs[0].id);
        }
        setRevenueData(rev);
        setAnalytics(anal);
      })
      .catch((err) => console.error('Failed to load billing data:', err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const clearAlerts = () => {
    setTimeout(() => {
      setActionSuccess(null);
      setActionError(null);
    }, 5000);
  };

  // 1. OPD Consultation Billing Submit
  const handleCreateOpdBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionSuccess(null);
    setActionError(null);

    const patId = selectedPatientId || (patients[0]?.id) || '98eb2b37-1511-498f-a066-19cd487639e0';

    try {
      const res = await fetch(`${apiUrl}/billing/invoices`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          patientId: patId,
          discountAmount: 0,
          taxAmount: 0,
          items: [
            {
              category: 'OPD',
              description: `Specialist OPD Consultation - ${opdDoctor} (${opdConsultType}) - SAC 999311`,
              quantity: 1,
              unitPrice: Number(opdFee),
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create OPD bill');

      setActionSuccess(`✓ OPD Consultation Invoice generated: #${data.invoiceNumber || 'Created'} (₹${opdFee})`);
      loadData();
      setActiveTab('invoices');
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
      clearAlerts();
    }
  };

  // 2. IPD Comprehensive Billing Submit
  const handleCreateIpdBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionSuccess(null);
    setActionError(null);

    const patId = selectedPatientId || (patients[0]?.id) || '98eb2b37-1511-498f-a066-19cd487639e0';
    const bedTotal = ipdBedDays * ipdBedRate;
    const docTotal = ipdDocVisits * ipdDocRate;
    const procTotal = Number(ipdProcedureCharge);
    const subtotal = bedTotal + docTotal + procTotal;

    try {
      const res = await fetch(`${apiUrl}/billing/invoices`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          patientId: patId,
          discountAmount: Number(ipdDiscount),
          taxAmount: 0,
          items: [
            {
              category: 'IPD',
              description: `Inpatient Bed Charges (${ipdBedType} - ${ipdBedDays} Days @ ₹${ipdBedRate}/day) - SAC 999312`,
              quantity: Number(ipdBedDays),
              unitPrice: Number(ipdBedRate),
            },
            {
              category: 'IPD',
              description: `Treating Doctor Rounds & Consultant Charges (${ipdDocVisits} Visits @ ₹${ipdDocRate}/visit)`,
              quantity: Number(ipdDocVisits),
              unitPrice: Number(ipdDocRate),
            },
            {
              category: 'IPD',
              description: `Surgical & Clinical Procedure: ${ipdProcedureName} (OT & Specialist Fee)`,
              quantity: 1,
              unitPrice: procTotal,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create IPD bill');

      setActionSuccess(`✓ IPD Final Bill generated: #${data.invoiceNumber || 'Created'} (Total: ₹${subtotal - ipdDiscount})`);
      loadData();
      setActiveTab('invoices');
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
      clearAlerts();
    }
  };

  // 3. Lab Diagnostic Billing Submit
  const handleCreateLabBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionSuccess(null);
    setActionError(null);

    const patId = selectedPatientId || (patients[0]?.id) || '98eb2b37-1511-498f-a066-19cd487639e0';
    const activeTests = Object.values(selectedLabTests).filter((t) => t.selected);

    if (activeTests.length === 0) {
      setActionError('Please select at least one diagnostic test panel.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/billing/invoices`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          patientId: patId,
          discountAmount: 0,
          taxAmount: 0,
          items: activeTests.map((t) => ({
            category: 'LAB',
            description: `${t.name} (NABL Accredited Diagnostic Panel) - SAC 999316`,
            quantity: 1,
            unitPrice: t.price,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create Lab bill');

      const totalLab = activeTests.reduce((acc, t) => acc + t.price, 0);
      setActionSuccess(`✓ Diagnostic Lab Bill generated: #${data.invoiceNumber || 'Created'} (₹${totalLab})`);
      loadData();
      setActiveTab('invoices');
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
      clearAlerts();
    }
  };

  // 4. Pharmacy Dispensary Billing Submit
  const handleCreatePharmacyBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionSuccess(null);
    setActionError(null);

    const patId = selectedPatientId || (patients[0]?.id) || '98eb2b37-1511-498f-a066-19cd487639e0';
    const subtotal = pharmacyItems.reduce((acc, item) => acc + item.qty * item.price, 0);
    const taxAmount = Math.round(subtotal * 0.12 * 100) / 100;

    try {
      const res = await fetch(`${apiUrl}/billing/invoices`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          patientId: patId,
          discountAmount: 0,
          taxAmount,
          items: pharmacyItems.map((item) => ({
            category: 'PHARMACY',
            description: `${item.name} - (HSN 3004 @ 12% GST)`,
            quantity: item.qty,
            unitPrice: item.price,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create Pharmacy bill');

      setActionSuccess(`✓ Pharmacy Tax Invoice generated: #${data.invoiceNumber || 'Created'} (Total: ₹${subtotal + taxAmount})`);
      loadData();
      setActiveTab('invoices');
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
      clearAlerts();
    }
  };

  // 5. Insurance Claim Creation
  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionSuccess(null);
    setActionError(null);

    const patId = claimPatientId || selectedPatientId || patients[0]?.id;
    const provId = claimProviderId || providers[0]?.id;

    try {
      const res = await fetch(`${apiUrl}/billing/claims`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          patientId: patId,
          providerId: provId,
          claimAmount: Number(claimAmount),
          claimType,
          remarks: claimDiagnosis,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create claim');

      setActionSuccess(`✓ Insurance Claim #${data.claimNumber || 'Created'} drafted successfully!`);
      setShowClaimModal(false);
      loadData();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
      clearAlerts();
    }
  };

  // Claim Status Actions
  const handleClaimAction = async (claimId: string, action: 'submit' | 'approve' | 'reject') => {
    try {
      const url = `${apiUrl}/billing/claims/${claimId}/${action}`;
      const body = action === 'approve' ? { approvedAmount: 45000 } : action === 'reject' ? { remarks: 'Incomplete pre-authorization documentation' } : {};
      const res = await fetch(url, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setActionSuccess(`✓ Claim status updated to ${action.toUpperCase()}`);
        loadData();
      }
    } catch (err: any) {
      setActionError(err.message);
    }
    clearAlerts();
  };

  // Collect Payment Action
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`${apiUrl}/billing/payments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          amount: Number(payAmount),
          paymentMethod: payMethod,
          transactionReference: payRef || `TXN-${Date.now().toString().slice(-6)}`,
        }),
      });

      if (res.ok) {
        setActionSuccess('✓ Payment collected and posted to revenue ledger!');
        setShowPaymentModal(false);
        setSelectedInvoice(null);
        loadData();
      } else {
        const err = await res.json();
        setActionError(err.message || 'Failed to collect payment');
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
      clearAlerts();
    }
  };

  // Export Professional GST Invoice to PDF using jsPDF
  const handleDownloadGstInvoice = async (inv: any) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Hospital Header
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 36, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text('APOLLO MEDINEXA SUPER SPECIALITY HOSPITAL', 14, 13);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(153, 246, 228);
      doc.text('TERTIARY CARE & MULTI-ORGAN TRANSPLANT INSTITUTE (NABH & NABL ACCREDITED)', 14, 19);
      doc.setTextColor(203, 213, 225);
      doc.text('GSTIN: 07AAAAA0000A1Z5 | PAN: AAACM0012P | State: 07 (Delhi) | CIN: U85110DL2024PTC98120', 14, 25);
      doc.text('Sarita Vihar, Delhi Mathura Road, New Delhi - 110076 | 24/7 Central Billing: +91 11 2692 5858', 14, 31);

      // Tax Invoice Ribbon
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.roundedRect(154, 7, 44, 22, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('TAX INVOICE', 165, 14);
      doc.setFontSize(7);
      doc.text('STATUTORY GST BILL', 161, 20);
      doc.text('ORIGINAL FOR RECIPIENT', 158, 25);

      // Demographics & Invoice Details Grid
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, 42, 182, 36, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('BILLED TO (PATIENT DEMOGRAPHICS)', 18, 48);
      doc.text('INVOICE & BILLING METADATA', 110, 48);

      doc.setDrawColor(203, 213, 225);
      doc.line(18, 50, 95, 50);
      doc.line(110, 50, 188, 50);

      const pName = `${inv.patient?.user?.firstName || 'Aarav'} ${inv.patient?.user?.lastName || 'Sharma'}`;
      const pPhone = inv.patient?.user?.phone || '+91 98765 43210';
      const uhid = `MDNX-${inv.patient?.id ? inv.patient.id.slice(0, 8).toUpperCase() : '2026-9041'}`;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`Patient Name: ${pName}`, 18, 56);
      doc.text(`UHID / MRN: ${uhid}`, 18, 62);
      doc.text(`Contact: ${pPhone}`, 18, 68);
      doc.text(`Place of Supply: 07-Delhi (State Code: 07)`, 18, 74);

      doc.text(`Invoice Number: ${inv.invoiceNumber}`, 110, 56);
      doc.text(`Invoice Date: ${new Date(inv.createdAt || Date.now()).toLocaleDateString()}`, 110, 62);
      doc.text(`Payment Status: ${inv.paymentStatus || 'PAID'}`, 110, 68);
      doc.text(`Treating Dept: Multi-Speciality Clinical Services`, 110, 74);

      // Table Header
      let y = 84;
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(14, y, 182, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('#', 16, y + 5.5);
      doc.text('DESCRIPTION OF HEALTHCARE SERVICE / ITEM', 24, y + 5.5);
      doc.text('SAC / HSN', 112, y + 5.5);
      doc.text('QTY', 137, y + 5.5);
      doc.text('RATE (₹)', 150, y + 5.5);
      doc.text('AMOUNT (₹)', 172, y + 5.5);

      y += 8;
      const rawItems = (inv.items && inv.items.length > 0) ? inv.items : (inv.lineItems && inv.lineItems.length > 0) ? inv.lineItems : [
        { description: 'Hospital Healthcare Consultation & Clinical Care', category: 'OPD', quantity: 1, unitPrice: inv.totalAmount || 800, totalPrice: inv.totalAmount || 800 }
      ];

      rawItems.forEach((it: any, idx: number) => {
        const isAlt = idx % 2 === 1;
        if (isAlt) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y, 182, 8, 'F');
        }

        doc.setDrawColor(241, 245, 249);
        doc.line(14, y + 8, 196, y + 8);

        const desc = it.description || it.itemName || 'Clinical Service';
        const sacCode = it.category === 'PHARMACY' ? 'HSN 3004' : it.category === 'LAB' ? 'SAC 999316' : it.category === 'IPD' ? 'SAC 999312' : 'SAC 999311';
        const qty = it.quantity || 1;
        const rate = it.unitPrice || (it.amount ? it.amount / qty : 0);
        const lineTot = it.totalPrice || it.amount || (rate * qty);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(String(idx + 1), 16, y + 5.5);
        doc.text(desc.length > 44 ? desc.slice(0, 44) + '...' : desc, 24, y + 5.5);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(sacCode, 112, y + 5.5);
        doc.text(String(qty), 139, y + 5.5);
        doc.text(`₹${Number(rate).toFixed(2)}`, 150, y + 5.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`₹${Number(lineTot).toFixed(2)}`, 172, y + 5.5);

        y += 8;
      });

      // GST Calculation Summary Box
      y += 6;
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(110, y, 86, 44, 2, 2, 'FD');

      const subtotal = inv.subtotal || inv.totalAmount;
      const discount = inv.discountAmount || 0;
      const tax = inv.taxAmount || 0;
      const cgst = tax / 2;
      const sgst = tax / 2;
      const netTotal = inv.totalAmount || (subtotal - discount + tax);
      const paid = inv.paidAmount || 0;
      const balance = inv.balanceAmount || Math.max(0, netTotal - paid);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Gross Services Subtotal:', 115, y + 7);
      doc.text(`₹${Number(subtotal).toFixed(2)}`, 170, y + 7);

      doc.text('Institutional Discount:', 115, y + 13);
      doc.text(`- ₹${Number(discount).toFixed(2)}`, 170, y + 13);

      doc.text('CGST (Central Tax):', 115, y + 19);
      doc.text(`₹${Number(cgst).toFixed(2)}`, 170, y + 19);

      doc.text('SGST (State Tax):', 115, y + 25);
      doc.text(`₹${Number(sgst).toFixed(2)}`, 170, y + 25);

      doc.setDrawColor(203, 213, 225);
      doc.line(115, y + 28, 192, y + 28);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('Net Invoice Value:', 115, y + 33);
      doc.text(`₹${Number(netTotal).toFixed(2)}`, 170, y + 33);

      doc.setFontSize(8);
      doc.setTextColor(16, 185, 129);
      doc.text('Amount Paid:', 115, y + 38);
      doc.text(`₹${Number(paid).toFixed(2)}`, 170, y + 38);

      doc.setTextColor(balance > 0 ? 225 : 16, balance > 0 ? 29 : 185, balance > 0 ? 72 : 129);
      doc.text('Balance Due:', 115, y + 43);
      doc.text(`₹${Number(balance).toFixed(2)}`, 170, y + 43);

      // Statutory & GST Exemption Note Box
      doc.setFillColor(254, 243, 199); // amber-100
      doc.setDrawColor(245, 158, 11);
      doc.roundedRect(14, y, 90, 44, 2, 2, 'FD');
      doc.setTextColor(146, 64, 14);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('GST STATUTORY COMPLIANCE DECLARATION', 18, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.text('1. Healthcare Clinical Establishment Services rendered by hospitals,', 18, y + 12);
      doc.text('   doctors & paramedics are EXEMPT from GST under Notification', 18, y + 16);
      doc.text('   No. 12/2017-Central Tax (Rate), Heading 9993.', 18, y + 20);
      doc.text('2. Pharmaceuticals & consumable items charged under HSN 3004.', 18, y + 25);
      doc.text('3. This document is a valid Tax Invoice under Section 31 of CGST Act.', 18, y + 30);
      doc.text('4. Cash payments accepted up to statutory limit of ₹2,00,000.', 18, y + 35);

      // Signatures
      y += 56;
      doc.setDrawColor(148, 163, 184);
      doc.line(18, y + 10, 65, y + 10);
      doc.line(140, y + 10, 188, y + 10);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Authorized Revenue Officer', 18, y + 15);
      doc.text('Hospital Accounts & Finance Stamp', 140, y + 15);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('Employee ID: FIN-REV-9021', 18, y + 19);
      doc.text('Apollo MediNexa Super Speciality Hospital', 140, y + 19);

      // Footer
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 282, 210, 15, 'F');
      doc.setTextColor(203, 213, 225);
      doc.setFontSize(7);
      doc.text('*** COMPUTER GENERATED TAX INVOICE • STATUTORY AUDIT TRAIL PRESERVED IN MEDINEXA RCM ***', 22, 288);
      doc.text('Hospital CIN: U85110DL2024PTC98120 | For billing queries, email: finance.billing@medinexa.in', 30, 292);

      doc.save(`Invoice_${inv.invoiceNumber}.pdf`);
    } catch (err) {
      console.error('GST Invoice PDF error:', err);
    }
  };

  const a = analytics || {
    revenueToday: 48500,
    revenueThisMonth: 1358000,
    totalBilled: 514436,
    totalCollected: 382000,
    outstandingPayments: 132436,
    insuranceReceivables: 66500,
    refundAmount: 3200,
    collectionRate: '88.4%',
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-500/30">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-black uppercase tracking-wider">
              🏥 COMPLETE HOSPITAL BILLING & CLAIMS ENGINE
            </span>
            <span className="px-2.5 py-0.5 bg-blue-400/20 text-blue-300 rounded-full text-[10px] font-bold">
              OPD • IPD • LAB • PHARMACY • INSURANCE
            </span>
          </div>
          <h1 className="text-3xl font-black mt-2 tracking-tight">Hospital Invoicing, GST Billing & Insurance RCM</h1>
          <p className="text-emerald-100 text-xs mt-1 max-w-2xl font-medium">
            Unified billing module supporting Doctor Consultation, Bed Charges, Doctor Charges, Procedures, Diagnostic Tests, Pharmacy Medications, and TPA Insurance Claims with GST PDF exports.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setActiveTab('opd')}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-xl shadow transition"
          >
            🩺 OPD Bill
          </button>
          <button
            onClick={() => setActiveTab('ipd')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow transition"
          >
            🛏️ IPD Bill
          </button>
          <button
            onClick={() => setActiveTab('lab')}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs rounded-xl shadow transition"
          >
            🔬 Lab Bill
          </button>
          <button
            onClick={() => setActiveTab('pharmacy')}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow transition"
          >
            💊 Pharmacy Bill
          </button>
          <button
            onClick={() => setShowClaimModal(true)}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl shadow transition"
          >
            🛡️ Create Claim
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold shadow-sm">
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold shadow-sm">
          {actionError}
        </div>
      )}

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Total Billed</div>
          <div className="text-2xl font-black text-slate-900">₹{a.totalBilled?.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">All Departments</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Total Collected</div>
          <div className="text-2xl font-black text-emerald-600">₹{a.totalCollected?.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 font-medium">Realized Cash & Card</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Outstanding Dues</div>
          <div className="text-2xl font-black text-rose-600">₹{a.outstandingPayments?.toLocaleString()}</div>
          <div className="text-[10px] text-rose-600 font-semibold">Patient Receivables</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Insurance Claims</div>
          <div className="text-2xl font-black text-blue-600">₹{a.insuranceReceivables?.toLocaleString()}</div>
          <div className="text-[10px] text-blue-600 font-semibold">{claims.length} Active Claims</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Refunds</div>
          <div className="text-2xl font-black text-amber-600">₹{a.refundAmount?.toLocaleString()}</div>
          <div className="text-[10px] text-amber-600 font-semibold">Approved Reversals</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Collection Rate</div>
          <div className="text-2xl font-black text-indigo-600">{a.collectionRate}</div>
          <div className="text-[10px] text-indigo-600 font-semibold">RCM Efficiency</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-3 text-xs font-black">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'invoices' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📄 All Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('opd')}
          className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'opd' ? 'bg-teal-700 text-white' : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
          }`}
        >
          🩺 OPD Consultation Billing
        </button>
        <button
          onClick={() => setActiveTab('ipd')}
          className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'ipd' ? 'bg-indigo-700 text-white' : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
          }`}
        >
          🛏️ IPD Admission Billing
        </button>
        <button
          onClick={() => setActiveTab('lab')}
          className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'lab' ? 'bg-sky-700 text-white' : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
          }`}
        >
          🔬 Lab Test Billing
        </button>
        <button
          onClick={() => setActiveTab('pharmacy')}
          className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'pharmacy' ? 'bg-purple-700 text-white' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
          }`}
        >
          💊 Pharmacy Medicine Billing
        </button>
        <button
          onClick={() => setActiveTab('insurance')}
          className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'insurance' ? 'bg-amber-700 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
        >
          🛡️ Insurance & Claims ({claims.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'payments' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          💳 Split Payments ({payments.length})
        </button>
      </div>

      {/* TAB 1: ALL INVOICES ROSTER */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Patient Billing Invoices & GST Tax Invoices
              </h3>
              <p className="text-xs text-slate-500">Official statutory invoices generated across all hospital clinical departments.</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
              {invoices.length} Invoices Found
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-3">Invoice #</th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Category / Service</th>
                  <th className="py-3 px-3">Total (₹)</th>
                  <th className="py-3 px-3">Paid (₹)</th>
                  <th className="py-3 px-3">Balance (₹)</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No invoices found. Generate an OPD, IPD, Lab, or Pharmacy bill above.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => {
                    const firstItem = inv.items?.[0] || inv.lineItems?.[0];
                    const catBadge = firstItem?.category || 'HOSPITAL';
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-mono font-bold text-emerald-700">{inv.invoiceNumber}</td>
                        <td className="py-3 px-3 font-extrabold text-slate-900">
                          {inv.patient?.user?.firstName || 'Aarav'} {inv.patient?.user?.lastName || 'Sharma'}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            catBadge === 'OPD' ? 'bg-teal-100 text-teal-800' :
                            catBadge === 'IPD' ? 'bg-indigo-100 text-indigo-800' :
                            catBadge === 'LAB' ? 'bg-sky-100 text-sky-800' :
                            catBadge === 'PHARMACY' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {catBadge}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-black text-slate-900">₹{inv.totalAmount?.toLocaleString()}</td>
                        <td className="py-3 px-3 font-bold text-emerald-700">₹{inv.paidAmount?.toLocaleString() || '0'}</td>
                        <td className="py-3 px-3 font-bold text-rose-600">₹{inv.balanceAmount?.toLocaleString() || '0'}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              inv.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.paymentStatus === 'PARTIAL'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {inv.paymentStatus || inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleDownloadGstInvoice(inv)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg shadow-sm transition inline-flex items-center space-x-1"
                          >
                            <span>📥</span>
                            <span>GST Invoice (PDF)</span>
                          </button>
                          {inv.balanceAmount > 0 && (
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setPayAmount(String(inv.balanceAmount));
                                setShowPaymentModal(true);
                              }}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded-lg shadow"
                            >
                              💳 Pay
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: OPD BILLING CONSOLE (Consultation Fee) */}
      {activeTab === 'opd' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Outpatient Services</span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-1">OPD Consultation Fee Billing</h2>
            <p className="text-xs text-slate-500">Generate doctor outpatient consultation receipts with statutory GST healthcare exemptions (SAC 999311).</p>
          </div>

          <form onSubmit={handleCreateOpdBill} className="max-w-2xl space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-700 mb-1">Select Patient</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white font-bold text-slate-900"
              >
                {patients.length > 0 ? (
                  patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.firstName || 'Aarav'} {p.user?.lastName || 'Sharma'} (UHID: {p.id.slice(0, 8)})
                    </option>
                  ))
                ) : (
                  <option value="98eb2b37-1511-498f-a066-19cd487639e0">Aarav Sharma (UHID: MDNX-2026-9041)</option>
                )}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 mb-1">Attending Specialist Doctor</label>
                <select
                  value={opdDoctor}
                  onChange={(e) => setOpdDoctor(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white font-bold text-slate-900"
                >
                  <option value="Dr. Arvind Deshmukh (Internal Medicine)">Dr. Arvind Deshmukh (Internal Medicine)</option>
                  <option value="Dr. Rajesh Sharma (Cardiology)">Dr. Rajesh Sharma (Cardiology)</option>
                  <option value="Dr. Rajesh Patel (General Surgery)">Dr. Rajesh Patel (General Surgery)</option>
                  <option value="Dr. Priya Sharma (Pediatrics)">Dr. Priya Sharma (Pediatrics)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Consultation Tier</label>
                <select
                  value={opdConsultType}
                  onChange={(e) => {
                    setOpdConsultType(e.target.value);
                    if (e.target.value === 'GENERAL_OPD') setOpdFee(500);
                    else if (e.target.value === 'SENIOR_CONSULTANT') setOpdFee(800);
                    else if (e.target.value === 'SUPER_SPECIALIST') setOpdFee(1200);
                    else if (e.target.value === 'EMERGENCY_OPD') setOpdFee(1500);
                  }}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white font-bold text-slate-900"
                >
                  <option value="GENERAL_OPD">General OPD Consultation (₹500)</option>
                  <option value="SENIOR_CONSULTANT">Senior Consultant Specialist (₹800)</option>
                  <option value="SUPER_SPECIALIST">Super Specialist Consultation (₹1,200)</option>
                  <option value="EMERGENCY_OPD">Emergency Triage & Consultation (₹1,500)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Consultation Fee (₹)</label>
              <input
                type="number"
                min="0"
                required
                value={opdFee}
                onChange={(e) => setOpdFee(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white font-black text-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Clinical Remarks / Consultation Notes</label>
              <input
                type="text"
                value={opdNotes}
                onChange={(e) => setOpdNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white font-medium text-slate-900"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs font-bold text-slate-600">
                <span>Total Payable: </span>
                <span className="text-base font-black text-teal-700">₹{opdFee}</span>
                <span className="text-[10px] text-slate-400 block font-normal">Exempt from GST under Notification 12/2017</span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-black text-xs rounded-xl shadow-lg transition"
              >
                {isSubmitting ? 'Generating...' : '➕ Generate OPD Consultation Bill'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: IPD ADMISSION BILLING (Bed Charges, Doctor Charges, Procedure Charges) */}
      {activeTab === 'ipd' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Inpatient Admission RCM</span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-1">IPD Comprehensive Discharge Billing</h2>
            <p className="text-xs text-slate-500">Calculate and itemize Bed Charges, Consultant Doctor Visit Charges, and Surgical/Clinical Procedure Charges.</p>
          </div>

          <form onSubmit={handleCreateIpdBill} className="max-w-3xl space-y-6 text-xs font-semibold">
            <div>
              <label className="block text-slate-700 mb-1">Select Inpatient</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white font-bold text-slate-900"
              >
                {patients.length > 0 ? (
                  patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.firstName || 'Aarav'} {p.user?.lastName || 'Sharma'} (UHID: {p.id.slice(0, 8)})
                    </option>
                  ))
                ) : (
                  <option value="98eb2b37-1511-498f-a066-19cd487639e0">Aarav Sharma (UHID: MDNX-2026-9041)</option>
                )}
              </select>
            </div>

            {/* Charge Category 1: Bed Charges */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase flex items-center space-x-1.5">
                <span>🛏️</span>
                <span>1. Bed Charges (SAC 999312)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Ward / Bed Category</label>
                  <select
                    value={ipdBedType}
                    onChange={(e) => {
                      setIpdBedType(e.target.value);
                      if (e.target.value === 'GENERAL') setIpdBedRate(1500);
                      else if (e.target.value === 'SEMI_PRIVATE') setIpdBedRate(2800);
                      else if (e.target.value === 'PRIVATE_DELUXE') setIpdBedRate(4200);
                      else if (e.target.value === 'ICU') setIpdBedRate(4500);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    <option value="GENERAL">General Ward (₹1,500/day)</option>
                    <option value="SEMI_PRIVATE">Semi-Private Room (₹2,800/day)</option>
                    <option value="PRIVATE_DELUXE">Private Deluxe Room (₹4,200/day)</option>
                    <option value="ICU">Intensive Care Unit (ICU) (₹4,500/day)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Total Stay Days</label>
                  <input
                    type="number"
                    min="1"
                    value={ipdBedDays}
                    onChange={(e) => setIpdBedDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Daily Bed Rate (₹)</label>
                  <input
                    type="number"
                    value={ipdBedRate}
                    onChange={(e) => setIpdBedRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                  />
                </div>
              </div>
              <div className="text-right text-[11px] font-bold text-indigo-700">
                Bed Charges Subtotal: ₹{ipdBedDays * ipdBedRate}
              </div>
            </div>

            {/* Charge Category 2: Doctor Charges */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase flex items-center space-x-1.5">
                <span>👨‍⚕️</span>
                <span>2. Doctor Charges (Daily Rounds & Specialist Care)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Number of Inpatient Rounds / Visits</label>
                  <input
                    type="number"
                    min="1"
                    value={ipdDocVisits}
                    onChange={(e) => setIpdDocVisits(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Per Visit Charge (₹)</label>
                  <input
                    type="number"
                    value={ipdDocRate}
                    onChange={(e) => setIpdDocRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                  />
                </div>
              </div>
              <div className="text-right text-[11px] font-bold text-indigo-700">
                Doctor Charges Subtotal: ₹{ipdDocVisits * ipdDocRate}
              </div>
            </div>

            {/* Charge Category 3: Procedure Charges */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase flex items-center space-x-1.5">
                <span>💉</span>
                <span>3. Procedure & Operation Theatre Charges</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Clinical / Surgical Procedure</label>
                  <select
                    value={ipdProcedureName}
                    onChange={(e) => {
                      setIpdProcedureName(e.target.value);
                      if (e.target.value === 'Laparoscopic Cholecystectomy') setIpdProcedureCharge(35000);
                      else if (e.target.value === 'Coronary Angiography') setIpdProcedureCharge(28000);
                      else if (e.target.value === 'Endoscopy & Biopsy') setIpdProcedureCharge(12000);
                      else if (e.target.value === 'Total Knee Replacement') setIpdProcedureCharge(95000);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    <option value="Laparoscopic Cholecystectomy">Laparoscopic Cholecystectomy (₹35,000)</option>
                    <option value="Coronary Angiography">Coronary Angiography (₹28,000)</option>
                    <option value="Endoscopy & Biopsy">Endoscopy & Biopsy (₹12,000)</option>
                    <option value="Total Knee Replacement">Total Knee Replacement (₹95,000)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Procedure Charges (₹)</label>
                  <input
                    type="number"
                    value={ipdProcedureCharge}
                    onChange={(e) => setIpdProcedureCharge(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Discount / Co-Pay */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 mb-1">Institutional Discount (₹)</label>
                <input
                  type="number"
                  value={ipdDiscount}
                  onChange={(e) => setIpdDiscount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white font-bold"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs font-bold text-slate-600">
                <span>Gross: ₹{(ipdBedDays * ipdBedRate) + (ipdDocVisits * ipdDocRate) + Number(ipdProcedureCharge)} | </span>
                <span>Net Total Payable: </span>
                <span className="text-base font-black text-indigo-700">
                  ₹{(ipdBedDays * ipdBedRate) + (ipdDocVisits * ipdDocRate) + Number(ipdProcedureCharge) - ipdDiscount}
                </span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-indigo-700 hover:bg-indigo-600 text-white font-black text-xs rounded-xl shadow-lg transition"
              >
                {isSubmitting ? 'Generating...' : '➕ Generate IPD Comprehensive Bill'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: LAB TEST BILLING (Diagnostic Test Charges) */}
      {activeTab === 'lab' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Diagnostic Pathology Services</span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-1">Laboratory Test Charges Billing</h2>
            <p className="text-xs text-slate-500">Bill diagnostic tests including CBC, Blood Sugar, LFT, KFT, Thyroid Profile, and Complete Urine Routine.</p>
          </div>

          <form onSubmit={handleCreateLabBill} className="max-w-2xl space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-700 mb-1">Select Patient</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white font-bold text-slate-900"
              >
                {patients.length > 0 ? (
                  patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.firstName || 'Aarav'} {p.user?.lastName || 'Sharma'} (UHID: {p.id.slice(0, 8)})
                    </option>
                  ))
                ) : (
                  <option value="98eb2b37-1511-498f-a066-19cd487639e0">Aarav Sharma (UHID: MDNX-2026-9041)</option>
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-700 font-bold mb-2">Select Diagnostic Investigation Panels:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(selectedLabTests).map(([key, t]) => (
                  <label
                    key={key}
                    className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                      t.selected ? 'bg-sky-50 border-sky-300 text-sky-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        checked={t.selected}
                        onChange={(e) =>
                          setSelectedLabTests((prev) => ({
                            ...prev,
                            [key]: { ...prev[key], selected: e.target.checked },
                          }))
                        }
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span className="text-xs">{t.name}</span>
                    </div>
                    <span className="text-xs font-black text-sky-700">₹{t.price}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs font-bold text-slate-600">
                <span>Total Investigation Charges: </span>
                <span className="text-base font-black text-sky-700">
                  ₹{Object.values(selectedLabTests).filter((t) => t.selected).reduce((acc, t) => acc + t.price, 0)}
                </span>
                <span className="text-[10px] text-slate-400 block font-normal">NABL ISO 15189:2022 Statutory Schedule</span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-sky-700 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-lg transition"
              >
                {isSubmitting ? 'Generating...' : '➕ Generate Laboratory Bill'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: PHARMACY BILLING (Medicine Charges + 12% GST) */}
      {activeTab === 'pharmacy' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Hospital Pharmacy Services</span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-1">Pharmacy Medication Charges & GST Invoice</h2>
            <p className="text-xs text-slate-500">Bill outpatient & inpatient pharmaceuticals with statutory HSN 3004 12% GST breakdown (CGST 6% + SGST 6%).</p>
          </div>

          <form onSubmit={handleCreatePharmacyBill} className="max-w-2xl space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-700 mb-1">Select Patient</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white font-bold text-slate-900"
              >
                {patients.length > 0 ? (
                  patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.firstName || 'Aarav'} {p.user?.lastName || 'Sharma'} (UHID: {p.id.slice(0, 8)})
                    </option>
                  ))
                ) : (
                  <option value="98eb2b37-1511-498f-a066-19cd487639e0">Aarav Sharma (UHID: MDNX-2026-9041)</option>
                )}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-slate-700 font-bold">Prescribed Medicines for Dispense & Bill:</label>
              {pharmacyItems.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-900 block">{item.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">HSN Code: 3004 | GST Rate: 12%</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <span className="font-bold text-slate-700 block">Qty: {item.qty}</span>
                      <span className="font-extrabold text-purple-700 block">₹{item.qty * item.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* GST Computation Preview */}
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 text-xs space-y-1.5">
              {(() => {
                const sub = pharmacyItems.reduce((acc, it) => acc + it.qty * it.price, 0);
                const gst = Math.round(sub * 0.12 * 100) / 100;
                return (
                  <>
                    <div className="flex justify-between text-slate-600">
                      <span>Medicine Gross Subtotal:</span>
                      <span className="font-bold">₹{sub.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>CGST (6.0%):</span>
                      <span className="font-bold">₹{(gst / 2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>SGST (6.0%):</span>
                      <span className="font-bold">₹{(gst / 2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-black text-purple-900 text-sm pt-2 border-t border-purple-200">
                      <span>Net Total Payable:</span>
                      <span>₹{(sub + gst).toFixed(2)}</span>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-purple-700 hover:bg-purple-600 text-white font-black text-xs rounded-xl shadow-lg transition"
              >
                {isSubmitting ? 'Generating...' : '➕ Generate Pharmacy GST Bill'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 6: INSURANCE & CLAIMS MANAGEMENT (Create Claim, Claim Tracking, Claim Status) */}
      {activeTab === 'insurance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Third Party Administrator (TPA) Desk</span>
              <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">Insurance Claims Tracking & Status Station</h2>
              <p className="text-xs text-slate-500">Track claim life-cycle from pre-authorization draft, submission, to TPA approval and settlement.</p>
            </div>
            <button
              onClick={() => setShowClaimModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow transition"
            >
              ➕ Create Insurance Claim
            </button>
          </div>

          {/* Claims List Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Active Hospital Insurance Claims Roster
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase">
                  <tr>
                    <th className="py-3 px-3">Claim #</th>
                    <th className="py-3 px-3">Patient</th>
                    <th className="py-3 px-3">Insurance Provider</th>
                    <th className="py-3 px-3">Claim Type</th>
                    <th className="py-3 px-3">Claimed Amount (₹)</th>
                    <th className="py-3 px-3">Approved Amount (₹)</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {claims.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No insurance claims found. Click &quot;Create Insurance Claim&quot; to file a claim.
                      </td>
                    </tr>
                  ) : (
                    claims.map((clm) => (
                      <tr key={clm.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-mono font-bold text-amber-700">{clm.claimNumber}</td>
                        <td className="py-3 px-3 font-extrabold text-slate-900">
                          {clm.patient?.user?.firstName || 'Aarav'} {clm.patient?.user?.lastName || 'Sharma'}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {clm.provider?.providerName || 'Star Health and Allied Insurance'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-[10px] font-bold">
                            {clm.claimType}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-black text-slate-900">
                          ₹{(clm.totalClaimAmount || clm.amountClaimed || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-black text-emerald-700">
                          ₹{(clm.approvedAmount || clm.amountApproved || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              clm.status === 'APPROVED' || clm.status === 'SETTLED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : clm.status === 'UNDER_REVIEW' || clm.status === 'CLAIM_SUBMITTED'
                                ? 'bg-sky-100 text-sky-800'
                                : clm.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {clm.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1">
                          {clm.status === 'DRAFT' && (
                            <button
                              onClick={() => handleClaimAction(clm.id, 'submit')}
                              className="px-2.5 py-1 bg-sky-700 hover:bg-sky-600 text-white font-bold text-[10px] rounded-lg"
                            >
                              Submit
                            </button>
                          )}
                          {clm.status !== 'APPROVED' && clm.status !== 'SETTLED' && (
                            <button
                              onClick={() => handleClaimAction(clm.id, 'approve')}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg"
                            >
                              Approve
                            </button>
                          )}
                          {clm.status !== 'REJECTED' && clm.status !== 'SETTLED' && (
                            <button
                              onClick={() => handleClaimAction(clm.id, 'reject')}
                              className="px-2.5 py-1 bg-rose-700 hover:bg-rose-600 text-white font-bold text-[10px] rounded-lg"
                            >
                              Reject
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: PAYMENTS LIST */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
            Payment Receipts & Split Ledger
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-3">Transaction Ref</th>
                  <th className="py-3 px-3">Amount (₹)</th>
                  <th className="py-3 px-3">Payment Method</th>
                  <th className="py-3 px-3">Collected By</th>
                  <th className="py-3 px-3">Payment Date</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{p.transactionReference}</td>
                    <td className="py-3 px-3 font-black text-emerald-700">₹{p.amount?.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-bold text-[10px] rounded">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {p.collectedBy?.firstName ? `${p.collectedBy.firstName} ${p.collectedBy.lastName}` : 'Billing Cashier'}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{new Date(p.paymentDate).toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                        {p.status || 'SUCCESS'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE INSURANCE CLAIM MODAL */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">File Insurance Claim (TPA)</h2>
                <p className="text-xs text-slate-500">Initiate Cashless pre-auth or Reimbursement claim.</p>
              </div>
              <button onClick={() => setShowClaimModal(false)} className="text-slate-400 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateClaim} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Patient</label>
                <select
                  value={claimPatientId}
                  onChange={(e) => setClaimPatientId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.firstName || 'Aarav'} {p.user?.lastName || 'Sharma'} (UHID: {p.id.slice(0, 8)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Insurance TPA / Provider</label>
                  <select
                    value={claimProviderId}
                    onChange={(e) => setClaimProviderId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    {providers.map((pr) => (
                      <option key={pr.id} value={pr.id}>{pr.providerName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Claim Type</label>
                  <select
                    value={claimType}
                    onChange={(e) => setClaimType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    <option value="CASHLESS">Cashless Hospitalization</option>
                    <option value="REIMBURSEMENT">Patient Reimbursement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Estimated Claim Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Clinical Diagnosis & Pre-Auth Justification</label>
                <textarea
                  rows={3}
                  value={claimDiagnosis}
                  onChange={(e) => setClaimDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-extrabold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-xl shadow transition"
                >
                  {isSubmitting ? 'Filing...' : 'Submit Claim Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COLLECT PAYMENT MODAL */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Collect Payment</h2>
                <p className="text-xs text-slate-500">Invoice: #{selectedInvoice.invoiceNumber}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Amount to Pay (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="CASH">Cash Counter</option>
                  <option value="INSURANCE">TPA Insurance Direct Settlement</option>
                  <option value="NET_BANKING">Net Banking (NEFT/RTGS)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref / Card Approval Code"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-extrabold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold rounded-xl shadow transition"
                >
                  {isSubmitting ? 'Posting...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
