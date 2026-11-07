'use client';

import React, { useState } from 'react';
import { HospitalFinderView } from '@/components/hospital-finder/HospitalFinderView';
import Link from 'next/link';
import { Building2, Bed, Activity, PhoneCall, ShieldCheck, Stethoscope } from 'lucide-react';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { EmergencyDispatchModal } from '@/components/emergency/EmergencyDispatchModal';

export default function PublicNearbyHospitalsPage() {
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
      {/* Public Navigation Header */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <MediNexaLogo size="sm" subtitle="Find Hospitals & Services" href="/" />

          <nav className="flex items-center space-x-2 sm:space-x-3 text-xs font-bold">
            <Link href="/nearby-hospitals" className="text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-900">
              Find Hospitals
            </Link>
            <Link href="/portal/live-beds" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              Live Beds
            </Link>
            <Link href="/bed-booking" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hidden sm:inline-block">
              Book Bed
            </Link>
            <button
              type="button"
              onClick={() => setEmergencyModalOpen(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>Emergency Help</span>
            </button>
            <ThemeToggle />
            <Link href="/login" className="border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-1.5 rounded-xl hidden sm:inline-block">
              Login
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
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Find Hospitals, Check Live Beds & Explore Services
            </h1>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl">
              Real-time ICU, Emergency, and General ward bed inventory across verified hospitals. Explore medical departments, clinical specialties, and book appointments.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => setEmergencyModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-black shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Activity className="w-4 h-4 animate-pulse" /> 1-Click Emergency Dispatch
            </button>
            <Link
              href="/portal/live-beds"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/20 flex items-center justify-center gap-2 transition-all"
            >
              <Bed className="w-4 h-4 text-sky-400" /> Central Bed Matrix
            </Link>
          </div>
        </div>
      </section>

      {/* Main Finder Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <HospitalFinderView isPublic={true} />
      </main>

      {/* Public Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>MediNexa Connected Healthcare • Real-Time Emergency, Bed Discovery & Patient Care Platform</p>
      </footer>

      {/* Emergency Dispatch Modal */}
      <EmergencyDispatchModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
      />
    </div>
  );
}
