'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';
import { getApiBaseUrl, fetchWithTimeout } from '@/lib/api-config';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Wizard state: 'EMAIL' | 'TOTP_RESET' | 'SUCCESS'
  const [step, setStep] = useState<'EMAIL' | 'TOTP_RESET' | 'SUCCESS'>('EMAIL');
  const [email, setEmail] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Step 1: Submit Email & Initialize Authenticator Check
  const handleInitiateReset = async (e: React.FormEvent) => {
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
      const apiUrl = getApiBaseUrl();
      const res = await fetchWithTimeout(
        `${apiUrl}/auth/forgot-password-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail }),
        },
        20000,
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Email address not registered.');
      }

      setStep('TOTP_RESET');
      setSuccessMessage(`Google Authenticator verification active for ${cleanEmail}.`);
    } catch (err: any) {
      setError(err.message || 'Failed to verify email address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Google Authenticator 6-digit Code and Update Password
  const handleResetWithAuthenticator = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = totpCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setError('Please enter your 6-digit Google Authenticator code.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords match exactly.');
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-~`+=])[A-Za-z\d!@#$%^&*(),.?":{}|<>_\-~`+=]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError(
        'Password requirements not met: minimum 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.',
      );
      return;
    }

    setLoading(true);

    try {
      const apiUrl = getApiBaseUrl();
      const res = await fetchWithTimeout(
        `${apiUrl}/auth/reset-password-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            code: cleanCode,
            newPassword,
            confirmPassword,
          }),
        },
        20000,
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Invalid Google Authenticator code.');
      }

      setStep('SUCCESS');
      setSuccessMessage('Password reset successfully! You can now sign in with your new password.');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check your authenticator code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-900 dark:text-slate-100 selection:bg-teal-600 selection:text-white transition-colors duration-200 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/">
            <MediNexaLogo />
          </Link>
        </div>
        <h2 className="mt-4 text-center text-3xl font-black text-slate-950 dark:text-white tracking-tight">
          Reset Your Password
        </h2>
        <p className="mt-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          Google Authenticator 2-Factor Identity Verification
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-sm border border-slate-200 dark:border-slate-800 sm:rounded-3xl sm:px-10 space-y-6">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs p-3.5 rounded-2xl font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && step !== 'SUCCESS' && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs p-3.5 rounded-2xl font-semibold flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold">Google Authenticator Verification Active</p>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300 mt-0.5">
                  Open Google Authenticator on your mobile device to retrieve the 6-digit security code for{' '}
                  <span className="font-mono font-bold">{email}</span>.
                </p>
              </div>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 'EMAIL' && (
            <form onSubmit={handleInitiateReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Registered Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. singhayushsingh2567@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-600/20 text-xs flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying Account...' : 'Continue to Authenticator Verification'}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </form>
          )}

          {/* STEP 2: Enter Google Authenticator TOTP & New Password */}
          {step === 'TOTP_RESET' && (
            <form onSubmit={handleResetWithAuthenticator} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Google Authenticator 6-Digit Code <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                    <Smartphone className="w-3 h-3 text-teal-600" /> Authenticator App
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={8}
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9a-zA-Z]/g, '').slice(0, 8))}
                  className="w-full text-center tracking-widest text-xl font-mono font-black py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Enter the 6-digit code generated by Google Authenticator (or an 8-character backup code).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-600/20 text-xs flex items-center justify-center gap-2"
                >
                  {loading ? 'Verifying Code...' : 'Verify Authenticator & Reset Password'}
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </Button>

                <button
                  type="button"
                  onClick={() => setStep('EMAIL')}
                  className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Change Email
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Success */}
          {step === 'SUCCESS' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Password Updated</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your password has been changed securely using Google Authenticator. You can now log into your MediNexa account.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-600/20 text-xs flex items-center justify-center gap-1.5"
                >
                  Proceed to Sign In
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
