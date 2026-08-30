'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [activePreview, setActivePreview] = useState<'admissions' | 'clinical' | 'pharmacy' | 'billing'>('admissions');

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

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-sky-500 selection:text-white antialiased">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-sky-600/20 group-hover:bg-sky-700 transition">
              M
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">MediNexa</span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#metrics" className="hover:text-sky-600 transition">Overview</a>
            <a href="#modules" className="hover:text-sky-600 transition">Modules</a>
            <a href="#why-medinexa" className="hover:text-sky-600 transition">Why MediNexa</a>
            <a href="#preview" className="hover:text-sky-600 transition">Platform Preview</a>
            <a href="#security" className="hover:text-sky-600 transition">Security</a>
          </nav>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              Sign In
            </Link>
            <button
              onClick={handleLaunchDashboard}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm shadow-sky-600/20 transition"
            >
              Launch Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-700">
              <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse"></span>
              Healthcare Operations Platform
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.1]">
              MediNexa
            </h1>

            <p className="text-xl sm:text-2xl font-semibold text-slate-800 leading-snug">
              Unified Hospital Management Platform for Modern Healthcare.
            </p>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Manage patients, appointments, admissions, pharmacy, laboratory, billing, insurance, emergency services and telemedicine from a single connected platform.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={handleLaunchDashboard}
                className="w-full sm:w-auto px-7 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-sky-600/20 transition flex items-center justify-center gap-2"
              >
                <span>Launch Dashboard</span>
                <span>→</span>
              </button>
              <a
                href="#modules"
                className="w-full sm:w-auto px-7 py-3.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold text-sm rounded-xl shadow-xs transition text-center"
              >
                View Features
              </a>
            </div>
          </div>

          {/* Right Hero Illustration / Live Dashboard Preview */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-800 text-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">MediNexa Operations</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Live Operations
                </span>
              </div>

              {/* Vitals & Capacity Widget */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <div className="text-slate-400 text-[11px]">Active Admissions</div>
                  <div className="text-2xl font-bold text-white mt-1">128</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Occupancy: 84%</div>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <div className="text-slate-400 text-[11px]">Today&apos;s Appointments</div>
                  <div className="text-2xl font-bold text-sky-400 mt-1">42</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">38 Completed</div>
                </div>
              </div>

              {/* Mini Queue Preview */}
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Current Patient Queue</span>
                  <span className="text-slate-400">OPD & Triage</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center bg-slate-900/90 p-2 rounded-lg">
                    <span className="font-medium text-slate-200">Sarah Jenkins (Cardiology)</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono text-[10px]">IN CONSULTATION</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/90 p-2 rounded-lg">
                    <span className="font-medium text-slate-200">David Miller (General OPD)</span>
                    <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 rounded font-mono text-[10px]">WAITING</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/90 p-2 rounded-lg">
                    <span className="font-medium text-slate-200">Elena Rostova (Lab Work)</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-mono text-[10px]">READY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Metrics Section */}
      <section id="metrics" className="py-16 bg-slate-50 border-y border-slate-200/80 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-3xl font-extrabold text-slate-950">30+</div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Enterprise Modules</div>
              <div className="text-xs text-slate-500">Full hospital spectrum</div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-3xl font-extrabold text-slate-950">750+</div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Automated Tests</div>
              <div className="text-xs text-slate-500">Verified workflows</div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-lg font-extrabold text-slate-950 pt-1">Role-Based Access</div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">RBAC Control</div>
              <div className="text-xs text-slate-500">Granular permissions</div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-lg font-extrabold text-slate-950 pt-1">Multi-Hospital</div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Architecture</div>
              <div className="text-xs text-slate-500">Cross-facility isolation</div>
            </div>

            <div className="col-span-2 md:col-span-1 p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-lg font-extrabold text-slate-950 pt-1">Real-Time Operations</div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Connected Engine</div>
              <div className="text-xs text-slate-500">Instant synchronization</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Modules Section */}
      <section id="modules" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
            COMPREHENSIVE CAPABILITIES
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Core Platform Modules
          </h2>
          <p className="text-sm text-slate-600">
            A cohesive suite of specialized modules designed to handle all aspects of healthcare delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Patient Management */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl">
              🧑‍⚕️
            </div>
            <h3 className="text-base font-bold text-slate-900">Patient Management</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Centralized patient registration, demographics, and longitudinal medical histories.
            </p>
          </div>

          {/* 2. Appointments */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl">
              📅
            </div>
            <h3 className="text-base font-bold text-slate-900">Appointments</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time consultation scheduling, doctor availability calendars, and queue tracking.
            </p>
          </div>

          {/* 3. Emergency & Triage */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl">
              🚨
            </div>
            <h3 className="text-base font-bold text-slate-900">Emergency & Triage</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Emergency Severity Index (ESI) triage categorization, trauma intake, and rapid resuscitation.
            </p>
          </div>

          {/* 4. Hospital Admissions */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
              🛏️
            </div>
            <h3 className="text-base font-bold text-slate-900">Hospital Admissions</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inpatient intake, ward and bed allocation, patient transfers, and discharge summaries.
            </p>
          </div>

          {/* 5. Laboratory */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl">
              🧪
            </div>
            <h3 className="text-base font-bold text-slate-900">Laboratory</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Diagnostic test ordering, sample accessioning, reference range validation, and reports.
            </p>
          </div>

          {/* 6. Pharmacy */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              💊
            </div>
            <h3 className="text-base font-bold text-slate-900">Pharmacy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hospital drug formulary, digital prescription dispensing, stock tracking, and expiry alerts.
            </p>
          </div>

          {/* 7. Billing */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
              💳
            </div>
            <h3 className="text-base font-bold text-slate-900">Billing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Itemized patient invoices, automated payment allocation, and accounts receivable management.
            </p>
          </div>

          {/* 8. Insurance Claims */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
              🛡️
            </div>
            <h3 className="text-base font-bold text-slate-900">Insurance Claims</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cashless claim pre-authorizations, policy tracking, query handling, and insurer settlement.
            </p>
          </div>

          {/* 9. Telemedicine */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-xl">
              📹
            </div>
            <h3 className="text-base font-bold text-slate-900">Telemedicine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Secure virtual consultations, video sessions, digital waiting rooms, and e-prescriptions.
            </p>
          </div>

          {/* 10. Ambulance Dispatch */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
              🚑
            </div>
            <h3 className="text-base font-bold text-slate-900">Ambulance Dispatch</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Emergency vehicle fleet management, active call dispatching, and en-route coordination.
            </p>
          </div>

          {/* 11. Medical Records */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xl">
              📁
            </div>
            <h3 className="text-base font-bold text-slate-900">Medical Records</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Comprehensive electronic health records, clinical vitals history, and diagnostic logs.
            </p>
          </div>

          {/* 12. AI Clinical Copilot */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
              🧠
            </div>
            <h3 className="text-base font-bold text-slate-900">AI Clinical Copilot</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Clinical documentation assistance, structured note generation, and workflow automation.
            </p>
          </div>
        </div>
      </section>

      {/* Why MediNexa Section (Three Columns) */}
      <section id="why-medinexa" className="py-24 bg-slate-50 border-y border-slate-200/80 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
              PRODUCT ADVANTAGES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Why MediNexa
            </h2>
            <p className="text-sm text-slate-600">
              Built to replace fragmented healthcare tools with a single unified operational backbone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-2xl font-bold">
                🔗
              </div>
              <h3 className="text-lg font-bold text-slate-900">Unified Operations</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                One platform for all departments. Eliminate data silos between clinical staff, laboratories, pharmacy, and billing.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-bold">
                ⚡
              </div>
              <h3 className="text-lg font-bold text-slate-900">Faster Clinical Workflows</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Reduce administrative burden. Simplify patient intake, speed up consultations, and automate repetitive tasks.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl font-bold">
                📈
              </div>
              <h3 className="text-lg font-bold text-slate-900">Scalable Architecture</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Supports single clinics to large hospital networks with multi-facility isolation and high-availability design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Screenshots / Platform Preview Section */}
      <section id="preview" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
            USER EXPERIENCE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Designed for Modern Clinical Teams
          </h2>
          <p className="text-sm text-slate-600">
            Clean, purpose-built workstations for doctors, nurses, administrators, and billing specialists.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActivePreview('admissions')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activePreview === 'admissions'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Admissions & Beds
          </button>
          <button
            onClick={() => setActivePreview('clinical')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activePreview === 'clinical'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Clinical EHR & Vitals
          </button>
          <button
            onClick={() => setActivePreview('pharmacy')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activePreview === 'pharmacy'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pharmacy & Inventory
          </button>
          <button
            onClick={() => setActivePreview('billing')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activePreview === 'billing'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Billing & Invoicing
          </button>
        </div>

        {/* Realistic Dashboard Preview Container */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
          {activePreview === 'admissions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                <div>
                  <h4 className="text-base font-bold text-white">Inpatient Ward Census & Bed Allocation</h4>
                  <p className="text-xs text-slate-400">Real-time facility capacity tracking across ICU, General Ward, and Private Rooms</p>
                </div>
                <button
                  onClick={handleLaunchDashboard}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg self-start"
                >
                  Open Admissions →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <div className="text-xs text-slate-400">Total Ward Beds</div>
                  <div className="text-2xl font-bold text-white mt-1">160</div>
                  <div className="text-xs text-emerald-400 mt-1">32 Beds Available</div>
                </div>
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <div className="text-xs text-slate-400">ICU Capacity</div>
                  <div className="text-2xl font-bold text-sky-400 mt-1">24 / 30</div>
                  <div className="text-xs text-amber-400 mt-1">80% Occupancy</div>
                </div>
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <div className="text-xs text-slate-400">Discharges Pending</div>
                  <div className="text-2xl font-bold text-purple-400 mt-1">8</div>
                  <div className="text-xs text-slate-400 mt-1">Ready for clearance</div>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 pb-2">
                      <th className="pb-2">Admission ID</th>
                      <th className="pb-2">Patient</th>
                      <th className="pb-2">Ward / Room</th>
                      <th className="pb-2">Attending Doctor</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr>
                      <td className="py-2.5 font-mono text-sky-400">ADM-84920</td>
                      <td className="py-2.5 font-medium">Eleanor Vance</td>
                      <td className="py-2.5">ICU Pod A - Bed 03</td>
                      <td className="py-2.5">Dr. Siddharth M.</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-semibold text-[10px]">ADMITTED</span></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-mono text-sky-400">ADM-84921</td>
                      <td className="py-2.5 font-medium">Marcus Chen</td>
                      <td className="py-2.5">General Ward 204-B</td>
                      <td className="py-2.5">Dr. Alok Verma</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-semibold text-[10px]">ADMITTED</span></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-mono text-sky-400">ADM-84918</td>
                      <td className="py-2.5 font-medium">Grace Hopper</td>
                      <td className="py-2.5">Private Suite 401</td>
                      <td className="py-2.5">Dr. Sara Lin</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 rounded font-semibold text-[10px]">READY FOR DISCHARGE</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activePreview === 'clinical' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                <div>
                  <h4 className="text-base font-bold text-white">Physician Clinical Workstation</h4>
                  <p className="text-xs text-slate-400">Structured encounters, vital signs flowsheets, and digital orders</p>
                </div>
                <button
                  onClick={handleLaunchDashboard}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg self-start"
                >
                  Open Clinical EHR →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <div className="text-slate-400">Heart Rate</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">74 bpm</div>
                  <div className="text-[10px] text-slate-400">Normal sinus rhythm</div>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <div className="text-slate-400">Blood Pressure</div>
                  <div className="text-xl font-bold text-slate-200 mt-1">122 / 80</div>
                  <div className="text-[10px] text-slate-400">mmHg (Target range)</div>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <div className="text-slate-400">Oxygen Saturation</div>
                  <div className="text-xl font-bold text-sky-400 mt-1">98%</div>
                  <div className="text-[10px] text-slate-400">Room air SpO2</div>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <div className="text-slate-400">Early Warning Score</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">0 (Low Risk)</div>
                  <div className="text-[10px] text-slate-400">Continuous score</div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="font-semibold text-slate-300">Latest Clinical Impression & Plan:</div>
                <p className="text-slate-400 leading-relaxed">
                  Patient presenting with stable hemodynamics post-operative Day 2. Incision clean and dry. Advised oral analgesia and step-down ambulation. Discharge planned within 24 hours pending lab clearance.
                </p>
              </div>
            </div>
          )}

          {activePreview === 'pharmacy' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                <div>
                  <h4 className="text-base font-bold text-white">Pharmacy Formulary & Dispensing Hub</h4>
                  <p className="text-xs text-slate-400">Medication administration records, stock alerts, and automated replenishment</p>
                </div>
                <button
                  onClick={handleLaunchDashboard}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg self-start"
                >
                  Open Pharmacy →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <div className="text-slate-400">Prescriptions To Dispense</div>
                  <div className="text-2xl font-bold text-white mt-1">14 Pending</div>
                  <div className="text-xs text-sky-400 mt-1">Average wait: 6 mins</div>
                </div>
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <div className="text-slate-400">Active Formulary Items</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">1,240 SKUs</div>
                  <div className="text-xs text-slate-400 mt-1">All categories in stock</div>
                </div>
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <div className="text-slate-400">Low Stock Reorders</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1">3 Alerts</div>
                  <div className="text-xs text-amber-400 mt-1">Auto-PO generated</div>
                </div>
              </div>
            </div>
          )}

          {activePreview === 'billing' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                <div>
                  <h4 className="text-base font-bold text-white">Revenue Cycle & Accounts Receivable</h4>
                  <p className="text-xs text-slate-400">Itemized billing, insurance pre-authorization claims, and collection status</p>
                </div>
                <button
                  onClick={handleLaunchDashboard}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg self-start"
                >
                  Open Billing →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <div className="text-slate-400">Clean Claims Rate</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">98.8%</div>
                  <div className="text-xs text-slate-400 mt-1">First-pass acceptance</div>
                </div>
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <div className="text-slate-400">Average Settlement Days</div>
                  <div className="text-2xl font-bold text-white mt-1">14.2 Days</div>
                  <div className="text-xs text-sky-400 mt-1">Down 40% vs industry</div>
                </div>
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <div className="text-slate-400">Three-Way Matching</div>
                  <div className="text-2xl font-bold text-indigo-400 mt-1">100% Match</div>
                  <div className="text-xs text-slate-400 mt-1">PO ↔ GRN ↔ Invoice</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Security Section (Simple cards without technical buzzwords) */}
      <section id="security" className="py-24 bg-slate-50 border-y border-slate-200/80 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
              DATA PRIVACY & INTEGRITY
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Enterprise Security Standards
            </h2>
            <p className="text-sm text-slate-600">
              Built with essential protections to safeguard sensitive medical and operational data.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl">
                🛡️
              </div>
              <h3 className="text-base font-bold text-slate-900">Role-Based Access</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated workstations and restricted data views for doctors, nurses, administrators, and patients.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                🏢
              </div>
              <h3 className="text-base font-bold text-slate-900">Facility Isolation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete data separation ensuring individual hospital campuses operate with independent privacy boundaries.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                📜
              </div>
              <h3 className="text-base font-bold text-slate-900">Audit Logging</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Immutable activity logs and accountability trails recorded for clinical actions, admissions, and orders.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
                🔑
              </div>
              <h3 className="text-base font-bold text-slate-900">Secure Authentication</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Session token authentication, strict password requirements, and automatic protection for all dashboard routes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Ready to Modernize Healthcare Operations?
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Experience a clean, unified platform designed to streamline clinical care and hospital operations.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleLaunchDashboard}
              className="w-full sm:w-auto px-8 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-sky-600/20 transition"
            >
              Launch Dashboard
            </button>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold text-sm rounded-xl shadow-xs transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Clean Modern Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
              M
            </div>
            <div>
              <span className="font-bold text-slate-900">MediNexa</span>
              <span className="ml-2 text-slate-400">• Unified Hospital Management Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="#modules" className="hover:text-slate-900 transition">Modules</a>
            <a href="#why-medinexa" className="hover:text-slate-900 transition">Why MediNexa</a>
            <a href="#security" className="hover:text-slate-900 transition">Security</a>
            <Link href="/login" className="hover:text-slate-900 transition">Sign In</Link>
            <a href="https://github.com/singhayush256/MediNexa" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition">GitHub</a>
          </div>

          <div>
            &copy; {new Date().getFullYear()} MediNexa. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
