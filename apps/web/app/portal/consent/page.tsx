'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Clock,
  Building2,
  FileText,
  Calendar,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

export default function PatientConsentCenterPage() {
  const [consents, setConsents] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchConsents = async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [consentsRes, logsRes] = await Promise.all([
        fetch(`${apiUrl}/abdm/consents`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/abdm/audit-logs`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (consentsRes.ok) {
        const data = await consentsRes.json();
        setConsents(Array.isArray(data) ? data : []);
      }
      if (logsRes.ok) {
        const data = await logsRes.json();
        setAuditLogs(Array.isArray(data) ? data : []);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsents();
  }, []);

  const handleApprove = async (consentId: string) => {
    setActionLoading(consentId);
    setMessage(null);
    try {
      const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

      const res = await fetch(`${apiUrl}/abdm/consent/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ consentId, validDays: 30 }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to grant consent');
      }

      setMessage({ type: 'success', text: 'Consent successfully granted for 30 days under ABDM guidelines.' });
      await fetchConsents();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error granting consent' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (consentId: string) => {
    setActionLoading(consentId);
    setMessage(null);
    try {
      const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

      const res = await fetch(`${apiUrl}/abdm/consent/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ consentId, reason: 'Patient declined record sharing' }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to reject consent');
      }

      setMessage({ type: 'success', text: 'Consent request rejected. Your health records remain private.' });
      await fetchConsents();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error rejecting consent' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (consentId: string) => {
    if (!confirm('Are you sure you want to revoke this consent? Health data sharing will be immediately halted.')) return;
    setActionLoading(consentId);
    setMessage(null);
    try {
      const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

      const res = await fetch(`${apiUrl}/abdm/consent/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ consentId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to revoke consent');
      }

      setMessage({ type: 'success', text: 'Consent explicitly revoked. Access terminated across national ABDM gateway.' });
      await fetchConsents();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error revoking consent' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/portal" className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portal</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              ABDM Consent Center
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1 border border-blue-500/20">
                Ayushman Bharat Digital Mission (ABDM)
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Health Data Consent & Privacy Center
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                You have sovereign control over your electronic health records. Under National Digital Health guidelines, no hospital, lab, or doctor can access your history without your explicit, revocable consent.
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Message */}
        {message && (
          <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Consents List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active & Pending Consent Requests</CardTitle>
                <CardDescription>Grant, reject, or revoke authorizations for hospital clinical encounters</CardDescription>
              </div>
              <Button onClick={fetchConsents} variant="outline" size="sm" className="text-xs">
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading consent artefacts...</div>
            ) : consents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-slate-500" />
                <p className="font-semibold text-slate-300">No active consent requests pending.</p>
                <p className="text-[11px] mt-1">When doctors or clinical wards request your electronic records, they will appear here for your one-click authorization.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {consents.map((consent) => {
                  const isApproved = consent.status === 'APPROVED';
                  const isRevoked = consent.status === 'REVOKED';
                  const isDenied = consent.status === 'DENIED';
                  const isRequested = consent.status === 'REQUESTED';
                  const isLoading = actionLoading === consent.id;

                  return (
                    <div
                      key={consent.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            #{consent.consentReference}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isApproved
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isRevoked
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : isDenied
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {consent.status}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {consent.purpose}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span>Facility: {consent.facility?.name || 'MediNexa Sector 62'}</span>
                          <span>•</span>
                          <span>Requested: {new Date(consent.createdAt).toLocaleDateString('en-IN')}</span>
                          {consent.expiresAt && (
                            <>
                              <span>•</span>
                              <span>Expires: {new Date(consent.expiresAt).toLocaleDateString('en-IN')}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {isRequested && (
                          <>
                            <Button
                              onClick={() => handleApprove(consent.id)}
                              disabled={isLoading}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Grant Consent
                            </Button>
                            <Button
                              onClick={() => handleReject(consent.id)}
                              disabled={isLoading}
                              variant="outline"
                              size="sm"
                              className="border-rose-500/40 text-rose-400 hover:bg-rose-950/30 text-xs"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}

                        {isApproved && (
                          <Button
                            onClick={() => handleRevoke(consent.id)}
                            disabled={isLoading}
                            variant="outline"
                            size="sm"
                            className="border-amber-500/40 text-amber-400 hover:bg-amber-950/30 text-xs font-semibold"
                          >
                            <RotateCcw className="h-3.5 w-3.5 mr-1" />
                            Revoke Consent
                          </Button>
                        )}

                        {(isRevoked || isDenied) && (
                          <span className="text-[11px] text-slate-400 italic">
                            Authorization Terminated
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ABDM Audit Trail */}
        <Card>
          <CardHeader>
            <CardTitle>ABDM Immutable Audit Trail</CardTitle>
            <CardDescription>Tamper-evident logs of all digital consent approvals, revocations, and health record transmissions</CardDescription>
          </CardHeader>
          <CardContent>
            {auditLogs.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No recent ABDM audit logs recorded.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {auditLogs.slice(0, 15).map((log) => (
                  <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.performedAt).toLocaleTimeString('en-IN')}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                        {log.details}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                      {new Date(log.performedAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
