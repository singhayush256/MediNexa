'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Clock,
  RotateCw,
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
  { value: 'PATIENT', label: 'Patient', desc: 'Personal health portal, booking, records & reports', route: '/portal' },
  { value: 'DOCTOR', label: 'Doctor', desc: 'Clinical provider workspace, OPD queue & prescriptions', route: '/dashboard/doctor-appointments' },
  { value: 'NURSE', label: 'Nurse', desc: 'Inpatient care, vitals monitoring & bed handover', route: '/dashboard/nursing' },
  { value: 'RECEPTIONIST', label: 'Receptionist', desc: 'Front desk intake, registration & tokens', route: '/dashboard/appointments' },
  { value: 'PHARMACIST', label: 'Pharmacist', desc: 'Medication dispensing, inventory & audits', route: '/dashboard/pharmacy' },
  { value: 'LAB_STAFF', label: 'Lab Technician', desc: 'Pathology diagnostic orders, specimens & reports', route: '/dashboard/lab' },
  { value: 'BILLING_STAFF', label: 'Billing Staff', desc: 'Hospital invoicing, GST reconciliation & payments', route: '/dashboard/billing' },
  { value: 'INSURANCE_STAFF', label: 'Insurance Staff', desc: 'TPA pre-authorizations & cashless claims', route: '/dashboard/insurance' },
  { value: 'ADMIN', label: 'Admin', desc: 'Hospital command center, facility admin & operations', route: '/dashboard' },
];

