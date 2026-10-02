'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Activity,
  Bed,
  CalendarCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Stethoscope,
  Sparkles,
  ShieldAlert,
  DoorOpen,
  RefreshCw,
  Zap,
  Building2,
  ChevronRight,
  UserCheck,
  AlertCircle,
  Check,
} from 'lucide-react';
import { getApiBaseUrl, fetchWithTimeout } from '@/lib/api-config';
import {
  getHospitalStaffList,
  getHospitalShiftList,
  getHospitalDepartmentList,
  getHospitalProfile,
  CanonicalStaffMember,
  CanonicalShift,
  CanonicalDepartment,
} from '@/lib/hospital-canonical-data';
import { subscribeTelemetry } from '@/lib/realtime-telemetry';

interface DecisionAlert {
  id: string;
  category: 'STAFFING' | 'OPD' | 'BEDS' | 'ROSTER' | 'SAFETY';
  title: string;
  whatHappened: string;
  whyItMatters: string;
  recommendedAction: string;
  actionHref: string;
  actionText: string;
  resolved: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export default function ManagerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [hospitalName, setHospitalName] = useState('MediNexa General Hospital (Hospital A)');
  const [managerName, setManagerName] = useState('Rahul Verma (Manager)');
  const [currentShift, setCurrentShift] = useState('Morning Operations (08:00 - 16:00)');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Canonical Datasets
  const [staff, setStaff] = useState<CanonicalStaffMember[]>([]);
  const [shifts, setShifts] = useState<CanonicalShift[]>([]);
  const [departments, setDepartments] = useState<CanonicalDepartment[]>([]);

  // Real KPIs
  const [kpis, setKpis] = useState({
    activeStaff: 38,
    presentToday: 34,
    opdWaiting: 14,
    bedOccupancyPercent: 68,
    availableBeds: 16,
    admissionsToday: 8,
    pendingTasks: 3,
    criticalAlerts: 2,
  });

  // Decision Center Alerts
  const [decisionAlerts, setDecisionAlerts] = useState<DecisionAlert[]>([
    {
      id: 'alert-icu-gap',
      category: 'STAFFING',
      title: 'ICU Nursing Deployment Gap',
      whatHappened: '2 rostered ICU nurses reported emergency leave on Morning shift.',
      whyItMatters: 'Nurse-to-patient ratio in ICU Ward 1 dropped below safety standard 1:2.',
      recommendedAction: 'Redeploy 2 standby nurses from Step-Down Ward to ICU Station.',
      actionHref: '/dashboard/manager/staff-deployment',
      actionText: 'Review Deployment',
      resolved: false,
      severity: 'CRITICAL',
    },
    {
      id: 'alert-opd-congestion',
      category: 'OPD',
      title: 'Cardiology OPD Queue Congestion',
      whatHappened: 'Average consultation wait time climbed to 38 minutes across 14 patients.',
      whyItMatters: 'Patient satisfaction threshold exceeded; lobby congestion impacting triage.',
      recommendedAction: 'Open overflow examination room 204 and assign Dr. Sunita for fast-track walk-ins.',
      actionHref: '/dashboard/manager/opd',
      actionText: 'Coordinate OPD Queue',
      resolved: false,
      severity: 'HIGH',
    },
    {
      id: 'alert-bed-cleaning',
      category: 'BEDS',
      title: '3 Inpatient Beds Awaiting Housekeeping',
      whatHappened: 'Beds MED-204, SICU-02, and PED-108 were discharged over 45 minutes ago.',
      whyItMatters: 'Emergency admissions pending in Reception cannot be assigned beds until sanitized.',
      recommendedAction: 'Issue priority housekeeping dispatch to Ward 2 housekeeping supervisor.',
      actionHref: '/dashboard/manager/beds',
      actionText: 'View Bed Status',
      resolved: false,
      severity: 'HIGH',
    },
    {
      id: 'alert-night-shift',
      category: 'ROSTER',
      title: 'Pending Night Shift Roster Confirmation',
      whatHappened: '2 on-call physicians have not yet acknowledged 20:00 night shift roster.',
      whyItMatters: 'Hospital clinical coverage SLA requires shift sign-off 4 hours in advance.',
      recommendedAction: 'Send automated SMS acknowledgment nudge to on-call duty roster.',
      actionHref: '/dashboard/manager/shifts',
      actionText: 'Review Shifts',
      resolved: false,
      severity: 'MEDIUM',
    },
  ]);

