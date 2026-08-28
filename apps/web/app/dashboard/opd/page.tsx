'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface OpdTokenItem {
  id: string;
  tokenNumber: string;
  queueNumber: number;
  patientName: string;
  patientPhone?: string;
  status: string;
  priority: string;
  estimatedWaitMinutes: number;
  createdAt: string;
  doctor?: { user?: { firstName: string; lastName: string }; department?: { name: string } };
  facility?: { name: string; code: string };
  department?: { name: string; code: string };
}

interface Doctor {
  id: string;
  user: { firstName: string; lastName: string };
  specialty?: { name: string };
}

interface Patient {
  id: string;
  user: { firstName: string; lastName: string; phone?: string };
}

export default function ReceptionOpdDashboardPage() {
  const [tokens, setTokens] = useState<OpdTokenItem[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Analytics State
  const [analytics, setAnalytics] = useState({
    todayPatients: 0,
    avgWaitTimeMinutes: 14,
    completedConsultations: 0,
    activeQueueLength: 0,
  });

  // Create Token Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('NORMAL');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [tokRes, docRes, patRes, anaRes] = await Promise.all([
        fetch(`${apiUrl}/opd/tokens`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${apiUrl}/doctors`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${apiUrl}/patients`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${apiUrl}/opd/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      ]);

      setTokens(Array.isArray(tokRes) ? tokRes : []);
      if (Array.isArray(docRes)) {
        setDoctors(docRes);
        if (docRes.length > 0 && !selectedDoctorId) setSelectedDoctorId(docRes[0].id);
      }
      if (Array.isArray(patRes)) setPatients(patRes);
      if (anaRes && typeof anaRes === 'object') setAnalytics(anaRes);
    } catch (err) {
      console.error('Failed to load OPD queue data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setModalError('Patient name is required.');
      return;
    }
    if (!selectedDoctorId) {
      setModalError('Please select a doctor.');
      return;
    }

    setModalError('');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('medinexa_token');
      const payload = {
        patientName,
        patientPhone: patientPhone || undefined,
        doctorId: selectedDoctorId,
        priority: selectedPriority,
        notes: notes || undefined,
      };

      const res = await fetch(`${apiUrl}/opd/tokens`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate OPD token');

      setShowCreateModal(false);
      setPatientName('');
      setPatientPhone('');
      setNotes('');
      fetchData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to create token');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800 border-red-300 animate-pulse';
      case 'URGENT':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'IN_PROGRESS':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold';
      case 'CALLED':
        return 'bg-sky-100 text-sky-800 border-sky-300 font-extrabold';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'SKIPPED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'CANCELLED':
        return 'bg-red-50 text-red-600 border-red-200 line-through';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            OPD Walk-in Token & Queue Dashboard
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Apollo & AIIMS Style Walk-in Patient Token Counter & Priority Dispatch.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/queue"
            target="_blank"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            📺 Open Live Digital Display Board
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            + Generate Walk-in Token
          </button>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase block">Today's Walk-in Patients</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{analytics.todayPatients}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase block">Active Queue Length</span>
          <span className="text-2xl font-black text-sky-600 mt-1 block">{analytics.activeQueueLength} Patients</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase block">Average Wait Time</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">~{analytics.avgWaitTimeMinutes} Minutes</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase block">Completed Consultations</span>
          <span className="text-2xl font-black text-purple-600 mt-1 block">{analytics.completedConsultations}</span>
        </div>
      </div>

      {/* Today's Queue Roster */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Today's OPD Queue Roster</h2>
          <span className="text-xs font-semibold text-slate-500">
            Real-time Priority Order (Emergency & Urgent Top-ranked)
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium animate-pulse">
            Loading today's OPD token queue...
          </div>
        ) : tokens.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-base font-bold">No tokens issued for today yet</p>
            <p className="text-xs mt-1">Click "+ Generate Walk-in Token" to issue a new token to a patient.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-100">
                <tr>
                  <th className="p-4">Token #</th>
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">Assigned Doctor</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Wait Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Issued At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {tokens.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono font-extrabold text-sky-600 text-sm">
                      {t.tokenNumber}
                    </td>
                    <td className="p-4">
                      <span className="font-bold block text-slate-900">{t.patientName}</span>
                      <span className="text-[11px] text-slate-400">{t.patientPhone || 'No phone'}</span>
                    </td>
                    <td className="p-4 font-semibold">
                      Dr. {t.doctor?.user?.firstName} {t.doctor?.user?.lastName}
                      <span className="text-[11px] block text-slate-400">{t.department?.name}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getPriorityBadge(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">~{t.estimatedWaitMinutes} mins</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] border ${getStatusBadge(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Walk-in Token Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Issue Walk-in OPD Token</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 font-bold text-sm">✕</button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateToken} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Jackson"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+1-800-555-0199"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Assign OPD Doctor *</label>
                <select
                  required
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 font-bold text-slate-800"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.user.firstName} {d.user.lastName} ({d.specialty?.name || 'Specialist'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Queue Priority</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 font-bold text-slate-800"
                >
                  <option value="NORMAL">Normal (Standard Walk-in)</option>
                  <option value="URGENT">Urgent (Senior Citizen / High Fever)</option>
                  <option value="EMERGENCY">Emergency (Immediate Triage)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Chief Complaint / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Reason for visit..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md transition"
              >
                {isSubmitting ? 'Generating Token...' : 'Issue OPD Token ✓'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
