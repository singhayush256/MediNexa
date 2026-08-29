'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SubscriptionOverviewPage() {
  const [sub, setSub] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/subscriptions/current`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/subscriptions/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([subData, analData]) => {
        setSub(subData);
        setAnalytics(analData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const plan = sub?.plan || {
    planCode: 'PROFESSIONAL',
    planName: 'Professional Hospital Center',
    monthlyPrice: 14999,
    yearlyPrice: 149990,
    maxUsers: 50,
    maxBeds: 100,
    maxDoctors: 25,
    maxPatientsPerMonth: 2500,
    maxStorageGb: 250,
  };

  const isTrial = sub?.status === 'TRIAL' || sub?.isTrial;
  const daysLeft = sub?.daysRemaining ?? 14;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-black uppercase tracking-wider rounded-full">
              B2B SAAS SUBSCRIPTION
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Organization Subscription & Plan</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage your hospital SaaS tier, recurring billing cycle, usage quotas, and modular feature entitlements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/pricing" className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow transition">
            ⚡ Upgrade Tier
          </Link>
          <Link href="/dashboard/subscription/billing" className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow transition">
            💳 Manage Billing
          </Link>
        </div>
      </div>

      {/* Navigation Sub-Links */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <Link href="/dashboard/subscription" className="px-4 py-2 bg-rose-50 text-rose-800 font-black text-xs rounded-xl">Plan Overview</Link>
        <Link href="/dashboard/subscription/billing" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Billing & Payment</Link>
        <Link href="/dashboard/subscription/usage" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Usage & Quotas</Link>
        <Link href="/dashboard/subscription/invoices" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Invoices & Receipts</Link>
      </div>

      {/* Active Trial Notification Banner */}
      {isTrial && (
        <div className="p-4 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-300 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⏳</div>
            <div>
              <div className="text-xs font-black text-slate-900">14-Day Free Evaluation Active ({daysLeft} days remaining)</div>
              <div className="text-[11px] text-slate-600">
                You are currently exploring the <b>{plan.planName}</b>. Upgrade to an annual subscription to lock in 17% savings.
              </div>
            </div>
          </div>
          <Link href="/pricing" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow whitespace-nowrap">
            Activate Subscription Now →
          </Link>
        </div>
      )}

      {/* Current Plan Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider">CURRENT ACTIVE PLAN</span>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5">{plan.planName}</h2>
              <div className="text-xs text-slate-500 mt-1">
                Status: <span className="font-bold text-emerald-600 uppercase">{sub?.status || 'ACTIVE'}</span> | Billing Cycle: <span className="font-bold">{sub?.billingCycle || 'MONTHLY'}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-slate-900">₹{(sub?.billingCycle === 'YEARLY' ? plan.yearlyPrice / 12 : plan.monthlyPrice).toLocaleString()}</div>
              <div className="text-[11px] text-slate-400 font-bold">per month</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Staff Seats</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">{plan.maxUsers} Users</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Bed Capacity</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">{plan.maxBeds} Beds</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Doctor Roster</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">{plan.maxDoctors} Docs</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Cloud Storage</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">{plan.maxStorageGb} GB</div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="text-xs font-black text-slate-900 uppercase tracking-wider">Unlocked Modules & Capabilities</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-2"><span>✅</span> <span>Digital OPD Walk-in Tokens</span></div>
              <div className="flex items-center gap-2"><span>✅</span> <span>Electronic Health Records (EHR)</span></div>
              <div className="flex items-center gap-2"><span>✅</span> <span>Inpatient (IPD) MAR Flowsheets</span></div>
              <div className="flex items-center gap-2"><span>✅</span> <span>Operation Theatre (OT) Surgery</span></div>
              <div className="flex items-center gap-2"><span>✅</span> <span>LIMS Diagnostic Laboratory</span></div>
              <div className="flex items-center gap-2"><span>✅</span> <span>PACS Radiology DICOM Viewer</span></div>
              <div className="flex items-center gap-2"><span>✅</span> <span>Pharmacy PMS & Dispensing</span></div>
              <div className="flex items-center gap-2"><span>✅</span> <span>WebRTC Video Telemedicine</span></div>
            </div>
          </div>
        </div>

        {/* Quick Revenue / SaaS KPIs */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h2 className="text-base font-extrabold text-slate-900">📊 SaaS Health & Entitlements</h2>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Monthly Recurring Cost (MRR)</div>
              <div className="text-2xl font-black text-slate-900">₹{(plan.monthlyPrice).toLocaleString()}</div>
              <div className="text-[11px] text-slate-500">Auto-renews on {new Date(sub?.currentPeriodEnd || Date.now() + 30 * 86400000).toLocaleDateString()}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="text-slate-400 font-bold uppercase text-[10px]">SLA Uptime Commitment</div>
              <div className="text-2xl font-black text-emerald-600">99.95%</div>
              <div className="text-[11px] text-emerald-600 font-bold">Enterprise Cloud Multi-Region Active</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Compliance & Governance</div>
              <div className="text-xs font-black text-indigo-700">NABH, JCI, HIPAA & ABDM Certified</div>
              <div className="text-[11px] text-slate-500">End-to-End 256-bit AES Encryption</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
