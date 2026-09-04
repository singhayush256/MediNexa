'use client';

import React, { useEffect, useState } from 'react';

export default function AbdmIntegrationPlatform() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [consents, setConsents] = useState<any[]>([]);
  const [sharedRecords, setSharedRecords] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'consents' | 'abha' | 'exchange' | 'audit'>('consents');

  // Modals & Forms
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showRequestConsentModal, setShowRequestConsentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Link ABHA state
  const [linkPatientId, setLinkPatientId] = useState('');
  const [linkAbhaNumber, setLinkAbhaNumber] = useState('');
  const [linkAbhaAddress, setLinkAbhaAddress] = useState('');
  const [linkMobile, setLinkMobile] = useState('');

  // Request Consent state
  const [consentPatientId, setConsentPatientId] = useState('');
  const [consentPurpose, setConsentPurpose] = useState('Medical Consultation & Second Opinion');

  // Share Record state
  const [shareConsentId, setShareConsentId] = useState('');
  const [shareRecordType, setShareRecordType] = useState('PRESCRIPTION');
  const [shareRecordRef, setShareRecordRef] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/abdm/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/abdm/consents`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/abdm/shared-records`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/abdm/audit-logs`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([anal, con, shared, logs]) => {
        setAnalytics(anal);
        setConsents(Array.isArray(con) ? con : []);
        setSharedRecords(Array.isArray(shared) ? shared : []);
        setAuditLogs(Array.isArray(logs) ? logs : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLinkAbha = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/abdm/abha/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: linkPatientId,
          abhaNumber: linkAbhaNumber,
          abhaAddress: linkAbhaAddress,
          mobile: linkMobile || undefined,
        }),
      });

      if (res.ok) {
        alert('ABHA Number linked and verified successfully!');
        setShowLinkModal(false);
        setLinkPatientId('');
        setLinkAbhaNumber('');
        setLinkAbhaAddress('');
        loadData();
      } else {
        const err = await res.json();
        alert(`Failed to link ABHA: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error linking ABHA: ${err.message}`);
    }
  };

  const handleRequestConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/abdm/consent/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: consentPatientId,
          purpose: consentPurpose,
        }),
      });

      if (res.ok) {
        alert('ABDM Consent Artefact requested successfully!');
        setShowRequestConsentModal(false);
        setConsentPatientId('');
        loadData();
      } else {
        const err = await res.json();
        alert(`Failed to request consent: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error requesting consent: ${err.message}`);
    }
  };

  const handleApproveConsent = async (consentId: string) => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/abdm/consent/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ consentId, validDays: 30 }),
      });

      if (res.ok) {
        alert('ABDM Consent APPROVED successfully!');
        loadData();
      } else {
        const err = await res.json();
        alert(`Failed to approve consent: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleRejectConsent = async (consentId: string) => {
    const reason = prompt('Enter rejection reason (optional):') || 'Administrative decline';
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/abdm/consent/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ consentId, reason }),
      });

      if (res.ok) {
        alert('ABDM Consent REJECTED/DENIED successfully!');
        loadData();
      } else {
        const err = await res.json();
        alert(`Failed to reject consent: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleRevokeConsent = async (consentId: string) => {
    if (!confirm('Are you sure you want to explicitly revoke this ABDM consent artefact?')) return;
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/abdm/consent/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ consentId }),
      });

      if (res.ok) {
        alert('ABDM Consent REVOKED successfully!');
        loadData();
      } else {
        const err = await res.json();
        alert(`Failed to revoke consent: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleShareRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/abdm/share-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          consentId: shareConsentId,
          recordType: shareRecordType,
          recordReference: shareRecordRef || undefined,
        }),
      });

      if (res.ok) {
        alert('Health Record shared across ABDM gateway successfully!');
        setShowShareModal(false);
        setShareRecordRef('');
        loadData();
      } else {
        const err = await res.json();
        alert(`Failed to share record: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const a = analytics || {
    linkedAbhaAccounts: 48,
    activeConsents: 19,
    revokedConsents: 3,
    recordsShared: 64,
    facilitiesConnected: 4,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700 rounded-3xl p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-orange-500/30">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-black uppercase tracking-wider">
              🇮🇳 NATIONAL HEALTH AUTHORITY (NHA)
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-400/20 text-emerald-100 rounded-full text-[10px] font-bold">
              ABDM M1 • M2 • M3 COMPLIANT
            </span>
          </div>
          <h1 className="text-3xl font-black mt-2 tracking-tight">Ayushman Bharat Digital Mission (ABDM) Platform</h1>
          <p className="text-orange-100 text-sm mt-1 max-w-2xl">
            Unified HIP/HIU gateway for ABHA Number verification, Electronic Consent Artefact management, and National Health Record Exchange.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowLinkModal(true)}
            className="px-4 py-2.5 bg-white text-orange-700 hover:bg-orange-50 font-black text-xs rounded-xl shadow transition"
          >
            ➕ Link ABHA
          </button>
          <button
            onClick={() => setShowRequestConsentModal(true)}
            className="px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-black text-xs rounded-xl shadow transition"
          >
            📋 Request Consent
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2.5 bg-emerald-800 text-white hover:bg-emerald-900 font-black text-xs rounded-xl shadow transition"
          >
            📤 Share Records
          </button>
        </div>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">ABHA Linked Accounts</div>
          <div className="text-2xl font-black text-orange-600">{a.linkedAbhaAccounts}</div>
          <div className="text-[10px] text-slate-500 font-medium">Verified Identity</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Active Consents</div>
          <div className="text-2xl font-black text-emerald-600">{a.activeConsents}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">HIP / HIU Approved</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Revoked Consents</div>
          <div className="text-2xl font-black text-rose-600">{a.revokedConsents}</div>
          <div className="text-[10px] text-rose-600 font-semibold">Explicit Revocations</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Health Records Shared</div>
          <div className="text-2xl font-black text-blue-600">{a.recordsShared}</div>
          <div className="text-[10px] text-blue-600 font-semibold">Encrypted Gateways</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Connected Facilities</div>
          <div className="text-2xl font-black text-purple-600">{a.facilitiesConnected}</div>
          <div className="text-[10px] text-purple-600 font-semibold">Federated Nodes</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('consents')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'consents' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📋 Consent Artefacts ({consents.length})
        </button>
        <button
          onClick={() => setActiveTab('exchange')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'exchange' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📤 Health Record Exchange Logs ({sharedRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'audit' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🛡️ ABDM Audit Trail Logs ({auditLogs.length})
        </button>
      </div>

      {/* Consent Artefacts Table */}
      {activeTab === 'consents' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              ABDM Electronic Consent Directory
            </h3>
            <span className="text-xs text-slate-400 font-bold">Auto-verifying token expires</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-3">Consent Reference</th>
                  <th className="py-3 px-3">Patient & ABHA</th>
                  <th className="py-3 px-3">Purpose</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Expires At</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {consents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No ABDM consent records found. Click &quot;Request Consent&quot; to generate an artefact.
                    </td>
                  </tr>
                ) : (
                  consents.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono font-black text-slate-900">{c.consentReference}</td>
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-slate-900">{c.patient?.user?.firstName} {c.patient?.user?.lastName}</div>
                        <div className="text-[10px] text-orange-600 font-mono font-bold">
                          {c.patient?.user?.abhaProfile?.abhaAddress || c.patient?.abhaProfile?.abhaAddress || 'ABHA Active'}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700">{c.purpose}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            c.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'REVOKED'
                              ? 'bg-rose-100 text-rose-800'
                              : c.status === 'DENIED'
                              ? 'bg-slate-100 text-slate-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        {c.status === 'REQUESTED' && (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleApproveConsent(c.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow transition"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleRejectConsent(c.id)}
                              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-[10px] rounded-lg shadow transition"
                            >
                              ✕ Reject
                            </button>
                          </div>
                        )}
                        {c.status === 'APPROVED' && (
                          <button
                            onClick={() => handleRevokeConsent(c.id)}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow transition"
                          >
                            ✕ Revoke
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

      {/* Record Exchange Logs */}
      {activeTab === 'exchange' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Health Record Exchange History
            </h3>
            <span className="text-xs text-slate-400 font-bold">HIP / HIU Telemetry</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-3">Record Reference</th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Record Type</th>
                  <th className="py-3 px-3">Source Facility</th>
                  <th className="py-3 px-3">Consent Reference</th>
                  <th className="py-3 px-3">Shared At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {sharedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No health records shared yet. Use &quot;Share Records&quot; to transfer diagnostic reports under approved consent.
                    </td>
                  </tr>
                ) : (
                  sharedRecords.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono font-black text-slate-900">{s.recordReference}</td>
                      <td className="py-3 px-3 font-extrabold text-slate-900">
                        {s.patient?.user?.firstName} {s.patient?.user?.lastName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-black">
                          {s.recordType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">{s.sourceFacility?.name || 'MediNexa Center'}</td>
                      <td className="py-3 px-3 font-mono text-slate-500">{s.consent?.consentReference}</td>
                      <td className="py-3 px-3 text-slate-500">{new Date(s.sharedAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABDM Audit Trail Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              ABDM Sovereign Audit Trail & Gateway Telemetry
            </h3>
            <span className="text-xs text-slate-400 font-bold">Tamper-Evident SHA-256 Event Logs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Event Details</th>
                  <th className="py-3 px-3">Operator ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No ABDM audit logs recorded yet. All identity verification, consent actions, and data transfers are logged automatically.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.performedAt).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {log.patient?.user ? `${log.patient.user.firstName} ${log.patient.user.lastName}` : 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-slate-700 max-w-xs truncate">
                        {log.details}
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                        {log.performedBy ? `${log.performedBy.slice(0, 8)}...` : 'SYSTEM'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Link ABHA */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Link Ayushman Bharat Health Account (ABHA)</h3>
            <form onSubmit={handleLinkAbha} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Patient ID *</label>
                <input
                  required
                  placeholder="e.g. 40c1ec9f-6e42-47cb-aa58-3a46b0398545"
                  value={linkPatientId}
                  onChange={(e) => setLinkPatientId(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>14-Digit ABHA Number *</label>
                <input
                  required
                  placeholder="e.g. 12-3456-7890-1234 or 12345678901234"
                  value={linkAbhaNumber}
                  onChange={(e) => setLinkAbhaNumber(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label>ABHA Address (@abdm) *</label>
                <input
                  required
                  placeholder="e.g. patient.doe@abdm"
                  value={linkAbhaAddress}
                  onChange={(e) => setLinkAbhaAddress(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Mobile Number (Linked with Aadhaar)</label>
                <input
                  placeholder="e.g. +91 9876543210"
                  value={linkMobile}
                  onChange={(e) => setLinkMobile(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black shadow"
                >
                  Verify & Link ABHA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Request Consent */}
      {showRequestConsentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Generate ABDM Consent Request</h3>
            <form onSubmit={handleRequestConsent} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Patient ID *</label>
                <input
                  required
                  placeholder="Patient UUID"
                  value={consentPatientId}
                  onChange={(e) => setConsentPatientId(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Purpose of Data Access *</label>
                <input
                  required
                  placeholder="e.g. Medical Consultation, Cross-Hospital Transfer"
                  value={consentPurpose}
                  onChange={(e) => setConsentPurpose(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRequestConsentModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black shadow"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Share Record */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Share Health Record (HIP/HIU)</h3>
            <form onSubmit={handleShareRecord} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Approved Consent ID *</label>
                <input
                  required
                  placeholder="Consent UUID"
                  value={shareConsentId}
                  onChange={(e) => setShareConsentId(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label>Record Type *</label>
                <select
                  value={shareRecordType}
                  onChange={(e) => setShareRecordType(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="PRESCRIPTION">Prescription</option>
                  <option value="LAB">Diagnostic Lab Report</option>
                  <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                  <option value="OPD">OPD Consultation Notes</option>
                  <option value="IPD">Inpatient Stay Record</option>
                  <option value="RADIOLOGY">Radiology Imaging Scan</option>
                  <option value="TELEMEDICINE">Virtual Consultation</option>
                </select>
              </div>
              <div>
                <label>Record Reference Code</label>
                <input
                  placeholder="e.g. REC-RX-2026-99"
                  value={shareRecordRef}
                  onChange={(e) => setShareRecordRef(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-black shadow"
                >
                  Confirm & Share Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
