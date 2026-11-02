'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BillingPaymentsSubPage() {
  const [payments, setPayments] = useState<any[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/billing/payments`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setPayments(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Payment Collection Workstation</h1>
          <p className="text-xs text-slate-500 mt-1">Multi-payor payment transactions collected via Cash, Card, UPI, Net Banking, and Insurance settlements.</p>
        </div>
        <Link href="/dashboard/billing" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to Billing Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Transaction Ref</th>
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Payment Method</th>
              <th className="py-3 px-4">Amount Paid</th>
              <th className="py-3 px-4">Collected By</th>
              <th className="py-3 px-4">Date & Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.transactionReference || `#TXN-${p.id.slice(0, 8)}`}</td>
                <td className="py-3 px-4 text-emerald-700 font-mono font-extrabold">{p.invoice?.invoiceNumber}</td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800">
                    {p.paymentMethod}
                  </span>
                </td>
                <td className="py-3 px-4 font-extrabold text-emerald-600">${p.amount}</td>
                <td className="py-3 px-4 text-slate-700 font-bold">{p.collectedBy?.firstName || 'Staff'} {p.collectedBy?.lastName || 'Cashier'}</td>
                <td className="py-3 px-4 text-slate-500">{new Date(p.paymentDate).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
