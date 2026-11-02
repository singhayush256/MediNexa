'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertOctagon,
  Bed,
  Ambulance,
  PhoneCall,
  Activity,
  ShieldAlert,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function ManagerEmergencyPage() {
  const [emergencies, setEmergencies] = useState([
    {
      id: 'em-901',
      code: 'RED_TRAUMA',
      triageLevel: 'Level 1 (Immediate)',
      patient: 'Unknown Male (~35y, MVA)',
      location: 'Resuscitation Bay 1',
      attendingPhysician: 'Dr. Anita Desai (ER)',
      timeArrived: '10:32 AM',
      vitalStatus: 'BP 85/50 • SpO2 88% • HR 128',
      status: 'CRITICAL',
    },
    {
      id: 'em-902',
      code: 'YELLOW_ACUTE',
      triageLevel: 'Level 2 (Emergent)',
      patient: 'Harish Mehta (Chest Pain)',
      location: 'Observation Bay 3',
      attendingPhysician: 'Dr. Ayush Singh (Cardio on-call)',
      timeArrived: '10:15 AM',
      vitalStatus: 'BP 145/95 • SpO2 96% • ECG Pending',
      status: 'MONITORING',
    },
    {
      id: 'em-903',
      code: 'GREEN_URGENT',
      triageLevel: 'Level 3 (Urgent)',
      patient: 'Meera Rao (Sprain / Laceration)',
      location: 'Triage Room 2',
      attendingPhysician: 'Duty Medical Officer',
      timeArrived: '09:50 AM',
      vitalStatus: 'Stable',
      status: 'STABLE',
    },
  ]);

  const [ambulances, setAmbulances] = useState([
    { id: 'amb-01', unit: 'ALS Unit 1 (Cardiac)', driver: 'Suresh Kumar', status: 'IN_TRANSIT', eta: '6 mins', dest: 'ETA Hospital A Bay' },
    { id: 'amb-02', unit: 'BLS Unit 2 (General)', driver: 'Ramesh Yadav', status: 'AVAILABLE', eta: '--', dest: 'Base Station Ready' },
    { id: 'amb-03', unit: 'ALS Unit 3 (Pediatric)', driver: 'Vikram Singh', status: 'ON_SCENE', eta: '18 mins', dest: 'En route with Trauma' },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Emergency Operations Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Emergency Operations & Rapid Escalation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Realtime trauma triage, emergency resuscitation bays, ambulance dispatch coordinates, and code alerts.
          </p>
        </div>

        <Link
          href="/dashboard/manager/alerts"
          className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-md shadow-teal-600/20"
        >
          Operational Escalations →
        </Link>
      </div>

      {/* 4 Emergency KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-xs">
          <div className="text-xs font-bold text-rose-600 dark:text-rose-400">Level 1 Trauma (Red)</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            1 Case
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Resuscitation Bay Armed</div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Emergency Beds Free</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            4 / 8 Beds
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">50% capacity available</div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Inbound Ambulances</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            2 En Route
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Next arrival: ETA 6 mins</div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-500">ER Doctor Response</div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
            &lt; 3 mins
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Trauma team armed</div>
        </div>
      </div>

      {/* Active Emergency Trauma Cases */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-600" />
          <span>Active Emergency Cases & Resuscitation Bays</span>
        </h2>

        <div className="space-y-3">
          {emergencies.map((em) => (
            <div
              key={em.id}
              className={`p-4 rounded-2xl border transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                em.status === 'CRITICAL'
                  ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900'
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${
                      em.status === 'CRITICAL'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {em.triageLevel}
                  </span>
                  <span className="font-mono text-xs font-bold text-teal-600">{em.id}</span>
                  <span className="text-xs font-semibold text-slate-500">• {em.location}</span>
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {em.patient}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Attending: <span className="font-semibold text-slate-700 dark:text-slate-200">{em.attendingPhysician}</span> • Arrived: {em.timeArrived}
                </div>
                <div className="text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400">
                  {em.vitalStatus}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <Link
                  href="/dashboard/manager/beds?ward=emergency"
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition"
                >
                  Reserve Bed
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ambulance Dispatch Tracking */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Ambulance className="w-4 h-4 text-teal-600" />
          <span>Emergency Ambulance Fleet Tracking</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ambulances.map((amb) => (
            <div
              key={amb.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                  {amb.unit}
                </span>
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                    amb.status === 'IN_TRANSIT'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 animate-pulse'
                      : amb.status === 'AVAILABLE'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {amb.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Driver: <span className="font-semibold text-slate-700 dark:text-slate-300">{amb.driver}</span>
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {amb.dest}
              </div>
              {amb.eta !== '--' && (
                <div className="text-xs font-mono font-bold text-rose-600">
                  ETA: {amb.eta}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
