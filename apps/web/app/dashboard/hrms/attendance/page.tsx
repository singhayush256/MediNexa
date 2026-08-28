'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HrmsAttendanceSubPage() {
  const [attendance, setAttendance] = useState<any[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/hrms/attendance`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setAttendance(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Attendance Dashboard & Biometric Logs</h1>
          <p className="text-xs text-slate-500 mt-1">Daily clock-in, clock-out records, total shift hours, and attendance compliance tracking.</p>
        </div>
        <Link href="/dashboard/hrms" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to HRMS Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Clock-in Time</th>
              <th className="py-3 px-4">Clock-out Time</th>
              <th className="py-3 px-4">Total Hours</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attendance.map((att) => (
              <tr key={att.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 text-slate-900 font-bold">{att.employee?.fullName}</td>
                <td className="py-3 px-4 text-slate-600">{att.employee?.department?.name || 'General Medicine'}</td>
                <td className="py-3 px-4 text-emerald-700 font-medium">{new Date(att.checkInTime).toLocaleString()}</td>
                <td className="py-3 px-4 text-rose-700 font-medium">{att.checkOutTime ? new Date(att.checkOutTime).toLocaleString() : 'In Progress'}</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{att.totalHours > 0 ? `${att.totalHours} hrs` : '--'}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    att.attendanceStatus === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                    att.attendanceStatus === 'HALF_DAY' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {att.attendanceStatus}
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
