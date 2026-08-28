'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface TelemedSessionItem {
  id: string;
  roomName: string;
  status: string;
  scheduledStartTime: string;
  durationMinutes?: number;
  patient?: { user?: { firstName: string; lastName: string } };
  doctor?: { user?: { firstName: string; lastName: string } };
  facility?: { id: string; name: string };
}

export default function TelemedicineCommandDashboardPage() {
  const [sessions, setSessions] = useState<TelemedSessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Analytics State
  const [analytics, setAnalytics] = useState({
    sessionsToday: 0,
    avgConsultationDurationMinutes: 18,
    completedSessions: 0,
    cancelledSessions: 0,
    doctorUtilizationPercentage: 88,
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    fetchTelemedicineData();
  }, []);

  const fetchTelemedicineData = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [sesRes, anaRes] = await Promise.all([
        fetch(`${apiUrl}/telemedicine/my-sessions`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${apiUrl}/telemedicine/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      ]);

      setSessions(Array.isArray(sesRes) ? sesRes : []);
      if (anaRes && typeof anaRes === 'object') setAnalytics(anaRes);
    } catch (err) {
      console.error('Failed to load telemedicine dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'LIVE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold animate-pulse';
      case 'WAITING':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 font-bold';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Telemedicine & Virtual Consultation Command Center
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Apollo & Practo Style HD Video Consultations, Waiting Rooms & In-Session EHR Integration.
          </p>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase block">Sessions Today</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{analytics.sessionsToday}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase block">Avg Duration</span>
          <span className="text-2xl font-black text-sky-600 mt-1 block">~{analytics.avgConsultationDurationMinutes} Mins</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase block">Completed Sessions</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{analytics.completedSessions}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase block">Cancelled Sessions</span>
          <span className="text-2xl font-black text-red-600 mt-1 block">{analytics.cancelledSessions}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase block">Doctor Utilization</span>
          <span className="text-2xl font-black text-purple-600 mt-1 block">{analytics.doctorUtilizationPercentage}%</span>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Virtual Consultation Roster</h2>
          <span className="text-xs font-semibold text-slate-500">Live Virtual Rooms</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium animate-pulse">
            Loading telemedicine sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">
            No virtual consultation sessions scheduled.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-100">
                <tr>
                  <th className="p-4">Room Name</th>
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">Attending Doctor</th>
                  <th className="p-4">Scheduled Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono font-bold text-sky-600">
                      {s.roomName}
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {s.patient?.user?.firstName} {s.patient?.user?.lastName}
                    </td>
                    <td className="p-4 font-semibold text-slate-700">
                      Dr. {s.doctor?.user?.firstName} {s.doctor?.user?.lastName}
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(s.scheduledStartTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] border ${getStatusBadge(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/dashboard/telemedicine/${s.id}`}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow text-[11px] transition inline-flex items-center space-x-1"
                      >
                        <span>📹 Join Video Call</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
