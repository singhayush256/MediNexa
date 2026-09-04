'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PatientProfileDto, UserDto, RoleCode } from '@medinexa/types';

export default function PatientsDashboardPage() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [patients, setPatients] = useState<PatientProfileDto[]>([]);
  const [myProfile, setMyProfile] = useState<PatientProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Form edit state for patient
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Registration Modal State for Staff
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDob, setRegDob] = useState('1995-01-01');
  const [regGender, setRegGender] = useState('FEMALE');
  const [regBloodGroup, setRegBloodGroup] = useState('O_POSITIVE');
  const [regAddress, setRegAddress] = useState('');
  const [registering, setRegistering] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) {
      setLoading(false);
      return;
    }

    // Fetch User Info
    fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((userData: UserDto) => {
        setUser(userData);

        if (userData.role?.code === RoleCode.PATIENT) {
          // Fetch own patient profile
          return fetch(`${apiUrl}/patients/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((patData: PatientProfileDto) => {
              setMyProfile(patData);
              setPhone(patData.phone || '');
              setAddress(patData.address || '');
              setBloodGroup(patData.bloodGroup || '');
            });
        } else {
          // Fetch patients list for staff/admin
          return fetch(`${apiUrl}/patients`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((list: PatientProfileDto[]) => {
              setPatients(Array.isArray(list) ? list : []);
            });
        }
      })
      .catch((err) => {
        console.error('Patients page fetch error:', err);
        setError('Failed to load patient records');
      })
      .finally(() => setLoading(false));
  }, [apiUrl]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myProfile) return;

    setSaving(true);
    setSuccessMsg(null);
    setError(null);

    try {
      const token = localStorage.getItem('medinexa_token');
      const res = await fetch(`${apiUrl}/patients/${myProfile.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone, address, bloodGroup }),
      });

      const updated = await res.json();
      if (!res.ok) throw new Error(updated.message || 'Failed to update profile');

      setMyProfile(updated);
      setSuccessMsg('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const token = localStorage.getItem('medinexa_token');
      const res = await fetch(`${apiUrl}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: regFirstName,
          lastName: regLastName,
          email: regEmail || undefined,
          phone: regPhone || undefined,
          dateOfBirth: regDob,
          gender: regGender,
          bloodGroup: regBloodGroup,
          address: regAddress,
        }),
      });

      const newPat = await res.json();
      if (!res.ok) throw new Error(newPat.message || 'Failed to register patient');

      setSuccessMsg(`Patient '${newPat.user?.firstName} ${newPat.user?.lastName}' registered successfully!`);
      setShowRegisterModal(false);
      setRegFirstName('');
      setRegLastName('');
      setRegEmail('');
      setRegPhone('');
      setRegAddress('');

      // Refresh list
      fetch(`${apiUrl}/patients`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((list) => setPatients(Array.isArray(list) ? list : []));
    } catch (err: any) {
      setError(err.message || 'Error registering patient');
    } finally {
      setRegistering(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const name = `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.toLowerCase();
    const email = (p.user?.email || '').toLowerCase();
    const query = search.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="text-lg font-extrabold text-slate-900">MediNexa</span>
            </div>

            <nav className="flex space-x-4">
              <Link href="/dashboard" className="text-sm text-slate-600 hover:text-sky-600 font-medium">
                Overview
              </Link>
              <Link href="/dashboard/patients" className="text-sm text-sky-600 font-bold border-b-2 border-sky-600 pb-1">
                Patients
              </Link>
              <Link href="/dashboard/doctors" className="text-sm text-slate-600 hover:text-sky-600 font-medium">
                Doctor Directory
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-semibold">
              {user ? user.role?.name || user.role?.code : 'Guest'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Management</h1>
            <p className="text-sm text-slate-500 mt-1">
              {user?.role?.code === RoleCode.PATIENT
                ? 'Manage your personal demographic profile and emergency contacts'
                : 'Healthcare Provider Patient Directory & Intake Access'}
            </p>
          </div>
          {user?.role?.code !== RoleCode.PATIENT && (
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-4 py-2 text-sm font-bold text-white bg-sky-600 rounded-xl hover:bg-sky-700 shadow-sm"
            >
              + Register New Patient
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 animate-pulse">
            Loading patient profile records...
          </div>
        ) : user?.role?.code === RoleCode.PATIENT && myProfile ? (
          /* Patient Self Profile View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">
                Personal Patient Profile
              </h2>

              {successMsg && (
                <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-medium">
                  {successMsg}
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase">Full Name</label>
                    <input
                      type="text"
                      disabled
                      value={`${myProfile.user?.firstName || ''} ${myProfile.user?.lastName || ''}`}
                      className="mt-1 w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase">Email Address</label>
                    <input
                      type="text"
                      disabled
                      value={myProfile.user?.email || ''}
                      className="mt-1 w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase">Date of Birth</label>
                    <input
                      type="text"
                      disabled
                      value={new Date(myProfile.dateOfBirth).toLocaleDateString()}
                      className="mt-1 w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase">Gender</label>
                    <input
                      type="text"
                      disabled
                      value={myProfile.gender}
                      className="mt-1 w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase">Blood Group</label>
                    <input
                      type="text"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      placeholder="e.g. O_POSITIVE"
                      className="mt-1 w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase">Residential Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mt-1 w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold py-2.5 px-6 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Emergency Contacts Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Emergency Contacts
              </h3>

              {myProfile.emergencyContacts && myProfile.emergencyContacts.length > 0 ? (
                myProfile.emergencyContacts.map((contact) => (
                  <div key={contact.id} className="p-4 bg-sky-50 border border-sky-200 rounded-xl space-y-1">
                    <p className="text-sm font-bold text-slate-900">{contact.name}</p>
                    <p className="text-xs text-sky-700 font-medium">{contact.relationship}</p>
                    <p className="text-xs text-slate-600">📞 {contact.phone}</p>
                    {contact.email && <p className="text-xs text-slate-600">✉️ {contact.email}</p>}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No emergency contact on record.</p>
              )}
            </div>
          </div>
        ) : (
          /* Staff View: Patient Directory List */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <input
                type="text"
                placeholder="Search patients by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-96 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <span className="text-xs text-slate-500 font-semibold">
                Showing {filteredPatients.length} patient records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-bold tracking-wider border-b border-slate-200">
                    <th className="p-4">Patient Name</th>
                    <th className="p-4">DOB / Gender</th>
                    <th className="p-4">Blood Group</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Emergency Contact</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-900">
                            {p.user?.firstName} {p.user?.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{p.user?.email}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-slate-800">{new Date(p.dateOfBirth).toLocaleDateString()}</p>
                          <p className="text-xs text-slate-500">{p.gender}</p>
                        </td>
                        <td className="p-4 font-semibold text-sky-700">
                          {p.bloodGroup || 'Not specified'}
                        </td>
                        <td className="p-4 text-slate-700">{p.phone || p.user?.phone || 'N/A'}</td>
                        <td className="p-4 text-xs">
                          {p.emergencyContacts && p.emergencyContacts.length > 0 ? (
                            <div>
                              <p className="font-semibold text-slate-900">{p.emergencyContacts[0].name}</p>
                              <p className="text-slate-500">{p.emergencyContacts[0].phone}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400">None</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No patient records found matching query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Register New Patient Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleRegisterPatient} className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">Register New Patient</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  placeholder="Priya"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  placeholder="Sharma"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="priya.sharma@example.com"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone (Optional)</label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+1-800-555-0199"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={regDob}
                  onChange={(e) => setRegDob(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Gender *</label>
                <select
                  value={regGender}
                  onChange={(e) => setRegGender(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  <option value="FEMALE">FEMALE</option>
                  <option value="MALE">MALE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Blood Group</label>
                <select
                  value={regBloodGroup}
                  onChange={(e) => setRegBloodGroup(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  <option value="O_POSITIVE">O+</option>
                  <option value="O_NEGATIVE">O-</option>
                  <option value="A_POSITIVE">A+</option>
                  <option value="A_NEGATIVE">A-</option>
                  <option value="B_POSITIVE">B+</option>
                  <option value="B_NEGATIVE">B-</option>
                  <option value="AB_POSITIVE">AB+</option>
                  <option value="AB_NEGATIVE">AB-</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Residential Address</label>
              <input
                type="text"
                value={regAddress}
                onChange={(e) => setRegAddress(e.target.value)}
                placeholder="123 Healthcare Way, Suite 400"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={registering}
                className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-xl hover:bg-sky-700 disabled:opacity-50"
              >
                {registering ? 'Registering...' : 'Register Patient'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
