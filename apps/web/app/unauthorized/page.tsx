'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LogOut, Lock, Clock } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';

export default function UnauthorizedPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [incidentId, setIncidentId] = useState('');

  useEffect(() => {
    const rawUser = typeof window !== 'undefined' ? localStorage.getItem('medinexa_user') : null;
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch (e) {}
    }
    setIncidentId(`SEC-${Date.now().toString(36).toUpperCase()}`);
  }, []);

  const role = user?.roleCode || user?.role?.code || user?.role || 'UNSPECIFIED_ROLE';
  const isPatient = role === 'PATIENT';

  const handleReturn = () => {
    if (isPatient) {
      router.push('/portal');
    } else {
      router.push('/dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('medinexa_token');
    localStorage.removeItem('token');
    localStorage.removeItem('medinexa_user');
    document.cookie = 'medinexa_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-6 relative font-sans transition-colors duration-200">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-card text-center space-y-6">
        {/* Security Shield Icon */}
        <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
            HTTP 403 • ACCESS FORBIDDEN
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight">
            Workstation Access Restricted
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your authenticated role does not hold clinical or administrative clearance to access this module or view its data.
          </p>
        </div>

        {/* User Role & Incident Metadata */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-left space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Your Active Role:</span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[11px]">
              {role}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Audit Incident ID:</span>
            <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300">
              {incidentId}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Security Policy:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center gap-1">
              <Lock className="w-3 h-3" /> HIPAA RBAC Isolation
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={handleReturn}
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            {isPatient ? 'Return to Patient Portal' : 'Return to My Station'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleLogout}
            icon={<LogOut className="w-3.5 h-3.5" />}
          >
            Sign In with Different Role
          </Button>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Security access violation recorded in audit log</span>
        </div>
      </div>
    </div>
  );
}
