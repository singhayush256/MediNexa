'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RoomDto, WardDto, UserDto, RoleCode } from '@medinexa/types';

export default function RoomsDirectoryPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [wards, setWards] = useState<WardDto[]>([]);
  const [selectedWard, setSelectedWard] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDto | null>(null);
  const [userRole, setUserRole] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    if (token) {
      fetch(`${apiUrl}/auth/me`, { headers: getHeaders() })
        .then((res) => (res.ok ? res.json() : null))
        .then((u: UserDto) => {
          if (u) {
            setUser(u);
            const role = u.roleCode || u.role?.code || '';
            setUserRole(role);
            if (role === RoleCode.PATIENT) {
              router.replace('/dashboard/appointments');
            }
          }
        })
        .catch(() => {});
    }

    fetch(`${apiUrl}/wards`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((wardList) => setWards(Array.isArray(wardList) ? wardList : []))
      .catch(() => {});
  }, [apiUrl, router]);

  useEffect(() => {
    setLoading(true);
    const query = selectedWard ? `?wardId=${selectedWard}` : '';
    fetch(`${apiUrl}/rooms${query}`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((roomList) => setRooms(Array.isArray(roomList) ? roomList : []))
      .catch((err) => console.error('Error fetching rooms:', err))
      .finally(() => setLoading(false));
  }, [apiUrl, selectedWard]);

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
              <Link href="/dashboard/hospital/wards" className="text-sm text-slate-600 hover:text-sky-600 font-medium">
                Wards
              </Link>
              <Link href="/dashboard/hospital/rooms" className="text-sm text-sky-600 font-bold border-b-2 border-sky-600 pb-1">
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
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hospital Rooms Directory</h1>
            <p className="text-sm text-slate-500 mt-1">
              Room numbers, floor levels, room types (General, ICU, Private), and bed capacity limits
            </p>
          </div>

          <div>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">All Clinical Wards</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 animate-pulse">
            Loading rooms directory...
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-bold tracking-wider border-b border-slate-200">
                  <th className="p-4">Room Number</th>
                  <th className="p-4">Ward</th>
                  <th className="p-4">Room Type</th>
                  <th className="p-4">Floor Level</th>
                  <th className="p-4">Bed Capacity</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-extrabold text-slate-900">{r.roomNumber}</td>
                    <td className="p-4 font-semibold text-slate-700">{r.ward?.name}</td>
                    <td className="p-4">
                      <span className="bg-sky-100 text-sky-800 text-xs px-2.5 py-1 rounded-full font-bold">
                        {r.roomType}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{r.floor || 'Unspecified'}</td>
                    <td className="p-4 font-bold text-slate-800">{r.capacity} Beds</td>
                    <td className="p-4">
                      <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
