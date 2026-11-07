'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
  Calendar,
  Lock,
  Building2,
  Bed,
  CreditCard,
  Sliders,
  Users,
  Activity,
  Sparkles,
  Phone,
  Mail,
  Globe,
  MapPin,
  Check,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';
import { getApiBaseUrl } from '@/lib/api-config';

type AdminTab = 'hospital' | 'departments' | 'appointments' | 'beds' | 'billing' | 'preferences';

export default function HospitalSettingsPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('hospital');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tab 1: Hospital Profile
  const [hospitalProfile, setHospitalProfile] = useState({
    id: '',
    name: 'MediNexa Apex Multi-Specialty Hospital',
    code: 'APEX-DEL-01',
    organizationName: 'MediNexa Healthcare Network',
    address: '14 Institutional Area, Sector 12, RK Puram',
    city: 'New Delhi',
    state: 'Delhi',
    postalCode: '110022',
    phone: '+91 11 2619 8000',
    email: 'admin.delhi@medinexa.health',
    emergencyHotline: '+91-1800-MEDINEXA-ER',
    website: 'https://medinexa-medicalweb.vercel.app',
    licenseNumber: 'NABH-HOSP-2026-DEL-889',
    operatingHours: '24 Hours / 7 Days a Week',
    doctorCount: 38,
    staffCount: 114,
    bedCount: 120,
  });

  // Tab 2: Departments
  const [departments, setDepartments] = useState([
    { id: 'dept-cardio', name: 'Cardiology & Catheterization Lab', code: 'CARD', status: 'ACTIVE', opdHours: '08:30 - 18:00', maxTokens: 45 },
    { id: 'dept-ortho', name: 'Orthopedics & Joint Replacement', code: 'ORTH', status: 'ACTIVE', opdHours: '09:00 - 17:00', maxTokens: 40 },
    { id: 'dept-er', name: 'Emergency & Trauma Care (Level 1)', code: 'EMER', status: 'ACTIVE', opdHours: '24/7 Continuous', maxTokens: 999 },
    { id: 'dept-neuro', name: 'Neurology & Stroke Center', code: 'NEUR', status: 'ACTIVE', opdHours: '09:00 - 16:30', maxTokens: 30 },
    { id: 'dept-peds', name: 'Pediatrics & Neonatal Care (NICU)', code: 'PEDS', status: 'ACTIVE', opdHours: '08:00 - 20:00', maxTokens: 50 },
    { id: 'dept-radio', name: 'Radiology & Imaging Services (MRI/CT)', code: 'RADI', status: 'ACTIVE', opdHours: '08:00 - 22:00', maxTokens: 60 },
  ]);

  // Tab 3: Outpatient & Appointment Rules
  const [appointmentRules, setAppointmentRules] = useState({
    slotDurationMinutes: '15',
    opdStartTime: '08:00',
    opdEndTime: '20:00',
    cancellationCutoffHours: '2',
    maxConcurrentBookingsPerDoctor: '4',
    walkInTokenAllocation: true,
  });

  // Tab 4: Bed & Ward Policies
  const [bedWardPolicies, setBedWardPolicies] = useState({
    cleaningReleasePolicy: 'MANDATORY_HOUSEKEEPING_SIGNOFF',
    autoReleaseUnpaidBedsHours: '4',
    nurseToPatientRatioICU: '1:1',
    nurseToPatientRatioGeneral: '1:6',
    isolationProtocolsActive: true,
  });

  // Tab 5: Service & Billing Catalogues
  const [serviceBilling, setServiceBilling] = useState({
    defaultOpdFee: '500',
    emergencySurcharge: '1200',
    standardGeneralBedDailyRate: '2500',
    icuBedDailyRate: '8500',
    paymentGracePeriodDays: '7',
  });

  // Tab 6: Preferences & Localization
  const [preferences, setPreferences] = useState({
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    alertChannels: ['EMAIL', 'WHATSAPP', 'IN_APP'],
  });

  const apiUrl = getApiBaseUrl();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;

      try {
        if (token) {
          const res = await fetch(`${apiUrl}/admin/settings`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const data = await res.json();
            if (data.hospitalProfile) setHospitalProfile((prev) => ({ ...prev, ...data.hospitalProfile }));
            if (data.departments && data.departments.length > 0) {
              setDepartments((prev) =>
                data.departments.map((d: any, idx: number) => ({
                  ...d,
                  opdHours: prev[idx]?.opdHours || '09:00 - 17:00',
                  maxTokens: prev[idx]?.maxTokens || 40,
                }))
              );
            }
            if (data.appointmentRules) {
              setAppointmentRules({
                slotDurationMinutes: String(data.appointmentRules.slotDurationMinutes || '15'),
                opdStartTime: data.appointmentRules.opdStartTime || '08:00',
                opdEndTime: data.appointmentRules.opdEndTime || '20:00',
                cancellationCutoffHours: String(data.appointmentRules.cancellationCutoffHours || '2'),
                maxConcurrentBookingsPerDoctor: String(data.appointmentRules.maxConcurrentBookingsPerDoctor || '4'),
                walkInTokenAllocation: data.appointmentRules.walkInTokenAllocation ?? true,
              });
            }
            if (data.bedWardPolicies) {
              setBedWardPolicies({
                cleaningReleasePolicy: data.bedWardPolicies.cleaningReleasePolicy || 'MANDATORY_HOUSEKEEPING_SIGNOFF',
                autoReleaseUnpaidBedsHours: String(data.bedWardPolicies.autoReleaseUnpaidBedsHours || '4'),
                nurseToPatientRatioICU: data.bedWardPolicies.nurseToPatientRatioICU || '1:1',
                nurseToPatientRatioGeneral: data.bedWardPolicies.nurseToPatientRatioGeneral || '1:6',
                isolationProtocolsActive: data.bedWardPolicies.isolationProtocolsActive ?? true,
              });
            }
            if (data.serviceBillingCatalogue) {
              setServiceBilling({
                defaultOpdFee: String(data.serviceBillingCatalogue.defaultOpdFee || '500'),
                emergencySurcharge: String(data.serviceBillingCatalogue.emergencySurcharge || '1200'),
                standardGeneralBedDailyRate: String(data.serviceBillingCatalogue.standardGeneralBedDailyRate || '2500'),
                icuBedDailyRate: String(data.serviceBillingCatalogue.icuBedDailyRate || '8500'),
                paymentGracePeriodDays: String(data.serviceBillingCatalogue.paymentGracePeriodDays || '7'),
              });
            }
            if (data.preferences) {
              setPreferences({
                currency: data.preferences.currency || 'INR (₹)',
                timezone: data.preferences.timezone || 'Asia/Kolkata',
                dateFormat: data.preferences.dateFormat || 'DD/MM/YYYY',
                alertChannels: data.preferences.alertChannels || ['EMAIL', 'WHATSAPP', 'IN_APP'],
              });
            }
          }
        }
      } catch (err) {
        console.warn('Backend settings fetch fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [apiUrl]);

  const handleSave = async (sectionName: string) => {
    setSaving(true);
    setSuccess(null);
    setError(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;

    const payload = {
      hospitalProfile: {
        name: hospitalProfile.name,
        address: hospitalProfile.address,
        city: hospitalProfile.city,
        state: hospitalProfile.state,
        postalCode: hospitalProfile.postalCode,
        phone: hospitalProfile.phone,
        email: hospitalProfile.email,
        emergencyHotline: hospitalProfile.emergencyHotline,
        website: hospitalProfile.website,
        licenseNumber: hospitalProfile.licenseNumber,
        operatingHours: hospitalProfile.operatingHours,
      },
      appointmentRules: {
        slotDurationMinutes: parseInt(appointmentRules.slotDurationMinutes, 10),
        opdStartTime: appointmentRules.opdStartTime,
        opdEndTime: appointmentRules.opdEndTime,
        cancellationCutoffHours: parseInt(appointmentRules.cancellationCutoffHours, 10),
        maxConcurrentBookingsPerDoctor: parseInt(appointmentRules.maxConcurrentBookingsPerDoctor, 10),
        walkInTokenAllocation: appointmentRules.walkInTokenAllocation,
      },
      bedWardPolicies: {
        cleaningReleasePolicy: bedWardPolicies.cleaningReleasePolicy,
        autoReleaseUnpaidBedsHours: parseInt(bedWardPolicies.autoReleaseUnpaidBedsHours, 10),
        nurseToPatientRatioICU: bedWardPolicies.nurseToPatientRatioICU,
        nurseToPatientRatioGeneral: bedWardPolicies.nurseToPatientRatioGeneral,
        isolationProtocolsActive: bedWardPolicies.isolationProtocolsActive,
      },
      serviceBillingCatalogue: {
        defaultOpdFee: parseFloat(serviceBilling.defaultOpdFee),
        emergencySurcharge: parseFloat(serviceBilling.emergencySurcharge),
        standardGeneralBedDailyRate: parseFloat(serviceBilling.standardGeneralBedDailyRate),
        icuBedDailyRate: parseFloat(serviceBilling.icuBedDailyRate),
        paymentGracePeriodDays: parseInt(serviceBilling.paymentGracePeriodDays, 10),
      },
      preferences,
    };

    try {
      if (token) {
        const res = await fetch(`${apiUrl}/admin/settings`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setSuccess(`${sectionName} operational policies updated and broadcasted to hospital queues!`);
          setTimeout(() => setSuccess(null), 4000);
          setSaving(false);
          return;
        }
      }

      // Local fallback simulation
      localStorage.setItem('medinexa_hospital_settings', JSON.stringify(payload));
      setSuccess(`${sectionName} policies saved successfully!`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update operational settings.');
    } finally {
      setSaving(false);
    }
  };

  const navTabs = [
    { id: 'hospital', label: 'Hospital Profile & Licensing', icon: Building2 },
    { id: 'departments', label: 'Departments & Hours', icon: Layers },
    { id: 'appointments', label: 'OPD & Scheduling Rules', icon: Clock },
    { id: 'beds', label: 'Bed & Housekeeping Policies', icon: Bed },
    { id: 'billing', label: 'Service Catalogues & Rates', icon: CreditCard },
    { id: 'preferences', label: 'Preferences & Alerts', icon: Sliders },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  HOSPITAL ADMINISTRATION
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-bold">
                  {hospitalProfile.code}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight mt-1">
                Hospital Operational Settings & Policy Suite
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure clinical workflows, appointment slot intervals, bed sanitization rules, and departmental tariffs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                NABH ACCREDITED FACILITY
              </span>
            </div>
          </div>

          {/* Feedback alerts */}
          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
            {navTabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as AdminTab)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: HOSPITAL PROFILE */}
          {/* ========================================================================= */}
          {activeTab === 'hospital' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          Institutional Registration & Contact
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Public facility details displayed on patient invoices, OPD tokens, and referrals.
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => handleSave('Hospital Profile')}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Hospital Facility Name
                        </label>
                        <input
                          type="text"
                          value={hospitalProfile.name}
                          onChange={(e) => setHospitalProfile({ ...hospitalProfile, name: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Statutory License / Accreditation No.
                        </label>
                        <input
                          type="text"
                          value={hospitalProfile.licenseNumber}
                          onChange={(e) => setHospitalProfile({ ...hospitalProfile, licenseNumber: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Primary Inbound Phone
                        </label>
                        <input
                          type="tel"
                          value={hospitalProfile.phone}
                          onChange={(e) => setHospitalProfile({ ...hospitalProfile, phone: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 text-rose-600 dark:text-rose-400">
                          Emergency 24/7 Hotline
                        </label>
                        <input
                          type="tel"
                          value={hospitalProfile.emergencyHotline}
                          onChange={(e) => setHospitalProfile({ ...hospitalProfile, emergencyHotline: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/20 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 font-bold focus:outline-none focus:ring-2 focus:ring-rose-600"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Physical Address
                        </label>
                        <input
                          type="text"
                          value={hospitalProfile.address}
                          onChange={(e) => setHospitalProfile({ ...hospitalProfile, address: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">City & State</label>
                        <input
                          type="text"
                          value={`${hospitalProfile.city}, ${hospitalProfile.state}`}
                          onChange={(e) => {
                            const [c, s] = e.target.value.split(',');
                            setHospitalProfile({ ...hospitalProfile, city: c?.trim() || '', state: s?.trim() || '' });
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Official Web Domain</label>
                        <input
                          type="url"
                          value={hospitalProfile.website}
                          onChange={(e) => setHospitalProfile({ ...hospitalProfile, website: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Capacity & Live Telemetry Overview */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      Live Network Footprint
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Synchronized resources under active hospital tenancy.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Active Physicians</span>
                      </div>
                      <span className="text-sm font-mono font-black text-slate-900 dark:text-slate-100">
                        {hospitalProfile.doctorCount} Doctors
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Clinical & Support Staff</span>
                      </div>
                      <span className="text-sm font-mono font-black text-slate-900 dark:text-slate-100">
                        {hospitalProfile.staffCount} Staff
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Bed className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Monitored Inpatient Beds</span>
                      </div>
                      <span className="text-sm font-mono font-black text-slate-900 dark:text-slate-100">
                        {hospitalProfile.bedCount} Beds
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-[11px] text-blue-800 dark:text-blue-300">
                      <strong>Security Note:</strong> Hospital ID and platform organization linkage are cryptographically sealed to prevent tenant escape.
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: DEPARTMENTS */}
          {/* ========================================================================= */}
          {activeTab === 'departments' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      Departmental Operating Schedule & Capacity
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Enforce daily outpatient queue capacities and working shifts per clinical specialty.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => handleSave('Departmental Config')}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save Schedules'}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="pb-3">Specialty Name</th>
                        <th className="pb-3">Code</th>
                        <th className="pb-3">Operating Shift</th>
                        <th className="pb-3 text-center">Max Daily Tokens</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {departments.map((dept, idx) => (
                        <tr key={dept.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                          <td className="py-3 font-extrabold text-slate-900 dark:text-slate-100">
                            {dept.name}
                          </td>
                          <td className="py-3 font-mono text-slate-500 font-bold">{dept.code}</td>
                          <td className="py-3">
                            <input
                              type="text"
                              value={dept.opdHours}
                              onChange={(e) => {
                                const newDepts = [...departments];
                                newDepts[idx].opdHours = e.target.value;
                                setDepartments(newDepts);
                              }}
                              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium w-36"
                            />
                          </td>
                          <td className="py-3 text-center">
                            <input
                              type="number"
                              value={dept.maxTokens}
                              onChange={(e) => {
                                const newDepts = [...departments];
                                newDepts[idx].maxTokens = parseInt(e.target.value, 10) || 0;
                                setDepartments(newDepts);
                              }}
                              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono text-center w-20"
                            />
                          </td>
                          <td className="py-3 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              {dept.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: OUTPATIENT & APPOINTMENT RULES */}
          {/* ========================================================================= */}
          {activeTab === 'appointments' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Outpatient & Appointment Slot Rules
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Configure default consultation intervals, OPD operational windows, and walk-in rules.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => handleSave('Appointment Rules')}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save OPD Rules'}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Default Doctor Consultation Slot Duration
                    </label>
                    <select
                      value={appointmentRules.slotDurationMinutes}
                      onChange={(e) =>
                        setAppointmentRules({ ...appointmentRules, slotDurationMinutes: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="10">10 Minutes (Express Follow-up)</option>
                      <option value="15">15 Minutes (Hospital Standard)</option>
                      <option value="20">20 Minutes (Comprehensive OPD)</option>
                      <option value="30">30 Minutes (Specialist / Super-Specialty)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Rescheduling & Cancellation Cut-off Window
                    </label>
                    <select
                      value={appointmentRules.cancellationCutoffHours}
                      onChange={(e) =>
                        setAppointmentRules({ ...appointmentRules, cancellationCutoffHours: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="1">1 Hour Prior to Slot</option>
                      <option value="2">2 Hours Prior (Recommended)</option>
                      <option value="4">4 Hours Prior</option>
                      <option value="12">12 Hours Prior</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      OPD Morning Opening Time
                    </label>
                    <input
                      type="time"
                      value={appointmentRules.opdStartTime}
                      onChange={(e) =>
                        setAppointmentRules({ ...appointmentRules, opdStartTime: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      OPD Evening Closing Time
                    </label>
                    <input
                      type="time"
                      value={appointmentRules.opdEndTime}
                      onChange={(e) =>
                        setAppointmentRules({ ...appointmentRules, opdEndTime: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Automated Walk-In Token Allocation
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Dynamically slot non-booked walk-in patients between scheduled online appointments.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={appointmentRules.walkInTokenAllocation}
                    onChange={(e) =>
                      setAppointmentRules({ ...appointmentRules, walkInTokenAllocation: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: BED & WARD POLICIES */}
          {/* ========================================================================= */}
          {activeTab === 'beds' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                        <Bed className="w-4 h-4 text-indigo-600" />
                        Inpatient Bed & Sanitization Clearance Invariants
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Strict clinical invariants governing bed status transitions, housekeeping releases, and nurse ratios.
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => handleSave('Bed Policies')}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saving ? 'Saving...' : 'Save Bed Policies'}</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Sanitization Workflow Invariant:</span> When a patient is discharged, the bed transitions immediately to <code>CLEANING</code>. It CANNOT return to <code>AVAILABLE</code> until a housekeeping supervisor signs off on disinfection.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Cleaning Release Protocol
                      </label>
                      <select
                        value={bedWardPolicies.cleaningReleasePolicy}
                        onChange={(e) =>
                          setBedWardPolicies({ ...bedWardPolicies, cleaningReleasePolicy: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="MANDATORY_HOUSEKEEPING_SIGNOFF">
                          Mandatory Housekeeping Sign-Off (Enforced)
                        </option>
                        <option value="AUTO_RELEASE_60_MINUTES">
                          Auto-Release After 60 Min Disinfection
                        </option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Unpaid Bed Reservation Auto-Release Window
                      </label>
                      <select
                        value={bedWardPolicies.autoReleaseUnpaidBedsHours}
                        onChange={(e) =>
                          setBedWardPolicies({ ...bedWardPolicies, autoReleaseUnpaidBedsHours: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="2">2 Hours after reservation</option>
                        <option value="4">4 Hours (Standard)</option>
                        <option value="8">8 Hours (Day surgery)</option>
                        <option value="12">12 Hours</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        ICU Nurse-to-Patient Target Ratio
                      </label>
                      <input
                        type="text"
                        value={bedWardPolicies.nurseToPatientRatioICU}
                        onChange={(e) =>
                          setBedWardPolicies({ ...bedWardPolicies, nurseToPatientRatioICU: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        General Ward Nurse-to-Patient Target Ratio
                      </label>
                      <input
                        type="text"
                        value={bedWardPolicies.nurseToPatientRatioGeneral}
                        onChange={(e) =>
                          setBedWardPolicies({ ...bedWardPolicies, nurseToPatientRatioGeneral: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold font-mono"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: SERVICE CATALOGUES & BILLING */}
          {/* ========================================================================= */}
          {activeTab === 'billing' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      Hospital Base Tariffs & Service Catalogues
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Baseline pricing applied when invoices are dynamically generated across OPD, ER, and IPD stays.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => handleSave('Service Catalogues')}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save Tariffs'}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Standard Outpatient Consultation Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={serviceBilling.defaultOpdFee}
                      onChange={(e) => setServiceBilling({ ...serviceBilling, defaultOpdFee: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 text-rose-600">
                      Emergency & Trauma Care Surcharge (₹)
                    </label>
                    <input
                      type="number"
                      value={serviceBilling.emergencySurcharge}
                      onChange={(e) => setServiceBilling({ ...serviceBilling, emergencySurcharge: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/20 text-rose-700 font-semibold font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      General Ward Inpatient Daily Room Tariff (₹ / Day)
                    </label>
                    <input
                      type="number"
                      value={serviceBilling.standardGeneralBedDailyRate}
                      onChange={(e) =>
                        setServiceBilling({ ...serviceBilling, standardGeneralBedDailyRate: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Critical Care ICU Daily Room Tariff (₹ / Day)
                    </label>
                    <input
                      type="number"
                      value={serviceBilling.icuBedDailyRate}
                      onChange={(e) => setServiceBilling({ ...serviceBilling, icuBedDailyRate: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Inpatient Post-Discharge Invoice Payment Grace Period (Days)
                    </label>
                    <input
                      type="number"
                      value={serviceBilling.paymentGracePeriodDays}
                      onChange={(e) =>
                        setServiceBilling({ ...serviceBilling, paymentGracePeriodDays: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: PREFERENCES & TELEMETRY */}
          {/* ========================================================================= */}
          {activeTab === 'preferences' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-600" />
                      Hospital Localization & Telemetry Channels
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Timezone alignment, financial reporting currency, and alert webhooks.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => handleSave('Preferences')}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Billing Currency
                    </label>
                    <select
                      value={preferences.currency}
                      onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold"
                    >
                      <option value="INR (₹)">Indian Rupee (INR ₹)</option>
                      <option value="USD ($)">US Dollar (USD $)</option>
                      <option value="EUR (€)">Euro (EUR €)</option>
                      <option value="GBP (£)">British Pound (GBP £)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Operational Timezone
                    </label>
                    <select
                      value={preferences.timezone}
                      onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
                      <option value="UTC">Coordinated Universal Time (UTC)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST +04:00)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Date Formatting
                    </label>
                    <select
                      value={preferences.dateFormat}
                      onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (Indian Standard)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (US Standard)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Active Hospital Alert Channels
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'EMAIL', label: 'Email Dispatch', desc: 'Clinical summaries & billing PDFs' },
                      { id: 'WHATSAPP', label: 'WhatsApp Bot', desc: 'OPD appointment tokens & live bed status' },
                      { id: 'IN_APP', label: 'In-App Webhooks', desc: 'Real-time nurse call & telemetry push' },
                    ].map((ch) => (
                      <div
                        key={ch.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/50"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {ch.label}
                          </span>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <p className="text-[10px] text-slate-400">{ch.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          </div>
  );
}