export default function RegisterPage() {
  const router = useRouter();

  // Wizard Step
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('PATIENT');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // OTP State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimeLeft, setOtpTimeLeft] = useState(600); // 10 minutes (600s)
  const [resendCooldown, setResendCooldown] = useState(0);
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // OTP Timer Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'OTP' && otpTimeLeft > 0) {
      timer = setInterval(() => {
        setOtpTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpTimeLeft]);

  // Resend Cooldown Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Format time MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  // Passwords Match Check
  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  // Handle Step 1: Initiate Registration & Request OTP
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
      setError('Invalid email format');
      return;
    }

    const cleanPhone = mobileNumber.trim().replace(/\D/g, '');
    if (!cleanPhone) {
      setError('Please enter your mobile number.');
      return;
    }
    if (countryCode === '+91' && cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
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
      setError('You must accept the Terms of Service and Healthcare Data Privacy agreement to register.');
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
      const res = await fetch(`${apiUrl}/auth/register-initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Failed to dispatch verification code. Please check your email.';
        throw new Error(errorMsg);
      }

      setStep('OTP');
      setOtpTimeLeft(600);
      setResendCooldown(60);
      setPreviewOtp(data.previewOtp || null);
      setSuccess(`A 6-digit verification code has been dispatched to ${cleanEmail}.`);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleaned;
    setOtpDigits(newDigits);

    // Auto advance focus
    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  // Handle Step 2: Verify OTP and finalize registration
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/auth/verify-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: fullCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Invalid verification code.';
        throw new Error(errorMsg);
      }

      // Persist Auth
      const token = data.accessToken || data.token;
      if (typeof window !== 'undefined' && token) {
        localStorage.setItem('medinexa_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('medinexa_user', JSON.stringify(data.user));
        sessionStorage.setItem('medinexa_token', token);
        document.cookie = `medinexa_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      }

      setSuccess(`Account verified and registered successfully! Your UHID is ${data.user?.uhid || 'assigned'}. Redirecting...`);

      const selectedRole = ROLES.find((r) => r.value === role);
      const destination = selectedRole ? selectedRole.route : role === 'PATIENT' ? '/portal' : '/dashboard';

      setTimeout(() => {
        router.push(destination);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          purpose: 'REGISTRATION',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resend code');

      setResendCooldown(60);
      setOtpTimeLeft(600);
      setPreviewOtp(data.previewOtp || null);
      setSuccess('A fresh verification code has been dispatched to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans text-slate-900 dark:text-slate-100 selection:bg-teal-600 selection:text-white transition-colors duration-200 relative">
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/">
            <MediNexaLogo />
          </Link>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
          {step === 'DETAILS' ? 'Create Your Account' : 'Verify Email Address'}
        </h2>
        <p className="mt-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          {step === 'DETAILS'
            ? 'Production-grade healthcare portal with statutory UHID provisioning'
            : `Enter the 6-digit OTP code sent to ${email}`}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-sm border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6">
          {/* Status Alerts */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs p-3.5 rounded-2xl font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs p-3.5 rounded-2xl font-semibold flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* STEP 1: Registration Details */}
          {step === 'DETAILS' ? (
            <form onSubmit={handleInitiateRegistration} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arjun"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nair"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Number & Country Code */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="w-40 flex-shrink-0">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder={countryCode === '+91' ? '9845122938' : 'Mobile number'}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      maxLength={countryCode === '+91' ? 10 : 15}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                      type="email"
                      required
                      placeholder="e.g. arjun.nair@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Checklist */}
              {password && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl text-[11px] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-600 dark:text-slate-400">Password Strength:</span>
                    <span className={`font-black ${strengthLabel.color}`}>{strengthLabel.text}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-slate-600 dark:text-slate-400">
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.minLength ? 'text-emerald-600 font-bold' : ''}`}>
                      <CheckCircle2 className="w-3 h-3" /> Min 8 characters
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.hasUpper && passwordCriteria.hasLower ? 'text-emerald-600 font-bold' : ''}`}>
                      <CheckCircle2 className="w-3 h-3" /> Upper & lowercase
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? 'text-emerald-600 font-bold' : ''}`}>
                      <CheckCircle2 className="w-3 h-3" /> At least 1 number
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.hasSpecial ? 'text-emerald-600 font-bold' : ''}`}>
                      <CheckCircle2 className="w-3 h-3" /> Special character
                    </div>
                  </div>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Platform Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label} — {r.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500"
                />
                <label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  I accept the{' '}
                  <span className="text-teal-600 dark:text-teal-400 font-bold underline cursor-pointer">Terms of Service</span>{' '}
                  and agree to DISHA/HIPAA healthcare privacy policies.
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-600/20 text-xs flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'Validating...' : 'Verify Email & Proceed to OTP'}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </form>
          ) : (
            /* STEP 2: OTP Verification */
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl space-y-1 text-center">
                <div className="text-xs font-bold text-teal-900 dark:text-teal-200">
                  Verification Code Sent
                </div>
                <div className="text-[11px] text-teal-700 dark:text-teal-400">
                  We sent a 6-digit code to <span className="font-bold">{email}</span>
                </div>
                {previewOtp && (
                  <div className="mt-2 text-xs font-mono font-black text-teal-600 dark:text-teal-300 bg-white dark:bg-slate-900 py-1 px-3 rounded-lg inline-block border border-teal-200 dark:border-teal-800">
                    Test Code: {previewOtp}
                  </div>
                )}
              </div>

              {/* 6 Digit Input Grid */}
              <div>
                <label className="block text-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
                  Enter 6-Digit Code
                </label>
                <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-black bg-slate-50 dark:bg-slate-950/80 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-white transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Timer & Resend */}
              <div className="flex items-center justify-between text-xs px-2 text-slate-500 dark:text-slate-400 font-semibold">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>Expires in: {formatTime(otpTimeLeft)}</span>
                </div>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className={`flex items-center gap-1 ${
                    resendCooldown > 0
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-teal-600 dark:text-teal-400 hover:underline font-bold'
                  }`}
                >
                  <RotateCw className="w-3 h-3" />
                  {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || otpDigits.join('').length !== 6}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-600/20 text-xs flex items-center justify-center gap-2"
                >
                  {loading ? 'Verifying...' : 'Verify & Complete Registration'}
                  <CheckCircle2 className="w-4 h-4" />
                </Button>

                <button
                  type="button"
                  onClick={() => setStep('DETAILS')}
                  className="w-full py-2.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Edit Registration Details
                </button>
              </div>
            </form>
          )}

          {/* Footer Back to Login */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Already have a MediNexa account?{' '}
              <Link href="/login" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
