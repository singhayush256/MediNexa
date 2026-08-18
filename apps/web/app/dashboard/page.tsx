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

  // Global Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  // AI Assistant state
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('medinexa_token');
    if (!token) {
      setLoading(false);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

    Promise.all([
      fetch(`${apiUrl}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${apiUrl}/notifications/unread-count`, { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([userRes, notifRes]) => {
        if (userRes.ok) setUser(await userRes.json());
        if (notifRes.ok) {
          const notifData = await notifRes.json();
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
      const token = localStorage.getItem('token') || localStorage.getItem('medinexa_token');
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(searchQuery)}`, {
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

  const roleCode = user?.roleCode || user?.role?.code || 'PATIENT';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-lg">
                M
              </div>
              <span className="text-lg font-extrabold text-slate-900">MediNexa</span>
            </div>

            <nav className="hidden md:flex space-x-3 text-xs font-semibold">
              <Link href="/dashboard" className="text-sky-600 font-bold">Overview</Link>
              <Link href="/dashboard/appointments" className="text-slate-600 hover:text-sky-600">Appointments</Link>
              <Link href="/dashboard/clinical" className="text-slate-600 hover:text-sky-600">Clinical EHR</Link>
              <Link href="/dashboard/medical-records" className="text-slate-600 hover:text-sky-600">Records</Link>
              <Link href="/dashboard/lab" className="text-slate-600 hover:text-sky-600">Lab</Link>
              <Link href="/dashboard/pharmacy" className="text-slate-600 hover:text-sky-600">Pharmacy</Link>
              <Link href="/dashboard/emergency" className="text-slate-600 hover:text-sky-600">Emergency</Link>
              <Link href="/dashboard/referrals" className="text-slate-600 hover:text-sky-600">Referrals</Link>
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
                className="w-64 pl-3 pr-8 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
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

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-slate-900 text-white rounded-2xl p-8 shadow-md">
          <div className="max-w-3xl space-y-2">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              {roleCode} Command Center
            </span>
            <h1 className="text-3xl font-extrabold">Welcome back, {user?.firstName || 'User'}!</h1>
            <p className="text-sky-100 text-sm">
              MediNexa Monorepo Platform — Integrated Appointments, Clinical EHR, Laboratory, Digital Prescriptions, Emergency Dispatch, Cross-Facility Referrals, and Live Bed Engine.
            </p>
          </div>
        </div>

        {/* Role-Based Command Center Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/dashboard/appointments" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">📅</div>
            <h3 className="font-bold text-slate-900 text-base">Appointments</h3>
            <p className="text-xs text-slate-500 mt-1">Book, reschedule, or check-in to doctor consultations</p>
          </Link>

          <Link href="/dashboard/clinical" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">🩺</div>
            <h3 className="font-bold text-slate-900 text-base">Clinical EHR</h3>
            <p className="text-xs text-slate-500 mt-1">Encounters, signed notes, longitudinal vitals & diagnoses</p>
          </Link>

          <Link href="/dashboard/emergency" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">🚨</div>
            <h3 className="font-bold text-slate-900 text-base">Emergency Response</h3>
            <p className="text-xs text-slate-500 mt-1">Call dispatch, triage severity, and driver telematics</p>
          </Link>

          <Link href="/dashboard/referrals" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">🏥</div>
            <h3 className="font-bold text-slate-900 text-base">Hospital Referrals</h3>
            <p className="text-xs text-slate-500 mt-1">Cross-facility patient transfers & record authorization</p>
          </Link>

          <Link href="/dashboard/lab" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">🧪</div>
            <h3 className="font-bold text-slate-900 text-base">Laboratory</h3>
            <p className="text-xs text-slate-500 mt-1">Lab orders, specimen collection, result verification</p>
          </Link>

          <Link href="/dashboard/pharmacy" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">💊</div>
            <h3 className="font-bold text-slate-900 text-base">Digital Prescriptions</h3>
            <p className="text-xs text-slate-500 mt-1">Prescription issuing, pharmacy dispensing & amendments</p>
          </Link>

          <Link href="/dashboard/medication-reminders" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">⏰</div>
            <h3 className="font-bold text-slate-900 text-base">Medicine Reminders</h3>
            <p className="text-xs text-slate-500 mt-1">Patient medication tracking & dose reminders</p>
          </Link>

          <Link href="/dashboard/system-health" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">⚙️</div>
            <h3 className="font-bold text-slate-900 text-base">System Health</h3>
            <p className="text-xs text-slate-500 mt-1">Database, REST API & WebSocket system health status</p>
          </Link>
        </div>

        {/* AI Assistant Widget */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
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
              className="flex-1 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm disabled:opacity-50"
            >
              {aiLoading ? 'Thinking...' : 'Ask AI'}
            </button>
          </form>

          {aiResponse && (
            <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs text-slate-800 space-y-2">
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
