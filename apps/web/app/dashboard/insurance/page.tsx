'use client';

import React, { useEffect, useState } from 'react';

export default function InsuranceClaimsDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'claims' | 'policies' | 'providers' | 'preauth' | 'queries'>('claims');

  // New Claim Modal State
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimPatientId, setClaimPatientId] = useState('');
  const [claimProviderId, setClaimProviderId] = useState('');
  const [claimPolicyId, setClaimPolicyId] = useState('');
  const [claimAmount, setClaimAmount] = useState('4500');
  const [claimType, setClaimType] = useState('CASHLESS');
  const [claimRemarks, setClaimRemarks] = useState('Cashless planned surgical procedure');

  // New Policy Modal State
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyPatientId, setPolicyPatientId] = useState('');
  const [policyProviderId, setPolicyProviderId] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [memberId, setMemberId] = useState('');
  const [coverageAmount, setCoverageAmount] = useState('50000');
  const [validTill, setValidTill] = useState('2028-12-31');

  // New Provider Modal State
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [providerName, setProviderName] = useState('Star Health & Allied Insurance TPA');
  const [providerCode, setProviderCode] = useState('TPA-STAR-01');
  const [contactEmail, setContactEmail] = useState('claims@starhealth.in');
  const [contactPhone, setContactPhone] = useState('+91 1800-425-2255');

  // Query & Settlement Modals
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleAmount, setSettleAmount] = useState('');
  const [paymentRef, setPaymentRef] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/insurance/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/insurance/claims`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/insurance/policies`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/insurance/providers`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([anal, clms, pols, provs]) => {
        setAnalytics(anal);
        setClaims(Array.isArray(clms) ? clms : []);
        setPolicies(Array.isArray(pols) ? pols : []);
        setProviders(Array.isArray(provs) ? provs : []);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/insurance/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: claimPatientId,
          insuranceProviderId: claimProviderId || undefined,
          policyId: claimPolicyId || undefined,
          totalClaimAmount: Number(claimAmount),
          claimType,
          remarks: claimRemarks,
        }),
      });

      if (res.ok) {
        alert('Insurance claim draft created successfully!');
        setShowClaimModal(false);
        setClaimPatientId('');
        loadData();
      } else {
        const err = await res.json();
        alert(`Failed to create claim: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/insurance/policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: policyPatientId,
          insuranceProviderId: policyProviderId || providers[0]?.id,
          policyNumber,
          memberId,
          coverageAmount: Number(coverageAmount),
          validTill,
        }),
      });

      if (res.ok) {
        alert('Insurance policy enrolled successfully!');
        setShowPolicyModal(false);
        setPolicyPatientId('');
        setPolicyNumber('');
        loadData();
      } else {
        const err = await res.json();
        alert(`Failed to create policy: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/insurance/providers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          providerName,
          providerCode,
          contactEmail,
          contactPhone,
        }),
      });

      if (res.ok) {
        alert('TPA Provider added to directory!');
        setShowProviderModal(false);
        loadData();
      } else {
        const err = await res.json();
        alert(`Failed to add provider: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handlePreauth = async (claimId: string) => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/insurance/claims/${claimId}/preauth`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert('Pre-authorization transmitted to TPA!');
        loadData();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleSubmitClaim = async (claimId: string) => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/insurance/claims/${claimId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ remarks: 'Compiled clinical package submitted' }),
      });
      if (res.ok) {
        alert('Claim package submitted with digital supporting attachments!');
        loadData();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleApprove = async (claimId: string, amount: number) => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/insurance/claims/${claimId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approvedAmount: amount, remarks: 'Full approval granted by TPA' }),
      });
      if (res.ok) {
        alert('Claim approved by TPA!');
        loadData();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token || !selectedClaim) return;

    try {
      const res = await fetch(`${apiUrl}/insurance/claims/${selectedClaim.id}/settle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          approvedAmount: Number(settleAmount),
          paymentReference: paymentRef,
          notes: 'Remittance processed via NEFT/RTGS',
        }),
      });

      if (res.ok) {
        alert('Claim marked settled with remittance details!');
        setShowSettleModal(false);
        setSelectedClaim(null);
        loadData();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const a = analytics || {
    totalClaims: 24,
    approvedClaims: 18,
    rejectedClaims: 2,
    pendingClaims: 4,
    settlementValue: 84500,
    avgApprovalTime: '2.4 Hours',
    cashlessAdmissions: 20,
    approvalRate: '88.5%',
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-blue-500/30">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-black uppercase tracking-wider">
              🏥 INSURANCE CLAIMS & TPA WORKSTATION
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-400/20 text-emerald-300 rounded-full text-[10px] font-bold">
              CASHLESS & REIMBURSEMENT
            </span>
          </div>
          <h1 className="text-3xl font-black mt-2 tracking-tight">Insurance Claims & TPA Adjudication Engine</h1>
          <p className="text-blue-100 text-sm mt-1 max-w-2xl">
            Streamlined cashless pre-authorization, automated digital claim package compilation, TPA query tracking, and electronic settlement reconciliation.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowProviderModal(true)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition"
          >
            🏢 Add TPA Provider
          </button>
          <button
            onClick={() => setShowPolicyModal(true)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition"
          >
            📑 Enroll Policy
          </button>
          <button
            onClick={() => setShowClaimModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg transition"
          >
            ➕ New Claim Docket
          </button>
        </div>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Total Claims</div>
          <div className="text-2xl font-black text-slate-900">{a.totalClaims}</div>
          <div className="text-[10px] text-slate-500 font-medium">Claims Submitted</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Approved</div>
          <div className="text-2xl font-black text-emerald-600">{a.approvedClaims}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">{a.approvalRate} Pass Rate</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Pending Preauth</div>
          <div className="text-2xl font-black text-amber-600">{a.pendingClaims}</div>
          <div className="text-[10px] text-amber-600 font-semibold">Under TPA Review</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Settlement Value</div>
          <div className="text-2xl font-black text-blue-600">${a.settlementValue.toLocaleString()}</div>
          <div className="text-[10px] text-blue-600 font-semibold">Remittance Paid</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Cashless Admits</div>
          <div className="text-2xl font-black text-indigo-600">{a.cashlessAdmissions}</div>
          <div className="text-[10px] text-indigo-600 font-semibold">IPD Pre-Approved</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Avg Turnaround</div>
          <div className="text-2xl font-black text-slate-800">{a.avgApprovalTime}</div>
          <div className="text-[10px] text-slate-500 font-medium">TPA Response</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'claims' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📂 All Claims ({claims.length})
        </button>
        <button
          onClick={() => setActiveTab('preauth')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'preauth' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ⚡ Pre-Authorization Tracker
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'policies' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📑 Policy Registry ({policies.length})
        </button>
        <button
          onClick={() => setActiveTab('providers')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'providers' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🏢 TPA & Payor Directory ({providers.length})
        </button>
      </div>

      {/* Tab 1: Claims List */}
      {activeTab === 'claims' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Insurance Claims Adjudication Queue
            </h3>
            <span className="text-xs text-slate-400 font-bold">Real-time settlement status</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-3">Claim #</th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">TPA Insurer</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Claim Amount</th>
                  <th className="py-3 px-3">Approved</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {claims.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No insurance claims found in this facility. Click &quot;New Claim Docket&quot; to initialize.
                    </td>
                  </tr>
                ) : (
                  claims.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">{c.claimNumber}</td>
                      <td className="py-3 px-3 font-extrabold text-slate-900">
                        {c.patient?.user?.firstName} {c.patient?.user?.lastName}
                      </td>
                      <td className="py-3 px-3 text-slate-700">{c.provider?.providerName || 'Star Health TPA'}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-md">
                          {c.claimType}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-black text-slate-900">${c.totalClaimAmount?.toLocaleString()}</td>
                      <td className="py-3 px-3 font-bold text-emerald-700">${c.approvedAmount?.toLocaleString() || '0'}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            c.status === 'SETTLED'
                              ? 'bg-blue-100 text-blue-800'
                              : c.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'PREAUTH_PENDING' || c.status === 'CLAIM_SUBMITTED'
                              ? 'bg-amber-100 text-amber-800'
                              : c.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5">
                        {c.status === 'DRAFT' && (
                          <>
                            <button
                              onClick={() => handlePreauth(c.id)}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg shadow"
                            >
                              ⚡ Preauth
                            </button>
                            <button
                              onClick={() => handleSubmitClaim(c.id)}
                              className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white font-bold text-[10px] rounded-lg shadow"
                            >
                              📤 Submit
                            </button>
                          </>
                        )}
                        {(c.status === 'CLAIM_SUBMITTED' || c.status === 'PREAUTH_PENDING' || c.status === 'UNDER_REVIEW') && (
                          <button
                            onClick={() => handleApprove(c.id, c.totalClaimAmount)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded-lg shadow"
                          >
                            ✓ Approve
                          </button>
                        )}
                        {c.status === 'APPROVED' && (
                          <button
                            onClick={() => {
                              setSelectedClaim(c);
                              setSettleAmount(String(c.approvedAmount || c.totalClaimAmount));
                              setPaymentRef(`EFT-TPA-${Date.now().toString().slice(-6)}`);
                              setShowSettleModal(true);
                            }}
                            className="px-2.5 py-1 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-[10px] rounded-lg shadow"
                          >
                            💳 Settle
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

      {/* Tab 2: Pre-Authorization Tracker */}
      {activeTab === 'preauth' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
            Cashless Pre-Authorization Gateway
          </h3>
          <p className="text-xs text-slate-500">
            Track urgent pre-approval requests submitted to TPA desks prior to planned IPD procedures and emergency admissions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {claims
              .filter((c) => c.status === 'PREAUTH_PENDING' || c.status === 'DRAFT')
              .map((c) => (
                <div key={c.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-blue-700">{c.claimNumber}</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
                      {c.status}
                    </span>
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    {c.patient?.user?.firstName} {c.patient?.user?.lastName}
                  </div>
                  <div className="text-xs text-slate-600">Total: ${c.totalClaimAmount?.toLocaleString()}</div>
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => handlePreauth(c.id)}
                      className="w-full py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-black rounded-xl shadow"
                    >
                      ⚡ Transmit Preauth
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 3: Policies */}
      {activeTab === 'policies' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Enrolled Health Insurance Policies
            </h3>
            <button
              onClick={() => setShowPolicyModal(true)}
              className="px-3 py-1.5 bg-blue-700 text-white text-xs font-black rounded-xl"
            >
              ➕ Enroll Policy
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-3">Policy #</th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">TPA Insurer</th>
                  <th className="py-3 px-3">Coverage Limit</th>
                  <th className="py-3 px-3">Utilized</th>
                  <th className="py-3 px-3">Valid Till</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {policies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No active insurance policies enrolled. Click &quot;Enroll Policy&quot; to link patient coverage.
                    </td>
                  </tr>
                ) : (
                  policies.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{p.policyNumber}</td>
                      <td className="py-3 px-3 font-extrabold text-slate-900">
                        {p.patient?.user?.firstName} {p.patient?.user?.lastName}
                      </td>
                      <td className="py-3 px-3 text-slate-700">{p.provider?.providerName}</td>
                      <td className="py-3 px-3 font-black text-slate-900">${p.coverageAmount?.toLocaleString()}</td>
                      <td className="py-3 px-3 font-bold text-amber-700">${p.utilizedAmount?.toLocaleString() || '0'}</td>
                      <td className="py-3 px-3 text-slate-500">{new Date(p.validTill).toLocaleDateString()}</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                          {p.policyStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Providers */}
      {activeTab === 'providers' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Third-Party Administrators (TPA) & Payor Directory
            </h3>
            <button
              onClick={() => setShowProviderModal(true)}
              className="px-3 py-1.5 bg-blue-700 text-white text-xs font-black rounded-xl"
            >
              ➕ Add TPA Payor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {providers.map((pr) => (
              <div key={pr.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-black">
                    {pr.providerCode || pr.code || 'TPA'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">✓ ACTIVE PAYOR</span>
                </div>
                <div className="font-black text-sm text-slate-900">{pr.providerName || pr.name}</div>
                <div className="text-xs text-slate-500">📧 {pr.contactEmail || pr.email || 'claims@tpa.com'}</div>
                <div className="text-xs text-slate-500">📞 {pr.contactPhone || pr.phone || '+91 1800-425-2255'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: New Claim Docket */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Initialize Insurance Claim Docket</h3>
            <form onSubmit={handleCreateClaim} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Patient ID *</label>
                <input
                  required
                  placeholder="Patient UUID"
                  value={claimPatientId}
                  onChange={(e) => setClaimPatientId(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label>Total Claim Amount ($) *</label>
                <input
                  type="number"
                  required
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Claim Type</label>
                <select
                  value={claimType}
                  onChange={(e) => setClaimType(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="CASHLESS">Cashless Hospitalization</option>
                  <option value="REIMBURSEMENT">Reimbursement</option>
                </select>
              </div>
              <div>
                <label>Remarks</label>
                <input
                  value={claimRemarks}
                  onChange={(e) => setClaimRemarks(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl font-black shadow"
                >
                  Create Claim Docket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enroll Policy */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Enroll Health Insurance Policy</h3>
            <form onSubmit={handleCreatePolicy} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Patient ID *</label>
                <input
                  required
                  placeholder="Patient UUID"
                  value={policyPatientId}
                  onChange={(e) => setPolicyPatientId(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label>Policy Number *</label>
                <input
                  required
                  placeholder="e.g. POL-STAR-992810"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Member ID / Card No.</label>
                <input
                  placeholder="e.g. MEM-00492"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Coverage Sum Insured ($) *</label>
                <input
                  type="number"
                  required
                  value={coverageAmount}
                  onChange={(e) => setCoverageAmount(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Valid Till *</label>
                <input
                  type="date"
                  required
                  value={validTill}
                  onChange={(e) => setValidTill(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPolicyModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl font-black shadow"
                >
                  Enroll Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Provider */}
      {showProviderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Add TPA / Insurance Payor</h3>
            <form onSubmit={handleCreateProvider} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>TPA / Payor Name *</label>
                <input
                  required
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Provider Code</label>
                <input
                  value={providerCode}
                  onChange={(e) => setProviderCode(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label>Contact Email</label>
                <input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Contact Phone</label>
                <input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowProviderModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl font-black shadow"
                >
                  Save Provider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Settle Claim */}
      {showSettleModal && selectedClaim && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Record TPA Remittance Settlement</h3>
            <p className="text-xs text-slate-500 font-medium">
              Claim #{selectedClaim.claimNumber} • Approved: ${selectedClaim.approvedAmount?.toLocaleString()}
            </p>
            <form onSubmit={handleSettle} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Settlement Amount ($) *</label>
                <input
                  type="number"
                  required
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Payment Reference / UTR Number *</label>
                <input
                  required
                  placeholder="e.g. UTR-NEFT-8829104"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSettleModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-black shadow"
                >
                  Authorize Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
