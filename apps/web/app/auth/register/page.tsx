'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Download,
  Key,
  QrCode,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';

const COUNTRY_CODES = [
  { code: '+91', label: '+91 (India 🇮🇳)' },
  { code: '+1', label: '+1 (USA 🇺🇸)' },
  { code: '+44', label: '+44 (UK 🇬🇧)' },
  { code: '+971', label: '+971 (UAE 🇦🇪)' },
  { code: '+65', label: '+65 (Singapore 🇸🇬)' },
  { code: '+61', label: '+61 (Australia 🇦🇺)' },
  { code: '+49', label: '+49 (Germany 🇩🇪)' },
];

const ROLES = [
  { value: 'PATIENT', label: 'Patient', desc: 'Personal health portal, bed booking & longitudinal records', route: '/portal' },
  { value: 'DOCTOR', label: 'Doctor', desc: 'Clinical provider workspace, OPD queue & prescriptions', route: '/dashboard/doctor-appointments' },
  { value: 'NURSE', label: 'Nurse', desc: 'Inpatient care, vitals monitoring & bed handover', route: '/dashboard/nursing' },
  { value: 'RECEPTIONIST', label: 'Receptionist', desc: 'Front desk intake, registration & tokens', route: '/dashboard/appointments' },
  { value: 'PHARMACIST', label: 'Pharmacist', desc: 'Medication dispensing, inventory & audits', route: '/dashboard/pharmacy' },
  { value: 'LAB_STAFF', label: 'Lab Technician', desc: 'Pathology diagnostic orders, specimens & reports', route: '/dashboard/lab' },
  { value: 'BILLING_STAFF', label: 'Billing Staff', desc: 'Hospital invoicing, GST reconciliation & payments', route: '/dashboard/billing' },
  { value: 'INSURANCE_STAFF', label: 'Insurance Staff', desc: 'TPA pre-authorizations & cashless claims', route: '/dashboard/insurance' },
  { value: 'ADMIN', label: 'Hospital Admin', desc: 'Executive command center & operational logistics', route: '/dashboard' },
];

type WizardStep = 'DETAILS' | 'SCAN_QR' | 'VERIFY_CODE' | 'ACTIVATED';

