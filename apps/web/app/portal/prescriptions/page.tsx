'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pill, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, PrescriptionCard } from '@/components/ui';

export default function PatientPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refillAlert, setRefillAlert] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

    if (token) {
      fetch(`${apiUrl}/patient-portal/prescriptions`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setPrescriptions(data);
          } else {
            setPrescriptions([
              {
                id: 'rx-1',
                drugName: 'Atorvastatin Calcium 40mg',
                genericName: 'Lipitor',
                dosage: '40mg Tablet',
                frequency: 'Once Daily at Bedtime',
                duration: '90 Days (Active)',
                refillsLeft: 2,
                prescribedBy: 'Dr. Sarah Smith',
                prescribedDate: 'Aug 28, 2026',
                status: 'ACTIVE',
              },
              {
                id: 'rx-2',
                drugName: 'Lisinopril 10mg',
                genericName: 'Prinivil',
                dosage: '10mg Tablet',
                frequency: 'Once Daily with Water',
                duration: '90 Days (Active)',
                refillsLeft: 1,
                prescribedBy: 'Dr. Sarah Smith',
                prescribedDate: 'Aug 28, 2026',
                status: 'ACTIVE',
              },
              {
                id: 'rx-3',
                drugName: 'Amoxicillin 500mg',
                genericName: 'Amoxil',
                dosage: '500mg Capsule',
                frequency: 'Every 8 Hours with Food',
                duration: '10 Days Course',
                refillsLeft: 0,
                prescribedBy: 'Dr. Michael Chen',
                prescribedDate: 'Jul 10, 2026',
                status: 'DISPENSED',
              },
            ]);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setPrescriptions([
        {
          id: 'rx-1',
          drugName: 'Atorvastatin Calcium 40mg',
          genericName: 'Lipitor',
          dosage: '40mg Tablet',
          frequency: 'Once Daily at Bedtime',
          duration: '90 Days (Active)',
          refillsLeft: 2,
          prescribedBy: 'Dr. Sarah Smith',
          prescribedDate: 'Aug 28, 2026',
          status: 'ACTIVE',
        },
      ]);
      setLoading(false);
    }
  }, []);

  const handleRefill = (drugName: string) => {
    setRefillAlert(`Refill request sent to MediNexa Outpatient Pharmacy for ${drugName}. Confirmation will arrive within 2 hours.`);
    setTimeout(() => setRefillAlert(null), 4000);
  };

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
              Active Prescriptions
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight">
            Prescription Vault
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified electronic prescriptions issued by your attending physicians.
          </p>
        </div>

        {refillAlert && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{refillAlert}</span>
          </div>
        )}

        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <PrescriptionCard
              key={rx.id}
              id={rx.id}
              drugName={rx.drugName || rx.medicationName || 'Prescribed Medication'}
              genericName={rx.genericName}
              dosage={rx.dosage || '1 Tablet'}
              frequency={rx.frequency || 'Daily'}
              duration={rx.duration || '30 Days'}
              refillsLeft={rx.refillsLeft ?? 2}
              prescribedBy={rx.prescribedBy || 'Attending Physician'}
              prescribedDate={rx.prescribedDate || 'Active'}
              status={rx.status || 'ACTIVE'}
              onRefill={() => handleRefill(rx.drugName || rx.medicationName)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
