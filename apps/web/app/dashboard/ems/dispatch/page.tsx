'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EmsDispatchPage() {
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    patientName: '',
    patientPhone: '',
    emergencyType: 'Cardiac Arrest & Severe Chest Pain',
    pickupAddress: '',
    priority: 'CRITICAL',
    ambulanceId: '',
  });
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/ems/dispatch`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/ems/ambulances`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([disp, amb]) => {
        setDispatches(Array.isArray(disp) ? disp : []);
        setAmbulances(Array.isArray(amb) ? amb : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    const res = await fetch(`${apiUrl}/ems/dispatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({
        patientName: '',
        patientPhone: '',
        emergencyType: 'Cardiac Arrest & Severe Chest Pain',
        pickupAddress: '',
        priority: 'CRITICAL',
        ambulanceId: '',
      });
      loadData();
    }
  };

  const updateStatus = async (id: string, action: string) => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    await fetch(`${apiUrl}/ems/dispatch/${id}/${action}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadData();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-black uppercase tracking-wider rounded-full">
              CAD COMPUTER-AIDED DISPATCH
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Emergency Dispatch Console</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Rapid 911/108 dispatching, ALS/BLS crew allocation, scene status transitions, and emergency admission notifications.
          </p>
        </div>
        <Link href="/dashboard/ems" className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
          ← Back to EMS Overview
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Dispatch Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">🚨 Create New Emergency Dispatch</h2>
          <form onSubmit={handleCreateDispatch} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Patient Full Name</label>
              <input
                type="text"
                required
                value={form.patientName}
                onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                placeholder="e.g. Johnathan Smith"
                className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Contact Phone</label>
              <input
                type="tel"
                required
                value={form.patientPhone}
                onChange={(e) => setForm({ ...form, patientPhone: e.target.value })}
                placeholder="+1-800-555-EMRG"
                className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Emergency Category</label>
              <select
                value={form.emergencyType}
                onChange={(e) => setForm({ ...form, emergencyType: e.target.value })}
                className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Cardiac Arrest & Severe Chest Pain">Cardiac Arrest & Severe Chest Pain</option>
                <option value="Road Traffic Accident (Polytrauma)">Road Traffic Accident (Polytrauma)</option>
                <option value="Acute Stroke & Neurological Deficit">Acute Stroke & Neurological Deficit</option>
                <option value="Severe Respiratory Failure / Asthma">Severe Respiratory Failure / Asthma</option>
                <option value="Maternal & Obstetric Emergency">Maternal & Obstetric Emergency</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Incident Pickup Location</label>
              <textarea
                required
                rows={2}
                value={form.pickupAddress}
                onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                placeholder="Exact street address, landmarks, floor number..."
                className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Triage Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="CRITICAL">🔴 CRITICAL</option>
                  <option value="HIGH">🟠 HIGH</option>
                  <option value="MEDIUM">🟡 MEDIUM</option>
                  <option value="LOW">🟢 LOW</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Assign Ambulance</label>
                <select
                  value={form.ambulanceId}
                  onChange={(e) => setForm({ ...form, ambulanceId: e.target.value })}
                  className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Auto-Select Nearest</option>
                  {ambulances.map((amb) => (
                    <option key={amb.id} value={amb.id}>
                      {amb.vehicleNumber} ({amb.ambulanceType}) - {amb.status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow transition mt-2">
              🚨 Dispatch Emergency Unit
            </button>
          </form>
        </div>

        {/* Active Dispatches Roster */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Active & Historical Dispatches ({dispatches.length})</h2>
            <button onClick={loadData} className="text-xs text-rose-600 font-bold hover:underline">
              ↻ Refresh
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading emergency dispatches...</div>
            ) : dispatches.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No emergency dispatches recorded today.</div>
            ) : (
              dispatches.map((dsp) => (
                <div key={dsp.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div>
                      <span className="font-extrabold text-xs text-slate-900">#{dsp.dispatchNumber}</span>
                      <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-800 text-[10px] font-extrabold rounded">
                        {dsp.priority}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 text-[11px] font-black rounded-full ${
                        dsp.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : dsp.status === 'TRANSPORTING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800 animate-pulse'
                      }`}
                    >
                      {dsp.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">PATIENT</div>
                      <div className="font-bold text-slate-900">{dsp.patientName || 'Emergency Victim'}</div>
                      <div className="text-[11px] text-slate-500">{dsp.patientPhone}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">VEHICLE ASSIGNED</div>
                      <div className="font-bold text-slate-900">#{dsp.ambulance?.vehicleNumber}</div>
                      <div className="text-[11px] text-slate-500">{dsp.ambulance?.ambulanceType}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">PICKUP LOCATION</div>
                      <div className="truncate text-slate-700">{dsp.pickupAddress}</div>
                    </div>
                  </div>

                  {dsp.status !== 'COMPLETED' && dsp.status !== 'CANCELLED' && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                      {dsp.status === 'ASSIGNED' && (
                        <button
                          onClick={() => updateStatus(dsp.id, 'en-route')}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg"
                        >
                          🚗 Mark En-Route
                        </button>
                      )}
                      {dsp.status === 'EN_ROUTE' && (
                        <button
                          onClick={() => updateStatus(dsp.id, 'arrived-scene')}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg"
                        >
                          📍 Arrived At Scene
                        </button>
                      )}
                      {dsp.status === 'AT_SCENE' && (
                        <button
                          onClick={() => updateStatus(dsp.id, 'transporting')}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg"
                        >
                          🚑 Transporting to ER
                        </button>
                      )}
                      {dsp.status === 'TRANSPORTING' && (
                        <button
                          onClick={() => updateStatus(dsp.id, 'complete')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg"
                        >
                          🏥 Arrived at Hospital & Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
