'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface PatientItem {
  id: string;
  user?: { firstName: string; lastName: string };
}

interface RiskItem {
  id: string;
  overallRiskScore: number;
  sepsisRisk: number;
  readmissionRisk: number;
  fallRisk: number;
  riskFactors?: string;
  evaluatedAt: string;
  admission?: { admissionNumber: string };
}

export default function PatientRiskScoreRosterPage() {
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [riskScores, setRiskScores] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientRiskScores(selectedPatientId);
    }
  }, [selectedPatientId]);

  const fetchPatients = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/patients`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
      if (Array.isArray(res) && res.length > 0) {
        setPatients(res);
        setSelectedPatientId(res[0].id);
      }
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientRiskScores = async (patId: string) => {
    const token = localStorage.getItem('medinexa_token');
    try {
      const res = await fetch(`${apiUrl}/ai/patient-risk/${patId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRiskScores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load patient risk scores:', err);
    }
  };

  const getRiskBadge = (score: number) => {
    if (score >= 75) return 'bg-red-100 text-red-800 border-red-300 font-black';
    if (score >= 50) return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
    return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Patient Clinical Risk Score Roster (0–100)
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Automated Sepsis, Hospital Readmission, and Patient Fall Risk Evaluations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/ai"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            ← Command Center
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-medium animate-pulse">
          Loading patient directory...
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
          No patients found for risk scoring.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Patient Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <label className="text-xs font-extrabold text-slate-700 uppercase">Select Patient Profile:</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-xs bg-slate-50 text-slate-900"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.user?.firstName} {p.user?.lastName} (ID: #{p.id.substring(0, 8)})
                </option>
              ))}
            </select>
          </div>

          {/* Risk Scores Roster */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Historical AI Risk Score Evaluations</h2>
              <span className="text-xs font-semibold text-slate-500">0–100 Scale</span>
            </div>

            {riskScores.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-medium">
                No risk scores evaluated for this patient yet. Click "Run AI Analysis" from the AI Command Center.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-100">
                    <tr>
                      <th className="p-4">Evaluated At</th>
                      <th className="p-4">Overall Risk Score</th>
                      <th className="p-4">Sepsis Risk</th>
                      <th className="p-4">Readmission Risk</th>
                      <th className="p-4">Fall Risk</th>
                      <th className="p-4">Risk Factors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {riskScores.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 text-slate-500 font-mono">
                          {new Date(r.evaluatedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-md text-xs border ${getRiskBadge(r.overallRiskScore)}`}>
                            {r.overallRiskScore} / 100
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-900">{r.sepsisRisk}%</td>
                        <td className="p-4 font-semibold text-slate-700">{r.readmissionRisk}%</td>
                        <td className="p-4 font-semibold text-slate-700">{r.fallRisk}%</td>
                        <td className="p-4 text-slate-600 max-w-xs truncate">{r.riskFactors || 'Standard Clinical Metrics'}</td>
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
