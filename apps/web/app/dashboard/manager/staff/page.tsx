'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Building2,
  CalendarCheck,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { getApiBaseUrl, fetchWithTimeout } from '@/lib/api-config';
import { getHospitalStaffList, CanonicalStaffMember } from '@/lib/hospital-canonical-data';

export default function ManagerStaffManagementPage() {
  const [staff, setStaff] = useState<CanonicalStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const fetchStaffData = async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    const activeHosp = typeof window !== 'undefined' ? localStorage.getItem('medinexa_active_hospital_id') || 'HOSPITAL_A' : 'HOSPITAL_A';
    const apiUrl = getApiBaseUrl();

    try {
      const data = await fetchWithTimeout(`${apiUrl}/hrms/employees`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }, 5000).then((r) => r.json()).catch(() => null);

      const resolved = getHospitalStaffList(Array.isArray(data) ? data : undefined, activeHosp);
      setStaff(resolved);
    } catch (err) {
      console.warn('Error loading staff for manager, used canonical fallback:', err);
      setStaff(getHospitalStaffList(undefined, activeHosp));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const filteredStaff = staff.filter((s) => {
    const matchesDept = selectedDept === 'ALL' || s.department === selectedDept;
    const matchesRole = selectedRole === 'ALL' || s.roleCode === selectedRole || s.role === selectedRole;
    const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;
    const matchesSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.staffLoginId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.designation.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDept && matchesRole && matchesStatus && matchesSearch;
  });

  const uniqueDepartments = Array.from(new Set(staff.map((s) => s.department).filter(Boolean)));
  const uniqueRoles = Array.from(new Set(staff.map((s) => s.roleCode || s.role).filter(Boolean)));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Operational Staff Directory</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Staff Management & Roster Alignment
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational overview of doctors, nurses, paramedics, and support personnel assigned to your facility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/manager/staff-deployment"
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-md shadow-teal-600/20 flex items-center gap-2"
          >
            <span>Staff Deployment Matrix →</span>
          </Link>
          <button
            onClick={fetchStaffData}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            title="Refresh Staff List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search Staff Login ID, Name, Designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
          />
        </div>

        {/* Dept Filter */}
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
        >
          <option value="ALL">All Departments ({uniqueDepartments.length})</option>
          {uniqueDepartments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Role Filter */}
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
        >
          <option value="ALL">All Roles ({uniqueRoles.length})</option>
          {uniqueRoles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Staff Login ID</th>
                <th className="py-3 px-4">Role & Designation</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Current Shift</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No staff records match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        {s.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{s.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-700 dark:text-teal-300">
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800/60">
                        {s.staffLoginId}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {s.role}
                      </div>
                      <div className="text-[11px] text-slate-400">{s.designation}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {s.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Morning (08-16)
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {s.status === 'ACTIVE' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/dashboard/manager/shifts?staffId=${s.id}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-100 text-slate-700 hover:text-teal-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-teal-950/60 font-bold text-[11px] transition inline-flex items-center gap-1"
                      >
                        <span>Roster</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
