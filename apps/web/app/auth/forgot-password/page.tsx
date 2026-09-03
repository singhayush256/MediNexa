'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ message: string; resetLink?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to dispatch reset instructions.');
      }

      setSuccessData({
        message: data.message || 'Password reset link has been dispatched.',
        resetLink: data.resetLink,
      });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
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
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          Enter your registered email to receive secure recovery access
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

          {successData ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Recovery Request Received
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {successData.message}
                </p>
              </div>

              {/* Developer / Demo Instant Action Link */}
              {successData.resetLink && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl text-left space-y-2">
                  <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Demo Instant Access:</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    A secure token was generated for this session. Click below to open the reset screen directly:
                  </p>
                  <Link
                    href={successData.resetLink}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1"
                  >
                    <span>Proceed to Set New Password</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Registered Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@medinexa.in"
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Verifying Account...</span>
                  ) : (
                    <>
                      <span>Dispatch Recovery Instructions</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                Remember your password?{' '}
                <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">
                  Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
