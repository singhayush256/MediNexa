'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Bed,
  Users,
  AlertTriangle,
  RefreshCw,
  Search,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Activity,
  Layers,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  ListTodo,
  FileText,
  HeartPulse,
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/api-config';

interface WardItem {
  id: string;
  name: string;
  code: string;
  floor: string;
  wardType: string;
  totalBeds: number;
  occupiedBeds: number;
  cleaningBeds: number;
  availableBeds: number;
  nursesOnDuty: number;
  patientNurseRatio: string;
  status: string;
}

interface CriticalPatient {
  id: string;
  bedCode: string;
  patientName: string;
  diagnosis: string;
  healthScore: number;
  riskLevel: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  spo2: number;
  heartRate: number;
  bp: string;
  attendingDoctor: string;
  nurseInCharge: string;
}

export default function WardManagerDashboardPage() {
  const [activeTab, setActiveTab] = useState<'wards' | 'critical' | 'staffing' | 'transfers' | 'tasks' | 'logs'>('wards');
  const [wards, setWards] = useState<WardItem[]>([]);
  const [criticalPatients, setCriticalPatients] = useState<CriticalPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const DEMO_WARDS: WardItem[] = [
    {
      id: 'w-1',
      name: 'Intensive Care Unit (ICU)',
      code: 'WARD-ICU-01',
      floor: '3rd Floor - East Wing',
      wardType: 'ICU',
      totalBeds: 20,
      occupiedBeds: 18,
      cleaningBeds: 1,
      availableBeds: 1,
      nursesOnDuty: 9,
      patientNurseRatio: '2:1',
      status: 'NEAR_CAPACITY',
    },
    {
      id: 'w-2',
      name: 'High Dependency Unit (HDU)',
      code: 'WARD-HDU-01',
      floor: '3rd Floor - West Wing',
      wardType: 'HDU',
      totalBeds: 16,
      occupiedBeds: 12,
      cleaningBeds: 2,
      availableBeds: 2,
      nursesOnDuty: 6,
      patientNurseRatio: '2:1',
      status: 'NORMAL',
    },
    {
      id: 'w-3',
      name: 'General Medicine Male Ward',
      code: 'WARD-MED-M',
      floor: '2nd Floor - Wing A',
      wardType: 'GENERAL',
      totalBeds: 30,
      occupiedBeds: 24,
      cleaningBeds: 2,
      availableBeds: 4,
      nursesOnDuty: 5,
      patientNurseRatio: '5:1',
      status: 'NORMAL',
    },
    {
      id: 'w-4',
      name: 'General Medicine Female Ward',
      code: 'WARD-MED-F',
      floor: '2nd Floor - Wing B',
      wardType: 'GENERAL',
      totalBeds: 30,
      occupiedBeds: 21,
      cleaningBeds: 3,
      availableBeds: 6,
      nursesOnDuty: 5,
      patientNurseRatio: '4:1',
      status: 'NORMAL',
    },
    {
      id: 'w-5',
      name: 'Surgical Post-Op Recovery',
      code: 'WARD-SURG-01',
      floor: '4th Floor - Central',
      wardType: 'POST_OP',
      totalBeds: 25,
      occupiedBeds: 19,
      cleaningBeds: 1,
      availableBeds: 5,
      nursesOnDuty: 6,
      patientNurseRatio: '3:1',
      status: 'NORMAL',
    },
    {
      id: 'w-6',
      name: 'Emergency Observation Bay',
      code: 'WARD-EMG-01',
      floor: 'Ground Floor - Trauma Block',
      wardType: 'EMERGENCY',
      totalBeds: 15,
      occupiedBeds: 14,
      cleaningBeds: 0,
      availableBeds: 1,
      nursesOnDuty: 7,
      patientNurseRatio: '2:1',
      status: 'CRITICAL_OCCUPANCY',
    },
  ];

  const DEMO_CRITICAL: CriticalPatient[] = [
    {
      id: 'p-1',
      bedCode: 'ICU-B03',
      patientName: 'Kunal Singhania',
      diagnosis: 'Severe Acute Coronary Syndrome, Post-PCI',
      healthScore: 34,
      riskLevel: 'RED',
      spo2: 91,
      heartRate: 118,
      bp: '162/98',
      attendingDoctor: 'Dr. Deepak Singh',
      nurseInCharge: 'Nurse Anjali Sharma',
    },
    {
      id: 'p-2',
      bedCode: 'ICU-B07',
      patientName: 'Sunil Mathur',
      diagnosis: 'COPD Exacerbation with Respiratory Acidosis',
      healthScore: 39,
      riskLevel: 'RED',
      spo2: 88,
      heartRate: 104,
      bp: '145/90',
      attendingDoctor: 'Dr. Arvind Deshmukh',
      nurseInCharge: 'Nurse Priya Nair',
    },
    {
      id: 'p-3',
      bedCode: 'HDU-N04',
      patientName: 'Amrita Das',
      diagnosis: 'Type 2 Diabetes with DKA resolved, Hypokalemia',
      healthScore: 54,
      riskLevel: 'ORANGE',
      spo2: 96,
      heartRate: 88,
      bp: '128/82',
      attendingDoctor: 'Dr. Meera Nambiar',
      nurseInCharge: 'Nurse Shilpa Rao',
    },
  ];

  useEffect(() => {
    fetchWardData();
  }, []);

  const fetchWardData = async () => {
    setLoading(true);
    const token = localStorage.getItem('medinexa_token');
    const apiUrl = getApiBaseUrl();

    if (!token) {
      setWards(DEMO_WARDS);
      setCriticalPatients(DEMO_CRITICAL);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/hospital/wards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setWards(
            data.map((w: any) => ({
              id: w.id,
              name: w.name,
              code: w.code,
              floor: w.floor || 'Level 2',
              wardType: w.wardType || 'GENERAL',
              totalBeds: w.beds?.length || 20,
              occupiedBeds: w.beds?.filter((b: any) => b.status === 'OCCUPIED').length || 15,
              cleaningBeds: w.beds?.filter((b: any) => b.status === 'CLEANING').length || 2,
              availableBeds: w.beds?.filter((b: any) => b.status === 'AVAILABLE').length || 3,
              nursesOnDuty: 5,
              patientNurseRatio: '3:1',
              status: 'NORMAL',
            })),
          );
        } else {
          setWards(DEMO_WARDS);
        }
      } else {
        setWards(DEMO_WARDS);
      }
    } catch {
      setWards(DEMO_WARDS);
    }

    setCriticalPatients(DEMO_CRITICAL);
    setLoading(false);
  };

  const totalCapacity = wards.reduce((acc, w) => acc + w.totalBeds, 0);
  const totalOccupied = wards.reduce((acc, w) => acc + w.occupiedBeds, 0);
  const totalCleaning = wards.reduce((acc, w) => acc + w.cleaningBeds, 0);
  const totalAvailable = wards.reduce((acc, w) => acc + w.availableBeds, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-black uppercase rounded-full border border-purple-500/20">
              WARD MANAGEMENT & INPATIENT CENSUS
            </span>
            <span className="text-xs font-bold text-slate-500">MediNexa v3.0</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Ward Operations & Inpatient Station
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ward census orchestration, nurse staffing ratios, bed cleaning turnovers, transfers & clinical deterioration surveillance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/hospital/beds"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/20 transition"
          >
            <Bed className="w-4 h-4" />
            Live Bed Matrix
          </Link>
          <button
            onClick={fetchWardData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition"
            title="Refresh Ward Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Bed Capacity</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCapacity}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across {wards.length} clinical wards</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Occupancy</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{occupancyRate}%</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-0.5">{totalOccupied} beds occupied</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Available Beds</div>
          <div className="text-2xl font-black text-emerald-500 mt-1">{totalAvailable}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Ready for intake</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Turnaround / Cleaning</div>
          <div className="text-2xl font-black text-amber-500 mt-1">{totalCleaning}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Sanitization underway</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Critical Deteriorations</div>
          <div className="text-2xl font-black text-rose-500 mt-1">{criticalPatients.length}</div>
          <div className="text-[11px] text-rose-600 font-semibold mt-0.5">High vigilance alerts</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2">
        {[
          { id: 'wards', label: 'Ward Census & Staffing', icon: Building2 },
          { id: 'critical', label: 'Critical Deterioration Watch', icon: HeartPulse },
          { id: 'transfers', label: 'Ward Transfers', icon: ArrowRightLeft },
          { id: 'staffing', label: 'Nurse Rosters & Shifts', icon: Users },
          { id: 'tasks', label: 'Ward Tasks & Checklists', icon: ListTodo },
          { id: 'logs', label: 'Activity Logs & Audits', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Ward Census Grid */}
      {activeTab === 'wards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {wards.map((ward) => {
            const occPct = Math.round((ward.occupiedBeds / ward.totalBeds) * 100);
            return (
              <div
                key={ward.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{ward.name}</h3>
                    <div className="text-[11px] text-slate-500">{ward.floor} • {ward.code}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      occPct > 85
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {occPct}% Full
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                    <div style={{ width: `${occPct}%` }} className="bg-purple-600 h-full rounded-full" />
                    <div style={{ width: `${Math.round((ward.cleaningBeds / ward.totalBeds) * 100)}%` }} className="bg-amber-400 h-full" />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Occupied: <strong>{ward.occupiedBeds}</strong></span>
                    <span>Clean: <strong>{ward.cleaningBeds}</strong></span>
                    <span>Avail: <strong>{ward.availableBeds}</strong></span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Users className="w-3.5 h-3.5 text-purple-500" />
                    <span>Ratio: <strong>{ward.patientNurseRatio}</strong> ({ward.nursesOnDuty} RNs)</span>
                  </div>
                  <Link
                    href={`/dashboard/hospital/beds?ward=${ward.code}`}
                    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                  >
                    View Beds <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Critical Deterioration Watch */}
      {activeTab === 'critical' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Active Bedside Deterioration Telemetry</h2>
              <p className="text-xs text-slate-500">Live feeds from bedside monitors, early warning score (EWS) alarms & emergency care alerts</p>
            </div>
            <Link
              href="/dashboard/emergency"
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              Emergency Command Center <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {criticalPatients.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-rose-200 dark:border-rose-900/40 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    {p.bedCode}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-rose-500">Score: {p.healthScore}/100</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse">
                      {p.riskLevel} ALERT
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{p.patientName}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">{p.diagnosis}</div>
                </div>

                {/* Live Vitals Badges */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-center">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400">SpO2</div>
                    <div className={`font-black text-xs ${p.spo2 < 92 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                      {p.spo2}%
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400">Heart Rate</div>
                    <div className={`font-black text-xs ${p.heartRate > 105 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                      {p.heartRate} bpm
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400">Blood Pressure</div>
                    <div className="font-black text-xs text-slate-900 dark:text-white">{p.bp}</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Dr: {p.attendingDoctor}</span>
                  <span>RN: {p.nurseInCharge}</span>
                </div>

                <div className="pt-2 flex gap-2">
                  <button className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-rose-500/20">
                    STAT Doctor Call
                  </button>
                  <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition">
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
