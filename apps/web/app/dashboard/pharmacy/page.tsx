'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PrescriptionDto, PrescriptionStatus } from '@medinexa/types';

export default function PharmacyDashboardPage() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<PrescriptionDto[]>([]);
  const [selectedRx, setSelectedRx] = useState<PrescriptionDto | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Dispense Form Modal State
  const [dispenseItem, setDispenseItem] = useState<any | null>(null);
  const [dispenseQty, setDispenseQty] = useState<string>('1');
  const [dispenseBatchNumber, setDispenseBatchNumber] = useState<string>('');
  const [dispenseExpirationDate, setDispenseExpirationDate] = useState<string>('');
  const [dispenseNotes, setDispenseNotes] = useState('');

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchPrescriptions = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    if (!token) return;

    try {
      let role = userRole;
      if (!role) {
        const meRes = await fetch(`${apiUrl}/auth/me`, { headers: getHeaders() }).then((r) => r.json());
        role = meRes?.roleCode || meRes?.role?.code || '';
        setUserRole(role);
      }

      if (role === 'RECEPTIONIST') {
        router.replace('/dashboard/patients');
        return;
      }

      const endpoint = role === 'PATIENT' ? '/patients/me/prescriptions' : '/prescriptions';
      const res = await fetch(`${apiUrl}${endpoint}`, { headers: getHeaders() });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setPrescriptions(list);
      if (list.length > 0 && !selectedRx) {
        fetchRxDetail(list[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRxDetail = (id: string) => {
    fetch(`${apiUrl}/prescriptions/${id}`, { headers: getHeaders() })
      .then((r) => r.json())
      .then((detail) => setSelectedRx(detail))
      .catch(() => {});
  };

  useEffect(() => {
    fetchPrescriptions();
    const interval = setInterval(fetchPrescriptions, 5000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  const handleDispense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRx || !dispenseItem) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch(`${apiUrl}/pharmacy/prescriptions/${selectedRx.id}/dispense`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          prescriptionItemId: dispenseItem.id,
          quantity: Number(dispenseQty),
          batchNumber: dispenseBatchNumber,
          expirationDate: dispenseExpirationDate,
          notes: dispenseNotes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Dispense failed');

      setActionSuccess(`Dispensed ${dispenseQty} units of ${dispenseItem.medication?.brandName} (Batch #${dispenseBatchNumber}) successfully!`);
      setDispenseItem(null);
      setDispenseBatchNumber('');
      setDispenseExpirationDate('');
      fetchRxDetail(selectedRx.id);
      fetchPrescriptions();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPrescriptions = statusFilter === 'ALL'
    ? prescriptions
    : prescriptions.filter((p) => p.status === statusFilter);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">M</div>
              <span className="text-lg font-extrabold text-slate-900">MediNexa</span>
            </div>

            <nav className="flex space-x-4">
              <Link href="/dashboard" className="text-sm text-slate-600 hover:text-teal-600 font-medium">Overview</Link>
              <Link href="/dashboard/pharmacy" className="text-sm text-teal-600 font-bold border-b-2 border-teal-600 pb-1">Pharmacy Dispensing</Link>
              <Link href="/dashboard/lab" className="text-sm text-slate-600 hover:text-teal-600 font-medium">Lab</Link>
              <Link href="/dashboard/clinical" className="text-sm text-slate-600 hover:text-teal-600 font-medium">Clinical</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pharmacy Dispensing Workstation</h1>
            <p className="text-sm text-slate-500 mt-1">Prescription fulfillment, medication dispensing, and refill tracking</p>
          </div>

          <div className="flex items-center space-x-2">
            {['ALL', 'ISSUED', 'PARTIALLY_DISPENSED', 'DISPENSED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                  statusFilter === st ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-slate-200 text-slate-600'
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
          {/* Prescription Directory */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col h-[750px]">
            <h2 className="text-lg font-black text-slate-900 mb-3 px-2">Prescriptions ({filteredPrescriptions.length})</h2>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredPrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  onClick={() => fetchRxDetail(rx.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedRx?.id === rx.id
                      ? 'bg-teal-50 border-teal-300 shadow-sm'
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">{rx.prescriptionNumber}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      rx.status === 'DISPENSED' ? 'bg-emerald-100 text-emerald-800' : rx.status === 'PARTIALLY_DISPENSED' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                    }`}>
                      {rx.status}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-1">
                    Patient: {rx.patient?.user?.firstName} {rx.patient?.user?.lastName}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Dr. {rx.doctor?.user?.lastName} • {rx.items?.length || 0} Medications
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Prescription Workspace */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-[750px]">
            {selectedRx ? (
              <>
                <div className="border-b border-slate-200 pb-4 mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">
                      Prescription {selectedRx.prescriptionNumber}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Patient: <strong className="text-slate-800">{selectedRx.patient?.user?.firstName} {selectedRx.patient?.user?.lastName}</strong> • Prescribed by Dr. {selectedRx.doctor?.user?.lastName}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-black ${
                    selectedRx.status === 'DISPENSED' ? 'bg-emerald-100 text-emerald-800' : selectedRx.status === 'PARTIALLY_DISPENSED' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                  }`}>
                    {selectedRx.status}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Prescribed Items</h3>

                  <div className="space-y-3">
                    {selectedRx.items?.map((item) => {
                      const totalDispensed = item.dispenses
                        ? item.dispenses.reduce((acc, d) => acc + d.quantityDispensed, 0)
                        : 0;
                      const remaining = item.quantity - totalDispensed;

                      return (
                        <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-extrabold text-sm text-slate-900">{item.medication?.brandName}</span>
                              <span className="text-xs text-slate-600 ml-2">({item.medication?.genericName} - {item.medication?.strength})</span>
                            </div>

                            {remaining > 0 && selectedRx.status !== 'CANCELLED' && ['PHARMACY_STAFF', 'DOCTOR', 'NURSE', 'HOSPITAL_ADMIN', 'MEDINEXA_ADMIN'].includes(userRole) ? (
                              <button
                                onClick={() => {
                                  setDispenseItem(item);
                                  setDispenseQty(String(remaining));
                                }}
                                className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg shadow-sm"
                              >
                                Dispense ({remaining} left)
                              </button>
                            ) : (
                              <span className="text-xs px-2.5 py-1 rounded-lg font-extrabold bg-slate-100 text-slate-700">
                                {totalDispensed >= item.quantity ? 'FULLY DISPENSED' : `${totalDispensed} / ${item.quantity} DISPENSED`}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-100">
                            <div><span className="text-slate-500">Dose:</span> <strong>{item.dosage}</strong></div>
                            <div><span className="text-slate-500">Frequency:</span> <strong>{item.frequency}</strong></div>
                            <div><span className="text-slate-500">Route:</span> <strong>{item.route}</strong></div>
                            <div><span className="text-slate-500">Duration:</span> <strong>{item.duration}</strong></div>
                          </div>

                          <div className="text-xs text-slate-500 flex justify-between pt-1 font-medium">
                            <span>Prescribed Total: <strong className="text-slate-800">{item.quantity} units</strong></span>
                            <span>Refills: <strong className="text-slate-800">{item.refillsUsed ?? 0} / {item.refillsAllowed ?? 0}</strong></span>
                            <span>Dispensed: <strong className="text-teal-700">{totalDispensed} / {item.quantity}</strong></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-500 my-auto">Select a prescription to view dispensing details.</div>
            )}
          </div>
        </div>
      </main>

      {/* Dispense Modal */}
      {dispenseItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleDispense} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Dispense: {dispenseItem.medication?.brandName}</h3>
            <p className="text-xs text-slate-500">Prescribed: {dispenseItem.quantity} units | Dosage: {dispenseItem.dosage}</p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Quantity to Dispense *</label>
              <input
                required
                type="number"
                min="1"
                max={dispenseItem.quantity}
                value={dispenseQty}
                onChange={(e) => setDispenseQty(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Batch Number *</label>
              <input
                required
                type="text"
                placeholder="e.g. BATCH-2026-X9"
                value={dispenseBatchNumber}
                onChange={(e) => setDispenseBatchNumber(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Expiration Date *</label>
              <input
                required
                type="date"
                value={dispenseExpirationDate}
                onChange={(e) => setDispenseExpirationDate(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900"
              />
            </div>

            {dispenseExpirationDate && new Date(dispenseExpirationDate) < new Date() && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
                ⚠️ Warning: Selected expiration date is in the past! Expired batches cannot be dispensed.
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Pharmacy Dispensing Notes</label>
              <input
                type="text"
                placeholder="Storage location, instructions..."
                value={dispenseNotes}
                onChange={(e) => setDispenseNotes(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDispenseItem(null)}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !dispenseQty || !dispenseBatchNumber || !dispenseExpirationDate || (!!dispenseExpirationDate && new Date(dispenseExpirationDate) < new Date())}
                className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Confirm Dispense
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
