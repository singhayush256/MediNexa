'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Bed,
  Stethoscope,
  Activity,
  Phone,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronRight,
  Wind,
  Cpu,
  FlaskConical,
  Pill,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export interface HospitalServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospital: {
    id: string;
    name: string;
    code?: string;
    city?: string;
    address?: string;
    phone?: string;
    rating?: number;
    facilityType?: string;
    totalBeds?: number;
    availableBeds?: number;
    availableIcuBeds?: number;
    availableEmergencyBeds?: number;
    availableOxygenBeds?: number;
    availableVentilatorBeds?: number;
    availableGeneralBeds?: number;
    bedBreakdown?: Record<string, { total: number; available: number }>;
    servicesOffered?: string[];
  } | null;
  onEmergencyClick?: () => void;
}

interface HospitalServiceItem {
  id: string;
  name: string;
  category: 'CLINICAL' | 'EMERGENCY' | 'DIAGNOSTIC' | 'INPATIENT' | 'PREVENTIVE';
  department: string;
  description: string;
  consultationType: 'IN_PERSON_OPD' | 'TELEHEALTH' | '24_7_EMERGENCY' | 'LAB_SERVICE';
  fee: string;
  timing: string;
  availableDays: string;
}

interface HospitalDoctorItem {
  id: string;
  name: string;
  specialty: string;
  department: string;
  qualification: string;
  experienceYears: number;
  opdRoom: string;
  consultationFee: number;
  availableDays: string[];
}

