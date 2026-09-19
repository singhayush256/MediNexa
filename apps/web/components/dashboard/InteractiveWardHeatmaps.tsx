'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

interface BedCell {
  id: string;
  status: 'occupied' | 'available' | 'cleaning';
  number: string;
  patient?: string;
  diagnosis?: string;
}

interface HospitalWardConfig {
  name: string;
  total: number;
  occupied: number;
  occupancyRate: number;
  badge: string;
  badgeType: 'busy' | 'optimal' | 'monitored' | 'critical';
  prefix: string;
}

interface HospitalData {
  id: 'HOSPITAL_A' | 'HOSPITAL_B';
  name: string;
  shortName: string;
  campus: string;
  totalBeds: number; // Exactly 50 beds
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  revenueToday: string;
  wards: {
    general: HospitalWardConfig;
    semiPrivate: HospitalWardConfig;
    icu: HospitalWardConfig;
  };
}

// Exactly 50 beds per hospital configuration (Hospital A & Hospital B)
const HOSPITALS: Record<'HOSPITAL_A' | 'HOSPITAL_B', HospitalData> = {
  HOSPITAL_A: {
    id: 'HOSPITAL_A',
    name: 'MediNexa General Hospital (Hospital A)',
    shortName: 'Hospital A',
    campus: 'Knowledge Park II Facility, Greater Noida',
    totalBeds: 50,
    occupiedBeds: 39,
    availableBeds: 11,
    occupancyRate: 78.0,
    revenueToday: '₹14,82,500',
    wards: {
      general: {
        name: 'General Ward',
        total: 25,
        occupied: 19,
        occupancyRate: 76.0,
        badge: 'Optimal',
        badgeType: 'optimal',
        prefix: 'GW-',
      },
      semiPrivate: {
        name: 'Semi-Private & Deluxe Ward',
        total: 15,
        occupied: 12,
        occupancyRate: 80.0,
        badge: 'High Load',
        badgeType: 'busy',
        prefix: 'SP-',
      },
      icu: {
        name: 'Critical Care ICU & CCU',
        total: 10,
        occupied: 8,
        occupancyRate: 80.0,
        badge: 'Monitored',
        badgeType: 'monitored',
        prefix: 'ICU-',
      },
    },
  },
  HOSPITAL_B: {
    id: 'HOSPITAL_B',
    name: 'MediNexa Metro Hospital (Hospital B)',
    shortName: 'Hospital B',
    campus: 'Sector 62 Urban Campus, Noida',
    totalBeds: 50,
    occupiedBeds: 36,
    availableBeds: 14,
    occupancyRate: 72.0,
    revenueToday: '₹12,65,000',
    wards: {
      general: {
        name: 'General Ward',
        total: 25,
        occupied: 18,
        occupancyRate: 72.0,
        badge: 'Optimal',
        badgeType: 'optimal',
        prefix: 'GW-',
      },
      semiPrivate: {
        name: 'Semi-Private & Deluxe Ward',
        total: 15,
        occupied: 11,
        occupancyRate: 73.3,
        badge: 'Active',
        badgeType: 'busy',
        prefix: 'SP-',
      },
      icu: {
        name: 'Critical Care ICU & CCU',
        total: 10,
        occupied: 7,
        occupancyRate: 70.0,
        badge: 'Monitored',
        badgeType: 'monitored',
        prefix: 'ICU-',
      },
    },
  },
};

