'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { jsPDF } from 'jspdf';

interface LabTestItemData {
  id: string;
  testName: string;
  category: string;
  status: string;
  resultValue?: string;
  referenceRange?: string;
  unit?: string;
  flag: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
  verifiedAt?: string;
  verifiedBy?: { firstName: string; lastName: string };
}

interface SampleCollectionData {
  id: string;
  sampleType: string;
  barcode: string;
  collectedAt: string;
}

interface LabOrderData {
  id: string;
  orderNumber: string;
  status: string;
  priority: string;
  clinicalNotes?: string;
  orderedAt: string;
  patient?: { id: string; user?: { firstName: string; lastName: string } };
  doctor?: { id: string; user?: { firstName: string; lastName: string } };
  facility?: { id: string; name: string };
  testItems?: LabTestItemData[];
  sampleCollections?: SampleCollectionData[];
}

export default function LabDashboardPage() {
  const [orders, setOrders] = useState<LabOrderData[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<LabOrderData | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Sample Collection State
  const [sampleType, setSampleType] = useState('BLOOD');
  const [collectedBarcode, setCollectedBarcode] = useState('');

  // Result Entry State
  const [selectedTestItem, setSelectedTestItem] = useState<LabTestItemData | null>(null);
  const [resultVal, setResultVal] = useState('');
  const [refRange, setRefRange] = useState('13.5 - 17.5');
  const [unit, setUnit] = useState('g/dL');
  const [flag, setFlag] = useState<'NORMAL' | 'ABNORMAL' | 'CRITICAL'>('NORMAL');

  // Printable Report State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  // Doctor: Order Lab Test Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderPatientId, setOrderPatientId] = useState('');
  const [orderPriority, setOrderPriority] = useState('ROUTINE');
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedPanels, setSelectedPanels] = useState<string[]>([
    'Complete Blood Count (CBC with ESR)',
  ]);
  const [patientsList, setPatientsList] = useState<any[]>([]);

  // Admin: Manage Tests Catalog Modal State
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogTests, setCatalogTests] = useState<any[]>([]);
  const [newTestCode, setNewTestCode] = useState('');
  const [newTestName, setNewTestName] = useState('');
  const [newTestPrice, setNewTestPrice] = useState('500');
  const [newTestCategory, setNewTestCategory] = useState('BIOCHEMISTRY');
  const [newTestSpecimen, setNewTestSpecimen] = useState('BLOOD');

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Analytics Metrics State
  const [analytics, setAnalytics] = useState({
    ordersToday: 24,
    samplesPending: 5,
    criticalResults: 2,
    avgTurnaroundTimeMins: 35,
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const getHeaders = () => {
    const token = localStorage.getItem('medinexa_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const [ordRes, anaRes] = await Promise.all([
        fetch(`${apiUrl}/lab/orders`, { headers: getHeaders() }).then((r) => r.json()),
        fetch(`${apiUrl}/lab/analytics`, { headers: getHeaders() }).then((r) => r.json()),
      ]);

      const list = Array.isArray(ordRes) ? ordRes : [];
      setOrders(list);
      if (list.length > 0 && !selectedOrder) {
        setSelectedOrder(list[0]);
      }
      if (anaRes && typeof anaRes === 'object') {
        setAnalytics(anaRes);
      }
    } catch (err) {
      console.error('Failed to load lab data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCollectSample = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsSubmitting(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await fetch(`${apiUrl}/lab/sample-collection`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          labOrderId: selectedOrder.id,
          sampleType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Sample collection failed');

      setCollectedBarcode(data.barcode);
      setActionSuccess(`✓ Sample (${sampleType}) collected successfully! Barcode: ${data.barcode}`);
      fetchOrders();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnterResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTestItem) return;

    setIsSubmitting(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await fetch(`${apiUrl}/lab/results/${selectedTestItem.id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          resultValue: resultVal,
          referenceRange: refRange,
          unit,
          flag,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Result entry failed');

      setActionSuccess(`✓ Test Result '${resultVal} ${unit}' entered successfully!`);
      setSelectedTestItem(null);
      fetchOrders();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyResult = async (testItemId: string) => {
    setIsSubmitting(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await fetch(`${apiUrl}/lab/results/${testItemId}/verify`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');

      setActionSuccess('✓ Lab result verified and signed off by Pathologist!');
      fetchOrders();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewReport = async (orderId: string) => {
    try {
      const res = await fetch(`${apiUrl}/lab/reports/${orderId}`, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate report');

      setReportData(data);
      setShowReportModal(true);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleOpenOrderModal = async () => {
    setShowOrderModal(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const res = await fetch(`${apiUrl}/patients`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data || [];
        setPatientsList(list);
        if (list.length > 0 && !orderPatientId) {
          setOrderPatientId(list[0].id);
        }
      }
    } catch (err) {
      console.warn('Could not load patient list');
    }
  };

  const handleCreateLabOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderPatientId || selectedPanels.length === 0) {
      setActionError('Please select a patient and at least one diagnostic test.');
      return;
    }

    setIsSubmitting(true);
    setActionSuccess(null);
    setActionError(null);

    const testItemMapping: Record<string, { category: string; refRange: string; unit: string }> = {
      'Complete Blood Count (CBC with ESR)': { category: 'HEMATOLOGY', refRange: '13.0 - 17.0 g/dL', unit: 'g/dL' },
      'Fasting Blood Sugar (FBS)': { category: 'BIOCHEMISTRY', refRange: '70 - 99 mg/dL', unit: 'mg/dL' },
      'Post-Prandial Blood Sugar (PPBS)': { category: 'BIOCHEMISTRY', refRange: '70 - 140 mg/dL', unit: 'mg/dL' },
      'Liver Function Test (LFT Comprehensive)': { category: 'BIOCHEMISTRY', refRange: 'Bilirubin: 0.2-1.2, SGPT: 10-45', unit: 'U/L' },
      'Kidney Function Test (KFT with Electrolytes)': { category: 'BIOCHEMISTRY', refRange: 'Creatinine: 0.6-1.2, Urea: 15-40', unit: 'mg/dL' },
      'Thyroid Profile Total (T3, T4, TSH)': { category: 'BIOCHEMISTRY', refRange: 'TSH: 0.35 - 4.94 uIU/mL', unit: 'uIU/mL' },
      'Complete Urine Routine & Microscopy (CUE)': { category: 'BIOCHEMISTRY', refRange: 'Protein: NIL, Sugar: NIL', unit: '/HPF' },
    };

    const tests = selectedPanels.map((name) => ({
      testName: name,
      category: testItemMapping[name]?.category || 'BIOCHEMISTRY',
      referenceRange: testItemMapping[name]?.refRange || 'Standard Normal Range',
      unit: testItemMapping[name]?.unit || '',
    }));

    try {
      const res = await fetch(`${apiUrl}/lab/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          patientId: orderPatientId,
          priority: orderPriority,
          clinicalNotes: orderNotes,
          tests,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to place lab order');

      setActionSuccess(`✓ Diagnostic Lab Order #${data.orderNumber} created successfully!`);
      setShowOrderModal(false);
      setOrderNotes('');
      fetchOrders();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCatalogModal = async () => {
    setShowCatalogModal(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const res = await fetch(`${apiUrl}/lab/tests`);
      if (res.ok) {
        const data = await res.json();
        setCatalogTests(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Could not load test catalog');
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestCode || !newTestName) {
      setActionError('Test Code and Test Name are required.');
      return;
    }

    setIsSubmitting(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await fetch(`${apiUrl}/lab/tests`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          code: newTestCode.toUpperCase(),
          name: newTestName,
          category: newTestCategory,
          specimenType: newTestSpecimen,
          price: parseFloat(newTestPrice) || 500,
          turnaroundTimeMinutes: 60,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create lab test');

      setActionSuccess(`✓ New test [${data.code}] ${data.name} added to catalog!`);
      setNewTestCode('');
      setNewTestName('');
      handleOpenCatalogModal();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadStaffPdf = (report: any) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text('APOLLO MEDINEXA SUPER SPECIALITY HOSPITAL', 14, 12);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(153, 246, 228);
      doc.text('CENTRAL DIAGNOSTIC PATHOLOGY LABORATORY (NABL ACCREDITED - ISO 15189:2022)', 14, 18);
      doc.setTextColor(203, 213, 225);
      doc.text('Sarita Vihar, Delhi Mathura Road, New Delhi - 110076 | 24/7 Helpline: +91 11 2692 5858', 14, 24);

      doc.setFillColor(13, 148, 136);
      doc.roundedRect(165, 6, 32, 18, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('NABL ACCREDITED', 167, 13);
      doc.setFontSize(7);
      doc.text('CERT # MC-5421', 169, 19);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, 38, 182, 34, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('PATIENT & SAMPLE IDENTIFIERS', 18, 44);
      doc.text('ORDER & CLINICAL AUDIT', 110, 44);

      doc.setDrawColor(203, 213, 225);
      doc.line(18, 46, 95, 46);
      doc.line(110, 46, 188, 46);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`Patient Name: ${report.patientName || 'Verified Patient'}`, 18, 52);
      doc.text(`Barcode ID: ${report.sampleBarcode || 'BC-LAB-9801'}`, 18, 58);
      doc.text(`Ordering Doctor: ${report.doctorName || 'Dr. Deshmukh'}`, 18, 64);

      doc.text(`Order Number: ${report.orderNumber}`, 110, 52);
      doc.text(`Ordered Date: ${new Date(report.orderedAt).toLocaleDateString()}`, 110, 58);
      doc.text(`Report Status: ${report.status}`, 110, 64);

      let y = 84;
      doc.setFillColor(30, 41, 59);
      doc.rect(14, y, 182, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text('INVESTIGATION TEST PARAMETER', 18, y + 5.5);
      doc.text('MEASURED VALUE', 95, y + 5.5);
      doc.text('REFERENCE INTERVAL', 135, y + 5.5);
      doc.text('FLAG', 180, y + 5.5);

      y += 8;
      (report.testResults || []).forEach((item: any, idx: number) => {
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y, 182, 7.5, 'F');
        }

        doc.setDrawColor(241, 245, 249);
        doc.line(14, y + 7.5, 196, y + 7.5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(item.testName, 18, y + 5);

        const isAbnormal = item.flag && item.flag !== 'NORMAL';
        if (isAbnormal) {
          doc.setTextColor(225, 29, 72);
        } else {
          doc.setTextColor(15, 23, 42);
        }
        doc.text(`${item.resultValue || 'N/A'} ${item.unit || ''}`, 95, y + 5);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(item.referenceRange || 'N/A', 135, y + 5);

        if (isAbnormal) {
          doc.setTextColor(225, 29, 72);
          doc.setFont('helvetica', 'bold');
          doc.text(item.flag, 180, y + 5);
        } else {
          doc.setTextColor(16, 185, 129);
          doc.setFont('helvetica', 'bold');
          doc.text('NORMAL', 180, y + 5);
        }

        y += 7.5;
      });

      y += 18;
      doc.setDrawColor(148, 163, 184);
      doc.line(18, y + 14, 65, y + 14);
      doc.line(140, y + 14, 188, y + 14);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Sunil Verma, M.Sc (MLT)', 18, y + 18);
      doc.text('Dr. Arvind Deshmukh, MD', 140, y + 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Senior Laboratory Technologist', 18, y + 22);
      doc.text('Chief Pathologist & Lab Director', 140, y + 22);

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 282, 210, 15, 'F');
      doc.setTextColor(203, 213, 225);
      doc.setFontSize(7);
      doc.text(`*** END OF CLINICAL REPORT • ORDER: ${report.orderNumber} • NABL CERTIFIED LAB ***`, 35, 288);
      doc.text('Apollo MediNexa Super Speciality Hospital | ISO 15189:2022 Diagnostic Protocol', 42, 292);

      doc.save(`${report.orderNumber}_Report.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'ALL') return true;
    return o.status === statusFilter;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>🔬</span>
            <span>Laboratory Information Management System (LIMS)</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Diagnostic Workflow Engine, Specimen Barcoding, & Critical Alert Station.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCatalogModal}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-2"
          >
            <span>⚙️</span>
            <span>Manage Tests Catalog</span>
          </button>
          <button
            onClick={handleOpenOrderModal}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
          >
            <span>+</span>
            <span>Order Lab Test</span>
          </button>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Orders Today</span>
          <span className="text-2xl font-black text-sky-600 mt-1 block">{analytics.ordersToday}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Samples Pending</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{analytics.samplesPending}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Critical Results</span>
          <span className="text-2xl font-black text-red-600 mt-1 block">{analytics.criticalResults}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Avg Turnaround Time</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{analytics.avgTurnaroundTimeMins} Mins</span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold shadow-sm">
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold shadow-sm">
          {actionError}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Orders Queue Roster */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Lab Orders Roster</h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-bold border border-slate-300 rounded-lg px-2 py-1 bg-slate-50"
            >
              <option value="ALL">All Statuses</option>
              <option value="ORDERED">ORDERED</option>
              <option value="SAMPLE_COLLECTED">COLLECTED</option>
              <option value="IN_PROCESS">IN_PROCESS</option>
              <option value="REPORTED">REPORTED</option>
            </select>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs font-medium">Loading lab queue...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-medium">No lab orders found.</div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredOrders.map((ord) => {
                const isSelected = selectedOrder?.id === ord.id;
                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${
                      isSelected ? 'border-sky-500 bg-sky-50/50 shadow-sm' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{ord.orderNumber}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        ord.status === 'REPORTED' || ord.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                        ord.status === 'IN_PROCESS' ? 'bg-sky-100 text-sky-800' :
                        ord.status === 'SAMPLE_COLLECTED' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium mt-1">
                      Patient: <span className="font-bold text-slate-800">{ord.patient?.user?.firstName || 'John'} {ord.patient?.user?.lastName || 'Doe'}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Ordered by: Dr. {ord.doctor?.user?.firstName || 'Smith'} | {new Date(ord.orderedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Workstation Workspace */}
        <div className="lg:col-span-2 space-y-6">
          {selectedOrder ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Selected Order Overview */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Order #{selectedOrder.orderNumber} Details</h2>
                  <p className="text-xs text-slate-500">
                    Patient: <span className="font-bold text-slate-800">{selectedOrder.patient?.user?.firstName} {selectedOrder.patient?.user?.lastName}</span> | Priority: <span className="font-bold text-rose-600">{selectedOrder.priority}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleViewReport(selectedOrder.id)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow transition"
                >
                  📄 View Printable Report
                </button>
              </div>

              {/* Sample Collection Station */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                  <span>🧪</span>
                  <span>Sample Collection Station</span>
                </h3>
                <form onSubmit={handleCollectSample} className="flex flex-wrap items-center gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 text-[10px] mb-1">Specimen Type</label>
                    <select
                      value={sampleType}
                      onChange={(e) => setSampleType(e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                    >
                      <option value="BLOOD">BLOOD</option>
                      <option value="URINE">URINE</option>
                      <option value="STOOL">STOOL</option>
                      <option value="SPUTUM">SPUTUM</option>
                      <option value="SWAB">SWAB</option>
                      <option value="BIOPSY">BIOPSY</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl shadow transition"
                  >
                    Collect Specimen & Generate Barcode
                  </button>
                </form>

                {(selectedOrder.sampleCollections?.length || 0) > 0 && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-800 block">Specimen Barcode Dispatched</span>
                      <span className="font-mono text-emerald-900 font-bold">{selectedOrder.sampleCollections?.[0]?.barcode}</span>
                    </div>
                    <div className="font-mono bg-white px-3 py-1 border border-emerald-300 rounded text-center tracking-widest text-emerald-900 font-black">
                      ||| || | ||| |||| |
                    </div>
                  </div>
                )}
              </div>

              {/* Test Items & Result Entry Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900">Diagnostic Test Items Roster</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                        <th className="py-2 px-3">Test Name</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3">Result Value</th>
                        <th className="py-2 px-3">Reference Range</th>
                        <th className="py-2 px-3">Flag</th>
                        <th className="py-2 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {(selectedOrder.testItems || []).map((ti) => (
                        <tr key={ti.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-bold text-slate-900">{ti.testName}</td>
                          <td className="py-3 px-3 text-slate-600">{ti.category}</td>
                          <td className="py-3 px-3 font-bold text-slate-900">
                            {ti.resultValue ? `${ti.resultValue} ${ti.unit || ''}` : <span className="text-slate-400 italic">Pending Entry</span>}
                          </td>
                          <td className="py-3 px-3 text-slate-500">{ti.referenceRange || 'N/A'}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              ti.flag === 'CRITICAL' ? 'bg-red-100 text-red-800 animate-pulse' :
                              ti.flag === 'ABNORMAL' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {ti.flag}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                setSelectedTestItem(ti);
                                setResultVal(ti.resultValue || '');
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition text-[11px]"
                            >
                              Enter Result
                            </button>
                            {ti.status !== 'VERIFIED' && (
                              <button
                                onClick={() => handleVerifyResult(ti.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition text-[11px]"
                              >
                                Verify ✓
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Result Entry Modal Form */}
              {selectedTestItem && (
                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-amber-900">Enter Result for '{selectedTestItem.testName}'</h4>
                  <form onSubmit={handleEnterResult} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-600 text-[10px] mb-1">Measured Value</label>
                      <input
                        type="text"
                        required
                        value={resultVal}
                        onChange={(e) => setResultVal(e.target.value)}
                        placeholder="e.g. 14.2"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 text-[10px] mb-1">Unit</label>
                      <input
                        type="text"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 text-[10px] mb-1">Reference Range</label>
                      <input
                        type="text"
                        value={refRange}
                        onChange={(e) => setRefRange(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 text-[10px] mb-1">Result Flag</label>
                      <select
                        value={flag}
                        onChange={(e) => setFlag(e.target.value as any)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                      >
                        <option value="NORMAL">NORMAL</option>
                        <option value="ABNORMAL">ABNORMAL</option>
                        <option value="CRITICAL">CRITICAL (Alert Doctor)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-4 flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTestItem(null)}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800"
                      >
                        Save Test Result
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center text-slate-400 font-medium text-xs">
              Select a lab order from the queue to view diagnostic items and enter results.
            </div>
          )}
        </div>
      </div>

      {/* Printable Diagnostic Report Modal */}
      {showReportModal && reportData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{reportData.facility?.name}</h2>
                <p className="text-xs text-slate-500 font-semibold">{reportData.reportTitle}</p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <p><span className="font-bold">Order Number:</span> {reportData.orderNumber}</p>
                <p><span className="font-bold">Patient Name:</span> {reportData.patientName}</p>
                <p><span className="font-bold">Sample Barcode:</span> {reportData.sampleBarcode}</p>
              </div>
              <div>
                <p><span className="font-bold">Ordering Doctor:</span> {reportData.doctorName}</p>
                <p><span className="font-bold">Report Status:</span> {reportData.status}</p>
                <p><span className="font-bold">Ordered Date:</span> {new Date(reportData.orderedAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Test Results Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase">Test Results Summary</h3>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                    <th className="py-2">Test Name</th>
                    <th className="py-2">Measured Result</th>
                    <th className="py-2">Ref. Range</th>
                    <th className="py-2">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(reportData.testResults || []).map((t: any) => (
                    <tr key={t.id}>
                      <td className="py-2 font-bold text-slate-900">{t.testName}</td>
                      <td className="py-2 font-bold text-slate-800">{t.resultValue || 'N/A'} {t.unit || ''}</td>
                      <td className="py-2 text-slate-500">{t.referenceRange || 'N/A'}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.flag === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {t.flag}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 pt-4 flex items-center justify-between gap-3">
              <span className="text-[10px] text-slate-400">✓ Electronically Verified & Signed Diagnostic Report</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadStaffPdf(reportData)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow transition"
                >
                  📥 Download Official PDF
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow transition"
                >
                  🖨️ Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor: Order Diagnostic Lab Test Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Order Diagnostic Lab Tests</h2>
                <p className="text-xs text-slate-500 font-semibold">Doctor Clinical Ordering Station</p>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLabOrder} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Select Patient</label>
                {patientsList.length > 0 ? (
                  <select
                    value={orderPatientId}
                    onChange={(e) => setOrderPatientId(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {patientsList.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.user?.firstName} {p.user?.lastName} (MRN: {p.mrn || p.id.slice(0, 8)})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={orderPatientId}
                    onChange={(e) => setOrderPatientId(e.target.value)}
                    placeholder="Enter Patient UUID"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Clinical Priority</label>
                <select
                  value={orderPriority}
                  onChange={(e) => setOrderPriority(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="ROUTINE">ROUTINE - Standard Turnaround</option>
                  <option value="URGENT">URGENT - Within 2 Hours</option>
                  <option value="STAT">STAT - Emergency Immediate</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-2">Select Diagnostic Panels & Tests</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  {[
                    'Complete Blood Count (CBC with ESR)',
                    'Fasting Blood Sugar (FBS)',
                    'Post-Prandial Blood Sugar (PPBS)',
                    'Liver Function Test (LFT Comprehensive)',
                    'Kidney Function Test (KFT with Electrolytes)',
                    'Thyroid Profile Total (T3, T4, TSH)',
                    'Complete Urine Routine & Microscopy (CUE)',
                  ].map((testName) => {
                    const isChecked = selectedPanels.includes(testName);
                    return (
                      <label
                        key={testName}
                        className={`flex items-start space-x-2 p-2 rounded-xl cursor-pointer transition text-[11px] ${
                          isChecked ? 'bg-teal-50 border border-teal-200 font-bold text-teal-900' : 'text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPanels([...selectedPanels, testName]);
                            } else {
                              setSelectedPanels(selectedPanels.filter((t) => t !== testName));
                            }
                          }}
                          className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>{testName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Clinical Notes & Reason for Testing</label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Pre-operative clearance, recurrent fever, uncontrolled glucose..."
                  rows={2}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Placing Order...' : 'Submit Diagnostic Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin: Manage Tests Catalog Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Diagnostic Test Catalog Master</h2>
                <p className="text-xs text-slate-500 font-semibold">Laboratory Test Directory & Pricing Administration</p>
              </div>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Existing Catalog Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold sticky top-0">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Test Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {catalogTests.map((t: any) => (
                    <tr key={t.id || t.code} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-teal-700">{t.code}</td>
                      <td className="p-3 font-bold text-slate-900">{t.name}</td>
                      <td className="p-3 text-slate-500 text-[10px]">{t.category}</td>
                      <td className="p-3 font-bold text-slate-800">₹{t.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add New Test Form */}
            <form onSubmit={handleCreateTest} className="border-t border-slate-200 pt-4 space-y-4 text-xs font-semibold">
              <h3 className="text-sm font-extrabold text-slate-900">Add New Test to Catalog</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Test Code</label>
                  <input
                    type="text"
                    value={newTestCode}
                    onChange={(e) => setNewTestCode(e.target.value)}
                    placeholder="e.g. LAB-LIPID-PRO"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Test Name</label>
                  <input
                    type="text"
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                    placeholder="e.g. Advanced Lipid Profile"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Category</label>
                  <select
                    value={newTestCategory}
                    onChange={(e) => setNewTestCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="BIOCHEMISTRY">BIOCHEMISTRY</option>
                    <option value="HEMATOLOGY">HEMATOLOGY</option>
                    <option value="IMMUNOLOGY">IMMUNOLOGY</option>
                    <option value="MICROBIOLOGY">MICROBIOLOGY</option>
                    <option value="PATHOLOGY">PATHOLOGY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={newTestPrice}
                    onChange={(e) => setNewTestPrice(e.target.value)}
                    placeholder="450"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCatalogModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Test to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
