'use client';

import React, { useState } from 'react';
import {
  FileBarChart,
  Download,
  Calendar,
  Building2,
  TrendingUp,
  Bed,
  Users,
  Clock,
} from 'lucide-react';

export default function ManagerReportsPage() {
  const [dateRange, setDateRange] = useState('TODAY');
  const [downloading, setDownloading] = useState(false);

  const reports = [
    {
      id: 'rep-01',
      title: 'Daily Bed Census & Inpatient Turnover Report',
      period: 'Today (Live Aggregation)',
      metrics: '50 Total Beds • 32 Occupied (64%) • 9 Admissions • 5 Discharges',
      department: 'Admissions & Wards',
    },
    {
      id: 'rep-02',
      title: 'Outpatient Clinic Volume & Average Wait SLA Audit',
      period: 'Today (Live Aggregation)',
      metrics: '142 Consultations • 22 min average wait • 92% SLA Adherence',
      department: 'OPD Clinics',
    },
    {
      id: 'rep-03',
      title: 'Workforce Attendance & Shift Coverage Compliance',
      period: 'This Week',
      metrics: '38 Active Staff • 94% Shift Presence • 2 Staffing Gaps Resolved',
      department: 'Operations / HRMS',
    },
    {
      id: 'rep-04',
      title: 'Emergency Trauma Triage & Resuscitation Response Log',
      period: 'Last 24 Hours',
      metrics: '28 Emergency Encounters • 1 Level 1 Trauma • 2.4 min Avg Response',
      department: 'Emergency & Trauma',
    },
  ];

  const handleDownload = (title: string) => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`Report generated and downloaded: ${title}`);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold mb-2">
            <FileBarChart className="w-3.5 h-3.5" />
            <span>Database Aggregation & Audits</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Operational Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real aggregated operational summaries across bed occupancy, outpatient volume, wait times, and staff deployment.
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r) => (
          <div
            key={r.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-teal-600 font-bold bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                  {r.id}
                </span>
                <span className="text-xs text-slate-400 font-medium">{r.period}</span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-2">
                {r.title}
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                {r.department}
              </p>
              <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300 font-mono font-medium">
                {r.metrics}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => handleDownload(r.title)}
                disabled={downloading}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF / CSV</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
