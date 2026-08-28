'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HrmsShiftsSubPage() {
  const [shifts, setShifts] = useState<any[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/hrms/shifts`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setShifts(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Hospital Shift Roster Planner</h1>
          <p className="text-xs text-slate-500 mt-1">Multi-department 24/7 staff duty scheduling, rotational shift allocations, and overlap prevention.</p>
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
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Shift Type</th>
              <th className="py-3 px-4">Start Time</th>
              <th className="py-3 px-4">End Time</th>
              <th className="py-3 px-4">Assigned By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shifts.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 text-slate-900 font-bold">{s.employee?.fullName}</td>
                <td className="py-3 px-4 text-slate-600">{s.department?.name || 'Cardiology'}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    s.shiftType === 'MORNING' ? 'bg-amber-100 text-amber-800' :
                    s.shiftType === 'EVENING' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-900 text-white'
                  }`}>
                    {s.shiftType}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-700">{new Date(s.startTime).toLocaleString()}</td>
                <td className="py-3 px-4 text-slate-700">{new Date(s.endTime).toLocaleString()}</td>
                <td className="py-3 px-4 text-slate-500">{s.assignedBy?.firstName || 'HR'} {s.assignedBy?.lastName || 'Admin'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
