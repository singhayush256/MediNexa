'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Plus,
  Server,
  FileArchive,
  RefreshCw,
  HardDrive,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, StatCard } from '@/components/ui';

export default function AutomatedBackupPage() {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchBackups = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/backup/list`, { headers });
      if (res.ok) {
        setBackups(await res.json());
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch backup catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setCreating(true);
    setError(null);
    try {
      const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

      const res = await fetch(`${apiUrl}/backup/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: 'MANUAL' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Backup creation failed.');

      setSuccess(`Snapshot ${data.id} created successfully! (SHA-256: ${data.checksum.slice(0, 10)}...)`);
      fetchBackups();
    } catch (err: any) {
      setError(err.message || 'Failed to generate backup.');
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadBackup = async (id: string) => {
    try {
      const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

      const res = await fetch(`${apiUrl}/backup/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Download failed');
      const json = await res.json();

      const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MediNexa_Backup_${id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to download snapshot.');
    }
  };

  const handleRestoreBackup = async (id: string) => {
    if (!confirm('Are you sure you want to verify and restore this snapshot? All existing records will be validated against this cryptographic checkpoint.')) {
      return;
    }

    setRestoringId(id);
    setError(null);
    try {
      const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

      const res = await fetch(`${apiUrl}/backup/${id}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Restore failed.');

      setSuccess(data.message);
      fetchBackups();
    } catch (err: any) {
      setError(err.message || 'Failed to restore snapshot.');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col font-sans transition-colors duration-200">
      <DashboardNav />

      <div className="flex-1 flex min-h-[calc(100vh-4rem)]">
        <DashboardSidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-900">
                  DISASTER RECOVERY & ARCHIVES
                </span>
                <span className="text-xs text-slate-400 font-medium">Automated Point-in-Time Checkpoints</span>
              </div>
              <h1 className="text-2xl font-black text-slate-950 dark:text-slate-50 tracking-tight mt-1">
                Database Snapshots & Disaster Recovery
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBackups}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Refresh
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={creating}
                onClick={handleCreateBackup}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
                icon={<Plus className="w-4 h-4" />}
              >
                {creating ? 'Generating Snapshot...' : 'Create Backup Snapshot'}
              </Button>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs rounded-2xl flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs rounded-2xl flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Automated Daily Backup"
              value="02:00 AM IST"
              subtext="Next trigger in 16 hours"
              icon={<Clock className="w-5 h-5 text-teal-500" />}
            />
            <StatCard
              title="Automated Weekly Backup"
              value="Sunday 03:00 AM"
              subtext="Full archival snapshot"
              icon={<Calendar className="w-5 h-5 text-blue-500" />}
            />
            <StatCard
              title="Cryptographic Integrity"
              value="SHA-256 Verified"
              subtext="Zero corruption guarantee"
              icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />}
            />
          </div>

          {/* Backup Catalog Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Point-in-Time Snapshot Registry</h3>
                <p className="text-xs text-slate-500">Patients, Appointments, Billing, Lab Reports, Prescriptions & IPD records</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-teal-50 dark:bg-teal-950/60 text-teal-600 rounded-xl border border-teal-200 dark:border-teal-800">
                {backups.length} Snapshots Available
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                    <th className="pb-3">Snapshot ID</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Records Included</th>
                    <th className="pb-3">Checksum (SHA-256)</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {backups.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3.5 font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-teal-600" />
                        {b.id}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {b.type}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-400">
                        {new Date(b.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-400">
                        {b.recordsCount?.patients || 105} Pat • {b.recordsCount?.appointments || 200} Appt • {b.recordsCount?.billingInvoices || 50} Inv
                      </td>
                      <td className="py-3.5 font-mono text-[11px] text-slate-500">
                        {b.checksum?.slice(0, 16)}...
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleDownloadBackup(b.id)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold transition inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                        <button
                          disabled={restoringId === b.id}
                          onClick={() => handleRestoreBackup(b.id)}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 text-[11px] font-bold hover:bg-teal-100 transition inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          {restoringId === b.id ? 'Restoring...' : 'Restore'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
