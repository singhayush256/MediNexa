'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Smartphone,
  PhoneOff,
  Bell,
  BellOff,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  Check,
  X,
  RefreshCw,
  Power,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import {
  MedicineCommunicationReason,
  PatientMedicineCommunicationStatusDto,
  RoleCode,
} from '@medinexa/types';
import {
  subscribeMedicineCommunication,
  triggerMedicineCommunicationBroadcast,
} from '@/lib/realtime-telemetry';

export interface MedicineCommunicationControlProps {
  patientId: string;
  patientName?: string;
  patientPhone?: string;
  onStatusChange?: (newStatus: PatientMedicineCommunicationStatusDto) => void;
  compact?: boolean;
  className?: string;
}

const REASONS: { key: MedicineCommunicationReason; label: string; description: string }[] = [
  {
    key: MedicineCommunicationReason.NO_MOBILE_PHONE,
    label: 'No mobile phone',
    description: 'Patient does not possess a mobile or smartphone device.',
  },
  {
    key: MedicineCommunicationReason.NO_USABLE_NOTIFICATION_CHANNEL,
    label: 'No usable notification channel',
    description: 'No active WhatsApp, SMS, or app capability available.',
  },
  {
    key: MedicineCommunicationReason.PATIENT_REQUESTED_OFF,
    label: 'Patient requested communication off',
    description: 'Patient explicitly opted out of receiving medicine reminders.',
  },
  {
    key: MedicineCommunicationReason.CAREGIVER_MANAGED,
    label: 'Caregiver-managed medication',
    description: 'Bedside nurse, family, or caregiver administers medications directly.',
  },
  {
    key: MedicineCommunicationReason.OTHER,
    label: 'Other',
    description: 'Custom clinical or administrative justification.',
  },
];

