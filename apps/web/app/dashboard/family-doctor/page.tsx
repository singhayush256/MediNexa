'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  HeartPulse,
  Users,
  ShieldAlert,
  FileText,
  Video,
  Phone,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  RefreshCw,
  Plus,
  ArrowRight,
  Building2,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, StatCard } from '@/components/ui';

interface AssignedPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  healthScore: number;
  tier: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  activeAlert?: string;
  lastVisit: string;
  guardianName: string;
  guardianPhone: string;
  primaryDiagnosis: string;
}

export default function FamilyDoctorDashboardPage() {
  const [patients, setPatients] = useState<AssignedPatient[]>([
    {
      id: 'pat-001',
      name: 'Eleanor Vance',
      age: 68,
      gender: 'Female',
      phone: '+91 98765 43210',
      healthScore: 84,
      tier: 'GREEN',
      lastVisit: '2 days ago',
      guardianName: 'Thomas Vance (Son)',
      guardianPhone: '+91 98765 43211',
      primaryDiagnosis: 'Stage 2 Hypertension, Type 2 Diabetes',
    },
    {
      id: 'pat-002',
      name: 'Marcus Sterling',
      age: 72,
      gender: 'Male',
      phone: '+91 98765 43220',
      healthScore: 36,
      tier: 'RED',
      activeAlert: 'SpO2 Desaturation (89%) — ICU Bed Allocation Active',
      lastVisit: 'Today (Inpatient)',
      guardianName: 'Helena Sterling (Spouse)',
      guardianPhone: '+91 98765 43222',
      primaryDiagnosis: 'Acute Exacerbation of COPD, Cardiac Arrhythmia',
    },
    {
      id: 'pat-003',
      name: 'Sarah Jenkins',
      age: 54,
      gender: 'Female',
      phone: '+91 98765 43230',
      healthScore: 74,
      tier: 'YELLOW',
      lastVisit: '1 week ago',
      guardianName: 'David Jenkins (Husband)',
      guardianPhone: '+91 98765 43233',
      primaryDiagnosis: 'Post-Cholecystectomy Recovery',
    },
    {
      id: 'pat-004',
      name: 'Rajesh Sharma',
      age: 46,
      gender: 'Male',
      phone: '+91 98765 43240',
      healthScore: 88,
      tier: 'GREEN',
      lastVisit: '3 weeks ago',
      guardianName: 'Pooja Sharma (Spouse)',
      guardianPhone: '+91 98765 43244',
      primaryDiagnosis: 'Mild Dyslipidemia (Managed)',
    },
  ]);

  const [selectedPatient, setSelectedPatient] = useState<AssignedPatient>(patients[0]);
  const [activeTab, setActiveTab] = useState<'ROSTER' | 'ALERTS' | 'REPORTS' | 'HISTORY'>('ROSTER');
  const [notice, setNotice] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Invite form state
  const [docName, setDocName] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docPhone, setDocPhone] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('Family Medicine / General Practice');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const handleSendTelemedicineInvite = (pat: AssignedPatient) => {
    setNotice(`✓ HD WebRTC Telemedicine consultation room generated for ${pat.name}. Link SMS sent to ${pat.phone} & ${pat.guardianPhone}.`);
    setTimeout(() => setNotice(null), 6000);
  };

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(`✓ Family doctor verification request sent to ${docEmail}. Accreditation verified.`);
    setShowInviteModal(false);
    setDocName('');
    setDocEmail('');
    setDocPhone('');
    setTimeout(() => setNotice(null), 5000);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'GREEN':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'YELLOW':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300';
      case 'ORANGE':
        return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300';
      case 'RED':
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse';
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
                  <Stethoscope className="w-3 h-3" />
                  Primary & Family Care Network
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Care Circle & Guardian Protocol</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
                Family Doctor & Guardian Clinical Station
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Surveillance and coordination across assigned patients, remote vitals telemetry, emergency alarms, and diagnostic reports.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowInviteModal(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Family Doctor
              </Button>
            </div>
          </div>

          {/* Action Notice */}
          {notice && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{notice}</span>
              </div>
              <button onClick={() => setNotice(null)} className="text-emerald-600 hover:text-emerald-800 text-xs font-bold">
                Dismiss
              </button>
            </div>
          )}

          {/* Active Critical Alerts Notice (if any patient in RED) */}
          {patients.some((p) => p.tier === 'RED') && (
            <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 rounded-3xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-extrabold text-sm">
                  <AlertTriangle className="w-5 h-5 animate-pulse text-rose-600" />
                  <span>EMERGENCY GUARDIAN ALERT ACTIVE</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-black text-xs uppercase tracking-wider">
                  Level 3 Critical
                </span>
              </div>

              <div className="text-xs text-rose-800 dark:text-rose-200 leading-relaxed">
                Patient <strong>Marcus Sterling (Age 72)</strong> has triggered a critical telemetry alert:{' '}
                <em>SpO2 Desaturation (89%) with Tachypnea</em>. Attending hospital trauma bay notified, guardian{' '}
                <strong>Helena Sterling</strong> alerted via WhatsApp & SMS.
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Link
                  href="/dashboard/emergency"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <span>Open Emergency Bay Live Monitor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => handleSendTelemedicineInvite(patients.find((p) => p.tier === 'RED')!)}
                  className="px-4 py-2 bg-white dark:bg-slate-900 border border-rose-300 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl hover:bg-rose-50 transition"
                >
                  Direct Doctor Video Call
                </button>
              </div>
            </div>
          )}

          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Patients</span>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{patients.length}</div>
                <span className="text-[10px] text-blue-600 font-semibold">Active In Practice</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </Card>

            <Card className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Critical Flagged</span>
                <div className="text-2xl font-black text-rose-600 mt-1">
                  {patients.filter((p) => p.tier === 'RED').length}
                </div>
                <span className="text-[10px] text-rose-500 font-semibold">Immediate Action</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </Card>

            <Card className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Average Health Score</span>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {Math.round(patients.reduce((acc, p) => acc + p.healthScore, 0) / patients.length)} / 100
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold">Moderate-High</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
            </Card>

            <Card className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Guardians Verified</span>
                <div className="text-2xl font-black text-purple-600 mt-1">100%</div>
                <span className="text-[10px] text-purple-600 font-semibold">Care Circle Active</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </Card>
          </div>

          {/* Sub-Tab Switcher */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('ROSTER')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'ROSTER'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Assigned Patients Roster</span>
            </button>

            <button
              onClick={() => setActiveTab('REPORTS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'REPORTS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Diagnostic Reports & Vitals</span>
            </button>
          </div>

          {/* PATIENTS ROSTER TABLE */}
          {activeTab === 'ROSTER' && (
            <Card className="overflow-hidden p-0 border border-slate-200 dark:border-slate-800">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Assigned Practice Patients
                  </h3>
                  <p className="text-xs text-slate-400">
                    Select a patient profile to review longitudinal EMR, telemetry, and guardian contact.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-4">Patient Name & Demographics</th>
                      <th className="p-4">Health Score 2.0</th>
                      <th className="p-4">Primary Clinical Diagnosis</th>
                      <th className="p-4">Care Circle Guardian</th>
                      <th className="p-4">Last Encounter</th>
                      <th className="p-4 text-right">Care Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {patients.map((pat) => (
                      <tr
                        key={pat.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition cursor-pointer"
                        onClick={() => setSelectedPatient(pat)}
                      >
                        <td className="p-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{pat.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {pat.age} yrs • {pat.gender} • {pat.phone}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-slate-900 dark:text-slate-100">
                              {pat.healthScore}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getTierColor(pat.tier)}`}
                            >
                              {pat.tier}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {pat.primaryDiagnosis}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{pat.guardianName}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{pat.guardianPhone}</span>
                          </div>
                        </td>

                        <td className="p-4 text-slate-500 font-medium">{pat.lastVisit}</td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendTelemedicineInvite(pat);
                              }}
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white dark:bg-blue-950/40 dark:text-blue-300 font-bold rounded-lg transition flex items-center gap-1"
                              title="Start Video Consult"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Telehealth</span>
                            </button>
                            <Link
                              href="/dashboard/patients/digital-twin"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                              title="View Digital Twin"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* DIAGNOSTIC REPORTS & VITALS TAB */}
          {activeTab === 'REPORTS' && (
            <div className="space-y-4">
              <Card className="p-5">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Recent Diagnostic Laboratory Panels for Practice Patients
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  All pathology and biochemistry values uploaded directly from NABL hospital analyzers.
                </p>

                <div className="space-y-3">
                  {[
                    { test: 'Complete Blood Count (CBC) with Differential', patient: 'Marcus Sterling', date: 'Today, 07:45 AM', status: 'CRITICAL PANIC VALUE', flag: 'Leukocytosis (WBC 18.4 k/uL)' },
                    { test: 'Comprehensive Metabolic Panel (CMP)', patient: 'Eleanor Vance', date: 'Yesterday, 10:20 AM', status: 'NORMAL', flag: 'Normal eGFR, Stable Electrolytes' },
                    { test: 'High-Sensitivity Troponin-I', patient: 'Marcus Sterling', date: 'Today, 08:15 AM', status: 'BORDERLINE ELEVATED', flag: 'Troponin-I: 0.045 ng/mL' },
                    { test: 'Glycated Hemoglobin (HbA1c)', patient: 'Sarah Jenkins', date: '3 Days Ago', status: 'CONTROLLED', flag: 'HbA1c: 6.8%' },
                  ].map((rpt, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">{rpt.test}</span>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Patient: <strong>{rpt.patient}</strong> • Released: {rpt.date}
                        </div>
                        <span className="text-[10px] text-purple-600 font-semibold mt-1 block">{rpt.flag}</span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${
                          rpt.status.includes('CRITICAL')
                            ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {rpt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* INVITE FAMILY DOCTOR MODAL */}
          {showInviteModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Add Accredited Family Doctor
                  </h3>
                  <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddDoctor} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Doctor Full Name:</label>
                    <input
                      type="text"
                      required
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      placeholder="Dr. Anand Verma, MD"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address:</label>
                    <input
                      type="email"
                      required
                      value={docEmail}
                      onChange={(e) => setDocEmail(e.target.value)}
                      placeholder="doctor.verma@clinic.in"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Phone Number:</label>
                    <input
                      type="tel"
                      required
                      value={docPhone}
                      onChange={(e) => setDocPhone(e.target.value)}
                      placeholder="+91 98111 22233"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Clinical Specialty:</label>
                    <select
                      value={docSpecialty}
                      onChange={(e) => setDocSpecialty(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option>Family Medicine / General Practice</option>
                      <option>Internal Medicine</option>
                      <option>Cardiology Specialist</option>
                      <option>Geriatric Care</option>
                      <option>Pediatrics</option>
                    </select>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" type="button" onClick={() => setShowInviteModal(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" type="submit">
                      Send Verification Link
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
