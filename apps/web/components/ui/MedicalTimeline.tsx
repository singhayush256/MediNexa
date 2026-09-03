import React from 'react';
import { Calendar, FileText, FlaskConical, Stethoscope, AlertTriangle, Pill, CheckCircle } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  date: string;
  type: 'ENCOUNTER' | 'LAB' | 'PRESCRIPTION' | 'ADMISSION' | 'SURGERY' | 'ALERT';
  title: string;
  provider?: string;
  summary: string;
  badge?: string;
}

export interface MedicalTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function MedicalTimeline({ events, className = '' }: MedicalTimelineProps) {
  const iconByType = {
    ENCOUNTER: <Stethoscope className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
    LAB: <FlaskConical className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />,
    PRESCRIPTION: <Pill className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
    ADMISSION: <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
    SURGERY: <CheckCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />,
    ALERT: <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
  };

  const bgByType = {
    ENCOUNTER: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900',
    LAB: 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-900',
    PRESCRIPTION: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900',
    ADMISSION: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900',
    SURGERY: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900',
    ALERT: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900',
  };

  return (
    <div className={`relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 ${className}`}>
      {events.map((event) => (
        <div key={event.id} className="relative group">
          {/* Node Icon */}
          <div
            className={`absolute -left-6 top-1 w-5 h-5 rounded-full border flex items-center justify-center shadow-xs ${
              bgByType[event.type]
            }`}
          >
            {iconByType[event.type]}
          </div>

          {/* Event Content */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">
                  {event.date}
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
                  {event.title}
                </h4>
              </div>

              {event.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {event.badge}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              {event.summary}
            </p>

            {event.provider && (
              <div className="mt-2 text-[11px] text-slate-400">
                Provider: <span className="font-semibold text-slate-700 dark:text-slate-300">{event.provider}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
