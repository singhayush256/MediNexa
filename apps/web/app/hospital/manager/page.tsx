'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HospitalManagerCompatibilityRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/manager');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="p-8 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Loading Manager Workspace...</p>
      </div>
    </div>
  );
}
