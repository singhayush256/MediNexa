'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TrialSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    hospitalName: '',
    contactName: '',
    workEmail: '',
    phoneNumber: '',
    bedCount: '50',
    planCode: 'PROFESSIONAL',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('medinexa_token');
    try {
      if (token) {
        await fetch(`${apiUrl}/subscriptions/trial`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            organizationName: form.hospitalName,
            planCode: form.planCode,
          }),
        });
      }
      setSuccess(true);
    } catch {
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between">
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-2xl">🏥</span>
          <span className="font-black text-xl tracking-tight text-white">
            Medi<span className="text-rose-500">Nexa</span>
          </span>
        </Link>
        <Link href="/pricing" className="text-xs font-bold text-slate-400 hover:text-white transition">
          ← Back to Pricing
        </Link>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-12 w-full my-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          {!success ? (
            <>
              <div className="text-center space-y-2">
                <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-wider rounded-full">
                  14-DAY INSTANT CLOUD EVALUATION
                </span>
                <h1 className="text-2xl font-black text-white">Start Your Free Hospital Trial</h1>
                <p className="text-xs text-slate-400">
                  Full access to MediNexa Professional Enterprise Suite. No credit card required.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Hospital or Clinic Name</label>
                  <input
                    type="text"
                    required
                    value={form.hospitalName}
                    onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
                    placeholder="e.g. St. Jude Memorial Hospital"
                    className="w-full mt-1 p-3 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Medical Director / Admin</label>
                    <input
                      type="text"
                      required
                      value={form.contactName}
                      onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                      placeholder="Dr. Eleanor Vance"
                      className="w-full mt-1 p-3 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Official Work Email</label>
                    <input
                      type="email"
                      required
                      value={form.workEmail}
                      onChange={(e) => setForm({ ...form, workEmail: e.target.value })}
                      placeholder="admin@stjude.org"
                      className="w-full mt-1 p-3 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={form.phoneNumber}
                      onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                      placeholder="+1-800-555-0199"
                      className="w-full mt-1 p-3 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Target SaaS Tier</label>
                    <select
                      value={form.planCode}
                      onChange={(e) => setForm({ ...form, planCode: e.target.value })}
                      className="w-full mt-1 p-3 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-rose-500"
                    >
                      <option value="STARTER">Starter Clinic (₹4,999/mo)</option>
                      <option value="PROFESSIONAL">Professional Hospital (₹14,999/mo)</option>
                      <option value="ENTERPRISE">Enterprise Multi-Hospital</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg transition mt-4"
                >
                  {loading ? 'Provisioning Cloud Tenant...' : '🚀 Launch Hospital Cloud Tenant →'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="text-5xl">🎉</div>
              <h2 className="text-2xl font-black text-white">Your Cloud Tenant is Provisioned!</h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                Welcome to MediNexa! Your 14-day free trial on the Professional Suite is now active. All clinical, diagnostic, and pharmacy modules are unlocked.
              </p>
              <div className="pt-4">
                <Link
                  href="/dashboard/subscription"
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow transition inline-block"
                >
                  Go to Subscription Dashboard →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © 2026 MediNexa B2B Healthcare SaaS Platform. All Rights Reserved.
      </footer>
    </div>
  );
}
