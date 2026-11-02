'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookAppointmentRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/portal/appointments');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
          Redirecting to MediNexa Appointment Booking...
        </p>
      </div>
    </div>
  );
}
