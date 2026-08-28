'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BillingClaimsSubPage() {
  const [claims, setClaims] = useState<any[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/billing/claims`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setClaims(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Insurance Claim Tracker & Adjudication</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time claim status, pre-authorization, TPA adjudication, and reimbursement tracking.</p>
        </div>
        <Link href="/dashboard/billing" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to Billing Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Claim #</th>
              <th className="py-3 px-4">Insurance Provider</th>
              <th className="py-3 px-4">Patient</th>
              <th className="py-3 px-4">Claim Amount</th>
              <th className="py-3 px-4">Approved Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Submission Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {claims.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-indigo-700">{c.claimNumber}</td>
                <td className="py-3 px-4 font-extrabold text-slate-900">{c.provider?.providerName || 'Star Health'}</td>
                <td className="py-3 px-4 text-slate-800 font-bold">{c.patient?.user?.firstName} {c.patient?.user?.lastName}</td>
                <td className="py-3 px-4 font-black text-slate-900">${c.claimAmount}</td>
                <td className="py-3 px-4 text-emerald-600 font-extrabold">${c.approvedAmount}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    c.claimStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                    c.claimStatus === 'SUBMITTED' ? 'bg-indigo-100 text-indigo-800' :
                    c.claimStatus === 'PARTIALLY_APPROVED' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {c.claimStatus}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-500">{c.submissionDate ? new Date(c.submissionDate).toLocaleDateString() : 'Draft'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