// Generate deterministic bed layouts strictly respecting exact ward counts
function generateWardBeds(total: number, occupiedCount: number, prefix: string, hospitalId: string): BedCell[] {
  const PATIENT_NAMES = [
    'Sarah Jenkins',
    'Priya Sharma',
    'Vikram Malhotra',
    'Ananya Sen',
    'Robert Chen',
    'Rajesh Verma',
    'Meera Patel',
    'Arjun Nair',
    'Sunil Mathur',
    'Pooja Aggarwal',
    'Kunal Singhania',
    'Deepak Chopra',
    'Anita Desai',
    'Rohan Gupta',
    'Kavita Rao',
    'Amitabh Banerjee',
    'Siddharth Joshi',
    'Neha Chawla',
    'Manoj Tiwari',
    'Preeti Saxena',
  ];

  const DIAGNOSES = [
    'Post-Op Recovery',
    'Acute Coronary Syndrome',
    'Type 2 Diabetes Mellitus',
    'Hypertension Observation',
    'Bacterial Pneumonia',
    'Orthopedic Post-Arthroplasty',
    'Gastroenteritis',
    'Cardiac Dysrhythmia',
  ];

  return Array.from({ length: total }, (_, i) => {
    const isOccupied = i < occupiedCount;
    const isCleaning = !isOccupied && i === occupiedCount;
    const patName = PATIENT_NAMES[(i + (hospitalId === 'HOSPITAL_B' ? 3 : 0)) % PATIENT_NAMES.length];
    const diag = DIAGNOSES[i % DIAGNOSES.length];

    return {
      id: `${hospitalId}-${prefix}${String(i + 1).padStart(2, '0')}`,
      number: `${prefix}${String(i + 1).padStart(2, '0')}`,
      status: isOccupied ? 'occupied' : isCleaning ? 'cleaning' : 'available',
      patient: isOccupied ? patName : undefined,
      diagnosis: isOccupied ? diag : undefined,
    };
  });
}

const admissionTrendData = [
  { time: '1 AM', admissions: 2, discharges: 1 },
  { time: '3 AM', admissions: 3, discharges: 2 },
  { time: '6 AM', admissions: 4, discharges: 2 },
  { time: '9 AM', admissions: 8, discharges: 5 },
  { time: '12 PM', admissions: 6, discharges: 4 },
  { time: '3 PM', admissions: 7, discharges: 5 },
  { time: '6 PM', admissions: 5, discharges: 4 },
  { time: '9 PM', admissions: 4, discharges: 3 },
  { time: '12 AM', admissions: 3, discharges: 2 },
];

const erTrendWave = [
  { level: 'Low', wait: 12 },
  { level: 'Mid', wait: 24 },
  { level: '3rd', wait: 35 },
  { level: 'High', wait: 28 },
];

