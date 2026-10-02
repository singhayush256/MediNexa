'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Stethoscope,
  Building2,
  CalendarCheck,
  Clock,
  Bed,
  ShieldCheck,
  DoorOpen,
  Activity,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Shield,
  FileText,
  Database,
  Sliders,
  UserCheck,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { getApiBaseUrl, fetchWithTimeout } from '@/lib/api-config';
import {
  getHospitalProfile,
  getHospitalAdminMetrics,
  getHospitalStaffList,
} from '@/lib/hospital-canonical-data';
import { subscribeTelemetry } from '@/lib/realtime-telemetry';

export default function HospitalAdminExecutiveOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [hospitalName, setHospitalName] = useState('MediNexa General Hospital (Hospital A)');
  const [activeHospitalId, setActiveHospitalId] = useState('HOSPITAL_A');
  const [adminName, setAdminName] = useState('Dr. Sunita Singh (Hospital Admin)');

  const [metrics, setMetrics] = useState({
    totalPatients: 142,
    activeAdmissions: 28,
    todayAppointments: 34,
    availableBeds: 22,
    occupiedBeds: 28,
    emergencyPatients: 8,
    doctorsOnDuty: 8,
    pendingLabOrders: 7,
    pendingPharmacyOrders: 9,
    todayRevenue: 248500,
    pendingPayments: 4,
  });

  const loadAdminMetrics = async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    const activeHosp = typeof window !== 'undefined' ? localStorage.getItem('medinexa_active_hospital_id') || 'HOSPITAL_A' : 'HOSPITAL_A';
    setActiveHospitalId(activeHosp);

    const profile = getHospitalProfile(null, activeHosp);
    if (profile?.name) setHospitalName(profile.name);

    if (typeof window !== 'undefined') {
      const uStr = localStorage.getItem('medinexa_user');
      if (uStr) {
        try {
          const u = JSON.parse(uStr);
          if (u.firstName || u.lastName) {
            setAdminName(`${u.firstName || ''} ${u.lastName || ''} (Admin)`.trim());
          }
        } catch (e) {}
      }
    }

    const apiUrl = getApiBaseUrl();

    try {
      const [bedStats, admStats, staffList] = await Promise.all([
        fetchWithTimeout(`${apiUrl}/beds/analytics/occupancy`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }, 5000).then((r) => r.json()).catch(() => null),
        fetchWithTimeout(`${apiUrl}/admissions/stats/overview`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }, 5000).then((r) => r.json()).catch(() => null),
        getHospitalStaffList(undefined, activeHosp),
      ]);

      const baseMetrics = getHospitalAdminMetrics();

      setMetrics((prev) => ({
        ...prev,
        ...baseMetrics.kpiCards,
        occupiedBeds: bedStats?.occupiedBeds || prev.occupiedBeds,
        availableBeds: bedStats?.availableBeds || prev.availableBeds,
        activeAdmissions: admStats?.activeAdmissionsCount || prev.activeAdmissions,
        doctorsOnDuty: staffList.filter((s) => s.roleCode === 'DOCTOR' && s.status === 'ACTIVE').length || prev.doctorsOnDuty,
      }));
    } catch (err) {
      console.warn('Admin load warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminMetrics();
    const unsub = subscribeTelemetry(() => {
      loadAdminMetrics();
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col font-sans transition-colors duration-200">
      <DashboardNav />
      <div className="flex-1 flex min-h-[calc(100vh-4rem)]">
        <DashboardSidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hospital Administration Command</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Executive Hospital Overview
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                <span className="font-bold text-slate-800 dark:text-slate-200">{hospitalName}</span>
                <span>•</span>
                <span className="font-semibold">{adminName}</span>
                <span>•</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  Realtime Database Connected
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadAdminMetrics}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Telemetry</span>
              </button>
              <Link
                href="/dashboard/admin/hospital-profile"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-600/20"
              >
                Facility Settings →
              </Link>
            </div>
          </div>

          {/* Section 40: 11 Canonical Executive KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { title: 'Total Patients', value: metrics.totalPatients, subtitle: 'Canonical records', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40', href: '/dashboard/patients' },
              { title: 'Active Admissions', value: metrics.activeAdmissions, subtitle: 'Inpatient roster', icon: DoorOpen, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40', href: '/dashboard/admissions' },
              { title: "Today's Appointments", value: metrics.todayAppointments, subtitle: 'Confirmed OPD', icon: CalendarCheck, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40', href: '/dashboard/appointments' },
              { title: 'Available Beds', value: metrics.availableBeds, subtitle: 'Free for admission', icon: Bed, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40', href: '/dashboard/hospital/beds' },
              { title: 'Occupied Beds', value: metrics.occupiedBeds, subtitle: 'Bed allocation active', icon: Bed, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40', href: '/dashboard/hospital/beds' },
              { title: 'Emergency Patients', value: metrics.emergencyPatients, subtitle: 'Trauma & acute cases', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40', href: '/dashboard/emergency' },
              { title: 'Doctors On Duty', value: metrics.doctorsOnDuty, subtitle: 'Active shift roster', icon: Stethoscope, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/40', href: '/dashboard/admin/doctors' },
              { title: 'Pending Lab Orders', value: metrics.pendingLabOrders, subtitle: 'Diagnostic backlog', icon: FileText, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/40', href: '/dashboard/lab' },
              { title: 'Pending Pharmacy', value: metrics.pendingPharmacyOrders, subtitle: 'Prescriptions in queue', icon: Sliders, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/40', href: '/dashboard/pharmacy' },
              { title: "Today's Revenue", value: `₹${metrics.todayRevenue.toLocaleString('en-IN')}`, subtitle: 'Authoritative billing', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40', href: '/dashboard/revenue' },
              { title: 'Pending Payments', value: metrics.pendingPayments, subtitle: 'Awaiting clearance', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40', href: '/dashboard/billing' },
            ].map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <Link
                  key={idx}
                  href={kpi.href}
                  className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition shadow-xs group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {kpi.title}
                    </span>
                    <div className={`p-2 rounded-xl ${kpi.bg}`}>
                      <Icon className={`w-4 h-4 ${kpi.color}`} />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 transition">
                      {kpi.value}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                      {kpi.subtitle}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Admin Modules Navigation Matrix */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Hospital Administration Modules</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Staff Management', desc: 'Manage doctors, nurses, paramedics with canonical Staff Login IDs', href: '/dashboard/admin/staff', icon: Users, badge: 'HRMS' },
                { title: 'Doctor Administration', desc: 'Specialties, consultation fees, and clinical schedule alignment', href: '/dashboard/admin/doctors', icon: Stethoscope, badge: 'Clinical' },
                { title: 'Operations Managers', desc: 'Floor coordinators, ward managers, and operational assignments', href: '/dashboard/admin/managers', icon: UserCheck, badge: 'Operations' },
                { title: 'Departments & Units', desc: 'Configure clinical units, heads of department, and bed allocations', href: '/dashboard/admin/departments', icon: Building2, badge: 'Infrastructure' },
                { title: 'Roles & RBAC Matrix', desc: 'Backend permission system, privileges, and facility isolation', href: '/dashboard/admin/roles', icon: ShieldCheck, badge: 'Security' },
                { title: 'Shifts & Rosters', desc: 'Master shift planning, duty hours, and coverage persistence', href: '/dashboard/admin/shifts', icon: CalendarCheck, badge: 'Roster' },
                { title: 'Staff Attendance', desc: 'Biometric punches, late arrivals, overtime, and leave audits', href: '/dashboard/admin/attendance', icon: Clock, badge: 'Punches' },
                { title: 'Biomedical Assets', desc: 'Equipment tracking, calibration schedules, and warranty log', href: '/dashboard/admin/assets', icon: Sliders, badge: 'Biomed' },
                { title: 'Hospital Profile', desc: 'Facility credentials, registered address, and phone numbers', href: '/dashboard/admin/hospital-profile', icon: Building2, badge: 'Profile' },
                { title: 'Audit Trail & Compliance', desc: 'Immutable action logging, PHI access audits, and event security', href: '/dashboard/admin/audit-logs', icon: FileText, badge: 'Audit' },
                { title: 'Demo Data Synchronization', desc: 'Database-backed demo generation status and validation', href: '/dashboard/admin/demo-data', icon: Database, badge: 'Demo' },
                { title: 'Backup & Disaster Recovery', desc: 'PostgreSQL snapshots, replication status, and cold backup', href: '/dashboard/admin/backup', icon: Database, badge: 'Backup' },
              ].map((mod, idx) => {
                const Icon = mod.icon;
                return (
                  <Link
                    key={idx}
                    href={mod.href}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition shadow-xs flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {mod.badge}
                        </span>
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600">
                      <span>Open Module</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
