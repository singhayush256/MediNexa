'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  const plans = [
    {
      code: 'STARTER',
      name: 'Starter OPD & Clinic',
      badge: 'SOLO & DAY CARE',
      monthlyPrice: 2999,
      yearlyPrice: 29990,
      description: 'Essential OPD, digital queue, and basic electronic medical records for solo practitioners.',
      beds: 'Up to 10 Beds / OPD',
      users: '5 Staff Accounts',
      doctors: '3 Doctors',
      patients: '300 Patients / mo',
      storage: '25 GB Cloud Storage',
      features: [
        'Digital Walk-in Token Queue',
        'Electronic Medical Records (EMR)',
        'Basic Prescription Dispense',
        'Doctor Appointment Calendar',
        'Patient SMS / WhatsApp Alerts',
        'Email Technical Support',
      ],
      popular: false,
      buttonText: 'Start 14-Day Trial',
      buttonLink: '/trial?plan=STARTER',
    },
    {
      code: 'CLINIC',
      name: 'Clinic & Nursing Home',
      badge: 'POLYCLINICS & NURSING',
      monthlyPrice: 6999,
      yearlyPrice: 69990,
      description: 'Comprehensive clinic workflow with bedside vitals, emergency intake, and integrated pharmacy.',
      beds: 'Up to 35 Beds',
      users: '15 Staff Accounts',
      doctors: '8 Doctors',
      patients: '1,200 Patients / mo',
      storage: '100 GB Cloud Storage',
      features: [
        'Everything in Starter, plus:',
        'Inpatient Admission & Ward Tracking',
        'Nursing Medication Administration (MAR)',
        'Point-of-Sale Pharmacy & Inventory',
        'Diagnostic Lab Test Requisitions',
        'Basic Billing & Invoicing (GST/Tax)',
        'Priority Ticket Support',
      ],
      popular: false,
      buttonText: 'Start 14-Day Trial',
      buttonLink: '/trial?plan=CLINIC',
    },
    {
      code: 'HOSPITAL',
      name: 'Hospital Center',
      badge: 'MOST POPULAR',
      monthlyPrice: 19999,
      yearlyPrice: 199990,
      description: 'Full-fledged hospital suite with LIMS Lab, PACS Radiology, AI Predictive Health, and Emergency Dispatch.',
      beds: 'Up to 150 Beds',
      users: '60 Staff Accounts',
      doctors: '30 Doctors',
      patients: '5,000 Patients / mo',
      storage: '500 GB Cloud Storage',
      features: [
        'Everything in Clinic, plus:',
        'AI Predictive Health & Clinical Copilot',
        'LIMS Diagnostic Lab with Barcode Tracking',
        'PACS Radiology DICOM Viewer Suite',
        'Live Bed Management & Nearby Finder',
        'Emergency SOS & Ambulance Dispatch',
        'Insurance Pre-Auth & Claims Workflow',
        '24/7 Dedicated Support & SLA',
      ],
      popular: true,
      buttonText: 'Start Free 14-Day Trial',
      buttonLink: '/trial?plan=HOSPITAL',
    },
    {
      code: 'ENTERPRISE',
      name: 'Enterprise Hospital Network',
      badge: 'MULTI-FACILITY NETWORKS',
      monthlyPrice: 49999,
      yearlyPrice: 499990,
      description: 'Unlimited multi-tenant healthcare enterprise system with custom AI models, C-suite command center, and custom integrations.',
      beds: 'Unlimited Beds',
      users: 'Unlimited Staff',
      doctors: 'Unlimited Doctors',
      patients: 'Unlimited Patients',
      storage: '2 TB Dedicated Medical Vault',
      features: [
        'Everything in Hospital, plus:',
        'Multi-Hospital Tenant Isolation',
        'C-Suite Executive KPI Command Center',
        'Enterprise EMS Fleet Telematics & GPS CAD',
        'NABH / JCI Regulatory Audit Trails & CAPA',
        'Hospital HRMS, Shift Roster & Payroll',
        'Custom EHR & Lab Machine Integrations',
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
          <MediNexaLogo size="sm" subtitle="v3.0 SaaS" theme="white" href="/" />
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
          TRANSPARENT ENTERPRISE PRICING (V3.0)
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto">
          Predictable Cloud Subscriptions for Modern Healthcare
        </h1>
        <p className="text-base text-slate-400 max-w-2xl mx-auto">
          Scale from solo clinics to multi-facility enterprise hospital networks. Complete with real-time bed tracking, AI clinical decision support, and strict HIPAA/NABH compliance.
        </p>

        {/* Monthly / Yearly Switcher */}
        <div className="pt-6 flex items-center justify-center gap-3">
          <span className={`text-xs font-bold ${billingCycle === 'MONTHLY' ? 'text-white' : 'text-slate-500'}`}>Monthly Billing</span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
            className="w-14 h-8 bg-slate-800 rounded-full p-1 border border-slate-700 transition relative"
            aria-label="Toggle annual billing"
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

      {/* Pricing Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const price = billingCycle === 'YEARLY' ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
          return (
            <div
              key={plan.code}
              className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all ${
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

              <div className="space-y-5">
                <div>
                  <div className="text-[10px] font-black text-rose-400 uppercase tracking-wider">{plan.badge}</div>
                  <h3 className="text-xl font-black text-white mt-1">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{plan.description}</p>
                </div>

                <div className="border-y border-slate-800 py-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">₹{price.toLocaleString()}</span>
                    <span className="text-xs text-slate-400 font-bold">/ mo</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-1">
                    {billingCycle === 'YEARLY' ? `Billed annually at ₹${plan.yearlyPrice.toLocaleString()}/yr` : 'Billed monthly (GST included)'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-800">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">Bed Capacity</div>
                    <div className="font-extrabold text-white text-xs mt-0.5">{plan.beds}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-800">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">Staff Seats</div>
                    <div className="font-extrabold text-white text-xs mt-0.5">{plan.users}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Included Capabilities:</div>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href={plan.buttonLink}
                  className={`w-full py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center shadow-md transition ${
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
