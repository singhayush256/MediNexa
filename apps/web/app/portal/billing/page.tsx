'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Shield, Download, CheckCircle2, Clock } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, StatCard } from '@/components/ui';
import { RazorpayCheckoutModal } from '@/components/payments/RazorpayCheckoutModal';

export default function PatientBillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());
  const [payingInvoice, setPayingInvoice] = useState<any | null>(null);

  const handleDownloadReceipt = async (inv: any) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Header Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 36, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text('MEDINEXA MULTISPECIALITY HOSPITAL', 14, 13);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(153, 246, 228);
      doc.text('TERTIARY CARE & MULTI-ORGAN SPECIALITY INSTITUTE (NABH & NABL ACCREDITED)', 14, 19);
      doc.setTextColor(203, 213, 225);
      doc.text('GSTIN: 09AAECM1234F1Z8 | PAN: AAECM1234F | State: 09 (Uttar Pradesh)', 14, 25);
      doc.text('Sector 62, Noida, Gautam Buddha Nagar, UP - 201309 | Helpline: +91 120 4567890', 14, 31);

      // Status Badge
      doc.setFillColor(16, 185, 129);
      doc.roundedRect(154, 7, 44, 22, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT RECEIPT', 158, 14);
      doc.setFontSize(7);
      doc.text('PAID IN FULL', 168, 20);
      doc.text('OFFICIAL E-RECEIPT', 161, 25);

      // Patient Info
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, 42, 182, 32, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('PATIENT & BILLING RECORD', 18, 48);
      doc.text('RECEIPT METADATA', 110, 48);

      doc.setDrawColor(203, 213, 225);
      doc.line(18, 50, 95, 50);
      doc.line(110, 50, 188, 50);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`Patient Name: Aarav Sharma`, 18, 56);
      doc.text(`UHID: MDNX-2026-9041`, 18, 62);
      doc.text(`Service: ${inv.description || 'Clinical Care'}`, 18, 68);

      doc.text(`Invoice Ref: ${inv.invoiceNumber || 'INV-2026-9041'}`, 110, 56);
      doc.text(`Date: ${inv.date || new Date().toLocaleDateString()}`, 110, 62);
      doc.text(`Payer: ${inv.payer || 'Direct / TPA Insurance'}`, 110, 68);

      // Table Header
      let y = 80;
      doc.setFillColor(30, 41, 59);
      doc.rect(14, y, 182, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('DESCRIPTION OF CLINICAL SERVICE', 18, y + 5.5);
      doc.text('SAC / HSN', 110, y + 5.5);
      doc.text('STATUS', 140, y + 5.5);
      doc.text('AMOUNT (₹)', 170, y + 5.5);

      y += 8;
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 10, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8);
      doc.text(inv.description || 'Healthcare Service', 18, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('SAC 999311', 110, y + 6);
      doc.text('SETTLED', 140, y + 6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(String(inv.total || '₹800.00'), 170, y + 6);

      // Total Box
      y += 18;
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(120, y, 76, 26, 2, 2, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Insurance Covered:', 125, y + 7);
      doc.text(String(inv.insuranceCovered || '₹0.00'), 172, y + 7);

      doc.text('Patient Co-Pay Paid:', 125, y + 13);
      doc.text(String(inv.copayDue || inv.total || '₹800.00'), 172, y + 13);

      doc.setDrawColor(203, 213, 225);
      doc.line(125, y + 16, 192, y + 16);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(16, 185, 129);
      doc.text('Balance Due:', 125, y + 22);
      doc.text('₹0.00 (PAID)', 166, y + 22);

      // Sign-off
      y += 40;
      doc.setDrawColor(148, 163, 184);
      doc.line(18, y + 10, 65, y + 10);
      doc.line(140, y + 10, 188, y + 10);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Authorized Revenue Cashier', 18, y + 15);
      doc.text('Hospital Accounts Stamp', 140, y + 15);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('MediNexa Multispeciality Hospital Noida, Uttar Pradesh', 18, y + 19);
      doc.text('GST Compliant Digital Electronic Receipt (SAC 999311)', 140, y + 19);

      doc.save(`Receipt_${inv.invoiceNumber || 'INV-2026'}.pdf`);
    } catch (err) {
      console.error('Receipt PDF error:', err);
    }
  };

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
                total: '₹14,500.00',
                insuranceCovered: '₹12,000.00',
                copayDue: '₹2,500.00',
                amountNumber: 2500,
                status: 'PAID',
                payer: 'Star Health & Allied Insurance',
              },
              {
                id: 'inv-2',
                invoiceNumber: 'INV-2026-8912',
                date: 'Aug 24, 2026',
                description: 'Comprehensive Metabolic Panel (CMP) & Lipid Profile',
                total: '₹8,400.00',
                insuranceCovered: '₹7,000.00',
                copayDue: '₹1,400.00',
                amountNumber: 1400,
                status: 'PAYMENT DUE',
                payer: 'HDFC ERGO Health Insurance',
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
          total: '₹14,500.00',
          insuranceCovered: '₹12,000.00',
          copayDue: '₹2,500.00',
          amountNumber: 2500,
          status: 'PAID',
          payer: 'Star Health & Allied Insurance',
        },
        {
          id: 'inv-2',
          invoiceNumber: 'INV-2026-8912',
          date: 'Aug 24, 2026',
          description: 'Comprehensive Metabolic Panel (CMP) & Lipid Profile',
          total: '₹8,400.00',
          insuranceCovered: '₹7,000.00',
          copayDue: '₹1,400.00',
          amountNumber: 1400,
          status: 'PAYMENT DUE',
          payer: 'HDFC ERGO Health Insurance',
        },
      ]);
      setLoading(false);
    }
  }, []);

  const handlePayNow = (inv: any) => {
    setPayingInvoice(inv);
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
            value="₹22,900.00"
            subtext="Current fiscal year (2026)"
            trend="neutral"
            icon={<CreditCard className="w-4 h-4 text-blue-500" />}
          />
          <StatCard
            title="Insurance Covered"
            value="₹19,000.00"
            subtext="83.0% settled cashless by TPA"
            trend="up"
            icon={<Shield className="w-4 h-4 text-emerald-500" />}
          />
          <StatCard
            title="Outstanding Copay"
            value="₹1,400.00"
            subtext="Payable via Razorpay / UPI"
            trend="neutral"
            change="Pending"
            icon={<CheckCircle2 className="w-4 h-4 text-amber-500" />}
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
                          onClick={() => handlePayNow(inv)}
                        >
                          Pay Copay (Razorpay)
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="xs"
                          icon={<Download className="w-3 h-3" />}
                          onClick={() => handleDownloadReceipt(inv)}
                        >
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

        {payingInvoice && (
          <RazorpayCheckoutModal
            isOpen={!!payingInvoice}
            onClose={() => setPayingInvoice(null)}
            patientId="patient-ind-self"
            patientName="Arjun Nair"
            patientEmail="arjun.nair@gmail.com"
            amount={payingInvoice.amountNumber || 1400}
            context="CONSULTATION"
            entityId={payingInvoice.id}
            description={`Payment for ${payingInvoice.description} (${payingInvoice.invoiceNumber})`}
            onSuccess={(result) => {
              setPaidIds(new Set([...paidIds, payingInvoice.id]));
              setPayingInvoice(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
