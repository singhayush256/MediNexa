'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function IncidentReportingPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    incidentType: 'MEDICATION_ERROR',
    severity: 'MEDIUM',
    description: '',
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadIncidents = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/quality/incidents`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setIncidents(Array.isArray(d) ? d : []));
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    await fetch(`${apiUrl}/quality/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData),
    });

    setShowModal(false);
    setFormData({ incidentType: 'MEDICATION_ERROR', severity: 'MEDIUM', description: '' });
    loadIncidents();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Incident Reporting & Sentinel Events</h1>
          <p className="text-xs text-slate-500 mt-1">Capture clinical adverse events, medication errors, patient falls, and sentinel events.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/quality" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
            ← Back to Quality Hub
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition"
          >
            + Log Incident
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h2 className="text-lg font-black text-slate-900 mb-4">Log Adverse Incident / Sentinel Event</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Incident Type</label>
                <select
                  value={formData.incidentType}
                  onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="MEDICATION_ERROR">Medication Error</option>
                  <option value="FALL">Patient Fall</option>
                  <option value="EQUIPMENT_FAILURE">Biomedical Equipment Failure</option>
                  <option value="SENTINEL_EVENT">Sentinel Event</option>
                  <option value="SURGICAL_COMPLICATION">Surgical Complication</option>
                  <option value="NEEDLESTICK">Needlestick Injury</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="LOW">Low (Near Miss / No Harm)</option>
                  <option value="MEDIUM">Medium (Minor Harm)</option>
                  <option value="HIGH">High (Major Harm)</option>
                  <option value="CRITICAL">Critical (Life Threatening)</option>
                  <option value="SENTINEL">Sentinel (Permanent Harm / Fatality)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description & Circumstances</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide precise details of the clinical event..."
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
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl"
                >
                  Submit Incident Report
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
              <th className="py-3 px-4">Incident #</th>
              <th className="py-3 px-4">Incident Type</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Reported By</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {incidents.map((inc) => (
              <tr key={inc.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{inc.incidentNumber}</td>
                <td className="py-3 px-4 font-bold text-slate-700">{inc.incidentType}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    inc.severity === 'SENTINEL' ? 'bg-purple-100 text-purple-800' :
                    inc.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                    inc.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                    inc.severity === 'MEDIUM' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {inc.severity}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs truncate">{inc.description}</td>
                <td className="py-3 px-4 text-slate-700 font-bold">{inc.reportedBy?.firstName} {inc.reportedBy?.lastName}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    inc.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-800' :
                    inc.status === 'UNDER_INVESTIGATION' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {inc.status}
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
