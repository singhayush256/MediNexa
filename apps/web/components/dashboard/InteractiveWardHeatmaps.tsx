'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Clock,
  Layers,
} from 'lucide-react';

interface BedCell {
  id: string;
  status: 'occupied' | 'available' | 'cleaning';
  number: string;
  patient?: string;
}

// Generate realistic bed layouts for each ward
function generateWardBeds(total: number, occupiedCount: number, prefix: string): BedCell[] {
  return Array.from({ length: total }, (_, i) => {
    const isOccupied = i < occupiedCount;
    return {
      id: `${prefix}-${i + 1}`,
      number: `${prefix}${String(i + 1).padStart(2, '0')}`,
      status: isOccupied ? 'occupied' : i % 7 === 0 ? 'cleaning' : 'available',
      patient: isOccupied ? `Patient UHID-${1000 + i}` : undefined,
    };
  });
}

const admissionTrendData = [
  { time: '1 AM', admissions: 6, discharges: 4 },
  { time: '3 AM', admissions: 12, discharges: 8 },
  { time: '6 AM', admissions: 9, discharges: 5 },
  { time: '9 AM', admissions: 28, discharges: 15 },
  { time: '12 PM', admissions: 14, discharges: 9 },
  { time: '5 PM', admissions: 20, discharges: 12 },
  { time: '8 PM', admissions: 16, discharges: 11 },
  { time: '11 PM', admissions: 21, discharges: 14 },
  { time: '4 AM', admissions: 15, discharges: 8 },
];

const erTrendWave = [
  { level: 'Low', wait: 14 },
  { level: 'Mid', wait: 28 },
  { level: '3rd', wait: 42 },
  { level: 'High', wait: 36 },
];

