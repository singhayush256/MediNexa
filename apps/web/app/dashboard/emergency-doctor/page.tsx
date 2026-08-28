'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface EmergencyVisitItem {
  id: string;
  visitNumber: string;
  patientName: string;
  chiefComplaint: string;
  triageLevel?: string;
  status: string;
  createdAt: string;
  triageAssessments?: any[];
}

export default function EmergencyDoctorWorkstationPage() {
  const [visits, setVisits] = useState<EmergencyVisitItem[]>([]);
  const [loading, setLoading] = useState(true);
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
      const res = await fetch(`${apiUrl}/emergency/queue`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setVisits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load emergency doctor queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'start-treatment' | 'admit' | 'discharge' | 'transfer') => {
    const token = localStorage.getItem('medinexa_token');
    setIsProcessing(true);

    try {
      const res = await fetch(`${apiUrl}/emergency/${id}/${action}`, {
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
      default:
        return 'bg-blue-500 text-white font-medium';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Emergency Doctor Workstation
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Treat critical trauma & emergency patients sorted strictly by ESI priority.
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

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-medium animate-pulse">
          Loading critical patient queue...
        </div>
      ) : visits.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <h2 className="text-lg font-bold text-slate-800">Emergency Queue Clear ✓</h2>
          <p className="text-xs text-slate-500">There are no pending emergency patients awaiting doctor consultation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visits.map((v) => {
            const vitals = v.triageAssessments?.[0];
            return (
              <div
                key={v.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-sky-300 transition space-y-4"
              >
                <div className="flex flex-wrap justify-between items-center border-b border-slate-100 pb-3 gap-2">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-md text-xs font-black uppercase shadow-sm ${getEsiBadge(v.triageLevel)}`}>
                      {v.triageLevel || 'UN-TRIAGED'}
                    </span>
                    <span className="font-mono font-extrabold text-red-600 text-sm">{v.visitNumber}</span>
                    <h3 className="font-extrabold text-slate-900 text-base">{v.patientName}</h3>
                  </div>

                  <span className="px-3 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {v.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-500 uppercase block text-[10px]">Chief Complaint</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{v.chiefComplaint}</p>
                  </div>

                  {vitals ? (
                    <div>
                      <span className="font-bold text-slate-500 uppercase block text-[10px]">Nurse Triage Vitals</span>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        BP: {vitals.systolicBP}/{vitals.diastolicBP} | Temp: {vitals.temperature}°F | SpO2: {vitals.oxygenSaturation}% | Pulse: {vitals.pulse}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="font-bold text-slate-500 uppercase block text-[10px]">Nurse Triage Vitals</span>
                      <p className="font-semibold text-slate-400 mt-0.5">Pending nurse vitals entry</p>
                    </div>
                  )}

                  <div>
                    <span className="font-bold text-slate-500 uppercase block text-[10px]">Arrival Time</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Doctor Action CTAs */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                  {v.status !== 'IN_TREATMENT' && (
                    <button
                      disabled={isProcessing}
                      onClick={() => handleAction(v.id, 'start-treatment')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                    >
                      ▶ Start Treatment
                    </button>
                  )}

                  <button
                    disabled={isProcessing}
                    onClick={() => handleAction(v.id, 'admit')}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                  >
                    🏥 Admit to IPD
                  </button>

                  <button
                    disabled={isProcessing}
                    onClick={() => handleAction(v.id, 'discharge')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm transition"
                  >
                    ✓ Discharge
                  </button>

                  <button
                    disabled={isProcessing}
                    onClick={() => handleAction(v.id, 'transfer')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                  >
                    🚑 Transfer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
