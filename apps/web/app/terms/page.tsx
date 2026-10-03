'use client';

import React from 'react';
import Link from 'next/link';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';
import { Shield, ArrowLeft, FileText, Lock, AlertCircle } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-rose-500 selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <MediNexaLogo size="sm" subtitle="Legal & Governance" theme="white" href="/" />
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
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Effective Date: October 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            MediNexa Terms of Service
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Please read these terms carefully before accessing or using the MediNexa healthcare enterprise operating platform, patient portal, or clinical modules.
          </p>
        </header>

        {/* Legal notice banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Notice & Legal Review Disclaimer:</p>
            <p className="text-amber-200/80 leading-relaxed">
              This document outlines standard terms of service aligned with Digital Personal Data Protection Act (DPDPA 2023) and healthcare IT operational standards. Final deployment is subject to institutional legal review and facility-specific service agreements.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="text-rose-400 font-mono">1.</span> Acceptance of Terms
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            By creating an account, accessing any portal (Patient, Doctor, Nurse, Laboratory, Pharmacy, Reception, Manager, or Admin), or using any API endpoint provided by MediNexa Enterprise Healthcare Platform (&quot;MediNexa&quot;, &quot;we&quot;, &quot;us&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not access or use the platform.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="text-rose-400 font-mono">2.</span> Clinical Disclaimer & Medical Judgment
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            MediNexa is an electronic health records (EHR), hospital information management system (HIMS), and clinical workflow orchestration platform. While MediNexa provides clinical decision support tools, AI preliminary copilot insights, and drug-interaction screening, all final clinical diagnostic decisions, prescriptions, treatment regimens, and discharge determinations remain the sole responsibility of licensed attending healthcare professionals. MediNexa does not practice medicine.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="text-rose-400 font-mono">3.</span> User Accounts & Authentication Security
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Authorized hospital personnel and registered patients must protect their login credentials, 2FA authenticator tokens, and sessions. Sharing of staff login credentials or unauthorized elevation of privileges is strictly prohibited. The system enforces immutable audit logging on all access to Protected Health Information (PHI).
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="text-rose-400 font-mono">4.</span> Patient Identity & Cross-Hospital Continuity
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Each patient registered on the MediNexa ecosystem is issued a permanent Global Person ID / UHID. Hospital-specific registrations and MRNs remain facility-scoped. Cross-facility sharing of medical summaries is conducted strictly under role-based authorization, legitimate clinical referral workflows, or patient-directed consent.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="text-rose-400 font-mono">5.</span> Payment Gateway & Billing Transactions
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Digital payments processed through integrated payment gateways (including Razorpay) utilize cryptographic HMAC-SHA256 signature verification. Official GST tax invoices and receipts generated on the platform reflect applicable Indian taxation codes (SAC 999311/999312 for healthcare services and HSN 3004 for pharmaceuticals).
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="text-rose-400 font-mono">6.</span> Privacy & Data Protection Alignment
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            MediNexa implements technical and organizational safeguards designed to align with the Digital Personal Data Protection Act (DPDPA 2023), HIPAA Security Rule guidelines (45 CFR § 164.312), and Ayushman Bharat Digital Mission (ABDM) integration protocols. For complete details on data processing, please consult our{' '}
            <Link href="/privacy" className="text-rose-400 hover:underline font-semibold">
              Privacy Policy
            </Link>.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="text-rose-400 font-mono">7.</span> Contact & Grievance Redressal
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            For operational inquiries, institutional licensing, or data protection questions:
          </p>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
            <p className="font-bold text-white">MediNexa Enterprise Healthcare Platform</p>
            <p>Knowledge Park II, Greater Noida, Uttar Pradesh - 201310</p>
            <p>Support Helpline: +91 8114240263 | Email: contact@medinexa.in</p>
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
