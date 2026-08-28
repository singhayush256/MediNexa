'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DoctorProfileDto, FacilityDto, SpecialtyDto, UserDto, RoleCode } from '@medinexa/types';

export default function DoctorsDashboardPage() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [doctors, setDoctors] = useState<DoctorProfileDto[]>([]);
  const [facilities, setFacilities] = useState<FacilityDto[]>([]);
  const [specialties, setSpecialties] = useState<SpecialtyDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [search, setSearch] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (token) {
      fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data: UserDto) => setUser(data))
        .catch(() => {});
    }

    // Fetch Facilities & Specialties for filter dropdowns
    Promise.all([
      fetch(`${apiUrl}/facilities`).then((res) => res.json()),
      fetch(`${apiUrl}/specialties`).then((res) => res.json()),
    ])
      .then(([facList, specList]) => {
        setFacilities(Array.isArray(facList) ? facList : []);
        setSpecialties(Array.isArray(specList) ? specList : []);
      })
      .catch(() => {});
  }, [apiUrl]);

  useEffect(() => {
    setLoading(true);
    const queryParams = new URLSearchParams();
    if (selectedFacility) queryParams.set('facilityId', selectedFacility);
    if (selectedSpecialty) queryParams.set('specialtyId', selectedSpecialty);

    fetch(`${apiUrl}/doctors?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((docList: DoctorProfileDto[]) => {
        setDoctors(Array.isArray(docList) ? docList : []);
      })
      .catch((err) => console.error('Error fetching doctor directory:', err))
      .finally(() => setLoading(false));
  }, [apiUrl, selectedFacility, selectedSpecialty]);

  const filteredDoctors = doctors.filter((doc) => {
    const name = `${doc.user?.firstName || ''} ${doc.user?.lastName || ''}`.toLowerCase();
    const spec = (doc.specialty?.name || '').toLowerCase();
    const query = search.toLowerCase();
    return name.includes(query) || spec.includes(query);
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Bar */}
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
              <Link href="/dashboard/patients" className="text-sm text-slate-600 hover:text-sky-600 font-medium">
                Patients
              </Link>
              <Link href="/dashboard/doctors" className="text-sm text-sky-600 font-bold border-b-2 border-sky-600 pb-1">
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
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Doctor Directory</h1>
            <p className="text-sm text-slate-500 mt-1">
              Browse medical specialists, departments, and hospital facility assignments across the MediNexa network
            </p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Search Doctor / Specialty</label>
            <input
              type="text"
              placeholder="Search by doctor name or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          {(user?.role?.code === RoleCode.MEDINEXA_ADMIN || user?.roleCode === RoleCode.MEDINEXA_ADMIN) && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Filter by Hospital / Facility</label>
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-sky-500 focus:border-sky-500 bg-white"
              >
                <option value="">All Hospitals & Facilities</option>
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Filter by Specialty</label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-sky-500 focus:border-sky-500 bg-white"
            >
              <option value="">All Medical Specialties</option>
              {specialties.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctor Directory Cards Grid */}
        {loading ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 animate-pulse">
            Loading doctor directory...
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {doc.user?.firstName} {doc.user?.lastName}
                      </h3>
                      <span className="inline-block mt-1 text-xs bg-sky-100 text-sky-800 font-bold px-2.5 py-0.5 rounded-full">
                        {doc.specialty?.name || 'General'}
                      </span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-semibold">
                      {doc.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs border-t border-slate-100 pt-3">
                    <p className="text-slate-600">
                      <span className="font-semibold text-slate-800">Hospital:</span> {doc.facility?.name}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-semibold text-slate-800">Department:</span> {doc.department?.name}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-semibold text-slate-800">License #:</span> {doc.licenseNumber}
                    </p>
                    {doc.user?.email && (
                      <p className="text-slate-600">
                        <span className="font-semibold text-slate-800">Email:</span> {doc.user.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            No doctors found matching selected filters.
          </div>
        )}
      </main>
    </div>
  );
}
