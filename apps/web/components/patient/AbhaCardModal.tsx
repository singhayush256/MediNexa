'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Download,
  Printer,
  X,
  QrCode,
  Sparkles,
  Lock,
  Smartphone,
  Check,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui';

interface AbhaCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
  abhaProfile: any;
  onLinked?: () => void;
}

export function AbhaCardModal({
  isOpen,
  onClose,
  patient,
  abhaProfile,
  onLinked,
}: AbhaCardModalProps) {
  const [activeTab, setActiveTab] = useState<'card' | 'link'>('card');
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State for Linking
  const [abhaNumberInput, setAbhaNumberInput] = useState('');
  const [abhaAddressInput, setAbhaAddressInput] = useState('');
  const [otpInput, setOtpInput] = useState('');

  if (!isOpen) return null;

  const firstName = patient?.user?.firstName || 'Patient';
  const lastName = patient?.user?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const phone = patient?.phone || patient?.user?.phone || '+91 8114240263';
  const gender = patient?.gender || 'NOT SPECIFIED';
  const dob = patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Aug 1992';

  const isLinked = !!abhaProfile?.linked;
  const abhaNumber = abhaProfile?.abhaNumber || '91-4521-8892-3041';
  const abhaAddress = abhaProfile?.abhaAddress || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@abdm`;
  const linkedDate = abhaProfile?.verifiedAt
    ? new Date(abhaProfile.verifiedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '4 Sep 2026';

  const handleGenerateDefaults = () => {
    const random14 = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    setAbhaNumberInput(random14);
    setAbhaAddressInput(`${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 90 + 10)}@abdm`);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!abhaNumberInput) {
      setError('Please enter a 14-digit ABHA number or use auto-fill.');
      return;
    }
    setError(null);
    setStep('otp');
    setOtpInput('123456'); // Pre-fill test OTP for demo convenience
  };

  const handleVerifyAndLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

      const res = await fetch(`${apiUrl}/abdm/abha/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: patient.id,
          abhaNumber: abhaNumberInput,
          abhaAddress: abhaAddressInput,
          mobile: phone,
          otp: otpInput || '123456',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to verify and link ABHA ID');
      }

      setSuccess('ABHA health account verified and linked to your hospital profile!');
      if (onLinked) onLinked();
      setTimeout(() => {
        setActiveTab('card');
        setStep('details');
        setSuccess(null);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Verification error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800 flex items-center justify-center shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Ayushman Bharat Health Account (ABHA)</h2>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">National Health Authority • Ministry of Health & Family Welfare</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 pt-2.5 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('card')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'card'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Official ABHA Card
          </button>
          <button
            onClick={() => {
              setActiveTab('link');
              if (!abhaNumberInput) handleGenerateDefaults();
            }}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'link'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {isLinked ? 'Update / Re-verify ABHA' : 'Link ABHA Account'}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {activeTab === 'card' ? (
            <div className="space-y-5">
              {/* The Official ABHA Card */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-white via-slate-50/80 to-emerald-50/20 border-2 border-slate-200/90 dark:border-slate-700 shadow-md p-6 text-slate-900 font-sans">
                {/* Tri-color Top Accent Strip */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-white to-emerald-500" />

                {/* Card Header */}
                <div className="flex justify-between items-start pt-1 pb-3.5 border-b border-slate-200/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center text-sm shadow-xs">
                      🇮🇳
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                        Government of India
                      </div>
                      <div className="text-xs font-extrabold text-slate-900">
                        Ayushman Bharat Digital Mission (ABDM)
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" /> {isLinked ? 'ABHA Verified' : 'Demo Verified'}
                    </span>
                  </div>
                </div>

                {/* Card Main Body */}
                <div className="grid grid-cols-3 gap-4 my-4 items-center">
                  {/* Photo / Avatar */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100/70 border border-slate-200/80">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl font-black shadow-inner">
                      {firstName[0]}
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 mt-1 uppercase">Photo Verified</span>
                  </div>

                  {/* Patient Attributes */}
                  <div className="col-span-2 space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Full Name</span>
                      <p className="font-extrabold text-sm text-slate-900">{fullName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Gender</span>
                        <p className="font-bold text-slate-700 text-[11px]">{gender}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">DOB</span>
                        <p className="font-bold text-slate-700 text-[11px]">{dob}</p>
                      </div>
                    </div>

                    <div className="pt-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">ABHA Address</span>
                      <p className="font-mono text-[11px] text-emerald-700 font-bold">{abhaAddress}</p>
                    </div>
                  </div>
                </div>

                {/* ABHA Number & QR Code Section */}
                <div className="pt-3.5 border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">ABHA Number</span>
                    <p className="font-mono text-base sm:text-lg font-black text-slate-900 tracking-widest">
                      {abhaNumber}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Linked Date: {linkedDate} • Campus: MediNexa Knowledge Park II
                    </p>
                  </div>

                  {/* Simulated QR Code SVG */}
                  <div className="p-1.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <svg className="w-12 h-12" viewBox="0 0 100 100" fill="#0f172a">
                      <rect x="0" y="0" width="30" height="30" />
                      <rect x="5" y="5" width="20" height="20" fill="#ffffff" />
                      <rect x="10" y="10" width="10" height="10" />
                      <rect x="70" y="0" width="30" height="30" />
                      <rect x="75" y="5" width="20" height="20" fill="#ffffff" />
                      <rect x="80" y="10" width="10" height="10" />
                      <rect x="0" y="70" width="30" height="30" />
                      <rect x="5" y="75" width="20" height="20" fill="#ffffff" />
                      <rect x="10" y="80" width="10" height="10" />
                      <rect x="40" y="20" width="10" height="30" />
                      <rect x="55" y="35" width="15" height="10" />
                      <rect x="40" y="65" width="25" height="10" />
                      <rect x="75" y="75" width="20" height="20" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Lock className="h-3.5 w-3.5 text-emerald-600" />
                  <span>256-Bit Encrypted Indian Digital Health ID</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    size="sm"
                    className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl"
                  >
                    <Printer className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                    Print Card
                  </Button>
                  <Button
                    onClick={handlePrint}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Download ABHA Card
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Linking / Re-verification Form */
            <div className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{success}</span>
                </div>
              )}

              {step === 'details' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      14-Digit ABHA Number
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateDefaults}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" /> Auto-Generate Valid ABHA
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="91-XXXX-XXXX-XXXX"
                    value={abhaNumberInput}
                    onChange={(e) => setAbhaNumberInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Preferred ABHA Address (e.g. name@abdm)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="patient.name@abdm"
                      value={abhaAddressInput}
                      onChange={(e) => setAbhaAddressInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none font-mono"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                    <p className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                      OTP will be sent to registered mobile: {phone}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Compliant with Ayushman Bharat Digital Mission (ABDM) M1/M2/M3 framework.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('card')}
                      className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                    >
                      Send Aadhaar OTP
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyAndLink} className="space-y-4">
                  <div className="text-center py-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-2">
                      <Lock className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">Enter Verification OTP</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter the 6-digit OTP sent for ABHA {abhaNumberInput}
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="123456"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-full text-center tracking-[0.5em] text-xl font-bold font-mono p-3 rounded-xl bg-slate-50 border border-slate-200 text-emerald-700 focus:border-emerald-500 focus:bg-white focus:outline-none"
                    />
                    <p className="text-center text-[11px] text-slate-400 mt-2">
                      Simulator Note: Any 6 digits or default <strong className="text-emerald-600">123456</strong> will verify.
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Back to details
                    </button>

                    <Button
                      type="submit"
                      disabled={loading}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                    >
                      {loading ? 'Verifying with ABDM Gateway...' : 'Verify & Link ABHA'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
