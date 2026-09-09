import React from 'react';
import { Pill, Clock, AlertCircle, CheckCircle2, RotateCcw, FlaskConical, ShoppingCart, CheckCheck } from 'lucide-react';
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
  isLabMedicine?: boolean;
  labReportRef?: string;
  purchaseStatus?: 'NOT_BOUGHT' | 'BOUGHT';
  onTogglePurchaseStatus?: () => void;
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
  isLabMedicine = false,
  labReportRef,
  purchaseStatus = 'NOT_BOUGHT',
  onTogglePurchaseStatus,
  onRefill,
  className = '',
}: PrescriptionCardProps) {
  const statusStyles = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    DISPENSED: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    EXPIRED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  };

  const isBought = purchaseStatus === 'BOUGHT';

  return (
    <div
      className={`bg-white dark:bg-slate-900 border rounded-2xl p-4.5 transition-all shadow-subtle ${
        !isBought
          ? 'border-amber-300 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/20 to-transparent'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      } ${className}`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-sm ${
              isLabMedicine
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                : 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900'
            }`}
          >
            {isLabMedicine ? <FlaskConical className="w-5 h-5" /> : <Pill className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {drugName}
              </h4>
              {isLabMedicine && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  <FlaskConical className="w-3 h-3" />
                  Lab Medicine
                </span>
              )}
            </div>
            {genericName && (
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                ({genericName})
              </p>
            )}
            {isLabMedicine && labReportRef && (
              <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 mt-0.5 flex items-center gap-1">
                <span>↳</span> Prescribed for: <strong>{labReportRef}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Status badges */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                statusStyles[status]
              }`}
            >
              {status}
            </span>
          </div>

          {/* Pharmacy Purchase Status Badge */}
          {isBought ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <CheckCheck className="w-3 h-3" />
              Medicine Bought & Dispensed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
              <AlertCircle className="w-3 h-3" />
              Medicine Not Bought (Pending)
            </span>
          )}
        </div>
      </div>

      {/* Details Grid */}
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

      {/* Footer & Actions */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <div>
          Prescribed by <span className="font-bold text-slate-700 dark:text-slate-300">{prescribedBy}</span> • {prescribedDate}
        </div>

        <div className="flex items-center gap-2">
          {onTogglePurchaseStatus && (
            <button
              onClick={onTogglePurchaseStatus}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                isBought
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
              }`}
            >
              {isBought ? (
                <>
                  <RotateCcw className="w-3 h-3" />
                  <span>Mark as Not Bought</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3 h-3" />
                  <span>Mark as Bought (Buy Medicine)</span>
                </>
              )}
            </button>
          )}

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
    </div>
  );
}

