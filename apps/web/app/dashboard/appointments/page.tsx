'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';
import {
  LayoutDashboard,
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
  LogOut,
  Sparkles,
  Ticket,
  Users,
  FileCheck,
  CreditCard,
  Activity,
  ArrowRight,
  ShieldCheck,
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
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'APPOINTMENTS' | 'TOKENS' | 'ADMISSIONS' | 'BILLING'>('APPOINTMENTS');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

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
  const [isEmergency, setIsEmergency] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PENDING'>('PAID');
  const [alternateDoctors, setAlternateDoctors] = useState<any[]>([]);
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
  const [cancelRefundInfo, setCancelRefundInfo] = useState<{
    hoursRemaining: number;
    eligibleForFullRefund: boolean;
    refundAmount: number;
    ruleText: string;
  } | null>(null);

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

  const DEMO_APPOINTMENTS: Appointment[] = [
    {
      id: 'appt-demo-1',
      appointmentNumber: 'APT-IND-100848',
      appointmentDate: '2026-10-28',
      startTime: '12:30',
      endTime: '13:00',
      type: 'CONSULTATION',
      status: 'CONFIRMED',
      reason: 'Post-viral Acute Fatigue, Upper Respiratory Infection Follow-up',
      doctorId: 'doc-sandeep',
      patientId: 'pat-10',
      doctor: { id: 'doc-sandeep', user: { firstName: 'Dr. Sandeep', lastName: 'Vashisht' } },
      patient: { id: 'pat-10', user: { firstName: 'Patient10', lastName: 'Beta', phone: '+91 98100 12345' } },
      facility: { id: 'fac-1', name: 'MediNexa Super Speciality Hospital' },
      department: { name: 'Internal Medicine' },
    },
    {
      id: 'appt-demo-2',
      appointmentNumber: 'APT-IND-100608',
      appointmentDate: '2026-10-28',
      startTime: '12:30',
      endTime: '13:00',
      type: 'CONSULTATION',
      status: 'CONFIRMED',
      reason: 'Post-viral Acute Fatigue, Upper Respiratory Infection Follow-up',
      doctorId: 'doc-suresh',
      patientId: 'pat-karan',
      doctor: { id: 'doc-suresh', user: { firstName: 'Dr. Suresh', lastName: 'Menon' } },
      patient: { id: 'pat-karan', user: { firstName: 'Karan', lastName: 'Das', phone: '+91 98100 03264' } },
      facility: { id: 'fac-1', name: 'MediNexa Super Speciality Hospital' },
      department: { name: 'Cardiology' },
    },
    {
      id: 'appt-demo-3',
      appointmentNumber: 'APT-IND-100368',
      appointmentDate: '2026-10-28',
      startTime: '12:30',
      endTime: '13:00',
      type: 'CONSULTATION',
      status: 'CONFIRMED',
      reason: 'Post-viral Acute Fatigue, Upper Respiratory Infection Follow-up',
      doctorId: 'doc-alok',
      patientId: 'pat-shweta',
      doctor: { id: 'doc-alok', user: { firstName: 'Dr. Alok', lastName: 'Nath' } },
      patient: { id: 'pat-shweta', user: { firstName: 'Shweta', lastName: 'Goel', phone: '+91 98100 07939' } },
      facility: { id: 'fac-1', name: 'MediNexa Super Speciality Hospital' },
      department: { name: 'Pulmonology' },
    },
    {
      id: 'appt-demo-4',
      appointmentNumber: 'APT-IND-100128',
      appointmentDate: '2026-10-28',
      startTime: '12:30',
      endTime: '13:00',
      type: 'CONSULTATION',
      status: 'CONFIRMED',
      reason: 'Post-viral Acute Fatigue, Upper Respiratory Infection Follow-up',
      doctorId: 'doc-abhishek',
      patientId: 'pat-sunita',
      doctor: { id: 'doc-abhishek', user: { firstName: 'Dr. Abhishek', lastName: 'Kumar' } },
      patient: { id: 'pat-sunita', user: { firstName: 'Sunita', lastName: 'Singhal', phone: '+91 98100 07871' } },
      facility: { id: 'fac-1', name: 'MediNexa Super Speciality Hospital' },
      department: { name: 'Endocrinology' },
    },
    {
      id: 'appt-demo-5',
      appointmentNumber: 'APT-IND-100488',
      appointmentDate: '2026-10-28',
      startTime: '16:30',
      endTime: '17:00',
      type: 'CONSULTATION',
      status: 'CONFIRMED',
      reason: 'Post-viral Acute Fatigue, Upper Respiratory Infection Follow-up',
      doctorId: 'doc-ananya',
      patientId: 'pat-bhupesh',
      doctor: { id: 'doc-ananya', user: { firstName: 'Dr. Ananya', lastName: 'Sen' } },
      patient: { id: 'pat-bhupesh', user: { firstName: 'Bhupesh', lastName: 'Grover', phone: '+91 98100 07412' } },
      facility: { id: 'fac-1', name: 'MediNexa Super Speciality Hospital' },
      department: { name: 'Neurology' },
    },
    {
      id: 'appt-demo-6',
      appointmentNumber: 'APT-IND-100728',
      appointmentDate: '2026-10-28',
      startTime: '16:30',
      endTime: '17:00',
      type: 'CONSULTATION',
      status: 'REQUESTED',
      reason: 'Routine health checkup and diabetic neuropathy evaluation',
      doctorId: 'doc-preeti',
      patientId: 'pat-meera',
      doctor: { id: 'doc-preeti', user: { firstName: 'Dr. Preeti', lastName: 'Chadha' } },
      patient: { id: 'pat-meera', user: { firstName: 'Meera', lastName: 'Menon', phone: '+91 98100 01649' } },
      facility: { id: 'fac-1', name: 'MediNexa Super Speciality Hospital' },
      department: { name: 'General Medicine' },
    },
    {
      id: 'appt-demo-7',
      appointmentNumber: 'APT-IND-100968',
      appointmentDate: '2026-10-28',
      startTime: '16:30',
      endTime: '17:00',
      type: 'CONSULTATION',
      status: 'REQUESTED',
      reason: 'Acute joint stiffness and musculoskeletal pain assessment',
      doctorId: 'doc-madhavi',
      patientId: 'pat-arjun',
      doctor: { id: 'doc-madhavi', user: { firstName: 'Dr. Madhavi', lastName: 'Sharma' } },
      patient: { id: 'pat-arjun', user: { firstName: 'Arjun', lastName: 'Roy', phone: '+91 98100 01496' } },
      facility: { id: 'fac-1', name: 'MediNexa Super Speciality Hospital' },
      department: { name: 'Orthopedics' },
    },
  ];

  async function fetchAllData() {
    setLoading(true);
    try {
      const [apptsRes, docsRes, patsRes] = await Promise.all([
        apiFetch('/appointments'),
        apiFetch('/doctors'),
        apiFetch('/patients'),
      ]);

      if (apptsRes.ok && Array.isArray(apptsRes.data) && apptsRes.data.length > 0) {
        setAppointments(apptsRes.data);
      } else {
        setAppointments(DEMO_APPOINTMENTS);
      }

      if (docsRes.ok && docsRes.data) setDoctors(docsRes.data);
      if (patsRes.ok && patsRes.data) setPatientsList(patsRes.data);
    } catch (err: any) {
      console.error('Failed to load appointments, using fallback:', err);
      setAppointments(DEMO_APPOINTMENTS);
    } finally {
      setLoading(false);
    }
  }

  // Format time helper to prevent glitches like 12:60
  const formatTimeDisplay = (timeStr?: string) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let h = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10);
    if (isNaN(h)) return timeStr;
    if (isNaN(m)) m = 0;
    if (m >= 60) {
      h += Math.floor(m / 60);
      m = m % 60;
    }
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Fetch Slots for Create Modal
  async function fetchSlots(doctorId: string, date: string) {
    if (!doctorId || !date) return;
    setLoadingSlots(true);
    setSelectedSlot('');
    try {
      const res = await apiFetch<any>(`/doctors/${doctorId}/availability?date=${date}`);
      if (res.ok && res.data) {
        let valid: string[] = [];
        if (Array.isArray(res.data.availableSlots)) {
          valid = res.data.availableSlots.filter((s: any) => s.available).map((s: any) => s.startTime);
        } else if (Array.isArray(res.data)) {
          valid = res.data.filter((s: any) => s.available).map((s: any) => s.startTime);
        }
        setAvailableSlots(valid);

        if (Array.isArray(res.data.alternateDoctors) && res.data.alternateDoctors.length > 0) {
          setAlternateDoctors(res.data.alternateDoctors);
        } else {
          const curDoc = doctors.find((d) => d.id === doctorId);
          const others = doctors
            .filter((d) => d.id !== doctorId && (curDoc?.specialty?.name ? d.specialty?.name === curDoc.specialty.name : true))
            .slice(0, 3)
            .map((d) => ({
              id: d.id,
              name: `Dr. ${d.user?.firstName} ${d.user?.lastName}`,
              specialty: d.specialty?.name || d.department?.name || 'Physician',
            }));
          setAlternateDoctors(others);
        }
      } else {
        setAvailableSlots(['09:30', '10:00', '10:30', '11:00', '12:30', '14:00', '14:30', '16:30']);
      }
    } catch {
      setAvailableSlots(['09:30', '10:00', '10:30', '11:00', '12:30', '14:00', '14:30', '16:30']);
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
        setModifySlots(valid.length > 0 ? valid : ['09:30', '10:00', '10:30', '11:00', '12:30', '14:00', '14:30', '16:30']);
      } else {
        setModifySlots(['09:30', '10:00', '10:30', '11:00', '12:30', '14:00', '14:30', '16:30']);
      }
    } catch {
      setModifySlots(['09:30', '10:00', '10:30', '11:00', '12:30', '14:00', '14:30', '16:30']);
    } finally {
      setLoadingModifySlots(false);
    }
  }

  // Handle Confirm Appointment
  async function handleConfirmAppointment(apptId: string) {
    setActionLoading(apptId);
    try {
      let res = await apiFetch(`/appointments/${apptId}/confirm`, {
        method: 'POST',
      });
      if (!res.ok) {
        res = await apiFetch(`/appointments/${apptId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'CONFIRMED' }),
        });
      }
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === apptId ? { ...a, status: 'CONFIRMED' } : a))
        );
        setSuccessToast('Appointment confirmed successfully! Notification sent to patient ✓');
        setTimeout(() => setSuccessToast(null), 4000);
        fetchAllData();
      } else {
        alert(res.message || 'Failed to confirm appointment');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to confirm appointment');
    } finally {
      setActionLoading(null);
    }
  }

  // Handle Check-in Appointment
  async function handleCheckInAppointment(apptId: string) {
    setActionLoading(apptId);
    try {
      let res = await apiFetch(`/appointments/${apptId}/check-in`, {
        method: 'POST',
      });
      if (!res.ok) {
        res = await apiFetch(`/appointments/${apptId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'CHECKED_IN' }),
        });
      }
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === apptId ? { ...a, status: 'CHECKED_IN' } : a))
        );
        setSuccessToast('Patient checked in for doctor OPD queue ✓');
        setTimeout(() => setSuccessToast(null), 4000);
        fetchAllData();
      } else {
        alert(res.message || 'Failed to check in appointment');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to check in appointment');
    } finally {
      setActionLoading(null);
    }
  }

  // Handle Create Appointment Submission
  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId || (!selectedSlot && !isEmergency)) {
      setCreateError('Please specify patient, doctor, and an available time slot.');
      return;
    }

    setCreateLoading(true);
    setCreateError(null);

    const slotToUse = selectedSlot || '09:30';
    const parts = slotToUse.split(':');
    let endMins = parseInt(parts[1] || '0', 10) + 30;
    let endHours = parseInt(parts[0] || '10', 10);
    if (endMins >= 60) {
      endHours += 1;
      endMins -= 60;
    }
    const endTimeStr = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
    const apptType = isEmergency ? 'EMERGENCY' : type;
    const feeTag = ` [CONSULTATION FEE: ₹800 - ${paymentStatus === 'PAID' ? 'PAID at Reception Desk' : 'PENDING'}]`;
    const emergencyTag = isEmergency ? ' [HIGH PRIORITY EMERGENCY OPD]' : '';
    const fullNotes = `Reception Intake${emergencyTag}${feeTag}`;

    const res = await apiFetch('/appointments', {
      method: 'POST',
      body: JSON.stringify({
        patientId: selectedPatientId,
        doctorId: selectedDoctorId,
        appointmentDate: selectedDate,
        startTime: slotToUse,
        endTime: endTimeStr,
        type: apptType,
        reason: reason.trim() || (isEmergency ? 'Urgent Emergency OPD Intake' : 'Front Desk Appointment Intake'),
        notes: fullNotes,
      }),
    });

    if (res.ok) {
      setCreateModalOpen(false);
      setSelectedPatientId('');
      setSelectedDoctorId('');
      setSelectedSlot('');
      setIsEmergency(false);
      setPaymentStatus('PAID');
      setReason('');
      setSuccessToast('New appointment booked successfully! ✓');
      setTimeout(() => setSuccessToast(null), 4000);
      fetchAllData();
    } else {
      setCreateError(res.message || 'Failed to create appointment.');
    }
    setCreateLoading(false);
  }

  // Open Cancel Modal with Refund Calculation
  function handleOpenCancelModal(appt: Appointment) {
    setCancelModalAppt(appt);
    setCancelReason('');

    const apptDate = new Date(appt.appointmentDate);
    if (appt.startTime) {
      const [h, m] = appt.startTime.split(':').map(Number);
      apptDate.setHours(h || 0, m || 0, 0, 0);
    }
    const diffHours = (apptDate.getTime() - Date.now()) / (1000 * 60 * 60);
    const hoursRemaining = Math.max(0, Math.round(diffHours * 10) / 10);
    const eligible = diffHours >= 2;

    setCancelRefundInfo({
      hoursRemaining,
      eligibleForFullRefund: eligible,
      refundAmount: eligible ? 800 : 0,
      ruleText: eligible
        ? 'Eligible for 100% Full Refund (₹800). Hospital Policy guarantees full refund for cancellations made 2+ hours prior to appointment.'
        : 'Late Cancellation (<2 hours remaining): Hospital Policy applies 0% refund for cancellations within 2 hours of scheduled slot.',
    });
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
      setSuccessToast('Appointment details updated successfully ✓');
      setTimeout(() => setSuccessToast(null), 4000);
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
      setSuccessToast('Appointment cancelled successfully');
      setTimeout(() => setSuccessToast(null), 4000);
      fetchAllData();
    } else {
      alert(res.message || 'Failed to cancel appointment.');
    }
    setCancelLoading(false);
  }

  const handleLogout = () => {
    localStorage.removeItem('medinexa_token');
    localStorage.removeItem('token');
    localStorage.removeItem('medinexa_user');
    sessionStorage.clear();
    router.push('/login');
  };

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
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">Confirmed</span>;
      case 'REQUESTED':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 animate-pulse">Requested</span>;
      case 'CHECKED_IN':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800">Checked In</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800">In Progress</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">Completed</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">Cancelled</span>;
      case 'RESCHEDULED':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800">Rescheduled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300">{status}</span>;
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter((a) => a.status === 'CONFIRMED').length;
    const checkedIn = appointments.filter((a) => a.status === 'CHECKED_IN').length;
    const inProgress = appointments.filter((a) => a.status === 'IN_PROGRESS').length;
    const requested = appointments.filter((a) => a.status === 'REQUESTED').length;
    const completed = appointments.filter((a) => a.status === 'COMPLETED').length;
    return { total, confirmed, checkedIn, inProgress, requested, completed };
  }, [appointments]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 z-20">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <MediNexaLogo size="sm" subtitle="APPOINTMENTS" href="/dashboard" />
        </div>

        {/* Staff Profile Card */}
        <div className="p-3 mx-3 mt-3 rounded-2xl bg-gradient-to-br from-teal-50 to-blue-50 dark:from-slate-800/80 dark:to-slate-800/40 border border-teal-100 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              PS
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-slate-900 dark:text-white truncate">Pooja Singh</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">Front Desk Lead</div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Counter #01 Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="px-3 py-3 flex-1 overflow-y-auto space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">Navigation</div>
          {[
            { id: 'DASHBOARD', label: 'Station Dashboard', icon: LayoutDashboard },
            { id: 'APPOINTMENTS', label: 'Appointment Booking', icon: Calendar, badge: stats.total },
            { id: 'TOKENS', label: 'Live Token Queue', icon: Ticket, badge: stats.checkedIn },
            { id: 'ADMISSIONS', label: 'Inpatient Admissions', icon: Bed },
            { id: 'BILLING', label: 'Front Desk Billing', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-slate-500">Theme</span>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out Station
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-black rounded-lg border border-teal-500/20 uppercase tracking-wide">
              Front Desk & Central Reception #01
            </span>
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} • Shift: Morning OPD 08:00 - 14:00
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCreateError(null);
                setCreateModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Appointment</span>
            </button>
            <Link
              href="/dashboard/hospital/beds"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition"
            >
              <Bed className="w-4 h-4 text-sky-600" />
              <span>Live Beds</span>
            </Link>
            <button
              onClick={fetchAllData}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Success Toast */}
        {successToast && (
          <div className="fixed top-16 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Main Workspace Content */}
        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 flex-1">
          {/* Station Dashboard Tab */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-6">
              {/* Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-emerald-800 to-slate-900 text-white p-6 md:p-8 shadow-xl shadow-teal-600/10">
                <div className="relative z-10 max-w-2xl space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold border border-white/20">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Front Desk Command • Counter #01 Online</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                    Central Reception & OPD Scheduling Command
                  </h1>
                  <p className="text-teal-100 text-xs md:text-sm font-medium leading-relaxed">
                    Patient intake scheduling, 1-click appointment confirmation, OPD slot allocation, doctor chamber rosters, and inpatient bed coordination.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setActiveTab('APPOINTMENTS')}
                      className="px-4 py-2 bg-white text-teal-800 font-bold text-xs rounded-xl shadow hover:bg-teal-50 transition"
                    >
                      📅 Open Full Appointment Roster
                    </button>
                    <button
                      onClick={() => {
                        setCreateError(null);
                        setCreateModalOpen(true);
                      }}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl backdrop-blur-md transition"
                    >
                      + Book New Patient
                    </button>
                    <Link
                      href="/dashboard/reception"
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl backdrop-blur-md transition"
                    >
                      🎟️ Live Token Desk
                    </Link>
                  </div>
                </div>
              </div>

              {/* KPI Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Today</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">{stats.total}</span>
                  <span className="text-[10px] text-slate-400">All Scheduled</span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 shadow-sm">
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase block">Confirmed</span>
                  <span className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-0.5 block">{stats.confirmed}</span>
                  <span className="text-[10px] text-blue-500 font-bold">Ready for OPD</span>
                </div>
                <div className="bg-cyan-50 dark:bg-cyan-950/40 p-4 rounded-2xl border border-cyan-200 dark:border-cyan-900/60 shadow-sm">
                  <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase block">Checked In</span>
                  <span className="text-2xl font-black text-cyan-700 dark:text-cyan-300 mt-0.5 block">{stats.checkedIn}</span>
                  <span className="text-[10px] text-cyan-500 font-bold">In Waiting Area</span>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-2xl border border-purple-200 dark:border-purple-900/60 shadow-sm">
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase block">In Consultation</span>
                  <span className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-0.5 block">{stats.inProgress}</span>
                  <span className="text-[10px] text-purple-500 font-bold">Inside Chamber</span>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 shadow-sm">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase block">Pending Confirm</span>
                  <span className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-0.5 block">{stats.requested}</span>
                  <span className="text-[10px] text-amber-500 font-bold">Requires Action</span>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 shadow-sm">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase block">Completed</span>
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5 block">{stats.completed}</span>
                  <span className="text-[10px] text-emerald-500 font-semibold">Consulted ✓</span>
                </div>
              </div>

              {/* Operational Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Appointments Stream */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Today's Appointment Queue</h3>
                      <p className="text-[11px] text-slate-500">Quick 1-Click Confirm & Check-in Desk</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('APPOINTMENTS')}
                      className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                    >
                      View All ({appointments.length}) <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {appointments.slice(0, 5).map((appt) => (
                      <div key={appt.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{appt.patient?.user?.firstName} {appt.patient?.user?.lastName}</span>
                            <span className="text-[10px] font-mono text-teal-600 font-extrabold">{appt.appointmentNumber}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Dr. {appt.doctor?.user?.firstName} {appt.doctor?.user?.lastName} • ⏰ {formatTimeDisplay(appt.startTime)} - {formatTimeDisplay(appt.endTime)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStatusBadge(appt.status)}
                          {appt.status === 'REQUESTED' && (
                            <button
                              onClick={() => handleConfirmAppointment(appt.id)}
                              disabled={actionLoading === appt.id}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-sm transition"
                            >
                              Confirm ✓
                            </button>
                          )}
                          {appt.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleCheckInAppointment(appt.id)}
                              disabled={actionLoading === appt.id}
                              className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[11px] rounded-lg shadow-sm transition"
                            >
                              Check In 🩺
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenModify(appt)}
                            className="px-2 py-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[11px] font-semibold"
                          >
                            Modify
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Doctor Room Roster */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Active Doctor Chambers</h3>
                    <p className="text-[11px] text-slate-500">Live chamber status & occupancy</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { doctor: 'Dr. Sandeep Vashisht', spec: 'Internal Medicine', room: 'Chamber 101', status: 'In Consultation', color: 'emerald' },
                      { doctor: 'Dr. Suresh Menon', spec: 'Cardiology', room: 'Chamber 102', status: 'In Consultation', color: 'emerald' },
                      { doctor: 'Dr. Alok Nath', spec: 'Pulmonology', room: 'Chamber 103', status: 'Available', color: 'teal' },
                      { doctor: 'Dr. Abhishek Kumar', spec: 'Endocrinology', room: 'Chamber 104', status: 'Available', color: 'teal' },
                      { doctor: 'Dr. Ananya Sen', spec: 'Neurology', room: 'Chamber 105', status: 'Available', color: 'teal' },
                    ].map((doc, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{doc.doctor}</div>
                          <div className="text-[11px] text-slate-500">{doc.spec} • <span className="font-semibold text-teal-600 dark:text-teal-400">{doc.room}</span></div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Hospital Hotlines</div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      <div>🚨 Casualty: <span className="text-rose-600 font-bold">Ext 101</span></div>
                      <div>🩸 Blood Bank: <span className="text-slate-900 dark:text-white font-bold">Ext 303</span></div>
                      <div>🏥 ICU Station: <span className="text-slate-900 dark:text-white font-bold">Ext 202</span></div>
                      <div>🛡️ Security: <span className="text-slate-900 dark:text-white font-bold">Ext 999</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Appointment Booking & Scheduling Tab */}
          {activeTab === 'APPOINTMENTS' && (
            <div className="space-y-6">
              {/* Header Title & Subtitle */}
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
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
                    <span>+ Create Appointment</span>
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
                  <div className="py-12 text-center text-xs font-semibold text-slate-400 animate-pulse">
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
                            <td className="px-4 py-3 font-bold text-slate-900 dark:text-white font-mono">{appt.appointmentNumber}</td>
                            <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                              <div>{appt.patient?.user?.firstName} {appt.patient?.user?.lastName}</div>
                              {appt.patient?.user?.phone && (
                                <div className="text-[10px] text-slate-400 font-normal">{appt.patient.user.phone}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                              Dr. {appt.doctor?.user?.firstName} {appt.doctor?.user?.lastName}
                            </td>
                            <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                              📅 {new Date(appt.appointmentDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} <br />
                              ⏰ {formatTimeDisplay(appt.startTime)} - {formatTimeDisplay(appt.endTime)}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 uppercase text-[11px]">{appt.type}</td>
                            <td className="px-4 py-3 text-slate-500 italic max-w-xs truncate">{appt.reason}</td>
                            <td className="px-4 py-3">{renderStatusBadge(appt.status)}</td>
                            <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                              {/* Confirm Action Button */}
                              {appt.status !== 'CONFIRMED' && appt.status !== 'CHECKED_IN' && appt.status !== 'IN_PROGRESS' && appt.status !== 'COMPLETED' && appt.status !== 'CANCELLED' && (
                                <button
                                  type="button"
                                  onClick={() => handleConfirmAppointment(appt.id)}
                                  disabled={actionLoading === appt.id}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-sm shadow-emerald-600/20 inline-flex items-center gap-1"
                                  title="Confirm this appointment"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{actionLoading === appt.id ? 'Confirming...' : 'Confirm'}</span>
                                </button>
                              )}

                              {/* Check In Action Button */}
                              {appt.status === 'CONFIRMED' && (
                                <button
                                  type="button"
                                  onClick={() => handleCheckInAppointment(appt.id)}
                                  disabled={actionLoading === appt.id}
                                  className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-sm shadow-cyan-600/20 inline-flex items-center gap-1"
                                  title="Check in patient for doctor consultation"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{actionLoading === appt.id ? 'Checking In...' : 'Check In'}</span>
                                </button>
                              )}

                              {/* Modify Action Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenModify(appt)}
                                className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 font-bold rounded-xl text-xs transition cursor-pointer"
                              >
                                Modify
                              </button>

                              {/* Cancel Action Button */}
                              {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenCancelModal(appt)}
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
            </div>
          )}

          {/* Tokens Redirect Link View */}
          {activeTab === 'TOKENS' && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-950 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto font-bold text-xl">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live OPD Token Queue Management</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Access live counter token calling, patient priority sorting, and automated audio token announcer.
                </p>
              </div>
              <Link
                href="/dashboard/reception"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                <span>Go to Live Token Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Admissions Redirect Link View */}
          {activeTab === 'ADMISSIONS' && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-950 rounded-2xl flex items-center justify-center text-sky-600 dark:text-sky-400 mx-auto font-bold text-xl">
                <Bed className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Inpatient Bed Admissions Matrix</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Real-time bed availability grid across ICU, General Wards, Private Rooms, and PACU transfers.
                </p>
              </div>
              <Link
                href="/dashboard/hospital/beds"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                <span>Open Live Bed Census Matrix</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Billing Redirect Link View */}
          {activeTab === 'BILLING' && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto font-bold text-xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hospital Billing & Cashless TPA</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  OPD consultation fees, lab folio clearance, advance deposit receipts, and GST invoices.
                </p>
              </div>
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                <span>Open Billing Workstation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </main>
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
                      Dr. {d.user?.firstName} {d.user?.lastName} ({d.specialty?.name || d.department?.name || 'Physician'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Consultation Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    fetchSlots(selectedDoctorId, e.target.value);
                  }}
                  className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
                />
              </div>

              {/* Emergency Booking Priority Banner & Toggle */}
              <div className={`p-3 rounded-2xl border transition-all cursor-pointer ${isEmergency ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-red-300'}`}>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${isEmergency ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                      🚨
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Emergency Priority OPD Intake</span>
                        {isEmergency && <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-extrabold tracking-wide">HIGH PRIORITY</span>}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Direct queue routing, bypasses standard slot availability restriction
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isEmergency}
                    onChange={(e) => setIsEmergency(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                </label>
              </div>

              {/* Available Slots or Alternate Doctors */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Available OPD Slots <span className="text-rose-500">*</span>
                </label>
                {loadingSlots ? (
                  <div className="p-3 text-center text-xs text-slate-400 animate-pulse">Checking doctor availability...</div>
                ) : availableSlots.length === 0 ? (
                  <div className="mt-1.5 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>No open slots for selected doctor and date.</span>
                    </div>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      {alternateDoctors.length > 0 ? 'Switch to an available doctor in this department:' : 'Mark as Emergency Intake or select an adjacent date.'}
                    </p>
                    {alternateDoctors.length > 0 && (
                      <div className="space-y-1.5">
                        {alternateDoctors.map((alt) => (
                          <div
                            key={alt.id}
                            className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/70 dark:border-amber-900/50"
                          >
                            <div>
                              <div className="font-bold text-xs text-slate-900 dark:text-white">
                                {alt.name}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                {alt.specialty}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDoctorId(alt.id);
                                fetchSlots(alt.id, selectedDate);
                              }}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                            >
                              Switch Dr. &rarr;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-1.5 grid grid-cols-4 gap-2 max-h-32 overflow-y-auto p-1">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                          selectedSlot === slot
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {formatTimeDisplay(slot)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Consultation Fee & Reception Payment Status */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Consultation Fee</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">₹800</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('PAID')}
                    className={`p-2 rounded-xl border text-center font-bold transition cursor-pointer ${
                      paymentStatus === 'PAID'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    💳 Fee Collected (₹800 Paid)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('PENDING')}
                    className={`p-2 rounded-xl border text-center font-bold transition cursor-pointer ${
                      paymentStatus === 'PENDING'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    ⏳ Payment Pending
                  </button>
                </div>
              </div>

              {/* Reason / Complaint */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Reason for Consultation
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Chest pain follow-up, seasonal cough..."
                  className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={createLoading || (!selectedSlot && !isEmergency)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-sm ${
                    isEmergency
                      ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                      : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
                  }`}
                >
                  {createLoading
                    ? 'Booking Appointment...'
                    : isEmergency
                    ? '🚨 Confirm Emergency Appointment (Immediate Queue)'
                    : 'Confirm Appointment (Fee ₹800) ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODIFY APPOINTMENT MODAL */}
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
                  className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
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
                  className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
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
                      {formatTimeDisplay(slot)}
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
                    className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
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
                    className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
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
              {/* Hospital Cancellation & Refund Policy Status */}
              {cancelRefundInfo && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                    cancelRefundInfo.eligibleForFullRefund
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                      Hospital Policy Refund Calculation
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/80 dark:bg-black/40">
                      {cancelRefundInfo.eligibleForFullRefund ? '100% Refund (₹800)' : '0% Refund (₹0)'}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {cancelRefundInfo.ruleText}
                  </p>
                  <div className="text-[10px] opacity-80 font-medium pt-0.5">
                    Cancellation window: {cancelRefundInfo.hoursRemaining > 0 ? `${cancelRefundInfo.hoursRemaining} hours before scheduled slot` : 'Slot has started'}
                  </div>
                </div>
              )}

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
                  className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
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
