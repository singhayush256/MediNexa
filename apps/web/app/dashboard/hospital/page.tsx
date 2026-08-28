'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FacilityDto, FacilityCapacityDto, UserDto } from '@medinexa/types';

export default function HospitalOverviewPage() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [facilities, setFacilities] = useState<FacilityDto[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [capacity, setCapacity] = useState<FacilityCapacityDto | null>(null);
  const [loading, setLoading] = useState(true);

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

    // Fetch Facilities list
    fetch(`${apiUrl}/facilities`)
      .then((res) => res.json())
      .then((facList: FacilityDto[]) => {
        if (Array.isArray(facList) && facList.length > 0) {
          setFacilities(facList);
          setSelectedFacilityId(facList[0].id);
        }
      })
      .catch((err) => console.error('Error fetching facilities:', err))
      .finally(() => setLoading(false));
  }, [apiUrl]);

  useEffect(() => {
    if (!selectedFacilityId) return;

    fetch(`${apiUrl}/facilities/${selectedFacilityId}/capacity`)
      .then((res) => res.json())
      .then((capData: FacilityCapacityDto) => {
        setCapacity(capData);
      })
      .catch((err) => console.error('Error fetching capacity:', err));
  }, [apiUrl, selectedFacilityId]);

  const activeFacility = facilities.find((f) => f.id === selectedFacilityId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Header */}
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
              <Link href="/dashboard/hospital" className="text-sm text-sky-600 font-bold border-b-2 border-sky-600 pb-1">
                Hospital Infrastructure
              </Link>
              <Link href="/dashboard/hospital/wards" className="text-sm text-slate-600 hover:text-sky-600 font-medium">
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

          <div className="flex items-center space-x-3">
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-semibold">
              {user ? user.role?.name || user.role?.code : 'Guest'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hospital Infrastructure Overview</h1>
            <p className="text-sm text-slate-500 mt-1">
              Physical facility, clinical departments, ward structures, rooms, and total bed capacities
            </p>
          </div>

          {/* Hospital Selector (System Admin Only) */}
          {(user?.role?.code === RoleCode.MEDINEXA_ADMIN || user?.roleCode === 'MEDINEXA_ADMIN') && (
            <div>
              <select
                value={selectedFacilityId}
                onChange={(e) => setSelectedFacilityId(e.target.value)}
                className="bg-white border border-slate-300 font-bold text-slate-800 text-sm rounded-xl px-4 py-2.5 shadow-sm focus:ring-sky-500 focus:border-sky-500"
              >
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name} ({fac.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 animate-pulse">
            Loading facility infrastructure details...
          </div>
        ) : activeFacility ? (
          <div className="space-y-8">
            {/* Facility Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs bg-sky-100 text-sky-800 font-bold px-2.5 py-0.5 rounded-full">
                    {activeFacility.code}
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-2">{activeFacility.name}</h2>
                  <p className="text-xs text-slate-500 mt-1">📍 {activeFacility.address}, {activeFacility.city}, {activeFacility.state}</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold">
                  {activeFacility.status}
                </span>
              </div>

              {/* Infrastructure Summary Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500 font-semibold uppercase">Departments</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{activeFacility.departments?.length || 0}</p>
                </div>

                <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                  <p className="text-xs text-sky-700 font-semibold uppercase">Clinical Wards</p>
                  <p className="text-2xl font-black text-sky-900 mt-1">{capacity?.totalWards || 0}</p>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <p className="text-xs text-indigo-700 font-semibold uppercase">Rooms</p>
                  <p className="text-2xl font-black text-indigo-900 mt-1">{capacity?.totalRooms || 0}</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-xs text-emerald-700 font-semibold uppercase">Total Bed Capacity</p>
                  <p className="text-2xl font-black text-emerald-900 mt-1">{capacity?.totalBeds || 0}</p>
                </div>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/dashboard/hospital/wards"
                className="bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-2xl p-6 transition-all group shadow-sm"
              >
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 flex items-center justify-between">
                  <span>View Wards</span>
                  <span>&rarr;</span>
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Browse ICU, General, CCU, Emergency, and specialized ward units.
                </p>
              </Link>

              <Link
                href="/dashboard/hospital/rooms"
                className="bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-2xl p-6 transition-all group shadow-sm"
              >
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 flex items-center justify-between">
                  <span>View Rooms</span>
                  <span>&rarr;</span>
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Inspect room numbers, floor levels, capacities, and room types.
                </p>
              </Link>

              <Link
                href="/dashboard/hospital/beds"
                className="bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-2xl p-6 transition-all group shadow-sm"
              >
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 flex items-center justify-between">
                  <span>Infrastructure Bed Table</span>
                  <span>&rarr;</span>
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  View complete physical bed inventory, bed types, and operational statuses.
                </p>
              </Link>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
