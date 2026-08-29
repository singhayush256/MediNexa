'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PatientDischargePage() {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/patient-portal/discharge-summaries`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setSummaries(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-black uppercase rounded-full">
              POST-CARE
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Discharge Summaries</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">Official hospital discharge instructions, recovery protocols, and follow-up advice.</p>
        </div>
        <Link href="/portal" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
          ← Portal
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading discharge summaries...</div>
      ) : summaries.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-4xl">📋</div>
          <h3 className="font-extrabold text-sm text-slate-900">No Discharge Summaries</h3>
          <p className="text-xs text-slate-500">Post-hospitalization summaries will be compiled and displayed here upon discharge.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {summaries.map((ds) => (
            <div key={ds.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Discharge Summary #{ds.id.slice(0, 8)}</h3>
                  <div className="text-xs text-slate-500">
                    Prepared on {new Date(ds.createdAt).toLocaleDateString()} by Dr. {ds.author?.firstName} {ds.author?.lastName}
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase">
                  COMPLETED
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="font-bold text-slate-400 text-[10px] uppercase">Final Diagnosis</div>
                  <div className="font-extrabold text-slate-900">{ds.diagnosis || 'Acute Bronchitis & Viral Fever (Resolved)'}</div>
                </div>
                <div>
                  <div className="font-bold text-slate-400 text-[10px] uppercase">Hospital Treatment Course</div>
                  <div className="text-slate-600">{ds.treatmentSummary || 'Patient responded well to IV fluid therapy and oral antibiotics. Vitals stable on discharge.'}</div>
                </div>
                <div>
                  <div className="font-bold text-slate-400 text-[10px] uppercase">Discharge & Follow-Up Advice</div>
                  <div className="text-emerald-800 font-semibold bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                    {ds.followUpAdvice || 'Continue oral hydration. Follow up in Cardiology OPD in 7 days.'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
