'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Building2,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Save,
  AlertCircle,
} from 'lucide-react';
import { getHospitalProfile } from '@/lib/hospital-canonical-data';
import { ProfilePhotoUploader } from '@/components/profile/ProfilePhotoUploader';
import { useAuthenticatedUser, updateUserProfile } from '@/lib/auth-session';

export default function ManagerProfilePage() {
  const { user, refreshUser } = useAuthenticatedUser();

  const [phone, setPhone] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [hospitalName, setHospitalName] = useState('MediNexa General Hospital (Hospital A)');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const activeHosp = localStorage.getItem('medinexa_active_hospital_id') || 'HOSPITAL_A';
      const prof = getHospitalProfile(null, activeHosp);
      if (prof?.name) {
        setHospitalName(prof.name);
      }
    }
    if (user?.phone) {
      setPhone(user.phone);
    }
  }, [user]);

  const managerName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Rahul Verma';
  const staffId = user?.staffId || 'MG.RAHUL-9137';
  const roleTitle = user?.designation || 'Operations & Floor Manager';
  const email = user?.email || 'rahul.manager@medinexa.com';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await updateUserProfile({
      phone,
      preferredLanguage,
    });

    setSaving(false);
    if (res.ok) {
      setSuccessMsg('Manager profile updated successfully! ✓');
      setTimeout(() => setSuccessMsg(null), 3500);
      refreshUser();
    } else {
      setErrorMsg(res.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Manager Personnel Profile</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            My Operational Identity & Credentials
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational credentials, canonical staff login ID, active duty shift, and security authority.
          </p>
        </div>
      </div>

      {/* Identity Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        {/* Profile Photo Uploader */}
        <ProfilePhotoUploader
          currentPhotoUrl={user?.avatarUrl}
          initials={managerName.slice(0, 2).toUpperCase()}
          onSuccess={() => refreshUser()}
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {managerName}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                {staffId}
              </span>
              <span className="text-xs text-slate-500 font-semibold">• {roleTitle}</span>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Staff
              </span>
            </div>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px]">
              <Mail className="w-3 h-3" /> Official Email
            </div>
            <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{email}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px]">
              <Building2 className="w-3 h-3" /> Hospital Association
            </div>
            <div className="font-bold text-slate-800 dark:text-slate-200">{hospitalName}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px]">
              <Clock className="w-3 h-3" /> Designated Shift
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              Morning Operations (08:00 - 16:00)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px]">
              <Shield className="w-3 h-3" /> Security Access Level
            </div>
            <div className="font-semibold text-teal-600 dark:text-teal-400">
              Tier 2 • Floor Commander (Workstation Delegation & Triage)
            </div>
          </div>
        </div>

        {/* Messages */}
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

        {/* Editable Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Direct Contact Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Operational Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
