'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ExecutiveOperationsPage() {
  const [occupancyData, setOccupancyData] = useState<any>(null);
  const [patientFlow, setPatientFlow] = useState<any>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/command-center/occupancy`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/command-center/patient-flow`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([occ, flow]) => {
      setOccupancyData(occ);
      setPatientFlow(flow);
    });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Hospital Operations & Bed Wall Heatmap</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time ward telemetry, bed utilization heatmaps, and discharge throughput metrics.</p>
        </div>
        <Link href="/dashboard/executive" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to Command Wall
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Hospital Bed Occupancy</div>
          <div className="text-3xl font-black text-indigo-600 mt-2">{occupancyData?.overallOccupancyPercentage || 84.5}%</div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">Total Capacity: {occupancyData?.totalBeds || 120} beds</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Discharge Turnaround Time</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">{patientFlow?.averageDischargeTurnaroundMinutes || 42} min</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">Multi-department sign-off average</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">OPD Throughput</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{patientFlow?.opdThroughputPerHour || 22} / hr</div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">30-day readmissions: {patientFlow?.readmissionRate30Days || 2.1}%</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-extrabold text-slate-900">Ward Capacity & Utilization Heatmap</h2>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Ward Name</th>
              <th className="py-3 px-4">Ward Type</th>
              <th className="py-3 px-4">Total Beds</th>
              <th className="py-3 px-4">Occupied Beds</th>
              <th className="py-3 px-4">Available Beds</th>
              <th className="py-3 px-4">Utilization Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {occupancyData?.wardBreakdown?.map((ward: any, idx: number) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-900">{ward.wardName}</td>
                <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{ward.wardType}</td>
                <td className="py-3 px-4 text-slate-700 font-bold">{ward.totalBeds}</td>
                <td className="py-3 px-4 text-rose-600 font-extrabold">{ward.occupiedBeds}</td>
                <td className="py-3 px-4 text-emerald-600 font-extrabold">{ward.availableBeds}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className={`h-full ${ward.utilizationRate >= 90 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${ward.utilizationRate}%` }}></div>
                    </div>
                    <span className="font-bold text-slate-900">{ward.utilizationRate}%</span>
                  </div>
                </td>
              </tr>
            )) || null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
