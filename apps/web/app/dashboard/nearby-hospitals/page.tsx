'use client';

import React from 'react';
import { HospitalFinderView } from '@/components/hospital-finder/HospitalFinderView';
import Link from 'next/link';
import { Building2, Bed, Activity, Sparkles, LogOut } from 'lucide-react';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';

export default function DashboardNearbyHospitalsPage() {
  const handleLogout = () => {
    try {
      localStorage.removeItem('medinexa_token');
      localStorage.removeItem('token');
      localStorage.removeItem('medinexa_user');
      sessionStorage.clear();
      document.cookie = 'medinexa_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch {}
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <MediNexaLogo size="sm" subtitle="FINDER" href="/dashboard" />

            <nav className="hidden md:flex space-x-1 text-sm">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
              >
                Overview
              </Link>
              <Link
                href="/dashboard/hospital/beds"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
              >
                Live Bed Engine
              </Link>
              <Link
                href="/dashboard/nearby-hospitals"
                className="px-3 py-1.5 rounded-lg text-sky-600 bg-sky-50 font-bold"
              >
                Nearby Hospitals
              </Link>
              <Link
                href="/dashboard/bed-bookings"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
              >
                Booking Queue
              </Link>
              <Link
                href="/dashboard/ai/occupancy-forecast"
                className="px-3 py-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> AI Forecast
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/nearby-hospitals"
              target="_blank"
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Public View ↗
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-xs transition cursor-pointer"
              title="Logout from MediNexa"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <HospitalFinderView isPublic={false} />
      </main>
    </div>
  );
}
