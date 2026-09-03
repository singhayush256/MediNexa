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
  { value: 'PATIENT', label: 'Patient', desc: 'Personal health portal, booking, records & reports' },
  { value: 'DOCTOR', label: 'Doctor', desc: 'Clinical provider workspace, OPD queue & prescriptions' },
  { value: 'NURSE', label: 'Nurse', desc: 'Inpatient care, vitals monitoring & bed handover' },
  { value: 'RECEPTIONIST', label: 'Receptionist', desc: 'Front desk intake, registration & tokens' },
  { value: 'LAB_STAFF', label: 'Lab Technician', desc: 'Pathology diagnostic orders, specimens & reports' },
  { value: 'PHARMACY_STAFF', label: 'Pharmacist', desc: 'Medication dispensing, inventory & audits' },
  { value: 'ADMIN', label: 'Admin', desc: 'Hospital administration, command center & analytics' },
];

export default function RegisterPage() {
  const router = useRouter();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('PATIENT');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
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

    // 1. Full Name Validation
    const cleanName = fullName.trim();
    if (!cleanName || cleanName.length < 2) {
      setError('Please provide your Full Name.');
      return;
    }

    // 2. Email Validation
    const cleanEmail = email.trim().toLowerCase();
    if (!isEmailValid) {
      setError('Please provide a valid email address (e.g. name@hospital.in).');
      return;
    }

    // 3. Mobile Number Validation
    const cleanPhone = mobileNumber.trim().replace(/\D/g, '');
    if (cleanPhone && countryCode === '+91' && cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    // 4. Password Strength Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (strengthScore < 2) {
      setError('Please choose a stronger password containing letters, numbers, and symbols.');
      return;
    }

    // 5. Confirm Password Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords match exactly.');
      return;
    }

    // 6. Format Phone Payload
    const formattedPhone = cleanPhone ? `${countryCode} ${cleanPhone}` : `${countryCode} 9800000000`;

    const payload = {
      name: cleanName,
      fullName: cleanName,
      email: cleanEmail,
      phone: formattedPhone,
      mobileNumber: cleanPhone,
      countryCode: countryCode,
      password: password,
      confirmPassword: confirmPassword,
      role: role,
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
      if (typeof window !== 'undefined') {
        const token = data.accessToken || data.token;
        localStorage.setItem('medinexa_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('medinexa_user', JSON.stringify(data.user));
        sessionStorage.setItem('medinexa_token', token);
        document.cookie = `medinexa_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      }

      // 8. Role-Based Destination
      if (role === 'PATIENT') {
        router.push('/portal');
      } else {
        router.push('/dashboard');
      }
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

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link
            href="/"
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-blue-500/20 hover:scale-105 transition-transform"
          >
            M
          </Link>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          Create MediNexa Account
        </h2>
        <p className="mt-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          India Connected Healthcare Network • Enterprise Security
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-sm border border-slate-200 dark:border-slate-800 sm:rounded-3xl sm:px-10 space-y-6">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs p-3.5 rounded-2xl font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* 1. Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="mt-1 relative">
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="block w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* 2. Email Address */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                {email && (
                  <span className={`text-[10px] font-bold ${isEmailValid ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isEmailValid ? '✓ Valid format' : 'Invalid email'}
                  </span>
                )}
              </div>
              <div className="mt-1 relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarav.sharma@example.in"
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
                Mobile Number
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
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="98765 43210"
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

            {/* 5. Password with Strength Meter */}
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
                  placeholder="Min. 8 characters"
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

              {/* Password Strength Progress Bar */}
              {password && (
                <div className="mt-2 space-y-1.5">
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    <div className={`rounded-full ${strengthScore >= 1 ? strengthLabel.barColor : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                    <div className={`rounded-full ${strengthScore >= 2 ? strengthLabel.barColor : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                    <div className={`rounded-full ${strengthScore >= 3 ? strengthLabel.barColor : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                    <div className={`rounded-full ${strengthScore >= 4 ? strengthLabel.barColor : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                    <span className={passwordCriteria.minLength ? 'text-emerald-500 font-semibold' : ''}>
                      {passwordCriteria.minLength ? '✓' : '○'} 8+ Characters
                    </span>
                    <span className={passwordCriteria.hasUpper && passwordCriteria.hasLower ? 'text-emerald-500 font-semibold' : ''}>
                      {passwordCriteria.hasUpper && passwordCriteria.hasLower ? '✓' : '○'} Upper & Lowercase
                    </span>
                    <span className={passwordCriteria.hasNumber ? 'text-emerald-500 font-semibold' : ''}>
                      {passwordCriteria.hasNumber ? '✓' : '○'} Numeric Digit
                    </span>
                    <span className={passwordCriteria.hasSpecial ? 'text-emerald-500 font-semibold' : ''}>
                      {passwordCriteria.hasSpecial ? '✓' : '○'} Special Symbol
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Confirm Password */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                {confirmPassword && (
                  <span className={`text-[10px] font-bold ${passwordsMatch ? 'text-emerald-500' : 'text-rose-500'}`}>
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
                  placeholder="Repeat your password"
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <div>
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">
                Sign In
              </Link>
            </div>
            <div>
              <Link href="/" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                &larr; Back to MediNexa Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
