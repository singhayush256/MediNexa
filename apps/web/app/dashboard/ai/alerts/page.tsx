'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface AlertItem {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  isResolved: boolean;
  patient?: { user?: { firstName: string; lastName: string } };
  createdAt: string;
}

export default function ClinicalSafetyAlertsBoardPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/ai/alerts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load clinical alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (s: string) => {
    switch (s) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300 font-extrabold animate-pulse';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case 'MEDIUM':
        return 'bg-purple-100 text-purple-800 border-purple-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 font-bold';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Real-Time Clinical Safety Alerts Board
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Automated Sepsis, Abnormal Vitals, Critical Lab & Drug Interaction Alerts.
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

      {/* Alerts Roster */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">Active Safety Alert Log</h2>
          <span className="text-xs font-semibold text-slate-500">Live Vitals & EHR Stream</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 font-medium animate-pulse">
            Loading safety alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-medium">
            No active safety alerts logged.
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((a) => (
              <div key={a.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">{a.title}</span>
                  <span className={`px-3 py-1 rounded text-xs border ${getSeverityBadge(a.severity)}`}>
                    {a.severity}
                  </span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed font-medium">{a.description}</p>
                <div className="flex justify-between items-center text-xs text-slate-500 font-medium pt-2 border-t border-slate-200/60">
                  <span>Target Patient: <strong>{a.patient?.user?.firstName} {a.patient?.user?.lastName}</strong></span>
                  <span>Alert Category: <strong>{a.type}</strong></span>
                  <span>Detected: {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
