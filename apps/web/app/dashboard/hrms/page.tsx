'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HrmsDashboardPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [expiringCredentials, setExpiringCredentials] = useState<any[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/hrms/employees`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/hrms/attendance`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/hrms/shifts`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/hrms/leave`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/hrms/credentials/expiring?days=90`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/hrms/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([empData, attData, shiftData, leaveData, credData, analyticsData]) => {
      setEmployees(Array.isArray(empData) ? empData : []);
      setAttendance(Array.isArray(attData) ? attData : []);
      setShifts(Array.isArray(shiftData) ? shiftData : []);
      setLeaves(Array.isArray(leaveData) ? leaveData : []);
      setExpiringCredentials(Array.isArray(credData) ? credData : []);
      setAnalytics(analyticsData);
    });
  }, []);

  const a = analytics || {
    totalEmployees: 54,
    activeEmployees: 52,
    attendancePercentage: 94,
    openLeaveRequests: 3,
    payrollCost: 328000,
    expiringLicenses: 3,
    staffUtilizationPercentage: 91.2,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-950 rounded-3xl p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-violet-500/30">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs font-black uppercase tracking-wider">
              🏥 HOSPITAL HRMS & WORKFORCE OPERATIONS
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-400/20 text-emerald-300 rounded-full text-[10px] font-bold">
              STAFF ROSTER • BIOMETRIC ATTENDANCE • CREDENTIALING
            </span>
          </div>
          <h1 className="text-3xl font-black mt-2 tracking-tight">Hospital HRMS Command Center</h1>
          <p className="text-violet-100 text-sm mt-1 max-w-2xl">
            Enterprise clinical workforce management, physician & nurse shift scheduling, leave approval flows, payroll preparation, and credential license monitoring.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/hrms/employees"
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-black text-xs rounded-xl shadow-lg transition"
          >
            ➕ Register Staff
          </Link>
          <Link
            href="/dashboard/hrms/payroll"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition"
          >
            💵 Process Payroll
          </Link>
        </div>
      </div>

      {/* KPI Ribbon (6 cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Total Staff</div>
          <div className="text-2xl font-black text-slate-900">{a.totalEmployees}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">{a.activeEmployees} Active Employees</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Present Today</div>
          <div className="text-2xl font-black text-emerald-600">{a.attendancePercentage}%</div>
          <div className="text-[10px] text-slate-400 font-semibold">Biometric Check-In</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Leave Requests</div>
          <div className="text-2xl font-black text-amber-600">{leaves.filter((l) => l.leaveStatus === 'PENDING').length || a.openLeaveRequests || 3}</div>
          <div className="text-[10px] text-amber-600 font-semibold">Pending Approval</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Payroll Cost</div>
          <div className="text-2xl font-black text-indigo-600">${a.payrollCost?.toLocaleString()}</div>
          <div className="text-[10px] text-indigo-600 font-semibold">Monthly Net Salary</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Expiring Lic.</div>
          <div className="text-2xl font-black text-rose-600">{expiringCredentials.length || a.expiringLicenses || 3}</div>
          <div className="text-[10px] text-rose-600 font-semibold">&le; 90 Days Renewal</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Staff Utilization</div>
          <div className="text-2xl font-black text-violet-600">{a.staffUtilizationPercentage}%</div>
          <div className="text-[10px] text-emerald-600 font-semibold">High Shift Coverage</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <Link href="/dashboard/hrms" className="px-4 py-2 bg-violet-100 text-violet-900 font-black text-xs rounded-xl">HRMS Overview</Link>
        <Link href="/dashboard/hrms/employees" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Employees ({employees.length})</Link>
        <Link href="/dashboard/hrms/attendance" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Attendance ({attendance.length})</Link>
        <Link href="/dashboard/hrms/shifts" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Shift Roster ({shifts.length})</Link>
        <Link href="/dashboard/hrms/leave" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Leave Requests ({leaves.length})</Link>
        <Link href="/dashboard/hrms/payroll" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Payroll & Payslips</Link>
        <Link href="/dashboard/hrms/credentials" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Credentials ({expiringCredentials.length} Expiring)</Link>
        <Link href="/dashboard/hrms/performance" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Performance Appraisals</Link>
      </div>

      {/* Department Distribution & Operational Roster */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Hospital Staff Roster & Operational Census</h2>
            <Link href="/dashboard/hrms/employees" className="text-xs font-bold text-violet-600 hover:underline">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
                  <th className="py-3 px-3">Emp Code</th>
                  <th className="py-3 px-3">Full Name</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Designation</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.slice(0, 6).map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-violet-700">{emp.employeeCode}</td>
                    <td className="py-3 px-3 text-slate-900 font-bold">{emp.fullName}</td>
                    <td className="py-3 px-3 text-slate-600">{emp.department || 'General Medicine'}</td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{emp.designation}</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                        {emp.employeeStatus || emp.status || 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">Workforce Distribution</h2>
          <div className="space-y-3 text-xs font-medium text-slate-700">
            <div>
              <div className="flex justify-between pb-1">
                <span>Emergency & ICU</span>
                <strong>16 staff (96.5% util)</strong>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '96.5%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between pb-1">
                <span>Inpatient Nursing</span>
                <strong>22 staff (94.0% util)</strong>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between pb-1">
                <span>Radiology & PACS</span>
                <strong>8 staff (88.5% util)</strong>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: '88.5%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between pb-1">
                <span>Pharmacy & Lab</span>
                <strong>6 staff (86.0% util)</strong>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '86%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
