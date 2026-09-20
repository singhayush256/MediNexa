'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Pill,
  FlaskConical,
  CreditCard,
  Video,
  FileText,
  Users,
  Target,
  Bell,
  Heart,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Activity,
  Bot,
  BellRing,
  Bed,
  Building2,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Volume2,
  X,
  Compass,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, StatCard } from '@/components/ui';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';
import { browserNotifications } from '@/lib/browser-notifications';
import { getApiBaseUrl, fetchWithTimeout, warmUpBackend } from '@/lib/api-config';
import { PatientCleanOverview } from '@/components/portal/PatientCleanOverview';
import {
  getLocalDateKey,
  getStoredDoses,
  saveStoredDose,
  subscribeToDoseUpdates,
  clearStoredDosesForDate,
  getFriendlyLocalDate,
} from '@/lib/medication-sync';

interface LiveBedData {
  hospitalName: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  status: 'AVAILABLE' | 'LIMITED' | 'FULL';
  indicator: 'green' | 'yellow' | 'red';
  lastUpdated: string;
}

interface MedicineDose {
  id: string;
  name: string;
  dosage: string;
  scheduledTime: string;
  timeSlot: string;
  status: 'PENDING' | 'TAKEN' | 'MISSED' | 'SKIPPED';
}

// Helper to evaluate if a scheduled dose is past its time window
function isDoseOverdue(scheduledTime: string, timeSlot?: string): boolean {
  if (!scheduledTime && !timeSlot) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let doseMinutes = -1;
  const match = scheduledTime?.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === 'PM' && h < 12) h += 12;
    if (meridiem === 'AM' && h === 12) h = 0;
    doseMinutes = h * 60 + m;
  } else if (timeSlot) {
    const slotLower = timeSlot.toLowerCase();
    if (slotLower.includes('morning')) doseMinutes = 11 * 60;
    else if (slotLower.includes('afternoon')) doseMinutes = 15 * 60;
    else if (slotLower.includes('evening')) doseMinutes = 19 * 60;
    else if (slotLower.includes('night')) doseMinutes = 22 * 60;
  }

  if (doseMinutes === -1) return false;
  // Overdue if scheduled time + 30 mins grace period has passed
  return currentMinutes > doseMinutes + 30;
}

function calculateMissedCount(doses: MedicineDose[]): number {
  return doses.filter(
    (m) => m.status === 'MISSED' || (m.status === 'PENDING' && isDoseOverdue(m.scheduledTime, m.timeSlot))
  ).length;
}

