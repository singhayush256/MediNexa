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
  ArrowLeft,
  Info,
  Radio,
  Hospital,
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, StatCard } from '@/components/ui';
import { io, Socket } from 'socket.io-client';
import { getApiBaseUrl } from '@/lib/api-config';

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
  facilityId?: string;
  name: string;
  address?: string;
  phone?: string;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  icuBeds?: number;
  icuAvailable: number;
  generalBeds?: number;
  generalAvailable: number;
  emergencyBeds?: number;
  emergencyAvailable: number;
  status: string;
  indicator: 'green' | 'yellow' | 'red';
  lastUpdated: string;
}

interface LiveBedData {
  hospitalName: string;
  facilityId?: string;
  address?: string;
  phone?: string;
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
  const [selectedHospital, setSelectedHospital] = useState<FacilityBedCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const apiUrl = getApiBaseUrl();

  const fetchLiveBeds = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('medinexa_token') || localStorage.getItem('token')
          : null;

      const url = new URL(`${apiUrl}/bed-availability/live`);
      if (filterQuery.trim()) {
        url.searchParams.set('search', filterQuery.trim());
      }

      const res = await fetch(url.toString(), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const json: LiveBedData = await res.json();
        setData(json);

        // If a specific hospital is currently selected, keep its live stats refreshed
        if (selectedHospital && json.facilities) {
          const matched = json.facilities.find(
            (f) => f.id === selectedHospital.id || f.facilityId === selectedHospital.id
          );
          if (matched) {
            setSelectedHospital(matched);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch live bed metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setCountdown(15);
    }
  }, [apiUrl, filterQuery, selectedHospital]);

  // Initial load
  useEffect(() => {
    fetchLiveBeds();
  }, [fetchLiveBeds]);

