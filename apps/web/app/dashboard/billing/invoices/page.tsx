'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BillingInvoicesSubPage() {
  const [invoices, setInvoices] = useState<any[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/billing/invoices`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setInvoices(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Hospital Invoices & GST Billing Roster</h1>
          <p className="text-xs text-slate-500 mt-1">Itemized GST tax invoices generated for outpatient, inpatient, lab and pharmacy services.</p>
        </div>
        <Link href="/dashboard/billing" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to Billing Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Patient</th>
              <th className="py-3 px-4">Subtotal</th>
              <th className="py-3 px-4">Tax (GST)</th>
              <th className="py-3 px-4">Total Amount</th>
              <th className="py-3 px-4">Amount Paid</th>
              <th className="py-3 px-4">Balance Due</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-extrabold text-emerald-700">{inv.invoiceNumber}</td>
                <td className="py-3 px-4 text-slate-900 font-bold">{inv.patient?.user?.firstName} {inv.patient?.user?.lastName}</td>
                <td className="py-3 px-4 text-slate-600">${inv.subtotal}</td>
                <td className="py-3 px-4 text-slate-500">${inv.taxAmount}</td>
                <td className="py-3 px-4 font-black text-slate-900">${inv.totalAmount}</td>
                <td className="py-3 px-4 text-emerald-600 font-extrabold">${inv.amountPaid}</td>
                <td className="py-3 px-4 text-rose-600 font-extrabold">${inv.balanceDue}</td>
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
  );
}
