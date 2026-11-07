'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Command, Building2, Sparkles, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { NotificationCenter } from '../ui/NotificationCenter';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';
import { useAuthenticatedUser } from '@/lib/auth-session';

export interface DashboardNavProps {
  user?: any;
  onOpenCommandPalette?: () => void;
}

export function DashboardNav({ user, onOpenCommandPalette }: DashboardNavProps) {
  const router = useRouter();
  const { user: authUser } = useAuthenticatedUser();
  const effectiveUser = user || authUser;

  const roleCode = effectiveUser?.roleCode || effectiveUser?.role?.code || 'STAFF';
  const displayName = effectiveUser?.firstName
    ? `${effectiveUser.firstName} ${effectiveUser.lastName || ''}`.trim()
    : effectiveUser?.name || 'Healthcare Professional';

  const roleColors: Record<string, string> = {
    DOCTOR: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    NURSE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    HOSPITAL_ADMIN: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200 dark:border-purple-900',
    MEDINEXA_ADMIN: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200 dark:border-purple-900',
    EXECUTIVE: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900',
    HR_MANAGER: 'bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-400 border-pink-200 dark:border-pink-900',
    RECEPTIONIST: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900',
    PATIENT: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900',
    LAB_STAFF: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400 border-teal-200 dark:border-teal-900',
    PHARMACY_STAFF: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900',
    RADIOLOGIST: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400 border-violet-200 dark:border-violet-900',
    WARD_MANAGER: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400 border-teal-200 dark:border-teal-900',
    EMERGENCY_STAFF: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-900',
    AMBULANCE_DRIVER: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-900',
    BILLING_STAFF: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    INSURANCE_COORDINATOR: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200 dark:border-purple-900',
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Branding & Facility */}
          <div className="flex items-center gap-3">
            <MediNexaLogo size="sm" subtitle="OPERATIONS" href="/dashboard" />

            <div className="hidden md:flex items-center gap-1.5 pl-4 border-l border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {effectiveUser?.facility?.name || 'MediNexa Memorial Hospital'}
              </span>
            </div>
          </div>

          {/* Center: Command Palette Trigger */}
          <div className="flex-1 max-w-md hidden md:block">
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3.5 py-1.5 bg-slate-100/70 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-400 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                <span>Search modules, patients, or actions...</span>
              </div>
              <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-white dark:bg-slate-900 text-slate-400 rounded border border-slate-200 dark:border-slate-700 shadow-xs">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            </button>
          </div>

          {/* Right: Actions, Notifications, Theme, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-demo-tour', { detail: { stepIndex: 0 } }));
                }
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-sm shadow-blue-500/20 transition cursor-pointer"
              title="Open Hospital Guided Walkthrough Tour"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Demo Tour</span>
            </button>
            <NotificationCenter />
            <ThemeToggle />

            {/* Non-interactive Authenticated User Identity Badge */}
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
              <div
                className="flex items-center gap-2"
                title={`Logged in as ${displayName}`}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-black overflow-hidden shrink-0 text-slate-700 dark:text-slate-200">
                  {effectiveUser?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={effectiveUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{displayName?.[0] || 'U'}</span>
                  )}
                </div>

                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[140px]">
                    {displayName}
                  </div>
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border uppercase tracking-wider ${
                      roleColors[roleCode] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {roleCode.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <Link
                href="/auth/setup-authenticator"
                className="p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition cursor-pointer"
                title="Google Authenticator 2FA Security"
                aria-label="Google Authenticator 2FA"
              >
                <ShieldCheck className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
