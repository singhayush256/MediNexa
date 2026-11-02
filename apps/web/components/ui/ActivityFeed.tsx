import React from 'react';
import { Activity, Bell, AlertTriangle, ShieldCheck, HeartPulse, Clock } from 'lucide-react';

export interface ActivityItem {
  id: string;
  timestamp: string;
  category: 'CLINICAL' | 'OPERATIONS' | 'EMERGENCY' | 'SECURITY' | 'BILLING';
  actorName: string;
  action: string;
  target?: string;
  details?: string;
  urgent?: boolean;
}

export interface ActivityFeedProps {
  items: ActivityItem[];
  className?: string;
}

export function ActivityFeed({ items, className = '' }: ActivityFeedProps) {
  const categoryIcons = {
    CLINICAL: <HeartPulse className="w-3.5 h-3.5 text-blue-500" />,
    OPERATIONS: <Activity className="w-3.5 h-3.5 text-cyan-500" />,
    EMERGENCY: <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />,
    SECURITY: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />,
    BILLING: <Bell className="w-3.5 h-3.5 text-purple-500" />,
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
            item.urgent
              ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs'
          }`}
        >
          <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
            {categoryIcons[item.category] || <Activity className="w-3.5 h-3.5 text-slate-500" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-tight">
                <span className="font-bold text-slate-900 dark:text-slate-100">{item.actorName}</span>{' '}
                <span className="text-slate-600 dark:text-slate-400">{item.action}</span>{' '}
                {item.target && (
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{item.target}</span>
                )}
              </p>

              <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0 font-medium">
                <Clock className="w-3 h-3" />
                <span>{item.timestamp}</span>
              </div>
            </div>

            {item.details && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate font-medium">
                {item.details}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
