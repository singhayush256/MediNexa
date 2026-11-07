'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Briefcase,
  Award,
  Clock,
  MapPin,
  Lock,
} from 'lucide-react';
import { ProfilePhotoUploader } from '@/components/profile/ProfilePhotoUploader';
import { updateUserProfile, useAuthenticatedUser } from '@/lib/auth-session';

interface WorkstationProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRoleTitle?: string;
  defaultDepartment?: string;
}

export function WorkstationProfileModal({
  isOpen,
  onClose,
  defaultRoleTitle = 'Clinical Specialist',
  defaultDepartment = 'Hospital Operations',
}: WorkstationProfileModalProps) {
  const { user, refreshUser } = useAuthenticatedUser();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setPreferredLanguage(user.preferredLanguage || 'English');
    }
  }, [user]);

  if (!isOpen) return null;

  const roleCode = (user?.roleCode || user?.role?.code || 'STAFF').toUpperCase();
  const staffId = user?.staffId || user?.employeeCode || `EMP-${(user?.id || '0263').slice(0, 6).toUpperCase()}`;
  const hospitalName = user?.facility?.name || 'MediNexa General Hospital (Hospital A)';
  const department = user?.department || defaultDepartment;
  const designation = user?.designation || defaultRoleTitle;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await updateUserProfile({
      firstName,
      lastName,
      phone,
      preferredLanguage,
    });

    setSaving(false);
    if (res.ok) {
      setSuccessMsg('Profile details successfully updated and saved to hospital database! ✓');
      setTimeout(() => setSuccessMsg(null), 3500);
      refreshUser();
    } else {
      setErrorMsg(res.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 sm:p-7 space-y-6 shadow-2xl animate-in fade-in duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                My Staff Profile & Credentials
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Authorized workstation identity and employee contact information
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

        {/* Profile Photograph Uploader */}
        <ProfilePhotoUploader
          currentPhotoUrl={user?.avatarUrl}
          initials={user?.firstName ? `${user.firstName[0]}${user?.lastName?.[0] || ''}` : 'ST'}
          onSuccess={() => refreshUser()}
        />

        {/* Protected Official Hospital Credentials (Read-only security badge) */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>{hospitalName}</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {staffId}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Designation / Role</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{designation}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Department</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{department}</span>
            </div>
            {user?.specialty && (
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Medical Specialty</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{user.specialty}</span>
              </div>
            )}
            {user?.licenseNumber && (
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Registration License</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{user.licenseNumber}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Hospital authority and employee role are managed by Hospital Administration.</span>
          </div>
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

        {/* Editable Personal Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
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
                Verified Official Email
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-mono text-[11px]">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate">{user?.email || 'staff@medinexa.health'}</span>
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact Mobile Number
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

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Preferred Workstation Language
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Bengali">Bengali (বাংলা)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Close
            </button>
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

