'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  Plus,
  ArrowRight,
  RefreshCw,
  Users,
  Bed,
  Calendar,
  Shield,
  Activity,
  AlertCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { getApiBaseUrl, fetchWithTimeout } from '@/lib/api-config';
import { getSuperAdminHospitalsList } from '@/lib/hospital-canonical-data';

export default function ExistingHospitalsPage() {
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState<any[]>(getSuperAdminHospitalsList());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [error, setError] = useState<string | null>(null);

  const fetchHospitals = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const apiUrl = getApiBaseUrl();
      let data: any[] = [];
      try {
        const res = await fetchWithTimeout(`${apiUrl}/super-admin/hospitals`, { headers }, 5000);
        if (res.ok) {
          data = await res.json();
        }
      } catch {
        // Cold start or offline fallback
      }

      setHospitals(getSuperAdminHospitalsList(data));
    } catch (err: any) {
      setHospitals(getSuperAdminHospitalsList([]));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const filteredHospitals = hospitals.filter((h) => {
    const matchesSearch =
      h.name?.toLowerCase().includes(search.toLowerCase()) ||
      h.code?.toLowerCase().includes(search.toLowerCase()) ||
      h.hospitalId?.toLowerCase().includes(search.toLowerCase()) ||
      h.city?.toLowerCase().includes(search.toLowerCase()) ||
      h.state?.toLowerCase().includes(search.toLowerCase()) ||
      h.admin?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      h.admin?.loginId?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ACTIVE') return h.status === 'ACTIVE';
    if (statusFilter === 'INACTIVE') return h.status !== 'ACTIVE';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-900">
              PLATFORM TENANT REGISTRY
            </span>
            <span className="text-xs text-slate-400 font-medium">Read-Only Administrative View</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight mt-1">
            Existing Hospitals Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Inspect all registered hospital tenants, capacity statistics, and designated administrators.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHospitals}
            disabled={loading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Directory
          </Button>
          <Link href="/super-admin/add-hospital">
            <Button
              variant="primary"
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
              icon={<Plus className="w-4 h-4" />}
            >
              Add Hospital
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs rounded-2xl flex items-center gap-2 font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Hospital ID, name, code, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === filter
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {filter === 'ALL'
                ? `All Hospitals (${hospitals.length})`
                : filter === 'ACTIVE'
                ? `Active (${hospitals.filter((h) => h.status === 'ACTIVE').length})`
                : `Inactive (${hospitals.filter((h) => h.status !== 'ACTIVE').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Hospitals Summary Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredHospitals.map((h) => (
          <div
            key={h.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs hover:border-purple-300 dark:hover:border-purple-800 transition space-y-4"
          >
            {/* Top Bar: Hospital ID, Name, Status, Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-purple-600 dark:text-purple-400 font-black text-xs px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800">
                      {h.hospitalId}
                    </span>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      {h.name}
                    </h2>
                    <span className="font-mono text-xs text-slate-400 font-bold">({h.code})</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {h.city}, {h.state} • {h.hospitalType?.replace(/_/g, ' ') || 'General Hospital'} • Reg: {new Date(h.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase border ${
                    h.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {h.status}
                </span>
                <Link href={`/super-admin/hospitals/${h.id}`}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                    icon={<Eye className="w-3.5 h-3.5" />}
                  >
                    Open Hospital
                  </Button>
                </Link>
              </div>
            </div>

            {/* Middle: Hospital Admin Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 text-xs">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Designated Hospital Administrator</span>
                  <span className="font-bold text-slate-900 dark:text-white">{h.admin?.fullName || 'Administrator'}</span>
                  <span className="text-slate-400 ml-1.5 font-normal">({h.admin?.email || 'N/A'})</span>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-400 text-[11px]">Login ID:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                  {h.admin?.loginId || 'N/A'}
                </span>
              </div>
            </div>

            {/* Bottom: Read-Only Statistics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1 text-center">
              <div className="p-2.5 bg-slate-50/70 dark:bg-slate-800/30 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Staff</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{h.stats?.totalStaff || 1}</span>
              </div>
              <div className="p-2.5 bg-slate-50/70 dark:bg-slate-800/30 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Doctors</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{h.stats?.totalDoctors || 0}</span>
              </div>
              <div className="p-2.5 bg-slate-50/70 dark:bg-slate-800/30 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Patients</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{h.stats?.totalPatients || 1}</span>
              </div>
              <div className="p-2.5 bg-slate-50/70 dark:bg-slate-800/30 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Beds</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{h.stats?.totalBeds || 0}</span>
              </div>
              <div className="p-2.5 bg-slate-50/70 dark:bg-slate-800/30 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Occupied</span>
                <span className="text-sm font-black text-amber-600 dark:text-amber-400">{h.stats?.occupiedBeds || 0}</span>
              </div>
              <div className="p-2.5 bg-slate-50/70 dark:bg-slate-800/30 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Available</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{h.stats?.availableBeds || 0}</span>
              </div>
              <div className="p-2.5 bg-slate-50/70 dark:bg-slate-800/30 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Admissions</span>
                <span className="text-sm font-black text-purple-600 dark:text-purple-400">{h.stats?.activeAdmissions || 0}</span>
              </div>
              <div className="p-2.5 bg-slate-50/70 dark:bg-slate-800/30 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Appts Today</span>
                <span className="text-sm font-black text-blue-600 dark:text-blue-400">{h.stats?.todayAppointments || 0}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredHospitals.length === 0 && !loading && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">No Hospital Facilities Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No hospital records matched your search query. Try clearing the search filter or register a new facility.
            </p>
            <Link href="/super-admin/add-hospital">
              <Button variant="primary" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold mt-2">
                Register New Hospital
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
