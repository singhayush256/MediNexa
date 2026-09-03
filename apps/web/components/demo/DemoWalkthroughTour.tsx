'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  UserPlus,
  Calendar,
  Stethoscope,
  FlaskConical,
  Pill,
  CreditCard,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Users,
  Eye,
  Minimize2,
  Maximize2,
} from 'lucide-react';

export interface WalkthroughStep {
  id: string;
  number: number;
  title: string;
  category: string;
  description: string;
  roleRecommended: string;
  roleEmail: string;
  primaryActionUrl: string;
  highlights: string[];
  icon: React.ReactNode;
}

export const DEMO_STEPS: WalkthroughStep[] = [
  {
    id: 'registration',
    number: 1,
    title: 'Patient Registration',
    category: 'Intake & KYC',
    description:
      'Seamless Indian citizen intake with default +91 country code, phone validation, demographics, and unique Hospital Health ID (UHID) generation.',
    roleRecommended: 'Receptionist / Front Desk',
    roleEmail: 'receptionist.01@medinexa.in',
    primaryActionUrl: '/auth/register',
    highlights: [
      'Country code dropdown defaulting to +91 (India 🇮🇳)',
      '10-digit mobile verification & email validation',
      'Role assignment (Patient, Doctor, Nurse, Staff)',
      'Instant UHID generation for longitudinal EHR',
    ],
    icon: <UserPlus className="w-5 h-5 text-blue-500" />,
  },
  {
    id: 'appointment',
    number: 2,
    title: 'Appointment Scheduling',
    category: 'Outpatient (OPD)',
    description:
      'Explore doctor schedules across 8 medical specialties with transactional slot concurrency locking that eliminates duplicate bookings.',
    roleRecommended: 'Patient / Receptionist',
    roleEmail: 'patient@medinexa.in',
    primaryActionUrl: '/portal/appointments',
    highlights: [
      '8 clinical specialties (Cardiology, Neurology, etc.)',
      '30-minute OPD consultation time slots',
      'Live database concurrency check (prevents double-booking)',
      'Instant SMS/Email appointment token generation',
    ],
    icon: <Calendar className="w-5 h-5 text-purple-500" />,
  },
  {
    id: 'consultation',
    number: 3,
    title: 'Clinical Consultation',
    category: 'Doctor Workstation',
    description:
      'Senior consultant workstation featuring live queue triage, patient clinical history, vitals recording, SOAP notes, and electronic prescriptions.',
    roleRecommended: 'Doctor (Dr. Arvind Deshmukh)',
    roleEmail: 'dr.deshmukh@medinexa.in',
    primaryActionUrl: '/dashboard/doctor-appointments',
    highlights: [
      'Real-time doctor OPD consultation queue',
      'Patient vitals (BP, Pulse, RR, Temp, SpO2)',
      'Clinical SOAP note synthesis & diagnoses',
      'Electronic prescriptions with Indian brand dosages',
    ],
    icon: <Stethoscope className="w-5 h-5 text-emerald-500" />,
  },
  {
    id: 'laboratory',
    number: 4,
    title: 'Laboratory Diagnostics',
    category: 'Pathology & Testing',
    description:
      'Statutory diagnostic test queue with biological reference intervals, specimen status verification, and publication-ready NABL vector PDF export.',
    roleRecommended: 'Lab Technician',
    roleEmail: 'lab.01@medinexa.in',
    primaryActionUrl: '/dashboard/lab',
    highlights: [
      '6 diagnostic panels (CBC, Blood Sugar, LFT, KFT, Thyroid, Urine)',
      'Automatic biological reference range interval checks',
      'Sample collection & verification timestamps',
      '1-click NABL-compliant vector PDF test reports',
    ],
    icon: <FlaskConical className="w-5 h-5 text-teal-500" />,
  },
  {
    id: 'pharmacy',
    number: 5,
    title: 'Pharmacy & Dispensing',
    category: 'Inventory & Formularies',
    description:
      'Comprehensive hospital formulary stocking Indian brands (Dolo 650, Pan 40, Augmentin), FEFO batch tracking, expiry date alerts, and dispensing.',
    roleRecommended: 'Pharmacist',
    roleEmail: 'pharmacy.01@medinexa.in',
    primaryActionUrl: '/dashboard/pharmacy',
    highlights: [
      '10 pre-stocked Indian medicine formulations',
      'Batch number & FEFO/FIFO expiry date tracking',
      'Prescription fulfillment with automated stock decrement',
      'Supplier purchase orders & procurement audit trail',
    ],
    icon: <Pill className="w-5 h-5 text-indigo-500" />,
  },
  {
    id: 'billing',
    number: 6,
    title: 'Hospital Billing & GST',
    category: 'Revenue Cycle Management',
    description:
      'Statutory medical invoicing covering OPD consultations (SAC 999311), IPD bed/procedure charges (SAC 999312), and 12% GST medicine invoices.',
    roleRecommended: 'Hospital Admin / Billing Officer',
    roleEmail: 'admin@medinexa.in',
    primaryActionUrl: '/dashboard/billing',
    highlights: [
      'Healthcare GST exemptions (SAC 999311/12/16)',
      'Statutory 12% GST on medicines (CGST 6% + SGST 6% under HSN 3004)',
      'Multi-method payment capture (UPI, Cards, Cash)',
      'Official statutory GST Tax Invoice PDF generation',
    ],
    icon: <CreditCard className="w-5 h-5 text-amber-500" />,
  },
  {
    id: 'insurance',
    number: 7,
    title: 'TPA Health Insurance',
    category: 'Claims Pre-Authorization',
    description:
      'Cashless hospital admission desk and reimbursement claims tracking with major Indian insurers (Star Health, HDFC ERGO, ICICI Lombard, Care Health).',
    roleRecommended: 'Hospital Admin / Claims Manager',
    roleEmail: 'admin@medinexa.in',
    primaryActionUrl: '/dashboard/insurance',
    highlights: [
      '5 major Indian insurance providers configured',
      'Cashless pre-auth and reimbursement claims',
      'Full lifecycle tracking (Draft → Submitted → Approved → Settled)',
      'Direct link to itemized inpatient admission invoices',
    ],
    icon: <ShieldCheck className="w-5 h-5 text-rose-500" />,
  },
];

