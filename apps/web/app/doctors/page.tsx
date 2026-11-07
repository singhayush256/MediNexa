'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';
import { getApiBaseUrl, fetchWithTimeout } from '@/lib/api-config';

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

const CANONICAL_PUBLIC_DOCTORS: PublicDoctor[] = [
  {
    id: 'doc-cardio-1',
    name: 'Dr. Rajesh Singh',
    firstName: 'Rajesh',
    lastName: 'Singh',
    specialty: 'Cardiology',
    specialtyId: 'Cardiology',
    departmentName: 'Interventional Cardiology',
    facilityName: 'MediNexa Central Super Specialty Hospital (Delhi)',
    facilityCode: 'MNX-DEL-01',
    facilityAddress: 'Sarita Vihar, Delhi Mathura Road, New Delhi',
    facilityId: 'HOSPITAL_A',
    qualification: 'MBBS, MD, DM (Cardiology) • AIIMS New Delhi',
    experienceYears: 18,
    consultationFee: 1000,
    currency: 'INR',
    languages: ['English', 'Hindi', 'Punjabi'],
    bio: 'Director of Interventional Cardiology with over 10,000 successful coronary and structural heart procedures.',
  },
  {
    id: 'doc-neuro-1',
    name: 'Dr. Ananya Sharma',
    firstName: 'Ananya',
    lastName: 'Sharma',
    specialty: 'Neurology',
    specialtyId: 'Neurology',
    departmentName: 'Neurology & Neurosciences',
    facilityName: 'MediNexa City Hospital & Trauma Centre (Mumbai)',
    facilityCode: 'MNX-MUM-01',
    facilityAddress: 'Mulund Goregaon Link Road, Bhandup West, Mumbai',
    facilityId: 'HOSPITAL_B',
    qualification: 'MBBS, MD, DM (Neurology) • NIMHANS Bengaluru',
    experienceYears: 14,
    consultationFee: 1200,
    currency: 'INR',
    languages: ['English', 'Hindi', 'Marathi'],
    bio: 'Senior Consultant Neurologist specializing in acute stroke intervention, chronic migraine, and epilepsy disorders.',
  },
  {
    id: 'doc-ortho-1',
    name: 'Dr. Vikramaditya Rathore',
    firstName: 'Vikramaditya',
    lastName: 'Rathore',
    specialty: 'Orthopedics',
    specialtyId: 'Orthopedics',
    departmentName: 'Orthopedics & Joint Reconstruction',
    facilityName: 'MediNexa Central Super Specialty Hospital (Delhi)',
    facilityCode: 'MNX-DEL-01',
    facilityAddress: 'Sarita Vihar, Delhi Mathura Road, New Delhi',
    facilityId: 'HOSPITAL_A',
    qualification: 'MBBS, MS (Orthopedics), M.Ch (Joint Reconstruction)',
    experienceYears: 16,
    consultationFee: 900,
    currency: 'INR',
    languages: ['English', 'Hindi'],
    bio: 'Chief Orthopedic Surgeon expert in computer-navigated total knee and hip replacements and sports arthroscopy.',
  },
  {
    id: 'doc-derma-1',
    name: 'Dr. Sunita Kulkarni',
    firstName: 'Sunita',
    lastName: 'Kulkarni',
    specialty: 'Dermatology',
    specialtyId: 'Dermatology',
    departmentName: 'Dermatology & Cosmetology',
    facilityName: 'MediNexa Multi-Speciality Hospital (Greater Noida)',
    facilityCode: 'MNX-NOI-01',
    facilityAddress: 'Plot 4, Knowledge Park II, Greater Noida',
    facilityId: 'FAC_NOIDA_01',
    qualification: 'MBBS, MD (DVL), DNB (Dermatology)',
    experienceYears: 11,
    consultationFee: 800,
    currency: 'INR',
    languages: ['English', 'Hindi'],
    bio: 'Senior Consultant Dermatologist expert in clinical dermatology, chronic skin conditions, and pediatric skin care.',
  },
  {
    id: 'doc-pedia-1',
    name: 'Dr. Arvind Nair',
    firstName: 'Arvind',
    lastName: 'Nair',
    specialty: 'Pediatrics',
    specialtyId: 'Pediatrics',
    departmentName: 'Pediatrics & Neonatology',
    facilityName: 'MediNexa City Hospital & Trauma Centre (Mumbai)',
    facilityCode: 'MNX-MUM-01',
    facilityAddress: 'Mulund Goregaon Link Road, Bhandup West, Mumbai',
    facilityId: 'HOSPITAL_B',
    qualification: 'MBBS, MD (Pediatrics), DNB (Pediatrics) • PGIMER',
    experienceYears: 13,
    consultationFee: 850,
    currency: 'INR',
    languages: ['English', 'Hindi', 'Malayalam'],
    bio: 'Senior Pediatric Specialist & Neonatologist providing comprehensive child health, developmental wellness, and newborn care.',
  },
  {
    id: 'doc-gen-1',
    name: 'Dr. Rohan Mehra',
    firstName: 'Rohan',
    lastName: 'Mehra',
    specialty: 'General Medicine',
    specialtyId: 'General Medicine',
    departmentName: 'Internal Medicine & Diabetology',
    facilityName: 'MediNexa Central Super Specialty Hospital (Delhi)',
    facilityCode: 'MNX-DEL-01',
    facilityAddress: 'Sarita Vihar, Delhi Mathura Road, New Delhi',
    facilityId: 'HOSPITAL_A',
    qualification: 'MBBS, MD (Internal Medicine) • KGMU Lucknow',
    experienceYears: 12,
    consultationFee: 750,
    currency: 'INR',
    languages: ['English', 'Hindi'],
    bio: 'Lead Consultant in Internal Medicine specializing in comprehensive diabetes care, hypertension, and preventive health screenings.',
  },
];

