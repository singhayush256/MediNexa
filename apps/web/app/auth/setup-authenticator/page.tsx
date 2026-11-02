'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Smartphone,
  Key,
  Copy,
  Check,
  Download,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Lock,
  CheckCircle2,
  ChevronLeft,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

interface SetupData {
  secret: string;
  qrCodeDataUrl: string;
  manualEntryKey: string;
  issuer: string;
  accountName: string;
}

export default function SetupAuthenticatorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Status & Setup state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [step, setStep] = useState<'status' | 'scan' | 'verify' | 'completed'>('scan');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('medinexa_token') || localStorage.getItem('token');
  };

  const checkStatusAndInit = async () => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Check current 2FA status
      const statusRes = await fetch(`${apiUrl}/auth/2fa/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setTwoFactorEnabled(statusData.twoFactorEnabled);
        if (statusData.twoFactorEnabled) {
          setStep('status');
          setLoading(false);
          return;
        }
      }

      // If not enabled, initiate setup
      await initiateSetup();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize Google Authenticator setup.');
    } finally {
      setLoading(false);
    }
  };

  const initiateSetup = async () => {
    setError(null);
    setLoading(true);
    const token = getAuthToken();
    try {
      const res = await fetch(`${apiUrl}/auth/2fa/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate authenticator key.');

      setSetupData(data);
      setStep('scan');
      setDigits(['', '', '', '', '', '']);
    } catch (err: any) {
      setError(err.message || 'Error generating TOTP secret.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatusAndInit();
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...digits];
      pastedDigits.forEach((d, i) => {
        if (index + i < 6) newDigits[index + i] = d;
      });
      setDigits(newDigits);
      const nextFocus = Math.min(index + pastedDigits.length, 5);
      document.getElementById(`totp-setup-input-${nextFocus}`)?.focus();
      return;
    }

    const clean = value.replace(/\D/g, '');
    const newDigits = [...digits];
    newDigits[index] = clean;
    setDigits(newDigits);

    if (clean && index < 5) {
      document.getElementById(`totp-setup-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      document.getElementById(`totp-setup-input-${index - 1}`)?.focus();
    }
  };

  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code displayed in your authenticator app.');
      return;
    }

    setSubmitting(true);
    setError(null);
    const token = getAuthToken();

    try {
      const res = await fetch(`${apiUrl}/auth/2fa/verify-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid authenticator code. Please try again.');

      setBackupCodes(data.backupCodes || []);
      setTwoFactorEnabled(true);
      setStep('completed');
      setSuccess('Google Authenticator 2FA activated successfully!');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Make sure your device time is synchronized.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisable2fa = async () => {
    if (!window.confirm('Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.')) {
      return;
    }

    setSubmitting(true);
    setError(null);
    const token = getAuthToken();

    try {
      const res = await fetch(`${apiUrl}/auth/2fa/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to disable 2FA.');

      setTwoFactorEnabled(false);
      setSuccess('Two-Factor Authentication has been disabled.');
      await initiateSetup();
    } catch (err: any) {
      setError(err.message || 'Failed to disable 2FA.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, type: 'key' | 'codes') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  const downloadBackupCodes = () => {
    const element = document.createElement('a');
    const file = new Blob([`MediNexa Two-Factor Authentication Backup Recovery Codes\nGenerated: ${new Date().toISOString()}\n\nSingle-use backup recovery codes:\n` + backupCodes.map((c, i) => `${i + 1}. ${c}`).join('\n') + '\n\nKeep these codes in a secure location.'], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `medinexa-2fa-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </div>
        <h2 className="text-center text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Google Authenticator Security Setup
        </h2>
        <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
          Protect your MediNexa clinical and administrative access with TOTP Two-Factor Authentication
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Feedback Banners */}
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

            {loading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Generating encrypted cryptographic keys...</p>
              </div>
            ) : step === 'status' && twoFactorEnabled ? (
              /* Already Active Status Screen */
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Two-Factor Authentication is Active
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Your account is securely guarded with Google Authenticator. A 6-digit TOTP code is required on every login.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">Security Level:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Maximum (TOTP RFC 6238)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">Supported Apps:</span>
                    <span className="text-slate-500">Google, Microsoft, Authy</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">Delivery Method:</span>
                    <span className="text-slate-500">Device Offline TOTP (No SMS/Email)</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={() => initiateSetup()}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 rounded-xl"
                  >
                    Reconfigure Authenticator App
                  </Button>
                  <button
                    type="button"
                    onClick={handleDisable2fa}
                    disabled={submitting}
                    className="flex-1 px-4 py-3 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Disable 2FA
                  </button>
                </div>

                <div className="pt-2">
                  <Link
                    href="/dashboard"
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Return to Dashboard
                  </Link>
                </div>
              </div>
            ) : step === 'scan' && setupData ? (
              /* Step 1: Scan QR Code & Manual Key */
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-teal-600" />
                    Step 1: Scan QR Code in Authenticator App
                  </h3>
                  <p className="text-xs text-slate-500">
                    Open Google Authenticator, Microsoft Authenticator, or Authy on your mobile phone and scan this QR code.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center">
                  {setupData.qrCodeDataUrl && (
                    <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-100">
                      <Image
                        src={setupData.qrCodeDataUrl}
                        alt="TOTP QR Code"
                        width={200}
                        height={200}
                        className="rounded-lg"
                        priority
                      />
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 mt-3 text-center">
                    Issuer: <span className="font-semibold text-slate-600 dark:text-slate-300">{setupData.issuer}</span> • Account: <span className="font-semibold text-slate-600 dark:text-slate-300">{setupData.accountName}</span>
                  </p>
                </div>

                {/* Manual Setup Key */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-teal-600" />
                      Can't scan the QR code? Use Manual Setup Key
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(setupData.manualEntryKey, 'key')}
                      className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey ? 'Copied' : 'Copy Key'}
                    </button>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-center font-bold tracking-widest text-slate-800 dark:text-slate-200 select-all">
                    {setupData.manualEntryKey}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    In your authenticator app, choose "Enter a setup key", type any account name and paste the key above.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setStep('verify')}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    I Have Scanned the QR Code <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : step === 'verify' ? (
              /* Step 2: Verify 6-digit Code */
              <form onSubmit={handleVerifySetup} className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-teal-600" />
                    Step 2: Enter Verification Code
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter the current 6-digit verification code displayed for MediNexa inside your authenticator app.
                  </p>
                </div>

                <div className="py-2">
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {digits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`totp-setup-input-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        autoFocus={idx === 0}
                        className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black font-mono rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-teal-600 focus:outline-none transition shadow-sm"
                      />
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Codes refresh every 30 seconds inside your authenticator app. For your security, verification codes are never shown on screen or sent via SMS/Email.
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('scan')}
                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back to QR
                  </button>
                  <Button
                    type="submit"
                    disabled={submitting || digits.join('').length !== 6}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Code...
                      </>
                    ) : (
                      <>
                        Activate Two-Factor Authentication <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              /* Step 3: Activation Complete + Backup Recovery Codes */
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Two-Factor Authentication is Activated!
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Save your backup recovery codes now. If you ever lose your phone or authenticator app, these codes are the ONLY way to recover your account.
                  </p>
                </div>

                {/* Backup codes box */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-teal-400" />
                      Single-Use Recovery Codes ({backupCodes.length})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(backupCodes.join('\n'), 'codes')}
                        className="text-[11px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1"
                      >
                        {copiedCodes ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedCodes ? 'Copied' : 'Copy All'}
                      </button>
                      <button
                        type="button"
                        onClick={downloadBackupCodes}
                        className="text-[11px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 ml-2"
                      >
                        <Download className="w-3 h-3" /> Download (.txt)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    {backupCodes.map((code, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center tracking-wider text-teal-300 font-bold select-all"
                      >
                        {code}
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-400 pt-1">
                    * Each recovery code can only be used once to log in if your authenticator device is unavailable.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 rounded-xl"
                  >
                    Done & Return to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
