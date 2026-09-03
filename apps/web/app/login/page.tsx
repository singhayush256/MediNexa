'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail, password, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Authentication failed. Please check your credentials.';
        throw new Error(errorMsg);
      }

      // Store JWT token and authenticated user profile
      const token = data.accessToken || data.token;
      if (typeof window !== 'undefined' && token) {
        localStorage.setItem('medinexa_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('medinexa_user', JSON.stringify(data.user));
        sessionStorage.setItem('medinexa_token', token);

        const cookieMaxAge = rememberMe ? 2592000 : 86400; // 30 days or 24 hours
        document.cookie = `medinexa_token=${token}; path=/; max-age=${cookieMaxAge}; SameSite=Lax`;
      }

      // Intelligent role-based dashboard destination
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
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during sign in.');
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
          Sign In to Healthcare OS
        </h2>
        <p className="mt-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          Connected Tertiary Hospital Operations • Real User Authentication
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-sm border border-slate-200 dark:border-slate-800 sm:rounded-3xl sm:px-10 space-y-6">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs p-4 rounded-2xl font-semibold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
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
                  placeholder="Enter your account password"
                  className="block w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Remember me on this device
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-xl shadow-lg shadow-blue-500/20 text-xs flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                {loading ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Switch to Register */}
          <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don&apos;t have an account yet?{' '}
              <Link
                href="/auth/register"
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Create a new account
              </Link>
            </p>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="mt-6 flex items-center justify-center gap-2 text-center text-[10px] text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span>
            256-Bit TLS Encryption • Bcrypt Password Hashing • Statutory NABH & DISHA Compliant
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