export function InteractiveWardHeatmaps() {
  const [selectedHospitalId, setSelectedHospitalId] = useState<'HOSPITAL_A' | 'HOSPITAL_B'>('HOSPITAL_A');
  const [activeBed, setActiveBed] = useState<BedCell | null>(null);

  const activeHospital = HOSPITALS[selectedHospitalId];

  // Exactly 25 + 15 + 10 = 50 beds per hospital
  const generalBeds = generateWardBeds(
    activeHospital.wards.general.total,
    activeHospital.wards.general.occupied,
    activeHospital.wards.general.prefix,
    selectedHospitalId
  );

  const semiPrivateBeds = generateWardBeds(
    activeHospital.wards.semiPrivate.total,
    activeHospital.wards.semiPrivate.occupied,
    activeHospital.wards.semiPrivate.prefix,
    selectedHospitalId
  );

  const icuBeds = generateWardBeds(
    activeHospital.wards.icu.total,
    activeHospital.wards.icu.occupied,
    activeHospital.wards.icu.prefix,
    selectedHospitalId
  );

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-5 md:p-7 shadow-xs font-sans space-y-6 transition-colors duration-200">
      {/* Top Header Bar: Title, Hospital Switcher & Total Bed Census Pill */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            <h2 className="text-sm md:text-base font-extrabold tracking-wide uppercase text-slate-900 dark:text-white">
              {activeHospital.name}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Live Campus:</span>
            <span>{activeHospital.campus}</span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">50-Bed Clinical Census</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Live Hospital Sync
            </span>
          </div>
        </div>

        {/* Hospital A vs Hospital B Selector & Census Summary */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Hospital Switcher Toggle Buttons */}
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

          {/* Stats Badge */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-2xl">
            <div>
              <div className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Beds: <span className="text-blue-600 dark:text-blue-400 font-black">{activeHospital.totalBeds}</span>
              </div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Occupied: <span className="font-black text-slate-900 dark:text-white">{activeHospital.occupiedBeds}</span> | Available: <span className="text-emerald-600 dark:text-emerald-400 font-black">{activeHospital.availableBeds}</span>
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
                  {activeHospital.wards.general.occupied}/{activeHospital.wards.general.total} beds occupied • {activeHospital.wards.general.total - activeHospital.wards.general.occupied} available
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
                    title={`${b.number}: ${b.status.toUpperCase()} ${b.patient ? `(${b.patient} - ${b.diagnosis})` : ''}`}
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
                  {activeHospital.wards.semiPrivate.occupied}/{activeHospital.wards.semiPrivate.total} beds occupied • {activeHospital.wards.semiPrivate.total - activeHospital.wards.semiPrivate.occupied} available
                </div>
              </div>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                {activeHospital.wards.semiPrivate.badge}
              </span>
            </div>

            {/* Floor Map Graphic with 15 Bed Cells */}
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl relative overflow-hidden">
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 relative z-10">
                {semiPrivateBeds.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    title={`${b.number}: ${b.status.toUpperCase()} ${b.patient ? `(${b.patient} - ${b.diagnosis})` : ''}`}
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
                  {activeHospital.wards.icu.occupied}/{activeHospital.wards.icu.total} beds occupied • {activeHospital.wards.icu.total - activeHospital.wards.icu.occupied} available
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
                    title={`${b.number}: ${b.status.toUpperCase()} ${b.patient ? `(${b.patient} - ${b.diagnosis})` : ''}`}
                    onClick={() => setActiveBed(b)}
                    className={`h-7 rounded-lg text-[10px] font-extrabold flex items-center justify-center transition-all hover:scale-105 cursor-pointer border ${
                      b.status === 'occupied'
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 shadow-xs shadow-indigo-600/20'
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

          {/* Color Legend Bar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Census Legend:</span>
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-100 dark:bg-emerald-900 border border-emerald-500" /> Available Bed
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

          {/* Active Bed Details Callout */}
          {activeBed && (
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
              <div>
                <span className="font-black text-blue-700 dark:text-blue-300 uppercase">Bed {activeBed.number}</span> | Status:{' '}
                <span className="uppercase font-bold text-slate-900 dark:text-white">{activeBed.status}</span>{' '}
                {activeBed.patient && (
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    — Admitted: <strong>{activeBed.patient}</strong> ({activeBed.diagnosis})
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveBed(null)}
                className="text-blue-700 dark:text-blue-300 hover:text-blue-900 font-bold ml-2 text-sm"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Right Column: ER Triage Queue, Admission Graph, OPD Revenue (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. Emergency ER Triage Queue */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">Emergency ER Triage Queue</h4>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                Avg Wait: <span className="text-slate-900 dark:text-white font-black">28 mins</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              {/* Triage Priority Levels */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center">1</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">Red (ESI-1)</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">12 min</span>
                </div>
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-black text-[9px] flex items-center justify-center">2</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">Orange</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">24 min</span>
                </div>
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-yellow-500 text-white font-black text-[9px] flex items-center justify-center">3</span>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">Yellow</span>
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
                <AreaChart data={admissionTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
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

          {/* 3. Total Daily OPD Revenue */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">Total Daily OPD Revenue (₹)</h4>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Target Velocity</span>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Total Realized Revenue</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
                {activeHospital.revenueToday}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-500 dark:text-slate-400">Daily Target: <span className="text-slate-700 dark:text-slate-200 font-bold">₹15,50,000</span></span>
                <span className="text-blue-600 dark:text-blue-400 font-black">95.6%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full" style={{ width: '95.6%' }} />
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Payment Breakdown:</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Card</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Cash</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
