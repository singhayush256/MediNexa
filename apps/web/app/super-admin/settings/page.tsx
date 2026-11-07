'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  ShieldCheck,
  Bell,
  Moon,
  Sun,
  Lock,
  CheckCircle2,
  AlertCircle,
  Save,
  Sliders,
  Building2,
  KeyRound,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { getUserSettings, updateUserSettings, useAuthenticatedUser } from '@/lib/auth-session';

export default function SuperAdminSettingsPage() {
  const { user } = useAuthenticatedUser();

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Platform Notification Preferences
  const [notifications, setNotifications] = useState({
    hospitalRegistrationAlerts: true,
    securityEventAlerts: true,
    systemOutageAlerts: true,
    auditLogSummaryEmail: true,
  });

  // Appearance & Localization
  const [appearance, setAppearance] = useState({
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    timezone: 'Asia/Kolkata',
  });

  useEffect(() => {
    getUserSettings().then((res) => {
      if (res.ok && res.settings) {
        if (res.settings.appearance) {
          setAppearance((prev) => ({ ...prev, ...res.settings.appearance }));
        }
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await updateUserSettings({
      notifications: {
        emailEnabled: notifications.auditLogSummaryEmail,
        appointmentReminders: notifications.hospitalRegistrationAlerts,
        labReportAlerts: notifications.securityEventAlerts,
      },
      appearance,
    });

    setSaving(false);
    if (res.ok) {
      setSuccessMsg('Platform configuration & governance settings saved! ✓');
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setErrorMsg(res.message || 'Failed to save settings.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-900">
            SYSTEM GOVERNANCE
          </span>
          <span className="text-xs text-slate-400 font-medium">Platform Administration</span>
        </div>
        <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight mt-1">
          Super Administrator Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure platform appearance, multi-tenant registration alert policies, and security parameters.
        </p>
      </div>

      {/* Feedback Alerts */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Appearance & Display */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Display & Appearance Preferences
            </h2>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Interface Color Theme</div>
              <div className="text-[10px] text-slate-500">
                Light Mode is standard default. Switch to Dark Mode anytime.
              </div>
            </div>
            <ThemeToggle />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date Format
              </label>
              <select
                value={appearance.dateFormat}
                onChange={(e) => setAppearance({ ...appearance, dateFormat: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (Indian Standard)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (US Standard)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Operational Timezone
              </label>
              <select
                value={appearance.timezone}
                onChange={(e) => setAppearance({ ...appearance, timezone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST +04:00)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Platform Notifications */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Bell className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Governance & Security Alert Subscriptions
            </h2>
          </div>

          <label className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">New Hospital Registration Alerts</div>
              <div className="text-[10px] text-slate-500">
                Receive notification when new hospital tenants are initialized or onboarded
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.hospitalRegistrationAlerts}
              onChange={(e) =>
                setNotifications({ ...notifications, hospitalRegistrationAlerts: e.target.checked })
              }
              className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
            />
          </label>

          <label className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Platform Security & 2FA Violations</div>
              <div className="text-[10px] text-slate-500">
                Notify on repeated failed 2FA attempts, brute force locks, or privilege escalations
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.securityEventAlerts}
              onChange={(e) => setNotifications({ ...notifications, securityEventAlerts: e.target.checked })}
              className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
            />
          </label>

          <label className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">System Health & Telemetry Alerts</div>
              <div className="text-[10px] text-slate-500">
                Instant notification if database connectivity, redis broker or API gateway exhibits degraded latency
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.systemOutageAlerts}
              onChange={(e) => setNotifications({ ...notifications, systemOutageAlerts: e.target.checked })}
              className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
            />
          </label>
        </div>

        {/* Section 3: Two-Factor Security */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Platform Authentication Security
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 flex items-center justify-between">
            <div>
              <div className="font-bold text-purple-950 dark:text-purple-200">
                Google Authenticator (RFC 6238 TOTP 2FA)
              </div>
              <div className="text-[10px] text-slate-500">
                Multi-tenant super administrator accounts are enforced with 2FA protection.
              </div>
            </div>
            <a
              href="/auth/setup-authenticator"
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition"
            >
              Manage 2FA
            </a>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="sm" disabled={saving}>
            <Save className="w-3.5 h-3.5 mr-1.5" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

