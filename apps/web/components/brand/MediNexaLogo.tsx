'use client';

import React from 'react';
import Link from 'next/link';

export interface MediNexaLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only' | 'wordmark-only';
  theme?: 'auto' | 'light' | 'dark' | 'white';
  subtitle?: string;
  href?: string;
  className?: string;
}

export function MediNexaLogo({
  size = 'md',
  variant = 'full',
  theme = 'auto',
  subtitle,
  href,
  className = '',
}: MediNexaLogoProps) {
  // Dimensions
  const iconSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const subtitleSizes = {
    xs: 'text-[8px]',
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-xs',
  };

  // Color schemes
  const textColors = {
    auto: 'text-slate-900 dark:text-white',
    light: 'text-slate-900',
    dark: 'text-slate-950',
    white: 'text-white',
  };

  const LogoIcon = (
    <div
      className={`${iconSizes[size]} relative rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-teal-500 p-0.5 shadow-md shadow-blue-600/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}
    >
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-1.5"
      >
        {/* Medical Cross Geometry with Vital Pulse Core */}
        <path
          d="M14 6C14 4.89543 14.8954 4 16 4H20C21.1046 4 22 4.89543 22 6V14H30C31.1046 14 32 14.8954 32 16V20C32 21.1046 31.1046 22 30 22H22V30C22 31.1046 21.1046 32 20 32H16C14.8954 32 14 31.1046 14 30V22H6C4.89543 22 4 21.1046 4 20V16C4 14.8954 4.89543 14 6 14H14V6Z"
          fill="white"
          fillOpacity="0.2"
        />
        {/* Sharp Central Medical Cross */}
        <path
          d="M15 8C15 7.44772 15.4477 7 16 7H20C20.5523 7 21 7.44772 21 8V15H28C28.5523 15 29 15.4477 29 16V20C29 20.5523 28.5523 21 28 21H21V28C21 28.5523 20.5523 29 20 29H16C15.4477 29 15 28.5523 15 28V21H8C7.44772 21 7 20.5523 7 20V16C7 15.4477 7.44772 15 8 15H15V8Z"
          fill="white"
        />
        {/* Dynamic Pulse Wave Silhouette */}
        <path
          d="M6 18H11L13.5 13L16.5 23L19.5 15L21.5 18H30"
          stroke="#0D9488"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

  const LogoText = (
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5">
        <span
          className={`font-black tracking-tight leading-none ${textSizes[size]} ${textColors[theme]}`}
        >
          Medi<span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">Nexa</span>
        </span>
        {subtitle && (
          <span
            className={`font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border leading-none ${
              subtitleSizes[size]
            } ${
              theme === 'white'
                ? 'bg-white/20 border-white/30 text-white'
                : 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300'
            }`}
          >
            {subtitle}
          </span>
        )}
      </div>
      {size !== 'xs' && size !== 'sm' && !subtitle && (
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
          Enterprise Healthcare OS
        </span>
      )}
    </div>
  );

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {variant !== 'wordmark-only' && LogoIcon}
      {variant !== 'icon-only' && LogoText}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center group cursor-pointer focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
