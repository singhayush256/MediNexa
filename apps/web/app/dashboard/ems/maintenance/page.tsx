'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EmsMaintenancePage() {
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [maintenanceList, setMaintenanceList] = useState<any[]>([
    {
      id: '1',
      maintenanceNumber: 'MNT-EMS-2026-081',
      vehicleNumber: 'AMB-ALS-01',
      maintenanceType: 'Preventative 10,000km Engine Servicing & Brake Pad Overhaul',
      scheduledDate: '2026-08-30',
      cost: 450,
      status: 'SCHEDULED',
    },
    {
      id: '2',
      maintenanceNumber: 'MNT-EMS-2026-079',
      vehicleNumber: 'AMB-BLS-02',
      maintenanceType: 'Onboard Defibrillator & Medical Gas Oxygen Line Recalibration',
      scheduledDate: '2026-08-25',
      completedDate: '2026-08-26',
      cost: 280,
      status: 'COMPLETED',
    },
  ]);
  const [form, setForm] = useState({
    vehicleNumber: '',
    maintenanceType: 'Biomedical Equipment & Oxygen Line Calibration',
    scheduledDate: new Date().toISOString().split('T')[0],
    cost: 350,
  });
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/ems/ambulances`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setAmbulances(Array.isArray(d) ? d : []));
  }, []);

  const handleScheduleMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord = {
      id: String(Date.now()),
      maintenanceNumber: `MNT-EMS-${Date.now().toString().slice(-4)}`,
      vehicleNumber: form.vehicleNumber || 'AMB-ALS-01',
      maintenanceType: form.maintenanceType,
      scheduledDate: form.scheduledDate,
      cost: Number(form.cost),
      status: 'SCHEDULED',
    };
    setMaintenanceList([newRecord, ...maintenanceList]);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider rounded-full">
              FLEET RELIABILITY & SERVICING
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Fleet Maintenance Scheduler</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Preventative mechanical servicing, engine inspections, biomedical device calibrations, and vehicle readiness tracking.
          </p>
        </div>
        <Link href="/dashboard/ems" className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
          ← Back to EMS Overview
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Schedule Maintenance Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">🔧 Schedule Vehicle Service</h2>
          <form onSubmit={handleScheduleMaintenance} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Select Ambulance Vehicle</label>
              <select
                value={form.vehicleNumber}
                onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="">Choose Ambulance</option>
                {ambulances.map((amb) => (
                  <option key={amb.id} value={amb.vehicleNumber}>
                    {amb.vehicleNumber} ({amb.registrationNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Maintenance Category</label>
              <select
                value={form.maintenanceType}
                onChange={(e) => setForm({ ...form, maintenanceType: e.target.value })}
                className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Biomedical Equipment & Oxygen Line Calibration">Biomedical Equipment & Oxygen Line Calibration</option>
                <option value="Periodic Engine & Transmission Overhaul">Periodic Engine & Transmission Overhaul</option>
                <option value="Braking System & Tire Replacement">Braking System & Tire Replacement</option>
                <option value="Emergency Siren & Light Bar Electrical Repair">Emergency Siren & Light Bar Electrical Repair</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Scheduled Date</label>
              <input
                type="date"
                required
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Estimated Servicing Cost ($)</label>
              <input
                type="number"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow transition mt-2">
              📅 Book Service Ticket
            </button>
          </form>
        </div>

        {/* Maintenance Log */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">Fleet Maintenance Records ({maintenanceList.length})</h2>
          <div className="space-y-3">
            {maintenanceList.map((mnt) => (
              <div key={mnt.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-900">#{mnt.maintenanceNumber}</span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-black rounded">
                      {mnt.vehicleNumber}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                      mnt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {mnt.status}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800">{mnt.maintenanceType}</div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  <div>Date: {mnt.scheduledDate}</div>
                  <div className="font-bold text-slate-900">Cost: ${mnt.cost}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
