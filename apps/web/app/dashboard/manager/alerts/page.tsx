'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
  Search,
  User,
  Shield,
} from 'lucide-react';

interface OperationalAlert {
  id: string;
  category: 'Critical' | 'High' | 'Medium' | 'Info';
  title: string;
  department: string;
  description: string;
  timestamp: string;
  assignedTo?: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'ESCALATED' | 'RESOLVED';
}

export default function ManagerAlertsPage() {
  const [alerts, setAlerts] = useState<OperationalAlert[]>([
    {
      id: 'alt-01',
      category: 'Critical',
      title: 'ICU Ventilator Gas Supply Pressure Nominal Warning',
      department: 'Critical Care ICU',
      description: 'Central pipeline manifold 2 dropped to 3.8 bar momentarily during shift changeover.',
      timestamp: '10 mins ago',
      assignedTo: 'Biomedical Supervisor',
      status: 'ACKNOWLEDGED',
    },
    {
      id: 'alt-02',
      category: 'High',
      title: 'OPD Congestion Escalation (>35 min Wait)',
      department: 'Cardiology Clinic',
      description: 'Lobby seating capacity at 95%. Dr. Sunita requested fast-track triage assistance.',
      timestamp: '25 mins ago',
      status: 'OPEN',
    },
    {
      id: 'alt-03',
      category: 'Medium',
      title: 'Night Shift Duty Roster Unconfirmed by 2 Doctors',
      department: 'General Medicine',
      description: 'Night coverage roster sign-off pending for shift beginning 20:00.',
      timestamp: '1 hour ago',
      status: 'OPEN',
    },
    {
      id: 'alt-04',
      category: 'Info',
      title: 'Daily Fire & Life Safety Automatic Pressure Test Passed',
      department: 'Facilities & Safety',
      description: 'Sub-station sprinkler pumps tested with zero pressure leakage detected.',
      timestamp: '2 hours ago',
      status: 'RESOLVED',
    },
  ]);

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleAction = (id: string, action: 'Acknowledge' | 'Escalate' | 'Resolve') => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextStatus: any =
            action === 'Acknowledge'
              ? 'ACKNOWLEDGED'
              : action === 'Escalate'
              ? 'ESCALATED'
              : 'RESOLVED';
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );

    setActionNotice(`Alert ${id} updated to ${action.toUpperCase()}. Audit event logged.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const filtered = alerts.filter((a) => {
    if (categoryFilter === 'ALL') return true;
    return a.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Operational Safety & Escalations</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Alerts & Escalation Command
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Classified incident management across Critical, High, Medium, and Info operational triggers.
          </p>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-xs font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['ALL', 'Critical', 'High', 'Medium', 'Info'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              categoryFilter === cat
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {cat} (
            {cat === 'ALL'
              ? alerts.length
              : alerts.filter((a) => a.category.toLowerCase() === cat.toLowerCase()).length}
            )
          </button>
        ))}
      </div>

      {/* Alerts List conforming to Section 26 */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition shadow-xs space-y-3 ${
              item.status === 'RESOLVED'
                ? 'opacity-60 border-slate-200 dark:border-slate-800'
                : item.category === 'Critical'
                ? 'border-rose-300 dark:border-rose-900/60'
                : item.category === 'High'
                ? 'border-amber-300 dark:border-amber-900/60'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                    item.category === 'Critical'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      : item.category === 'High'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      : item.category === 'Medium'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.category} Alert
                </span>
                <span className="font-mono text-xs text-slate-400 font-bold">{item.id}</span>
                <span className="text-xs font-semibold text-slate-500">• {item.department}</span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {item.timestamp}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    item.status === 'RESOLVED'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : item.status === 'ESCALATED'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      : item.status === 'ACKNOWLEDGED'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {item.description}
              </p>
            </div>

            {item.assignedTo && (
              <div className="text-xs text-slate-500 font-medium">
                Assigned: <span className="font-bold text-slate-700 dark:text-slate-300">{item.assignedTo}</span>
              </div>
            )}

            {/* Actions: Acknowledge, Escalate, Resolve */}
            {item.status !== 'RESOLVED' && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
                {item.status === 'OPEN' && (
                  <button
                    onClick={() => handleAction(item.id, 'Acknowledge')}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs cursor-pointer"
                  >
                    Acknowledge
                  </button>
                )}
                {item.status !== 'ESCALATED' && (
                  <button
                    onClick={() => handleAction(item.id, 'Escalate')}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold text-xs cursor-pointer"
                  >
                    Escalate to Medical Admin
                  </button>
                )}
                <button
                  onClick={() => handleAction(item.id, 'Resolve')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
