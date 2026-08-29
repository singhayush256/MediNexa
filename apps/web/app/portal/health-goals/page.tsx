'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PatientHealthGoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGoalForm, setNewGoalForm] = useState({
    title: '',
    targetValue: '',
    currentValue: '',
    unit: 'steps',
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/patient-portal/health-goals`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setGoals(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    await fetch(`${apiUrl}/patient-portal/health-goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...newGoalForm,
        targetValue: Number(newGoalForm.targetValue),
        currentValue: Number(newGoalForm.currentValue || 0),
      }),
    });

    setNewGoalForm({
      title: '',
      targetValue: '',
      currentValue: '',
      unit: 'steps',
    });
    loadData();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-black uppercase rounded-full">
              WELLNESS & VITALS
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Health Goals Tracker</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">Set and track personal vital targets, daily step counts, hydration, and wellness benchmarks.</p>
        </div>
        <Link href="/portal" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
          ← Portal
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Goals Roster */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase">Active Health Goals</h2>
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading health goals...</div>
          ) : goals.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="text-3xl">🎯</div>
              <h3 className="font-extrabold text-sm text-slate-900">No Health Goals Configured</h3>
              <p className="text-xs text-slate-500">Create your first wellness goal using the form.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((g) => {
                const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
                return (
                  <div key={g.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm text-slate-900">{g.title}</h3>
                      <span className="px-2.5 py-1 bg-teal-100 text-teal-800 text-[10px] font-black rounded-full uppercase">
                        {g.status}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Progress: {g.currentValue} {g.unit}</span>
                      <span className="text-teal-700 font-extrabold">Target: {g.targetValue} {g.unit} ({pct}%)</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Goal Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">➕ Set Health Goal</h3>
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">Goal Title</label>
              <input
                type="text"
                required
                value={newGoalForm.title}
                onChange={(e) => setNewGoalForm({ ...newGoalForm, title: e.target.value })}
                placeholder="e.g. Daily Walking Steps"
                className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Target Value</label>
                <input
                  type="number"
                  required
                  value={newGoalForm.targetValue}
                  onChange={(e) => setNewGoalForm({ ...newGoalForm, targetValue: e.target.value })}
                  placeholder="e.g. 10000"
                  className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Current Value</label>
                <input
                  type="number"
                  value={newGoalForm.currentValue}
                  onChange={(e) => setNewGoalForm({ ...newGoalForm, currentValue: e.target.value })}
                  placeholder="e.g. 6500"
                  className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">Unit of Measurement</label>
              <input
                type="text"
                required
                value={newGoalForm.unit}
                onChange={(e) => setNewGoalForm({ ...newGoalForm, unit: e.target.value })}
                placeholder="e.g. steps, litres, mmHg, kg"
                className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow transition"
            >
              Add Health Goal →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
