'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OtPostOpSubPage() {
  const [surgeries, setSurgeries] = useState<any[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/ot/surgeries`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setSurgeries(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">PACU Recovery & Post-Operative Notes</h1>
          <p className="text-xs text-slate-500 mt-1">Post-Anesthesia Care Unit (PACU) patient recovery status and post-op care orders.</p>
        </div>
        <Link href="/dashboard/ot" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to OT Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Procedure</th>
              <th className="py-3 px-4">Patient</th>
              <th className="py-3 px-4">PACU Status</th>
              <th className="py-3 px-4">Post-Op Recovery Instructions</th>
              <th className="py-3 px-4">Anesthetist</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {surgeries.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-extrabold text-slate-900">{s.procedureName}</td>
                <td className="py-3 px-4 text-slate-800">{s.patient?.user?.firstName} {s.patient?.user?.lastName}</td>
                <td className="py-3 px-4">
                  <span className="font-extrabold px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
                    STABLE
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600">Monitor vitals q15m for 2 hours. Administer IV analgesia as prescribed.</td>
                <td className="py-3 px-4 text-slate-700">Dr. {s.anesthetist?.firstName || 'Staff'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
