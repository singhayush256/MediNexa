'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-sky-600/15 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-teal-400 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-sky-500/25 hover:scale-105 transition">
            M
          </Link>
        </div>
        <h2 className="mt-4 text-center text-3xl font-black text-white tracking-tight">
          MediNexa Portal
        </h2>
        <p className="mt-2 text-center text-xs font-semibold text-slate-400">
          Enterprise Access for Clinicians, Administrators & Patients
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 shadow-2xl border border-slate-800 sm:rounded-3xl sm:px-10 space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3.5 rounded-xl font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
              {error}
            </div>
          )}

          {/* Quick Demo Fill Buttons */}
          <div className="space-y-2">
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Quick One-Click Demo Credentials:
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill('admin.hospa@medinexa.local')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-white font-bold transition text-center"
              >
                🏥 Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('doc.reminder@medinexa.local')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-white font-bold transition text-center"
              >
                👨‍⚕️ Doctor
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('patient.doe@medinexa.local')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-white font-bold transition text-center"
              >
                🧑‍💼 Patient
              </button>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-300">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin.hospa@medinexa.local"
                  className="appearance-none block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl placeholder-slate-600 text-white focus:outline-none focus:border-sky-500 text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="appearance-none block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl placeholder-slate-600 text-white focus:outline-none focus:border-sky-500 text-xs font-medium"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/20 transition disabled:opacity-50"
              >
                {loading ? 'Authenticating Session...' : 'Sign In to MediNexa Console'}
              </button>
            </div>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 space-y-2">
            <div>
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-sky-400 hover:text-sky-300 font-bold">
                Register Profile
              </Link>
            </div>
            <div>
              <Link
                href="/"
                className="text-slate-400 hover:text-white font-medium transition"
              >
                &larr; Back to Landing Page
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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
          Loading MediNexa Authentication...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
