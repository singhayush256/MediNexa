'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Pill,
  FlaskConical,
  CreditCard,
  Video,
  FileText,
  Users,
  Target,
  Bell,
  Heart,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Activity,
  Bot,
  BellRing,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, StatCard } from '@/components/ui';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';

export default function PatientPortalDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('medinexa_token') || localStorage.getItem('token')
        : null;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

    if (token) {
      Promise.all([
        fetch(`${apiUrl}/patient-portal/profile`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : null)),
        fetch(`${apiUrl}/patient-portal/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : null)),
      ])
        .then(([prof, anal]) => {
          setProfile(prof);
          setAnalytics(anal);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const patientName = profile?.name || profile?.user?.firstName
    ? `${profile?.user?.firstName || 'Arjun'} ${profile?.user?.lastName || 'Nair'}`
    : (typeof window !== 'undefined' && localStorage.getItem('medinexa_user') ? (() => {
        try {
          const u = JSON.parse(localStorage.getItem('medinexa_user') || '{}');
          return u.firstName ? `${u.firstName} ${u.lastName || ''}` : 'Arjun Nair';
        } catch {
          return 'Arjun Nair';
        }
      })() : 'Arjun Nair');

  const quickLinks = [
    { title: 'Appointments', href: '/portal/appointments', icon: <Calendar className="w-5 h-5 text-blue-500" />, desc: 'Book & manage doctor consultations' },
    { title: 'Medical Records', href: '/portal/medical-records', icon: <FileText className="w-5 h-5 text-emerald-500" />, desc: 'Longitudinal history & encounter summaries' },
    { title: 'Prescriptions', href: '/portal/prescriptions', icon: <Pill className="w-5 h-5 text-purple-500" />, desc: 'Active medications & online refill requests' },
    { title: 'Medication Reminders', href: '/portal/medication-reminders', icon: <BellRing className="w-5 h-5 text-rose-500" />, desc: 'Daily schedules, dose tracking & adherence score' },
    { title: 'Lab Reports', href: '/portal/lab-reports', icon: <FlaskConical className="w-5 h-5 text-teal-500" />, desc: 'Diagnostic blood panels & imaging reports' },
    { title: 'Telemedicine', href: '/portal/telemedicine', icon: <Video className="w-5 h-5 text-cyan-500" />, desc: 'Join virtual consultation waiting room' },
    { title: 'Billing & Invoices', href: '/portal/billing', icon: <CreditCard className="w-5 h-5 text-amber-500" />, desc: 'Itemized hospital bills & insurance copays' },
    { title: 'AI Health Assistant', href: '/portal/ai-assistant', icon: <Bot className="w-5 h-5 text-teal-600 dark:text-teal-400" />, desc: '24/7 Guidance on symptoms, medicines & lab reports' },
    { title: 'Personal Health Profile', href: '/portal/profile', icon: <Users className="w-5 h-5 text-indigo-500" />, desc: 'Demographics, allergies, and emergency contacts' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Patient Portal Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MediNexaLogo size="sm" subtitle="PATIENT PORTAL" href="/portal" />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-demo-tour', { detail: { stepIndex: 0 } }));
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white text-xs font-black shadow-sm shadow-teal-500/20 transition cursor-pointer"
              title="Open Hospital Guided Walkthrough Tour"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">Demo Tour</span>
            </button>
            <ThemeToggle />
            <button
              onClick={() => {
                localStorage.removeItem('medinexa_token');
                localStorage.removeItem('token');
                localStorage.removeItem('medinexa_user');
                document.cookie = 'medinexa_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                window.location.href = '/login';
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Patient Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-teal-600 via-emerald-600 to-blue-700 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
              Connected Care 24/7
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {patientName}
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 max-w-lg">
              Your care team is actively monitoring your recovery plan. Access your clinical records, test results, and next appointments below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
            <Link href="/portal/appointments">
              <button className="bg-gradient-to-r from-teal-400 to-blue-600 hover:from-teal-500 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 px-5 py-2.5 text-xs sm:text-sm flex items-center gap-2 cursor-pointer border border-white/20">
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>
            </Link>
            <Link href="/portal/telemedicine">
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 rounded-2xl" icon={<Video className="w-3.5 h-3.5" />}>
                Join Telehealth
              </Button>
            </Link>
          </div>
        </div>

        {/* Patient Key Health Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Blood Pressure"
            value="120/80"
            subtext="Normotensive"
            trend="up"
            change="Normal"
            icon={<Heart className="w-4 h-4 text-rose-500" />}
          />
          <StatCard
            title="Heart Rate"
            value="72 bpm"
            subtext="Resting pulse"
            trend="neutral"
            change="Optimal"
            icon={<Activity className="w-4 h-4 text-blue-500" />}
          />
          <StatCard
            title="Oxygen (SpO2)"
            value="98%"
            subtext="Room air"
            trend="up"
            change="Target 95%+"
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          />
          <StatCard
            title="Adherence Score"
            value="94.5%"
            subtext="Medication schedule"
            trend="up"
            change="+2.4%"
            icon={<Pill className="w-4 h-4 text-purple-500" />}
          />
        </div>

        {/* Next Upcoming Appointment Alert */}
        <Card className="border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20">
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  NEXT UPCOMING VISIT
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  Cardiac Follow-Up with Dr. Rajesh Sharma
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" /> Tomorrow at 10:30 AM • Telehealth Virtual Room
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link href="/portal/appointments">
                <button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-md shadow-teal-500/20 hover:shadow-teal-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Appointment</span>
                </button>
              </Link>
              <Link href="/portal/telemedicine">
                <Button variant="primary" size="sm" icon={<Video className="w-3.5 h-3.5" />}>
                  Enter Waiting Room
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Quick Access Portal Modules Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Patient Services & Self-Care
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {quickLinks.map((link, idx) => (
              <Link key={idx} href={link.href} className="group">
                <Card hover className="h-full flex flex-col justify-between">
                  <CardContent className="space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {link.icon}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {link.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {link.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
