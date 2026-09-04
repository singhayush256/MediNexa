'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, ShieldCheck, Stethoscope, FlaskConical, FileText } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, MedicalTimeline } from '@/components/ui';

export default function PatientMedicalRecordsPage() {
  const timelineEvents: any[] = [
    {
      id: 'e1',
      date: 'Aug 28, 2026',
      type: 'ENCOUNTER',
      title: 'Outpatient Cardiology Review',
      provider: 'Dr. Rajesh Sharma (Attending Cardiologist)',
      summary: 'Patient evaluated for periodic palpitation follow-up. Rest ECG normal sinus rhythm. Continued current ACE-inhibitor regimen.',
      badge: 'Signed & Closed',
    },
    {
      id: 'e2',
      date: 'Aug 24, 2026',
      type: 'LAB',
      title: 'Comprehensive Diagnostic Bloodwork',
      provider: 'Central Pathology Laboratory',
      summary: 'Lipid Profile, HbA1c, and Serum Creatinine performed. All parameters within target biological reference intervals.',
      badge: 'Verified STAT',
    },
    {
      id: 'e3',
      date: 'Aug 14, 2026',
      type: 'PRESCRIPTION',
      title: 'Prescription Order: Atorvastatin & Lisinopril',
      provider: 'Dr. Vivek Mishra',
      summary: '90-day maintenance supply filled and dispensed via MediNexa Outpatient Formulary.',
      badge: 'Fulfilled',
    },
    {
      id: 'e4',
      date: 'May 10, 2026',
      type: 'ADMISSION',
      title: 'Inpatient Observation - Ward 4B',
      provider: 'Internal Medicine Department',
      summary: '36-hour observation following acute viral gastroenteritis with fluid hydration. Discharged in stable condition.',
      badge: 'Discharged',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/portal" className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portal</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Longitudinal Medical Records
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
              Download Full EHR (PDF)
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight">
              Clinical Medical History
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified clinical encounters, diagnostic reports, and hospital admissions.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-900 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>ABDM & HIPAA Verified Record</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chronological Healthcare Timeline</CardTitle>
            <CardDescription>Continuous record of care across all network facilities</CardDescription>
          </CardHeader>
          <CardContent>
            <MedicalTimeline events={timelineEvents} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
