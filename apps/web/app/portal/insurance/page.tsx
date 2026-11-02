'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Plus,
  ArrowLeft,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Phone,
  Building2,
  FileText,
  Clock,
  Sparkles,
  Trash2,
  Edit2,
  ExternalLink,
  ShieldAlert,
  CreditCard,
  X,
  FileCheck,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { getApiBaseUrl } from '@/lib/api-config';
import { TpaInsuranceEasyView } from '@/components/insurance/TpaInsuranceEasyView';
import { getCleanPatientSession } from '@/lib/demo-patients';

interface PatientInsurancePolicy {
  id: string;
  provider: string;
  policyNumber: string;
  policyHolderName?: string;
  policyType?: string;
  memberId?: string;
  coverageStartDate?: string;
  expiryDate?: string;
  sumInsured?: number;
  tpaName?: string;
  customerSupportPhone?: string;
  coveredDependents?: string;
  documentUrl?: string;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
}

interface InsuranceClaim {
  id: string;
  claimNumber: string;
  policyNumber: string;
  provider: string;
  hospitalName: string;
  admissionDate?: string;
  claimAmount: number;
  approvedAmount?: number;
  status: 'SUBMITTED' | 'IN_REVIEW' | 'QUERY_RAISED' | 'APPROVED' | 'SETTLED' | 'REJECTED';
  tpaRef?: string;
  treatmentName: string;
  createdAt: string;
}

