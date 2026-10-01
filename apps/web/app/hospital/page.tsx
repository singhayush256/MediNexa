'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Lock,
  Mail,
  Key,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Users,
  Stethoscope,
  Briefcase,
  ShieldAlert,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';
import { getApiBaseUrl, fetchWithTimeout } from '@/lib/api-config';

export default function HospitalPortalGatewayPage() {
  const router = useRouter();

  // Credentials
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 2FA Challenge State
  const [requires2fa, setRequires2fa] = useState(false);
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Automatic Workspace Redirection Helper
  const redirectHospitalUser = (user: any) => {
    const roleCode = (user?.role?.code || user?.roleCode || '').toUpperCase();

    if (roleCode === 'DOCTOR') {
      router.push('/dashboard/doctor-appointments');
    } else if (roleCode === 'NURSE') {
      router.push('/dashboard/nursing');
    } else if (roleCode === 'RECEPTIONIST') {
      router.push('/dashboard/appointments');
    } else if (roleCode === 'PHARMACIST' || roleCode === 'PHARMACY_STAFF') {
      router.push('/dashboard/pharmacy');
    } else if (roleCode === 'LAB_STAFF' || roleCode === 'LAB_TECH' || roleCode === 'LAB_TECHNICIAN') {
      router.push('/dashboard/lab');
    } else if (roleCode === 'BILLING_STAFF') {
      router.push('/dashboard/billing');
    } else if (roleCode === 'INSURANCE_STAFF' || roleCode === 'INSURANCE_COORDINATOR') {
      router.push('/dashboard/insurance');
    } else if (roleCode === 'MANAGER' || roleCode === 'HR_MANAGER') {
      router.push('/dashboard/manager');
    } else if (roleCode === 'WARD_MANAGER') {
      router.push('/dashboard/hospital/beds');
    } else if (roleCode === 'AMBULANCE_DRIVER') {
      router.push('/dashboard/emergency-ambulance');
    } else if (roleCode === 'RADIOLOGIST') {
      router.push('/dashboard/radiology');
    } else if (roleCode === 'EMERGENCY_STAFF') {
      router.push('/dashboard/emergency');
    } else {
      router.push('/dashboard');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('Please enter your Staff ID, Employee ID, or hospital email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetchWithTimeout(
        `${baseUrl}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanId,
            password,
            rememberMe,
          }),
        },
        15000,
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid credentials or inactive account.');
      }

      if (data.requires2fa) {
        setRequires2fa(true);
        setChallengeToken(data.challengeToken);
        setSuccess('Two-Factor Authentication required. Enter the 6-digit code from Google Authenticator.');
        return;
      }

      // Successful Direct Authentication
      const token = data.accessToken || data.token;
      if (typeof window !== 'undefined' && token) {
        localStorage.setItem('medinexa_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('medinexa_user', JSON.stringify(data.user));
        document.cookie = `medinexa_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      }

      setSuccess('Authenticated successfully! Directing to your workspace...');
      setTimeout(() => {
        redirectHospitalUser(data.user);
      }, 400);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials or contact hospital administration.');
    } finally {
      setLoading(false);
    }
  };

  const handle2faSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = codeDigits.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetchWithTimeout(
        `${baseUrl}/auth/login/verify-totp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challengeToken,
            code,
          }),
        },
        15000,
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid 2FA code.');
      }

      const token = data.accessToken || data.token;
      if (typeof window !== 'undefined' && token) {
        localStorage.setItem('medinexa_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('medinexa_user', JSON.stringify(data.user));
        document.cookie = `medinexa_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      }

      setSuccess('Verified successfully! Directing to your workspace...');
      setTimeout(() => {
        redirectHospitalUser(data.user);
      }, 400);
    } catch (err: any) {
      setError(err.message || 'Failed to verify 2FA code.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const updated = [...codeDigits];
    updated[index] = clean;
    setCodeDigits(updated);

    if (clean && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <MediNexaLogo size="sm" subtitle="Hospital Portal" href="/" />

          <div className="flex items-center gap-3">
            <Link
              href="/patient"
              className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition hidden sm:inline-block"
            >
              Switch to Patient Portal →
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Hospital Overview & Role Identity */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>HOSPITAL PORTAL — UNIFIED WORKSPACE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Unified Hospital Portal for <br />
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Clinical & Operational Staff
              </span>
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Log in with your official <strong>MediNexa Staff ID</strong> or hospital email. The backend automatically identifies your hospital, department, role, and permissions, routing you to your authorized workspace.
            </p>

            {/* Informational Scope Statement */}
            <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                One secure portal for your entire hospital team.
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                The backend automatically determines your hospital, department, role, and permissions upon authentication.
              </p>
              <div className="pt-1 text-xs font-semibold text-purple-700 dark:text-purple-400 tracking-wide">
                Admin • Manager • Clinical • Operations
              </div>
            </div>

            <div className="p-4 bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong>Hospital Staff Onboarding:</strong> Staff accounts and credentials are created and managed by your Hospital Administrator via Staff Management. Public self-registration for clinical roles is prohibited.
              </div>
            </div>
          </div>

          {/* Right Column: Secure Staff Authentication Card */}
          <div className="lg:col-span-6 max-w-md mx-auto w-full">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 mx-auto mb-3 shadow-xs">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-black tracking-widest text-purple-600 dark:text-purple-400 uppercase">
                  HOSPITAL PORTAL
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {requires2fa ? 'Two-Factor Authentication' : 'Unified Hospital Workspace'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {requires2fa
                    ? 'Enter the 6-digit code from Google Authenticator'
                    : 'Sign in with your MediNexa Staff ID or registered hospital email.'}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{success}</span>
                </div>
              )}

              {!requires2fa ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Staff ID or Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Staff ID or Hospital Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. MNX-H8F42K-MG-Q81X or doctor@hospital.com"
                        className="block w-full px-3.5 py-2.5 pl-9 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-slate-900 transition font-medium"
                      />
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="mt-1 relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="block w-full px-3.5 py-2.5 pl-9 pr-10 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-slate-900 transition font-medium"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded-md border-slate-300 focus:ring-purple-500"
                      />
                      <span>Keep me signed in on this hospital terminal</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Signing In...</span>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
                    Your role and permissions are securely detected automatically.
                  </p>
                </form>
              ) : (
                <form onSubmit={handle2faSubmit} className="space-y-4">
                  <div className="flex justify-center items-center gap-2 py-2">
                    {codeDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          codeInputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeDigitChange(index, e.target.value)}
                        className="w-11 h-13 text-center text-xl font-black rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify Code & Enter Workspace'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequires2fa(false)}
                    className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    ← Back to credential login
                  </button>
                </form>
              )}

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link href="/patient" className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition">
                  Are you a patient? <span className="text-purple-600 dark:text-purple-400 font-bold hover:underline">Go to Patient Portal →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
