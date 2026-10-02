'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Shield,
  Key,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  Plus,
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { getApiBaseUrl } from '@/lib/api-config';
import { normalizeStaffName } from '@medinexa/validation';

export default function AddHospitalPage() {
  const router = useRouter();

  // Hospital Information Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [hospitalType, setHospitalType] = useState('TERTIARY_CARE');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');

  // Hospital Admin Information Form State
  const [adminFullName, setAdminFullName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminMobile, setAdminMobile] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('Admin@2026!');

  // Submission State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<any>(null);

  // Dynamic preview of the Hospital Admin Login ID
  const computeAdminLoginIdPreview = () => {
    if (!adminFullName) return 'HA.ADMIN-0001';
    const norm = normalizeStaffName(adminFullName);
    const digits = adminMobile.replace(/\D/g, '');
    const last4 = digits.length >= 4 ? digits.slice(-4) : (digits.padStart(4, '0') || '0001');
    return `HA.${norm}-${last4}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;
      const apiUrl = getApiBaseUrl();

      const payload = {
        name,
        code: code.toUpperCase().trim(),
        hospitalType,
        registrationNumber: registrationNumber || `REG-${code.toUpperCase()}-2026`,
        phone,
        email,
        website: website || `https://${code.toLowerCase()}.medinexa.health`,
        address,
        city,
        state,
        pincode,
        country,
        adminFullName,
        adminEmail,
        adminMobile,
        adminLoginId: computeAdminLoginIdPreview(),
        temporaryPassword: temporaryPassword || 'Admin@2026!',
      };

      const response = await fetch(`${apiUrl}/super-admin/hospitals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Failed to create hospital facility.';
        throw new Error(errorMsg);
      }

      setCreatedResult(data);
    } catch (err: any) {
      setError(err.message || 'Hospital creation failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/super-admin/hospitals"
          className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Existing Hospitals</span>
        </Link>
        <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-900">
          PROVISIONING CONSOLE
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
          Register New Hospital Facility
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Provision a dedicated multi-tenant hospital instance and its initial Hospital Administrator credentials.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs rounded-2xl flex items-center gap-2 font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Modal / State */}
      {createdResult ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200 dark:border-emerald-800 p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                HOSPITAL PROVISIONED SUCCESSFULLY
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {createdResult.name} ({createdResult.code})
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Platform Hospital ID</span>
              <span className="font-mono text-purple-600 dark:text-purple-400 font-black text-base">
                {createdResult.hospitalId}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Facility Code</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold text-sm">
                {createdResult.code}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Hospital Admin Login ID</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-black text-base">
                {createdResult.admin?.loginId}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Hospital Admin Email</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold text-xs">
                {createdResult.admin?.email}
              </span>
            </div>
            <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Initial Temporary Password</span>
              <span className="font-mono text-amber-600 dark:text-amber-400 font-bold text-sm bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                {createdResult.admin?.temporaryPassword}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href={`/super-admin/hospitals/${createdResult.facilityId}`} className="flex-1">
              <Button
                variant="primary"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
                icon={<Building2 className="w-4 h-4" />}
              >
                Inspect Hospital Details
              </Button>
            </Link>
            <Link href="/super-admin/hospitals" className="flex-1">
              <Button variant="outline" className="w-full font-bold">
                View All Existing Hospitals
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Hospital Creation Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Hospital Information */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Hospital Information</h3>
                <p className="text-[11px] text-slate-500">Legal institution identity, classification and contact coordinates</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hospital Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Multispeciality Hospital"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hospital Code / Short Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. APEX-MAIN"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 font-mono uppercase bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hospital Type
                </label>
                <select
                  value={hospitalType}
                  onChange={(e) => setHospitalType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="TERTIARY_CARE">Tertiary Care Multispeciality</option>
                  <option value="SECONDARY_CARE">Secondary Care Hospital</option>
                  <option value="SUPER_SPECIALITY">Super Speciality Institute</option>
                  <option value="CLINICAL_DAYCARE">Day Care & Clinic Network</option>
                  <option value="TEACHING_HOSPITAL">Medical College & Research Hospital</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. REG-MH-2026-9021"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98111 22334"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="contact@apexhospital.health"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  placeholder="https://apexhospital.health"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Physical Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Plot 14, Health City Enclave, Institutional Area"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  placeholder="New Delhi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Delhi"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pincode / Postal Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="110025"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3.5 py-2.5 font-mono bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Initial Hospital Admin Credentials */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Initial Hospital Administrator</h3>
                <p className="text-[11px] text-slate-500">
                  Primary administrative account provisioned with full governance privileges for this hospital
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hospital Admin Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Ayush Singh"
                  value={adminFullName}
                  onChange={(e) => setAdminFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hospital Admin Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin.apex@medinexa.health"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hospital Admin Mobile *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98111 48210"
                  value={adminMobile}
                  onChange={(e) => setAdminMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Auto-Generated Hospital Admin Login ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={computeAdminLoginIdPreview()}
                    className="w-full px-3.5 py-2.5 font-mono font-bold text-blue-600 dark:text-blue-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs cursor-not-allowed"
                  />
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 absolute right-3 top-3 animate-pulse" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Standard format: HA.FIRSTNAME-LAST4MOBILE (Collision safe)
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Temporary Administrator Password
                </label>
                <input
                  type="text"
                  required
                  value={temporaryPassword}
                  onChange={(e) => setTemporaryPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 font-mono bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  The administrator will be prompted to verify with 2FA or update upon first sign in.
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/super-admin/hospitals">
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
              icon={<Plus className="w-4 h-4" />}
            >
              {loading ? 'Provisioning Hospital...' : 'Complete Hospital Registration'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
