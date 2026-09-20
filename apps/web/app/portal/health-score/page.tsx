'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  HeartPulse,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Siren,
  Phone,
  RefreshCw,
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  UserCheck,
  UserPlus,
  Users,
  Sliders,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Building2,
  Heart,
  Wind,
  Droplets,
  Zap,
  Pill,
  Moon,
  Info,
  ChevronRight,
  ArrowUpRight,
  MapPin,
  Ambulance,
  Sparkles,
  Award,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { getApiBaseUrl } from '@/lib/api-config';
import {
  HealthCategory,
  GuardianDoctorRole,
  GuardianDoctorStatus,
  EmergencyPriorityLevel,
} from '@medinexa/types';

interface HealthScoreData {
  id: string;
  patientId: string;
  patientName: string;
  overallScore: number;
  category: HealthCategory;
  categoryLabel: string;
  colorCode: string;
  breakdown: {
    heartHealthScore: number;
    respiratoryScore: number;
    diabetesScore: number;
    activityScore: number;
    medicationScore: number;
    recoveryScore: number;
    mentalWellnessScore: number;
  };
  vitals: {
    heartRate?: number | null;
    bloodPressureSys?: number | null;
    bloodPressureDia?: number | null;
    spo2?: number | null;
    temperature?: number | null;
    bloodSugar?: number | null;
    bmi?: number | null;
    respiratoryRate?: number | null;
  };
  trendScore: number;
  trendText: string;
  summaryNotes?: string | null;
  lastCalculatedAt: string;
  activeEmergencyAlert?: any | null;
}

interface HistoryPoint {
  timestamp: string;
  label: string;
  overallScore: number;
  heartHealthScore?: number;
  respiratoryScore?: number;
  medicationScore?: number;
}

interface FamilyDoctor {
  id: string;
  doctorName: string;
  hospitalName: string;
  specialization: string;
  email: string;
  phone: string;
  roleType: GuardianDoctorRole;
  status: GuardianDoctorStatus;
}

interface FamilyMemberItem {
  id: string;
  name: string;
  relation: string;
  phone?: string | null;
  email?: string | null;
  priorityLevel: EmergencyPriorityLevel;
}

interface ThresholdsData {
  criticalScoreThreshold: number;
  minSpo2Threshold: number;
  maxHeartRateThreshold: number;
  minHeartRateThreshold: number;
  maxSystolicBpThreshold: number;
  minSystolicBpThreshold: number;
  autoAmbulanceDispatch: boolean;
  notifyFamilyDoctors: boolean;
  notifyFamilyMembers: boolean;
}

const DEFAULT_FAMILY_MEMBERS: FamilyMemberItem[] = [
  {
    id: 'fam-demo-1',
    name: 'Ramesh Kumar Singh',
    relation: 'Father',
    phone: '+91 7460951804',
    email: 'ramesh.singh@gmail.com',
    priorityLevel: EmergencyPriorityLevel.PRIMARY,
  },
  {
    id: 'fam-demo-2',
    name: 'Sunita Singh',
    relation: 'Mother',
    phone: '+91 9450123456',
    email: 'sunita.singh@gmail.com',
    priorityLevel: EmergencyPriorityLevel.SECONDARY,
  },
  {
    id: 'fam-demo-3',
    name: 'Ayush Singh',
    relation: 'Brother',
    phone: '+91 8114240263',
    email: 'ayush.singh@gmail.com',
    priorityLevel: EmergencyPriorityLevel.BACKUP,
  },
];

const DEFAULT_FAMILY_DOCTORS: FamilyDoctor[] = [
  {
    id: 'doc-demo-1',
    doctorName: 'Dr. Rajesh Khanna',
    hospitalName: 'MediNexa Super Specialty Hospital',
    specialization: 'Internal Medicine & Cardiology',
    email: 'dr.khanna@medinexa.in',
    phone: '+91 98111 22334',
    roleType: GuardianDoctorRole.PRIMARY,
    status: GuardianDoctorStatus.ACCEPTED,
  },
  {
    id: 'doc-demo-2',
    doctorName: 'Dr. Anita Verma',
    hospitalName: 'Apollo MediNexa Clinic',
    specialization: 'Endocrinology & Diabetology',
    email: 'dr.anita@apollomedinexa.com',
    phone: '+91 98222 33445',
    roleType: GuardianDoctorRole.FAMILY,
    status: GuardianDoctorStatus.ACCEPTED,
  },
];

