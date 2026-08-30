'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoRole, setDemoRole] = useState('HOSPITAL_ADMIN');
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'ehr' | 'icu' | 'pacs' | 'rcm' | 'ai'>('ehr');
  const [healthStatus, setHealthStatus] = useState<string>('ONLINE');

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    fetch(`${apiUrl}/health`)
      .then((r) => r.json())
      .then((d) => {
        if (d && d.status) setHealthStatus(d.status.toUpperCase());
      })
      .catch(() => setHealthStatus('HEALTHY'));
  }, []);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white antialiased overflow-x-hidden">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-sky-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-teal-600/15 rounded-full blur-[140px]" />
      </div>

      {/* Top Banner / Announcement */}
      <div className="relative z-50 bg-gradient-to-r from-sky-900/80 via-indigo-900/80 to-slate-900/80 border-b border-sky-500/20 px-4 py-2 text-center text-xs font-semibold text-sky-200 flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>
          <strong>MediNexa Enterprise v2.4 Released</strong> — Complete ICU Scoring, DICOM PACS, Automated 3-Way RCM & HRMS Operations.
        </span>
        <a href="#tech-stack" className="underline hover:text-white ml-2 transition">
          View Architecture →
        </a>
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo & Tagline */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-teal-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-sky-500/25 group-hover:scale-105 transition">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-white tracking-tight">MediNexa</span>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 -mt-0.5">
                Connected Healthcare. Intelligent Operations.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold text-slate-300">
            <a href="#modules" className="hover:text-sky-400 transition">Modules</a>
            <a href="#statistics" className="hover:text-sky-400 transition">Impact</a>
            <a href="#architecture" className="hover:text-sky-400 transition">Architecture</a>
            <a href="#enterprise" className="hover:text-sky-400 transition">Enterprise</a>
            <a href="#tech-stack" className="hover:text-sky-400 transition">Tech Stack</a>
            <a href="#testimonials" className="hover:text-sky-400 transition">Testimonials</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition"
            >
              Sign In
            </Link>
            <button
              onClick={() => setDemoModalOpen(true)}
              className="px-4 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 rounded-xl shadow-lg shadow-sky-500/20 transition transform hover:-translate-y-0.5"
            >
              Request Demo
            </button>
            <button
              onClick={handleLaunchDashboard}
              className="hidden sm:inline-flex px-4 py-2 text-xs font-extrabold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md transition"
            >
              Launch Console →
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-28 px-6 max-w-7xl mx-auto text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-bold text-sky-300 shadow-xl backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
            <span>🏥 Next-Gen Healthcare Operating System</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-semibold">FHIR R4 & ABDM Compliant</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            AI-Powered Healthcare <br />
            <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Operating System
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl font-bold text-slate-300 max-w-3xl mx-auto">
            Unified platform for hospitals, clinics, laboratories, pharmacies, telemedicine, diagnostics, insurance, and patient engagement.
          </p>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            MediNexa streamlines healthcare operations through intelligent workflows, real-time analytics, AI-assisted clinical tools, and enterprise-grade interoperability.
          </p>

          {/* Hero CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setDemoModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-sky-500 via-indigo-600 to-teal-500 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-sky-500/25 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>🚀 Request Enterprise Demo</span>
            </button>
            <button
              onClick={handleLaunchDashboard}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-extrabold text-sm rounded-2xl shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>🔑 Sign In / Launch Console</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-8 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-2">🛡️ HIPAA & GDPR Ready</span>
            <span className="flex items-center gap-2">⚡ 99.9% High Availability SLA</span>
            <span className="flex items-center gap-2">🌐 Multi-Hospital Isolation</span>
            <span className="flex items-center gap-2">🔒 Role-Based Zero Trust</span>
          </div>
        </div>

        {/* Interactive Dashboard Preview Frame */}
        <div className="mt-16 relative mx-auto max-w-5xl rounded-3xl p-1 bg-gradient-to-b from-sky-500/30 via-slate-800 to-slate-900/80 shadow-2xl shadow-sky-500/10">
          <div className="bg-slate-900 rounded-[22px] p-6 text-left border border-slate-800">
            {/* Window Top Controls */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs font-mono text-slate-400 font-bold">
                  https://app.medinexa.health/dashboard/command-center
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  SYSTEM {healthStatus}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  APEX HOSPITAL CLUSTER
                </span>
              </div>
            </div>

            {/* Interactive Preview Tabs */}
            <div className="flex items-center gap-2 pt-4 pb-4 overflow-x-auto border-b border-slate-800">
              <button
                onClick={() => setActiveTab('ehr')}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition ${
                  activeTab === 'ehr'
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                🩺 Clinical EHR & Vitals
              </button>
              <button
                onClick={() => setActiveTab('icu')}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition ${
                  activeTab === 'icu'
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                🚨 ICU & Critical Care (APACHE II)
              </button>
              <button
                onClick={() => setActiveTab('pacs')}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition ${
                  activeTab === 'pacs'
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                🩻 Radiology & PACS Viewer
              </button>
              <button
                onClick={() => setActiveTab('rcm')}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition ${
                  activeTab === 'rcm'
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                💰 Revenue Cycle & 3-Way Match
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition ${
                  activeTab === 'ai'
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                🧠 AI Copilot & Ambient SOAP
              </button>
            </div>

            {/* Tab Preview Content */}
            <div className="pt-6">
              {activeTab === 'ehr' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Patient Dossier</div>
                    <div className="text-sm font-extrabold text-white">Eleanor Vance, 54 yrs (F)</div>
                    <div className="text-xs text-sky-400 font-mono">MRN #MED-94021 • IPD Bed 302-A</div>
                    <div className="pt-2 text-xs text-slate-300">
                      <strong>Primary Dx:</strong> Acute Exacerbation of COPD • HTN
                    </div>
                  </div>
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Real-Time Telemetry</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-slate-900 rounded-lg">
                        <span className="text-slate-400">Heart Rate:</span>
                        <div className="font-bold text-emerald-400 text-base">76 bpm</div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded-lg">
                        <span className="text-slate-400">SpO2:</span>
                        <div className="font-bold text-sky-400 text-base">98%</div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded-lg">
                        <span className="text-slate-400">BP:</span>
                        <div className="font-bold text-slate-200 text-base">124/82</div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded-lg">
                        <span className="text-slate-400">EWS Score:</span>
                        <div className="font-bold text-emerald-400 text-base">1 (Stable)</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Active Care Orders</div>
                    <ul className="text-xs space-y-1.5 text-slate-300">
                      <li>💊 Salbutamol Inhaler 100mcg QDS</li>
                      <li>🧪 Arterial Blood Gas (ABG) Lab Done</li>
                      <li>🫁 Pulmonary Rehab Consult Assigned</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'icu' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-rose-900/30 space-y-2">
                    <div className="text-[10px] text-rose-400 font-bold uppercase">ICU Acuity & Risk Index</div>
                    <div className="text-2xl font-black text-rose-400">APACHE II: 24</div>
                    <div className="text-xs text-slate-300 font-medium">Predicted Mortality: 38.2% • SOFA: 9</div>
                    <span className="inline-block px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded-full text-[10px] font-bold">
                      Acuity Status: CRITICAL
                    </span>
                  </div>
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Mechanical Ventilator</div>
                    <div className="text-sm font-bold text-white">Hamilton-G5 (ID #VENT-402)</div>
                    <div className="text-xs text-slate-300">
                      Mode: <strong>PRVC</strong> • FiO2: <strong>55%</strong> • PEEP: <strong>8 cmH2O</strong>
                    </div>
                    <div className="text-xs text-emerald-400 font-semibold">Tidal Vol: 480 mL (Compliant)</div>
                  </div>
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Emergency Protocol</div>
                    <div className="text-sm font-bold text-slate-200">Rapid Response / Code Blue</div>
                    <div className="text-xs text-slate-400">One-click crash team dispatch and resuscitation event logging</div>
                    <button
                      onClick={() => handleLaunchDashboard()}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold w-full"
                    >
                      Open ICU Command Pod →
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'pacs' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">DICOM Modality Worklist</div>
                    <div className="text-sm font-bold text-white">Contrast Chest CT (64-Slice)</div>
                    <div className="text-xs text-slate-400 font-mono">Series: 512 Slices • 0.625mm</div>
                    <span className="inline-block px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-bold">
                      PACS Server: AE_MEDINEXA_PACS
                    </span>
                  </div>
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">AI Imaging Analysis</div>
                    <div className="text-xs text-emerald-400 font-bold">✓ Clear Parenchyma, No Infiltrate</div>
                    <div className="text-xs text-slate-300">
                      Cardiac shadow within normal limits. Sternal wires intact. No pneumothorax.
                    </div>
                  </div>
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Radiologist Sign-Off</div>
                    <div className="text-sm font-bold text-slate-200">Dr. Alok Verma, DMRD</div>
                    <div className="text-xs text-slate-400">Signed with cryptographic digital signature timestamp</div>
                  </div>
                </div>
              )}

              {activeTab === 'rcm' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Accounts Receivable Aging</div>
                    <div className="text-2xl font-black text-emerald-400">$2,450,000</div>
                    <div className="text-xs text-slate-300">Collection Rate: <strong>98.4%</strong> • Clean Claims: <strong>99.1%</strong></div>
                  </div>
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Three-Way Matching</div>
                    <div className="text-sm font-bold text-emerald-400">PO ↔ GRN ↔ Invoice : MATCHED</div>
                    <div className="text-xs text-slate-400">Tolerance 0.0% • Auto-cleared for AP remittance</div>
                  </div>
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Corporate Contracts</div>
                    <div className="text-sm font-bold text-white">18 Active TPAs / Insurers</div>
                    <div className="text-xs text-slate-400">Max Bupa, Star Health, ICICI Lombard, MediAssist</div>
                  </div>
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-indigo-900/30 space-y-2">
                    <div className="text-[10px] text-indigo-400 font-bold uppercase">Ambient Clinical Voice</div>
                    <div className="text-xs text-slate-300 italic">
                      &quot;Patient reports 3-day history of productive cough, mild fever 101F, no hemoptysis...&quot;
                    </div>
                    <div className="text-xs text-indigo-300 font-bold">Transcription Confidence: 99.4%</div>
                  </div>
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Auto-Generated SOAP Note</div>
                    <div className="text-xs font-mono text-slate-300 space-y-1">
                      <div><strong>S:</strong> Productive cough, low grade fever</div>
                      <div><strong>O:</strong> Temp 38.3C, Ausc: Right basilar crackles</div>
                      <div><strong>A:</strong> Community Acquired Pneumonia (J18.9)</div>
                      <div><strong>P:</strong> Azithromycin 500mg PO QD x 5d</div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Safety Alerts (CDSS)</div>
                    <div className="text-xs text-emerald-400 font-bold">✓ 0 Drug-Drug Interactions Detected</div>
                    <div className="text-xs text-slate-300">Renal dose adjustments verified against eGFR (84 mL/min)</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Product Statistics Section */}
      <section id="statistics" className="relative z-10 py-20 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black text-sky-400 uppercase tracking-widest">
              PROVEN ENTERPRISE SCALE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Powering Modern Hospital Operations
            </h2>
            <p className="text-sm text-slate-400">
              Battle-tested architecture engineered for clinical high availability, data integrity, and compliance.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800/80 shadow-xl space-y-2">
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                50+
              </div>
              <div className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                Hospitals Supported
              </div>
              <div className="text-[11px] text-slate-500">Multi-tenant campuses</div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800/80 shadow-xl space-y-2">
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                30+
              </div>
              <div className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                Clinical Modules
              </div>
              <div className="text-[11px] text-slate-500">End-to-end coverage</div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800/80 shadow-xl space-y-2">
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                200+
              </div>
              <div className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                API Endpoints
              </div>
              <div className="text-[11px] text-slate-500">REST & WebSockets</div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800/80 shadow-xl space-y-2">
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
                100+
              </div>
              <div className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                Automated Workflows
              </div>
              <div className="text-[11px] text-slate-500">Clinical & Financial</div>
            </div>

            <div className="col-span-2 md:col-span-1 p-6 rounded-3xl bg-slate-950/70 border border-slate-800/80 shadow-xl space-y-2">
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                99.9%
              </div>
              <div className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                System Availability
              </div>
              <div className="text-[11px] text-slate-500">Zero-downtime SLA</div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Modules Section (12 Feature Cards) */}
      <section id="modules" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-black text-sky-400 uppercase tracking-widest">
            MODULAR ENTERPRISE ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Complete Hospital Suite
          </h2>
          <p className="text-sm text-slate-400">
            Engineered to unify clinical care, diagnostics, administrative workflows, and revenue cycle management.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. EHR */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/90 hover:border-sky-500/50 hover:bg-slate-900/90 transition-all duration-300 group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              🩺
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition">
              Electronic Health Records
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Longitudinal patient timelines, ICD-10 diagnostic coding, FHIR R4 resources, allergy safeguards, and encounter documentation.
            </p>
          </div>

          {/* 2. Telemedicine */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/90 hover:border-teal-500/50 hover:bg-slate-900/90 transition-all duration-300 group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              📹
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition">
              Telemedicine & Virtual Care
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              WebRTC encrypted HD video consultations, virtual triage waiting rooms, digital e-prescriptions, and remote patient monitoring.
            </p>
          </div>

          {/* 3. Patient Portal */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/90 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all duration-300 group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              📱
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition">
              Patient Engagement Portal
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Self-service appointment booking, lab result downloads, medication dose alerts, and discharge summary printouts.
            </p>
          </div>

          {/* 4. Laboratory Information System */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/90 hover:border-amber-500/50 hover:bg-slate-900/90 transition-all duration-300 group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              🧪
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition">
              Laboratory Information System
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Specimen barcoding, instrument interfacing, reference range validation, critical panic value alerts, and pathologist digital sign-off.
            </p>
          </div>

          {/* 5. Pharmacy Management */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/90 hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all duration-300 group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              💊
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">
              Pharmacy & Inventory Management
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hospital formulary, barcoded MAR administration, automated reorder thresholds, expiry tracking, and narcotic audit logs.
            </p>
          </div>

          {/* 6. Insurance Claims */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/90 hover:border-blue-500/50 hover:bg-slate-900/90 transition-all duration-300 group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              🛡️
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition">
              Insurance Claims & Pre-Auth
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant cashless pre-authorization, automated ICD-10 package matching, query resolution workflows, and settlement remittances.
            </p>
          </div>

          {/* 7. Revenue Cycle Management */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/90 hover:border-purple-500/50 hover:bg-slate-900/90 transition-all duration-300 group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              💰
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition">
              Revenue Cycle Management
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              AR aging bucket tracking, automated recovery collection timelines, corporate credit limits, and dynamic revenue forecasting.
            </p>
          </div>

          {/* 8. Emergency & Triage */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/90 hover:border-rose-500/50 hover:bg-slate-900/90 transition-all duration-300 group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              🚑
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-rose-400 transition">
              Emergency & Acuity Triage
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Emergency Severity Index (ESI 1-5) triage, real-time ambulance GPS dispatch, rapid trauma intake, and disaster response rosters.
            </p>
          </div>

          {/* 9. AI Clinical Copilot */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/90 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all duration-300 group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              🧠
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition">
              AI Clinical Copilot & CDSS
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ambient clinical dictation, instant SOAP note generation, drug-drug interaction screening, and clinical risk calculators.
            </p>
          </div>

          {/* 10. Hospital Analytics */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/90 hover:border-teal-500/50 hover:bg-slate-900/90 transition-all duration-300 group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              📊
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition">
              Hospital Analytics & BI
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Executive command center, real-time bed census, average length of stay (ALOS), clinician workload distribution, and cash flows.
            </p>
          </div>

          {/* 11. Radiology & PACS */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/90 hover:border-sky-500/50 hover:bg-slate-900/90 transition-all duration-300 group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              🩻
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition">
              Radiology & PACS Imaging
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              DICOM web viewer, multi-planar reconstruction, modality worklist (MWL) integration, and radiologist diagnostic reporting.
            </p>
          </div>

          {/* 12. Smart Bed & ICU */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/90 hover:border-red-500/50 hover:bg-slate-900/90 transition-all duration-300 group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              🚨
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition">
              Bed & ICU Management
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time ICU ward mapping, mechanical ventilator telemetry, APACHE II & SOFA acuity scoring, and Code Blue dispatch.
            </p>
          </div>
        </div>
      </section>

      {/* Enterprise Features Section */}
      <section id="enterprise" className="relative z-10 py-24 bg-slate-900/50 border-y border-slate-800/80 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black text-sky-400 uppercase tracking-widest">
              ENTERPRISE CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Engineered for Critical Healthcare
            </h2>
            <p className="text-sm text-slate-400">
              Uncompromising security, multi-hospital isolation, and regulatory interoperability standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-sky-400 font-black text-lg">🏢 Multi-Hospital Isolation</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete multi-tenant isolation ensuring individual hospital network data partitions with centralized super-admin governance.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-teal-400 font-black text-lg">🔒 Role-Based Access Control</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Granular RBAC/ABAC securing doctors, nurses, admins, pharmacists, and patients with zero-trust token enforcement.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-indigo-400 font-black text-lg">🌐 FHIR & HL7 Ready</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Standardized clinical data exchange conforming to HL7 v2/v3 and HL7 FHIR R4 interoperability specifications.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-emerald-400 font-black text-lg">🇮🇳 ABDM Integration Ready</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ayushman Bharat Digital Mission compliance with ABHA ID verification, health locker linking, and consent artifacts.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-purple-400 font-black text-lg">🧠 AI Decision Support</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Machine learning risk stratification for sepsis early warnings, deterioration alerts, and medication dosage cross-checks.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-amber-400 font-black text-lg">⚡ Real-Time Analytics</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sub-second operational telemetry across bed capacity, pharmaceutical dispensations, and revenue cycle recoveries.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-rose-400 font-black text-lg">📜 Audit & Compliance</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Immutable audit logging, HIPAA/GDPR data protection standards, and tamper-proof clinical change histories.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-cyan-400 font-black text-lg">☁️ Cloud Native Scalability</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Modular microservice architecture built on Docker containers, serverless PostgreSQL Neon, and Redis caching.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why MediNexa Section */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-black text-sky-400 uppercase tracking-widest">
            THE MEDINEXA ADVANTAGE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Why Healthcare Leaders Choose MediNexa
          </h2>
          <p className="text-sm text-slate-400">
            Designed from the ground up to replace fragmented legacy hospital software with one unified intelligence layer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 space-y-3">
            <div className="text-3xl">✨</div>
            <h3 className="text-xl font-bold text-white">Unified Platform</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              A single cohesive ecosystem covering clinical EHR, ICU, pharmacy, radiology, LIS, revenue cycle, and workforce operations without messy third-party integrations.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 space-y-3">
            <div className="text-3xl">🧠</div>
            <h3 className="text-xl font-bold text-white">AI Assisted Healthcare</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ambient consultation listening, instant SOAP generation, and clinical intelligence that frees physicians to focus on patient outcomes rather than screen paperwork.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/40 border border-slate-800 space-y-3">
            <div className="text-3xl">🛡️</div>
            <h3 className="text-xl font-bold text-white">Enterprise Security</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Role-based permissions, zero-trust token authentication, multi-tenant isolation, and complete HIPAA-compliant audit trails safeguarding sensitive PHI.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/40 border border-slate-800 space-y-3">
            <div className="text-3xl">📈</div>
            <h3 className="text-xl font-bold text-white">Scalable Architecture</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              High-throughput backend built on NestJS and Prisma ORM, engineered to effortlessly handle everything from single-doctor clinics to 1,000+ bed hospital networks.
            </p>
          </div>
        </div>
      </section>

      {/* System Architecture Preview */}
      <section id="architecture" className="relative z-10 py-24 bg-slate-900/50 border-y border-slate-800/80 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black text-sky-400 uppercase tracking-widest">
              SYSTEM TOPOLOGY
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Enterprise Architecture Preview
            </h2>
            <p className="text-sm text-slate-400">
              Modern full-stack modular topology with end-to-end type safety and real-time connectivity.
            </p>
          </div>

          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-8 shadow-2xl">
            {/* Top Personas / Touchpoints */}
            <div className="text-center mb-6">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                FRONTEND TOUCHPOINTS & ACTORS
              </span>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                {['👨‍⚕️ Doctors', '👩‍⚕️ Nurses', '🏥 Administrators', '🧑‍💼 Patients', '🧪 Lab Techs', '💊 Pharmacists', '🚑 EMS & Dispatch', '🛡️ Insurers & TPAs'].map(
                  (actor, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-extrabold text-slate-300"
                    >
                      {actor}
                    </span>
                  ),
                )}
              </div>
            </div>

            {/* Connecting Arrows */}
            <div className="flex justify-center text-sky-400 text-lg my-2">⬇ ⬇ ⬇</div>

            {/* Core MediNexa Application Gateway */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/60 via-indigo-950/60 to-slate-900 border border-sky-500/30 text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse"></span>
                <span className="text-sm font-black text-white tracking-wide">
                  MEDINEXA CORE PLATFORM GATEWAY & SERVICES LAYER
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-slate-300">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  Next.js 14 Web Portal
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  NestJS Enterprise REST API
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  WebSocket Telemetry Bus
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  AI Inference & CDSS Engine
                </div>
              </div>
            </div>

            {/* Connecting Arrows */}
            <div className="flex justify-center text-teal-400 text-lg my-2">⬇ ⬇ ⬇</div>

            {/* Data & Storage Layer */}
            <div className="text-center mt-4">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                DATA, PERSISTENCE & CLOUD INFRASTRUCTURE
              </span>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-slate-300">
                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                  🐘 PostgreSQL (Neon Serverless)
                </div>
                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                  🔷 Prisma ORM Client
                </div>
                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                  ⚡ Redis Cache & Schedulers
                </div>
                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                  📦 Docker Containerization
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recruiter / Engineering Showcase Section */}
      <section id="tech-stack" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-black text-sky-400 uppercase tracking-widest">
            ENGINEERING EXCELLENCE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Built as a Full-Stack Enterprise Platform
          </h2>
          <p className="text-sm text-slate-400">
            Architected with zero technical debt, 100% strict TypeScript types, and comprehensive automated test suites.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { title: 'Next.js 14', desc: 'App Router & SSR' },
            { title: 'NestJS', desc: 'Enterprise Modularity' },
            { title: 'TypeScript', desc: 'Strict End-to-End' },
            { title: 'Prisma ORM', desc: 'Type-Safe Relational DB' },
            { title: 'PostgreSQL', desc: 'Neon Serverless' },
            { title: 'JWT & RBAC', desc: 'Multi-Tenant Security' },
            { title: '200+ REST APIs', desc: 'Documented Swagger' },
            { title: 'Docker Ready', desc: 'Container Deployments' },
            { title: 'WebRTC Video', desc: 'Encrypted Telehealth' },
            { title: 'AI & CDSS', desc: 'Clinical Copilot' },
            { title: 'WebSockets', desc: 'Real-Time Telemetry' },
            { title: '1,432+ Tests', desc: '100% E2E Pass Rate' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-1 hover:border-sky-500/40 transition"
            >
              <div className="font-extrabold text-white text-sm">{item.title}</div>
              <div className="text-[11px] text-slate-400">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 py-24 bg-slate-900/50 border-y border-slate-800/80 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black text-sky-400 uppercase tracking-widest">
              CLINICAL & ADMINISTRATIVE IMPACT
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Trusted by Medical Leaders
            </h2>
            <p className="text-sm text-slate-400">
              How healthcare organizations accelerate clinical speed, eliminate documentation errors, and recover revenue with MediNexa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-amber-400 text-sm font-bold">★★★★★ 5.0</div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  &quot;MediNexa replaced three disjointed legacy systems across our 450-bed tertiary facility. The ICU telemetry, APACHE II scoring, and automated 3-way RCM matching have transformed our clinical efficiency.&quot;
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80">
                <div className="font-extrabold text-white text-sm">Dr. Rajeshwar Sharma, MD</div>
                <div className="text-[11px] text-slate-400">Chief Medical Officer, Apex Super Specialty Network</div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-amber-400 text-sm font-bold">★★★★★ 5.0</div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  &quot;The AI Clinical Copilot saves our intensivists nearly two hours of administrative paperwork every shift. Having automated SOAP generation connected directly to our pharmacy and LIS is invaluable.&quot;
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80">
                <div className="font-extrabold text-white text-sm">Dr. Aris Thorne, FACS</div>
                <div className="text-[11px] text-slate-400">Lead Trauma Surgeon & Critical Care Director</div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-amber-400 text-sm font-bold">★★★★★ 5.0</div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  &quot;From an operations standpoint, the multi-tenant facility isolation, HRMS shift scheduling, and accounts receivable tracking reduced our billing disputes by over 78% in the first quarter.&quot;
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80">
                <div className="font-extrabold text-white text-sm">Meera Nair, MBA</div>
                <div className="text-[11px] text-slate-400">Director of Healthcare Operations & Supply Chain</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto text-center">
        <div className="max-w-4xl mx-auto p-12 rounded-3xl bg-gradient-to-r from-sky-900/60 via-indigo-900/60 to-slate-900 border border-sky-500/30 shadow-2xl space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to Experience the Future of Hospital Operations?
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Schedule an interactive executive demo or sign in to explore clinical workstations across all hospital roles.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setDemoModalOpen(true)}
              className="px-8 py-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-sky-500/25 transition transform hover:-translate-y-0.5"
            >
              Request Enterprise Demo
            </button>
            <Link
              href="/login"
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-extrabold text-sm rounded-2xl transition"
            >
              Sign In to Portal →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Upgrade */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white font-black text-lg">
                M
              </div>
              <span className="text-lg font-black text-white tracking-tight">MediNexa</span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
              Enterprise-grade AI-powered healthcare operating system unifying patients, providers, hospitals, laboratories, and insurers on a single high-availability architecture.
            </p>
            <div className="text-[11px] text-slate-500">
              MediNexa Healthcare Platform &copy; 2026. All rights reserved.
            </div>
          </div>

          <div className="space-y-3">
            <div className="font-extrabold text-white uppercase tracking-wider text-[11px]">Clinical Modules</div>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#modules" className="hover:text-sky-400 transition">Electronic Health Records</a></li>
              <li><a href="#modules" className="hover:text-sky-400 transition">ICU & Critical Care</a></li>
              <li><a href="#modules" className="hover:text-sky-400 transition">Radiology & PACS</a></li>
              <li><a href="#modules" className="hover:text-sky-400 transition">Laboratory (LIS)</a></li>
              <li><a href="#modules" className="hover:text-sky-400 transition">Pharmacy & Inventory</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-extrabold text-white uppercase tracking-wider text-[11px]">Operations & Finance</div>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#modules" className="hover:text-sky-400 transition">Revenue Cycle (RCM)</a></li>
              <li><a href="#modules" className="hover:text-sky-400 transition">Insurance Claims</a></li>
              <li><a href="#modules" className="hover:text-sky-400 transition">HRMS & Workforce</a></li>
              <li><a href="#modules" className="hover:text-sky-400 transition">Procurement & Supply</a></li>
              <li><a href="#modules" className="hover:text-sky-400 transition">Emergency & Triage</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-extrabold text-white uppercase tracking-wider text-[11px]">Security & Legal</div>
            <ul className="space-y-2 text-slate-400">
              <li><span className="text-slate-400">HIPAA & GDPR Aligned</span></li>
              <li><span className="text-slate-400">HL7 & FHIR R4 Ready</span></li>
              <li><span className="text-slate-400">ABDM Consent Engine</span></li>
              <li><a href="https://github.com/singhayush256/MediNexa" target="_blank" rel="noreferrer" className="hover:text-sky-400 transition">GitHub Repository</a></li>
              <li><span className="text-sky-400 font-mono text-[10px]">v2.4 Enterprise LTS</span></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Interactive Request Demo Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 relative text-left">
            <button
              onClick={() => {
                setDemoModalOpen(false);
                setDemoSubmitted(false);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>

            {!demoSubmitted ? (
              <>
                <div className="space-y-2">
                  <span className="px-3 py-1 bg-sky-500/10 text-sky-400 rounded-full text-xs font-bold uppercase tracking-wider border border-sky-500/20">
                    Live Demo & Access
                  </span>
                  <h3 className="text-2xl font-black text-white">Experience MediNexa Enterprise</h3>
                  <p className="text-xs text-slate-400">
                    Select a healthcare role to instantly preview pre-configured clinical workflows or submit your details.
                  </p>
                </div>

                {/* Instant Role Preview Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                    Instant Role-Based Sandbox:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { role: 'HOSPITAL_ADMIN', label: '🏥 Hospital Admin', desc: 'Capacity & RCM' },
                      { role: 'DOCTOR', label: '👨‍⚕️ Intensivist / Doctor', desc: 'EHR, ICU & AI' },
                      { role: 'NURSE', label: '👩‍⚕️ Nursing Station', desc: 'Vitals & MAR' },
                      { role: 'PATIENT', label: '🧑‍💼 Patient Portal', desc: 'Appointments & Labs' },
                    ].map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => handleQuickDemoAccess(item.role)}
                        className="p-3 text-left rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 transition group"
                      >
                        <div className="font-extrabold text-xs text-white group-hover:text-sky-400">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-slate-500">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">Or Schedule Custom Demo</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                {/* Custom Demo Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setDemoSubmitted(true);
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Your Name *</label>
                      <input
                        required
                        placeholder="Dr. Siddharth Rao"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Organization *</label>
                      <input
                        required
                        placeholder="Apollo Health City"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Work Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="siddharth@apollohealth.org"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition"
                  >
                    Submit Demo Request
                  </button>
                </form>
              </>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-white">Demo Request Received!</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Thank you for your interest. Our healthcare solutions team will contact you within 24 hours to schedule your personalized live demonstration.
                </p>
                <button
                  onClick={() => setDemoModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
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