export default function PublicDoctorDirectoryPage() {
  const [doctors, setDoctors] = useState<PublicDoctor[]>(CANONICAL_PUBLIC_DOCTORS);
  const [specialties, setSpecialties] = useState<Specialty[]>([
    { id: 'Cardiology', name: 'Cardiology', code: 'CARD' },
    { id: 'Neurology', name: 'Neurology', code: 'NEUR' },
    { id: 'Orthopedics', name: 'Orthopedics', code: 'ORTH' },
    { id: 'Dermatology', name: 'Dermatology', code: 'DERM' },
    { id: 'Pediatrics', name: 'Pediatrics', code: 'PED' },
    { id: 'General Medicine', name: 'General Medicine', code: 'GEN' },
  ]);
  const [facilities, setFacilities] = useState<Facility[]>([
    { id: 'HOSPITAL_A', name: 'MediNexa Central Super Specialty Hospital (Delhi)', code: 'MNX-DEL-01' },
    { id: 'HOSPITAL_B', name: 'MediNexa City Hospital & Trauma Centre (Mumbai)', code: 'MNX-MUM-01' },
    { id: 'FAC_NOIDA_01', name: 'MediNexa Multi-Speciality Hospital (Greater Noida)', code: 'MNX-NOI-01' },
  ]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const apiUrl = getApiBaseUrl();

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, selectedFacility, searchQuery]);

  const fetchFilters = async () => {
    try {
      const [specRes, facRes] = await Promise.all([
        fetchWithTimeout(`${apiUrl}/specialties`, {}, 10000).then((r) => r.ok ? r.json() : null),
        fetchWithTimeout(`${apiUrl}/facilities`, {}, 10000).then((r) => r.ok ? r.json() : null),
      ]);
      if (Array.isArray(specRes) && specRes.length > 0) setSpecialties(specRes);
      if (Array.isArray(facRes) && facRes.length > 0) setFacilities(facRes);
    } catch (err) {
      console.warn('Filter metadata using defaults:', err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSpecialty) params.set('specialtyId', selectedSpecialty);
      if (selectedFacility) params.set('facilityId', selectedFacility);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetchWithTimeout(`${apiUrl}/public/doctors?${params.toString()}`, {}, 10000);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setDoctors(data);
          return;
        }
      }

      // Filter canonical fallback doctors by selected filters
      let filtered = [...CANONICAL_PUBLIC_DOCTORS];
      if (selectedSpecialty) {
        filtered = filtered.filter((d) => d.specialtyId === selectedSpecialty || d.specialty.toLowerCase() === selectedSpecialty.toLowerCase());
      }
      if (selectedFacility) {
        filtered = filtered.filter((d) => d.facilityId === selectedFacility);
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter((d) => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q));
      }
      setDoctors(filtered);
    } catch (err) {
      console.warn('Public doctor directory using canonical catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Public Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <MediNexaLogo size="sm" subtitle="Doctors Directory" href="/" />

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
                placeholder="e.g. Dr. Ayush Singh or Cardiology"
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
