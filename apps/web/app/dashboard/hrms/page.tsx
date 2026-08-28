'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HrmsDashboardPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/hrms/employees`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/hrms/attendance`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/hrms/shifts`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/hrms/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([empData, attData, shiftData, analyticsData]) => {
      setEmployees(Array.isArray(empData) ? empData : []);
      setAttendance(Array.isArray(attData) ? attData : []);
      setShifts(Array.isArray(shiftData) ? shiftData : []);
      setAnalytics(analyticsData);
    });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-violet-100 text-violet-800 text-xs font-black uppercase tracking-wider rounded-full">
              ENTERPRISE WORKFORCE & HRMS
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hospital Workforce & Payroll</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Staff scheduling, biometric attendance tracking, leave approval workflows, and automated payroll disbursement.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/hrms/employees" className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition">
            + Register Staff
          </Link>
          <Link href="/dashboard/hrms/payroll" className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition">
            💵 Run Payroll
          </Link>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Headcount</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{analytics?.totalEmployees || 48}</div>
          <div className="text-[11px] text-emerald-600 font-extrabold mt-1">Active Staff: {analytics?.activeStaff || 46}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Attendance Rate</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">{analytics?.attendancePercentage || 94}%</div>
          <div className="text-[11px] text-slate-400 font-bold mt-1">Today's clock-in compliance</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Monthly Payroll Cost</div>
          <div className="text-3xl font-black text-indigo-600 mt-2">${analytics?.payrollCost?.toLocaleString() || '284,000'}</div>
          <div className="text-[11px] text-indigo-600 font-bold mt-1">Net compensation disbursement</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Overtime Hours</div>
          <div className="text-3xl font-black text-amber-600 mt-2">{analytics?.overtimeHours || 142.5} hrs</div>
          <div className="text-[11px] text-amber-600 font-bold mt-1">Critical care & emergency</div>
        </div>
      </div>

      {/* Navigation Sub-Links */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <Link href="/dashboard/hrms" className="px-4 py-2 bg-violet-50 text-violet-700 font-black text-xs rounded-xl">Overview</Link>
        <Link href="/dashboard/hrms/employees" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Employee Directory</Link>
        <Link href="/dashboard/hrms/attendance" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Attendance</Link>
        <Link href="/dashboard/hrms/shifts" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Shift Roster</Link>
        <Link href="/dashboard/hrms/leave" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Leave Requests</Link>
        <Link href="/dashboard/hrms/payroll" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Payroll & Payslips</Link>
      </div>

      {/* Employees Roster */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900">Hospital Staff Roster</h2>
          <Link href="/dashboard/hrms/employees" className="text-xs font-bold text-violet-600 hover:underline">View All Employees →</Link>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
                <th className="py-3 px-4">Emp Code</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Basic Salary</th>
                <th className="py-3 px-4">Net Salary</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.slice(0, 5).map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{emp.employeeCode}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{emp.fullName}</td>
                  <td className="py-3 px-4 text-slate-600">{emp.department?.name || 'General Medicine'}</td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{emp.designation}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full">{emp.employmentType}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">${emp.salaryStructure?.basicSalary || 45000}</td>
                  <td className="py-3 px-4 font-extrabold text-emerald-600">${emp.salaryStructure?.netSalary || 62262.5}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
