'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface EmergencyVisitItem {
  id: string;
  visitNumber: string;
  patientName: string;
  chiefComplaint: string;
  arrivalMode: string;
  status: string;
  createdAt: string;
}

export default function NurseTriageWorkstationPage() {
  const [untriagedVisits, setUntriagedVisits] = useState<EmergencyVisitItem[]>([]);
  const [selectedVisitId, setSelectedVisitId] = useState('');
  const [loading, setLoading] = useState(true);

  // Triage Form State
  const [triageLevel, setTriageLevel] = useState('ESI_3');
  const [temp, setTemp] = useState('98.6');
  const [pulse, setPulse] = useState('72');
  const [respRate, setRespRate] = useState('16');
  const [spO2, setSpO2] = useState('98');
  const [sysBp, setSysBp] = useState('120');
  const [diaBp, setDiaBp] = useState('80');
  const [painScore, setPainScore] = useState('0');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
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
      if (Array.isArray(data)) {
        const untriaged = data.filter((v) => v.status === 'WAITING_TRIAGE' || !v.triageLevel);
        setUntriagedVisits(untriaged);
        if (untriaged.length > 0 && !selectedVisitId) setSelectedVisitId(untriaged[0].id);
      }
    } catch (err) {
      console.error('Failed to load untriaged visits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePerformTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisitId) {
      setErrorMsg('Please select an untriaged emergency visit.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('medinexa_token');
      const payload = {
        emergencyVisitId: selectedVisitId,
        triageLevel,
        temperature: parseFloat(temp) || undefined,
        pulse: parseInt(pulse, 10) || undefined,
        respiratoryRate: parseInt(respRate, 10) || undefined,
        oxygenSaturation: parseInt(spO2, 10) || undefined,
        systolicBP: parseInt(sysBp, 10) || undefined,
        diastolicBP: parseInt(diaBp, 10) || undefined,
        painScore: parseInt(painScore, 10) || 0,
        notes: notes || undefined,
      };

      const res = await fetch(`${apiUrl}/emergency/triage`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit triage assessment');

      setSuccessMsg(`Triage assessment submitted successfully! Patient assigned ${triageLevel}.`);
      setSelectedVisitId('');
      fetchQueue();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete triage assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentVisit = untriagedVisits.find((v) => v.id === selectedVisitId);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Nurse Emergency Triage Workstation
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Perform Vitals Assessment & Assign Emergency Severity Index (ESI 1–5).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/emergency"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            ← Command Center
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-medium animate-pulse">
          Loading untriaged emergency patients...
        </div>
      ) : untriagedVisits.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <h2 className="text-lg font-bold text-slate-800">All Emergency Intake Patients Triaged ✓</h2>
          <p className="text-xs text-slate-500">There are no pending untriaged emergency patients in the queue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Selector Side Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">
              Pending Untriaged Patients ({untriagedVisits.length})
            </h2>

            <div className="space-y-2">
              {untriagedVisits.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVisitId(v.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition ${
                    selectedVisitId === v.id
                      ? 'bg-amber-50 border-amber-400 text-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-extrabold text-red-600 text-xs">{v.visitNumber}</span>
                    <span className="text-[10px] font-bold uppercase text-slate-400">{v.arrivalMode}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{v.patientName}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{v.chiefComplaint}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Vitals Entry & ESI Assignment Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            {currentVisit && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Selected Patient Intake</span>
                  <h3 className="text-lg font-extrabold text-slate-900">{currentVisit.patientName}</h3>
                  <p className="text-xs text-slate-600 font-semibold">{currentVisit.chiefComplaint}</p>
                </div>
                <span className="font-mono font-black text-red-600 text-base">{currentVisit.visitNumber}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handlePerformTriage} className="space-y-6 text-xs">
              {/* ESI Level Picker */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-2">
                  Emergency Severity Index (ESI Level) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {[
                    { level: 'ESI_1', label: 'ESI-1 Resuscitation (Immediate)' },
                    { level: 'ESI_2', label: 'ESI-2 Emergent (High Risk)' },
                    { level: 'ESI_3', label: 'ESI-3 Urgent (Multiple Resources)' },
                    { level: 'ESI_4', label: 'ESI-4 Less Urgent (One Resource)' },
                    { level: 'ESI_5', label: 'ESI-5 Non-Urgent (No Resources)' },
                  ].map((e) => (
                    <button
                      key={e.level}
                      type="button"
                      onClick={() => setTriageLevel(e.level)}
                      className={`p-3 rounded-xl border text-center font-bold text-[11px] transition ${
                        triageLevel === e.level
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vitals Entry Grid */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h3 className="font-bold text-slate-900 uppercase">Patient Vital Signs Entry</h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Temperature (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Pulse (BPM)</label>
                    <input
                      type="number"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Resp Rate (BPM)</label>
                    <input
                      type="number"
                      value={respRate}
                      onChange={(e) => setRespRate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">SpO2 (%)</label>
                    <input
                      type="number"
                      value={spO2}
                      onChange={(e) => setSpO2(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Systolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={sysBp}
                      onChange={(e) => setSysBp(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Diastolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={diaBp}
                      onChange={(e) => setDiaBp(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Pain Score (0–10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={painScore}
                      onChange={(e) => setPainScore(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nurse Triage Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition"
              >
                {isSubmitting ? 'Submitting Assessment...' : 'Submit Triage Assessment ✓'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
