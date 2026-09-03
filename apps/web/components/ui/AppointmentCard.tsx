import React from 'react';
import { Calendar, Clock, Video, CheckCircle2, User, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface AppointmentCardProps {
  id: string;
  doctorName: string;
  specialty?: string;
  patientName: string;
  patientMrn?: string;
  dateTime: string;
  type?: 'IN_PERSON' | 'TELEMEDICINE';
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  onJoinCall?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

export function AppointmentCard({
  id,
  doctorName,
  specialty,
  patientName,
  patientMrn,
  dateTime,
  type = 'IN_PERSON',
  status,
  onJoinCall,
  onViewDetails,
  className = '',
}: AppointmentCardProps) {
  const statusColors = {
    PENDING: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900',
    CONFIRMED: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    IN_PROGRESS: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-900 animate-pulse',
    COMPLETED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    CANCELLED: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900',
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 transition-all ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
            {doctorName.replace(/^(Dr\.\s*)/i, '').charAt(0) || 'D'}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {doctorName}
            </h4>
            {specialty && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {specialty}
              </p>
            )}
          </div>
        </div>

        <span
          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${
            statusColors[status] || statusColors.CONFIRMED
          }`}
        >
          {status.replace('_', ' ')}
        </span>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>{dateTime}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {patientName} {patientMrn ? `(${patientMrn})` : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {type === 'TELEMEDICINE' && onJoinCall && (
            <Button
              variant="secondary"
              size="xs"
              onClick={onJoinCall}
              icon={<Video className="w-3 h-3" />}
            >
              Join Video
            </Button>
          )}

          {onViewDetails && (
            <Button
              variant="outline"
              size="xs"
              onClick={onViewDetails}
              icon={<ChevronRight className="w-3 h-3" />}
            >
              Details
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
