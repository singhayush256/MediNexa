'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OtScheduleSubPage() {
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
          <h1 className="text-2xl font-extrabold text-slate-900">Surgery Schedule & Emergency Queue</h1>
          <p className="text-xs text-slate-500 mt-1">Elective surgery calendar, STAT emergency OT bookings, and surgical team assignments.</p>
        </div>
        <Link href="/dashboard/ot" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to OT Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Procedure Name</th>
              <th className="py-3 px-4">OT Suite</th>
              <th className="py-3 px-4">Patient</th>
              <th className="py-3 px-4">Lead Surgeon</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Scheduled Start</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {surgeries.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-extrabold text-slate-900">{s.procedureName}</td>
                <td className="py-3 px-4 text-slate-600 font-mono">{s.ot?.code || 'OT-01'}</td>
                <td className="py-3 px-4 text-slate-800 font-bold">{s.patient?.user?.firstName || 'Alex'} {s.patient?.user?.lastName || 'Rivera'}</td>
                <td className="py-3 px-4 text-slate-700">Dr. {s.leadSurgeon?.firstName || 'Smith'}</td>
                <td className="py-3 px-4">
                  <span className={`font-black px-2.5 py-0.5 rounded-full text-[10px] ${s.priority === 'EMERGENCY' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}`}>
                    {s.priority}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-500">{new Date(s.scheduledStartTime).toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span className="font-extrabold px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800">
                    {s.status}
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
