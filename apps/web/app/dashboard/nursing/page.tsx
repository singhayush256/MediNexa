'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface AdmissionItem {
  id: string;
  admissionNumber: string;
  patient: { id: string; user: { firstName: string; lastName: string } };
  department?: { name: string };
  bedAssignments?: any[];
  admittedAt: string;
}

export default function NursingStationCommandDashboardPage() {
  const [admissions, setAdmissions] = useState<AdmissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Analytics State
  const [analytics, setAnalytics] = useState({
    activeAdmissions: 0,
    medicationsDue: 0,
    missedDoses: 0,
    criticalAlerts: 0,
    avgResponseTimeMinutes: 6,
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    fetchNursingData();
  }, []);

  const fetchNursingData = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [admRes, anaRes] = await Promise.all([
        fetch(`${apiUrl}/admissions`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${apiUrl}/nursing/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      ]);

      setAdmissions(Array.isArray(admRes) ? admRes : []);
      if (anaRes && typeof anaRes === 'object') setAnalytics(anaRes);
    } catch (err) {
      console.error('Failed to load nursing station data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            IPD Nursing Station & MAR Command Center
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Apollo & Fortis Style Bedside Nursing Operations, MAR Administration & Shift Handovers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/nursing/mar"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            💊 Inpatient MAR Schedule
          </Link>
          <Link
            href="/dashboard/nursing/vitals"
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            🩺 Vitals Flowsheet
          </Link>
          <Link
            href="/dashboard/nursing/handover"
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            📋 Shift Handover
          </Link>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase block">Active Inpatients</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{analytics.activeAdmissions}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase block">Medications Due</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{analytics.medicationsDue} Doses</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase block">Missed Doses</span>
          <span className="text-2xl font-black text-red-600 mt-1 block">{analytics.missedDoses}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase block">Critical Alerts</span>
          <span className="text-2xl font-black text-purple-600 mt-1 block">{analytics.criticalAlerts}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase block">Avg Response Time</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">~{analytics.avgResponseTimeMinutes} Mins</span>
        </div>
      </div>

      {/* Active Admissions Bed Roster */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Inpatient Bed & MAR Roster</h2>
          <span className="text-xs font-semibold text-slate-500">
            Real-time Bedside Administration Queue
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium animate-pulse">
            Loading nursing station inpatient roster...
          </div>
        ) : admissions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-base font-bold">No active admissions assigned to nursing station</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-100">
                <tr>
                  <th className="p-4">Admission #</th>
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Assigned Bed</th>
                  <th className="p-4">Admitted At</th>
                  <th className="p-4">Quick Workstation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {admissions.map((adm) => {
                  const bedName = adm.bedAssignments?.[0]?.bed?.code || 'CARDIO-201';
                  return (
                    <tr key={adm.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-mono font-extrabold text-sky-600 text-sm">
                        {adm.admissionNumber}
                      </td>
                      <td className="p-4">
                        <span className="font-bold block text-slate-900">
                          {adm.patient?.user?.firstName} {adm.patient?.user?.lastName}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">
                        {adm.department?.name || 'Inpatient General Ward'}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          🛏️ {bedName}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(adm.admittedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/dashboard/nursing/mar?admissionId=${adm.id}`}
                            className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg transition"
                          >
                            MAR Log 💊
                          </Link>
                          <Link
                            href={`/dashboard/nursing/vitals?admissionId=${adm.id}`}
                            className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold rounded-lg transition"
                          >
                            Vitals 🩺
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
