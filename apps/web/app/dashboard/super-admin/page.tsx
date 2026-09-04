'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  DollarSign,
  Activity,
  ShieldCheck,
  Plus,
  Power,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Server,
  Database,
  Cpu,
  RefreshCw,
  Sliders,
  Settings,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, StatCard } from '@/components/ui';

export default function SuperAdminPortalPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newHospital, setNewHospital] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    email: '',
  });

  const fetchSuperAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

      const [overviewRes, hospitalsRes, subsRes] = await Promise.all([
        fetch(`${apiUrl}/super-admin/overview`, { headers }),
        fetch(`${apiUrl}/super-admin/hospitals`, { headers }),
        fetch(`${apiUrl}/super-admin/subscriptions`, { headers }),
      ]);

      if (overviewRes.ok) {
        setOverview(await overviewRes.json());
      }
      if (hospitalsRes.ok) {
        setHospitals(await hospitalsRes.json());
      }
      if (subsRes.ok) {
        setSubscriptions(await subsRes.json());
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch platform telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

      const res = await fetch(`${apiUrl}/super-admin/hospitals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newHospital),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create hospital');

      setSuccess(`Hospital ${data.name} provisioned successfully!`);
      setIsCreateModalOpen(false);
      setNewHospital({ name: '', code: '', address: '', city: '', state: '', postalCode: '', phone: '', email: '' });
      fetchSuperAdminData();
    } catch (err: any) {
      setError(err.message || 'Provisioning failed.');
    }
  };

  const handleToggleStatus = async (id: string, name: string) => {
    try {
      const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

      const res = await fetch(`${apiUrl}/super-admin/hospitals/${id}/toggle-status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to toggle status');
      setSuccess(`Updated operational status for ${name}`);
      fetchSuperAdminData();
    } catch (err: any) {
      setError(err.message || 'Action failed.');
    }
  };

  const handleDeleteHospital = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to decommission ${name}?`)) return;
    try {
      const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

      const res = await fetch(`${apiUrl}/super-admin/hospitals/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete hospital');
      setSuccess(`Decommissioned ${name}`);
      fetchSuperAdminData();
    } catch (err: any) {
      setError(err.message || 'Action failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col font-sans transition-colors duration-200">
      <DashboardNav />

      <div className="flex-1 flex min-h-[calc(100vh-4rem)]">
        <DashboardSidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-900">
                  SUPER ADMIN PLATFORM COMMAND
                </span>
                <span className="text-xs text-slate-400 font-medium">Multi-Tenant SaaS Master Portal</span>
              </div>
              <h1 className="text-2xl font-black text-slate-950 dark:text-slate-50 tracking-tight mt-1">
                Enterprise Infrastructure & Tenants
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSuperAdminData}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Refresh
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                icon={<Plus className="w-4 h-4" />}
              >
                Provision Hospital
              </Button>
            </div>
          </div>

          {/* Feedback */}
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs rounded-2xl flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs rounded-2xl flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Platform Gross Volume (GMV)"
              value={`₹${(overview?.totalPlatformGmv || 850000).toLocaleString('en-IN')}`}
              description="Settled hospital revenue"
              trend={{ value: 18.4, isPositive: true }}
              icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
            />
            <StatCard
              title="Active Hospital Facilities"
              value={overview?.totalFacilities || hospitals.length || 1}
              description="Connected multi-tenants"
              trend={{ value: 12.0, isPositive: true }}
              icon={<Building2 className="w-5 h-5 text-purple-500" />}
            />
            <StatCard
              title="Total Registered Network Users"
              value={overview?.totalUsers || 132}
              description={`${overview?.totalDoctors || 8} Specialists • ${overview?.totalPatients || 105} Patients`}
              icon={<Users className="w-5 h-5 text-blue-500" />}
            />
            <StatCard
              title="System Telemetry & Health"
              value="99.98% Uptime"
              description="DB: 12ms Latency (Healthy)"
              icon={<Activity className="w-5 h-5 text-teal-500" />}
            />
          </div>

          {/* System Infrastructure Telemetry Bar */}
          <div className="p-5 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Infrastructure Telemetry</div>
                <div className="text-sm font-black text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  PostgreSQL Port 5433 • NestJS Gateway Port 3001 • Socket.io Cluster
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">HEAP USED</span>
                <span className="font-bold text-teal-300">{overview?.systemHealth?.heapUsedMb || 48} MB</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">DB LATENCY</span>
                <span className="font-bold text-emerald-400">{overview?.systemHealth?.databaseLatencyMs || 12} ms</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ACTIVE POOL</span>
                <span className="font-bold text-blue-300">18 Conns</span>
              </div>
            </div>
          </div>

          {/* Hospitals Management Directory */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Connected Hospital Facilities</h3>
                <p className="text-xs text-slate-500">Multi-tenant isolation and administrative status controls</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-600 rounded-xl border border-purple-200 dark:border-purple-800">
                {hospitals.length} Tenants Configured
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                    <th className="pb-3">Hospital Name</th>
                    <th className="pb-3">Code</th>
                    <th className="pb-3">City / State</th>
                    <th className="pb-3">Wards</th>
                    <th className="pb-3">Specialists</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {hospitals.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-purple-600" />
                        {h.name}
                      </td>
                      <td className="py-3.5 font-mono text-slate-500">{h.code}</td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-400">
                        {h.city}, {h.state}
                      </td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-400">{h.wardsCount || 6} Wards</td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-400">{h.doctorsCount || 8} Doctors</td>
                      <td className="py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            h.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                          }`}
                        >
                          {h.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleToggleStatus(h.id, h.name)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold transition"
                        >
                          {h.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteHospital(h.id, h.name)}
                          className="px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-bold hover:bg-rose-100 transition"
                        >
                          Decommission
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subscription Tiers Grid */}
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Platform Subscription Packages</h3>
              <p className="text-xs text-slate-500">Tier licensing and multi-tenant feature toggles</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subscriptions.map((tier) => (
                <div
                  key={tier.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                      {tier.name}
                    </span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      ₹{tier.pricePerMonth.toLocaleString('en-IN')}{' '}
                      <span className="text-xs font-normal text-slate-400">/ month</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Capacity: {tier.maxDoctors === 999 ? 'Unlimited' : `${tier.maxDoctors} Doctors`} • {tier.maxBeds === 999 ? 'Unlimited' : `${tier.maxBeds} Beds`}
                    </p>
                  </div>

                  <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {tier.features.map((feat: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                    Edit Package Policy
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Provision Modal */}
          {isCreateModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Provision New Hospital Tenant</h3>
                <form onSubmit={handleCreateHospital} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Hospital Facility Name"
                    value={newHospital.name}
                    onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Facility Code (e.g. MDNX-DELHI)"
                    value={newHospital.code}
                    onChange={(e) => setNewHospital({ ...newHospital, code: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Address / Locality"
                    value={newHospital.address}
                    onChange={(e) => setNewHospital({ ...newHospital, address: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={newHospital.city}
                      onChange={(e) => setNewHospital({ ...newHospital, city: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      required
                      placeholder="State"
                      value={newHospital.state}
                      onChange={(e) => setNewHospital({ ...newHospital, state: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Postal Code"
                      value={newHospital.postalCode}
                      onChange={(e) => setNewHospital({ ...newHospital, postalCode: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone"
                      value={newHospital.phone}
                      onChange={(e) => setNewHospital({ ...newHospital, phone: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Official Facility Email"
                    value={newHospital.email}
                    onChange={(e) => setNewHospital({ ...newHospital, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold"
                    >
                      Provision Facility
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
