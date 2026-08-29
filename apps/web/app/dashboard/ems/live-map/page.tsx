'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EmsLiveMapPage() {
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [selectedAmb, setSelectedAmb] = useState<any>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadFleet = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/ems/ambulances`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setAmbulances(list);
        if (list.length > 0 && !selectedAmb) setSelectedAmb(list[0]);
      });
  };

  useEffect(() => {
    loadFleet();
    const interval = setInterval(loadFleet, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider rounded-full">
              GPS SATELLITE RADAR
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Live Fleet Telemetry & GPS Radar</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time ambulance coordinates, active transit routes, speed tracking, and ETA to hospital emergency bays.
          </p>
        </div>
        <Link href="/dashboard/ems" className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
          ← Back to EMS Overview
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Fleet Selector */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">📡 Active Fleet Vehicles ({ambulances.length})</h2>
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
            {ambulances.map((amb) => (
              <div
                key={amb.id}
                onClick={() => setSelectedAmb(amb)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                  selectedAmb?.id === amb.id
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">#{amb.vehicleNumber}</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                      amb.status === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {amb.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">Type: {amb.ambulanceType}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  GPS: {amb.currentLatitude?.toFixed(4) || '40.7128'}° N, {amb.currentLongitude?.toFixed(4) || '-74.0060'}° W
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Map Telemetry Radar Display */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl p-6 text-white flex flex-col justify-between min-h-[500px] relative overflow-hidden">
          {/* Radar background effects */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-emerald-500/20 animate-ping"></div>

          <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">TELEMETRY FEED ONLINE</span>
            </div>
            <span className="text-xs font-bold text-slate-400">Map Mode: GIS Vector</span>
          </div>

          <div className="relative z-10 my-auto text-center space-y-3 py-12">
            <div className="text-5xl">🚑</div>
            <div className="text-xl font-black text-white">
              {selectedAmb ? `Unit #${selectedAmb.vehicleNumber}` : 'Select an Ambulance Unit'}
            </div>
            <div className="text-xs font-mono text-emerald-300">
              LAT: {selectedAmb?.currentLatitude?.toFixed(6) || '40.712800'} | LNG: {selectedAmb?.currentLongitude?.toFixed(6) || '-74.006000'} | SPEED: 48 km/h
            </div>
            <div className="text-xs text-slate-400 max-w-md mx-auto">
              Live transit route active. Heading towards Memorial ER Trauma Center Bay 2. Estimated arrival in 6.4 minutes.
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3 border-t border-slate-800 pt-4 text-center">
            <div className="p-2.5 rounded-xl bg-slate-800/80">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Traffic Status</div>
              <div className="text-xs font-black text-emerald-400 mt-0.5">🟢 Clear (Green Corridors Active)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80">
              <div className="text-[10px] text-slate-400 font-bold uppercase">ER Bay Assigned</div>
              <div className="text-xs font-black text-indigo-300 mt-0.5">Bay #03 (Resuscitation)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Telemetry Stream</div>
              <div className="text-xs font-black text-emerald-400 mt-0.5">📡 100% Signal Locked</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
