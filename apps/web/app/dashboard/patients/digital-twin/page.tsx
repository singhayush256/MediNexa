'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Activity,
  HeartPulse,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Pill,
  FileText,
  AlertTriangle,
  Clock,
  ChevronRight,
  RefreshCw,
  Building2,
  Syringe,
  Scissors,
  CheckCircle2,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, StatCard } from '@/components/ui';

interface DigitalTwinData {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  abhaId: string;
  insurancePolicy: string;
  healthScore: number;
  tier: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  vitals: {
    hr: number;
    sys: number;
    dia: number;
    spo2: number;
    temp: number;
    glucose: number;
    bmi: number;
  };
  chronicDiseases: string[];
  allergies: string[];
  surgeries: string[];
  vaccinations: string[];
  activePrescriptions: Array<{ name: string; dose: string; freq: string }>;
  hospitalVisits: Array<{ date: string; facility: string; type: string; summary: string }>;
  guardian: { name: string; relation: string; phone: string };
  familyDoctor: { name: string; hospital: string; phone: string };
  aiRiskSummary: string;
}

const DEMO_TWIN: DigitalTwinData = {
  id: 'pat-demo-001',
  name: 'Eleanor Vance',
  age: 68,
  gender: 'Female',
  bloodGroup: 'B Positive (B+)',
  abhaId: '91-4829-1039-4920',
  insurancePolicy: 'Star Health Comprehensive #SH-2024-948201',
  healthScore: 84.5,
  tier: 'GREEN',
  vitals: {
    hr: 74,
    sys: 122,
    dia: 78,
    spo2: 98,
    temp: 98.6,
    glucose: 98,
    bmi: 23.4,
  },
  chronicDiseases: ['Essential Hypertension (Stage 2, Controlled)', 'Type 2 Diabetes Mellitus (HbA1c 6.8%)'],
  allergies: ['Penicillin (Moderate Urticaria)', 'Sulfa Drugs (Mild Erythema)'],
  surgeries: ['Laparoscopic Cholecystectomy (2019, MediNexa General)', 'Cataract Phacoemulsification Right Eye (2022)'],
  vaccinations: ['COVID-19 Booster (Covishield / Pfizer)', 'Annual Influenza Trivalent', 'Pneumococcal PCV-13'],
  activePrescriptions: [
    { name: 'Metformin HCl', dose: '500 mg', freq: 'Twice daily with meals' },
    { name: 'Atorvastatin Calcium', dose: '20 mg', freq: 'Once daily at bedtime' },
    { name: 'Amlodipine Besylate', dose: '5 mg', freq: 'Once daily in the morning' },
  ],
  hospitalVisits: [
    { date: '12 Sep 2026', facility: 'MediNexa Central Hospital', type: 'Outpatient Follow-up', summary: 'Routine diabetic check-up and BP telemetry confirmation.' },
    { date: '28 Jul 2026', facility: 'MediNexa Speciality Care', type: 'Diagnostic Lab', summary: 'Complete metabolic panel and fasting lipid profile.' },
    { date: '14 Jan 2026', facility: 'MediNexa Emergency Care', type: 'Observation', summary: 'Mild dizziness; orthostatic hypotension resolved with oral rehydration.' },
  ],
  guardian: {
    name: 'Thomas Vance',
    relation: 'Son & Legal Healthcare Proxy',
    phone: '+91 98765 43211',
  },
  familyDoctor: {
    name: 'Dr. Anand Verma, MD',
    hospital: 'Verma Family Clinic & MediNexa Affiliate',
    phone: '+91 98111 22233',
  },
  aiRiskSummary: 'Cardiovascular parameters stable. Moderate 30-day readmission risk due to polypharmacy. Regular glycemic follow-up recommended.',
};

