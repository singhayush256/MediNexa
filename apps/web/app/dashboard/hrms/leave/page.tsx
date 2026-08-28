'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HrmsLeaveSubPage() {
  const [leaves, setLeaves] = useState<any[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/hrms/employees`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        const allLeaves = Array.isArray(data) ? data.flatMap((e: any) => e.leaveRequests || []) : [];
        setLeaves(allLeaves);
      });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Leave Approval Center & Time-Off Requests</h1>
          <p className="text-xs text-slate-500 mt-1">Review, approve, and track employee casual, sick, earned, and maternity leaves.</p>
        </div>
        <Link href="/dashboard/hrms" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to HRMS Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Staff Member</th>
              <th className="py-3 px-4">Leave Type</th>
              <th className="py-3 px-4">Start Date</th>
              <th className="py-3 px-4">End Date</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leaves.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 text-slate-900 font-bold">{l.employee?.fullName || 'Staff Member'}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-violet-100 text-violet-800 text-[10px] font-bold rounded-full">{l.leaveType}</span>
                </td>
                <td className="py-3 px-4 text-slate-600">{new Date(l.startDate).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-slate-600">{new Date(l.endDate).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-slate-700">{l.reason}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    l.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                    l.approvalStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {l.approvalStatus}
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
