'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SubscriptionUsagePage() {
  const [usageData, setUsageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/subscriptions/usage`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        setUsageData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const data = usageData?.usage || {
    activeUsers: { current: 12, limit: 50, percentage: 24.0 },
    activeBeds: { current: 35, limit: 100, percentage: 35.0 },
    activeDoctors: { current: 8, limit: 25, percentage: 32.0 },
    patientsMonthly: { current: 412, limit: 2500, percentage: 16.5 },
    storageGb: { current: 18.4, limit: 250, percentage: 7.4 },
    apiRequestsMonthly: { current: 142050, limit: 1000000, percentage: 14.2 },
  };

  const metrics = [
    { title: 'Staff Accounts (Users)', val: `${data.activeUsers.current} / ${data.activeUsers.limit}`, pct: data.activeUsers.percentage, color: 'bg-indigo-600' },
    { title: 'Physical Beds Capacity', val: `${data.activeBeds.current} / ${data.activeBeds.limit}`, pct: data.activeBeds.percentage, color: 'bg-emerald-600' },
    { title: 'Attending Doctors', val: `${data.activeDoctors.current} / ${data.activeDoctors.limit}`, pct: data.activeDoctors.percentage, color: 'bg-rose-600' },
    { title: 'Monthly Patient Inflow', val: `${data.patientsMonthly.current} / ${data.patientsMonthly.limit}`, pct: data.patientsMonthly.percentage, color: 'bg-amber-600' },
    { title: 'Medical Cloud Vault Storage', val: `${data.storageGb.current} GB / ${data.storageGb.limit} GB`, pct: data.storageGb.percentage, color: 'bg-purple-600' },
    { title: 'API Telemetry & Requests', val: `${(data.apiRequestsMonthly.current / 1000).toFixed(0)}k / 1M`, pct: data.apiRequestsMonthly.percentage, color: 'bg-cyan-600' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-black uppercase tracking-wider rounded-full">
              REAL-TIME USAGE METERING
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Usage Quotas & Limits</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Live consumption telemetry across user accounts, beds, clinical storage, and monthly patient intake quotas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/pricing" className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow transition">
            ⚡ Increase Plan Limits
          </Link>
          <Link href="/dashboard/subscription" className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
            ← Back to Subscription
          </Link>
        </div>
      </div>

      {/* Quota Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((m, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-slate-900">{m.title}</span>
              <span className="text-xs font-black text-slate-600">{m.pct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className={`h-full ${m.color}`} style={{ width: `${Math.min(100, m.pct)}%` }}></div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Consumed</span>
              <span className="font-extrabold text-slate-900">{m.val}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Limit Enforcement Rules Box */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-slate-900">🛡️ Automated Plan Limit Enforcement Policy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="font-bold text-slate-900 mb-1">Grace Thresholds (80%)</div>
            <p>At 80% usage, automated warning notifications are dispatched to hospital administrators.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="font-bold text-slate-900 mb-1">Over-Quota Protection (100%)</div>
            <p>At 100% capacity, non-critical creations are queued and one-click upgrade recommendations are offered.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="font-bold text-slate-900 mb-1">Emergency Override</div>
            <p>Emergency department admissions and trauma intake are never blocked regardless of plan quota limits.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
