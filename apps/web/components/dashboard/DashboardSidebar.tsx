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
  ChevronDown,
  Sparkles,
  FileText,
  ShieldCheck,
  Building2,
  BarChart3,
  Database,
  UploadCloud,
  MessageSquare,
  Zap,
  TrendingUp,
  BellRing,
  Scan,
  ShieldAlert,
  Clock,
  Settings,
  UserCheck,
  Wrench,
  FolderKanban,
  FileSpreadsheet,
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
  id: string;
  links: NavLinkItem[];
}

export function DashboardSidebar({ role: initialRole, className = '' }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [activeRole, setActiveRole] = useState(initialRole || 'STAFF');

  // Keep track of collapsed sections (default all expanded)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

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

  // Enterprise navigation hierarchy organized into logical collapsible categories
  const allSections: NavSection[] = [
    {
      title: 'Command Center',
      id: 'command_center',
      links: [
        {
          title: 'Executive Overview',
          href: '/dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'EXECUTIVE'],
        },
        {
          title: 'Live Operations',
          href: '/dashboard/command-center',
          icon: <Activity className="w-4 h-4" />,
          highlight: true,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'EXECUTIVE', 'DOCTOR', 'NURSE', 'EMS_OPERATOR', 'WARD_MANAGER', 'EMERGENCY_STAFF', 'AMBULANCE_DRIVER'],
        },
        {
          title: 'System Health & Alerts',
          href: '/dashboard/system-health',
          icon: <ShieldAlert className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'EXECUTIVE'],
        },
      ],
    },
    {
      title: 'People & Organization',
      id: 'people_org',
      links: [
        {
          title: 'Staff Management',
          href: '/dashboard/admin/staff',
          icon: <Users className="w-4 h-4" />,
          highlight: true,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
        },
        {
          title: 'Doctor Administration',
          href: '/dashboard/admin/doctors',
          icon: <Stethoscope className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
        },
        {
          title: 'Manager Administration',
          href: '/dashboard/admin/managers',
          icon: <Briefcase className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
        },
        {
          title: 'Staff HRMS & Leave',
          href: '/dashboard/hrms',
          icon: <Briefcase className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'HR_MANAGER', 'MANAGER', 'EXECUTIVE'],
        },
        {
          title: 'Doctor Directory',
          href: '/dashboard/doctors',
          icon: <Stethoscope className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR'],
        },
        {
          title: 'Manager Operations',
          href: '/dashboard/manager',
          icon: <LayoutDashboard className="w-4 h-4" />,
          highlight: true,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'MANAGER', 'HR_MANAGER', 'EXECUTIVE'],
        },
        {
          title: 'Nursing Stations',
          href: '/dashboard/nursing',
          icon: <HeartPulse className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'NURSE', 'WARD_MANAGER'],
        },
        {
          title: 'Departments',
          href: '/dashboard/admin/departments',
          icon: <FolderKanban className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
        },
        {
          title: 'Roles & Permissions',
          href: '/dashboard/admin/roles',
          icon: <ShieldCheck className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
        },
        {
          title: 'Shifts & Rosters',
          href: '/dashboard/admin/shifts',
          icon: <Clock className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'MANAGER', 'HR_MANAGER'],
        },
        {
          title: 'Staff Attendance',
          href: '/dashboard/admin/attendance',
          icon: <UserCheck className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'HR_MANAGER', 'MANAGER'],
        },
      ],
    },
    {
      title: 'Patient Operations',
      id: 'patient_ops',
      links: [
        {
          title: 'Assigned Patients',
          href: '/dashboard/patients',
          icon: <Users className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'WARD_MANAGER', 'BILLING_STAFF', 'INSURANCE_COORDINATOR', 'RADIOLOGIST', 'LAB_STAFF'],
        },
        {
          title: 'Appointment Booking',
          href: '/dashboard/appointments',
          icon: <Calendar className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'RECEPTIONIST'],
        },
        {
          title: 'Doctor Consultations',
          href: '/dashboard/doctor-appointments',
          icon: <Stethoscope className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'RECEPTIONIST'],
        },
        {
          title: 'Reception & Front Desk',
          href: '/dashboard/reception',
          icon: <Briefcase className="w-4 h-4" />,
          highlight: true,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'],
        },
        {
          title: 'Inpatient Wards & Admissions',
          href: '/dashboard/admissions',
          icon: <Bed className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'WARD_MANAGER'],
        },
        {
          title: 'Nursing & MAR',
          href: '/dashboard/nursing/mar',
          icon: <HeartPulse className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'NURSE', 'WARD_MANAGER'],
        },
        {
          title: 'Emergency Room',
          href: '/dashboard/emergency',
          icon: <Activity className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'NURSE', 'DOCTOR', 'EMERGENCY_STAFF', 'EMS_OPERATOR'],
        },
        {
          title: 'Emergency SOS & Fleet',
          href: '/dashboard/emergency-ambulance',
          icon: <Truck className="w-4 h-4" />,
          highlight: true,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'EMS_OPERATOR', 'AMBULANCE_DRIVER', 'EMERGENCY_STAFF'],
        },
      ],
    },
    {
      title: 'Diagnostics & Prescriptions',
      id: 'diagnostics_rx',
      links: [
        {
          title: 'Radiology & PACS',
          href: '/dashboard/radiology',
          icon: <Scan className="w-4 h-4" />,
          highlight: true,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'RADIOLOGIST', 'DOCTOR', 'LAB_STAFF'],
        },
        {
          title: 'Lab Reports',
          href: '/dashboard/lab',
          icon: <FlaskConical className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'LAB_STAFF', 'LAB_TECH', 'LAB_TECHNICIAN', 'DOCTOR', 'RADIOLOGIST'],
        },
        {
          title: 'Pharmacy Module',
          href: '/dashboard/pharmacy',
          icon: <Pill className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'PHARMACY_STAFF', 'PHARMACIST'],
        },
        {
          title: 'Doctor Prescriptions',
          href: '/dashboard/pharmacy/prescriptions',
          icon: <FileText className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'PHARMACY_STAFF', 'PHARMACIST'],
        },
        {
          title: 'Medication Reminders',
          href: '/dashboard/medication-reminders',
          icon: <BellRing className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'PHARMACY_STAFF', 'PHARMACIST'],
        },
      ],
    },
    {
      title: 'Finance & Claims',
      id: 'finance_claims',
      links: [
        {
          title: 'Hospital Revenue',
          href: '/dashboard/revenue',
          icon: <TrendingUp className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'BILLING_STAFF', 'EXECUTIVE'],
        },
        {
          title: 'Patient Billing & Invoices',
          href: '/dashboard/billing',
          icon: <CreditCard className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'BILLING_STAFF', 'EXECUTIVE'],
        },
        {
          title: 'Claims Management',
          href: '/dashboard/insurance',
          icon: <Shield className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'INSURANCE_COORDINATOR', 'INSURANCE_STAFF', 'BILLING_STAFF', 'EXECUTIVE'],
        },
        {
          title: 'Procurement Payments',
          href: '/dashboard/procurement/payments',
          icon: <CreditCard className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'BILLING_STAFF', 'EXECUTIVE'],
        },
      ],
    },
    {
      title: 'Resources & Assets',
      id: 'resources_assets',
      links: [
        {
          title: 'Procurement',
          href: '/dashboard/procurement',
          icon: <Package className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'EXECUTIVE'],
        },
        {
          title: 'Pharmacy Inventory',
          href: '/dashboard/inventory',
          icon: <Package className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'PHARMACY_STAFF', 'PHARMACIST'],
        },
        {
          title: 'Equipment & Medical Assets',
          href: '/dashboard/admin/assets',
          icon: <Wrench className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
        },
        {
          title: 'Live Bed Management',
          href: '/dashboard/hospital/beds',
          icon: <Bed className="w-4 h-4" />,
          highlight: true,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'WARD_MANAGER', 'EMERGENCY_STAFF', 'EXECUTIVE'],
        },
        {
          title: 'Ward Operations & Staffing',
          href: '/dashboard/ward-manager',
          icon: <Layers className="w-4 h-4" />,
          highlight: true,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'WARD_MANAGER', 'NURSE'],
        },
        {
          title: 'Bed Booking Queue',
          href: '/dashboard/bed-bookings',
          icon: <FileText className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'NURSE', 'RECEPTIONIST', 'WARD_MANAGER'],
        },
        {
          title: 'Nearby Hospital Network',
          href: '/dashboard/nearby-hospitals',
          icon: <Building2 className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'EMS_OPERATOR', 'AMBULANCE_DRIVER'],
        },
      ],
    },
    {
      title: 'Analytics & Specialized AI',
      id: 'analytics_ai',
      links: [
        {
          title: 'Advanced Analytics',
          href: '/dashboard/analytics',
          icon: <BarChart3 className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'EXECUTIVE'],
        },
        {
          title: 'AI Occupancy Forecast',
          href: '/dashboard/ai/occupancy-forecast',
          icon: <TrendingUp className="w-4 h-4" />,
          highlight: true,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'WARD_MANAGER', 'EXECUTIVE'],
        },
        {
          title: 'Patient Digital Twin',
          href: '/dashboard/patients/digital-twin',
          icon: <Sparkles className="w-4 h-4" />,
          highlight: true,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'WARD_MANAGER'],
        },
        {
          title: 'Health Score 2.0',
          href: '/dashboard/health-score',
          icon: <HeartPulse className="w-4 h-4" />,
          highlight: true,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'WARD_MANAGER', 'RECEPTIONIST'],
        },
        {
          title: 'Clinical AI Copilot',
          href: '/dashboard/copilot',
          icon: <Bot className="w-4 h-4" />,
          highlight: true,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE'],
        },
        {
          title: 'AI Predictive Health Engine',
          href: '/dashboard/ai/predictive-health',
          icon: <Sparkles className="w-4 h-4" />,
          highlight: true,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'WARD_MANAGER'],
        },
        {
          title: 'AI Inventory Forecast',
          href: '/dashboard/pharmacy/forecasting',
          icon: <TrendingUp className="w-4 h-4" />,
          highlight: true,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'PHARMACY_STAFF', 'PHARMACIST'],
        },
        {
          title: 'Telemedicine',
          href: '/dashboard/telemedicine',
          icon: <Video className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR'],
        },
        {
          title: 'EHR Records Ingestion',
          href: '/dashboard/records/import',
          icon: <UploadCloud className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'RADIOLOGIST'],
        },
      ],
    },
    {
      title: 'Administration',
      id: 'administration',
      links: [
        {
          title: 'Hospital Profile',
          href: '/dashboard/admin/hospital-profile',
          icon: <Building2 className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
        },
        {
          title: 'Hospital Settings',
          href: '/dashboard/admin/settings',
          icon: <Settings className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
        },
        {
          title: 'Documents & Templates',
          href: '/dashboard/admin/templates',
          icon: <FileSpreadsheet className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
        },
        {
          title: 'Notifications Hub',
          href: '/dashboard/notifications',
          icon: <BellRing className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
        },
        {
          title: 'ABDM & Consent Gateway',
          href: '/dashboard/abdm',
          icon: <ShieldCheck className="w-4 h-4" />,
          highlight: true,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'EXECUTIVE'],
        },
        {
          title: 'Quality & Compliance',
          href: '/dashboard/quality',
          icon: <ShieldCheck className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
        },
        {
          title: 'Audit Trail Logs',
          href: '/dashboard/admin/audit-logs',
          icon: <ShieldCheck className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
        },
        {
          title: 'Security & SOC Center',
          href: '/dashboard/security',
          icon: <ShieldAlert className="w-4 h-4 text-emerald-400" />,
          highlight: true,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'EXECUTIVE'],
        },
        {
          title: 'Disaster Recovery & Backup',
          href: '/dashboard/admin/backup',
          icon: <Database className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
        },
        {
          title: 'SMS Gateway (DLT)',
          href: '/dashboard/admin/sms',
          icon: <MessageSquare className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
        },
        {
          title: 'Hospital Demo Dataset',
          href: '/dashboard/admin/demo-data',
          icon: <Database className="w-4 h-4" />,
          allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
        },
      ],
    },
    {
      title: 'Platform Super Admin',
      id: 'super_admin_control',
      links: [
        {
          title: 'Multi-Tenant Console',
          href: '/super-admin',
          icon: <Building2 className="w-4 h-4" />,
          allowedRoles: ['SUPER_ADMIN', 'MEDINEXA_ADMIN'],
        },
      ],
    },
  ];

  // STRICT ENTERPRISE RBAC FILTER: Completely hide unauthorized menu items
  const visibleSections = allSections
    .map((section) => ({
      ...section,
      links: section.links.filter((link) => {
        if (isSuperAdmin) {
          return true;
        }
        if (isAdmin) {
          // Admin can see everything EXCEPT Super Admin exclusive console
          if (link.href === '/super-admin') return false;
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {visibleSections.map((section) => {
          const isCollapsed = !!collapsedSections[section.id];
          return (
            <div key={section.id} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer select-none"
              >
                <span>{section.title}</span>
                {isCollapsed ? (
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                )}
              </button>

              {!isCollapsed && (
                <div className="space-y-0.5 mt-0.5">
                  {section.links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className={isActive ? 'text-white' : 'text-slate-400'}>
                            {link.icon}
                          </span>
                          <span className="truncate">{link.title}</span>
                        </div>

                        {link.highlight && !isActive && (
                          <span className="px-1.5 py-0.2 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-black shrink-0">
                            AI
                          </span>
                        )}

                        {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70 shrink-0" />}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
