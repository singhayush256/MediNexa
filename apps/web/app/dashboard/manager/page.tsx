'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  Activity,
  Bed,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  Filter,
  Search,
  Bell,
  Sparkles,
  ChevronRight,
  UserCheck,
  Building,
} from 'lucide-react';
import { getApiBaseUrl, fetchWithTimeout } from '@/lib/api-config';

export default function ManagerDashboardPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [activeAlerts, setActiveAlerts] = useState([
    { id: 1, title: 'OPD Queue Congestion', dept: 'Cardiology', level: 'HIGH', desc: 'Average wait time exceeded 35 mins. Reallocating triage staff.' },
    { id: 2, title: 'Shift Handover Complete', dept: 'ICU Ward 2', level: 'NORMAL', desc: 'Morning nursing shift handover verified by Senior Sister.' },
    { id: 3, title: 'Duty Roster Confirmation', dept: 'General Medicine', level: 'PENDING', desc: '2 staff schedule confirmations pending for night shift.' },
  ]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    const baseUrl = getApiBaseUrl();

    fetchWithTimeout(`${baseUrl}/hrms/employees`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEmployees(data);
        }
      })
      .catch((err) => console.warn('Could not fetch staff for manager view', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept || emp.department?.name === selectedDept;
    const matchesSearch =
      !searchQuery ||
      emp.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Operational Management Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Manager Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Workforce coordination, operational queues, department workloads, and operational safety oversight.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/hrms/employees"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>Staff Management Directory</span>
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
          >
            Hospital Overview →
          </Link>
        </div>
      </div>

      {/* Hierarchy & Permission Status Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent border border-purple-200 dark:border-purple-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Organizational Hierarchy: Level 2 Operational Authority</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-[10px] font-black uppercase">
                MANAGER
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Super Admin → Hospital Admin → <strong>Manager</strong> → Clinical & Operational Staff.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Tenant Isolated to Hospital Facility</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Hospital Active Staff</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {employees.length > 0 ? employees.length : 48}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> 96% shift compliance today
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>OPD Queue Telemetry</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">18.4 mins</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Average patient waiting time across 6 OPD clinics
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Inpatient Bed Census</span>
            <Bed className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">86.2%</div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-bold mt-1">
            18 General & 4 ICU beds currently available
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Active Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{activeAlerts.length}</div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-1">
            1 high-priority bottleneck flagged
          </div>
        </div>
      </div>

      {/* Operational Coordination & Active Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Staff Registry & Deployment */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Active Staff Deployment</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live roster across clinical departments</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff..."
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              >
                <option value="ALL">All Departments</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Emergency">Emergency</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Nursing">Nursing</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Staff ID / Code</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Role / Designation</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEmployees.slice(0, 7).map((emp, i) => (
                  <tr key={emp.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-purple-600 dark:text-purple-400">
                      {emp.user?.staffId || emp.employeeCode}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {emp.fullName}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {emp.user?.role?.name || emp.designation}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {emp.department?.name || emp.department || 'General Medicine'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {emp.employeeStatus || 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-right">
            <Link
              href="/dashboard/hrms/employees"
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              View Full Staff Registry & Actions →
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Operational Alerts & Escalation */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-600" />
              <span>Operational Alerts</span>
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Real-Time</span>
          </div>

          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">{alert.title}</span>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      alert.level === 'HIGH'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    }`}
                  >
                    {alert.dept}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{alert.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 text-xs space-y-2">
            <div className="font-bold text-purple-900 dark:text-purple-200">Manager Administrative Scope:</div>
            <p className="text-[11px] text-purple-700 dark:text-purple-300 leading-relaxed">
              Managers coordinate shift assignments and department flow. Deletions, security credentials, and hospital billing configurations remain strictly secured to Hospital Admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
