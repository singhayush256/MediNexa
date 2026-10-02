'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderKanban,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Users,
  Wrench,
  Clock,
  Layers,
  X,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';

export default function DepartmentsPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // New department form
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const fetchDepartments = () => {
    const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    fetch(`${apiUrl}/admin/departments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setDepartments(data);
      })
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setErrorMsg('');
    setSuccessMsg('');

    const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');

    try {
      const res = await fetch(`${apiUrl}/admin/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, code }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create department.');
      }

      setSuccessMsg(`Department "${name}" created successfully!`);
      setName('');
      setCode('');
      setModalOpen(false);
      fetchDepartments();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setCreating(false);
    }
  };

  const filtered = departments.filter((d) =>
    (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.code || '').toLowerCase().includes(search.toLowerCase()),
  );

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
                  PEOPLE & ORGANIZATION
                </span>
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Clinical & Operational Divisions
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
                Department Management
              </h1>
            </div>

            <Button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </Button>
          </div>

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs font-bold text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search departments by name or code..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Department Cards Grid */}
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-slate-400 text-xs">
                No hospital departments found matching your criteria.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((dept) => (
                <Card key={dept.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-sm font-extrabold">{dept.name}</CardTitle>
                      <CardDescription className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                        {dept.code}
                      </CardDescription>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                      {dept.status || 'ACTIVE'}
                    </span>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100 dark:border-slate-800 text-center">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                        <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-bold">
                          <Stethoscope className="w-3 h-3 text-blue-500" />
                          <span>Doctors</span>
                        </div>
                        <div className="text-xs font-black text-slate-900 dark:text-slate-100 mt-0.5">
                          {dept.doctorCount || 0}
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                        <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-bold">
                          <Users className="w-3 h-3 text-emerald-500" />
                          <span>Staff</span>
                        </div>
                        <div className="text-xs font-black text-slate-900 dark:text-slate-100 mt-0.5">
                          {dept.staffCount || 0}
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                        <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-bold">
                          <Wrench className="w-3 h-3 text-purple-500" />
                          <span>Assets</span>
                        </div>
                        <div className="text-xs font-black text-slate-900 dark:text-slate-100 mt-0.5">
                          {dept.assetCount || 0}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Create Modal */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Add New Hospital Department
                  </h3>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Department Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Cardiology & CCU"
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Department Code (Unique)
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="e.g. CARDIO"
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setModalOpen(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={creating}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                    >
                      {creating ? 'Creating...' : 'Create Department'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
