'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  Bed,
  DollarSign,
  Pill,
  FlaskConical,
  ShieldCheck,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  Activity,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, StatCard } from '@/components/ui';

export default function AdvancedAnalyticsDashboardPage() {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | 'FY26'>('30D');

  // Interactive Export to CSV
  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Category,Value,Status,Period\n' +
      'Total Hospital Revenue,Finance,1845200,Reconciled,FY 2026-27\n' +
      'OPD Consultations,Clinical,200,Completed,August-September 2026\n' +
      'Inpatient Bed Admissions,IPD,50,Occupancy 78%,August-September 2026\n' +
      'Electronic Prescriptions,Pharmacy,100,Dispensed,August-September 2026\n' +
      'Diagnostic Lab Tests,LIMS,80,NABL Verified,August-September 2026\n' +
      'Cashless Insurance Pre-Auths,TPA Claims,50,94.2% Approved,August-September 2026\n' +
      'Pharmacy Formulary Transactions,Inventory,100,FEFO Verified,August-September 2026\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MediNexa_Executive_Analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col font-sans transition-colors duration-200">
      <DashboardNav />

      <div className="flex-1 flex min-h-[calc(100vh-4rem)]">
        <DashboardSidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-900">
                  EXECUTIVE BUSINESS INTELLIGENCE
                </span>
                <span className="text-xs text-slate-400 font-medium">MediNexa Multispeciality Hospital, Noida</span>
              </div>
              <h1 className="text-2xl font-black text-slate-950 dark:text-slate-50 tracking-tight mt-1">
                Hospital Performance & Revenue Analytics
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Timeframe Filter */}
              <div className="flex p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl text-xs font-bold">
                {(['7D', '30D', '90D', 'FY26'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      timeRange === range
                        ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {range === 'FY26' ? 'FY 2026-27' : range}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
              >
                Export CSV
              </Button>
            </div>
          </div>

          {/* Core KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Hospital Revenue"
              value="₹18,45,200"
              description="₹14.2L IPD • ₹4.25L Pharmacy & OPD"
              trend={{ value: 14.8, isPositive: true }}
              icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
            />
            <StatCard
              title="Inpatient Bed Occupancy"
              value="78.2%"
              description="18 Occupied / 55 Licensed Beds"
              trend={{ value: 5.4, isPositive: true }}
              icon={<Bed className="w-5 h-5 text-blue-500" />}
            />
            <StatCard
              title="Doctor OPD Utilization"
              value="86.4%"
              description="200 Encounters across 8 Specialists"
              trend={{ value: 8.2, isPositive: true }}
              icon={<Activity className="w-5 h-5 text-purple-500" />}
            />
            <StatCard
              title="Insurance Claim Settlement"
              value="94.2%"
              description="50 Pre-Authorizations Reconciled"
              trend={{ value: 2.1, isPositive: true }}
              icon={<ShieldCheck className="w-5 h-5 text-teal-500" />}
            />
          </div>

          {/* Revenue Trends Chart & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Trend Visual */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Revenue & Intake Trajectory</h3>
                  <p className="text-xs text-slate-500">Gross receipts across Inpatient, Outpatient, Diagnostics & Pharmacy</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  +14.8% YoY
                </span>
              </div>

              {/* Bar visualization */}
              <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
                {[
                  { label: 'Apr', val: 55, rev: '₹11.2L' },
                  { label: 'May', val: 68, rev: '₹13.4L' },
                  { label: 'Jun', val: 72, rev: '₹14.1L' },
                  { label: 'Jul', val: 80, rev: '₹16.0L' },
                  { label: 'Aug', val: 88, rev: '₹17.5L' },
                  { label: 'Sep (MTD)', val: 95, rev: '₹18.4L' },
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition">
                      {item.rev}
                    </span>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden h-40 flex flex-col justify-end p-1">
                      <div
                        style={{ height: `${item.val}%` }}
                        className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-lg transition-all duration-500 group-hover:brightness-110"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-teal-500" />
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Inpatient Bed Revenue (70%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Pharmacy & Formularies (20%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-slate-600 dark:text-slate-400 font-medium">LIMS Pathology (10%)</span>
                </div>
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Specialty Volume Distribution</h3>
                <p className="text-xs text-slate-500">200 Consultations by Department</p>
              </div>

              <div className="space-y-3">
                {[
                  { dept: 'Cardiology (Dr. Sanjay Deshmukh)', count: 38, pct: 19 },
                  { dept: 'General Medicine (Dr. Priya Verma)', count: 42, pct: 21 },
                  { dept: 'Orthopedics (Dr. Ankit Singh)', count: 30, pct: 15 },
                  { dept: 'Neurology (Dr. Rohit Mehra)', count: 26, pct: 13 },
                  { dept: 'Pediatrics (Dr. Pooja Mishra)', count: 24, pct: 12 },
                  { dept: 'Dermatology & ENT', count: 40, pct: 20 },
                ].map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span>{d.dept}</span>
                      <span className="text-slate-500">{d.count} ({d.pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div style={{ width: `${d.pct * 3}%` }} className="h-full bg-teal-500 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bed Occupancy & Fast Moving Medicines */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ward Occupancy Heatmap */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Inpatient Ward Bed Occupancy Heatmap</h3>
                <p className="text-xs text-slate-500">55 Total Beds Across 6 Specialized Units</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { ward: 'General Ward A (Male)', occupied: 6, total: 10, type: 'GENERAL' },
                  { ward: 'General Ward B (Female)', occupied: 5, total: 10, type: 'GENERAL' },
                  { ward: 'Semi-Private Wing', occupied: 3, total: 10, type: 'SEMI_PRIVATE' },
                  { ward: 'Private Deluxe Wing', occupied: 2, total: 10, type: 'PRIVATE' },
                  { ward: 'Intensive Care Unit (ICU)', occupied: 2, total: 10, type: 'ICU' },
                  { ward: 'Trauma & Emergency', occupied: 0, total: 5, type: 'EMR' },
                ].map((w, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1.5"
                  >
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {w.type}
                    </span>
                    <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">{w.ward}</div>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500">{w.occupied}/{w.total} Beds</span>
                      <span className="font-mono font-bold text-teal-600">
                        {Math.round((w.occupied / w.total) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fast Moving Formulary Drugs */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Top Fast-Moving Formularies</h3>
                <p className="text-xs text-slate-500">Hospital Pharmacy Dispensing Velocity (FEFO)</p>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {[
                  { name: 'Dolo 650 (Paracetamol 650mg)', generic: 'Paracetamol', dispensed: '1,420 Tabs', stock: '2,800 Tabs', rate: 'High' },
                  { name: 'Telma 40 (Telmisartan 40mg)', generic: 'Telmisartan', dispensed: '980 Tabs', stock: '1,500 Tabs', rate: 'Normal' },
                  { name: 'Pan 40 (Pantoprazole 40mg)', generic: 'Pantoprazole Sodium', dispensed: '860 Tabs', stock: '1,200 Tabs', rate: 'Normal' },
                  { name: 'Augmentin 625 Duo', generic: 'Amoxicillin + Clavulanic', dispensed: '640 Tabs', stock: '950 Tabs', rate: 'Moderate' },
                  { name: 'Atorva 20 (Atorvastatin 20mg)', generic: 'Atorvastatin Calcium', dispensed: '510 Tabs', stock: '800 Tabs', rate: 'Normal' },
                ].map((med, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{med.name}</div>
                      <div className="text-[11px] text-slate-500">{med.generic}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 dark:text-white">{med.dispensed}</div>
                      <div className="text-[10px] text-teal-600 font-medium">Stock: {med.stock}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
