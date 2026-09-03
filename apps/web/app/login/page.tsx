'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';

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

  const [loggingInRole, setLoggingInRole] = useState<string | null>(null);

  const handleOneClickDemoLogin = async (roleName: string, demoEmail: string, destination: string) => {
    setError(null);
    setLoggingInRole(roleName);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: 'Password123!' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Demo authentication failed.');
      }

      const token = data.accessToken || data.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('medinexa_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('medinexa_user', JSON.stringify(data.user));
        localStorage.setItem('medinexa_demo_mode', 'true');
        sessionStorage.setItem('medinexa_token', token);
        document.cookie = `medinexa_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      }

      router.push(destination);
    } catch (err: any) {
      console.error('1-Click Demo Login error:', err);
      setError(err.message || 'Demo login failed. Please try manual login.');
    } finally {
      setLoggingInRole(null);
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

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center">
        <MediNexaLogo size="lg" href="/" />
        <h2 className="mt-4 text-center text-2xl font-black text-slate-950 dark:text-white tracking-tight">
          Sign In to Healthcare OS
        </h2>
        <p className="mt-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          Connected Tertiary Hospital Operations • India Network
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        {/* Guided Tour Banner for Evaluators */}
        <div className="mb-4 bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 p-4 rounded-3xl text-white shadow-xl flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">
              Interactive Showcase
            </span>
            <h4 className="text-xs font-black">Guided Hospital Tour (7 Workflows)</h4>
            <p className="text-[10px] text-blue-100">
              Registration, Appointment, Consultation, Lab, Pharmacy, Billing & Insurance
            </p>
          </div>
          <Link
            href="/demo"
            className="bg-white text-blue-800 hover:bg-blue-50 font-black text-[11px] px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition flex-shrink-0"
          >
            <span>Start Tour</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-sm border border-slate-200 dark:border-slate-800 sm:rounded-3xl sm:px-10 space-y-6">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs p-3.5 rounded-2xl font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          {/* 1-Click Instant Demo Login Panel */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                ⚡ 1-Click Demo Login (Direct Access):
              </span>
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Instant Auth
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                disabled={!!loggingInRole}
                onClick={() => handleOneClickDemoLogin('Admin', 'admin@medinexa.in', '/dashboard')}
                className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-slate-800 dark:text-slate-200 font-extrabold transition text-left cursor-pointer flex items-center justify-between group disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🏥</span>
                  <div>
                    <div className="text-xs font-black">Admin</div>
                    <div className="text-[9px] text-slate-400 font-normal">Executive Wall</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-600 transition" />
              </button>

              <button
                type="button"
                disabled={!!loggingInRole}
                onClick={() => handleOneClickDemoLogin('Doctor', 'dr.deshmukh@medinexa.in', '/dashboard/doctor-appointments')}
                className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-slate-800 dark:text-slate-200 font-extrabold transition text-left cursor-pointer flex items-center justify-between group disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">👨‍⚕️</span>
                  <div>
                    <div className="text-xs font-black">Doctor</div>
                    <div className="text-[9px] text-slate-400 font-normal">Consult & Vitals</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-600 transition" />
              </button>

              <button
                type="button"
                disabled={!!loggingInRole}
                onClick={() => handleOneClickDemoLogin('Patient', 'patient@medinexa.in', '/portal')}
                className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-slate-800 dark:text-slate-200 font-extrabold transition text-left cursor-pointer flex items-center justify-between group disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🧑‍💼</span>
                  <div>
                    <div className="text-xs font-black">Patient</div>
                    <div className="text-[9px] text-slate-400 font-normal">Patient Portal</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-600 transition" />
              </button>

              <button
                type="button"
                disabled={!!loggingInRole}
                onClick={() => handleOneClickDemoLogin('Receptionist', 'receptionist.01@medinexa.in', '/dashboard/appointments')}
                className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-slate-800 dark:text-slate-200 font-extrabold transition text-left cursor-pointer flex items-center justify-between group disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">📋</span>
                  <div>
                    <div className="text-xs font-black">Receptionist</div>
                    <div className="text-[9px] text-slate-400 font-normal">Intake & OPD</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-600 transition" />
              </button>

              <button
                type="button"
                disabled={!!loggingInRole}
                onClick={() => handleOneClickDemoLogin('Lab Staff', 'lab.01@medinexa.in', '/dashboard/lab')}
                className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-slate-800 dark:text-slate-200 font-extrabold transition text-left cursor-pointer flex items-center justify-between group disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🔬</span>
                  <div>
                    <div className="text-xs font-black">Lab Staff</div>
                    <div className="text-[9px] text-slate-400 font-normal">Pathology Queue</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-600 transition" />
              </button>

              <button
                type="button"
                disabled={!!loggingInRole}
                onClick={() => handleOneClickDemoLogin('Pharmacist', 'pharmacy.01@medinexa.in', '/dashboard/pharmacy')}
                className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-slate-800 dark:text-slate-200 font-extrabold transition text-left cursor-pointer flex items-center justify-between group disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">💊</span>
                  <div>
                    <div className="text-xs font-black">Pharmacist</div>
                    <div className="text-[9px] text-slate-400 font-normal">Formulary Batches</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-600 transition" />
              </button>
            </div>

            {loggingInRole && (
              <div className="text-center text-xs font-bold text-blue-600 dark:text-blue-400 animate-pulse pt-1">
                Authenticating as {loggingInRole} and redirecting...
              </div>
            )}
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
