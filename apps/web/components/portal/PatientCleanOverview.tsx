'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Calendar,
  Clock,
  Pill,
  FileText,
  Activity,
  HeartPulse,
  Download,
  CheckCircle2,
  Phone,
  Shield,
  Filter,
  User,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const telemetryVitalsData = [
  { time: '09:00', pulse: 68, bpSys: 118 },
  { time: '10:00', pulse: 72, bpSys: 120 },
  { time: '12:00', pulse: 78, bpSys: 128 },
  { time: '13:00', pulse: 82, bpSys: 125 },
  { time: '16:00', pulse: 74, bpSys: 120 },
  { time: '17:00', pulse: 70, bpSys: 119 },
  { time: '18:00', pulse: 84, bpSys: 130 },
  { time: '19:00', pulse: 73, bpSys: 121 },
  { time: '20:00', pulse: 72, bpSys: 120 },
];

export function PatientCleanOverview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedIn, setCheckedIn] = useState(false);
  const [refillStatus, setRefillStatus] = useState<Record<string, boolean>>({});

  const handleRefill = (medName: string) => {
    setRefillStatus((prev) => ({ ...prev, [medName]: true }));
    setTimeout(() => {
      alert(`Refill request for ${medName} submitted to Central Pharmacy.`);
    }, 150);
  };

  const handleDownloadReport = (testName: string) => {
    alert(`Downloading verified NABL digital report for: ${testName} (PDF)`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Bar: Title & Search & Profile Header Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            Good Morning, Aarav Sharma!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Your health overview is below
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* User Profile Card in Top Right */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs overflow-hidden shrink-0">
              <span className="font-bold">AS</span>
            </div>
            <div className="text-[11px] leading-tight">
              <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                Aarav Sharma
                <span className="text-[10px] font-normal text-slate-500">Male, 42</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400 font-mono text-[10px] mt-0.5">
                UHID: MEDI-DEL-001092
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-[10px]">
                DOB: 14 Oct 1981 • Blood: <span className="font-bold text-rose-600">B+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2x2 Primary Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Upcoming Outpatient Consultation */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              Upcoming Outpatient Consultation
            </h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Confirmed
            </span>
          </div>

          <div className="flex items-center gap-3.5 pt-1">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 text-blue-700 dark:text-blue-300 font-black flex items-center justify-center shrink-0">
              AD
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                Dr. Arvind Deshmukh
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Chief Cardiologist
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mt-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold">Today, 11:30 AM (Room 204)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setCheckedIn(true)}
              disabled={checkedIn}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                checkedIn
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0F172A] hover:bg-slate-800 text-white shadow-xs'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{checkedIn ? 'Checked In' : 'Check-in Now'}</span>
            </button>
            <Link
              href="/portal/appointments"
              className="py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-center transition"
            >
              View Details
            </Link>
          </div>
        </div>

        {/* Card 2: Live Telemetry Vitals Graph */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              Live Telemetry Vitals
            </h2>
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Telemetry Stream
            </div>
          </div>

          {/* 3 Metric Pills */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Blood Pressure</div>
              <div className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">
                120/80 <span className="text-[10px] font-normal text-slate-500">mmHg</span>
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Normal, 09:30 AM
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Pulse</div>
              <div className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">
                72 <span className="text-[10px] font-normal text-slate-500">bpm</span>
              </div>
              <div className="text-[10px] text-amber-500 font-bold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Normal
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">SpO2</div>
              <div className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">
                98%
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Normal
              </div>
            </div>
          </div>

          {/* Smooth Dual-Spline Curve Chart (Recharts) */}
          <div className="h-24 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryVitalsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis domain={[50, 140]} stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '11px', color: '#fff' }}
                />
                <Line type="monotone" dataKey="pulse" stroke="#10b981" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="bpSys" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: Active Electronic Prescriptions */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              Active Electronic Prescriptions
            </h2>
            <Link
              href="/portal/prescriptions"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Filter <Filter className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {/* Med 1: Telma 40 */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Telma 40 <span className="font-normal text-slate-500">(1 tab OD)</span>
                  </h4>
                  <p className="text-[10px] text-slate-500">Dr. A. Deshmukh • Valid till 28 May 2026</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRefill('Telma 40')}
                  disabled={refillStatus['Telma 40']}
                  className="px-3 py-1 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  {refillStatus['Telma 40'] ? 'Requested' : 'Refill'}
                </button>
                <Link
                  href="/portal/prescriptions"
                  className="px-3 py-1 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  View
                </Link>
              </div>
            </div>

            {/* Med 2: Atorva 20 */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Atorva 20 <span className="font-normal text-slate-500">(1 tab HS)</span>
                  </h4>
                  <p className="text-[10px] text-slate-500">Cardiology Maintenance</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRefill('Atorva 20')}
                  disabled={refillStatus['Atorva 20']}
                  className="px-3 py-1 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  {refillStatus['Atorva 20'] ? 'Requested' : 'Refill'}
                </button>
                <Link
                  href="/portal/prescriptions"
                  className="px-3 py-1 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  View
                </Link>
              </div>
            </div>

            {/* Med 3: Pan 40 */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Pan 40 <span className="font-normal text-slate-500">(1 tab OD)</span>
                  </h4>
                  <p className="text-[10px] text-slate-500">Morning Empty Stomach</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRefill('Pan 40')}
                  disabled={refillStatus['Pan 40']}
                  className="px-3 py-1 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  {refillStatus['Pan 40'] ? 'Requested' : 'Refill'}
                </button>
                <Link
                  href="/portal/prescriptions"
                  className="px-3 py-1 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Diagnostic Reports (NABL Verified) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              Diagnostic Reports (NABL Verified)
            </h2>
            <Link
              href="/portal/lab-reports"
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {/* Report 1: Complete Blood Count */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Complete Blood Count
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                    <span>22 May 2026</span>
                    <span className="px-1.5 py-0.2 rounded-sm bg-amber-500/10 text-amber-600 font-bold border border-amber-400/30">
                      ✓ Verified
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDownloadReport('Complete Blood Count (CBC)')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0F172A] hover:bg-slate-800 text-white transition cursor-pointer shrink-0"
              >
                Download Report PDF
              </button>
            </div>

            {/* Report 2: Lipid Profile */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Lipid Profile
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                    <span>18 May 2026</span>
                    <span className="px-1.5 py-0.2 rounded-sm bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-400/30">
                      ✓ Verified
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDownloadReport('Lipid Profile Panel')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0F172A] hover:bg-slate-800 text-white transition cursor-pointer shrink-0"
              >
                Download Report PDF
              </button>
            </div>

            {/* Report 3: ECG */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    ECG
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                    <span>14 May 2026</span>
                    <span className="px-1.5 py-0.2 rounded-sm bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-400/30">
                      ✓ Verified
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDownloadReport('12-Lead Electrocardiogram')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0F172A] hover:bg-slate-800 text-white transition cursor-pointer shrink-0"
              >
                Download Report PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Strip & Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-3 py-2 bg-slate-100/60 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2 font-semibold">
          <span>Emergency contacts</span>
          <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 font-bold border border-rose-200">
            🚨 102
          </span>
          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 font-bold border border-blue-200">
            📞 112
          </span>
        </div>
        <div className="text-[11px]">
          MediNexa Details | Patient modern healthcare design
        </div>
      </div>
    </div>
  );
}
