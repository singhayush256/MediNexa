'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

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

            <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">✓ Electronically Verified & Signed Diagnostic Report</span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow"
              >
                🖨️ Print Diagnostic Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
