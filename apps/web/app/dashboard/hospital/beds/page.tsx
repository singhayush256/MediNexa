'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BedDto, FacilityDto, WardDto, BedStatus, PatientProfileDto, FacilityCapacityDto, UserDto, RoleCode } from '@medinexa/types';

export default function LiveBedsDashboardPage() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [beds, setBeds] = useState<BedDto[]>([]);
  const [facilities, setFacilities] = useState<FacilityDto[]>([]);
  const [wards, setWards] = useState<WardDto[]>([]);
  const [patients, setPatients] = useState<PatientProfileDto[]>([]);
  const [capacity, setCapacity] = useState<FacilityCapacityDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Filters
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [reserveModalBed, setReserveModalBed] = useState<BedDto | null>(null);
  const [assignModalBed, setAssignModalBed] = useState<BedDto | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [expiresInMinutes, setExpiresInMinutes] = useState(30);
  const [actionReason, setActionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const fetchBedsAndCapacity = () => {
    const queryParams = new URLSearchParams();
    if (selectedFacility) queryParams.set('facilityId', selectedFacility);
    if (selectedWard) queryParams.set('wardId', selectedWard);
    if (selectedStatus) queryParams.set('status', selectedStatus);

    fetch(`${apiUrl}/beds?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((bedList) => setBeds(Array.isArray(bedList) ? bedList : []))
      .catch(() => {});

    if (selectedFacility) {
      fetch(`${apiUrl}/facilities/${selectedFacility}/capacity`)
        .then((res) => res.json())
        .then((capData) => setCapacity(capData))
        .catch(() => {});
    }
  };

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('medinexa_token') || localStorage.getItem('token');
  };

  useEffect(() => {
    const token = getToken();
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

    Promise.all([
      fetch(`${apiUrl}/facilities`).then((res) => res.json()),
      fetch(`${apiUrl}/wards`).then((res) => res.json()),
      token
        ? fetch(`${apiUrl}/patients`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json())
        : Promise.resolve([]),
    ])
      .then(([facList, wardList, patList]) => {
        const validFacs = Array.isArray(facList) ? facList : [];
        setFacilities(validFacs);
        setWards(Array.isArray(wardList) ? wardList : []);
        setPatients(Array.isArray(patList) ? patList : []);
        if (validFacs.length > 0) {
          setSelectedFacility(validFacs[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiUrl]);

  useEffect(() => {
    fetchBedsAndCapacity();
    const interval = setInterval(fetchBedsAndCapacity, 4000); // 4-second auto refresh for live updates
    return () => clearInterval(interval);
  }, [apiUrl, selectedFacility, selectedWard, selectedStatus]);

  const getHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const handleAction = async (url: string, body: any, successMsg: string) => {
    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Operation failed');
      }

      setActionSuccess(successMsg);
      setReserveModalBed(null);
      setAssignModalBed(null);
      setSelectedPatientId('');
      setActionReason('');
      fetchBedsAndCapacity();
    } catch (err: any) {
      setActionError(err.message || 'Operation failed due to a server or authorization error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBeds = beds.filter((b) => {
    const num = (b.bedNumber || '').toLowerCase();
    const room = (b.room?.roomNumber || '').toLowerCase();
    const ward = (b.ward?.name || '').toLowerCase();
    const q = search.toLowerCase();
    return num.includes(q) || room.includes(q) || ward.includes(q);
  });

  const getStatusBadgeClass = (status: BedStatus) => {
    switch (status) {
      case BedStatus.AVAILABLE:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case BedStatus.OCCUPIED:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case BedStatus.RESERVED:
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case BedStatus.CLEANING:
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case BedStatus.MAINTENANCE:
      case BedStatus.OUT_OF_SERVICE:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

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
              <Link href="/dashboard/hospital/rooms" className="text-sm text-slate-600 hover:text-sky-600 font-medium">
                Rooms
              </Link>
              <Link href="/dashboard/hospital/beds" className="text-sm text-sky-600 font-bold border-b-2 border-sky-600 pb-1">
                Live Bed Engine
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Live Bed Management Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time operational bed states, patient reservations, occupancy assignments, sanitization, and maintenance
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 animate-pulse">
              ● Live Engine Active
            </span>
            {(user?.role?.code === RoleCode.MEDINEXA_ADMIN || user?.roleCode === RoleCode.MEDINEXA_ADMIN) && (
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 shadow-sm"
              >
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Live Status Messages */}
        {actionSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold rounded-xl flex items-center justify-between">
            <span>✅ {actionSuccess}</span>
            <button onClick={() => setActionSuccess(null)} className="text-xs font-bold text-emerald-700">Dismiss</button>
          </div>
        )}
        {actionError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-900 text-sm font-semibold rounded-xl flex items-center justify-between">
            <span>⚠️ {actionError}</span>
            <button onClick={() => setActionError(null)} className="text-xs font-bold text-red-700">Dismiss</button>
          </div>
        )}

        {/* Live Capacity Counters Bar */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm text-center">
            <p className="text-xs font-bold text-slate-500 uppercase">Available</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{capacity?.availableBeds || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm text-center">
            <p className="text-xs font-bold text-slate-500 uppercase">Reserved</p>
            <p className="text-2xl font-black text-purple-600 mt-0.5">{capacity?.reservedBeds || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm text-center">
            <p className="text-xs font-bold text-slate-500 uppercase">Occupied</p>
            <p className="text-2xl font-black text-blue-600 mt-0.5">{capacity?.occupiedBeds || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm text-center">
            <p className="text-xs font-bold text-slate-500 uppercase">Cleaning</p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">{capacity?.cleaningBeds || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm text-center">
            <p className="text-xs font-bold text-slate-500 uppercase">Maintenance</p>
            <p className="text-2xl font-black text-red-600 mt-0.5">{capacity?.maintenanceBeds || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm text-center">
            <p className="text-xs font-bold text-slate-500 uppercase">Total Capacity</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{capacity?.totalBeds || 0}</p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Search Bed / Room</label>
            <input
              type="text"
              placeholder="Search by bed number or room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Clinical Ward</label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm bg-white"
            >
              <option value="">All Wards</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Operational State</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm bg-white"
            >
              <option value="">All Operational States</option>
              {Object.values(BedStatus).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Beds Table */}
        {loading ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 animate-pulse">
            Connecting to Live Bed Engine...
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-bold tracking-wider border-b border-slate-200">
                  <th className="p-4">Bed Number</th>
                  <th className="p-4">Room & Ward</th>
                  <th className="p-4">Bed Type</th>
                  <th className="p-4">Current Status</th>
                  <th className="p-4 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBeds.length > 0 ? (
                  filteredBeds.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-black text-slate-900">{b.bedNumber}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">Room {b.room?.roomNumber}</div>
                        <div className="text-xs text-slate-500">{b.ward?.name}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-sky-100 text-sky-800 text-xs px-2.5 py-1 rounded-full font-bold">
                          {b.bedType}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-extrabold border ${getStatusBadgeClass(
                            b.status,
                          )}`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {/* State-Sensitive Action Buttons */}
                        {b.status === BedStatus.AVAILABLE && (
                          <>
                            <button
                              onClick={() => setReserveModalBed(b)}
                              className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg shadow-sm"
                            >
                              Reserve
                            </button>
                            <button
                              onClick={() => setAssignModalBed(b)}
                              className="text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-lg shadow-sm"
                            >
                              Assign Bed
                            </button>
                            <button
                              onClick={() => handleAction(`${apiUrl}/beds/${b.id}/maintenance`, {}, 'Bed set to MAINTENANCE')}
                              className="text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 px-2.5 py-1.5 rounded-lg"
                            >
                              Maintenance
                            </button>
                          </>
                        )}

                        {b.status === BedStatus.RESERVED && (
                          <>
                            <button
                              onClick={() => setAssignModalBed(b)}
                              className="text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-lg shadow-sm"
                            >
                              Assign Reserved Bed
                            </button>
                            <button
                              onClick={() => handleAction(`${apiUrl}/beds/${b.id}/cancel-reservation`, {}, 'Reservation cancelled')}
                              className="text-xs font-bold bg-red-100 hover:bg-red-200 text-red-800 px-2.5 py-1.5 rounded-lg"
                            >
                              Cancel Reservation
                            </button>
                          </>
                        )}

                        {b.status === BedStatus.OCCUPIED && (
                          <button
                            onClick={() => handleAction(`${apiUrl}/beds/${b.id}/release`, {}, 'Bed released for cleaning')}
                            className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg shadow-sm"
                          >
                            Release Bed
                          </button>
                        )}

                        {b.status === BedStatus.CLEANING && (
                          <button
                            onClick={() => handleAction(`${apiUrl}/beds/${b.id}/clean`, {}, 'Bed marked clean and AVAILABLE')}
                            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg shadow-sm"
                          >
                            Mark Clean
                          </button>
                        )}

                        {(b.status === BedStatus.MAINTENANCE || b.status === BedStatus.OUT_OF_SERVICE) && (
                          <button
                            onClick={() => handleAction(`${apiUrl}/beds/${b.id}/maintenance/complete`, {}, 'Maintenance completed')}
                            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg shadow-sm"
                          >
                            Complete Maintenance
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No beds found matching search or filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Reserve Modal */}
      {reserveModalBed && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Reserve Bed {reserveModalBed.bedNumber}</h3>
            <p className="text-xs text-slate-500">
              Place a temporary reservation hold for Room {reserveModalBed.room?.roomNumber} ({reserveModalBed.ward?.name})
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Select Patient</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.user?.firstName} {p.user?.lastName} ({p.user?.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Hold Duration (Minutes)</label>
              <input
                type="number"
                value={expiresInMinutes}
                onChange={(e) => setExpiresInMinutes(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                min={5}
                max={1440}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Reservation Reason</label>
              <input
                type="text"
                placeholder="Reason or intake notes..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setReserveModalBed(null)}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={!selectedPatientId || isSubmitting}
                onClick={() =>
                  handleAction(
                    `${apiUrl}/beds/${reserveModalBed.id}/reserve`,
                    { patientId: selectedPatientId, expiresInMinutes, reason: actionReason },
                    'Bed reservation hold confirmed',
                  )
                }
                className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignModalBed && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Assign Patient to Bed {assignModalBed.bedNumber}</h3>
            <p className="text-xs text-slate-500">
              Confirm occupancy assignment for Room {assignModalBed.room?.roomNumber} ({assignModalBed.ward?.name})
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Select Patient</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.user?.firstName} {p.user?.lastName} ({p.user?.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Assignment Reason / Notes</label>
              <input
                type="text"
                placeholder="Clinical reason or admission notes..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setAssignModalBed(null)}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={!selectedPatientId || isSubmitting}
                onClick={() =>
                  handleAction(
                    `${apiUrl}/beds/${assignModalBed.id}/assign`,
                    {
                      patientId: selectedPatientId,
                      reservationId: assignModalBed.activeReservation?.id || undefined,
                      reason: actionReason,
                    },
                    'Bed assignment confirmed and status set to OCCUPIED',
                  )
                }
                className="text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
