'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Lock,
  UserCheck,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

export default function RolesAndPermissionsPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    fetch(`${apiUrl}/admin/roles`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setRoles(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const permissionDomains = [
    { key: 'clinical', label: 'Clinical EMR' },
    { key: 'patients', label: 'Patients & OPD' },
    { key: 'admissions', label: 'Inpatient Beds' },
    { key: 'pharmacy', label: 'Pharmacy' },
    { key: 'laboratory', label: 'Laboratory' },
    { key: 'billing', label: 'Billing & POS' },
    { key: 'hrms', label: 'Staff & HRMS' },
    { key: 'system', label: 'System Admin' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col font-sans transition-colors duration-200">
      <DashboardNav />
      <div className="flex-1 flex min-h-[calc(100vh-4rem)]">
        <DashboardSidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                  SECURITY & GOVERNANCE
                </span>
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Enterprise RBAC Matrix
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
                Roles & Permissions Matrix
              </h1>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Backend Enforced Invariant</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Healthcare Workforce Access Matrix</CardTitle>
              <CardDescription className="text-xs">
                Granular capabilities across clinical diagnosis, inpatient care, formulary, diagnostic reporting, and financial transactions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-12">
                  <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Role & Level</th>
                        {permissionDomains.map((dom) => (
                          <th key={dom.key} className="py-3 px-3 text-center">
                            {dom.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {roles.map((r) => (
                        <tr key={r.code} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-900 dark:text-slate-100">
                              {r.role}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 font-semibold">
                              {r.code} • {r.level}
                            </div>
                          </td>

                          {permissionDomains.map((dom) => {
                            const perms: string[] = r.permissions?.[dom.key] || [];
                            const hasAny = perms.length > 0;
                            return (
                              <td key={dom.key} className="py-3.5 px-3 text-center">
                                {hasAny ? (
                                  <div className="inline-flex flex-col items-center gap-0.5">
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-black text-[9px] uppercase border border-emerald-200 dark:border-emerald-800">
                                      {perms.join(', ')}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-300 dark:text-slate-700 font-mono">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
