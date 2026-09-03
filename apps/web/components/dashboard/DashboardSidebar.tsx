'use client';

import React, { useEffect, useState } from 'react';
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
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { normalizeRoleCode } from '@medinexa/validation';

export interface DashboardSidebarProps {
  role?: string;
  className?: string;
}

interface NavLinkItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  allowedRoles: string[];
  highlight?: boolean;
}

interface NavSection {
  title: string;
  links: NavLinkItem[];
}

export function DashboardSidebar({ role: initialRole, className = '' }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [activeRole, setActiveRole] = useState(initialRole || 'STAFF');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rawUser = localStorage.getItem('medinexa_user');
      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          const r = parsed.roleCode || (parsed.role && parsed.role.code) || parsed.role;
          if (r) setActiveRole(r);
        } catch (e) {}
      }
    }
  }, [initialRole]);

  const userRole = normalizeRoleCode(activeRole);
  const isSuperAdmin = ['MEDINEXA_ADMIN', 'SUPER_ADMIN'].includes(userRole);
  const isAdmin = ['HOSPITAL_ADMIN', 'ADMIN', 'MEDINEXA_ADMIN', 'SUPER_ADMIN'].includes(userRole);

  // Define enterprise navigation structure with strict role authorization
  const allSections: NavSection[] = [
    {
      title: 'Clinical Operations',
      links: [
        {
          title: 'Executive Overview',
          href: '/dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
        },
        {
          title: 'Assigned Patients',
          href: '/dashboard/patients',
          icon: <Users className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
        },
        {
          title: 'Appointment Booking',
          href: '/dashboard/appointments',
          icon: <Calendar className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'RECEPTIONIST'],
        },
        {
          title: 'Doctor Consultations',
          href: '/dashboard/doctors',
          icon: <Stethoscope className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR'],
        },
        {
          title: 'Inpatient Wards',
          href: '/dashboard/admissions',
          icon: <Bed className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
        },
        {
          title: 'Nursing & MAR',
          href: '/dashboard/nursing',
          icon: <HeartPulse className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'NURSE'],
        },
        {
          title: 'Emergency Room',
          href: '/dashboard/emergency',
          icon: <Activity className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'NURSE', 'DOCTOR'],
        },
      ],
    },
    {
      title: 'Diagnostics & Prescriptions',
      links: [
        {
          title: 'Lab Reports',
          href: '/dashboard/lab',
          icon: <FlaskConical className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'LAB_STAFF', 'DOCTOR'],
        },
        {
          title: 'Pharmacy Module',
          href: '/dashboard/pharmacy',
          icon: <Pill className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'PHARMACY_STAFF'],
        },
        {
          title: 'Doctor Prescriptions',
          href: '/dashboard/pharmacy/prescriptions',
          icon: <FileText className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR'],
        },
        {
          title: 'Telemedicine',
          href: '/dashboard/telemedicine',
          icon: <Video className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR'],
        },
        {
          title: 'Clinical AI Copilot',
          href: '/dashboard/copilot',
          icon: <Bot className="w-4 h-4" />,
          highlight: true,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE'],
        },
      ],
    },
    {
      title: 'Hospital Management',
      links: [
        {
          title: 'Hospital Revenue',
          href: '/dashboard/revenue',
          icon: <CreditCard className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'BILLING_STAFF'],
        },
        {
          title: 'Claims Management',
          href: '/dashboard/insurance',
          icon: <Shield className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'INSURANCE_COORDINATOR'],
        },
        {
          title: 'Staff Management (HRMS)',
          href: '/dashboard/hrms',
          icon: <Briefcase className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'],
        },
        {
          title: 'Procurement',
          href: '/dashboard/procurement',
          icon: <Package className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
        },
        {
          title: 'Admin Command Center',
          href: '/dashboard/command-center',
          icon: <Layers className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
        },
        {
          title: 'Audit Trail Logs',
          href: '/dashboard/admin/audit-logs',
          icon: <ShieldCheck className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
        },
      ],
    },
  ];

  // STRICT ENTERPRISE RBAC FILTER: Completely hide unauthorized menu items
  const visibleSections = allSections
    .map((section) => ({
      ...section,
      links: section.links.filter((link) => {
        if (isSuperAdmin || isAdmin) {
          return true;
        }
        return link.allowedRoles.some((allowed) => normalizeRoleCode(allowed) === userRole);
      }),
    }))
    .filter((section) => section.links.length > 0);

  return (
    <aside
      className={`w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-colors ${className}`}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {visibleSections.map((section, sIdx) => (
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
    </aside>
  );
}
