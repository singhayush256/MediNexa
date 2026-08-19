'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  // Role-specific metrics state
  const [doctorAppts, setDoctorAppts] = useState<any[]>([]);
  const [patientAppts, setPatientAppts] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [availableBedsCount, setAvailableBedsCount] = useState<number | null>(null);

  // Global Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  // AI Assistant state
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('medinexa_token') || localStorage.getItem('token');
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

    Promise.all([
      fetch(`${apiUrl}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => (res.ok ? res.json() : null)),
      fetch(`${apiUrl}/notifications/unread-count`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([userData, notifData]) => {
        if (userData) {
          setUser(userData);
          const role = userData.roleCode || userData.role?.code || '';

          // Fetch role-specific overview metrics safely
          if (role === 'DOCTOR') {
            fetch(`${apiUrl}/doctors/me/appointments`, { headers: { Authorization: `Bearer ${token}` } })
              .then((res) => res.json())
              .then((data) => setDoctorAppts(Array.isArray(data) ? data : []))
              .catch(() => {});
          } else if (role === 'PATIENT') {
            fetch(`${apiUrl}/patients/me/appointments`, { headers: { Authorization: `Bearer ${token}` } })
              .then((res) => res.json())
              .then((data) => setPatientAppts(Array.isArray(data) ? data : []))
              .catch(() => {});
          }

          if (role === 'HOSPITAL_ADMIN' || role === 'MEDINEXA_ADMIN' || role === 'RECEPTIONIST' || role === 'NURSE' || role === 'DOCTOR') {
            fetch(`${apiUrl}/admissions`, { headers: { Authorization: `Bearer ${token}` } })
              .then((res) => res.json())
              .then((data) => setAdmissions(Array.isArray(data) ? data : []))
              .catch(() => {});
          }

          if (role === 'HOSPITAL_ADMIN' || role === 'MEDINEXA_ADMIN' || role === 'RECEPTIONIST' || role === 'NURSE') {
            fetch(`${apiUrl}/beds/available`, { headers: { Authorization: `Bearer ${token}` } })
              .then((res) => res.json())
              .then((data) => setAvailableBedsCount(Array.isArray(data) ? data.length : 0))
              .catch(() => {});
          }
        }
        if (notifData) {
          setUnreadNotifs(notifData.count || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const token = getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSearchResults(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleAiSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!aiMessage.trim()) return;
    setAiLoading(true);
    setAiResponse(null);
    try {
      const res = await apiFetch('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: aiMessage }),
      });
      if (res.ok && res.data) {
        setAiResponse(res.data);
      } else {
        setAiResponse({ answer: res.message || 'Failed to connect to AI Assistant' });
      }
    } catch (err: any) {
      setAiResponse({ answer: 'Failed to connect to AI Assistant: ' + err.message });
    } finally {
      setAiLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('medinexa_token');
    localStorage.removeItem('medinexa_user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  const roleCode = user?.roleCode || user?.role?.code || 'GUEST';

  // Role-Aware Navigation Configuration
  const renderNavLinks = () => {
    switch (roleCode) {
      case 'DOCTOR':
        return (
          <>
            <Link href="/dashboard" className="text-sky-600 font-bold">Overview</Link>
            <Link href="/dashboard/doctor-appointments" className="text-slate-600 hover:text-sky-600">Appointments Queue</Link>
            <Link href="/dashboard/clinical" className="text-slate-600 hover:text-sky-600">Clinical EHR</Link>
            <Link href="/dashboard/admissions" className="text-slate-600 hover:text-sky-600">Admissions</Link>
            <Link href="/dashboard/medical-records" className="text-slate-600 hover:text-sky-600">Records</Link>
            <Link href="/dashboard/lab" className="text-slate-600 hover:text-sky-600">Lab</Link>
            <Link href="/dashboard/pharmacy" className="text-slate-600 hover:text-sky-600">Pharmacy</Link>
          </>
        );
      case 'HOSPITAL_ADMIN':
        return (
          <>
            <Link href="/dashboard" className="text-sky-600 font-bold">Overview</Link>
            <Link href="/dashboard/admissions" className="text-slate-600 hover:text-sky-600">Admissions Engine</Link>
            <Link href="/dashboard/hospital/beds" className="text-slate-600 hover:text-sky-600">Live Bed Engine</Link>
            <Link href="/dashboard/hospital" className="text-slate-600 hover:text-sky-600">Hospital</Link>
            <Link href="/dashboard/referrals" className="text-slate-600 hover:text-sky-600">Referrals</Link>
            <Link href="/dashboard/patients" className="text-slate-600 hover:text-sky-600">Patients</Link>
            <Link href="/dashboard/doctors" className="text-slate-600 hover:text-sky-600">Doctors</Link>
          </>
        );
      case 'PATIENT':
        return (
          <>
            <Link href="/dashboard" className="text-sky-600 font-bold">Overview</Link>
            <Link href="/dashboard/appointments" className="text-slate-600 hover:text-sky-600">My Appointments</Link>
            <Link href="/dashboard/medical-records" className="text-slate-600 hover:text-sky-600">Medical Records</Link>
            <Link href="/dashboard/pharmacy" className="text-slate-600 hover:text-sky-600">Prescriptions</Link>
            <Link href="/dashboard/lab" className="text-slate-600 hover:text-sky-600">Lab Reports</Link>
            <Link href="/dashboard/medication-reminders" className="text-slate-600 hover:text-sky-600">Reminders</Link>
          </>
        );
      case 'RECEPTIONIST':
        return (
          <>
            <Link href="/dashboard" className="text-sky-600 font-bold">Overview</Link>
            <Link href="/dashboard/appointments" className="text-slate-600 hover:text-sky-600">Book Appointments</Link>
            <Link href="/dashboard/admissions" className="text-slate-600 hover:text-sky-600">Admissions</Link>
            <Link href="/dashboard/patients" className="text-slate-600 hover:text-sky-600">Patients Intake</Link>
            <Link href="/dashboard/hospital/beds" className="text-slate-600 hover:text-sky-600">Bed Status</Link>
          </>
        );
      case 'NURSE':
        return (
          <>
            <Link href="/dashboard" className="text-sky-600 font-bold">Overview</Link>
            <Link href="/dashboard/admissions" className="text-slate-600 hover:text-sky-600">Inpatient Wards</Link>
            <Link href="/dashboard/hospital/beds" className="text-slate-600 hover:text-sky-600">Live Beds</Link>
            <Link href="/dashboard/clinical" className="text-slate-600 hover:text-sky-600">Vitals & EHR</Link>
            <Link href="/dashboard/medication-reminders" className="text-slate-600 hover:text-sky-600">Medication Track</Link>
          </>
        );
      default:
        return (
          <>
            <Link href="/dashboard" className="text-sky-600 font-bold">Overview</Link>
            <Link href="/dashboard/admissions" className="text-slate-600 hover:text-sky-600">Admissions</Link>
            <Link href="/dashboard/hospital/beds" className="text-slate-600 hover:text-sky-600">Live Beds</Link>
            <Link href="/dashboard/doctor-appointments" className="text-slate-600 hover:text-sky-600">Appointments</Link>
            <Link href="/dashboard/clinical" className="text-slate-600 hover:text-sky-600">Clinical EHR</Link>
            <Link href="/dashboard/referrals" className="text-slate-600 hover:text-sky-600">Referrals</Link>
            <Link href="/dashboard/system-health" className="text-slate-600 hover:text-sky-600">System Health</Link>
          </>
        );
    }
  };

  const activeAdmissionsCount = admissions.filter((a) => a.status === 'ADMITTED' || a.status === 'TRANSFERRED').length;
  const dischargedAdmissionsCount = admissions.filter((a) => a.status === 'DISCHARGED').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-lg">
                M
              </div>
              <span className="text-lg font-extrabold text-slate-900">MediNexa</span>
            </Link>

            <nav className="hidden md:flex space-x-3 text-xs font-semibold">
              {renderNavLinks()}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Global Search Bar */}
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Search Patients, Doctors, Hospitals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-3 pr-8 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
              />
              <button type="submit" className="absolute right-2 top-2 text-slate-400 text-xs">🔍</button>
            </form>

            {/* Notification Badge Link */}
            <Link href="/dashboard/notifications" className="relative p-1.5 text-slate-600 hover:text-sky-600">
              <span className="text-lg">🔔</span>
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadNotifs}
                </span>
              )}
            </Link>

            {user && (
              <button
                onClick={handleLogout}
                className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* Search Results Display */}
        {searchResults && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-base">Global Search Results for &quot;{searchQuery}&quot;</h3>
              <button onClick={() => setSearchResults(null)} className="text-xs text-slate-500 hover:text-slate-700">Close Results ✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {searchResults.patients?.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                  <span className="font-bold text-sky-700 uppercase">Patients ({searchResults.patients.length})</span>
                  {searchResults.patients.map((p: any) => (
                    <div key={p.id} className="text-slate-800">{p.user?.firstName} {p.user?.lastName}</div>
                  ))}
                </div>
              )}
              {searchResults.doctors?.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                  <span className="font-bold text-indigo-700 uppercase">Doctors ({searchResults.doctors.length})</span>
                  {searchResults.doctors.map((d: any) => (
                    <div key={d.id} className="text-slate-800">Dr. {d.user?.firstName} {d.user?.lastName} ({d.specialty?.name})</div>
                  ))}
                </div>
              )}
              {searchResults.facilities?.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                  <span className="font-bold text-emerald-700 uppercase">Hospitals ({searchResults.facilities.length})</span>
                  {searchResults.facilities.map((f: any) => (
                    <div key={f.id} className="text-slate-800">{f.name} ({f.city})</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ROLE-SPECIFIC DASHBOARD RENDER */}

        {/* ROLE 1: DOCTOR DASHBOARD */}
        {roleCode === 'DOCTOR' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-indigo-700 via-sky-700 to-slate-900 text-white rounded-2xl p-8 shadow-md">
              <div className="max-w-3xl space-y-2">
                <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Doctor Clinical Command Center
                </span>
                <h1 className="text-3xl font-extrabold">Welcome back, Dr. {user?.firstName}!</h1>
                <p className="text-sky-100 text-sm">
                  Clinical Workstation — Manage your active patient queue, record vitals, sign clinical notes, and issue digital prescriptions.
                </p>
              </div>
            </div>

            {/* Doctor Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase">Today&apos;s Appointments</div>
                <div className="text-3xl font-black text-slate-900 mt-2">{doctorAppts.length}</div>
                <div className="text-xs text-sky-600 font-bold mt-1">Scheduled for Consultation</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase">Active Inpatient Admissions</div>
                <div className="text-3xl font-black text-indigo-600 mt-2">{activeAdmissionsCount}</div>
                <div className="text-xs text-slate-500 mt-1">Clinical Ward Access</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase">Completed Discharges</div>
                <div className="text-3xl font-black text-emerald-600 mt-2">{dischargedAdmissionsCount}</div>
                <div className="text-xs text-slate-500 mt-1">Discharge Summaries Ready</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase">Primary Specialty</div>
                <div className="text-lg font-bold text-slate-800 mt-2">{user?.doctorProfile?.specialty?.name || 'Cardiology'}</div>
                <div className="text-xs text-slate-500 mt-1">License: {user?.doctorProfile?.licenseNumber || 'Active'}</div>
              </div>
            </div>

            {/* Doctor Quick Actions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Clinical Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href="/dashboard/doctor-appointments"
                  className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 p-4 rounded-xl flex items-center space-x-3 transition-colors"
                >
                  <span className="text-2xl">📅</span>
                  <div>
                    <div className="font-bold text-indigo-950 text-sm">Appointments Queue</div>
                    <div className="text-xs text-indigo-700">Start consultations</div>
                  </div>
                </Link>
                <Link
                  href="/dashboard/clinical"
                  className="bg-sky-50 hover:bg-sky-100 border border-sky-200 p-4 rounded-xl flex items-center space-x-3 transition-colors"
                >
                  <span className="text-2xl">🩺</span>
                  <div>
                    <div className="font-bold text-sky-950 text-sm">Clinical EHR</div>
                    <div className="text-xs text-sky-700">Record Vitals & Notes</div>
                  </div>
                </Link>
                <Link
                  href="/dashboard/admissions"
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-4 rounded-xl flex items-center space-x-3 transition-colors"
                >
                  <span className="text-2xl">📜</span>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Inpatient Admissions</div>
                    <div className="text-xs text-slate-600">Discharge Summaries</div>
                  </div>
                </Link>
                <Link
                  href="/dashboard/pharmacy"
                  className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 p-4 rounded-xl flex items-center space-x-3 transition-colors"
                >
                  <span className="text-2xl">💊</span>
                  <div>
                    <div className="font-bold text-emerald-950 text-sm">Prescriptions</div>
                    <div className="text-xs text-emerald-700">Issue Medication</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Doctor Today's Appointments Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-extrabold text-slate-900">Today&apos;s Consultation Queue</h3>
                <Link href="/dashboard/doctor-appointments" className="text-xs font-bold text-sky-600 hover:text-sky-700">View All Queue →</Link>
              </div>
              {doctorAppts.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {doctorAppts.slice(0, 5).map((apt: any) => (
                    <div key={apt.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {apt.patient?.user?.firstName} {apt.patient?.user?.lastName}
                        </div>
                        <div className="text-xs text-slate-500">Time: {apt.startTime} | Reason: {apt.reason}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-sky-50 text-sky-700 border border-sky-200">
                          {apt.status}
                        </span>
                        <Link
                          href="/dashboard/clinical"
                          className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs"
                        >
                          Start Consultation
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  No active appointments currently queued for today.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ROLE 2: HOSPITAL_ADMIN DASHBOARD */}
        {(roleCode === 'HOSPITAL_ADMIN' || roleCode === 'MEDINEXA_ADMIN') && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-sky-700 via-indigo-700 to-slate-900 text-white rounded-2xl p-8 shadow-md">
              <div className="max-w-3xl space-y-2">
                <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Hospital Operations Command Center
                </span>
                <h1 className="text-3xl font-extrabold">Hospital Operations Overview</h1>
                <p className="text-sky-100 text-sm">
                  Facility Capacity & Admissions Engine — Real-time bed tracking, inpatient admissions, bed transfers, and hospital referrals.
                </p>
              </div>
            </div>

            {/* Hospital Admin Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase">Active Inpatient Admissions</div>
                <div className="text-3xl font-black text-sky-600 mt-2">{activeAdmissionsCount}</div>
                <div className="text-xs text-slate-500 mt-1">Currently Admitted</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase">Available Live Beds</div>
                <div className="text-3xl font-black text-emerald-600 mt-2">
                  {availableBedsCount !== null ? availableBedsCount : '--'}
                </div>
                <div className="text-xs text-emerald-600 font-bold mt-1">Ready for Intake</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase">Total Completed Discharges</div>
                <div className="text-3xl font-black text-indigo-600 mt-2">{dischargedAdmissionsCount}</div>
                <div className="text-xs text-slate-500 mt-1">Beds Released</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase">Facility Code</div>
                <div className="text-lg font-bold text-slate-800 mt-2">{user?.facility?.name || 'MediNexa General Hospital'}</div>
                <div className="text-xs text-slate-500 mt-1">Status: Active</div>
              </div>
            </div>

            {/* Admin Quick Actions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Hospital Operations Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href="/dashboard/admissions"
                  className="bg-sky-600 hover:bg-sky-700 text-white p-4 rounded-xl flex items-center space-x-3 transition-colors shadow-sm"
                >
                  <span className="text-2xl">➕</span>
                  <div>
                    <div className="font-bold text-sm">Admit New Patient</div>
                    <div className="text-xs text-sky-100">Inpatient Intake & Bed Assign</div>
                  </div>
                </Link>
                <Link
                  href="/dashboard/hospital/beds"
                  className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-xl flex items-center space-x-3 transition-colors shadow-sm"
                >
                  <span className="text-2xl">🛏️</span>
                  <div>
                    <div className="font-bold text-sm">Live Bed Engine</div>
                    <div className="text-xs text-slate-300">Capacity & Ward Maps</div>
                  </div>
                </Link>
                <Link
                  href="/dashboard/admissions"
                  className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 p-4 rounded-xl flex items-center space-x-3 transition-colors"
                >
                  <span className="text-2xl">📜</span>
                  <div>
                    <div className="font-bold text-indigo-950 text-sm">Discharge Engine</div>
                    <div className="text-xs text-indigo-700">Summaries & Bed Release</div>
                  </div>
                </Link>
                <Link
                  href="/dashboard/referrals"
                  className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 p-4 rounded-xl flex items-center space-x-3 transition-colors"
                >
                  <span className="text-2xl">🏥</span>
                  <div>
                    <div className="font-bold text-emerald-950 text-sm">Hospital Referrals</div>
                    <div className="text-xs text-emerald-700">Cross-Facility Transfer</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Inpatient Admissions Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-extrabold text-slate-900">Current Inpatient Admissions</h3>
                <Link href="/dashboard/admissions" className="text-xs font-bold text-sky-600 hover:text-sky-700">Manage All Admissions →</Link>
              </div>
              {admissions.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {admissions.slice(0, 5).map((adm: any) => (
                    <div key={adm.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {adm.admissionNumber} — {adm.patient?.user?.firstName} {adm.patient?.user?.lastName}
                        </div>
                        <div className="text-xs text-slate-500">
                          Facility: {adm.facility?.name} | Dept: {adm.department?.name}
                        </div>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-sky-50 text-sky-700 border border-sky-200">
                        {adm.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  No active inpatient admissions currently recorded.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ROLE 3: PATIENT DASHBOARD */}
        {roleCode === 'PATIENT' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-slate-900 text-white rounded-2xl p-8 shadow-md">
              <div className="max-w-3xl space-y-2">
                <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Patient Personal Healthcare Center
                </span>
                <h1 className="text-3xl font-extrabold">Welcome, {user?.firstName}!</h1>
                <p className="text-sky-100 text-sm">
                  Your Personal Health Portal — Manage your upcoming consultations, digital prescriptions, lab reports, and medical records.
                </p>
              </div>
            </div>

            {/* Patient Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase">Upcoming Consultations</div>
                <div className="text-3xl font-black text-sky-600 mt-2">{patientAppts.length}</div>
                <div className="text-xs text-slate-500 mt-1">Scheduled Appointments</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase">Digital Prescriptions</div>
                <div className="text-3xl font-black text-indigo-600 mt-2">Active</div>
                <div className="text-xs text-slate-500 mt-1">Pharmacy Orders</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase">Discharge Summaries</div>
                <div className="text-3xl font-black text-emerald-600 mt-2">Available</div>
                <div className="text-xs text-emerald-600 font-bold mt-1">Print-Ready PDF</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase">Patient Profile</div>
                <div className="text-base font-bold text-slate-800 mt-2">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-slate-500 mt-1">Status: Active</div>
              </div>
            </div>

            {/* Patient Quick Actions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Personal Health Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/dashboard/appointments"
                  className="bg-sky-50 hover:bg-sky-100 border border-sky-200 p-4 rounded-xl flex items-center space-x-3 transition-colors"
                >
                  <span className="text-2xl">📅</span>
                  <div>
                    <div className="font-bold text-sky-950 text-sm">My Appointments</div>
                    <div className="text-xs text-sky-700">Book, reschedule, or cancel</div>
                  </div>
                </Link>
                <Link
                  href="/dashboard/medical-records"
                  className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 p-4 rounded-xl flex items-center space-x-3 transition-colors"
                >
                  <span className="text-2xl">📁</span>
                  <div>
                    <div className="font-bold text-indigo-950 text-sm">My Medical Records</div>
                    <div className="text-xs text-indigo-700">Vitals & Diagnoses history</div>
                  </div>
                </Link>
                <Link
                  href="/dashboard/pharmacy"
                  className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 p-4 rounded-xl flex items-center space-x-3 transition-colors"
                >
                  <span className="text-2xl">💊</span>
                  <div>
                    <div className="font-bold text-emerald-950 text-sm">My Prescriptions</div>
                    <div className="text-xs text-emerald-700">Medications & Refills</div>
                  </div>
                </Link>
                <Link
                  href="/dashboard/lab"
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-4 rounded-xl flex items-center space-x-3 transition-colors"
                >
                  <span className="text-2xl">🧪</span>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">My Lab Reports</div>
                    <div className="text-xs text-slate-600">Lab test results</div>
                  </div>
                </Link>
                <Link
                  href="/dashboard/admissions"
                  className="bg-amber-50 hover:bg-amber-100 border border-amber-200 p-4 rounded-xl flex items-center space-x-3 transition-colors"
                >
                  <span className="text-2xl">📜</span>
                  <div>
                    <div className="font-bold text-amber-950 text-sm">My Discharge Summaries</div>
                    <div className="text-xs text-amber-800">Inpatient summaries</div>
                  </div>
                </Link>
                <Link
                  href="/dashboard/medication-reminders"
                  className="bg-purple-50 hover:bg-purple-100 border border-purple-200 p-4 rounded-xl flex items-center space-x-3 transition-colors"
                >
                  <span className="text-2xl">⏰</span>
                  <div>
                    <div className="font-bold text-purple-950 text-sm">Medicine Reminders</div>
                    <div className="text-xs text-purple-700">Dose schedules</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Patient Upcoming Appointments Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-extrabold text-slate-900">My Upcoming Consultations</h3>
                <Link href="/dashboard/appointments" className="text-xs font-bold text-sky-600 hover:text-sky-700">Manage Appointments →</Link>
              </div>
              {patientAppts.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {patientAppts.map((apt: any) => (
                    <div key={apt.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          Doctor: Dr. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName} ({apt.doctor?.specialty?.name})
                        </div>
                        <div className="text-xs text-slate-500">Date: {apt.appointmentDate} at {apt.startTime} | Facility: {apt.facility?.name}</div>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-sky-50 text-sky-700 border border-sky-200">
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  No upcoming consultations currently booked.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ROLE 4: RECEPTIONIST & NURSE DASHBOARDS */}
        {(roleCode === 'RECEPTIONIST' || roleCode === 'NURSE') && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-sky-700 via-indigo-700 to-slate-900 text-white rounded-2xl p-8 shadow-md">
              <div className="max-w-3xl space-y-2">
                <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {roleCode === 'RECEPTIONIST' ? 'Front Desk Intake Command Center' : 'Clinical Ward Nursing Center'}
                </span>
                <h1 className="text-3xl font-extrabold">Welcome back, {user?.firstName}!</h1>
                <p className="text-sky-100 text-sm">
                  Operational Command Center — Patient intake, appointment bookings, bed status tracking, and inpatient ward coordination.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Link href="/dashboard/admissions" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">📜</div>
                <h3 className="font-bold text-slate-900 text-base">Inpatient Admissions</h3>
                <p className="text-xs text-slate-500 mt-1">Patient intake, room assignments, and discharge summaries</p>
              </Link>
              <Link href="/dashboard/hospital/beds" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">🛏️</div>
                <h3 className="font-bold text-slate-900 text-base">Live Bed Status</h3>
                <p className="text-xs text-slate-500 mt-1">View available ward beds and occupied bed maps</p>
              </Link>
              <Link href="/dashboard/appointments" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">📅</div>
                <h3 className="font-bold text-slate-900 text-base">Appointment Bookings</h3>
                <p className="text-xs text-slate-500 mt-1">Book, check-in, and manage patient appointments</p>
              </Link>
            </div>
          </div>
        )}

        {/* AI Assistant Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">AI</div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">MediNexa Healthcare AI Assistant</h3>
              <p className="text-xs text-slate-500">Ask questions about appointments, bed availability, referrals, or platform navigation</p>
            </div>
          </div>

          <form onSubmit={handleAiSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., Show my upcoming appointments or query hospital ICU bed capacity..."
              value={aiMessage}
              onChange={(e) => setAiMessage(e.target.value)}
              className="flex-1 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs disabled:opacity-50"
            >
              {aiLoading ? 'Thinking...' : 'Ask AI'}
            </button>
          </form>

          {aiResponse && (
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-slate-800 space-y-2">
              <p className="whitespace-pre-line">{aiResponse.answer}</p>
              {aiResponse.sources && (
                <div className="text-[10px] text-indigo-600 font-semibold">
                  Sources: {aiResponse.sources.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
