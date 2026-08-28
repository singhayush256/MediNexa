'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function QualityAuditsPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/quality/audits`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setAudits(Array.isArray(d) ? d : []));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Clinical Quality Audits (NABH & JCI)</h1>
          <p className="text-xs text-slate-500 mt-1">Standard operating procedure inspections, clinical governance audits, and department scores.</p>
        </div>
        <Link href="/dashboard/quality" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to Quality Hub
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Audit #</th>
              <th className="py-3 px-4">Audit Name</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Auditor</th>
              <th className="py-3 px-4">Score</th>
              <th className="py-3 px-4">Findings</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {audits.map((audit) => (
              <tr key={audit.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{audit.auditNumber}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{audit.auditName}</td>
                <td className="py-3 px-4 text-slate-700 font-bold">{audit.department?.name}</td>
                <td className="py-3 px-4 text-slate-600 font-bold">{audit.auditor?.firstName} {audit.auditor?.lastName}</td>
                <td className="py-3 px-4 font-black text-emerald-600">{audit.score}%</td>
                <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs truncate">{audit.findings}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800">
                    {audit.status}
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
