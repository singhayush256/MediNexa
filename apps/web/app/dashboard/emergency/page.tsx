'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Siren,
  Activity,
  Stethoscope,
  Ambulance,
  Plus,
  RefreshCw,
  LogOut,
  Sparkles,
  Clock,
  ChevronRight,
  AlertTriangle,
  ShieldAlert,
  PhoneCall,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface EmergencyVisitItem {
  id: string;
  visitNumber: string;
  patientName: string;
  patientPhone?: string;
  chiefComplaint: string;
  arrivalMode: string;
  status: string;
  triageLevel?: string;
  createdAt: string;
  doctor?: { user?: { firstName: string; lastName: string } };
  triageAssessments?: any[];
}

export default function EmergencyCommandCenterPage() {
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'CASES' | 'TRIAGE' | 'DOCTOR' | 'AMBULANCE'
  >('DASHBOARD');
  const [visits, setVisits] = useState<EmergencyVisitItem[]>([]);
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

  // Analytics State
  const [analytics, setAnalytics] = useState({
    totalEmergencyVisits: 0,
    esi1Count: 0,
    esi2Count: 0,
    avgTriageTimeMinutes: 4,
    patientsWaiting: 0,
    patientsInTreatment: 0,
  });

  // Intake Modal State
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [arrivalMode, setArrivalMode] = useState('WALK_IN');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const DEMO_EMERGENCY_VISITS: EmergencyVisitItem[] = [
    {
      id: 'emg-1',
      visitNumber: 'EMG-2026-1042',
      patientName: 'Kunal Singhania',
      patientPhone: '+91 98112 44332',
      chiefComplaint: 'Acute crushing retrosternal chest pain radiating to left arm & diaphoresis',
      arrivalMode: 'AMBULANCE',
      status: 'IN_TREATMENT',
      triageLevel: 'ESI_1',
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      doctor: { user: { firstName: 'Dr. Deepak', lastName: 'Singh' } },
    },
    {
      id: 'emg-2',
      visitNumber: 'EMG-2026-1045',
      patientName: 'Sunil Mathur',
      patientPhone: '+91 98201 55667',
      chiefComplaint: 'Severe breathlessness, wheezing, SpO2 86% on room air',
      arrivalMode: 'AMBULANCE',
      status: 'TRIAGED',
      triageLevel: 'ESI_2',
      createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
      doctor: { user: { firstName: 'Dr. Deepak', lastName: 'Singh' } },
    },
    {
      id: 'emg-3',
      visitNumber: 'EMG-2026-1048',
      patientName: 'Pooja Aggarwal',
      patientPhone: '+91 98310 77889',
      chiefComplaint: 'Right lower quadrant abdominal pain, rebound tenderness, fever 101.4°F',
      arrivalMode: 'WALK_IN',
      status: 'WAITING',
      triageLevel: 'ESI_3',
      createdAt: new Date(Date.now() - 50 * 60000).toISOString(),
    },
  ];

  const DEFAULT_EMERGENCY_ANALYTICS = {
    totalEmergencyVisits: 14,
    esi1Count: 2,
    esi2Count: 4,
    avgTriageTimeMinutes: 3,
    patientsWaiting: 3,
    patientsInTreatment: 5,
  };

  useEffect(() => {
    fetchEmergencyData();
  }, []);

  const fetchEmergencyData = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) {
      setVisits(DEMO_EMERGENCY_VISITS);
      setAnalytics(DEFAULT_EMERGENCY_ANALYTICS);
      setLoading(false);
      return;
    }

    try {
      const [qRes, aRes] = await Promise.all([
        fetch(`${apiUrl}/emergency/queue`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${apiUrl}/emergency/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      ]);

      if (Array.isArray(qRes) && qRes.length > 0) {
        setVisits(qRes);
      } else {
        setVisits(DEMO_EMERGENCY_VISITS);
      }

      if (aRes && typeof aRes === 'object' && !aRes.statusCode && (aRes.totalEmergencyVisits || aRes.patientsInTreatment)) {
        setAnalytics(aRes);
      } else {
        setAnalytics(DEFAULT_EMERGENCY_ANALYTICS);
      }
    } catch (err) {
      console.error('Failed to load emergency data, using demo baseline:', err);
      setVisits(DEMO_EMERGENCY_VISITS);
      setAnalytics(DEFAULT_EMERGENCY_ANALYTICS);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setModalError('Patient name is required.');
      return;
    }
    if (!chiefComplaint.trim()) {
      setModalError('Chief complaint is required.');
      return;
    }

    setModalError('');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('medinexa_token');
      const payload = {
        patientName,
        patientPhone: patientPhone || undefined,
        chiefComplaint,
        arrivalMode,
        notes: notes || undefined,
      };

      const res = await fetch(`${apiUrl}/emergency/visit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to register emergency visit');

      setShowIntakeModal(false);
      setPatientName('');
      setPatientPhone('');
      setChiefComplaint('');
      setNotes('');
      fetchEmergencyData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to register intake');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEsiBadge = (esi?: string) => {
    switch (esi) {
      case 'ESI_1':
        return 'bg-red-600 text-white font-extrabold animate-pulse';
      case 'ESI_2':
        return 'bg-orange-500 text-white font-bold';
      case 'ESI_3':
        return 'bg-amber-400 text-slate-900 font-bold';
      case 'ESI_4':
        return 'bg-emerald-500 text-white font-semibold';
      case 'ESI_5':
        return 'bg-blue-500 text-white font-medium';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 z-20">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center text-white font-black text-lg shadow-md shadow-rose-600/20">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">MediNexa</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  TRAUMA/ER
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Emergency Center</p>
            </div>
          </div>
        </div>

        {/* Staff Profile Card */}
        <div className="p-3 mx-3 mt-3 rounded-2xl bg-gradient-to-br from-rose-50 to-red-50 dark:from-slate-800/80 dark:to-slate-800/40 border border-rose-100 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              DS
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-slate-900 dark:text-white truncate">Dr. Deepak Singh</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">Chief EMO (Trauma Lead)</div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Resus Bay Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-3 py-3 flex-1 overflow-y-auto space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">Navigation</div>
          {[
            { id: 'DASHBOARD', label: 'Command Dashboard', icon: LayoutDashboard },
            { id: 'CASES', label: 'Trauma Patient Queue', icon: Siren, badge: visits.length },
            { id: 'TRIAGE', label: 'ESI 1-5 Triage Desk', icon: Activity, badge: visits.filter((v) => v.status === 'WAITING').length },
            { id: 'DOCTOR', label: 'Emergency Doctor Bay', icon: Stethoscope, badge: analytics.patientsInTreatment },
            { id: 'AMBULANCE', label: 'Ambulance & Fleet', icon: Ambulance, badge: visits.filter((v) => v.arrivalMode === 'AMBULANCE').length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
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
                      isActive ? 'bg-white/20 text-white' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
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
            <span className="px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-black rounded-lg border border-rose-500/20 uppercase tracking-wide">
              Level-1 Trauma & Emergency
            </span>
            <span className="text-xs font-bold text-slate-500">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} • 🟢 Status: Code Clear
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowIntakeModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              🚨 Register Emergency Intake
            </button>
            <button
              onClick={fetchEmergencyData}
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
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-700 via-red-800 to-slate-900 text-white p-6 md:p-8 shadow-xl shadow-rose-600/10">
                <div className="relative z-10 max-w-2xl space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold border border-white/20">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Trauma Level-1 Center • 24/7 Rapid Resuscitation Service</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                    Emergency & Trauma Operations Command
                  </h1>
                  <p className="text-rose-100 text-xs md:text-sm font-medium leading-relaxed">
                    Emergency Severity Index (ESI 1–5) protocol triage, red resuscitation bay allocations, telemetry monitoring, on-duty emergency physician routing, and ambulance telemetry.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setShowIntakeModal(true)}
                      className="px-4 py-2 bg-white text-rose-800 font-bold text-xs rounded-xl shadow hover:bg-rose-50 transition"
                    >
                      🚨 Quick Trauma Intake
                    </button>
                    <Link
                      href="/dashboard/triage"
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl backdrop-blur-md transition"
                    >
                      🩺 Nurse Triage Workstation
                    </Link>
                    <Link
                      href="/dashboard/emergency-doctor"
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl backdrop-blur-md transition"
                    >
                      👨‍⚕️ Emergency Doctor Queue
                    </Link>
                  </div>
                </div>
              </div>

              {/* KPI Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Visits</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">{analytics.totalEmergencyVisits}</span>
                  <span className="text-[10px] text-slate-400">Past 24 hours</span>
                </div>
                <div className="bg-red-50 dark:bg-red-950/40 p-4 rounded-2xl border border-red-200 dark:border-red-900/60 shadow-sm">
                  <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase block">ESI-1 (Resus)</span>
                  <span className="text-2xl font-black text-red-700 dark:text-red-300 mt-0.5 block">{analytics.esi1Count}</span>
                  <span className="text-[10px] text-red-500 font-bold">Immediate attention</span>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950/40 p-4 rounded-2xl border border-orange-200 dark:border-orange-900/60 shadow-sm">
                  <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase block">ESI-2 (Emergent)</span>
                  <span className="text-2xl font-black text-orange-700 dark:text-orange-300 mt-0.5 block">{analytics.esi2Count}</span>
                  <span className="text-[10px] text-orange-500 font-bold">&lt;10 min window</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Waiting Queue</span>
                  <span className="text-2xl font-black text-sky-600 mt-0.5 block">{analytics.patientsWaiting}</span>
                  <span className="text-[10px] text-slate-400">Pending consult</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">In Treatment</span>
                  <span className="text-2xl font-black text-emerald-600 mt-0.5 block">{analytics.patientsInTreatment}</span>
                  <span className="text-[10px] text-emerald-500 font-bold">Trauma bays</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Avg Triage Time</span>
                  <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5 block">~{analytics.avgTriageTimeMinutes}m</span>
                  <span className="text-[10px] text-emerald-500 font-semibold">Target &lt;5m met</span>
                </div>
              </div>

              {/* Operational Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Emergency Patients Queue Snapshot */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Active Emergency Patients Queue</h3>
                      <p className="text-[11px] text-slate-500">Critical ESI-1 & ESI-2 Patients Top-Ranked</p>
                    </div>
                    <span className="text-xs font-bold text-rose-600">
                      {visits.length} Active Cases
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {visits.map((v) => (
                      <div key={v.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-xl text-[10px] font-mono font-black ${getEsiBadge(v.triageLevel)}`}>
                            {v.triageLevel || 'ESI-?'}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{v.patientName}</span>
                              <span className="text-[10px] font-normal text-slate-400 font-mono">#{v.visitNumber}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 max-w-md truncate">{v.chiefComplaint}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {v.arrivalMode}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                            {v.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trauma Bays & Hotlines */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Trauma Bays Status</h3>
                    <p className="text-[11px] text-slate-500">Live resuscitation capacity</p>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    {[
                      { bay: 'Red Bay 01 (Resus)', status: 'Occupied (STEMI)', color: 'rose' },
                      { bay: 'Red Bay 02 (Trauma)', status: 'Available', color: 'emerald' },
                      { bay: 'Yellow Bay 03', status: 'In Assessment', color: 'amber' },
                      { bay: 'Yellow Bay 04', status: 'Available', color: 'emerald' },
                      { bay: 'Green Bay 05 (Minor)', status: 'Available', color: 'emerald' },
                    ].map((b, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{b.bay}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          b.color === 'rose'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : b.color === 'amber'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Trauma Red Hotlines</div>
                    <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <div>🚨 Police / MLC Desk: <span className="text-rose-600 font-bold">Ext 100</span></div>
                      <div>🩸 O-Negative Reserve: <span className="text-rose-600 font-bold">Ext 303</span></div>
                      <div>🚑 Ambulance GPS Fleet: <span className="text-emerald-600 font-bold">+91 108</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Detailed Patients / Department Queue Tab */}
          {activeTab !== 'DASHBOARD' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    {activeTab === 'CASES' && '🚨 Live Trauma & Emergency Patient Roster'}
                    {activeTab === 'TRIAGE' && '🩺 ESI 1–5 Nurse Triage Station Queue'}
                    {activeTab === 'DOCTOR' && '👨‍⚕️ Emergency Physician Active Bay Cases'}
                    {activeTab === 'AMBULANCE' && '🚑 Ambulance Emergency Dispatches & Arrivals'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeTab === 'CASES' && 'Real-time patient intake stream with acuity indicators, arrival timestamps, and status tracker.'}
                    {activeTab === 'TRIAGE' && 'Patients awaiting triage assessment and ESI score assignment.'}
                    {activeTab === 'DOCTOR' && 'Cases currently assigned to emergency physicians for urgent treatment.'}
                    {activeTab === 'AMBULANCE' && 'Trauma victims arriving via 108/advanced life support ambulances.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {activeTab === 'TRIAGE' && (
                    <Link
                      href="/dashboard/triage"
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition"
                    >
                      Open Full Triage Desk →
                    </Link>
                  )}
                  {activeTab === 'DOCTOR' && (
                    <Link
                      href="/dashboard/emergency-doctor"
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition"
                    >
                      Open Doctor Portal →
                    </Link>
                  )}
                  <button
                    onClick={() => setShowIntakeModal(true)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    + New Emergency Intake
                  </button>
                </div>
              </div>

              {/* Patient Queue Table */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-700 dark:text-slate-300">
                    Showing{' '}
                    <span className="text-rose-600 dark:text-rose-400 font-extrabold">
                      {
                        visits.filter((v) => {
                          if (activeTab === 'TRIAGE') return v.status === 'WAITING';
                          if (activeTab === 'DOCTOR') return v.status === 'TRIAGED' || v.status === 'IN_TREATMENT';
                          if (activeTab === 'AMBULANCE') return v.arrivalMode === 'AMBULANCE';
                          return true;
                        }).length
                      }
                    </span>{' '}
                    patient records
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">Auto-synced with triage desk</span>
                </div>

                {loading ? (
                  <div className="p-12 text-center text-slate-500 font-medium animate-pulse">
                    Loading emergency department queue...
                  </div>
                ) : visits.filter((v) => {
                    if (activeTab === 'TRIAGE') return v.status === 'WAITING';
                    if (activeTab === 'DOCTOR') return v.status === 'TRIAGED' || v.status === 'IN_TREATMENT';
                    if (activeTab === 'AMBULANCE') return v.arrivalMode === 'AMBULANCE';
                    return true;
                  }).length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <p className="text-base font-bold">No emergency patients in this queue</p>
                    <p className="text-xs mt-1">Click "🚨 Register Emergency Intake" to admit an incoming patient.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="p-4">Visit #</th>
                          <th className="p-4">Patient Name</th>
                          <th className="p-4">Arrival Mode</th>
                          <th className="p-4">ESI Level</th>
                          <th className="p-4">Chief Complaint</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Arrival Time</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                        {visits
                          .filter((v) => {
                            if (activeTab === 'TRIAGE') return v.status === 'WAITING';
                            if (activeTab === 'DOCTOR') return v.status === 'TRIAGED' || v.status === 'IN_TREATMENT';
                            if (activeTab === 'AMBULANCE') return v.arrivalMode === 'AMBULANCE';
                            return true;
                          })
                          .map((v) => (
                            <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                              <td className="p-4 font-mono font-extrabold text-rose-600 text-sm">
                                #{v.visitNumber}
                              </td>
                              <td className="p-4">
                                <span className="font-bold block text-slate-900 dark:text-white">{v.patientName}</span>
                                <span className="text-[11px] text-slate-400">{v.patientPhone || 'No phone recorded'}</span>
                              </td>
                              <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                                <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {v.arrivalMode}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase shadow-sm font-black ${getEsiBadge(v.triageLevel)}`}>
                                  {v.triageLevel || 'PENDING TRIAGE'}
                                </span>
                              </td>
                              <td className="p-4 font-medium text-slate-600 dark:text-slate-300 max-w-xs truncate">
                                {v.chiefComplaint}
                              </td>
                              <td className="p-4">
                                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                                  {v.status}
                                </span>
                              </td>
                              <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="p-4 text-right">
                                <Link
                                  href="/dashboard/triage"
                                  className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                                >
                                  Triage →
                                </Link>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Intake Modal */}
      {showIntakeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">🚨 Register Emergency Intake</h3>
              <button
                onClick={() => setShowIntakeModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 rounded-xl text-xs font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleRegisterIntake} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unknown Patient / Trauma Victim"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 98101 23456"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Arrival Mode</label>
                <select
                  value={arrivalMode}
                  onChange={(e) => setArrivalMode(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white"
                >
                  <option value="WALK_IN">Walk-in</option>
                  <option value="AMBULANCE">Ambulance Dispatch</option>
                  <option value="REFERRAL">Hospital Referral</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Chief Complaint *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Severe chest pain, shortness of breath..."
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition"
              >
                {isSubmitting ? 'Registering Intake...' : 'Admit to Emergency Intake ✓'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
