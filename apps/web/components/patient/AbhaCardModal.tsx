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
  const phone = patient?.phone || patient?.user?.phone || '+91 98101 23456';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ayushman Bharat Health Account (ABHA)</h2>
              <p className="text-[11px] text-slate-400">National Health Authority • Ministry of Health & Family Welfare</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 px-6 pt-3 gap-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('card')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'card'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
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
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
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
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-700/80 shadow-2xl p-5 text-slate-100 font-sans">
                {/* Tri-color Top Accent Strip */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-white to-emerald-500" />

                {/* Card Header */}
                <div className="flex justify-between items-start pt-1 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-amber-400">
                      🇮🇳
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400">
                        Government of India
                      </div>
                      <div className="text-xs font-bold text-white">
                        Ayushman Bharat Digital Mission (ABDM)
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3" /> {isLinked ? 'ABHA Verified' : 'Demo Verified'}
                    </span>
                  </div>
                </div>

                {/* Card Main Body */}
                <div className="grid grid-cols-3 gap-4 my-4 items-center">
                  {/* Photo / Avatar */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl font-black shadow-inner">
                      {firstName[0]}
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400 mt-1 uppercase">Photo Verified</span>
                  </div>

                  {/* Patient Attributes */}
                  <div className="col-span-2 space-y-1 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-medium">Full Name</span>
                      <p className="font-bold text-sm text-white">{fullName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-medium">Gender</span>
                        <p className="font-semibold text-slate-200 text-[11px]">{gender}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-medium">DOB</span>
                        <p className="font-semibold text-slate-200 text-[11px]">{dob}</p>
                      </div>
                    </div>

                    <div className="pt-1">
                      <span className="text-[10px] text-slate-400 uppercase font-medium">ABHA Address</span>
                      <p className="font-mono text-[11px] text-emerald-400 font-semibold">{abhaAddress}</p>
                    </div>
                  </div>
                </div>

                {/* ABHA Number & QR Code Section */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">ABHA Number</span>
                    <p className="font-mono text-base font-extrabold text-white tracking-widest">
                      {abhaNumber}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      Linked Date: {linkedDate} • Campus: MediNexa Sector 62
                    </p>
                  </div>

                  {/* Simulated QR Code SVG */}
                  <div className="p-1.5 bg-white rounded-lg shadow-md">
                    <svg className="w-12 h-12" viewBox="0 0 100 100" fill="#000000">
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
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>256-Bit Encrypted Indian Digital Health ID</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    size="sm"
                    className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                  >
                    <Printer className="h-3.5 w-3.5 mr-1.5" />
                    Print Card
                  </Button>
                  <Button
                    onClick={handlePrint}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
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
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>{success}</span>
                </div>
              )}

              {step === 'details' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      14-Digit ABHA Number
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateDefaults}
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
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
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                  />

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Preferred ABHA Address (e.g. name@abdm)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="patient.name@abdm"
                      value={abhaAddressInput}
                      onChange={(e) => setAbhaAddressInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                    <p className="flex items-center gap-1.5 font-medium text-slate-300">
                      <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                      OTP will be sent to registered mobile: {phone}
                    </p>
                    <p className="text-[11px]">
                      Compliant with Ayushman Bharat Digital Mission (ABDM) M1/M2/M3 framework.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('card')}
                      className="border-slate-800 text-slate-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                    >
                      Send Aadhaar OTP
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyAndLink} className="space-y-4">
                  <div className="text-center py-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                      <Lock className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Enter Verification OTP</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
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
                      className="w-full text-center tracking-[0.5em] text-xl font-bold font-mono p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 focus:border-emerald-500 focus:outline-none"
                    />
                    <p className="text-center text-[11px] text-slate-400 mt-2">
                      Simulator Note: Any 6 digits or default <strong className="text-emerald-400">123456</strong> will verify.
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Back to details
                    </button>

                    <Button
                      type="submit"
                      disabled={loading}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
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
