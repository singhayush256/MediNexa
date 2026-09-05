'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Bed,
  UserCheck,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { BedBookingDto, FacilityDto, BedDto, BedBookingStatus, BedType } from '@medinexa/types';

export default function BedBookingQueuePage() {
  const [bookings, setBookings] = useState<BedBookingDto[]>([]);
  const [facilities, setFacilities] = useState<FacilityDto[]>([]);
  const [availableBeds, setAvailableBeds] = useState<BedDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedBedType, setSelectedBedType] = useState<string>('');
  const [search, setSearch] = useState('');

  // Allocation & Admission Modals
  const [allocateModalBooking, setAllocateModalBooking] = useState<BedBookingDto | null>(null);
  const [selectedBedId, setSelectedBedId] = useState('');
  const [allocationNotes, setAllocationNotes] = useState('');

  const [admitModalBooking, setAdmitModalBooking] = useState<BedBookingDto | null>(null);
  const [admissionReason, setAdmissionReason] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('medinexa_token') || localStorage.getItem('token');
  };

  const getHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const handleProcessExpirations = async () => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      const res = await fetch(`${apiUrl}/bed-bookings/process-expirations${selectedFacility ? `?facilityId=${selectedFacility}` : ''}`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setActionSuccess(`Reservation sweep complete. ${data.expiredCount || 0} expired holds released.`);
        await fetchBookings();
      } else {
        setActionError('Failed to process expired bookings.');
      }
    } catch (err: any) {
      setActionError('Error running expiration sweep.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedFacility) params.append('facilityId', selectedFacility);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedBedType) params.append('bedType', selectedBedType);
      if (search) params.append('search', search);

      const res = await fetch(`${apiUrl}/bed-bookings?${params.toString()}`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch (e) {
      console.error('Failed to fetch bookings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch(`${apiUrl}/facilities`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFacilities(data);
      })
      .catch(() => {});
  }, [apiUrl]);

  useEffect(() => {
    fetchBookings();
  }, [selectedFacility, selectedStatus, selectedBedType, search]);

  const loadAvailableBedsForFacility = async (facilityId: string) => {
    try {
      const res = await fetch(`${apiUrl}/beds?facilityId=${facilityId}&status=AVAILABLE`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (Array.isArray(data)) setAvailableBeds(data);
    } catch (e) {
      console.error('Failed to fetch available beds:', e);
    }
  };

  const handleStatusUpdate = async (id: string, status: string, notes?: string) => {
    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch(`${apiUrl}/bed-bookings/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Status update failed');
      setActionSuccess(`Booking updated to ${status}!`);
      fetchBookings();
    } catch (err: any) {
      setActionError(err.message || 'Error updating status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAllocateBed = async () => {
    if (!allocateModalBooking) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      const res = await fetch(`${apiUrl}/bed-bookings/${allocateModalBooking.id}/allocate-bed`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          bedId: selectedBedId || undefined,
          notes: allocationNotes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Allocation failed');
      setActionSuccess(`Bed allocated successfully! Booking status updated to APPROVED.`);
      setAllocateModalBooking(null);
      setSelectedBedId('');
      setAllocationNotes('');
      fetchBookings();
    } catch (err: any) {
      setActionError(err.message || 'Error allocating bed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertToAdmission = async () => {
    if (!admitModalBooking) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      const res = await fetch(`${apiUrl}/bed-bookings/${admitModalBooking.id}/convert-to-admission`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          reason: admissionReason || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Admission conversion failed');
      setActionSuccess(
        `Patient successfully admitted! Inpatient Admission #${data.admission?.admissionNumber} created.`
      );
      setAdmitModalBooking(null);
      setAdmissionReason('');
      fetchBookings();
    } catch (err: any) {
      setActionError(err.message || 'Error converting to admission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: BedBookingStatus) => {
    switch (status) {
      case BedBookingStatus.PENDING:
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case BedBookingStatus.APPROVED:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case BedBookingStatus.ADMITTED:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case BedBookingStatus.REJECTED:
      case BedBookingStatus.CANCELLED:
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-extrabold text-slate-900 tracking-tight">MediNexa</span>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                  Pre-Admission Desk
                </span>
              </div>
            </div>

            <nav className="hidden md:flex space-x-1 text-sm">
              <Link href="/dashboard" className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium">
                Overview
              </Link>
              <Link href="/dashboard/hospital/beds" className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium">
                Live Bed Engine
              </Link>
              <Link href="/dashboard/nearby-hospitals" className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium">
                Nearby Hospitals
              </Link>
              <Link href="/dashboard/bed-bookings" className="px-3 py-1.5 rounded-lg text-sky-600 bg-sky-50 font-bold">
                Booking Queue
              </Link>
              <Link href="/dashboard/ai/occupancy-forecast" className="px-3 py-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> AI Forecast
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/bed-booking"
              target="_blank"
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Bed className="w-3.5 h-3.5" /> New Patient Booking ↗
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Patient Bed Booking & Pre-Admission Queue
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Review patient intake requests, auto-allocate beds, manage holds, and convert reservations to active hospital admissions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleProcessExpirations}
              disabled={isSubmitting}
              className="px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Sweep expired reservations and release beds"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} /> Sweep Expired Holds
            </button>
            <button
              onClick={fetchBookings}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
            </button>
          </div>
        </div>

        {/* Alerts */}
        {actionSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-xs font-bold text-emerald-700">Dismiss</button>
          </div>
        )}
        {actionError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-900 text-sm font-semibold rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-xs font-bold text-rose-700">Dismiss</button>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative min-w-[200px] max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patient, phone, booking ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              <option value="">All Facilities</option>
              {facilities.map((fac) => (
                <option key={fac.id} value={fac.id}>{fac.name}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved / Reserved</option>
              <option value="ADMITTED">Admitted to Hospital</option>
              <option value="EXPIRED">Hold Expired</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={selectedBedType}
              onChange={(e) => setSelectedBedType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              <option value="">All Bed Types</option>
              <option value="GENERAL">General Beds</option>
              <option value="ICU">ICU Beds</option>
              <option value="OXYGEN">Oxygen Beds</option>
              <option value="VENTILATOR">Ventilator Beds</option>
              <option value="EMERGENCY">Emergency Beds</option>
              <option value="PRIVATE">Private Rooms</option>
            </select>
          </div>
        </div>

        {/* Bookings Queue Table */}
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-bold">Loading booking requests...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
              <Bed className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No booking requests found</h3>
              <p className="text-xs text-slate-500 mt-1">All pre-admission queues are clear.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="py-3.5 px-4">Booking #</th>
                    <th className="py-3.5 px-4">Patient Details</th>
                    <th className="py-3.5 px-4">Bed Type & Facility</th>
                    <th className="py-3.5 px-4">Clinical Request</th>
                    <th className="py-3.5 px-4">Allocated Bed</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {b.bookingNumber}
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{b.patientName}</p>
                        <p className="text-[11px] text-slate-500">{b.patientPhone}</p>
                        {b.patientEmail && <p className="text-[10px] text-slate-400">{b.patientEmail}</p>}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-extrabold text-[10px] text-slate-700">
                          {b.bedType}
                        </span>
                        <p className="text-[11px] text-slate-500 font-medium mt-1 truncate max-w-[160px]">
                          {b.facility?.name}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 max-w-[200px]">
                        <p className="font-medium text-slate-800 truncate" title={b.chiefComplaint || ''}>
                          {b.chiefComplaint || 'Routine pre-admission'}
                        </p>
                        {b.medicalCondition && (
                          <p className="text-[10px] text-slate-500 truncate" title={b.medicalCondition}>
                            Condition: {b.medicalCondition}
                          </p>
                        )}
                        <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          Priority: {b.priority}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {b.allocatedBed ? (
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                            <p className="font-black text-slate-900">{b.allocatedBed.bedNumber}</p>
                            <p className="text-[10px] text-slate-500">
                              {b.allocatedBed.ward?.name} • Room {b.allocatedBed.room?.roomNumber}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Not Allocated Yet</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusBadge(
                            b.status
                          )}`}
                        >
                          {b.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* If PENDING: Approve or Allocate */}
                          {b.status === BedBookingStatus.PENDING && (
                            <>
                              <button
                                onClick={() => {
                                  setAllocateModalBooking(b);
                                  loadAvailableBedsForFacility(b.facilityId);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors"
                              >
                                Allocate Bed
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(b.id, 'REJECTED', 'Bed capacity unavailable')}
                                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {/* If APPROVED: Convert to Inpatient Admission */}
                          {b.status === BedBookingStatus.APPROVED && (
                            <button
                              onClick={() => setAdmitModalBooking(b)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Convert to Admission
                            </button>
                          )}

                          {/* If ADMITTED: Show Admission Link */}
                          {b.status === BedBookingStatus.ADMITTED && (
                            <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Checked In
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ALLOCATE BED MODAL */}
      {allocateModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Allocate Bed for #{allocateModalBooking.bookingNumber}
              </h3>
              <button onClick={() => setAllocateModalBooking(null)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3 rounded-2xl bg-sky-50 text-xs text-sky-900">
                <p className="font-bold">Requested Bed Type: {allocateModalBooking.bedType}</p>
                <p className="text-[11px] text-sky-700 mt-0.5">
                  Patient: {allocateModalBooking.patientName} ({allocateModalBooking.patientPhone})
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Choose Available Bed (or leave empty for AI auto-allocation)
                </label>
                <select
                  value={selectedBedId}
                  onChange={(e) => setSelectedBedId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="">⚡ Auto-Allocate First Matching Available Bed</option>
                  {availableBeds.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bedNumber} ({b.bedType}) - {b.ward?.name || 'Ward'} Room {b.room?.roomNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reservation Notes</label>
                <input
                  type="text"
                  value={allocationNotes}
                  onChange={(e) => setAllocationNotes(e.target.value)}
                  placeholder="e.g., Hold bed until 3 PM today..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setAllocateModalBooking(null)} className="px-4 py-2 text-xs font-bold text-slate-600">
                Cancel
              </button>
              <button
                onClick={handleAllocateBed}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700"
              >
                {isSubmitting ? 'Allocating...' : 'Confirm Allocation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONVERT TO ADMISSION MODAL */}
      {admitModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Admit Patient: {admitModalBooking.patientName}
              </h3>
              <button onClick={() => setAdmitModalBooking(null)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-xs text-emerald-900">
                <p className="font-bold">Allocated Bed: {admitModalBooking.allocatedBed?.bedNumber}</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Pre-Admission hold confirmed. Executing this step marks the bed OCCUPIED and registers an official Inpatient Admission stay.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admission Diagnosis / Intake Notes</label>
                <textarea
                  rows={3}
                  value={admissionReason}
                  onChange={(e) => setAdmissionReason(e.target.value)}
                  placeholder="Primary clinical intake notes, admitting physician instructions..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setAdmitModalBooking(null)} className="px-4 py-2 text-xs font-bold text-slate-600">
                Cancel
              </button>
              <button
                onClick={handleConvertToAdmission}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {isSubmitting ? 'Admitting...' : 'Complete Inpatient Admission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
