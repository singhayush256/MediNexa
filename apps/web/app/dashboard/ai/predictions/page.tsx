'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface PredictionItem {
  id: string;
  type: string;
  predictedValue: number;
  unit: string;
  confidencePercentage: number;
  timeframe: string;
  notes?: string;
}

export default function HospitalPredictionsPage() {
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/ai/predictions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPredictions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load hospital predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Predictive Hospital Capacity & Surge Forecasts
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            24-Hour Predictive Models for Bed Occupancy, OPD Arrival Surge, and ICU Utilization.
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
          Loading hospital capacity predictions...
        </div>
      ) : predictions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
          No predictive capacity forecasts logged yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {predictions.map((p) => (
            <div key={p.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="font-extrabold text-slate-900 text-sm uppercase">{p.type.replace('_', ' ')}</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 border border-purple-300 font-bold text-xs rounded-lg">
                  {p.confidencePercentage}% Confidence
                </span>
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-purple-700">{p.predictedValue}</span>
                <span className="text-sm font-bold text-slate-600">{p.unit}</span>
              </div>

              <p className="text-xs text-slate-500 font-medium">{p.notes || 'Forecast derived from 24H bed turnover and emergency intake trend analysis.'}</p>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Timeframe: {p.timeframe}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
