'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ExecutiveClinicalPage() {
  const [docPerf, setDocPerf] = useState<any>(null);
  const [labPerf, setLabPerf] = useState<any>(null);
  const [emgPerf, setEmgPerf] = useState<any>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/command-center/doctor-performance`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/command-center/lab-performance`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/command-center/emergency-performance`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([doc, lab, emg]) => {
      setDocPerf(doc);
      setLabPerf(lab);
      setEmgPerf(emg);
    });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Clinical Governance & Department Scorecards</h1>
          <p className="text-xs text-slate-500 mt-1">Physician productivity, laboratory turnaround times, emergency triage speed, and clinical quality.</p>
        </div>
        <Link href="/dashboard/executive" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to Command Wall
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Physician Utilization</div>
          <div className="text-3xl font-black text-indigo-600 mt-2">{docPerf?.doctorUtilizationScore || 94.8}%</div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">Avg consult: {docPerf?.averageConsultationTimeMinutes || 16.5} min</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Lab Quality Compliance</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">{labPerf?.qualityControlComplianceRate || 99.8}%</div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">TAT: {labPerf?.averageTurnaroundMinutes || 35} min</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">ED Door-to-Doctor Time</div>
          <div className="text-3xl font-black text-amber-600 mt-2">{emgPerf?.averageDoorToDoctorMinutes || 6.2} min</div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">IPD Conversion: {emgPerf?.conversionToIpdAdmissionRate || 35.7}%</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-extrabold text-slate-900">Clinical Specialty Workload Distribution</h2>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Medical Specialty</th>
              <th className="py-3 px-4">Consultations Today</th>
              <th className="py-3 px-4">Surgeries Today</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {docPerf?.topSpecialtiesByVolume?.map((spec: any, idx: number) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-900">{spec.specialty}</td>
                <td className="py-3 px-4 font-extrabold text-indigo-600">{spec.consultationsToday} patients</td>
                <td className="py-3 px-4 font-black text-emerald-600">{spec.surgeriesToday} procedures</td>
              </tr>
            )) || null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
