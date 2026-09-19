'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Clock,
  Layers,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  CreditCard,
  UserCheck,
  UserX,
  RotateCcw,
  Activity,
  Radio,
} from 'lucide-react';
import {
  getTelemetryState,
  subscribeTelemetry,
  triggerLiveBedBooking,
  triggerLiveBedDischarge,
  triggerLivePayment,
  triggerLiveEmergency,
  resetTelemetryToBaseline,
  HospitalId,
  GlobalTelemetryState,
  TelemetryBedCell,
} from '@/lib/realtime-telemetry';

export function InteractiveWardHeatmaps() {
  const [telemetry, setTelemetry] = useState<GlobalTelemetryState>(getTelemetryState());
  const [selectedHospitalId, setSelectedHospitalId] = useState<HospitalId>('HOSPITAL_A');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeBed, setActiveBed] = useState<TelemetryBedCell | null>(null);
  const [bookingPatientName, setBookingPatientName] = useState('Pooja Aggarwal');
  const [bookingDiagnosis, setBookingDiagnosis] = useState('Observation & Post-Op Care');
  const [liveToast, setLiveToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'bed' | 'payment' | 'emergency'>('bed');

  // Load authenticated user and enforce strict tenant hospital scoping
  useEffect(() => {
    try {
      const raw = localStorage.getItem('medinexa_user');
      if (raw) {
        const u = JSON.parse(raw);
        setCurrentUser(u);
        const userFacility = (u.facilityId || u.facility?.id || u.facility?.code || '').toUpperCase();
        const isSuperAdmin = ['SUPER_ADMIN', 'MEDINEXA_ADMIN'].includes(u.roleCode);
        const isPatient = u.roleCode === 'PATIENT';
        if (!isSuperAdmin && !isPatient && userFacility) {
          if (userFacility.includes('HOSPITAL_B')) {
            setSelectedHospitalId('HOSPITAL_B');
          } else {
            setSelectedHospitalId('HOSPITAL_A');
          }
        }
      }
    } catch {}
  }, []);

  // Subscribe to real-time events across BroadcastChannel, LocalStorage, and WebSockets
  useEffect(() => {
    const unsubscribe = subscribeTelemetry((newState) => {
      setTelemetry(newState);
      // Keep active bed selected if it was open
      if (activeBed) {
        const found = newState.hospitals[selectedHospitalId]?.beds.find((b) => b.id === activeBed.id);
        if (found) setActiveBed(found);
      }
    });
    return unsubscribe;
  }, [activeBed, selectedHospitalId]);

  const activeHospital = telemetry.hospitals[selectedHospitalId] || telemetry.hospitals.HOSPITAL_A;

  // Exact 25 General + 15 Semi-Private + 10 ICU = 50 Beds
  const generalBeds = (activeHospital.beds || []).filter((b) => b.ward === 'general');
  const semiPrivateBeds = (activeHospital.beds || []).filter((b) => b.ward === 'semiPrivate');
  const icuBeds = (activeHospital.beds || []).filter((b) => b.ward === 'icu');

  const showToast = (msg: string, type: 'bed' | 'payment' | 'emergency' = 'bed') => {
    setLiveToast(msg);
    setToastType(type);
    setTimeout(() => setLiveToast(null), 4500);
  };

  // 1. Quick Reception Bed Allocation
  const handleQuickBookBed = (bed?: TelemetryBedCell) => {
    const targetBed = bed || generalBeds.find((b) => b.status === 'available') || activeHospital.beds.find((b) => b.status === 'available');
    if (!targetBed) {
      showToast('All 50 beds in this hospital are currently occupied!', 'bed');
      return;
    }
    triggerLiveBedBooking({
      hospitalId: selectedHospitalId,
      bedId: targetBed.id,
      patientName: bookingPatientName || 'Ayush Singh',
      diagnosis: bookingDiagnosis || 'Clinical Inpatient Care',
    });
    showToast(`⚡ Reception Sync: Bed ${targetBed.number} allocated to ${bookingPatientName || 'Patient'}!`, 'bed');
    setActiveBed(null);
  };

  // 2. Discharge Bed
  const handleDischargeBed = (bed: TelemetryBedCell) => {
    triggerLiveBedDischarge({
      hospitalId: selectedHospitalId,
      bedId: bed.id,
    });
    showToast(`✓ Inpatient Discharged: Bed ${bed.number} is now Available & Cleaned!`, 'bed');
    setActiveBed(null);
  };

  // 3. Quick Payment Simulation
  const handleQuickPayment = (amount: number = 2500) => {
    triggerLivePayment({
      hospitalId: selectedHospitalId,
      amount,
      method: 'UPI',
      patientName: 'Reception Walk-in',
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    showToast(`💳 Payment Real-Time Sync: +₹${amount.toLocaleString('en-IN')} added to Daily Revenue!`, 'payment');
  };

  // 4. Quick Emergency SOS
  const handleQuickEmergency = () => {
    triggerLiveEmergency('RED');
    showToast('🚨 Emergency SOS Dispatched: ER Trauma Queue updated in real-time!', 'emergency');
  };

  // 5. Reset to clean baseline
  const handleResetBaseline = () => {
    resetTelemetryToBaseline();
    setActiveBed(null);
    showToast('↺ Real-time hospital metrics reset to clinical baseline.', 'bed');
  };

  const formattedRevenue = `₹${activeHospital.revenueToday.toLocaleString('en-IN')}`;
  const formattedTarget = `₹${activeHospital.dailyTarget.toLocaleString('en-IN')}`;

  const erTrendWave = [
    { level: 'Low', wait: 12 },
    { level: 'Mid', wait: telemetry.emergencyQueue.avgWaitMins - 4 },
    { level: '3rd', wait: telemetry.emergencyQueue.avgWaitMins + 7 },
    { level: 'High', wait: telemetry.emergencyQueue.avgWaitMins },
  ];

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-5 md:p-7 shadow-xs font-sans space-y-6 transition-colors duration-200">
      {/* Live Event Flash Alert Banner */}
      {liveToast && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between border shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastType === 'bed'
              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
              : toastType === 'payment'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-current animate-ping" />
            <span>{liveToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setLiveToast(null)}
            className="opacity-70 hover:opacity-100 cursor-pointer text-sm font-black ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header Bar: Hospital Switcher, Title & Real-Time Bed Census */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            <h2 className="text-sm md:text-base font-extrabold tracking-wide uppercase text-slate-900 dark:text-white">
              {activeHospital.name}
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" /> Live Telemetry Synced
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Live Campus:</span>
            <span>{activeHospital.campus}</span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">50-Bed Clinical Census</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Instant Cross-Tab Sync
            </span>
          </div>
        </div>

        {/* Hospital A vs Hospital B Selector & Census Summary */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Hospital Switcher Toggle: Open to Super Admin & Patients; Strictly Locked for Hospital Staff */}
          {(!currentUser || ['SUPER_ADMIN', 'MEDINEXA_ADMIN', 'PATIENT'].includes(currentUser?.roleCode)) ? (
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setSelectedHospitalId('HOSPITAL_A');
                  setActiveBed(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedHospitalId === 'HOSPITAL_A'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🏥 Hospital A (50 Beds)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedHospitalId('HOSPITAL_B');
                  setActiveBed(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedHospitalId === 'HOSPITAL_B'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🏥 Hospital B (50 Beds)
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-extrabold text-blue-700 dark:text-blue-300 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>🔒 {selectedHospitalId === 'HOSPITAL_B' ? 'Hospital B (Assigned Campus)' : 'Hospital A (Assigned Campus)'}</span>
              <span className="text-[10px] text-blue-500 font-semibold">• Multi-Tenant Scoped</span>
            </div>
          )}

          {/* Stats Badge */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-2xl">
            <div>
              <div className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Beds: <span className="text-blue-600 dark:text-blue-400 font-black">{activeHospital.totalBeds}</span>
              </div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Occupied: <span className="font-black text-slate-900 dark:text-white">{activeHospital.occupiedBeds}</span> | Available:{' '}
                <span className="text-emerald-600 dark:text-emerald-400 font-black">{activeHospital.availableBeds}</span>
              </div>
            </div>
            <div className="h-7 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
            <div className="min-w-[120px]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">Occ:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-xs">
                  {activeHospital.occupancyRate}% <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${activeHospital.occupancyRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Live Quick Actions Toolbar (User Testing & Instant Simulation) */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 dark:from-slate-800/60 dark:via-blue-950/20 dark:to-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500 animate-bounce" />
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
            Real-Time Live Event Connectors:
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            (Actions here or in Reception/Billing tabs reflect instantly across all pages)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleQuickBookBed()}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition"
          >
            <UserCheck className="w-3.5 h-3.5" /> + Book Bed (Reception)
          </button>

          <button
            type="button"
            onClick={() => handleQuickPayment(2500)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition"
          >
            <CreditCard className="w-3.5 h-3.5" /> + Pay ₹2,500 (Billing)
          </button>

          <button
            type="button"
            onClick={() => handleQuickEmergency()}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition"
          >
            <Activity className="w-3.5 h-3.5" /> + ER Trauma SOS
          </button>

          <button
            type="button"
            onClick={handleResetBaseline}
            title="Reset to Baseline"
            className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Main Dual-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Ward Occupancy Heatmaps (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-wide text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Interactive Ward Occupancy Heatmaps
            </h3>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
              50-Bed Clinical Grid ({activeHospital.shortName})
            </span>
          </div>

          {/* Ward 1: General Ward (25 Beds) */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">
                  {activeHospital.wards.general.name}
                </h4>
                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                  Occupancy: {activeHospital.wards.general.occupancyRate}%
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {activeHospital.wards.general.occupied}/{activeHospital.wards.general.total} beds occupied •{' '}
                  {activeHospital.wards.general.total - activeHospital.wards.general.occupied} available
                </div>
              </div>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {activeHospital.wards.general.badge}
              </span>
            </div>

            {/* Floor Map Graphic with 25 Bed Cells */}
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl relative overflow-hidden">
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 relative z-10">
                {generalBeds.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    title={`${b.number}: ${b.status.toUpperCase()} ${b.patient ? `(${b.patient} - ${b.diagnosis})` : 'Click to book'}`}
                    onClick={() => setActiveBed(b)}
                    className={`h-7 rounded-lg text-[10px] font-extrabold flex items-center justify-center transition-all hover:scale-105 cursor-pointer border ${
                      b.status === 'occupied'
                        ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-xs shadow-amber-500/20'
                        : b.status === 'cleaning'
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100'
                    } ${activeBed?.id === b.id ? 'ring-2 ring-blue-500 scale-105' : ''}`}
                  >
                    {b.number}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ward 2: Semi-Private & Deluxe Ward (15 Beds) */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">
                  {activeHospital.wards.semiPrivate.name}
                </h4>
                <div className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-0.5">
                  Occupancy: {activeHospital.wards.semiPrivate.occupancyRate}%
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {activeHospital.wards.semiPrivate.occupied}/{activeHospital.wards.semiPrivate.total} beds occupied •{' '}
                  {activeHospital.wards.semiPrivate.total - activeHospital.wards.semiPrivate.occupied} available
                </div>
              </div>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                {activeHospital.wards.semiPrivate.badge}
              </span>
            </div>

            {/* Floor Map Graphic with 15 Bed Cells */}
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl relative overflow-hidden">
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 relative z-10">
                {semiPrivateBeds.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    title={`${b.number}: ${b.status.toUpperCase()} ${b.patient ? `(${b.patient} - ${b.diagnosis})` : 'Click to book'}`}
                    onClick={() => setActiveBed(b)}
                    className={`h-7 rounded-lg text-[10px] font-extrabold flex items-center justify-center transition-all hover:scale-105 cursor-pointer border ${
                      b.status === 'occupied'
                        ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-600 shadow-xs shadow-rose-500/20'
                        : b.status === 'cleaning'
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100'
                    } ${activeBed?.id === b.id ? 'ring-2 ring-blue-500 scale-105' : ''}`}
                  >
                    {b.number}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ward 3: Critical Care ICU & CCU (10 Beds) */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">
                  {activeHospital.wards.icu.name}
                </h4>
                <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">
                  Occupancy: {activeHospital.wards.icu.occupancyRate}%
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {activeHospital.wards.icu.occupied}/{activeHospital.wards.icu.total} beds occupied •{' '}
                  {activeHospital.wards.icu.total - activeHospital.wards.icu.occupied} available
                </div>
              </div>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {activeHospital.wards.icu.badge}
              </span>
            </div>

            {/* Floor Map Graphic with 10 Bed Cells */}
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl relative overflow-hidden">
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 relative z-10">
                {icuBeds.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    title={`${b.number}: ${b.status.toUpperCase()} ${b.patient ? `(${b.patient} - ${b.diagnosis})` : 'Click to book'}`}
                    onClick={() => setActiveBed(b)}
                    className={`h-7 rounded-lg text-[10px] font-extrabold flex items-center justify-center transition-all hover:scale-105 cursor-pointer border ${
                      b.status === 'occupied'
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 shadow-xs shadow-indigo-500/20'
                        : b.status === 'cleaning'
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100'
                    } ${activeBed?.id === b.id ? 'ring-2 ring-blue-500 scale-105' : ''}`}
                  >
                    {b.number}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Census Color Legend Bar */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-medium text-slate-600 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-white">Status Key:</span>
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500" /> Available (Vacant)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-amber-500" /> General Occupied
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-500" /> Semi-Private Occupied
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-indigo-600" /> ICU Occupied
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-slate-300 dark:bg-slate-700" /> Cleaning
              </span>
            </div>
          </div>

          {/* Interactive Bed Details & Action Popover */}
          {activeBed && (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-200/80 dark:border-blue-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-black text-blue-700 dark:text-blue-300 uppercase text-sm">
                    Bed {activeBed.number}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase ${
                      activeBed.status === 'occupied'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                        : activeBed.status === 'available'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {activeBed.status}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 capitalize font-medium">
                    ({activeBed.ward} ward)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveBed(null)}
                  className="text-blue-700 dark:text-blue-300 hover:text-blue-900 font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {activeBed.status === 'occupied' ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-slate-800 dark:text-slate-100 font-bold text-xs">
                      Admitted Patient: <span className="text-blue-600 dark:text-blue-400">{activeBed.patient}</span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      Diagnosis: {activeBed.diagnosis || 'Clinical Care'} • Admitted: {activeBed.admittedAt ? new Date(activeBed.admittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDischargeBed(activeBed)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold cursor-pointer transition whitespace-nowrap"
                  >
                    ✓ Discharge & Free Bed
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-slate-600 dark:text-slate-300 text-xs">
                    This bed is currently <strong>Available</strong>. Book it directly from the reception desk:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={bookingPatientName}
                      onChange={(e) => setBookingPatientName(e.target.value)}
                      placeholder="Patient Name"
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                    />
                    <input
                      type="text"
                      value={bookingDiagnosis}
                      onChange={(e) => setBookingDiagnosis(e.target.value)}
                      placeholder="Diagnosis / Reason"
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleQuickBookBed(activeBed)}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Confirm Reception Bed Booking
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: ER Triage Queue, Admission Graph, OPD Revenue (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. Emergency ER Triage Queue */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-500" /> Emergency ER Triage Queue
              </h4>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                Avg Wait: <span className="text-slate-900 dark:text-white font-black">{telemetry.emergencyQueue.avgWaitMins} mins</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              {/* Triage Priority Levels */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center">
                      1
                    </span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">Red ({telemetry.emergencyQueue.red})</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">12 min</span>
                </div>
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-black text-[9px] flex items-center justify-center">
                      2
                    </span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">Orange ({telemetry.emergencyQueue.orange})</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">24 min</span>
                </div>
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-yellow-500 text-white font-black text-[9px] flex items-center justify-center">
                      3
                    </span>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">Yellow ({telemetry.emergencyQueue.yellow})</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">35 min</span>
                </div>
              </div>

              {/* Sparkline Curve */}
              <div className="h-20 w-full bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200/80 dark:border-slate-700/80">
                <div className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold px-1">Trend by wait acuity</div>
                <ResponsiveContainer width="100%" height="80%">
                  <AreaChart data={erTrendWave} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="erGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#eab308" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="wait" stroke="#f59e0b" strokeWidth={2} fill="url(#erGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 2. Active Admission Trends Graph (Last 24 Hours) */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">Active Admission Trends</h4>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Last 24 Hours ({activeHospital.shortName})</div>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" /> Admissions
                </span>
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-slate-400" /> Discharges
                </span>
              </div>
            </div>

            <div className="h-36 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetry.admissionTrends} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="admGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="disGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderColor: '#CBD5E1',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#0F172A',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Area type="monotone" dataKey="admissions" stroke="#2563eb" strokeWidth={2} fill="url(#admGradient)" dot={{ r: 3, fill: '#2563eb' }} />
                  <Area type="monotone" dataKey="discharges" stroke="#94a3b8" strokeWidth={1.5} fill="url(#disGradient)" dot={{ r: 2, fill: '#94a3b8' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Total Daily OPD Revenue (Live Calculated & Formatted) */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">
                Total Daily OPD Revenue (₹)
              </h4>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Real-Time Ledger
              </span>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Total Realized Revenue</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 flex items-baseline gap-2">
                <span>{formattedRevenue}</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Live</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-500 dark:text-slate-400">
                  Daily Target: <span className="text-slate-700 dark:text-slate-200 font-bold">{formattedTarget}</span>
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-black">{activeHospital.revenueTargetPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, activeHospital.revenueTargetPct)}%` }}
                />
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Payment Breakdown:</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Card: ₹{Math.round(activeHospital.collections.card / 1000)}k
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Cash: ₹{Math.round(activeHospital.collections.cash / 1000)}k
                </span>
                <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> UPI: ₹{Math.round(activeHospital.collections.upi / 1000)}k
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
