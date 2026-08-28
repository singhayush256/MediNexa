'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CapaTrackerPage() {
  const [capas, setCapas] = useState<any[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadCapas = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/quality/audits`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        const extracted = (Array.isArray(d) ? d : []).flatMap((a) => a.capas || []);
        setCapas(extracted);
      });
  };

  useEffect(() => {
    loadCapas();
  }, []);

  const handleComplete = async (id: string) => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    await fetch(`${apiUrl}/quality/capa/${id}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadCapas();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">CAPA Tracker (Corrective & Preventive Actions)</h1>
          <p className="text-xs text-slate-500 mt-1">Lifecycle monitoring for clinical action plans, root cause resolutions, and compliance closures.</p>
        </div>
        <Link href="/dashboard/quality" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to Quality Hub
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">CAPA #</th>
              <th className="py-3 px-4">Corrective Action</th>
              <th className="py-3 px-4">Preventive Action</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {capas.map((capa) => (
              <tr key={capa.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{capa.capaNumber}</td>
                <td className="py-3 px-4 text-slate-700 font-bold max-w-xs truncate">{capa.correctiveAction}</td>
                <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs truncate">{capa.preventiveAction}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    capa.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {capa.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {capa.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleComplete(capa.id)}
                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition"
                    >
                      Mark Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
