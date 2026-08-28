'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface PublicDoctor {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  specialty: string;
  specialtyId: string;
  facilityName: string;
  facilityCode: string;
  facilityAddress: string;
  facilityId: string;
  departmentName?: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  currency: string;
  languages: string[];
  bio: string;
}

interface Specialty {
  id: string;
  name: string;
  code: string;
}

interface Facility {
  id: string;
  name: string;
  code: string;
}

export default function PublicDoctorDirectoryPage() {
  const [doctors, setDoctors] = useState<PublicDoctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, selectedFacility, searchQuery]);

  const fetchFilters = async () => {
    try {
      const [specRes, facRes] = await Promise.all([
        fetch(`${apiUrl}/specialties`).then((r) => r.json()),
        fetch(`${apiUrl}/facilities`).then((r) => r.json()),
      ]);
      if (Array.isArray(specRes)) setSpecialties(specRes);
      if (Array.isArray(facRes)) setFacilities(facRes);
    } catch (err) {
      console.error('Failed to load filter metadata:', err);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSpecialty) params.set('specialtyId', selectedSpecialty);
      if (selectedFacility) params.set('facilityId', selectedFacility);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`${apiUrl}/public/doctors?${params.toString()}`);
      const data = await res.json();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch public doctor directory:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Public Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
              M
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">MediNexa</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                Patient Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-sky-600 transition"
            >
              Sign In (Staff / Patient)
            </Link>
            <Link
              href="/doctors"
              className="px-4 py-2 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition"
            >
              Find a Doctor
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Search Section */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-indigo-700 text-white py-12 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Find Top Doctors & Book Online Consultations
          </h1>
          <p className="text-sky-100 text-base max-w-2xl mx-auto">
            Book appointment slots instantly with certified medical specialists across leading hospital facilities. No login required.
          </p>

          {/* Search Controls Bar */}
          <div className="bg-white p-3 rounded-2xl shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-800 text-left mt-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase px-2 mb-1">Search Doctor / Specialty</label>
              <input
                type="text"
                placeholder="e.g. Dr. Smith or Cardiology"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase px-2 mb-1">Medical Specialty</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 bg-slate-50"
              >
                <option value="">All Medical Specialties</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase px-2 mb-1">Hospital Facility</label>
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 bg-slate-50"
              >
                <option value="">All Hospital Campuses</option>
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Roster Section */}
      <main className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Available Specialists ({doctors.length})
          </h2>
          <span className="text-xs font-medium text-slate-500">
            Instant OTP Verified Booking Active
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500 font-medium animate-pulse">
            Loading public doctor directory...
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-600">
            <p className="text-lg font-bold">No doctors found matching your criteria</p>
            <p className="text-sm mt-1">Try clearing filters or searching for another medical specialty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-extrabold text-xl flex-shrink-0">
                      {doc.firstName[0]}
                      {doc.lastName[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">{doc.name}</h3>
                      <span className="inline-block text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-md mt-1">
                        {doc.specialty}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">{doc.qualification} • {doc.experienceYears} Years Exp.</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{doc.bio}</p>

                  <div className="border-t border-slate-100 pt-3 space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-500">Hospital:</span>
                      <span className="font-bold text-slate-800">{doc.facilityName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-500">Consultation Fee:</span>
                      <span className="font-bold text-emerald-600">${doc.consultationFee} {doc.currency}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    href={`/doctors/${doc.id}`}
                    className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-2 transition"
                  >
                    <span>View Profile & Book Appointment</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Public Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        © 2026 MediNexa Healthcare Network. All public doctor directory data is verified and HIPAA compliant.
      </footer>
    </div>
  );
}
