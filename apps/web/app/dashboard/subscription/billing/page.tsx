'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SubscriptionBillingPage() {
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState('MONTHLY');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/subscriptions/current`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        setSub(d);
        if (d?.billingCycle) setSelectedCycle(d.billingCycle);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancelAutoRenew = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    await fetch(`${apiUrl}/subscriptions/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadData();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider rounded-full">
              PAYMENT & BILLING CYCLE
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Billing & Payment Settings</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage your corporate credit cards, automated UPI payments, Stripe & Razorpay webhooks, and billing cycle.
          </p>
        </div>
        <Link href="/dashboard/subscription" className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
          ← Back to Subscription
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">💳 Active Payment Gateways</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border-2 border-indigo-600 bg-indigo-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-indigo-900">Stripe Global Card Settlement</span>
                  <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-full">PRIMARY</span>
                </div>
                <div className="text-sm font-mono text-slate-700 font-bold">•••• •••• •••• 4242</div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Visa Corporate Healthcare</span>
                  <span>Exp 12/29</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">Razorpay Enterprise UPI</span>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-full">BACKUP</span>
                </div>
                <div className="text-sm font-mono text-slate-700 font-bold">hospital.admin@medinexa</div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Auto-Debit Active</span>
                  <span>Instant Settlement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">📅 Billing Cadence & Auto-Renew</h2>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <div className="text-xs font-bold text-slate-900">Recurring Billing: {sub?.billingCycle || 'MONTHLY'}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Next automated renewal charge scheduled for <b>{new Date(sub?.currentPeriodEnd || Date.now()).toLocaleDateString()}</b>.
                </div>
              </div>
              <button
                onClick={handleCancelAutoRenew}
                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200"
              >
                Disable Auto-Renew
              </button>
            </div>
          </div>
        </div>

        {/* GST & Organization Tax Information */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">🏢 Organization Tax Details</h2>
          <div className="space-y-3 text-xs">
            <div>
              <div className="text-slate-400 text-[10px] font-bold uppercase">Legal Entity Name</div>
              <div className="font-extrabold text-slate-900 mt-0.5">{sub?.organization?.name || 'MediNexa General Hospital'}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] font-bold uppercase">GSTIN / Tax ID</div>
              <div className="font-mono text-slate-700 mt-0.5">36AABCM9812K1Z9</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] font-bold uppercase">Billing Email</div>
              <div className="text-slate-700 mt-0.5">finance@medinexa.local</div>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Link href="/dashboard/subscription/invoices" className="text-indigo-600 font-bold hover:underline">
                View Past Tax Invoices →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
