'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
  Lock,
  Bell,
  Trash2,
  FileText,
  Activity,
  Globe,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import QRCode from 'qrcode';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { AbhaCardModal } from '@/components/patient/AbhaCardModal';
import { subscribePatientProfileUpdates } from '@/lib/realtime-telemetry';
import { getCleanPatientSession, DEMO_PATIENT_ACCOUNTS } from '@/lib/demo-patients';
import { getApiBaseUrl } from '@/lib/api-config';
import { ProfilePhotoUploader } from '@/components/profile/ProfilePhotoUploader';

export default function PatientProfilePage() {
  const [activeTab, setActiveTab] = useState<'personal' | 'address' | 'emergency' | 'healthProfile' | 'preferences' | 'security'>('personal');
  const [profile, setProfile] = useState<any>(null);
  const [cleanSession, setCleanSession] = useState(() => getCleanPatientSession());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAbhaModalOpen, setIsAbhaModalOpen] = useState(false);
  const [healthScore, setHealthScore] = useState<any>(null);
  const [guardianDoctors, setGuardianDoctors] = useState<any[]>([]);
  const [copiedUhid, setCopiedUhid] = useState(false);
  const [showUhidModal, setShowUhidModal] = useState(false);
  const [uhidQrDataUrl, setUhidQrDataUrl] = useState('');

  // 1. Personal Information Form
  const [personalForm, setPersonalForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    phone: '',
    email: '',
    preferredLanguage: 'English',
    bloodGroup: 'B_POSITIVE',
  });

  // 2. Structured Address Form
  const [addressForm, setAddressForm] = useState({
    currentHouse: '',
    currentStreet: '',
    currentLandmark: '',
    currentCity: '',
    currentDistrict: '',
    currentState: '',
    currentPinCode: '',
    currentCountry: 'India',

    sameAsCurrent: true,

    permanentHouse: '',
    permanentStreet: '',
    permanentLandmark: '',
    permanentCity: '',
    permanentDistrict: '',
    permanentState: '',
    permanentPinCode: '',
    permanentCountry: 'India',
  });

  // 3. Emergency Information Form
  const [emergencyForm, setEmergencyForm] = useState({
    name: '',
    relationship: 'Family Member',
    phone: '',
    alternatePhone: '',
    details: '',
  });

  // 4. Patient-Reported Health Profile Form
  const [healthProfileForm, setHealthProfileForm] = useState({
    allergies: '',
    medicalConditions: '',
    pastSurgeries: '',
    familyMedicalHistory: '',
    longTermMedications: '',
    notes: '',
  });

  // 5. Notification Preferences Form
  const [prefForm, setPrefForm] = useState({
    email: true,
    sms: true,
    whatsapp: true,
    push: true,
    appointments: true,
    labReports: true,
    reminders: true,
    marketing: false,
  });

  // 6. Security & Password Form
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  // 7. Deletion Request Form
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);

  const activePersona = useMemo(() => {
    return (
      cleanSession?.personaData ||
      DEMO_PATIENT_ACCOUNTS.find((p) => p.uhid === cleanSession?.uhid || p.id === cleanSession?.patientId) ||
      DEMO_PATIENT_ACCOUNTS[0]
    );
  }, [cleanSession]);

  const apiUrl = getApiBaseUrl();

  const fetchProfile = async () => {
    const s = getCleanPatientSession();
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const r = await fetch(`${apiUrl}/patient-portal/profile`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) {
        const data = await r.json();
        setProfile(data);

        // Populate personal form
        const u = data.user || {};
        setPersonalForm({
          firstName: u.firstName || (s.name ? s.name.split(' ')[0] : ''),
          lastName: u.lastName || (s.name ? s.name.split(' ').slice(1).join(' ') : ''),
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
          gender: data.gender || 'MALE',
          phone: data.phone || u.phone || '',
          email: u.email || '',
          preferredLanguage: data.preferredLanguage || 'English',
          bloodGroup: data.bloodGroup || 'B_POSITIVE',
        });

        // Populate address form
        let currentAddr: any = {};
        let permAddr: any = {};
        if (data.address) {
          try {
            const parsed = JSON.parse(data.address);
            if (parsed.current) currentAddr = parsed.current;
            if (parsed.permanent) permAddr = parsed.permanent;
            if (parsed.sameAsCurrent !== undefined) {
              setAddressForm((prev) => ({ ...prev, sameAsCurrent: parsed.sameAsCurrent }));
            }
          } catch {
            // legacy plain string
            currentAddr = { street: data.address };
          }
        }
        setAddressForm((prev) => ({
          ...prev,
          currentHouse: currentAddr.houseNumber || '',
          currentStreet: currentAddr.street || '',
          currentLandmark: currentAddr.landmark || '',
          currentCity: currentAddr.city || '',
          currentDistrict: currentAddr.district || '',
          currentState: currentAddr.state || '',
          currentPinCode: currentAddr.pinCode || '',
          currentCountry: currentAddr.country || 'India',

          permanentHouse: permAddr.houseNumber || '',
          permanentStreet: permAddr.street || '',
          permanentLandmark: permAddr.landmark || '',
          permanentCity: permAddr.city || '',
          permanentDistrict: permAddr.district || '',
          permanentState: permAddr.state || '',
          permanentPinCode: permAddr.pinCode || '',
          permanentCountry: permAddr.country || 'India',
        }));

        // Populate emergency contact form
        const em = data.emergencyContacts?.[0];
        if (em) {
          setEmergencyForm({
            name: em.name || '',
            relationship: em.relationship || 'Family Member',
            phone: em.phone || '',
            alternatePhone: em.alternatePhone || '',
            details: em.details || '',
          });
        }

        // Populate health profile form
        setHealthProfileForm({
          allergies: data.allergies || '',
          medicalConditions: data.medicalConditions || '',
          pastSurgeries: data.pastSurgeries || '',
          familyMedicalHistory: data.familyMedicalHistory || '',
          longTermMedications: data.longTermMedications || '',
          notes: data.healthNotes || '',
        });

        // Populate notification preferences
        if (data.notificationPreferences) {
          const np = data.notificationPreferences;
          setPrefForm({
            email: np.emailEnabled ?? true,
            sms: np.smsEnabled ?? true,
            whatsapp: np.whatsappEnabled ?? true,
            push: np.pushEnabled ?? true,
            appointments: np.appointmentReminders ?? true,
            labReports: np.labResults ?? true,
            reminders: np.medicationReminders ?? true,
            marketing: np.marketingEmails ?? false,
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load profile:', e);
    }

    // Fetch Guardian Health Score & Family Doctor
    try {
      const hsRes = await fetch(`${apiUrl}/health-score/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (hsRes.ok) {
        const hsData = await hsRes.json();
        setHealthScore(hsData);
      }
    } catch {}

    try {
      const docRes = await fetch(`${apiUrl}/health-score/guardian/doctors`, { headers: { Authorization: `Bearer ${token}` } });
      if (docRes.ok) {
        const docData = await docRes.json();
        setGuardianDoctors(Array.isArray(docData) ? docData : []);
      }
    } catch {}

    setLoading(false);
  };

  useEffect(() => {
    const syncSession = () => {
      const s = getCleanPatientSession();
      setCleanSession(s);
      fetchProfile();
    };

    syncSession();
    const unsub = subscribePatientProfileUpdates(() => {
      fetchProfile();
    });

    window.addEventListener('storage', syncSession);
    window.addEventListener('medinexa:patient:changed', syncSession);

    return () => {
      unsub();
      window.removeEventListener('storage', syncSession);
      window.removeEventListener('medinexa:patient:changed', syncSession);
    };
  }, []);

  const uhid = cleanSession?.uhid || profile?.medinexaPersonId || profile?.uhid || activePersona?.uhid || 'MED-DEL-001092';

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
    if (typeof window !== 'undefined') {
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
        ctx.fillText(`${personalForm.firstName} ${personalForm.lastName}`.trim() || 'Patient', 36, 140);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('PERMANENT GLOBAL PATIENT ID', 36, 180);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px monospace';
        ctx.fillText(uhid, 36, 215);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '13px sans-serif';
        ctx.fillText(
          `DOB: ${personalForm.dateOfBirth || 'Not set'}   •   Blood: ${personalForm.bloodGroup.replace('_', ' ')}   •   Phone: ${personalForm.phone || 'Not set'}`,
          36,
          275
        );

        ctx.fillStyle = '#64748b';
        ctx.font = '11px sans-serif';
        ctx.fillText('Valid at all authorized participating MediNexa hospitals across India without duplicate registration.', 36, 335);

        const link = document.createElement('a');
        link.download = `MediNexa_Patient_Card_${uhid}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    }
  };

  // Main Unified Save Function
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSavedMessage(null);
    setErrorMessage(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;
    if (!token) {
      setErrorMessage('Authentication session expired. Please log in.');
      setSaving(false);
      return;
    }

    const payload = {
      firstName: personalForm.firstName.trim() || undefined,
      lastName: personalForm.lastName.trim() || undefined,
      dateOfBirth: personalForm.dateOfBirth || undefined,
      gender: personalForm.gender || undefined,
      phone: personalForm.phone.trim() || undefined,
      preferredLanguage: personalForm.preferredLanguage || undefined,
      bloodGroup: personalForm.bloodGroup || undefined,

      currentAddress: {
        houseNumber: addressForm.currentHouse.trim() || undefined,
        street: addressForm.currentStreet.trim() || undefined,
        landmark: addressForm.currentLandmark.trim() || undefined,
        city: addressForm.currentCity.trim() || undefined,
        district: addressForm.currentDistrict.trim() || undefined,
        state: addressForm.currentState.trim() || undefined,
        pinCode: addressForm.currentPinCode.trim() || undefined,
        country: addressForm.currentCountry.trim() || 'India',
      },
      sameAsCurrentAddress: addressForm.sameAsCurrent,
      permanentAddress: addressForm.sameAsCurrent
        ? {
            houseNumber: addressForm.currentHouse.trim() || undefined,
            street: addressForm.currentStreet.trim() || undefined,
            landmark: addressForm.currentLandmark.trim() || undefined,
            city: addressForm.currentCity.trim() || undefined,
            district: addressForm.currentDistrict.trim() || undefined,
            state: addressForm.currentState.trim() || undefined,
            pinCode: addressForm.currentPinCode.trim() || undefined,
            country: addressForm.currentCountry.trim() || 'India',
          }
        : {
            houseNumber: addressForm.permanentHouse.trim() || undefined,
            street: addressForm.permanentStreet.trim() || undefined,
            landmark: addressForm.permanentLandmark.trim() || undefined,
            city: addressForm.permanentCity.trim() || undefined,
            district: addressForm.permanentDistrict.trim() || undefined,
            state: addressForm.permanentState.trim() || undefined,
            pinCode: addressForm.permanentPinCode.trim() || undefined,
            country: addressForm.permanentCountry.trim() || 'India',
          },

      emergencyContact: {
        name: emergencyForm.name.trim() || undefined,
        relationship: emergencyForm.relationship.trim() || undefined,
        phone: emergencyForm.phone.trim() || undefined,
        alternatePhone: emergencyForm.alternatePhone.trim() || undefined,
        details: emergencyForm.details.trim() || undefined,
      },

      healthProfile: {
        allergies: healthProfileForm.allergies.trim() || undefined,
        medicalConditions: healthProfileForm.medicalConditions.trim() || undefined,
        pastSurgeries: healthProfileForm.pastSurgeries.trim() || undefined,
        familyMedicalHistory: healthProfileForm.familyMedicalHistory.trim() || undefined,
        longTermMedications: healthProfileForm.longTermMedications.trim() || undefined,
        notes: healthProfileForm.notes.trim() || undefined,
      },

      notificationPreferences: {
        email: prefForm.email,
        sms: prefForm.sms,
        whatsapp: prefForm.whatsapp,
        push: prefForm.push,
        appointments: prefForm.appointments,
        labReports: prefForm.labReports,
        reminders: prefForm.reminders,
        marketing: prefForm.marketing,
      },
    };

    try {
      const res = await fetch(`${apiUrl}/patient-portal/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to update profile.');
      }

      setSavedMessage('Profile details successfully updated and saved to hospital database.');
      setTimeout(() => setSavedMessage(null), 4000);
      await fetchProfile();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving profile changes.');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus('New password and confirmation do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus('New password must be at least 6 characters.');
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/patient-portal/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPasswordStatus('✓ Password changed successfully! Please use it next time you log in.');
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordStatus(data.message || 'Failed to change password. Please verify current password.');
      }
    } catch {
      setPasswordStatus('Network error changing password.');
    }
  };

  // Export Patient Health Data (ABDM FHIR)
  const handleExportData = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/patient-portal/export-data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MediNexa_ABDM_Patient_Export_${uhid}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert('Could not export health records at this time.');
      }
    } catch {
      alert('Error downloading health dossier.');
    }
  };

  // Account Deletion Request
  const handleDeleteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/patient-portal/delete-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: deleteReason,
          confirm: true,
        }),
      });
      if (res.ok) {
        alert('Your account deletion request has been submitted to the MediNexa Data Protection Officer (DPO) in accordance with India DPDP Act.');
        setShowDeleteModal(false);
      } else {
        alert('Failed to submit deletion request.');
      }
    } catch {
      alert('Error submitting deletion request.');
    } finally {
      setDeleting(false);
    }
  };

  const abha = profile?.abhaProfile;
  const abhaNumber = abha?.abhaNumber || '91-8201-9231-4412';
  const abhaAddress = abha?.abhaAddress || `${personalForm.firstName.toLowerCase()}.${personalForm.lastName.toLowerCase()}@abdm`;
  const linkedDate = abha?.verifiedAt
    ? new Date(abha.verifiedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '4 Sep 2026';

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/portal" className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 transition">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Profile & Account Settings
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Title & Description */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight">
              Personal Profile & Account Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your personal information, address records, emergency contacts, self-reported health history, and privacy preferences.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSaveProfile}
              disabled={saving}
              className="rounded-xl px-5 py-2.5 font-bold shadow-sm"
            >
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        </div>

        {/* Feedback Messages */}
        {savedMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* MediNexa Global Patient ID Card */}
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
                Use this permanent UHID at any participating MediNexa hospital across India to retrieve verified clinical records instantly without duplicate registrations.
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
                <span>Download Card</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'personal'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Personal Information</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('address')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'address'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Address Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('emergency')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'emergency'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Emergency Contacts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('healthProfile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'healthProfile'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Health Profile (Self-Reported)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'preferences'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications & Export</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'security'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security & Password</span>
          </button>
        </div>

        {/* TAB 1: PERSONAL INFORMATION */}
        {activeTab === 'personal' && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Primary identification details associated with your clinical records</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 text-xs">
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
                <ProfilePhotoUploader
                  currentPhotoUrl={profile?.avatarUrl || profile?.addressData?.avatarUrl}
                  initials={`${personalForm.firstName?.[0] || 'P'}${personalForm.lastName?.[0] || 'T'}`}
                  onSuccess={() => {
                    fetchProfile();
                  }}
                />
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                    Blood Group: {personalForm.bloodGroup.replace('_', ' ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAbhaModalOpen(true)}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 hover:underline cursor-pointer"
                  >
                    ABHA ID: {abhaNumber}
                  </button>
                  <span className="text-[10px] text-slate-400">
                    Email: <strong className="text-slate-600 dark:text-slate-300">{personalForm.email || 'patient@medinexa.in'}</strong>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={personalForm.firstName}
                    onChange={(e) => setPersonalForm({ ...personalForm, firstName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={personalForm.lastName}
                    onChange={(e) => setPersonalForm({ ...personalForm, lastName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={personalForm.dateOfBirth}
                    onChange={(e) => setPersonalForm({ ...personalForm, dateOfBirth: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Biological Gender
                  </label>
                  <select
                    value={personalForm.gender}
                    onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other / Non-Binary</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Blood Group (if known)
                  </label>
                  <select
                    value={personalForm.bloodGroup}
                    onChange={(e) => setPersonalForm({ ...personalForm, bloodGroup: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="A_POSITIVE">A Positive (A+)</option>
                    <option value="B_POSITIVE">B Positive (B+)</option>
                    <option value="O_POSITIVE">O Positive (O+)</option>
                    <option value="AB_POSITIVE">AB Positive (AB+)</option>
                    <option value="A_NEGATIVE">A Negative (A-)</option>
                    <option value="B_NEGATIVE">B Negative (B-)</option>
                    <option value="O_NEGATIVE">O Negative (O-)</option>
                    <option value="AB_NEGATIVE">AB Negative (AB-)</option>
                    <option value="UNKNOWN">Not Known / Yet to Test</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={personalForm.phone}
                    onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Communication Language
                  </label>
                  <select
                    value={personalForm.preferredLanguage}
                    onChange={(e) => setPersonalForm({ ...personalForm, preferredLanguage: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Marathi">Marathi (मराठी)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="button" variant="primary" size="md" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Personal Details'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 2: ADDRESS DETAILS */}
        {activeTab === 'address' && (
          <Card>
            <CardHeader>
              <CardTitle>Address & Residence Management</CardTitle>
              <CardDescription>
                Detailed current residence and permanent address for home visits and emergency triage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-xs">
              {/* Current Address */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    Current Residential Address
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      House / Flat / Apartment Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 402, Tower B"
                      value={addressForm.currentHouse}
                      onChange={(e) => setAddressForm({ ...addressForm, currentHouse: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Street / Road / Locality
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Knowledge Park II"
                      value={addressForm.currentStreet}
                      onChange={(e) => setAddressForm({ ...addressForm, currentStreet: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Metro Station"
                      value={addressForm.currentLandmark}
                      onChange={(e) => setAddressForm({ ...addressForm, currentLandmark: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      City / Town
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Greater Noida"
                      value={addressForm.currentCity}
                      onChange={(e) => setAddressForm({ ...addressForm, currentCity: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Gautam Buddha Nagar"
                      value={addressForm.currentDistrict}
                      onChange={(e) => setAddressForm({ ...addressForm, currentDistrict: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Uttar Pradesh"
                      value={addressForm.currentState}
                      onChange={(e) => setAddressForm({ ...addressForm, currentState: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      PIN Code (6 digits)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 201310"
                      value={addressForm.currentPinCode}
                      onChange={(e) => setAddressForm({ ...addressForm, currentPinCode: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={addressForm.currentCountry}
                      onChange={(e) => setAddressForm({ ...addressForm, currentCountry: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Same as Current Address Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">
                    Permanent Address is the same as Current Address
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Uncheck to provide a separate permanent or hometown residence address.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={addressForm.sameAsCurrent}
                  onChange={(e) => setAddressForm({ ...addressForm, sameAsCurrent: e.target.checked })}
                  className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
              </div>

              {/* Permanent Address (if different) */}
              {!addressForm.sameAsCurrent && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      Permanent Address
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        House / Flat Number
                      </label>
                      <input
                        type="text"
                        value={addressForm.permanentHouse}
                        onChange={(e) => setAddressForm({ ...addressForm, permanentHouse: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Street / Locality
                      </label>
                      <input
                        type="text"
                        value={addressForm.permanentStreet}
                        onChange={(e) => setAddressForm({ ...addressForm, permanentStreet: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={addressForm.permanentLandmark}
                        onChange={(e) => setAddressForm({ ...addressForm, permanentLandmark: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        City / Town
                      </label>
                      <input
                        type="text"
                        value={addressForm.permanentCity}
                        onChange={(e) => setAddressForm({ ...addressForm, permanentCity: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        District
                      </label>
                      <input
                        type="text"
                        value={addressForm.permanentDistrict}
                        onChange={(e) => setAddressForm({ ...addressForm, permanentDistrict: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={addressForm.permanentState}
                        onChange={(e) => setAddressForm({ ...addressForm, permanentState: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={addressForm.permanentPinCode}
                        onChange={(e) => setAddressForm({ ...addressForm, permanentPinCode: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={addressForm.permanentCountry}
                        onChange={(e) => setAddressForm({ ...addressForm, permanentCountry: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Button type="button" variant="primary" size="md" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Address Information'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 3: EMERGENCY CONTACTS */}
        {activeTab === 'emergency' && (
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
              <CardDescription>
                Designated individuals contacted immediately in the event of hospital emergency admission or acute triage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Important Note on Emergency Notifications</span>
                </div>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-1">
                  Emergency contacts receive automated SMS and phone call alerts if your vital telemetry or ambulance dispatch triggers a critical emergency (Score &lt; 40).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Contact Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={emergencyForm.name}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Relationship to Patient
                  </label>
                  <select
                    value={emergencyForm.relationship}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, relationship: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent (Father / Mother)</option>
                    <option value="Sibling">Sibling (Brother / Sister)</option>
                    <option value="Son / Daughter">Son / Daughter</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Close Friend">Close Friend</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Direct Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={emergencyForm.phone}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Alternate Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98000 00000"
                    value={emergencyForm.alternatePhone}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, alternatePhone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Specific Emergency Instructions / Advance Directives
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Call spouse first; notify family physician Dr. Sharma. Resides 15 minutes away from hospital."
                  value={emergencyForm.details}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, details: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="button" variant="primary" size="md" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Emergency Contact'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 4: HEALTH PROFILE (PATIENT-REPORTED) */}
        {activeTab === 'healthProfile' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Self-Reported Health Profile</CardTitle>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Patient-Reported • Distinct from Clinician EHR
                </span>
              </div>
              <CardDescription>
                Provide medical history you are aware of. Clinicians will review this during consultations without altering verified diagnoses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-rose-700 dark:text-rose-400 mb-1">
                  Known Drug & Environmental Allergies
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Penicillin (Hives), Aspirin (Gastric upset), Peanuts. Or leave as 'No known drug allergies (NKDA)'."
                  value={healthProfileForm.allergies}
                  onChange={(e) => setHealthProfileForm({ ...healthProfileForm, allergies: e.target.value })}
                  className="w-full p-2.5 bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-900 dark:text-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Existing Medical Conditions (e.g. Hypertension, Diabetes, Thyroid)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Type 2 Diabetes (diagnosed 2021), Primary Hypertension. Or 'None'."
                  value={healthProfileForm.medicalConditions}
                  onChange={(e) => setHealthProfileForm({ ...healthProfileForm, medicalConditions: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Past Surgeries & Major Hospitalizations
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Appendectomy (2018), Coronary Angioplasty (Aug 2026)."
                    value={healthProfileForm.pastSurgeries}
                    onChange={(e) => setHealthProfileForm({ ...healthProfileForm, pastSurgeries: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Relevant Family Medical History
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Father had premature coronary artery disease; Mother has diabetes."
                    value={healthProfileForm.familyMedicalHistory}
                    onChange={(e) => setHealthProfileForm({ ...healthProfileForm, familyMedicalHistory: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Existing Long-Term Medications (Self-Reported / Over-The-Counter)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Metformin 500mg OD, Multivitamin tablet once daily."
                  value={healthProfileForm.longTermMedications}
                  onChange={(e) => setHealthProfileForm({ ...healthProfileForm, longTermMedications: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="button" variant="primary" size="md" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Health Profile'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 5: NOTIFICATIONS & DATA EXPORT */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication & Notification Channels</CardTitle>
                <CardDescription>Configure which channels MediNexa may use to alert you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Email Alerts</span>
                      <span className="text-[10px] text-slate-400">Appointment slips and verified lab PDFs</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefForm.email}
                      onChange={(e) => setPrefForm({ ...prefForm, email: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">SMS Alerts</span>
                      <span className="text-[10px] text-slate-400">Token updates and queue callouts</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefForm.sms}
                      onChange={(e) => setPrefForm({ ...prefForm, sms: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">WhatsApp Care Updates</span>
                      <span className="text-[10px] text-slate-400">Official verified WhatsApp messages</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefForm.whatsapp}
                      onChange={(e) => setPrefForm({ ...prefForm, whatsapp: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Browser Push Notifications</span>
                      <span className="text-[10px] text-slate-400">Time-sensitive medicine reminders</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefForm.push}
                      onChange={(e) => setPrefForm({ ...prefForm, push: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="button" variant="primary" size="md" onClick={handleSaveProfile} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Notification Preferences'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ABDM FHIR Data Export */}
            <Card>
              <CardHeader>
                <CardTitle>ABDM & FHIR Health Data Portability</CardTitle>
                <CardDescription>Export your entire medical records dossier in official JSON/FHIR format</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Under the Ayushman Bharat Digital Mission (ABDM) and India Digital Personal Data Protection (DPDP) Act, you have the right to download a copy of all health records, test results, and prescriptions stored in your MediNexa profile.
                </p>

                <div className="pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleExportData}
                    icon={<Download className="w-4 h-4" />}
                    className="font-bold"
                  >
                    Download ABDM FHIR Data Dossier (.JSON)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 6: SECURITY & PASSWORD */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your portal authentication credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {passwordStatus && (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-xs text-slate-800 dark:text-slate-200">
                    {passwordStatus}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      New Password (min 6 characters)
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit" variant="primary" size="md" className="font-bold">
                      Update Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Account Deletion Request Card */}
            <Card className="border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10">
              <CardHeader>
                <CardTitle className="text-rose-600 dark:text-rose-400">Account Deletion Request</CardTitle>
                <CardDescription>
                  Permanently delete account credentials and request erasure of patient profile subject to statutory medical record retention laws
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <p className="text-slate-600 dark:text-slate-400">
                  Per the Clinical Establishments Act and Medical Council rules, hospital inpatient and clinical treatment records must be retained for legal compliance. Digital portal login credentials and self-reported data can be purged upon verified request.
                </p>

                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  onClick={() => setShowDeleteModal(true)}
                  className="font-bold"
                >
                  Request Account Deletion
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* ABHA Modal */}
      <AbhaCardModal
        isOpen={isAbhaModalOpen}
        onClose={() => setIsAbhaModalOpen(false)}
        patient={profile}
        abhaProfile={abha}
        onLinked={fetchProfile}
      />

      {/* UHID QR Code Modal */}
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
              Safe lookup token: <span className="font-mono font-bold">MNX:UHID:{uhid}</span>. Reception must authenticate before resolving patient records.
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

      {/* Account Deletion Request Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Confirm Account Deletion Request</span>
              </h3>
              <button onClick={() => setShowDeleteModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDeleteRequest} className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Please let us know the reason for your account deletion request. Our Data Protection Officer will process this request within 30 days.
              </p>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Deletion
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Relocating abroad, closing account, privacy preference"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm"
                >
                  {deleting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
