'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import Patient360Drawer from '@/components/Patient360Drawer';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  LayoutDashboard,
  CalendarClock,
  UserCheck,
  Video,
  FileText,
  Settings,
  Users,
  Stethoscope,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  Search,
  Phone,
  ShieldCheck,
  ArrowRight,
  X,
  Sparkles,
  Filter,
  Activity,
  Printer,
  Download,
  Pill,
  HeartPulse,
  RefreshCw,
  Zap,
  Building,
  Radio,
  Check,
  Calendar,
} from 'lucide-react';

export type DoctorPortalTab =
  | 'DASHBOARD'
  | 'APPOINTMENTS'
  | 'PATIENTS'
  | 'TELEMEDICINE'
  | 'PRESCRIPTIONS'
  | 'SETTINGS';

export interface DoctorAppointmentItem {
  id: string;
  tokenNumber: string; // e.g. "Token #1", "Token #2", "Priority Token #E-1"
  queuePosition: number;
  appointmentNumber: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: 'IN_PERSON_OPD' | 'ONLINE_PORTAL' | 'TELEMEDICINE';
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  isEmergency: boolean;
  reason: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone?: string;
  vitals?: {
    bp?: string;
    spo2?: number;
    pulse?: number;
    temp?: string;
  };
  consultationSummary?: {
    diagnosis: string;
    medicines: string;
    instructions: string;
    completedAt: string;
  };
}

export interface CheckedPatientRecord {
  id: string;
  tokenNumber: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  uhid: string;
  consultationType: string;
  checkedAt: string;
  diagnosis: string;
  prescribedMedicines: string;
  instructions: string;
  followUpDays: number;
}

// Initial Today Baseline OPD Schedule for Doctor
const INITIAL_TODAY_APPOINTMENTS: DoctorAppointmentItem[] = [
  {
    id: 'appt-today-1',
    tokenNumber: 'Token #1',
    queuePosition: 1,
    appointmentNumber: 'APT-260901',
    appointmentDate: new Date().toISOString().split('T')[0],
    startTime: '09:00 AM',
    endTime: '09:20 AM',
    type: 'IN_PERSON_OPD',
    status: 'IN_PROGRESS',
    isEmergency: false,
    reason: 'Hypertension follow-up & morning dizziness',
    patientId: 'pat-1',
    patientName: 'Ramesh Kumar Singh',
    patientAge: 62,
    patientGender: 'Male',
    patientPhone: '+91 7460951804',
    vitals: { bp: '138/88 mmHg', spo2: 97, pulse: 76, temp: '98.4 °F' },
  },
  {
    id: 'appt-today-2',
    tokenNumber: 'Token #2',
    queuePosition: 2,
    appointmentNumber: 'APT-260902',
    appointmentDate: new Date().toISOString().split('T')[0],
    startTime: '09:30 AM',
    endTime: '09:50 AM',
    type: 'ONLINE_PORTAL',
    status: 'WAITING',
    isEmergency: false,
    reason: 'Chest heaviness after exertion & review of ECG',
    patientId: 'pat-2',
    patientName: 'Sunita Sharma',
    patientAge: 55,
    patientGender: 'Female',
    patientPhone: '+91 9450123456',
    vitals: { bp: '130/84 mmHg', spo2: 98, pulse: 80, temp: '98.6 °F' },
  },
  {
    id: 'appt-today-3',
    tokenNumber: 'Token #3',
    queuePosition: 3,
    appointmentNumber: 'APT-260903',
    appointmentDate: new Date().toISOString().split('T')[0],
    startTime: '10:00 AM',
    endTime: '10:20 AM',
    type: 'TELEMEDICINE',
    status: 'WAITING',
    isEmergency: false,
    reason: 'Routine Cardiology Consultation (Video Link)',
    patientId: 'pat-3',
    patientName: 'Ayush Singh',
    patientAge: 28,
    patientGender: 'Male',
    patientPhone: '+91 8114240263',
    vitals: { bp: '120/80 mmHg', spo2: 99, pulse: 72, temp: '98.2 °F' },
  },
  {
    id: 'appt-today-4',
    tokenNumber: 'Token #4',
    queuePosition: 4,
    appointmentNumber: 'APT-260904',
    appointmentDate: new Date().toISOString().split('T')[0],
    startTime: '10:30 AM',
    endTime: '10:50 AM',
    type: 'IN_PERSON_OPD',
    status: 'WAITING',
    isEmergency: false,
    reason: 'Post-CABG 6-Month Routine Health Check',
    patientId: 'pat-4',
    patientName: 'Vikramaditya Rao',
    patientAge: 68,
    patientGender: 'Male',
    patientPhone: '+91 98112 34567',
    vitals: { bp: '126/82 mmHg', spo2: 96, pulse: 74, temp: '98.5 °F' },
  },
  {
    id: 'appt-today-5',
    tokenNumber: 'Token #5',
    queuePosition: 5,
    appointmentNumber: 'APT-260905',
    appointmentDate: new Date().toISOString().split('T')[0],
    startTime: '11:00 AM',
    endTime: '11:20 AM',
    type: 'ONLINE_PORTAL',
    status: 'WAITING',
    isEmergency: false,
    reason: 'Dyslipidemia medication titration (Atorvastatin 20mg)',
    patientId: 'pat-5',
    patientName: 'Meenakshi Iyer',
    patientAge: 49,
    patientGender: 'Female',
    patientPhone: '+91 98223 45678',
    vitals: { bp: '122/78 mmHg', spo2: 99, pulse: 68, temp: '98.3 °F' },
  },
];

