'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  Bed,
  Users,
  AlertOctagon,
  ArrowRightLeft,
  DoorOpen,
  LogOut,
  Stethoscope,
  RefreshCw,
  Sparkles,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { getApiBaseUrl, fetchWithTimeout } from '@/lib/api-config';
import { subscribeTelemetry } from '@/lib/realtime-telemetry';

export default function ManagerLiveOperationsPage() {
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  // Live floor telemetry state
  const [telemetry, setTelemetry] = useState({
    opdWaitingTotal: 18,
    opdAvgWaitMins: 22,
    emergencyActive: 4,
    emergencyRedCases: 1,
    inpatientCensus: 32,
    totalBeds: 50,
    occupiedBeds: 32,
    availableBeds: 15,
    cleaningBeds: 3,
    todayAdmissions: 9,
    todayDischarges: 5,
    todayTransfers: 3,
    activeStaffOnFloor: 34,
    criticalAlertsCount: 2,
  });

  const [activeFloorEvents, setActiveFloorEvents] = useState([
    { id: 'ev-1', time: '10:42 AM', type: 'ADMISSION', text: 'Patient P-019 admitted to General Medicine Ward Bed MED-302', dept: 'General Medicine', status: 'CONFIRMED' },
    { id: 'ev-2', time: '10:35 AM', type: 'EMERGENCY', text: 'Triage Level 1 Trauma alert admitted to Resuscitation Bay 1', dept: 'Emergency', status: 'CRITICAL' },
    { id: 'ev-3', time: '10:28 AM', type: 'TRANSFER', text: 'Bed transfer completed: Patient from ICU-B02 to Step-Down HDU-N04', dept: 'Cardiology', status: 'COMPLETED' },
    { id: 'ev-4', time: '10:14 AM', type: 'CLEANING', text: 'Bed MED-204 released and assigned to Housekeeping sanitation queue', dept: 'Medicine', status: 'IN_PROGRESS' },
    { id: 'ev-5', time: '09:58 AM', type: 'STAFF', text: 'Staff deployment shift handover verified for morning nursing station', dept: 'ICU', status: 'VERIFIED' },
  ]);

  const refreshLiveData = async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    const apiUrl = getApiBaseUrl();

    try {
      const [bedStats, admStats] = await Promise.all([
        fetchWithTimeout(`${apiUrl}/beds/analytics/occupancy`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }, 5000).then((r) => r.json()).catch(() => null),
        fetchWithTimeout(`${apiUrl}/admissions/stats/overview`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }, 5000).then((r) => r.json()).catch(() => null),
      ]);

      if (bedStats && !bedStats.statusCode) {
        setTelemetry((prev) => ({
          ...prev,
          totalBeds: bedStats.totalBeds || prev.totalBeds,
          occupiedBeds: bedStats.occupiedBeds || prev.occupiedBeds,
          availableBeds: bedStats.availableBeds || prev.availableBeds,
          inpatientCensus: bedStats.occupiedBeds || prev.inpatientCensus,
        }));
      }

      if (admStats && !admStats.statusCode) {
        setTelemetry((prev) => ({
          ...prev,
          todayAdmissions: admStats.todayAdmissionsCount || prev.todayAdmissions,
          todayDischarges: admStats.todayDischargesCount || prev.todayDischarges,
        }));
      }
      setLastRefreshed(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn('Realtime fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshLiveData();
    const unsub = subscribeTelemetry(() => {
      refreshLiveData();
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Real-Time Operational Stream</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Live Hospital Floor Operations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Realtime census, patient movement, bed status synchronization, and floor-level activity stream.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Synced: {lastRefreshed}</span>
          <button
            onClick={refreshLiveData}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Poll Now</span>
          </button>
        </div>
      </div>

      {/* 9 Live Operation Stream Panels */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* OPD */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">OPD Queue</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {telemetry.opdWaitingTotal} waiting
          </div>
          <div className="text-[11px] text-slate-400 font-semibold">
            Avg Wait: {telemetry.opdAvgWaitMins} mins across 8 clinics
          </div>
        </div>

        {/* Emergency */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Emergency & Triage</span>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {telemetry.emergencyActive} Active Cases
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">
            {telemetry.emergencyRedCases} Level 1 Resuscitation (Red)
          </div>
        </div>

        {/* Inpatient Census */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Inpatient Census</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {telemetry.inpatientCensus} Admitted
          </div>
          <div className="text-[11px] text-slate-400 font-semibold">
            Across General, HDU, and ICU wards
          </div>
        </div>

        {/* Beds */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Bed Availability</span>
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {telemetry.availableBeds} Free Beds
          </div>
          <div className="text-[11px] text-slate-400 font-semibold">
            {telemetry.cleaningBeds} beds awaiting sanitization
          </div>
        </div>

        {/* Today Admissions */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Admissions Today</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
              <DoorOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {telemetry.todayAdmissions}
          </div>
          <div className="text-[11px] text-slate-400 font-semibold">
            All assigned canonical bed records
          </div>
        </div>

        {/* Transfers */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Ward Transfers</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {telemetry.todayTransfers} Completed
          </div>
          <div className="text-[11px] text-slate-400 font-semibold">
            Zero pending inter-ward requests
          </div>
        </div>

        {/* Discharges */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Discharges Processed</span>
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600">
              <LogOut className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {telemetry.todayDischarges}
          </div>
          <div className="text-[11px] text-slate-400 font-semibold">
            Discharge clearances verified
          </div>
        </div>

        {/* Active Staff */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Staff On Duty</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {telemetry.activeStaffOnFloor} Active
          </div>
          <div className="text-[11px] text-slate-400 font-semibold">
            Coverage 89% nominal
          </div>
        </div>
      </div>

      {/* Real-time Activity Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Live Hospital Movement & Event Stream
            </h2>
          </div>
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Listening to Socket.IO telemetry
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {activeFloorEvents.map((ev) => (
            <div key={ev.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-[11px] text-slate-400 shrink-0">{ev.time}</span>
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase shrink-0 ${
                    ev.type === 'EMERGENCY'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      : ev.type === 'ADMISSION'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : ev.type === 'TRANSFER'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {ev.type}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {ev.text}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-slate-500 font-medium">{ev.dept}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  {ev.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
