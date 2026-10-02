'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  Bed,
  Stethoscope,
  Activity,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  getHospitalDepartmentList,
  CanonicalDepartment,
} from '@/lib/hospital-canonical-data';

interface DepartmentDetail extends CanonicalDepartment {
  headOfDepartment: string;
  nursesCount: number;
  activePatients: number;
  queueWaiting: number;
  bedTotal: number;
  bedOccupied: number;
  utilizationPercent: number;
  activeAlerts: number;
}

export default function ManagerDepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadDepartments = () => {
    setLoading(true);
    const activeHosp = typeof window !== 'undefined' ? localStorage.getItem('medinexa_active_hospital_id') || 'HOSPITAL_A' : 'HOSPITAL_A';
    const list = getHospitalDepartmentList(undefined, activeHosp);

    const detailed: DepartmentDetail[] = list.map((dept, idx) => {
      const heads = [
        'Dr. Ayush Singh (Cardiology Lead)',
        'Dr. Rajesh Gupta (Medicine Lead)',
        'Dr. Priya Sharma (Neurology Lead)',
        'Dr. Vikram Malhotra (Orthopedics Lead)',
        'Dr. Robert Chen (Critical Care Lead)',
        'Dr. Anita Desai (Pediatrics Lead)',
      ];

      const bedTotals = [8, 16, 6, 10, 8, 6];
      const bedOccs = [6, 12, 4, 7, 7, 3];
      const queues = [14, 18, 5, 8, 2, 9];

      const bTotal = bedTotals[idx % bedTotals.length];
      const bOcc = bedOccs[idx % bedOccs.length];

      return {
        ...dept,
        headOfDepartment: heads[idx % heads.length],
        nursesCount: Math.round(dept.staffCount * 0.65),
        activePatients: bOcc + queues[idx % queues.length],
        queueWaiting: queues[idx % queues.length],
        bedTotal: bTotal,
        bedOccupied: bOcc,
        utilizationPercent: Math.round((bOcc / bTotal) * 100),
        activeAlerts: idx === 0 ? 1 : idx === 4 ? 2 : 0,
      };
    });

    setDepartments(detailed);
    setLoading(false);
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const filtered = departments.filter((d) => {
    return (
      !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.headOfDepartment.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Clinical & Operational Units</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            My Authorized Departments
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational coordination across clinical departments, staffing allocations, queues, and bed capacities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/manager/department-performance"
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-md shadow-purple-600/20 flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Department Performance →</span>
          </Link>
          <button
            onClick={loadDepartments}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            title="Refresh Departments"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search Department Name, Code, Head of Department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
          />
        </div>
      </div>

      {/* Department Cards Grid conforming to Section 20 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((dept) => (
          <div
            key={dept.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-300 dark:hover:border-purple-700 transition"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {dept.code}
                </span>
                {dept.activeAlerts > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" /> {dept.activeAlerts} Alert
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Nominal
                  </span>
                )}
              </div>

              <h3 className="text-base font-black text-slate-900 dark:text-white mt-2">
                {dept.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Head: {dept.headOfDepartment}
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-500 text-[11px] block">Doctors / Staff:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {dept.doctorCount} Doctors • {dept.staffCount} Staff
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Nurses on Duty:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {dept.nursesCount} Nurses
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 text-[11px] block">Beds & Occupancy:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {dept.bedOccupied} / {dept.bedTotal} ({dept.utilizationPercent}%)
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 text-[11px] block">OPD Queue:</span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400">
                  {dept.queueWaiting} Waiting
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                href={`/dashboard/manager/opd?dept=${dept.code}`}
                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-purple-600"
              >
                Inspect Queue
              </Link>
              <Link
                href={`/dashboard/manager/beds?dept=${dept.code}`}
                className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-100 transition flex items-center gap-1"
              >
                <span>Beds & Capacity</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
