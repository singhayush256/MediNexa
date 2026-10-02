'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HeartPulse,
  Calendar,
  FileText,
  Bed,
  Pill,
  FlaskConical,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  LogIn,
  Activity,
  Sparkles,
  Lock,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';
import { PatientDemoSwitcherModal } from '@/components/portal/PatientDemoSwitcherModal';

export default function PatientPortalGatewayPage() {
  const router = useRouter();
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <MediNexaLogo size="sm" subtitle="Patient Portal" href="/" />

          <div className="flex items-center gap-3">
            <Link
              href="/hospital"
              className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition hidden sm:inline-block"
            >
              Switch to Hospital Portal →
            </Link>
            <ThemeToggle />
            <Link href="/login?portal=patient&redirect=/portal">
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-bold text-xs transition shadow-xs cursor-pointer"
              >
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>PORTAL 1 — PATIENT HEALTH OS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Your Personal Healthcare, <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Connected & Accessible 24/7
            </span>
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            Book doctor consultations, view live hospital bed availability, access longitudinal diagnostic records, and track your Guardian Health Score.
          </p>

          <div className="pt-4 flex flex-wrap justify-center items-center gap-4">
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={() => setShowDemoModal(true)}
            >
              Enter Patient Dashboard
            </Button>
            <Link href="/auth/register">
              <Button variant="outline" size="lg" icon={<UserPlus className="w-4 h-4" />}>
                Register New Patient Account
              </Button>
            </Link>
            <Link href="/login?portal=patient&redirect=/portal">
              <Button variant="ghost" size="lg" icon={<LogIn className="w-4 h-4" />}>
                Existing Patient Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Demo Patient Accounts Modal */}
        <PatientDemoSwitcherModal
          isOpen={showDemoModal}
          onClose={() => setShowDemoModal(false)}
        />

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Doctor Appointments</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Real-time slot reservation across top specialists, instant OPD confirmation, and token queue tracking.
            </p>
            <Link href="/portal/appointments" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 mt-4 hover:underline">
              Book Appointment →
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Guardian Health Score</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              AI continuous biometric analysis from 0 to 100, early deterioration detection, and 1-click Emergency SOS.
            </p>
            <Link href="/portal/health-score" className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 mt-4 hover:underline">
              View Health Score →
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
              <Bed className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Bed Availability</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Direct telemetry from hospital ward allocations with real-time General, ICU, and Semi-Private bed reserves.
            </p>
            <Link href="/portal/bed-bookings" className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 mt-4 hover:underline">
              Check Hospital Beds →
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4">
              <FlaskConical className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Diagnostic Lab Reports</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              NABL accredited diagnostic test results, historical parameter trend tracking, and verified PDF downloads.
            </p>
            <Link href="/portal/lab-reports" className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 mt-4 hover:underline">
              Access Reports →
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
              <Pill className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Medicines & Prescriptions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Digitally signed e-prescriptions, dosage schedules, refill reminders, and verified pharmacy dispensing.
            </p>
            <Link href="/portal/prescriptions" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-4 hover:underline">
              View Prescriptions →
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">ABHA & Health Records</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Ayushman Bharat Digital Mission (ABDM) compliant 14-digit ABHA ID integration and consent-based EHR sharing.
            </p>
            <Link href="/portal/medical-records" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-4 hover:underline">
              View Records →
            </Link>
          </div>
        </div>

        {/* Security & Multi-Hospital Footer Banner */}
        <div className="mt-16 p-6 rounded-3xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Enterprise Patient Identity Protected</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Unique identifier format (MNX-P-XXXXXXXX). 256-bit AES encryption & Google Authenticator 2FA.</p>
            </div>
          </div>
          <Link href="/hospital" className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            Hospital Staff Portal →
          </Link>
        </div>
      </main>
    </div>
  );
}
