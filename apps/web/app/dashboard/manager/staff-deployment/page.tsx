'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  AlertTriangle,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

interface DeploymentRow {
  id: string;
  department: string;
  code: string;
  shift: string;
  required: number;
  assigned: number;
  present: number;
  absent: number;
  gap: number;
  status: 'SURPLUS' | 'NOMINAL' | 'DEFICIT';
  actionNote?: string;
}

export default function ManagerStaffDeploymentPage() {
  const [deployments, setDeployments] = useState<DeploymentRow[]>([
    {
      id: 'dep-icu',
      department: 'Critical Care ICU',
      code: 'ICU',
      shift: 'Morning (08:00 - 16:00)',
      required: 10,
      assigned: 10,
      present: 8,
      absent: 2,
      gap: 2,
      status: 'DEFICIT',
      actionNote: '2 ICU nurses on emergency sick leave; ratio at 1:3',
    },
    {
      id: 'dep-emerg',
      department: 'Emergency & Trauma Station',
      code: 'EMERG',
      shift: 'Morning (08:00 - 16:00)',
      required: 8,
      assigned: 8,
      present: 8,
      absent: 0,
      gap: 0,
      status: 'NOMINAL',
    },
    {
      id: 'dep-cardio',
      department: 'Cardiology OPD & Cath Lab',
      code: 'CARDIO',
      shift: 'Morning (08:00 - 16:00)',
      required: 6,
      assigned: 6,
      present: 5,
      absent: 1,
      gap: 1,
      status: 'DEFICIT',
      actionNote: '1 technician delayed due to traffic; arrival ETA 11:15',
    },
    {
      id: 'dep-med',
      department: 'General Medicine Ward 3',
      code: 'MED-3',
      shift: 'Morning (08:00 - 16:00)',
      required: 8,
      assigned: 9,
      present: 9,
      absent: 0,
      gap: 0,
      status: 'SURPLUS',
      actionNote: '1 standby nurse available for reallocation',
    },
    {
      id: 'dep-ped',
      department: 'Pediatrics Inpatient',
      code: 'PED',
      shift: 'Morning (08:00 - 16:00)',
      required: 5,
      assigned: 5,
      present: 5,
      absent: 0,
      gap: 0,
      status: 'NOMINAL',
    },
    {
      id: 'dep-ot',
      department: 'Operation Theatres (OT 1-4)',
      code: 'OT',
      shift: 'Morning (08:00 - 16:00)',
      required: 7,
      assigned: 7,
      present: 7,
      absent: 0,
      gap: 0,
      status: 'NOMINAL',
    },
  ]);

  const [reassignSuccess, setReassignSuccess] = useState<string | null>(null);

  const handleQuickReassign = (fromDept: string, toDept: string) => {
    setDeployments((prev) =>
      prev.map((row) => {
        if (row.department === fromDept) {
          return {
            ...row,
            present: row.present - 1,
            assigned: row.assigned - 1,
            status: row.present - 1 < row.required ? 'DEFICIT' : 'NOMINAL',
            actionNote: '1 nurse deployed to ICU Ward',
          };
        }
        if (row.department === toDept) {
          const newPres = row.present + 1;
          const newGap = Math.max(0, row.required - newPres);
          return {
            ...row,
            present: newPres,
            gap: newGap,
            status: newGap === 0 ? 'NOMINAL' : 'DEFICIT',
            actionNote: 'Standby nurse received from General Medicine',
          };
        }
        return row;
      })
    );

    setReassignSuccess(
      `Reassigned 1 standby nurse from ${fromDept} to ${toDept}. Gap reduced and updated in telemetry.`
    );
    setTimeout(() => setReassignSuccess(null), 5000);
  };

  const totalRequired = deployments.reduce((acc, d) => acc + d.required, 0);
  const totalPresent = deployments.reduce((acc, d) => acc + d.present, 0);
  const totalGap = deployments.reduce((acc, d) => acc + d.gap, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Shift Staffing & Gap Analysis</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Staff Deployment & Workforce Ratios
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Realtime departmental deployment tracking: Required vs Assigned vs Present vs Absent vs Gap.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/manager/shifts"
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-md shadow-purple-600/20"
          >
            Adjust Shift Rosters →
          </Link>
        </div>
      </div>

      {/* Success Notification */}
      {reassignSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{reassignSuccess}</span>
          </div>
          <button
            onClick={() => setReassignSuccess(null)}
            className="text-xs font-bold text-emerald-700 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Total Staff Required</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalRequired} Positions
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Baseline operational quota</div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Staff Present On Duty</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {totalPresent} Active
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Coverage: {Math.round((totalPresent / totalRequired) * 100)}%
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-xs">
          <div className="text-xs font-bold text-amber-700 dark:text-amber-400">Total Staffing Gap</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {totalGap} Positions
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5 font-semibold">
            {totalGap > 0 ? 'Requires manager redeployment' : 'Full nominal coverage'}
          </div>
        </div>
      </div>

      {/* Deployment Table conforming to Section 17 */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-600" />
            <span>Department Deployment Matrix (Current Shift)</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Morning Shift (08:00 - 16:00)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Required</th>
                <th className="py-3 px-4 text-center">Assigned</th>
                <th className="py-3 px-4 text-center">Present</th>
                <th className="py-3 px-4 text-center">Absent</th>
                <th className="py-3 px-4 text-center">Gap</th>
                <th className="py-3 px-4">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {deployments.map((d) => (
                <tr
                  key={d.id}
                  className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition ${
                    d.gap > 0 ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900 dark:text-white">
                      {d.department}
                    </div>
                    <div className="text-[11px] text-slate-400">{d.shift}</div>
                    {d.actionNote && (
                      <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                        ⚠️ {d.actionNote}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                    {d.required}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                    {d.assigned}
                  </td>
                  <td className="py-3.5 px-4 text-center font-black text-emerald-600 dark:text-emerald-400">
                    {d.present}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-rose-600">
                    {d.absent}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black ${
                        d.gap > 0
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 animate-pulse'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {d.gap > 0 ? `-${d.gap}` : '0'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {d.gap > 0 ? (
                      <button
                        onClick={() =>
                          handleQuickReassign('General Medicine Ward 3', d.department)
                        }
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <span>Deploy Standby Staff</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : d.status === 'SURPLUS' ? (
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        1 Standby Available
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Full Deployment
                      </span>
                    )}
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
