'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for authentication token in browser storage
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('medinexa_token') ||
          localStorage.getItem('token') ||
          sessionStorage.getItem('medinexa_token')
        : null;

    if (!token) {
      setIsAuthenticated(false);
      // Redirect unauthenticated access to login page with return url
      router.replace(`/login?redirect=${encodeURIComponent(pathname || '/dashboard')}`);
    } else {
      setIsAuthenticated(true);
    }
  }, [router, pathname]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-sky-500/20 animate-pulse">
          M
        </div>
        <div className="text-sm font-semibold text-slate-400">Verifying MediNexa Session Credentials...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
