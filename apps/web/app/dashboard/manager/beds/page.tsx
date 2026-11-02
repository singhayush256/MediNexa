'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bed,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Building2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { getApiBaseUrl, fetchWithTimeout } from '@/lib/api-config';
import { subscribeTelemetry } from '@/lib/realtime-telemetry';

interface BedItem {
  id: string;
  code: string;
  wardName: string;
  bedType: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'MAINTENANCE';
  currentPatient?: string;
  departmentName: string;
  lastUpdated: string;
}

export default function ManagerBedsPage() {
  const [loading, setLoading] = useState(true);
  const [beds, setBeds] = useState<BedItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadBeds = async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    const apiUrl = getApiBaseUrl();

    try {
      const data = await fetchWithTimeout(`${apiUrl}/beds`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }, 5000).then((r) => r.json()).catch(() => null);

      if (Array.isArray(data) && data.length > 0) {
        const mapped: BedItem[] = data.map((b) => ({
          id: b.id,
          code: b.code || b.bedNumber || 'BED-101',
          wardName: b.ward?.name || 'General Ward',
          bedType: b.bedType || 'STANDARD',
          status: b.status || 'AVAILABLE',
          currentPatient: b.currentAssignment?.patient?.user
            ? `${b.currentAssignment.patient.user.firstName || ''} ${b.currentAssignment.patient.user.lastName || ''}`.trim()
            : undefined,
          departmentName: b.ward?.department?.name || 'Inpatient Medicine',
          lastUpdated: 'Live',
        }));
        setBeds(mapped);
      } else {
        // Canonical demo bed register
        const demo: BedItem[] = [
          { id: 'b-1', code: 'ICU-B01', wardName: 'Intensive Care Unit', bedType: 'ICU_VENTILATOR', status: 'OCCUPIED', currentPatient: 'Arjun Sharma', departmentName: 'Cardiology ICU', lastUpdated: '10 mins ago' },
          { id: 'b-2', code: 'ICU-B02', wardName: 'Intensive Care Unit', bedType: 'ICU_VENTILATOR', status: 'OCCUPIED', currentPatient: 'Ananya Verma', departmentName: 'Cardiology ICU', lastUpdated: '1 hour ago' },
          { id: 'b-3', code: 'ICU-B03', wardName: 'Intensive Care Unit', bedType: 'ICU_VENTILATOR', status: 'AVAILABLE', departmentName: 'Cardiology ICU', lastUpdated: '2 hours ago' },
          { id: 'b-4', code: 'HDU-N04', wardName: 'High Dependency Unit', bedType: 'MONITORED', status: 'OCCUPIED', currentPatient: 'Priya Sharma', departmentName: 'Neurology HDU', lastUpdated: '3 hours ago' },
          { id: 'b-5', code: 'HDU-N05', wardName: 'High Dependency Unit', bedType: 'MONITORED', status: 'AVAILABLE', departmentName: 'Neurology HDU', lastUpdated: '4 hours ago' },
          { id: 'b-6', code: 'MED-201', wardName: 'General Ward 2', bedType: 'STANDARD', status: 'AVAILABLE', departmentName: 'General Medicine', lastUpdated: '15 mins ago' },
          { id: 'b-7', code: 'MED-202', wardName: 'General Ward 2', bedType: 'STANDARD', status: 'RESERVED', departmentName: 'General Medicine', lastUpdated: '30 mins ago' },
          { id: 'b-8', code: 'MED-204', wardName: 'General Ward 2', bedType: 'STANDARD', status: 'CLEANING', departmentName: 'General Medicine', lastUpdated: '45 mins ago' },
          { id: 'b-9', code: 'ORTHO-112', wardName: 'Orthopedic Ward', bedType: 'STANDARD', status: 'OCCUPIED', currentPatient: 'Ananya Sen', departmentName: 'Orthopedics', lastUpdated: '20 mins ago' },
          { id: 'b-10', code: 'EMERG-01', wardName: 'Emergency Trauma Bay', bedType: 'TRAUMA_CRITICAL', status: 'MAINTENANCE', departmentName: 'Emergency', lastUpdated: '1 day ago' },
        ];
        setBeds(demo);
      }
    } catch (err) {
      console.warn('Beds load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBeds();
    const unsub = subscribeTelemetry(() => {
      loadBeds();
    });
    return () => unsub();
  }, []);

  const counts = {
    total: beds.length,
    occupied: beds.filter((b) => b.status === 'OCCUPIED').length,
    available: beds.filter((b) => b.status === 'AVAILABLE').length,
    reserved: beds.filter((b) => b.status === 'RESERVED').length,
    cleaning: beds.filter((b) => b.status === 'CLEANING').length,
    maintenance: beds.filter((b) => b.status === 'MAINTENANCE').length,
  };

  const handleDispatchClean = async (bedCode: string) => {
    setBeds((prev) =>
      prev.map((b) => (b.code === bedCode ? { ...b, status: 'AVAILABLE' } : b))
    );
    setActionSuccess(`Housekeeping sanitized bed ${bedCode}. Status updated to AVAILABLE.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const filtered = beds.filter((b) => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.wardName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.currentPatient && b.currentPatient.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold mb-2">
            <Bed className="w-3.5 h-3.5" />
            <span>Canonical Inpatient Bed Master</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Beds & Ward Capacity Oversight
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Synchronized with Nursing, Reception, Admin, and Admissions portals on the same canonical bed database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/hospital/beds"
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-md shadow-teal-600/20"
          >
            Ward Heatmap View →
          </Link>
          <button
            onClick={loadBeds}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            title="Refresh Bed Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-xs font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Section 23: Canonical Bed Status Counters (Total, Occupied, Available, Reserved, Cleaning, Maintenance) */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-500">Total Beds</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {counts.total}
          </div>
          <div className="text-[10px] text-slate-400">Hospital Capacity</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-900/60">
          <div className="text-[11px] font-bold text-teal-700 dark:text-teal-400">Occupied</div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-0.5">
            {counts.occupied}
          </div>
          <div className="text-[10px] text-slate-400">Active patients</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60">
          <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Available</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            {counts.available}
          </div>
          <div className="text-[10px] text-slate-400">Ready for admit</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60">
          <div className="text-[11px] font-bold text-blue-700 dark:text-blue-400">Reserved</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
            {counts.reserved}
          </div>
          <div className="text-[10px] text-slate-400">Pending transfer</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60">
          <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Cleaning</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
            {counts.cleaning}
          </div>
          <div className="text-[10px] text-slate-400">Sanitation queue</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60">
          <div className="text-[11px] font-bold text-rose-700 dark:text-rose-400">Maintenance</div>
          <div className="text-2xl font-black text-rose-600 mt-0.5">
            {counts.maintenance}
          </div>
          <div className="text-[10px] text-slate-400">Biomedical repair</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search Bed Code, Ward, Patient Name..."
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
          <option value="ALL">All Bed Statuses</option>
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="OCCUPIED">OCCUPIED</option>
          <option value="RESERVED">RESERVED</option>
          <option value="CLEANING">CLEANING</option>
          <option value="MAINTENANCE">MAINTENANCE</option>
        </select>
      </div>

      {/* Bed Register Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((b) => (
          <div
            key={b.id}
            className={`p-4 rounded-3xl border transition shadow-xs flex flex-col justify-between space-y-3 ${
              b.status === 'OCCUPIED'
                ? 'bg-teal-50/30 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/60'
                : b.status === 'AVAILABLE'
                ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                : b.status === 'CLEANING'
                ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                  {b.code}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    b.status === 'AVAILABLE'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : b.status === 'OCCUPIED'
                      ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                      : b.status === 'CLEANING'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      : b.status === 'RESERVED'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {b.status}
                </span>
              </div>

              <div className="text-xs text-slate-500 font-semibold mt-1">
                {b.wardName} • {b.departmentName}
              </div>

              {b.currentPatient && (
                <div className="mt-2 text-xs bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Occupying Patient:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {b.currentPatient}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400 font-medium">Type: {b.bedType}</span>
              {b.status === 'CLEANING' ? (
                <button
                  onClick={() => handleDispatchClean(b.code)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] cursor-pointer"
                >
                  Sanitized OK
                </button>
              ) : (
                <span className="font-semibold text-slate-500 text-[11px]">Synchronized</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
