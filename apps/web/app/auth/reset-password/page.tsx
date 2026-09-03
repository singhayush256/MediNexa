'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenEmail, setTokenEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      // Verify token with backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      fetch(`${apiUrl}/auth/verify-reset-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: urlToken }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.valid) {
            setTokenEmail(data.email || null);
          } else {
            setError(data.message || 'Reset link is invalid or expired. Please request a new link.');
          }
        })
        .catch(() => {
          // If network error, allow form input to proceed
        })
        .finally(() => setVerifying(false));
    } else {
      setVerifying(false);
    }
  }, [searchParams]);

  // Password Strength Criteria
  const passwordCriteria = useMemo(() => {
    return {
      minLength: newPassword.length >= 8,
      hasUpper: /[A-Z]/.test(newPassword),
      hasLower: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    };
  }, [newPassword]);

  const strengthScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.minLength) score += 1;
    if (passwordCriteria.hasUpper && passwordCriteria.hasLower) score += 1;
    if (passwordCriteria.hasNumber) score += 1;
    if (passwordCriteria.hasSpecial) score += 1;
    return score;
  }, [passwordCriteria]);

  const strengthLabel = useMemo(() => {
    if (!newPassword) return { text: '', color: 'text-slate-400', barColor: 'bg-slate-200 dark:bg-slate-700' };
    if (strengthScore <= 1) return { text: 'Weak', color: 'text-rose-500', barColor: 'bg-rose-500' };
    if (strengthScore === 2) return { text: 'Fair', color: 'text-amber-500', barColor: 'bg-amber-500' };
    if (strengthScore === 3) return { text: 'Good', color: 'text-blue-500', barColor: 'bg-blue-500' };
    return { text: 'Strong', color: 'text-emerald-500', barColor: 'bg-emerald-500' };
  }, [newPassword, strengthScore]);

  // Passwords Match Check
  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return newPassword === confirmPassword;
  }, [newPassword, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const activeToken = token.trim();
    if (!activeToken) {
      setError('A valid password reset token is required. Please check your reset link.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (strengthScore < 2) {
      setError('Please choose a stronger password with letters, numbers, and symbols.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify your new password.');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: activeToken, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while resetting your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors duration-200 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link
            href="/"
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-blue-500/20 hover:scale-105 transition-transform"
          >
            M
          </Link>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          Set New Password
        </h2>
        <p className="mt-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          {tokenEmail ? `Updating credentials for ${tokenEmail}` : 'Enter your new secure account password'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-sm border border-slate-200 dark:border-slate-800 sm:rounded-3xl sm:px-10 space-y-6">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs p-3.5 rounded-2xl font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Password Updated Successfully
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your new password has been verified and persisted. You can now sign in with your updated credentials.
                </p>
              </div>

              <div className="pt-3">
                <Link
                  href="/login"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center gap-1.5 shadow-sm shadow-blue-600/20"
                >
                  <span>Sign In with New Password</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {!searchParams.get('token') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Reset Token <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      required
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Paste recovery token here"
                      className="block w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              )}

              {/* New Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  {newPassword && (
                    <span className={`text-[10px] font-bold ${strengthLabel.color}`}>
                      Strength: {strengthLabel.text}
                    </span>
                  )}
                </div>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="block w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Progress Bar */}
                {newPassword && (
                  <div className="mt-2 space-y-1.5">
                    <div className="grid grid-cols-4 gap-1.5 h-1.5">
                      <div className={`rounded-full ${strengthScore >= 1 ? strengthLabel.barColor : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                      <div className={`rounded-full ${strengthScore >= 2 ? strengthLabel.barColor : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                      <div className={`rounded-full ${strengthScore >= 3 ? strengthLabel.barColor : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                      <div className={`rounded-full ${strengthScore >= 4 ? strengthLabel.barColor : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  {confirmPassword && (
                    <span className={`text-[10px] font-bold ${passwordsMatch ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {passwordsMatch ? '✓ Passwords match' : 'Passwords do not match'}
                    </span>
                  )}
                </div>
                <div className="mt-1 relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className={`block w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                      confirmPassword
                        ? passwordsMatch
                          ? 'border-emerald-500/60 focus:ring-emerald-500'
                          : 'border-rose-500/60 focus:ring-rose-500'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                    }`}
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Saving New Password...</span>
                  ) : (
                    <>
                      <span>Update Password</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                <Link href="/login" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  &larr; Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex items-center justify-center text-xs font-semibold text-slate-400">
          Loading recovery gateway...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
