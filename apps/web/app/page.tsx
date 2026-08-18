'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface HealthData {
  status: string;
  service: string;
  version: string;
}

export default function LandingPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    fetch(`${apiUrl}/health`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: HealthData) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Backend health ping error:', err);
        setError('Backend API unreachable');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      {/* Navigation Bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
              M
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">MediNexa</span>
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-sky-100 text-sky-800 rounded-full">Day 1 Foundation</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-slate-600 hover:text-sky-700 font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all"
            >
              Launch Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 bg-sky-50 border border-sky-200 px-4 py-1.5 rounded-full text-sky-700 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            <span>Architectural Foundation Phase</span>
          </div>

          <h1 className="text-5xl font-black text-slate-900 tracking-tight sm:text-6xl">
            MediNexa
          </h1>
          <p className="text-2xl font-bold text-sky-600 sm:text-3xl">
            "Connected Healthcare, One Platform"
          </p>

          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            MediNexa is an enterprise-grade modular health platform designed to unify patients, healthcare providers, hospital networks, laboratories, pharmacies, and emergency services into a cohesive ecosystem.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-sky-600/20 transition-all text-base"
            >
              Explore Day 1 Dashboard
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold px-8 py-3.5 rounded-xl shadow-sm transition-all text-base"
            >
              Portal Login
            </Link>
          </div>
        </div>

        {/* Backend API Connectivity Status Card */}
        <div className="mt-16 w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            System Connectivity Status
          </h3>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-sm font-medium text-slate-700">Backend API Status:</span>
            {loading ? (
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium animate-pulse">
                Pinging /api/v1/health...
              </span>
            ) : health ? (
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {health.service} v{health.version} ({health.status.toUpperCase()})
              </span>
            ) : (
              <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-medium">
                {error || 'Offline'}
              </span>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-slate-500">
          MediNexa Connected Healthcare Platform &copy; 2026. Day 1 Modular Monolith Foundation.
        </div>
      </footer>
    </div>
  );
}