export function MedicineCommunicationControl({
  patientId,
  patientName = 'Patient',
  patientPhone,
  onStatusChange,
  compact = false,
  className = '',
}: MedicineCommunicationControlProps) {
  const [status, setStatus] = useState<PatientMedicineCommunicationStatusDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Modal State for Confirmation Dialog
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<MedicineCommunicationReason>(
    MedicineCommunicationReason.NO_MOBILE_PHONE,
  );
  const [reasonNote, setReasonNote] = useState('');

  // Current logged in user role check
  const [userRole, setUserRole] = useState<string>('DOCTOR');
  const [canToggle, setCanToggle] = useState<boolean>(true);

  // Resolve user role from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('medinexa_user');
      if (stored) {
        const u = JSON.parse(stored);
        const r = (u.roleCode || u.role?.code || u.role || '').toUpperCase();
        setUserRole(r);
        const authorized = [
          'DOCTOR',
          'NURSE',
          'RECEPTIONIST',
          'HOSPITAL_ADMIN',
          'MEDINEXA_ADMIN',
          'SUPER_ADMIN',
          'ADMIN',
        ].includes(r);
        setCanToggle(authorized);
      }
    } catch {}
  }, []);

  // Fetch status from API
  const fetchStatus = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<PatientMedicineCommunicationStatusDto>(
        `/medication-reminders/communication-status?patientId=${patientId}`,
      );
      if (res.ok && res.data) {
        setStatus(res.data);
        if (onStatusChange) onStatusChange(res.data);
      } else {
        // Fallback default
        const phone = patientPhone || '';
        const hasMobile = phone.trim().length >= 6;
        const defaultDto: PatientMedicineCommunicationStatusDto = {
          patientId,
          enabled: hasMobile,
          status: hasMobile ? 'ON' : 'OFF',
          notificationStatus: hasMobile ? 'ACTIVE' : 'DISABLED',
          scoreStatus: hasMobile ? 'ACTIVE' : 'PROTECTED',
          reason: hasMobile ? undefined : MedicineCommunicationReason.NO_MOBILE_PHONE,
          explanation: hasMobile
            ? 'Medicine communication and notifications are active.'
            : 'Medicine communication is disabled because the patient does not have a usable mobile phone. Medicine score is protected from notification penalties.',
          hasMobile,
          phone: phone || undefined,
          updatedAt: new Date().toISOString(),
        };
        setStatus(defaultDto);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch medicine communication status');
    } finally {
      setLoading(false);
    }
  }, [patientId, patientPhone, onStatusChange]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Real-time synchronization: listen for events from other staff / devices
  useEffect(() => {
    const unsubscribe = subscribeMedicineCommunication((event: any) => {
      if (event && event.patientId === patientId) {
        setStatus((prev) => {
          if (!prev) return null;
          const next: PatientMedicineCommunicationStatusDto = {
            ...prev,
            enabled: event.enabled,
            status: event.enabled ? 'ON' : 'OFF',
            notificationStatus: event.enabled ? 'ACTIVE' : 'DISABLED',
            scoreStatus: event.enabled ? 'ACTIVE' : 'PROTECTED',
            reason: event.reason,
            reasonNote: event.reasonNote,
            disabledByRole: event.updatedByRole,
            updatedAt: event.timestamp || new Date().toISOString(),
          };
          if (onStatusChange) onStatusChange(next);
          return next;
        });

        const actionText = event.enabled ? 'turned ON' : 'turned OFF';
        setToast(`Medicine communication was ${actionText} by hospital staff.`);
        setTimeout(() => setToast(null), 4000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [patientId, onStatusChange]);

  // Handle Toggle to ON
  const handleTurnOn = async () => {
    if (!canToggle || updating) return;
    setUpdating(true);
    setError(null);
    try {
      const res = await apiFetch<PatientMedicineCommunicationStatusDto>(
        `/medication-reminders/communication-status`,
        {
          method: 'POST',
          body: JSON.stringify({
            patientId,
            enabled: true,
          }),
        },
      );

      if (res.ok && res.data) {
        setStatus(res.data);
        if (onStatusChange) onStatusChange(res.data);
        triggerMedicineCommunicationBroadcast(res.data);
        setToast('Medicine communication turned ON. Notifications & adherence scoring active.');
        setTimeout(() => setToast(null), 4000);
      } else {
        throw new Error(res.message || 'Failed to turn ON medicine communication');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating medicine communication');
    } finally {
      setUpdating(false);
    }
  };

  // Handle Toggle to OFF (via Confirmation Dialog)
  const handleConfirmTurnOff = async () => {
    if (!canToggle || updating) return;
    setUpdating(true);
    setError(null);
    try {
      const res = await apiFetch<PatientMedicineCommunicationStatusDto>(
        `/medication-reminders/communication-status`,
        {
          method: 'POST',
          body: JSON.stringify({
            patientId,
            enabled: false,
            reason: selectedReason,
            reasonNote: selectedReason === MedicineCommunicationReason.OTHER ? reasonNote : undefined,
          }),
        },
      );

      if (res.ok && res.data) {
        setStatus(res.data);
        if (onStatusChange) onStatusChange(res.data);
        triggerMedicineCommunicationBroadcast(res.data);
        setShowConfirmModal(false);
        setReasonNote('');
        setToast('Medicine communication turned OFF. Medicine score is protected from penalty.');
        setTimeout(() => setToast(null), 4000);
      } else {
        throw new Error(res.message || 'Failed to turn OFF medicine communication');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating medicine communication');
    } finally {
      setUpdating(false);
    }
  };

  const isEnabled = status?.enabled ?? false;
  const displayPhone = status?.phone || patientPhone || '';
  const hasMobile = displayPhone.trim().length >= 6;

  // Render Compact view (e.g. for patient tables or cards)
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 p-2 rounded-xl border text-xs ${
        isEnabled
          ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200'
          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
      } ${className}`}>
        <Smartphone className={`w-3.5 h-3.5 ${isEnabled ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
        <span className="font-bold">Medicine Communication: {isEnabled ? 'ON' : 'OFF'}</span>
        {canToggle && (
          <div className="ml-1 inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-900">
            <button
              onClick={() => { if (!isEnabled) handleTurnOn(); }}
              disabled={updating}
              className={`px-2 py-0.5 rounded text-[10px] font-black transition cursor-pointer ${
                isEnabled ? 'bg-teal-600 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ON
            </button>
            <button
              onClick={() => {
                if (isEnabled) {
                  setSelectedReason(hasMobile ? MedicineCommunicationReason.PATIENT_REQUESTED_OFF : MedicineCommunicationReason.NO_MOBILE_PHONE);
                  setShowConfirmModal(true);
                }
              }}
              disabled={updating}
              className={`px-2 py-0.5 rounded text-[10px] font-black transition cursor-pointer ${
                !isEnabled ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              OFF
            </button>
          </div>
        )}
      </div>
    );
  }

  // Render Full Standard Component
  return (
    <div
      className={`rounded-2xl p-5 border transition-all shadow-xs ${
        isEnabled
          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/50'
          : 'bg-slate-50/90 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      } ${className}`}
    >
      {/* Toast alert if triggered */}
      {toast && (
        <div className="mb-4 p-3 rounded-xl bg-teal-600 text-white text-xs font-semibold flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-200" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-white hover:opacity-75 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Single Master Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className={`w-4 h-4 ${isEnabled ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
              Medicine Communication
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isEnabled
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isEnabled ? 'ON' : 'OFF'}
            </span>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
            {isEnabled ? (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>reminders enabled • notification-based adherence scoring active</span>
              </>
            ) : (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                <span>reminders disabled • notification-based adherence penalty protected</span>
              </>
            )}
          </div>

          {displayPhone && (
            <div className="text-[11px] text-slate-400">
              Registered Phone: <span className="font-semibold text-slate-600 dark:text-slate-300">{displayPhone}</span>
            </div>
          )}
        </div>

        {/* Master Toggle Control */}
        <div className="flex items-center gap-3">
          {canToggle ? (
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-200/90 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
              <button
                type="button"
                id="btn-med-comm-on"
                disabled={updating || loading}
                onClick={() => {
                  if (!isEnabled) handleTurnOn();
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  isEnabled
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ON
              </button>
              <button
                type="button"
                id="btn-med-comm-off"
                disabled={updating || loading}
                onClick={() => {
                  if (isEnabled) {
                    setSelectedReason(
                      hasMobile
                        ? MedicineCommunicationReason.PATIENT_REQUESTED_OFF
                        : MedicineCommunicationReason.NO_MOBILE_PHONE
                    );
                    setShowConfirmModal(true);
                  }
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  !isEnabled
                    ? 'bg-slate-700 dark:bg-slate-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                OFF
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic">
              Authorized: Doctor, Nurse, Receptionist
            </div>
          )}
        </div>
      </div>

      {/* CONFIRMATION MODAL WHEN TURNING OFF */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Turn off medicine communication?
                </h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                This will disable:
              </p>
              <ul className="list-disc pl-5 space-y-1 font-medium">
                <li>Medicine reminder notifications</li>
                <li>Notification-dependent medicine scoring</li>
              </ul>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 font-semibold text-[11px] leading-relaxed">
                ✓ It will NOT stop prescriptions, pharmacy processing, medicine dispensing, or nursing medication workflows.
              </div>
            </div>

            {/* Reason Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Reason for turning off:
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {REASONS.map((r) => (
                  <label
                    key={r.key}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      selectedReason === r.key
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="communication_reason"
                      value={r.key}
                      checked={selectedReason === r.key}
                      onChange={() => setSelectedReason(r.key)}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="text-xs font-bold">{r.label}</div>
                      <div className="text-[11px] opacity-75">{r.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Note input if OTHER selected */}
            {selectedReason === MedicineCommunicationReason.OTHER && (
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-400">
                  Custom Clinical / Staff Note:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inpatient on total parental nutrition"
                  value={reasonNote}
                  onChange={(e) => setReasonNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={updating}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmTurnOff}
                disabled={updating}
                id="btn-modal-confirm-turn-off"
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition flex items-center gap-1.5"
              >
                {updating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Power className="w-3.5 h-3.5" />
                )}
                Turn Off
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
