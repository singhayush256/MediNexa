'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  Building2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface OpdQueueRow {
  department: string;
  code: string;
  waitingPatients: number;
  averageWaitMins: number;
  doctorsActive: number;
  consultationsCompletedToday: number;
  status: 'CONGESTED' | 'MODERATE' | 'SMOOTH';
  recommendedAction?: string;
}

export default function ManagerOpdQueuePage() {
  const [queues, setQueues] = useState<OpdQueueRow[]>([
    {
      department: 'Cardiology Clinic',
      code: 'CARDIO',
      waitingPatients: 14,
      averageWaitMins: 38,
      doctorsActive: 2,
      consultationsCompletedToday: 24,
      status: 'CONGESTED',
      recommendedAction: 'Open overflow examination room 204 to relieve waiting lobby',
    },
    {
      department: 'General Medicine Clinic',
      code: 'GEN-MED',
      waitingPatients: 18,
      averageWaitMins: 22,
      doctorsActive: 4,
      consultationsCompletedToday: 38,
      status: 'MODERATE',
    },
    {
      department: 'Orthopedics & Fracture Clinic',
      code: 'ORTHO',
      waitingPatients: 8,
      averageWaitMins: 16,
      doctorsActive: 2,
      consultationsCompletedToday: 18,
      status: 'SMOOTH',
    },
    {
      department: 'Neurology Specialty Clinic',
      code: 'NEURO',
      waitingPatients: 6,
      averageWaitMins: 25,
      doctorsActive: 2,
      consultationsCompletedToday: 12,
      status: 'MODERATE',
    },
    {
      department: 'Pediatrics Clinic',
      code: 'PED',
      waitingPatients: 9,
      averageWaitMins: 14,
      doctorsActive: 3,
      consultationsCompletedToday: 22,
      status: 'SMOOTH',
    },
  ]);

  const [triageActionSent, setTriageActionSent] = useState<string | null>(null);

  const handleDispatchTriage = (dept: string) => {
    setTriageActionSent(
      `Dispatched triage support assistance to ${dept}. Reception and doctor station notified.`
    );
    setTimeout(() => setTriageActionSent(null), 5000);
  };

  const totalWaiting = queues.reduce((acc, q) => acc + q.waitingPatients, 0);
  const activeDoctors = queues.reduce((acc, q) => acc + q.doctorsActive, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Outpatient Operational Coordination</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            OPD & Outpatient Queue Coordination
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Realtime monitoring of outpatient waiting volumes, doctor coverage, bottlenecks, and triage flow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/manager/live-operations"
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-md shadow-purple-600/20"
          >
            Floor Telemetry →
          </Link>
        </div>
      </div>

      {/* Action Notification */}
      {triageActionSent && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{triageActionSent}</span>
          </div>
          <button onClick={() => setTriageActionSent(null)} className="text-xs font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Total Patients in Queue</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalWaiting} Patients
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Waiting across all OPD consultation rooms</div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Doctors Actively Consulting</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {activeDoctors} On Duty
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Average consultations/hr: 18</div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Facility Average Wait</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            23 mins
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Target SLA: &lt; 25 mins</div>
        </div>
      </div>

      {/* OPD Queue Table conforming to Section 21 */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-600" />
            <span>Departmental Queue Breakdown</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Department Clinic</th>
                <th className="py-3 px-4 text-center">Waiting Patients</th>
                <th className="py-3 px-4 text-center">Average Wait</th>
                <th className="py-3 px-4 text-center">Active Doctors</th>
                <th className="py-3 px-4 text-center">Completed Today</th>
                <th className="py-3 px-4">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {queues.map((q) => (
                <tr
                  key={q.code}
                  className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition ${
                    q.status === 'CONGESTED' ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900 dark:text-white">
                      {q.department}
                    </div>
                    <div className="text-[10px] font-mono text-purple-600 font-bold">{q.code}</div>
                    {q.recommendedAction && (
                      <div className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold mt-0.5">
                        ⚠️ {q.recommendedAction}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-black text-slate-900 dark:text-white">
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        q.status === 'CONGESTED'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {q.waitingPatients} waiting
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold">
                    <span className={q.averageWaitMins > 30 ? 'text-rose-600 font-black' : 'text-slate-700 dark:text-slate-300'}>
                      {q.averageWaitMins} mins
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-black text-emerald-600 dark:text-emerald-400">
                    {q.doctorsActive} Doctors
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-400 font-semibold">
                    {q.consultationsCompletedToday} done
                  </td>
                  <td className="py-3.5 px-4">
                    {q.status === 'CONGESTED' ? (
                      <button
                        onClick={() => handleDispatchTriage(q.department)}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <span>Dispatch Support</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Flow Nominal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
