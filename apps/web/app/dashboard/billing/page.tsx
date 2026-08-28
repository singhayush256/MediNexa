'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BillingDashboardPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/billing/invoices`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/billing/payments`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/billing/claims`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/billing/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([invData, payData, clmData, analyticsData]) => {
        setInvoices(Array.isArray(invData) ? invData : []);
        setPayments(Array.isArray(payData) ? payData : []);
        setClaims(Array.isArray(clmData) ? clmData : []);
        setAnalytics(analyticsData);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider rounded-full">
              FINANCIAL & RCM ENGINE
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Revenue Cycle Management & Billing</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise hospital invoicing, multi-payor payments, insurance claims adjudication, and revenue cycle intelligence.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/billing/invoices" className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition">
            + Create Invoice
          </Link>
          <Link href="/dashboard/billing/payments" className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition">
            💳 Collect Payment
          </Link>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Revenue Today</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">${analytics?.revenueToday?.toLocaleString() || '4,850'}</div>
          <div className="text-[11px] text-emerald-600 font-extrabold mt-1">↑ Collected at Cashiers</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Monthly Revenue</div>
          <div className="text-3xl font-black text-slate-900 mt-2">${analytics?.revenueThisMonth?.toLocaleString() || '142,500'}</div>
          <div className="text-[11px] text-slate-400 font-bold mt-1">Target: $180,000 / mo</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Outstanding Receivables</div>
          <div className="text-3xl font-black text-rose-600 mt-2">${analytics?.outstandingReceivables?.toLocaleString() || '24,800'}</div>
          <div className="text-[11px] text-rose-600 font-bold mt-1">Patient & Insurance dues</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Insurance Recovery Rate</div>
          <div className="text-3xl font-black text-indigo-600 mt-2">{analytics?.insuranceRecoveryRate || 92}%</div>
          <div className="text-[11px] text-indigo-600 font-bold mt-1">Avg 3.5 days settlement</div>
        </div>
      </div>

      {/* Navigation Sub-Links */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Link href="/dashboard/billing" className="px-4 py-2 bg-emerald-50 text-emerald-700 font-black text-xs rounded-xl">Overview</Link>
        <Link href="/dashboard/billing/invoices" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Invoices & GST</Link>
        <Link href="/dashboard/billing/payments" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Payment Collection</Link>
        <Link href="/dashboard/billing/claims" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Insurance Claims</Link>
      </div>

      {/* Recent Invoices Roster */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900">Recent Hospital Invoices</h2>
          <Link href="/dashboard/billing/invoices" className="text-xs font-bold text-emerald-600 hover:underline">View All Invoices →</Link>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.slice(0, 5).map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{inv.patient?.user?.firstName} {inv.patient?.user?.lastName}</td>
                  <td className="py-3 px-4 text-slate-600">${inv.subtotal}</td>
                  <td className="py-3 px-4 font-extrabold text-slate-900">${inv.totalAmount}</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">${inv.amountPaid}</td>
                  <td className="py-3 px-4 text-rose-600 font-bold">${inv.balanceDue}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      inv.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                      inv.paymentStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {inv.paymentStatus}
                    </span>
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
