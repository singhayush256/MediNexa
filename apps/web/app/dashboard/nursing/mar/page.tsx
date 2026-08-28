'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface AdmissionItem {
  id: string;
  admissionNumber: string;
  patient: { id: string; user: { firstName: string; lastName: string } };
}

interface MarItem {
  id: string;
  medicationName: string;
  doseGiven: string;
  isControlled: boolean;
  status: string;
  scheduledTime: string;
  administeredTime?: string;
  administeredBy?: { firstName: string; lastName: string };
  witnessNurse?: { firstName: string; lastName: string };
}

export default function InpatientMarPage() {
  const [admissions, setAdmissions] = useState<AdmissionItem[]>([]);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState('');
  const [marTimeline, setMarTimeline] = useState<MarItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Administer Modal State
  const [showAdministerModal, setShowAdministerModal] = useState(false);
  const [medicationName, setMedicationName] = useState('');
  const [doseGiven, setDoseGiven] = useState('');
  const [isControlled, setIsControlled] = useState(false);
  const [witnessNurseId, setWitnessNurseId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    fetchAdmissions();
  }, []);

  useEffect(() => {
    if (selectedAdmissionId) {
      fetchMarTimeline(selectedAdmissionId);
    }
  }, [selectedAdmissionId]);

  const fetchAdmissions = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/admissions`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
      if (Array.isArray(res) && res.length > 0) {
        setAdmissions(res);
        setSelectedAdmissionId(res[0].id);
      }
    } catch (err) {
      console.error('Failed to load admissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarTimeline = async (admId: string) => {
    const token = localStorage.getItem('medinexa_token');
    try {
      const res = await fetch(`${apiUrl}/nursing/mar/${admId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMarTimeline(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load MAR timeline:', err);
    }
  };

  const handleAdministerMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicationName.trim()) {
      setModalError('Medication name is required.');
      return;
    }
    if (!doseGiven.trim()) {
      setModalError('Dose is required.');
      return;
    }
    if (isControlled && !witnessNurseId.trim()) {
      setModalError('Controlled Medication Guard: Witness Nurse ID is required.');
      return;
    }

    setModalError('');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('medinexa_token');
      const targetAdm = admissions.find((a) => a.id === selectedAdmissionId);
      const payload = {
        admissionId: selectedAdmissionId,
        patientId: targetAdm?.patient?.id || '',
        medicationName,
        doseGiven,
        isControlled,
        witnessNurseId: witnessNurseId || undefined,
        notes: notes || undefined,
      };

      const res = await fetch(`${apiUrl}/nursing/mar/administer`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to administer medication');

      setShowAdministerModal(false);
      setMedicationName('');
      setDoseGiven('');
      setIsControlled(false);
      setWitnessNurseId('');
      setNotes('');
      fetchMarTimeline(selectedAdmissionId);
    } catch (err: any) {
      setModalError(err.message || 'Failed to record administration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'missed' | 'refused' | 'held') => {
    const token = localStorage.getItem('medinexa_token');
    try {
      const res = await fetch(`${apiUrl}/nursing/mar/${id}/${status}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchMarTimeline(selectedAdmissionId);
    } catch (err) {
      console.error(`Failed to mark ${status}:`, err);
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'ADMINISTERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold';
      case 'MISSED':
        return 'bg-red-100 text-red-800 border-red-300 font-bold';
      case 'REFUSED':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case 'HELD':
        return 'bg-purple-100 text-purple-800 border-purple-300 font-bold';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200 font-bold';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Inpatient Medication Administration Record (MAR)
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Dual-Nurse Controlled Substance Verification & Bedside Administration Tracking.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/nursing"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            ← Command Center
          </Link>
          <button
            onClick={() => setShowAdministerModal(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            + Administer Dose
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-medium animate-pulse">
          Loading admissions & MAR records...
        </div>
      ) : admissions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
          No active admissions found for MAR logging.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Admission Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <label className="text-xs font-extrabold text-slate-700 uppercase">Select Inpatient Admission:</label>
            <select
              value={selectedAdmissionId}
              onChange={(e) => setSelectedAdmissionId(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-xs bg-slate-50 text-slate-900"
            >
              {admissions.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.admissionNumber} — {a.patient?.user?.firstName} {a.patient?.user?.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* MAR Timeline Roster */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Medication Administration Schedule & Logs</h2>
              <span className="text-xs font-semibold text-slate-500">Dual-Nurse Verification Log</span>
            </div>

            {marTimeline.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-medium">
                No MAR administration logs recorded for this admission yet. Click "+ Administer Dose" to record a dose given.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-100">
                    <tr>
                      <th className="p-4">Medication</th>
                      <th className="p-4">Dose</th>
                      <th className="p-4">Controlled Substance</th>
                      <th className="p-4">Administered By</th>
                      <th className="p-4">Witness Nurse</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {marTimeline.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-bold text-slate-900">
                          {m.medicationName}
                        </td>
                        <td className="p-4 text-slate-700 font-semibold">{m.doseGiven}</td>
                        <td className="p-4">
                          {m.isControlled ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                              🔒 Controlled Drug
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Standard</span>
                          )}
                        </td>
                        <td className="p-4">
                          {m.administeredBy ? `Nurse ${m.administeredBy.firstName} ${m.administeredBy.lastName}` : 'N/A'}
                        </td>
                        <td className="p-4">
                          {m.witnessNurse ? `Nurse ${m.witnessNurse.firstName} ${m.witnessNurse.lastName}` : '—'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] border ${getStatusBadge(m.status)}`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleStatusChange(m.id, 'missed')}
                              className="px-2 py-1 text-[10px] bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded"
                            >
                              Missed
                            </button>
                            <button
                              onClick={() => handleStatusChange(m.id, 'refused')}
                              className="px-2 py-1 text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded"
                            >
                              Refused
                            </button>
                            <button
                              onClick={() => handleStatusChange(m.id, 'held')}
                              className="px-2 py-1 text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded"
                            >
                              Held
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Administer Medication Modal */}
      {showAdministerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Record MAR Medication Dose</h3>
              <button onClick={() => setShowAdministerModal(false)} className="text-slate-400 font-bold text-sm">✕</button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAdministerMedication} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Medication Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morphine Sulfate / Amoxicillin"
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Dose Given *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5mg IV push / 500mg PO"
                  value={doseGiven}
                  onChange={(e) => setDoseGiven(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="controlledCheck"
                  checked={isControlled}
                  onChange={(e) => setIsControlled(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <label htmlFor="controlledCheck" className="font-bold text-red-700">
                  Is Controlled Substance (Requires Witness Nurse)
                </label>
              </div>

              {isControlled && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Witnessing Nurse User ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="UUID of witnessing nurse"
                    value={witnessNurseId}
                    onChange={(e) => setWitnessNurseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-red-300 rounded-xl bg-red-50 font-mono"
                  />
                  <span className="text-[10px] text-red-600 font-semibold block mt-1">
                    Dual-nurse verification required for controlled narcotics.
                  </span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Administration Notes</label>
                <textarea
                  rows={2}
                  placeholder="Bedside observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition"
              >
                {isSubmitting ? 'Recording Dose...' : 'Confirm MAR Administration ✓'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
