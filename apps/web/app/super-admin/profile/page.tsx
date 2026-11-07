'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Key,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Activity,
  Save,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { ProfilePhotoUploader } from '@/components/profile/ProfilePhotoUploader';
import { useAuthenticatedUser, updateUserProfile } from '@/lib/auth-session';

export default function SuperAdminProfilePage() {
  const { user, refreshUser } = useAuthenticatedUser();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await updateUserProfile({
      firstName,
      lastName,
      phone,
    });

    setSaving(false);
    if (res.ok) {
      setSuccessMsg('Super Administrator credentials updated successfully! ✓');
      setTimeout(() => setSuccessMsg(null), 3500);
      refreshUser();
    } else {
      setErrorMsg(res.message || 'Failed to update credentials.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-900">
            SYSTEM ACCOUNT
          </span>
          <span className="text-xs text-slate-400 font-medium">Platform Administration Identity</span>
        </div>
        <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight mt-1">
          Super Administrator Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Platform-level administrative credentials and security governance parameters.
        </p>
      </div>

      {/* Account Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Profile Photo Uploader */}
        <ProfilePhotoUploader
          currentPhotoUrl={user?.avatarUrl}
          initials={user?.firstName ? `${user.firstName[0]}${user?.lastName?.[0] || ''}` : 'SA'}
          onSuccess={() => refreshUser()}
        />

        {/* Governance Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Role Code</span>
            <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
              {user?.role?.code || user?.roleCode || 'SUPER_ADMIN'}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Governance Level</span>
            <span className="font-semibold text-slate-900 dark:text-white">Platform System Master</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Facility Scope</span>
            <span className="font-semibold text-slate-900 dark:text-white">Global (Cross-Enterprise Master)</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Status</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active & Verified
            </span>
          </div>
        </div>

        {/* Feedback Messages */}
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

        {/* Editable Personal Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Verified Platform Email
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-mono text-[11px]">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate">{user?.email || 'admin@medinexa.health'}</span>
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Direct Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="sm" disabled={saving}>
              <Save className="w-3.5 h-3.5 mr-1.5" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </Button>
          </div>
        </form>

        {/* Platform Responsibilities Summary */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Designated Operational Capabilities
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-900/40">
              <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Add Hospital: </span>
                <span className="text-slate-600 dark:text-slate-400">
                  Register new hospital tenant instances and initialize designated Hospital Administrator accounts.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-900/40">
              <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">View Existing Hospitals: </span>
                <span className="text-slate-600 dark:text-slate-400">
                  Inspect tenant directories, capacity statistics, and operational telemetry in strict read-only mode.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <Lock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Hospital Data Invariant: </span>
                <span className="text-slate-600 dark:text-slate-400">
                  Clinical records, bed assignments, admissions, and financial operations are strictly isolated to hospital staff.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
