'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PatientSafetyChecklistsPage() {
  const [checklists, setChecklists] = useState<any[]>([]);
  const [handHygiene, setHandHygiene] = useState<any[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/quality/checklists`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/quality/hand-hygiene`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([chk, hh]) => {
      setChecklists(Array.isArray(chk) ? chk : []);
      setHandHygiene(Array.isArray(hh) ? hh : []);
    });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Patient Safety Checklists & Hand Hygiene</h1>
          <p className="text-xs text-slate-500 mt-1">Pre-op verifications, fall risk evaluations, central line bundles, and WHO hand hygiene audits.</p>
        </div>
        <Link href="/dashboard/quality" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to Quality Hub
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Safety Checklists */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">📋 Clinical Safety Checklist Log</h2>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
                <th className="py-2.5 px-3">Checklist Type</th>
                <th className="py-2.5 px-3">Completed By</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {checklists.map((chk) => (
                <tr key={chk.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{chk.checklistType}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-bold">{chk.completedBy?.firstName} {chk.completedBy?.lastName}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800">
                      {chk.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hand Hygiene Audits */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">🧼 Hand Hygiene Compliance Audits</h2>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Observer</th>
                <th className="py-2.5 px-3">Compliance Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {handHygiene.map((hh) => (
                <tr key={hh.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{hh.department?.name}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-bold">{hh.observer?.firstName} {hh.observer?.lastName}</td>
                  <td className="py-2.5 px-3 font-black text-blue-600">{hh.compliancePercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
