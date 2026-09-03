'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('admin@medinexa.in');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'DOCTOR') {
      setEmail('dr.deshmukh@medinexa.in');
      setPassword('Password123!');
    } else if (roleParam === 'PATIENT') {
      setEmail('patient@medinexa.in');
      setPassword('Password123!');
    } else if (roleParam === 'NURSE') {
      setEmail('nurse.01@medinexa.in');
      setPassword('Password123!');
    } else if (roleParam === 'ADMIN' || roleParam === 'HOSPITAL_ADMIN') {
      setEmail('admin@medinexa.in');
      setPassword('Password123!');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Password is required.');
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
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed. Please check your credentials.');
      }

      // Store JWT token and user profile
      const token = data.accessToken || data.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('medinexa_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('medinexa_user', JSON.stringify(data.user));
        sessionStorage.setItem('medinexa_token', token);
        document.cookie = `medinexa_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      }

      const roleCode = data.user?.role?.code || data.user?.roleCode;
      const explicitRedirect = searchParams.get('redirect');

      if (explicitRedirect) {
        router.push(explicitRedirect);
      } else if (roleCode === 'PATIENT') {
        router.push('/portal');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
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
          Sign In to MediNexa
        </h2>
        <p className="mt-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          Connected Healthcare Platform • India Network
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-sm border border-slate-200 dark:border-slate-800 sm:rounded-3xl sm:px-10 space-y-6">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs p-3.5 rounded-2xl font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Credentials */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              1-Click Role Sandbox:
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@medinexa.in')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 text-slate-700 dark:text-slate-200 font-bold transition text-center cursor-pointer text-[10px]"
              >
                🏥 Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('dr.deshmukh@medinexa.in')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 text-slate-700 dark:text-slate-200 font-bold transition text-center cursor-pointer text-[10px]"
              >
                👨‍⚕️ Doctor
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('patient@medinexa.in')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 text-slate-700 dark:text-slate-200 font-bold transition text-center cursor-pointer text-[10px]"
              >
                🧑‍💼 Patient
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('nurse.01@medinexa.in')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 text-slate-700 dark:text-slate-200 font-bold transition text-center cursor-pointer text-[10px]"
              >
                👩‍⚕️ Nurse
              </button>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
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
                  placeholder="admin@medinexa.in"
                  className="appearance-none block w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
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
                  className="appearance-none block w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                className="w-full py-2.5 rounded-xl font-bold cursor-pointer"
              >
                Sign In to Platform
              </Button>
            </div>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <div>
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">
                Create Account
              </Link>
            </div>
            <div>
              <Link
                href="/"
                className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-medium transition"
              >
                &larr; Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex items-center justify-center text-xs font-semibold text-slate-400">
          Loading sign in portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
