'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
  X,
  Edit2,
  Trash2,
  Eye,
  ArrowLeft,
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/api-config';
import { getCleanPatientSession } from '@/lib/demo-patients';

interface FamilyMemberItem {
  id: string;
  name: string;
  relation: string;
  phone?: string;
  accessLevel: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  allergies?: string;
  isEmergencyContact?: boolean;
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

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMemberItem | null>(null);
  const [viewingMember, setViewingMember] = useState<FamilyMemberItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    relation: 'Parent',
    phone: '',
    age: '65',
    gender: 'MALE',
    bloodGroup: 'B_POSITIVE',
    allergies: '',
    accessLevel: 'FULL',
    isEmergencyContact: false,
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
      gender: 'MALE',
      bloodGroup: 'B_POSITIVE',
      allergies: 'None recorded',
      isEmergencyContact: true,
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
      gender: 'FEMALE',
      bloodGroup: 'O_POSITIVE',
      allergies: 'Penicillin allergy',
      isEmergencyContact: true,
      healthScore: 88,
      riskLevel: 'GREEN',
      lastVitals: { bp: '122/80', spo2: 98, heartRate: 72 },
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

  const apiUrl = getApiBaseUrl();

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('medinexa_token') ||
        localStorage.getItem('token') ||
        (typeof document !== 'undefined' ? document.cookie.match(/medinexa_token=([^;]+)/)?.[1] : null)
      );
    }
    return null;
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    const session = getCleanPatientSession();
    const token = getAuthToken();

    if (!token) {
      if (session?.isDemo) {
        setFamily(DEMO_FAMILY);
      } else {
        setFamily([]);
      }
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/patient-portal/family`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          // If returned data from database
          if (data.length > 0) {
            setFamily(
              data.map((m: any) => ({
                id: m.id,
                name: m.name,
                relation: m.relationship || m.relation || 'Dependent',
                phone: m.phone || '',
                age: m.age || (m.dateOfBirth ? new Date().getFullYear() - new Date(m.dateOfBirth).getFullYear() : undefined),
                gender: m.gender || 'OTHER',
                bloodGroup: m.bloodGroup || 'UNKNOWN',
                allergies: m.allergies || '',
                isEmergencyContact: m.isEmergencyContact ?? false,
                accessLevel: m.accessLevel || 'FULL',
                healthScore: m.healthScore || 85,
                riskLevel: m.riskLevel || 'GREEN',
                lastVitals: m.lastVitals || { bp: '120/80', spo2: 98, heartRate: 72 },
              }))
            );
          } else if (session?.isDemo) {
            setFamily(DEMO_FAMILY);
          } else {
            setFamily([]);
          }
        }
      } else {
        if (session?.isDemo) setFamily(DEMO_FAMILY);
        else setFamily([]);
      }
    } catch (e) {
      if (session?.isDemo) setFamily(DEMO_FAMILY);
      else setFamily([]);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAddModal = () => {
    setEditingMember(null);
    setForm({
      name: '',
      relation: 'Parent',
      phone: '',
      age: '65',
      gender: 'MALE',
      bloodGroup: 'B_POSITIVE',
      allergies: '',
      accessLevel: 'FULL',
      isEmergencyContact: false,
    });
    setShowAddModal(true);
  };

  const openEditModal = (m: FamilyMemberItem) => {
    setEditingMember(m);
    setForm({
      name: m.name,
      relation: m.relation,
      phone: m.phone || '',
      age: m.age ? String(m.age) : '',
      gender: m.gender || 'MALE',
      bloodGroup: m.bloodGroup || 'B_POSITIVE',
      allergies: m.allergies || '',
      accessLevel: m.accessLevel || 'FULL',
      isEmergencyContact: !!m.isEmergencyContact,
    });
    setShowAddModal(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Please enter family member full name.');
      return;
    }

    setSaving(true);
    const token = getAuthToken();

    const payload = {
      name: form.name.trim(),
      relationship: form.relation,
      phone: form.phone.trim() || undefined,
      gender: form.gender,
      bloodGroup: form.bloodGroup,
      allergies: form.allergies.trim() || undefined,
      isEmergencyContact: form.isEmergencyContact,
      accessLevel: form.accessLevel,
      age: form.age ? parseInt(form.age, 10) : undefined,
    };

    if (token) {
      try {
        const url = editingMember
          ? `${apiUrl}/patient-portal/family/${editingMember.id}`
          : `${apiUrl}/patient-portal/family`;
        const method = editingMember ? 'PATCH' : 'POST';

        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error('Failed to save family member to server.');
        }

        setFormSuccess(editingMember ? 'Member details updated successfully!' : 'Family member added to care circle!');
        setTimeout(() => {
          setFormSuccess(null);
          setShowAddModal(false);
        }, 1200);
        await loadData();
      } catch (err: any) {
        alert(err.message || 'Error saving member.');
      } finally {
        setSaving(false);
      }
    } else {
      // Local fallback for offline mode
      const updatedItem: FamilyMemberItem = {
        id: editingMember ? editingMember.id : `fam-${Date.now()}`,
        name: form.name.trim(),
        relation: form.relation,
        phone: form.phone.trim() || '+91 98000 00000',
        accessLevel: form.accessLevel,
        age: parseInt(form.age, 10) || 40,
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        allergies: form.allergies,
        isEmergencyContact: form.isEmergencyContact,
        healthScore: 84,
        riskLevel: 'GREEN',
        lastVitals: { bp: '120/80', spo2: 98, heartRate: 74 },
      };

      setFamily((prev) => {
        if (editingMember) {
          return prev.map((item) => (item.id === editingMember.id ? updatedItem : item));
        }
        return [...prev, updatedItem];
      });

      setFormSuccess(editingMember ? 'Member updated!' : 'Member added to care circle!');
      setTimeout(() => {
        setFormSuccess(null);
        setShowAddModal(false);
      }, 1200);
      setSaving(false);
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from your family care circle?`)) return;
    const token = getAuthToken();

    if (token) {
      try {
        const res = await fetch(`${apiUrl}/patient-portal/family/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          await loadData();
        } else {
          setFamily((prev) => prev.filter((m) => m.id !== id));
        }
      } catch {
        setFamily((prev) => prev.filter((m) => m.id !== id));
      }
    } else {
      setFamily((prev) => prev.filter((m) => m.id !== id));
    }
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
      return updated;
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/portal"
              className="text-xs font-semibold text-slate-500 hover:text-pink-600 flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="px-3 py-1 bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-black uppercase rounded-full border border-pink-500/20">
              FAMILY CARE CIRCLE & GUARDIAN ECOSYSTEM
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Family Care & Dependants Station
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage linked dependants, keep their medical records distinctly associated, authorize consent, and coordinate family care tasks.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-pink-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Family Member</span>
          </button>
          <Link
            href="/portal/health-score"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition"
          >
            <HeartPulse className="w-4 h-4 text-rose-500" />
            <span>Health Score</span>
          </Link>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Linked Dependants</div>
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
            {family.length > 0 ? guardianTasks.filter((t) => t.status === 'PENDING').length : 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Due today & tomorrow</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Proxy Consent</div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
            {family.length > 0 ? 'Authorized' : '0 Linked'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Full medical proxy</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2">
        {[
          { id: 'roster', label: `Dependents Roster (${family.length})`, icon: Users },
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
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap cursor-pointer ${
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
        <div>
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
              Loading family care roster...
            </div>
          ) : family.length === 0 ? (
            /* Empty State */
            <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-dashed-2 border-slate-300 dark:border-slate-800 shadow-sm space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center mx-auto shadow-inner text-2xl">
                👨‍👩‍👧‍👦
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  No family members added yet.
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Add children, elderly parents, or dependants to your family care circle. You can monitor vitals, manage their doctor appointments, and maintain separate, confidential medical profiles.
                </p>
              </div>
              <div>
                <button
                  onClick={openAddModal}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white text-xs font-bold shadow-md shadow-pink-500/20 inline-flex items-center gap-2 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Family Member</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {family.map((member) => (
                <div
                  key={member.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-rose-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-lg">
                          👤
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{member.name}</h3>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {member.relation} {member.age ? `• ${member.age} yrs` : ''} {member.gender ? `• ${member.gender}` : ''}
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

                    {member.bloodGroup && (
                      <div className="text-[11px] text-slate-500">
                        Blood Group: <strong className="text-slate-800 dark:text-slate-200">{member.bloodGroup.replace('_', ' ')}</strong>
                      </div>
                    )}

                    {member.allergies && (
                      <div className="text-[11px] text-rose-600 dark:text-rose-400">
                        Allergies: {member.allergies}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setViewingMember(member)}
                      className="font-bold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Dossier
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(member)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Edit Member"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id, member.name)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                        title="Remove Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                Automated continuous monitoring for parents and chronic disease dependants. Automatic emergency escalation triggers when score drops below 40.
              </p>
            </div>
            <Link
              href="/emergency/sos"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md shadow-rose-500/20 transition whitespace-nowrap"
            >
              Emergency SOS Beacon
            </Link>
          </div>

          {family.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              No family members added to the surveillance beacon yet. Add parents or dependants to view live vitals monitoring.
            </div>
          ) : (
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
                      {m.riskLevel || 'NORMAL'} HEALTH STATUS
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-black text-teal-600 dark:text-teal-400">{m.healthScore || 85}</div>
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
                      href="/portal/health-score"
                      className="text-pink-600 font-bold hover:underline flex items-center gap-1"
                    >
                      View Detailed Telemetry &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Care Tasks & Med Pass */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Daily Medication Passes & Care Routines</h3>
          </div>

          {family.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              No family tasks scheduled. Add family members to establish care routines and dose passes.
            </div>
          ) : (
            <div className="space-y-3">
              {guardianTasks.map((t) => (
                <div
                  key={t.id}
                  className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${
                    t.status === 'COMPLETED'
                      ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75'
                      : 'bg-white dark:bg-slate-900 border-pink-200 dark:border-pink-900/60 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleTask(t.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition mt-0.5 cursor-pointer ${
                        t.status === 'COMPLETED'
                          ? 'bg-emerald-600 text-white'
                          : 'border-2 border-slate-300 dark:border-slate-700 hover:border-pink-500'
                      }`}
                    >
                      {t.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className={`text-xs font-bold ${t.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-pink-600 dark:text-pink-400">{t.targetMember}</span>
                        <span>•</span>
                        <span>{t.dueTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Proxy Permissions */}
      {activeTab === 'permissions' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-600" />
            Legal Medical Proxy & Dependant Record Isolation
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            In compliance with patient confidentiality and India ABDM standards, each family member's prescriptions, lab reports, and medical history remain isolated and separate. Authorized guardians are granted proxy booking and view access only according to explicit role assignments.
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-3 flex justify-between items-center">
              <div>
                <strong className="block text-slate-900 dark:text-slate-100">Prescription Refill Proxy</strong>
                <span className="text-slate-400 text-[11px]">Authorize booking refills on behalf of dependants</span>
              </div>
              <span className="text-emerald-600 font-bold">Enabled</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <div>
                <strong className="block text-slate-900 dark:text-slate-100">Direct Lab Report Access</strong>
                <span className="text-slate-400 text-[11px]">View diagnostic results and PDF film scans</span>
              </div>
              <span className="text-emerald-600 font-bold">Enabled</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Access Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Family Access Audit Log</h3>
          <div className="text-xs text-slate-500 space-y-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex justify-between items-center">
              <span>Care Circle viewed via Web Portal</span>
              <span className="font-mono text-[11px] text-slate-400">Just now</span>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MEMBER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-600" />
                <span>{editingMember ? 'Edit Family Member' : 'Add Family Member to Care Circle'}</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Singh"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Relationship
                  </label>
                  <select
                    value={form.relation}
                    onChange={(e) => setForm({ ...form, relation: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="Parent">Parent (Father / Mother)</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child (Son / Daughter)</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Dependant">Other Dependant</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 68"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Blood Group (if known)
                  </label>
                  <select
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="A_POSITIVE">A Positive (A+)</option>
                    <option value="B_POSITIVE">B Positive (B+)</option>
                    <option value="O_POSITIVE">O Positive (O+)</option>
                    <option value="AB_POSITIVE">AB Positive (AB+)</option>
                    <option value="A_NEGATIVE">A Negative (A-)</option>
                    <option value="B_NEGATIVE">B Negative (B-)</option>
                    <option value="O_NEGATIVE">O Negative (O-)</option>
                    <option value="AB_NEGATIVE">AB Negative (AB-)</option>
                    <option value="UNKNOWN">Not Known</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+91 98000 00000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Allergies & Relevant Health Information
                </label>
                <input
                  type="text"
                  placeholder="e.g. Asthmatic, Penicillin allergy"
                  value={form.allergies}
                  onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Emergency Contact</span>
                  <span className="text-[10px] text-slate-400">Designate as emergency triage contact</span>
                </div>
                <input
                  type="checkbox"
                  checked={form.isEmergencyContact}
                  onChange={(e) => setForm({ ...form, isEmergencyContact: e.target.checked })}
                  className="w-4 h-4 rounded text-pink-600 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold rounded-xl transition shadow-sm cursor-pointer"
                >
                  {saving ? 'Saving...' : editingMember ? 'Update Member' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DOSSIER MODAL */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase text-pink-600">DEPENDANT DOSSIER</span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{viewingMember.name}</h3>
              </div>
              <button onClick={() => setViewingMember(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Relationship:</span>
                <span className="font-semibold">{viewingMember.relation}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Age:</span>
                <span className="font-semibold">{viewingMember.age ? `${viewingMember.age} years` : 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Gender:</span>
                <span className="font-semibold">{viewingMember.gender || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Blood Group:</span>
                <span className="font-semibold">{viewingMember.bloodGroup ? viewingMember.bloodGroup.replace('_', ' ') : 'Unknown'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Phone:</span>
                <span className="font-semibold">{viewingMember.phone || 'No direct phone'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Allergies:</span>
                <span className="font-semibold text-rose-600">{viewingMember.allergies || 'None reported'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Access Level:</span>
                <span className="font-semibold text-emerald-600">{viewingMember.accessLevel}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingMember(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