export default function RegisterPage() {
  const router = useRouter();

  // Wizard Step
  const [step, setStep] = useState<WizardStep>('DETAILS');

  // Form State (Step 1)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('PATIENT');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // TOTP State (Steps 2, 3, 4)
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [manualSetupKey, setManualSetupKey] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  // UI state
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Email Validation
  const isEmailValid = useMemo(() => {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  // Password Strength Criteria
  const passwordCriteria = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-~`+=]/.test(password),
    };
  }, [password]);

  const strengthScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.minLength) score += 1;
    if (passwordCriteria.hasUpper && passwordCriteria.hasLower) score += 1;
    if (passwordCriteria.hasNumber) score += 1;
    if (passwordCriteria.hasSpecial) score += 1;
    return score;
  }, [passwordCriteria]);

  const strengthLabel = useMemo(() => {
    if (!password) return { text: '', color: 'text-slate-400', barColor: 'bg-slate-200 dark:bg-slate-700' };
    if (strengthScore <= 1) return { text: 'Weak', color: 'text-rose-500', barColor: 'bg-rose-500' };
    if (strengthScore === 2) return { text: 'Fair', color: 'text-amber-500', barColor: 'bg-amber-500' };
    if (strengthScore === 3) return { text: 'Good', color: 'text-blue-500', barColor: 'bg-blue-500' };
    return { text: 'Strong', color: 'text-emerald-500', barColor: 'bg-emerald-500' };
  }, [password, strengthScore]);

  // Step 1: Submit Details & Generate TOTP Credentials
  const handleInitiateRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    if (!cleanFirst) {
      setError('Please provide your First Name.');
      return;
    }
    if (!cleanLast) {
      setError('Please provide your Last Name.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!isEmailValid) {
      setError('Invalid email format.');
      return;
    }

    const cleanPhone = mobileNumber.trim().replace(/\D/g, '');
    if (!cleanPhone) {
      setError('Please enter your mobile number.');
      return;
    }

    if (
      !passwordCriteria.minLength ||
      !passwordCriteria.hasUpper ||
      !passwordCriteria.hasLower ||
      !passwordCriteria.hasNumber ||
      !passwordCriteria.hasSpecial
    ) {
      setError('Password requirements not met: minimum 8 characters, one uppercase, one lowercase, one number, and one special character.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords match exactly.');
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the Terms of Service and Healthcare Data Privacy agreement.');
      return;
    }

    const formattedPhone = `${countryCode} ${cleanPhone}`;
    const payload = {
      firstName: cleanFirst,
      lastName: cleanLast,
      fullName: `${cleanFirst} ${cleanLast}`,
      email: cleanEmail,
      phone: formattedPhone,
      mobileNumber: cleanPhone,
      countryCode: countryCode,
      password: password,
      confirmPassword: confirmPassword,
      role: role,
      termsAccepted: true,
    };

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/auth/register-setup-totp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Failed to initialize account setup.';
        throw new Error(errorMsg);
      }

      setRegistrationToken(data.registrationToken);
      setQrCodeUrl(data.qrCodeUrl);
      setManualSetupKey(data.manualSetupKey);
      setBackupCodes(data.backupCodes || []);
      setStep('SCAN_QR');
      setSuccess('Account credentials validated. Please scan the QR code using Google Authenticator, Microsoft Authenticator, or Authy.');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Handle 6-digit code input
  const handleCodeDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...codeDigits];
    newDigits[index] = cleaned;
    setCodeDigits(newDigits);

    if (cleaned && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = [...codeDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setCodeDigits(newDigits);
    const focusIdx = Math.min(pasted.length, 5);
    codeInputRefs.current[focusIdx]?.focus();
  };

  // Step 3: Verify 6-digit TOTP code and finalize account
  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const fullCode = codeDigits.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits shown in your authenticator app.');
      return;
    }

    if (!registrationToken) {
      setError('Registration setup session expired. Please start registration again.');
      setStep('DETAILS');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/auth/register-verify-totp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationToken,
          code: fullCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Invalid authenticator code. Please ensure your device clock is synchronized and try again.';
        throw new Error(errorMsg);
      }

      // Store JWT token and authenticated user profile
      const token = data.accessToken || data.token;
      if (typeof window !== 'undefined' && token) {
        localStorage.setItem('medinexa_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('medinexa_user', JSON.stringify(data.user));
        sessionStorage.setItem('medinexa_token', token);
        document.cookie = `medinexa_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      }

      setRegisteredUser(data.user);
      setStep('ACTIVATED');
      setSuccess('Two-Factor Authentication verified successfully! Your account is now active.');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check your authenticator app code.');
    } finally {
      setLoading(false);
    }
  };

  // Copy Manual Key
  const handleCopyKey = () => {
    if (manualSetupKey) {
      navigator.clipboard.writeText(manualSetupKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    }
  };

  // Copy All Backup Codes
  const handleCopyCodes = () => {
    if (backupCodes.length > 0) {
      navigator.clipboard.writeText(backupCodes.join('\n'));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2500);
    }
  };

  // Download Backup Codes as .txt
  const handleDownloadCodes = () => {
    const textContent = `MEDINEXA TWO-FACTOR AUTHENTICATION RECOVERY CODES\nAccount: ${email}\nDate: ${new Date().toISOString()}\n\nKeep these backup codes safe. Each code can be used once if you lose access to your authenticator app.\n\n${backupCodes.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n`;
    const element = document.createElement('a');
    const file = new Blob([textContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `medinexa-recovery-codes-${email.replace(/[@.]/g, '-')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Navigate to Dashboard or Portal
  const handleProceedToDashboard = () => {
    const roleCode = (registeredUser?.role?.code || role || 'PATIENT').toUpperCase();
    const selectedRoleObj = ROLES.find((r) => r.value === roleCode);
    const destination = selectedRoleObj ? selectedRoleObj.route : roleCode === 'PATIENT' ? '/portal' : '/dashboard';
    router.push(destination);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors duration-200 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center flex flex-col items-center">
        <MediNexaLogo size="lg" href="/" />
        <h2 className="mt-4 text-center text-2xl font-black text-slate-950 dark:text-white tracking-tight">
          Create MediNexa Account
        </h2>
        <p className="mt-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          Connected Healthcare OS • Google Authenticator 2FA Protection
        </p>

        {/* 4-Step Wizard Progress Bar */}
        <div className="mt-6 w-full max-w-md flex items-center justify-between px-4">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${
                step === 'DETAILS'
                  ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-lg'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {step !== 'DETAILS' ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Details</span>
          </div>

          <div className={`flex-1 h-0.5 mx-2 ${step !== 'DETAILS' ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'}`} />

          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${
                step === 'SCAN_QR'
                  ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-lg'
                  : ['VERIFY_CODE', 'ACTIVATED'].includes(step)
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
              }`}
            >
              {['VERIFY_CODE', 'ACTIVATED'].includes(step) ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Scan QR</span>
          </div>

          <div className={`flex-1 h-0.5 mx-2 ${['VERIFY_CODE', 'ACTIVATED'].includes(step) ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'}`} />

          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${
                step === 'VERIFY_CODE'
                  ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-lg'
                  : step === 'ACTIVATED'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
              }`}
            >
              {step === 'ACTIVATED' ? <Check className="w-4 h-4" /> : '3'}
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Verify</span>
          </div>

          <div className={`flex-1 h-0.5 mx-2 ${step === 'ACTIVATED' ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'}`} />

          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${
                step === 'ACTIVATED'
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20 shadow-lg'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
              }`}
            >
              4
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Active</span>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl shadow-slate-950/5 border border-slate-200 dark:border-slate-800 sm:rounded-3xl sm:px-10 space-y-6">
          {/* Global Alert Banners */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs p-4 rounded-2xl font-semibold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs p-4 rounded-2xl font-semibold flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* =========================================================================
              STEP 1: ACCOUNT DETAILS
          ========================================================================= */}
          {step === 'DETAILS' && (
            <form onSubmit={handleInitiateRegistration} className="space-y-4" autoComplete="off">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Arjun"
                      className="block w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Sharma"
                      className="block w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="block w-full px-3.5 py-2.5 pl-9 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-36 px-2.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="block w-full px-3.5 py-2.5 pl-9 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Healthcare Role <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {ROLES.slice(0, 6).map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`p-2.5 rounded-xl border text-left transition-all duration-200 ${
                        role === r.value
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-black">{r.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full px-3.5 py-2.5 pl-9 pr-10 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength Meter */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 font-medium">Strength:</span>
                      <span className={`font-bold ${strengthLabel.color}`}>{strengthLabel.text}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3, 4].map((idx) => (
                        <div
                          key={idx}
                          className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            idx <= strengthScore ? strengthLabel.barColor : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full px-3.5 py-2.5 pl-9 pr-10 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
                />
                <label htmlFor="terms" className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-snug">
                  I agree to MediNexa's Terms of Service and consent to two-factor authenticator setup.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span>Generating Secure Authenticator Credentials...</span>
                ) : (
                  <>
                    <span>Continue to Setup Authenticator</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Already registered?{' '}
                  <Link href="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* =========================================================================
              STEP 2: SCAN QR CODE & MANUAL SETUP KEY
          ========================================================================= */}
          {step === 'SCAN_QR' && (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <div className="inline-flex p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mb-1">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Scan QR Code with Authenticator App
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Open <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, or <strong>Authy</strong> on your smartphone.
                </p>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
                {qrCodeUrl ? (
                  <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                    <img src={qrCodeUrl} alt="MediNexa 2FA QR Code" className="w-52 h-52 object-contain" />
                  </div>
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-xs text-slate-400">
                    Loading QR Code...
                  </div>
                )}
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                  <span>Scan using your phone's camera inside the Authenticator app</span>
                </div>
              </div>

              {/* Manual Setup Key Backup */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-500" />
                    <span>Can't scan? Use Manual Setup Key:</span>
                  </span>
                  {copiedKey && <span className="text-emerald-500 text-[10px] font-extrabold">Copied!</span>}
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <code className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider select-all flex-1 truncate">
                    {manualSetupKey || 'GENERATING_KEY...'}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 text-slate-600 dark:text-slate-200 transition cursor-pointer"
                    title="Copy Secret Key"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Type: <strong>Time-based (TOTP)</strong> • Account: <strong>{email}</strong>
                </p>
              </div>

              {/* Security Guidance Alert */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 font-semibold flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  The 6-digit verification code will only appear inside your authenticator app. It refreshes every 30 seconds.
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('DETAILS')}
                  className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('VERIFY_CODE')}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>I've Scanned the QR Code</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 3: ENTER AUTHENTICATOR CODE
          ========================================================================= */}
          {step === 'VERIFY_CODE' && (
            <form onSubmit={handleVerifyTotp} className="space-y-6">
              <div className="text-center space-y-1.5">
                <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-1">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Enter 6-Digit Authenticator Code
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Type the 6-digit verification code currently shown in Google Authenticator or Authy for <strong>MediNexa</strong>.
                </p>
              </div>

              {/* 6-Digit Code Input Boxes */}
              <div className="flex justify-center items-center gap-2 sm:gap-3 py-2" onPaste={handleCodePaste}>
                {codeDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      codeInputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/20 text-slate-900 dark:text-white transition shadow-sm outline-none"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 text-center font-medium">
                💡 Tip: Ensure your mobile device's time is set to <strong>Automatic</strong> to prevent verification time-drift errors.
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('SCAN_QR')}
                  className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Scan Again</span>
                </button>

                <button
                  type="submit"
                  disabled={loading || codeDigits.join('').length !== 6}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Verifying Code...</span>
                  ) : (
                    <>
                      <span>Verify & Activate Account</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              STEP 4: ACCOUNT ACTIVATED & BACKUP RECOVERY CODES
          ========================================================================= */}
          {step === 'ACTIVATED' && (
            <div className="space-y-6 text-center">
              <div className="inline-flex p-4 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-1 ring-8 ring-emerald-500/10">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Account Successfully Activated!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Google Authenticator 2FA is now permanently protecting your MediNexa account.
                </p>
              </div>

              {/* Single-Use Backup Recovery Codes */}
              {backupCodes.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-amber-500" />
                      <span>Single-Use Backup Recovery Codes</span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      Save Now
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Save these backup codes in a secure password manager. If you ever lose your phone or authenticator app, each code can be used once to log in.
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold text-slate-800 dark:text-slate-200 text-center">
                    {backupCodes.map((c, i) => (
                      <div key={i} className="py-1 px-2 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                        {c}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyCodes}
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{copiedCodes ? 'Copied to Clipboard!' : 'Copy Codes'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadCodes}
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-500" />
                      <span>Download .txt</span>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleProceedToDashboard}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white text-xs font-black shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Healthcare Workstation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
