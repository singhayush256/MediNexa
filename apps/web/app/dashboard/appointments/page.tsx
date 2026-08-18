'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api-client';

interface Facility { id: string; name: string; code: string; }
interface Department { id: string; name: string; code: string; }
interface Specialty { id: string; name: string; code: string; }
interface Doctor { id: string; user: { firstName: string; lastName: string }; specialty: { name: string } }
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
  doctor: { user: { firstName: string; lastName: string } };
  facility: { name: string };
  department: { name: string };
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Booking Form State
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [reason, setReason] = useState('');
  const [type, setType] = useState('CONSULTATION');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      const [apptsRes, facsRes, docsRes] = await Promise.all([
        apiFetch('/patients/me/appointments'),
        apiFetch('/facilities'),
        apiFetch('/doctors'),
      ]);

      if (apptsRes.ok && apptsRes.data) setAppointments(apptsRes.data);
      if (facsRes.ok && facsRes.data) setFacilities(facsRes.data);
      if (docsRes.ok && docsRes.data) setDoctors(docsRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointment data');
    } finally {
      setLoading(false);
    }
  }

  async function checkAvailability(doctorId: string, date: string) {
    if (!doctorId || !date) return;
    try {
      const res = await apiFetch(`/doctors/${doctorId}/availability?date=${date}`);
      if (res.ok && res.data) {
        setSlots(res.data);
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

    const docObj = doctors.find((d) => d.id === selectedDoctor);
    if (!docObj) return;

    setBookingLoading(true);
    setError('');
    setSuccess('');

    try {
      const userRes = await apiFetch('/auth/me');
      const user = userRes.data;

      const res = await apiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          patientId: user?.patientProfile?.id,
          doctorId: selectedDoctor,
          facilityId: selectedFacility,
          departmentId: (docObj as any).departmentId || (facilities[0] as any)?.departments?.[0]?.id,
          appointmentDate: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          type,
          reason,
        }),
      });

      if (!res.ok) {
        throw new Error(res.message || 'Failed to book appointment');
      }

      setSuccess('Appointment booked successfully!');
      setReason('');
      setSelectedSlot(null);
      fetchInitialData();
    } catch (err: any) {
      setError(err.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  }

  async function handleAction(id: string, action: 'cancel' | 'check-in') {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/appointments/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: action === 'cancel' ? JSON.stringify({ reason: 'Patient cancelled' }) : undefined,
      });

      if (res.ok) {
        fetchInitialData();
      } else {
        const data = await res.json();
        alert(data.message || `Failed to ${action} appointment`);
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Appointments...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patient Appointment Center</h1>
        <p className="text-gray-600">Schedule, view, check-in, or manage your healthcare consultations</p>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">{error}</div>}
      {success && <div className="p-4 bg-green-50 text-green-700 rounded-md border border-green-200">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Book New Appointment</h2>
          <form onSubmit={handleBookAppointment} className="space-y-4">
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

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Select Doctor</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                value={selectedDoctor}
                onChange={(e) => {
                  setSelectedDoctor(e.target.value);
                  checkAvailability(e.target.value, selectedDate);
                }}
                required
              >
                <option value="">-- Choose Doctor --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>Dr. {d.user?.firstName} {d.user?.lastName} ({d.specialty?.name || 'General'})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Date</label>
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
                            ? 'bg-blue-600 text-white border-blue-600'
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
                        a.status === 'CHECKED_IN' ? 'bg-purple-100 text-purple-800' :
                        a.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        a.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                        a.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {a.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      Dr. {a.doctor?.user?.firstName} {a.doctor?.user?.lastName} — {a.facility?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      📅 {new Date(a.appointmentDate).toLocaleDateString()} ⏰ {a.startTime} - {a.endTime} | {a.reason}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {a.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleAction(a.id, 'check-in')}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-md"
                      >
                        Check-in
                      </button>
                    )}
                    {a.status !== 'COMPLETED' && a.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleAction(a.id, 'cancel')}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
