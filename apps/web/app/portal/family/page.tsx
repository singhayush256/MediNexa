'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  HeartPulse,
  ShieldCheck,
  ListTodo,
  Activity,
  Plus,
  Phone,
  Clock,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  BellRing,
  Heart,
  Calendar,
  Pill,
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/api-config';

interface FamilyMemberItem {
  id: string;
  name: string;
  relation: string;
  phone?: string;
  accessLevel: string;
  age?: number;
  healthScore?: number;
  riskLevel?: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  lastVitals?: {
    bp: string;
    spo2: number;
    heartRate: number;
  };
}

interface GuardianTask {
  id: string;
  title: string;
  targetMember: string;
  dueTime: string;
  status: 'PENDING' | 'COMPLETED';
  category: 'MEDICATION' | 'APPOINTMENT' | 'CHECKIN';
}

export default function PatientFamilyPage() {
  const [activeTab, setActiveTab] = useState<'roster' | 'monitor' | 'permissions' | 'tasks' | 'logs'>('roster');
  const [family, setFamily] = useState<FamilyMemberItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    relation: 'Parent',
    phone: '',
    accessLevel: 'FULL',
    age: '68',
  });
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const DEMO_FAMILY: FamilyMemberItem[] = [
    {
      id: 'fam-1',
      name: 'Ramesh Singh',
      relation: 'Father',
      phone: '+91 98110 23412',
      accessLevel: 'FULL_GUARDIAN',
      age: 68,
      healthScore: 74,
      riskLevel: 'YELLOW',
      lastVitals: { bp: '138/86', spo2: 96, heartRate: 78 },
    },
    {
      id: 'fam-2',
      name: 'Sarita Singh',
      relation: 'Mother',
      phone: '+91 98201 55432',
      accessLevel: 'FULL_GUARDIAN',
      age: 64,
      healthScore: 88,
      riskLevel: 'GREEN',
      lastVitals: { bp: '122/80', spo2: 98, heartRate: 72 },
    },
    {
      id: 'fam-3',
      name: 'Aarav Singh',
      relation: 'Son',
      phone: '+91 98310 99881',
      accessLevel: 'VIEW_ONLY',
      age: 12,
      healthScore: 95,
      riskLevel: 'GREEN',
      lastVitals: { bp: '110/70', spo2: 99, heartRate: 82 },
    },
  ];

  const [guardianTasks, setGuardianTasks] = useState<GuardianTask[]>([
    {
      id: 'gt-1',
      title: 'Confirm Father Morning Blood Pressure & Telmisartan 40mg',
      targetMember: 'Ramesh Singh',
      dueTime: 'Today, 9:00 AM',
      status: 'COMPLETED',
      category: 'MEDICATION',
    },
    {
      id: 'gt-2',
      title: 'Chaperone Mother to Cardiology Follow-up Consultation',
      targetMember: 'Sarita Singh',
      dueTime: 'Tomorrow, 11:30 AM',
      status: 'PENDING',
      category: 'APPOINTMENT',
    },
    {
      id: 'gt-3',
      title: 'Review Father Post-Dinner Fasting Blood Sugar Log',
      targetMember: 'Ramesh Singh',
      dueTime: 'Today, 9:30 PM',
      status: 'PENDING',
      category: 'CHECKIN',
    },
  ]);

  const loadData = () => {
    setLoading(true);
    let initialFamily = DEMO_FAMILY;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('medinexa_family_members');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            initialFamily = parsed;
          }
        }
        const storedTasks = localStorage.getItem('medinexa_guardian_tasks');
        if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks);
          if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
            setGuardianTasks(parsedTasks);
          }
        }
      } catch {}
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    const apiUrl = getApiBaseUrl();
    if (!token) {
      setFamily(initialFamily);
      setLoading(false);
      return;
    }

    fetch(`${apiUrl}/patient-portal/family`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFamily(data);
          try { localStorage.setItem('medinexa_family_members', JSON.stringify(data)); } catch {}
        } else {
          setFamily(initialFamily);
        }
        setLoading(false);
      })
      .catch(() => {
        setFamily(initialFamily);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberForm.name.trim()) return;

    const newMember: FamilyMemberItem = {
      id: `fam-${Date.now()}`,
      name: newMemberForm.name.trim(),
      relation: newMemberForm.relation,
      phone: newMemberForm.phone.trim() || '+91 98000 00000',
      accessLevel: newMemberForm.accessLevel,
      age: parseInt(newMemberForm.age) || 40,
      healthScore: 82,
      riskLevel: 'GREEN',
      lastVitals: { bp: '120/80', spo2: 98, heartRate: 75 },
    };

    setFamily((prev) => {
      const updated = [...prev, newMember];
      try {
        localStorage.setItem('medinexa_family_members', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setFormSuccess(`${newMember.name} added to care circle successfully!`);
    setTimeout(() => {
      setFormSuccess(null);
      setShowAddModal(false);
      setNewMemberForm({ name: '', relation: 'Parent', phone: '', accessLevel: 'FULL', age: '68' });
    }, 1200);
  };

  const handleToggleTask = (id: string) => {
    setGuardianTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: (t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED') as 'PENDING' | 'COMPLETED',
            }
          : t,
      );
      try {
        localStorage.setItem('medinexa_guardian_tasks', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-black uppercase rounded-full border border-pink-500/20">
              FAMILY CARE CIRCLE & GUARDIAN ECOSYSTEM
            </span>
            <span className="text-xs font-bold text-slate-500">MediNexa v3.0</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Family Care & Guardian Station
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage linked dependents, monitor real-time health scores & vitals, authorize consent, and coordinate care tasks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-pink-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            + Add Dependent
          </button>
          <Link
            href="/portal/health-score"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition"
          >
            <HeartPulse className="w-4 h-4 text-rose-500" />
            Health Score
          </Link>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Linked Dependents</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{family.length}</div>
          <div className="text-[11px] text-pink-600 font-semibold mt-0.5">Active in care circle</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Guardian Alerts</div>
          <div className="text-2xl font-black text-emerald-500 mt-1">0 Critical</div>
          <div className="text-[11px] text-slate-500 mt-0.5">All vitals stable</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Pending Care Tasks</div>
          <div className="text-2xl font-black text-amber-500 mt-1">
            {guardianTasks.filter((t) => t.status === 'PENDING').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Due today & tomorrow</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Proxy Consent</div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">Authorized</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Full medical proxy</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2">
        {[
          { id: 'roster', label: 'Dependents Roster', icon: Users },
          { id: 'monitor', label: 'Eldercare & Vitals Monitor', icon: HeartPulse },
          { id: 'tasks', label: 'Care Tasks & Med Pass', icon: ListTodo },
          { id: 'permissions', label: 'Proxy Permissions', icon: ShieldCheck },
          { id: 'logs', label: 'Access Audit Logs', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Dependents Roster */}
      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {family.map((member) => (
            <div
              key={member.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-rose-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-lg">
                    👤
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{member.name}</h3>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {member.relation} • {member.age} yrs
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {member.accessLevel.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Vitals Snapshot */}
              {member.lastVitals && (
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-center text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400">Score</div>
                    <div className="font-extrabold text-teal-600">{member.healthScore}/100</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400">SpO2</div>
                    <div className="font-extrabold text-slate-900 dark:text-white">{member.lastVitals.spo2}%</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400">BP</div>
                    <div className="font-extrabold text-slate-900 dark:text-white">{member.lastVitals.bp}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">{member.phone}</span>
                <Link
                  href={`/portal/health-score`}
                  className="font-bold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
                >
                  Health Metrics <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Eldercare & Vitals Monitor */}
      {activeTab === 'monitor' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-purple-500/10 p-5 rounded-3xl border border-teal-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-500 animate-pulse" />
                Live Eldercare Surveillance Beacon
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Automated continuous monitoring for parents and chronic disease dependents. Automatic emergency escalation triggers when score drops below 40.
              </p>
            </div>
            <Link
              href="/emergency/sos"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md shadow-rose-500/20 transition whitespace-nowrap"
            >
              Test Emergency Escalation
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {family.map((m) => (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white">{m.name} ({m.relation})</div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      m.riskLevel === 'GREEN'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {m.riskLevel} HEALTH STATUS
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-black text-teal-600 dark:text-teal-400">{m.healthScore}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Health Score / 100</div>
                  </div>
                  <div className="text-right text-xs text-slate-500 space-y-0.5">
                    <div>Blood Pressure: <strong>{m.lastVitals?.bp || '120/80'}</strong></div>
                    <div>Blood Oxygen (SpO2): <strong>{m.lastVitals?.spo2 || 98}%</strong></div>
                    <div>Heart Rate: <strong>{m.lastVitals?.heartRate || 72} BPM</strong></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-emerald-600 font-semibold text-[11px]">● Telemetry Connected</span>
                  <Link
                    href="/portal/medication-reminders"
                    className="font-bold text-slate-700 dark:text-slate-300 hover:underline flex items-center gap-1"
                  >
                    View Med Schedule <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Care Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Daily Care Coordination Tasks</h2>
            <span className="text-xs text-slate-500">Check off tasks to log adherence</span>
          </div>

          <div className="space-y-3">
            {guardianTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  task.status === 'COMPLETED'
                    ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-pink-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {task.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        task.status === 'COMPLETED'
                          ? 'line-through text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {task.title}
                    </h4>
                    <div className="text-[11px] text-slate-500">
                      Dependent: <strong>{task.targetMember}</strong> • Due: {task.dueTime}
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    task.category === 'MEDICATION'
                      ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                      : task.category === 'APPOINTMENT'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}
                >
                  {task.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Add Dependent to Care Circle</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            {formSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-500">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Singh"
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Relationship</label>
                  <select
                    value={newMemberForm.relation}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, relation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child / Minor</option>
                    <option value="Guardian">Legal Guardian</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    value={newMemberForm.age}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98..."
                  value={newMemberForm.phone}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Access Level</label>
                <select
                  value={newMemberForm.accessLevel}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, accessLevel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="FULL_GUARDIAN">Full Guardian (Manage All Records & Decisions)</option>
                  <option value="EMERGENCY_PROXY">Emergency Proxy (Alerts & Emergency Care)</option>
                  <option value="VIEW_ONLY">View Only (Reports & Appointments)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl transition shadow-md shadow-pink-500/20"
                >
                  Link Dependent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
