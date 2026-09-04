import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral' | { value: number; isPositive?: boolean };
  subtext?: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan';
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  trend = 'neutral',
  subtext,
  description,
  icon,
  badge,
  badgeColor = 'blue',
  className = '',
}: StatCardProps) {
  const resolvedTrend = typeof trend === 'object' ? (trend.isPositive ? 'up' : 'down') : trend;
  const resolvedChange = change || (typeof trend === 'object' ? `${trend.isPositive ? '+' : '-'}${trend.value}%` : undefined);
  const resolvedSubtext = subtext || description;
  const badgeColors = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-900',
    cyan: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900',
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            {icon}
          </div>
        )}
        {badge && !icon && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColors[badgeColor]}`}>
            {badge}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          {value}
        </div>

        {resolvedChange && (
          <div
            className={`inline-flex items-center text-xs font-bold gap-0.5 ${
              resolvedTrend === 'up'
                ? 'text-emerald-600 dark:text-emerald-400'
                : resolvedTrend === 'down'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {resolvedTrend === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
            {resolvedTrend === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
            {resolvedTrend === 'neutral' && <Minus className="w-3.5 h-3.5" />}
            <span>{resolvedChange}</span>
          </div>
        )}
      </div>

      {resolvedSubtext && (
        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          {resolvedSubtext}
        </p>
      )}
    </div>
  );
}
