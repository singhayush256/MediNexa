'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ExecutiveDashboardPage() {
  const [data, setData] = useState<any>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/command-center/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setData(d));
  }, []);

  const kpis = data?.kpis || {
    revenueToday: 128450,
    revenueMonth: 452000,
    arOutstanding: 32500,
    insuranceRecoveryRate: 94.2,
    occupancyRate: 84.5,
    totalBeds: 120,
    occupiedBeds: 98,
    activeAdmissions: 45,
    todayOpdTokens: 135,
    emergencyVisits: 28,
    averageLos: 3.4,
    patientSatisfactionScore: 98.4,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-black uppercase tracking-wider rounded-full">
              C-LEVEL COMMAND CENTER
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Executive BI & Hospital Command Wall</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time multi-departmental intelligence, bed occupancy heatmaps, revenue stream analytics, and clinical operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/executive/alerts" className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition">
            🚨 Alert Center ({data?.criticalAlertsCount || 3})
          </Link>
          <button onClick={() => window.print()} className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition">
            🖨️ Print Executive Report
          </button>
        </div>
      </div>

      {/* Navigation Sub-Links */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <Link href="/dashboard/executive" className="px-4 py-2 bg-indigo-50 text-indigo-800 font-black text-xs rounded-xl">CEO Overview</Link>
        <Link href="/dashboard/executive/revenue" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Revenue Intelligence</Link>
        <Link href="/dashboard/executive/operations" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Operations & Bed Wall</Link>
        <Link href="/dashboard/executive/clinical" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Clinical & Doctors</Link>
        <Link href="/dashboard/executive/alerts" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Board Alerts</Link>
      </div>

      {/* Top Level Financial & Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Revenue Collected Today</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">${kpis.revenueToday.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">Month MTD: ${kpis.revenueMonth.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Hospital Bed Occupancy</div>
          <div className="text-3xl font-black text-indigo-600 mt-2">{kpis.occupancyRate}%</div>
          <div className="text-[11px] text-indigo-600 font-bold mt-1">{kpis.occupiedBeds} / {kpis.totalBeds} beds occupied</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Emergency Intake</div>
          <div className="text-3xl font-black text-rose-600 mt-2">{kpis.emergencyVisits}</div>
          <div className="text-[11px] text-rose-600 font-bold mt-1">Active IPD: {kpis.activeAdmissions} patients</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Patient Satisfaction</div>
          <div className="text-3xl font-black text-amber-600 mt-2">{kpis.patientSatisfactionScore}%</div>
          <div className="text-[11px] text-amber-600 font-bold mt-1">Avg LOS: {kpis.averageLos} days</div>
        </div>
      </div>

      {/* Departmental Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Hospital Operations Summary */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center justify-between">
            <span>🏥 Live Facility Operations</span>
            <span className="text-xs text-indigo-600 font-bold">Real-time Telemetry</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase">OPD Tokens Today</div>
              <div className="text-xl font-black text-slate-900 mt-1">{kpis.todayOpdTokens}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase">Lab Orders Today</div>
              <div className="text-xl font-black text-slate-900 mt-1">{kpis.labOrders || 64}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase">Pharmacy Rx</div>
              <div className="text-xl font-black text-slate-900 mt-1">{kpis.pharmacyOrders || 88}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase">Telemedicine</div>
              <div className="text-xl font-black text-slate-900 mt-1">{kpis.telemedicineSessions || 16}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase">AR Outstanding</div>
              <div className="text-xl font-black text-rose-600 mt-1">${kpis.arOutstanding?.toLocaleString()}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase">Insurance Recovery</div>
              <div className="text-xl font-black text-emerald-600 mt-1">{kpis.insuranceRecoveryRate}%</div>
            </div>
          </div>
        </div>

        {/* Live Board Alert Feed */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">🚨 Critical Executive Board Alerts</h2>
            <Link href="/dashboard/executive/alerts" className="text-xs font-bold text-indigo-600 hover:underline">View All →</Link>
          </div>
          <div className="space-y-3">
            {data?.openAlerts?.slice(0, 3).map((alert: any) => (
              <div key={alert.id} className="p-4 rounded-2xl border border-rose-100 bg-rose-50/50 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded-full uppercase">
                      {alert.severity}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{alert.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">{alert.description}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                  {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )) || (
              <div className="text-xs text-slate-400 py-4 text-center">No active critical alerts.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
