'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  AlertCircle,
  Building2,
  ArrowRight,
} from 'lucide-react';

export default function ManagerDepartmentPerformancePage() {
  const [metrics, setMetrics] = useState([
    {
      dept: 'Cardiology',
      code: 'CARDIO',
      avgConsultMins: 14,
      avgWaitMins: 32,
      targetWaitMins: 20,
      dailyPatients: 42,
      slaCompliance: 76,
      satisfaction: 4.6,
      bedTurnaroundHours: 3.2,
      status: 'NEEDS_ATTENTION',
    },
    {
      dept: 'Critical Care ICU',
      code: 'ICU',
      avgConsultMins: 45,
      avgWaitMins: 0,
      targetWaitMins: 0,
      dailyPatients: 10,
      slaCompliance: 98,
      satisfaction: 4.9,
      bedTurnaroundHours: 1.5,
      status: 'EXCELLENT',
    },
    {
      dept: 'Emergency & Trauma',
      code: 'EMERG',
      avgConsultMins: 18,
      avgWaitMins: 8,
      targetWaitMins: 10,
      dailyPatients: 28,
      slaCompliance: 94,
      satisfaction: 4.8,
      bedTurnaroundHours: 1.2,
      status: 'EXCELLENT',
    },
    {
      dept: 'General Medicine',
      code: 'MED',
      avgConsultMins: 12,
      avgWaitMins: 24,
      targetWaitMins: 20,
      dailyPatients: 56,
      slaCompliance: 84,
      satisfaction: 4.4,
      bedTurnaroundHours: 4.1,
      status: 'NOMINAL',
    },
    {
      dept: 'Orthopedics',
      code: 'ORTHO',
      avgConsultMins: 16,
      avgWaitMins: 26,
      targetWaitMins: 20,
      dailyPatients: 34,
      slaCompliance: 82,
      satisfaction: 4.5,
      bedTurnaroundHours: 3.8,
      status: 'NOMINAL',
    },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Operational Quality & SLA</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Department Performance & Bottlenecks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Evaluate throughput rates, consultation wait times, SLA compliance, and bed sanitation turnaround times.
          </p>
        </div>

        <Link
          href="/dashboard/manager/opd"
          className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-md shadow-teal-600/20"
        >
          View OPD Queue →
        </Link>
      </div>

      {/* Performance Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Daily Throughput</th>
                <th className="py-3 px-4 text-center">Avg Wait Time</th>
                <th className="py-3 px-4 text-center">Target Wait</th>
                <th className="py-3 px-4 text-center">SLA Compliance</th>
                <th className="py-3 px-4 text-center">Bed Turnaround</th>
                <th className="py-3 px-4">Status & Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {metrics.map((m) => (
                <tr key={m.code} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900 dark:text-white">
                      {m.dept}
                    </div>
                    <div className="text-[10px] font-mono text-teal-600 font-bold">{m.code}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                    {m.dailyPatients} patients
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold">
                    <span
                      className={
                        m.avgWaitMins > m.targetWaitMins
                          ? 'text-rose-600 font-black'
                          : 'text-emerald-600'
                      }
                    >
                      {m.avgWaitMins} mins
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                    {m.targetWaitMins} mins
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-black ${
                        m.slaCompliance >= 90
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : m.slaCompliance >= 80
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {m.slaCompliance}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-600 dark:text-slate-300">
                    {m.bedTurnaroundHours} hrs
                  </td>
                  <td className="py-3.5 px-4">
                    {m.status === 'NEEDS_ATTENTION' ? (
                      <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> High wait times; deploy overflow staff
                      </span>
                    ) : m.status === 'EXCELLENT' ? (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Optimal throughput
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-500">
                        Nominal operational flow
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
