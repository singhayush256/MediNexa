'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bed,
  Building2,
  BellRing,
  Bell,
  Calendar,
  FileText,
  Pill,
  FlaskConical,
  Video,
  Activity,
  Bot,
  User,
  LogOut,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  Radio,
  HeartPulse,
  ShieldCheck,
  Users,
  Settings,
  Siren,
  ShieldAlert,
} from 'lucide-react';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

const navSections = [
  {
    title: 'Patient Ecosystem',
    items: [
      { name: 'Dashboard', href: '/portal', icon: LayoutDashboard },
      { name: 'Appointments', href: '/portal/appointments', icon: Calendar },
      { name: 'Medical Records', href: '/portal/medical-records', icon: FileText },
      { name: 'Prescriptions', href: '/portal/prescriptions', icon: Pill },
      {
        name: 'Medicine Reminder',
        href: '/portal/medication-reminders',
        icon: BellRing,
        badge: 'Active',
        badgeColor: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30',
      },
      {
        name: 'Health Score',
        href: '/portal/health-score',
        icon: HeartPulse,
        badge: 'GUARDIAN',
        badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse font-extrabold',
      },
      { name: 'Insurance', href: '/portal/billing', icon: ShieldCheck },
      {
        name: 'Emergency',
        href: '/emergency/sos',
        icon: Siren,
        badge: 'SOS 24/7',
        badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-extrabold',
      },
      { name: 'Family Members', href: '/portal/family', icon: Users },
      { name: 'Settings', href: '/portal/profile', icon: Settings },
    ],
  },
  {
    title: 'Hospital Network Services',
    items: [
      {
        name: 'Live Beds',
        href: '/portal/live-beds',
        icon: Bed,
        badge: 'LIVE',
        badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
      },
      { name: 'Nearby Hospitals', href: '/portal/nearby-hospitals', icon: Building2 },
      { name: 'Lab Reports', href: '/portal/lab-reports', icon: FlaskConical },
      { name: 'Telemedicine', href: '/portal/telemedicine', icon: Video },
      { name: 'Bed Reservations', href: '/portal/bed-bookings', icon: Activity },
      { name: 'AI Assistant', href: '/portal/ai-assistant', icon: Bot },
    ],
  },
];

export function PortalSidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState('Patient');
  const [userEmail, setUserEmail] = useState('patient@medinexa.health');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const u = JSON.parse(localStorage.getItem('medinexa_user') || '{}');
        const isDoc = (u.firstName && u.firstName.startsWith('Dr.')) || /DOCTOR|STAFF|ADMIN/i.test(u.roleCode || u.role?.code || u.role || '');
        if (isDoc) {
          setUserName('Ayush Singh');
          setUserEmail('ayush.singh@patient.medinexa.health');
        } else {
          if (u.firstName) {
            setUserName(`${u.firstName} ${u.lastName || ''}`.trim());
          }
          if (u.email) {
            setUserEmail(u.email);
          }
        }
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('medinexa_token');
      localStorage.removeItem('token');
      localStorage.removeItem('medinexa_user');
      document.cookie = 'medinexa_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.href = '/login';
    }
  };

  return (
    <>
      {/* Mobile Menu Button & Action Bar */}
      <div className="lg:hidden fixed top-3 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-md text-slate-700 dark:text-slate-200 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="lg:hidden fixed top-3 right-4 z-50 flex items-center gap-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold shadow-md hover:bg-rose-50 transition cursor-pointer"
          title="Log Out of MediNexa"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-white/95 dark:bg-[#020617]/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Branding */}
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <MediNexaLogo size="sm" subtitle="PATIENT PORTAL" href="/portal" />
          <ThemeToggle />
        </div>

        {/* Live Network Status Indicator */}
        <div className="mx-4 mt-3 px-3 py-2 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-blue-500/10 border border-teal-500/20 flex items-center justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">Live Care Network</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">24/7 Active</span>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    item.href === '/portal'
                      ? pathname === '/portal'
                      : pathname?.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-teal-500/15 to-blue-500/15 text-teal-700 dark:text-teal-300 font-bold border border-teal-500/30 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive
                              ? 'text-teal-600 dark:text-teal-400'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                            item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
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

        {/* User Footer Profile */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                {userName.charAt(0) || 'P'}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {userName}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {userEmail}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Log Out of MediNexa"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900 transition shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