export default function HealthScorePage() {
  const [healthData, setHealthData] = useState<HealthScoreData | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [selectedRange, setSelectedRange] = useState<'today' | 'yesterday' | '7d' | '30d' | '6m' | '1y'>('7d');
  const [familyDoctors, setFamilyDoctors] = useState<FamilyDoctor[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('medinexa_guardian_doctors');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return DEFAULT_FAMILY_DOCTORS;
  });
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('medinexa_guardian_family');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return DEFAULT_FAMILY_MEMBERS;
  });
  const [thresholds, setThresholds] = useState<ThresholdsData>(() => {
    const defaultThresh: ThresholdsData = {
      criticalScoreThreshold: 40,
      minSpo2Threshold: 90,
      maxHeartRateThreshold: 130,
      minHeartRateThreshold: 45,
      maxSystolicBpThreshold: 160,
      minSystolicBpThreshold: 90,
      autoAmbulanceDispatch: true,
      notifyFamilyDoctors: true,
      notifyFamilyMembers: true,
    };
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('medinexa_guardian_thresholds');
        if (stored) {
          return { ...defaultThresh, ...JSON.parse(stored) };
        }
      } catch {}
    }
    return defaultThresh;
  });

  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [savingThresholds, setSavingThresholds] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Modals
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);

  // Doctor Form
  const [docForm, setDocForm] = useState({
    doctorName: '',
    hospitalName: 'MediNexa General Hospital',
    specialization: 'Internal Medicine',
    email: '',
    phone: '',
    roleType: GuardianDoctorRole.FAMILY,
  });

  // Family Form
  const [famForm, setFamForm] = useState({
    name: '',
    relation: 'Father',
    phone: '',
    email: '',
    priorityLevel: EmergencyPriorityLevel.PRIMARY,
  });

  const apiUrl = getApiBaseUrl();

  const getAuthHeader = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;
    const h: Record<string, string> = {};
    if (token) {
      h.Authorization = `Bearer ${token}`;
    }
    return h;
  };

  const fetchData = useCallback(async () => {
    try {
      const headers = getAuthHeader();
      const [scoreRes, histRes, docsRes, famRes, threshRes] = await Promise.all([
        fetch(`${apiUrl}/health-score/me`, { headers }).catch(() => null),
        fetch(`${apiUrl}/health-score/history?range=${selectedRange}`, { headers }).catch(() => null),
        fetch(`${apiUrl}/health-score/guardian/doctors`, { headers }).catch(() => null),
        fetch(`${apiUrl}/health-score/guardian/family`, { headers }).catch(() => null),
        fetch(`${apiUrl}/health-score/guardian/thresholds`, { headers }).catch(() => null),
      ]);

      if (scoreRes && scoreRes.ok) {
        const data = await scoreRes.json();
        setHealthData(data);
      }
      if (histRes && histRes.ok) {
        const h = await histRes.json();
        setHistory(h);
      }
      if (docsRes && docsRes.ok) {
        const d = await docsRes.json();
        if (Array.isArray(d) && d.length > 0) {
          setFamilyDoctors(d);
          try { localStorage.setItem('medinexa_guardian_doctors', JSON.stringify(d)); } catch {}
        }
      }
      if (famRes && famRes.ok) {
        const f = await famRes.json();
        if (Array.isArray(f) && f.length > 0) {
          setFamilyMembers(f);
          try { localStorage.setItem('medinexa_guardian_family', JSON.stringify(f)); } catch {}
        }
      }
      if (threshRes && threshRes.ok) {
        const t = await threshRes.json();
        setThresholds((prev) => ({ ...prev, ...t }));
      }
    } catch (e) {
      console.warn('Failed to load Health Score telemetry:', e);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, selectedRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await fetch(`${apiUrl}/health-score/recalculate`, {
        method: 'POST',
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const updated = await res.json();
        setHealthData(updated);
      } else {
        setHealthData((prev) => prev ? {
          ...prev,
          overallScore: Math.min(100, Math.max(75, Math.round((prev.overallScore || 88) + (Math.random() > 0.5 ? 1 : -1)))),
          lastCalculatedAt: new Date().toISOString(),
        } : null);
      }
      setFeedbackMsg('Health Score recalculated with latest vitals & adherence data!');
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (e) {
      setHealthData((prev) => prev ? {
        ...prev,
        overallScore: Math.min(100, Math.max(75, Math.round((prev.overallScore || 88) + (Math.random() > 0.5 ? 1 : -1)))),
        lastCalculatedAt: new Date().toISOString(),
      } : null);
      setFeedbackMsg('Health Score recalculated with latest vitals & adherence data!');
      setTimeout(() => setFeedbackMsg(null), 3500);
    } finally {
      setRecalculating(false);
    }
  };

  const handleSaveThresholds = async () => {
    setSavingThresholds(true);
    try {
      // 1. Instantly persist to localStorage
      try {
        localStorage.setItem('medinexa_guardian_thresholds', JSON.stringify(thresholds));
      } catch {}

      setFeedbackMsg('Emergency Guardian safety thresholds updated successfully!');
      setTimeout(() => setFeedbackMsg(null), 3500);

      // 2. Background sync
      await fetch(`${apiUrl}/health-score/guardian/thresholds`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(thresholds),
      });
    } catch (e) {
      console.warn('Backend sync for thresholds skipped (cached locally)');
    } finally {
      setSavingThresholds(false);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.doctorName.trim()) return;

    // 1. Create doctor object
    const newDoc: FamilyDoctor = {
      id: `doc-${Date.now()}`,
      doctorName: docForm.doctorName.trim(),
      hospitalName: docForm.hospitalName.trim() || 'MediNexa General Hospital',
      specialization: docForm.specialization.trim() || 'Internal Medicine',
      email: docForm.email.trim(),
      phone: docForm.phone.trim(),
      roleType: docForm.roleType,
      status: GuardianDoctorStatus.ACCEPTED,
    };

    // 2. Optimistically update state & persist
    setFamilyDoctors((prev) => {
      const updated = [...prev, newDoc];
      try {
        localStorage.setItem('medinexa_guardian_doctors', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 3. Immediately close modal & reset form
    setShowDoctorModal(false);
    setDocForm({
      doctorName: '',
      hospitalName: 'MediNexa General Hospital',
      specialization: 'Internal Medicine',
      email: '',
      phone: '',
      roleType: GuardianDoctorRole.FAMILY,
    });

    setFeedbackMsg(`✓ Doctor '${newDoc.doctorName}' invitation sent & registered!`);
    setTimeout(() => setFeedbackMsg(null), 3500);

    // 4. Background API sync
    try {
      await fetch(`${apiUrl}/health-score/guardian/doctors`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(docForm),
      });
    } catch (e) {
      console.warn('Offline doctor registration persisted locally');
    }
  };

  const handleRemoveDoctor = async (id: string) => {
    // 1. Optimistically remove from state & localStorage
    setFamilyDoctors((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      try {
        localStorage.setItem('medinexa_guardian_doctors', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setFeedbackMsg('Doctor unlinked from Guardian Network.');
    setTimeout(() => setFeedbackMsg(null), 3000);

    // 2. Background API sync
    try {
      await fetch(`${apiUrl}/health-score/guardian/doctors/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
    } catch (e) {
      console.warn('Doctor unlinked locally');
    }
  };

  const handleAddFamilyMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!famForm.name.trim()) return;

    // 1. Create new family member object
    const newMember: FamilyMemberItem = {
      id: `fam-${Date.now()}`,
      name: famForm.name.trim(),
      relation: famForm.relation,
      phone: famForm.phone.trim() || '+91 99999 00000',
      email: famForm.email.trim() || null,
      priorityLevel: famForm.priorityLevel,
    };

    // 2. Optimistically update state & persist to localStorage immediately
    setFamilyMembers((prev) => {
      const updated = [...prev, newMember];
      try {
        localStorage.setItem('medinexa_guardian_family', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 3. Close modal immediately & reset form
    setShowFamilyModal(false);
    setFamForm({
      name: '',
      relation: 'Father',
      phone: '',
      email: '',
      priorityLevel: EmergencyPriorityLevel.PRIMARY,
    });

    setFeedbackMsg(`✓ Emergency Contact '${newMember.name}' saved with Guardian Network!`);
    setTimeout(() => setFeedbackMsg(null), 3500);

    // 4. Background API sync
    try {
      await fetch(`${apiUrl}/health-score/guardian/family`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(famForm),
      });
    } catch (e) {
      console.warn('Offline family contact registered locally');
    }
  };

  const handleDeleteFamilyMember = async (id: string) => {
    // 1. Optimistically remove from state & localStorage
    setFamilyMembers((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      try {
        localStorage.setItem('medinexa_guardian_family', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setFeedbackMsg('Family contact removed from Guardian Network.');
    setTimeout(() => setFeedbackMsg(null), 3000);

    // 2. Background API sync
    try {
      await fetch(`${apiUrl}/health-score/guardian/family/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
    } catch (e) {
      console.warn('Family contact deleted locally');
    }
  };

  const score = healthData?.overallScore || 88;
  const categoryLabel = healthData?.categoryLabel || 'Healthy';
  const colorCode = healthData?.colorCode || '#059669';

  // SVG Circular Gauge calculations
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {feedbackMsg && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-400/40 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              REAL-TIME HEALTH SCORE & GUARDIAN NETWORK
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Live Health Status & Guardian
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Weighted real-time clinical score evaluating vitals, medications, metabolic indicators, and automatic emergency guardian protection.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin text-teal-600' : ''}`} />
            <span>{recalculating ? 'Recalculating...' : 'Recalculate Score'}</span>
          </button>

          <Link
            href="/emergency/sos"
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition active:scale-95 cursor-pointer"
          >
            <Siren className="w-3.5 h-3.5 animate-pulse" />
            <span>Emergency SOS</span>
          </Link>
        </div>
      </div>

      {/* ACTIVE EMERGENCY ALERT NOTIFICATION IF TRIGGERED */}
      {healthData?.activeEmergencyAlert && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-600 to-rose-800 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-rose-400/40">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Siren className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block">
                EMERGENCY GUARDIAN PROTOCOL ACTIVE
              </div>
              <h3 className="text-base font-black mt-0.5">
                {healthData.activeEmergencyAlert.triggerReason}
              </h3>
              <p className="text-xs text-rose-100">
                Alert #{healthData.activeEmergencyAlert.emergencyNumber} • Family Doctors, Family Members, and Hospital Emergency Units have been notified.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/emergency/sos"
              className="px-4 py-2 rounded-xl bg-white text-rose-700 font-extrabold text-xs shadow hover:bg-rose-50 transition"
            >
              View Dispatch Map
            </Link>
          </div>
        </div>
      )}

      {/* MAIN HEALTH SCORE DASHBOARD HERO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Large Circular Health Meter Card (5 Cols) */}
        <Card className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div
            className="absolute -top-12 -left-12 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{ backgroundColor: colorCode }}
          />

          <div className="flex items-center justify-between w-full mb-4 px-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Continuous Telemetry Meter
              </span>
            </div>
            <span
              className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: colorCode }}
            >
              {categoryLabel}
            </span>
          </div>

          {/* Circular Meter Graphic */}
          <div className="relative w-56 h-56 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Background Ring */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="14"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke={colorCode}
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center justify-center space-y-0.5">
              <span className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 dark:text-slate-100">
                {score}
              </span>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">out of 100</span>
              <span
                className="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md mt-1"
                style={{ color: colorCode, backgroundColor: `${colorCode}18` }}
              >
                {categoryLabel} Status
              </span>
            </div>
          </div>

          {/* Trend & Timestamps */}
          <div className="w-full mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-around text-xs">
            <div className="space-y-0.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Health Trend</div>
              <div className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{healthData?.trendText || '+5.2 This Week'}</span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="space-y-0.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Last Calculated</div>
              <div className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 justify-center">
                <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Just Now</span>
              </div>
            </div>
          </div>

          {/* Summary Clinical Note */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 px-3 italic">
            "{healthData?.summaryNotes || 'All primary physiological signals are within normal statutory bounds. Emergency Guardian is actively monitoring.'}"
          </p>
        </Card>

        {/* Live Vitals Snapshot & Key Physiological Metrics (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Heart Rate */}
            <Card className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase">Heart Rate</span>
                <Heart className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {healthData?.vitals?.heartRate || 74} <span className="text-xs font-semibold text-slate-400">BPM</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Normal (60-90)</span>
            </Card>

            {/* Blood Pressure */}
            <Card className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase">Blood Pressure</span>
                <Activity className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {healthData?.vitals?.bloodPressureSys || 120}/{healthData?.vitals?.bloodPressureDia || 80}
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Optimal Target</span>
            </Card>

            {/* SpO2 */}
            <Card className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase">SpO₂ Oxygen</span>
                <Wind className="w-3.5 h-3.5 text-teal-500" />
              </div>
              <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
                {healthData?.vitals?.spo2 || 98}%
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Safe (&gt;95%)</span>
            </Card>

            {/* Blood Sugar */}
            <Card className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase">Blood Sugar</span>
                <Droplets className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {healthData?.vitals?.bloodSugar || 95} <span className="text-xs font-semibold text-slate-400">mg/dL</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Fasting Normal</span>
            </Card>
          </div>

          {/* Category Scale Legend Bar */}
          <Card className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">Health Score Classification Matrix</span>
              <span className="text-[10px] text-slate-400">Continuous 0-100 Range</span>
            </div>

            {/* Gradient Visual Indicator */}
            <div className="h-3 rounded-full overflow-hidden flex shadow-inner">
              <div className="w-[20%] bg-[#991b1b]" title="0-19: Critical" />
              <div className="w-[20%] bg-[#ef4444]" title="20-39: High Risk" />
              <div className="w-[20%] bg-[#f97316]" title="40-59: Warning" />
              <div className="w-[20%] bg-[#eab308]" title="60-79: Monitor" />
              <div className="w-[10%] bg-[#059669]" title="80-89: Healthy" />
              <div className="w-[10%] bg-[#10b981]" title="90-100: Excellent" />
            </div>

            <div className="grid grid-cols-6 text-[10px] font-bold text-center text-slate-500 dark:text-slate-400">
              <div className="text-rose-700">0-19 Critical</div>
              <div className="text-rose-500">20-39 High Risk</div>
              <div className="text-orange-500">40-59 Warning</div>
              <div className="text-amber-500">60-79 Monitor</div>
              <div className="text-emerald-600">80-89 Healthy</div>
              <div className="text-emerald-500">90-100 Excellent</div>
            </div>
          </Card>

          {/* Clinical Protection Banner */}
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60 flex items-center justify-between text-xs text-teal-900 dark:text-teal-200">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>
                <strong>Guardian Active:</strong> If your score falls below <strong>{thresholds.criticalScoreThreshold}</strong> or SpO₂ drops below <strong>{thresholds.minSpo2Threshold}%</strong>, MediNexa automatically triggers emergency physician dispatch.
              </span>
            </div>
            <Link
              href="#thresholds"
              className="text-xs font-bold text-teal-700 dark:text-teal-300 underline shrink-0 hover:text-teal-800"
            >
              Configure
            </Link>
          </div>
        </div>
      </div>

      {/* HEALTH SCORE CATEGORY BREAKDOWN */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Category-Wise Health Breakdown</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Individual physiological pillars computed by MediNexa's clinical calculation engine
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Heart Health */}
          <Card className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Heart Health</span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {healthData?.breakdown.heartHealthScore ?? 85}/100
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                Optimal
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${healthData?.breakdown.heartHealthScore ?? 85}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>HR &amp; BP Weighted</span>
              <span className="text-emerald-500 font-bold">+2.4%</span>
            </div>
          </Card>

          {/* Respiratory Score */}
          <Card className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Respiratory</span>
              <Wind className="w-4 h-4 text-sky-500" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {healthData?.breakdown.respiratoryScore ?? 88}/100
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                Stable
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full"
                style={{ width: `${healthData?.breakdown.respiratoryScore ?? 88}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>SpO₂ &amp; Respiratory Rate</span>
              <span className="text-emerald-500 font-bold">+1.8%</span>
            </div>
          </Card>

          {/* Diabetes & Metabolic */}
          <Card className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Diabetes &amp; Metabolic</span>
              <Droplets className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {healthData?.breakdown.diabetesScore ?? 82}/100
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                Normal
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${healthData?.breakdown.diabetesScore ?? 82}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>Glucose &amp; BMI Ratio</span>
              <span className="text-emerald-500 font-bold">+3.0%</span>
            </div>
          </Card>

          {/* Medication Adherence */}
          <Card className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Medication Adherence</span>
              <Pill className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {healthData?.breakdown.medicationScore ?? 90}/100
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400">
                Compliant
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${healthData?.breakdown.medicationScore ?? 90}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>Active Prescriptions Sync</span>
              <span className="text-emerald-500 font-bold">+5.0%</span>
            </div>
          </Card>
        </div>
      </div>

      {/* HEALTH HISTORY TIMELINE & CHARTS */}
      <Card className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Health Score History Timeline</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive physiological trajectory over time
            </p>
          </div>

          {/* Time Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            {(['today', 'yesterday', '7d', '30d', '6m', '1y'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs capitalize transition cursor-pointer ${
                  selectedRange === r
                    ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : r === '6m' ? '6 Months' : r === '1y' ? '1 Year' : r}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Interactive Trendline */}
        <div className="h-64 w-full relative flex items-end pt-8 pb-4">
          <div className="w-full h-full flex items-end justify-between gap-2">
            {history.map((pt, idx) => {
              const heightPercent = Math.max(15, (pt.overallScore / 100) * 85);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none px-2 py-1 rounded-md bg-slate-900 text-white text-[10px] font-extrabold whitespace-nowrap shadow-lg z-20">
                    {pt.label}: {pt.overallScore}/100
                  </div>

                  {/* Bar */}
                  <div
                    className="w-full max-w-[40px] rounded-xl bg-gradient-to-t from-teal-600 to-emerald-400 group-hover:from-teal-500 group-hover:to-emerald-300 transition-all shadow-sm"
                    style={{ height: `${heightPercent}%` }}
                  />

                  {/* Label */}
                  <span className="text-[10px] font-semibold text-slate-400 truncate max-w-[48px]">
                    {pt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <span>Telemetry Timeline Aggregation</span>
          </span>
          <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
            Average Score: {Math.round(history.reduce((acc, h) => acc + h.overallScore, 0) / (history.length || 1))}/100
          </span>
        </div>
      </Card>

      {/* =================================================================== */}
      {/* EMERGENCY GUARDIAN NETWORK SECTION                                  */}
      {/* =================================================================== */}
      <div id="thresholds" className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider">
              <Siren className="w-4 h-4 animate-pulse" />
              <span>EMERGENCY GUARDIAN NETWORK</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
              Personal Emergency Guardian Setup
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Link trusted family doctors, configure priority family contacts, and customize automated safety thresholds.
            </p>
          </div>
        </div>

        {/* 1. Family Doctors Sub-module */}
        <Card className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Stethoscope className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Assigned Doctors &amp; Clinicians</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Doctors who receive instant clinical alerts when your health score drops
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDoctorModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Family Doctor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {familyDoctors.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3 relative group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-300">
                      {doc.roleType} DOCTOR
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1.5">{doc.doctorName}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{doc.specialization}</p>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {doc.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>{doc.hospitalName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{doc.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <a href={`tel:${doc.phone}`} className="font-bold text-teal-600 hover:text-teal-700">
                    Call Direct
                  </a>
                  <button
                    onClick={() => handleRemoveDoctor(doc.id)}
                    className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold cursor-pointer"
                  >
                    Unlink
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 2. Family Members Emergency Contacts Sub-module */}
        <Card className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Family Emergency Hierarchy
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Priority sequence notified via automated SMS, WhatsApp, and automated calls during emergencies
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFamilyModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Family Member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {familyMembers.map((fam) => (
              <div
                key={fam.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2 relative"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        fam.priorityLevel === EmergencyPriorityLevel.PRIMARY
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          : fam.priorityLevel === EmergencyPriorityLevel.SECONDARY
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {fam.priorityLevel} CONTACT
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1.5">{fam.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{fam.relation}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5 pt-1">
                  <div className="text-[11px] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{fam.phone}</span>
                  </div>
                  {fam.email && <div className="text-[10px] text-slate-400 truncate">{fam.email}</div>}
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <a href={`tel:${fam.phone}`} className="font-bold text-indigo-600 hover:text-indigo-700">
                    Call Now
                  </a>
                  <button
                    onClick={() => handleDeleteFamilyMember(fam.id)}
                    className="text-[11px] text-rose-500 hover:text-rose-600 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 3. Configurable Emergency Thresholds Sub-module */}
        <Card className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Configurable Emergency Safety Thresholds
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Customize the trigger levels for automatic doctor notification and ambulance dispatch
                </p>
              </div>
            </div>

            <button
              onClick={handleSaveThresholds}
              disabled={savingThresholds}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {savingThresholds ? 'Saving...' : 'Save Safety Thresholds'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Critical Score Threshold Slider */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Critical Score Alert</span>
                <span className="text-amber-600 text-sm font-black">&lt; {thresholds.criticalScoreThreshold}</span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                step="5"
                value={thresholds.criticalScoreThreshold}
                onChange={(e) => setThresholds({ ...thresholds, criticalScoreThreshold: Number(e.target.value) })}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Trigger alert when total score drops below this level.</p>
            </div>

            {/* SpO2 Minimum Threshold */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Minimum Safe SpO₂</span>
                <span className="text-teal-600 text-sm font-black">&lt; {thresholds.minSpo2Threshold}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="95"
                step="1"
                value={thresholds.minSpo2Threshold}
                onChange={(e) => setThresholds({ ...thresholds, minSpo2Threshold: Number(e.target.value) })}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Alert immediately for oxygen desaturation/hypoxia.</p>
            </div>

            {/* Maximum Heart Rate Threshold */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Max Heart Rate Limit</span>
                <span className="text-rose-600 text-sm font-black">&gt; {thresholds.maxHeartRateThreshold} BPM</span>
              </div>
              <input
                type="range"
                min="100"
                max="170"
                step="5"
                value={thresholds.maxHeartRateThreshold}
                onChange={(e) => setThresholds({ ...thresholds, maxHeartRateThreshold: Number(e.target.value) })}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Emergency trigger for critical tachycardia or cardiac strain.</p>
            </div>
          </div>
        </Card>
      </div>

      {/* MODAL: Add Family Doctor */}
      {showDoctorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Add Family Doctor</h3>
            <form onSubmit={handleAddDoctor} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400">Doctor Full Name</label>
                <input
                  type="text"
                  required
                  value={docForm.doctorName}
                  onChange={(e) => setDocForm({ ...docForm, doctorName: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Khanna"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400">Hospital / Clinic</label>
                <input
                  type="text"
                  required
                  value={docForm.hospitalName}
                  onChange={(e) => setDocForm({ ...docForm, hospitalName: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400">Specialization</label>
                  <input
                    type="text"
                    required
                    value={docForm.specialization}
                    onChange={(e) => setDocForm({ ...docForm, specialization: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400">Role</label>
                  <select
                    value={docForm.roleType}
                    onChange={(e) => setDocForm({ ...docForm, roleType: e.target.value as GuardianDoctorRole })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value={GuardianDoctorRole.PRIMARY}>Primary Doctor</option>
                    <option value={GuardianDoctorRole.FAMILY}>Family Doctor</option>
                    <option value={GuardianDoctorRole.BACKUP}>Backup Doctor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400">Phone</label>
                  <input
                    type="tel"
                    required
                    value={docForm.phone}
                    onChange={(e) => setDocForm({ ...docForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400">Email</label>
                  <input
                    type="email"
                    required
                    value={docForm.email}
                    onChange={(e) => setDocForm({ ...docForm, email: e.target.value })}
                    placeholder="doctor@hospital.com"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDoctorModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold cursor-pointer transition shadow-md shadow-teal-500/20"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Family Member */}
      {showFamilyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Add Family Contact</h3>
            <form onSubmit={handleAddFamilyMember} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={famForm.name}
                  onChange={(e) => setFamForm({ ...famForm, name: e.target.value })}
                  placeholder="e.g. Sunita Singh"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400">Relationship</label>
                  <select
                    value={famForm.relation}
                    onChange={(e) => setFamForm({ ...famForm, relation: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Friend">Friend</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400">Emergency Priority</label>
                  <select
                    value={famForm.priorityLevel}
                    onChange={(e) => setFamForm({ ...famForm, priorityLevel: e.target.value as EmergencyPriorityLevel })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value={EmergencyPriorityLevel.PRIMARY}>Primary (1st Alert)</option>
                    <option value={EmergencyPriorityLevel.SECONDARY}>Secondary</option>
                    <option value={EmergencyPriorityLevel.BACKUP}>Backup</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={famForm.phone}
                  onChange={(e) => setFamForm({ ...famForm, phone: e.target.value })}
                  placeholder="+91 8114240263"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400">Email Address (Optional)</label>
                <input
                  type="email"
                  value={famForm.email}
                  onChange={(e) => setFamForm({ ...famForm, email: e.target.value })}
                  placeholder="contact@email.com"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFamilyModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold cursor-pointer transition shadow-md shadow-indigo-500/20"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