export default function PatientDigitalTwinPage() {
  const [twin, setTwin] = useState<DigitalTwinData>(DEMO_TWIN);
  const [selectedPatientId, setSelectedPatientId] = useState('pat-demo-001');
  const [activeSection, setActiveSection] = useState<'OVERVIEW' | 'EMR' | 'PREDICTIONS' | 'SURGERIES'>('OVERVIEW');
  const [loading, setLoading] = useState(false);

  const [patients, setPatients] = useState<Array<{ id: string; name: string }>>([
    { id: 'pat-demo-001', name: 'Eleanor Vance (Age 68)' },
    { id: 'pat-demo-002', name: 'Marcus Sterling (Age 72, ICU)' },
    { id: 'pat-demo-003', name: 'Sarah Jenkins (Age 54)' },
    { id: 'pat-demo-004', name: 'Rajesh Sharma (Age 46)' },
  ]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const handlePatientChange = (id: string) => {
    setSelectedPatientId(id);
    if (id === 'pat-demo-002') {
      setTwin({
        ...DEMO_TWIN,
        id: 'pat-demo-002',
        name: 'Marcus Sterling',
        age: 72,
        gender: 'Male',
        bloodGroup: 'O Positive (O+)',
        abhaId: '91-1029-4820-5829',
        insurancePolicy: 'Max Bupa Health Companion #MB-82910',
        healthScore: 36.5,
        tier: 'RED',
        vitals: { hr: 118, sys: 162, dia: 98, spo2: 89, temp: 101.4, glucose: 186, bmi: 28.5 },
        chronicDiseases: ['COPD Gold Stage III', 'Atrial Fibrillation', 'Coronary Artery Disease'],
        allergies: ['Aspirin (Asthma exacerbation)', 'NSAIDs'],
        surgeries: ['CABG x 3 Vessels (2017, Apollo Chennai)', 'Right Knee Arthroscopy (2021)'],
        activePrescriptions: [
          { name: 'Tiotropium Bromide Respimat', dose: '2.5 mcg', freq: '2 puffs daily' },
          { name: 'Warfarin Sodium', dose: '4 mg', freq: 'Once daily evening (INR titrated)' },
          { name: 'Furosemide', dose: '40 mg', freq: 'Once daily morning' },
        ],
        guardian: { name: 'Helena Sterling', relation: 'Spouse', phone: '+91 98765 43222' },
        familyDoctor: { name: 'Dr. Priya Nambiar, MD', hospital: 'MediNexa Pulmonary Center', phone: '+91 98222 33344' },
        aiRiskSummary: 'Critical Emergency Decompensation Risk (85%) & ICU Step-up required due to SpO2 desaturation (89%).',
      });
    } else {
      setTwin(DEMO_TWIN);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col font-sans">
      <DashboardNav />

      <div className="flex-1 flex overflow-hidden">
        <DashboardSidebar className="hidden lg:block w-64 shrink-0" />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  360° Longitudinal Digital Twin Vault
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Ayushman Bharat (ABDM) Compatible</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
                Patient Digital Twin: {twin.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Holistic single-pane clinical record unifying Vitals, Diseases, Allergies, Surgeries, Medications, Health Score, and AI Risk.
              </p>
            </div>

            {/* Patient Selector */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs font-bold text-slate-500 pl-2">Select Digital Twin:</span>
                <select
                  value={selectedPatientId}
                  onChange={(e) => handlePatientChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none pr-3 cursor-pointer"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id} className="dark:bg-slate-900">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Primary Digital Twin Hero Identity Card */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-200 text-xs font-bold uppercase tracking-wider">
                    {twin.gender} • {twin.age} Years Old
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                    Blood Group: {twin.bloodGroup}
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{twin.name}</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-blue-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>ABHA ID: <strong>{twin.abhaId}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Policy: <strong>{twin.insurancePolicy}</strong></span>
                  </div>
                </div>
              </div>

              {/* Dynamic Health Score Badge */}
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center shrink-0 min-w-[160px]">
                <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest block">
                  Health Score 2.0
                </span>
                <div className="text-4xl font-black mt-1 text-white flex items-baseline justify-center gap-1">
                  <span>{twin.healthScore}</span>
                  <span className="text-sm font-normal text-blue-300">/ 100</span>
                </div>
                <span
                  className={`inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    twin.tier === 'GREEN'
                      ? 'bg-emerald-500 text-white'
                      : twin.tier === 'YELLOW'
                      ? 'bg-amber-500 text-slate-900'
                      : 'bg-rose-500 text-white animate-pulse'
                  }`}
                >
                  {twin.tier} TIER
                </span>
              </div>
            </div>
          </div>

          {/* AI Clinical Summary Banner */}
          <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl flex items-start gap-3 text-xs">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
            <div className="text-purple-900 dark:text-purple-200 leading-relaxed">
              <strong>AI Longitudinal Assessment:</strong> {twin.aiRiskSummary}
            </div>
          </div>

          {/* Vitals Telemetry Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Continuous Vital Signs Telemetry
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">HEART RATE</span>
                <span className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1 block">{twin.vitals.hr} bpm</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">BLOOD PRESSURE</span>
                <span className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1 block">{twin.vitals.sys}/{twin.vitals.dia}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">OXYGEN (SPO2)</span>
                <span className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1 block">{twin.vitals.spo2}%</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">BODY TEMP</span>
                <span className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1 block">{twin.vitals.temp}°F</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">BLOOD SUGAR</span>
                <span className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1 block">{twin.vitals.glucose} mg/dL</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">BMI</span>
                <span className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1 block">{twin.vitals.bmi}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">STATUS</span>
                <span className={`text-xs font-black mt-1 block ${twin.tier === 'GREEN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {twin.tier === 'GREEN' ? 'STABLE' : 'ALERT'}
                </span>
              </div>
            </div>
          </div>

          {/* 360 Degree Digital Twin Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Diseases & Allergies */}
            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-500" />
                  <span>Chronic Diseases & Active Diagnoses</span>
                </h3>
                <ul className="mt-3 space-y-2">
                  {twin.chronicDiseases.map((d, i) => (
                    <li key={i} className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Biometric Allergies & Adverse Reactions</span>
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {twin.allergies.map((a, i) => (
                    <li key={i} className="text-xs font-medium text-amber-800 dark:text-amber-300 flex items-center gap-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Prescriptions & MAR Adherence */}
            <Card className="p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Pill className="w-4 h-4 text-purple-500" />
                <span>Active Prescriptions & Dosage Regimen</span>
              </h3>

              <div className="space-y-2">
                {twin.activePrescriptions.map((p, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{p.name}</span>
                      <span className="text-[11px] text-purple-600 block mt-0.5">{p.freq}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 font-bold text-[10px]">
                      {p.dose}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Medication Compliance Score:</span>
                <span className="font-bold text-emerald-600">94.2% Adherent</span>
              </div>
            </Card>

            {/* Surgeries & Procedures */}
            <Card className="p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-blue-500" />
                <span>Surgical History & Inpatient Interventions</span>
              </h3>

              <ul className="space-y-2">
                {twin.surgeries.map((s, i) => (
                  <li key={i} className="text-xs text-slate-700 dark:text-slate-300 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Immunizations:</h4>
                <div className="flex flex-wrap gap-2">
                  {twin.vaccinations.map((v, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold">
                      ✓ {v}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Care Circle & Network Contacts */}
            <Card className="p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>Care Circle & Legal Proxy Network</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60">
                  <div className="text-[10px] font-bold text-blue-600 uppercase">Primary Family Doctor</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{twin.familyDoctor.name}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{twin.familyDoctor.hospital} • {twin.familyDoctor.phone}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
                  <div className="text-[10px] font-bold text-emerald-600 uppercase">Guardian & Legal Medical Proxy</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{twin.guardian.name}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{twin.guardian.relation} • {twin.guardian.phone}</div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <Link
                  href="/dashboard/family-doctor"
                  className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                >
                  <span>Open Family Doctor Station</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/dashboard/health-score"
                  className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                >
                  <span>Health Score 2.0</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          </div>

          {/* Longitudinal Hospitalization History */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Hospital Encounters & Diagnostic History</span>
            </h3>

            <div className="space-y-3">
              {twin.hospitalVisits.map((visit, i) => (
                <div
                  key={i}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{visit.facility}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                        {visit.type}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-1">{visit.summary}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">{visit.date}</span>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
