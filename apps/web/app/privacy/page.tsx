'use client';

import React from 'react';
import Link from 'next/link';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';
import { Shield, ArrowLeft, Lock, Eye, Database, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-rose-500 selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <MediNexaLogo size="sm" subtitle="Legal & Privacy" theme="white" href="/" />
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <header className="space-y-3 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300 font-semibold">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Effective Date: October 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            MediNexa Privacy & Data Protection Policy
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            This Privacy Policy explains how MediNexa collects, protects, processes, and safeguards Protected Health Information (PHI) and personal data across our clinical enterprise platform.
          </p>
        </header>

        {/* Legal notice banner */}
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-3 text-xs text-indigo-200">
          <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Institutional Privacy & DPDPA 2023 Alignment:</p>
            <p className="text-indigo-200/80 leading-relaxed">
              MediNexa operates under strict data minimization, purpose limitation, and role-based access controls aligned with India&apos;s Digital Personal Data Protection Act (DPDPA 2023) and international HIPAA Security Rule technical safeguards. Individual hospitals may issue supplemental Notice of Privacy Practices.
            </p>
          </div>
        </div>

        {/* Section 1: Information Collected */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="text-emerald-400 font-mono">1.</span> Information We Collect & Process
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            In facilitating outpatient, inpatient, diagnostic, and clinical workflows, MediNexa processes the following categories of information:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-300">
            <li><strong className="text-white">Patient Demographics:</strong> Name, age, gender, blood group, contact phone, emergency contacts, ABHA number, and canonical Global Person ID / UHID.</li>
            <li><strong className="text-white">Clinical & Medical Records:</strong> Outpatient consultations, clinical diagnoses (ICD-10 aligned), electronic prescriptions, laboratory requisitions and test results, imaging reports, and vitals flowsheets.</li>
            <li><strong className="text-white">Inpatient & Nursing Telemetry:</strong> Ward admission details, bed assignments, Medication Administration Records (MAR), and nurse shift handovers.</li>
            <li><strong className="text-white">Financial & Billing Data:</strong> Itemized invoices, payment transaction IDs, GST breakdowns, and insurance claim pre-authorizations.</li>
            <li><strong className="text-white">Audit & Security Telemetry:</strong> Immutable audit logs recording authenticated user ID, role, facility context, accessed resource, and timestamp.</li>
          </ul>
        </section>

        {/* Section 2: Purpose of Processing */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="text-emerald-400 font-mono">2.</span> Purpose of Data Processing
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Personal and clinical data is collected and processed strictly for legitimate healthcare and operational purposes:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-300">
            <li>Delivering direct clinical care and maintaining longitudinal patient health histories.</li>
            <li>Coordinating inpatient admissions, bed allocation, and inter-departmental transfers.</li>
            <li>Verifying pharmacy dispensation and tracking medication adherence via MAR.</li>
            <li>Conducting pathology specimen tracking and verified lab report delivery.</li>
            <li>Processing digital billing transactions and generating authentic GST invoices.</li>
          </ul>
        </section>

        {/* Section 3: Technical Security Controls */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="text-emerald-400 font-mono">3.</span> Technical Security Controls & Encryption
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Encryption in Transit & At Rest</span>
              </div>
              <p className="text-[11px] text-slate-400">All API and database traffic is secured using TLS 1.3 and AES-256-GCM encryption.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span>Zero Trust Multi-Tenant Isolation</span>
              </div>
              <p className="text-[11px] text-slate-400">Hospital tenant guards strictly prevent Hospital A staff from querying Hospital B records.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Immutable PHI Audit Trail</span>
              </div>
              <p className="text-[11px] text-slate-400">Every lookup, export, or edit of medical data writes an indelible PostgreSQL audit event.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-rose-400" />
                <span>Strict HTTP Cache-Control</span>
              </div>
              <p className="text-[11px] text-slate-400">All PHI endpoints enforce &apos;no-store, no-cache, private&apos; headers to prevent proxy leakage.</p>
            </div>
          </div>
        </section>

        {/* Section 4: Patient Communication Controls */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="text-emerald-400 font-mono">4.</span> Medicine Communication & Notification Controls
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            MediNexa respects patient communication autonomy. Patients without mobile devices, or those who request communications disabled, can have automated medication reminders toggled OFF. Under this setting, the patient&apos;s medication adherence score is protected and never penalized for lack of digital confirmation.
          </p>
        </section>

        {/* Section 5: Data Retention & Access Rights */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="text-emerald-400 font-mono">5.</span> Patient Rights & Data Access
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Under DPDPA 2023, registered patients possess the right to access their electronic health records through the MediNexa Patient Portal, download digital copies of verified diagnostic and discharge summaries, review active consent authorizations, and request rectification of demographic records through hospital administration.
          </p>
        </section>

        {/* Section 6: Contact */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="text-emerald-400 font-mono">6.</span> Privacy Officer & Grievance Contact
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            For inquiries regarding personal data processing or to submit a grievance:
          </p>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
            <p className="font-bold text-white">Data Protection & Privacy Officer</p>
            <p>MediNexa Enterprise Healthcare Platform</p>
            <p>Knowledge Park II, Greater Noida, Uttar Pradesh - 201310</p>
            <p>Direct Grievance Helpline: +91 8114240263 | Email: privacy@medinexa.in</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} MediNexa Enterprise Platform. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:underline text-slate-400">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline text-slate-400">Terms of Service</Link>
            <Link href="/" className="hover:underline text-slate-400">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
