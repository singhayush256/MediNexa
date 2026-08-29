'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PatientBillingPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/patient-portal/bills`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setBills(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black uppercase rounded-full">
              FINANCIAL
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Billing & Payment Receipts</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">Itemized hospital bills, insurance settlements, and payment history.</p>
        </div>
        <Link href="/portal" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
          ← Portal
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading billing records...</div>
      ) : bills.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-4xl">💳</div>
          <h3 className="font-extrabold text-sm text-slate-900">No Billing Invoices</h3>
          <p className="text-xs text-slate-500">You have no outstanding or past hospital billing statements.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bills.map((inv) => (
            <div key={inv.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-900">Invoice #{inv.invoiceNumber}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase ${
                    inv.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {inv.paymentStatus}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Date: {new Date(inv.invoiceDate).toLocaleDateString()} • {inv.facility?.name || 'MediNexa General Hospital'}
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-black text-slate-900">${(inv.totalAmount || 0).toLocaleString()}</div>
                <div className="text-xs text-emerald-600 font-bold">Paid: ${(inv.amountPaid || 0).toLocaleString()}</div>
                {inv.balanceDue > 0 && (
                  <div className="text-xs text-rose-600 font-bold">Balance: ${inv.balanceDue.toLocaleString()}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
