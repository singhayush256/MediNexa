'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  Bed,
  Pill,
  Car,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  Building2,
  Calendar,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Radio,
  ExternalLink,
  ChevronRight,
  HeartPulse,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from 'recharts';
import { UnifiedDashboardMetricsDto } from '@medinexa/types';

const BED_COLORS = {
  GENERAL: '#3b82f6',
  ICU: '#ef4444',
  EMERGENCY: '#f97316',
  OXYGEN: '#06b6d4',
  VENTILATOR: '#8b5cf6',
  PRIVATE: '#10b981',
};

export default function RealTimeCommandCenterDashboard() {
  const [metrics, setMetrics] = useState<UnifiedDashboardMetricsDto | null>(null);
  const [facilities, setFacilities] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('medinexa_token') || localStorage.getItem('token');
  };

  const getHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    async function loadFacilities() {
      try {
        const res = await fetch(`${apiUrl}/facilities`, { headers: getHeaders() });
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data.data || [];
          setFacilities(items);
          if (items.length > 0 && !selectedFacility) {
            setSelectedFacility(items[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load facilities', err);
      }
    }
    loadFacilities();
  }, []);

  const fetchRealtimeMetrics = async (facilityId?: string) => {
    try {
      const q = facilityId ? `?facilityId=${facilityId}` : '';
      const res = await fetch(`${apiUrl}/command-center/realtime-metrics${q}`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      } else {
        throw new Error('Failed to retrieve real-time telemetry metrics');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching real-time dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRealtimeMetrics(selectedFacility);
    const interval = setInterval(() => fetchRealtimeMetrics(selectedFacility), 12000);
    return () => clearInterval(interval);
  }, [selectedFacility]);

  // Derived Bed Distribution Data for Recharts Pie
  const bedPieData = metrics?.bedOccupancy?.byType
    ? Object.entries(metrics.bedOccupancy.byType).map(([type, stats]) => ({
        name: type,
        value: stats.occupied,
        available: stats.available,
        total: stats.total,
      }))
    : [];

  const adherenceBarData = metrics?.medicationAdherence
    ? [
        { name: 'Taken', count: metrics.medicationAdherence.takenDoses, fill: '#10b981' },
        { name: 'Missed', count: metrics.medicationAdherence.missedDoses, fill: '#ef4444' },
        { name: 'Skipped', count: metrics.medicationAdherence.skippedDoses, fill: '#f59e0b' },
      ]
    : [];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen font-sans">
      {/* Top Real-Time Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black mb-2">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> Live Telemetry Grid (12s Sync)
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            MediNexa Real-Time Executive Command Center
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Integrated live monitoring of hospital bed capacities, admission trajectories, medicine adherence, and emergency fleet routing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {facilities.length > 0 && (
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {facilities.map((fac) => (
                <option key={fac.id} value={fac.id}>{fac.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => {
              setRefreshing(true);
              fetchRealtimeMetrics(selectedFacility);
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          {error}
        </div>
      )}

      {/* Module Quick Jump Nav Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Link
          href="/dashboard/hospital/beds"
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-sky-400 shadow-xs transition flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Bed className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Bed Network</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          href="/dashboard/bed-bookings"
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 shadow-xs transition flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Bed Bookings</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          href="/dashboard/medication-reminders"
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 shadow-xs transition flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Pill className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Medicine Reminders</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          href="/dashboard/emergency-ambulance"
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-rose-400 shadow-xs transition flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Emergency SOS</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          href="/dashboard/ai/occupancy-forecast"
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 shadow-xs transition flex items-center justify-between col-span-2 sm:col-span-1"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">AI Surge ML</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Bed Occupancy */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Bed Occupancy</span>
            <Bed className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-3xl font-black text-slate-900">{metrics?.bedOccupancy?.occupancyRate ?? 76}%</p>
            <span className="text-xs font-bold text-slate-500">
              {metrics?.bedOccupancy?.occupiedBeds ?? 0} / {metrics?.bedOccupancy?.totalBeds ?? 0} Beds
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                (metrics?.bedOccupancy?.occupancyRate || 0) >= 85 ? 'bg-rose-500' : 'bg-sky-600'
              }`}
              style={{ width: `${metrics?.bedOccupancy?.occupancyRate || 76}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Medicine Adherence */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Medicine Adherence</span>
            <Pill className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-3xl font-black text-emerald-600">
              {metrics?.medicationAdherence?.overallComplianceScore ?? 92}/100
            </p>
            <span className="text-xs font-bold text-emerald-700">
              {metrics?.medicationAdherence?.adherenceRate ?? 88}% Taken
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            {metrics?.medicationAdherence?.takenDoses ?? 0} Taken • {metrics?.medicationAdherence?.missedDoses ?? 0} Missed
          </span>
        </div>

        {/* Metric 3: Emergency Dispatch */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Active Emergency SOS</span>
            <Activity className="w-4 h-4 text-rose-600 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-3xl font-black text-rose-600">
              {metrics?.emergencyMonitoring?.activeSosRequests ?? 2} Active
            </p>
            <span className="text-xs font-bold text-slate-500">
              {metrics?.emergencyMonitoring?.availableAmbulances ?? 6} ALS Ready
            </span>
          </div>
          <span className="text-[11px] text-rose-600 font-bold mt-2 block">
            Avg EMS ETA: {metrics?.emergencyMonitoring?.avgResponseTimeMinutes ?? 6.5} mins
          </span>
        </div>

        {/* Metric 4: ICU Utilization */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Critical Care Headroom</span>
            <HeartPulse className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-3xl font-black text-indigo-700">
              {metrics?.emergencyMonitoring?.criticalBedHeadroom ?? 8} Free
            </p>
            <span className="text-xs font-bold text-indigo-600">
              {metrics?.hospitalUtilization?.icuLoadPercentage ?? 80}% ICU Load
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            ALOS: {metrics?.hospitalUtilization?.averageLengthOfStayDays ?? 4.8} days • Turnover: {metrics?.hospitalUtilization?.bedTurnoverRate ?? 1.4}x
          </span>
        </div>
      </div>

      {/* Main Split: Bed Breakdown & 7-Day Admission Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart 1: Bed Occupancy Breakdown by Type (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-sky-600" /> Live Bed Utilization
            </h3>
            <span className="text-xs font-bold text-slate-400">By Ward Category</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={bedPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {bedPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={(BED_COLORS as any)[entry.name] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {bedPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50">
                <span className="flex items-center gap-1.5 font-bold text-slate-700">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: (BED_COLORS as any)[item.name] || '#94a3b8' }}
                  />
                  {item.name}
                </span>
                <span className="font-mono text-slate-500">
                  {item.value}/{item.total}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: 7-Day Admission vs Discharge Trajectory (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" /> Inpatient Admission & Discharge Trends
              </h3>
              <p className="text-xs text-slate-400">7-day patient flow trajectory across emergency & elective admissions</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-indigo-600">
                <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" /> Admissions
              </span>
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Discharges
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics?.admissionTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAdm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorDis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="admissions" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorAdm)" name="Admissions" />
                <Area type="monotone" dataKey="discharges" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorDis)" name="Discharges" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Split: Medicine Adherence + Emergency Fleet Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Medicine Adherence Analytics */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-600" /> Patient Medication Adherence Telemetry
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {metrics?.medicationAdherence?.overallComplianceScore || 92}% Health Score
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Real-time compliance tracking across scheduled prescriptions, patient mobile check-ins, and nurse administration logs.
          </p>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adherenceBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center pt-2 border-t border-slate-100">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Doses Taken</span>
              <span className="text-base font-black text-emerald-900">{metrics?.medicationAdherence?.takenDoses ?? 0}</span>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-100">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">Doses Missed</span>
              <span className="text-base font-black text-rose-900">{metrics?.medicationAdherence?.missedDoses ?? 0}</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">Doses Skipped</span>
              <span className="text-base font-black text-amber-900">{metrics?.medicationAdherence?.skippedDoses ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Emergency Requests & Ambulance Telemetry */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-600 animate-pulse" /> Emergency Response & Fleet Telemetry
            </h3>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Code Red Active
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Live GPS telemetry dispatch tracking, priority trauma channel alerts, and direct nearest critical bed reservation.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-400 block">Active SOS Dispatches</span>
              <p className="text-2xl font-black text-rose-600 mt-1">
                {metrics?.emergencyMonitoring?.activeSosRequests ?? 2} Units
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">Priority Green Wave Enabled</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-400 block">Available Fleet</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {metrics?.emergencyMonitoring?.availableAmbulances ?? 6} ALS
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">Stationed on Hospital Pad</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-950 block">Critical Bed Headroom</span>
              <p className="text-xs text-indigo-700 mt-0.5">
                {metrics?.emergencyMonitoring?.criticalBedHeadroom ?? 8} free ICU, Ventilator, and Emergency beds ready for immediate trauma intake.
              </p>
            </div>
            <Link
              href="/dashboard/emergency-ambulance"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold whitespace-nowrap shadow-xs"
            >
              Open EMS Grid ↗
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
