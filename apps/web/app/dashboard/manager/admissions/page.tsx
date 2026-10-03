'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DoorOpen,
  Bed,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  LogOut,
  Search,
  Filter,
  RefreshCw,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { getApiBaseUrl, fetchWithTimeout } from '@/lib/api-config';
import { subscribeTelemetry } from '@/lib/realtime-telemetry';

interface InpatientAdmission {
  id: string;
  admissionNumber: string;
  patientName: string;
  uhid: string;
  department: string;
  bedCode: string;
  admittedAt: string;
  admissionType: string;
  status: 'ADMITTED' | 'PLANNED' | 'DISCHARGE_PIPELINE' | 'TRANSFERRED';
  attendingDoctor: string;
}

export default function ManagerAdmissionsPage() {
  const [loading, setLoading] = useState(true);
  const [admissions, setAdmissions] = useState<InpatientAdmission[]>([]);
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'PLANNED' | 'DISCHARGE_PIPELINE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadAdmissions = async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    const apiUrl = getApiBaseUrl();

    try {
      const data = await fetchWithTimeout(`${apiUrl}/admissions`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }, 5000).then((r) => r.json()).catch(() => null);

      if (Array.isArray(data) && data.length > 0) {
        const mapped: InpatientAdmission[] = data.map((a) => ({
          id: a.id,
          admissionNumber: a.admissionNumber || `ADM-${a.id.slice(-6)}`,
          patientName: a.patient?.user
            ? `${a.patient.user.firstName || ''} ${a.patient.user.lastName || ''}`.trim()
            : a.patient?.name || 'Inpatient',
          uhid: a.patient?.uhid || a.patientId || 'UHID-2026',
          department: a.department?.name || 'General Medicine',
          bedCode: a.bedAssignments?.[0]?.bed?.code || a.bedAssignments?.[0]?.bed?.bedNumber || 'Assigned',
          admittedAt: a.admittedAt ? new Date(a.admittedAt).toLocaleDateString() : 'Today',
          admissionType: a.admissionType || 'EMERGENCY',
          status: a.status === 'DISCHARGED' ? 'DISCHARGE_PIPELINE' : (a.status as any) || 'ADMITTED',
          attendingDoctor: a.attendingDoctor?.name || 'Attending Physician',
        }));
        setAdmissions(mapped);
      } else {
        // Canonical demo admissions
        setAdmissions([
          {
            id: 'adm-101',
            admissionNumber: 'ADM-2026-0881',
            patientName: 'Sarah Jenkins',
            uhid: 'UHID-2026-0192',
            department: 'Cardiology ICU',
            bedCode: 'ICU-B02',
            admittedAt: 'Yesterday',
            admissionType: 'EMERGENCY',
            status: 'ADMITTED',
            attendingDoctor: 'Dr. Ayush Singh',
          },
          {
            id: 'adm-102',
            admissionNumber: 'ADM-2026-0884',
            patientName: 'Priya Sharma',
            uhid: 'UHID-2026-0244',
            department: 'Neurology HDU',
            bedCode: 'HDU-N04',
            admittedAt: 'Yesterday',
            admissionType: 'DIRECT',
            status: 'ADMITTED',
            attendingDoctor: 'Dr. Priya Sharma',
          },
          {
            id: 'adm-103',
            admissionNumber: 'ADM-2026-0889',
            patientName: 'Vikram Malhotra',
            uhid: 'UHID-2026-0312',
            department: 'General Medicine',
            bedCode: 'MED-305',
            admittedAt: 'Today',
            admissionType: 'OPD_TRANSFER',
            status: 'DISCHARGE_PIPELINE',
            attendingDoctor: 'Dr. Rajesh Gupta',
          },
          {
            id: 'adm-104',
            admissionNumber: 'ADM-2026-0892',
            patientName: 'Ananya Sen',
            uhid: 'UHID-2026-0428',
            department: 'Orthopedics Post-Op',
            bedCode: 'ORTHO-112',
            admittedAt: 'Today',
            admissionType: 'ELECTIVE',
            status: 'PLANNED',
            attendingDoctor: 'Dr. Vikram Malhotra',
          },
        ]);
      }
    } catch (err) {
      console.warn('Admissions load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmissions();
    const unsub = subscribeTelemetry(() => {
      loadAdmissions();
    });
    return () => unsub();
  }, []);

  const filtered = admissions.filter((a) => {
    const matchesTab =
      filterTab === 'ALL' ||
      (filterTab === 'ACTIVE' && a.status === 'ADMITTED') ||
      a.status === filterTab;
    const matchesSearch =
      !searchQuery ||
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.bedCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
            <DoorOpen className="w-3.5 h-3.5" />
            <span>Inpatient Admissions & Clearance Pipeline</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Hospital Admissions Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Coordinate active inpatient census, review planned admissions, and monitor the discharge clearance pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/manager/beds"
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-md shadow-teal-600/20"
          >
            Beds & Capacity →
          </Link>
          <button
            onClick={loadAdmissions}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            title="Refresh Admissions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: 'ALL', label: 'All Admissions' },
          { key: 'ACTIVE', label: 'Active Inpatients' },
          { key: 'PLANNED', label: 'Planned / Pending Bed' },
          { key: 'DISCHARGE_PIPELINE', label: 'Discharge Pipeline' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterTab === tab.key
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search Admission #, Patient Name, UHID, Bed Code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Admission #</th>
                <th className="py-3 px-4">Patient & UHID</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assigned Bed</th>
                <th className="py-3 px-4">Admission Type</th>
                <th className="py-3 px-4">Attending Doctor</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filtered.map((adm) => (
                <tr key={adm.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-teal-700 dark:text-teal-300">
                    {adm.admissionNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900 dark:text-white">
                      {adm.patientName}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">{adm.uhid}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    {adm.department}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                      {adm.bedCode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[11px] text-slate-500 font-semibold">
                    {adm.admissionType}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    {adm.attendingDoctor}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        adm.status === 'ADMITTED'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : adm.status === 'DISCHARGE_PIPELINE'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {adm.status.replace('_', ' ')}
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
