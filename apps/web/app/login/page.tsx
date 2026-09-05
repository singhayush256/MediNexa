'use client';

import React, { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Key,
  CheckCircle2,
} from 'lucide-react';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';
import { getApiBaseUrl, fetchWithTimeout } from '@/lib/api-config';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Credentials State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 2FA Challenge State
  const [requires2fa, setRequires2fa] = useState(false);
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCodeInput, setBackupCodeInput] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Complete Login & Route Helper
  const handleAuthSuccess = (data: any) => {
    const token = data.accessToken || data.token;
    if (typeof window !== 'undefined' && token) {
      localStorage.setItem('medinexa_token', token);
      localStorage.setItem('token', token);
      localStorage.setItem('medinexa_user', JSON.stringify(data.user));
      sessionStorage.setItem('medinexa_token', token);

      const cookieMaxAge = rememberMe ? 2592000 : 86400; // 30 days or 24 hours
      document.cookie = `medinexa_token=${token}; path=/; max-age=${cookieMaxAge}; SameSite=Lax`;
    }

    const roleCode = (data.user?.role?.code || data.user?.roleCode || '').toUpperCase();
    const explicitRedirect = searchParams.get('redirect');

    if (explicitRedirect) {
      router.push(explicitRedirect);
    } else if (roleCode === 'PATIENT') {
      router.push('/portal');
    } else if (roleCode === 'DOCTOR') {
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
    } else {
      router.push('/dashboard');
    }
  };

  // Step 1: Submit Email & Password
  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Invalid email format');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = getApiBaseUrl();
      const response = await fetchWithTimeout(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail, password, rememberMe }),
      }, 7000);

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Authentication failed. Please check your credentials.';
        throw new Error(errorMsg);
      }

      // Check if 2FA is required for this account
      if (data.requires2fa) {
        setChallengeToken(data.challengeToken);
        setRequires2fa(true);
        setSuccess('Credentials verified. Please enter your 6-digit code from Google Authenticator.');
        return;
      }

      // Direct login if 2FA is not enabled
      handleAuthSuccess(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle 6-digit TOTP input
  const handleCodeDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...codeDigits];
    newDigits[index] = cleaned;
    setCodeDigits(newDigits);

    if (cleaned && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = [...codeDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setCodeDigits(newDigits);
    const focusIdx = Math.min(pasted.length, 5);
    codeInputRefs.current[focusIdx]?.focus();
  };

  // Step 2: Verify TOTP or Backup Recovery Code
  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const submissionCode = useBackupCode ? backupCodeInput.trim() : codeDigits.join('');

    if (!submissionCode) {
      setError(useBackupCode ? 'Please enter a backup recovery code.' : 'Please enter all 6 digits.');
      return;
    }

    if (!challengeToken) {
      setError('2FA verification session expired. Please sign in again.');
      setRequires2fa(false);
      return;
    }

    setLoading(true);

    try {
      const apiUrl = getApiBaseUrl();
      const response = await fetchWithTimeout(`${apiUrl}/auth/verify-totp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeToken,
          code: submissionCode,
          isBackupCode: useBackupCode,
          rememberMe,
        }),
      }, 7000);

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Invalid authenticator code. Please try again.';
        throw new Error(errorMsg);
      }

      handleAuthSuccess(data);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors duration-200 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center">
        <MediNexaLogo size="lg" href="/" />
        <h2 className="mt-4 text-center text-2xl font-black text-slate-950 dark:text-white tracking-tight">
          {requires2fa ? 'Two-Factor Authentication' : 'Sign In to Healthcare OS'}
        </h2>
        <p className="mt-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          {requires2fa
            ? 'Enter 6-digit code from Google Authenticator, Microsoft Authenticator, or Authy'
            : 'Connected Tertiary Hospital Operations • Authenticator 2FA Security'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl shadow-slate-950/5 border border-slate-200 dark:border-slate-800 sm:rounded-3xl sm:px-10 space-y-6">
          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs p-4 rounded-2xl font-semibold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs p-4 rounded-2xl font-semibold flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* =========================================================================
              VIEW 1: REGULAR EMAIL & PASSWORD FORM
          ========================================================================= */}
          {!requires2fa ? (
            <form onSubmit={handleSubmitCredentials} className="space-y-4" autoComplete="off">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="block w-full px-3.5 py-2.5 pl-9 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
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
                    autoComplete="current-password"
                    className="block w-full px-3.5 py-2.5 pl-9 pr-10 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition font-medium"
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

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Keep me signed in
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Continue to Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                    Create Account
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            /* =========================================================================
                VIEW 2: AUTHENTICATOR CODE VERIFICATION SCREEN
            ========================================================================= */
            <form onSubmit={handleVerifyTotp} className="space-y-6">
              <div className="text-center space-y-1">
                <div className="inline-flex p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mb-1">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Account: <span className="text-blue-600 dark:text-blue-400 font-mono">{email}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {useBackupCode
                    ? 'Enter an unused 8-character single-use recovery code'
                    : 'Open your Authenticator app and enter the 6-digit code for MediNexa'}
                </p>
              </div>

              {!useBackupCode ? (
                /* 6-Digit Code Inputs */
                <div className="flex justify-center items-center gap-2 sm:gap-2.5 py-1" onPaste={handleCodePaste}>
                  {codeDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        codeInputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      className="w-10 h-12 sm:w-11 sm:h-13 text-center text-xl font-black rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/20 text-slate-900 dark:text-white transition shadow-sm outline-none"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              ) : (
                /* Backup Recovery Code Input */
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Backup Recovery Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={backupCodeInput}
                      onChange={(e) => setBackupCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. A7K2-9XP4"
                      className="block w-full px-3.5 py-2.5 pl-9 font-mono text-center text-sm font-bold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium tracking-wider"
                      autoFocus
                    />
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              )}

              {/* Toggle between TOTP Code & Backup Code */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setUseBackupCode(!useBackupCode);
                    setError(null);
                  }}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {useBackupCode
                    ? '← Use 6-digit Authenticator Code'
                    : 'Lost phone? Use a backup recovery code'}
                </button>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRequires2fa(false);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <span>Verifying Code...</span>
                  ) : (
                    <>
                      <span>Verify & Access System</span>
                      <CheckCircle2 className="w-4 h-4" />
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex items-center justify-center">
          <div className="text-xs font-bold text-slate-400">Loading MediNexa Authentication...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
