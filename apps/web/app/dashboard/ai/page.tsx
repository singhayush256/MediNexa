'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface AlertItem {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  patient?: { user?: { firstName: string; lastName: string } };
  createdAt: string;
}

interface PredictionItem {
  id: string;
  type: string;
  predictedValue: number;
  unit: string;
  confidencePercentage: number;
  timeframe: string;
}

export default function AiClinicalDecisionSupportDashboardPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Metrics State
  const [metrics, setMetrics] = useState({
    criticalPatients: 0,
    highRiskAdmissions: 0,
    predictedBedOccupancyPercentage: 84.5,
    predictedOpdLoad: 140,
    predictedIcuUtilizationPercentage: 92.0,
    averageRiskScore: 32,
  });

  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    fetchAiData();
  }, []);

  const fetchAiData = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [altRes, predRes, metRes] = await Promise.all([
        fetch(`${apiUrl}/ai/alerts`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${apiUrl}/ai/predictions`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${apiUrl}/ai/dashboard`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      ]);

      setAlerts(Array.isArray(altRes) ? altRes : []);
      setPredictions(Array.isArray(predRes) ? predRes : []);
      if (metRes && typeof metRes === 'object') setMetrics(metRes);
    } catch (err) {
      console.error('Failed to load AI intelligence data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiAnalysis = async () => {
    setIsRunningAnalysis(true);
    setActionSuccess('');

    try {
      const token = localStorage.getItem('medinexa_token');
      const res = await fetch(`${apiUrl}/ai/run-analysis`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'AI analysis failed');

      setActionSuccess(`✓ AI Engine Evaluation Complete! Scanned ${data.evaluationsProcessed} admissions, generated ${data.alertsGenerated} alerts.`);
      fetchAiData();
    } catch (err: any) {
      console.error('AI execution error:', err);
    } finally {
      setIsRunningAnalysis(false);
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
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>🧠</span>
            <span>AI Clinical Decision Support & Hospital Intelligence Engine</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Real-Time Sepsis Risk Detection, Abnormal Vitals Safety Alerts, and Capacity Forecasts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/ai/patient-risk"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            📊 Patient Risk Roster
          </Link>
          <Link
            href="/dashboard/ai/alerts"
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            🚨 Clinical Safety Alerts
          </Link>
          <button
            onClick={handleRunAiAnalysis}
            disabled={isRunningAnalysis}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition"
          >
            {isRunningAnalysis ? 'Evaluating Clinical Data...' : '⚡ Run AI Analysis'}
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold shadow-sm">
          {actionSuccess}
        </div>
      )}

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Critical Patients</span>
          <span className="text-2xl font-black text-red-600 mt-1 block">{metrics.criticalPatients}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">High Risk Inpatients</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{metrics.highRiskAdmissions}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Predicted Occupancy</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{metrics.predictedBedOccupancyPercentage}%</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Predicted OPD Load</span>
          <span className="text-2xl font-black text-sky-600 mt-1 block">{metrics.predictedOpdLoad} / Day</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">ICU Utilization</span>
          <span className="text-2xl font-black text-purple-600 mt-1 block">{metrics.predictedIcuUtilizationPercentage}%</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Average Risk Score</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{metrics.averageRiskScore} / 100</span>
        </div>
      </div>

      {/* Hospital Capacity Predictions & Clinical Alerts Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Clinical Safety Alerts Roster */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Active AI Clinical Safety Alerts</h2>
            <span className="text-xs font-semibold text-slate-500">Real-Time Vitals & Lab Monitor</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 font-medium animate-pulse">
              Scanning clinical alerts...
            </div>
          ) : alerts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              No active clinical safety alerts detected. Click "⚡ Run AI Analysis" to evaluate current vitals.
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((a) => (
                <div key={a.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 hover:border-slate-300 transition">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{a.title}</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] border ${getSeverityBadge(a.severity)}`}>
                      {a.severity}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">{a.description}</p>
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium pt-1">
                    <span>Patient: {a.patient?.user?.firstName} {a.patient?.user?.lastName}</span>
                    <span>Detected: {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hospital Predictive Capacity & Surge Sidebar */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Predictive Hospital Capacity</h3>
            <span className="text-[10px] font-bold text-purple-700 uppercase">AI Forecast 24H</span>
          </div>

          {predictions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              No hospital predictions logged yet.
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.map((p) => (
                <div key={p.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span>{p.type.replace('_', ' ')}</span>
                    <span className="font-mono text-purple-700 text-sm">{p.predictedValue} {p.unit}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                    <span>Confidence: {p.confidencePercentage}%</span>
                    <span>{p.timeframe}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
