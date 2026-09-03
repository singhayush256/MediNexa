'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Bed,
  Calendar,
  CreditCard,
  FlaskConical,
  Pill,
  Shield,
  Activity,
  HeartPulse,
  Video,
  Bot,
  Layers,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Lock,
  Sparkles,
  ChevronRight,
  Play,
  X,
  Stethoscope,
  TrendingUp,
  FileText,
  Clock,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Fast sandbox login for recruiters & hospital reviewers
  const handleSandboxLogin = (email: string) => {
    // Generate simulated guest access
    const mockToken = 'mock_sandbox_jwt_token_' + Date.now();
    const mockUser = {
      id: 'demo_user_1',
      email,
      firstName: email.split('.')[0] || 'Hospital',
      lastName: 'Leader',
      roleCode: email.includes('admin')
        ? 'HOSPITAL_ADMIN'
        : email.includes('doc')
        ? 'DOCTOR'
        : email.includes('nurse')
        ? 'NURSE'
        : 'PATIENT',
    };

    localStorage.setItem('medinexa_token', mockToken);
    localStorage.setItem('token', mockToken);
    localStorage.setItem('medinexa_user', JSON.stringify(mockUser));
    document.cookie = `medinexa_token=${mockToken}; path=/; max-age=86400; SameSite=Lax`;

    if (mockUser.roleCode === 'PATIENT') {
      router.push('/portal');
    } else {
      router.push('/dashboard');
    }
  };

  const coreModules = [
    { title: 'Patient Management', desc: 'Holistic 360° longitudinal EHR, demographics, biometric allergies, and insurance profiles.', icon: <Users className="w-5 h-5 text-blue-500" /> },
    { title: 'Appointments & Scheduling', desc: 'Smart slot orchestration, doctor schedule optimization, and real-time wait times.', icon: <Calendar className="w-5 h-5 text-cyan-500" /> },
    { title: 'Outpatient Department (OPD)', desc: 'Rapid intake, doctor queue management, vitals screening, and clinical summaries.', icon: <Stethoscope className="w-5 h-5 text-emerald-500" /> },
    { title: 'Inpatient Department (IPD)', desc: 'Ward capacity tracking, bed reservation matrix, transfers, and discharge orchestration.', icon: <Bed className="w-5 h-5 text-purple-500" /> },
    { title: 'Emergency Room & Trauma', desc: 'ESI triage protocols, acute cardiac alerts, trauma bay allocations, and STAT orders.', icon: <Activity className="w-5 h-5 text-rose-500" /> },
    { title: 'Laboratory & Diagnostics', desc: 'Barcoded specimen accessioning, automated analyzer interfaces, and panic alerts.', icon: <FlaskConical className="w-5 h-5 text-teal-500" /> },
    { title: 'Pharmacy & Formularies', desc: 'Real-time drug stock, near-expiry batch quarantine, and automated interaction checks.', icon: <Pill className="w-5 h-5 text-indigo-500" /> },
    { title: 'Insurance Claims & TPA', desc: 'EDI 837 claim filing, real-time pre-authorizations, adjudication, and settlement aging.', icon: <Shield className="w-5 h-5 text-blue-600" /> },
    { title: 'Billing & Revenue Cycle', desc: 'Itemized charge capture, insurance copays, automated invoicing, and reconciliation.', icon: <CreditCard className="w-5 h-5 text-emerald-600" /> },
    { title: 'Telemedicine Virtual Suite', desc: 'HD WebRTC encrypted video visits, in-call vitals telemetry, and digital prescriptions.', icon: <Video className="w-5 h-5 text-purple-600" /> },
    { title: 'Clinical AI Assistant', desc: 'Ambient SOAP note transcription, CDS drug-drug screening, and predictive bed census.', icon: <Bot className="w-5 h-5 text-cyan-600" /> },
    { title: 'Operational Analytics', desc: 'Executive KPI telemetry, doctor productivity, bed turnover, and financial forecasting.', icon: <TrendingUp className="w-5 h-5 text-amber-500" /> },
  ];

  const workstationTabs = [
    {
      id: 'command-center',
      label: 'Command Center',
      tag: 'Hospital Operations',
      headline: 'Real-time executive situational awareness across every department.',
      metrics: [
        { label: 'Bed Occupancy', val: '86.4%' },
        { label: 'Avg Triage Wait', val: '7.8 mins' },
        { label: 'Claims Clean-Rate', val: '94.2%' },
      ],
      previewPoints: [
        'Live emergency and inpatient ward census synchronization',
        'Automatic hospital-wide bottleneck alerting and escalation triggers',
        'Financial revenue cycle telemetry integrated directly with payer EDI channels',
      ],
    },
    {
      id: 'clinical-workstation',
      label: 'Doctor Workstation',
      tag: 'Clinical Care',
      headline: 'Frictionless clinical documentation with ambient decision intelligence.',
      metrics: [
        { label: 'SOAP Note Speed', val: '2.5x faster' },
        { label: 'Diagnostic Accuracy', val: '99.8%' },
        { label: 'Queue Throughput', val: '+28%' },
      ],
      previewPoints: [
        'Integrated patient 360 view with timeline of encounters and lab trends',
        'One-click e-Prescriptions with master formulary and allergy cross-checking',
        'Instant clinical copilot for ICD-10 suggestions and differential diagnosis',
      ],
    },
    {
      id: 'diagnostic-lab',
      label: 'Diagnostic Lab',
      tag: 'Pathology & Imaging',
      headline: 'Automated sample pipeline with sub-30-minute critical turnaround.',
      metrics: [
        { label: 'STAT TAT', val: '26 mins' },
        { label: 'Analyzer Uptime', val: '99.9%' },
        { label: 'Auto-Verification', val: '84.0%' },
      ],
      previewPoints: [
        'End-to-end barcoded specimen intake and bidirectional analyzer interfacing',
        'Automated critical panic value notification direct to attending physician mobile',
        'Digital pathology report generation with normal reference interval meters',
      ],
    },
    {
      id: 'patient-portal',
      label: 'Patient Portal',
      tag: 'Digital Front Door',
      headline: 'Modern 24/7 self-service portal empowering patients and families.',
      metrics: [
        { label: 'Patient Adoption', val: '91.2%' },
        { label: 'Telehealth Rating', val: '4.9 / 5' },
        { label: 'Online Bill Pay', val: '78.5%' },
      ],
      previewPoints: [
        'Instant doctor consultation booking with interactive slot calendars',
        'Complete personal medical record, immunization, and lab report downloads',
        'HD encrypted video telemedicine waiting room and online bill payment',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm shadow-blue-600/20">
              M
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-950 dark:text-white">
                MediNexa
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold ml-1.5 px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900">
                HEALTHCARE OS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <a href="#problems" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Problems We Solve
            </a>
            <a href="#modules" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Platform Modules
            </a>
            <a href="#workstations" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Workstations
            </a>
            <a href="#security" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Compliance & Security
            </a>
            <a href="#benefits" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Hospital ROI
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setDemoModalOpen(true)}
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Live Demo
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-200 dark:border-slate-800/80">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Healthcare SaaS Infrastructure</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight leading-[1.15]">
            Connected Healthcare Platform <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 dark:from-blue-400 dark:via-cyan-300 dark:to-indigo-400">
              for Modern Hospitals
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            MediNexa unifies patient care, operations, diagnostics, pharmacy, billing, telemedicine and AI into one intelligent healthcare ecosystem.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setDemoModalOpen(true)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Request Demo
            </Button>
            <Link href="/auth/register">
              <Button variant="outline" size="lg">
                Book Consultation
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setVideoModalOpen(true)}
              icon={<Play className="w-4 h-4 fill-current" />}
            >
              Watch Platform Tour
            </Button>
          </div>

          {/* Quick Metrics */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle text-center">
              <div className="text-xl font-black text-slate-950 dark:text-white">12 Modules</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Unified System</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle text-center">
              <div className="text-xl font-black text-blue-600 dark:text-blue-400">Sub-30m</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Diagnostic TAT</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle text-center">
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">94.2%</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Clean Claims Rate</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle text-center">
              <div className="text-xl font-black text-purple-600 dark:text-purple-400">HIPAA & ABDM</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Milestone Compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems We Solve */}
      <section id="problems" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Pain Points Addressed
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Healthcare Software Was Broken. <br />
            MediNexa Solves the Core Fractures.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Hospitals struggle with disconnected point solutions that lead to physician burnout, clinical errors, and revenue leakage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 font-bold">
              ✕
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Fragmented EHR & Island Data</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Clinicians waste 40% of their workday re-entering data between labs, radiology, and pharmacy. MediNexa connects every department to a single longitudinal clinical core.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 font-bold">
              ✕
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Billing Delays & Claim Denials</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Manual coding and late insurance verification cause up to 15% revenue loss. MediNexa automates pre-authorization and EDI 837 claim batching with 94.2% clean first-pass rate.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 font-bold">
              ✕
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Emergency & Ward Blind Spots</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Unpredictable bed occupancy causes ambulance diversions and delayed triage. Our predictive command center forecasts ward capacity and streamlines inpatient flow.
            </p>
          </div>
        </div>
      </section>

      {/* Platform Modules Grid */}
      <section id="modules" className="py-20 bg-slate-50 dark:bg-slate-950/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Complete Hospital Stack
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              12 Integrated Modules. One Unified Ecosystem.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Built as a cohesive modular platform where every order, diagnosis, and prescription flows seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {coreModules.map((mod, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all hover:shadow-card-hover group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
                  {mod.icon}
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {mod.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-normal">
                  {mod.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Workstations Showcase */}
      <section id="workstations" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Role-Optimized Workstations
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Engineered Specifically for Every Healthcare Role
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Tailored user experiences designed for speed, clarity, and zero cognitive overload.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center">
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-subtle overflow-x-auto max-w-full">
            {workstationTabs.map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === idx
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Preview */}
        {workstationTabs[activeTab] && (
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 tracking-wider">
                {workstationTabs[activeTab].tag}
              </span>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-snug">
                {workstationTabs[activeTab].headline}
              </h3>

              <div className="space-y-3">
                {workstationTabs[activeTab].previewPoints.map((point, pIdx) => (
                  <div key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setDemoModalOpen(true)}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Explore {workstationTabs[activeTab].label}
                </Button>
              </div>
            </div>

            {/* Metrics Snapshot Card */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-6">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Measurable Impact Metrics
              </div>

              <div className="grid grid-cols-3 gap-4">
                {workstationTabs[activeTab].metrics.map((m, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                      {m.val}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-300 font-medium">
                💡 All workstation workflows operate with sub-second latency and zero double-entry requirement.
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Security & Compliance */}
      <section id="security" className="py-20 bg-slate-50 dark:bg-slate-950/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Enterprise Security
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Hospital-Grade Data Protection & Compliance
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Security is architected into the bedrock of MediNexa, from multi-tenant data partitioning to audit trails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">HIPAA & GDPR Aligned</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Role-based access controls (RBAC) ensure staff view only the PHI necessary for active clinical encounters.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">256-Bit Cryptography</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                TLS 1.3 in-transit encryption and AES-256 at-rest database column hashing for patient identifiers.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center text-cyan-600">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Immutable Audit Logs</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Every chart access, medication change, and payment transaction creates a cryptographically verified audit record.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Multi-Tenant Isolation</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Strict facility-level data boundaries guarantee hospital networks and clinics maintain complete privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Benefits (ROI) */}
      <section id="benefits" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Executive Value
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Quantifiable Outcomes for Hospital Leadership
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Designed to produce rapid operational ROI from the first month of deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 font-extrabold shrink-0">
              CMO
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">For Chief Medical Officers</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Slash physician charting fatigue with ambient documentation, standardize evidence-based sepsis and triage protocols, and eliminate medication cross-reactivity errors.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 font-extrabold shrink-0">
              CFO
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">For Chief Financial Officers</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Accelerate insurance claim adjudication from weeks to hours, prevent unbilled consumable leakage, and optimize drug inventory holding costs with JIT procurement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 sm:p-12 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-2xl text-center space-y-6 relative overflow-hidden">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Modernize Your Hospital Operations?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
            Schedule a customized platform demonstration or launch our interactive multi-role sandbox instantly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setDemoModalOpen(true)}
              className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg"
            >
              Launch Sandbox Experience
            </Button>
            <Link href="/auth/register">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                Create Organization Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              M
            </div>
            <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
              MediNexa Health Inc.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <a href="#modules" className="hover:underline">Platform Modules</a>
            <a href="#security" className="hover:underline">Security</a>
            <Link href="/portal" className="hover:underline">Patient Portal</Link>
            <Link href="/login" className="hover:underline">Staff Login</Link>
            <Link href="/auth/register" className="hover:underline">Register</Link>
          </div>

          <div className="text-xs text-slate-400">
            © {new Date().getFullYear()} MediNexa. Production Healthcare Platform.
          </div>
        </div>
      </footer>

      {/* Interactive Sandbox & Demo Access Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setDemoModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-modal z-10 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                  INSTANT SANDBOX ACCESS
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
                  Select a Hospital Role Perspective
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Experience MediNexa from any healthcare persona with 1-click test credentials:
                </p>
              </div>
              <button
                onClick={() => setDemoModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => handleSandboxLogin('admin.hospa@medinexa.local')}
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                    ADM
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">Hospital Administrator</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Command Center, Census, Billing & Analytics</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => handleSandboxLogin('doc.smith@medinexa.local')}
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    DOC
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">Attending Physician / Doctor</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Patient Queue, Encounters, SOAP Copilot</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => handleSandboxLogin('nurse.miller@medinexa.local')}
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                    NRS
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">Ward & Inpatient Nurse</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">MAR Administration, Vitals Queue, Handover</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => handleSandboxLogin('patient.doe@medinexa.local')}
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
                    PAT
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">Patient 24/7 Portal</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Appointments, Medical Records, Prescriptions</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Platform Tour Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setVideoModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-modal z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                MediNexa Platform Architecture Overview
              </h3>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video rounded-2xl bg-slate-950 flex flex-col items-center justify-center text-center p-8 text-white space-y-3">
              <div className="w-14 h-14 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center">
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </div>
              <h4 className="font-bold text-sm">Interactive Product Walkthrough Active</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Explore the live platform directly using the interactive sandbox switcher.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setVideoModalOpen(false);
                  setDemoModalOpen(true);
                }}
              >
                Open Live Interactive Sandbox
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