export function DemoWalkthroughTour() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [switchingRole, setSwitchingRole] = useState(false);

  useEffect(() => {
    // Check if demo tour should auto-open on first visit
    const seen = localStorage.getItem('medinexa_demo_tour_seen');
    const demoMode = localStorage.getItem('medinexa_demo_mode');
    if (!seen && demoMode === 'true') {
      setIsOpen(true);
    }

    // Listen for custom trigger event
    const handleTrigger = (e: any) => {
      setIsOpen(true);
      setIsMinimized(false);
      if (e.detail?.stepIndex !== undefined) {
        setCurrentStepIndex(e.detail.stepIndex);
      }
    };

    window.addEventListener('open-demo-tour', handleTrigger);
    return () => window.removeEventListener('open-demo-tour', handleTrigger);
  }, []);

  const currentStep = DEMO_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSwitchAndGo = async (email: string, targetUrl: string) => {
    setSwitchingRole(true);
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
        router.push(targetUrl);
      } else {
        router.push(targetUrl);
      }
    } catch (e) {
      router.push(targetUrl);
    } finally {
      setSwitchingRole(false);
    }
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 text-xs font-extrabold transition cursor-pointer animate-bounce"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Resume Demo Tour ({currentStepIndex + 1}/7)</span>
          <Maximize2 className="w-3.5 h-3.5 opacity-70" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-lg transition-all animate-in fade-in slide-in-from-bottom-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden font-sans text-slate-900 dark:text-slate-100 flex flex-col">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-xl text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-blue-200">
                Hospital Evaluator & Recruiter Walkthrough
              </div>
              <div className="text-sm font-extrabold flex items-center gap-2">
                <span>Step {currentStep.number} of {DEMO_STEPS.length}: {currentStep.title}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
              title="Minimize Tour"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                localStorage.setItem('medinexa_demo_tour_seen', 'true');
              }}
              className="p-1.5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
              title="Close Tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="px-5 pt-3 pb-1 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 overflow-x-auto">
          {DEMO_STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-1.5 flex-1 rounded-full transition-all cursor-pointer ${
                idx === currentStepIndex
                  ? 'bg-blue-600 dark:bg-blue-500'
                  : idx < currentStepIndex
                  ? 'bg-emerald-500'
                  : 'bg-slate-200 dark:bg-slate-800'
              }`}
              title={`Step ${step.number}: ${step.title}`}
            />
          ))}
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-2xl border border-blue-100 dark:border-blue-900/50 flex-shrink-0">
              {currentStep.icon}
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  {currentStep.category}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Role: <strong className="text-slate-800 dark:text-slate-200">{currentStep.roleRecommended}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Key Capabilities Checklist */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-1.5">
            <div className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Verified Capabilities in this Workflow:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {currentStep.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="truncate">{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentStepIndex === DEMO_STEPS.length - 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              title="Next Step"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSwitchAndGo(currentStep.roleEmail, currentStep.primaryActionUrl)}
              disabled={switchingRole}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {switchingRole ? (
                <span>Switching to {currentStep.roleRecommended}...</span>
              ) : (
                <>
                  <span>Explore Live ({currentStep.title})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
