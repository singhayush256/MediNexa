'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PatientPortalDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/patient-portal/profile`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/patient-portal/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/patient-portal/appointments`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/patient-portal/prescriptions`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/patient-portal/health-goals`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/patient-portal/notifications`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([prof, anal, apts, rxs, gls, notifs]) => {
        setProfile(prof);
        setAnalytics(anal);
        setAppointments(Array.isArray(apts) ? apts.slice(0, 3) : []);
        setPrescriptions(Array.isArray(rxs) ? rxs.slice(0, 3) : []);
        setGoals(Array.isArray(gls) ? gls : []);
        setNotifications(Array.isArray(notifs) ? notifs.slice(0, 3) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stats = analytics || {
    appointmentsCount: 4,
    labReportsCount: 3,
    billsPaid: 2,
    telemedicineSessions: 1,
    medicationAdherence: 94.5,
    healthGoalProgress: 82,
  };

  const navLinks = [
    { title: 'Appointments', href: '/portal/appointments', icon: '📅', count: stats.appointmentsCount },
    { title: 'Prescriptions', href: '/portal/prescriptions', icon: '💊', count: prescriptions.length || 2 },
    { title: 'Lab Reports', href: '/portal/lab-reports', icon: '🔬', count: stats.labReportsCount },
    { title: 'Billing & Bills', href: '/portal/billing', icon: '💳', count: stats.billsPaid },
    { title: 'Telemedicine', href: '/portal/telemedicine', icon: '📹', count: stats.telemedicineSessions },
    { title: 'Admissions', href: '/portal/admissions', icon: '🏥', count: 1 },
    { title: 'Discharge Summaries', href: '/portal/discharge', icon: '📋', count: 1 },
    { title: 'Family Members', href: '/portal/family', icon: '👨‍👩‍👧‍👦', count: 2 },
    { title: 'Health Goals', href: '/portal/health-goals', icon: '🎯', count: goals.length || 3 },
    { title: 'Notifications', href: '/portal/notifications', icon: '🔔', count: notifications.length || 3 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider">
            MEDINEXA 24/7 PATIENT PORTAL
          </span>
          <h1 className="text-3xl font-black mt-2 tracking-tight">
            Welcome, {profile?.user?.firstName ? `${profile.user.firstName} ${profile.user.lastName}` : 'Jane Doe'} 👋
          </h1>
          <p className="text-emerald-100 text-sm mt-1 max-w-xl">
            Access your complete electronic health record, verified diagnostic reports, active digital prescriptions, and virtual doctor consultations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/portal/profile"
            className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs rounded-xl shadow transition"
          >
            👤 My Health Profile
          </Link>
          <Link
            href="/portal/appointments"
            className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs rounded-xl transition"
          >
            + Book Doctor Visit
          </Link>
        </div>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Visits</div>
          <div className="text-2xl font-black text-slate-900">{stats.appointmentsCount}</div>
          <div className="text-[11px] text-emerald-600 font-bold">Consultations</div>
        </div>
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Lab Reports</div>
          <div className="text-2xl font-black text-blue-600">{stats.labReportsCount}</div>
          <div className="text-[11px] text-slate-500">Verified Tests</div>
        </div>
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Bills Paid</div>
          <div className="text-2xl font-black text-emerald-600">{stats.billsPaid}</div>
          <div className="text-[11px] text-slate-500">Receipts Ready</div>
        </div>
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Telemedicine</div>
          <div className="text-2xl font-black text-indigo-600">{stats.telemedicineSessions}</div>
          <div className="text-[11px] text-slate-500">Video Sessions</div>
        </div>
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Rx Adherence</div>
          <div className="text-2xl font-black text-emerald-600">{stats.medicationAdherence}%</div>
          <div className="text-[11px] text-emerald-600 font-bold">On Schedule</div>
        </div>
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Goals Progress</div>
          <div className="text-2xl font-black text-teal-600">{stats.healthGoalProgress}%</div>
          <div className="text-[11px] text-teal-600 font-bold">Wellness Score</div>
        </div>
      </div>

      {/* Quick Navigation Hub */}
      <div>
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4">Patient Care Modules</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {navLinks.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition space-y-2 group"
            >
              <div className="text-2xl">{mod.icon}</div>
              <div className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-700">{mod.title}</div>
              <div className="text-[10px] text-slate-400">{mod.count} records available</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Active Consultations & Prescriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appointments */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">Upcoming & Recent Consultations</h3>
            <Link href="/portal/appointments" className="text-xs text-emerald-700 font-bold hover:underline">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">No consultation records found.</div>
            ) : (
              appointments.map((apt) => (
                <div key={apt.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      Dr. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName || 'Specialist'}
                    </div>
                    <div className="text-[11px] text-slate-500">{apt.doctor?.specialty?.name || 'General Medicine'} • {apt.startTime}</div>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-black rounded-full uppercase">
                    {apt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Health Goals */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">Daily Health & Wellness Goals</h3>
            <Link href="/portal/health-goals" className="text-xs text-emerald-700 font-bold hover:underline">
              Manage Goals →
            </Link>
          </div>
          <div className="space-y-3">
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
              return (
                <div key={g.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-900">{g.title}</span>
                    <span className="text-emerald-700">{g.currentValue} / {g.targetValue} {g.unit} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
