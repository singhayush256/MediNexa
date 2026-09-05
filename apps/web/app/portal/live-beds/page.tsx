'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Bed,
  Activity,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  Phone,
  Navigation,
  ArrowUpRight,
  TrendingUp,
  SlidersHorizontal,
  Search,
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, StatCard } from '@/components/ui';

interface DepartmentStatus {
  name: string;
  total: number;
  available: number;
  occupied: number;
  status: 'AVAILABLE' | 'LIMITED' | 'FULL';
  indicator: 'green' | 'yellow' | 'red';
}

interface FacilityBedCard {
  id: string;
  name: string;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  icuAvailable: number;
  generalAvailable: number;
  emergencyAvailable: number;
  status: string;
  indicator: 'green' | 'yellow' | 'red';
  lastUpdated: string;
}

interface LiveBedData {
  hospitalName: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  status: 'AVAILABLE' | 'LIMITED' | 'FULL';
  indicator: 'green' | 'yellow' | 'red';
  lastUpdated: string;
  icu: { total: number; available: number; occupied: number };
  general: { total: number; available: number; occupied: number };
  emergency: { total: number; available: number; occupied: number };
  departments: DepartmentStatus[];
  facilities?: FacilityBedCard[];
}

export default function LiveBedAvailabilityPage() {
  const [data, setData] = useState<LiveBedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const fetchLiveBeds = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('medinexa_token') || localStorage.getItem('token')
          : null;

      const res = await fetch(`${apiUrl}/bed-availability/live`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.warn('Failed to fetch live bed metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setCountdown(30);
    }
  }, [apiUrl]);

  // Initial load
  useEffect(() => {
    fetchLiveBeds();
  }, [fetchLiveBeds]);

  // 30-second Auto Refresh Timer & Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchLiveBeds();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchLiveBeds]);

  const getStatusBadge = (indicator: 'green' | 'yellow' | 'red', statusText?: string) => {
    if (indicator === 'green') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {statusText || 'Available'}
        </span>
      );
    }
    if (indicator === 'yellow') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          {statusText || 'Limited'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
        {statusText || 'Full'}
      </span>
    );
  };

  const filteredFacilities = (data?.facilities || []).filter((fac) => {
    const matchName = fac.name.toLowerCase().includes(filterQuery.toLowerCase());
    if (selectedStatus === 'ALL') return matchName;
    if (selectedStatus === 'AVAILABLE') return matchName && fac.indicator === 'green';
    if (selectedStatus === 'LIMITED') return matchName && fac.indicator === 'yellow';
    if (selectedStatus === 'FULL') return matchName && fac.indicator === 'red';
    return matchName;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              REAL-TIME HOSPITAL ADMISSIONS TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Live Bed Availability
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Direct telemetry from MediNexa Central and regional hospital facilities. Real-time updates every 30 seconds.
          </p>
        </div>

        {/* Refresh Actions & Timer */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Refreshes in <span className="font-bold text-teal-600 dark:text-teal-400">{countdown}s</span></span>
          </div>

          <button
            onClick={() => fetchLiveBeds(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh Now'}</span>
          </button>
        </div>
      </div>

      {/* Main Aggregated Bed Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Beds Card */}
        <Card className="relative overflow-hidden border-teal-500/20 bg-gradient-to-br from-white to-teal-50/40 dark:from-slate-900 dark:to-teal-950/20 shadow-md">
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Available Beds
              </span>
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                <Bed className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {loading ? '...' : data?.availableBeds ?? 0}
              </div>
              <div>
                {data && getStatusBadge(data.indicator, data.status)}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Ready for Immediate Admission</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {data ? `${Math.round(((data.availableBeds || 0) / (data.totalBeds || 1)) * 100)}% free` : ''}
              </span>
            </div>
          </div>
        </Card>

        {/* Total Beds Card */}
        <Card className="p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Bed Capacity
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {loading ? '...' : data?.totalBeds ?? 0}
          </div>
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
            Across {data?.facilities?.length || 6} Hospital Facilities
          </div>
        </Card>

        {/* Occupied Beds Card */}
        <Card className="p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Occupied Beds
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {loading ? '...' : data?.occupiedBeds ?? 0}
          </div>
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
            Active Inpatient Census
          </div>
        </Card>

        {/* Occupancy Rate Card */}
        <Card className="p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Occupancy Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {loading ? '...' : `${data?.occupancyRate ?? 0}%`}
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                (data?.occupancyRate || 0) >= 90
                  ? 'bg-rose-500'
                  : (data?.occupancyRate || 0) >= 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, data?.occupancyRate || 0)}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Department Breakdown Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Department Capacity Breakdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Critical care, general admission, and emergency department telemetry
            </p>
          </div>
          <Link
            href="/portal/bed-bookings"
            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>Request Inpatient Hold</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ICU Department */}
          <Card className="p-5 space-y-4 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  CRITICAL CARE
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Intensive Care Unit (ICU)
                </h3>
              </div>
              {data && getStatusBadge(data.icu.available > 5 ? 'green' : data.icu.available > 0 ? 'yellow' : 'red')}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Available</div>
                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {data?.icu.available ?? 0}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Occupied</div>
                <div className="text-xl font-extrabold text-slate-700 dark:text-slate-300">
                  {data?.icu.occupied ?? 0}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Total</div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {data?.icu.total ?? 0}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Equipped with ventilators & telemetry</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {data ? `${Math.round(((data.icu.available || 0) / (data.icu.total || 1)) * 100)}% Vacant` : ''}
              </span>
            </div>
          </Card>

          {/* General Ward */}
          <Card className="p-5 space-y-4 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  INPATIENT CARE
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  General Admission Wards
                </h3>
              </div>
              {data && getStatusBadge(data.general.available > 15 ? 'green' : data.general.available > 0 ? 'yellow' : 'red')}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Available</div>
                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {data?.general.available ?? 0}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Occupied</div>
                <div className="text-xl font-extrabold text-slate-700 dark:text-slate-300">
                  {data?.general.occupied ?? 0}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Total</div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {data?.general.total ?? 0}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Standard & Semi-private rooms</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {data ? `${Math.round(((data.general.available || 0) / (data.general.total || 1)) * 100)}% Vacant` : ''}
              </span>
            </div>
          </Card>

          {/* Emergency Department */}
          <Card className="p-5 space-y-4 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  TRAUMA & TRIAGE
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Emergency & Trauma Beds
                </h3>
              </div>
              {data && getStatusBadge(data.emergency.available > 5 ? 'green' : data.emergency.available > 0 ? 'yellow' : 'red')}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Available</div>
                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {data?.emergency.available ?? 0}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Occupied</div>
                <div className="text-xl font-extrabold text-slate-700 dark:text-slate-300">
                  {data?.emergency.occupied ?? 0}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Total</div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {data?.emergency.total ?? 0}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Rapid triage, crash carts & resuscitation</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {data ? `${Math.round(((data.emergency.available || 0) / (data.emergency.total || 1)) * 100)}% Vacant` : ''}
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Hospital Network Facilities Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Network Hospital Facilities
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live capacity breakdown across all connected hospitals in your network
            </p>
          </div>

          {/* Filter & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search facility name..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              {(['ALL', 'AVAILABLE', 'LIMITED', 'FULL'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    selectedStatus === status
                      ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFacilities.map((fac) => (
            <Card key={fac.id} className="p-5 space-y-4 hover:shadow-lg transition-all duration-200 border-slate-200 dark:border-slate-800">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {fac.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Synced: {new Date(fac.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {getStatusBadge(fac.indicator, fac.status)}
              </div>

              {/* Bed Numbers */}
              <div className="grid grid-cols-4 gap-2 text-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 text-xs">
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Available</div>
                  <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    {fac.availableBeds}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">ICU Free</div>
                  <div className="font-extrabold text-purple-600 dark:text-purple-400 text-sm">
                    {fac.icuAvailable}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">General</div>
                  <div className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                    {fac.generalAvailable}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Emergency</div>
                  <div className="font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                    {fac.emergencyAvailable}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <Link
                  href="/portal/nearby-hospitals"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </Link>

                <Link
                  href="/portal/bed-bookings"
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition"
                >
                  Reserve Bed
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Emergency Hotline Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-rose-600 via-rose-700 to-amber-700 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl shrink-0">
            <Phone className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block mb-1">
              EMERGENCY AMBULANCE & TRAUMA DISPATCH
            </div>
            <h3 className="text-base sm:text-lg font-extrabold">
              Need an Emergency ICU Bed Right Now?
            </h3>
            <p className="text-xs text-rose-100 max-w-xl">
              MediNexa Emergency Coordinators are on standby 24/7. Call our priority triage hotline for instant hospital admission authorization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:108"
            className="px-5 py-2.5 rounded-2xl bg-white text-rose-700 font-extrabold text-xs sm:text-sm hover:bg-rose-50 shadow-lg transition"
          >
            Call 108 Emergency
          </a>
          <a
            href="tel:18005550199"
            className="px-4 py-2.5 rounded-2xl bg-rose-900/60 hover:bg-rose-900 text-white font-bold text-xs sm:text-sm border border-white/20 transition"
          >
            +1 (800) 555-0199
          </a>
        </div>
      </div>
    </div>
  );
}
