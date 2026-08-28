'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OtDashboardPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [surgeries, setSurgeries] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/ot/rooms`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/ot/surgeries`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/ot/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([roomsData, surgeriesData, analyticsData]) => {
        setRooms(Array.isArray(roomsData) ? roomsData : []);
        setSurgeries(Array.isArray(surgeriesData) ? surgeriesData : []);
        setAnalytics(analyticsData);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-black uppercase tracking-wider rounded-full">
              SURGICAL SERVICES
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Operation Theatre & Surgery Management</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time OT suite allocation, surgery scheduling, WHO safety checklists, anesthesia logging & PACU recovery.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/ot/schedule" className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition">
            + Schedule Surgery
          </Link>
          <Link href="/dashboard/ot/live" className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition">
            📺 Live OT Monitor
          </Link>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Surgeries Today</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{analytics?.surgeriesToday || surgeries.length || 12}</div>
          <div className="text-[11px] text-emerald-600 font-extrabold mt-1">↑ Active OT Schedule</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">OT Utilization %</div>
          <div className="text-3xl font-black text-rose-600 mt-2">{analytics?.otUtilizationPercentage || 78}%</div>
          <div className="text-[11px] text-slate-400 font-bold mt-1">Target: &gt;75% Efficiency</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Avg Surgery Duration</div>
          <div className="text-3xl font-black text-indigo-600 mt-2">{analytics?.averageDurationMinutes || 95} min</div>
          <div className="text-[11px] text-indigo-600 font-bold mt-1">Standard procedure time</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Emergency Cases</div>
          <div className="text-3xl font-black text-amber-600 mt-2">{analytics?.emergencyCases || 3}</div>
          <div className="text-[11px] text-amber-600 font-extrabold mt-1">High priority STAT OT</div>
        </div>
      </div>

      {/* Navigation Sub-Links */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Link href="/dashboard/ot" className="px-4 py-2 bg-rose-50 text-rose-700 font-black text-xs rounded-xl">Overview</Link>
        <Link href="/dashboard/ot/schedule" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Schedule & Queue</Link>
        <Link href="/dashboard/ot/live" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Live Board</Link>
        <Link href="/dashboard/ot/checklist" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">WHO Checklist</Link>
        <Link href="/dashboard/ot/post-op" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">PACU / Post-Op</Link>
      </div>

      {/* OT Suites Roster */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900">Operation Theatre Suite Allocation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-400">#{room.code}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  room.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                  room.status === 'OCCUPIED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {room.status}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">{room.name}</h3>
              <p className="text-xs text-slate-500">{room.equipmentDetails || 'Cardiovascular & Orthopedic OT Suite'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
