'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Pill,
  Search,
  User,
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
  PauseCircle,
  PlayCircle,
  Trash2,
  Edit,
  Coffee,
  Check,
  Filter,
  Users,
  Stethoscope,
  Info,
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { FoodTiming, ReminderStatus, ReminderAction, ReminderNotificationChannel } from '@medinexa/types';

interface PatientOption {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  gender?: string;
  dateOfBirth?: string;
}

interface MedicationReminder {
  id: string;
  patientId: string;
  medicineName: string;
  dosage?: string;
  frequency: string;
  foodTiming: FoodTiming;
  startDate: string;
  endDate?: string;
  reminderTime?: string;
  scheduledTime: string;
  instructions?: string;
  status: ReminderStatus;
  lastTakenAt?: string;
  skippedAt?: string;
  lastNotifiedAt?: string;
  doctor?: {
    user: {
      firstName: string;
      lastName: string;
    };
    specialty?: {
      name: string;
    };
  };
}

export default function DoctorMedicationRemindersStation() {
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [todaySchedule, setTodaySchedule] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED' | 'CANCELLED'>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Doctor Schedule Creation Wizard Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [wizardMedName, setWizardMedName] = useState('');
  const [wizardDosage, setWizardDosage] = useState('500 mg');
  const [wizardFrequency, setWizardFrequency] = useState('Twice daily');
  const [wizardFoodTiming, setWizardFoodTiming] = useState<FoodTiming>(FoodTiming.AFTER_FOOD);
  const [wizardReminderTime, setWizardReminderTime] = useState('08:00 AM');
  const [wizardStartDate, setWizardStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [wizardEndDate, setWizardEndDate] = useState('');
  const [wizardInstructions, setWizardInstructions] = useState('Take after breakfast and dinner with full glass of water.');
  const [wizardPrescriptionItemId, setWizardPrescriptionItemId] = useState('');
  const [creatingSchedule, setCreatingSchedule] = useState(false);

  // Load registered patients list on mount
  useEffect(() => {
    async function loadPatients() {
      try {
        const res = await apiFetch<any[]>('/patients');
        if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
          setPatients(res.data);
          setSelectedPatientId(res.data[0].id);
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
      }
    }
    loadPatients();
  }, []);

  // Load details whenever selectedPatientId changes
  const loadPatientReminders = useCallback(async () => {
    if (!selectedPatientId) return;
    setLoading(true);
    try {
      const [remRes, analyticsRes, todayRes, rxRes] = await Promise.all([
        apiFetch<MedicationReminder[]>(`/medication-reminders?patientId=${selectedPatientId}`),
        apiFetch<any>(`/medication-reminders/analytics?patientId=${selectedPatientId}`),
        apiFetch<any>(`/medication-reminders/today?patientId=${selectedPatientId}`),
        apiFetch<any[]>(`/medication-reminders/prescriptions?patientId=${selectedPatientId}`),
      ]);

      if (remRes.ok && remRes.data) setReminders(remRes.data);
      if (analyticsRes.ok && analyticsRes.data) setAnalytics(analyticsRes.data);
      if (todayRes.ok && todayRes.data) setTodaySchedule(todayRes.data);
      if (rxRes.ok && rxRes.data) setPrescriptions(rxRes.data);
    } catch (err) {
      setToastMsg({ type: 'error', text: 'Unable to load patient medication data.' });
    } finally {
      setLoading(false);
    }
  }, [selectedPatientId]);

  useEffect(() => {
    loadPatientReminders();
  }, [loadPatientReminders]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  // Doctor creates new schedule for patient
  async function handleDoctorCreateSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPatientId) {
      setToastMsg({ type: 'error', text: 'Please select a patient first.' });
      return;
    }
    if (!wizardMedName.trim()) {
      setToastMsg({ type: 'error', text: 'Medicine name is required.' });
      return;
    }

    setCreatingSchedule(true);
    try {
      const res = await apiFetch('/medication-reminders', {
        method: 'POST',
        body: JSON.stringify({
          patientId: selectedPatientId,
          prescriptionItemId: wizardPrescriptionItemId || undefined,
          medicineName: wizardMedName.trim(),
          dosage: wizardDosage,
          frequency: wizardFrequency,
          foodTiming: wizardFoodTiming,
          reminderTime: wizardReminderTime,
          startDate: wizardStartDate,
          endDate: wizardEndDate || undefined,
          instructions: wizardInstructions,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setWizardMedName('');
        setToastMsg({ type: 'success', text: `Schedule created successfully for ${wizardMedName}!` });
        await loadPatientReminders();
      } else {
        setToastMsg({ type: 'error', text: res.message || 'Failed to create medication schedule.' });
      }
    } catch (err) {
      setToastMsg({ type: 'error', text: 'Error connecting to server.' });
    } finally {
      setCreatingSchedule(false);
    }
  }

  // Toggle Pause/Resume
  async function handleTogglePause(reminderId: string, currentStatus: ReminderStatus) {
    setActionLoadingId(reminderId);
    const endpoint = currentStatus === ReminderStatus.ACTIVE ? 'pause' : 'resume';
    try {
      const res = await apiFetch(`/medication-reminders/${reminderId}/${endpoint}`, { method: 'POST' });
      if (res.ok) {
        setToastMsg({
          type: 'info',
          text: `Schedule ${endpoint === 'pause' ? 'paused' : 'resumed'}.`,
        });
        await loadPatientReminders();
      } else {
        setToastMsg({ type: 'error', text: res.message || 'Could not update schedule.' });
      }
    } catch (err) {
      setToastMsg({ type: 'error', text: 'Operation failed.' });
    } finally {
      setActionLoadingId(null);
    }
  }

  // Delete / Cancel reminder
  async function handleDeleteReminder(reminderId: string, medicineName: string) {
    if (!confirm(`Are you sure you want to cancel the schedule for ${medicineName}?`)) return;
    setActionLoadingId(reminderId);
    try {
      const res = await apiFetch(`/medication-reminders/${reminderId}`, { method: 'DELETE' });
      if (res.ok) {
        setToastMsg({ type: 'info', text: `Schedule cancelled for ${medicineName}.` });
        await loadPatientReminders();
      } else {
        setToastMsg({ type: 'error', text: res.message || 'Could not cancel schedule.' });
      }
    } catch (err) {
      setToastMsg({ type: 'error', text: 'Operation failed.' });
    } finally {
      setActionLoadingId(null);
    }
  }

  // Multi-channel alert dispatch simulation from doctor station
  async function handleDispatchAlert(reminderId: string, channel: ReminderNotificationChannel) {
    setActionLoadingId(`${reminderId}-${channel}`);
    try {
      const res = await apiFetch('/medication-reminders/test-dispatch', {
        method: 'POST',
        body: JSON.stringify({ reminderId, channel }),
      });
      if (res.ok) {
        setToastMsg({
          type: 'success',
          text: `Instant ${channel.replace('_', ' ')} reminder dispatched to patient!`,
        });
      } else {
        setToastMsg({ type: 'error', text: res.message || 'Dispatch failed.' });
      }
    } catch (err) {
      setToastMsg({ type: 'error', text: 'Dispatch error.' });
    } finally {
      setActionLoadingId(null);
    }
  }

  // Filter reminders
  const filteredReminders = reminders.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  const foodTimingLabel = (t: FoodTiming) => {
    switch (t) {
      case FoodTiming.BEFORE_FOOD:
        return 'Before Food';
      case FoodTiming.AFTER_FOOD:
        return 'After Food';
      case FoodTiming.WITH_FOOD:
        return 'With Food';
      default:
        return 'No Restriction';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Message */}
      {toastMsg && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between border shadow-sm transition-all ${
            toastMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
              : toastMsg.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800'
          }`}
        >
          <span>{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} className="text-xs underline hover:opacity-75">
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white shadow-lg border border-teal-800/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30 mb-2">
            <Stethoscope className="w-3.5 h-3.5" /> CLINICAL ADHERENCE STATION
          </div>
          <h1 className="text-2xl font-black tracking-tight">Medication Reminders & Schedule Manager</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Create physician medication schedules, set food timings, monitor live patient adherence, and trigger multi-channel dose alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            id="doctor-new-schedule-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-600 text-white shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Create Medicine Schedule
          </button>
        </div>
      </div>

      {/* Patient Selector Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 sm:w-72">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Select Patient Record
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              id="patient-selector-dropdown"
              className="w-full px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.user ? `${p.user.firstName} ${p.user.lastName}` : 'Patient'} {p.user?.phone ? `(${p.user.phone})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Patient Identity Badge */}
        {selectedPatient && (
          <div className="flex items-center gap-4 text-xs">
            <div className="hidden md:block text-right">
              <div className="font-extrabold text-slate-900 dark:text-white">
                {selectedPatient.user ? `${selectedPatient.user.firstName} ${selectedPatient.user.lastName}` : 'Patient'}
              </div>
              <div className="text-slate-400 text-[11px]">{selectedPatient.user?.email}</div>
            </div>
            <button
              onClick={loadPatientReminders}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              title="Refresh patient data"
              id="refresh-patient-data-btn"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Patient Adherence KPI Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Weekly Adherence</div>
              <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
                {analytics.weeklyAdherencePercentage}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">7-day regular compliance</div>
            </div>
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Adherence</div>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {analytics.monthlyAdherencePercentage}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">30-day aggregate compliance</div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Compliance Score</div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {analytics.complianceScore} / 100
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Weighted clinical index</div>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Streak</div>
              <div className="text-2xl font-black text-amber-500 mt-1 flex items-center gap-1.5">
                <Flame className="w-6 h-6" /> {analytics.streakDays} Days
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{analytics.missedCount} missed doses (30d)</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
              <Flame className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Medication Schedules Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Configured Medication Schedules</h2>
            <p className="text-xs text-slate-400">Active and past reminder regimens for this patient</p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2">
            {(['ALL', 'ACTIVE', 'PAUSED', 'CANCELLED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === f
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredReminders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Pill className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="font-semibold text-sm">No medication schedules found for this filter.</p>
            <p className="text-xs">Click "Create Medicine Schedule" above to add a new schedule.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-extrabold">Medicine & Dosage</th>
                  <th className="px-4 py-3 font-extrabold">Frequency</th>
                  <th className="px-4 py-3 font-extrabold">Food Timing</th>
                  <th className="px-4 py-3 font-extrabold">Scheduled Time</th>
                  <th className="px-4 py-3 font-extrabold">Status</th>
                  <th className="px-4 py-3 font-extrabold">Multi-Channel Alerts</th>
                  <th className="px-4 py-3 font-extrabold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReminders.map((rem) => (
                  <tr key={rem.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-teal-500 flex-shrink-0" />
                        <div>
                          <div className="font-bold">{rem.medicineName}</div>
                          <div className="text-[11px] text-slate-400">{rem.dosage || 'Prescribed dose'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">{rem.frequency}</td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <Coffee className="w-3 h-3 text-amber-500" />
                        {foodTimingLabel(rem.foodTiming)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {rem.scheduledTime || rem.reminderTime || '08:00 AM'}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          rem.status === ReminderStatus.ACTIVE
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : rem.status === ReminderStatus.PAUSED
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {rem.status}
                      </span>
                    </td>

                    {/* Instant Multi-Channel Dispatch Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDispatchAlert(rem.id, ReminderNotificationChannel.WHATSAPP)}
                          title="Send instant WhatsApp alert to patient"
                          disabled={actionLoadingId === `${rem.id}-${ReminderNotificationChannel.WHATSAPP}`}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDispatchAlert(rem.id, ReminderNotificationChannel.SMS)}
                          title="Send instant SMS alert to patient"
                          disabled={actionLoadingId === `${rem.id}-${ReminderNotificationChannel.SMS}`}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 transition"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDispatchAlert(rem.id, ReminderNotificationChannel.IN_APP)}
                          title="Send in-app reminder"
                          disabled={actionLoadingId === `${rem.id}-${ReminderNotificationChannel.IN_APP}`}
                          className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 transition"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Control Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {rem.status !== ReminderStatus.CANCELLED && (
                          <button
                            onClick={() => handleTogglePause(rem.id, rem.status)}
                            disabled={actionLoadingId === rem.id}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                            title={rem.status === ReminderStatus.ACTIVE ? 'Pause Schedule' : 'Resume Schedule'}
                          >
                            {rem.status === ReminderStatus.ACTIVE ? (
                              <PauseCircle className="w-4 h-4 text-amber-600" />
                            ) : (
                              <PlayCircle className="w-4 h-4 text-emerald-600" />
                            )}
                          </button>
                        )}

                        {rem.status !== ReminderStatus.CANCELLED && (
                          <button
                            onClick={() => handleDeleteReminder(rem.id, rem.medicineName)}
                            disabled={actionLoadingId === rem.id}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition"
                            title="Cancel / Delete Schedule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Doctor Schedule Creation Wizard Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Doctor Medication Scheduler</h3>
                  <p className="text-xs text-slate-400">Configure reminder regimen for selected patient</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDoctorCreateSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amoxicillin 500mg, Atorvastatin 20mg"
                  value={wizardMedName}
                  onChange={(e) => setWizardMedName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  id="wizard-medicine-name-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={wizardDosage}
                    onChange={(e) => setWizardDosage(e.target.value)}
                    placeholder="e.g. 500 mg, 1 tablet"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    id="wizard-dosage-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
                  <select
                    value={wizardFrequency}
                    onChange={(e) => setWizardFrequency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    id="wizard-frequency-select"
                  >
                    <option value="Daily">Daily (OD)</option>
                    <option value="Alternate Day">Alternate Day</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Custom Schedule">Custom Schedule</option>
                    <option value="Twice daily">Twice daily (BD)</option>
                    <option value="Three times daily">Three times daily (TDS)</option>
                    <option value="Four times daily">Four times daily (QID)</option>
                    <option value="Every 8 hours">Every 8 hours</option>
                    <option value="As needed">As needed (SOS)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Food Timing</label>
                  <select
                    value={wizardFoodTiming}
                    onChange={(e) => setWizardFoodTiming(e.target.value as FoodTiming)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    id="wizard-food-timing-select"
                  >
                    <option value={FoodTiming.AFTER_FOOD}>After Food (Postprandial)</option>
                    <option value={FoodTiming.BEFORE_FOOD}>Before Food (Empty Stomach)</option>
                    <option value={FoodTiming.WITH_FOOD}>With Food / Meals</option>
                    <option value={FoodTiming.NO_RESTRICTION}>No Restriction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Reminder Time</label>
                  <input
                    type="text"
                    value={wizardReminderTime}
                    onChange={(e) => setWizardReminderTime(e.target.value)}
                    placeholder="e.g. 08:00 AM, 08:00 PM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    id="wizard-reminder-time-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={wizardStartDate}
                    onChange={(e) => setWizardStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    id="wizard-start-date-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={wizardEndDate}
                    onChange={(e) => setWizardEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    id="wizard-end-date-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Physician Instructions & Warnings
                </label>
                <input
                  type="text"
                  value={wizardInstructions}
                  onChange={(e) => setWizardInstructions(e.target.value)}
                  placeholder="e.g. Complete the full 7-day antibiotic course"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  id="wizard-instructions-input"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSchedule}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition disabled:opacity-50"
                  id="wizard-save-schedule-btn"
                >
                  {creatingSchedule ? 'Saving Schedule...' : 'Save & Activate Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
