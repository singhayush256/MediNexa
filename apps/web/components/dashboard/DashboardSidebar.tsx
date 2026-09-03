'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Bed,
  Calendar,
  Stethoscope,
  HeartPulse,
  Activity,
  Truck,
  FlaskConical,
  Pill,
  CreditCard,
  Shield,
  Video,
  Bot,
  Briefcase,
  Package,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export interface DashboardSidebarProps {
  role?: string;
  className?: string;
}

export function DashboardSidebar({ role = 'STAFF', className = '' }: DashboardSidebarProps) {
  const pathname = usePathname();

  const navSections = [
    {
      title: 'Clinical Operations',
      links: [
        { title: 'Overview', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { title: 'Inpatient Wards', href: '/dashboard/admissions', icon: <Bed className="w-4 h-4" /> },
        { title: 'Patient Records', href: '/dashboard/patients', icon: <Users className="w-4 h-4" /> },
        { title: 'Appointments', href: '/dashboard/appointments', icon: <Calendar className="w-4 h-4" /> },
        { title: 'Doctor Station', href: '/dashboard/doctors', icon: <Stethoscope className="w-4 h-4" /> },
        { title: 'Nursing & MAR', href: '/dashboard/nursing', icon: <HeartPulse className="w-4 h-4" /> },
        { title: 'Emergency Room', href: '/dashboard/emergency', icon: <Activity className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Diagnostics & Telehealth',
      links: [
        { title: 'Laboratory', href: '/dashboard/lab', icon: <FlaskConical className="w-4 h-4" /> },
        { title: 'Pharmacy & Stock', href: '/dashboard/pharmacy', icon: <Pill className="w-4 h-4" /> },
        { title: 'Telemedicine', href: '/dashboard/telemedicine', icon: <Video className="w-4 h-4" /> },
        { title: 'Clinical AI Copilot', href: '/dashboard/copilot', icon: <Bot className="w-4 h-4" />, highlight: true },
      ],
    },
    {
      title: 'Hospital Management',
      links: [
        { title: 'EMS & Ambulances', href: '/dashboard/ambulance', icon: <Truck className="w-4 h-4" /> },
        { title: 'Billing & Invoices', href: '/dashboard/billing', icon: <CreditCard className="w-4 h-4" /> },
        { title: 'Insurance Claims', href: '/dashboard/insurance', icon: <Shield className="w-4 h-4" /> },
        { title: 'HRMS Workforce', href: '/dashboard/hrms', icon: <Briefcase className="w-4 h-4" /> },
        { title: 'Procurement', href: '/dashboard/procurement', icon: <Package className="w-4 h-4" /> },
        { title: 'Command Center', href: '/dashboard/command-center', icon: <Layers className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <aside
      className={`w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-colors ${className}`}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <span className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {section.title}
            </span>

            <div className="space-y-0.5 mt-1">
              {section.links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>
                        {link.icon}
                      </span>
                      <span>{link.title}</span>
                    </div>

                    {link.highlight && !isActive && (
                      <span className="px-1.5 py-0.2 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-black">
                        AI
                      </span>
                    )}

                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Patient Portal Switcher Link */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <Link
          href="/portal"
          className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20 hover:border-teal-500/40 transition group"
        >
          <div>
            <div className="text-[11px] font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              <span>Patient 24/7 Portal</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Switch to patient view
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-teal-600 dark:text-teal-400 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </aside>
  );
}
