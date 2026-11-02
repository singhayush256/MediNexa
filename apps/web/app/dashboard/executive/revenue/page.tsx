'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ExecutiveRevenuePage() {
  const [revenueData, setRevenueData] = useState<any>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/command-center/revenue`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setRevenueData(d));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Revenue Intelligence & Financial Performance</h1>
          <p className="text-xs text-slate-500 mt-1">Hospital billings, collections, insurance claim recovery, and department P&L breakdown.</p>
        </div>
        <Link href="/dashboard/executive" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to Command Wall
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Billed MTD</div>
          <div className="text-3xl font-black text-slate-900 mt-2">${revenueData?.totalBilled?.toLocaleString() || '480,000'}</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">Collection Efficiency: {revenueData?.collectionEfficiency || 92.6}%</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Cash & Ins Collected</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">${revenueData?.totalCollected?.toLocaleString() || '415,000'}</div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">Real-time settlement</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Outstanding AR</div>
          <div className="text-3xl font-black text-rose-600 mt-2">${revenueData?.outstandingAR?.toLocaleString() || '65,000'}</div>
          <div className="text-[11px] text-rose-600 font-bold mt-1">Pending TPA adjudication</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-extrabold text-slate-900">Departmental Revenue Contribution</h2>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Department / Service Center</th>
              <th className="py-3 px-4">Revenue Generated</th>
              <th className="py-3 px-4">Share of Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {revenueData?.departmentalRevenue?.map((dept: any, idx: number) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-900">{dept.department}</td>
                <td className="py-3 px-4 font-black text-emerald-600">${dept.revenue?.toLocaleString()}</td>
                <td className="py-3 px-4 font-bold text-slate-600">{dept.percentage}%</td>
              </tr>
            )) || null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
