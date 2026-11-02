'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function InfectionSurveillancePage() {
  const [infections, setInfections] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    infectionType: 'CAUTI',
    infectionSource: 'HOSPITAL_ACQUIRED',
    severity: 'MODERATE',
    rootCauseAnalysis: '',
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadInfections = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/quality/infections`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setInfections(Array.isArray(d) ? d : []));
  };

  useEffect(() => {
    loadInfections();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    await fetch(`${apiUrl}/quality/infections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData),
    });

    setShowModal(false);
    loadInfections();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Infection Surveillance & Outbreak Prevention</h1>
          <p className="text-xs text-slate-500 mt-1">Healthcare-Associated Infections (HAI) tracking, root cause investigations, and isolation management.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/quality" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
            ← Back to Quality Hub
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition"
          >
            + Report Infection Case
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h2 className="text-lg font-black text-slate-900 mb-4">Report Infection Surveillance Case</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patient ID</label>
                <input
                  type="text"
                  required
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  placeholder="e.g. Patient UUID"
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Infection Type</label>
                <select
                  value={formData.infectionType}
                  onChange={(e) => setFormData({ ...formData, infectionType: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="CAUTI">CAUTI (Catheter-Associated UTI)</option>
                  <option value="CLABSI">CLABSI (Central Line Bloodstream)</option>
                  <option value="SSI">SSI (Surgical Site Infection)</option>
                  <option value="VAP">VAP (Ventilator-Associated Pneumonia)</option>
                  <option value="MRSA">MRSA (Methicillin-Resistant S. Aureus)</option>
                  <option value="CDI">C. Difficile Infection (CDI)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Root Cause Analysis (RCA)</label>
                <textarea
                  rows={2}
                  value={formData.rootCauseAnalysis}
                  onChange={(e) => setFormData({ ...formData, rootCauseAnalysis: e.target.value })}
                  placeholder="Primary clinical root cause..."
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl"
                >
                  Submit Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Case #</th>
              <th className="py-3 px-4">Infection Type</th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Reported By</th>
              <th className="py-3 px-4">Investigations</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {infections.map((inf) => (
              <tr key={inf.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{inf.caseNumber}</td>
                <td className="py-3 px-4 font-bold text-indigo-600">{inf.infectionType}</td>
                <td className="py-3 px-4 font-bold text-slate-600">{inf.infectionSource}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    inf.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                    inf.severity === 'SEVERE' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {inf.severity}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-700 font-bold">{inf.reportedBy?.firstName} {inf.reportedBy?.lastName}</td>
                <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{inf.investigations?.length || 0} RCA logged</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-100 text-amber-800">
                    {inf.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
