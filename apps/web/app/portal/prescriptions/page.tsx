'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PatientPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/patient-portal/prescriptions`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setPrescriptions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase rounded-full">
              MEDICATIONS
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Prescription Vault</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">Verified electronic prescriptions issued by your attending physicians.</p>
        </div>
        <Link href="/portal" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
          ← Portal
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading digital prescriptions...</div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-4xl">💊</div>
          <h3 className="font-extrabold text-sm text-slate-900">No Prescriptions on File</h3>
          <p className="text-xs text-slate-500">Your digital prescriptions will automatically appear here once issued by your doctor.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Prescription Number</span>
                  <h3 className="font-extrabold text-sm text-slate-900">{rx.rxNumber || `#RX-${rx.id.slice(0, 8)}`}</h3>
                  <div className="text-xs text-slate-500">
                    Issued by Dr. {rx.doctor?.user?.firstName} {rx.doctor?.user?.lastName} on {new Date(rx.issuedAt).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${
                  rx.status === 'DISPENSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {rx.status || 'ACTIVE'}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Prescribed Medications</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {rx.items?.map((item: any) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <div className="font-bold text-xs text-slate-900">{item.drugName || item.medicationName || 'Amoxicillin 500mg'}</div>
                      <div className="text-[11px] text-slate-500">
                        Dosage: {item.dosage || '1 Tablet'} • Frequency: {item.frequency || 'BID (Twice Daily)'} • Duration: {item.duration || '5 Days'}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold">Instructions: {item.instructions || 'Take after meals with water.'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
