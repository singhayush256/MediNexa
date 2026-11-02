'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Building2,
  User,
  LogOut,
  Shield,
  Activity,
  Menu,
  X,
} from 'lucide-react';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('medinexa_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {}
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('medinexa_token');
      localStorage.removeItem('token');
      localStorage.removeItem('medinexa_user');
      document.cookie = 'medinexa_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.href = '/';
    }
  };

  // The Super Admin left sidebar contains ONLY these 5 items per specification:
  // 1. Dashboard, 2. Add Hospital, 3. Existing Hospitals, 4. Profile, 5. Logout
  const navItems = [
    {
      name: 'Dashboard',
      href: '/super-admin',
      icon: LayoutDashboard,
      active: pathname === '/super-admin',
    },
    {
      name: 'Add Hospital',
      href: '/super-admin/add-hospital',
      icon: PlusCircle,
      active: pathname === '/super-admin/add-hospital',
    },
    {
      name: 'Existing Hospitals',
      href: '/super-admin/hospitals',
      icon: Building2,
      active: pathname.startsWith('/super-admin/hospitals'),
    },
    {
      name: 'Profile',
      href: '/super-admin/profile',
      icon: User,
      active: pathname === '/super-admin/profile',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <MediNexaLogo size="sm" href="/super-admin" />
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-900 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              SUPER ADMIN
            </span>
            <span className="text-xs text-slate-400 font-medium">Platform Management</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs font-black">
              {user?.firstName?.[0] || 'S'}
            </div>
            <div className="text-left text-xs">
              <div className="font-bold text-slate-900 dark:text-white leading-tight">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Super Administrator'}
              </div>
              <div className="text-[10px] font-mono text-purple-600 dark:text-purple-400">Platform Master</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-[calc(100vh-4rem)]">
        {/* Dedicated Super Admin Left Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 top-16 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4 transition-transform duration-200 md:static md:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="space-y-6">
            <div className="px-3 pt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Super Admin Console
              </span>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      item.active
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar: Logout & Status */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200/60 dark:border-purple-900/50">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
                <Activity className="w-3.5 h-3.5 text-purple-500" />
                <span>Platform Operational</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Full read-only multi-tenant governance
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
