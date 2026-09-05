'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Pill,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Bell,
  BellRing,
  Send,
  Smartphone,
  MessageSquare,
  Plus,
  Activity,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Flame,
  ArrowLeft,
  Info,
  Check,
  Volume2,
  Trash2,
  Edit2,
  PauseCircle,
  PlayCircle,
  Sun,
  Sunset,
  Moon,
  Coffee,
  Mail,
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { FoodTiming, ReminderAction, ReminderNotificationChannel } from '@medinexa/types';

interface ScheduleItem {
  reminderId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  foodTiming: FoodTiming;
  scheduledTime: string;
  timeSlot: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  instructions?: string;
  status: 'PENDING' | 'TAKEN' | 'SKIPPED' | 'MISSED';
  actionTime?: string;
  historyId?: string;
  reminder: any;
}

interface TodaySchedule {
  morning: ScheduleItem[];
  afternoon: ScheduleItem[];
  evening: ScheduleItem[];
  night: ScheduleItem[];
  totalDoses: number;
  takenDoses: number;
  skippedDoses: number;
  missedDoses: number;
  pendingDoses: number;
}

interface Analytics {
  patientId: string;
  weeklyAdherencePercentage: number;
  monthlyAdherencePercentage: number;
  complianceScore: number;
  streakDays: number;
  totalScheduledDoses: number;
  takenCount: number;
  skippedCount: number;
  missedCount: number;
  dailyBreakdown: {
    date: string;
    dayName: string;
    taken: number;
    missed: number;
    skipped: number;
    total: number;
    adherenceRate: number;
  }[];
}

interface PrescribedMedicine {
  prescriptionItemId: string;
  prescriptionNumber: string;
  prescribedAt: string;
  doctorName: string;
  specialty: string;
  medicineName: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
  instructions?: string;
  hasActiveReminder: boolean;
  existingReminderId?: string;
}

