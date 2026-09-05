'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  X,
  Filter,
  RefreshCw,
  Phone,
  Building,
  Bed,
} from 'lucide-react';

interface Facility {
  id: string;
  name: string;
  code: string;
}

interface Doctor {
  id: string;
  departmentId?: string;
  department?: { id: string; name: string };
  user: { firstName: string; lastName: string; email?: string };
  specialty?: { name: string };
}

interface Patient {
  id: string;
  user?: { firstName: string; lastName: string; phone?: string; email?: string };
  phone?: string;
}

interface Slot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

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
  patientId: string;
  doctor: { id: string; user: { firstName: string; lastName: string } };
  patient: { id: string; user: { firstName: string; lastName: string; phone?: string; email?: string } };
  facility?: { id: string; name: string };
  department?: { name: string };
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Create Appointment Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [type, setType] = useState('CONSULTATION');
  const [reason, setReason] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Modify Appointment Modal State
  const [modifyModalAppt, setModifyModalAppt] = useState<Appointment | null>(null);
  const [modifyDoctorId, setModifyDoctorId] = useState('');
  const [modifyDate, setModifyDate] = useState('');
  const [modifySlots, setModifySlots] = useState<string[]>([]);
  const [loadingModifySlots, setLoadingModifySlots] = useState(false);
  const [modifySlot, setModifySlot] = useState('');
  const [modifyStatus, setModifyStatus] = useState('');
  const [modifyReason, setModifyReason] = useState('');
  const [modifyLoading, setModifyLoading] = useState(false);
  const [modifyError, setModifyError] = useState<string | null>(null);

  // Cancel Modal State
  const [cancelModalAppt, setCancelModalAppt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    apiFetch('/auth/me').then((meRes) => {
      if (meRes.ok && meRes.data) {
        setUser(meRes.data);
        const role = meRes.data.roleCode || meRes.data.role?.code;
        if (role === 'PATIENT') {
          router.replace('/portal/appointments');
          return;
        }
      }
      fetchAllData();
    });
  }, [router]);

  async function fetchAllData() {
    setLoading(true);
    try {
      const [apptsRes, docsRes, patsRes] = await Promise.all([
        apiFetch('/appointments'),
        apiFetch('/doctors'),
        apiFetch('/patients'),
      ]);

      if (apptsRes.ok && apptsRes.data) setAppointments(apptsRes.data);
      if (docsRes.ok && docsRes.data) setDoctors(docsRes.data);
      if (patsRes.ok && patsRes.data) setPatientsList(patsRes.data);
    } catch (err: any) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  }

  // Fetch Slots for Create Modal
  async function fetchSlots(doctorId: string, date: string) {
    if (!doctorId || !date) return;
    setLoadingSlots(true);
    setSelectedSlot('');
    try {
      const res = await apiFetch<any>(`/doctors/${doctorId}/availability?date=${date}`);
      if (res.ok && res.data && Array.isArray(res.data.availableSlots)) {
        const valid = res.data.availableSlots.filter((s: any) => s.available).map((s: any) => s.startTime);
        setAvailableSlots(valid.length > 0 ? valid : ['09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00']);
      } else {
        setAvailableSlots(['09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00']);
      }
    } catch {
      setAvailableSlots(['09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00']);
    } finally {
      setLoadingSlots(false);
    }
  }

  // Fetch Slots for Modify Modal
  async function fetchModifySlots(doctorId: string, date: string) {
    if (!doctorId || !date) return;
    setLoadingModifySlots(true);
    setModifySlot('');
    try {
      const res = await apiFetch<any>(`/doctors/${doctorId}/availability?date=${date}`);
      if (res.ok && res.data && Array.isArray(res.data.availableSlots)) {
        const valid = res.data.availableSlots.filter((s: any) => s.available).map((s: any) => s.startTime);
        setModifySlots(valid.length > 0 ? valid : ['09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00']);
      } else {
        setModifySlots(['09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00']);
      }
    } catch {
      setModifySlots(['09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00']);
    } finally {
      setLoadingModifySlots(false);
    }
  }

  // Handle Create Appointment Submission
  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId || !selectedSlot) {
      setCreateError('Please specify patient, doctor, and an available time slot.');
      return;
    }

    setCreateLoading(true);
    setCreateError(null);

    const parts = selectedSlot.split(':');
    let endMins = parseInt(parts[1] || '0', 10) + 30;
    let endHours = parseInt(parts[0] || '10', 10);
    if (endMins >= 60) {
      endHours += 1;
      endMins -= 60;
    }
    const endTimeStr = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

    const res = await apiFetch('/appointments', {
      method: 'POST',
      body: JSON.stringify({
        patientId: selectedPatientId,
        doctorId: selectedDoctorId,
        appointmentDate: selectedDate,
        startTime: selectedSlot,
        endTime: endTimeStr,
        type,
        reason: reason.trim() || 'Front Desk Appointment Intake',
      }),
    });

    if (res.ok) {
      setCreateModalOpen(false);
      setSelectedPatientId('');
      setSelectedDoctorId('');
      setSelectedSlot('');
      setReason('');
      fetchAllData();
    } else {
      setCreateError(res.message || 'Failed to create appointment.');
    }
    setCreateLoading(false);
  }

  // Open Modify Modal
  function handleOpenModify(appt: Appointment) {
    setModifyModalAppt(appt);
    setModifyDoctorId(appt.doctorId);
    const dateStr = appt.appointmentDate
      ? new Date(appt.appointmentDate).toISOString().split('T')[0]
      : selectedDate;
    setModifyDate(dateStr);
    setModifySlot(appt.startTime);
    setModifyStatus(appt.status);
    setModifyReason(appt.reason || '');
    setModifyError(null);
    fetchModifySlots(appt.doctorId, dateStr);
  }

  // Handle Modify Appointment Submission
  async function handleModifySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!modifyModalAppt) return;

    setModifyLoading(true);
    setModifyError(null);

    const parts = (modifySlot || modifyModalAppt.startTime).split(':');
    let endMins = parseInt(parts[1] || '0', 10) + 30;
    let endHours = parseInt(parts[0] || '10', 10);
    if (endMins >= 60) {
      endHours += 1;
      endMins -= 60;
    }
    const endTimeStr = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

    const res = await apiFetch(`/appointments/${modifyModalAppt.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        doctorId: modifyDoctorId,
        appointmentDate: modifyDate,
        startTime: modifySlot || modifyModalAppt.startTime,
        endTime: endTimeStr,
        status: modifyStatus,
        reason: modifyReason,
      }),
    });

    if (res.ok) {
      setModifyModalAppt(null);
      fetchAllData();
    } else {
      setModifyError(res.message || 'Failed to modify appointment.');
    }
    setModifyLoading(false);
  }

  // Handle Cancel Submission
  async function handleCancelSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cancelModalAppt) return;
    setCancelLoading(true);

    const res = await apiFetch(`/appointments/${cancelModalAppt.id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason: cancelReason.trim() || 'Cancelled by Front Desk Receptionist' }),
    });

    if (res.ok) {
      setCancelModalAppt(null);
      setCancelReason('');
      fetchAllData();
    } else {
      alert(res.message || 'Failed to cancel appointment.');
    }
    setCancelLoading(false);
  }

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      const patientName = `${appt.patient?.user?.firstName || ''} ${appt.patient?.user?.lastName || ''}`.toLowerCase();
      const doctorName = `${appt.doctor?.user?.firstName || ''} ${appt.doctor?.user?.lastName || ''}`.toLowerCase();
      const apptNum = (appt.appointmentNumber || '').toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesQuery = !q || patientName.includes(q) || doctorName.includes(q) || apptNum.includes(q);
      const matchesStatus = statusFilter === 'ALL' || appt.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [appointments, searchQuery, statusFilter]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Confirmed</span>;
      case 'REQUESTED':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Requested</span>;
      case 'CHECKED_IN':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">Checked In</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse">In Progress</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
      case 'RESCHEDULED':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">Rescheduled</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Appointment Booking & Front Desk Scheduling
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Intake patient appointments, manage doctor OPD slots, modify schedules, and update attendance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAllData}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition"
            title="Refresh Appointments"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/dashboard/hospital/beds"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <Bed className="w-4 h-4 text-sky-600" />
            <span>Live Beds</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              setCreateError(null);
              setCreateModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Appointment</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient, doctor, or appt #..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {['ALL', 'REQUESTED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-400">
            Loading appointments...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No appointments found matching current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold">
                  <th className="px-4 py-3">Appt #</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Date & Slot</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{appt.appointmentNumber}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      <div>{appt.patient?.user?.firstName} {appt.patient?.user?.lastName}</div>
                      {appt.patient?.user?.phone && (
                        <div className="text-[10px] text-slate-400 font-normal">{appt.patient.user.phone}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                      Dr. {appt.doctor?.user?.firstName} {appt.doctor?.user?.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      📅 {new Date(appt.appointmentDate).toLocaleDateString()} <br />
                      ⏰ {appt.startTime} - {appt.endTime}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">{appt.type}</td>
                    <td className="px-4 py-3 text-slate-500 italic max-w-xs truncate">{appt.reason}</td>
                    <td className="px-4 py-3">{renderStatusBadge(appt.status)}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleOpenModify(appt)}
                        className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 font-bold rounded-xl text-xs transition cursor-pointer"
                      >
                        Modify
                      </button>
                      {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                        <button
                          type="button"
                          onClick={() => {
                            setCancelModalAppt(appt);
                            setCancelReason('');
                          }}
                          className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold rounded-xl text-xs transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CREATE APPOINTMENT MODAL (RECEPTIONIST) */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Create Patient Appointment
                </h3>
                <p className="text-xs text-slate-500">
                  Front desk appointment intake and OPD slot reservation
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs rounded-xl font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Patient Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Patient <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="">Select Patient...</option>
                  {patientsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.firstName} {p.user?.lastName} ({p.user?.phone || 'No phone'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Doctor & Specialty <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedDoctorId}
                  onChange={(e) => {
                    setSelectedDoctorId(e.target.value);
                    fetchSlots(e.target.value, selectedDate);
                  }}
                  className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="">Select Doctor...</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.user?.firstName} {d.user?.lastName} — {d.specialty?.name || d.department?.name || 'Specialist'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Appointment Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    if (selectedDoctorId) fetchSlots(selectedDoctorId, e.target.value);
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              {/* Time Slots */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Available Time Slot <span className="text-rose-500">*</span>
                  </label>
                  {loadingSlots && <span className="text-[10px] text-blue-500 animate-pulse">Loading slots...</span>}
                </div>
                <div className="mt-1.5 grid grid-cols-4 gap-2 max-h-32 overflow-y-auto p-1">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                        selectedSlot === slot
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Consultation Type & Reason */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="CONSULTATION">Consultation</option>
                    <option value="FOLLOW_UP">Follow-up</option>
                    <option value="EMERGENCY">Emergency</option>
                    <option value="PROCEDURE">Procedure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Reason
                  </label>
                  <input
                    type="text"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Chest discomfort, OPD checkup..."
                    className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={createLoading || !selectedSlot}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer shadow-sm shadow-blue-600/20"
                >
                  {createLoading ? 'Booking Appointment...' : `Book Appointment (${selectedSlot || 'Select Slot'})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODIFY APPOINTMENT MODAL (RECEPTIONIST) */}
      {/* ========================================================================= */}
      {modifyModalAppt && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Modify Appointment
                </h3>
                <p className="text-xs text-slate-500">
                  {modifyModalAppt.appointmentNumber} • Patient: {modifyModalAppt.patient?.user?.firstName} {modifyModalAppt.patient?.user?.lastName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModifyModalAppt(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modifyError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs rounded-xl font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modifyError}</span>
              </div>
            )}

            <form onSubmit={handleModifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Assigned Doctor
                </label>
                <select
                  value={modifyDoctorId}
                  onChange={(e) => {
                    setModifyDoctorId(e.target.value);
                    fetchModifySlots(e.target.value, modifyDate);
                  }}
                  className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.user?.firstName} {d.user?.lastName} ({d.specialty?.name || d.department?.name || 'Physician'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Consultation Date
                </label>
                <input
                  type="date"
                  value={modifyDate}
                  onChange={(e) => {
                    setModifyDate(e.target.value);
                    fetchModifySlots(modifyDoctorId, e.target.value);
                  }}
                  className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Available Slots
                </label>
                <div className="mt-1.5 grid grid-cols-4 gap-2 max-h-32 overflow-y-auto p-1">
                  {modifySlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setModifySlot(slot)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                        modifySlot === slot
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Status
                  </label>
                  <select
                    value={modifyStatus}
                    onChange={(e) => setModifyStatus(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                  >
                    <option value="REQUESTED">REQUESTED</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="CHECKED_IN">CHECKED_IN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="RESCHEDULED">RESCHEDULED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Reason
                  </label>
                  <input
                    type="text"
                    value={modifyReason}
                    onChange={(e) => setModifyReason(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={modifyLoading}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer shadow-sm shadow-blue-600/20"
                >
                  {modifyLoading ? 'Saving Changes...' : 'Save Modified Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CANCEL MODAL */}
      {/* ========================================================================= */}
      {cancelModalAppt && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Cancel Appointment
                </h3>
                <p className="text-xs text-slate-500">
                  {cancelModalAppt.appointmentNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalAppt(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Cancellation Reason
                </label>
                <input
                  type="text"
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Patient called to cancel, physician emergency..."
                  className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCancelModalAppt(null)}
                  className="flex-1 py-2 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                >
                  Keep
                </button>
                <button
                  type="submit"
                  disabled={cancelLoading}
                  className="flex-1 py-2 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition"
                >
                  {cancelLoading ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
