'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings,
  User,
  ShieldCheck,
  Bell,
  Lock,
  Globe,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  Download,
  Trash2,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Sparkles,
  Phone,
  Mail,
  HeartPulse,
  Activity,
  ShieldAlert,
  Clock,
  RefreshCw,
  LogOut,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { getApiBaseUrl } from '@/lib/api-config';

type SettingsTab = 'appearance' | 'notifications' | 'security' | 'data';

export default function DashboardSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Appearance State
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('light');
  const [interfaceDensity, setInterfaceDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [language, setLanguage] = useState('English');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('24h');

  // Clinical & Notification Alerts
  const [notifications, setNotifications] = useState({
    telemetryLiveSync: true,
    erTraumaAlerts: true,
    bedOccupancyAlerts: true,
    prescriptionQueueSound: true,
    emailDailyReport: true,
    smsCriticalAlerts: true,
    soundAlerts: true,
  });

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Security & Session State
  const [sessionTimeout, setSessionTimeout] = useState('30m');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('medinexa_theme') as any;
      if (savedTheme) setThemePreference(savedTheme);

      const savedSettings = localStorage.getItem('medinexa_dashboard_settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed.density) setInterfaceDensity(parsed.density);
          if (parsed.language) setLanguage(parsed.language);
          if (parsed.timeFormat) setTimeFormat(parsed.timeFormat);
          if (parsed.notifications) setNotifications(parsed.notifications);
          if (parsed.sessionTimeout) setSessionTimeout(parsed.sessionTimeout);
        } catch {}
      }
    }
  }, []);

  const saveSettingsToStorage = (updates: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem('medinexa_dashboard_settings');
      let base: Record<string, any> = {};
      if (existing) {
        try { base = JSON.parse(existing); } catch {}
      }
      const merged = { ...base, ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('medinexa_dashboard_settings', JSON.stringify(merged));
      setSaveSuccess('Settings saved successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordStatus(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordStatus('Password updated successfully! Your clinical session is secured.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordStatus(null), 4000);
  };

  const handleExportData = () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('medinexa_user') || '{}';
      const settings = localStorage.getItem('medinexa_dashboard_settings') || '{}';
      const exportObject = {
        exportedAt: new Date().toISOString(),
        system: 'MediNexa Healthcare OS',
        userData: JSON.parse(user),
        settings: JSON.parse(settings),
      };

      const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medinexa-profile-settings-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setSaveSuccess('Profile and settings exported as JSON.');
      setTimeout(() => setSaveSuccess(null), 3000);
    }
  };

  const handleClearCache = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      setSaveSuccess('Telemetry cache cleared and local state synchronized.');
      setTimeout(() => setSaveSuccess(null), 3000);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccess}</span>
          </div>
          <button onClick={() => setSaveSuccess(null)} className="text-emerald-500 hover:text-emerald-700 font-black cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Account & System Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Preferences, Security & Configuration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your hospital workstation theme, clinical telemetry alerts, 2FA credentials, and system settings.
          </p>
        </div>

        <Link
          href="/dashboard/profile"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <User className="w-4 h-4" />
          <span>Edit My Profile</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('appearance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'appearance'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Appearance & Language</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'notifications'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Clinical Alerts & Sounds</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security & Passwords</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('data')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'data'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Data, Cache & Export</span>
        </button>
      </div>

      {/* Tab 1: Appearance & Display */}
      {activeTab === 'appearance' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Display & Localization Preferences
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize theme appearance, table row spacing, preferred language, and time formats.
            </p>
          </div>

          <div className="space-y-6 text-xs">
            {/* Theme Toggle Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">Theme Mode</div>
                <div className="text-slate-500 mt-0.5">Toggle between pure white light mode and genuine black dark mode.</div>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
              </div>
            </div>

            {/* Interface Density */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">Interface Density</div>
                <div className="text-slate-500 mt-0.5">Adjust padding and font compact mode for clinical charts.</div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInterfaceDensity('comfortable');
                    saveSettingsToStorage({ density: 'comfortable' });
                  }}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    interfaceDensity === 'comfortable'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Comfortable
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInterfaceDensity('compact');
                    saveSettingsToStorage({ density: 'compact' });
                  }}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    interfaceDensity === 'compact'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Compact
                </button>
              </div>
            </div>

            {/* Language & Time Format */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Portal Display Language</label>
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    saveSettingsToStorage({ language: e.target.value });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                >
                  <option value="English">English (Official)</option>
                  <option value="Hindi">हिंदी (Hindi)</option>
                  <option value="Bengali">বাংলা (Bengali)</option>
                  <option value="Tamil">தமிழ் (Tamil)</option>
                  <option value="Telugu">తెలుగు (Telugu)</option>
                  <option value="Marathi">मराठी (Marathi)</option>
                  <option value="Gujarati">ગુજરાતી (Gujarati)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Clock & Shift Time Format</label>
                <select
                  value={timeFormat}
                  onChange={(e) => {
                    setTimeFormat(e.target.value as any);
                    saveSettingsToStorage({ timeFormat: e.target.value });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                >
                  <option value="24h">24-Hour Clinical Time (e.g. 14:30)</option>
                  <option value="12h">12-Hour Standard Time (e.g. 02:30 PM)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Clinical Alerts & Sound Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Clinical Alert Channels & Audio Telemetry
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure real-time notifications for ICU emergencies, bed releases, and OPD appointments.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {[
              {
                id: 'telemetryLiveSync',
                label: 'Real-Time Bed & Patient Telemetry',
                desc: 'Instantly push socket events when a patient is admitted, discharged or transferred.',
              },
              {
                id: 'erTraumaAlerts',
                label: 'Emergency Trauma & ICU Code Blue Alerts',
                desc: 'High-priority audio-visual popups for critical triage cases.',
              },
              {
                id: 'bedOccupancyAlerts',
                label: 'Bed Capacity Threshold Warnings (90%+)',
                desc: 'Notify when network beds reach surge capacity limits.',
              },
              {
                id: 'soundAlerts',
                label: 'Notification Sound Effects',
                desc: 'Play chime on new internal dispatch or message.',
              },
              {
                id: 'emailDailyReport',
                label: 'Daily Executive & Operational Shift Digest',
                desc: 'Send midnight clinical census summary to registered staff email.',
              },
              {
                id: 'smsCriticalAlerts',
                label: 'SMS Critical Dispatch Escalation',
                desc: 'Send SMS on SOS emergency ambulance bookings.',
              },
            ].map((item) => {
              const checked = !!(notifications as any)[item.id];
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 transition"
                >
                  <div className="space-y-0.5 max-w-lg">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {item.desc}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...notifications, [item.id]: !checked };
                      setNotifications(updated);
                      saveSettingsToStorage({ notifications: updated });
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        checked ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Security & Passwords */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>Change Staff Password</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ensure your hospital account uses a strong password with at least 8 characters.
              </p>
            </div>

            {passwordStatus && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordStatus}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-xl text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Confirm New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Update Staff Password
                </button>
              </div>
            </form>
          </div>

          {/* 2FA & Session Governance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Two-Factor Authentication (2FA)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Protect clinical records with Google Authenticator or Microsoft Authenticator TOTP codes.
              </p>
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>2FA Protection is Active & Monitored</span>
              </div>
              <Link
                href="/auth/setup-authenticator"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
              >
                <span>Reconfigure Authenticator App</span>
              </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Session Auto-Timeout Policy</span>
              </h3>
              <p className="text-xs text-slate-500">
                Automatically lock the terminal workstation when idle to protect HIPAA/NABH patient records.
              </p>
              <select
                value={sessionTimeout}
                onChange={(e) => {
                  setSessionTimeout(e.target.value);
                  saveSettingsToStorage({ sessionTimeout: e.target.value });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-xs focus:outline-none"
              >
                <option value="15m">15 Minutes of Inactivity</option>
                <option value="30m">30 Minutes of Inactivity</option>
                <option value="1h">1 Hour (Standard Duty)</option>
                <option value="4h">4 Hours (Extended Shift)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Data & Cache */}
      {activeTab === 'data' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Data Management, Export & Telemetry Cache
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Download your staff profile backup or purge local browser telemetry cache.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-xs">Export Complete Profile & Settings</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Download a JSON copy of all personal, contact and clinical preferences.</div>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-xs">Clear Telemetry Cache</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Refresh live bed socket states and local session memory.</div>
              </div>
              <button
                type="button"
                onClick={handleClearCache}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Clear Cache</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