  // WebSocket Live Real-Time Events Connection
  useEffect(() => {
    const wsUrl = apiUrl.replace(/\/api\/v1$/, '');
    let socket: Socket | null = null;
    try {
      socket = io(`${wsUrl}/events`, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        setIsLiveConnected(true);
      });

      socket.on('disconnect', () => {
        setIsLiveConnected(false);
      });

      // Universal live sync: Whenever any bed changes status anywhere in the hospital system
      socket.on('bed.status.changed', () => {
        fetchLiveBeds();
      });

      socket.on('bed.occupancy.updated', () => {
        fetchLiveBeds();
      });

      socket.on('bed.transfer.completed', () => {
        fetchLiveBeds();
      });
    } catch (e) {
      console.warn('WebSocket connection fallback to timer-based polling');
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [apiUrl, fetchLiveBeds]);

  // 15-second Auto Refresh Timer & Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchLiveBeds();
          return 15;
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
              REAL-TIME HOSPITAL BED TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Live Bed Availability
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time occupancy and bed availability across all network hospitals. Availability updates automatically the moment a patient is admitted or discharged.
          </p>
        </div>

        {/* Refresh Actions & Timer */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
            <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{isLiveConnected ? 'Live Socket Connected' : 'Auto-Sync Active'}</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{countdown}s</span>
          </div>

          <button
            onClick={() => fetchLiveBeds(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Patient Strict Read-Only Notice */}
      <div className="p-3.5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60 flex items-center justify-between gap-3 text-xs text-teal-900 dark:text-teal-200">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>
            <strong>Patient Read-Only Telemetry:</strong> Bed statuses and counts are updated live across all departments. Bed assignments, releases, and status changes are managed directly by hospital medical staff (Nurses, Receptionists, Doctors, and Hospital Admins).
          </span>
        </div>
        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-600 text-white shrink-0">
          LIVE FEED
        </span>
      </div>

      {/* Hospital Search & Selector Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Select Hospital to View Live Beds
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Choose any hospital by name to view its exact live bed breakdown
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Hospital Dropdown */}
          <select
            value={selectedHospital?.id || ''}
            onChange={(e) => {
              const facId = e.target.value;
              if (!facId) {
                setSelectedHospital(null);
              } else {
                const found = (data?.facilities || []).find((f) => f.id === facId);
                if (found) setSelectedHospital(found);
              }
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Network Hospitals (Overview)</option>
            {(data?.facilities || []).map((fac) => (
              <option key={fac.id} value={fac.id}>
                {fac.name} ({fac.availableBeds} beds available)
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search hospital name..."
              className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {selectedHospital && (
            <button
              onClick={() => setSelectedHospital(null)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: SPECIFIC HOSPITAL DETAIL (When a hospital is selected) */}
      {selectedHospital ? (
        <div className="space-y-6">
          {/* Hospital Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedHospital(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-300 hover:text-teal-200 mb-2 cursor-pointer transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Network Overview</span>
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
                    <Hospital className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black">{selectedHospital.name}</h2>
                    <p className="text-xs text-slate-300">
                      {selectedHospital.address || 'Medical District, Central Healthcare Corridor'} • Tel: {selectedHospital.phone || '+1 (800) 555-0199'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {getStatusBadge(selectedHospital.indicator, selectedHospital.status)}
                <Link
                  href="/portal/bed-bookings"
                  className="px-4 py-2 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold shadow-md transition"
                >
                  Reserve Bed Here
                </Link>
              </div>
            </div>
          </div>

          {/* Hospital Live KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Live Available Beds */}
            <Card className="p-5 border-emerald-500/30 bg-gradient-to-br from-white to-emerald-50/40 dark:from-slate-900 dark:to-emerald-950/20 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Live Available Beds</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                {selectedHospital.availableBeds}
              </div>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-1">
                Ready for immediate intake (Decrements live when admitted)
              </p>
            </Card>

            {/* Currently Occupied Beds */}
            <Card className="p-5 border-blue-500/30 bg-gradient-to-br from-white to-blue-50/40 dark:from-slate-900 dark:to-blue-950/20 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Occupied Beds</span>
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">
                {selectedHospital.occupiedBeds}
              </div>
              <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 mt-1">
                Admitted inpatients under active medical care
              </p>
            </Card>

            {/* Total Beds */}
            <Card className="p-5 border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total Capacity</span>
                <Bed className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">
                {selectedHospital.totalBeds}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Combined facility inpatient bed inventory
              </p>
            </Card>

            {/* Vacancy Rate */}
            <Card className="p-5 border-purple-500/30 bg-gradient-to-br from-white to-purple-50/40 dark:from-slate-900 dark:to-purple-950/20 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Vacancy Rate</span>
                <TrendingUp className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">
                {selectedHospital.totalBeds > 0
                  ? `${Math.round((selectedHospital.availableBeds / selectedHospital.totalBeds) * 100)}%`
                  : '0%'}
              </div>
              <p className="text-[11px] text-purple-700/80 dark:text-purple-300/80 mt-1">
                Current intake headroom available
              </p>
            </Card>
          </div>

          {/* Departmental Capacity Breakdown for Selected Hospital */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ICU Department */}
            <Card className="p-5 space-y-4 border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    CRITICAL CARE
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Intensive Care Unit (ICU)
                  </h3>
                </div>
                {getStatusBadge(selectedHospital.icuAvailable > 3 ? 'green' : selectedHospital.icuAvailable > 0 ? 'yellow' : 'red')}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Available</div>
                  <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {selectedHospital.icuAvailable}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Occupied</div>
                  <div className="text-xl font-extrabold text-slate-700 dark:text-slate-300">
                    {(selectedHospital.icuBeds || 20) - selectedHospital.icuAvailable}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total</div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    {selectedHospital.icuBeds || 20}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Equipped with mechanical ventilators, arterial lines, and 24/7 cardiac monitoring.
              </p>
            </Card>

            {/* General Wards */}
            <Card className="p-5 space-y-4 border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    INPATIENT CARE
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    General Admission Wards
                  </h3>
                </div>
                {getStatusBadge(selectedHospital.generalAvailable > 10 ? 'green' : selectedHospital.generalAvailable > 0 ? 'yellow' : 'red')}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Available</div>
                  <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {selectedHospital.generalAvailable}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Occupied</div>
                  <div className="text-xl font-extrabold text-slate-700 dark:text-slate-300">
                    {(selectedHospital.generalBeds || 60) - selectedHospital.generalAvailable}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total</div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    {selectedHospital.generalBeds || 60}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Standard and semi-private rooms with centralized nursing station support.
              </p>
            </Card>

            {/* Emergency Department */}
            <Card className="p-5 space-y-4 border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    TRAUMA & TRIAGE
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Emergency & Trauma Beds
                  </h3>
                </div>
                {getStatusBadge(selectedHospital.emergencyAvailable > 3 ? 'green' : selectedHospital.emergencyAvailable > 0 ? 'yellow' : 'red')}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Available</div>
                  <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {selectedHospital.emergencyAvailable}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Occupied</div>
                  <div className="text-xl font-extrabold text-slate-700 dark:text-slate-300">
                    {(selectedHospital.emergencyBeds || 20) - selectedHospital.emergencyAvailable}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total</div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    {selectedHospital.emergencyBeds || 20}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Immediate resuscitation, crash cart triage, and acute emergency care.
              </p>
            </Card>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: ALL HOSPITALS OVERVIEW */
        <div className="space-y-8">
          {/* Main Aggregated Bed Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Available Beds Card */}
            <Card className="relative overflow-hidden border-teal-500/20 bg-gradient-to-br from-white to-teal-50/40 dark:from-slate-900 dark:to-teal-950/20 shadow-md">
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Available Beds (Network)
                  </span>
                  <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <Bed className="w-4 h-4" />
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-teal-600 dark:text-teal-400">
                    {data?.availableBeds ?? 0}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    of {data?.totalBeds ?? 0} total
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-teal-100 dark:border-teal-900/40">
                  <span>Capacity Status</span>
                  {data && getStatusBadge(data.indicator, data.status)}
                </div>
              </div>
            </Card>

            {/* Occupied Beds Card */}
            <Card className="relative overflow-hidden border-blue-500/20 bg-gradient-to-br from-white to-blue-50/40 dark:from-slate-900 dark:to-blue-950/20 shadow-md">
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Occupied Inpatients
                  </span>
                  <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Activity className="w-4 h-4" />
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">
                    {data?.occupiedBeds ?? 0}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Active Patients
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-blue-100 dark:border-blue-900/40">
                  <span>Network Occupancy</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {data?.occupancyRate ?? 0}%
                  </span>
                </div>
              </div>
            </Card>

            {/* ICU Beds Free */}
            <Card className="relative overflow-hidden border-purple-500/20 bg-gradient-to-br from-white to-purple-50/40 dark:from-slate-900 dark:to-purple-950/20 shadow-md">
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    ICU Beds Available
                  </span>
                  <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Activity className="w-4 h-4" />
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400">
                    {data?.icu.available ?? 0}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    of {data?.icu.total ?? 0} ICU units
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-purple-100 dark:border-purple-900/40">
                  <span>Critical Care Units</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    Ventilator Supported
                  </span>
                </div>
              </div>
            </Card>

            {/* Emergency Beds Free */}
            <Card className="relative overflow-hidden border-rose-500/20 bg-gradient-to-br from-white to-rose-50/40 dark:from-slate-900 dark:to-rose-950/20 shadow-md">
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Emergency Beds Free
                  </span>
                  <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <Activity className="w-4 h-4" />
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400">
                    {data?.emergency.available ?? 0}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    of {data?.emergency.total ?? 0} Trauma units
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-rose-100 dark:border-rose-900/40">
                  <span>Immediate Triage</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    24/7 Rapid Intake
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Hospital Network Facilities Grid */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span>Network Hospital Facilities</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click any hospital card to open its live bed telemetry view
                </p>
              </div>

              {/* Status Filter Buttons */}
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

            {/* Facilities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFacilities.map((fac) => (
                <Card
                  key={fac.id}
                  onClick={() => setSelectedHospital(fac)}
                  className="p-5 space-y-4 hover:shadow-xl hover:border-teal-500/50 transition-all duration-200 border-slate-200 dark:border-slate-800 cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                        {fac.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Synced: {new Date(fac.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {getStatusBadge(fac.indicator, fac.status)}
                  </div>

                  {/* Bed Numbers Summary */}
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

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
                    <span className="font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Open Live Beds</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>

                    <Link
                      href="/portal/bed-bookings"
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-sm transition"
                    >
                      Reserve Bed
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

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
