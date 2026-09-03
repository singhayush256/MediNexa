'use client';

import React, { useState, useMemo } from 'react';
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

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 1. Name Validation
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

    // 2. Email Validation
    const cleanEmail = email.trim().toLowerCase();
    if (!isEmailValid) {
      setError('Invalid email format');
      return;
    }

    // 3. Mobile Number Validation
    const cleanPhone = mobileNumber.trim().replace(/\D/g, '');
    if (!cleanPhone) {
      setError('Please enter your mobile number.');
      return;
    }
    if (countryCode === '+91' && cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    // 4. Password Strength Validation
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

    // 5. Confirm Password Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords match exactly.');
      return;
    }

    // 6. Terms & Conditions Checkbox
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
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Registration failed. Please try again.';
        throw new Error(errorMsg);
      }

      // 7. Persist Authentication State
      const token = data.accessToken || data.token;
      if (typeof window !== 'undefined' && token) {
        localStorage.setItem('medinexa_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('medinexa_user', JSON.stringify(data.user));
        sessionStorage.setItem('medinexa_token', token);
        document.cookie = `medinexa_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      }

      setSuccess(`Account registered successfully! Redirecting to your workspace...`);

      // 8. Role-Based Destination
      const selectedRole = ROLES.find((r) => r.value === role);
      const destination = selectedRole ? selectedRole.route : role === 'PATIENT' ? '/portal' : '/dashboard';

      setTimeout(() => {
        router.push(destination);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during account creation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors duration-200 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center">
        <MediNexaLogo size="lg" href="/" />
        <h2 className="mt-4 text-center text-2xl font-black text-slate-950 dark:text-white tracking-tight">
          Create Production Account
        </h2>
        <p className="mt-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          Connected Healthcare Enterprise Operating System • Real User Authentication
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-sm border border-slate-200 dark:border-slate-800 sm:rounded-3xl sm:px-10 space-y-6">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
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
                    placeholder="e.g. Nair"
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            {/* 2. Email Address */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                {email && (
                  <span
                    className={`text-[10px] font-bold ${
                      isEmailValid ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {isEmailValid ? '✓ Valid format' : 'Invalid email format'}
                  </span>
                )}
              </div>
              <div className="mt-1 relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`block w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                    email
                      ? isEmailValid
                        ? 'border-emerald-500/60 focus:ring-emerald-500'
                        : 'border-rose-500/60 focus:ring-rose-500'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                  }`}
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* 3. Mobile Number & Country Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="mt-1 flex items-center gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-36 px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
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
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="9876543210"
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            {/* 4. Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Role Designation <span className="text-rose-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label} — {r.desc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5. Password with Real-Time Strength Meter */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password <span className="text-rose-500">*</span>
                </label>
                {password && (
                  <span className={`text-[10px] font-bold ${strengthLabel.color}`}>
                    Strength: {strengthLabel.text}
                  </span>
                )}
              </div>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 chars (Upper, Lower, Number, Symbol)"
                  className="block w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Requirement Checklist */}
              <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
                <div className={`flex items-center gap-1.5 ${passwordCriteria.minLength ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                  <span>{passwordCriteria.minLength ? '✓' : '•'}</span>
                  <span>Min. 8 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordCriteria.hasUpper && passwordCriteria.hasLower ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                  <span>{passwordCriteria.hasUpper && passwordCriteria.hasLower ? '✓' : '•'}</span>
                  <span>Upper & lowercase</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                  <span>{passwordCriteria.hasNumber ? '✓' : '•'}</span>
                  <span>At least 1 number</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordCriteria.hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                  <span>{passwordCriteria.hasSpecial ? '✓' : '•'}</span>
                  <span>1 special symbol</span>
                </div>
              </div>
            </div>

            {/* 6. Confirm Password */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                {confirmPassword && (
                  <span
                    className={`text-[10px] font-bold ${
                      passwordsMatch ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {passwordsMatch ? '✓ Passwords match' : 'Passwords do not match'}
                  </span>
                )}
              </div>
              <div className="mt-1 relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password exactly"
                  className={`block w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                    confirmPassword
                      ? passwordsMatch
                        ? 'border-emerald-500/60 focus:ring-emerald-500'
                        : 'border-rose-500/60 focus:ring-rose-500'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                  }`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 7. Terms & Conditions Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="terms"
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                I agree to the{' '}
                <span className="text-blue-600 dark:text-blue-400 font-bold underline cursor-pointer">
                  Terms of Service
                </span>
                ,{' '}
                <span className="text-blue-600 dark:text-blue-400 font-bold underline cursor-pointer">
                  Privacy Policy
                </span>
                , and statutory DISHA data governance standards.
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-xl shadow-lg shadow-blue-500/20 text-xs flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                {loading ? (
                  <span>Creating Secure Account...</span>
                ) : (
                  <>
                    <span>Create Production Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Switch to Login */}
          <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="mt-6 flex items-center justify-center gap-2 text-center text-[10px] text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span>
            256-Bit TLS Encryption • Bcrypt Password Hashing • Statutory NABH & DISHA Compliant
          </span>
        </div>
      </div>
    </div>
  );
}
