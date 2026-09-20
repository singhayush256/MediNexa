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
  Eye,
  Trash2,
  PlusCircle,
  Send,
} from 'lucide-react';

export interface PrescribedMedicineEntry {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  duration: string;
  instructions: string;
  timings?: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  foodTiming?: 'AFTER_FOOD' | 'BEFORE_FOOD' | 'WITH_FOOD';
}

const DEFAULT_PRESCRIBED_MEDS: PrescribedMedicineEntry[] = [
  {
    id: 'med-entry-1',
    name: '',
    dosage: '1 Tab',
    frequency: '1-0-0 (Morning)',
    timing: 'After Food',
    duration: '5 Days',
    instructions: 'Take with water after meals',
    timings: { morning: true, afternoon: false, evening: false, night: false },
    foodTiming: 'AFTER_FOOD',
  },
];

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
  
  // Patient 360 Medical Records & Diagnostic Lightbox State
  const [selectedPatient360, setSelectedPatient360] = useState<{
    id: string;
    name: string;
    age?: number;
    gender?: string;
    phone?: string;
    uhid?: string;
    vitals?: any;
  } | null>(null);

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

  // Complete Clinical Checkup & Dynamic Prescription Modal State
  const [checkupModalAppt, setCheckupModalAppt] = useState<DoctorAppointmentItem | null>(null);
  const [checkupForm, setCheckupForm] = useState({
    bpSystolic: '124',
    bpDiastolic: '82',
    pulse: '74',
    spo2: '98',
    temperature: '98.4',
    bloodSugar: '95',
    weight: '70',
    symptoms: 'Mild chest tightness, episodic palpitation, fatigue',
    examination: 'Chest clear bilaterally, S1/S2 heard normal, no murmur, extremities warm',
    diagnosis: 'Essential (Primary) Hypertension Stage 1',
    medicines: DEFAULT_PRESCRIBED_MEDS,
    orderedLabs: ['12-Lead ECG', 'Lipid Profile', 'Chest X-Ray'] as string[],
    instructions: 'Salt restriction (<5g/day), avoid heavy exertion, 30 min morning brisk walk, repeat ECG in 7 days.',
    followUpDays: '14',
  });
  const [customLabTestInput, setCustomLabTestInput] = useState('');

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

  // Open Complete Checkup Modal with parsed triage vitals & initial medicines
  const handleOpenCheckupModal = (appt: DoctorAppointmentItem) => {
    let sys = '124';
    let dia = '82';
    if (appt.vitals?.bp) {
      const match = appt.vitals.bp.match(/(\d+)\/(\d+)/);
      if (match) {
        sys = match[1];
        dia = match[2];
      }
    }
    setCheckupForm({
      bpSystolic: sys,
      bpDiastolic: dia,
      pulse: appt.vitals?.pulse ? String(appt.vitals.pulse) : '74',
      spo2: appt.vitals?.spo2 ? String(appt.vitals.spo2) : '98',
      temperature: appt.vitals?.temp ? appt.vitals.temp.replace(/[^\d.]/g, '') : '98.4',
      bloodSugar: '95',
      weight: '70',
      symptoms: appt.reason || 'General health consultation',
      examination: 'Bilateral chest clear, regular rhythm, no pedal edema, abdomen soft',
      diagnosis: appt.isEmergency
        ? 'Acute Coronary Syndrome / Hypertensive Urgency'
        : appt.reason
        ? `${appt.reason} - Evaluated`
        : 'Essential (Primary) Hypertension Stage 1',
      medicines: [
        {
          id: `med-${Date.now()}-1`,
          name: '', // Empty, doctor can write immediately!
          dosage: '1 Tab',
          frequency: '1-0-0 (Morning)',
          timing: 'After Food',
          duration: '5 Days',
          instructions: 'Take with water after meals',
          timings: { morning: true, afternoon: false, evening: false, night: false },
          foodTiming: 'AFTER_FOOD',
        },
      ],
      orderedLabs: ['12-Lead ECG', 'Lipid Profile'],
      instructions: 'Low sodium cardiac diet, daily brisk walking 30 mins, review in cardiology OPD.',
      followUpDays: '14',
    });
    setCheckupModalAppt(appt);
  };

  // Medicine Prescription Helpers for Free-Text Writing, Regimens & Reminders
  const handleAddMedicineRow = () => {
    setCheckupForm((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        {
          id: `med-${Date.now()}-${prev.medicines.length + 1}`,
          name: '', // Empty ready to write
          dosage: '1 Tab',
          frequency: '1-0-0 (Morning)',
          timing: 'After Food',
          duration: '5 Days',
          instructions: 'Take with water after meals',
          timings: { morning: true, afternoon: false, evening: false, night: false },
          foodTiming: 'AFTER_FOOD',
        },
      ],
    }));
  };

  const handleAddBatchMedicineRows = (count: number) => {
    const newItems: PrescribedMedicineEntry[] = Array.from({ length: count }, (_, i) => ({
      id: `med-${Date.now()}-${i}-${Math.random().toString(36).slice(-4)}`,
      name: '',
      dosage: '1 Tab',
      frequency: '1-0-1 (Morning & Night)',
      timing: 'After Food',
      duration: '5 Days',
      instructions: 'Take with water after meals',
      timings: { morning: true, afternoon: false, evening: false, night: true },
      foodTiming: 'AFTER_FOOD',
    }));
    setCheckupForm((prev) => ({
      ...prev,
      medicines: [...prev.medicines, ...newItems],
    }));
  };

  const handleApplyClinicalRegimen = (regimen: 'CARDIO' | 'HTN' | 'DIABETES' | 'POST_OP') => {
    let batch: PrescribedMedicineEntry[] = [];
    if (regimen === 'CARDIO') {
      batch = [
        {
          id: `med-${Date.now()}-c1`,
          name: 'Aspirin 75mg (Ecosprin 75)',
          dosage: '75mg',
          frequency: '1-0-0 (Morning)',
          timing: 'After Food',
          duration: '30 Days',
          instructions: 'Take once daily after morning breakfast',
          timings: { morning: true, afternoon: false, evening: false, night: false },
          foodTiming: 'AFTER_FOOD',
        },
        {
          id: `med-${Date.now()}-c2`,
          name: 'Atorvastatin 20mg (Atorva 20)',
          dosage: '20mg',
          frequency: '0-0-1 (Bedtime)',
          timing: 'After Food',
          duration: '30 Days',
          instructions: 'Take once daily at bedtime',
          timings: { morning: false, afternoon: false, evening: false, night: true },
          foodTiming: 'AFTER_FOOD',
        },
        {
          id: `med-${Date.now()}-c3`,
          name: 'Bisoprolol 5mg (Concor 5)',
          dosage: '5mg',
          frequency: '1-0-0 (Morning)',
          timing: 'After Food',
          duration: '30 Days',
          instructions: 'Take once daily in morning',
          timings: { morning: true, afternoon: false, evening: false, night: false },
          foodTiming: 'AFTER_FOOD',
        },
      ];
    } else if (regimen === 'HTN') {
      batch = [
        {
          id: `med-${Date.now()}-h1`,
          name: 'Telmisartan 40mg (Telma 40)',
          dosage: '40mg',
          frequency: '1-0-0 (Morning)',
          timing: 'After Food',
          duration: '30 Days',
          instructions: 'Take once daily after breakfast',
          timings: { morning: true, afternoon: false, evening: false, night: false },
          foodTiming: 'AFTER_FOOD',
        },
        {
          id: `med-${Date.now()}-h2`,
          name: 'Amlodipine 5mg (Amlokind 5)',
          dosage: '5mg',
          frequency: '0-0-1 (Bedtime)',
          timing: 'After Food',
          duration: '30 Days',
          instructions: 'Take once daily at bedtime',
          timings: { morning: false, afternoon: false, evening: false, night: true },
          foodTiming: 'AFTER_FOOD',
        },
        {
          id: `med-${Date.now()}-h3`,
          name: 'Hydrochlorothiazide 12.5mg',
          dosage: '12.5mg',
          frequency: '1-0-0 (Morning)',
          timing: 'After Food',
          duration: '30 Days',
          instructions: 'Take once daily in morning with water',
          timings: { morning: true, afternoon: false, evening: false, night: false },
          foodTiming: 'AFTER_FOOD',
        },
      ];
    } else if (regimen === 'DIABETES') {
      batch = [
        {
          id: `med-${Date.now()}-d1`,
          name: 'Metformin 500mg SR (Glycomet 500 SR)',
          dosage: '500mg',
          frequency: '1-0-1 (Twice Daily)',
          timing: 'With Food',
          duration: '30 Days',
          instructions: 'Take with breakfast and dinner',
          timings: { morning: true, afternoon: false, evening: false, night: true },
          foodTiming: 'WITH_FOOD',
        },
        {
          id: `med-${Date.now()}-d2`,
          name: 'Teneligliptin 20mg (Ziten 20)',
          dosage: '20mg',
          frequency: '1-0-0 (Morning)',
          timing: 'After Food',
          duration: '30 Days',
          instructions: 'Take once daily with morning meal',
          timings: { morning: true, afternoon: false, evening: false, night: false },
          foodTiming: 'AFTER_FOOD',
        },
      ];
    } else if (regimen === 'POST_OP') {
      batch = [
        {
          id: `med-${Date.now()}-p1`,
          name: 'Augmentin 625 Duo (Amoxyclav 625mg)',
          dosage: '625mg',
          frequency: '1-0-1 (Twice Daily)',
          timing: 'After Food',
          duration: '5 Days',
          instructions: 'Complete full 5-day antibiotic course',
          timings: { morning: true, afternoon: false, evening: false, night: true },
          foodTiming: 'AFTER_FOOD',
        },
        {
          id: `med-${Date.now()}-p2`,
          name: 'Dolo 650 (Paracetamol 650mg)',
          dosage: '650mg',
          frequency: 'SOS (As Needed)',
          timing: 'After Food',
          duration: '3 Days',
          instructions: 'Take after food for pain or fever',
          timings: { morning: true, afternoon: true, evening: false, night: true },
          foodTiming: 'AFTER_FOOD',
        },
        {
          id: `med-${Date.now()}-p3`,
          name: 'Pan 40 (Pantoprazole 40mg)',
          dosage: '40mg',
          frequency: '1-0-0 (Morning)',
          timing: 'Before Food',
          duration: '5 Days',
          instructions: 'Take 30 mins before breakfast',
          timings: { morning: true, afternoon: false, evening: false, night: false },
          foodTiming: 'BEFORE_FOOD',
        },
      ];
    }
    setCheckupForm((prev) => ({
      ...prev,
      medicines: [...prev.medicines.filter((m) => m.name.trim() !== ''), ...batch],
    }));
  };

  const handleUpdateMedicineTiming = (
    medId: string,
    slot: 'morning' | 'afternoon' | 'evening' | 'night',
    checked: boolean,
  ) => {
    setCheckupForm((prev) => {
      const updated = prev.medicines.map((m) => {
        if (m.id !== medId) return m;
        const currentTimings = m.timings || {
          morning: m.frequency?.includes('1-0-0') || m.frequency?.includes('1-0-1') || m.frequency?.includes('1-1-1'),
          afternoon: m.frequency?.includes('1-1-1'),
          evening: false,
          night: m.frequency?.includes('0-0-1') || m.frequency?.includes('1-0-1') || m.frequency?.includes('1-1-1'),
        };
        const nextTimings = { ...currentTimings, [slot]: checked };
        const activeCount = [nextTimings.morning, nextTimings.afternoon, nextTimings.evening, nextTimings.night].filter(Boolean).length;
        let freqStr = 'SOS (As Needed)';
        if (nextTimings.morning && nextTimings.night && !nextTimings.afternoon && !nextTimings.evening) {
          freqStr = '1-0-1 (Morning & Night)';
        } else if (nextTimings.morning && !nextTimings.afternoon && !nextTimings.evening && !nextTimings.night) {
          freqStr = '1-0-0 (Morning)';
        } else if (!nextTimings.morning && !nextTimings.afternoon && !nextTimings.evening && nextTimings.night) {
          freqStr = '0-0-1 (Bedtime)';
        } else if (activeCount === 3) {
          freqStr = '1-1-1 (Thrice Daily)';
        } else if (activeCount === 4) {
          freqStr = '1-1-1-1 (4 Times Daily)';
        } else if (activeCount === 2) {
          freqStr = 'Twice Daily';
        } else if (activeCount === 1) {
          freqStr = 'Once Daily';
        }
        return {
          ...m,
          timings: nextTimings,
          frequency: freqStr,
        };
      });
      return { ...prev, medicines: updated };
    });
  };

  const handleUpdateMedicineField = (medId: string, field: string, value: any) => {
    setCheckupForm((prev) => ({
      ...prev,
      medicines: prev.medicines.map((m) => (m.id === medId ? { ...m, [field]: value } : m)),
    }));
  };

  const handleRemoveMedicineRow = (medId: string) => {
    if (checkupForm.medicines.length <= 1) return;
    setCheckupForm((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((m) => m.id !== medId),
    }));
  };

  // Dispatch Diagnostic Test Orders to Central Laboratory (Privacy-Guarded: No Medical History Sent)
  const handleDispatchLabOrders = (targetAppt: DoctorAppointmentItem, tests: string[]) => {
    if (!tests || tests.length === 0) return 0;
    try {
      const mapTestToDepartment = (tName: string): 'XRAY' | 'CARDIOLOGY' | 'USG' | 'MRI' | 'CT' | 'PATHOLOGY' => {
        const lower = tName.toLowerCase();
        if (lower.includes('x-ray') || lower.includes('xray') || lower.includes('radiograph')) return 'XRAY';
        if (lower.includes('ecg') || lower.includes('echo') || lower.includes('cardio')) return 'CARDIOLOGY';
        if (lower.includes('ultrasound') || lower.includes('usg') || lower.includes('sonogram')) return 'USG';
        if (lower.includes('mri')) return 'MRI';
        if (lower.includes('ct') || lower.includes('hrct')) return 'CT';
        return 'PATHOLOGY';
      };

      const newDiagnosticOrders = tests.map((testName, idx) => {
        const dept = mapTestToDepartment(testName);
        const prefix = dept === 'XRAY' ? 'XR' : dept === 'CARDIOLOGY' ? 'CARD' : dept === 'USG' ? 'USG' : dept === 'MRI' ? 'MRI' : dept === 'CT' ? 'CT' : 'LAB';
        return {
          id: `diag-ord-${Date.now()}-${idx}`,
          orderNumber: `${prefix}-2026-${Date.now().toString().slice(-4)}-0${idx + 1}`,
          department: dept,
          testName: testName,
          category: `${dept}_DIAGNOSTICS`,
          patientName: targetAppt.patientName,
          patientId: targetAppt.patientId || targetAppt.id,
          mrn: targetAppt.appointmentNumber || `MRN-${Date.now().toString().slice(-5)}`,
          doctorName: clinicSettings.doctorName,
          priority: targetAppt.isEmergency ? 'STAT' : 'URGENT',
          status: 'ORDERED' as const, // Pending sample collection and real scan picture upload by Lab Tech
          orderedAt: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
          // PRIVACY ACCESS CONTROL: Medical history, past encounters, and diagnoses are strictly NOT sent to lab staff!
          technologistRemarks: `Diagnostic test ordered by ${clinicSettings.doctorName}. Awaiting sample collection & real scan picture upload.`,
        };
      });

      const storedDiag = localStorage.getItem('medinexa_unified_diagnostic_orders');
      const existingDiag = storedDiag ? JSON.parse(storedDiag) : [];
      localStorage.setItem('medinexa_unified_diagnostic_orders', JSON.stringify([...newDiagnosticOrders, ...existingDiag]));
      return newDiagnosticOrders.length;
    } catch (err) {
      console.warn('Failed dispatching lab orders:', err);
      return 0;
    }
  };

  // Submit Checkup & Finish Encounter with Instant Real-Time Patient Account Sync
  const handleFinishCheckup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkupModalAppt) return;

    const validMedicines = checkupForm.medicines.filter((m) => m.name && m.name.trim() !== '');
    if (validMedicines.length === 0) {
      setFeedbackMsg({
        type: 'error',
        text: '⚠️ Please write at least one medicine name or choose a quick regimen before submitting.',
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
      return;
    }

    const prescribedSummary = validMedicines
      .map((m) => `${m.name} (${m.dosage || '1 Tab'}, ${m.frequency || '1-0-0'})`)
      .join('; ');

    // 1. Mark this appointment as COMPLETED in Doctor Workstation Queue
    const updatedAppts = appointments.map((a) => {
      if (a.id === checkupModalAppt.id) {
        return {
          ...a,
          status: 'COMPLETED' as const,
          consultationSummary: {
            diagnosis: checkupForm.diagnosis,
            medicines: prescribedSummary,
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
      prescribedMedicines: prescribedSummary,
      instructions: checkupForm.instructions,
      followUpDays: parseInt(checkupForm.followUpDays, 10) || 14,
    };

    const updatedChecked = [newRecord, ...checkedPatients];
    persistCheckedPatients(updatedChecked);

    // 3. INSTANT SYNCHRONIZATION TO PATIENT ACCOUNT (Prescriptions, Reminders, Notifications, Local Appt)
    if (typeof window !== 'undefined') {
      try {
        // A. Push newly prescribed items to medinexa_patient_prescriptions
        const newPrescriptionItems = validMedicines.map((m, idx) => ({
          id: `rx-presc-${Date.now()}-${idx}`,
          drugName: m.name,
          genericName: m.name,
          dosage: m.dosage || '1 Tab',
          frequency: m.frequency || '1-0-0 (Morning)',
          duration: `${m.duration || '5 Days'} (Active)`,
          timing: m.timing || (m.foodTiming === 'BEFORE_FOOD' ? 'Before Food' : 'After Food'),
          refillsLeft: 2,
          prescribedBy: clinicSettings.doctorName,
          prescribedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          status: 'ACTIVE',
          isLabMedicine: false,
          purchaseStatus: 'NOT_BOUGHT',
          instructions: m.instructions || checkupForm.instructions,
        }));
        const storedRx = localStorage.getItem('medinexa_patient_prescriptions');
        const parsedRx = storedRx ? JSON.parse(storedRx) : [];
        localStorage.setItem('medinexa_patient_prescriptions', JSON.stringify([...newPrescriptionItems, ...parsedRx]));

        // B. Push to medinexa_patient_self_meds for daily medication reminder schedule
        const newReminders = validMedicines.map((m, idx) => {
          const t = m.timings || {
            morning: m.frequency?.includes('1-0-0') || m.frequency?.includes('1-0-1') || m.frequency?.includes('1-1-1'),
            afternoon: m.frequency?.includes('1-1-1'),
            evening: false,
            night: m.frequency?.includes('0-0-1') || m.frequency?.includes('1-0-1') || m.frequency?.includes('1-1-1'),
          };
          const activeTimings: string[] = [];
          if (t.morning) activeTimings.push('MORNING');
          if (t.afternoon) activeTimings.push('AFTERNOON');
          if (t.evening) activeTimings.push('EVENING');
          if (t.night) activeTimings.push('NIGHT');
          if (activeTimings.length === 0) activeTimings.push('MORNING');

          const isNightOnly = activeTimings.length === 1 && activeTimings[0] === 'NIGHT';
          const foodTimingStr = m.foodTiming || (m.timing?.toLowerCase().includes('before') ? 'BEFORE_FOOD' : 'AFTER_FOOD');

          return {
            id: `self-med-${Date.now()}-${idx}`,
            medicineName: m.name,
            dosage: m.dosage || '1 Tab',
            frequency:
              activeTimings.length === 2
                ? 'TWICE_DAILY'
                : activeTimings.length >= 3
                ? 'THREE_TIMES_DAILY'
                : 'ONCE_DAILY',
            foodTiming: foodTimingStr,
            scheduledTime: isNightOnly ? '09:00 PM' : '08:00 AM',
            timeSlot: isNightOnly ? 'NIGHT' : 'MORNING',
            timings: activeTimings,
            status: 'PENDING',
            startDate: new Date().toISOString().split('T')[0],
            durationDays: parseInt(m.duration, 10) || 14,
            doctorName: clinicSettings.doctorName,
            prescribedBy: clinicSettings.doctorName,
            instructions: m.instructions || checkupForm.instructions,
          };
        });
        const storedSelf = localStorage.getItem('medinexa_patient_self_meds');
        const parsedSelf = storedSelf ? JSON.parse(storedSelf) : [];
        localStorage.setItem('medinexa_patient_self_meds', JSON.stringify([...newReminders, ...parsedSelf]));

        // C. Dispatch alert into medinexa_patient_notifications
        const storedNotifs = localStorage.getItem('medinexa_patient_notifications');
        const parsedNotifs = storedNotifs ? JSON.parse(storedNotifs) : [];
        const newNotification = {
          id: `notif-${Date.now()}`,
          title: `🩺 New Prescription from Dr. Rajesh Singh`,
          body: `Consultation completed for ${checkupModalAppt.patientName} (${checkupModalAppt.tokenNumber}). Prescribed: ${validMedicines.map((m) => m.name).join(', ')}. Review in ${checkupForm.followUpDays} days.`,
          type: 'PRESCRIPTION',
          read: false,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('medinexa_patient_notifications', JSON.stringify([newNotification, ...parsedNotifs]));

        // D. Update medinexa_local_appointments to COMPLETED with attached diagnosis & Rx
        const storedAppts = localStorage.getItem('medinexa_local_appointments');
        if (storedAppts) {
          const parsedAppts = JSON.parse(storedAppts);
          const updatedLocalAppts = parsedAppts.map((a: any) => {
            if (
              a.id === checkupModalAppt.id ||
              a.appointmentNumber === checkupModalAppt.appointmentNumber ||
              (a.patientName && a.patientName === checkupModalAppt.patientName)
            ) {
              return {
                ...a,
                status: 'COMPLETED',
                queueTokenNumber: checkupModalAppt.tokenNumber,
                diagnosis: checkupForm.diagnosis,
                doctorNotes: checkupForm.instructions,
                prescribedMedicines: prescribedSummary,
                followUpDays: checkupForm.followUpDays,
              };
            }
            return a;
          });
          localStorage.setItem('medinexa_local_appointments', JSON.stringify(updatedLocalAppts));
        }

        // E. Dispatch Ordered Diagnostic Tests directly to Central Lab (Privacy Guarded: No Medical History Sent)
        if (checkupForm.orderedLabs && checkupForm.orderedLabs.length > 0) {
          handleDispatchLabOrders(checkupModalAppt, checkupForm.orderedLabs);
        }
      } catch (err) {
        console.warn('Patient account sync error:', err);
      }
    }

    // 4. Reset and Notify
    const completedName = checkupModalAppt.patientName;
    const labCount = checkupForm.orderedLabs.length;
    setCheckupModalAppt(null);
    setFeedbackMsg({
      type: 'success',
      text: `✓ Checkup & Rx sent to ${completedName}! ${labCount > 0 ? `(${labCount} diagnostic tests routed to Lab for real scan/photo upload)` : ''}`,
    });
    setTimeout(() => setFeedbackMsg(null), 5000);
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
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedPatient360({
                                  id: currentlyConsulting.patientId || currentlyConsulting.id,
                                  name: currentlyConsulting.patientName,
                                  age: currentlyConsulting.patientAge,
                                  gender: currentlyConsulting.patientGender,
                                  phone: currentlyConsulting.patientPhone,
                                  uhid: currentlyConsulting.appointmentNumber,
                                  vitals: currentlyConsulting.vitals,
                                })
                              }
                              className="text-lg font-black text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                              title="Click to view full medical history, past doctor checkups, medicines and X-ray/scans"
                            >
                              <span>{currentlyConsulting.patientName}</span>
                              <Eye className="w-4 h-4 text-blue-500" />
                            </button>
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

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedPatient360({
                                id: currentlyConsulting.patientId || currentlyConsulting.id,
                                name: currentlyConsulting.patientName,
                                age: currentlyConsulting.patientAge,
                                gender: currentlyConsulting.patientGender,
                                phone: currentlyConsulting.patientPhone,
                                uhid: currentlyConsulting.appointmentNumber,
                                vitals: currentlyConsulting.vitals,
                              })
                            }
                            className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                            title="Inspect Medical 360, X-Rays, Scans & Prescriptions"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                            <span>Medical 360 & Scans</span>
                          </button>
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
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedPatient360({
                                  id: item.patientId || item.id,
                                  name: item.patientName,
                                  age: item.patientAge,
                                  gender: item.patientGender,
                                  phone: item.patientPhone,
                                  uhid: item.appointmentNumber,
                                  vitals: item.vitals,
                                })
                              }
                              className="font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate max-w-[120px] text-left cursor-pointer"
                              title="Click to inspect full medical history & scans"
                            >
                              {item.patientName}
                            </button>
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
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedPatient360({
                                    id: appt.patientId || appt.id,
                                    name: appt.patientName,
                                    age: appt.patientAge,
                                    gender: appt.patientGender,
                                    phone: appt.patientPhone,
                                    uhid: appt.appointmentNumber,
                                    vitals: appt.vitals,
                                  })
                                }
                                className="font-black text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 hover:underline cursor-pointer text-left flex items-center gap-1.5 group"
                                title="Click to view full medical history, past doctor checkups, medicines and X-ray/scans"
                              >
                                <span>{appt.patientName}</span>
                                <Eye className="w-3.5 h-3.5 text-blue-500 opacity-70 group-hover:opacity-100 transition" />
                              </button>
                              <div className="text-[11px] text-slate-400 mt-0.5">
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
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedPatient360({
                                  id: appt.patientId || appt.id,
                                  name: appt.patientName,
                                  age: appt.patientAge,
                                  gender: appt.patientGender,
                                  phone: appt.patientPhone,
                                  uhid: appt.appointmentNumber,
                                  vitals: appt.vitals,
                                })
                              }
                              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 transition cursor-pointer inline-flex items-center"
                              title="Inspect Medical 360, X-Rays, Scans & Prescriptions"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

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
                              <span className="text-[11px] font-bold text-emerald-600 inline-flex items-center justify-end gap-1">
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
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedPatient360({
                                  id: patient.id,
                                  name: patient.patientName,
                                  age: patient.patientAge,
                                  gender: patient.patientGender,
                                  phone: patient.patientPhone,
                                  uhid: patient.uhid,
                                })
                              }
                              className="text-base font-black text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 hover:underline cursor-pointer flex items-center gap-1.5 text-left"
                              title="Click to view full medical history, past doctor encounters, medicines and diagnostic scans"
                            >
                              <span>{patient.patientName}</span>
                              <Eye className="w-4 h-4 text-blue-500" />
                            </button>
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
      {/* MODAL 2: COMPLETE CLINICAL CHECKUP & MULTI-MEDICINE PRESCRIBE WORKSTATION */}
      {/* ========================================================================= */}
      {checkupModalAppt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col my-auto max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white flex justify-between items-center shadow-md flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold shadow-inner">
                  <Stethoscope className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black tracking-tight">
                      Clinical Encounter: {checkupModalAppt.patientName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white">
                      {checkupModalAppt.tokenNumber}
                    </span>
                  </div>
                  <p className="text-blue-200 text-xs mt-0.5">
                    {checkupModalAppt.patientAge} yrs • {checkupModalAppt.patientGender} • Phone: {checkupModalAppt.patientPhone} • Room 104
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPatient360({
                      id: checkupModalAppt.patientId || checkupModalAppt.id,
                      name: checkupModalAppt.patientName,
                      age: checkupModalAppt.patientAge,
                      gender: checkupModalAppt.patientGender,
                      phone: checkupModalAppt.patientPhone,
                      uhid: checkupModalAppt.appointmentNumber,
                      vitals: checkupModalAppt.vitals,
                    })
                  }
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/20"
                  title="View past doctor encounters, medicines and X-ray/scans"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-300" />
                  <span>View 360 History & Scans</span>
                </button>
                <button
                  onClick={() => setCheckupModalAppt(null)}
                  className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleFinishCheckup} className="p-6 space-y-6 overflow-y-auto text-xs">

              {/* 1. TRIAGE VITALS ENTRY */}
              <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-rose-500" />
                    <span>Clinical Triage Vitals (Recorded at Encounter)</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">Auto-synced from triage desk</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">BP Systolic / Dia</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={checkupForm.bpSystolic}
                        onChange={(e) => setCheckupForm({ ...checkupForm, bpSystolic: e.target.value })}
                        className="w-14 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-black text-rose-600"
                        placeholder="120"
                      />
                      <span className="text-slate-400 font-bold">/</span>
                      <input
                        type="text"
                        value={checkupForm.bpDiastolic}
                        onChange={(e) => setCheckupForm({ ...checkupForm, bpDiastolic: e.target.value })}
                        className="w-14 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-black text-rose-600"
                        placeholder="80"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Pulse (bpm)</label>
                    <input
                      type="text"
                      value={checkupForm.pulse}
                      onChange={(e) => setCheckupForm({ ...checkupForm, pulse: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-black text-blue-600"
                      placeholder="72"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">SpO2 Oxygen (%)</label>
                    <input
                      type="text"
                      value={checkupForm.spo2}
                      onChange={(e) => setCheckupForm({ ...checkupForm, spo2: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-black text-teal-600"
                      placeholder="98"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Temperature (°F)</label>
                    <input
                      type="text"
                      value={checkupForm.temperature}
                      onChange={(e) => setCheckupForm({ ...checkupForm, temperature: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-black text-amber-600"
                      placeholder="98.4"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Blood Sugar (mg/dL)</label>
                    <input
                      type="text"
                      value={checkupForm.bloodSugar}
                      onChange={(e) => setCheckupForm({ ...checkupForm, bloodSugar: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-black text-purple-600"
                      placeholder="95"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Weight (kg)</label>
                    <input
                      type="text"
                      value={checkupForm.weight}
                      onChange={(e) => setCheckupForm({ ...checkupForm, weight: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-black text-slate-700 dark:text-slate-200"
                      placeholder="70"
                    />
                  </div>
                </div>
              </div>

              {/* 2. SYMPTOMS & CLINICAL OBSERVATIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Chief Complaints & Presenting Symptoms
                  </label>
                  <input
                    type="text"
                    value={checkupForm.symptoms}
                    onChange={(e) => setCheckupForm({ ...checkupForm, symptoms: e.target.value })}
                    placeholder="e.g. Occasional chest tightness, palpitation, shortness of breath"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Physical & Systemic Examination Notes
                  </label>
                  <input
                    type="text"
                    value={checkupForm.examination}
                    onChange={(e) => setCheckupForm({ ...checkupForm, examination: e.target.value })}
                    placeholder="e.g. S1 S2 heard normal, chest clear, no ankle edema"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* 3. PRIMARY CLINICAL DIAGNOSIS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Clinical Diagnosis & Impression *
                  </label>
                  <span className="text-[10px] text-slate-400">Click a chip for quick auto-fill:</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Essential Hypertension Stage 1',
                    'Acute Coronary Syndrome',
                    'Type 2 Diabetes Mellitus',
                    'Acute Bronchitis',
                    'Migraine Headache',
                    'Dyspepsia & GERD',
                    'Viral Pyrexia',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setCheckupForm({ ...checkupForm, diagnosis: chip })}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-bold transition cursor-pointer border border-blue-200/60 dark:border-blue-800"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  required
                  value={checkupForm.diagnosis}
                  onChange={(e) => setCheckupForm({ ...checkupForm, diagnosis: e.target.value })}
                  placeholder="Enter primary clinical diagnosis..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              {/* 4. MULTI-MEDICINE DYNAMIC PRESCRIPTION BUILDER */}
              <div className="space-y-3.5 p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-800/40 rounded-3xl border border-slate-200/90 dark:border-slate-800">
                {/* Clinical Drug Datalist for Autocomplete & Suggestions */}
                <datalist id="doctor-medications-catalog">
                  <option value="Dolo 650 (Paracetamol 650mg)">Paracetamol 650mg — Antipyretic & Analgesic</option>
                  <option value="Pan 40 (Pantoprazole 40mg)">Pantoprazole 40mg — Antacid / PPI</option>
                  <option value="Pan-D (Pantoprazole 40mg + Domperidone 30mg)">Pan-D SR — GERD & Acid Reflux</option>
                  <option value="Telma 40 (Telmisartan 40mg)">Telmisartan 40mg — Antihypertensive ARB</option>
                  <option value="Telma H (Telmisartan 40mg + HCTZ 12.5mg)">Telmisartan + Hydrochlorothiazide</option>
                  <option value="Telma AM (Telmisartan 40mg + Amlodipine 5mg)">Telmisartan + Amlodipine Dual BP</option>
                  <option value="Augmentin 625 Duo (Amoxyclav 625mg)">Amoxicillin 500mg + Clavulanic Acid 125mg</option>
                  <option value="Atorva 20 (Atorvastatin 20mg)">Atorvastatin 20mg — Lipid Lowering Statin</option>
                  <option value="Atorva 10 (Atorvastatin 10mg)">Atorvastatin 10mg — Cholesterol Control</option>
                  <option value="Rosuvas 10 (Rosuvastatin 10mg)">Rosuvastatin 10mg — High Potency Statin</option>
                  <option value="Glycomet 500 SR (Metformin 500mg)">Metformin HCl 500mg SR — Anti-Diabetic</option>
                  <option value="Glycomet Trio 2 (Glimepiride + Metformin + Voglibose)">Triple Drug Diabetes Care</option>
                  <option value="Montair LC (Montelukast 10mg + Levocetirizine 5mg)">Anti-Allergic & Bronchodilator</option>
                  <option value="Azee 500 (Azithromycin 500mg)">Azithromycin 500mg — Broad Spectrum Antibiotic</option>
                  <option value="Amlokind 5 (Amlodipine 5mg)">Amlodipine Besylate 5mg — Calcium Channel Blocker</option>
                  <option value="Ecosprin 75 (Aspirin 75mg)">Aspirin 75mg — Antiplatelet Blood Thinner</option>
                  <option value="Ecosprin AV 75/20 (Aspirin + Atorvastatin)">Dual Cardioprotective Therapy</option>
                  <option value="Concor 5 (Bisoprolol 5mg)">Bisoprolol Fumarate 5mg — Cardioselective Beta Blocker</option>
                  <option value="Metosartan 50 (Metoprolol 50mg + Telmisartan 40mg)">Dual Cardio BP Protection</option>
                  <option value="Cilacar 10 (Cilnidipine 10mg)">Cilnidipine 10mg — Dual L/N Channel Blocker</option>
                  <option value="Zifi 200 (Cefixime 200mg)">Cefixime 200mg — Cephalosporin Antibiotic</option>
                  <option value="Monocef-O 200 (Cefpodoxime 200mg)">Cefpodoxime Proxetil 200mg</option>
                  <option value="Calpol 650 (Paracetamol 650mg)">Paracetamol 650mg — Fever & Pain</option>
                  <option value="Allegra 120mg (Fexofenadine 120mg)">Fexofenadine Non-Drowsy Antihistamine</option>
                  <option value="Cetzine 10mg (Cetirizine 10mg)">Cetirizine Hydrochloride 10mg</option>
                  <option value="Ascoril LS Syrup">Levosalbutamol + Ambroxol + Guaiphenesin Cough Syrup</option>
                  <option value="Shelcal 500 (Calcium + Vitamin D3)">Elemental Calcium 500mg + Vit D3 250 IU</option>
                  <option value="Neurobion Forte (B-Complex + B12)">Neurotropic Vitamin Supplement</option>
                  <option value="Becosules Z Capsules">Vitamin B-Complex + Vitamin C + Zinc</option>
                  <option value="Thyronorm 50mcg (Thyroxine Sodium)">Levothyroxine 50 mcg — Thyroid Care</option>
                  <option value="Thyronorm 100mcg (Thyroxine Sodium)">Levothyroxine 100 mcg — Thyroid Care</option>
                  <option value="Meftal Spas (Mefenamic Acid + Dicyclomine)">Antispasmodic Abdominal Pain Relief</option>
                  <option value="Ondem 4 (Ondansetron 4mg)">Ondansetron 4mg — Anti-Emetic / Nausea Relief</option>
                  <option value="Razo 20 (Rabeprazole 20mg)">Rabeprazole Sodium 20mg — Fast Acid Relief</option>
                  <option value="Combiflam (Ibuprofen 400mg + Paracetamol 325mg)">Dual Action Pain & Anti-inflammatory</option>
                  <option value="Digene Gel Antacid (Mint Flavour)">Magnesium Hydroxide + Aluminium Hydroxide Gel</option>
                </datalist>

                {/* Section Header with Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-200/80 dark:border-slate-700/80">
                  <div>
                    <span className="text-[11px] font-black uppercase text-blue-700 dark:text-blue-400 flex items-center gap-1.5 tracking-wider">
                      <Pill className="w-4 h-4 text-blue-600" />
                      <span>Prescribed Medications & Dosages ({checkupForm.medicines.length} Items)</span>
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Type medicine name freely, add multiple rows in one click, and tick dose timings to automatically configure patient reminders.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddMedicineRow}
                      id="add-medicine-row-btn"
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/25 transition active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add 1 Row (Write Medicine)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBatchMedicineRows(3)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1 border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
                      title="Add 3 blank rows for typing"
                    >
                      <Zap className="w-3 h-3 text-indigo-600" />
                      <span>+3 Rows</span>
                    </button>
                  </div>
                </div>

                {/* 1-Click Clinical Regimen Presets Bar */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-600" />
                      <span>⚡ 1-Click Batch Clinical Regimens (Populates Complete Drug Set)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Click to batch add</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyClinicalRegimen('CARDIO')}
                      className="px-2.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-left transition shadow-xs cursor-pointer"
                    >
                      ⚡ Cardio Regimen
                      <span className="block text-[9px] font-normal text-blue-100">Aspirin + Atorva + Bisoprolol</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyClinicalRegimen('HTN')}
                      className="px-2.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-left transition shadow-xs cursor-pointer"
                    >
                      ⚡ Anti-HTN Trio
                      <span className="block text-[9px] font-normal text-indigo-100">Telma + Amlodipine + HCTZ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyClinicalRegimen('DIABETES')}
                      className="px-2.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-left transition shadow-xs cursor-pointer"
                    >
                      ⚡ Diabetes Dual
                      <span className="block text-[9px] font-normal text-emerald-100">Glycomet + Teneligliptin</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyClinicalRegimen('POST_OP')}
                      className="px-2.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs text-left transition shadow-xs cursor-pointer"
                    >
                      ⚡ Post-OP / Infection
                      <span className="block text-[9px] font-normal text-amber-100">Augmentin + Dolo + Pan 40</span>
                    </button>
                  </div>
                </div>

                {/* Quick Add Medication Chips */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Or Quick Add Common Indian Medicines:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'Dolo 650 (Paracetamol 650mg)', dose: '650mg', time: 'After Food', dur: '5 Days', freq: 'SOS (As Needed)', t: { morning: true, afternoon: true, evening: false, night: true } },
                      { name: 'Pan 40 (Pantoprazole 40mg)', dose: '40mg', time: 'Before Food', dur: '14 Days', freq: '1-0-0 (Morning)', t: { morning: true, afternoon: false, evening: false, night: false } },
                      { name: 'Telma 40 (Telmisartan 40mg)', dose: '40mg', time: 'After Food', dur: '30 Days', freq: '1-0-0 (Morning)', t: { morning: true, afternoon: false, evening: false, night: false } },
                      { name: 'Augmentin 625 Duo', dose: '625mg', time: 'After Food', dur: '5 Days', freq: '1-0-1 (Twice Daily)', t: { morning: true, afternoon: false, evening: false, night: true } },
                      { name: 'Atorva 20 (Atorvastatin 20mg)', dose: '20mg', time: 'After Food', dur: '90 Days', freq: '0-0-1 (Bedtime)', t: { morning: false, afternoon: false, evening: false, night: true } },
                      { name: 'Glycomet 500 SR', dose: '500mg', time: 'With Food', dur: '30 Days', freq: '1-0-1 (Twice Daily)', t: { morning: true, afternoon: false, evening: false, night: true } },
                      { name: 'Montair LC', dose: '10mg/5mg', time: 'After Food', dur: '10 Days', freq: '0-0-1 (Bedtime)', t: { morning: false, afternoon: false, evening: false, night: true } },
                      { name: 'Azithral 500 (Azithromycin 500mg)', dose: '500mg', time: 'After Food', dur: '3 Days', freq: '1-0-0 (Morning)', t: { morning: true, afternoon: false, evening: false, night: false } },
                    ].map((m) => (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() =>
                          setCheckupForm((prev) => ({
                            ...prev,
                            medicines: [
                              ...prev.medicines,
                              {
                                id: `med-${Date.now()}-${Math.random().toString(36).slice(-4)}`,
                                name: m.name,
                                dosage: m.dose,
                                frequency: m.freq,
                                timing: m.time,
                                duration: m.dur,
                                instructions: 'Take as advised with water',
                                timings: m.t,
                                foodTiming: m.time === 'Before Food' ? 'BEFORE_FOOD' : m.time === 'With Food' ? 'WITH_FOOD' : 'AFTER_FOOD',
                              },
                            ],
                          }))
                        }
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-2xs"
                      >
                        + {m.name.split(' (')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Medicine Rows */}
                <div className="space-y-3 pt-1">
                  {checkupForm.medicines.map((item, idx) => {
                    const t = item.timings || {
                      morning: item.frequency?.includes('1-0-0') || item.frequency?.includes('1-0-1') || item.frequency?.includes('1-1-1'),
                      afternoon: item.frequency?.includes('1-1-1'),
                      evening: false,
                      night: item.frequency?.includes('0-0-1') || item.frequency?.includes('1-0-1') || item.frequency?.includes('1-1-1'),
                    };
                    const activeCount = [t.morning, t.afternoon, t.evening, t.night].filter(Boolean).length;
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 transition hover:border-blue-400 dark:hover:border-blue-600"
                      >
                        {/* Row Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                              Medicine #{idx + 1}
                            </span>
                            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800">
                              {item.frequency || (activeCount === 1 ? 'Once Daily' : activeCount === 2 ? 'Twice Daily' : activeCount === 3 ? 'Thrice Daily' : 'Custom Frequency')}
                            </span>
                          </div>

                          {checkupForm.medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMedicineRow(item.id)}
                              className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2.5 py-1 rounded-lg transition cursor-pointer"
                              title="Delete medicine row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        {/* Core Drug Inputs: Name (free-text), Dosage, Duration */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-6">
                            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                              Medicine Name * (Type freely or choose suggestion)
                            </label>
                            <input
                              type="text"
                              required
                              list="doctor-medications-catalog"
                              value={item.name}
                              onChange={(e) => handleUpdateMedicineField(item.id, 'name', e.target.value)}
                              placeholder="Type medicine name freely (e.g. Amoxil 500mg, Pan-D, Dolo 650...)"
                              className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                              Dosage *
                            </label>
                            <input
                              type="text"
                              value={item.dosage}
                              onChange={(e) => handleUpdateMedicineField(item.id, 'dosage', e.target.value)}
                              placeholder="e.g. 500 mg / 1 Tab"
                              className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                              Duration *
                            </label>
                            <input
                              type="text"
                              value={item.duration}
                              onChange={(e) => handleUpdateMedicineField(item.id, 'duration', e.target.value)}
                              placeholder="e.g. 5 Days, 10 Days"
                              className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {/* Dose Timing Checkboxes (Morning, Afternoon, Evening, Night) */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              <span>Dose Schedule (Tick when patient should take):</span>
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                              Auto-schedules patient reminder alarms
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <label
                              className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none transition ${
                                t.morning
                                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-bold shadow-2xs'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={Boolean(t.morning)}
                                onChange={(e) => handleUpdateMedicineTiming(item.id, 'morning', e.target.checked)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="text-[11px]">🌅 Morning (8 AM)</span>
                            </label>

                            <label
                              className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none transition ${
                                t.afternoon
                                  ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-400 dark:border-orange-700 text-orange-900 dark:text-orange-200 font-bold shadow-2xs'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={Boolean(t.afternoon)}
                                onChange={(e) => handleUpdateMedicineTiming(item.id, 'afternoon', e.target.checked)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="text-[11px]">☀️ Afternoon (1 PM)</span>
                            </label>

                            <label
                              className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none transition ${
                                t.evening
                                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 font-bold shadow-2xs'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={Boolean(t.evening)}
                                onChange={(e) => handleUpdateMedicineTiming(item.id, 'evening', e.target.checked)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="text-[11px]">🌆 Evening (6 PM)</span>
                            </label>

                            <label
                              className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none transition ${
                                t.night
                                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 dark:border-purple-700 text-purple-900 dark:text-purple-200 font-bold shadow-2xs'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={Boolean(t.night)}
                                onChange={(e) => handleUpdateMedicineTiming(item.id, 'night', e.target.checked)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="text-[11px]">🌙 Night (9 PM)</span>
                            </label>
                          </div>
                        </div>

                        {/* Meal Relation & Instructions */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1 border-t border-slate-100 dark:border-slate-800">
                          <div className="sm:col-span-5 flex items-center gap-2.5 text-[11px]">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Meal Relation:</span>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="radio"
                                name={`food-${item.id}`}
                                checked={item.foodTiming === 'AFTER_FOOD' || (!item.foodTiming && !item.timing?.toLowerCase().includes('before'))}
                                onChange={() => {
                                  handleUpdateMedicineField(item.id, 'foodTiming', 'AFTER_FOOD');
                                  handleUpdateMedicineField(item.id, 'timing', 'After Food');
                                }}
                                className="text-blue-600 cursor-pointer"
                              />
                              <span>After Food</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="radio"
                                name={`food-${item.id}`}
                                checked={item.foodTiming === 'BEFORE_FOOD' || item.timing?.toLowerCase().includes('before')}
                                onChange={() => {
                                  handleUpdateMedicineField(item.id, 'foodTiming', 'BEFORE_FOOD');
                                  handleUpdateMedicineField(item.id, 'timing', 'Before Food');
                                }}
                                className="text-blue-600 cursor-pointer"
                              />
                              <span>Before Food</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="radio"
                                name={`food-${item.id}`}
                                checked={item.foodTiming === 'WITH_FOOD' || item.timing?.toLowerCase().includes('with')}
                                onChange={() => {
                                  handleUpdateMedicineField(item.id, 'foodTiming', 'WITH_FOOD');
                                  handleUpdateMedicineField(item.id, 'timing', 'With Food');
                                }}
                                className="text-blue-600 cursor-pointer"
                              />
                              <span>With Food</span>
                            </label>
                          </div>

                          <div className="sm:col-span-7">
                            <input
                              type="text"
                              value={item.instructions}
                              onChange={(e) => handleUpdateMedicineField(item.id, 'instructions', e.target.value)}
                              placeholder="Special instructions (e.g. take with warm water, avoid milk, after meals)..."
                              className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Quick Row Adders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="py-2.5 rounded-xl border-2 border-dashed border-blue-400 hover:border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-blue-600" />
                    <span>+ Add Another Medicine Row (Type Freely)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBatchMedicineRows(3)}
                    className="py-2.5 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer hover:bg-indigo-100"
                  >
                    <Zap className="w-4 h-4 text-indigo-600" />
                    <span>⚡ Add 3 Medicine Rows at Once</span>
                  </button>
                </div>
              </div>

              {/* 5. ORDERED DIAGNOSTIC TESTS & DIRECT LAB TRANSMISSION */}
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-purple-600" />
                      <span>Diagnostic Tests & Lab Investigations Ordered ({checkupForm.orderedLabs.length} Selected)</span>
                    </label>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Tests are dispatched directly to Central Lab. Lab staff receives patient identity and test requirements to upload real scan/picture; clinical diagnoses and history remain confidential.
                    </p>
                  </div>
                  {checkupForm.orderedLabs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const count = handleDispatchLabOrders(checkupModalAppt!, checkupForm.orderedLabs);
                        setFeedbackMsg({
                          type: 'success',
                          text: `✓ ${count} Lab Test Orders transmitted directly to Lab Technicians! Awaiting real scan/picture upload.`,
                        });
                        setTimeout(() => setFeedbackMsg(null), 4000);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-sm shadow-purple-600/20 transition active:scale-95 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send {checkupForm.orderedLabs.length} Tests to Lab Now</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Chest X-Ray PA View',
                    '12-Lead ECG',
                    'Complete Blood Count (CBC)',
                    'Lipid Profile',
                    'HbA1c Glycated Hemoglobin',
                    'Liver & Kidney Panel (LFT/KFT)',
                    'Whole Abdomen Ultrasound',
                    'Brain MRI T2 Sequence',
                    'HRCT Chest Scan',
                  ].map((test) => {
                    const isSelected = checkupForm.orderedLabs.includes(test);
                    return (
                      <button
                        key={test}
                        type="button"
                        onClick={() => {
                          const updated = isSelected
                            ? checkupForm.orderedLabs.filter((t) => t !== test)
                            : [...checkupForm.orderedLabs, test];
                          setCheckupForm({ ...checkupForm, orderedLabs: updated });
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition cursor-pointer border ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {test}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Test Entry Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customLabTestInput}
                    onChange={(e) => setCustomLabTestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customLabTestInput.trim() && !checkupForm.orderedLabs.includes(customLabTestInput.trim())) {
                          setCheckupForm({ ...checkupForm, orderedLabs: [...checkupForm.orderedLabs, customLabTestInput.trim()] });
                          setCustomLabTestInput('');
                        }
                      }
                    }}
                    placeholder="Type custom test name (e.g. D-Dimer, Troponin-I, Serum Ferritin, Urine Routine)..."
                    className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customLabTestInput.trim() && !checkupForm.orderedLabs.includes(customLabTestInput.trim())) {
                        setCheckupForm({ ...checkupForm, orderedLabs: [...checkupForm.orderedLabs, customLabTestInput.trim()] });
                        setCustomLabTestInput('');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    + Add Test
                  </button>
                </div>
              </div>

              {/* 6. CLINICAL ADVICE & DIETARY GUIDELINES */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dietary, Lifestyle Advice & Home Instructions
                </label>
                <textarea
                  rows={2}
                  value={checkupForm.instructions}
                  onChange={(e) => setCheckupForm({ ...checkupForm, instructions: e.target.value })}
                  placeholder="e.g. Salt restriction (<5g/day), brisk walking 30 mins, avoid deep fried food..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                />
              </div>

              {/* 7. FOLLOW-UP PERIOD & SIGNATURE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Scheduled Follow-up Period
                  </label>
                  <select
                    value={checkupForm.followUpDays}
                    onChange={(e) => setCheckupForm({ ...checkupForm, followUpDays: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="3">In 3 Days</option>
                    <option value="7">In 7 Days (1 Week)</option>
                    <option value="14">In 14 Days (2 Weeks)</option>
                    <option value="30">In 30 Days (1 Month)</option>
                    <option value="90">In 3 Months</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Attending Physician Signature
                  </label>
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-black text-xs flex items-center justify-between border border-emerald-200 dark:border-emerald-900">
                    <span>✓ Dr. Rajesh Singh, MD, DM</span>
                    <span className="text-[10px] opacity-80">Room 104 • Central Cardiology</span>
                  </div>
                </div>
              </div>

              {/* 8. REAL-TIME PATIENT ACCOUNT SYNC ALERT */}
              <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl text-[11px] text-blue-900 dark:text-blue-300 leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Real-Time Patient Account Synchronization:</strong> When you click <em>Confirm Checkup & Prescribe</em>, this entire prescription will instantly transfer into the patient's account (<strong>/portal/prescriptions</strong>), populate daily doses in their Medication Reminders schedule (<strong>/portal/medication-reminders</strong>), send a portal notification alert, and register the patient in your <strong>Checked Patients Only</strong> roster.
                </div>
              </div>

              {/* 9. SUBMIT ACTIONS */}
              <div className="pt-2 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setCheckupModalAppt(null)}
                  className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs cursor-pointer shadow-lg shadow-emerald-600/25 transition active:scale-95"
                >
                  Confirm Checkup & Prescribe to Patient Account →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PATIENT 360 MEDICAL RECORDS & DIAGNOSTIC SCAN LIGHTBOX DRAWER             */}
      {/* ========================================================================= */}
      {selectedPatient360 && (
        <Patient360Drawer
          patientId={selectedPatient360.id}
          patientName={selectedPatient360.name}
          patientData={selectedPatient360}
          isOpen={Boolean(selectedPatient360)}
          onClose={() => setSelectedPatient360(null)}
        />
      )}
    </div>
  );
}
