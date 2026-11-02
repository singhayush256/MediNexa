'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ExecutiveAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadAlerts = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/command-center/alerts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setAlerts(Array.isArray(d) ? d : []));
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleAcknowledge = async (id: string) => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    await fetch(`${apiUrl}/command-center/alerts/${id}/acknowledge`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadAlerts();
  };

  const handleResolve = async (id: string) => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    await fetch(`${apiUrl}/command-center/alerts/${id}/resolve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadAlerts();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Executive Alert Center & Board Resolution</h1>
          <p className="text-xs text-slate-500 mt-1">Cross-departmental operational, financial, and clinical exceptions requiring leadership intervention.</p>
        </div>
        <Link href="/dashboard/executive" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to Command Wall
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Alert Title</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {alerts.map((alert) => (
              <tr key={alert.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    alert.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                    alert.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                    alert.severity === 'MEDIUM' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {alert.severity}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-[10px] text-slate-500">{alert.category}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{alert.title}</td>
                <td className="py-3 px-4 text-slate-600 text-[11px]">{alert.description}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    alert.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                    alert.status === 'ACKNOWLEDGED' ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {alert.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  {alert.status === 'OPEN' && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition"
                    >
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
