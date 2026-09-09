'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Search,
  CheckCircle,
  Sparkles,
  ShieldAlert,
  Stethoscope,
  Activity,
  HeartPulse,
  Syringe,
  Pill,
  FlaskConical,
  Scan,
  Receipt,
  FileCheck2,
  Ambulance,
  Users2,
  BedDouble,
  Siren,
  Building,
  UserCheck,
  Crown,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/api-config';

export interface PersonaDefinition {
  roleCode: string;
  name: string;
  title: string;
  department: string;
  email: string;
  category: 'clinical' | 'executive' | 'operations' | 'patient';
  badgeColor: string;
  avatarBg: string;
  icon: any;
  defaultRoute: string;
  description: string;
  keyModules: string[];
}

export const HOSPITAL_16_PERSONAS: PersonaDefinition[] = [
  // 1. Super Admin
  {
    roleCode: 'MEDINEXA_ADMIN',
    name: 'Anand V. Vardhan',
    title: 'Super Administrator',
    department: 'Hospital System Governance',
    email: 'admin@medinexa.com',
    category: 'executive',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    avatarBg: 'from-purple-600 to-indigo-700',
    icon: Crown,
    defaultRoute: '/dashboard',
    description: 'Complete cross-enterprise master control, multi-facility oversight, security audits, and system configuration.',
    keyModules: ['Master Config', 'All Facilities', 'Audit Vault', 'SaaS Licensing'],
  },
  // 2. Hospital Administrator
  {
    roleCode: 'HOSPITAL_ADMIN',
    name: 'Dr. Sunita Deshmukh',
    title: 'Hospital Administrator & COO',
    department: 'Hospital Operations & Administration',
    email: 'hospitaladmin@medinexa.com',
    category: 'executive',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    avatarBg: 'from-blue-600 to-cyan-700',
    icon: Building,
    defaultRoute: '/dashboard',
    description: 'Day-to-day facility management, operational analytics, departmental resource allocation, and staff compliance.',
    keyModules: ['Operations KPI', 'Department Status', 'Staff Oversight', 'Analytics'],
  },
  // 3. Hospital Owner / Executive
  {
    roleCode: 'EXECUTIVE',
    name: 'Vikramaditya Singhania',
    title: 'Hospital Managing Director / Owner',
    department: 'Board of Directors & Executive Suite',
    email: 'executive.owner@medinexa.com',
    category: 'executive',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    avatarBg: 'from-amber-600 to-orange-700',
    icon: ShieldCheck,
    defaultRoute: '/dashboard',
    description: 'Executive revenue trends, hospital occupancy metrics, financial solvency, and strategic performance indicators.',
    keyModules: ['Executive P&L', 'Bed Occupancy Rate', 'Revenue Realization', 'Growth Trends'],
  },
  // 4. HR Department Manager
  {
    roleCode: 'HR_MANAGER',
    name: 'Rohan Mehra',
    title: 'Head of Human Resources',
    department: 'HR & Medical Credentialing',
    email: 'hr.manager@medinexa.com',
    category: 'executive',
    badgeColor: 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800',
    avatarBg: 'from-pink-600 to-rose-700',
    icon: Users2,
    defaultRoute: '/dashboard/hr',
    description: 'Staff attendance tracking, payroll, credential verification, license renewals, and clinical duty rosters.',
    keyModules: ['Duty Rosters', 'Staff Directory', 'Credential Verification', 'Attendance & Leaves'],
  },
  // 5. Senior Consultant Doctor
  {
    roleCode: 'DOCTOR',
    name: 'Dr. Rajesh Sharma',
    title: 'Senior Consultant Cardiologist',
    department: 'Department of Cardiology & Telemedicine',
    email: 'dr.rajesh.sharma@medinexa.com',
    category: 'clinical',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    avatarBg: 'from-blue-600 to-teal-600',
    icon: Stethoscope,
    defaultRoute: '/dashboard/doctor-appointments',
    description: 'OPD encounters, patient clinical histories, diagnostic review, telemedicine video consults, and e-prescriptions.',
    keyModules: ['Consultations', 'Telemedicine Studio', 'SOAP Notes', 'e-Prescribing'],
  },
  // 6. Nursing In-Charge
  {
    roleCode: 'NURSE',
    name: 'Sister Priya Nair',
    title: 'Head Nurse - Intensive & Inpatient Care',
    department: 'Inpatient Nursing Station & ICU',
    email: 'nurse.priya@medinexa.com',
    category: 'clinical',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    avatarBg: 'from-emerald-600 to-teal-700',
    icon: Syringe,
    defaultRoute: '/dashboard/nursing',
    description: 'Bedside triage, real-time vitals monitoring (BP, SpO2, HR), medication administration records (eMAR), and shift handovers.',
    keyModules: ['Live Vitals Triage', 'eMAR Administration', 'Bedside Care Log', 'Shift Handover'],
  },
  // 7. Ward Manager
  {
    roleCode: 'WARD_MANAGER',
    name: 'Kavita Sengupta',
    title: 'Inpatient Ward Manager',
    department: 'IPD Ward & Bed Allocation Station',
    email: 'ward.manager@medinexa.com',
    category: 'clinical',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
    avatarBg: 'from-teal-600 to-cyan-700',
    icon: BedDouble,
    defaultRoute: '/dashboard/ipd',
    description: 'Real-time bed availability grid, ward transfers, inpatient admissions, and discharge clearance coordination.',
    keyModules: ['Bed Matrix Grid', 'IPD Admissions', 'Ward Transfers', 'Discharge Coordination'],
  },
  // 8. Emergency & Triage Staff
  {
    roleCode: 'EMERGENCY_STAFF',
    name: 'Dr. Deepak Varma',
    title: 'Emergency Medical Officer & Triage Chief',
    department: 'Accident & Emergency (A&E) Trauma Center',
    email: 'emergency.triage@medinexa.com',
    category: 'clinical',
    badgeColor: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800',
    avatarBg: 'from-red-600 to-rose-700',
    icon: Siren,
    defaultRoute: '/dashboard/emergency',
    description: 'Immediate trauma triage (Red/Yellow/Green), resuscitation protocols, rapid crash cart access, and emergency bed intake.',
    keyModules: ['Trauma Triage Matrix', 'Code Blue Triggers', 'Crash Cart Tracker', 'Emergency Registration'],
  },
  // 9. Radiologist
  {
    roleCode: 'RADIOLOGIST',
    name: 'Dr. Sunita Kulkarni',
    title: 'Consultant Radiologist & PACS Lead',
    department: 'Radiology & Diagnostic Imaging',
    email: 'radiology.sunita@medinexa.com',
    category: 'clinical',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
    avatarBg: 'from-indigo-600 to-purple-700',
    icon: Scan,
    defaultRoute: '/dashboard/radiology',
    description: 'DICOM imaging viewer, X-Ray / CT / MRI reporting, preliminary radiologist findings, and urgent critical alerts.',
    keyModules: ['DICOM PACS Viewer', 'Modality Worklist', 'Radiology Reporting', 'Critical Scan Alerts'],
  },
  // 10. Laboratory Technician
  {
    roleCode: 'LAB_STAFF',
    name: 'Anil K. Verma',
    title: 'Senior Laboratory Technician',
    department: 'Central Clinical Pathology & Biochemistry',
    email: 'lab.anil@medinexa.com',
    category: 'clinical',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800',
    avatarBg: 'from-cyan-600 to-blue-700',
    icon: FlaskConical,
    defaultRoute: '/dashboard/lab',
    description: 'Blood sample accessioning, automated analyzer imports, test validation, panic value flags, and verified report release.',
    keyModules: ['Sample Barcoding', 'Diagnostic Test Entry', 'Panic Value Alerts', 'Signed Lab Reports'],
  },
  // 11. Pharmacist
  {
    roleCode: 'PHARMACY_STAFF',
    name: 'Rahul Bose',
    title: 'Chief Inpatient & Outpatient Pharmacist',
    department: 'Hospital Central Pharmacy',
    email: 'pharmacist.rahul@medinexa.com',
    category: 'clinical',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    avatarBg: 'from-amber-600 to-yellow-700',
    icon: Pill,
    defaultRoute: '/dashboard/pharmacy',
    description: 'Doctor prescription dispensing, batch & expiry verification, Schedule H1 drug registries, and live inventory replenishment.',
    keyModules: ['Prescription Queue', 'Dispensing Register', 'Schedule H1 Compliance', 'Stock Reorder Alerts'],
  },
  // 12. Receptionist / Front Desk
  {
    roleCode: 'RECEPTIONIST',
    name: 'Pooja Bhatt',
    title: 'Chief Patient Registration Officer',
    department: 'Front Desk & Central OPD Reception',
    email: 'reception@medinexa.com',
    category: 'operations',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800',
    avatarBg: 'from-orange-600 to-amber-700',
    icon: UserCheck,
    defaultRoute: '/dashboard/appointments',
    description: 'Patient check-ins, new UHID biometric generation, doctor slot bookings, queue token printing, and visitor badges.',
    keyModules: ['New UHID Generation', 'OPD Slot Booking', 'Queue Token Console', 'Patient Check-In'],
  },
  // 13. Ambulance Emergency Driver
  {
    roleCode: 'AMBULANCE_DRIVER',
    name: 'Rajinder Kumar',
    title: 'Emergency Ambulance Fleet Captain',
    department: 'Hospital Emergency Transit Fleet',
    email: 'ambulance.driver@medinexa.com',
    category: 'operations',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    avatarBg: 'from-rose-600 to-red-700',
    icon: Ambulance,
    defaultRoute: '/dashboard/ambulance',
    description: 'Real-time GPS trip tracking, emergency call dispatch, onboard oxygen/defibrillator status, and transit care telemetry.',
    keyModules: ['Live GPS Fleet Map', 'Emergency SOS Dispatch', 'Onboard Equipment Check', 'Transit Patient Handover'],
  },
  // 14. Billing Specialist
  {
    roleCode: 'BILLING_STAFF',
    name: 'Kavita Joshi',
    title: 'Lead Medical Billing Specialist',
    department: 'Patient Accounts & Central Billing',
    email: 'billing.kavita@medinexa.com',
    category: 'operations',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    avatarBg: 'from-emerald-600 to-teal-700',
    icon: Receipt,
    defaultRoute: '/dashboard/billing',
    description: 'Consolidated OPD/IPD invoices, GST tax compliance, cash/card/UPI reconciliation, receipt generation, and AR aging.',
    keyModules: ['Unified Invoicing', 'GST Breakdown', 'Payment Gateway Reconciliation', 'Deposit Tracking'],
  },
  // 15. Insurance Coordinator
  {
    roleCode: 'INSURANCE_COORDINATOR',
    name: 'Vikram Kapoor',
    title: 'TPA & Health Insurance Coordinator',
    department: 'Mediclaim Desk & Cashless Approvals',
    email: 'insurance.vikram@medinexa.com',
    category: 'operations',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800',
    avatarBg: 'from-violet-600 to-indigo-700',
    icon: FileCheck2,
    defaultRoute: '/dashboard/insurance',
    description: 'Pre-authorization requests, Ayushman Bharat PM-JAY integration, TPA query resolution, cashless claims, and settlements.',
    keyModules: ['TPA Pre-Authorization', 'PM-JAY Verification', 'Cashless Claim Desk', 'Settlement Tracking'],
  },
  // 16. Registered Patient
  {
    roleCode: 'PATIENT',
    name: 'Aarav Mehta',
    title: 'Empanelled Hospital Patient',
    department: 'UHID-2026-100101 (Noida Central Facility)',
    email: 'patient.aarav@medinexa.com',
    category: 'patient',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
    avatarBg: 'from-sky-600 to-blue-700',
    icon: HeartPulse,
    defaultRoute: '/portal',
    description: 'Personal health portal, past lab reports, active prescriptions, upcoming appointments, billing history, and tele-consults.',
    keyModules: ['My Health Records', 'Doctor Appointments', 'Active Prescriptions', 'Lab Test Reports'],
  },
];

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoleCode?: string;
}

