'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function QualityDashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/quality/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setAnalytics(d));
  }, []);

  const data = analytics || {
    infectionRate: 0.8,
    haiRate: 0.4,
    totalInfectionCases: 3,
    haiInfectionCases: 1,
    totalIncidentsReported: 6,
    sentinelEvents: 0,
    capaCompletionRate: 92.5,
    auditCompliancePercentage: 96.2,
    handHygieneCompliancePercentage: 97.4,
    patientSafetyScore: 98.6,
    safetyChecklistComplianceRate: 98.8,
    departmentQualityRanking: [
      { department: 'Intensive Coronary Care Unit (ICCU)', score: 98.5, compliance: 'NABH_EXEMPLARY' },
      { department: 'Operation Theatre Complex', score: 97.8, compliance: 'NABH_EXEMPLARY' },
      { department: 'Emergency & Trauma Care', score: 96.4, compliance: 'NABH_COMPLIANT' },
      { department: 'Inpatient Medical Wards', score: 95.2, compliance: 'NABH_COMPLIANT' },
    ],
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider rounded-full">
              NABH & JCI ACCREDITED QUALITY GOVERNANCE
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Infection Control & Patient Safety</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Comprehensive HAI surveillance, adverse incident logging, root cause analysis (RCA), and CAPA tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/quality/incidents" className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition">
            ⚠️ Log Incident / Sentinel Event
          </Link>
          <Link href="/dashboard/quality/infections" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition">
            🦠 Report Infection Case
          </Link>
        </div>
      </div>

      {/* Navigation Sub-Links */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <Link href="/dashboard/quality" className="px-4 py-2 bg-emerald-50 text-emerald-800 font-black text-xs rounded-xl">Quality Scorecard</Link>
        <Link href="/dashboard/quality/incidents" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Incident Reports</Link>
        <Link href="/dashboard/quality/infections" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Infection Surveillance</Link>
        <Link href="/dashboard/quality/audits" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Clinical Audits</Link>
        <Link href="/dashboard/quality/capa" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">CAPA Tracker</Link>
        <Link href="/dashboard/quality/safety" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Safety & Hand Hygiene</Link>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Patient Safety Score</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">{data.patientSafetyScore}%</div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">Checklist Compliance: {data.safetyChecklistComplianceRate}%</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Hospital Acquired Infection (HAI)</div>
          <div className="text-3xl font-black text-indigo-600 mt-2">{data.haiRate}%</div>
          <div className="text-[11px] text-indigo-600 font-bold mt-1">{data.haiInfectionCases} active HAI surveillance cases</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Hand Hygiene Compliance</div>
          <div className="text-3xl font-black text-blue-600 mt-2">{data.handHygieneCompliancePercentage}%</div>
          <div className="text-[11px] text-blue-600 font-bold mt-1">WHO 5-Moments protocol adherence</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">CAPA Closure Rate</div>
          <div className="text-3xl font-black text-amber-600 mt-2">{data.capaCompletionRate}%</div>
          <div className="text-[11px] text-rose-600 font-bold mt-1">Sentinel Events MTD: {data.sentinelEvents}</div>
        </div>
      </div>

      {/* Quality Governance & Department Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Quality Ranking */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center justify-between">
            <span>🏆 Department Quality Compliance Ranking</span>
            <span className="text-xs text-emerald-600 font-bold">NABH Metric</span>
          </h2>
          <div className="space-y-3 pt-2">
            {data.departmentQualityRanking.map((dept: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-xs text-slate-900">{dept.department}</div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                    {dept.compliance}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-slate-900">{dept.score}%</div>
                  <div className="text-[10px] text-slate-400 font-bold">Audit Score</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links & Safety Directives */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">🛡️ Clinical Safety & Accreditation Shortcuts</h2>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link href="/dashboard/quality/incidents" className="p-4 rounded-2xl border border-rose-100 bg-rose-50/50 hover:bg-rose-100/50 transition">
              <div className="text-lg">⚠️</div>
              <div className="font-extrabold text-xs text-slate-900 mt-2">Adverse Incidents</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Report medication errors, falls, and sentinel events.</p>
            </Link>
            <Link href="/dashboard/quality/infections" className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100/50 transition">
              <div className="text-lg">🦠</div>
              <div className="font-extrabold text-xs text-slate-900 mt-2">Infection Control</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Surveillance for CAUTI, CLABSI, SSI, VAP & MRSA.</p>
            </Link>
            <Link href="/dashboard/quality/audits" className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/50 transition">
              <div className="text-lg">📋</div>
              <div className="font-extrabold text-xs text-slate-900 mt-2">Clinical Audits</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Schedule and record NABH/JCI departmental audits.</p>
            </Link>
            <Link href="/dashboard/quality/capa" className="p-4 rounded-2xl border border-amber-100 bg-amber-50/50 hover:bg-amber-100/50 transition">
              <div className="text-lg">🔄</div>
              <div className="font-extrabold text-xs text-slate-900 mt-2">CAPA Tracker</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Corrective and preventive action lifecycle monitoring.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
