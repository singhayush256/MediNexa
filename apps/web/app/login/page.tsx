'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('admin.hospa@medinexa.local');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'DOCTOR') {
      setEmail('doc.reminder@medinexa.local');
      setPassword('Password123!');
    } else if (roleParam === 'PATIENT') {
      setEmail('patient.doe@medinexa.local');
      setPassword('Password123!');
    } else if (roleParam === 'HOSPITAL_ADMIN') {
      setEmail('admin.hospa@medinexa.local');
      setPassword('Password123!');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed. Please check your credentials.');
      }

      // Store JWT token and user profile
      if (typeof window !== 'undefined') {
        localStorage.setItem('medinexa_token', data.accessToken || data.token);
        localStorage.setItem('token', data.accessToken || data.token);
        localStorage.setItem('medinexa_user', JSON.stringify(data.user));
        document.cookie = `medinexa_token=${data.accessToken || data.token}; path=/; max-age=86400; SameSite=Lax`;
      }

      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
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
            className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-blue-600/20 hover:bg-blue-700 transition"
          >
            M
          </Link>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          Sign In to MediNexa
        </h2>
        <p className="mt-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          Connected Healthcare Platform for Modern Hospitals
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-subtle border border-slate-200 dark:border-slate-800 sm:rounded-3xl sm:px-10 space-y-6">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs p-3.5 rounded-2xl font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
              {error}
            </div>
          )}

          {/* Quick Demo Credentials */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              1-Click Role Sandbox:
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill('admin.hospa@medinexa.local')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition text-center cursor-pointer"
              >
                🏥 Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('doc.reminder@medinexa.local')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition text-center cursor-pointer"
              >
                👨‍⚕️ Doctor
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('patient.doe@medinexa.local')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition text-center cursor-pointer"
              >
                🧑‍💼 Patient
              </button>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin.hospa@medinexa.local"
                  className="appearance-none block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="appearance-none block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                className="w-full py-3"
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
