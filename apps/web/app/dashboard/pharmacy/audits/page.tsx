'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PharmacyAuditsSubPage() {
  const [audits, setAudits] = useState<any[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/pharmacy/audits`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setAudits(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Controlled Substance Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-1">Dual-nurse witness verification and controlled drug movement audit logs.</p>
        </div>
        <Link href="/dashboard/pharmacy" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to Pharmacy Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Controlled Drug</th>
              <th className="py-3 px-4">Batch #</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Quantity</th>
              <th className="py-3 px-4">Performed By</th>
              <th className="py-3 px-4">Witness Nurse</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {audits.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-extrabold text-slate-900">{a.drugMaster?.name || 'Morphine Sulfate 10mg'}</td>
                <td className="py-3 px-4 font-mono text-slate-600">{a.drugBatch?.batchNumber || 'BATCH-NARCO-01'}</td>
                <td className="py-3 px-4 font-bold text-slate-800">{a.action}</td>
                <td className="py-3 px-4 font-black text-slate-900">{a.quantity} Units</td>
                <td className="py-3 px-4 text-slate-600">{a.performedBy?.firstName} {a.performedBy?.lastName}</td>
                <td className="py-3 px-4 text-slate-600 font-bold">{a.witnessNurse?.firstName} {a.witnessNurse?.lastName}</td>
                <td className="py-3 px-4">
                  <span className="font-extrabold px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
                    {a.verificationStatus}
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
