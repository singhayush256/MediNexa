'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserCheck,
  Clock,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  Users,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

export default function StaffAttendancePage() {
  const router = useRouter();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    fetch(`${apiUrl}/hrms/attendance`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setAttendance(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = attendance.filter((a) =>
    (a.employee?.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.employee?.employeeCode || '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col font-sans transition-colors duration-200">
      <DashboardNav />
      <div className="flex-1 flex min-h-[calc(100vh-4rem)]">
        <DashboardSidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                  WORKFORCE & HRMS
                </span>
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Biometric & Shift Verification
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
                Staff Attendance & Clock Logs
              </h1>
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attendance by staff name or ID..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily Clock-In & Biometric Activity</CardTitle>
              <CardDescription className="text-xs">
                Real-time duty check-ins, shift completions, and hours served across all clinical wards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-12">
                  <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No attendance punch records found for today. Staff check-ins will appear here in real time.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Staff Member</th>
                        <th className="py-3 px-4">Employee ID</th>
                        <th className="py-3 px-4">Check-In Time</th>
                        <th className="py-3 px-4">Check-Out Time</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {filtered.map((att) => (
                        <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition">
                          <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-slate-100">
                            {att.employee?.fullName || 'Hospital Staff'}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                            {att.employee?.employeeCode || 'ST-0000'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                            {att.clockIn ? new Date(att.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                            {att.clockOut ? new Date(att.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'On Duty'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                              {att.status || 'PRESENT'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
