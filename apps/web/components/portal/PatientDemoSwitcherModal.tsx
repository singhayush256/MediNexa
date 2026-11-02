'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HeartPulse,
  Activity,
  User,
  ShieldCheck,
  Stethoscope,
  Building2,
  Calendar,
  Pill,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  DEMO_PATIENT_ACCOUNTS,
  DemoPatientAccount,
  activateDemoPatientSession,
  getCleanPatientSession,
} from '@/lib/demo-patients';

interface PatientDemoSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export function PatientDemoSwitcherModal({
  isOpen,
  onClose,
  title = 'Select Demo Patient Account',
  subtitle = 'Choose from 10 verified clinical patient personas to launch and explore the Patient Health OS.',
}: PatientDemoSwitcherModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeUhid, setActiveUhid] = useState<string>('');
  const [launchingId, setLaunchingId] = useState<string | null>(null);

  // Sync currently active UHID
  useEffect(() => {
    if (isOpen) {
      const activeSession = getCleanPatientSession();
      setActiveUhid(activeSession.uhid || '');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const categories = useMemo(() => {
    return [
      { id: 'ALL', label: 'All Patients', count: DEMO_PATIENT_ACCOUNTS.length },
      { id: 'Cardiology', label: 'Cardiology', count: 1 },
      { id: 'Maternity', label: 'Maternity', count: 1 },
      { id: 'Diabetes & Endo', label: 'Diabetes', count: 1 },
      { id: 'Orthopedics', label: 'Orthopedics', count: 1 },
      { id: 'Nephrology', label: 'Nephrology', count: 1 },
      { id: 'Pulmonology', label: 'Pulmonology', count: 1 },
      { id: 'Gastroenterology', label: 'Gastro', count: 1 },
      { id: 'Geriatric Care', label: 'Geriatric', count: 1 },
      { id: 'Sports Medicine', label: 'Sports', count: 1 },
      { id: 'Endocrinology & Wellness', label: 'Wellness', count: 1 },
    ];
  }, []);

  const filteredPatients = useMemo(() => {
    return DEMO_PATIENT_ACCOUNTS.filter((p) => {
      const matchesCategory =
        selectedCategory === 'ALL' || p.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.uhid.toLowerCase().includes(q) ||
        p.condition.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.attendingDoctor.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleSelectPatient = (patient: DemoPatientAccount) => {
    setLaunchingId(patient.id);
    // Small delay to allow micro-animation before navigating
    setTimeout(() => {
      activateDemoPatientSession(patient, true);
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden font-sans"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-indigo-500/10 dark:from-teal-950/40 dark:via-blue-950/40 dark:to-indigo-950/40 border-b border-slate-200 dark:border-slate-800 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              10 Clinical Demo Personas
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold hidden sm:inline-block">
              Zero Login Required • Instant 1-Click Launch
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {subtitle}
          </p>

          {/* Quick Launch Default Patient Strip */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-extrabold text-xs">
                AS
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Quick Start: Default Patient (Ayush Singh)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  AYU-4826-KM • Post-Angioplasty Rehab • Cardiology
                </div>
              </div>
            </div>
            <button
              onClick={() => handleSelectPatient(DEMO_PATIENT_ACCOUNTS[0])}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer hover:-translate-y-0.5"
            >
              <span>Launch Default Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, UHID, condition (e.g. Asthma, Maternity, Cardiac), or doctor..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Patient Accounts Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>
              Showing {filteredPatients.length} of {DEMO_PATIENT_ACCOUNTS.length} Verified Patient Accounts
            </span>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
              Click any card to open their personal dashboard
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredPatients.map((patient) => {
              const isActive = activeUhid === patient.uhid;
              const isLaunching = launchingId === patient.id;

              return (
                <div
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className={`group relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-teal-50/60 dark:bg-teal-950/20 border-teal-500/60 shadow-sm ring-1 ring-teal-500/40'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-750 hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Top Row: Avatar, Name, UHID, Active Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${patient.avatarBg} text-white font-extrabold text-base flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform`}
                        >
                          {patient.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                              {patient.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {patient.age} Yrs • {patient.gender} • {patient.bloodGroup}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                              {patient.uhid}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {patient.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isActive && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Current Active
                        </span>
                      )}
                    </div>

                    {/* Condition & Clinical Status */}
                    <div className="mt-3.5 space-y-1.5">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {patient.condition}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {patient.overviewSnippet}
                      </div>
                    </div>

                    {/* Live Bedside Vitals Telemetry Preview */}
                    <div className="mt-3.5 grid grid-cols-4 gap-1.5 text-center">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                        <div className="text-[9px] uppercase font-bold text-slate-400">BP</div>
                        <div className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                          {patient.vitals.bloodPressure.split(' ')[0]}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                        <div className="text-[9px] uppercase font-bold text-slate-400">Pulse</div>
                        <div className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                          {patient.vitals.heartRate}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                        <div className="text-[9px] uppercase font-bold text-slate-400">SpO2</div>
                        <div className="text-[11px] font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
                          {patient.vitals.spO2}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                        <div className="text-[9px] uppercase font-bold text-slate-400">Temp</div>
                        <div className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                          {patient.vitals.temperature}
                        </div>
                      </div>
                    </div>

                    {/* Attending Doctor */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 truncate mr-2">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{patient.attendingDoctor}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                        Score: {patient.healthScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-750 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {patient.sampleMedicines.length} Prescribed Meds • Telemetry Active
                    </span>
                    <button
                      type="button"
                      disabled={isLaunching}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                        isLaunching
                          ? 'bg-teal-700 text-white animate-pulse'
                          : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 shadow-xs group-hover:bg-teal-600 dark:group-hover:bg-teal-500 dark:group-hover:text-white'
                      }`}
                    >
                      {isLaunching ? (
                        <span>Launching...</span>
                      ) : (
                        <>
                          <span>Open Dashboard</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPatients.length === 0 && (
            <div className="p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-750">
              <Search className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No patient personas matched &ldquo;{searchQuery}&rdquo;
              </div>
              <p className="text-xs text-slate-500">
                Try searching for a different condition, department, or reset filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Each demo profile initializes dedicated real-time telemetry, medication reminders, and vitals.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