export default function PatientMedicationRemindersPage() {
  const [activeTab, setActiveTab] = useState<'today' | 'prescriptions' | 'analytics' | 'notifications'>('today');
  const [todaySchedule, setTodaySchedule] = useState<TodaySchedule | null>(null);
  const [missedData, setMissedData] = useState<any>(null);
  const [upcomingData, setUpcomingData] = useState<any>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [prescribedMeds, setPrescribedMeds] = useState<PrescribedMedicine[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Push notifications state
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>('default');

  // Add Reminder Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newDosage, setNewDosage] = useState('500 mg');
  const [newFrequency, setNewFrequency] = useState('Twice daily');
  const [newFoodTiming, setNewFoodTiming] = useState<FoodTiming>(FoodTiming.AFTER_FOOD);
  const [newReminderTime, setNewReminderTime] = useState('08:00 AM');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEndDate, setNewEndDate] = useState('');
  const [newInstructions, setNewInstructions] = useState('Take with full glass of water.');
  const [creatingReminder, setCreatingReminder] = useState(false);

  // Check browser notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
      setPushEnabled(Notification.permission === 'granted');
    } else {
      setPushPermission('unsupported');
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [todayRes, missedRes, upcomingRes, analyticsRes, rxRes, notifRes] = await Promise.all([
        apiFetch<TodaySchedule>('/medication-reminders/today'),
        apiFetch<any>('/medication-reminders/missed'),
        apiFetch<any>('/medication-reminders/upcoming'),
        apiFetch<Analytics>('/medication-reminders/analytics'),
        apiFetch<PrescribedMedicine[]>('/medication-reminders/prescriptions'),
        apiFetch<any[]>('/medication-reminders/notifications'),
      ]);

      if (todayRes.ok && todayRes.data) setTodaySchedule(todayRes.data);
      if (missedRes.ok && missedRes.data) setMissedData(missedRes.data);
      if (upcomingRes.ok && upcomingRes.data) setUpcomingData(upcomingRes.data);
      if (analyticsRes.ok && analyticsRes.data) setAnalytics(analyticsRes.data);
      if (rxRes.ok && rxRes.data) setPrescribedMeds(rxRes.data);
      if (notifRes.ok && notifRes.data) setNotifications(notifRes.data);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: 'Unable to load your medication schedule. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Push Permission Handler
  async function handleTogglePush() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Browser push notifications are not supported in your current browser.');
      return;
    }

    if (Notification.permission === 'granted') {
      setPushEnabled(true);
      new Notification('MediNexa Medication Alerts Active', {
        body: 'You will receive timely alerts when scheduled doses are due.',
        icon: '/favicon.ico',
      });
      setFeedbackMsg({ type: 'success', text: 'Browser push notifications are enabled!' });
    } else {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      if (permission === 'granted') {
        setPushEnabled(true);
        new Notification('MediNexa Medication Alerts Active', {
          body: 'You will receive timely alerts when scheduled doses are due.',
          icon: '/favicon.ico',
        });
        setFeedbackMsg({ type: 'success', text: 'Browser push notifications granted successfully!' });
      } else {
        setPushEnabled(false);
        setFeedbackMsg({ type: 'error', text: 'Push permission was denied or dismissed.' });
      }
    }
  }

  // Dose Actions
  async function handleMarkTaken(reminderId: string, medicineName: string) {
    setActionLoadingId(reminderId);
    try {
      const res = await apiFetch(`/medication-reminders/${reminderId}/taken`, {
        method: 'POST',
        body: JSON.stringify({ notes: 'Logged as taken via Patient Portal' }),
      });
      if (res.ok) {
        setFeedbackMsg({ type: 'success', text: `Great job! Marked ${medicineName} as taken.` });
        await loadData();
      } else {
        setFeedbackMsg({ type: 'error', text: res.message || 'Could not update dose status.' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Error connecting to server.' });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleMarkSkipped(reminderId: string, medicineName: string) {
    setActionLoadingId(reminderId);
    try {
      const res = await apiFetch(`/medication-reminders/${reminderId}/skipped`, {
        method: 'POST',
        body: JSON.stringify({ notes: 'Skipped by patient via Patient Portal' }),
      });
      if (res.ok) {
        setFeedbackMsg({ type: 'info', text: `Marked ${medicineName} as skipped for today.` });
        await loadData();
      } else {
        setFeedbackMsg({ type: 'error', text: res.message || 'Could not update dose status.' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Error connecting to server.' });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleMarkMissed(reminderId: string, medicineName: string) {
    setActionLoadingId(reminderId);
    try {
      const res = await apiFetch(`/medication-reminders/${reminderId}/missed`, {
        method: 'POST',
        body: JSON.stringify({ notes: 'Marked as missed via Patient Portal' }),
      });
      if (res.ok) {
        setFeedbackMsg({ type: 'error', text: `Marked ${medicineName} as missed.` });
        await loadData();
      } else {
        setFeedbackMsg({ type: 'error', text: res.message || 'Could not update dose status.' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Error connecting to server.' });
    } finally {
      setActionLoadingId(null);
    }
  }

  // Quick schedule create from prescribed medicine
  async function handleCreateFromPrescription(rx: PrescribedMedicine) {
    setActionLoadingId(rx.prescriptionItemId);
    try {
      const res = await apiFetch('/medication-reminders', {
        method: 'POST',
        body: JSON.stringify({
          prescriptionItemId: rx.prescriptionItemId,
          medicineName: rx.medicineName,
          dosage: rx.dosage,
          frequency: rx.frequency,
          foodTiming: FoodTiming.AFTER_FOOD,
          reminderTime: '08:00 AM',
          instructions: rx.instructions,
        }),
      });
      if (res.ok) {
        setFeedbackMsg({ type: 'success', text: `Created reminder schedule for ${rx.medicineName}!` });
        await loadData();
      } else {
        setFeedbackMsg({ type: 'error', text: res.message || 'Failed to create schedule.' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Network error.' });
    } finally {
      setActionLoadingId(null);
    }
  }

  // Create Custom Reminder
  async function handleCreateCustomReminder(e: React.FormEvent) {
    e.preventDefault();
    if (!newMedName.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Please enter a medicine name.' });
      return;
    }

    setCreatingReminder(true);
    try {
      const res = await apiFetch('/medication-reminders', {
        method: 'POST',
        body: JSON.stringify({
          medicineName: newMedName.trim(),
          dosage: newDosage,
          frequency: newFrequency,
          foodTiming: newFoodTiming,
          reminderTime: newReminderTime,
          startDate: newStartDate,
          endDate: newEndDate || undefined,
          instructions: newInstructions,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewMedName('');
        setFeedbackMsg({ type: 'success', text: `Reminder for ${newMedName} added to your daily schedule!` });
        await loadData();
      } else {
        setFeedbackMsg({ type: 'error', text: res.message || 'Failed to save reminder.' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Error creating reminder schedule.' });
    } finally {
      setCreatingReminder(false);
    }
  }

  // Send Test Notification Dispatch
  async function handleSendTestAlert(reminderId: string, channel: ReminderNotificationChannel) {
    setActionLoadingId(`${reminderId}-${channel}`);
    try {
      const res = await apiFetch('/medication-reminders/test-dispatch', {
        method: 'POST',
        body: JSON.stringify({ reminderId, channel }),
      });
      if (res.ok) {
        setFeedbackMsg({
          type: 'success',
          text: `Test ${channel.replace('_', ' ')} alert dispatched successfully!`,
        });
        if (channel === ReminderNotificationChannel.BROWSER_PUSH && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('💊 MediNexa Dose Reminder', {
            body: 'It is time for your scheduled medicine dose.',
            icon: '/favicon.ico',
          });
        }
        await loadData();
      } else {
        setFeedbackMsg({ type: 'error', text: res.message || 'Failed to dispatch alert.' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Dispatch failed.' });
    } finally {
      setActionLoadingId(null);
    }
  }

  const foodTimingBadge = (timing: FoodTiming) => {
    switch (timing) {
      case FoodTiming.BEFORE_FOOD:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Coffee className="w-3 h-3" /> Before Food
          </span>
        );
      case FoodTiming.AFTER_FOOD:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <Check className="w-3 h-3" /> After Food
          </span>
        );
      case FoodTiming.WITH_FOOD:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Pill className="w-3 h-3" /> With Food
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            No Restrictions
          </span>
        );
    }
  };

  const statusBadge = (status: ScheduleItem['status']) => {
    switch (status) {
      case 'TAKEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Taken
          </span>
        );
      case 'SKIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30">
            <XCircle className="w-3.5 h-3.5" /> Skipped
          </span>
        );
      case 'MISSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" /> Missed Dose
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/portal"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition"
              id="back-to-portal-link"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Portal
            </Link>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <MediNexaLogo size="sm" subtitle="MEDICATION REMINDERS" href="/portal/medication-reminders" />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition"
              id="add-reminder-btn"
            >
              <Plus className="w-4 h-4" /> Add Reminder
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Feedback Alert Banner */}
        {feedbackMsg && (
          <div
            className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between border shadow-sm transition-all ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                : feedbackMsg.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMsg.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {feedbackMsg.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-500" />}
              {feedbackMsg.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
              <span>{feedbackMsg.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMsg(null)}
              className="text-xs underline hover:opacity-75"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Hero Banner with Adherence Score & Push Notification Toggle */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-teal-800/40">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/20 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
                <Sparkles className="w-3.5 h-3.5" /> SMART MEDICATION COMPLIANCE
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Daily Medicine Schedule & Adherence Hub
              </h1>
              <p className="text-slate-300 text-sm max-w-xl">
                Stay on track with your doctor's prescriptions. Log doses with a single tap, track missed medicines, and receive multi-channel browser push, WhatsApp, and SMS alerts.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleTogglePush}
                  id="toggle-push-btn"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition shadow-sm border ${
                    pushEnabled
                      ? 'bg-emerald-600/30 text-emerald-200 border-emerald-400/40 hover:bg-emerald-600/40'
                      : 'bg-white text-slate-900 border-transparent hover:bg-slate-100'
                  }`}
                >
                  <BellRing className={`w-4 h-4 ${pushEnabled ? 'text-emerald-300 animate-bounce' : 'text-slate-700'}`} />
                  {pushEnabled ? 'Browser Push Alerts: ACTIVE' : 'Enable Push Notifications'}
                </button>

                <button
                  onClick={loadData}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  id="refresh-schedule-btn"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>
            </div>

            {/* Quick Stats Metric Cards */}
            <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Weekly</span>
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black text-teal-400">
                    {analytics ? `${analytics.weeklyAdherencePercentage}%` : '---'}
                  </div>
                  <div className="text-[11px] text-slate-400">Adherence rate</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Streak</span>
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black text-amber-400">
                    {analytics ? `${analytics.streakDays} Days` : '---'}
                  </div>
                  <div className="text-[11px] text-slate-400">Consistent streak</div>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 p-4 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Compliance</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black text-indigo-300">
                    {analytics ? `${analytics.complianceScore}/100` : '---'}
                  </div>
                  <div className="text-[11px] text-slate-400">Health index</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Missed Medicine Urgent Alert Banner */}
        {missedData && missedData.totalMissedCount > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-300 dark:border-rose-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm" id="missed-medicines-alert">
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold text-rose-900 dark:text-rose-200">
                  Missed Medication Alert: {missedData.totalMissedCount} dose{missedData.totalMissedCount > 1 ? 's' : ''} require attention
                </h2>
                <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                  Overdue medicines should be taken as soon as possible, unless it is close to your next scheduled dose. Never double up without physician guidance.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('today')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition whitespace-nowrap"
            >
              Review Schedule
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('today')}
            id="tab-today"
            className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'today'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" /> Today's Medicines
            {todaySchedule && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/20 text-white">
                {todaySchedule.totalDoses}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('prescriptions')}
            id="tab-prescriptions"
            className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'prescriptions'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Pill className="w-4 h-4" /> Prescriptions & Formulations ({prescribedMeds.length})
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            id="tab-analytics"
            className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" /> Adherence Analytics
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            id="tab-notifications"
            className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Bell className="w-4 h-4" /> Multi-Channel Alerts
          </button>
        </div>

        {/* TAB 1: TODAY'S MEDICINES */}
        {activeTab === 'today' && (
          <div className="space-y-6">
            {/* Day Progress Tracker */}
            {todaySchedule && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Today's Dose Completion
                    </h2>
                    <div className="text-xl font-extrabold mt-1 text-slate-900 dark:text-white">
                      {todaySchedule.takenDoses} of {todaySchedule.totalDoses} Doses Taken
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {todaySchedule.takenDoses} Taken
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {todaySchedule.pendingDoses} Pending
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {todaySchedule.missedDoses} Missed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 transition-all duration-500"
                    style={{
                      width: `${todaySchedule.totalDoses > 0 ? (todaySchedule.takenDoses / todaySchedule.totalDoses) * 100 : 0}%`,
                    }}
                  />
                  <div
                    className="bg-rose-500 transition-all duration-500"
                    style={{
                      width: `${todaySchedule.totalDoses > 0 ? (todaySchedule.missedDoses / todaySchedule.totalDoses) * 100 : 0}%`,
                    }}
                  />
                  <div
                    className="bg-slate-400 transition-all duration-500"
                    style={{
                      width: `${todaySchedule.totalDoses > 0 ? (todaySchedule.skippedDoses / todaySchedule.totalDoses) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Time Slot Sections: Morning, Afternoon, Evening, Night */}
            {(['morning', 'afternoon', 'evening', 'night'] as const).map((slotKey) => {
              const items = todaySchedule ? todaySchedule[slotKey] : [];
              const slotIcons = {
                morning: <Sun className="w-5 h-5 text-amber-500" />,
                afternoon: <Sun className="w-5 h-5 text-orange-500" />,
                evening: <Sunset className="w-5 h-5 text-indigo-500" />,
                night: <Moon className="w-5 h-5 text-purple-500" />,
              };
              const slotTitles = {
                morning: 'Morning Doses (05:00 AM – 11:59 AM)',
                afternoon: 'Afternoon Doses (12:00 PM – 04:59 PM)',
                evening: 'Evening Doses (05:00 PM – 08:59 PM)',
                night: 'Night Doses (09:00 PM – 04:59 AM)',
              };

              return (
                <div key={slotKey} className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    {slotIcons[slotKey]}
                    <h3 className="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200">
                      {slotTitles[slotKey]}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      {items.length}
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                      No medicines scheduled for this time window.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map((item) => (
                        <div
                          key={item.reminderId}
                          id={`med-card-${item.reminderId}`}
                          className={`p-5 rounded-2xl border transition-all shadow-sm ${
                            item.status === 'TAKEN'
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                              : item.status === 'MISSED'
                              ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 shadow-rose-500/5'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-500/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                                  {item.medicineName}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                                  {item.dosage}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                {foodTimingBadge(item.foodTiming)}
                                <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  {item.scheduledTime}
                                </span>
                              </div>
                            </div>
                            <div>{statusBadge(item.status)}</div>
                          </div>

                          {item.instructions && (
                            <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                              <span>{item.instructions}</span>
                            </div>
                          )}

                          {item.actionTime && (
                            <div className="mt-2 text-[11px] text-slate-400">
                              Logged at: {new Date(item.actionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {/* Test Alert Dispatch Buttons */}
                              <button
                                onClick={() => handleSendTestAlert(item.reminderId, ReminderNotificationChannel.EMAIL)}
                                title="Send test Email alert"
                                className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-xs flex items-center gap-1 transition"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleSendTestAlert(item.reminderId, ReminderNotificationChannel.WHATSAPP)}
                                title="Send test WhatsApp alert"
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-1 transition"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleSendTestAlert(item.reminderId, ReminderNotificationChannel.SMS)}
                                title="Send test SMS alert"
                                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs flex items-center gap-1 transition"
                              >
                                <Smartphone className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              {item.status !== 'TAKEN' && (
                                <button
                                  onClick={() => handleMarkTaken(item.reminderId, item.medicineName)}
                                  disabled={actionLoadingId === item.reminderId}
                                  id={`btn-take-${item.reminderId}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" /> Mark Taken
                                </button>
                              )}

                              {item.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleMarkMissed(item.reminderId, item.medicineName)}
                                    disabled={actionLoadingId === item.reminderId}
                                    id={`btn-miss-${item.reminderId}`}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 transition"
                                  >
                                    Mark Missed
                                  </button>
                                  <button
                                    onClick={() => handleMarkSkipped(item.reminderId, item.medicineName)}
                                    disabled={actionLoadingId === item.reminderId}
                                    id={`btn-skip-${item.reminderId}`}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                                  >
                                    Skip
                                  </button>
                                </>
                              )}

                              {item.status === 'TAKEN' && (
                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" /> Dose Completed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: PRESCRIBED MEDICINES */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Prescribed Medicines by Doctors</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Medicines prescribed during your consultations. Activate reminders with 1 click to track adherence.
                </p>
              </div>
            </div>

            {prescribedMeds.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
                <Pill className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                <p className="font-semibold text-sm">No doctor prescriptions found.</p>
                <p className="text-xs text-slate-400 mt-1">You can create custom reminders anytime using the "Add Reminder" button above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prescribedMeds.map((rx) => (
                  <div
                    key={rx.prescriptionItemId}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{rx.medicineName}</h3>
                          {rx.genericName && (
                            <p className="text-xs text-slate-400 italic">{rx.genericName}</p>
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {rx.dosage}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                        <div><strong className="text-slate-700 dark:text-slate-300">Frequency:</strong> {rx.frequency}</div>
                        <div><strong className="text-slate-700 dark:text-slate-300">Duration:</strong> {rx.duration} ({rx.route})</div>
                        <div><strong className="text-slate-700 dark:text-slate-300">Prescribing Physician:</strong> {rx.doctorName} ({rx.specialty})</div>
                        {rx.instructions && (
                          <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 text-slate-500 text-[11px]">
                            {rx.instructions}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      {rx.hasActiveReminder ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" /> Active on Daily Schedule
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCreateFromPrescription(rx)}
                          disabled={actionLoadingId === rx.prescriptionItemId}
                          className="w-full py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add to Daily Reminders
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ANALYTICS */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Weekly Adherence</div>
                <div className="text-3xl font-black text-teal-600 dark:text-teal-400 mt-2">
                  {analytics.weeklyAdherencePercentage}%
                </div>
                <p className="text-xs text-slate-400 mt-1">Past 7 days dose completion rate</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Monthly Adherence</div>
                <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">
                  {analytics.monthlyAdherencePercentage}%
                </div>
                <p className="text-xs text-slate-400 mt-1">30 days aggregate adherence</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Medicine Compliance Score</div>
                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                  {analytics.complianceScore} / 100
                </div>
                <p className="text-xs text-slate-400 mt-1">Weighted clinical regularity score</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Adherence Streak</div>
                <div className="text-3xl font-black text-amber-500 mt-2 flex items-center gap-1.5">
                  <Flame className="w-7 h-7" /> {analytics.streakDays} Days
                </div>
                <p className="text-xs text-slate-400 mt-1">Consecutive regular adherence</p>
              </div>
            </div>

            {/* 7-Day Visual Adherence Chart */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">7-Day Daily Adherence History</h3>
              <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4">
                {analytics.dailyBreakdown.map((day) => (
                  <div key={day.date} className="flex flex-col items-center gap-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{day.dayName}</div>
                    <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex flex-col justify-end p-1">
                      <div
                        className={`w-full rounded-lg transition-all duration-500 ${
                          day.adherenceRate >= 80
                            ? 'bg-emerald-500'
                            : day.adherenceRate >= 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ height: `${Math.max(day.adherenceRate, 10)}%` }}
                      />
                    </div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">{day.adherenceRate}%</div>
                    <div className="text-[10px] text-slate-400 text-center">
                      {day.taken}/{day.total} doses
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: NOTIFICATIONS & MULTI-CHANNEL ALERTS */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* Channels Overview Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Multi-Channel Reminder Gateways</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                MediNexa automatically dispatches dose reminders through your verified channels.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <BellRing className="w-4 h-4 text-teal-500" /> Browser Web Push
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Direct on-screen desktop and mobile push notifications when doses are due.
                  </p>
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${pushEnabled ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                    {pushEnabled ? 'Enabled' : 'Click Hero Button to Enable'}
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <MessageSquare className="w-4 h-4 text-emerald-500" /> WhatsApp Integration
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Formatted WhatsApp interactive message with medicine name, food timing, and dose notes.
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Twilio / Meta API Active
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Smartphone className="w-4 h-4 text-blue-500" /> SMS DLT Gateway
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    TRAI DLT-approved SMS notifications via MSG91 gateway for critical medicine reminders.
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    DLT Sender: MDNEXA
                  </span>
                </div>
              </div>
            </div>

            {/* Notification Delivery Logs */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Recent Notification Delivery History</h3>
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No notification logs recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-3 flex items-start justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{n.title}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {n.channel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{n.message}</p>
                      </div>
                      <div className="text-right text-[11px] text-slate-400 flex-shrink-0">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Add Custom Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Create Medication Schedule</h3>
                  <p className="text-xs text-slate-400">Add a custom or OTC medicine reminder</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol, Metformin, Vitamin D3"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  id="modal-medicine-name-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    placeholder="e.g. 500 mg, 1 tablet"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    id="modal-dosage-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    id="modal-frequency-select"
                  >
                    <option value="Daily">Daily (OD)</option>
                    <option value="Alternate Day">Alternate Day</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Custom Schedule">Custom Schedule</option>
                    <option value="Twice daily">Twice daily (BD)</option>
                    <option value="Three times daily">Three times daily (TDS)</option>
                    <option value="Four times daily">Four times daily (QID)</option>
                    <option value="As needed">As needed (SOS)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Food Timing</label>
                  <select
                    value={newFoodTiming}
                    onChange={(e) => setNewFoodTiming(e.target.value as FoodTiming)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    id="modal-food-timing-select"
                  >
                    <option value={FoodTiming.AFTER_FOOD}>After Food</option>
                    <option value={FoodTiming.BEFORE_FOOD}>Before Food</option>
                    <option value={FoodTiming.WITH_FOOD}>With Food</option>
                    <option value={FoodTiming.NO_RESTRICTION}>No Restriction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Reminder Time</label>
                  <input
                    type="text"
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                    placeholder="e.g. 08:00 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    id="modal-reminder-time-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    id="modal-start-date-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    id="modal-end-date-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Instructions / Notes</label>
                <input
                  type="text"
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="e.g. Take with warm water, avoid dairy"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  id="modal-instructions-input"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingReminder}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition disabled:opacity-50"
                  id="modal-save-reminder-btn"
                >
                  {creatingReminder ? 'Saving Schedule...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
