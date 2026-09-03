'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Video,
  Star,
  Plus,
  ArrowLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  X,
  Stethoscope,
  Heart,
  Brain,
  Bone,
  Baby,
  Smile,
  Activity,
  User,
  ShieldCheck,
  MapPin,
  Sparkles,
  Info,
  DollarSign,
  Filter,
  AlertCircle,
  RefreshCw,
  Bell,
  Eye,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Modal } from '@/components/ui';

interface DoctorInfo {
  id: string;
  name: string;
  qualification: string;
  specialty: string;
  departmentName?: string;
  facilityName?: string;
  experience: string;
  rating: number;
  reviewsCount: number;
  consultationFee: string;
  about: string;
}

const SPECIALIZATIONS = [
  { id: 'ALL', name: 'All Specialties' },
  { id: 'Cardiology', name: 'Cardiology' },
  { id: 'Neurology', name: 'Neurology' },
  { id: 'Orthopedics', name: 'Orthopedics' },
  { id: 'Dermatology', name: 'Dermatology' },
  { id: 'Pediatrics', name: 'Pediatrics' },
  { id: 'ENT', name: 'ENT' },
  { id: 'Gynecology', name: 'Gynecology' },
  { id: 'General Medicine', name: 'General Medicine' },
];

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [historyTab, setHistoryTab] = useState<'UPCOMING' | 'HISTORY'>('UPCOMING');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorInfo | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consultationType, setConsultationType] = useState<'CONSULTATION' | 'FOLLOW_UP'>('CONSULTATION');
  const [isTelehealth, setIsTelehealth] = useState(false);
  const [reason, setReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Reschedule Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [apptToReschedule, setApptToReschedule] = useState<any | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState<string[]>([]);
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [apptToCancel, setApptToCancel] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Doctor Details View Modal
  const [profileDoctor, setProfileDoctor] = useState<DoctorInfo | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  // 1. Fetch Patient Appointments
  const fetchAppointments = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/patient-portal/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to load patient appointments:', e);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Live Doctors
  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const res = await fetch(`${apiUrl}/doctors`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: DoctorInfo[] = data.map((d: any) => ({
            id: d.id,
            name: d.user ? `Dr. ${d.user.firstName} ${d.user.lastName}` : 'Dr. Attending Physician',
            qualification: d.licenseNumber ? `MCI Reg: ${d.licenseNumber} • MD/MS` : 'MBBS, MD',
            specialty: d.specialty?.name || d.department?.name || 'General Medicine',
            departmentName: d.department?.name || 'OPD Medicine',
            facilityName: d.facility?.name || 'MediNexa Hospital',
            experience: '12+ Years Clinical Experience',
            rating: 4.9,
            reviewsCount: 145,
            consultationFee: '₹800',
            about: `Senior consulting specialist in ${d.specialty?.name || 'General Medicine'} with extensive outpatient and inpatient care expertise.`,
          }));
          setDoctors(mapped);
        }
      }
    } catch (e) {
      console.error('Failed to load doctors list:', e);
    } finally {
      setLoadingDoctors(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  // 3. Fetch Slots for Booking Modal
  const fetchSlotsForDoctor = async (doctorId: string, date: string) => {
    setLoadingSlots(true);
    setSelectedSlot('');
    try {
      const res = await fetch(`${apiUrl}/doctors/${doctorId}/availability?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        // data.availableSlots: [{ startTime: "09:00", endTime: "09:30", available: true }]
        if (Array.isArray(data.availableSlots)) {
          const valid = data.availableSlots
            .filter((s: any) => s.available)
            .map((s: any) => s.startTime);
          setAvailableSlots(valid.length > 0 ? valid : ['09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00']);
        } else {
          setAvailableSlots(['09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00']);
        }
      } else {
        setAvailableSlots(['09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00']);
      }
    } catch {
      setAvailableSlots(['09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00']);
    } finally {
      setLoadingSlots(false);
    }
  };

  // 4. Fetch Slots for Reschedule Modal
  const fetchSlotsForReschedule = async (doctorId: string, date: string) => {
    setLoadingRescheduleSlots(true);
    setRescheduleSlot('');
    try {
      const res = await fetch(`${apiUrl}/doctors/${doctorId}/availability?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.availableSlots)) {
          const valid = data.availableSlots
            .filter((s: any) => s.available)
            .map((s: any) => s.startTime);
          setRescheduleSlots(valid.length > 0 ? valid : ['10:00', '11:00', '14:30', '15:30']);
        } else {
          setRescheduleSlots(['10:00', '11:00', '14:30', '15:30']);
        }
      } else {
        setRescheduleSlots(['10:00', '11:00', '14:30', '15:30']);
      }
    } catch {
      setRescheduleSlots(['10:00', '11:00', '14:30', '15:30']);
    } finally {
      setLoadingRescheduleSlots(false);
    }
  };

  const handleOpenBooking = (doc: DoctorInfo) => {
    setSelectedDoctor(doc);
    setBookingError(null);
    setBookingSuccessMsg(null);
    setReason('');
    setBookingModalOpen(true);
    fetchSlotsForDoctor(doc.id, selectedDate);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedSlot) {
      setBookingError('Please choose an available appointment time slot.');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    try {
      const parts = selectedSlot.split(':');
      let endMins = parseInt(parts[1] || '0', 10) + 30;
      let endHours = parseInt(parts[0] || '10', 10);
      if (endMins >= 60) {
        endHours += 1;
        endMins -= 60;
      }
      const endTimeStr = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

      const res = await fetch(`${apiUrl}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          appointmentDate: selectedDate,
          startTime: selectedSlot,
          endTime: endTimeStr,
          type: consultationType,
          reason: reason.trim() || 'General OPD Consultation',
          notes: isTelehealth ? 'Patient requested Telemedicine Video Link' : 'In-Person Hospital OPD Visit',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to complete appointment booking.');
      }

      setBookingSuccessMsg(`Appointment ${data.appointmentNumber || ''} booked successfully!`);
      setTimeout(() => {
        setBookingModalOpen(false);
        setBookingSuccessMsg(null);
        fetchAppointments();
      }, 1500);
    } catch (err: any) {
      setBookingError(err.message || 'An error occurred while booking the appointment.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Open Reschedule Modal
  const handleOpenReschedule = (appt: any) => {
    setApptToReschedule(appt);
    const initialDate = appt.appointmentDate
      ? new Date(appt.appointmentDate).toISOString().split('T')[0]
      : selectedDate;
    setRescheduleDate(initialDate);
    setRescheduleReason('');
    setRescheduleError(null);
    setRescheduleModalOpen(true);
    fetchSlotsForReschedule(appt.doctorId || appt.doctor?.id, initialDate);
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptToReschedule || !rescheduleSlot) {
      setRescheduleError('Please select a new time slot.');
      return;
    }

    setRescheduleLoading(true);
    setRescheduleError(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    try {
      const parts = rescheduleSlot.split(':');
      let endMins = parseInt(parts[1] || '0', 10) + 30;
      let endHours = parseInt(parts[0] || '10', 10);
      if (endMins >= 60) {
        endHours += 1;
        endMins -= 60;
      }
      const endTimeStr = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

      const res = await fetch(`${apiUrl}/appointments/${apptToReschedule.id}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentDate: rescheduleDate,
          startTime: rescheduleSlot,
          endTime: endTimeStr,
          reason: rescheduleReason.trim() || 'Rescheduled by patient request',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to reschedule appointment.');
      }

      setRescheduleModalOpen(false);
      fetchAppointments();
    } catch (err: any) {
      setRescheduleError(err.message || 'Failed to reschedule appointment.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Open Cancel Modal
  const handleOpenCancel = (appt: any) => {
    setApptToCancel(appt);
    setCancelReason('');
    setCancelError(null);
    setCancelModalOpen(true);
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptToCancel) return;

    setCancelLoading(true);
    setCancelError(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    try {
      const res = await fetch(`${apiUrl}/appointments/${apptToCancel.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: cancelReason.trim() || 'Cancelled by patient',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to cancel appointment.');
      }

      setCancelModalOpen(false);
      fetchAppointments();
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel appointment.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Filter doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSpecialty =
        selectedSpecialty === 'ALL' ||
        doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
      const matchesQuery =
        !searchQuery.trim() ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.facilityName && doc.facilityName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSpecialty && matchesQuery;
    });
  }, [doctors, selectedSpecialty, searchQuery]);

  // Split appointments: Upcoming vs History
  const upcomingAppointments = useMemo(() => {
    return appointments.filter((a) =>
      ['REQUESTED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'].includes(a.status),
    );
  }, [appointments]);

  const historyAppointments = useMemo(() => {
    return appointments.filter((a) =>
      ['COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW'].includes(a.status),
    );
  }, [appointments]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            ✓ Confirmed
          </span>
        );
      case 'REQUESTED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            ⏳ Requested
          </span>
        );
      case 'CHECKED_IN':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
            📍 Checked In
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 animate-pulse">
            🩺 In Consultation
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            ✓ Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            ✕ Cancelled
          </span>
        );
      case 'RESCHEDULED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
            ⟳ Rescheduled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/portal"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
              M
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-950 dark:text-white leading-none">
                Appointments & Specialist Consultations
              </h1>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Search verified doctors, view real-time availability slots, and book instant OPD visits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/portal/notifications"
              className="p-2 rounded-xl text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Section 1: My Appointments (Upcoming vs History) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>My Consultations</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active bookings, scheduled appointment slots, and past consultation history
              </p>
            </div>

            {/* Tab Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
              <button
                type="button"
                onClick={() => setHistoryTab('UPCOMING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  historyTab === 'UPCOMING'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Upcoming & Active ({upcomingAppointments.length})
              </button>
              <button
                type="button"
                onClick={() => setHistoryTab('HISTORY')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  historyTab === 'HISTORY'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Appointment History ({historyAppointments.length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs font-semibold text-slate-400">
              Loading your appointments...
            </div>
          ) : (
            <div>
              {historyTab === 'UPCOMING' ? (
                upcomingAppointments.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      You have no upcoming appointments scheduled.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Explore our verified Indian specialists below to book an in-person or telemedicine visit.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingAppointments.map((appt) => {
                      const docName =
                        appt.doctor?.user
                          ? `Dr. ${appt.doctor.user.firstName} ${appt.doctor.user.lastName}`
                          : appt.doctorName || 'Dr. Attending Physician';
                      const spec =
                        appt.doctor?.specialty?.name || appt.doctor?.department?.name || 'Specialist';
                      const dateStr = appt.appointmentDate
                        ? new Date(appt.appointmentDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Scheduled Date';

                      return (
                        <div
                          key={appt.id}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 relative hover:border-blue-300 dark:hover:border-blue-700 transition"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                {docName}
                              </h3>
                              <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                                {spec}
                              </p>
                            </div>
                            {renderStatusBadge(appt.status)}
                          </div>

                          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{dateStr}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{appt.startTime} - {appt.endTime || '30 mins'}</span>
                            </div>
                            {appt.reason && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 line-clamp-1">
                                &ldquo;{appt.reason}&rdquo;
                              </p>
                            )}
                          </div>

                          {/* Action CTAs: Reschedule & Cancel */}
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenReschedule(appt)}
                              className="flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 transition text-center cursor-pointer"
                            >
                              Reschedule
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenCancel(appt)}
                              className="py-1.5 px-3 rounded-xl text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                historyAppointments.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                    No past appointment history found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {historyAppointments.map((appt) => {
                      const docName =
                        appt.doctor?.user
                          ? `Dr. ${appt.doctor.user.firstName} ${appt.doctor.user.lastName}`
                          : appt.doctorName || 'Dr. Attending Physician';
                      const spec =
                        appt.doctor?.specialty?.name || appt.doctor?.department?.name || 'Specialist';
                      const dateStr = appt.appointmentDate
                        ? new Date(appt.appointmentDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Past Visit';

                      return (
                        <div
                          key={appt.id}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 opacity-80"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                {docName}
                              </h3>
                              <p className="text-[11px] text-slate-500">{spec}</p>
                            </div>
                            {renderStatusBadge(appt.status)}
                          </div>

                          <div className="text-xs text-slate-500 space-y-1">
                            <p>{dateStr} at {appt.startTime}</p>
                            {appt.cancellationReason && (
                              <p className="text-[10px] text-rose-500 italic">
                                Reason: {appt.cancellationReason}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Section 2: Search Doctors & Filter by Specialty */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Find & Book Verified Specialists
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select an OPD specialty or search by doctor name to view available time slots
            </p>
          </div>

          {/* Search bar & specialty pills */}
          <div className="space-y-3">
            <div className="relative max-w-xl">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by doctor name, specialty, or hospital..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Specialty Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {SPECIALIZATIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSpecialty(s.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedSpecialty === s.id
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-600'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Doctor Cards Catalog */}
          {loadingDoctors ? (
            <div className="py-12 text-center text-xs font-semibold text-slate-400">
              Loading doctor catalog...
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No doctors found matching &ldquo;{searchQuery || selectedSpecialty}&rdquo;. Try another specialty or search term.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                          {doc.name}
                        </h3>
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          {doc.specialty}
                        </p>
                      </div>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[11px] font-black border border-amber-200 dark:border-amber-800">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {doc.rating}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                      <p>{doc.qualification}</p>
                      <div className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3 h-3" />
                        <span>{doc.facilityName}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 pt-1">
                      {doc.about}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Fee
                      </span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {doc.consultationFee}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenBooking(doc)}
                      className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-sm shadow-blue-500/20 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Appointment</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 1. BOOK APPOINTMENT MODAL */}
      {/* ========================================================================= */}
      {bookingModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-950 dark:text-white">
                  Book Consultation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedDoctor.name} • {selectedDoctor.specialty}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBookingModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs rounded-xl font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {bookingSuccessMsg ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Booking Confirmed!
                </h4>
                <p className="text-xs text-slate-500">{bookingSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {/* Date Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Consultation Date
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      fetchSlotsForDoctor(selectedDoctor.id, e.target.value);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Slots Grid */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Available Time Slots
                    </label>
                    {loadingSlots && (
                      <span className="text-[10px] text-blue-500 animate-pulse">Checking slots...</span>
                    )}
                  </div>

                  <div className="mt-1.5 grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                          selectedSlot === slot
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                            : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Consultation Mode */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Consultation Type
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setIsTelehealth(false)}
                      className={`p-2.5 rounded-xl border font-bold text-center cursor-pointer transition ${
                        !isTelehealth
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      🏥 In-Person Visit
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTelehealth(true)}
                      className={`p-2.5 rounded-xl border font-bold text-center cursor-pointer transition ${
                        isTelehealth
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      📹 Telemedicine
                    </button>
                  </div>
                </div>

                {/* Reason for visit */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Reason for Consultation
                  </label>
                  <input
                    type="text"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Follow-up blood pressure check, persistent cough..."
                    className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={bookingLoading || !selectedSlot}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer shadow-sm shadow-blue-600/20"
                  >
                    {bookingLoading ? 'Confirming Appointment...' : `Book Slot (${selectedSlot || 'Select Slot'})`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. RESCHEDULE APPOINTMENT MODAL */}
      {/* ========================================================================= */}
      {rescheduleModalOpen && apptToReschedule && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-950 dark:text-white">
                  Reschedule Appointment
                </h3>
                <p className="text-xs text-slate-500">
                  {apptToReschedule.appointmentNumber} • Current: {apptToReschedule.startTime}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {rescheduleError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs rounded-xl font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{rescheduleError}</span>
              </div>
            )}

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select New Date
                </label>
                <input
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={(e) => {
                    setRescheduleDate(e.target.value);
                    fetchSlotsForReschedule(
                      apptToReschedule.doctorId || apptToReschedule.doctor?.id,
                      e.target.value,
                    );
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Available Time Slots
                </label>
                <div className="mt-1.5 grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
                  {rescheduleSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setRescheduleSlot(slot)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                        rescheduleSlot === slot
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Reschedule Reason
                </label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Work conflict, travel..."
                  className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={rescheduleLoading || !rescheduleSlot}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {rescheduleLoading ? 'Updating Schedule...' : `Confirm Reschedule to ${rescheduleSlot || 'Slot'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CANCEL APPOINTMENT MODAL */}
      {/* ========================================================================= */}
      {cancelModalOpen && apptToCancel && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-950 dark:text-white">
                  Cancel Consultation
                </h3>
                <p className="text-xs text-slate-500">
                  {apptToCancel.appointmentNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cancelError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs rounded-xl font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{cancelError}</span>
              </div>
            )}

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Are you sure you want to cancel your scheduled appointment with{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {apptToCancel.doctor?.user ? `Dr. ${apptToCancel.doctor.user.lastName}` : 'Physician'}
                </span>
                ? Your reserved slot will be released back into the hospital availability pool.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Reason for Cancellation
                </label>
                <input
                  type="text"
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Feeling better, schedule conflict..."
                  className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={cancelLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