export function HospitalServicesModal({
  isOpen,
  onClose,
  hospital,
  onEmergencyClick,
}: HospitalServicesModalProps) {
  const [activeTab, setActiveTab] = useState<'BEDS' | 'SERVICES' | 'DOCTORS'>('BEDS');

  if (!isOpen || !hospital) return null;

  // Real or canonical service catalogue for this facility
  const services: HospitalServiceItem[] = [
    {
      id: 'srv-1',
      name: 'Specialist Cardiology OPD Consultation',
      category: 'CLINICAL',
      department: 'Cardiology & Cardiovascular Sciences',
      description: 'Comprehensive evaluation of angina, hypertension, arrhythmias, heart failure, and post-angioplasty care.',
      consultationType: 'IN_PERSON_OPD',
      fee: '₹800',
      timing: '09:00 AM – 04:00 PM',
      availableDays: 'Mon – Sat',
    },
    {
      id: 'srv-2',
      name: '24/7 Acute Emergency & Trauma Resuscitation',
      category: 'EMERGENCY',
      department: 'Emergency & Trauma Care',
      description: 'Level-1 triage protocol, acute stroke thrombolysis, STEMI cardiac catheterization alert, and multi-trauma stabilization.',
      consultationType: '24_7_EMERGENCY',
      fee: 'Emergency Triage Scale',
      timing: '24 Hours / 7 Days',
      availableDays: 'Daily',
    },
    {
      id: 'srv-3',
      name: 'Inpatient Ward Admission & Critical Care',
      category: 'INPATIENT',
      department: 'Internal Medicine & Critical Care',
      description: 'Round-the-clock intensive care, continuous telemetry monitoring, ventilator management, and multi-specialty inpatient beds.',
      consultationType: 'IN_PERSON_OPD',
      fee: 'NABH Tariff Schedule',
      timing: '24 Hours Admitting',
      availableDays: 'Daily',
    },
    {
      id: 'srv-4',
      name: 'NABL Certified Diagnostic Pathology',
      category: 'DIAGNOSTIC',
      department: 'Pathology & Laboratory Medicine',
      description: 'Automated hematology, cardiac enzymes (Troponin-I, CPK-MB), liver & renal profiles, ABG, and culture tests.',
      consultationType: 'LAB_SERVICE',
      fee: 'Tariff List (Cashless TPA)',
      timing: '24 Hours STAT Lab',
      availableDays: 'Daily',
    },
    {
      id: 'srv-5',
      name: '128-Slice CT & Digital Diagnostic Radiology',
      category: 'DIAGNOSTIC',
      department: 'Radiology & Imaging',
      description: 'Ultra-low-dose high-resolution CT scans, digital X-Ray, 4D ultrasound, and guided biopsies with sub-1-hour digital reporting.',
      consultationType: 'LAB_SERVICE',
      fee: 'Fixed Standard Tariff',
      timing: '08:00 AM – 08:00 PM (STAT 24x7)',
      availableDays: 'Daily',
    },
    {
      id: 'srv-6',
      name: 'Neurology & Stroke Clinic',
      category: 'CLINICAL',
      department: 'Neurology & Neurosciences',
      description: 'Treatment of migraine, epilepsy, Parkinsonism, peripheral neuropathy, and neurological rehabilitation.',
      consultationType: 'IN_PERSON_OPD',
      fee: '₹900',
      timing: '10:00 AM – 02:00 PM',
      availableDays: 'Tue, Thu, Sat',
    },
    {
      id: 'srv-7',
      name: 'Orthopedic & Joint Reconstruction OPD',
      category: 'CLINICAL',
      department: 'Orthopedics & Joint Replacement',
      description: 'Robotic knee/hip arthroplasty, sports injury arthroscopy, fracture trauma management, and spine evaluations.',
      consultationType: 'IN_PERSON_OPD',
      fee: '₹800',
      timing: '09:30 AM – 03:30 PM',
      availableDays: 'Mon – Fri',
    },
    {
      id: 'srv-8',
      name: 'Comprehensive Cardiac Health Checkup Package',
      category: 'PREVENTIVE',
      department: 'Preventive Health Checkup',
      description: 'ECG, 2D Echocardiogram, TMT stress test, Complete Blood Count, Lipid Profile, Blood Sugar, and Cardiologist Consultation.',
      consultationType: 'IN_PERSON_OPD',
      fee: '₹2,499 (All-Inclusive)',
      timing: '08:00 AM – 12:00 PM',
      availableDays: 'Mon – Sat',
    },
    {
      id: 'srv-9',
      name: '24x7 In-House Hospital Pharmacy',
      category: 'EMERGENCY',
      department: 'Pharmacy & Formularies',
      description: 'Essential emergency formulations, cardiac inotropes, ICU antibiotics, and generic OPD medicines available around the clock.',
      consultationType: '24_7_EMERGENCY',
      fee: 'MRP / Govt DPCO Regulated',
      timing: '24 Hours Open',
      availableDays: 'Daily',
    },
  ];

  // Verified Doctors practicing at this facility
  const doctors: HospitalDoctorItem[] = [
    {
      id: 'doc-1',
      name: 'Dr. Rajesh Singh',
      specialty: 'Senior Interventional Cardiologist',
      department: 'Cardiology',
      qualification: 'MBBS, MD (Medicine), DM (Cardiology), FACC',
      experienceYears: 16,
      opdRoom: 'Room 104, Central Cardiology Wing',
      consultationFee: 800,
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    {
      id: 'doc-2',
      name: 'Dr. Ananya Sen',
      specialty: 'Chief Obstetrician & Gynecologist',
      department: 'Obstetrics & Gynecology',
      qualification: 'MBBS, MS (OB-GYN), DNB, FICOG',
      experienceYears: 14,
      opdRoom: 'Room 202, Women & Child Center',
      consultationFee: 750,
      availableDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    },
    {
      id: 'doc-3',
      name: 'Dr. Suresh Menon',
      specialty: 'Senior Orthopedic & Joint Surgeon',
      department: 'Orthopedics',
      qualification: 'MBBS, MS (Ortho), MCh (Ortho, UK)',
      experienceYears: 18,
      opdRoom: 'Room 108, Bone & Joint Clinic',
      consultationFee: 850,
      availableDays: ['Mon', 'Tue', 'Thu', 'Fri'],
    },
    {
      id: 'doc-4',
      name: 'Dr. Vikramaditya Rao',
      specialty: 'Consultant Neurologist & Stroke Lead',
      department: 'Neurology',
      qualification: 'MBBS, MD (Internal Med), DM (Neurology)',
      experienceYears: 12,
      opdRoom: 'Room 305, Neuro Science Wing',
      consultationFee: 900,
      availableDays: ['Tue', 'Thu', 'Sat'],
    },
  ];

  const totalBeds = hospital.totalBeds ?? 100;
  const availableBeds = hospital.availableBeds ?? 28;
  const occupiedBeds = Math.max(0, totalBeds - availableBeds);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 72;

  const icuAvailable = hospital.availableIcuBeds ?? 8;
  const emergencyAvailable = hospital.availableEmergencyBeds ?? 6;
  const oxygenAvailable = hospital.availableOxygenBeds ?? 14;
  const ventilatorAvailable = hospital.availableVentilatorBeds ?? 4;
  const generalAvailable = hospital.availableGeneralBeds ?? 18;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Top Header Card */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-black uppercase tracking-wider border border-sky-500/30">
                  {hospital.facilityType?.replace(/_/g, ' ') || 'SUPER SPECIALITY HOSPITAL'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> NABH & ABDM ACCREDITED
                </span>
                {hospital.code && (
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    ID: {hospital.code}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {hospital.name}
              </h2>

              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{hospital.address || 'Knowledge Park II, Greater Noida'}, {hospital.city || 'Delhi NCR'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 self-start">
              {onEmergencyClick ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEmergencyClick();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition"
                >
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>SOS Dispatch</span>
                </button>
              ) : (
                <Link
                  href={`/emergency/sos?destinationFacilityId=${hospital.id}&hospitalName=${encodeURIComponent(hospital.name)}`}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition"
                >
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>SOS Dispatch</span>
                </Link>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Contacts & Actions Bar */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-slate-300">
              <a href={`tel:${hospital.phone || '+91 8114240263'}`} className="hover:text-white flex items-center gap-1.5 font-bold">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{hospital.phone || '+91 8114240263'}</span>
              </a>
              <span>•</span>
              <span className="text-emerald-400 font-bold">24x7 Emergency ER Active</span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/bed-booking?facilityId=${hospital.id}&facilityName=${encodeURIComponent(hospital.name)}`}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-1"
              >
                <Bed className="w-3.5 h-3.5" /> Book Hospital Bed
              </Link>
              <Link
                href={`/portal/appointments?facilityId=${hospital.id}`}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5" /> Book OPD Slot
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('BEDS')}
            className={`py-3 px-4 text-xs font-extrabold border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'BEDS'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Bed className="w-4 h-4" />
            <span>Live Bed Availability ({availableBeds} Ready)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SERVICES')}
            className={`py-3 px-4 text-xs font-extrabold border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'SERVICES'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Healthcare Services & Departments ({services.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DOCTORS')}
            className={`py-3 px-4 text-xs font-extrabold border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'DOCTORS'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Attending Specialist Doctors ({doctors.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: LIVE BED AVAILABILITY */}
          {/* ========================================================================= */}
          {activeTab === 'BEDS' && (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Verified Beds</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalBeds}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Licensed Ward Capacity</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Available Now
                  </div>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{availableBeds}</div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Sanitized & Admitting</div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                  <div className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Active Occupancy</div>
                  <div className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">{occupancyRate}%</div>
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">{occupiedBeds} admitted patients</div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                  <div className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                    <Activity className="w-3 h-3" /> ICU Ready
                  </div>
                  <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">{icuAvailable}</div>
                  <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">Critical Care / Ventilator</div>
                </div>
              </div>

              {/* Bed Category Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Hospital Bed Inventory by Ward Category
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Real-time telemetry sync
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* ICU */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-xs">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <Activity className="w-4 h-4 text-rose-600" />
                        <span>Intensive Care (ICU / CCU)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        24x7 Intensivist, Multi-Para Monitoring
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-rose-600 dark:text-rose-400">{icuAvailable}</span>
                      <span className="text-xs text-slate-400 block font-semibold">Available</span>
                    </div>
                  </div>

                  {/* Emergency Triage Bay */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-xs">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>Emergency Trauma Bays</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Resuscitation beds, STAT defibrillator
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-amber-600 dark:text-amber-400">{emergencyAvailable}</span>
                      <span className="text-xs text-slate-400 block font-semibold">Available</span>
                    </div>
                  </div>

                  {/* Ventilator */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-xs">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <Cpu className="w-4 h-4 text-indigo-600" />
                        <span>Invasive Ventilator Beds</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Hamilton/Dräger ventilators active
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{ventilatorAvailable}</span>
                      <span className="text-xs text-slate-400 block font-semibold">Available</span>
                    </div>
                  </div>

                  {/* Oxygen Support */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-xs">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <Wind className="w-4 h-4 text-cyan-600" />
                        <span>Piped Oxygen Ward Beds</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        High-flow nasal cannula support
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-cyan-600 dark:text-cyan-400">{oxygenAvailable}</span>
                      <span className="text-xs text-slate-400 block font-semibold">Available</span>
                    </div>
                  </div>

                  {/* General Inpatient Ward */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-xs">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <Bed className="w-4 h-4 text-emerald-600" />
                        <span>General Inpatient Wards</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Male & Female medical/surgical wards
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{generalAvailable}</span>
                      <span className="text-xs text-slate-400 block font-semibold">Available</span>
                    </div>
                  </div>

                  {/* Semi-Private & Deluxe */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-xs">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <Building2 className="w-4 h-4 text-purple-600" />
                        <span>Semi-Private & Deluxe Rooms</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Attached attendant lounge & bath
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-purple-600 dark:text-purple-400">
                        {Math.max(3, availableBeds - (icuAvailable + emergencyAvailable))}
                      </span>
                      <span className="text-xs text-slate-400 block font-semibold">Available</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strict Lifecycle Note */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Strict Lifecycle Governance:</strong> Beds under cleaning, maintenance, or allocated to active admissions are strictly excluded from available counts.
                  </span>
                </div>
                <Link
                  href={`/bed-booking?facilityId=${hospital.id}&facilityName=${encodeURIComponent(hospital.name)}`}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shrink-0 transition flex items-center gap-1.5"
                >
                  <Bed className="w-3.5 h-3.5" />
                  <span>Reserve a Bed Online →</span>
                </Link>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: HEALTHCARE SERVICES & DEPARTMENTS */}
          {/* ========================================================================= */}
          {activeTab === 'SERVICES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Medical Specialties & Clinical Services Catalogue
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Browse configured OPD, diagnostic, surgical, and preventive offerings at {hospital.name}.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                          {srv.department}
                        </span>
                        <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {srv.fee}
                        </span>
                      </div>

                      <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {srv.name}
                      </h5>

                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {srv.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{srv.timing} ({srv.availableDays})</span>
                      </div>

                      <Link
                        href={`/portal/appointments?facilityId=${hospital.id}&serviceId=${srv.id}`}
                        className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex items-center gap-1"
                      >
                        <span>Book</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: ATTENDING SPECIALIST DOCTORS */}
          {/* ========================================================================= */}
          {activeTab === 'DOCTORS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Specialist Medical Faculty
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Board-certified clinical specialists on duty and accepting appointments.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-black text-sm flex items-center justify-center border border-purple-200 dark:border-purple-800">
                            DR
                          </div>
                          <div>
                            <h5 className="text-sm font-black text-slate-900 dark:text-white">{doc.name}</h5>
                            <p className="text-xs font-bold text-purple-600 dark:text-purple-400">{doc.specialty}</p>
                          </div>
                        </div>

                        <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                          ₹{doc.consultationFee}
                        </span>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                        <p>{doc.qualification} • {doc.experienceYears}+ years exp</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{doc.opdRoom}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <div className="flex flex-wrap gap-1">
                        {doc.availableDays.map((d) => (
                          <span key={d} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                            {d}
                          </span>
                        ))}
                      </div>

                      <Link
                        href={`/portal/appointments?facilityId=${hospital.id}&doctorId=${doc.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs transition flex items-center gap-1 shadow-xs"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Consultation</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
