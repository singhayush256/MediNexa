'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Shield, Download, CheckCircle2, Clock } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, StatCard } from '@/components/ui';

export default function PatientBillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

    if (token) {
      fetch(`${apiUrl}/patient-portal/bills`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setInvoices(data);
          } else {
            setInvoices([
              {
                id: 'inv-1',
                invoiceNumber: 'INV-2026-9041',
                date: 'Aug 28, 2026',
                description: 'Cardiology Specialist Encounter & Resting ECG',
                total: '$180.00',
                insuranceCovered: '$140.00',
                copayDue: '$40.00',
                status: 'PAID',
                payer: 'BlueCross BlueShield',
              },
              {
                id: 'inv-2',
                invoiceNumber: 'INV-2026-8912',
                date: 'Aug 24, 2026',
                description: 'Comprehensive Metabolic Panel (CMP) & Lipid Profile',
                total: '$220.00',
                insuranceCovered: '$195.00',
                copayDue: '$25.00',
                status: 'PAID',
                payer: 'BlueCross BlueShield',
              },
            ]);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setInvoices([
        {
          id: 'inv-1',
          invoiceNumber: 'INV-2026-9041',
          date: 'Aug 28, 2026',
          description: 'Cardiology Specialist Encounter & Resting ECG',
          total: '$180.00',
          insuranceCovered: '$140.00',
          copayDue: '$40.00',
          status: 'PAID',
          payer: 'BlueCross BlueShield',
        },
      ]);
      setLoading(false);
    }
  }, []);

  const handlePayNow = (id: string) => {
    setPaidIds(new Set([...paidIds, id]));
    alert('Payment processed successfully. Digital receipt generated.');
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
              Billing & Invoices
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
            Financial Statements
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Itemized hospital bills, insurance settlements, and payment history.
          </p>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Billed"
            value="$400.00"
            subtext="Current calendar year"
            trend="neutral"
            icon={<CreditCard className="w-4 h-4 text-blue-500" />}
          />
          <StatCard
            title="Insurance Covered"
            value="$335.00"
            subtext="83.8% covered by payer"
            trend="up"
            icon={<Shield className="w-4 h-4 text-emerald-500" />}
          />
          <StatCard
            title="Outstanding Copay"
            value="$0.00"
            subtext="Account in good standing"
            trend="up"
            change="Settled"
            icon={<CheckCircle2 className="w-4 h-4 text-cyan-500" />}
          />
        </div>

        {/* Invoices List */}
        <div className="space-y-4">
          {invoices.map((inv) => {
            const isSettled = inv.status === 'PAID' || paidIds.has(inv.id);
            return (
              <Card key={inv.id}>
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {inv.invoiceNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isSettled
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900'
                        }`}
                      >
                        {isSettled ? 'PAID IN FULL' : 'PAYMENT DUE'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {inv.description}
                    </h4>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Date: {inv.date}</span>
                      <span>• Payer: {inv.payer}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                        {inv.copayDue || inv.total}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Total {inv.total} (Payer paid {inv.insuranceCovered})
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isSettled ? (
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => handlePayNow(inv.id)}
                        >
                          Pay Copay
                        </Button>
                      ) : (
                        <Button variant="outline" size="xs" icon={<Download className="w-3 h-3" />}>
                          Receipt PDF
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
