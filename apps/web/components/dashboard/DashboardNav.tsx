'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, LogOut, User, Command, Building2, Sparkles, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { NotificationCenter } from '../ui/NotificationCenter';
import { RoleSwitcherModal } from '../ui/RoleSwitcherModal';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';

export interface DashboardNavProps {
  user?: any;
  onOpenCommandPalette?: () => void;
}

export function DashboardNav({ user, onOpenCommandPalette }: DashboardNavProps) {
  const router = useRouter();
  const [roleSwitcherOpen, setRoleSwitcherOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('medinexa_token');
    localStorage.removeItem('token');
    localStorage.removeItem('medinexa_user');
    sessionStorage.removeItem('medinexa_token');
    document.cookie = 'medinexa_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  const roleCode = user?.roleCode || user?.role?.code || 'STAFF';
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.name || 'Healthcare Professional';

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
                {user?.facility?.name || 'MediNexa Memorial Hospital'}
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
            {/* 16 Roles Switcher Trigger */}
            <button
              type="button"
              onClick={() => setRoleSwitcherOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
              title="Switch Persona between all 16 Hospital Roles"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Switch Role</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded font-black">
                16
              </span>
            </button>

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

            {/* User Role Pill */}
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
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

              <Link
                href="/auth/setup-authenticator"
                className="p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition cursor-pointer"
                title="Google Authenticator 2FA Security"
                aria-label="Google Authenticator 2FA"
              >
                <ShieldCheck className="w-4 h-4" />
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 16-Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={roleSwitcherOpen}
        onClose={() => setRoleSwitcherOpen(false)}
        currentRoleCode={roleCode}
      />
    </>
  );
}
