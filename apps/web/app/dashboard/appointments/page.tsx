'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';

import { RoleCode } from '@medinexa/types';

interface Facility { id: string; name: string; code: string; }
interface Doctor { id: string; user: { firstName: string; lastName: string }; specialty?: { name: string } }
interface Slot { date: string; startTime: string; endTime: string; available: boolean }
interface Appointment {
  id: string;
  appointmentNumber: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  reason: string;
  cancellationReason?: string;
  doctorId: string;
  doctor: { id: string; user: { firstName: string; lastName: string } };
  facility: { name: string };
  department: { name: string };
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Booking Form State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [reason, setReason] = useState('');
  const [type, setType] = useState('CONSULTATION');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Cancel Modal State
  const [cancelModalAppt, setCancelModalAppt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Reschedule Modal State
  const [rescheduleModalAppt, setRescheduleModalAppt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [rescheduleSlots, setRescheduleSlots] = useState<Slot[]>([]);
  const [rescheduleSelectedSlot, setRescheduleSelectedSlot] = useState<Slot | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  useEffect(() => {
    apiFetch('/auth/me').then((meRes) => {
      let role = 'PATIENT';
      if (meRes.ok && meRes.data) {
        setUser(meRes.data);
        role = meRes.data.roleCode || meRes.data.role?.code || 'PATIENT';
        setUserRole(role);
        if (role === 'DOCTOR') {
          router.replace('/dashboard/doctor-appointments');
          return;
        }
        if (role === 'NURSE') {
          router.replace('/dashboard/admissions');
          return;
        }
      }
      fetchInitialData(role);
    });
  }, []);

  async function fetchInitialData(role?: string) {
    try {
      const isStaffOrAdmin = role && role !== 'PATIENT';
      const apptsEndpoint = isStaffOrAdmin ? '/appointments' : '/patients/me/appointments';

      const [apptsRes, facsRes, docsRes, patsRes] = await Promise.all([
        apiFetch(apptsEndpoint),
        apiFetch('/facilities'),
        apiFetch('/doctors'),
        isStaffOrAdmin ? apiFetch('/patients') : Promise.resolve({ ok: true, data: [] }),
      ]);

      if (apptsRes.ok && apptsRes.data) setAppointments(apptsRes.data);
      if (facsRes.ok && facsRes.data) setFacilities(facsRes.data);
      if (docsRes.ok && docsRes.data) setDoctors(docsRes.data);
      if (patsRes.ok && patsRes.data) setPatientsList(patsRes.data);
    } catch (err: any) {
      console.error('Failed to load initial appointment data:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatDoctorName(firstName?: string, lastName?: string) {
    if (!firstName && !lastName) return 'Doctor';
    const cleanFirst = (firstName || '').replace(/^Dr\.?\s*/i, '').trim();
    return `Dr. ${cleanFirst} ${lastName || ''}`.trim();
  }

  async function checkAvailability(doctorId: string, date: string, isReschedule = false) {
    if (!doctorId || !date) return;
    try {
      const res = await apiFetch(`/doctors/${doctorId}/availability?date=${date}`);
      if (res.ok && res.data) {
        if (isReschedule) {
          setRescheduleSlots(res.data);
        } else {
          setSlots(res.data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleBookAppointment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDoctor || !selectedFacility || !selectedSlot || !reason) {
      setError('Please select a doctor, facility, date, slot, and enter a reason');
      return;
    }

    setBookingLoading(true);
    setError('');
    setSuccess('');

    try {
      const userRes = await apiFetch('/auth/me');
      const user = userRes.data;

      const doc = doctors.find((d) => d.id === selectedDoctor);

      const res = await apiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          patientId: selectedPatientId || user?.patientProfile?.id || undefined,
          doctorId: selectedDoctor,
          facilityId: selectedFacility,
          departmentId: doc?.departmentId || doc?.department?.id || undefined,
          appointmentDate: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          type,
          reason,
        }),
      });

      if (!res.ok) {
        throw new Error(res.data?.message || 'Failed to book appointment');
      }

      setSuccess('Appointment booked successfully!');
      setSelectedDoctor('');
      setSelectedSlot(null);
      setReason('');
      fetchInitialData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBookingLoading(false);
    }
  }

  async function handleConfirmCancel() {
    if (!cancelModalAppt) return;
    setCancelLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await apiFetch(`/appointments/${cancelModalAppt.id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: cancelReason || 'Cancelled by patient' }),
      });

      if (!res.ok) {
        throw new Error(res.data?.message || 'Failed to cancel appointment');
      }

      setSuccess(`Appointment ${cancelModalAppt.appointmentNumber} has been cancelled.`);
      setCancelModalAppt(null);
      setCancelReason('');
      fetchInitialData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleConfirmReschedule(e: React.FormEvent) {
    e.preventDefault();
    if (!rescheduleModalAppt || !rescheduleSelectedSlot) {
      setError('Please select a new available time slot for rescheduling.');
      return;
    }

    setRescheduleLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await apiFetch(`/appointments/${rescheduleModalAppt.id}/reschedule`, {
        method: 'POST',
        body: JSON.stringify({
          appointmentDate: rescheduleDate,
          startTime: rescheduleSelectedSlot.startTime,
          endTime: rescheduleSelectedSlot.endTime,
          reason: rescheduleReason || 'Rescheduled by patient',
        }),
      });

      if (!res.ok) {
        throw new Error(res.data?.message || 'Failed to reschedule appointment');
      }

      setSuccess(`Appointment ${rescheduleModalAppt.appointmentNumber} rescheduled to ${rescheduleDate} at ${rescheduleSelectedSlot.startTime}!`);
      setRescheduleModalAppt(null);
      setRescheduleSelectedSlot(null);
      setRescheduleReason('');
      fetchInitialData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRescheduleLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Appointments...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patient Appointment Center</h1>
        <p className="text-gray-600">Schedule, view, reschedule, or cancel your healthcare consultations</p>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">{error}</div>}
      {success && <div className="p-4 bg-green-50 text-green-700 rounded-md border border-green-200">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Book New Appointment</h2>
          <form onSubmit={handleBookAppointment} className="space-y-4">
            {userRole !== 'PATIENT' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Select Patient *</label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  required
                >
                  <option value="">-- Select Registered Patient --</option>
                  {patientsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.firstName} {p.user?.lastName} ({p.user?.email || p.phone || 'Patient'})
                    </option>
                  ))}
                </select>
              </div>
            )}
            {(userRole === 'MEDINEXA_ADMIN' || userRole === RoleCode.MEDINEXA_ADMIN) && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Select Facility</label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  value={selectedFacility}
                  onChange={(e) => setSelectedFacility(e.target.value)}
                  required
                >
                  <option value="">-- Choose Facility --</option>
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Select Doctor</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                value={selectedDoctor}
                onChange={(e) => {
                  setSelectedDoctor(e.target.value);
                  setSelectedSlot(null);
                  checkAvailability(e.target.value, selectedDate);
                }}
                required
              >
                <option value="">-- Choose Doctor --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {formatDoctorName(d.user.firstName, d.user.lastName)} ({d.specialty?.name || 'General Practitioner'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Appointment Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  if (selectedDoctor) checkAvailability(selectedDoctor, e.target.value);
                }}
                required
              />
            </div>

            {selectedDoctor && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Available Time Slots</label>
                {slots.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No available slots configured for this date.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={!s.available}
                        onClick={() => setSelectedSlot(s)}
                        className={`p-2 text-xs rounded border transition-colors ${
                          selectedSlot?.startTime === s.startTime
                            ? 'bg-blue-600 text-white border-blue-600 font-bold'
                            : s.available
                            ? 'bg-white text-gray-800 border-gray-300 hover:bg-blue-50'
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        {s.startTime}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Appointment Type</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="CONSULTATION">General Consultation</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="IN_PERSON">In-Person Assessment</option>
                <option value="VIDEO">Video Consultation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Reason for Visit</label>
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                rows={3}
                placeholder="Describe your symptoms or reason for visit..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={bookingLoading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-md shadow-sm disabled:opacity-50"
            >
              {bookingLoading ? 'Booking...' : 'Confirm Appointment Booking'}
            </button>
          </form>
        </div>

        {/* Appointments Roster */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Your Appointment Roster</h2>
          {appointments.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No appointments scheduled.</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {appointments.map((a) => (
                <div key={a.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900">{a.appointmentNumber}</span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        a.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        a.status === 'RESCHEDULED' ? 'bg-purple-100 text-purple-800' :
                        a.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-800' :
                        a.status === 'IN_PROGRESS' ? 'bg-teal-100 text-teal-800' :
                        a.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                        a.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {a.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      {formatDoctorName(a.doctor?.user?.firstName, a.doctor?.user?.lastName)} — {a.facility?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      📅 {new Date(a.appointmentDate).toLocaleDateString()} ⏰ {a.startTime} - {a.endTime} | {a.reason}
                    </p>
                    {a.cancellationReason && (
                      <p className="text-xs text-red-600 mt-1 font-semibold">Reason for cancellation: {a.cancellationReason}</p>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 pt-2 md:pt-0">
                    {a.status !== 'COMPLETED' && a.status !== 'CANCELLED' && (
                      <>
                        <button
                          onClick={() => {
                            setRescheduleModalAppt(a);
                            setRescheduleDate(new Date().toISOString().split('T')[0]);
                            setRescheduleSelectedSlot(null);
                            if (a.doctor?.id) {
                              checkAvailability(a.doctor.id, new Date().toISOString().split('T')[0], true);
                            }
                          }}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-md shadow-sm"
                        >
                          📅 Reschedule
                        </button>
                        <button
                          onClick={() => setCancelModalAppt(a)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md shadow-sm"
                        >
                          ❌ Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModalAppt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Cancel Appointment?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel appointment <span className="font-bold text-slate-900">{cancelModalAppt.appointmentNumber}</span> with Dr. {cancelModalAppt.doctor?.user?.firstName} {cancelModalAppt.doctor?.user?.lastName}?
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Reason for Cancellation</label>
              <input
                type="text"
                placeholder="e.g. Schedule conflict, feeling better..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalAppt(null)}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                disabled={cancelLoading}
                onClick={handleConfirmCancel}
                className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalAppt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleConfirmReschedule} className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Reschedule Appointment</h3>
            <p className="text-xs text-slate-600">
              Rescheduling <span className="font-bold text-slate-900">{rescheduleModalAppt.appointmentNumber}</span> with Dr. {rescheduleModalAppt.doctor?.user?.firstName} {rescheduleModalAppt.doctor?.user?.lastName}.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Select New Date *</label>
              <input
                type="date"
                required
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900"
                value={rescheduleDate}
                onChange={(e) => {
                  setRescheduleDate(e.target.value);
                  setRescheduleSelectedSlot(null);
                  if (rescheduleModalAppt.doctor?.id) {
                    checkAvailability(rescheduleModalAppt.doctor.id, e.target.value, true);
                  }
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Select Available Time Slot *</label>
              {rescheduleSlots.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No available slots for this date.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                  {rescheduleSlots.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={!s.available}
                      onClick={() => setRescheduleSelectedSlot(s)}
                      className={`p-2 text-xs rounded-xl border transition-colors ${
                        rescheduleSelectedSlot?.startTime === s.startTime
                          ? 'bg-purple-600 text-white border-purple-600 font-bold'
                          : s.available
                          ? 'bg-white text-slate-800 border-slate-300 hover:bg-purple-50'
                          : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      {s.startTime}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Reason for Rescheduling</label>
              <input
                type="text"
                placeholder="e.g. Work conflict..."
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setRescheduleModalAppt(null)}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={rescheduleLoading || !rescheduleSelectedSlot}
                className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
              >
                {rescheduleLoading ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
