'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Building2,
  Shield,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Bed,
  Activity,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  FileText,
  Lock,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { getApiBaseUrl } from '@/lib/api-config';

export default function HospitalDetailPage() {
  const params = useParams();
  const hospitalIdParam = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [hospital, setHospital] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hospitalIdParam) return;

    const fetchHospitalDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const apiUrl = getApiBaseUrl();
        const res = await fetch(`${apiUrl}/super-admin/hospitals/${hospitalIdParam}`, { headers });

        if (!res.ok) {
          throw new Error('Hospital facility details could not be loaded.');
        }

        const data = await res.json();
        setHospital(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch hospital details.');
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalDetails();
  }, [hospitalIdParam]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-400">Loading Hospital Telemetry & Master Data...</p>
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Hospital Facility Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'The requested hospital facility could not be located.'}</p>
        <Link href="/super-admin/hospitals">
          <Button variant="outline" size="sm">
            ← Return to Existing Hospitals Directory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Read-Only Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/super-admin/hospitals"
          className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Hospitals</span>
        </Link>

        {/* Strict Read-Only Notice */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 text-xs font-bold">
          <Lock className="w-3.5 h-3.5" />
          <span>READ-ONLY VIEW • DATA MODIFICATION STRICTLY RESTRICTED TO HOSPITAL ADMIN</span>
        </div>
      </div>

      {/* Main Title & Hospital ID Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-purple-600 dark:text-purple-400 font-black text-sm px-2.5 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800">
                  {hospital.hospitalId}
                </span>
                <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  {hospital.name}
                </h1>
                <span className="font-mono text-xs text-slate-400 font-bold">({hospital.code})</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <span>{hospital.city}, {hospital.state}, {hospital.country}</span>
                <span>•</span>
                <span>Reg: {hospital.registrationNumber}</span>
                <span>•</span>
                <span>Enrolled: {new Date(hospital.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold uppercase border ${
                hospital.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800'
              }`}
            >
              {hospital.status}
            </span>
          </div>
        </div>

        {/* SECTION 1: Operational Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Staff</span>
            <span className="text-base font-black text-slate-900 dark:text-white">{hospital.operationalSummary?.totalStaff || 1}</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Doctors</span>
            <span className="text-base font-black text-slate-900 dark:text-white">{hospital.operationalSummary?.doctors || 0}</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Nurses</span>
            <span className="text-base font-black text-slate-900 dark:text-white">{hospital.operationalSummary?.nurses || 0}</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Beds</span>
            <span className="text-base font-black text-slate-900 dark:text-white">{hospital.operationalSummary?.totalBeds || 0}</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Occupied</span>
            <span className="text-base font-black text-amber-600 dark:text-amber-400">{hospital.operationalSummary?.occupiedBeds || 0}</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Available</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{hospital.operationalSummary?.availableBeds || 0}</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Inpatients</span>
            <span className="text-base font-black text-purple-600 dark:text-purple-400">{hospital.operationalSummary?.activeAdmissions || 0}</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Appts Today</span>
            <span className="text-base font-black text-blue-600 dark:text-blue-400">{hospital.operationalSummary?.todayAppointments || 0}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SECTION 2: Hospital Overview & Coordinates */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Building2 className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Hospital Coordinates & Profile</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Hospital Type</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {hospital.facilityType?.replace(/_/g, ' ')}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Registration Code</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {hospital.registrationNumber}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone</span>
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {hospital.phone}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Email</span>
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1 truncate">
                <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="truncate">{hospital.email}</span>
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Official Website</span>
              <a
                href={hospital.website}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Globe className="w-3 h-3 text-blue-500" />
                {hospital.website}
              </a>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Physical Address</span>
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                {hospital.address}, {hospital.city}, {hospital.state} - {hospital.postalCode}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Designated Hospital Administrator */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Shield className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Designated Hospital Administrator</h3>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Full Name</span>
                <span className="font-black text-slate-900 dark:text-white text-sm">
                  {hospital.admin?.fullName || 'Hospital Administrator'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                HOSPITAL ADMIN
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Staff Login ID</span>
                <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-xs">
                  {hospital.admin?.loginId}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                  {hospital.admin?.status || 'ACTIVE'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Email</span>
                <span className="text-slate-600 dark:text-slate-300 font-mono text-[11px] truncate block">
                  {hospital.admin?.email}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Mobile Contact</span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {hospital.admin?.mobile}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            Note: As Super Admin, administrative credentials and hospital configurations are read-only.
          </p>
        </div>
      </div>

      {/* SECTION 4: Departments & Services */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Active Departments & Clinical Services</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {hospital.departments?.length || 0} Departments Configured
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {hospital.departments?.map((dept: any) => (
            <div
              key={dept.id}
              className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{dept.name}</div>
                <div className="font-mono text-[10px] text-slate-400">{dept.code}</div>
              </div>
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                {dept.wardsCount} Wards
              </span>
            </div>
          ))}
          {(!hospital.departments || hospital.departments.length === 0) && (
            <div className="col-span-3 text-center py-6 text-xs text-slate-400">
              No departments initialized for this facility.
            </div>
          )}
        </div>

        {/* Services Badges */}
        <div className="pt-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Hospital Clinical Capabilities</span>
          <div className="flex items-center gap-2 flex-wrap">
            {hospital.services?.map((svc: string, idx: number) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                {svc}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 5: Recent Activity & Audit Trail (Scoped to this Hospital) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Facility Audit Trail & Recent Activity</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">Tenant Activity Logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                <th className="pb-3">Action</th>
                <th className="pb-3">Resource</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {hospital.recentActivity?.map((act: any) => (
                <tr key={act.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400">
                      {act.action}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-slate-600 dark:text-slate-400 text-[11px]">{act.resource}</td>
                  <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">{act.role || 'SYSTEM'}</td>
                  <td className="py-3 text-slate-400 text-[11px]">
                    {act.timestamp ? new Date(act.timestamp).toLocaleString('en-IN') : 'N/A'}
                  </td>
                  <td className="py-3 text-slate-500 text-[11px] max-w-xs truncate font-mono">
                    {act.details || '—'}
                  </td>
                </tr>
              ))}
              {(!hospital.recentActivity || hospital.recentActivity.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                    No recent activity logs recorded for this facility yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
