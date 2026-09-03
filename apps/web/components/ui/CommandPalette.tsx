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
  FileText,
  Truck,
  HeartPulse,
  Sun,
  Moon,
  LogOut,
  Building,
} from 'lucide-react';

interface PaletteItem {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
  shortcut?: string;
}

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  const items: PaletteItem[] = useMemo(
    () => [
      // Navigation
      { id: 'dash', title: 'Command Center & Overview', category: 'Dashboards', icon: <LayoutDashboard className="w-4 h-4" />, href: '/dashboard' },
      { id: 'admissions', title: 'Inpatient Admissions & Wards', category: 'Clinical', icon: <Bed className="w-4 h-4" />, href: '/dashboard/admissions' },
      { id: 'patients', title: 'Patient Directory & Records', category: 'Clinical', icon: <Users className="w-4 h-4" />, href: '/dashboard/patients' },
      { id: 'appointments', title: 'Appointments & Scheduling', category: 'Clinical', icon: <Calendar className="w-4 h-4" />, href: '/dashboard/appointments' },
      { id: 'doctors', title: 'Physicians & Doctors Directory', category: 'Clinical', icon: <Stethoscope className="w-4 h-4" />, href: '/dashboard/doctors' },
      { id: 'nursing', title: 'Nursing Station & MAR Vitals', category: 'Clinical', icon: <HeartPulse className="w-4 h-4" />, href: '/dashboard/nursing' },
      { id: 'emergency', title: 'Emergency Room & Trauma Triage', category: 'Operations', icon: <Activity className="w-4 h-4" />, href: '/dashboard/emergency' },
      { id: 'ambulance', title: 'EMS Fleet & Ambulance Tracking', category: 'Operations', icon: <Truck className="w-4 h-4" />, href: '/dashboard/ambulance' },
      { id: 'lab', title: 'Laboratory & Pathology Analyzers', category: 'Diagnostics', icon: <FlaskConical className="w-4 h-4" />, href: '/dashboard/lab' },
      { id: 'pharmacy', title: 'Pharmacy & Formulary Inventory', category: 'Diagnostics', icon: <Pill className="w-4 h-4" />, href: '/dashboard/pharmacy' },
      { id: 'billing', title: 'Billing, Invoices & Payments', category: 'Financial', icon: <CreditCard className="w-4 h-4" />, href: '/dashboard/billing' },
      { id: 'insurance', title: 'Insurance Claims & TPA Pre-Auth', category: 'Financial', icon: <Shield className="w-4 h-4" />, href: '/dashboard/insurance' },
      { id: 'telemed', title: 'Telemedicine Virtual Suite', category: 'Clinical', icon: <Video className="w-4 h-4" />, href: '/dashboard/telemedicine' },
      { id: 'copilot', title: 'Clinical AI Copilot & Assistant', category: 'AI & Tools', icon: <Bot className="w-4 h-4" />, href: '/dashboard/copilot' },
      { id: 'portal', title: 'Patient 24/7 Portal', category: 'Portal', icon: <Building className="w-4 h-4" />, href: '/portal' },
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
          router.push('/login');
        },
      },
    ],
    [router],
  );

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q),
    );
  }, [items, query]);

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
        setSelectedIndex((idx) => (idx - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredItems[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [isOpen, filteredItems, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10">
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to module..."
            className="w-full bg-transparent px-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
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
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <span className="truncate">{item.title}</span>
                  </div>

                  <span
                    className={`text-[10px] font-medium shrink-0 ml-2 ${
                      isSelected ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>MediNexa Command Engine</span>
        </div>
      </div>
    </div>
  );
}
