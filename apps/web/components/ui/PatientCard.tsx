import React from 'react';
import { User, Activity, AlertCircle, Heart } from 'lucide-react';
import { Button } from './Button';

export interface PatientCardProps {
  id: string;
  name: string;
  mrn: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  bedAssignment?: string;
  allergies?: string[];
  vitals?: {
    bp?: string;
    heartRate?: number;
    spo2?: number;
    temperature?: number;
  };
  onView360?: () => void;
  className?: string;
}

export function PatientCard({
  id,
  name,
  mrn,
  age,
  gender,
  bloodGroup,
  bedAssignment,
  allergies = [],
  vitals,
  onView360,
  className = '',
}: PatientCardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 transition-all ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
            {name.charAt(0) || 'P'}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span>MRN: {mrn}</span>
              {age && <span>• {age}y</span>}
              {gender && <span>• {gender}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {bloodGroup && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
              {bloodGroup}
            </span>
          )}
          {bedAssignment && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {bedAssignment}
            </span>
          )}
        </div>
      </div>

      {allergies.length > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-900">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate font-medium">Allergies: {allergies.join(', ')}</span>
        </div>
      )}

      {vitals && (
        <div className="mt-3 grid grid-cols-4 gap-1.5 text-center bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase">BP</div>
            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
              {vitals.bp || '—'}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase">HR</div>
            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
              {vitals.heartRate ? `${vitals.heartRate} bpm` : '—'}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase">SpO2</div>
            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
              {vitals.spo2 ? `${vitals.spo2}%` : '—'}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase">Temp</div>
            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
              {vitals.temperature ? `${vitals.temperature}°C` : '—'}
            </div>
          </div>
        </div>
      )}

      {onView360 && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
          <Button variant="outline" size="xs" onClick={onView360}>
            Patient 360 View
          </Button>
        </div>
      )}
    </div>
  );
}
