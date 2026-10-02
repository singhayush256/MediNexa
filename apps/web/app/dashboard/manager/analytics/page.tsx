'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Bed,
  Users,
  Clock,
  Building2,
  Calendar,
} from 'lucide-react';

export default function ManagerAnalyticsPage() {
  const departmentWorkload = [
    { name: 'Cardiology', load: 84, capacity: 'High Load', doctors: 2, patients: 42 },
    { name: 'Critical Care ICU', load: 92, capacity: 'Critical Cap', doctors: 3, patients: 10 },
    { name: 'General Medicine', load: 68, capacity: 'Nominal', doctors: 4, patients: 56 },
    { name: 'Orthopedics', load: 72, capacity: 'Nominal', doctors: 2, patients: 34 },
    { name: 'Emergency', load: 88, capacity: 'High Load', doctors: 3, patients: 28 },
    { name: 'Pediatrics', load: 60, capacity: 'Nominal', doctors: 2, patients: 22 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Operational Telemetry Analytics</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Hospital Analytics & Workload Forecasting
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Statistical distribution of patient inflow, clinical bottleneck heatmaps, and staffing demand curves.
          </p>
        </div>
      </div>

      {/* 4 Trend Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Peak OPD Hours</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            10:00 - 12:30
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">+34% patient influx</div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Bed Occupancy Rate</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            68.4%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Nominal safe range &lt; 85%</div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Staff Utilization</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            89.2%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Optimal deployment ratio</div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Avg Inpatient Stay</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            3.4 Days
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Aligned with tertiary benchmarks</div>
        </div>
      </div>

      {/* Departmental Workload Bars */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-600" />
          <span>Department Workload & Capacity Strain Index</span>
        </h2>

        <div className="space-y-4">
          {departmentWorkload.map((dept) => (
            <div key={dept.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-900 dark:text-white">{dept.name}</span>
                <span
                  className={
                    dept.load >= 90
                      ? 'text-rose-600'
                      : dept.load >= 80
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }
                >
                  {dept.load}% Load ({dept.capacity}) • {dept.patients} Patients
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    dept.load >= 90
                      ? 'bg-rose-500'
                      : dept.load >= 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${dept.load}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