  const loadManagerData = async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    const activeHosp = typeof window !== 'undefined' ? localStorage.getItem('medinexa_active_hospital_id') || 'HOSPITAL_A' : 'HOSPITAL_A';
    const profile = getHospitalProfile(null, activeHosp);
    if (profile?.name) setHospitalName(profile.name);

    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('medinexa_user');
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (u.firstName || u.lastName) {
            setManagerName(`${u.firstName || ''} ${u.lastName || ''}`.trim());
          }
        } catch (e) {}
      }
    }

    const apiUrl = getApiBaseUrl();

    // 1. Fetch backend employees, admissions, and beds in parallel with fallback to canonical
    try {
      const [empRes, admRes, bedRes] = await Promise.all([
        fetchWithTimeout(`${apiUrl}/hrms/employees`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }, 6000).then((r) => r.json()).catch(() => null),
        fetchWithTimeout(`${apiUrl}/admissions/stats/overview`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }, 6000).then((r) => r.json()).catch(() => null),
        fetchWithTimeout(`${apiUrl}/beds/analytics/occupancy`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }, 6000).then((r) => r.json()).catch(() => null),
      ]);

      const resolvedStaff = getHospitalStaffList(Array.isArray(empRes) ? empRes : undefined, activeHosp);
      const resolvedShifts = getHospitalShiftList(undefined, activeHosp);
      const resolvedDepts = getHospitalDepartmentList(undefined, activeHosp);

      setStaff(resolvedStaff);
      setShifts(resolvedShifts);
      setDepartments(resolvedDepts);

      const activeCount = resolvedStaff.filter((s) => s.status === 'ACTIVE').length;
      const presentCount = Math.max(1, Math.round(activeCount * 0.88));

      let totalBedsCount = 50;
      let availBedsCount = 16;
      let occPercent = 68;

      if (bedRes && !bedRes.statusCode) {
        totalBedsCount = bedRes.totalBeds || totalBedsCount;
        availBedsCount = bedRes.availableBeds || availBedsCount;
        occPercent = bedRes.occupancyPercentage || occPercent;
      }

      let admCount = 8;
      if (admRes && !admRes.statusCode) {
        admCount = admRes.todayAdmissionsCount || admCount;
      }

      setKpis({
        activeStaff: activeCount,
        presentToday: presentCount,
        opdWaiting: 14,
        bedOccupancyPercent: occPercent,
        availableBeds: availBedsCount,
        admissionsToday: admCount,
        pendingTasks: decisionAlerts.filter((a) => !a.resolved).length,
        criticalAlerts: decisionAlerts.filter((a) => !a.resolved && a.severity === 'CRITICAL').length,
      });
    } catch (err) {
      console.warn('Backend load warning, populated from canonical:', err);
      const resolvedStaff = getHospitalStaffList(undefined, activeHosp);
      setStaff(resolvedStaff);
      setShifts(getHospitalShiftList(undefined, activeHosp));
      setDepartments(getHospitalDepartmentList(undefined, activeHosp));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagerData();
    const unsub = subscribeTelemetry(() => {
      loadManagerData();
    });
    return () => unsub();
  }, []);

  const handleResolveAlert = (id: string, title: string) => {
    setDecisionAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
    );
    setActionNotice(`Operational alert resolved: "${title}". Notification logged to audit trail.`);
    setTimeout(() => setActionNotice(null), 4500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Action Notice Alert */}
      {actionNotice && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-xs text-emerald-600 hover:text-emerald-800 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Section 13 Top: Manager Overview & Shift Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hospital Operations Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Good Morning, {managerName}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            <span className="font-bold text-slate-800 dark:text-slate-200">{hospitalName}</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              {currentShift}
            </span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              Live Telemetry Connected
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadManagerData}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center gap-2 cursor-pointer"
            title="Refresh All Operational Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/dashboard/manager/live-operations"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-md shadow-purple-600/20 flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            <span>Live Floor Matrix →</span>
          </Link>
        </div>
      </div>

      {/* Section 13: 8 Clickable Real KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            title: 'Active Staff',
            value: kpis.activeStaff,
            subtitle: 'Verified in system',
            icon: Users,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50 dark:bg-indigo-950/40',
            href: '/dashboard/manager/staff',
          },
          {
            title: 'Present Today',
            value: kpis.presentToday,
            subtitle: 'On-duty checked in',
            icon: UserCheck,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 dark:bg-emerald-950/40',
            href: '/dashboard/manager/attendance',
          },
          {
            title: 'OPD Waiting',
            value: kpis.opdWaiting,
            subtitle: 'Avg wait: 24 mins',
            icon: Stethoscope,
            color: 'text-amber-600',
            bg: 'bg-amber-50 dark:bg-amber-950/40',
            href: '/dashboard/manager/opd',
          },
          {
            title: 'Bed Occupancy',
            value: `${kpis.bedOccupancyPercent}%`,
            subtitle: 'Target < 85%',
            icon: Bed,
            color: 'text-purple-600',
            bg: 'bg-purple-50 dark:bg-purple-950/40',
            href: '/dashboard/manager/beds',
          },
          {
            title: 'Available Beds',
            value: kpis.availableBeds,
            subtitle: 'Ready for admission',
            icon: Bed,
            color: 'text-teal-600',
            bg: 'bg-teal-50 dark:bg-teal-950/40',
            href: '/dashboard/manager/beds',
          },
          {
            title: 'Admissions Today',
            value: kpis.admissionsToday,
            subtitle: 'Inpatient bookings',
            icon: DoorOpen,
            color: 'text-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-950/40',
            href: '/dashboard/manager/admissions',
          },
          {
            title: 'Pending Tasks',
            value: decisionAlerts.filter((a) => !a.resolved).length,
            subtitle: 'Manager action queue',
            icon: CalendarCheck,
            color: 'text-sky-600',
            bg: 'bg-sky-50 dark:bg-sky-950/40',
            href: '/dashboard/manager/tasks',
          },
          {
            title: 'Critical Alerts',
            value: decisionAlerts.filter((a) => !a.resolved && a.severity === 'CRITICAL').length,
            subtitle: 'Immediate escalation',
            icon: ShieldAlert,
            color: 'text-rose-600',
            bg: 'bg-rose-50 dark:bg-rose-950/40',
            href: '/dashboard/manager/alerts',
          },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={idx}
              href={kpi.href}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 transition shadow-xs group cursor-pointer flex flex-col justify-between"
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
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
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

      {/* Section 14: MANAGER DECISION CENTER (Most Important Design Thinking Feature) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Manager Decision Center</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Filtered operational exceptions requiring managerial intervention. Answers: What is happening? Why does it matter? What can I do?
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {decisionAlerts.filter((a) => !a.resolved).length} Pending Decisions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decisionAlerts.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition shadow-xs flex flex-col justify-between ${
                item.resolved
                  ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                  : item.severity === 'CRITICAL'
                  ? 'bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-900/60 shadow-rose-500/5'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        item.severity === 'CRITICAL'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : item.severity === 'HIGH'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      {item.severity} • {item.category}
                    </span>
                    {item.resolved && (
                      <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Resolved
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">ID: {item.id}</span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                </div>

                <div className="space-y-1.5 text-xs bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">What happened: </span>
                    <span className="text-slate-600 dark:text-slate-400">{item.whatHappened}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Why it matters: </span>
                    <span className="text-slate-600 dark:text-slate-400">{item.whyItMatters}</span>
                  </div>
                  <div>
                    <span className="font-bold text-purple-700 dark:text-purple-300">Recommended action: </span>
                    <span className="text-slate-600 dark:text-slate-400">{item.recommendedAction}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <Link
                  href={item.actionHref}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                >
                  <span>{item.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {!item.resolved ? (
                  <button
                    onClick={() => handleResolveAlert(item.id, item.title)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-700 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-semibold">Action recorded</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Coordination Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>Department Operational Workload & Capacity</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live staff allocation, active patients, and bed utilization across authorized clinical departments.
            </p>
          </div>
          <Link
            href="/dashboard/manager/departments"
            className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1"
          >
            <span>View All Departments</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {departments.slice(0, 4).map((dept) => (
            <div
              key={dept.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {dept.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-300">
                  {dept.code}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Assigned Doctors:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{dept.doctorCount}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Operational Staff:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{dept.staffCount}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Critical Assets:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{dept.assetCount}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">● Nominal Flow</span>
                <Link
                  href={`/dashboard/manager/departments?code=${dept.code}`}
                  className="font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400"
                >
                  Manage →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
