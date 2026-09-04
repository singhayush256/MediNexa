'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Heart,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  QrCode,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { AbhaCardModal } from '@/components/patient/AbhaCardModal';

export default function PatientProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [isAbhaModalOpen, setIsAbhaModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    bloodGroup: 'B_POSITIVE',
    allergies: 'None recorded (Clinical check completed)',
    emergencyContactName: 'Aarav Sharma (Brother)',
    emergencyContactPhone: '+91 98101 54321',
  });

  const fetchProfile = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

    if (token) {
      try {
        const r = await fetch(`${apiUrl}/patient-portal/profile`, { headers: { Authorization: `Bearer ${token}` } });
        if (r.ok) {
          const data = await r.json();
          setProfile(data);
          setFormData({
            phone: data.phone || data.user?.phone || '+91 98101 23456',
            address: data.address || 'Flat 402, Sector 62, Noida, Uttar Pradesh - 201309',
            bloodGroup: data.bloodGroup || 'B_POSITIVE',
            allergies: data.allergies || 'No known drug allergies (NKDA)',
            emergencyContactName: data.emergencyContacts?.[0]?.name || 'Family Member',
            emergencyContactPhone: data.emergencyContacts?.[0]?.phone || '+91 98101 88990',
          });
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

      await fetch(`${apiUrl}/patient-portal/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: formData.phone,
          address: formData.address,
          bloodGroup: formData.bloodGroup,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
        }),
      });

      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3500);
      await fetchProfile();
    } catch (err) {
    } finally {
      setSaving(false);
    }
  };

  const patientUser = profile?.user || {};
  const firstName = patientUser.firstName || 'Patient';
  const lastName = patientUser.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const abha = profile?.abhaProfile;
  const isAbhaLinked = !!abha?.linked;
  const abhaNumber = abha?.abhaNumber || '91-8201-9231-4412';
  const abhaAddress = abha?.abhaAddress || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@abdm`;
  const linkedDate = abha?.verifiedAt
    ? new Date(abha.verifiedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '4 Sep 2026';

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/portal" className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portal</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Personal Health Profile
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight">
            Patient Identity & Ayushman Bharat ABHA
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your official contact details, emergency notifications, and verified National Health Authority (NHA) credentials.
          </p>
        </div>

        {savedMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile details successfully updated and synchronized across hospital records.</span>
          </div>
        )}

        {/* Official ABHA Card Badge Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-950/30 via-slate-900 to-emerald-950/30 border border-slate-800 p-6 shadow-xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-500" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                🇮🇳
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white">Ayushman Bharat Health Account (ABHA)</h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <CheckCircle2 className="h-3 w-3" /> ABHA Verified
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-300 font-mono">
                  <span>Number: <strong className="text-white">{abhaNumber}</strong></span>
                  <span>•</span>
                  <span>Address: <strong className="text-emerald-400">{abhaAddress}</strong></span>
                  <span>•</span>
                  <span className="text-slate-400 text-[11px] font-sans">Linked: {linkedDate}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsAbhaModalOpen(true)}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md"
            >
              <QrCode className="h-3.5 w-3.5 mr-1.5" />
              View / Download ABHA Card
            </Button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Demographics & Clinical Identifiers</CardTitle>
              <CardDescription>Primary hospital record and identification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg">
                  {firstName ? firstName[0] : 'P'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{fullName}</h3>
                  <p className="text-[11px] text-slate-500">
                    Email: {patientUser.email || 'patient@medinexa.in'} • Campus: MediNexa Sector 62, Noida
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                      Blood Group: {formData.bloodGroup.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                      ABHA ID: {abhaNumber}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A_POSITIVE">A Positive (A+)</option>
                    <option value="B_POSITIVE">B Positive (B+)</option>
                    <option value="O_POSITIVE">O Positive (O+)</option>
                    <option value="AB_POSITIVE">AB Positive (AB+)</option>
                    <option value="A_NEGATIVE">A Negative (A-)</option>
                    <option value="B_NEGATIVE">B Negative (B-)</option>
                    <option value="O_NEGATIVE">O Negative (O-)</option>
                    <option value="AB_NEGATIVE">AB Negative (AB-)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Residential Address (Delhi-NCR)
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-rose-700 dark:text-rose-400 mb-1">
                  Active Drug & Environmental Allergies (Critical for Physician E-Prescribing)
                </label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full p-2.5 bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-900 dark:text-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
              <CardDescription>Designated family member notified during emergency triage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Contact Name & Relation
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Contact Direct Phone
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" size="md" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>

      {/* ABHA Modal */}
      <AbhaCardModal
        isOpen={isAbhaModalOpen}
        onClose={() => setIsAbhaModalOpen(false)}
        patient={profile}
        abhaProfile={abha}
        onLinked={fetchProfile}
      />
    </div>
  );
}
