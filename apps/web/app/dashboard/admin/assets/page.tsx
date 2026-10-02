'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ShieldCheck,
  Building,
  DollarSign,
  X,
  Filter,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [assetName, setAssetName] = useState('');
  const [category, setCategory] = useState('VENTILATOR');
  const [departmentId, setDepartmentId] = useState('');
  const [location, setLocation] = useState('ICU Bed Ward');
  const [warrantyMonths, setWarrantyMonths] = useState(36);
  const [maintenanceFrequency, setMaintenanceFrequency] = useState('QUARTERLY');
  const [purchaseCost, setPurchaseCost] = useState(1200000);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const fetchData = () => {
    const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    Promise.all([
      fetch(`${apiUrl}/admin/assets`, { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
        r.ok ? r.json() : [],
      ),
      fetch(`${apiUrl}/admin/departments`, { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
        r.ok ? r.json() : [],
      ),
    ])
      .then(([assetsData, deptData]) => {
        if (Array.isArray(assetsData)) setAssets(assetsData);
        if (Array.isArray(deptData)) setDepartments(deptData);
      })
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setErrorMsg('');
    setSuccessMsg('');

    const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');

    try {
      const res = await fetch(`${apiUrl}/admin/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assetName,
          category,
          departmentId: departmentId || undefined,
          location,
          warrantyMonths: Number(warrantyMonths),
          maintenanceFrequency,
          purchaseCost: Number(purchaseCost),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create asset.');
      }

      setSuccessMsg(`Asset "${assetName}" registered and logged successfully!`);
      setModalOpen(false);
      setAssetName('');
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'ACTIVE' | 'UNDER_MAINTENANCE' | 'RETIRED') => {
    const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
    try {
      const res = await fetch(`${apiUrl}/admin/assets/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setSuccessMsg(`Asset status changed to ${newStatus}`);
        fetchData();
      }
    } catch {}
  };

  const filtered = assets.filter(
    (a) =>
      (a.assetName || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.assetCode || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.category || '').toLowerCase().includes(search.toLowerCase()),
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
                  BIOMEDICAL & ASSETS
                </span>
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Equipment Registry
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
                Medical Equipment & Assets
              </h1>
            </div>

            <Button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Register Asset</span>
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

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assets by code, name or category..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hospital Asset Inventory</CardTitle>
              <CardDescription className="text-xs">
                Biomedical equipment, imaging machines, and critical care units under active hospital tracking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-12">
                  <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No medical equipment or assets registered yet. Click "Register Asset" to add one.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Asset Code</th>
                        <th className="py-3 px-4">Equipment Name</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Department / Location</th>
                        <th className="py-3 px-4">Maintenance</th>
                        <th className="py-3 px-4">Warranty Expiry</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {filtered.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                            {a.assetCode}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-slate-100">
                            {a.assetName}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {a.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                            <div>{a.department}</div>
                            <div className="text-[10px] text-slate-400">{a.currentLocation}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                            {a.maintenanceFrequency}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                            {new Date(a.warrantyExpiry).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                a.status === 'ACTIVE'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                                  : a.status === 'UNDER_MAINTENANCE'
                                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {a.status === 'ACTIVE' ? (
                              <button
                                onClick={() => handleUpdateStatus(a.id, 'UNDER_MAINTENANCE')}
                                className="text-[10px] font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                              >
                                Mark Maintenance
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateStatus(a.id, 'ACTIVE')}
                                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                              >
                                Mark Operational
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modal */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Register Hospital Medical Asset
                  </h3>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateAsset} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Asset / Equipment Name
                    </label>
                    <input
                      type="text"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      placeholder="e.g. Hamilton C6 ICU Ventilator"
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="VENTILATOR">Ventilator</option>
                        <option value="MRI">MRI Machine</option>
                        <option value="CT_SCAN">CT Scanner</option>
                        <option value="X_RAY">Digital X-Ray</option>
                        <option value="MONITOR">Multi-Para Monitor</option>
                        <option value="DEFIB">Defibrillator</option>
                        <option value="ULTRASOUND">Ultrasound Doppler</option>
                        <option value="ECG">12-Lead ECG</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department</label>
                      <select
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">General Facility</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="ICU Room 04"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Maintenance</label>
                      <select
                        value={maintenanceFrequency}
                        onChange={(e) => setMaintenanceFrequency(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="SEMI_ANNUAL">Semi-Annual</option>
                        <option value="ANNUAL">Annual</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Warranty (Months)
                      </label>
                      <input
                        type="number"
                        value={warrantyMonths}
                        onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Purchase Cost (₹)
                      </label>
                      <input
                        type="number"
                        value={purchaseCost}
                        onChange={(e) => setPurchaseCost(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
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
                      {creating ? 'Registering...' : 'Register Asset'}
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
