'use client';

import React from 'react';
import { HospitalFinderView } from '@/components/hospital-finder/HospitalFinderView';
import Link from 'next/link';
import { Building2, Bed, Activity, PhoneCall, ShieldCheck } from 'lucide-react';

export default function PublicNearbyHospitalsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Public Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight">MediNexa</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Citizen Portal
              </span>
            </div>
          </Link>

          <nav className="flex items-center space-x-4 text-xs font-bold">
            <Link href="/nearby-hospitals" className="text-sky-600 bg-sky-50 px-3 py-1.5 rounded-xl">
              Find Hospitals
            </Link>
            <Link href="/bed-booking" className="text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100">
              Book a Bed
            </Link>
            <Link
              href="/emergency/sos"
              className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5" /> Emergency SOS
            </Link>
            <Link href="/auth/login" className="border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 py-1.5 rounded-xl">
              Staff Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-10 px-6">
        <div className="max-w-7xl mx-auto text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-extrabold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> Verified Real-Time Hospital Network
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Find Nearest Hospitals with Live Bed Availability
            </h1>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl">
              Real-time ICU, Ventilator, Oxygen, and Emergency bed status across premier hospitals. Instant GPS navigation and direct bed reservations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/emergency/sos"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-black shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Activity className="w-4 h-4 animate-pulse" /> One-Click Emergency SOS
            </Link>
          </div>
        </div>
      </section>

      {/* Main Finder Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <HospitalFinderView isPublic={true} />
      </main>

      {/* Public Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>MediNexa Healthcare SaaS • Real-Time Emergency & Bed Availability Infrastructure</p>
      </footer>
    </div>
  );
}
