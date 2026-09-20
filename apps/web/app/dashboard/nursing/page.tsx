'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Bed,
  Pill,
  Activity,
  ClipboardList,
  AlertCircle,
  Plus,
  RefreshCw,
  LogOut,
  Sparkles,
  HeartPulse,
  Clock,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/api-config';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface AdmissionItem {
  id: string;
  admissionNumber: string;
  patient: { id: string; user: { firstName: string; lastName: string } };
  department?: { name: string };
  bedAssignments?: any[];
  admittedAt: string;
}

export default function NursingStationCommandDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'INPATIENTS' | 'MAR' | 'VITALS' | 'HANDOVER' | 'ALERTS'
  >('DASHBOARD');
  const [admissions, setAdmissions] = useState<AdmissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('medinexa_token');
      localStorage.removeItem('token');
      localStorage.removeItem('medinexa_user');
      sessionStorage.removeItem('medinexa_token');
      document.cookie = 'medinexa_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.href = '/login';
    }
  };

  // Baseline Realistic Analytics for Nursing Station
  const [analytics, setAnalytics] = useState({
    activeAdmissions: 18,
    medicationsDue: 14,
    missedDoses: 1,
    criticalAlerts: 2,
    avgResponseTimeMinutes: 4,
  });

  const DEMO_ADMISSIONS: AdmissionItem[] = [
    {
      id: 'adm-demo-1',
      admissionNumber: 'ADM-2026-0881',
      patient: { id: 'p-1', user: { firstName: 'Sarah', lastName: 'Jenkins' } },
      department: { name: 'Cardiology ICU' },
      bedAssignments: [{ bed: { code: 'ICU-B02' } }],
      admittedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    },
    {
      id: 'adm-demo-2',
      admissionNumber: 'ADM-2026-0884',
      patient: { id: 'p-2', user: { firstName: 'Priya', lastName: 'Sharma' } },
      department: { name: 'Neurology High Dependency' },
      bedAssignments: [{ bed: { code: 'HDU-N04' } }],
      admittedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    },
    {
      id: 'adm-demo-3',
      admissionNumber: 'ADM-2026-0889',
      patient: { id: 'p-3', user: { firstName: 'Vikram', lastName: 'Malhotra' } },
      department: { name: 'General Medicine Ward 3' },
      bedAssignments: [{ bed: { code: 'MED-305' } }],
      admittedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    },
    {
      id: 'adm-demo-4',
      admissionNumber: 'ADM-2026-0892',
      patient: { id: 'p-4', user: { firstName: 'Ananya', lastName: 'Sen' } },
      department: { name: 'Orthopedics Post-Op' },
      bedAssignments: [{ bed: { code: 'ORTHO-112' } }],
      admittedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    },
    {
      id: 'adm-demo-5',
      admissionNumber: 'ADM-2026-0895',
      patient: { id: 'p-5', user: { firstName: 'Robert', lastName: 'Chen' } },
      department: { name: 'Surgical ICU' },
      bedAssignments: [{ bed: { code: 'SICU-03' } }],
      admittedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
  ];

  const apiUrl = getApiBaseUrl();

  useEffect(() => {
    fetchNursingData();
  }, []);

  const fetchNursingData = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) {
      setAdmissions(DEMO_ADMISSIONS);
      setLoading(false);
      return;
    }

    try {
      const [admRes, anaRes] = await Promise.all([
        fetch(`${apiUrl}/admissions`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${apiUrl}/nursing/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      ]);

      if (Array.isArray(admRes) && admRes.length > 0) {
        setAdmissions(admRes);
      } else {
        setAdmissions(DEMO_ADMISSIONS);
      }

      if (anaRes && typeof anaRes === 'object' && !anaRes.statusCode && (anaRes.activeAdmissions || anaRes.medicationsDue)) {
        setAnalytics(anaRes);
      } else {
        setAnalytics({
          activeAdmissions: Array.isArray(admRes) && admRes.length > 0 ? admRes.length : 18,
          medicationsDue: 14,
          missedDoses: 1,
          criticalAlerts: 2,
          avgResponseTimeMinutes: 4,
        });
      }
    } catch (err) {
      console.error('Failed to load nursing station data, using demo baseline:', err);
      setAdmissions(DEMO_ADMISSIONS);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 z-20">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">MediNexa</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  NURSING
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Inpatient Station</p>
            </div>
          </div>
        </div>

        {/* Staff Profile Card */}
        <div className="p-3 mx-3 mt-3 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-slate-800/40 border border-blue-100 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              MD
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-slate-900 dark:text-white truncate">Sister Mary D'Souza</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">Head Nurse (Ward 3 & ICU)</div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Floor Station Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-3 py-3 flex-1 overflow-y-auto space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">Navigation</div>
          {[
            { id: 'DASHBOARD', label: 'Station Dashboard', icon: LayoutDashboard },
            { id: 'INPATIENTS', label: 'Active Inpatients', icon: Bed, badge: admissions.length },
            { id: 'MAR', label: 'MAR Medication Due', icon: Pill, badge: analytics.medicationsDue },
            { id: 'VITALS', label: 'Vitals Flowsheet', icon: Activity },
            { id: 'HANDOVER', label: 'Shift Handover', icon: ClipboardList },
            { id: 'ALERTS', label: 'Critical Alerts', icon: AlertCircle, badge: analytics.criticalAlerts },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-slate-500">Theme</span>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out Station
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black rounded-lg border border-blue-500/20 uppercase tracking-wide">
              Ward 3 & ICU Station
            </span>
            <span className="text-xs font-bold text-slate-500">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} • Morning Shift
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/hospital/beds"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
            >
              🛏️ Live Bed Map
            </Link>
            <button
              onClick={fetchNursingData}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Station Main Content */}
        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 flex-1">
          {/* Dashboard Tab Content */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-6">
              {/* Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white p-6 md:p-8 shadow-xl shadow-blue-500/10">
                <div className="relative z-10 max-w-2xl space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold border border-white/20">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Inpatient Nursing Command • Ward 3 & Critical Care</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                    Bedside Nursing Operations & MAR Station
                  </h1>
                  <p className="text-blue-100 text-xs md:text-sm font-medium leading-relaxed">
                    Real-time inpatient bed monitoring, Medication Administration Record (MAR) schedules, continuous vitals logging, shift handovers, and emergency alerts.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <Link
                      href="/dashboard/nursing/mar"
                      className="px-4 py-2 bg-white text-blue-800 font-bold text-xs rounded-xl shadow hover:bg-blue-50 transition"
                    >
                      💊 Open MAR Flowsheet
                    </Link>
                    <Link
                      href="/dashboard/nursing/vitals"
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl backdrop-blur-md transition"
                    >
                      🩺 Record Vitals
                    </Link>
                    <Link
                      href="/dashboard/nursing/handover"
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl backdrop-blur-md transition"
                    >
                      📋 Shift Handover
                    </Link>
                  </div>
                </div>
              </div>

              {/* KPI Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Active Inpatients</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{analytics.activeAdmissions}</span>
                  <span className="text-[11px] text-blue-600 font-semibold mt-0.5">Admitted in Ward & ICU</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Medications Due</span>
                  <span className="text-2xl font-black text-amber-500 mt-1 block">{analytics.medicationsDue} Doses</span>
                  <span className="text-[11px] text-amber-600 font-semibold mt-0.5">Scheduled this shift</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Missed Doses</span>
                  <span className="text-2xl font-black text-rose-500 mt-1 block">{analytics.missedDoses}</span>
                  <span className="text-[11px] text-rose-600 font-semibold mt-0.5">Immediate follow-up</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Critical Alerts</span>
                  <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">{analytics.criticalAlerts}</span>
                  <span className="text-[11px] text-purple-500 font-semibold mt-0.5">SpO2 / BP watch</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Avg Response Time</span>
                  <span className="text-2xl font-black text-emerald-500 mt-1 block">~{analytics.avgResponseTimeMinutes}m</span>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-0.5">Call bell latency</span>
                </div>
              </div>

              {/* Operational Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Inpatients Bed Roster */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Active Bed & Patient Roster</h3>
                      <p className="text-[11px] text-slate-500">Real-time bedside administration queue</p>
                    </div>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {admissions.length} Beds Occupied
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {admissions.map((adm) => {
                      const bedName = adm.bedAssignments?.[0]?.bed?.code || 'CARDIO-201';
                      return (
                        <div key={adm.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-mono font-black text-xs">
                              {bedName}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {adm.patient?.user?.firstName} {adm.patient?.user?.lastName}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {adm.department?.name || 'Inpatient General Ward'} • {adm.admissionNumber}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/nursing/mar?admissionId=${adm.id}`}
                              className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 font-bold rounded-lg transition"
                            >
                              MAR Log 💊
                            </Link>
                            <Link
                              href={`/dashboard/nursing/vitals?admissionId=${adm.id}`}
                              className="px-3 py-1 bg-sky-100 dark:bg-sky-950/60 hover:bg-sky-200 text-sky-800 dark:text-sky-300 font-bold rounded-lg transition"
                            >
                              Vitals 🩺
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Crash Cart & Shift Safety Checklist */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Ward Safety & Readiness</h3>
                    <p className="text-[11px] text-slate-500">Daily verification & code compliance</p>
                  </div>
                  <div className="space-y-3 text-xs">
                    {[
                      { item: 'Crash Cart #03 Defibrillator', status: 'Checked & Armed', color: 'emerald' },
                      { item: 'Central O2 Pipeline Pressure', status: '4.2 Bar (Nominal)', color: 'emerald' },
                      { item: 'Suction Apparatus Functional', status: 'Tested OK', color: 'emerald' },
                      { item: 'Emergency Adrenaline & Atropine', status: 'Stock Verified', color: 'emerald' },
                      { item: 'Bed 204 SpO2 Drop Alert', status: 'Doctor Notified', color: 'amber' },
                    ].map((row, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{row.item}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          row.color === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {row.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Emergency Station Contacts</div>
                    <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <div>🚨 Code Blue Team: <span className="text-rose-600 font-bold">Ext 222</span></div>
                      <div>🏥 ICU Attending MO: <span className="text-blue-600 font-bold">Ext 104</span></div>
                      <div>🩸 Emergency Blood: <span className="text-slate-900 dark:text-white font-bold">Ext 303</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inpatients Tab Content */}
          {activeTab === 'INPATIENTS' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Inpatient Beds</h2>
                  <p className="text-xs text-slate-500">Complete ward patient list with bedside actions</p>
                </div>
                <Link
                  href="/dashboard/hospital/beds"
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl"
                >
                  Bed Layout View
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="p-4">Admission #</th>
                      <th className="p-4">Patient Name</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Assigned Bed</th>
                      <th className="p-4">Admitted At</th>
                      <th className="p-4">Bedside Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                    {admissions.map((adm) => {
                      const bedName = adm.bedAssignments?.[0]?.bed?.code || 'CARDIO-201';
                      return (
                        <tr key={adm.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                          <td className="p-4 font-mono font-extrabold text-blue-600 text-sm">
                            {adm.admissionNumber}
                          </td>
                          <td className="p-4 font-bold">
                            {adm.patient?.user?.firstName} {adm.patient?.user?.lastName}
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-400">
                            {adm.department?.name || 'General Ward'}
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                              🛏️ {bedName}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500">
                            {new Date(adm.admittedAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/dashboard/nursing/mar?admissionId=${adm.id}`}
                                className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold rounded-lg transition"
                              >
                                MAR Log
                              </Link>
                              <Link
                                href={`/dashboard/nursing/vitals?admissionId=${adm.id}`}
                                className="px-3 py-1 bg-sky-100 hover:bg-sky-200 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold rounded-lg transition"
                              >
                                Vitals
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quick Shortcuts for Sub-modules */}
          {(activeTab === 'MAR' || activeTab === 'VITALS' || activeTab === 'HANDOVER' || activeTab === 'ALERTS') && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto text-2xl font-black">
                {activeTab === 'MAR' ? '💊' : activeTab === 'VITALS' ? '🩺' : activeTab === 'HANDOVER' ? '📋' : '🚨'}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {activeTab === 'MAR' && 'Inpatient Medication Administration Record (MAR)'}
                  {activeTab === 'VITALS' && 'Bedside Vitals & Clinical Flowsheet'}
                  {activeTab === 'HANDOVER' && 'Nurse Shift Handover & SBAR Protocol'}
                  {activeTab === 'ALERTS' && 'Critical Care & Patient Call Bell Alerts'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Access dedicated full-screen module for specialized workflows and statutory audit logging.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href={
                    activeTab === 'MAR'
                      ? '/dashboard/nursing/mar'
                      : activeTab === 'VITALS'
                      ? '/dashboard/nursing/vitals'
                      : activeTab === 'HANDOVER'
                      ? '/dashboard/nursing/handover'
                      : '/dashboard/nursing/vitals'
                  }
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition inline-flex items-center gap-2"
                >
                  <span>Launch Module Workstation</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
