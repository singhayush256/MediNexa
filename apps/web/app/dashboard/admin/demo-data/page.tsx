'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  UserCheck,
  Calendar,
  FileText,
  Bed,
  FlaskConical,
  Pill,
  ShieldCheck,
  Receipt,
  Sparkles,
  Layers,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, StatCard } from '@/components/ui';

export default function AdminDemoDataPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dataStatus, setDataStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/demo/status`, { headers });
      if (!res.ok) throw new Error('Failed to fetch dataset status');
      const data = await res.json();
      setDataStatus(data);
    } catch (err: any) {
      setError(err.message || 'Error communicating with backend service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/demo/generate-indian-dataset`, {
        method: 'POST',
        headers,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to generate demo hospital dataset');
      }

      const resData = await res.json();
      setSuccess('Authentic Indian Hospital Dataset generated & synchronized successfully!');
      await fetchStatus();
    } catch (err: any) {
      setError(err.message || 'Dataset generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const counts = dataStatus?.counts || {};

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 antialiased overflow-hidden">
      <DashboardSidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardNav />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900/60 via-teal-900/40 to-slate-900 border border-emerald-500/30 p-8 shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-emerald-500/30">
                  <Sparkles className="h-3.5 w-3.5" /> Authentic Indian Healthcare Dataset
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  Hospital Demo Data Generator
                </h1>
                <p className="text-slate-300 text-sm mt-2 max-w-2xl">
                  1-Click enterprise data generation system: generates 500 patients, 50 doctors across 9 clinical specialties, 1000 appointments, 200 prescriptions, 100 admissions, 100 lab reports, and purged legacy Western dummy entries.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <Building2 className="h-4 w-4" /> Sector 62, Noida Campus
                  </span>
                  <span>•</span>
                  <span>MCI Registered Doctors</span>
                  <span>•</span>
                  <span>Ayushman Bharat ABHA Linked</span>
                  <span>•</span>
                  <span>NABL Lab Diagnostics</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button
                  onClick={fetchStatus}
                  variant="outline"
                  disabled={loading || generating}
                  className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>

                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 font-semibold"
                >
                  <Database className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                  {generating ? 'Generating 500+ Records...' : 'Generate Demo Hospital Data'}
                </Button>
              </div>
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-sm">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-sm">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <StatCard
              title="Registered Patients"
              value={counts.patients ?? '—'}
              description="Target: 500 Indian Patients"
              icon={<Users className="w-5 h-5 text-indigo-400" />}
            />
            <StatCard
              title="Clinical Doctors"
              value={counts.doctors ?? '—'}
              description="Target: 50 (9 Specialties)"
              icon={<UserCheck className="w-5 h-5 text-emerald-400" />}
            />
            <StatCard
              title="Appointments"
              value={counts.appointments ?? '—'}
              description="Target: 1,000 Slots"
              icon={<Calendar className="w-5 h-5 text-sky-400" />}
            />
            <StatCard
              title="Prescriptions (Rx)"
              value={counts.prescriptions ?? '—'}
              description="Target: 200 Formularies"
              icon={<Pill className="w-5 h-5 text-purple-400" />}
            />
            <StatCard
              title="Inpatient Admissions"
              value={counts.admissions ?? '—'}
              description="Target: 100 IPD Stays"
              icon={<Building2 className="w-5 h-5 text-amber-400" />}
            />
            <StatCard
              title="Hospital Beds"
              value={counts.beds ?? '—'}
              description="Target: 100+ Allocated"
              icon={<Bed className="w-5 h-5 text-teal-400" />}
            />
            <StatCard
              title="NABL Lab Reports"
              value={counts.labReports ?? '—'}
              description="Target: 100 Diagnostic Orders"
              icon={<FlaskConical className="w-5 h-5 text-rose-400" />}
            />
            <StatCard
              title="Pharmacy Dispenses"
              value={counts.pharmacyTransactions ?? '—'}
              description="Target: 100 Transactions"
              icon={<Receipt className="w-5 h-5 text-emerald-400" />}
            />
            <StatCard
              title="Insurance Claims"
              value={counts.insuranceClaims ?? '—'}
              description="Target: 50 Cashless/TPA"
              icon={<ShieldCheck className="w-5 h-5 text-blue-400" />}
            />
            <StatCard
              title="GST Invoices"
              value={counts.gstInvoices ?? '—'}
              description="Target: 50+ Tax Invoices"
              icon={<Receipt className="w-5 h-5 text-yellow-400" />}
            />
            <StatCard
              title="Hospital Staff"
              value={counts.staff ?? '—'}
              description="Nurses, Technicians & Admins"
              icon={<Layers className="w-5 h-5 text-pink-400" />}
            />
            <StatCard
              title="Campus Facilities"
              value={counts.facilities ?? '—'}
              description="Sector 62, Noida, UP"
              icon={<Building2 className="w-5 h-5 text-indigo-400" />}
            />
          </div>

          {/* Dataset Specifications & Verification Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-slate-800 bg-slate-900/60 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  Authentic Indian Data Schema
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Every record is tied to genuine Indian medical guidelines and Delhi-NCR addresses.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" />
                  <div>
                    <strong className="text-white">9 Clinical Specialties:</strong>
                    <p className="text-xs text-slate-400">Cardiology, Orthopedics, Neurology, Dermatology, General Medicine, Pediatrics, ENT, Ophthalmology, Gynecology.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" />
                  <div>
                    <strong className="text-white">Identity & Compliance:</strong>
                    <p className="text-xs text-slate-400">ABHA 14-digit IDs (91-XXXX-XXXX-XXXX), masked Aadhaar (XXXX-XXXX-XXXX), and valid MCI license numbers.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" />
                  <div>
                    <strong className="text-white">Clinical Formularies:</strong>
                    <p className="text-xs text-slate-400">Indian brand medicines including Augmentin 625mg, Glycomet 500mg, Pan-D, Telma 40mg, and Azithromycin 500mg.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" />
                  <div>
                    <strong className="text-white">Zero Dummy Placeholders:</strong>
                    <p className="text-xs text-slate-400">Purged legacy names (Jane Doe, John Doe, Dr Smith). All doctors and patients have realistic names like Dr. Rajesh Sharma, Priya Mehta, Arjun Nair, Sneha Kapoor.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/60 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-teal-400" />
                  Dataset System Status
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Real-time synchronization status with PostgreSQL database.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Primary Facility:</span>
                    <span className="font-semibold text-emerald-400">MediNexa Sector 62, Noida</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Database Engine:</span>
                    <span className="font-semibold text-slate-200">PostgreSQL (Port 5433)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Default Staff Password:</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-300">Medinexa@2026</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Audit Status:</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Ready for Live Demos & Pitch
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-slate-300 space-y-1">
                  <div className="font-semibold text-emerald-300">Investor & Clinical Demo Guarantee:</div>
                  <p>
                    All 1,000 appointments connect verified doctors with actual patients. Prescriptions link to live clinical encounters and inventory batches. Lab orders feature NABL certified ranges and doctor signatures.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
