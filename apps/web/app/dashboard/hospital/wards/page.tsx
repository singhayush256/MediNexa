'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { WardDto, FacilityDto, UserDto, RoleCode } from '@medinexa/types';

export default function WardsDirectoryPage() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [wards, setWards] = useState<WardDto[]>([]);
  const [facilities, setFacilities] = useState<FacilityDto[]>([]);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
    if (token) {
      fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: UserDto) => {
          if (data) setUser(data);
        })
        .catch(() => {});
    }

    fetch(`${apiUrl}/facilities`)
      .then((res) => res.json())
      .then((facList) => setFacilities(Array.isArray(facList) ? facList : []))
      .catch(() => {});
  }, [apiUrl]);

  useEffect(() => {
    setLoading(true);
    const query = selectedFacility ? `?facilityId=${selectedFacility}` : '';
    fetch(`${apiUrl}/wards${query}`)
      .then((res) => res.json())
      .then((wardList) => setWards(Array.isArray(wardList) ? wardList : []))
      .catch((err) => console.error('Error fetching wards:', err))
      .finally(() => setLoading(false));
  }, [apiUrl, selectedFacility]);

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
              <Link href="/dashboard/hospital" className="text-sm text-slate-600 hover:text-sky-600 font-medium">
                Hospital
              </Link>
              <Link href="/dashboard/hospital/wards" className="text-sm text-sky-600 font-bold border-b-2 border-sky-600 pb-1">
                Wards
              </Link>
              <Link href="/dashboard/hospital/rooms" className="text-sm text-slate-600 hover:text-sky-600 font-medium">
                Rooms
              </Link>
              <Link href="/dashboard/hospital/beds" className="text-sm text-slate-600 hover:text-sky-600 font-medium">
                Beds Table
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Wards Directory</h1>
            <p className="text-sm text-slate-500 mt-1">
              Wards, types (ICU, General, Emergency, Isolation), floor locations, and department assignments
            </p>
          </div>

          {(user?.role?.code === RoleCode.MEDINEXA_ADMIN || user?.roleCode === RoleCode.MEDINEXA_ADMIN) && (
            <div>
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-sky-500 focus:border-sky-500"
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
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 animate-pulse">
            Loading wards directory...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wards.map((w) => (
              <div key={w.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{w.name}</h3>
                      <span className="inline-block mt-1 text-xs bg-sky-100 text-sky-800 font-bold px-2.5 py-0.5 rounded-full">
                        {w.wardType} WARD
                      </span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded font-bold">
                      {w.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <p><span className="font-semibold text-slate-800">Hospital:</span> {w.facility?.name}</p>
                    <p><span className="font-semibold text-slate-800">Department:</span> {w.department?.name}</p>
                    <p><span className="font-semibold text-slate-800">Floor Level:</span> {w.floor || 'Unspecified'}</p>
                    <p><span className="font-semibold text-slate-800">Ward Code:</span> {w.code}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Beds Capacity:</span>
                  <span className="text-sm font-extrabold text-sky-700">{w.totalBeds || 0} Beds</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
