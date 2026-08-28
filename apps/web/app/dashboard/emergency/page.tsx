'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface EmergencyVisitItem {
  id: string;
  visitNumber: string;
  patientName: string;
  patientPhone?: string;
  chiefComplaint: string;
  arrivalMode: string;
  status: string;
  triageLevel?: string;
  createdAt: string;
  doctor?: { user?: { firstName: string; lastName: string } };
  triageAssessments?: any[];
}

export default function EmergencyCommandCenterPage() {
  const [visits, setVisits] = useState<EmergencyVisitItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Analytics State
  const [analytics, setAnalytics] = useState({
    totalEmergencyVisits: 0,
    esi1Count: 0,
    esi2Count: 0,
    avgTriageTimeMinutes: 4,
    patientsWaiting: 0,
    patientsInTreatment: 0,
  });

  // Intake Modal State
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [arrivalMode, setArrivalMode] = useState('WALK_IN');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    fetchEmergencyData();
  }, []);

  const fetchEmergencyData = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [qRes, aRes] = await Promise.all([
        fetch(`${apiUrl}/emergency/queue`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${apiUrl}/emergency/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      ]);

      setVisits(Array.isArray(qRes) ? qRes : []);
      if (aRes && typeof aRes === 'object') setAnalytics(aRes);
    } catch (err) {
      console.error('Failed to load emergency data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setModalError('Patient name is required.');
      return;
    }
    if (!chiefComplaint.trim()) {
      setModalError('Chief complaint is required.');
      return;
    }

    setModalError('');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('medinexa_token');
      const payload = {
        patientName,
        patientPhone: patientPhone || undefined,
        chiefComplaint,
        arrivalMode,
        notes: notes || undefined,
      };

      const res = await fetch(`${apiUrl}/emergency/visit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to register emergency visit');

      setShowIntakeModal(false);
      setPatientName('');
      setPatientPhone('');
      setChiefComplaint('');
      setNotes('');
      fetchEmergencyData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to register intake');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEsiBadge = (esi?: string) => {
    switch (esi) {
      case 'ESI_1':
        return 'bg-red-600 text-white font-extrabold animate-pulse';
      case 'ESI_2':
        return 'bg-orange-500 text-white font-bold';
      case 'ESI_3':
        return 'bg-amber-400 text-slate-900 font-bold';
      case 'ESI_4':
        return 'bg-emerald-500 text-white font-semibold';
      case 'ESI_5':
        return 'bg-blue-500 text-white font-medium';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Emergency Department (ED) Command Center
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Apollo & Trauma Center Style ESI 1–5 Triage & Rapid Emergency Dispatch.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/triage"
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition"
          >
            🩺 Nurse Triage Workstation
          </Link>
          <Link
            href="/dashboard/emergency-doctor"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            👨‍⚕️ Emergency Doctor Queue
          </Link>
          <button
            onClick={() => setShowIntakeModal(true)}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            🚨 Register Emergency Intake
          </button>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Visits</span>
          <span className="text-2xl font-black text-slate-900 mt-0.5 block">{analytics.totalEmergencyVisits}</span>
        </div>
        <div className="bg-red-50 p-4 rounded-2xl border border-red-200 shadow-sm">
          <span className="text-[10px] font-bold text-red-600 uppercase block">ESI-1 (Resuscitation)</span>
          <span className="text-2xl font-black text-red-700 mt-0.5 block">{analytics.esi1Count}</span>
        </div>
        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-200 shadow-sm">
          <span className="text-[10px] font-bold text-orange-600 uppercase block">ESI-2 (Emergent)</span>
          <span className="text-2xl font-black text-orange-700 mt-0.5 block">{analytics.esi2Count}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Patients Waiting</span>
          <span className="text-2xl font-black text-sky-600 mt-0.5 block">{analytics.patientsWaiting}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">In Treatment</span>
          <span className="text-2xl font-black text-emerald-600 mt-0.5 block">{analytics.patientsInTreatment}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Avg Triage Time</span>
          <span className="text-2xl font-black text-purple-600 mt-0.5 block">~{analytics.avgTriageTimeMinutes} Mins</span>
        </div>
      </div>

      {/* Emergency Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Active Emergency Patients Queue</h2>
          <span className="text-xs font-semibold text-slate-500">
            Critical ESI-1 & ESI-2 Patients Top-Ranked
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium animate-pulse">
            Loading emergency department queue...
          </div>
        ) : visits.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-base font-bold">No active emergency patients in queue</p>
            <p className="text-xs mt-1">Click "🚨 Register Emergency Intake" to admit an incoming patient.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-100">
                <tr>
                  <th className="p-4">Visit #</th>
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">Arrival Mode</th>
                  <th className="p-4">ESI Level</th>
                  <th className="p-4">Chief Complaint</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Arrival Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {visits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono font-extrabold text-red-600 text-sm">
                      {v.visitNumber}
                    </td>
                    <td className="p-4">
                      <span className="font-bold block text-slate-900">{v.patientName}</span>
                      <span className="text-[11px] text-slate-400">{v.patientPhone || 'No phone'}</span>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">
                      {v.arrivalMode}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase shadow-sm ${getEsiBadge(v.triageLevel)}`}>
                        {v.triageLevel || 'PENDING TRIAGE'}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700 max-w-xs truncate">
                      {v.chiefComplaint}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {v.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Intake Modal */}
      {showIntakeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">🚨 Register Emergency Intake</h3>
              <button onClick={() => setShowIntakeModal(false)} className="text-slate-400 font-bold text-sm">✕</button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleRegisterIntake} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe / Trauma Patient"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="+1-800-555-0199"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Arrival Mode</label>
                <select
                  value={arrivalMode}
                  onChange={(e) => setArrivalMode(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 font-bold text-slate-800"
                >
                  <option value="WALK_IN">Walk-in</option>
                  <option value="AMBULANCE">Ambulance Dispatch</option>
                  <option value="REFERRAL">Hospital Referral</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Chief Complaint *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Severe chest pain, shortness of breath..."
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition"
              >
                {isSubmitting ? 'Registering Intake...' : 'Admit to Emergency Intake ✓'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
