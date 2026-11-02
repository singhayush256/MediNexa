'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Bed,
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Activity,
  History,
  AlertCircle,
  CheckCircle2,
  User,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export default function PatientAdmissionsPage() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimePulse, setRealtimePulse] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

  const loadAdmissions = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/patient-portal/admissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAdmissions(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn('Failed to fetch admissions:', e);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadAdmissions();
  }, [loadAdmissions]);

  // Real-time synchronization for bed transfers and admissions
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let socket: Socket | null = null;
    try {
      socket = io(`${wsUrl}/events`, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
      });

      socket.on('bed.transfer.completed', () => {
        setRealtimePulse(true);
        loadAdmissions();
        setTimeout(() => setRealtimePulse(false), 3000);
      });

      socket.on('bed.status.changed', () => {
        loadAdmissions();
      });

      socket.on('admission.created', () => {
        loadAdmissions();
      });

      socket.on('admission.discharged', () => {
        loadAdmissions();
      });
    } catch (err) {
      console.warn('Real-time socket connection error in Admissions:', err);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [wsUrl, loadAdmissions]);

  const activeAdmission = admissions.find(
    (a) => a.status === 'ADMITTED' || a.status === 'TRANSFERRED' || a.status === 'PLANNED',
  );

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-black uppercase tracking-wider rounded-full border border-teal-200 dark:border-teal-800">
              INPATIENT STAYS
            </span>
            {realtimePulse && (
              <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full animate-pulse border border-emerald-200 dark:border-emerald-800">
                ⚡ Real-Time Bed Sync Active
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
            Hospital Admissions & Bed Records
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete record of your inpatient stays, current bed assignment, and verified movement history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setLoading(true);
              loadAdmissions();
            }}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title="Refresh records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/portal"
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition"
          >
            ← Portal Overview
          </Link>
        </div>
      </div>

      {/* Active Admission Hero Highlight (if admitted) */}
      {activeAdmission && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-2xl border border-teal-500/20">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-widest text-teal-300">
                  CURRENT ACTIVE INPATIENT STAY
                </span>
              </div>
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-teal-200 text-xs font-bold rounded-full border border-white/15">
                Admission #{activeAdmission.admissionNumber || activeAdmission.id.slice(0, 8)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-teal-300/80 flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5" />
                  Assigned Current Bed
                </div>
                <div className="text-2xl font-black text-white">
                  {activeAdmission.currentBed?.bedNumber ||
                    activeAdmission.bedAssignments?.[0]?.bed?.bedNumber ||
                    'Bed Assigned'}
                </div>
                <div className="text-xs text-teal-200/80">
                  {activeAdmission.currentBed?.bedType || 'General Inpatient'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-teal-300/80 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Ward & Location
                </div>
                <div className="text-lg font-bold text-white">
                  {activeAdmission.currentBed?.ward?.name ||
                    activeAdmission.currentBed?.room?.ward?.name ||
                    activeAdmission.department?.name ||
                    'General Medicine Ward'}
                </div>
                <div className="text-xs text-teal-200/80">
                  Room {activeAdmission.currentBed?.room?.roomNumber || '01'} • Floor {activeAdmission.currentBed?.ward?.floorNumber || '1'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-teal-300/80 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Admitted On
                </div>
                <div className="text-lg font-bold text-white">
                  {new Date(activeAdmission.admittedAt || activeAdmission.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <div className="text-xs text-teal-200/80">
                  {new Date(activeAdmission.admittedAt || activeAdmission.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-teal-300/80 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Hospital Network
                </div>
                <div className="text-lg font-bold text-white truncate">
                  {activeAdmission.facility?.name || 'MediNexa Super Specialty Hospital'}
                </div>
                <div className="text-xs text-teal-200/80">
                  Status: {activeAdmission.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admissions List */}
      <div className="space-y-6">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          Admission Timeline & Movement History
        </h2>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
            Syncing inpatient stay records...
          </div>
        ) : admissions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="text-4xl">🏥</div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">No Hospital Admissions Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              You do not currently have any active or past inpatient admissions recorded in this hospital network.
            </p>
          </div>
        ) : (
          admissions.map((adm) => {
            const hasTransfers = Array.isArray(adm.transfers) && adm.transfers.length > 0;
            const currentBedNumber =
              adm.currentBed?.bedNumber ||
              adm.bedAssignments?.find((b: any) => b.status === 'ACTIVE')?.bed?.bedNumber ||
              adm.bedAssignments?.[0]?.bed?.bedNumber;

            return (
              <div
                key={adm.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-6 transition hover:shadow-md"
              >
                {/* Admission Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                      <Bed className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        Admission #{adm.admissionNumber || adm.id.slice(0, 8)}
                      </h3>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Admitted: {new Date(adm.admittedAt || adm.createdAt).toLocaleDateString()}</span>
                        {adm.dischargedAt && (
                          <span>• Discharged: {new Date(adm.dischargedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-[11px] font-black rounded-full uppercase tracking-wider ${
                        adm.status === 'DISCHARGED'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : adm.status === 'TRANSFERRED'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      {adm.status}
                    </span>
                  </div>
                </div>

                {/* Admission Core Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Current / Final Bed</span>
                    <span className="font-black text-slate-800 dark:text-slate-100 block text-sm">
                      {currentBedNumber || 'Unassigned'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Hospital Facility</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 block truncate">
                      {adm.facility?.name || 'MediNexa Central'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Department</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 block truncate">
                      {adm.department?.name || 'General Inpatient'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Attending Physician</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 block truncate">
                      Dr. {adm.admitter?.firstName || 'Chief'} {adm.admitter?.lastName || 'Physician'}
                    </span>
                  </div>
                </div>

                {/* Immutable Bed Transfer History Timeline */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Bed Movement & Transfer Timeline</span>
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      ✓ Immutable Audit Log
                    </span>
                  </h4>

                  {!hasTransfers ? (
                    <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>Patient has remained in primary assigned Bed {currentBedNumber || 'N/A'} without transfers.</span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {adm.transfers.map((tx: any, idx: number) => (
                        <div
                          key={tx.id || idx}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-black text-[10px]">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
                                <span className="text-rose-600 dark:text-rose-400 font-bold">
                                  Bed {tx.fromBed?.bedNumber || 'Source'}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                  Bed {tx.toBed?.bedNumber || 'Destination'}
                                </span>
                                {tx.toBed?.ward?.name && (
                                  <span className="text-slate-400 text-[11px] font-normal">
                                    ({tx.toBed.ward.name})
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                Reason: {tx.reason || 'Clinical transfer executed'}
                              </div>
                            </div>
                          </div>

                          <div className="text-right sm:text-right shrink-0">
                            <div className="text-[10px] font-semibold text-slate-400">
                              {new Date(tx.transferredAt || tx.createdAt).toLocaleDateString()} at{' '}
                              {new Date(tx.transferredAt || tx.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                            {tx.transferrer && (
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                Transferred by: {tx.transferrer.firstName} {tx.transferrer.lastName}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Discharge Advice & Summary (if discharged) */}
                {adm.status === 'DISCHARGED' && adm.dischargeReason && (
                  <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 text-xs space-y-1">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                      Discharge Outcome & Notes:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {adm.dischargeReason}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
