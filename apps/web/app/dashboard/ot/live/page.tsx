'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OtLiveMonitorSubPage() {
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
          <h1 className="text-2xl font-extrabold text-slate-900">Live OT Digital Display Board</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time status tracking for active surgeries in progress.</p>
        </div>
        <Link href="/dashboard/ot" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to OT Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surgeries.map((s) => (
          <div key={s.id} className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 shadow-lg border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-rose-400">SUITE #{s.ot?.code || 'OT-01'}</span>
              <span className="px-3 py-1 bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase rounded-full tracking-wider animate-pulse">
                ● {s.status}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{s.procedureName}</h3>
              <p className="text-xs text-slate-400 mt-1">Patient: {s.patient?.user?.firstName} {s.patient?.user?.lastName}</p>
            </div>
            <div className="border-t border-slate-800 pt-3 text-xs text-slate-300 flex justify-between">
              <span>Surgeon: Dr. {s.leadSurgeon?.firstName} {s.leadSurgeon?.lastName}</span>
              <span className="font-bold text-amber-400">{s.priority}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
