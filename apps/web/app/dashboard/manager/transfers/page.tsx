'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  Building2,
  Search,
  Filter,
  RefreshCw,
  Bed,
  ArrowRight,
} from 'lucide-react';
import { getApiBaseUrl, fetchWithTimeout } from '@/lib/api-config';

interface TransferItem {
  id: string;
  patientName: string;
  uhid: string;
  sourceBed: string;
  sourceWard: string;
  destBed: string;
  destWard: string;
  reason: string;
  transferredAt: string;
  transferredBy: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
}

export default function ManagerTransfersPage() {
  const [loading, setLoading] = useState(false);
  const [transfers, setTransfers] = useState<TransferItem[]>([
    {
      id: 'tx-2026-081',
      patientName: 'Arjun Sharma',
      uhid: 'UHID-2026-0182',
      sourceBed: 'ICU-B01',
      sourceWard: 'Cardiology ICU',
      destBed: 'HDU-N04',
      destWard: 'Neurology HDU',
      reason: 'Clinical step-down after post-infarct stabilization',
      transferredAt: 'Today, 10:28 AM',
      transferredBy: 'Dr. Ayush Singh',
      status: 'COMPLETED',
    },
    {
      id: 'tx-2026-082',
      patientName: 'Ananya Verma',
      uhid: 'UHID-2026-0192',
      sourceBed: 'HDU-N02',
      sourceWard: 'Neurology HDU',
      destBed: 'MED-305',
      destWard: 'General Medicine',
      reason: 'Ward transfer for continued oral antibiotic regimen',
      transferredAt: 'Today, 09:15 AM',
      transferredBy: 'Senior Sister / Reception',
      status: 'COMPLETED',
    },
    {
      id: 'tx-2026-083',
      patientName: 'Robert Chen',
      uhid: 'UHID-2026-0294',
      sourceBed: 'EMERG-03',
      sourceWard: 'Emergency Bay',
      destBed: 'SICU-03',
      destWard: 'Surgical ICU',
      reason: 'Urgent post-op surgical transfer requested',
      transferredAt: 'Today, 08:30 AM',
      transferredBy: 'Emergency Attending',
      status: 'COMPLETED',
    },
    {
      id: 'tx-2026-084',
      patientName: 'Kavita Patel',
      uhid: 'UHID-2026-0391',
      sourceBed: 'MED-204',
      sourceWard: 'General Medicine',
      destBed: 'ORTHO-112',
      destWard: 'Orthopedics Post-Op',
      reason: 'Scheduled orthopedic sub-specialty transfer',
      transferredAt: 'Pending confirmation',
      transferredBy: 'Attending Physician',
      status: 'PENDING',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = transfers.filter((t) => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold mb-2">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Inter-Ward Movement Audit Trail</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Patient Transfers & Movement History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Immutable log of patient ward transitions, clinical transfer justifications, and bed handover events.
          </p>
        </div>

        <Link
          href="/dashboard/manager/beds"
          className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-md shadow-teal-600/20"
        >
          Check Bed Availability →
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['ALL', 'PENDING', 'ACTIVE', 'COMPLETED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === st
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {st} ({st === 'ALL' ? transfers.length : transfers.filter((t) => t.status === st).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Transfer ID</th>
                <th className="py-3 px-4">Patient & UHID</th>
                <th className="py-3 px-4">Source Bed / Ward</th>
                <th className="py-3 px-4">Destination Bed / Ward</th>
                <th className="py-3 px-4">Clinical Reason</th>
                <th className="py-3 px-4">Timestamp & Staff</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-teal-700 dark:text-teal-300">
                    {t.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900 dark:text-white">
                      {t.patientName}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">{t.uhid}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{t.sourceBed}</div>
                    <div className="text-[11px] text-slate-400">{t.sourceWard}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span>{t.destBed}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{t.destWard}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                    {t.reason}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-800 dark:text-slate-200 font-semibold">{t.transferredAt}</div>
                    <div className="text-[10px] text-slate-400">{t.transferredBy}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        t.status === 'COMPLETED'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : t.status === 'ACTIVE'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
