import React from 'react';
import { Pill, Clock, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface PrescriptionCardProps {
  id: string;
  drugName: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  refillsLeft?: number;
  prescribedBy: string;
  prescribedDate: string;
  status?: 'ACTIVE' | 'DISPENSED' | 'EXPIRED';
  onRefill?: () => void;
  className?: string;
}

export function PrescriptionCard({
  id,
  drugName,
  genericName,
  dosage,
  frequency,
  duration,
  refillsLeft = 2,
  prescribedBy,
  prescribedDate,
  status = 'ACTIVE',
  onRefill,
  className = '',
}: PrescriptionCardProps) {
  const statusStyles = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    DISPENSED: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    EXPIRED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 transition-all ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold shrink-0">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {drugName}
            </h4>
            {genericName && (
              <p className="text-[11px] text-slate-400 font-medium">
                ({genericName})
              </p>
            )}
          </div>
        </div>

        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
            statusStyles[status]
          }`}
        >
          {status}
        </span>
      </div>

      <div className="mt-3.5 grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Dosage</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{dosage}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Schedule</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{frequency}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Course</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{duration}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div>
          Prescribed by <span className="font-bold text-slate-700 dark:text-slate-300">{prescribedBy}</span> • {prescribedDate}
        </div>

        {onRefill && status === 'ACTIVE' && (
          <Button
            variant="outline"
            size="xs"
            onClick={onRefill}
            icon={<RotateCcw className="w-3 h-3" />}
          >
            Refill ({refillsLeft} left)
          </Button>
        )}
      </div>
    </div>
  );
}
