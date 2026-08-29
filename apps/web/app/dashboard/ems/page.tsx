'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EmsDashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/ems/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setAnalytics(d));
  }, []);

  const data = analytics || {
    callsToday: 42,
    totalDispatches: 38,
    activeDispatches: 4,
    dispatchResponseTimeMinutes: 5.4,
    averageSceneTimeMinutes: 12.8,
    ambulanceUtilizationPercentage: 78.4,
    fleetAvailabilityPercentage: 85.0,
    responseSlaCompliancePercentage: 96.8,
    emergencyVolumeByType: [
      { type: 'Cardiac Arrest & Chest Pain', count: 14, percentage: 33.3 },
      { type: 'Road Traffic Accident (RTA)', count: 12, percentage: 28.6 },
      { type: 'Acute Stroke & Neuro Deficit', count: 8, percentage: 19.0 },
      { type: 'Severe Respiratory Distress', count: 5, percentage: 11.9 },
      { type: 'Pediatric Emergency', count: 3, percentage: 7.2 },
    ],
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-black uppercase tracking-wider rounded-full">
              EMS 911 / 108 DISPATCH CENTER
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ambulance Fleet & EMS Command</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time GPS ambulance telemetry, rapid CAD dispatching, live traffic response routing, and hospital arrival alerts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/ems/dispatch" className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition">
            🚨 Create CAD Dispatch
          </Link>
          <Link href="/dashboard/ems/live-map" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition">
            🗺️ Live Fleet Radar
          </Link>
        </div>
      </div>

      {/* Navigation Sub-Links */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <Link href="/dashboard/ems" className="px-4 py-2 bg-rose-50 text-rose-800 font-black text-xs rounded-xl">EMS Overview</Link>
        <Link href="/dashboard/ems/dispatch" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">CAD Dispatch Console</Link>
        <Link href="/dashboard/ems/fleet" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Ambulance Fleet & Crew</Link>
        <Link href="/dashboard/ems/live-map" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">GPS Live Tracking</Link>
        <Link href="/dashboard/ems/maintenance" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Fleet Maintenance</Link>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Avg Dispatch Response SLA</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">{data.dispatchResponseTimeMinutes} min</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">SLA Compliance: {data.responseSlaCompliancePercentage}%</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Dispatches Now</div>
          <div className="text-3xl font-black text-rose-600 mt-2">{data.activeDispatches}</div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">Total today: {data.totalDispatches} dispatches</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Fleet Availability</div>
          <div className="text-3xl font-black text-indigo-600 mt-2">{data.fleetAvailabilityPercentage}%</div>
          <div className="text-[11px] text-indigo-600 font-bold mt-1">Utilization: {data.ambulanceUtilizationPercentage}%</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Avg On-Scene Time</div>
          <div className="text-3xl font-black text-amber-600 mt-2">{data.averageSceneTimeMinutes} min</div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">Total Emergency Calls: {data.callsToday}</div>
        </div>
      </div>

      {/* Emergency Volume Breakdown & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emergency Volume by Type */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center justify-between">
            <span>🚑 Emergency Dispatches by Clinical Category</span>
            <span className="text-xs text-rose-600 font-bold">Today's Intake</span>
          </h2>
          <div className="space-y-3 pt-2">
            {data.emergencyVolumeByType.map((vol: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-xs text-slate-900">{vol.type}</div>
                  <div className="w-32 bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: `${vol.percentage}%` }}></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-slate-900">{vol.count} cases</div>
                  <div className="text-[10px] text-slate-400 font-bold">{vol.percentage}% volume</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EMS Quick Launch */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">⚡ Dispatch & Fleet Actions</h2>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link href="/dashboard/ems/dispatch" className="p-4 rounded-2xl border border-rose-100 bg-rose-50/50 hover:bg-rose-100/50 transition">
              <div className="text-lg">🚨</div>
              <div className="font-extrabold text-xs text-slate-900 mt-2">CAD Dispatching</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Assign vehicles, track statuses, and alert ER teams.</p>
            </Link>
            <Link href="/dashboard/ems/live-map" className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100/50 transition">
              <div className="text-lg">📡</div>
              <div className="font-extrabold text-xs text-slate-900 mt-2">GPS Live Map</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Real-time coordinates and transit telematics.</p>
            </Link>
            <Link href="/dashboard/ems/fleet" className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/50 transition">
              <div className="text-lg">🚐</div>
              <div className="font-extrabold text-xs text-slate-900 mt-2">Fleet & Paramedics</div>
              <p className="text-[11px] text-slate-500 mt-0.5">ALS/BLS vehicle inventory and crew rosters.</p>
            </Link>
            <Link href="/dashboard/ems/maintenance" className="p-4 rounded-2xl border border-amber-100 bg-amber-50/50 hover:bg-amber-100/50 transition">
              <div className="text-lg">🔧</div>
              <div className="font-extrabold text-xs text-slate-900 mt-2">Fleet Service</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Schedule preventive servicing and fuel logs.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
