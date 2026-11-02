'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ClaimsDashboardPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'CLAIMS' | 'PROVIDERS' | 'NEW_CLAIM'>('CLAIMS');

  const [newClaimForm, setNewClaimForm] = useState({
    patientId: '',
    claimType: 'CASHLESS',
    amountClaimed: '',
    insuranceProviderId: '',
    remarks: '',
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/claims`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/claims/providers`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/claims/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([claimsData, providersData, analData]) => {
        setClaims(Array.isArray(claimsData) ? claimsData : []);
        setProviders(Array.isArray(providersData) ? providersData : []);
        setAnalytics(analData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    await fetch(`${apiUrl}/claims/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...newClaimForm,
        amountClaimed: Number(newClaimForm.amountClaimed),
      }),
    });

    setNewClaimForm({
      patientId: '',
      claimType: 'CASHLESS',
      amountClaimed: '',
      insuranceProviderId: '',
      remarks: '',
    });
    setActiveTab('CLAIMS');
    loadData();
  };

  const handleApproveClaim = async (id: string, amount: number) => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    await fetch(`${apiUrl}/claims/${id}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amountApproved: amount, remarks: 'Authorized by Hospital Finance' }),
    });
    loadData();
  };

  const handleSettlePayment = async (id: string, amount: number) => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    await fetch(`${apiUrl}/claims/${id}/payment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amountPaid: amount,
        paymentMethod: 'INSURANCE_NEFT',
        referenceNumber: `TPA-SETTLE-${Date.now().toString().slice(-6)}`,
      }),
    });
    loadData();
  };

  const stats = analytics || {
    claimsSubmittedToday: 6,
    claimsApproved: 22,
    claimsRejected: 2,
    amountClaimed: 168400,
    amountApproved: 151200,
    amountPaid: 138000,
    outstandingRevenue: 13200,
    averageSettlementDays: 2.8,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider rounded-full">
              RCM & INSURANCE PLATFORM
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Revenue Cycle & Insurance Claims</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise Cashless & Reimbursement claims engine, TPA pre-authorizations, policy verifications, and settlement reconciliation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('NEW_CLAIM')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow transition"
          >
            + New Insurance Claim
          </button>
          <Link href="/dashboard/billing" className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
            💳 Hospital Invoices
          </Link>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Submitted Today</div>
          <div className="text-2xl font-black text-blue-600">{stats.claimsSubmittedToday}</div>
          <div className="text-[11px] text-slate-500">Active TPA submissions</div>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Claims Approved</div>
          <div className="text-2xl font-black text-emerald-600">{stats.claimsApproved}</div>
          <div className="text-[11px] text-emerald-600 font-bold">{stats.settlementRatePercentage || '89.2'}% approval rate</div>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Amount Claimed</div>
          <div className="text-2xl font-black text-slate-900">${stats.amountClaimed.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500">Approved: ${stats.amountApproved.toLocaleString()}</div>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Outstanding AR</div>
          <div className="text-2xl font-black text-rose-600">${stats.outstandingRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500">Avg Settlement: {stats.averageSettlementDays} days</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('CLAIMS')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition ${
            activeTab === 'CLAIMS' ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Claims Roster ({claims.length})
        </button>
        <button
          onClick={() => setActiveTab('PROVIDERS')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition ${
            activeTab === 'PROVIDERS' ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Insurance Payors ({providers.length})
        </button>
        <button
          onClick={() => setActiveTab('NEW_CLAIM')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition ${
            activeTab === 'NEW_CLAIM' ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Create New Claim
        </button>
      </div>

      {/* TAB CONTENT: NEW CLAIM */}
      {activeTab === 'NEW_CLAIM' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 max-w-2xl">
          <h2 className="text-base font-extrabold text-slate-900">📝 Create Insurance Claim Dossier</h2>
          <form onSubmit={handleCreateClaim} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">Patient ID</label>
              <input
                type="text"
                required
                value={newClaimForm.patientId}
                onChange={(e) => setNewClaimForm({ ...newClaimForm, patientId: e.target.value })}
                placeholder="UUID or Patient Identifier"
                className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Claim Type</label>
                <select
                  value={newClaimForm.claimType}
                  onChange={(e) => setNewClaimForm({ ...newClaimForm, claimType: e.target.value })}
                  className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="CASHLESS">Cashless Hospitalization</option>
                  <option value="REIMBURSEMENT">Patient Reimbursement</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Claim Amount ($)</label>
                <input
                  type="number"
                  required
                  value={newClaimForm.amountClaimed}
                  onChange={(e) => setNewClaimForm({ ...newClaimForm, amountClaimed: e.target.value })}
                  placeholder="e.g. 15000"
                  className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">Insurance Provider</label>
              <select
                value={newClaimForm.insuranceProviderId}
                onChange={(e) => setNewClaimForm({ ...newClaimForm, insuranceProviderId: e.target.value })}
                className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Insurance Provider...</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name || p.providerName} ({p.code || 'INS'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">Clinical & Diagnosis Remarks</label>
              <textarea
                value={newClaimForm.remarks}
                onChange={(e) => setNewClaimForm({ ...newClaimForm, remarks: e.target.value })}
                rows={3}
                placeholder="Pre-auth admission notes, diagnosis summary..."
                className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow transition"
            >
              Submit Claim Dossier →
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT: PROVIDERS */}
      {activeTab === 'PROVIDERS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {providers.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full uppercase">
                  {p.code || 'INS-PAYOR'}
                </span>
                <span className="text-xs font-bold text-emerald-600">EMPANELLED</span>
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">{p.name || p.providerName}</h3>
                <div className="text-xs text-slate-500 mt-1">Contact: {p.contactPerson || 'TPA Desk'}</div>
                <div className="text-xs text-slate-500">Email: {p.email || p.claimEmail || 'claims@payor.com'}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-600">
                <div className="font-bold text-slate-800">Pre-Auth Adjudication Policy</div>
                <div>{p.policyValidationRules || 'Standard Cashless Adjudication SLA: 2 Hours'}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: CLAIMS ROSTER */}
      {activeTab === 'CLAIMS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">Insurance Claims Adjudication Ledger</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-black text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Claim #</th>
                  <th className="py-3 px-4">Patient / Payor</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount Claimed</th>
                  <th className="py-3 px-4">Approved</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">Loading claims ledger...</td>
                  </tr>
                ) : claims.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">No active insurance claims found.</td>
                  </tr>
                ) : (
                  claims.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">#{c.claimNumber}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {c.patient?.user ? `${c.patient.user.firstName} ${c.patient.user.lastName}` : 'Patient Profile'}
                        </div>
                        <div className="text-[11px] text-slate-400">{c.provider?.name || c.provider?.providerName || 'Star Health'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full">
                          {c.claimType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">${(c.amountClaimed || c.claimAmount || 0).toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">${(c.amountApproved || c.approvedAmount || 0).toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-bold text-blue-600">${(c.amountPaid || 0).toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase ${
                            c.status === 'APPROVED' || c.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {c.status || c.claimStatus || 'DRAFT'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {c.status === 'SUBMITTED' && (
                          <button
                            onClick={() => handleApproveClaim(c.id, c.amountClaimed || 15000)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition"
                          >
                            Approve
                          </button>
                        )}
                        {(c.status === 'APPROVED' || c.status === 'PARTIALLY_APPROVED') && (
                          <button
                            onClick={() => handleSettlePayment(c.id, c.amountApproved || 15000)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition"
                          >
                            Settle Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
