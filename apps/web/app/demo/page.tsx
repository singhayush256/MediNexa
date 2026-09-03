'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  UserPlus,
  Calendar,
  Stethoscope,
  FlaskConical,
  Pill,
  CreditCard,
  Building2,
  Users,
  ExternalLink,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { DEMO_STEPS } from '@/components/demo/DemoWalkthroughTour';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';

export default function DemoShowcasePage() {
  const router = useRouter();
  const [loggingInRole, setLoggingInRole] = useState<string | null>(null);

  const demoAccounts = [
    {
      role: 'Hospital Administrator',
      email: 'admin@medinexa.in',
      icon: '🏥',
      badge: 'C-Level / Super Admin',
      destination: '/dashboard',
      description: 'Executive command wall, bed census heatmaps, revenue stream analytics, and DISHA audit trail logs.',
      theme: 'from-blue-600 to-indigo-700',
    },
    {
      role: 'Specialist Doctor',
      email: 'dr.deshmukh@medinexa.in',
      icon: '👨‍⚕️',
      badge: 'Dr. Arvind Deshmukh (MCI)',
      destination: '/dashboard/doctor-appointments',
      description: 'OPD queue triage, vitals examination, clinical SOAP encounters, lab orders, and digital prescriptions.',
      theme: 'from-emerald-600 to-teal-700',
    },
    {
      role: 'Primary Patient',
      email: 'patient@medinexa.in',
      icon: '🧑‍💼',
      badge: 'Aarav Sharma (Citizen)',
      destination: '/portal',
      description: 'Doctor appointments, electronic prescriptions, NABL lab reports, hospital bills, and 24/7 AI Health Assistant.',
      theme: 'from-cyan-600 to-blue-700',
    },
    {
      role: 'Hospital Receptionist',
      email: 'receptionist.01@medinexa.in',
      icon: '📋',
      badge: 'Intake Registrar',
      destination: '/dashboard/appointments',
      description: 'Patient onboarding (+91 default), UHID generation, token ticketing, and 30-min doctor appointment scheduling.',
      theme: 'from-amber-600 to-orange-700',
    },
    {
      role: 'Pathology Lab Staff',
      email: 'lab.01@medinexa.in',
      icon: '🔬',
      badge: 'Ramesh Chandra (NABL)',
      destination: '/dashboard/lab',
      description: 'Diagnostic specimen tracking, biological reference intervals, and 1-click NABL vector PDF lab reports.',
      theme: 'from-teal-600 to-emerald-700',
    },
    {
      role: 'Dispensing Pharmacist',
      email: 'pharmacy.01@medinexa.in',
      icon: '💊',
      badge: 'Sandeep Shinde (Formulary)',
      destination: '/dashboard/pharmacy',
      description: 'FEFO/FIFO batch tracking, expiry date warning indicators, prescription fulfillment, and 12% GST billing.',
      theme: 'from-purple-600 to-pink-700',
    },
  ];

  const handleOneClickLogin = async (roleName: string, email: string, destination: string) => {
    setLoggingInRole(roleName);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'Password123!' }),
      });

      if (res.ok) {
        const data = await res.json();
        const token = data.accessToken || data.token;
        localStorage.setItem('medinexa_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('medinexa_user', JSON.stringify(data.user));
        localStorage.setItem('medinexa_demo_mode', 'true');
        document.cookie = `medinexa_token=${token}; path=/; max-age=86400; SameSite=Lax`;
        router.push(destination);
      } else {
        router.push(destination);
      }
    } catch (e) {
      router.push(destination);
    } finally {
      setLoggingInRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MediNexaLogo size="sm" subtitle="DEMO SHOWCASE" href="/" />
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Regular Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Hero Banner */}
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-extrabold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>HOSPITAL EVALUATOR & RECRUITER SHOWCASE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Experience Real Hospital Operations in 1-Click
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Explore how Apollo MediNexa runs end-to-end outpatient triage, critical care bed allocation, statutory 12% GST pharmacy billing, NABL diagnostic panels, and cashless health insurance claims.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100 Indian Patients</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>20 Credentialed Doctors</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Dummy Buttons</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>NABH & DISHA Aligned</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: 1-Click Role Login Cards */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>⚡ 1-Click Demo Logins</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                  Instant Access
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose any role below to be instantly authenticated and routed directly to their specialized clinical workstation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {demoAccounts.map((acc) => (
              <div
                key={acc.role}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
                      {acc.icon}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {acc.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {acc.role}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {acc.email}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {acc.description}
                  </p>
                </div>

                <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 mt-5">
                  <button
                    type="button"
                    disabled={!!loggingInRole}
                    onClick={() => handleOneClickLogin(acc.role, acc.email, acc.destination)}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loggingInRole === acc.role ? (
                      <span>Signing in as {acc.role}...</span>
                    ) : (
                      <>
                        <span>Enter as {acc.role}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: 7-Stage Clinical Hospital Journey */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>📜 Guided Hospital Operations Walkthrough (7 Workflows)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explore the complete, uninterrupted patient journey from initial registration through clinical consultation, lab testing, dispensing, and billing.
            </p>
          </div>

          <div className="space-y-4">
            {DEMO_STEPS.map((step) => (
              <div
                key={step.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0 font-black text-sm">
                    {step.number}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        {step.category}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {step.title}
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        • Role: <strong className="text-slate-700 dark:text-slate-300">{step.roleRecommended}</strong>
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                      {step.description}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {step.highlights.map((h, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>{h}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <button
                    onClick={() => handleOneClickLogin(step.roleRecommended, step.roleEmail, step.primaryActionUrl)}
                    className="w-full md:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>Launch Live Step</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
