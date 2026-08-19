'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LabOrderDto, LabTestDto, LabOrderStatus, SpecimenStatus } from '@medinexa/types';

export default function LabDashboardPage() {
  const [orders, setOrders] = useState<LabOrderDto[]>([]);
  const [labTests, setLabTests] = useState<LabTestDto[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<LabOrderDto | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Result Form Modal State
  const [resultModalItem, setResultModalItem] = useState<any | null>(null);
  const [resultVal, setResultVal] = useState('');
  const [numericVal, setNumericVal] = useState('');
  const [unit, setUnit] = useState('');
  const [refRange, setRefRange] = useState('');
  const [abnormalFlag, setAbnormalFlag] = useState('NORMAL');

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const getHeaders = () => {
    const token = localStorage.getItem('medinexa_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const [userRole, setUserRole] = useState<string>('');

  const fetchOrders = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      let role = userRole;
      if (!role) {
        const meRes = await fetch(`${apiUrl}/auth/me`, { headers: getHeaders() }).then((r) => r.json());
        role = meRes?.roleCode || meRes?.role?.code || '';
        setUserRole(role);
      }

      const endpoint = role === 'PATIENT' ? '/patients/me/lab-results' : '/lab/orders';
      const res = await fetch(`${apiUrl}${endpoint}`, { headers: getHeaders() });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setOrders(list);
      if (list.length > 0 && !selectedOrder) {
        fetchOrderDetail(list[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch lab orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = (id: string) => {
    fetch(`${apiUrl}/lab/orders/${id}`, { headers: getHeaders() })
      .then((r) => r.json())
      .then((detail) => setSelectedOrder(detail))
      .catch(() => {});
  };

  useEffect(() => {
    fetchOrders();
    fetch(`${apiUrl}/lab/tests`)
      .then((r) => r.json())
      .then((t) => setLabTests(Array.isArray(t) ? t : []))
      .catch(() => {});

    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  const handleCollectSpecimen = async (orderId: string) => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      const res = await fetch(`${apiUrl}/lab/orders/${orderId}/collect`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to collect specimen');
      setActionSuccess('Specimen collected successfully!');
      fetchOrderDetail(orderId);
      fetchOrders();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReceiveSpecimen = async (orderId: string) => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      const res = await fetch(`${apiUrl}/lab/orders/${orderId}/receive`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to receive specimen');
      setActionSuccess('Specimen received at lab; status changed to PROCESSING');
      fetchOrderDetail(orderId);
      fetchOrders();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultModalItem) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch(`${apiUrl}/lab/items/${resultModalItem.id}/result`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          resultValue: resultVal,
          numericValue: numericVal ? Number(numericVal) : undefined,
          unit: unit || undefined,
          referenceRange: refRange || undefined,
          abnormalFlag,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to record result');

      setActionSuccess('Preliminary result recorded successfully');
      setResultModalItem(null);
      if (selectedOrder) fetchOrderDetail(selectedOrder.id);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyResult = async (resultId: string) => {
    if (!selectedOrder) return;
    setIsSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch(`${apiUrl}/lab/results/${resultId}/verify`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to verify lab result');

      setActionSuccess('Lab result officially VERIFIED and finalized');
      fetchOrderDetail(selectedOrder.id);
      fetchOrders();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrders = statusFilter === 'ALL'
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">M</div>
              <span className="text-lg font-extrabold text-slate-900">MediNexa</span>
            </div>

            <nav className="flex space-x-4">
              <Link href="/dashboard" className="text-sm text-slate-600 hover:text-indigo-600 font-medium">Overview</Link>
              <Link href="/dashboard/lab" className="text-sm text-indigo-600 font-bold border-b-2 border-indigo-600 pb-1">Lab Workstation</Link>
              <Link href="/dashboard/pharmacy" className="text-sm text-slate-600 hover:text-indigo-600 font-medium">Pharmacy</Link>
              <Link href="/dashboard/clinical" className="text-sm text-slate-600 hover:text-indigo-600 font-medium">Clinical</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Laboratory & Diagnostics Workstation</h1>
            <p className="text-sm text-slate-500 mt-1">Specimen collection, tracking, test processing, and result verification</p>
          </div>

          <div className="flex items-center space-x-2">
            {['ALL', 'ORDERED', 'COLLECTED', 'PROCESSING', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                  statusFilter === st ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {actionSuccess && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold rounded-xl flex items-center justify-between">
            <span>✅ {actionSuccess}</span>
            <button onClick={() => setActionSuccess(null)} className="text-xs font-bold text-emerald-700">Dismiss</button>
          </div>
        )}
        {actionError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-900 text-sm font-semibold rounded-xl flex items-center justify-between">
            <span>⚠️ {actionError}</span>
            <button onClick={() => setActionError(null)} className="text-xs font-bold text-red-700">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Directory */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col h-[750px]">
            <h2 className="text-lg font-black text-slate-900 mb-3 px-2">Lab Orders ({filteredOrders.length})</h2>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredOrders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => fetchOrderDetail(ord.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedOrder?.id === ord.id
                      ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">{ord.orderNumber}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      ord.priority === 'STAT' ? 'bg-red-100 text-red-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {ord.priority}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-1">
                    Patient: {ord.patient?.user?.firstName} {ord.patient?.user?.lastName}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Status: <strong className="text-slate-700">{ord.status}</strong> • {ord.items?.length || 0} Tests
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Order Workspace */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-[750px]">
            {selectedOrder ? (
              <>
                <div className="border-b border-slate-200 pb-4 mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">
                      Order {selectedOrder.orderNumber}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Patient: <strong className="text-slate-800">{selectedOrder.patient?.user?.firstName} {selectedOrder.patient?.user?.lastName}</strong> • Dr. {selectedOrder.doctor?.user?.lastName}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {selectedOrder.status === 'ORDERED' && (
                      <button
                        onClick={() => handleCollectSpecimen(selectedOrder.id)}
                        disabled={isSubmitting}
                        className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg"
                      >
                        Collect Specimen
                      </button>
                    )}
                    {selectedOrder.status === 'COLLECTED' && (
                      <button
                        onClick={() => handleReceiveSpecimen(selectedOrder.id)}
                        disabled={isSubmitting}
                        className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg"
                      >
                        Receive at Lab
                      </button>
                    )}
                  </div>
                </div>

                {/* Items & Results Table */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Requested Tests & Results</h3>

                  <div className="space-y-3">
                    {selectedOrder.items?.map((item) => {
                      const res = item.results && item.results.length > 0 ? item.results[0] : null;
                      return (
                        <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-sm text-slate-900">{item.labTest?.name}</span>
                              <span className="text-xs text-slate-500 ml-2">({item.labTest?.category})</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              {!res ? (
                                <button
                                  onClick={() => {
                                    setResultModalItem(item);
                                    setResultVal('');
                                    setNumericVal('');
                                    setUnit('');
                                    setRefRange('');
                                  }}
                                  className="text-xs font-bold bg-indigo-600 text-white px-2.5 py-1 rounded"
                                >
                                  + Record Result
                                </button>
                              ) : res.resultStatus === 'PRELIMINARY' ? (
                                <button
                                  onClick={() => handleVerifyResult(res.id)}
                                  className="text-xs font-bold bg-emerald-600 text-white px-2.5 py-1 rounded"
                                >
                                  Verify & Finalize
                                </button>
                              ) : (
                                <span className="text-xs px-2 py-0.5 rounded font-extrabold bg-emerald-100 text-emerald-800">
                                  VERIFIED ({res.resultStatus})
                                </span>
                              )}
                            </div>
                          </div>

                          {res ? (
                            <div className="bg-white border border-slate-200 rounded-lg p-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              <div><span className="text-slate-500">Value:</span> <strong className="text-slate-900">{res.resultValue} {res.unit || ''}</strong></div>
                              <div><span className="text-slate-500">Flag:</span> <strong className={`font-bold ${res.abnormalFlag !== 'NORMAL' ? 'text-red-600' : 'text-slate-800'}`}>{res.abnormalFlag}</strong></div>
                              <div><span className="text-slate-500">Ref Range:</span> <strong className="text-slate-800">{res.referenceRange || 'N/A'}</strong></div>
                              <div><span className="text-slate-500">Status:</span> <strong className="text-indigo-600">{res.resultStatus}</strong></div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">Result pending laboratory testing.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-500 my-auto">Select a lab order to open workspace.</div>
            )}
          </div>
        </div>
      </main>

      {/* Record Result Modal */}
      {resultModalItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveResult} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Record Test Result: {resultModalItem.labTest?.name}</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Result Value *</label>
              <input
                required
                type="text"
                placeholder="e.g. 13.5 or Positive..."
                value={resultVal}
                onChange={(e) => setResultVal(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Numeric Value</label>
                <input
                  type="number"
                  step="0.01"
                  value={numericVal}
                  onChange={(e) => setNumericVal(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Unit</label>
                <input
                  type="text"
                  placeholder="e.g. g/dL, mg/dL..."
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Reference Range</label>
                <input
                  type="text"
                  placeholder="e.g. 12.0 - 15.5"
                  value={refRange}
                  onChange={(e) => setRefRange(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Abnormal Flag</label>
                <select
                  value={abnormalFlag}
                  onChange={(e) => setAbnormalFlag(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  {['NORMAL', 'LOW', 'HIGH', 'CRITICAL', 'ABNORMAL'].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setResultModalItem(null)}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !resultVal}
                className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Save Result
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
