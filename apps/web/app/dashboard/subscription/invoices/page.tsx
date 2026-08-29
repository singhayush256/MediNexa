'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SubscriptionInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/subscriptions/invoices`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        setInvoices(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider rounded-full">
              B2B SAAS INVOICES
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">SaaS Invoices & Receipts</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Download itemized GST tax invoices, billing receipts, and corporate subscription payments ledger.
          </p>
        </div>
        <Link href="/dashboard/subscription" className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
          ← Back to Subscription
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-extrabold text-slate-900">Tax Invoices History ({invoices.length})</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 font-black text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Billing Date</th>
                <th className="py-3 px-4">Plan / Description</th>
                <th className="py-3 px-4">Tax (18% GST)</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Loading subscription invoices...</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">No SaaS billing invoices on record yet.</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">#{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{inv.subscription?.plan?.planName || 'Professional Hospital Center'}</td>
                    <td className="py-3.5 px-4">₹{(inv.taxAmount || 0).toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">₹{(inv.totalAmount || 0).toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase">
                        {inv.paymentStatus || 'PAID'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={inv.hostedInvoiceUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg transition"
                      >
                        📄 Download PDF
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
