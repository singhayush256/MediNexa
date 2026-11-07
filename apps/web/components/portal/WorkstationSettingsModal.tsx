'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Bell,
  Lock,
  Moon,
  Sun,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Volume2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { getUserSettings, updateUserSettings, useAuthenticatedUser } from '@/lib/auth-session';

interface WorkstationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workstationTitle?: string;
  roleCode?: string;
}

export function WorkstationSettingsModal({
  isOpen,
  onClose,
  workstationTitle = 'Workstation Terminal',
  roleCode = 'STAFF',
}: WorkstationSettingsModalProps) {
  const { user } = useAuthenticatedUser();

  const [activeTab, setActiveTab] = useState<'notifications' | 'appearance' | 'security'>('notifications');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Notification state
  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    whatsappEnabled: true,
    appointmentReminders: true,
    medicationReminders: true,
    labReportAlerts: true,
    emergencyTriageAlerts: true,
    soundAlerts: true,
  });

  // Appearance state
  const [appearance, setAppearance] = useState({
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    soundVolume: 'HIGH',
  });

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getUserSettings().then((res) => {
        if (res.ok && res.settings) {
          if (res.settings.notifications) {
            setNotifications((prev) => ({ ...prev, ...res.settings.notifications }));
          }
          if (res.settings.appearance) {
            setAppearance((prev) => ({ ...prev, ...res.settings.appearance }));
          }
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const normalizedRole = (roleCode || user?.roleCode || user?.role?.code || 'STAFF').toUpperCase();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await updateUserSettings({
      notifications,
      appearance,
    });

    setSaving(false);
    if (res.ok) {
      setSuccessMsg('Workstation preferences saved and applied to terminal! ✓');
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setErrorMsg(res.message || 'Failed to save settings.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-7 space-y-6 shadow-2xl animate-in fade-in duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {workstationTitle} Settings
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Configure workstation alerts, display mode, and security preferences
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'notifications'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Notifications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'appearance'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Appearance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'security'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Security & 2FA
          </button>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* TAB 1: NOTIFICATIONS & ALERTS */}
          {activeTab === 'notifications' && (
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Department & Operational Alerts
              </div>

              {/* Emergency / Critical Alert */}
              <label className="flex items-start justify-between p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 cursor-pointer">
                <div>
                  <div className="font-bold text-rose-900 dark:text-rose-300">Emergency & Trauma Triage Alerts</div>
                  <div className="text-[10px] text-slate-500">
                    Immediate audible banner alert when priority red-triage patients arrive
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emergencyTriageAlerts}
                  onChange={(e) => setNotifications({ ...notifications, emergencyTriageAlerts: e.target.checked })}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                />
              </label>

              {/* Role-Specific Alert Checks */}
              {normalizedRole === 'DOCTOR' && (
                <>
                  <label className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">New OPD Consultation Queue Reminders</div>
                      <div className="text-[10px] text-slate-500">Alerts when consecutive tokens check in at reception</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.appointmentReminders}
                      onChange={(e) => setNotifications({ ...notifications, appointmentReminders: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Critical Lab & Diagnostic Result Alerts</div>
                      <div className="text-[10px] text-slate-500">Notify immediately when panic lab values are published</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.labReportAlerts}
                      onChange={(e) => setNotifications({ ...notifications, labReportAlerts: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </>
              )}

              {normalizedRole === 'NURSE' && (
                <>
                  <label className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">MAR Scheduled Medication Due Alarms</div>
                      <div className="text-[10px] text-slate-500">Chime 15 minutes prior to medication administration time</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.medicationReminders}
                      onChange={(e) => setNotifications({ ...notifications, medicationReminders: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Inpatient Admission & Bed Assignment Alerts</div>
                      <div className="text-[10px] text-slate-500">Notifies when reception assigns new patient to your floor ward</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.appointmentReminders}
                      onChange={(e) => setNotifications({ ...notifications, appointmentReminders: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </>
              )}

              {normalizedRole === 'RECEPTIONIST' && (
                <>
                  <label className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Queue & Token Sound Announcements</div>
                      <div className="text-[10px] text-slate-500">Play terminal chime when token is advanced or called</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.soundAlerts}
                      onChange={(e) => setNotifications({ ...notifications, soundAlerts: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Online Portal Appointment Arrivals</div>
                      <div className="text-[10px] text-slate-500">Notification when booked patients check in at hospital gate</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.appointmentReminders}
                      onChange={(e) => setNotifications({ ...notifications, appointmentReminders: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </>
              )}

              {['BILLING_STAFF', 'INSURANCE_STAFF'].includes(normalizedRole) && (
                <>
                  <label className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Discharge Pending Invoice Settlement Alerts</div>
                      <div className="text-[10px] text-slate-500">Notify counter when clinical discharge order is signed by physician</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.appointmentReminders}
                      onChange={(e) => setNotifications({ ...notifications, appointmentReminders: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">TPA Cashless Pre-Auth Status Notifications</div>
                      <div className="text-[10px] text-slate-500">Alert when insurance company approves or queries pre-authorization</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.labReportAlerts}
                      onChange={(e) => setNotifications({ ...notifications, labReportAlerts: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </>
              )}

              {['LAB_STAFF', 'RADIOLOGIST'].includes(normalizedRole) && (
                <>
                  <label className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">New Diagnostic Order Queue Alerts</div>
                      <div className="text-[10px] text-slate-500">Notifies when doctors submit OPD or ER lab/scan requisitions</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.labReportAlerts}
                      onChange={(e) => setNotifications({ ...notifications, labReportAlerts: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Stat / Urgent Priority Specimen Chimes</div>
                      <div className="text-[10px] text-slate-500">Immediate chime for ICU and ER stat diagnostic requisitions</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emergencyTriageAlerts}
                      onChange={(e) => setNotifications({ ...notifications, emergencyTriageAlerts: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </>
              )}

              {normalizedRole === 'PHARMACY_STAFF' && (
                <>
                  <label className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Electronic Prescription Order Alerts</div>
                      <div className="text-[10px] text-slate-500">Alert counter when clinician signs a digital prescription</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.medicationReminders}
                      onChange={(e) => setNotifications({ ...notifications, medicationReminders: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Low Stock & Inventory Reorder Alerts</div>
                      <div className="text-[10px] text-slate-500">Notify when essential medicine stock levels drop below buffer</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.soundAlerts}
                      onChange={(e) => setNotifications({ ...notifications, soundAlerts: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </>
              )}
            </div>
          )}

          {/* TAB 2: APPEARANCE & THEME */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Interface Color Theme</div>
                  <div className="text-[10px] text-slate-500">
                    Switch between Light Mode (standard hospital daylight) and Dark Mode
                  </div>
                </div>
                <ThemeToggle />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date Format
                  </label>
                  <select
                    value={appearance.dateFormat}
                    onChange={(e) => setAppearance({ ...appearance, dateFormat: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (Indian Standard)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (US Standard)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Time Format
                  </label>
                  <select
                    value={appearance.timeFormat}
                    onChange={(e) => setAppearance({ ...appearance, timeFormat: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="12h">12-Hour (AM/PM)</option>
                    <option value="24h">24-Hour (Military / Hospital Time)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY & 2FA */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900 dark:text-white">
                    Google Authenticator 2FA Security
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  MediNexa supports RFC 6238 TOTP two-factor authentication to safeguard clinical records.
                </p>
                <div className="pt-2">
                  <a
                    href="/auth/setup-authenticator"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    <span>Configure / View 2FA Status</span>
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Account Session</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Active session is cryptographically signed with MediNexa JWT and tied to your hospital employee ID.
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

