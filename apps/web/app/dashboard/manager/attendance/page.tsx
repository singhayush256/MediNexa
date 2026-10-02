'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { getApiBaseUrl, fetchWithTimeout } from '@/lib/api-config';
import { getHospitalStaffList, CanonicalStaffMember } from '@/lib/hospital-canonical-data';

interface AttendanceRecord {
  id: string;
  staffName: string;
  staffLoginId: string;
  department: string;
  shift: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'OVERTIME';
  checkIn: string;
  checkOut: string;
  workedHours: string;
  source: 'BIOMETRIC' | 'FACIAL_RECOGNITION' | 'PORTAL' | 'MANUAL';
  date: string;
}

export default function ManagerAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadAttendance = async () => {
    setLoading(true);
    const activeHosp = typeof window !== 'undefined' ? localStorage.getItem('medinexa_active_hospital_id') || 'HOSPITAL_A' : 'HOSPITAL_A';
    const staffList = getHospitalStaffList(undefined, activeHosp);

    // Generate canonical attendance records aligned with actual staff members
    const todayStr = new Date().toISOString().split('T')[0];
    const generated: AttendanceRecord[] = staffList.map((s, idx) => {
      // Deterministic status assignment
      let st: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'OVERTIME' = 'PRESENT';
      let checkInTime = '07:54 AM';
      let checkOutTime = 'In Progress';
      let worked = '4.5 hrs';
      let src: 'BIOMETRIC' | 'FACIAL_RECOGNITION' | 'PORTAL' = 'BIOMETRIC';

      if (idx === 1) {
        st = 'LATE';
        checkInTime = '08:24 AM';
        worked = '3.8 hrs';
        src = 'FACIAL_RECOGNITION';
      } else if (idx === 3) {
        st = 'LEAVE';
        checkInTime = '--';
        checkOutTime = '--';
        worked = '0.0 hrs';
      } else if (idx === 5) {
        st = 'ABSENT';
        checkInTime = '--';
        checkOutTime = '--';
        worked = '0.0 hrs';
      } else if (idx === 2) {
        st = 'OVERTIME';
        checkInTime = '07:15 AM';
        worked = '5.2 hrs';
      }

      return {
        id: `att-${s.id}-${todayStr}`,
        staffName: s.name,
        staffLoginId: s.staffLoginId,
        department: s.department,
        shift: 'Morning (08:00 - 16:00)',
        status: st,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        workedHours: worked,
        source: src,
        date: todayStr,
      };
    });

    setRecords(generated);
    setLoading(false);
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const counts = {
    present: records.filter((r) => r.status === 'PRESENT').length,
    late: records.filter((r) => r.status === 'LATE').length,
    leave: records.filter((r) => r.status === 'LEAVE').length,
    absent: records.filter((r) => r.status === 'ABSENT').length,
    overtime: records.filter((r) => r.status === 'OVERTIME').length,
  };

  const filtered = records.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      r.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.staffLoginId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Workforce Attendance Register</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Shift Attendance & Biometric Punches
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Realtime clock-in, late arrivals, approved leave, overtime tracking, and terminal punch verification.
          </p>
        </div>

        <button
          onClick={loadAttendance}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition self-start sm:self-auto cursor-pointer"
          title="Refresh Attendance"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 5 Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-500">Present</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            {counts.present}
          </div>
          <div className="text-[10px] text-slate-400">On time</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-500">Late Arrivals</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
            {counts.late}
          </div>
          <div className="text-[10px] text-slate-400">Punched {'>'} 08:15</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-500">On Leave</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
            {counts.leave}
          </div>
          <div className="text-[10px] text-slate-400">Approved HRMS</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-500">Absent</div>
          <div className="text-2xl font-black text-rose-600 mt-0.5">
            {counts.absent}
          </div>
          <div className="text-[10px] text-slate-400">Unnotified</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-500">Overtime</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5">
            {counts.overtime}
          </div>
          <div className="text-[10px] text-slate-400">Shift extended</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search Staff Name, Login ID, Department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
        >
          <option value="ALL">All Statuses</option>
          <option value="PRESENT">PRESENT</option>
          <option value="LATE">LATE</option>
          <option value="LEAVE">LEAVE</option>
          <option value="ABSENT">ABSENT</option>
          <option value="OVERTIME">OVERTIME</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Staff Login ID</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">Worked Hours</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No attendance records found matching filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">
                      {r.staffName}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-purple-700 dark:text-purple-300">
                      {r.staffLoginId}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {r.department}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{r.shift}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {r.checkIn}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {r.workedHours}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          r.status === 'PRESENT'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : r.status === 'LATE'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : r.status === 'LEAVE'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : r.status === 'OVERTIME'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {r.source}
                      </span>
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
