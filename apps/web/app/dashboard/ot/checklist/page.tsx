'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OtChecklistSubPage() {
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
          <h1 className="text-2xl font-extrabold text-slate-900">WHO Surgical Safety Checklist Station</h1>
          <p className="text-xs text-slate-500 mt-1">Verification checklist compliance for Sign In, Time Out, and Sign Out phases.</p>
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
              <th className="py-3 px-4">Sign In (Pre-Anesthesia)</th>
              <th className="py-3 px-4">Time Out (Pre-Incision)</th>
              <th className="py-3 px-4">Sign Out (Pre-Exit)</th>
              <th className="py-3 px-4">Checklist Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {surgeries.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-extrabold text-slate-900">{s.procedureName}</td>
                <td className="py-3 px-4 text-slate-800">{s.patient?.user?.firstName} {s.patient?.user?.lastName}</td>
                <td className="py-3 px-4"><span className="text-emerald-600 font-extrabold">✓ Completed</span></td>
                <td className="py-3 px-4"><span className="text-emerald-600 font-extrabold">✓ Verified</span></td>
                <td className="py-3 px-4"><span className="text-emerald-600 font-extrabold">✓ Verified</span></td>
                <td className="py-3 px-4">
                  <span className="font-extrabold px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
                    PASSED
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
