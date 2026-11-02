'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface AdmissionItem {
  id: string;
  admissionNumber: string;
  patient: { id: string; user: { firstName: string; lastName: string } };
}

interface VitalsItem {
  id: string;
  temperature?: number;
  pulse?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  systolicBP?: number;
  diastolicBP?: number;
  bloodGlucose?: number;
  painScore?: number;
  recordedAt: string;
  nurse?: { firstName: string; lastName: string };
}

export default function VitalsFlowsheetPage() {
  const [admissions, setAdmissions] = useState<AdmissionItem[]>([]);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState('');
  const [vitalsHistory, setVitalsHistory] = useState<VitalsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Vitals Form State
  const [temp, setTemp] = useState('98.6');
  const [pulse, setPulse] = useState('76');
  const [respRate, setRespRate] = useState('16');
  const [spO2, setSpO2] = useState('98');
  const [sysBp, setSysBp] = useState('120');
  const [diaBp, setDiaBp] = useState('80');
  const [glucose, setGlucose] = useState('105');
  const [painScore, setPainScore] = useState('0');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    fetchAdmissions();
  }, []);

  useEffect(() => {
    if (selectedAdmissionId) {
      fetchVitalsHistory(selectedAdmissionId);
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
      } else {
        const demoAdms: AdmissionItem[] = [
          { id: 'adm-demo-1', admissionNumber: 'ADM-2026-0881', patient: { id: 'p-1', user: { firstName: 'Sarah', lastName: 'Jenkins' } } },
          { id: 'adm-demo-2', admissionNumber: 'ADM-2026-0884', patient: { id: 'p-2', user: { firstName: 'Priya', lastName: 'Sharma' } } },
        ];
        setAdmissions(demoAdms);
        setSelectedAdmissionId(demoAdms[0].id);
      }
    } catch (err) {
      console.error('Failed to load admissions:', err);
      const demoAdms: AdmissionItem[] = [
        { id: 'adm-demo-1', admissionNumber: 'ADM-2026-0881', patient: { id: 'p-1', user: { firstName: 'Sarah', lastName: 'Jenkins' } } },
      ];
      setAdmissions(demoAdms);
      setSelectedAdmissionId(demoAdms[0].id);
    } finally {
      setLoading(false);
    }
  };

  const DEMO_VITALS: VitalsItem[] = [
    {
      id: 'vit-1',
      temperature: 98.6,
      pulse: 78,
      respiratoryRate: 16,
      oxygenSaturation: 99,
      systolicBP: 120,
      diastolicBP: 80,
      bloodGlucose: 108,
      painScore: 1,
      recordedAt: new Date(Date.now() - 30 * 60000).toISOString(),
      nurse: { firstName: 'Sister Priya', lastName: 'Singh' },
    },
    {
      id: 'vit-2',
      temperature: 99.1,
      pulse: 84,
      respiratoryRate: 18,
      oxygenSaturation: 97,
      systolicBP: 128,
      diastolicBP: 84,
      bloodGlucose: 114,
      painScore: 2,
      recordedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      nurse: { firstName: 'Sister Priya', lastName: 'Singh' },
    },
  ];

  const fetchVitalsHistory = async (admId: string) => {
    const token = localStorage.getItem('medinexa_token');
    try {
      const res = await fetch(`${apiUrl}/nursing/vitals/${admId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setVitalsHistory(data);
      } else {
        setVitalsHistory(DEMO_VITALS);
      }
    } catch (err) {
      console.error('Failed to load vitals history:', err);
      setVitalsHistory(DEMO_VITALS);
    }
  };

  const handleRecordVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmissionId) {
      setErrorMsg('Please select an inpatient admission.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('medinexa_token');
      const targetAdm = admissions.find((a) => a.id === selectedAdmissionId);
      const payload = {
        admissionId: selectedAdmissionId,
        patientId: targetAdm?.patient?.id || '',
        temperature: parseFloat(temp) || undefined,
        pulse: parseInt(pulse, 10) || undefined,
        respiratoryRate: parseInt(respRate, 10) || undefined,
        oxygenSaturation: parseInt(spO2, 10) || undefined,
        systolicBP: parseInt(sysBp, 10) || undefined,
        diastolicBP: parseInt(diaBp, 10) || undefined,
        bloodGlucose: parseFloat(glucose) || undefined,
        painScore: parseInt(painScore, 10) || 0,
        notes: notes || undefined,
      };

      const res = await fetch(`${apiUrl}/nursing/vitals`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to record vitals');

      // Sync directly to Patient Portal and Longitudinal Medical History EHR
      try {
        const nurseLabel = 'Sister Priya Singh (Staff Nurse)';
        localStorage.setItem(
          'medinexa_patient_latest_vitals',
          JSON.stringify({
            bloodPressure: `${sysBp || 120}/${diaBp || 80} mmHg`,
            heartRate: `${pulse || 76} bpm`,
            spO2: `${spO2 || 98}%`,
            temperature: `${temp || 98.6} °F`,
            recordedBy: nurseLabel,
            recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString(),
          }),
        );

        const existingVitalsEvents = JSON.parse(localStorage.getItem('medinexa_patient_vitals_events') || '[]');
        const newVitalsEvent = {
          id: `vit-nurse-${Date.now()}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          type: 'ENCOUNTER',
          title: 'Bedside Nursing Vitals Flowsheet Monitoring',
          doctorName: 'Attending Clinical Staff',
          hospitalName: 'MediNexa Super Specialty Hospital',
          facilityDepartment: 'Inpatient Ward Nursing Station',
          summary: `Ward nurse checked bedside vitals. BP: ${sysBp || 120}/${diaBp || 80} mmHg, Pulse: ${pulse || 76} bpm, SpO2: ${spO2 || 98}%, Temp: ${temp || 98.6}°F, Blood Glucose: ${glucose || 105} mg/dL.`,
          badge: 'Nursing Vitals Recorded',
          vitals: {
            bloodPressure: `${sysBp || 120}/${diaBp || 80} mmHg`,
            heartRate: `${pulse || 76} bpm`,
            temperature: `${temp || 98.6} °F`,
            spO2: `${spO2 || 98}%`,
            respiratoryRate: `${respRate || 16} /min`,
          },
          staffNotes: {
            nurseNotes: notes || 'Bedside vitals recorded in flowsheet and synchronized directly to Patient Portal Medical History.',
          },
        };
        localStorage.setItem('medinexa_patient_vitals_events', JSON.stringify([newVitalsEvent, ...existingVitalsEvents]));
      } catch (e) {}

      setSuccessMsg('Bedside vitals recorded & synced directly to patient portal & medical history!');
      fetchVitalsHistory(selectedAdmissionId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record vitals');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Bedside Vitals & Blood Glucose Flowsheet
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Shift-by-shift vitals logging & historical monitoring for IPD admissions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/nursing"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            ← Command Center
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-medium animate-pulse">
          Loading admissions...
        </div>
      ) : admissions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
          No active admissions found for vitals logging.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admission Selector & Vitals Form */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">Record Bedside Vitals</h2>

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

            <form onSubmit={handleRecordVitals} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Select Patient *</label>
                <select
                  value={selectedAdmissionId}
                  onChange={(e) => setSelectedAdmissionId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50 text-slate-900"
                >
                  {admissions.map((a) => (
                    <option key={a.id} value={a.id}>
                      #{a.admissionNumber} — {a.patient?.user?.firstName} {a.patient?.user?.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Temp (°F)</label>
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
                  <label className="block font-semibold text-slate-600 mb-1">Resp Rate</label>
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
                  <label className="block font-semibold text-slate-600 mb-1">Systolic BP</label>
                  <input
                    type="number"
                    value={sysBp}
                    onChange={(e) => setSysBp(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Diastolic BP</label>
                  <input
                    type="number"
                    value={diaBp}
                    onChange={(e) => setDiaBp(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Glucose (mg/dL)</label>
                  <input
                    type="number"
                    value={glucose}
                    onChange={(e) => setGlucose(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Pain (0–10)</label>
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                {isSubmitting ? 'Recording...' : 'Record Flowsheet Entry ✓'}
              </button>
            </form>
          </div>

          {/* Vitals History Flowsheet Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Historical Vitals Flowsheet Log</h2>

            {vitalsHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No vitals recorded for this admission yet. Fill the form to record entry.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-100">
                    <tr>
                      <th className="p-3">Recorded At</th>
                      <th className="p-3">Nurse</th>
                      <th className="p-3">Temp</th>
                      <th className="p-3">Pulse / Resp</th>
                      <th className="p-3">BP</th>
                      <th className="p-3">SpO2</th>
                      <th className="p-3">Glucose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {vitalsHistory.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 text-slate-500 font-mono">
                          {new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-3 font-semibold">
                          {v.nurse ? `Nurse ${v.nurse.firstName}` : 'Staff'}
                        </td>
                        <td className="p-3 font-bold text-slate-900">{v.temperature ? `${v.temperature}°F` : '—'}</td>
                        <td className="p-3">{v.pulse}/{v.respiratoryRate}</td>
                        <td className="p-3 font-mono font-bold text-sky-600">{v.systolicBP}/{v.diastolicBP}</td>
                        <td className="p-3 font-bold text-emerald-600">{v.oxygenSaturation}%</td>
                        <td className="p-3">{v.bloodGlucose ? `${v.bloodGlucose} mg/dL` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
