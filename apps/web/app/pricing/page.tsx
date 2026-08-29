'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  const plans = [
    {
      code: 'STARTER',
      name: 'Starter Hospital & Clinic',
      badge: 'CLINICS & NURSING HOMES',
      monthlyPrice: 4999,
      yearlyPrice: 49990,
      description: 'Essential OPD, Patient EMR, and standard pharmacy management for emerging healthcare facilities.',
      beds: 'Up to 25 Beds',
      users: '10 Staff Accounts',
      doctors: '5 Doctors',
      patients: '500 Patients / mo',
      storage: '50 GB Cloud Storage',
      features: [
        'Digital OPD Walk-in Token Queue',
        'Electronic Medical Records (EMR)',
        'Basic Pharmacy Dispense Station',
        'Doctor Appointments & Scheduling',
        'Patient Medication Reminders',
        'Standard Email Support',
      ],
      popular: false,
      buttonText: 'Start 14-Day Trial',
      buttonLink: '/trial?plan=STARTER',
    },
    {
      code: 'PROFESSIONAL',
      name: 'Professional Hospital Center',
      badge: 'MOST POPULAR',
      monthlyPrice: 14999,
      yearlyPrice: 149990,
      description: 'Comprehensive Hospital Suite with IPD MAR, OT Surgery Suite, LIMS Lab, and PACS Radiology.',
      beds: 'Up to 100 Beds',
      users: '50 Staff Accounts',
      doctors: '25 Doctors',
      patients: '2,500 Patients / mo',
      storage: '250 GB Cloud Storage',
      features: [
        'Everything in Starter, plus:',
        'Inpatient (IPD) MAR & Bed Allocation',
        'Operation Theatre (OT) & WHO Checklists',
        'LIMS Diagnostic Lab & Specimen Barcoding',
        'PACS Radiology DICOM Imaging Workstation',
        'WebRTC HD Video Telemedicine Consultations',
        'Emergency ESI 1-5 Triage & Bedside Vitals',
        'Priority 24/7 Phone & Ticket Support',
      ],
      popular: true,
      buttonText: 'Start Free 14-Day Trial',
      buttonLink: '/trial?plan=PROFESSIONAL',
    },
    {
      code: 'ENTERPRISE',
      name: 'Enterprise Hospital Network',
      badge: 'MULTI-FACILITY NETWORKS',
      monthlyPrice: 49999,
      yearlyPrice: 499990,
      description: 'Unlimited Multi-Hospital Network with AI Clinical Copilot, C-Suite Command Center, and GPS EMS Dispatch.',
      beds: 'Unlimited Beds',
      users: 'Unlimited Staff',
      doctors: 'Unlimited Doctors',
      patients: 'Unlimited Patients',
      storage: '2 TB Dedicated Medical Vault',
      features: [
        'Everything in Professional, plus:',
        'AI Medical Scribe & Clinical SOAP Copilot',
        'C-Suite Executive KPI Command Center',
        'Enterprise EMS Ambulance Fleet & GPS CAD',
        'NABH & JCI Quality Audits & CAPA Lifecycle',
        'Hospital HRMS, Shifts & Biometric Payroll',
        'Supply Chain & Biomedical Asset Maintenance',
        'Dedicated Solutions Architect & 99.99% SLA',
      ],
      popular: false,
      buttonText: 'Contact Enterprise Sales',
      buttonLink: '/trial?plan=ENTERPRISE',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-rose-500 selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-2xl">🏥</span>
            <span className="font-black text-xl tracking-tight text-white">
              Medi<span className="text-rose-500">Nexa</span> <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 font-bold ml-1">SaaS</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs font-bold text-slate-300 hover:text-white transition">
              Sign In
            </Link>
            <Link href="/trial" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow transition">
              Start 14-Day Free Trial →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 text-center space-y-4">
        <span className="px-3.5 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider rounded-full">
          TRANSPARENT ENTERPRISE PRICING
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto">
          Modern SaaS Platform Built for World-Class Hospitals
        </h1>
        <p className="text-base text-slate-400 max-w-2xl mx-auto">
          Scale your healthcare network with flexible, predictable subscriptions. Zero hidden fees. Includes continuous regulatory NABH & HIPAA compliance updates.
        </p>

        {/* Monthly / Yearly Switcher */}
        <div className="pt-6 flex items-center justify-center gap-3">
          <span className={`text-xs font-bold ${billingCycle === 'MONTHLY' ? 'text-white' : 'text-slate-500'}`}>Monthly Billing</span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
            className="w-14 h-8 bg-slate-800 rounded-full p-1 border border-slate-700 transition relative"
          >
            <div
              className={`w-6 h-6 rounded-full bg-rose-500 transition-transform ${
                billingCycle === 'YEARLY' ? 'translate-x-6' : 'translate-x-0'
              }`}
            ></div>
          </button>
          <span className={`text-xs font-bold flex items-center gap-1.5 ${billingCycle === 'YEARLY' ? 'text-white' : 'text-slate-500'}`}>
            Annual Billing
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black rounded-full">
              SAVE 17% (2 MONTHS FREE)
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const price = billingCycle === 'YEARLY' ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
          return (
            <div
              key={plan.code}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all ${
                plan.popular
                  ? 'bg-slate-900 border-2 border-rose-500 shadow-2xl shadow-rose-950/50'
                  : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <div className="text-[11px] font-black text-rose-400 uppercase tracking-wider">{plan.badge}</div>
                  <h3 className="text-2xl font-black text-white mt-1">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{plan.description}</p>
                </div>

                <div className="border-y border-slate-800 py-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">₹{price.toLocaleString()}</span>
                    <span className="text-xs text-slate-400 font-bold">/ month</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-1">
                    {billingCycle === 'YEARLY' ? `Billed annually at ₹${plan.yearlyPrice.toLocaleString()}/yr` : 'Billed monthly + 18% GST'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold">BED CAPACITY</div>
                    <div className="font-extrabold text-white mt-0.5">{plan.beds}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold">STAFF USERS</div>
                    <div className="font-extrabold text-white mt-0.5">{plan.users}</div>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Included Modules:</div>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href={plan.buttonLink}
                  className={`w-full py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center shadow-md transition ${
                    plan.popular
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {plan.buttonText} →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
