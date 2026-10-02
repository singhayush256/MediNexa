'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Building2, Bed } from 'lucide-react';
import { AdmissionsBedsModule } from '@/components/reception/AdmissionsBedsModule';

export default function ReceptionAdmissionsBedsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/reception"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reception Front Desk</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
          <Building2 className="w-4 h-4 text-teal-600" />
          <span>Hospital Operations • Inpatient Division</span>
        </div>
      </div>

      <AdmissionsBedsModule initialSubTab="overview" />
    </div>
  );
}
