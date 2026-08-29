'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EmsFleetPage() {
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    vehicleNumber: '',
    registrationNumber: '',
    ambulanceType: 'ADVANCED_LIFE_SUPPORT',
    equipmentSummary: 'Defibrillator, ICU Ventilator, Syringe Infusion Pump, Stretcher',
    assignedCrew: 'Paramedic Sarah Connor, EMT John Connor',
  });
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/ems/ambulances`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        setAmbulances(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegisterAmbulance = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    const res = await fetch(`${apiUrl}/ems/ambulances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({
        vehicleNumber: '',
        registrationNumber: '',
        ambulanceType: 'ADVANCED_LIFE_SUPPORT',
        equipmentSummary: 'Defibrillator, ICU Ventilator, Syringe Infusion Pump, Stretcher',
        assignedCrew: 'Paramedic Sarah Connor, EMT John Connor',
      });
      loadData();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-black uppercase tracking-wider rounded-full">
              EMS VEHICLES & PARAMEDICS
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ambulance Fleet & Crew Console</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage Advanced Life Support (ALS), Basic Life Support (BLS), neonatal transport units, and emergency medical technicians.
          </p>
        </div>
        <Link href="/dashboard/ems" className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
          ← Back to EMS Overview
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Register Ambulance Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">🚐 Register Emergency Ambulance</h2>
          <form onSubmit={handleRegisterAmbulance} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Ambulance Vehicle Code</label>
              <input
                type="text"
                required
                value={form.vehicleNumber}
                onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                placeholder="e.g. AMB-ALS-04"
                className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">License Registration No.</label>
              <input
                type="text"
                required
                value={form.registrationNumber}
                onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                placeholder="e.g. NY-EMRG-9812"
                className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Vehicle Type</label>
              <select
                value={form.ambulanceType}
                onChange={(e) => setForm({ ...form, ambulanceType: e.target.value })}
                className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="ADVANCED_LIFE_SUPPORT">ADVANCED LIFE SUPPORT (ALS)</option>
                <option value="BASIC_LIFE_SUPPORT">BASIC LIFE SUPPORT (BLS)</option>
                <option value="NEONATAL">NEONATAL TRANSPORT UNIT (NICU)</option>
                <option value="PATIENT_TRANSPORT">PATIENT NON-CRITICAL TRANSPORT</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Onboard Medical Equipment</label>
              <textarea
                rows={2}
                value={form.equipmentSummary}
                onChange={(e) => setForm({ ...form, equipmentSummary: e.target.value })}
                className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Assigned EMS Crew</label>
              <input
                type="text"
                value={form.assignedCrew}
                onChange={(e) => setForm({ ...form, assignedCrew: e.target.value })}
                className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow transition mt-2">
              ➕ Register to Fleet
            </button>
          </form>
        </div>

        {/* Fleet Roster */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Hospital Emergency Fleet ({ambulances.length} units)</h2>
            <button onClick={loadData} className="text-xs text-indigo-600 font-bold hover:underline">
              ↻ Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 p-8 text-center text-xs text-slate-400">Loading ambulance fleet...</div>
            ) : ambulances.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-xs text-slate-400">No ambulances registered.</div>
            ) : (
              ambulances.map((amb) => (
                <div key={amb.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">#{amb.vehicleNumber}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                        amb.status === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : amb.status === 'MAINTENANCE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {amb.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">Plate: {amb.registrationNumber}</div>
                  <div className="text-xs font-bold text-indigo-700">{amb.ambulanceType}</div>
                  <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                    <span className="font-bold text-slate-800">Crew: </span>
                    {amb.assignedCrew || 'Assigned Paramedic & EMT'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Equipment: {amb.equipmentSummary || 'Standard ICU Transport Kit'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
