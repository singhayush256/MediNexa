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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-900 selection:bg-sky-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link
            href="/"
            className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center text-white font-bold text-2xl shadow-md shadow-sky-600/20 hover:bg-sky-700 transition"
          >
            M
          </Link>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-950 tracking-tight">
          Sign In to MediNexa
        </h2>
        <p className="mt-2 text-center text-xs font-semibold text-slate-500">
          Unified Hospital Management Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
              {error}
            </div>
          )}

          {/* Quick Demo Credentials */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Quick Demo Accounts:
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill('admin.hospa@medinexa.local')}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 text-slate-700 font-bold transition text-center"
              >
                🏥 Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('doc.reminder@medinexa.local')}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 text-slate-700 font-bold transition text-center"
              >
                👨‍⚕️ Doctor
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('patient.doe@medinexa.local')}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 text-slate-700 font-bold transition text-center"
              >
                🧑‍💼 Patient
              </button>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin.hospa@medinexa.local"
                  className="appearance-none block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="appearance-none block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs font-medium"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-sm shadow-sky-600/20 transition disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 space-y-2">
            <div>
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-sky-600 hover:text-sky-800 font-bold">
                Create Account
              </Link>
            </div>
            <div>
              <Link
                href="/"
                className="text-slate-500 hover:text-slate-800 font-medium transition"
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-xs">
          Loading MediNexa Authentication...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