export function InteractiveWardHeatmaps() {
  const [activeBed, setActiveBed] = useState<BedCell | null>(null);

  const generalBeds = generateWardBeds(68, 60, 'GW-');
  const semiPrivateBeds = generateWardBeds(48, 44, 'SP-');
  const icuBeds = generateWardBeds(32, 24, 'ICU-');

  return (
    <div className="rounded-3xl bg-[#0B1329] border border-[#1E293B] text-slate-100 p-5 md:p-7 shadow-2xl font-sans space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-[#1E293B] gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-sm md:text-base font-black tracking-widest uppercase text-slate-200">
              APOLLO MEDINEXA SUPER SPECIALITY HOSPITAL
            </h2>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
            <span className="font-bold text-slate-300">Dashboard</span>
            <span>•</span>
            <span className="text-cyan-400 font-semibold">Bed Census Indicators</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5" /> Oct 26, 2026 | 10:45 AM
            </span>
          </div>
        </div>

        {/* Header Right: Stats Banner */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-[#111C38] border border-[#1E293B] px-4 py-3 rounded-2xl">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Beds: 450</div>
            <div className="text-xs font-semibold text-slate-300 mt-0.5">
              Occupied: <span className="text-white font-black">395</span> | Available: <span className="text-emerald-400 font-black">55</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-700/60 hidden sm:block" />
          <div className="min-w-[160px]">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-semibold">Occupancy:</span>
              <span className="font-black text-emerald-400 flex items-center gap-1">
                87.8% <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full" style={{ width: '87.8%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Ward Occupancy Heatmaps (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-wide text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" /> Interactive Ward Occupancy Heatmaps
            </h3>
            <span className="text-[11px] font-semibold text-slate-400 bg-[#111C38] px-2.5 py-0.5 rounded-full border border-slate-800">
              Dynamic floor map
            </span>
          </div>

          {/* Ward 1: General Ward */}
          <div className="p-4 rounded-2xl bg-[#101935] border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">General Ward</h4>
                <div className="text-[11px] text-amber-400 font-bold mt-0.5">
                  Occupancy: 88%
                </div>
                <div className="text-[10px] text-slate-400">150/170 beds occupied</div>
              </div>
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Busy
              </span>
            </div>

            {/* Floor Map Graphic with Bed Cells */}
            <div className="p-3 bg-[#080E21] border border-slate-800 rounded-xl relative overflow-hidden">
              {/* Architectural outline borders */}
              <div className="absolute inset-0 border border-dashed border-slate-800/60 pointer-events-none rounded-xl" />
              <div className="grid grid-cols-12 sm:grid-cols-16 gap-1.5 relative z-10">
                {generalBeds.map((b) => (
                  <button
                    key={b.id}
                    title={`${b.number}: ${b.status} ${b.patient ? `(${b.patient})` : ''}`}
                    onClick={() => setActiveBed(b)}
                    className={`h-4 rounded-xs transition-transform hover:scale-125 cursor-pointer ${
                      b.status === 'occupied'
                        ? 'bg-amber-500 hover:bg-amber-400 shadow-xs shadow-amber-500/30'
                        : b.status === 'cleaning'
                        ? 'bg-slate-700/80'
                        : 'bg-emerald-500/40 border border-emerald-500/60 hover:bg-emerald-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Ward 2: Semi-Private */}
          <div className="p-4 rounded-2xl bg-[#101935] border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">Semi-Private</h4>
                <div className="text-[11px] text-rose-400 font-bold mt-0.5">
                  Occupancy: 92%
                </div>
                <div className="text-[10px] text-slate-400">110/120 beds occupied</div>
              </div>
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Critical
              </span>
            </div>

            {/* Floor Map Graphic with Red Bed Cells */}
            <div className="p-3 bg-[#080E21] border border-slate-800 rounded-xl relative overflow-hidden">
              <div className="grid grid-cols-12 sm:grid-cols-16 gap-1.5 relative z-10">
                {semiPrivateBeds.map((b) => (
                  <button
                    key={b.id}
                    title={`${b.number}: ${b.status}`}
                    onClick={() => setActiveBed(b)}
                    className={`h-4 rounded-xs transition-transform hover:scale-125 cursor-pointer ${
                      b.status === 'occupied'
                        ? 'bg-rose-500 hover:bg-rose-400 shadow-xs shadow-rose-500/30'
                        : 'bg-slate-700/60 border border-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Ward 3: Critical Care ICU */}
          <div className="p-4 rounded-2xl bg-[#101935] border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">Critical Care ICU</h4>
                <div className="text-[11px] text-lime-400 font-bold mt-0.5">
                  Occupancy: 75%
                </div>
                <div className="text-[10px] text-slate-400">30/40 beds occupied</div>
              </div>
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                High Load
              </span>
            </div>

            {/* Floor Map Graphic with Yellow/Lime Bed Cells */}
            <div className="p-3 bg-[#080E21] border border-slate-800 rounded-xl relative overflow-hidden">
              <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5 relative z-10">
                {icuBeds.map((b, idx) => (
                  <button
                    key={b.id}
                    title={`${b.number}: ${b.status}`}
                    onClick={() => setActiveBed(b)}
                    className={`h-4 rounded-xs transition-transform hover:scale-125 cursor-pointer ${
                      b.status === 'occupied'
                        ? idx % 2 === 0
                          ? 'bg-lime-400 hover:bg-lime-300 shadow-xs shadow-lime-400/30'
                          : 'bg-yellow-400 hover:bg-yellow-300 shadow-xs shadow-yellow-400/30'
                        : 'bg-emerald-500/40 border border-emerald-500/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {activeBed && (
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-700/50 text-xs text-cyan-200 flex items-center justify-between">
              <div>
                Selected Bed: <span className="font-black text-white">{activeBed.number}</span> | Status: <span className="uppercase font-bold">{activeBed.status}</span> {activeBed.patient && `(${activeBed.patient})`}
              </div>
              <button onClick={() => setActiveBed(null)} className="text-slate-400 hover:text-white font-bold">
                ✕ Close
              </button>
            </div>
          )}
        </div>

        {/* Right Column: ER Triage Queue, Admission Graph, OPD Revenue (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. Emergency ER Triage Queue */}
          <div className="p-4 rounded-2xl bg-[#101935] border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white tracking-wide">Emergency ER Triage Queue</h4>
              <span className="text-[11px] font-bold text-amber-400">
                Avg Wait: <span className="text-white font-black">42 mins</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              {/* Triage Priority Levels */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between bg-slate-900/60 px-2.5 py-1 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center">1</span>
                    <span className="font-semibold text-rose-300">Red</span>
                  </div>
                  <span className="font-mono font-bold text-white">18 min</span>
                </div>
                <div className="flex items-center justify-between bg-slate-900/60 px-2.5 py-1 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-black text-[9px] flex items-center justify-center">2</span>
                    <span className="font-semibold text-amber-300">Orange</span>
                  </div>
                  <span className="font-mono font-bold text-white">35 min</span>
                </div>
                <div className="flex items-center justify-between bg-slate-900/60 px-2.5 py-1 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-yellow-500 text-black font-black text-[9px] flex items-center justify-center">3</span>
                    <span className="font-semibold text-yellow-300">Yellow</span>
                  </div>
                  <span className="font-mono font-bold text-white">50 min</span>
                </div>
              </div>

              {/* Sparkline Curve */}
              <div className="h-20 w-full bg-[#080E21] rounded-xl p-1 border border-slate-800">
                <div className="text-[9px] text-slate-400 font-semibold px-1">Trend by wait acuity</div>
                <ResponsiveContainer width="100%" height="80%">
                  <AreaChart data={erTrendWave} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="erGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#eab308" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="wait" stroke="#f59e0b" strokeWidth={2} fill="url(#erGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 2. Active Admission Trends Graph (Last 24 Hours) */}
          <div className="p-4 rounded-2xl bg-[#101935] border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">Active Admission Trends Graph</h4>
                <div className="text-[10px] text-slate-400">Last 24 Hours</div>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-cyan-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> Admissions
                </span>
                <span className="flex items-center gap-1 text-slate-300 font-bold">
                  <span className="w-2 h-2 rounded-full bg-slate-400" /> Discharges
                </span>
              </div>
            </div>

            <div className="h-36 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={admissionTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="admGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="disGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748B" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B1329', borderColor: '#1E293B', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="admissions" stroke="#38bdf8" strokeWidth={2.5} fill="url(#admGradient)" dot={{ r: 3, fill: '#38bdf8' }} />
                  <Area type="monotone" dataKey="discharges" stroke="#94a3b8" strokeWidth={1.5} fill="url(#disGradient)" dot={{ r: 2, fill: '#94a3b8' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Total Daily OPD Revenue */}
          <div className="p-4 rounded-2xl bg-[#101935] border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white tracking-wide">Total Daily OPD Revenue (₹)</h4>
              <span className="text-[10px] text-slate-400">Target Velocity</span>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 font-semibold">Total OPD Revenue</div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                ₹14,82,500
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-400">Daily Target: <span className="text-slate-200 font-bold">₹15,50,000</span></span>
                <span className="text-cyan-400 font-black">95.6%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: '95.6%' }} />
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-semibold text-slate-300">Source:</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Card</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Cash</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
