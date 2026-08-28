'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface DoctorToken {
  id: string;
  tokenNumber: string;
  queueNumber: number;
  patientName: string;
  patientPhone?: string;
  status: string;
  priority: string;
  estimatedWaitMinutes: number;
  notes?: string;
  createdAt: string;
  calledAt?: string;
  startedAt?: string;
}

export default function DoctorQueueWorkstationPage() {
  const [tokens, setTokens] = useState<DoctorToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDoctorId, setActiveDoctorId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    fetchDoctorQueue();
  }, []);

  const fetchDoctorQueue = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const meRes = await fetch(`${apiUrl}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
      const doctorId = meRes.doctorProfile?.id;
      if (doctorId) {
        setActiveDoctorId(doctorId);
        const queueRes = await fetch(`${apiUrl}/opd/doctors/${doctorId}/queue`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json());
        setTokens(Array.isArray(queueRes) ? queueRes : []);
      }
    } catch (err) {
      console.error('Failed to load doctor queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'call' | 'start' | 'complete' | 'skip') => {
    const token = localStorage.getItem('medinexa_token');
    setIsProcessing(true);
    try {
      const res = await fetch(`${apiUrl}/opd/tokens/${id}/${action}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        fetchDoctorQueue();
      }
    } catch (err) {
      console.error(`Action ${action} failed:`, err);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPatient = tokens.find((t) => t.status === 'IN_PROGRESS' || t.status === 'CALLED');
  const waitingTokens = tokens.filter((t) => t.status === 'WAITING');

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Doctor OPD Consultation Workstation
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Call patients, start consultations, and complete OPD visits in real-time.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDoctorQueue}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            🔄 Refresh Queue
          </button>
        </div>
      </div>

      {/* Currently Active Patient Box */}
      {currentPatient ? (
        <div className="bg-gradient-to-br from-sky-900 to-indigo-900 text-white rounded-3xl p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-sky-800 pb-4">
            <div>
              <span className="text-xs font-bold text-sky-300 uppercase tracking-widest">
                {currentPatient.status === 'IN_PROGRESS' ? 'Now In Consultation' : 'Patient Called'}
              </span>
              <h2 className="text-3xl font-extrabold mt-1">{currentPatient.patientName}</h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-sky-300 font-semibold block">Token Number</span>
              <span className="text-3xl font-black text-amber-400 font-mono tracking-wider">
                {currentPatient.tokenNumber}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-sky-300 font-semibold block">Queue Priority</span>
              <span className="font-extrabold text-white">{currentPatient.priority}</span>
            </div>
            <div>
              <span className="text-sky-300 font-semibold block">Phone</span>
              <span className="font-extrabold text-white">{currentPatient.patientPhone || 'N/A'}</span>
            </div>
            <div>
              <span className="text-sky-300 font-semibold block">Chief Complaint</span>
              <span className="font-extrabold text-white">{currentPatient.notes || 'Routine consultation'}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-sky-800 flex flex-wrap gap-3">
            {currentPatient.status === 'CALLED' && (
              <button
                disabled={isProcessing}
                onClick={() => handleAction(currentPatient.id, 'start')}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-md transition"
              >
                ▶ Start Consultation
              </button>
            )}

            {currentPatient.status === 'IN_PROGRESS' && (
              <button
                disabled={isProcessing}
                onClick={() => handleAction(currentPatient.id, 'complete')}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-md transition"
              >
                ✓ Complete Consultation
              </button>
            )}

            <button
              disabled={isProcessing}
              onClick={() => handleAction(currentPatient.id, 'skip')}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
            >
              ⏭ Skip Patient
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">No Patient Currently Called</h2>
          <p className="text-xs text-slate-500">Click "Call Next Patient" below to summon the top-ranked patient in your waiting list.</p>

          {waitingTokens.length > 0 && (
            <button
              disabled={isProcessing}
              onClick={() => handleAction(waitingTokens[0].id, 'call')}
              className="px-8 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
            >
              📢 Call Next Patient (#{waitingTokens[0].tokenNumber})
            </button>
          )}
        </div>
      )}

      {/* Waiting List Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Waiting Queue ({waitingTokens.length} Patients)
        </h2>

        {loading ? (
          <div className="py-8 text-center text-slate-500 font-medium animate-pulse">
            Loading queue...
          </div>
        ) : waitingTokens.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-medium">
            Waiting list is clear! No pending walk-in patients.
          </div>
        ) : (
          <div className="space-y-3">
            {waitingTokens.map((t) => (
              <div
                key={t.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 hover:border-sky-300 transition"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-sky-600 text-white font-mono font-black text-sm rounded-xl flex items-center justify-center shadow-sm">
                    #{t.queueNumber}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{t.patientName}</h3>
                    <span className="text-xs text-sky-600 font-mono font-bold">{t.tokenNumber}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${t.priority === 'EMERGENCY' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-slate-200 text-slate-700 border-slate-300'}`}>
                    {t.priority}
                  </span>
                  <button
                    disabled={isProcessing}
                    onClick={() => handleAction(t.id, 'call')}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                  >
                    Call Patient 📢
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
