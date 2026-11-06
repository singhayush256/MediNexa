'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Building2,
  UserCheck,
  ArrowRight,
  Briefcase,
  Hospital,
  Sparkles,
  Phone,
  Mail,
  KeyRound,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';
import { getApiBaseUrl, fetchWithTimeout } from '@/lib/api-config';

interface VerifiedInvitation {
  valid: boolean;
  email: string;
  firstName: string;
  lastName: string;
  roleCode: string;
  department?: string;
  facilityId: string;
  facilityName: string;
  facilityCode: string;
  facilityCity?: string;
  invitationCode: string;
  token?: string;
  expiresAt?: string;
}

function InvitationAcceptanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const codeParam = searchParams.get('code') || '';
  const tokenParam = searchParams.get('token') || '';

  const [inputCode, setInputCode] = useState(codeParam);
  const [token, setToken] = useState(tokenParam);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [invitation, setInvitation] = useState<VerifiedInvitation | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auto-verify if code or token is in URL
  useEffect(() => {
    if (codeParam || tokenParam) {
      handleVerify(codeParam, tokenParam);
    }
  }, [codeParam, tokenParam]);

  const handleVerify = async (codeToVerify?: string, tokenToVerify?: string) => {
    const code = (codeToVerify !== undefined ? codeToVerify : inputCode).trim();
    const tok = (tokenToVerify !== undefined ? tokenToVerify : token).trim();

    if (!code && !tok) {
      setError('Please enter your Employee Invitation Code (e.g., MNX-EMP-DOCTOR-8K72Q9).');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const apiUrl = getApiBaseUrl();
      const query = new URLSearchParams();
      if (code) query.set('code', code);
      if (tok) query.set('token', tok);

      const res = await fetchWithTimeout(`${apiUrl}/auth/invitations/verify?${query.toString()}`, {}, 12000);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invitation is invalid, expired, or has already been used.');
      }

      setInvitation(data);
      if (data.invitationCode) setInputCode(data.invitationCode);
      if (data.token) setToken(data.token);
      setSuccess(`Verified invitation for ${data.firstName} ${data.lastName} at ${data.facilityName}!`);
    } catch (err: any) {
      setError(err.message || 'Failed to verify invitation. Please check your invitation code.');
      setInvitation(null);
    } finally {
      setLoading(false);
    }
  };

  const redirectRoleWorkstation = (user: any) => {
    const roleCode = (user?.role?.code || user?.roleCode || invitation?.roleCode || '').toUpperCase();
    if (roleCode === 'DOCTOR') {
      router.push('/dashboard/doctor-appointments');
    } else if (roleCode === 'NURSE') {
      router.push('/dashboard/nursing');
    } else if (roleCode === 'RECEPTIONIST') {
      router.push('/dashboard/reception');
    } else if (roleCode === 'PHARMACIST') {
      router.push('/dashboard/pharmacy');
    } else if (roleCode === 'LAB_STAFF') {
      router.push('/dashboard/lab');
    } else if (roleCode === 'MANAGER' || roleCode === 'HR_MANAGER') {
      router.push('/dashboard/manager');
    } else if (roleCode === 'HOSPITAL_ADMIN' || roleCode === 'ADMIN') {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const handleAcceptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!password) {
      setError('Please choose a secure password.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-~`+=])[A-Za-z\d!@#$%^&*(),.?":{}|<>_\-~`+=]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const apiUrl = getApiBaseUrl();
      const res = await fetchWithTimeout(
        `${apiUrl}/auth/invitations/accept`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: invitation?.invitationCode || inputCode.trim(),
            token: invitation?.token || token.trim(),
            password,
            confirmPassword,
            phone: phone.trim() || undefined,
          }),
        },
        15000,
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to activate account.');
      }

      const authToken = data.accessToken || data.token;
      if (typeof window !== 'undefined' && authToken) {
        localStorage.setItem('medinexa_token', authToken);
        localStorage.setItem('token', authToken);
        localStorage.setItem('medinexa_user', JSON.stringify(data.user));
        document.cookie = `medinexa_token=${authToken}; path=/; max-age=86400; SameSite=Lax`;
      }

      setSuccess('Account activated successfully! Opening your hospital workspace...');
      setTimeout(() => {
        redirectRoleWorkstation(data.user);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Header Bar */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="flex items-center justify-between w-full px-4 mb-4">
          <MediNexaLogo size="sm" subtitle="Staff Onboarding" href="/" />
          <ThemeToggle />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
          <KeyRound className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>OFFICIAL EMPLOYEE ONBOARDING</span>
        </div>

        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          Accept Hospital Invitation
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm">
          Activate your hospital employee account using the single-use invitation code provided by your administrator.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl shadow-slate-950/5 border border-slate-200 dark:border-slate-800 sm:rounded-3xl sm:px-10 space-y-6">
          {/* Status Alerts */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs p-4 rounded-2xl font-semibold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs p-4 rounded-2xl font-semibold flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          {/* STEP 1: Code Verification */}
          {!invitation ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Invitation Code <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    required
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="e.g. MNX-EMP-DOCTOR-7X92AB"
                    className="block w-full px-3.5 py-2.5 pl-9 text-xs uppercase tracking-wider font-mono bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Check your welcome email or ask your hospital administrator/manager for your invitation code.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? <span>Verifying Invitation...</span> : <span>Verify & Continue →</span>}
              </button>

              <div className="pt-2 text-center">
                <Link href="/hospital" className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                  Already activated your account? <strong>Sign In to Hospital Portal</strong>
                </Link>
              </div>
            </form>
          ) : (
            /* STEP 2: Invitation Verified — Activate Account Form */
            <form onSubmit={handleAcceptSubmit} className="space-y-5">
              {/* Verified Details Card */}
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Verified Official Invitation
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-blue-200 dark:border-blue-800">
                    {invitation.invitationCode}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Invited Staff Member</span>
                    <div className="font-extrabold text-slate-900 dark:text-white">
                      {invitation.firstName} {invitation.lastName}
                    </div>
                    <div className="text-[11px] text-slate-500">{invitation.email}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Hospital</span>
                    <div className="font-extrabold text-slate-900 dark:text-white">
                      {invitation.facilityName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Code: {invitation.facilityCode}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Role / Position</span>
                    <div className="font-black text-blue-600 dark:text-blue-400">
                      {invitation.roleCode.replace(/_/g, ' ')}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Department</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {invitation.department || 'Operations'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Setup */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Create Permanent Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters (A-Z, a-z, 0-9, symbol)"
                      className="block w-full px-3.5 py-2.5 pl-9 pr-10 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Confirm Permanent Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="block w-full px-3.5 py-2.5 pl-9 pr-10 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Contact Mobile Number (Optional)
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="block w-full px-3.5 py-2.5 pl-9 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInvitation(null)}
                  className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <span>Activating Account...</span>
                  ) : (
                    <>
                      <span>Activate & Open Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#020617]">
          <div className="text-center text-xs text-slate-500 font-bold">
            Loading invitation verification workspace...
          </div>
        </div>
      }
    >
      <InvitationAcceptanceContent />
    </Suspense>
  );
}

