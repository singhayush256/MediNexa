'use client';

import React from 'react';
import { HospitalFinderView } from '@/components/hospital-finder/HospitalFinderView';
import Link from 'next/link';
import { Building2, Bed, Activity, Sparkles } from 'lucide-react';

export default function DashboardNearbyHospitalsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-extrabold text-slate-900 tracking-tight">MediNexa</span>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">
                  Hospital Finder
                </span>
              </div>
            </div>

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
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <HospitalFinderView isPublic={false} />
      </main>
    </div>
  );
}
