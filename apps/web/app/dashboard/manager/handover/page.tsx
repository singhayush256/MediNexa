'use client';

import React, { useState } from 'react';
import {
  Repeat,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Building2,
  ShieldCheck,
  Send,
} from 'lucide-react';

export default function ManagerShiftHandoverPage() {
  const [outgoingShift, setOutgoingShift] = useState('Morning Operations (08:00 - 16:00)');
  const [incomingShift, setIncomingShift] = useState('Evening Operations (16:00 - 24:00)');
  const [outgoingManager, setOutgoingManager] = useState('Rahul Verma (MG.RAHUL-9137)');
  const [incomingManager, setIncomingManager] = useState('Amit Saxena (MG.AMIT-4821)');

  const [departmentNotes, setDepartmentNotes] = useState(
    '1. ICU Bed 2 monitor leads replaced during morning maintenance.\n' +
    '2. Dr. Sunita requested evening fast-track OPD room 204 to stay open till 18:00.\n' +
    '3. Two discharge clearances pending final billing sign-off at Reception.'
  );

  const [handoverSigned, setHandoverSigned] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('medinexa_manager_handover_signed') === 'true';
      } catch {}
    }
    return false;
  });

  const handleSignOffHandover = (e: React.FormEvent) => {
    e.preventDefault();
    setHandoverSigned(true);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('medinexa_manager_handover_signed', 'true');
        localStorage.setItem('medinexa_manager_handover_notes', departmentNotes);
      } catch {}
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold mb-2">
            <Repeat className="w-3.5 h-3.5" />
            <span>Operational Continuity & Handovers</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Shift Handover & Operations Sign-off
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Structured transfer of operational responsibilities, staffing gaps, unresolved bottlenecks, and department notes.
          </p>
        </div>
      </div>

      {handoverSigned && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Shift Handover officially signed and recorded in immutable hospital audit history.</span>
          </div>
        </div>
      )}

      {/* Outgoing & Incoming Shift Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="text-[10px] font-black uppercase text-teal-600 tracking-wider">
            Outgoing Shift
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">
            {outgoingShift}
          </div>
          <div className="text-xs text-slate-500">
            Handing over Manager: <span className="font-bold text-slate-800 dark:text-slate-200">{outgoingManager}</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed 8 hr operational cycle
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="text-[10px] font-black uppercase text-teal-600 tracking-wider">
            Incoming Shift
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">
            {incomingShift}
          </div>
          <div className="text-xs text-slate-500">
            Receiving Manager: <span className="font-bold text-slate-800 dark:text-slate-200">{incomingManager}</span>
          </div>
          <div className="text-[11px] text-teal-600 font-bold flex items-center gap-1 pt-1">
            <Clock className="w-3.5 h-3.5" /> Briefing scheduled at 15:45
          </div>
        </div>
      </div>

      {/* Handover Critical Checklist conforming to Section 27 */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <h2 className="text-base font-black text-slate-900 dark:text-white">
          Shift Handover Checklist & Briefing
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-500">Staffing Gaps:</span>
            <div className="font-extrabold text-amber-600">
              1 ICU Nurse on emergency leave
            </div>
            <div className="text-[11px] text-slate-400">Standby deployed from Medicine</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-500">Unresolved Issues:</span>
            <div className="font-extrabold text-slate-900 dark:text-white">
              2 Beds awaiting final sanitization
            </div>
            <div className="text-[11px] text-slate-400">Housekeeping slip active</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-500">Critical Trauma Patients:</span>
            <div className="font-extrabold text-rose-600">
              1 Resuscitation Level 1 active
            </div>
            <div className="text-[11px] text-slate-400">Surgery consult requested</div>
          </div>
        </div>

        <form onSubmit={handleSignOffHandover} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Operational Department Notes & Transition Instructions *
            </label>
            <textarea
              rows={4}
              required
              value={departmentNotes}
              onChange={(e) => setDepartmentNotes(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={handoverSigned}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-md shadow-teal-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{handoverSigned ? 'Handover Signed & Verified' : 'Sign Off Shift Handover'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
