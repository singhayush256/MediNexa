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
  Building2,
  Briefcase,
  Package,
  FileText,
  Layers,
  UserCheck,
  Loader2,
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
  badge?: string;
}

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [userRole, setUserRole] = useState('STAFF');
  const [backendResults, setBackendResults] = useState<PaletteItem[]>([]);
  const [isSearchingBackend, setIsSearchingBackend] = useState(false);

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
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
      },
      {
        id: 'patients',
        title: 'Assigned Patients & Directory',
        category: 'Clinical',
        icon: <Users className="w-4 h-4" />,
        href: '/dashboard/patients',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
      },
      {
        id: 'appointments',
        title: 'Appointments & Scheduling',
        category: 'Clinical',
        icon: <Calendar className="w-4 h-4" />,
        href: '/dashboard/appointments',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'RECEPTIONIST'],
      },
      {
        id: 'doctors',
        title: 'Doctor Consultations & OPD Station',
        category: 'Clinical',
        icon: <Stethoscope className="w-4 h-4" />,
        href: '/dashboard/doctors',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR'],
      },
      {
        id: 'nursing',
        title: 'Nursing Station & MAR Vitals',
        category: 'Clinical',
        icon: <HeartPulse className="w-4 h-4" />,
        href: '/dashboard/nursing',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'NURSE'],
      },
      {
        id: 'emergency',
        title: 'Emergency Room & Trauma Triage',
        category: 'Operations',
        icon: <Activity className="w-4 h-4" />,
        href: '/dashboard/emergency',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'NURSE', 'DOCTOR'],
      },
      {
        id: 'ambulance',
        title: 'EMS Fleet & Ambulance Tracking',
        category: 'Operations',
        icon: <Truck className="w-4 h-4" />,
        href: '/dashboard/ambulance',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'AMBULANCE_DRIVER', 'EMS_OPERATOR'],
      },
      {
        id: 'lab',
        title: 'Laboratory & Pathology Analyzers',
        category: 'Diagnostics',
        icon: <FlaskConical className="w-4 h-4" />,
        href: '/dashboard/lab',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'LAB_STAFF', 'DOCTOR'],
      },
      {
        id: 'pharmacy',
        title: 'Pharmacy Module & Dispensary',
        category: 'Diagnostics',
        icon: <Pill className="w-4 h-4" />,
        href: '/dashboard/pharmacy',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'PHARMACY_STAFF'],
      },
      {
        id: 'prescriptions',
        title: 'Doctor Prescriptions & Orders',
        category: 'Clinical',
        icon: <FileText className="w-4 h-4" />,
        href: '/dashboard/pharmacy/prescriptions',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR'],
      },
      {
        id: 'revenue',
        title: 'Hospital Revenue & Financial Health',
        category: 'Financial',
        icon: <CreditCard className="w-4 h-4" />,
        href: '/dashboard/revenue',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'BILLING_STAFF'],
      },
      {
        id: 'billing',
        title: 'Billing, Invoices & Payments',
        category: 'Financial',
        icon: <CreditCard className="w-4 h-4" />,
        href: '/dashboard/billing',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'BILLING_STAFF', 'INSURANCE_COORDINATOR'],
      },
      {
        id: 'insurance',
        title: 'Insurance Claims & TPA Pre-Auth',
        category: 'Financial',
        icon: <Shield className="w-4 h-4" />,
        href: '/dashboard/insurance',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'INSURANCE_COORDINATOR'],
      },
      {
        id: 'hrms',
        title: 'HRMS Workforce & Staff Attendance',
        category: 'Management',
        icon: <Briefcase className="w-4 h-4" />,
        href: '/dashboard/hrms',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'],
      },
      {
        id: 'procurement',
        title: 'Hospital Procurement & POs',
        category: 'Management',
        icon: <Package className="w-4 h-4" />,
        href: '/dashboard/procurement',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
      },
      {
        id: 'command-center',
        title: 'Admin Command Center & Operations',
        category: 'Management',
        icon: <Layers className="w-4 h-4" />,
        href: '/dashboard/command-center',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
      },
      {
        id: 'telemed',
        title: 'Telemedicine Virtual Suite',
        category: 'Clinical',
        icon: <Video className="w-4 h-4" />,
        href: '/dashboard/telemedicine',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR'],
      },
      {
        id: 'copilot',
        title: 'Clinical AI Copilot & Assistant',
        category: 'AI & Tools',
        icon: <Bot className="w-4 h-4" />,
        href: '/dashboard/copilot',
        allowedRoles: ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE'],
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
          window.location.href = '/';
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

  // Live backend scoped search across 10 canonical entities
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setBackendResults([]);
      setIsSearchingBackend(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingBackend(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
        const res = await fetch(`${apiUrl}/admin/search?q=${encodeURIComponent(query.trim())}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          const items: PaletteItem[] = [];

          (data.patients || []).forEach((p: any) => {
            items.push({
              id: `pat-${p.id}`,
              title: `${p.name} (${p.phone || 'No Phone'})`,
              category: 'Patient Directory',
              icon: <Users className="w-4 h-4 text-cyan-500" />,
              href: p.href || '/dashboard/patients',
              badge: 'Patient',
            });
          });

          (data.doctors || []).forEach((d: any) => {
            items.push({
              id: `doc-${d.id}`,
              title: `${d.name} — ${d.specialty || 'Physician'} (${d.staffId || ''})`,
              category: 'Medical Staff',
              icon: <Stethoscope className="w-4 h-4 text-blue-500" />,
              href: d.href || '/dashboard/admin/doctors',
              badge: 'Doctor',
            });
          });

          (data.staff || []).forEach((s: any) => {
            items.push({
              id: `stf-${s.id}`,
              title: `${s.name} (${s.staffId || ''}) — ${s.role}`,
              category: 'Staff Directory',
              icon: <UserCheck className="w-4 h-4 text-emerald-500" />,
              href: s.href || '/dashboard/admin/staff',
              badge: s.role,
            });
          });

          (data.departments || []).forEach((dep: any) => {
            items.push({
              id: `dep-${dep.id}`,
              title: `${dep.name} (${dep.code})`,
              category: 'Hospital Departments',
              icon: <Building2 className="w-4 h-4 text-purple-500" />,
              href: dep.href || '/dashboard/admin/departments',
              badge: 'Dept',
            });
          });

          (data.appointments || []).forEach((a: any) => {
            items.push({
              id: `apt-${a.id}`,
              title: `Appointment ${a.number} — ${a.patientName}`,
              category: 'Appointments',
              icon: <Calendar className="w-4 h-4 text-amber-500" />,
              href: a.href || '/dashboard/appointments',
              badge: 'Appointment',
            });
          });

          (data.admissions || []).forEach((adm: any) => {
            items.push({
              id: `adm-${adm.id}`,
              title: `Admission ${adm.number} — ${adm.patientName} (${adm.department || 'Inpatient'})`,
              category: 'Admissions & Wards',
              icon: <Bed className="w-4 h-4 text-rose-500" />,
              href: adm.href || '/dashboard/admissions',
              badge: adm.status,
            });
          });

          (data.beds || []).forEach((b: any) => {
            items.push({
              id: `bed-${b.id}`,
              title: `Bed ${b.number} (${b.ward || 'General'}) — ${b.status}`,
              category: 'Bed Management',
              icon: <Bed className="w-4 h-4 text-teal-500" />,
              href: b.href || '/dashboard/hospital/beds',
              badge: b.status,
            });
          });

          (data.invoices || []).forEach((inv: any) => {
            items.push({
              id: `inv-${inv.id}`,
              title: `Invoice ${inv.number} — ₹${(inv.amount || 0).toLocaleString()} (${inv.patientName})`,
              category: 'Billing & Invoices',
              icon: <CreditCard className="w-4 h-4 text-emerald-500" />,
              href: inv.href || '/dashboard/billing',
              badge: inv.status,
            });
          });

          (data.labOrders || []).forEach((lo: any) => {
            items.push({
              id: `lo-${lo.id}`,
              title: `Lab Order ${lo.number} — ${lo.patientName} (${lo.status})`,
              category: 'Laboratory Orders',
              icon: <FlaskConical className="w-4 h-4 text-purple-500" />,
              href: lo.href || '/dashboard/lab',
              badge: lo.status,
            });
          });

          (data.prescriptions || []).forEach((rx: any) => {
            items.push({
              id: `rx-${rx.id}`,
              title: `Prescription ${rx.number} — ${rx.patientName} (${rx.status})`,
              category: 'Prescriptions',
              icon: <Pill className="w-4 h-4 text-pink-500" />,
              href: rx.href || '/dashboard/pharmacy/prescriptions',
              badge: rx.status,
            });
          });

          setBackendResults(items);
        }
      } catch (e) {
        // Fallback gracefully
      } finally {
        setIsSearchingBackend(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return roleFilteredItems;
    const q = query.toLowerCase();
    const clientMatches = roleFilteredItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q),
    );
    // Prioritize backend records, then system module navigation
    return [...backendResults, ...clientMatches];
  }, [roleFilteredItems, backendResults, query]);

  const handleSelect = (item: PaletteItem) => {
    setIsOpen(false);
    setQuery('');
    if (item.action) item.action();
    else if (item.href) router.push(item.href);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, backendResults]);

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
          {isSearchingBackend ? (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-slate-400" />
          )}
          <input
            autoFocus
            type="text"
            placeholder="Search patients, staff, doctors, appointments, beds, invoices, or commands..."
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
              {isSearchingBackend ? 'Searching hospital database...' : 'No matching records, modules, or actions found.'}
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
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={isSelected ? 'text-white' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span className="text-xs font-semibold truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    {item.badge && (
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                          isSelected
                            ? 'bg-white/30 text-white'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
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
