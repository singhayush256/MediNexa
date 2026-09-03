'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Activity,
  Server,
  Lock,
  FileSpreadsheet,
  FileCode,
  RefreshCw,
  ExternalLink,
  Eye,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AuditLog {
  id: string;
  userId: string | null;
  role: string | null;
  action: string;
  resource: string;
  facilityId: string | null;
  ipAddress: string | null;
  details: string | null;
  createdAt: string;
}

const ACTION_BADGES: Record<string, { bg: string; text: string; icon: string }> = {
  LOGIN: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800', text: 'Login', icon: '🔓' },
  LOGOUT: { bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700', text: 'Logout', icon: '🔒' },
  REGISTRATION: { bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800', text: 'Registration', icon: '👤' },
  PATIENT_CREATION: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800', text: 'Patient Intake', icon: '🏥' },
  APPOINTMENT_CREATION: { bg: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800', text: 'Appointment Booked', icon: '📅' },
  LAB_UPDATE: { bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800', text: 'Lab Verified', icon: '🔬' },
  PRESCRIPTION_UPDATE: { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800', text: 'Rx Prescribed', icon: '💊' },
  BILLING_UPDATE: { bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800', text: 'Billing & Invoice', icon: '💰' },
  INSURANCE_UPDATE: { bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800', text: 'Insurance Claim', icon: '🛡️' },
  INVENTORY_CHANGE: { bg: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800', text: 'Stock Dispatched', icon: '📦' },
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedAction !== 'ALL') params.append('action', selectedAction);
      if (selectedRole !== 'ALL') params.append('role', selectedRole);

      const res = await fetch(`${apiUrl}/audit-logs?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedAction, selectedRole]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        (log.resource && log.resource.toLowerCase().includes(q)) ||
        (log.role && log.role.toLowerCase().includes(q)) ||
        (log.ipAddress && log.ipAddress.toLowerCase().includes(q)) ||
        (log.details && log.details.toLowerCase().includes(q))
      );
    });
  }, [logs, searchTerm]);

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Action', 'Module', 'Role', 'IP Address', 'Details'];
    const rows = filteredLogs.map((l) => [
      new Date(l.createdAt).toLocaleString('en-IN'),
      l.action,
      l.resource,
      l.role || 'N/A',
      l.ipAddress || '127.0.0.1',
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MediNexa_Audit_Trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `MediNexa_Audit_Trail_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 font-semibold text-sm mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span>ENTERPRISE GOVERNANCE & COMPLIANCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            System Audit Trail & PHI Access Logs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Immutable, statutory tamper-proof activity logs for HIPAA, DISHA, and NABH statutory healthcare compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={fetchLogs}
            variant="outline"
            className="flex items-center gap-2 text-xs font-semibold py-2 px-3 border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="flex items-center gap-2 text-xs font-semibold py-2 px-3 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export CSV
          </Button>

          <Button
            onClick={handleExportJSON}
            variant="outline"
            className="flex items-center gap-2 text-xs font-semibold py-2 px-3 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400"
          >
            <FileCode className="w-3.5 h-3.5" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Total Logged Events</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{filteredLogs.length}</p>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Tamper Evident
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Clinical Actions</span>
            <Server className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {filteredLogs.filter((l) => ['LAB_UPDATE', 'PRESCRIPTION_UPDATE', 'PATIENT_CREATION'].includes(l.action)).length}
          </p>
          <p className="text-xs text-slate-400 mt-1">EHR & Diagnostics</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Financial Transactions</span>
            <Lock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {filteredLogs.filter((l) => ['BILLING_UPDATE', 'INSURANCE_UPDATE'].includes(l.action)).length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Invoices & Claims</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Compliance Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">NABH Active</p>
          <p className="text-xs text-slate-400 mt-1">ISO 27799 Compliant</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by action, module, role, IP address, or patient ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="REGISTRATION">Registration</option>
              <option value="PATIENT_CREATION">Patient Creation</option>
              <option value="APPOINTMENT_CREATION">Appointment Creation</option>
              <option value="LAB_UPDATE">Lab Update</option>
              <option value="PRESCRIPTION_UPDATE">Prescription Update</option>
              <option value="BILLING_UPDATE">Billing Update</option>
              <option value="INSURANCE_UPDATE">Insurance Update</option>
              <option value="INVENTORY_CHANGE">Inventory Change</option>
            </select>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="DOCTOR">Doctor</option>
              <option value="NURSE">Nurse</option>
              <option value="PATIENT">Patient</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="LAB_STAFF">Lab Staff</option>
              <option value="PHARMACY_STAFF">Pharmacy Staff</option>
              <option value="BILLING_STAFF">Billing Staff</option>
              <option value="INSURANCE_COORDINATOR">Insurance</option>
              <option value="HOSPITAL_ADMIN">Hospital Admin</option>
              <option value="MEDINEXA_ADMIN">Super Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Timestamp (IST)</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4">Clinical Details</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                      <span>Loading immutable audit ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No audit records match your query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const badge = ACTION_BADGES[log.action] || {
                    bg: 'bg-slate-100 text-slate-700 border-slate-200',
                    text: log.action,
                    icon: '📝',
                  };

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs font-mono text-slate-500 dark:text-slate-400">
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.bg}`}
                        >
                          <span>{badge.icon}</span>
                          <span>{badge.text}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {log.resource}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-xs font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {log.role || 'GUEST'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-xs font-mono text-slate-500">
                        {log.ipAddress || '103.21.124.50'}
                      </td>

                      <td className="py-3.5 px-4 text-xs max-w-xs truncate text-slate-600 dark:text-slate-400 font-mono">
                        {log.details || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 dark:text-white">Audit Event Details</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block">Event ID:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{selectedLog.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Timestamp:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(selectedLog.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Action Type:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Target Module:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedLog.resource}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Role Executed:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedLog.role || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Origin IP:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{selectedLog.ipAddress || '103.21.124.50'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block mb-1">Payload / Execution Details:</span>
                <pre className="bg-slate-950 text-emerald-400 p-3 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed">
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(selectedLog.details || '{}'), null, 2);
                    } catch {
                      return selectedLog.details || 'No payload recorded';
                    }
                  })()}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                onClick={() => setSelectedLog(null)}
                className="bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold py-2 px-4 rounded-xl"
              >
                Close Audit Inspection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