export default function PatientPortalDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Live Bed Availability Telemetry State (Default 100 registered beds capacity)
  const [bedData, setBedData] = useState<LiveBedData | null>({
    hospitalName: 'MediNexa General Hospital (Hospital A)',
    totalBeds: 100,
    occupiedBeds: 24,
    availableBeds: 76,
    occupancyRate: 24.0,
    status: 'AVAILABLE',
    indicator: 'green',
    lastUpdated: new Date().toISOString(),
  });
  const [bedRefreshing, setBedRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Default baseline schedule template
  const defaultScheduleTemplate: MedicineDose[] = [
    { id: '1', name: 'Metformin HCl', dosage: '500 mg', scheduledTime: '08:00 AM', timeSlot: 'Morning', status: 'PENDING' },
    { id: '2', name: 'Atorvastatin', dosage: '20 mg', scheduledTime: '02:00 PM', timeSlot: 'Afternoon', status: 'PENDING' },
    { id: '3', name: 'Lisinopril', dosage: '10 mg', scheduledTime: '08:00 PM', timeSlot: 'Evening', status: 'PENDING' },
  ];

  // Active calendar date key (YYYY-MM-DD in local browser time)
  const [activeDateKey, setActiveDateKey] = useState<string>(() => {
    return typeof window !== 'undefined' ? getLocalDateKey() : '2026-09-20';
  });
  const [rolloverFeedback, setRolloverFeedback] = useState<string | null>(null);

  // Helper to merge doses with localStorage for the given date
  const loadDosesWithStorage = useCallback((rawSchedule: MedicineDose[], dateKey: string): MedicineDose[] => {
    if (typeof window === 'undefined') return rawSchedule;

    const stored = getStoredDoses(dateKey);
    const hasStored = Object.keys(stored).length > 0;
    const initialSeedKey = 'medinexa_initial_seeded_date';
    const seededDate = localStorage.getItem(initialSeedKey);

    // Initial first-time seed: Metformin (08:00 AM Morning) was already taken earlier in morning of initial day
    // All subsequent days start 100% fresh with all medicines pending ("Take Dose")
    if (!hasStored && !seededDate) {
      saveStoredDose('1', 'TAKEN', { name: 'Metformin HCl', timeSlot: 'Morning', scheduledTime: '08:00 AM' }, dateKey);
      localStorage.setItem(initialSeedKey, dateKey);
    }

    const updatedStored = getStoredDoses(dateKey);
    return rawSchedule.map((med) => {
      const saved = updatedStored[med.id] || updatedStored[med.name.toLowerCase().trim()];
      if (saved) {
        return { ...med, status: saved.status as any };
      }
      return { ...med, status: 'PENDING' as const };
    });
  }, []);

  // Medicine Reminder State with persistence
  const [todayMedicines, setTodayMedicines] = useState<MedicineDose[]>(() => {
    const todayKey = typeof window !== 'undefined' ? getLocalDateKey() : '2026-09-20';
    return loadDosesWithStorage(defaultScheduleTemplate, todayKey);
  });
  const [activePrescriptionsCount, setActivePrescriptionsCount] = useState(3);
  const [missedDosesCount, setMissedDosesCount] = useState(() => calculateMissedCount(todayMedicines));

  // Push Notifications State
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [pushToast, setPushToast] = useState<string | null>(null);

  const apiUrl = getApiBaseUrl();

  // Cross-Tab & Cross-Component Sync Listener
  useEffect(() => {
    const unsub = subscribeToDoseUpdates(() => {
      setTodayMedicines((prev) => {
        const refreshed = loadDosesWithStorage(prev.length > 0 ? prev : defaultScheduleTemplate, activeDateKey);
        setMissedDosesCount(calculateMissedCount(refreshed));
        return refreshed;
      });
    });
    return unsub;
  }, [activeDateKey, loadDosesWithStorage]);

  // Real-Time Midnight Watcher: detects 12:00 AM date change and resets all doses for the new day
  useEffect(() => {
    const checkMidnightRollover = () => {
      const currentLocalDateKey = getLocalDateKey();
      if (currentLocalDateKey !== activeDateKey) {
        setActiveDateKey(currentLocalDateKey);
        setTodayMedicines((prev) => {
          const fresh = loadDosesWithStorage(defaultScheduleTemplate, currentLocalDateKey);
          setMissedDosesCount(calculateMissedCount(fresh));
          return fresh;
        });
        setRolloverFeedback(`New Day (${getFriendlyLocalDate(currentLocalDateKey)})! Medicine schedule reset for 12:00 AM.`);
        setTimeout(() => setRolloverFeedback(null), 6000);
      }
    };

    const interval = setInterval(checkMidnightRollover, 2000);
    return () => clearInterval(interval);
  }, [activeDateKey, loadDosesWithStorage]);

  // 1. Fetch Live Bed Availability Telemetry
  const fetchLiveBedStats = useCallback(async () => {
    try {
      const res = await fetchWithTimeout(`${apiUrl}/bed-availability/live`, {}, 15000);
      if (res.ok) {
        const json = await res.json();
        setBedData(json);
      }
    } catch (err) {
      console.warn('Failed to load live bed stats:', err);
    } finally {
      setBedRefreshing(false);
      setCountdown(30);
    }
  }, [apiUrl]);

  // Auto-refresh beds every 30 seconds
  useEffect(() => {
    fetchLiveBedStats();
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchLiveBedStats();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchLiveBedStats]);

  // 2. Fetch Profile, Analytics & Medication Reminders
  useEffect(() => {
    warmUpBackend();
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('medinexa_token') ||
          localStorage.getItem('token') ||
          (typeof document !== 'undefined' ? document.cookie.match(/medinexa_token=([^;]+)/)?.[1] : null)
        : null;

    if (token) {
      Promise.all([
        fetchWithTimeout(`${apiUrl}/patient-portal/profile`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : null)),
        fetchWithTimeout(`${apiUrl}/patient-portal/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : null)),
        fetchWithTimeout(`${apiUrl}/medication-reminders/today`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : null)),
      ])
        .then(([prof, anal, todaySchedule]) => {
          if (prof) setProfile(prof);
          if (anal) setAnalytics(anal);
          if (todaySchedule) {
            const allDoses: MedicineDose[] = [];
            ['morning', 'afternoon', 'evening', 'night'].forEach((slot) => {
              if (Array.isArray(todaySchedule[slot])) {
                todaySchedule[slot].forEach((item: any) => {
                  allDoses.push({
                    id: item.reminderId || item.id,
                    name: item.medicineName,
                    dosage: item.dosage || '1 dose',
                    scheduledTime: item.scheduledTime || '08:00 AM',
                    timeSlot: item.timeSlot || slot,
                    status: item.status || 'PENDING',
                  });
                });
              }
            });
            if (allDoses.length > 0) {
              const merged = loadDosesWithStorage(allDoses, activeDateKey);
              setTodayMedicines(merged);
              setMissedDosesCount(calculateMissedCount(merged));
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, [apiUrl, activeDateKey, loadDosesWithStorage]);

  // Request browser push permission
  const handleEnablePushNotifications = async () => {
    const perm = await browserNotifications.requestPermission();
    setPushPermission(perm);
    if (perm === 'granted') {
      browserNotifications.notifyMedicineTime('Metformin HCl', '500 mg', 'Morning');
      setPushToast('Push Notifications enabled! You will receive timely medicine alerts.');
      setTimeout(() => setPushToast(null), 5000);
    }
  };

  // Mark dose as taken from dashboard (persisted for current date)
  const handleMarkDoseTaken = async (id: string, name: string) => {
    const currentMed = todayMedicines.find((m) => m.id === id);
    
    // 1. Immediately persist to localStorage for today's local date
    saveStoredDose(
      id,
      'TAKEN',
      {
        name,
        timeSlot: currentMed?.timeSlot,
        scheduledTime: currentMed?.scheduledTime,
      },
      activeDateKey
    );

    // 2. Update React State
    setTodayMedicines((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, status: 'TAKEN' as const } : m));
      setMissedDosesCount(calculateMissedCount(updated));
      return updated;
    });

    // 3. Sync with backend API
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('medinexa_token') || localStorage.getItem('token')
        : null;
    if (token) {
      try {
        await fetchWithTimeout(`${apiUrl}/medication-reminders/${id}/taken`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notes: 'Logged from Patient Portal Dashboard' }),
        }, 15000);
      } catch (e) {}
    }
  };

  // Simulate 12:00 AM midnight date change to test resetting all doses
  const handleSimulateMidnightReset = () => {
    clearStoredDosesForDate(activeDateKey);
    setTodayMedicines((prev) => {
      const resetList = prev.map((m) => ({ ...m, status: 'PENDING' as const }));
      setMissedDosesCount(calculateMissedCount(resetList));
      return resetList;
    });
    setRolloverFeedback('12:00 AM Midnight Rollover Simulated: All medicines reset to "Take Dose" for the new day!');
    setTimeout(() => setRolloverFeedback(null), 5000);
  };

  const patientName = (() => {
    // 1. From profile if available and not a doctor account
    if (profile?.user?.firstName && !profile.user.firstName.startsWith('Dr.')) {
      return `${profile.user.firstName} ${profile.user.lastName || ''}`.trim();
    }
    if (profile?.name && !profile.name.startsWith('Dr.')) {
      return profile.name;
    }
    // 2. From localStorage if not doctor
    if (typeof window !== 'undefined') {
      try {
        const u = JSON.parse(localStorage.getItem('medinexa_user') || '{}');
        const isDoc = (u.firstName && u.firstName.startsWith('Dr.')) || /DOCTOR|STAFF|ADMIN/i.test(u.roleCode || u.role?.code || u.role || '');
        if (!isDoc && u.firstName) {
          return `${u.firstName} ${u.lastName || ''}`.trim();
        }
      } catch {}
    }
    return 'Ayush Singh';
  })();

  // Next upcoming medicine calculation (skip overdue missed doses)
  const pendingMedicines = todayMedicines.filter((m) => m.status === 'PENDING');
  const nextMedicine =
    pendingMedicines.find((m) => !isDoseOverdue(m.scheduledTime, m.timeSlot)) ||
    pendingMedicines[0] ||
    null;

  const quickLinks = [
    { title: 'Live Bed Availability', href: '/portal/live-beds', icon: <Bed className="w-5 h-5 text-emerald-500" />, desc: '30s real-time bed capacity & ICU telemetry' },
    { title: 'Nearby Hospital Search', href: '/portal/nearby-hospitals', icon: <Building2 className="w-5 h-5 text-sky-500" />, desc: 'GPS radius navigator (5km, 10km, 25km)' },
    { title: 'Medicine Reminder', href: '/portal/medication-reminders', icon: <BellRing className="w-5 h-5 text-rose-500" />, desc: 'Daily schedules, dose tracking & push alerts' },
    { title: 'Notifications Center', href: '/portal/notifications', icon: <Bell className="w-5 h-5 text-amber-500" />, desc: 'Browser push & care updates archive' },
    { title: 'Appointments', href: '/portal/appointments', icon: <Calendar className="w-5 h-5 text-blue-500" />, desc: 'Book & manage doctor consultations' },
    { title: 'Medical Records', href: '/portal/medical-records', icon: <FileText className="w-5 h-5 text-emerald-500" />, desc: 'Longitudinal history & encounter summaries' },
    { title: 'Prescriptions', href: '/portal/prescriptions', icon: <Pill className="w-5 h-5 text-purple-500" />, desc: 'Active medications & online refill requests' },
    { title: 'Bed Reservations', href: '/portal/bed-bookings', icon: <Activity className="w-5 h-5 text-indigo-500" />, desc: 'Request & track inpatient bed reservations' },
    { title: 'Lab Reports', href: '/portal/lab-reports', icon: <FlaskConical className="w-5 h-5 text-teal-500" />, desc: 'Diagnostic blood panels & imaging reports' },
    { title: 'Telemedicine', href: '/portal/telemedicine', icon: <Video className="w-5 h-5 text-cyan-500" />, desc: 'Join virtual consultation waiting room' },
    { title: 'Billing & Invoices', href: '/portal/billing', icon: <CreditCard className="w-5 h-5 text-amber-500" />, desc: 'Itemized hospital bills & insurance copays' },
    { title: 'AI Health Assistant', href: '/portal/ai-assistant', icon: <Bot className="w-5 h-5 text-teal-600 dark:text-teal-400" />, desc: '24/7 Guidance on symptoms, medicines & lab reports' },
  ];

  const getBedStatusBadge = (indicator: 'green' | 'yellow' | 'red') => {
    if (indicator === 'green') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Available
        </span>
      );
    }
    if (indicator === 'yellow') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          Limited
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
        Full
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification Alert */}
      {pushToast && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span className="text-xs font-bold">{pushToast}</span>
          </div>
          <button onClick={() => setPushToast(null)} className="p-1 text-emerald-200 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Welcome Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-teal-600 via-emerald-600 to-blue-700 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
              Connected Care 24/7
            </span>
            {pushPermission === 'granted' ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 flex items-center gap-1">
                <BellRing className="w-3 h-3" /> Push Alerts Active
              </span>
            ) : (
              <button
                onClick={handleEnablePushNotifications}
                className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-400/30 hover:bg-amber-400/40 text-amber-100 flex items-center gap-1 transition cursor-pointer border border-amber-300/40"
              >
                <Bell className="w-3 h-3" /> Enable Push Alerts
              </button>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {patientName}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 max-w-lg">
            Your care team is actively monitoring your recovery. Track live hospital bed availability, manage medicine reminders, and view nearby hospitals below.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <Link href="/portal/live-beds">
            <button className="bg-white text-teal-800 hover:bg-teal-50 font-bold rounded-2xl shadow-lg hover:-translate-y-0.5 transition px-4 py-2.5 text-xs sm:text-sm flex items-center gap-2 cursor-pointer">
              <Bed className="w-4 h-4 text-teal-600" />
              <span>Live Beds</span>
            </button>
          </Link>
          <Link href="/portal/nearby-hospitals">
            <button className="bg-teal-700/60 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg border border-white/20 hover:-translate-y-0.5 transition px-4 py-2.5 text-xs sm:text-sm flex items-center gap-2 cursor-pointer">
              <Building2 className="w-4 h-4 text-teal-200" />
              <span>Find Hospitals</span>
            </button>
          </Link>
          <Link href="/portal/medication-reminders">
            <button className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold rounded-2xl shadow-lg border border-white/20 hover:-translate-y-0.5 transition px-4 py-2.5 text-xs sm:text-sm flex items-center gap-2 cursor-pointer">
              <BellRing className="w-4 h-4" />
              <span>Reminders</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 1. LIVE BED AVAILABILITY WIDGET (30-second Auto Refresh & Green/Yellow/Red Indicator) */}
      <Card className="border-teal-500/30 bg-gradient-to-br from-white via-teal-50/20 to-blue-50/20 dark:from-slate-900 dark:via-teal-950/20 dark:to-slate-900 shadow-lg relative overflow-hidden">
        <div className="p-6 space-y-5">
          {/* Header & Status Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white flex items-center justify-center font-black shadow-md shadow-teal-500/20">
                <Bed className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    NETWORK REAL-TIME TELEMETRY
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                  Live Bed Availability
                </h2>
              </div>
            </div>

            {/* Countdown & Refresh */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-teal-500" />
                <span>Syncs in <span className="font-bold text-teal-600 dark:text-teal-400">{countdown}s</span></span>
              </div>

              {bedData && getBedStatusBadge(bedData.indicator)}

              <Link
                href="/portal/live-beds"
                className="p-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition"
                title="View Full Bed Availability Telemetry"
              >
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Three Key Metrics: Total, Occupied, Available Beds */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Beds */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Beds
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
                {bedData?.totalBeds ?? 250}
              </div>
              <p className="text-[11px] text-slate-400">Network Registered Capacity</p>
            </div>

            {/* Occupied Beds */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Occupied Beds
              </span>
              <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
                {bedData?.occupiedBeds ?? 178}
              </div>
              <p className="text-[11px] text-slate-400">{bedData?.occupancyRate ?? 71.2}% Occupancy Rate</p>
            </div>

            {/* Available Beds (Green / Yellow / Red Indicator) */}
            <div className={`p-4 rounded-2xl border shadow-sm space-y-1 ${
              bedData?.indicator === 'green'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-500/30'
                : bedData?.indicator === 'yellow'
                ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-500/30'
                : 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Available Beds
                </span>
                <span className={`w-2.5 h-2.5 rounded-full ${
                  bedData?.indicator === 'green' ? 'bg-emerald-500 animate-pulse' : bedData?.indicator === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
              </div>
              <div className={`text-2xl sm:text-3xl font-black ${
                bedData?.indicator === 'green' ? 'text-emerald-600 dark:text-emerald-400' : bedData?.indicator === 'yellow' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {bedData?.availableBeds ?? 72}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {bedData?.indicator === 'green' ? 'Ready for Immediate Admission' : bedData?.indicator === 'yellow' ? 'Limited Capacity Available' : 'No Immediate Free Beds'}
              </p>
            </div>
          </div>

          {/* Quick Footer Links */}
          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Green = Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Yellow = Limited
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Red = Full
              </span>
            </div>

            <div className="flex items-center gap-3 mt-2 sm:mt-0">
              <Link
                href="/portal/nearby-hospitals"
                className="font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Search Nearby Hospitals</span>
              </Link>
              <Link
                href="/portal/live-beds"
                className="font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>Department Breakdown &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. MEDICINE REMINDER WIDGETS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BellRing className="w-5 h-5 text-rose-500" />
              <span>Medicine Reminder & Adherence</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily scheduled doses, next intake countdown, and prescription safety
            </p>
          </div>
          <Link
            href="/portal/medication-reminders"
            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>Open Medicine Schedule</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Dedicated Medicine Reminder Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Widget 1: Today's Medicines */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Today's Medicines
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <Pill className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {todayMedicines.length} Doses
            </div>
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>Completed Today</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {todayMedicines.filter((m) => m.status === 'TAKEN').length} of {todayMedicines.length} taken
              </span>
            </div>
          </Card>

          {/* Widget 2: Next Medicine Time */}
          <Card className="p-5 space-y-3 border-blue-500/30 bg-blue-50/30 dark:bg-blue-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Next Medicine Time
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {nextMedicine ? nextMedicine.scheduledTime : 'Completed'}
              </div>
              <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mt-0.5 truncate">
                {nextMedicine ? `${nextMedicine.name} (${nextMedicine.dosage})` : 'All doses taken for today!'}
              </p>
            </div>
            <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/60 text-[11px] text-slate-500">
              Slot: <span className="font-semibold text-slate-800 dark:text-slate-200">{nextMedicine ? nextMedicine.timeSlot : 'All Taken'}</span>
            </div>
          </Card>

          {/* Widget 3: Active Prescriptions */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Prescriptions
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {activePrescriptionsCount} Prescriptions
            </div>
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>Issued by Attending Physician</span>
              <Link href="/portal/prescriptions" className="text-teal-600 font-bold hover:underline">
                View &rarr;
              </Link>
            </div>
          </Card>

          {/* Widget 4: Missed Doses */}
          <Card className={`p-5 space-y-3 ${missedDosesCount > 0 ? 'border-rose-500/40 bg-rose-50/30 dark:bg-rose-950/20' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Missed Doses
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                missedDosesCount > 0 ? 'bg-rose-500/15 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'
              }`}>
                {missedDosesCount > 0 ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              </div>
            </div>
            <div className={`text-3xl font-black ${missedDosesCount > 0 ? 'text-rose-600' : 'text-slate-900 dark:text-slate-100'}`}>
              {missedDosesCount} Doses
            </div>
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-500">
              {missedDosesCount === 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100% On-Track Today!</span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 font-semibold">Catch up on pending medications</span>
              )}
            </div>
          </Card>
        </div>

        {/* Today's Schedule Interactive List */}
        <Card className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Today's Medication Intake Schedule
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {getFriendlyLocalDate(activeDateKey)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Doses persist for the full day • Auto-resets with 'Take Dose' options at 12:00 AM midnight
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSimulateMidnightReset}
                title="Test feature: Simulate 12:00 AM midnight rollover to reset all medicines back to 'Take Dose'"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 transition cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3 h-3 text-slate-500" />
                <span>Simulate 12 AM Reset</span>
              </button>
            </div>
          </div>

          {rolloverFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
              <span>{rolloverFeedback}</span>
              <button onClick={() => setRolloverFeedback(null)} className="text-emerald-600 dark:text-emerald-400 hover:opacity-75">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {todayMedicines.map((med) => (
              <div key={med.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    med.status === 'TAKEN'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {med.name}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Dosage: {med.dosage}</span>
                      <span>•</span>
                      <span>{med.scheduledTime} ({med.timeSlot})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {med.status === 'TAKEN' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5" /> Taken
                    </span>
                  ) : med.status === 'MISSED' || isDoseOverdue(med.scheduledTime, med.timeSlot) ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        <AlertCircle className="w-3 h-3" /> Missed
                      </span>
                      <button
                        onClick={() => handleMarkDoseTaken(med.id, med.name)}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Take Dose</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleMarkDoseTaken(med.id, med.name)}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Take Dose</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Clean Telemetry Overview (Vitals Curve, Consultation, Prescriptions, NABL Reports) */}
      <PatientCleanOverview />

      {/* Quick Access Portal Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Patient Services & Self-Care
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quickLinks.map((link, idx) => (
            <Link key={idx} href={link.href} className="group">
              <Card hover className="h-full flex flex-col justify-between">
                <CardContent className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {link.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {link.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {link.desc}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