export function RoleSwitcherModal({
  isOpen,
  onClose,
  currentRoleCode = '',
}: RoleSwitcherModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [switchingEmail, setSwitchingEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredPersonas = useMemo(() => {
    return HOSPITAL_16_PERSONAS.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.roleCode.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.keyModules.some((m) => m.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const handleSwitchPersona = async (persona: PersonaDefinition) => {
    try {
      setSwitchingEmail(persona.email);
      setErrorMessage(null);

      const res = await fetch(`${getApiBaseUrl()}/auth/demo-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: persona.email, roleCode: persona.roleCode }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to authenticate as ${persona.name}`);
      }

      const data = await res.json();
      const token = data.accessToken || data.token;

      if (typeof window !== 'undefined' && token) {
        localStorage.setItem('medinexa_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('medinexa_user', JSON.stringify(data.user));
        sessionStorage.setItem('medinexa_token', token);
        document.cookie = `medinexa_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      }

      onClose();

      // Navigate to persona's dedicated dashboard with a fresh page reload so nav/sidebar sync
      if (typeof window !== 'undefined') {
        window.location.href = persona.defaultRoute;
      } else {
        router.push(persona.defaultRoute);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error switching role. Please try again.');
      setSwitchingEmail(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-blue-50/40 dark:from-slate-900 dark:to-slate-800/40 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Universal Hospital Role Switcher
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                16 Personas
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Instantly jump into any hospital department with pre-authenticated credentials, realistic Indian clinical context, and tailored RBAC permissions.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close Role Switcher"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls: Search & Category Tabs */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by role, name, department, module..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Roles (16)' },
              { id: 'clinical', label: 'Clinical & Diagnostics' },
              { id: 'operations', label: 'Frontline & Operations' },
              { id: 'executive', label: 'Executive & Admin' },
              { id: 'patient', label: 'Patient Portal' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Persona Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPersonas.map((persona) => {
            const Icon = persona.icon;
            const isCurrent = currentRoleCode === persona.roleCode;
            const isSwitching = switchingEmail === persona.email;

            return (
              <div
                key={persona.email}
                className={`relative group rounded-2xl border p-4.5 flex flex-col justify-between transition-all hover:shadow-lg ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 dark:border-blue-600 ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Top Row: Avatar, Identity, and Badge */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${persona.avatarBg} text-white flex items-center justify-center shadow-md flex-shrink-0`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {persona.name}
                          </h3>
                          {isCurrent && (
                            <span className="flex items-center gap-1 text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-100/80 dark:bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                              <CheckCircle className="w-3 h-3" /> Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {persona.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {persona.department}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-md border tracking-wider uppercase flex-shrink-0 ${persona.badgeColor}`}
                    >
                      {persona.roleCode.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Persona Bio / Summary */}
                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {persona.description}
                  </p>

                  {/* Modules Pills */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {persona.keyModules.map((mod) => (
                      <span
                        key={mod}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Row: Email & Switch Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                    {persona.email}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSwitchPersona(persona)}
                    disabled={isSwitching}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 ${
                      isCurrent
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20'
                    }`}
                  >
                    {isSwitching ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : isCurrent ? (
                      <>
                        <span>Re-enter Station</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>Switch Persona</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer Note */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>All demo personas are secured with role tokens & simulated NABH/ABDM credentials. Default pass: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px] font-mono font-bold">Password@123</code></span>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:underline cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
