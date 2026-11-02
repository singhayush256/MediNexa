'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Key,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Activity,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui';

export default function SuperAdminProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('medinexa_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-900">
            SYSTEM ACCOUNT
          </span>
          <span className="text-xs text-slate-400 font-medium">Platform Administration Identity</span>
        </div>
        <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight mt-1">
          Super Administrator Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Platform-level administrative credentials and security governance parameters.
        </p>
      </div>

      {/* Account Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-purple-600 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-purple-500/20">
            {user?.firstName?.[0] || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-950 dark:text-white">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Super Administrator'}
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                SUPER_ADMIN
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">{user?.email || 'admin@medinexa.health'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Role Code</span>
            <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
              {user?.role?.code || user?.roleCode || 'SUPER_ADMIN'}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Governance Level</span>
            <span className="font-semibold text-slate-900 dark:text-white">Platform System Master</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Facility Scope</span>
            <span className="font-semibold text-slate-900 dark:text-white">Global (Unassigned to single facility)</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Status</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active & Verified
            </span>
          </div>
        </div>

        {/* Platform Responsibilities Summary */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Designated Operational Capabilities
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-900/40">
              <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Add Hospital: </span>
                <span className="text-slate-600 dark:text-slate-400">
                  Register new hospital tenant instances and initialize designated Hospital Administrator accounts.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-900/40">
              <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">View Existing Hospitals: </span>
                <span className="text-slate-600 dark:text-slate-400">
                  Inspect tenant directories, capacity statistics, and operational telemetry in strict read-only mode.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <Lock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Hospital Data Invariant: </span>
                <span className="text-slate-600 dark:text-slate-400">
                  Clinical records, bed assignments, admissions, and financial operations are strictly isolated to hospital staff.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
