'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState<boolean>(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoModalMode, setDemoModalMode] = useState<'demo' | 'tour'>('demo');
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'dashboard' | 'patient' | 'lab' | 'pharmacy' | 'billing' | 'telemedicine'>('dashboard');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('medinexa_theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('medinexa_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('medinexa_theme', 'light');
      }
      return next;
    });
  };

  const handleLaunchDashboard = () => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('medinexa_token') || localStorage.getItem('token')
        : null;
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login?redirect=/dashboard');
    }
  };

  const handleQuickDemoAccess = (role: string) => {
    router.push(`/login?role=${role}`);
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200 ${isDark ? 'dark bg-[#0B1020] text-[#F8FAFC]' : 'bg-[#FFFFFF] text-[#0F172A]'}`}>
      {/* Top Sticky Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-[#0B1020]/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-600/20 group-hover:bg-blue-700 transition">
              M
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">MediNexa</span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Product</a>
            <a href="#problem" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Solutions</a>
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Features</a>
            <a href="#about" className="hover:text-blue-600 dark:hover:text-blue-400 transition">About</a>
            <a href="#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Contact</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition"
            >
              {isDark ? (
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Sign In
            </Link>
            <button
              onClick={() => {
                setDemoModalMode('demo');
                setDemoModalOpen(true);
              }}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-600/20 transition"
            >
              Request Demo
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Connected Healthcare. Simplified.
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.1]">
              Healthcare Infrastructure <br />
              <span className="text-blue-600 dark:text-blue-400">for the Next Generation</span>
            </h1>

            <p className="text-lg sm:text-xl font-medium text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              MediNexa unifies hospitals, doctors, laboratories, pharmacies, emergency services, and patients into one connected healthcare ecosystem.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => {
                  setDemoModalMode('demo');
                  setDemoModalOpen(true);
                }}
                className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-2xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
              >
                <span>Request Demo</span>
                <span>→</span>
              </button>
              <button
                onClick={() => {
                  setDemoModalMode('tour');
                  setDemoModalOpen(true);
                }}
                className="w-full sm:w-auto px-7 py-3.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-2xl shadow-xs transition"
              >
                Watch Product Tour
              </button>
            </div>
          </div>

          {/* Right Hero Visual: Professional Healthcare Dashboard Preview */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-5 shadow-2xl border border-slate-800 text-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">MediNexa Central Console</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Live Operations
                </span>
              </div>

              {/* Patient Overview & Appointments */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-800/70 rounded-2xl border border-slate-700/60">
                  <div className="text-slate-400 text-[11px]">Active Admissions</div>
                  <div className="text-2xl font-bold text-white mt-1">128</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">84% Bed Occupancy</div>
                </div>
                <div className="p-3.5 bg-slate-800/70 rounded-2xl border border-slate-700/60">
                  <div className="text-slate-400 text-[11px]">Today&apos;s Appointments</div>
                  <div className="text-2xl font-bold text-blue-400 mt-1">42</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">38 Completed</div>
                </div>
              </div>

              {/* Revenue & Bed Occupancy Stats */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-800/70 rounded-2xl border border-slate-700/60">
                  <div className="text-slate-400 text-[11px]">Revenue Analytics</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">$248,500</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">98.4% Clean Claims</div>
                </div>
                <div className="p-3.5 bg-slate-800/70 rounded-2xl border border-slate-700/60">
                  <div className="text-slate-400 text-[11px]">Emergency Status</div>
                  <div className="text-lg font-bold text-rose-400 mt-1">0 Critical Alerts</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Avg Triage: 4 mins</div>
                </div>
              </div>

              {/* Live Queue Items */}
              <div className="p-3.5 bg-slate-800/70 rounded-2xl border border-slate-700/60 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Patient Queue</span>
                  <span className="text-slate-400">Department Streams</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center bg-slate-900 p-2 rounded-xl">
                    <span className="font-medium text-slate-200">Sarah Jenkins (Cardiology)</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-mono">IN CONSULT</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900 p-2 rounded-xl">
                    <span className="font-medium text-slate-200">David Miller (General OPD)</span>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] font-mono">WAITING</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-14 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800/80 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Design Inspiration
          </div>
          <h2 className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
            Built for Modern Healthcare Operations
          </h2>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-slate-400 dark:text-slate-500 text-xs sm:text-sm font-semibold grayscale opacity-75">
            <span>🏥 Mayo Clinic Inspired Workflows</span>
            <span>🩺 Cleveland Clinic Clinical Pathways</span>
            <span>📊 Johns Hopkins Acuity Models</span>
            <span>🌐 Stanford Health Care UX</span>
            <span>🛡️ Mass General Systems</span>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            THE CHALLENGE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Healthcare Should Not Run on Disconnected Systems
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Fragmented tools create delays, increase clinician burnout, and introduce operational bottlenecks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl font-bold">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">1. Fragmented Workflows</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Multiple disconnected systems create delays, communication breakdowns, and inefficiencies across clinical and administrative teams.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl font-bold">
              📋
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">2. Administrative Burden</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Manual operations and repetitive paperwork consume valuable clinical time that belongs to patient care.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl font-bold">
              👁️
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">3. Limited Visibility</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Healthcare teams lack real-time operational insight into bed availability, pharmacy stock, and financial receivables.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section (Bento Grid) */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800/80 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              COMPREHENSIVE CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              One Platform. Every Department.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Purpose-built modules providing unified clinical, diagnostic, and operational support.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Hospital Management */}
            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="text-2xl">🏥</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hospital Management</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Complete institutional lifecycle:</p>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• OPD</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• IPD</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Admissions</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Bed Management</span>
              </div>
            </div>

            {/* Clinical Operations */}
            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="text-2xl">🩺</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Clinical Operations</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Physician and nursing care:</p>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Longitudinal EHR</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Medical Orders</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Documentation</span>
              </div>
            </div>

            {/* Laboratory */}
            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="text-2xl">🧪</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Laboratory</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Diagnostic specimen workflows:</p>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Test Management</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Diagnostic Results</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Pathology Sign-Off</span>
              </div>
            </div>

            {/* Pharmacy */}
            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="text-2xl">💊</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pharmacy</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Formulary and dispensing hub:</p>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Inventory Tracking</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• e-Prescriptions</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Batch & Expiry Alerts</span>
              </div>
            </div>

            {/* Emergency Services */}
            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="text-2xl">🚑</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Emergency Services</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Critical care response:</p>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Ambulance Dispatch</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• ESI Triage Intake</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Trauma Bed Assign</span>
              </div>
            </div>

            {/* Telemedicine */}
            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="text-2xl">📹</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Telemedicine</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Remote patient engagement:</p>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Video Consultations</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Digital Waiting Room</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Remote Prescribing</span>
              </div>
            </div>

            {/* Billing & Insurance */}
            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="text-2xl">💳</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Billing & Insurance</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Accounts receivable recovery:</p>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Cashless Claims</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Revenue Cycle (RCM)</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Itemized Invoicing</span>
              </div>
            </div>

            {/* AI Clinical Copilot */}
            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="text-2xl">🧠</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Clinical Copilot</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Intelligent clinician assistance:</p>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Decision Support</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Structured Notes</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Safety Warnings</span>
              </div>
            </div>

            {/* Reports & Analytics */}
            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="text-2xl">📊</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reports & Analytics</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Operational intelligence:</p>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Real-Time Dashboards</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Bed Census Telemetry</span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">• Department KPIs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-7 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-4xl sm:text-5xl font-extrabold text-blue-600 dark:text-blue-400">30+</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Modules</div>
            <div className="text-xs text-slate-500">Comprehensive platform</div>
          </div>

          <div className="p-7 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white pt-2">Multi-Tenant</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Platform</div>
            <div className="text-xs text-slate-500">Complete facility isolation</div>
          </div>

          <div className="p-7 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white pt-2">Real-Time</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Operations</div>
            <div className="text-xs text-slate-500">Zero sync delay</div>
          </div>

          <div className="p-7 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white pt-2">Enterprise</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Security</div>
            <div className="text-xs text-slate-500">Role-based permissioning</div>
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800/80 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              USER WORKSTATIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Designed for Speed and Clarity
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Clean interfaces engineered for doctors, nurses, administrators, and laboratory personnel.
            </p>
          </div>

          {/* Horizontal Navigation Pills */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
            {[
              { id: 'dashboard', label: 'Command Center' },
              { id: 'patient', label: 'Patient Profile' },
              { id: 'lab', label: 'Laboratory' },
              { id: 'pharmacy', label: 'Pharmacy' },
              { id: 'billing', label: 'Billing' },
              { id: 'telemedicine', label: 'Telemedicine' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePreviewTab(tab.id as any)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                  activePreviewTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Realistic Dashboard Preview Container */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
            {activePreviewTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Hospital Command Center</h3>
                    <p className="text-xs text-slate-500">Live operational overview across all departments</p>
                  </div>
                  <button
                    onClick={handleLaunchDashboard}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl self-start"
                  >
                    Open Live Dashboard →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500">Total Ward Beds</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">160</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">32 Beds Available</div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500">ICU Capacity</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">24 / 30</div>
                    <div className="text-xs text-slate-500 mt-1">80% Occupancy</div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500">Discharges Pending</div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">8</div>
                    <div className="text-xs text-slate-500 mt-1">Ready for clearance</div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'patient' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Longitudinal Patient Dossier</h3>
                    <p className="text-xs text-slate-500">Structured encounters, vital signs flowsheets, and ICD-10 diagnostic history</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg text-xs font-semibold">
                    MRN #MED-94021
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-500">Heart Rate</div>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">74 bpm</div>
                    <div className="text-[10px] text-slate-500">Normal rhythm</div>
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-500">Blood Pressure</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">122 / 80</div>
                    <div className="text-[10px] text-slate-500">Target range</div>
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-500">SpO2</div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">98%</div>
                    <div className="text-[10px] text-slate-500">Room air</div>
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-500">Early Warning Score</div>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">0 (Stable)</div>
                    <div className="text-[10px] text-slate-500">EWS normal</div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'lab' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Diagnostic Laboratory Information System</h3>
                    <p className="text-xs text-slate-500">Specimen barcode tracking, reference ranges, and verified pathology reports</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <span>Complete Blood Count (CBC) Panel</span>
                    <span className="text-emerald-600 dark:text-emerald-400">✓ Signed by Pathologist</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Hemoglobin 14.2 g/dL (Normal) • WBC Count 6,800 /uL (Normal) • Platelets 240,000 /uL (Normal)
                  </p>
                </div>
              </div>
            )}

            {activePreviewTab === 'pharmacy' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Pharmacy Formulary & Dispensing</h3>
                    <p className="text-xs text-slate-500">Medication administration records, stock alerts, and automated replenishment</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-500">Prescriptions To Dispense</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">14 Pending</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Average wait: 6 mins</div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-500">Formulary Items</div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">1,240 SKUs</div>
                    <div className="text-xs text-slate-500 mt-1">Active inventory</div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-500">Reorders Triggered</div>
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">3 Alerts</div>
                    <div className="text-xs text-slate-500 mt-1">Stock threshold met</div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'billing' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue Cycle & Accounts Receivable</h3>
                    <p className="text-xs text-slate-500">Itemized billing, insurance pre-authorization claims, and collection tracking</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-500">Clean Claims Rate</div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">98.8%</div>
                    <div className="text-xs text-slate-500 mt-1">First-pass clearance</div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-500">Average Settlement Days</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">14.2 Days</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Faster reimbursement</div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-500">Three-Way Matching</div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">100% Match</div>
                    <div className="text-xs text-slate-500 mt-1">PO ↔ GRN ↔ Invoice</div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'telemedicine' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Encrypted Virtual Consultation Suite</h3>
                    <p className="text-xs text-slate-500">High-definition video consultations, digital waiting queues, and e-prescriptions</p>
                  </div>
                </div>
                <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900 dark:text-white">Active Session: Dr. Siddharth M. & Jane Doe</span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded font-mono text-[10px]">ENCRYPTED PEER CONNECTION</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Virtual consultation room active. Real-time vital signs synchronization, ambient clinical note drafting, and instant prescription generation enabled.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why MediNexa Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            THE MEDINEXA ADVANTAGE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Why Healthcare Leaders Choose MediNexa
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            A single, connected platform engineered for clinical operational excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl font-bold">
              🔗
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Unified Platform</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              One connected healthcare ecosystem covering clinical EHR, pharmacy, laboratory, admissions, and billing without third-party friction.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Faster Operations</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Reduce administrative overhead. Automate routine workflows and paperwork so clinical teams can focus on patient care.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold">
              📈
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Built to Scale</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Suitable for standalone clinics, multi-specialty hospitals, and multi-campus healthcare provider networks.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800/80 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            OUR MISSION
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Why We Are Building MediNexa
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            MediNexa is designed to simplify healthcare operations by bringing clinical, operational, and administrative workflows together into a single connected platform.
          </p>
          <div className="pt-4 flex items-center justify-center gap-6 text-xs font-semibold text-slate-500">
            <span>✓ Built for Healthcare Teams</span>
            <span>✓ Privacy First Design</span>
            <span>✓ Operational Transparency</span>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="contact" className="py-24 px-6 max-w-7xl mx-auto text-center">
        <div className="max-w-4xl mx-auto p-10 sm:p-14 rounded-3xl bg-blue-600 text-white shadow-xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Modernize Healthcare Operations?
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Empower healthcare teams with a connected digital infrastructure.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                setDemoModalMode('demo');
                setDemoModalOpen(true);
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-blue-600 hover:bg-blue-50 font-bold text-sm rounded-2xl shadow-md transition"
            >
              Request Demo
            </button>
            <button
              onClick={handleLaunchDashboard}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-700 hover:bg-blue-800 text-white border border-blue-500 font-bold text-sm rounded-2xl transition"
            >
              Launch Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1020] py-16 px-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base">
                M
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">MediNexa</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Connected Healthcare. Simplified. The Operating System for Modern Healthcare.
            </p>
            <div className="pt-2">
              &copy; {new Date().getFullYear()} MediNexa. All rights reserved.
            </div>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Product</div>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-blue-600 transition">Hospital Management</a></li>
              <li><a href="#features" className="hover:text-blue-600 transition">Clinical EHR</a></li>
              <li><a href="#features" className="hover:text-blue-600 transition">Laboratory</a></li>
              <li><a href="#features" className="hover:text-blue-600 transition">Pharmacy</a></li>
              <li><a href="#features" className="hover:text-blue-600 transition">Telemedicine</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Solutions</div>
            <ul className="space-y-2">
              <li><a href="#problem" className="hover:text-blue-600 transition">Multi-Hospital Networks</a></li>
              <li><a href="#problem" className="hover:text-blue-600 transition">Specialty Clinics</a></li>
              <li><a href="#problem" className="hover:text-blue-600 transition">Diagnostic Centers</a></li>
              <li><a href="#problem" className="hover:text-blue-600 transition">Inpatient Facilities</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Contact & Links</div>
            <ul className="space-y-2">
              <li><a href="mailto:contact@medinexa.health" className="hover:text-blue-600 transition">contact@medinexa.health</a></li>
              <li><a href="https://github.com/singhayush256/MediNexa" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition">GitHub Repository</a></li>
              <li><Link href="/login" className="hover:text-blue-600 transition">Portal Sign In</Link></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Interactive Request Demo & Product Tour Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 relative text-left border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setDemoModalOpen(false);
                setDemoSubmitted(false);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm"
            >
              ✕
            </button>

            {!demoSubmitted ? (
              <>
                <div className="space-y-2">
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">
                    {demoModalMode === 'demo' ? 'Interactive Demonstration' : 'Product Walkthrough'}
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-950 dark:text-white">
                    {demoModalMode === 'demo' ? 'Experience MediNexa' : 'MediNexa Product Tour'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Launch a role-based clinical workstation or request an executive walkthrough.
                  </p>
                </div>

                {/* Instant Role Preview Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Instant Sandbox Workstations:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { role: 'HOSPITAL_ADMIN', label: '🏥 Hospital Admin', desc: 'Bed Census & Admissions' },
                      { role: 'DOCTOR', label: '👨‍⚕️ Physician', desc: 'Clinical EHR & Vitals' },
                      { role: 'NURSE', label: '👩‍⚕️ Nurse', desc: 'Vitals & Inpatient Ward' },
                      { role: 'PATIENT', label: '🧑‍💼 Patient', desc: 'Appointments & Records' },
                    ].map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => handleQuickDemoAccess(item.role)}
                        className="p-3 text-left rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50/50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition group"
                      >
                        <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-slate-500">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Or Contact Our Team</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                </div>

                {/* Demo Request Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setDemoSubmitted(true);
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Your Name *</label>
                      <input
                        required
                        placeholder="Dr. Siddharth M."
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Hospital / Organization *</label>
                      <input
                        required
                        placeholder="Apex Healthcare Center"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Work Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="siddharth@apexhealth.org"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition"
                  >
                    Submit Demo Request
                  </button>
                </form>
              </>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl mx-auto">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Demo Request Received</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Thank you for reaching out. Our team will connect with you within 24 hours to schedule your personalized live demo.
                </p>
                <button
                  onClick={() => setDemoModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-xl"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
