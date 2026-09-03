'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Command,
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  Activity,
  Bed,
  FlaskConical,
  Pill,
  Shield,
  CreditCard,
  Video,
  Bot,
  Truck,
  HeartPulse,
  Moon,
  LogOut,
  Building,
  Briefcase,
  Package,
} from 'lucide-react';
import { normalizeRoleCode } from '@medinexa/validation';

interface PaletteItem {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  allowedRoles?: string[];
  href?: string;
  action?: () => void;
  shortcut?: string;
}

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [userRole, setUserRole] = useState('STAFF');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rawUser = localStorage.getItem('medinexa_user');
      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          const r = parsed.roleCode || (parsed.role && parsed.role.code) || parsed.role;
          if (r) setUserRole(normalizeRoleCode(r));
        } catch (e) {}
      }
    }
  }, [isOpen]);

  // Register Ctrl+K / Cmd+K listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const isSuperAdmin = userRole === 'MEDINEXA_ADMIN';

  const allItems: PaletteItem[] = useMemo(
    () => [
      // Navigation
      {
        id: 'dash',
        title: 'Command Center & Overview',
        category: 'Dashboards',
        icon: <LayoutDashboard className="w-4 h-4" />,
        href: '/dashboard',
        allowedRoles: ['*'],
      },
      {
        id: 'admissions',
        title: 'Inpatient Admissions & Wards',
        category: 'Clinical',
        icon: <Bed className="w-4 h-4" />,
        href: '/dashboard/admissions',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'RECEPTIONIST', 'NURSE', 'DOCTOR'],
      },
      {
        id: 'patients',
        title: 'Patient Directory & Records',
        category: 'Clinical',
        icon: <Users className="w-4 h-4" />,
        href: '/dashboard/patients',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'RECEPTIONIST', 'NURSE', 'DOCTOR'],
      },
      {
        id: 'appointments',
        title: 'Appointments & Scheduling',
        category: 'Clinical',
        icon: <Calendar className="w-4 h-4" />,
        href: '/dashboard/appointments',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'],
      },
      {
        id: 'doctors',
        title: 'Physicians & Doctors Directory',
        category: 'Clinical',
        icon: <Stethoscope className="w-4 h-4" />,
        href: '/dashboard/doctors',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'DOCTOR'],
      },
      {
        id: 'nursing',
        title: 'Nursing Station & MAR Vitals',
        category: 'Clinical',
        icon: <HeartPulse className="w-4 h-4" />,
        href: '/dashboard/nursing',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'NURSE', 'DOCTOR'],
      },
      {
        id: 'emergency',
        title: 'Emergency Room & Trauma Triage',
        category: 'Operations',
        icon: <Activity className="w-4 h-4" />,
        href: '/dashboard/emergency',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'NURSE', 'DOCTOR', 'RECEPTIONIST'],
      },
      {
        id: 'ambulance',
        title: 'EMS Fleet & Ambulance Tracking',
        category: 'Operations',
        icon: <Truck className="w-4 h-4" />,
        href: '/dashboard/ambulance',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'AMBULANCE_DRIVER', 'RECEPTIONIST'],
      },
      {
        id: 'lab',
        title: 'Laboratory & Pathology Analyzers',
        category: 'Diagnostics',
        icon: <FlaskConical className="w-4 h-4" />,
        href: '/dashboard/lab',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'LAB_STAFF', 'DOCTOR'],
      },
      {
        id: 'pharmacy',
        title: 'Pharmacy & Formulary Inventory',
        category: 'Diagnostics',
        icon: <Pill className="w-4 h-4" />,
        href: '/dashboard/pharmacy',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'PHARMACY_STAFF', 'DOCTOR'],
      },
      {
        id: 'billing',
        title: 'Billing, Invoices & Payments',
        category: 'Financial',
        icon: <CreditCard className="w-4 h-4" />,
        href: '/dashboard/billing',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'BILLING_STAFF', 'INSURANCE_COORDINATOR'],
      },
      {
        id: 'insurance',
        title: 'Insurance Claims & TPA Pre-Auth',
        category: 'Financial',
        icon: <Shield className="w-4 h-4" />,
        href: '/dashboard/insurance',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'INSURANCE_COORDINATOR', 'BILLING_STAFF'],
      },
      {
        id: 'hrms',
        title: 'HRMS Workforce & Staff Attendance',
        category: 'Management',
        icon: <Briefcase className="w-4 h-4" />,
        href: '/dashboard/hrms',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'HR_MANAGER'],
      },
      {
        id: 'procurement',
        title: 'Hospital Procurement & POs',
        category: 'Management',
        icon: <Package className="w-4 h-4" />,
        href: '/dashboard/procurement',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'PHARMACY_STAFF'],
      },
      {
        id: 'telemed',
        title: 'Telemedicine Virtual Suite',
        category: 'Clinical',
        icon: <Video className="w-4 h-4" />,
        href: '/dashboard/telemedicine',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'DOCTOR'],
      },
      {
        id: 'copilot',
        title: 'Clinical AI Copilot & Assistant',
        category: 'AI & Tools',
        icon: <Bot className="w-4 h-4" />,
        href: '/dashboard/copilot',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'DOCTOR', 'NURSE'],
      },
      // Actions
      {
        id: 'toggle-theme',
        title: 'Toggle Light / Dark Mode',
        category: 'Quick Actions',
        icon: <Moon className="w-4 h-4 text-amber-500" />,
        action: () => {
          const isDark = document.documentElement.classList.contains('dark');
          if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('medinexa_theme', 'light');
          } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('medinexa_theme', 'dark');
          }
        },
      },
      {
        id: 'logout',
        title: 'Log Out of MediNexa',
        category: 'Quick Actions',
        icon: <LogOut className="w-4 h-4 text-rose-500" />,
        action: () => {
          localStorage.removeItem('medinexa_token');
          localStorage.removeItem('token');
          localStorage.removeItem('medinexa_user');
          document.cookie = 'medinexa_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          router.push('/login');
        },
      },
    ],
    [router],
  );

  // Role filter: only include items user is authorized to access
  const roleFilteredItems = useMemo(() => {
    return allItems.filter(
      (item) =>
        !item.allowedRoles ||
        isSuperAdmin ||
        item.allowedRoles.includes('*') ||
        item.allowedRoles.some((r) => normalizeRoleCode(r) === userRole),
    );
  }, [allItems, isSuperAdmin, userRole]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return roleFilteredItems;
    const q = query.toLowerCase();
    return roleFilteredItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q),
    );
  }, [roleFilteredItems, query]);

  const handleSelect = (item: PaletteItem) => {
    setIsOpen(false);
    setQuery('');
    if (item.action) item.action();
    else if (item.href) router.push(item.href);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Arrow key navigation
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((idx) => (idx + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(
          (idx) => (idx - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1),
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [isOpen, filteredItems, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            autoFocus
            type="text"
            placeholder="Search clinical modules, navigation or commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching modules or actions found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isSelected ? 'text-white' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span className="text-xs font-semibold">{item.title}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="font-mono text-[10px]">MediNexa Workstation</span>
        </div>
      </div>
    </div>
  );
}