// Baseline Previously Checked Patients for Doctor Rajesh Singh
const INITIAL_CHECKED_PATIENTS: CheckedPatientRecord[] = [
  {
    id: 'chk-prev-1',
    tokenNumber: 'Token #0',
    patientName: 'Harish Chandra Gupta',
    patientAge: 64,
    patientGender: 'Male',
    patientPhone: '+91 98101 23450',
    uhid: 'MNX-2026-0812',
    consultationType: 'In-Person OPD',
    checkedAt: 'Earlier Today, 08:35 AM',
    diagnosis: 'Primary Essential Hypertension (Controlled)',
    prescribedMedicines: 'Telma 40mg (1-0-0), Amlodipine 5mg (0-0-1)',
    instructions: 'Salt restriction (<5g/day), 30 min morning brisk walk, follow-up in 30 days.',
    followUpDays: 30,
  },
];

export default function DoctorAppointmentsPage() {
  const router = useRouter();

  // Active Tab: Defaults to DASHBOARD as requested by the user
  const [activeTab, setActiveTab] = useState<DoctorPortalTab>('DASHBOARD');

  // Today's Appointments State with LocalStorage Persistence
  const [appointments, setAppointments] = useState<DoctorAppointmentItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('medinexa_doctor_today_appointments');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_TODAY_APPOINTMENTS;
  });

  // Checked Patients Roster (Strictly contains only patients checked by the doctor)
  const [checkedPatients, setCheckedPatients] = useState<CheckedPatientRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('medinexa_doctor_checked_patients');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_CHECKED_PATIENTS;
  });

  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [selectedPatient360Id, setSelectedPatient360Id] = useState<string | null>(null);

  // Search & Filters in Appointments view
  const [searchFilter, setSearchFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IN_PERSON_OPD' | 'ONLINE_PORTAL' | 'TELEMEDICINE'>('ALL');

  // Emergency Walk-in Modal State
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({
    patientName: '',
    age: '58',
    gender: 'Male',
    phone: '',
    chiefComplaint: 'Acute Chest Tightness & Severe Sweating',
    priorityLevel: 'CRITICAL_ALS',
  });

  // Complete Checkup & Prescription Modal State
  const [checkupModalAppt, setCheckupModalAppt] = useState<DoctorAppointmentItem | null>(null);
  const [checkupForm, setCheckupForm] = useState({
    diagnosis: '',
    medicines: 'Telma 40mg (1-0-0), Pan 40 (1-0-0 Before Food), Dolo 650 SOS',
    instructions: 'Avoid heavy exertion, low sodium diet, repeat ECG in 7 days.',
    followUpDays: '14',
  });

  // Telemedicine Active Video Call Simulator State
  const [activeTelehealthAppt, setActiveTelehealthAppt] = useState<DoctorAppointmentItem | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Doctor Profile & Clinic Settings State
  const [clinicSettings, setClinicSettings] = useState({
    doctorName: 'Dr. Rajesh Singh, MD, DM (Cardiology)',
    specialization: 'Senior Consultant Interventional Cardiologist',
    hospitalName: 'MediNexa General Hospital (Hospital A)',
    roomNumber: 'Room 104, Central OPD Wing A',
    shiftTiming: '09:00 AM - 02:00 PM & 04:00 PM - 07:00 PM',
    opdFee: '₹600',
    telemedicineFee: '₹500',
    autoTokenNumbering: true,
  });

  // Re-number tokens sequentially whenever appointments list changes
  const autoNumberAppointments = useCallback((list: DoctorAppointmentItem[]): DoctorAppointmentItem[] => {
    let regularCount = 1;
    let emergencyCount = 1;

    return list.map((item) => {
      if (item.isEmergency) {
        return {
          ...item,
          tokenNumber: `Priority Token #E-${emergencyCount++}`,
          queuePosition: 0,
        };
      }
      return {
        ...item,
        tokenNumber: `Token #${regularCount++}`,
        queuePosition: regularCount - 1,
      };
    });
  }, []);

  // Save to localStorage whenever appointments or checkedPatients change
  const persistAppointments = (newList: DoctorAppointmentItem[]) => {
    const numbered = autoNumberAppointments(newList);
    setAppointments(numbered);
    try {
      localStorage.setItem('medinexa_doctor_today_appointments', JSON.stringify(numbered));
    } catch {}

    // Sync with patient portal's medinexa_local_appointments so patients see their exact token
    try {
      const patientPortalAppts = JSON.parse(localStorage.getItem('medinexa_local_appointments') || '[]');
      const synced = patientPortalAppts.map((p: any) => {
        const matched = numbered.find(
          (docAppt) =>
            docAppt.id === p.id ||
            docAppt.appointmentNumber === p.appointmentNumber ||
            docAppt.patientName.toLowerCase().includes((p.patientName || '').toLowerCase()),
        );
        if (matched) {
          return {
            ...p,
            queueTokenNumber: matched.tokenNumber,
            queueStatus: matched.status,
            doctorName: clinicSettings.doctorName,
            roomNumber: clinicSettings.roomNumber,
          };
        }
        return p;
      });
      localStorage.setItem('medinexa_local_appointments', JSON.stringify(synced));
    } catch {}
  };

  const persistCheckedPatients = (newChecked: CheckedPatientRecord[]) => {
    setCheckedPatients(newChecked);
    try {
      localStorage.setItem('medinexa_doctor_checked_patients', JSON.stringify(newChecked));
    } catch {}
  };

  // Sync external bookings from Patient Portal on mount
  useEffect(() => {
    try {
      const patientBookings = JSON.parse(localStorage.getItem('medinexa_local_appointments') || '[]');
      if (Array.isArray(patientBookings) && patientBookings.length > 0) {
        setAppointments((prev) => {
          const existingIds = new Set(prev.map((a) => a.id || a.appointmentNumber));
          const newEntries: DoctorAppointmentItem[] = [];

          patientBookings.forEach((p: any) => {
            const idKey = p.id || p.appointmentNumber;
            if (!existingIds.has(idKey)) {
              newEntries.push({
                id: p.id || `appt-ext-${Date.now()}`,
                tokenNumber: `Token #${prev.length + newEntries.length + 1}`,
                queuePosition: prev.length + newEntries.length + 1,
                appointmentNumber: p.appointmentNumber || `APT-${Date.now().toString().slice(-6)}`,
                appointmentDate: p.appointmentDate || new Date().toISOString().split('T')[0],
                startTime: p.startTime || '11:30 AM',
                endTime: p.endTime || '11:50 AM',
                type: p.notes?.includes('Telemedicine') ? 'TELEMEDICINE' : 'ONLINE_PORTAL',
                status: 'WAITING',
                isEmergency: false,
                reason: p.reason || 'General Health Consultation',
                patientId: p.patientId || `pat-${Date.now()}`,
                patientName: p.patient?.user?.firstName
                  ? `${p.patient.user.firstName} ${p.patient.user.lastName || ''}`.trim()
                  : p.patientName || 'Online Registered Patient',
                patientAge: 45,
                patientGender: 'Adult',
                patientPhone: p.patient?.user?.phone || '+91 8114240263',
                vitals: { bp: '124/82 mmHg', spo2: 98, pulse: 74, temp: '98.4 °F' },
              });
              existingIds.add(idKey);
            }
          });

          if (newEntries.length > 0) {
            const combined = [...prev, ...newEntries];
            return autoNumberAppointments(combined);
          }
          return prev;
        });
      }
    } catch {}
  }, [autoNumberAppointments]);

  // Handle Call Patient In (Status -> IN_PROGRESS)
  const handleCallPatient = (apptId: string) => {
    const updated = appointments.map((a) => {
      if (a.id === apptId) {
        return { ...a, status: 'IN_PROGRESS' as const };
      }
      if (a.status === 'IN_PROGRESS') {
        return { ...a, status: 'WAITING' as const };
      }
      return a;
    });

    persistAppointments(updated);
    const target = updated.find((a) => a.id === apptId);
    setFeedbackMsg({
      type: 'success',
      text: `📢 ${target?.tokenNumber}: Calling in ${target?.patientName} to ${clinicSettings.roomNumber}!`,
    });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Open Complete Checkup Modal
  const handleOpenCheckupModal = (appt: DoctorAppointmentItem) => {
    setCheckupModalAppt(appt);
    setCheckupForm({
      diagnosis: appt.reason ? `${appt.reason} - Evaluated & Confirmed` : 'Cardiovascular Evaluation',
      medicines: 'Telma 40mg (1-0-0), Pan 40 (1-0-0 Before Food), Dolo 650 SOS',
      instructions: 'Avoid heavy physical strain, monitor morning fasting BP, low sodium diet.',
      followUpDays: '14',
    });
  };

  // Submit Checkup & Finish Encounter
  const handleFinishCheckup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkupModalAppt) return;

    // 1. Mark this appointment as COMPLETED
    const updatedAppts = appointments.map((a) => {
      if (a.id === checkupModalAppt.id) {
        return {
          ...a,
          status: 'COMPLETED' as const,
          consultationSummary: {
            diagnosis: checkupForm.diagnosis,
            medicines: checkupForm.medicines,
            instructions: checkupForm.instructions,
            completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        };
      }
      return a;
    });

    // Automatically set the next WAITING patient to IN_PROGRESS if available
    const nextWaiting = updatedAppts.find((a) => a.status === 'WAITING');
    if (nextWaiting) {
      nextWaiting.status = 'IN_PROGRESS';
    }

    persistAppointments(updatedAppts);

    // 2. Add to Checked Patients Roster (strictly only checked patients!)
    const newRecord: CheckedPatientRecord = {
      id: `chk-${Date.now()}`,
      tokenNumber: checkupModalAppt.tokenNumber,
      patientName: checkupModalAppt.patientName,
      patientAge: checkupModalAppt.patientAge || 45,
      patientGender: checkupModalAppt.patientGender || 'Male',
      patientPhone: checkupModalAppt.patientPhone || '+91 99999 00000',
      uhid: `MNX-${Date.now().toString().slice(-6)}`,
      consultationType:
        checkupModalAppt.type === 'IN_PERSON_OPD'
          ? 'In-Person Hospital OPD'
          : checkupModalAppt.type === 'ONLINE_PORTAL'
          ? 'Online Portal Booking'
          : 'Telemedicine Video',
      checkedAt: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      diagnosis: checkupForm.diagnosis,
      prescribedMedicines: checkupForm.medicines,
      instructions: checkupForm.instructions,
      followUpDays: parseInt(checkupForm.followUpDays, 10) || 14,
    };

    const updatedChecked = [newRecord, ...checkedPatients];
    persistCheckedPatients(updatedChecked);

    // 3. Reset and Notify
    const completedName = checkupModalAppt.patientName;
    setCheckupModalAppt(null);
    setFeedbackMsg({
      type: 'success',
      text: `✓ Consultation completed for ${completedName}! Prescription logged & added to Checked Patients.`,
    });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Submit Emergency Walk-in Appointment (Placed directly at top of queue)
  const handleAddEmergencyAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyForm.patientName.trim()) return;

    const emergencyAppt: DoctorAppointmentItem = {
      id: `emg-${Date.now()}`,
      tokenNumber: 'Priority Token #E-1',
      queuePosition: 0,
      appointmentNumber: `EMG-${Date.now().toString().slice(-5)}`,
      appointmentDate: new Date().toISOString().split('T')[0],
      startTime: 'IMMEDIATE',
      endTime: 'EMERGENCY',
      type: 'IN_PERSON_OPD',
      status: 'IN_PROGRESS', // Immediately takes consultation priority
      isEmergency: true,
      reason: `🚨 EMERGENCY: ${emergencyForm.chiefComplaint}`,
      patientId: `emg-pat-${Date.now()}`,
      patientName: emergencyForm.patientName.trim(),
      patientAge: parseInt(emergencyForm.age, 10) || 50,
      patientGender: emergencyForm.gender,
      patientPhone: emergencyForm.phone.trim() || '+91 91100 00000',
      vitals: { bp: '150/95 mmHg', spo2: 92, pulse: 110, temp: '99.0 °F' },
    };

    // Place emergency appointment at the top
    const updated = [emergencyAppt, ...appointments.map((a) => (a.status === 'IN_PROGRESS' ? { ...a, status: 'WAITING' as const } : a))];
    persistAppointments(updated);

    setShowEmergencyModal(false);
    setEmergencyForm({
      patientName: '',
      age: '58',
      gender: 'Male',
      phone: '',
      chiefComplaint: 'Acute Chest Tightness & Severe Sweating',
      priorityLevel: 'CRITICAL_ALS',
    });

    setFeedbackMsg({
      type: 'error',
      text: `🚨 EMERGENCY PRIORITY: Patient '${emergencyAppt.patientName}' admitted to Room 104 with Priority Token #E-1!`,
    });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // Filtered Today's Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const matchesType = typeFilter === 'ALL' || a.type === typeFilter;
      const matchesSearch =
        searchFilter === '' ||
        a.patientName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        a.appointmentNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
        a.tokenNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
        a.reason.toLowerCase().includes(searchFilter.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [appointments, typeFilter, searchFilter]);

  // Metrics for Dashboard Overview
  const currentlyConsulting = appointments.find((a) => a.status === 'IN_PROGRESS');
  const waitingPatients = appointments.filter((a) => a.status === 'WAITING');
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;
  const emergencyCount = appointments.filter((a) => a.isEmergency).length;
  const telehealthCount = appointments.filter((a) => a.type === 'TELEMEDICINE').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans">
      {/* Toast Notification Alert */}
      {feedbackMsg && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 border animate-bounce ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-400/40 shadow-emerald-500/20'
              : feedbackMsg.type === 'error'
              ? 'bg-rose-600 text-white border-rose-400/40 shadow-rose-500/20'
              : 'bg-blue-600 text-white border-blue-400/40 shadow-blue-500/20'
          }`}
        >
          {feedbackMsg.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
          {feedbackMsg.type === 'error' && <AlertTriangle className="w-4 h-4" />}
          {feedbackMsg.type === 'info' && <Radio className="w-4 h-4 animate-spin" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEFT SIDEBAR NAVIGATION                                                    */}
      {/* ========================================================================= */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between flex-shrink-0 min-h-screen sticky top-0 shadow-sm z-20">
        <div>
          {/* Clinic Brand Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">MediNexa</span>
                <span className="px-1.5 py-0.5 text-[9px] font-black bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-md uppercase">
                  DOCTOR
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
                {clinicSettings.hospitalName}
              </p>
            </div>
          </div>

          {/* Doctor Info Card in Sidebar */}
          <div className="p-4 mx-3 my-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                DR
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">Dr. Rajesh Singh</h4>
                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold truncate">Senior Cardiologist</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700 text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active OPD</span>
              </span>
              <span className="text-blue-600 dark:text-blue-400">Room 104</span>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav className="px-3 space-y-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'DASHBOARD'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Doctor Dashboard</span>
              </div>
              <span className="text-[10px] opacity-80">Live</span>
            </button>

            <button
              onClick={() => setActiveTab('APPOINTMENTS')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'APPOINTMENTS'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CalendarClock className="w-4 h-4" />
                <span>Today's Appointments</span>
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                  activeTab === 'APPOINTMENTS' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                }`}
              >
                {appointments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('PATIENTS')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'PATIENTS'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4" />
                <span>Checked Patients Only</span>
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                  activeTab === 'PATIENTS' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {checkedPatients.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('TELEMEDICINE')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'TELEMEDICINE'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Video className="w-4 h-4" />
                <span>Telemedicine Studio</span>
              </div>
              <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-black">
                {telehealthCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('PRESCRIPTIONS')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'PRESCRIPTIONS'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Prescriptions & EHR</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('SETTINGS')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'SETTINGS'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" />
                <span>Clinic & OPD Settings</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px] font-medium">Theme Mode</span>
            <ThemeToggle />
          </div>

          <Link
            href="/portal"
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
          >
            <span>Switch to Patient Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA                                                         */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                ● OPD CLINIC IN SESSION
              </span>
              <span className="text-xs text-slate-500 font-bold">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Emergency Walk-in Trigger Button */}
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs font-extrabold shadow-md shadow-rose-500/20 transition cursor-pointer active:scale-95 animate-pulse"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>+ Emergency Walk-in Appointment</span>
            </button>

            <button
              onClick={() => {
                setFeedbackMsg({ type: 'info', text: 'Queue refreshed with live hospital database' });
                setTimeout(() => setFeedbackMsg(null), 2500);
              }}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic View Body based on activeTab */}
        <main className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* ========================================================================= */}
          {/* TAB 1: DOCTOR DASHBOARD (Default Landing View)                             */}
          {/* ========================================================================= */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-700 text-white shadow-xl space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">🩺</div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase">
                    Central Cardiology OPD
                  </span>
                  <span className="text-xs text-blue-100">• Room 104</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Welcome, Dr. Rajesh Singh
                </h1>
                <p className="text-xs sm:text-sm text-blue-100 max-w-2xl">
                  Your live clinical station is operational. Today's OPD schedule has <strong>{appointments.length} patients</strong> assigned with sequential queue token numbering.
                </p>
              </div>

              {/* 5 Key Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Today's Schedule</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{appointments.length}</div>
                  <div className="text-[11px] text-blue-600 font-semibold">Total registered</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">In Waiting Queue</div>
                  <div className="text-2xl font-black text-amber-500">{waitingPatients.length}</div>
                  <div className="text-[11px] text-slate-400 font-medium">Awaiting call</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Checked & Completed</div>
                  <div className="text-2xl font-black text-emerald-500">{completedCount}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold">In Checked Patients</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Emergency Walk-ins</div>
                  <div className="text-2xl font-black text-rose-500">{emergencyCount}</div>
                  <div className="text-[11px] text-rose-600 font-bold">Priority Triage</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Telemedicine Video</div>
                  <div className="text-2xl font-black text-purple-500">{telehealthCount}</div>
                  <div className="text-[11px] text-purple-600 font-medium">Virtual Consults</div>
                </div>
              </div>

              {/* Consultation Room Active Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Patient Inside Consultation Room */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Currently in Consultation Room (Room 104)
                      </h3>
                    </div>
                    {currentlyConsulting && (
                      <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-xs rounded-full">
                        {currentlyConsulting.tokenNumber}
                      </span>
                    )}
                  </div>

                  {currentlyConsulting ? (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-black text-slate-900 dark:text-white">
                              {currentlyConsulting.patientName}
                            </h4>
                            <span className="text-xs text-slate-500 font-bold">
                              ({currentlyConsulting.patientAge} yrs • {currentlyConsulting.patientGender})
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Appt #{currentlyConsulting.appointmentNumber} • Phone: {currentlyConsulting.patientPhone}
                          </p>
                          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mt-1">
                            Chief Complaint: {currentlyConsulting.reason}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenCheckupModal(currentlyConsulting)}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>Complete Checkup & Prescribe</span>
                          </button>
                        </div>
                      </div>

                      {/* Live Triage Vitals Glance */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900 text-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Blood Pressure</span>
                          <div className="text-sm font-black text-rose-700 dark:text-rose-400 mt-0.5">
                            {currentlyConsulting.vitals?.bp || '138/88'}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900 text-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">SpO2 Oxygen</span>
                          <div className="text-sm font-black text-teal-700 dark:text-teal-400 mt-0.5">
                            {currentlyConsulting.vitals?.spo2 || 98}%
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900 text-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Heart Pulse</span>
                          <div className="text-sm font-black text-blue-700 dark:text-blue-400 mt-0.5">
                            {currentlyConsulting.vitals?.pulse || 76} BPM
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900 text-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Temperature</span>
                          <div className="text-sm font-black text-amber-700 dark:text-amber-400 mt-0.5">
                            {currentlyConsulting.vitals?.temp || '98.4 °F'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-3">
                      <div className="text-4xl">🚪</div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Consultation room is currently free
                      </h4>
                      <p className="text-xs text-slate-400">
                        Select the next patient from the queue below and click "Call In".
                      </p>
                      {waitingPatients.length > 0 && (
                        <button
                          onClick={() => handleCallPatient(waitingPatients[0].id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md"
                        >
                          Call Next: {waitingPatients[0].patientName} ({waitingPatients[0].tokenNumber})
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Queue Summary / Next in Line Panel */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Next in Line Queue</h3>
                    <button
                      onClick={() => setActiveTab('APPOINTMENTS')}
                      className="text-xs text-blue-600 hover:underline font-bold"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {waitingPatients.slice(0, 4).map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-blue-600 dark:text-blue-400">{item.tokenNumber}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                              {item.patientName}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {item.startTime} • {item.type.replace('_', ' ')}
                          </span>
                        </div>

                        <button
                          onClick={() => handleCallPatient(item.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold hover:bg-blue-100 text-[11px] cursor-pointer"
                        >
                          Call In
                        </button>
                      </div>
                    ))}

                    {waitingPatients.length === 0 && (
                      <p className="text-center py-6 text-xs text-slate-400">
                        No more patients waiting in queue today.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: TODAY'S APPOINTMENTS (OPD & Online Queue with Dynamic Tokens)       */}
          {/* ========================================================================= */}
          {activeTab === 'APPOINTMENTS' && (
            <div className="space-y-6">
              {/* Header & Quick Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-black uppercase rounded-md">
                      TODAY'S APPOINTMENTS ONLY
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Sequential Auto-Token Queue ({appointments.length} Total)
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    Today's OPD & Online Consultation Roster
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live queue of in-person OPD registrations, citizen portal online bookings, and virtual telemedicine consults.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowEmergencyModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white text-xs font-extrabold shadow-md shadow-rose-500/20 cursor-pointer active:scale-95"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>+ Emergency Walk-in Appointment</span>
                  </button>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search patient, token, phone, complaint..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                  {(['ALL', 'IN_PERSON_OPD', 'ONLINE_PORTAL', 'TELEMEDICINE'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                        typeFilter === type
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {type === 'ALL'
                        ? 'All Channels'
                        : type === 'IN_PERSON_OPD'
                        ? '🏥 In-Person OPD'
                        : type === 'ONLINE_PORTAL'
                        ? '🌐 Online Portal'
                        : '📹 Telemedicine'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sequential Queue Table */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px] font-black tracking-wider">
                        <th className="py-3.5 px-4">Token & Appt #</th>
                        <th className="py-3.5 px-4">Patient Details</th>
                        <th className="py-3.5 px-4">Channel / Type</th>
                        <th className="py-3.5 px-4">Scheduled Slot</th>
                        <th className="py-3.5 px-4">Chief Complaint</th>
                        <th className="py-3.5 px-4">Queue Status</th>
                        <th className="py-3.5 px-4 text-right">Clinical Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {filteredAppointments.map((appt) => (
                        <tr
                          key={appt.id}
                          className={`transition ${
                            appt.status === 'IN_PROGRESS'
                              ? 'bg-blue-50/60 dark:bg-blue-950/20'
                              : appt.isEmergency
                              ? 'bg-rose-50/40 dark:bg-rose-950/20'
                              : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          {/* Token & Appointment Number */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span
                                className={`font-black text-sm ${
                                  appt.isEmergency
                                    ? 'text-rose-600'
                                    : appt.status === 'IN_PROGRESS'
                                    ? 'text-blue-600'
                                    : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                {appt.tokenNumber}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {appt.appointmentNumber}
                              </span>
                            </div>
                          </td>

                          {/* Patient Details */}
                          <td className="py-3.5 px-4">
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {appt.patientName}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {appt.patientAge} yrs • {appt.patientGender} • {appt.patientPhone}
                              </div>
                            </div>
                          </td>

                          {/* Type Badge */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                appt.type === 'IN_PERSON_OPD'
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200'
                                  : appt.type === 'ONLINE_PORTAL'
                                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-200'
                                  : 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200'
                              }`}
                            >
                              {appt.type === 'IN_PERSON_OPD'
                                ? '🏥 Hospital OPD'
                                : appt.type === 'ONLINE_PORTAL'
                                ? '🌐 Online Portal'
                                : '📹 Telemedicine'}
                            </span>
                          </td>

                          {/* Slot */}
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-1 font-bold">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{appt.startTime}</span>
                            </div>
                          </td>

                          {/* Chief Complaint */}
                          <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 dark:text-slate-300">
                            {appt.reason}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                appt.status === 'IN_PROGRESS'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse'
                                  : appt.status === 'WAITING'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {appt.status === 'IN_PROGRESS'
                                ? '● Consulting'
                                : appt.status === 'WAITING'
                                ? 'Waiting'
                                : 'Checked & Completed'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right space-x-1.5">
                            {appt.status !== 'COMPLETED' && (
                              <>
                                {appt.status !== 'IN_PROGRESS' ? (
                                  <button
                                    onClick={() => handleCallPatient(appt.id)}
                                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-sm shadow-blue-500/20"
                                  >
                                    Call In
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleOpenCheckupModal(appt)}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm shadow-emerald-500/20"
                                  >
                                    ✓ Complete Checkup
                                  </button>
                                )}
                              </>
                            )}

                            {appt.status === 'COMPLETED' && (
                              <span className="text-[11px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Checked
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CHECKED PATIENTS ONLY (Exclusively Patients Consulted by Doctor)   */}
          {/* ========================================================================= */}
          {activeTab === 'PATIENTS' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black uppercase rounded-md">
                    DOCTOR'S CHECKED PATIENTS ONLY
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {checkedPatients.length} Patients Evaluated & Treated
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  Checked & Consulted Patients Registry
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  This registry strictly lists only patients whom you have checked, diagnosed, and prescribed treatment for.
                </p>
              </div>

              {checkedPatients.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                  <div className="text-4xl">🩺</div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                    No patients checked yet today
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Once you call patients into Room 104 and click "Complete Checkup & Prescribe", their full medical records and diagnosis will automatically appear here.
                  </p>
                  <button
                    onClick={() => setActiveTab('APPOINTMENTS')}
                    className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Open Today's Appointments Queue →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {checkedPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-[10px] rounded-md">
                              {patient.tokenNumber}
                            </span>
                            <h4 className="text-base font-black text-slate-900 dark:text-white">
                              {patient.patientName}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            UHID: {patient.uhid} • {patient.patientAge} yrs, {patient.patientGender} • Phone: {patient.patientPhone}
                          </p>
                        </div>

                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-md">
                          {patient.consultationType}
                        </span>
                      </div>

                      {/* Clinical Evaluation Data */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Diagnosis / Condition</span>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{patient.diagnosis}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Prescribed Treatment</span>
                          <p className="font-mono text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                            {patient.prescribedMedicines}
                          </p>
                        </div>
                        {patient.instructions && (
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Advice</span>
                            <p className="text-slate-600 dark:text-slate-300 italic text-[11px]">{patient.instructions}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                        <span>Checked: {patient.checkedAt}</span>
                        <span className="font-bold text-teal-600 dark:text-teal-400">
                          Follow-up: {patient.followUpDays} Days
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: TELEMEDICINE STUDIO                                                */}
          {/* ========================================================================= */}
          {activeTab === 'TELEMEDICINE' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Telemedicine Virtual OPD Studio
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Conduct encrypted HD tele-consultations, live vitals review, and instant e-prescription dispatch.
                  </p>
                </div>
              </div>

              {/* Video Interface Simulator */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 rounded-3xl overflow-hidden aspect-video relative flex items-center justify-center text-white shadow-2xl border border-slate-800">
                  <div className="text-center space-y-3">
                    <div className="w-20 h-20 rounded-full bg-blue-600/30 border border-blue-400 flex items-center justify-center mx-auto text-3xl animate-pulse">
                      📹
                    </div>
                    <h3 className="font-bold text-base">Virtual Telemedicine Room Active</h3>
                    <p className="text-xs text-slate-400">
                      Connected with patient Ayush Singh (Token #3) • WebRTC Encrypted HD Channel
                    </p>
                  </div>

                  {/* Video Overlay Controls */}
                  <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setIsMicMuted(!isMicMuted)}
                      className={`p-3 rounded-full text-xs font-bold transition cursor-pointer ${
                        isMicMuted ? 'bg-rose-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {isMicMuted ? 'Muted' : 'Mic On'}
                    </button>
                    <button
                      onClick={() => setIsVideoOff(!isVideoOff)}
                      className={`p-3 rounded-full text-xs font-bold transition cursor-pointer ${
                        isVideoOff ? 'bg-rose-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {isVideoOff ? 'Camera Off' : 'Camera On'}
                    </button>
                    <button
                      onClick={() => {
                        const appt = appointments.find((a) => a.type === 'TELEMEDICINE');
                        if (appt) handleOpenCheckupModal(appt);
                      }}
                      className="px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-lg"
                    >
                      End Call & Issue e-Rx
                    </button>
                  </div>
                </div>

                {/* Patient Live EHR Notes Panel */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">Active SOAP Clinical Notes</h4>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Subjective</label>
                    <textarea
                      rows={2}
                      defaultValue="Patient reports mild palpitations after evening meals. Denies syncope or orthopnea."
                      className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Objective</label>
                    <textarea
                      rows={2}
                      defaultValue="Home BP: 124/80, Pulse: 72 bpm, SpO2: 99%. Baseline ECG normal sinus rhythm."
                      className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Assessment & Plan</label>
                    <textarea
                      rows={2}
                      defaultValue="Benign sinus tachycardia, stress-related. Prescribed magnesium supplements & lifestyle counseling."
                      className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: PRESCRIPTIONS & EHR GENERATOR                                      */}
          {/* ========================================================================= */}
          {activeTab === 'PRESCRIPTIONS' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Clinical e-Prescription Generator & Pharmacy Dispatch
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prescribe Schedule H/H1 medications with direct hospital pharmacy inventory linkage.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Medicine Dispatch</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400">Medicine Name</label>
                    <input
                      type="text"
                      defaultValue="Telma 40 (Telmisartan 40mg)"
                      className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400">Dosage Schedule</label>
                    <input
                      type="text"
                      defaultValue="Once daily in morning (1-0-0) after breakfast"
                      className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400">Duration</label>
                    <input
                      type="text"
                      defaultValue="30 Days (30 Tablets)"
                      className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setFeedbackMsg({ type: 'success', text: 'Prescription sent to hospital outpatient pharmacy!' });
                      setTimeout(() => setFeedbackMsg(null), 3000);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer shadow-md"
                  >
                    Send to Hospital Pharmacy →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: SETTINGS (Doctor Profile, Clinic Room & OPD Hours)                   */}
          {/* ========================================================================= */}
          {activeTab === 'SETTINGS' && (
            <div className="space-y-6 max-w-3xl">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Clinic & Doctor Workstation Settings
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure your consultation room, active OPD hours, fees, and sequential auto-token rules.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400">Doctor Display Name</label>
                    <input
                      type="text"
                      value={clinicSettings.doctorName}
                      onChange={(e) => setClinicSettings({ ...clinicSettings, doctorName: e.target.value })}
                      className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400">Clinical Specialty</label>
                    <input
                      type="text"
                      value={clinicSettings.specialization}
                      onChange={(e) => setClinicSettings({ ...clinicSettings, specialization: e.target.value })}
                      className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400">OPD Consultation Room</label>
                    <input
                      type="text"
                      value={clinicSettings.roomNumber}
                      onChange={(e) => setClinicSettings({ ...clinicSettings, roomNumber: e.target.value })}
                      className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400">Active Shift Hours</label>
                    <input
                      type="text"
                      value={clinicSettings.shiftTiming}
                      onChange={(e) => setClinicSettings({ ...clinicSettings, shiftTiming: e.target.value })}
                      className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400">OPD Consultation Fee</label>
                    <input
                      type="text"
                      value={clinicSettings.opdFee}
                      onChange={(e) => setClinicSettings({ ...clinicSettings, opdFee: e.target.value })}
                      className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400">Telemedicine Fee</label>
                    <input
                      type="text"
                      value={clinicSettings.telemedicineFee}
                      onChange={(e) => setClinicSettings({ ...clinicSettings, telemedicineFee: e.target.value })}
                      className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setFeedbackMsg({ type: 'success', text: 'Clinic and OPD room settings updated successfully!' });
                      setTimeout(() => setFeedbackMsg(null), 3000);
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Save Clinic Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EMERGENCY WALK-IN APPOINTMENT (Immediate Priority Insertion)     */}
      {/* ========================================================================= */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Add Emergency Walk-in Appointment
                </h3>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmergencyAppointment} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar Singh"
                  value={emergencyForm.patientName}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, patientName: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Age</label>
                  <input
                    type="number"
                    value={emergencyForm.age}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, age: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Gender</label>
                  <select
                    value={emergencyForm.gender}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, gender: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98..."
                  value={emergencyForm.phone}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, phone: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Chief Emergency Complaint *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute chest pain, shortness of breath, trauma"
                  value={emergencyForm.chiefComplaint}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, chiefComplaint: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-rose-600 font-bold"
                />
              </div>

              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-[11px] text-rose-800 dark:text-rose-300 font-medium">
                ⚡ <strong>Priority Preemption Notice:</strong> This patient will immediately be assigned <strong>Priority Token #E-1</strong> and moved to the head of the OPD queue for immediate doctor examination in Room 104.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black cursor-pointer shadow-lg shadow-rose-600/20"
                >
                  Admit Emergency Patient Now →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: COMPLETE CHECKUP & PRESCRIBE                                     */}
      {/* ========================================================================= */}
      {checkupModalAppt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Complete Encounter: {checkupModalAppt.patientName} ({checkupModalAppt.tokenNumber})
                </h3>
              </div>
              <button
                onClick={() => setCheckupModalAppt(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFinishCheckup} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Clinical Diagnosis *</label>
                <input
                  type="text"
                  required
                  value={checkupForm.diagnosis}
                  onChange={(e) => setCheckupForm({ ...checkupForm, diagnosis: e.target.value })}
                  placeholder="e.g. Essential Hypertension Stage 1 with Angina"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Prescribed Medications & Dosages *</label>
                <textarea
                  rows={2}
                  required
                  value={checkupForm.medicines}
                  onChange={(e) => setCheckupForm({ ...checkupForm, medicines: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Clinical Advice & Instructions</label>
                <textarea
                  rows={2}
                  value={checkupForm.instructions}
                  onChange={(e) => setCheckupForm({ ...checkupForm, instructions: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Follow-up Period</label>
                  <select
                    value={checkupForm.followUpDays}
                    onChange={(e) => setCheckupForm({ ...checkupForm, followUpDays: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="7">In 7 Days (1 Week)</option>
                    <option value="14">In 14 Days (2 Weeks)</option>
                    <option value="30">In 30 Days (1 Month)</option>
                    <option value="90">In 3 Months</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Doctor Signature</label>
                  <div className="mt-1 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-black text-center text-xs">
                    ✓ Dr. Rajesh Singh (MD)
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-[11px] text-blue-800 dark:text-blue-300">
                💡 <strong>Automatic Registry Update:</strong> This patient will immediately be added to your <strong>Checked Patients</strong> section with full prescription details, and the next patient in queue will be called.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCheckupModalAppt(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  Confirm Checkup & Prescribe →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient 360 Drawer Component */}
      {selectedPatient360Id && (
        <Patient360Drawer
          patientId={selectedPatient360Id}
          isOpen={!!selectedPatient360Id}
          onClose={() => setSelectedPatient360Id(null)}
        />
      )}
    </div>
  );
}
