'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Bed,
  Users,
  Stethoscope,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';

export default function HospitalProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const fetchProfile = () => {
    const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    fetch(`${apiUrl}/admin/hospital`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setProfile(data);
          setPhone(data.phone || '');
          setEmail(data.email || '');
          setAddress(data.address || '');
          setCity(data.city || '');
          setState(data.state || '');
          setPostalCode(data.postalCode || '');
        }
      })
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMsg('');

    const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');

    try {
      const res = await fetch(`${apiUrl}/admin/hospital`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone,
          email,
          address,
          city,
          state,
          postalCode,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update hospital profile.');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      fetchProfile();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

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
                  HOSPITAL ADMINISTRATION
                </span>
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Facility Profile
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
                Hospital Profile & Master Identity
              </h1>
            </div>

            {profile && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Hospital Code: {profile.code}</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            </div>
          ) : profile ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Hospital Overview & Key Telemetry */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 font-black text-3xl">
                      {profile.name?.charAt(0) || 'H'}
                    </div>

                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                        {profile.name}
                      </h2>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">
                        {profile.facilityType || 'Multi-Specialty Tertiary Care Center'}
                      </p>
                    </div>

                    <div className="flex justify-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        Status: ACTIVE
                      </span>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="text-xs font-black text-slate-900 dark:text-slate-100">
                          {profile.bedCount || 0}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Beds</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="text-xs font-black text-slate-900 dark:text-slate-100">
                          {profile.doctorCount || 0}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Doctors</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="text-xs font-black text-slate-900 dark:text-slate-100">
                          {profile.staffCount || 0}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Staff</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Immutable Platform Identifiers Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-500" />
                      <CardTitle className="text-sm">Immutable Platform Identifiers</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      Assigned by MediNexa Platform Governance. Read-only.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 font-medium">Facility ID</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate max-w-[160px]">
                        {profile.id}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 font-medium">Hospital Code</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {profile.code}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 font-medium">Organization</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {profile.organization?.name || 'MediNexa Health'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-500 font-medium">Created On</span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Contact Details Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Hospital Contact & Geographic Details</CardTitle>
                    <CardDescription className="text-xs">
                      Update administrative contact numbers, email, and address for patient billing and OPD receipts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {saveSuccess && (
                      <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>Hospital profile successfully updated and audited!</span>
                      </div>
                    )}

                    {errorMsg && (
                      <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs font-bold text-red-700 dark:text-red-300">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Hospital Official Phone
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                            <input
                              type="text"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                              placeholder="+91 80 2345 6789"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Hospital Official Email
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                              placeholder="admin@hospital.medinexa.io"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Street Address
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                            placeholder="Plot 14, Health City, Ring Road"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">City</label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                            placeholder="Bengaluru"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">State</label>
                          <input
                            type="text"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                            placeholder="Karnataka"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pincode</label>
                          <input
                            type="text"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                            placeholder="560001"
                            required
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                        <Button
                          type="submit"
                          disabled={saving}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md shadow-blue-500/20"
                        >
                          {saving ? (
                            <>
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Save Profile Changes</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">No hospital profile available.</div>
          )}
        </main>
      </div>
    </div>
  );
}
