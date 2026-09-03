'use client';

import React, { useEffect, useState } from 'react';
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
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Bot,
  Video,
  FileText,
  Plus,
  Stethoscope,
  Filter,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  StatCard,
  AreaTrendChart,
  BarBreakdownChart,
  DonutChart,
  ActivityFeed,
  CommandPalette,
} from '@/components/ui';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeRoleView, setActiveRoleView] = useState<string>('HOSPITAL_ADMIN');

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('medinexa_token') || localStorage.getItem('token')
        : null;

    if (!token) {
      router.replace('/login');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

    fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((userData) => {
        if (userData) {
          setUser(userData);
          const r = userData.roleCode || userData.role?.code || 'HOSPITAL_ADMIN';
          setActiveRoleView(r);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  // Demo perspective switcher options
  const roleViews = [
    { id: 'HOSPITAL_ADMIN', label: 'Admin View', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'DOCTOR', label: 'Doctor View', icon: <Stethoscope className="w-3.5 h-3.5" /> },
    { id: 'NURSE', label: 'Nurse View', icon: <HeartPulse className="w-3.5 h-3.5" /> },
    { id: 'LAB_STAFF', label: 'Lab View', icon: <FlaskConical className="w-3.5 h-3.5" /> },
    { id: 'PHARMACY_STAFF', label: 'Pharmacy View', icon: <Pill className="w-3.5 h-3.5" /> },
    { id: 'INSURANCE', label: 'Insurance View', icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  // Dummy activity items for feeds
  const activityItems: any[] = [
    {
      id: 'a1',
      actorName: 'Dr. Sarah Smith',
      action: 'completed emergency triage for',
      target: 'Patient #MRN-8921',
      category: 'CLINICAL',
      timestamp: '4m ago',
    },
    {
      id: 'a2',
      actorName: 'Charge Nurse Miller',
      action: 'updated vitals on Ward ICU-B',
      target: 'Bed #04',
      category: 'OPERATIONS',
      timestamp: '12m ago',
    },
    {
      id: 'a3',
      actorName: 'Laboratory Analyzer 3',
      action: 'flagged abnormal troponin value STAT for',
      target: 'Jane Doe',
      category: 'EMERGENCY',
      timestamp: '22m ago',
      urgent: true,
    },
    {
      id: 'a4',
      actorName: 'Billing & Claims Engine',
      action: 'batched pre-authorization settlement of',
      target: '$14,250.00 to BlueCross',
      category: 'BILLING',
      timestamp: '1h ago',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col font-sans transition-colors duration-200">
      <DashboardNav user={user} />
      <CommandPalette />

      <div className="flex-1 flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <DashboardSidebar role={user?.roleCode || user?.role?.code} />

        {/* Main Workstation Container */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Top Bar: Role View Switcher & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                  OPERATIONAL COMMAND CENTER
                </span>
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Live Hospital Sync
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
                {activeRoleView === 'HOSPITAL_ADMIN' && 'Hospital Executive Command Center'}
                {activeRoleView === 'DOCTOR' && 'Physician Clinical Workstation'}
                {activeRoleView === 'NURSE' && 'Inpatient Nursing & Ward Station'}
                {activeRoleView === 'LAB_STAFF' && 'Pathology & Diagnostic Laboratory Console'}
                {activeRoleView === 'PHARMACY_STAFF' && 'Formulary & Pharmacy Dispense Station'}
                {activeRoleView === 'INSURANCE' && 'Insurance Claims & Pre-Authorization Portal'}
              </h1>
            </div>

            {/* Role Perspective Switcher for Demos & Reviewers */}
            <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-subtle overflow-x-auto max-w-full">
              {roleViews.map((rv) => (
                <button
                  key={rv.id}
                  onClick={() => setActiveRoleView(rv.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeRoleView === rv.id
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {rv.icon}
                  <span>{rv.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* VIEW 1: HOSPITAL ADMIN DASHBOARD                          */}
          {/* ========================================================= */}
          {activeRoleView === 'HOSPITAL_ADMIN' && (
            <div className="space-y-6">
              {/* KPI Stat Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard
                  title="Revenue (MTD)"
                  value="$284.5K"
                  change="+14.2%"
                  trend="up"
                  subtext="vs last month"
                  icon={<CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                />
                <StatCard
                  title="Active Patients"
                  value="1,420"
                  change="+8.1%"
                  trend="up"
                  subtext="314 admitted"
                  icon={<Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
                />
                <StatCard
                  title="Admissions"
                  value="48"
                  change="94% Occ"
                  trend="neutral"
                  subtext="12 discharges today"
                  icon={<Bed className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                />
                <StatCard
                  title="Claims Filed"
                  value="164"
                  change="92% Auth"
                  trend="up"
                  subtext="$182K settled"
                  icon={<Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                />
                <StatCard
                  title="Lab Orders"
                  value="318"
                  change="32m TAT"
                  trend="up"
                  subtext="9 pending verify"
                  icon={<FlaskConical className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                />
                <StatCard
                  title="Prescriptions"
                  value="542"
                  change="+19%"
                  trend="up"
                  subtext="99.2% formulary"
                  icon={<Pill className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                />
              </div>

              {/* Main Charts & Telemetry */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Trend Area Chart */}
                <Card className="lg:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle>Hospital Revenue & Inpatient Census Trend</CardTitle>
                      <CardDescription>Monthly billing volume and bed occupancy velocity</CardDescription>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                      +18.4% YoY Growth
                    </span>
                  </CardHeader>
                  <CardContent>
                    <AreaTrendChart
                      data={[
                        { label: 'Jan', value: 180 },
                        { label: 'Feb', value: 210 },
                        { label: 'Mar', value: 195 },
                        { label: 'Apr', value: 240 },
                        { label: 'May', value: 230 },
                        { label: 'Jun', value: 265 },
                        { label: 'Jul', value: 284 },
                      ]}
                      valuePrefix="$"
                      valueSuffix="k"
                      color="#2563EB"
                    />
                  </CardContent>
                </Card>

                {/* Bed Utilization Donut */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ward & Bed Capacity</CardTitle>
                    <CardDescription>Real-time inpatient facility status</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <DonutChart
                      segments={[
                        { label: 'Occupied', value: 142, color: '#2563EB' },
                        { label: 'Available', value: 24, color: '#10B981' },
                        { label: 'Cleaning', value: 8, color: '#F59E0B' },
                        { label: 'Reserved', value: 12, color: '#06B6D4' },
                      ]}
                      centerText="86%"
                      centerSubtext="Capacity"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Activity Feed & Department Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle>Department Admissions Breakdown</CardTitle>
                      <CardDescription>Monthly patient admissions by clinical department</CardDescription>
                    </div>
                    <Button variant="outline" size="xs">
                      View Audit Log
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <BarBreakdownChart
                      items={[
                        { label: 'Emergency & Trauma Care', value: 124, color: '#EF4444' },
                        { label: 'General Surgery & Inpatient', value: 98, color: '#2563EB' },
                        { label: 'Cardiology & Catheterization', value: 76, color: '#06B6D4' },
                        { label: 'Maternity & Neonatal (NICU)', value: 54, color: '#10B981' },
                        { label: 'Pediatrics & Orthopedics', value: 42, color: '#8B5CF6' },
                      ]}
                    />
                  </CardContent>
                </Card>

                {/* Live Activity Feed */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>Real-Time Hospital Feed</CardTitle>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  </CardHeader>
                  <CardContent>
                    <ActivityFeed items={activityItems} />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 2: DOCTOR CLINICAL WORKSTATION                       */}
          {/* ========================================================= */}
          {activeRoleView === 'DOCTOR' && (
            <div className="space-y-6">
              {/* Doctor Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Today's Appointments"
                  value="14"
                  change="6 completed"
                  trend="up"
                  icon={<Calendar className="w-4 h-4 text-blue-500" />}
                />
                <StatCard
                  title="Waiting in Queue"
                  value="4 Patients"
                  change="Avg wait: 8m"
                  trend="neutral"
                  icon={<Clock className="w-4 h-4 text-amber-500" />}
                />
                <StatCard
                  title="Critical Lab Alerts"
                  value="2 STAT"
                  change="Immediate"
                  trend="down"
                  icon={<AlertTriangle className="w-4 h-4 text-rose-500" />}
                  badge="ACTION"
                  badgeColor="rose"
                />
                <StatCard
                  title="Unsigned Encounters"
                  value="3"
                  change="SOAP draft ready"
                  trend="up"
                  icon={<FileText className="w-4 h-4 text-emerald-500" />}
                />
              </div>

              {/* Appointment Queue & Clinical Action Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Patient Queue */}
                <Card className="lg:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle>Clinical Patient Queue</CardTitle>
                      <CardDescription>Scheduled consultations and walk-in triage</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="xs" icon={<Filter className="w-3 h-3" />}>
                        Filter
                      </Button>
                      <Link href="/dashboard/copilot">
                        <Button variant="secondary" size="xs" icon={<Bot className="w-3 h-3" />}>
                          AI Copilot
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { name: 'Jane Doe', mrn: 'MRN-1082', time: '10:30 AM', reason: 'Post-op Cardiac Review', type: 'IN_PERSON', status: 'IN_CONSULTATION' },
                      { name: 'Michael Chang', mrn: 'MRN-2041', time: '11:00 AM', reason: 'Acute Respiratory Distress', type: 'TELEMEDICINE', status: 'WAITING_ROOM' },
                      { name: 'Robert Johnson', mrn: 'MRN-3312', time: '11:30 AM', reason: 'Type 2 Diabetes Routine Check', type: 'IN_PERSON', status: 'CONFIRMED' },
                      { name: 'Emily Davis', mrn: 'MRN-4902', time: '12:00 PM', reason: 'Hypertension Dosage Titration', type: 'IN_PERSON', status: 'CONFIRMED' },
                    ].map((pt, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                            {pt.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{pt.name}</h4>
                              <span className="text-[10px] text-slate-400 font-medium">({pt.mrn})</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{pt.reason}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                            {pt.time}
                          </span>
                          {pt.type === 'TELEMEDICINE' ? (
                            <Link href="/dashboard/telemedicine">
                              <Button variant="secondary" size="xs" icon={<Video className="w-3 h-3" />}>
                                Join Video
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/dashboard/admissions`}>
                              <Button variant="primary" size="xs">
                                Open Chart
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Critical Lab Alerts & Prescription Shortcuts */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" /> STAT Diagnostic Alerts
                      </CardTitle>
                      <CardDescription>Critical value reports requiring immediate physician sign-off</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                      <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/60 text-xs">
                        <div className="flex justify-between font-bold text-rose-900 dark:text-rose-300">
                          <span>Troponin I - STAT</span>
                          <span>0.84 ng/mL [HIGH]</span>
                        </div>
                        <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">Patient: Jane Doe (Bed ICU-02)</p>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/60 text-xs">
                        <div className="flex justify-between font-bold text-amber-900 dark:text-amber-300">
                          <span>Serum Potassium</span>
                          <span>6.1 mEq/L [HIGH]</span>
                        </div>
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">Patient: Arthur Vance (Ward 4B)</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Clinical Documentation Copilot</CardTitle>
                      <CardDescription>AI ambient SOAP notes synthesized from encounter</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Ambient speech capture transcribed 14 clinical findings. Differential diagnosis ranked by likelihood.
                      </p>
                      <Link href="/dashboard/copilot" className="block">
                        <Button variant="outline" size="sm" className="w-full" icon={<Sparkles className="w-3.5 h-3.5 text-blue-500" />}>
                          Review AI SOAP Notes
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 3: NURSE WARD & MEDICATION STATION                   */}
          {/* ========================================================= */}
          {activeRoleView === 'NURSE' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Ward Occupancy"
                  value="28 / 32"
                  change="87.5%"
                  trend="neutral"
                  icon={<Bed className="w-4 h-4 text-purple-500" />}
                />
                <StatCard
                  title="Medications Due"
                  value="12 MAR"
                  change="Next 60m"
                  trend="up"
                  icon={<Pill className="w-4 h-4 text-emerald-500" />}
                />
                <StatCard
                  title="Vitals Check Queue"
                  value="6 Patients"
                  change="2 Overdue"
                  trend="down"
                  badge="ACTION"
                  badgeColor="rose"
                  icon={<HeartPulse className="w-4 h-4 text-rose-500" />}
                />
                <StatCard
                  title="Shift Summary"
                  value="4h 15m left"
                  change="Handover 7 PM"
                  trend="neutral"
                  icon={<Clock className="w-4 h-4 text-blue-500" />}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Medication Administration Schedule */}
                <Card className="lg:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle>Medication Administration Record (MAR) Queue</CardTitle>
                      <CardDescription>Scheduled IV infusions and oral medications for active shift</CardDescription>
                    </div>
                    <Link href="/dashboard/nursing">
                      <Button variant="primary" size="xs" icon={<Plus className="w-3 h-3" />}>
                        Record Vitals
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { drug: 'Ceftriaxone 1g IV', patient: 'Arthur Vance (Bed 4B-1)', due: '11:00 AM', status: 'DUE_NOW', notes: 'Verify allergy profile prior to push' },
                      { drug: 'Enoxaparin 40mg SubQ', patient: 'Jane Doe (Bed ICU-2)', due: '11:30 AM', status: 'SCHEDULED', notes: 'Platelets checked 182k' },
                      { drug: 'Metformin 500mg PO', patient: 'Robert Johnson (Bed 2A-3)', due: '12:00 PM', status: 'SCHEDULED', notes: 'Administer with meal' },
                    ].map((m, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                            <Pill className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{m.drug}</h4>
                              <span className="text-[10px] font-semibold text-slate-400">({m.due})</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.patient}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="xs">
                            Hold Dose
                          </Button>
                          <Button variant="success" size="xs" icon={<CheckCircle2 className="w-3 h-3" />}>
                            Confirm Given
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Shift Handover Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Inpatient Acuity & Handover</CardTitle>
                    <CardDescription>Shift transition checklist</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">High Acuity Transfers</span>
                      <p className="text-slate-500 dark:text-slate-400">1 patient transferred to Stepdown Unit at 09:15 AM.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Physician Rounds</span>
                      <p className="text-slate-500 dark:text-slate-400">Dr. Smith completed morning rounds. 2 discharge orders pending.</p>
                    </div>
                    <Link href="/dashboard/nursing" className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        View Full Ward MAR
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 4: LABORATORY & PATHOLOGY CONSOLE                    */}
          {/* ========================================================= */}
          {activeRoleView === 'LAB_STAFF' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Pending Samples"
                  value="34"
                  change="8 accessioned"
                  trend="up"
                  icon={<FlaskConical className="w-4 h-4 text-cyan-500" />}
                />
                <StatCard
                  title="Critical Panic Values"
                  value="3 STAT"
                  change="Immediate notify"
                  trend="down"
                  badge="ALERT"
                  badgeColor="rose"
                  icon={<AlertTriangle className="w-4 h-4 text-rose-500" />}
                />
                <StatCard
                  title="Completed Tests"
                  value="284"
                  change="99.1% verified"
                  trend="up"
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                />
                <StatCard
                  title="Turnaround Time"
                  value="26 mins"
                  change="Target: 45m"
                  trend="up"
                  icon={<Clock className="w-4 h-4 text-blue-500" />}
                />
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Sample Processing & Analyzer Intake Queue</CardTitle>
                    <CardDescription>Barcoded diagnostic specimens currently loaded on analyzers</CardDescription>
                  </div>
                  <Link href="/dashboard/lab">
                    <Button variant="primary" size="xs">
                      Accession New Sample
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {[
                      { barcode: 'LAB-90812', test: 'Complete Blood Count (CBC) with Diff', patient: 'Arthur Vance', priority: 'STAT', status: 'ANALYZING', tat: '8m left' },
                      { barcode: 'LAB-90813', test: 'Comprehensive Metabolic Panel (CMP)', patient: 'Jane Doe', priority: 'URGENT', status: 'PENDING_REVIEW', tat: 'Ready' },
                      { barcode: 'LAB-90814', test: 'Cardiac Enzymes (Troponin I)', patient: 'Michael Chang', priority: 'STAT', status: 'VERIFIED', tat: 'Reported' },
                    ].map((s, i) => (
                      <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-400">{s.barcode}</span>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100">{s.test}</span>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Patient: {s.patient}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              s.priority === 'STAT'
                                ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/50'
                                : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50'
                            }`}
                          >
                            {s.priority}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">{s.tat}</span>
                          <Button variant="outline" size="xs">
                            Verify & Sign
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 5: PHARMACY & FORMULARY INVENTORY                   */}
          {/* ========================================================= */}
          {activeRoleView === 'PHARMACY_STAFF' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Formulary SKUs"
                  value="1,840"
                  change="99.4% in-stock"
                  trend="up"
                  icon={<Pill className="w-4 h-4 text-emerald-500" />}
                />
                <StatCard
                  title="Low Stock Warnings"
                  value="6 Items"
                  change="Auto-reordered"
                  trend="down"
                  badge="WARNING"
                  badgeColor="amber"
                  icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
                />
                <StatCard
                  title="Expiry Alerts (<30d)"
                  value="3 Lots"
                  change="Quarantined"
                  trend="neutral"
                  icon={<Clock className="w-4 h-4 text-rose-500" />}
                />
                <StatCard
                  title="Prescription Queue"
                  value="18 Orders"
                  change="Avg fill: 6m"
                  trend="up"
                  icon={<CheckCircle2 className="w-4 h-4 text-blue-500" />}
                />
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Prescription Dispensing & Verification Queue</CardTitle>
                    <CardDescription>e-Prescriptions signed by physicians ready for clinical fulfillment</CardDescription>
                  </div>
                  <Link href="/dashboard/pharmacy">
                    <Button variant="primary" size="xs">
                      Inventory Manager
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { rx: 'RX-49102', drug: 'Amoxicillin / Clavulanate 875mg', patient: 'Emily Davis', doc: 'Dr. Smith', interactionCheck: 'PASS', status: 'READY_TO_DISPENSE' },
                    { rx: 'RX-49103', drug: 'Atorvastatin 40mg PO Daily', patient: 'Jane Doe', doc: 'Dr. Lee', interactionCheck: 'PASS', status: 'READY_TO_DISPENSE' },
                    { rx: 'RX-49104', drug: 'Levothyroxine 50mcg', patient: 'Arthur Vance', doc: 'Dr. Smith', interactionCheck: 'PASS', status: 'DISPENSED' },
                  ].map((rx, i) => (
                    <div key={i} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-slate-400">{rx.rx}</span>
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{rx.drug}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Patient: {rx.patient} • Prescribed by {rx.doc}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/50">
                          Interaction: {rx.interactionCheck}
                        </span>
                        <Button variant="primary" size="xs">
                          Dispense Dose
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 6: INSURANCE & REVENUE CYCLE                        */}
          {/* ========================================================= */}
          {activeRoleView === 'INSURANCE' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Claims Filed (MTD)"
                  value="$412.8K"
                  change="284 Claims"
                  trend="up"
                  icon={<Shield className="w-4 h-4 text-blue-500" />}
                />
                <StatCard
                  title="First-Pass Clean Claim"
                  value="94.2%"
                  change="+3.1% benchmark"
                  trend="up"
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                />
                <StatCard
                  title="Pending Pre-Auth"
                  value="14 Cases"
                  change="Avg turnaround: 2h"
                  trend="neutral"
                  icon={<Clock className="w-4 h-4 text-amber-500" />}
                />
                <StatCard
                  title="Denial Rate"
                  value="3.8%"
                  change="-1.2% reduction"
                  trend="up"
                  icon={<TrendingUp className="w-4 h-4 text-purple-500" />}
                />
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Active Insurance Pre-Authorizations & Adjudication Pipeline</CardTitle>
                    <CardDescription>Payer claims submitted via EDI 837 gateway</CardDescription>
                  </div>
                  <Link href="/dashboard/insurance">
                    <Button variant="primary" size="xs">
                      Submit EDI Batch
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { id: 'CLM-78901', payer: 'Blue Cross Blue Shield', patient: 'Jane Doe', procedure: 'Percutaneous Coronary Angioplasty', amount: '$24,500', status: 'PRE_AUTH_APPROVED' },
                    { id: 'CLM-78902', payer: 'United Healthcare', patient: 'Arthur Vance', procedure: 'Joint Replacement & Inpatient Rehab', amount: '$18,200', status: 'UNDER_REVIEW' },
                    { id: 'CLM-78903', payer: 'Aetna Commercial', patient: 'Michael Chang', procedure: 'Bronchoscopy & Chest CT', amount: '$4,350', status: 'SETTLED' },
                  ].map((c, i) => (
                    <div key={i} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-slate-400">{c.id}</span>
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{c.payer}</span>
                          <span className="font-extrabold text-xs text-blue-600 dark:text-blue-400">({c.amount})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {c.procedure} • Patient: {c.patient}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            c.status === 'PRE_AUTH_APPROVED' || c.status === 'SETTLED'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50'
                              : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50'
                          }`}
                        >
                          {c.status.replace(/_/g, ' ')}
                        </span>
                        <Button variant="outline" size="xs">
                          Review EOB
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
