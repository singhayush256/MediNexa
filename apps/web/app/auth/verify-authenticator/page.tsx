'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Smartphone,
  Key,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Lock,
  ChevronLeft,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';

function VerifyAuthenticatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [challengeToken, setChallengeToken] = useState<string>('');
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isBackupCodeMode, setIsBackupCodeMode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockoutMinutes, setLockoutMinutes] = useState<number | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    // Get challenge token from URL or session storage
    const tokenFromUrl = searchParams.get('challengeToken') || searchParams.get('token');
    const tokenFromSession = typeof window !== 'undefined' ? sessionStorage.getItem('totp_challenge_token') : null;
    const token = tokenFromUrl || tokenFromSession || '';

    if (!token) {
      setError('No active 2FA verification challenge found. Please log in again.');
    } else {
      setChallengeToken(token);
    }
  }, [searchParams]);

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...digits];
      pastedDigits.forEach((d, i) => {
        if (index + i < 6) newDigits[index + i] = d;
      });
      setDigits(newDigits);
      const nextFocus = Math.min(index + pastedDigits.length, 5);
      document.getElementById(`verify-code-input-${nextFocus}`)?.focus();
      return;
    }

    const clean = value.replace(/\D/g, '');
    const newDigits = [...digits];
    newDigits[index] = clean;
    setDigits(newDigits);

    if (clean && index < 5) {
      document.getElementById(`verify-code-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      document.getElementById(`verify-code-input-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeToken) {
      setError('Session expired. Please return to login.');
      return;
    }

    const code = digits.join('');
    if (!isBackupCodeMode && code.length !== 6) {
      setError('Please enter the full 6-digit code from your authenticator app.');
      return;
    }

    if (isBackupCodeMode && !backupCode.trim()) {
      setError('Please enter an 8-character backup recovery code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: { challengeToken: string; code?: string; backupCode?: string } = {
        challengeToken,
      };

      if (isBackupCodeMode) {
        payload.backupCode = backupCode.trim().toUpperCase();
      } else {
        payload.code = code;
      }

      const res = await fetch(`${apiUrl}/auth/verify-totp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.message && data.message.includes('locked')) {
          setLockoutMinutes(15);
        }
        throw new Error(data.message || 'Invalid verification code. Please try again.');
      }

      // Store tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('medinexa_token', data.accessToken);
        localStorage.setItem('token', data.accessToken);
        if (data.user) {
          localStorage.setItem('medinexa_user', JSON.stringify(data.user));
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        sessionStorage.removeItem('totp_challenge_token');
      }

      // Route based on user role
      const role = data.user?.role?.toUpperCase();
      if (role === 'SUPER_ADMIN') {
        router.push('/dashboard/super-admin');
      } else if (role === 'HOSPITAL_ADMIN') {
        router.push('/dashboard/hospital-admin');
      } else if (role === 'DOCTOR') {
        router.push('/dashboard/doctor');
      } else if (role === 'PATIENT') {
        router.push('/dashboard/patient');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </div>
        <h2 className="text-center text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Two-Factor Authentication
        </h2>
        <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
          Enter the verification code from Google Authenticator to verify your identity
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Feedback / Lockout Alert */}
            {lockoutMinutes ? (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs rounded-2xl flex items-start gap-2.5 font-medium">
                <Clock className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Account Temporarily Locked</span>
                  Too many failed authenticator attempts. For your security, this account is locked for 15 minutes. Please try again later or contact your system administrator.
                </div>
              </div>
            ) : error ? (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs rounded-2xl flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <form onSubmit={handleVerify} className="space-y-6">
              {!isBackupCodeMode ? (
                /* 6-Digit TOTP Mode */
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 rounded-full text-[11px] font-bold">
                      <Smartphone className="w-3.5 h-3.5" /> Google Authenticator / Authy
                    </div>
                    <p className="text-xs text-slate-500 pt-1">
                      Open your authenticator app and enter the 6-digit code for MediNexa.
                    </p>
                  </div>

                  <div className="py-2">
                    <div className="flex justify-center gap-2">
                      {digits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`verify-code-input-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          disabled={!!lockoutMinutes || loading}
                          value={digit}
                          onChange={(e) => handleDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          autoFocus={idx === 0}
                          className="w-12 h-14 text-center text-2xl font-black font-mono rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-teal-600 focus:outline-none transition shadow-sm disabled:opacity-50"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Codes refresh every 30 seconds. MediNexa enforces strict rate-limiting to protect clinical data.
                    </span>
                  </div>
                </div>
              ) : (
                /* Backup Recovery Code Mode */
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-full text-[11px] font-bold">
                      <Key className="w-3.5 h-3.5" /> Single-Use Recovery Code
                    </div>
                    <p className="text-xs text-slate-500 pt-1">
                      Enter one of your 8-character backup codes generated during 2FA setup.
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="e.g. A1B2-C3D4"
                      disabled={!!lockoutMinutes || loading}
                      value={backupCode}
                      onChange={(e) => setBackupCode(e.target.value)}
                      autoFocus
                      className="w-full px-4 py-3.5 text-center text-lg font-mono font-bold tracking-widest rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-teal-600 focus:outline-none transition"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !!lockoutMinutes || (!isBackupCodeMode ? digits.join('').length !== 6 : !backupCode.trim())}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Code...
                  </>
                ) : (
                  <>
                    Verify & Access MediNexa <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="pt-2 flex flex-col items-center gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsBackupCodeMode(!isBackupCodeMode);
                    setError(null);
                  }}
                  className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  {isBackupCodeMode ? 'Use Google Authenticator App instead' : 'Lost your phone? Use a backup recovery code'}
                </button>

                <Link
                  href="/login"
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 inline-flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Return to Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyAuthenticatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    }>
      <VerifyAuthenticatorContent />
    </Suspense>
  );
}
