'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Activity,
  CheckSquare,
  Users,
  UserCheck,
  CalendarCheck,
  Clock,
  Building2,
  TrendingUp,
  Stethoscope,
  DoorOpen,
  Bed,
  ArrowRightLeft,
  AlertOctagon,
  ShieldAlert,
  Repeat,
  Package,
  Wrench,
  FileBarChart,
  BarChart3,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Sparkles,
  Menu,
  X,
  Hospital,
} from 'lucide-react';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { getHospitalProfile } from '@/lib/hospital-canonical-data';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function ManagerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hospitalName, setHospitalName] = useState('MediNexa General Hospital (Hospital A)');
  const [managerName, setManagerName] = useState('Operations Manager');
  const [managerId, setManagerId] = useState('MG.RAHUL-9137');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedHospitalId = localStorage.getItem('medinexa_active_hospital_id') || 'HOSPITAL_A';
      const profile = getHospitalProfile(null, storedHospitalId);
      if (profile && profile.name) {
        setHospitalName(profile.name);
      }

      const storedUser = localStorage.getItem('medinexa_user');
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (u.firstName || u.lastName) {
            setManagerName(`${u.firstName || ''} ${u.lastName || ''}`.trim());
          } else if (u.name) {
            setManagerName(u.name);
          }
          if (u.staffLoginId || u.employeeCode) {
            setManagerId(u.staffLoginId || u.employeeCode);
          }
        } catch (e) {
          // ignore parsing error
        }
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('medinexa_token');
      localStorage.removeItem('token');
      localStorage.removeItem('medinexa_user');
      sessionStorage.removeItem('medinexa_token');
      document.cookie = 'medinexa_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.push('/login');
    }
  };

  const sections: NavSection[] = [
    {
      title: 'COMMAND CENTER',
      items: [
        { title: 'Overview', href: '/dashboard/manager', icon: LayoutDashboard },
        { title: 'Live Operations', href: '/dashboard/manager/live-operations', icon: Activity, badge: 'LIVE', badgeColor: 'bg-emerald-500 text-white' },
        { title: 'My Tasks', href: '/dashboard/manager/tasks', icon: CheckSquare, badge: 3, badgeColor: 'bg-teal-600 text-white' },
      ],
    },
    {
      title: 'PEOPLE & WORKFORCE',
      items: [
        { title: 'Staff Management', href: '/dashboard/manager/staff', icon: Users },
        { title: 'Staff Deployment', href: '/dashboard/manager/staff-deployment', icon: UserCheck, badge: 'Gaps: 2', badgeColor: 'bg-amber-500 text-white' },
        { title: 'Attendance', href: '/dashboard/manager/attendance', icon: Clock },
        { title: 'Shifts & Rosters', href: '/dashboard/manager/shifts', icon: CalendarCheck },
      ],
    },
    {
      title: 'DEPARTMENT OPERATIONS',
      items: [
        { title: 'My Departments', href: '/dashboard/manager/departments', icon: Building2 },
        { title: 'Department Performance', href: '/dashboard/manager/department-performance', icon: TrendingUp },
      ],
    },
    {
      title: 'PATIENT OPERATIONS',
      items: [
        { title: 'OPD & Queue', href: '/dashboard/manager/opd', icon: Stethoscope, badge: '14 wait', badgeColor: 'bg-teal-600 text-white' },
        { title: 'Admissions', href: '/dashboard/manager/admissions', icon: DoorOpen },
        { title: 'Beds & Capacity', href: '/dashboard/manager/beds', icon: Bed },
        { title: 'Transfers', href: '/dashboard/manager/transfers', icon: ArrowRightLeft },
      ],
    },
    {
      title: 'SAFETY & ESCALATIONS',
      items: [
        { title: 'Emergency Operations', href: '/dashboard/manager/emergency', icon: AlertOctagon, badge: 'Critical', badgeColor: 'bg-rose-500 text-white animate-pulse' },
        { title: 'Alerts & Escalations', href: '/dashboard/manager/alerts', icon: ShieldAlert, badge: 2, badgeColor: 'bg-rose-500 text-white' },
        { title: 'Shift Handover', href: '/dashboard/manager/handover', icon: Repeat },
      ],
    },
    {
      title: 'RESOURCES',
      items: [
        { title: 'Operational Inventory', href: '/dashboard/manager/inventory', icon: Package },
        { title: 'Facilities & Equipment', href: '/dashboard/manager/facilities', icon: Wrench },
      ],
    },
    {
      title: 'REPORTS & ANALYTICS',
      items: [
        { title: 'Operational Reports', href: '/dashboard/manager/reports', icon: FileBarChart },
        { title: 'Analytics', href: '/dashboard/manager/analytics', icon: BarChart3 },
      ],
    },
  ];

  const bottomItems: NavItem[] = [
    { title: 'Notifications', href: '/dashboard/manager/notifications', icon: Bell, badge: 4, badgeColor: 'bg-rose-500 text-white' },
    { title: 'My Profile', href: '/dashboard/manager/profile', icon: User },
    { title: 'Settings', href: '/dashboard/manager/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MediNexaLogo size="sm" href="/dashboard/manager" />
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/70 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            MANAGER PORTAL
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar Component */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Identity Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <MediNexaLogo size="md" href="/dashboard/manager" />
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              MANAGER PORTAL
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white truncate">
              <Hospital className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="truncate">{hospitalName}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold truncate">{managerName}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-bold shrink-0">
                {managerId}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {sec.title}
              </div>
              <div className="space-y-0.5 pt-1">
                {sec.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition group ${
                        isActive
                          ? 'bg-teal-600 text-white shadow-sm font-bold'
                          : 'text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400'}`} />
                        <span className="truncate">{item.title}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ${item.badgeColor || 'bg-slate-200 text-slate-800'}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Navigation & Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition ${
                  isActive
                    ? 'bg-teal-600 text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer mt-1"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Command</span>
          </button>
        </div>
      </aside>
    </>
  );
}
