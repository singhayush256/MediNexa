'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roleCode: 'PATIENT',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('medinexa_token', data.accessToken);
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('medinexa_user', JSON.stringify(data.user));
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg">
            M
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Create MediNexa Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Enterprise Healthcare Identity & Access Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 sm:rounded-3xl sm:px-10">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">First Name</label>
                <input
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700">Last Name</label>
                <input
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Email address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@hospital.org"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Role Selection</label>
              <select
                value={formData.roleCode}
                onChange={(e) => setFormData({ ...formData, roleCode: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="PATIENT">Patient Account</option>
                <option value="DOCTOR">Physician / Clinician</option>
                <option value="NURSE">Nursing Staff</option>
                <option value="RECEPTIONIST">Front Desk / Receptionist</option>
                <option value="HOSPITAL_ADMIN">Hospital Administrator</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold text-white bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-600/20 transition-all disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Register Profile'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link href="/login" className="text-sky-600 hover:text-sky-800 font-bold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
