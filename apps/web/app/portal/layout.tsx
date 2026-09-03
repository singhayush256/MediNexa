'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { MediNexaChatWidget } from '@/components/ai/MediNexaChatWidget';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('medinexa_token') ||
          localStorage.getItem('token') ||
          sessionStorage.getItem('medinexa_token')
        : null;

    if (!token) {
      setIsAuthenticated(false);
      router.replace(`/login?redirect=${encodeURIComponent(pathname || '/portal')}`);
      return;
    }

    setIsAuthenticated(true);
  }, [router, pathname]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-teal-500/20 animate-pulse">
          M
        </div>
        <div className="text-xs font-semibold text-slate-400">
          Loading Patient Portal Session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      {children}
      <MediNexaChatWidget />
    </>
  );
}
