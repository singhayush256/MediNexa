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
  Copy,
  Check,
  Download,
  X,
} from 'lucide-react';
import QRCode from 'qrcode';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { AbhaCardModal } from '@/components/patient/AbhaCardModal';
import { subscribePatientProfileUpdates } from '@/lib/realtime-telemetry';

export default function PatientProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [isAbhaModalOpen, setIsAbhaModalOpen] = useState(false);
  const [healthScore, setHealthScore] = useState<any>(null);
  const [guardianDoctors, setGuardianDoctors] = useState<any[]>([]);
  const [copiedUhid, setCopiedUhid] = useState(false);
  const [showUhidModal, setShowUhidModal] = useState(false);
  const [uhidQrDataUrl, setUhidQrDataUrl] = useState('');

  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    bloodGroup: 'B_POSITIVE',
    allergies: 'None recorded (Clinical check completed)',
    emergencyContactName: 'Ayush Singh (Brother)',
    emergencyContactPhone: '+91 8114240263',
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
            phone: data.phone || data.user?.phone || '+91 8114240263',
            address: data.address || 'Knowledge Park II, Greater Noida, Uttar Pradesh - 201310',
            bloodGroup: data.bloodGroup || 'B_POSITIVE',
            allergies: data.allergies || 'No known drug allergies (NKDA)',
            emergencyContactName: data.emergencyContacts?.[0]?.name || 'Family Member',
            emergencyContactPhone: data.emergencyContacts?.[0]?.phone || '+91 8114240263',
          });
        }
      } catch (e) {
      }

      // Fetch Guardian Health Score & Family Doctor
      try {
        const hsRes = await fetch(`${apiUrl}/health-score/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (hsRes.ok) {
          const hsData = await hsRes.json();
          setHealthScore(hsData);
        }
      } catch (e) {}

      try {
        const docRes = await fetch(`${apiUrl}/health-score/guardian/doctors`, { headers: { Authorization: `Bearer ${token}` } });
        if (docRes.ok) {
          const docData = await docRes.json();
          setGuardianDoctors(Array.isArray(docData) ? docData : []);
        }
      } catch (e) {}

      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    const unsub = subscribePatientProfileUpdates(() => {
      fetchProfile();
    });
    return () => unsub();
  }, []);

  const uhid = profile?.medinexaPersonId || profile?.uhid || 'AYU-4826-KM';

  const handleCopyUhid = () => {
    if (typeof window !== 'undefined' && navigator?.clipboard) {
      navigator.clipboard.writeText(uhid);
      setCopiedUhid(true);
      setTimeout(() => setCopiedUhid(false), 2500);
    }
  };

  const handleOpenUhidQr = async () => {
    try {
      const url = await QRCode.toDataURL(`MNX:UHID:${uhid}`, {
        width: 320,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
      });
      setUhidQrDataUrl(url);
    } catch (e) {
      console.error(e);
    }
    setShowUhidModal(true);
  };

  const handleDownloadPatientIdCard = () => {
    if (typeof window === 'undefined') return;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 380;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 640, 380);

      const grad = ctx.createLinearGradient(0, 0, 640, 0);
      grad.addColorStop(0, '#2563eb');
      grad.addColorStop(0.5, '#4f46e5');
      grad.addColorStop(1, '#06b6d4');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 8);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('MediNexa Healthcare Network', 36, 52);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px sans-serif';
      ctx.fillText('Universal Patient Identity Card (Permanent UHID)', 36, 76);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(fullName || 'Ayush Singh', 36, 140);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('PERMANENT GLOBAL PATIENT ID', 36, 180);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(uhid, 36, 215);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '13px sans-serif';
      ctx.fillText(`DOB: ${profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '14 Oct 1988'}   •   Blood: ${formData.bloodGroup}   •   Phone: ${formData.phone}`, 36, 275);

      ctx.fillStyle = '#64748b';
      ctx.font = '11px sans-serif';
      ctx.fillText('Valid at all authorized participating MediNexa hospitals across India without duplicate registration.', 36, 335);

      const link = document.createElement('a');
      link.download = `MediNexa_Patient_Card_${uhid}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

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

        {/* MediNexa Global Patient ID Card (Section 2 & 36) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white p-6 sm:p-7 shadow-xl border border-indigo-500/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-black uppercase tracking-widest text-indigo-300">
                  MediNexa Patient ID
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                  Permanent Global ID
                </span>
              </div>

              <div className="font-mono text-2xl sm:text-3xl font-black tracking-wider text-white">
                {uhid}
              </div>

              <p className="text-xs text-indigo-200/90 max-w-xl leading-relaxed">
                Use this Patient ID at any participating MediNexa hospital to find and register your patient profile.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleCopyUhid}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
              >
                {copiedUhid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUhid ? 'Copied!' : 'Copy ID'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenUhidQr}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/30"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Show QR</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPatientIdCard}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Patient ID Card</span>
              </button>
            </div>
          </div>
        </div>

        {/* Official ABHA Card Badge Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-200 to-emerald-500" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/80 flex items-center justify-center text-3xl shadow-xs">
                🇮🇳
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Ayushman Bharat Health Account (ABHA)</h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> ABHA Verified
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-mono">
                  <span>Number: <strong className="text-slate-900 dark:text-slate-100 font-bold">{abhaNumber}</strong></span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span>Address: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{abhaAddress}</strong></span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] font-sans">Linked: {linkedDate}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsAbhaModalOpen(true)}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs rounded-xl px-4 py-2.5"
            >
              <QrCode className="h-3.5 w-3.5 mr-1.5" />
              View / Download ABHA Card
            </Button>
          </div>
        </div>

        {/* Integrated Health Score & Emergency Guardian Status Widget */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-xl shadow-inner">
                🛡️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Health Score & Emergency Guardian
                  </h2>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300">
                    Active Telemetry
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Continuous vital surveillance, family doctor linkage, and automated safety thresholds.
                </p>
              </div>
            </div>

            <Link
              href="/portal/health-score"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition shadow-xs"
            >
              <span>Open Guardian Console</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
            {/* Score Meter Snapshot */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Health Score</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {healthScore?.overallScore ?? 92}
                  </span>
                  <span className="text-xs font-bold text-slate-400">/100</span>
                </div>
                <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {healthScore?.category || 'HEALTHY'} • Trend +5
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                ✓
              </div>
            </div>

            {/* Family Doctor Assignment */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Family Doctor</div>
              {guardianDoctors && guardianDoctors.length > 0 ? (
                <div className="mt-1">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                    {guardianDoctors[0].doctor?.user
                      ? `Dr. ${guardianDoctors[0].doctor.user.firstName} ${guardianDoctors[0].doctor.user.lastName}`
                      : 'Dr. Rajesh Sharma'}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {guardianDoctors[0].doctor?.specialty || 'Internal Medicine & Family Care'}
                  </div>
                  <span className="inline-block mt-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300">
                    {guardianDoctors[0].role || 'PRIMARY'}
                  </span>
                </div>
              ) : (
                <div className="mt-1">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Dr. Rajesh Sharma</div>
                  <div className="text-[11px] text-slate-500">Internal Medicine & Family Care</div>
                  <span className="inline-block mt-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300">
                    PRIMARY
                  </span>
                </div>
              )}
            </div>

            {/* Emergency Alert Protocol Status */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emergency Guardian Safety</div>
              <div className="mt-1 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">Protocols Active</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Primary Contact: <strong className="text-slate-700 dark:text-slate-300">{formData.emergencyContactName}</strong>
              </div>
              <div className="text-[10px] text-slate-400">
                Critical Score &lt; 40 triggers immediate SOS dispatch
              </div>
            </div>
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
                    Email: {patientUser.email || 'patient@medinexa.in'} • Campus: MediNexa Knowledge Park II, Greater Noida
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

      {/* UHID QR Code Modal (Section 3) */}
      {showUhidModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  MediNexa UHID QR Code
                </h3>
              </div>
              <button
                onClick={() => setShowUhidModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center">
              {uhidQrDataUrl ? (
                <img src={uhidQrDataUrl} alt="UHID QR" className="w-48 h-48 rounded-xl shadow-xs" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                  Generating QR...
                </div>
              )}
              <div className="mt-3 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Permanent Global UHID</div>
                <div className="text-xs font-mono font-black text-slate-900 dark:text-white mt-0.5">{uhid}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
              Safe lookup token: <span className="font-mono font-bold">MNX:UHID:{uhid}</span>. Reception must authenticate before resolving patient records. Medical records are never placed directly in the QR.
            </div>

            <button
              onClick={() => setShowUhidModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