export default function PatientPortalInsurancePage() {
  const [activeTab, setActiveTab] = useState<'policies' | 'claims' | 'hospitalDesk'>('policies');
  const [policies, setPolicies] = useState<PatientInsurancePolicy[]>([]);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<PatientInsurancePolicy | null>(null);
  const [viewingPolicy, setViewingPolicy] = useState<PatientInsurancePolicy | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    provider: '',
    policyNumber: '',
    policyHolderName: '',
    policyType: 'Comprehensive Health Insurance',
    memberId: '',
    coverageStartDate: '',
    expiryDate: '',
    sumInsured: '',
    tpaName: '',
    customerSupportPhone: '',
    coveredDependents: '',
    notes: '',
  });

  const apiUrl = getApiBaseUrl();

  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return (
      localStorage.getItem('medinexa_token') ||
      localStorage.getItem('token') ||
      (typeof document !== 'undefined' ? document.cookie.match(/medinexa_token=([^;]+)/)?.[1] : null)
    );
  };

  const loadInsuranceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();
    const session = getCleanPatientSession();

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch policies
      const polRes = await fetch(`${apiUrl}/patient-portal/insurance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (polRes.ok) {
        const polData = await polRes.json();
        setPolicies(Array.isArray(polData) ? polData : []);
      }

      // 2. Fetch genuine claims
      const clmRes = await fetch(`${apiUrl}/patient-portal/insurance/claims`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (clmRes.ok) {
        const clmData = await clmRes.json();
        setClaims(Array.isArray(clmData) ? clmData : []);
      }
    } catch (err: any) {
      console.warn('Failed to load insurance policies:', err);
      setError('Unable to synchronize insurance records from server.');
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadInsuranceData();
  }, [loadInsuranceData]);

  const openAddModal = () => {
    const session = getCleanPatientSession();
    setEditingPolicy(null);
    setFormData({
      provider: '',
      policyNumber: '',
      policyHolderName: session?.name || '',
      policyType: 'Comprehensive Health Insurance',
      memberId: '',
      coverageStartDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      sumInsured: '500000',
      tpaName: 'Medi Assist Insurance TPA',
      customerSupportPhone: '1800 425 2255',
      coveredDependents: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (policy: PatientInsurancePolicy) => {
    setEditingPolicy(policy);
    setFormData({
      provider: policy.provider || '',
      policyNumber: policy.policyNumber || '',
      policyHolderName: policy.policyHolderName || '',
      policyType: policy.policyType || 'Comprehensive Health Insurance',
      memberId: policy.memberId || '',
      coverageStartDate: policy.coverageStartDate ? policy.coverageStartDate.split('T')[0] : '',
      expiryDate: policy.expiryDate ? policy.expiryDate.split('T')[0] : '',
      sumInsured: policy.sumInsured ? String(policy.sumInsured) : '',
      tpaName: policy.tpaName || '',
      customerSupportPhone: policy.customerSupportPhone || '',
      coveredDependents: policy.coveredDependents || '',
      notes: policy.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.provider.trim() || !formData.policyNumber.trim()) {
      alert('Please enter Insurance Provider and Policy Number.');
      return;
    }

    setSaving(true);
    const token = getAuthToken();
    if (!token) {
      alert('Authentication required.');
      setSaving(false);
      return;
    }

    const payload = {
      provider: formData.provider.trim(),
      policyNumber: formData.policyNumber.trim(),
      policyHolderName: formData.policyHolderName.trim() || undefined,
      policyType: formData.policyType.trim() || undefined,
      memberId: formData.memberId.trim() || undefined,
      coverageStartDate: formData.coverageStartDate || undefined,
      expiryDate: formData.expiryDate || undefined,
      sumInsured: formData.sumInsured ? parseFloat(formData.sumInsured) : undefined,
      tpaName: formData.tpaName.trim() || undefined,
      customerSupportPhone: formData.customerSupportPhone.trim() || undefined,
      coveredDependents: formData.coveredDependents.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    };

    try {
      const url = editingPolicy
        ? `${apiUrl}/patient-portal/insurance/${editingPolicy.id}`
        : `${apiUrl}/patient-portal/insurance`;
      const method = editingPolicy ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to save insurance policy.');
      }

      setSuccessMsg(editingPolicy ? 'Insurance policy updated successfully!' : 'Insurance policy added successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
      setIsAddModalOpen(false);
      await loadInsuranceData();
    } catch (err: any) {
      alert(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePolicy = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate and remove policy ${name}?`)) return;
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/patient-portal/insurance/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSuccessMsg('Policy removed successfully.');
        setTimeout(() => setSuccessMsg(null), 3000);
        await loadInsuranceData();
      } else {
        alert('Could not remove policy.');
      }
    } catch {
      alert('Error deactivating policy.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'SETTLED':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {status}
          </span>
        );
      case 'IN_REVIEW':
      case 'SUBMITTED':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {status}
          </span>
        );
      case 'QUERY_RAISED':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> QUERY
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> REJECTED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/portal"
              className="text-xs font-semibold text-slate-500 hover:text-teal-600 flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Health Insurance & Cashless Services
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            <span>Health Insurance Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage your active medical insurance policies, check pre-authorization statuses, and access cashless hospital TPA services.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-500/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Insurance Policy</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('policies')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'policies'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>My Policies ({policies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'claims'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Claims & Pre-Auth ({claims.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hospitalDesk')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'hospitalDesk'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Hospital Cashless & TPA Desk</span>
        </button>
      </div>

      {/* TAB 1: POLICIES */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
              Loading your verified insurance policies...
            </div>
          ) : policies.length === 0 ? (
            /* Empty State */
            <Card className="p-10 text-center space-y-4 border-dashed border-2 border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  No insurance details added yet.
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Add your health insurance policy to enable cashless hospital admissions, automated TPA pre-authorization, and direct hospital settlements.
                </p>
              </div>
              <div>
                <button
                  onClick={openAddModal}
                  className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 inline-flex items-center gap-2 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Insurance Details</span>
                </button>
              </div>
            </Card>
          ) : (
            /* Policy Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {policies.map((p) => {
                const isExpired = p.expiryDate && new Date(p.expiryDate) < new Date();
                return (
                  <Card
                    key={p.id}
                    className="p-5 flex flex-col justify-between border-slate-200 dark:border-slate-800 hover:border-teal-500/40 transition shadow-xs space-y-4 relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 block">
                            {p.policyType || 'Health Policy'}
                          </span>
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                            {p.provider}
                          </h3>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider ${
                            isExpired
                              ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {isExpired ? 'EXPIRED' : 'ACTIVE'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Policy Number:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                            {p.policyNumber}
                          </span>
                        </div>
                        {p.policyHolderName && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Policyholder:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {p.policyHolderName}
                            </span>
                          </div>
                        )}
                        {p.sumInsured && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Sum Insured:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              ₹{p.sumInsured.toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}
                        {p.tpaName && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">TPA Desk:</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {p.tpaName}
                            </span>
                          </div>
                        )}
                        {p.expiryDate && (
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400">Valid Till:</span>
                            <span className={`font-semibold ${isExpired ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400'}`}>
                              {new Date(p.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {p.customerSupportPhone && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-teal-600" />
                          <span>Support: <strong className="text-slate-700 dark:text-slate-300">{p.customerSupportPhone}</strong></span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setViewingPolicy(p)}
                        className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        View Full Details
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Edit Policy"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePolicy(p.id, p.provider)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                          title="Remove Policy"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CLAIMS & PRE-AUTH */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
              Retrieving live insurance claims and cashless pre-authorization records...
            </div>
          ) : claims.length === 0 ? (
            <Card className="p-10 text-center space-y-3 border-dashed border-2 border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <FileCheck className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                No insurance claims filed yet.
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                When you initiate a cashless hospitalization or file a reimbursement claim with the hospital TPA desk, real-time approval milestones will appear here.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {claims.map((c) => (
                <Card key={c.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                        {c.claimNumber}
                      </span>
                      {getStatusBadge(c.status)}
                      <span className="text-xs text-slate-400">
                        • {c.provider}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {c.treatmentName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Facility: {c.hospitalName} • TPA Ref: {c.tpaRef || 'N/A'}
                    </p>
                  </div>

                  <div className="text-right sm:border-l sm:border-slate-100 dark:sm:border-slate-800 sm:pl-4 shrink-0">
                    <div className="text-[11px] text-slate-400">Claim Amount</div>
                    <div className="text-base font-black text-slate-900 dark:text-slate-100">
                      ₹{c.claimAmount.toLocaleString('en-IN')}
                    </div>
                    {c.approvedAmount !== undefined && (
                      <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        Approved: ₹{c.approvedAmount.toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HOSPITAL NETWORK TPA DESK */}
      {activeTab === 'hospitalDesk' && (
        <div className="space-y-4">
          <TpaInsuranceEasyView />
        </div>
      )}

      {/* ADD / EDIT POLICY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span>{editingPolicy ? 'Edit Insurance Policy' : 'Add Health Insurance Policy'}</span>
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPolicy} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Insurance Provider / Company <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Star Health, HDFC ERGO, Care"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Policy Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. POL-9842104-A"
                    value={formData.policyNumber}
                    onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Policyholder Name</label>
                  <input
                    type="text"
                    placeholder="Primary Insured Name"
                    value={formData.policyHolderName}
                    onChange={(e) => setFormData({ ...formData, policyHolderName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Policy Type</label>
                  <select
                    value={formData.policyType}
                    onChange={(e) => setFormData({ ...formData, policyType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Comprehensive Health Insurance">Comprehensive Health Insurance</option>
                    <option value="Family Floater">Family Floater</option>
                    <option value="Corporate / Group Mediclaim">Corporate / Group Mediclaim</option>
                    <option value="Senior Citizen Health Cover">Senior Citizen Health Cover</option>
                    <option value="Critical Illness Plan">Critical Illness Plan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Member ID / UHID</label>
                  <input
                    type="text"
                    placeholder="Member ID"
                    value={formData.memberId}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Sum Insured (₹)</label>
                  <input
                    type="number"
                    placeholder="500000"
                    value={formData.sumInsured}
                    onChange={(e) => setFormData({ ...formData, sumInsured: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">TPA Administrator</label>
                  <input
                    type="text"
                    placeholder="e.g. Medi Assist, Vidal Health"
                    value={formData.tpaName}
                    onChange={(e) => setFormData({ ...formData, tpaName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">TPA Helpline Contact</label>
                  <input
                    type="text"
                    placeholder="e.g. 1800 425 2255"
                    value={formData.customerSupportPhone}
                    onChange={(e) => setFormData({ ...formData, customerSupportPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Covered Dependants (if applicable)</label>
                <input
                  type="text"
                  placeholder="e.g. Spouse: Priya Singh, Child: Aarav Singh"
                  value={formData.coveredDependents}
                  onChange={(e) => setFormData({ ...formData, coveredDependents: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Additional Notes / Pre-Existing Exclusions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Co-pay 10% on diagnostics, maternity waiting period 2 years"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  {saving ? 'Saving...' : editingPolicy ? 'Update Policy' : 'Save Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW POLICY DETAILS MODAL */}
      {viewingPolicy && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-teal-600">POLICY DOSSIER</span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{viewingPolicy.provider}</h3>
              </div>
              <button
                onClick={() => setViewingPolicy(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Policy Number</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{viewingPolicy.policyNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Sum Insured</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {viewingPolicy.sumInsured ? `₹${viewingPolicy.sumInsured.toLocaleString('en-IN')}` : 'Not Specified'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Policyholder:</span>
                  <span className="font-semibold">{viewingPolicy.policyHolderName || 'Self'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Type:</span>
                  <span className="font-semibold">{viewingPolicy.policyType || 'Comprehensive'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Member ID:</span>
                  <span className="font-mono">{viewingPolicy.memberId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TPA Desk:</span>
                  <span className="font-medium">{viewingPolicy.tpaName || 'Direct'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Helpline:</span>
                  <span className="font-medium">{viewingPolicy.customerSupportPhone || '1800-MEDINEXA'}</span>
                </div>
                {viewingPolicy.coveredDependents && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dependants:</span>
                    <span className="font-medium">{viewingPolicy.coveredDependents}</span>
                  </div>
                )}
                {viewingPolicy.notes && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Notes:</span>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5">{viewingPolicy.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setViewingPolicy(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs"
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
