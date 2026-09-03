'use client';

import React from 'react';

/**
 * 1. Area Trend Chart (e.g. Revenue & Hospital Occupancy)
 */
export interface AreaChartPoint {
  label: string;
  value: number;
}

export interface AreaTrendChartProps {
  data: AreaChartPoint[];
  color?: string;
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  className?: string;
}

export function AreaTrendChart({
  data,
  color = '#2563EB',
  height = 160,
  valuePrefix = '',
  valueSuffix = '',
  className = '',
}: AreaTrendChartProps) {
  if (!data || data.length === 0) return null;

  const width = 500;
  const padding = 20;

  const maxValue = Math.max(...data.map((d) => d.value), 10);
  const minValue = Math.min(...data.map((d) => d.value), 0);
  const range = maxValue - minValue || 1;

  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (width - padding * 2);
    const y = height - padding - ((d.value - minValue) / range) * (height - padding * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((pct, i) => {
          const y = height - padding - pct * (height - padding * 2);
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill={`url(#gradient-${color.replace('#', '')})`} />

        {/* Line stroke */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i} className="group">
            <circle
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill={color}
              className="transition-transform group-hover:scale-150 origin-center cursor-pointer"
            />
            {/* Tooltip on hover */}
            <title>{`${p.label}: ${valuePrefix}${p.value.toLocaleString()}${valueSuffix}`}</title>
          </g>
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold px-2 mt-2">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

/**
 * 2. Bar Breakdown Chart (e.g. Departmental Intake)
 */
export interface BarItem {
  label: string;
  value: number;
  color?: string;
}

export interface BarBreakdownChartProps {
  items: BarItem[];
  className?: string;
  valuePrefix?: string;
}

export function BarBreakdownChart({ items, className = '', valuePrefix = '' }: BarBreakdownChartProps) {
  const maxVal = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className={`space-y-2.5 ${className}`}>
      {items.map((item, idx) => {
        const pct = Math.round((item.value / maxVal) * 100);
        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold">
                {valuePrefix}
                {item.value.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${pct}%`,
                  backgroundColor: item.color || '#2563EB',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * 3. Donut Chart (e.g. Bed Status / Claims Distribution)
 */
export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  centerText?: string;
  centerSubtext?: string;
  className?: string;
}

export function DonutChart({
  segments,
  size = 140,
  centerText,
  centerSubtext,
  className = '',
}: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeAngle = 0;

  return (
    <div className={`flex items-center gap-6 ${className}`}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {segments.map((seg, i) => {
            const strokeDasharray = `${(seg.value / total) * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativeAngle;
            cumulativeAngle += (seg.value / total) * circumference;

            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>

        {(centerText || centerSubtext) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            {centerText && (
              <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                {centerText}
              </span>
            )}
            {centerSubtext && (
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                {centerSubtext}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="space-y-2 min-w-0 flex-1">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-slate-600 dark:text-slate-400 truncate">{seg.label}</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100 ml-2">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
