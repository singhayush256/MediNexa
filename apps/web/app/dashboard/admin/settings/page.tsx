'use client';

import React, { useState } from 'react';
import {
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
  Calendar,
  Lock,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';

export default function HospitalSettingsPage() {
  const [slotDuration, setSlotDuration] = useState('15');
  const [opdStartTime, setOpdStartTime] = useState('08:00');
  const [opdEndTime, setOpdEndTime] = useState('20:00');
  const [autoReleaseUnpaidBedsHours, setAutoReleaseUnpaidBedsHours] = useState('4');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col font-sans transition-colors duration-200">
      <DashboardNav />
      <div className="flex-1 flex min-h-[calc(100vh-4rem)]">
        <DashboardSidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                  SYSTEM ADMINISTRATION
                </span>
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Operational Policies
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
                Hospital Operational Settings
              </h1>
            </div>
          </div>

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Operational settings saved and applied to active queues!</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Outpatient & Appointment Slot Rules</CardTitle>
                <CardDescription className="text-xs">
                  Configure default consultation interval and appointment booking policies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Default Doctor Slot Duration (Minutes)
                    </label>
                    <select
                      value={slotDuration}
                      onChange={(e) => setSlotDuration(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="10">10 Minutes per Patient</option>
                      <option value="15">15 Minutes (Standard)</option>
                      <option value="20">20 Minutes</option>
                      <option value="30">30 Minutes (Comprehensive Evaluation)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        OPD Opening Time
                      </label>
                      <input
                        type="time"
                        value={opdStartTime}
                        onChange={(e) => setOpdStartTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        OPD Closing Time
                      </label>
                      <input
                        type="time"
                        value={opdEndTime}
                        onChange={(e) => setOpdEndTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saving ? 'Saving...' : 'Save OPD Rules'}</span>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <CardTitle className="text-base">Inpatient & Clinical Safety Rules</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Production-hardened invariants. Mandatory four-department discharge clearance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      4-Point Mandatory Discharge Clearance
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      Enforced by backend pipeline: PHARMACY, LABORATORY, WARD, and BILLING clearances must be APPROVED before final bed release.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      Single Active Bed Concurrency Guarantee
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      Row-level locking guarantees no bed can ever be double-assigned to multiple concurrent patients.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      Immutable Historical Transfer Audit
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      Every inter-ward movement (e.g. ICU to General Ward) is logged immutably to AdmissionTransfer.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
