'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  Ticket,
  UserCheck,
  UserX,
  Bed,
  FileCheck,
  Clock,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Activity,
  FileText,
  Phone,
  Building2,
  Stethoscope,
  Send,
  ListTodo,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Siren,
  CreditCard,
  ShieldCheck,
  Bell,
  BarChart3,
  User,
  Settings,
  Printer,
  Download,
  Upload,
  X,
  Volume2,
  VolumeX,
  Filter,
  Share2,
  AlertCircle,
  QrCode,
  Check,
  Eye,
  Mail,
  MapPin,
  HeartPulse,
  BadgeCheck,
  HelpCircle,
  ExternalLink,
  Info,
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/api-config';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';
import { DEMO_PATIENT_ACCOUNTS, DemoPatientAccount } from '@/lib/demo-patients';
import { io } from 'socket.io-client';
import { AdmissionsBedsModule } from '@/components/reception/AdmissionsBedsModule';
import {
  matchGlobalPatient,
  registerPatientAtHospital,
  getHospitalPatientDirectory,
} from '@/lib/hospital-canonical-data';
import { triggerPatientRegistered } from '@/lib/realtime-telemetry';
import { MedicineCommunicationControl } from '@/components/medication/MedicineCommunicationControl';


// =========================================================================
// TYPES & DATA CONTRACTS
// =========================================================================

export type ReceptionPrimaryTab =
  | 'dashboard'
  | 'patients'
  | 'appointments'
  | 'queue'
  | 'emergency'
  | 'doctors'
  | 'admissions'
  | 'billing'
  | 'insurance'
  | 'documents'
  | 'notifications'
  | 'reports';

export type PatientSubTab = 'all' | 'register' | 'search' | 'visits';
export type AppointmentSubTab = 'today' | 'book' | 'walkins' | 'upcoming' | 'cancelled';
export type AdmissionsSubTab =
  | 'overview'
  | 'admit'
  | 'register'
  | 'transfer'
  | 'discharge'
  | 'history'
  | 'pending'
  | 'active';

export interface ReceptionAppointment {
  id: string;
  tokenNo?: string;
  apptNo: string;
  time: string;
  date: string;
  patientName: string;
  patientId: string;
  phone: string;
  doctorName: string;
  doctorId: string;
  department: string;
  type: 'OPD' | 'WALK_IN' | 'EMERGENCY' | 'TELEMEDICINE' | 'FOLLOW_UP';
  paymentStatus: 'PAID' | 'PENDING';
  fee: number;
  arrivalStatus: 'ARRIVED' | 'NOT_ARRIVED';
  status: 'REQUESTED' | 'CONFIRMED' | 'CHECKED_IN' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  reason: string;
  cancellationReason?: string;
  isWalkIn?: boolean;
}

export interface ReceptionDoctorStatus {
  id: string;
  name: string;
  specialty: string;
  department: string;
  roomNo: string;
  status: 'AVAILABLE' | 'IN_CONSULTATION' | 'UNAVAILABLE';
  currentToken: string;
  waitingCount: number;
  nextAvailableTime: string;
  availableSlots: string[];
}

export interface AdmissionRequest {
  id: string;
  requestNo: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  department: string;
  wardType: 'General Ward' | 'Semi-Private' | 'Private Room' | 'ICU';
  priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  status: 'PENDING_BED' | 'BED_ASSIGNED' | 'ADMITTED';
  allocatedBed?: string;
  requestedAt: string;
  diagnosis: string;
}

export interface DischargeWorkflow {
  id: string;
  admissionNo: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  bedCode: string;
  ward: string;
  medicalCleared: boolean;
  billingCleared: boolean;
  pharmacyCleared: boolean;
  summaryReady: boolean;
  status: 'IN_CLEARANCE' | 'READY_FOR_DISCHARGE' | 'DISCHARGED';
  dischargePlannedAt: string;
}

export interface ReceptionBillItem {
  id: string;
  billNo: string;
  patientName: string;
  patientId: string;
  service: string;
  amount: number;
  paidAmount: number;
  status: 'PAID' | 'PENDING';
  method?: 'CASH' | 'UPI' | 'CARD';
  date: string;
  transactionRef?: string;
}

export interface ReceptionInsuranceRecord {
  id: string;
  patientName: string;
  patientId: string;
  provider: string;
  policyNo: string;
  tpa: string;
  preAuthStatus: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  approvedAmount: number;
  claimAmount: number;
  lastUpdated: string;
}

export interface AdministrativeDocument {
  id: string;
  patientName: string;
  patientId: string;
  docType: 'REGISTRATION_SLIP' | 'IDENTITY_PROOF' | 'INSURANCE_PREAUTH' | 'CONSENT_FORM' | 'DISCHARGE_CLEARANCE';
  fileName: string;
  uploadedAt: string;
  fileSize: string;
}

export interface ReceptionNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'URGENT' | 'INFO' | 'SUCCESS' | 'WARNING';
  read: boolean;
}

const LOCAL_STORAGE_APPTS_KEY = 'medinexa_appointments_registry_v1';
const LOCAL_STORAGE_PATIENTS_KEY = 'medinexa_reception_patients_v1';
const LOCAL_STORAGE_SETTINGS_KEY = 'medinexa_reception_settings_v1';

// Web Audio API pure synthesizer chime (no external mp3 dependency)
function playTokenChime(soundEnabled: boolean) {
  if (!soundEnabled || typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.6);
  } catch {}
}

export default function ReceptionMasterDashboardPage() {
  // Navigation State
  const [primaryTab, setPrimaryTab] = useState<ReceptionPrimaryTab>('dashboard');
  const [patientSubTab, setPatientSubTab] = useState<PatientSubTab>('all');
  const [appointmentSubTab, setAppointmentSubTab] = useState<AppointmentSubTab>('today');
  const [admissionsSubTab, setAdmissionsSubTab] = useState<AdmissionsSubTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Sync query params (e.g. ?tab=admissions&subTab=register)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as ReceptionPrimaryTab;
      if (tabParam) {
        setPrimaryTab(tabParam);
      }
      const subTabParam = params.get('subTab') as AdmissionsSubTab;
      if (subTabParam) {
        setAdmissionsSubTab(subTabParam);
      }
    }
  }, []);

  // Collapsible sidebar groups
  const [expandedSections, setExpandedSections] = useState({
    patients: true,
    appointments: true,
    admissions: true,
  });

  const toggleSection = (section: 'patients' | 'appointments' | 'admissions') => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Staff identity & Facility Scope
  const [currentUser, setCurrentUser] = useState<any>({
    firstName: 'Pooja',
    lastName: 'Singh',
    staffId: 'REC.POOJA-0401',
    role: 'Front Desk Lead & Central Receptionist',
    counter: '#01 Active',
    facilityName: 'MediNexa General Hospital (Hospital A)',
    hospitalId: 'HOSPITAL_A',
  });

  // Settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [counterNumber, setCounterNumber] = useState('01');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Toast & Feedbacks
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // =========================================================================
  // DATA STATES
  // =========================================================================

  // 1. Patients Registry
  const [patients, setPatients] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_PATIENTS_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEMO_PATIENT_ACCOUNTS;
  });

  const [selectedPatientForView, setSelectedPatientForView] = useState<any | null>(null);

  // 2. Appointments Registry
  const INITIAL_APPOINTMENTS: ReceptionAppointment[] = [
    {
      id: 'appt-demo-1',
      tokenNo: 'A-101',
      apptNo: 'APT-IND-100848',
      time: '12:30 - 13:00',
      date: '10/28/2026',
      patientName: 'Patient10 Beta',
      patientId: 'MNX-P-PAT10B',
      phone: '+91 98100 12345',
      doctorName: 'Dr. Sandeep Vashisht',
      doctorId: 'doc-sandeep',
      department: 'Internal Medicine',
      type: 'OPD',
      paymentStatus: 'PAID',
      fee: 800,
      arrivalStatus: 'ARRIVED',
      status: 'CONFIRMED',
      reason: 'Post-viral Acute Fatigue Follow-up',
    },
    {
      id: 'appt-demo-2',
      tokenNo: 'A-102',
      apptNo: 'APT-IND-100608',
      time: '12:30 - 13:00',
      date: '10/28/2026',
      patientName: 'Karan Das',
      patientId: 'MNX-P-KARAN08',
      phone: '+91 98100 03264',
      doctorName: 'Dr. Suresh Menon',
      doctorId: 'doc-suresh',
      department: 'Cardiology',
      type: 'OPD',
      paymentStatus: 'PAID',
      fee: 800,
      arrivalStatus: 'ARRIVED',
      status: 'CONFIRMED',
      reason: 'Upper Respiratory Infection Consultation',
    },
    {
      id: 'appt-demo-3',
      tokenNo: 'A-103',
      apptNo: 'APT-IND-100728',
      time: '16:30 - 17:00',
      date: '10/28/2026',
      patientName: 'Meera Menon',
      patientId: 'MNX-P-MEERA28',
      phone: '+91 98100 01649',
      doctorName: 'Dr. Preeti Chadha',
      doctorId: 'doc-preeti',
      department: 'General Medicine',
      type: 'OPD',
      paymentStatus: 'PAID',
      fee: 800,
      arrivalStatus: 'NOT_ARRIVED',
      status: 'REQUESTED',
      reason: 'Routine Health Checkup & HbA1c Review',
    },
    {
      id: 'appt-demo-4',
      tokenNo: 'A-104',
      apptNo: 'APT-IND-100968',
      time: '16:30 - 17:00',
      date: '10/28/2026',
      patientName: 'Arjun Roy',
      patientId: 'MNX-P-ARJUN68',
      phone: '+91 98100 01496',
      doctorName: 'Dr. Madhavi Sharma',
      doctorId: 'doc-madhavi',
      department: 'Orthopedics',
      type: 'WALK_IN',
      paymentStatus: 'PENDING',
      fee: 800,
      arrivalStatus: 'ARRIVED',
      status: 'REQUESTED',
      reason: 'Acute joint stiffness and musculoskeletal pain',
      isWalkIn: true,
    },
    {
      id: 'appt-demo-5',
      tokenNo: 'E-01',
      apptNo: 'APT-IND-100999',
      time: '10:00 - 10:15',
      date: '10/28/2026',
      patientName: 'Vikas Malhotra',
      patientId: 'MNX-P-VIKAS99',
      phone: '+91 98111 22334',
      doctorName: 'Dr. Rajesh Singh',
      doctorId: 'doc-rajesh',
      department: 'Cardiology',
      type: 'EMERGENCY',
      paymentStatus: 'PENDING',
      fee: 1200,
      arrivalStatus: 'ARRIVED',
      status: 'CHECKED_IN',
      reason: 'Acute Angina, Diaphoresis & Chest Pressure',
    },
  ];

  const [appointments, setAppointments] = useState<ReceptionAppointment[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_APPTS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_APPOINTMENTS;
  });

  const saveAppointments = (list: ReceptionAppointment[]) => {
    setAppointments(list);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_APPTS_KEY, JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('medinexa:appointments:updated', { detail: list }));
      } catch {}
    }
  };

  // Sync across tabs
  useEffect(() => {
    const handleSync = (e: any) => {
      if (Array.isArray(e.detail)) {
        setAppointments(e.detail);
      }
    };
    window.addEventListener('medinexa:appointments:updated', handleSync);
    return () => window.removeEventListener('medinexa:appointments:updated', handleSync);
  }, []);

  // 3. Doctors & Availability
  const [doctors, setDoctors] = useState<ReceptionDoctorStatus[]>([
    {
      id: 'doc-rajesh',
      name: 'Dr. Rajesh Singh',
      specialty: 'Senior Consultant Cardiologist',
      department: 'Cardiology',
      roomNo: 'OPD-101',
      status: 'AVAILABLE',
      currentToken: '#18',
      waitingCount: 4,
      nextAvailableTime: '11:00 AM',
      availableSlots: ['11:00 AM', '11:30 AM', '12:00 PM', '02:30 PM'],
    },
    {
      id: 'doc-ananya',
      name: 'Dr. Ananya Sen',
      specialty: 'Consultant Obstetrician & Gynecologist',
      department: 'Obstetrics & Gynecology',
      roomNo: 'OPD-104',
      status: 'IN_CONSULTATION',
      currentToken: '#09',
      waitingCount: 2,
      nextAvailableTime: '11:45 AM',
      availableSlots: ['11:45 AM', '12:15 PM', '03:00 PM'],
    },
    {
      id: 'doc-preeti',
      name: 'Dr. Preeti Chadha',
      specialty: 'Internal Medicine Specialist',
      department: 'General Medicine',
      roomNo: 'OPD-102',
      status: 'AVAILABLE',
      currentToken: '#12',
      waitingCount: 3,
      nextAvailableTime: '10:45 AM',
      availableSlots: ['10:45 AM', '11:15 AM', '11:45 AM', '04:00 PM'],
    },
    {
      id: 'doc-madhavi',
      name: 'Dr. Madhavi Sharma',
      specialty: 'Chief Orthopedic Surgeon',
      department: 'Orthopedics',
      roomNo: 'OPD-108',
      status: 'IN_CONSULTATION',
      currentToken: '#06',
      waitingCount: 5,
      nextAvailableTime: '12:30 PM',
      availableSlots: ['12:30 PM', '01:00 PM', '04:30 PM'],
    },
    {
      id: 'doc-sandeep',
      name: 'Dr. Sandeep Vashisht',
      specialty: 'Senior Neurologist',
      department: 'Neurology',
      roomNo: 'OPD-112',
      status: 'UNAVAILABLE',
      currentToken: '—',
      waitingCount: 0,
      nextAvailableTime: '03:30 PM (On Rounds)',
      availableSlots: ['03:30 PM', '04:00 PM'],
    },
    {
      id: 'doc-arvind',
      name: 'Dr. Arvind Deshmukh',
      specialty: 'Critical Care & Pulmonology Lead',
      department: 'Pulmonology',
      roomNo: 'OPD-105',
      status: 'AVAILABLE',
      currentToken: '#14',
      waitingCount: 1,
      nextAvailableTime: '10:30 AM',
      availableSlots: ['10:30 AM', '11:00 AM', '11:30 AM'],
    },
  ]);

  // 4. Admissions
  const [admissions, setAdmissions] = useState<AdmissionRequest[]>([
    {
      id: 'adm-req-1',
      requestNo: 'ADM-REQ-2026-041',
      patientName: 'Ayush Singh',
      patientId: 'MNX-P-AYUSH921',
      doctorName: 'Dr. Rajesh Singh',
      department: 'Cardiology',
      wardType: 'General Ward',
      priority: 'URGENT',
      status: 'PENDING_BED',
      requestedAt: 'Today, 09:45 AM',
      diagnosis: 'Severe Angina Observation & 24h Telemetry Monitoring',
    },
    {
      id: 'adm-req-2',
      requestNo: 'ADM-REQ-2026-042',
      patientName: 'Rameshwar Verma',
      patientId: 'MNX-P-RAMESH02',
      doctorName: 'Dr. Arvind Deshmukh',
      department: 'Pulmonology',
      wardType: 'Semi-Private',
      priority: 'NORMAL',
      status: 'BED_ASSIGNED',
      allocatedBed: 'SP-104',
      requestedAt: 'Today, 08:30 AM',
      diagnosis: 'Acute Exacerbation of COPD',
    },
    {
      id: 'adm-req-3',
      requestNo: 'ADM-REQ-2026-043',
      patientName: 'Kavita Rathore',
      patientId: 'MNX-P-KAVITA03',
      doctorName: 'Dr. Madhavi Sharma',
      department: 'Orthopedics',
      wardType: 'General Ward',
      priority: 'NORMAL',
      status: 'ADMITTED',
      allocatedBed: 'GW-12',
      requestedAt: 'Yesterday, 04:00 PM',
      diagnosis: 'Closed Fracture Distal Radius',
    },
  ]);

  // 5. Discharge Coordination
  const [discharges, setDischarges] = useState<DischargeWorkflow[]>([
    {
      id: 'disc-1',
      admissionNo: 'ADM-2026-0412',
      patientName: 'Sunita Mehra',
      patientId: 'MNX-P-SUNITA12',
      doctorName: 'Dr. Arvind Deshmukh',
      bedCode: 'GW-08',
      ward: 'General Ward',
      medicalCleared: true,
      billingCleared: true,
      pharmacyCleared: true,
      summaryReady: true,
      status: 'READY_FOR_DISCHARGE',
      dischargePlannedAt: 'Today, 01:30 PM',
    },
    {
      id: 'disc-2',
      admissionNo: 'ADM-2026-0398',
      patientName: 'Gopal Krishnan',
      patientId: 'MNX-P-GOPAL98',
      doctorName: 'Dr. Rajesh Singh',
      bedCode: 'SP-102',
      ward: 'Semi-Private',
      medicalCleared: true,
      billingCleared: false,
      pharmacyCleared: true,
      summaryReady: false,
      status: 'IN_CLEARANCE',
      dischargePlannedAt: 'Today, 04:00 PM',
    },
    {
      id: 'disc-3',
      admissionNo: 'ADM-2026-0350',
      patientName: 'Deepak Chopra',
      patientId: 'MNX-P-DEEPAK50',
      doctorName: 'Dr. Madhavi Sharma',
      bedCode: 'PR-201',
      ward: 'Private Room',
      medicalCleared: true,
      billingCleared: true,
      pharmacyCleared: true,
      summaryReady: true,
      status: 'DISCHARGED',
      dischargePlannedAt: 'Today, 10:00 AM',
    },
  ]);

  // 6. Billing & Payments
  const [bills, setBills] = useState<ReceptionBillItem[]>([
    {
      id: 'bill-1',
      billNo: 'INV-2026-8819',
      patientName: 'Ayush Singh',
      patientId: 'MNX-P-AYUSH921',
      service: 'Cardiology OPD Consultation Fee',
      amount: 800,
      paidAmount: 800,
      status: 'PAID',
      method: 'UPI',
      date: 'Today, 09:30 AM',
      transactionRef: 'UPI-HDFC-9912048',
    },
    {
      id: 'bill-2',
      billNo: 'INV-2026-8820',
      patientName: 'Arjun Roy',
      patientId: 'MNX-P-ARJUN68',
      service: 'Orthopedic Walk-in Consultation',
      amount: 800,
      paidAmount: 0,
      status: 'PENDING',
      date: 'Today, 10:15 AM',
    },
    {
      id: 'bill-3',
      billNo: 'INV-2026-8821',
      patientName: 'Vikas Malhotra',
      patientId: 'MNX-P-VIKAS99',
      service: 'Emergency Triage & STAT ECG Clearance',
      amount: 1200,
      paidAmount: 0,
      status: 'PENDING',
      date: 'Today, 10:05 AM',
    },
    {
      id: 'bill-4',
      billNo: 'INV-2026-8815',
      patientName: 'Meera Menon',
      patientId: 'MNX-P-MEERA28',
      service: 'General Medicine OPD Consultation Fee',
      amount: 800,
      paidAmount: 800,
      status: 'PAID',
      method: 'CARD',
      date: 'Today, 08:45 AM',
      transactionRef: 'TXN-POS-440192',
    },
  ]);

  // 7. Insurance / TPA
  const [insuranceRecords, setInsuranceRecords] = useState<ReceptionInsuranceRecord[]>([
    {
      id: 'ins-1',
      patientName: 'Ayush Singh',
      patientId: 'MNX-P-AYUSH921',
      provider: 'Star Health & Allied Insurance',
      policyNo: 'STAR-IND-8849102',
      tpa: 'Medi Assist TPA',
      preAuthStatus: 'APPROVED',
      approvedAmount: 45000,
      claimAmount: 45000,
      lastUpdated: 'Today, 10:00 AM',
    },
    {
      id: 'ins-2',
      patientName: 'Gopal Krishnan',
      patientId: 'MNX-P-GOPAL98',
      provider: 'HDFC ERGO General Insurance',
      policyNo: 'HDFC-HEALTH-55410',
      tpa: 'Vidal Health TPA',
      preAuthStatus: 'SUBMITTED',
      approvedAmount: 0,
      claimAmount: 85000,
      lastUpdated: 'Today, 09:15 AM',
    },
    {
      id: 'ins-3',
      patientName: 'Sunita Mehra',
      patientId: 'MNX-P-SUNITA12',
      provider: 'Ayushman Bharat (PM-JAY)',
      policyNo: 'AB-PMJAY-99201948',
      tpa: 'National Health Authority',
      preAuthStatus: 'APPROVED',
      approvedAmount: 30000,
      claimAmount: 30000,
      lastUpdated: 'Yesterday, 06:00 PM',
    },
  ]);

  // 8. Administrative Documents
  const [documents, setDocuments] = useState<AdministrativeDocument[]>([
    {
      id: 'doc-1',
      patientName: 'Ayush Singh',
      patientId: 'MNX-P-AYUSH921',
      docType: 'REGISTRATION_SLIP',
      fileName: 'OPD_Intake_Slip_AyushSingh.pdf',
      uploadedAt: 'Today, 09:30 AM',
      fileSize: '184 KB',
    },
    {
      id: 'doc-2',
      patientName: 'Ayush Singh',
      patientId: 'MNX-P-AYUSH921',
      docType: 'INSURANCE_PREAUTH',
      fileName: 'StarHealth_PreAuth_Approval_AyushSingh.pdf',
      uploadedAt: 'Today, 10:00 AM',
      fileSize: '412 KB',
    },
    {
      id: 'doc-3',
      patientName: 'Sunita Mehra',
      patientId: 'MNX-P-SUNITA12',
      docType: 'DISCHARGE_CLEARANCE',
      fileName: 'Discharge_Clearance_Slip_SunitaMehra.pdf',
      uploadedAt: 'Today, 10:15 AM',
      fileSize: '220 KB',
    },
    {
      id: 'doc-4',
      patientName: 'Vikas Malhotra',
      patientId: 'MNX-P-VIKAS99',
      docType: 'CONSENT_FORM',
      fileName: 'Emergency_Treatment_Consent_VikasMalhotra.pdf',
      uploadedAt: 'Today, 10:05 AM',
      fileSize: '156 KB',
    },
  ]);

  // 9. Operational Notifications
  const [notifications, setNotifications] = useState<ReceptionNotification[]>([
    {
      id: 'notif-1',
      title: '🚨 Emergency Trauma Intake Allocated',
      message: 'Patient Vikas Malhotra (MNX-P-VIKAS99) checked into Trauma Bay 02.',
      timestamp: '5 mins ago',
      type: 'URGENT',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Doctor Schedule Advisory',
      message: 'Dr. Sandeep Vashisht (Neurology) is currently on ICU rounds until 03:30 PM.',
      timestamp: '18 mins ago',
      type: 'WARNING',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Patient Ready for Discharge',
      message: 'Sunita Mehra (Bed GW-08) is medically & financially cleared. Ready for gate pass.',
      timestamp: '25 mins ago',
      type: 'SUCCESS',
      read: true,
    },
    {
      id: 'notif-4',
      title: 'Cashless TPA Pre-Auth Approved',
      message: 'Star Health approved ₹45,000 pre-authorization for Ayush Singh.',
      timestamp: '40 mins ago',
      type: 'INFO',
      read: true,
    },
  ]);

  // =========================================================================
  // MODALS STATE
  // =========================================================================

  // Patient Registration Form & Duplicate Detection
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regDob, setRegDob] = useState('1990-05-15');
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('Sector 62, Noida, Uttar Pradesh');
  const [regEmergencyContact, setRegEmergencyContact] = useState('');
  const [regEmergencyPhone, setRegEmergencyPhone] = useState('');
  const [regBloodGroup, setRegBloodGroup] = useState('B+');
  const [regIdType, setRegIdType] = useState('Aadhaar');
  const [regIdNumber, setRegIdNumber] = useState('');

  // Duplicate candidate detected in real-time
  const duplicateCandidate = useMemo(() => {
    if (!regPhone.trim() && !regEmail.trim() && !regFirstName.trim()) return null;
    const cleanPhone = regPhone.replace(/\D/g, '');

    return patients.find((p) => {
      const pClean = p.phone.replace(/\D/g, '');
      if (cleanPhone.length >= 8 && pClean.includes(cleanPhone)) return true;
      if (regEmail.trim() && p.email?.toLowerCase() === regEmail.trim().toLowerCase()) return true;
      if (
        regFirstName.trim().length >= 3 &&
        regLastName.trim().length >= 3 &&
        p.name.toLowerCase() === `${regFirstName.trim()} ${regLastName.trim()}`.toLowerCase()
      ) {
        return true;
      }
      return false;
    });
  }, [regPhone, regEmail, regFirstName, regLastName, patients]);

  // Global Patient Identity & Lookup state (Section 1 - 5)
  const [globalLookupQuery, setGlobalLookupQuery] = useState('');
  const [globalLookupLoading, setGlobalLookupLoading] = useState(false);
  const [matchedGlobalPatient, setMatchedGlobalPatient] = useState<any | null>(null);
  const [lookupFeedback, setLookupFeedback] = useState<{
    type: 'EXISTS_REGISTERED' | 'EXISTS_NEW' | 'NOT_FOUND' | 'VERIFY_REQ';
    message: string;
  } | null>(null);

  const [showReceptionQrModal, setShowReceptionQrModal] = useState(false);
  const [receptionQrInput, setReceptionQrInput] = useState('');

  const handleSearchGlobalPatient = async (overrideQuery?: string) => {
    const raw = (overrideQuery || globalLookupQuery).trim();
    if (!raw) {
      showToast('Please enter a UHID, Mobile number, or MRN to lookup.');
      return;
    }
    const q = raw.replace(/^MNX:UHID:/i, '').trim();
    setGlobalLookupQuery(q);
    setGlobalLookupLoading(true);
    setLookupFeedback(null);
    setMatchedGlobalPatient(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    const apiUrl = getApiBaseUrl();

    try {
      const isPersonIdOrUhid =
        q.startsWith('MNX') ||
        q.startsWith('UHID') ||
        /^[A-Z]{2,3}-\d{4}-[A-Z]{2}$/i.test(q) ||
        q.toUpperCase().includes('AYU-') ||
        q.toUpperCase().includes('PRI-') ||
        q.toUpperCase().includes('RAH-');

      // 1. First attempt backend /patients/match
      const res = await fetch(`${apiUrl}/patients/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          uhid: isPersonIdOrUhid ? q.toUpperCase() : undefined,
          phone: /^\+?[0-9]{10,13}$/.test(q) ? q : undefined,
          mrn: q.startsWith('HOS') || q.startsWith('MRN') ? q : undefined,
          name: !isPersonIdOrUhid && !q.startsWith('HOS') && !q.startsWith('MRN') && isNaN(Number(q)) ? q : undefined,
          facilityId: currentUser.hospitalId || 'HOSPITAL_A',
        }),
      }).then((r) => r.json()).catch(() => null);

      if (res && res.matched && res.patient) {
        setMatchedGlobalPatient(res);
        if (res.isRegisteredAtCurrentFacility) {
          setLookupFeedback({
            type: 'EXISTS_REGISTERED',
            message: `Patient already registered at this hospital. UHID: ${res.patient.uhid}, MRN: ${res.currentFacilityRegistration?.mrn || 'HOS-A-00045'}`,
          });
        } else {
          setLookupFeedback({
            type: 'EXISTS_NEW',
            message: `Existing MediNexa Patient Found: ${res.patient.fullName || res.patient.name} (UHID: ${res.patient.uhid}). Not registered at ${currentUser.facilityName}.`,
          });
        }
        return;
      } else if (res && res.requiresVerification) {
        setLookupFeedback({
          type: 'VERIFY_REQ',
          message: res.message || 'Name-only search blocked. Please provide verified mobile or UHID.',
        });
        return;
      }

      // 2. Fallback to canonical dataset
      const localMatch = matchGlobalPatient(
        {
          uhid: isPersonIdOrUhid ? q.toUpperCase() : undefined,
          phone: /^\+?[0-9]{10,13}$/.test(q) ? q : undefined,
          mrn: q.startsWith('HOS') || q.startsWith('MRN') ? q : undefined,
          name: !isPersonIdOrUhid && !q.startsWith('HOS') && !q.startsWith('MRN') && isNaN(Number(q)) ? q : undefined,
        },
        currentUser.hospitalId || 'HOSPITAL_A',
      );

      if (localMatch.matched && localMatch.patient) {
        setMatchedGlobalPatient(localMatch);
        if (localMatch.isRegisteredAtCurrentFacility) {
          setLookupFeedback({
            type: 'EXISTS_REGISTERED',
            message: `Patient already registered at this hospital. UHID: ${localMatch.patient.uhid}, MRN: ${localMatch.currentFacilityRegistration?.mrn || 'HOS-A-00045'}`,
          });
        } else {
          setLookupFeedback({
            type: 'EXISTS_NEW',
            message: `Existing MediNexa Patient Found: ${localMatch.patient.name} (UHID: ${localMatch.patient.uhid}). Not registered at ${currentUser.facilityName}.`,
          });
        }
      } else if (localMatch.requiresVerification) {
        setLookupFeedback({
          type: 'VERIFY_REQ',
          message: localMatch.message || 'Name-only search blocked. Please provide verified mobile or UHID.',
        });
      } else {
        setLookupFeedback({
          type: 'NOT_FOUND',
          message: 'No existing patient found with this identifier. You can register a new Global Patient below.',
        });
      }
    } catch (err: any) {
      setLookupFeedback({
        type: 'NOT_FOUND',
        message: 'Lookup failed or no record found. Proceed to register new patient.',
      });
    } finally {
      setGlobalLookupLoading(false);
    }
  };

  const handleCreateHospitalRegistrationForExisting = async () => {
    if (!matchedGlobalPatient || !matchedGlobalPatient.patient) return;
    const pat = matchedGlobalPatient.patient;
    const patId = pat.patientId || pat.id;
    const uhid = pat.uhid;
    const patName = pat.fullName || pat.name;
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    const apiUrl = getApiBaseUrl();
    const activeFac = currentUser.hospitalId || 'HOSPITAL_A';

    try {
      const res = await fetch(`${apiUrl}/patients/hospital-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          patientId: patId,
          facilityId: activeFac,
          notes: 'Registered via Reception Desk',
        }),
      }).then((r) => r.json()).catch(() => null);

      let mrn = res?.mrn;
      if (!mrn) {
        const local = registerPatientAtHospital(
          {
            patientId: patId,
            uhid,
            name: patName,
            phone: pat.phone,
            gender: pat.gender,
            dateOfBirth: pat.dateOfBirth,
            bloodGroup: pat.bloodGroup,
            email: pat.email,
          },
          activeFac,
        );
        mrn = local.registration.mrn;
      }

      triggerPatientRegistered({
        hospitalId: activeFac,
        patientName: patName,
        uhid,
        mrn,
      });

      if (!patients.some((p) => p.uhid === uhid || p.id === patId)) {
        const newPatientEntry = {
          id: patId,
          name: patName,
          initials: patName.slice(0, 2).toUpperCase(),
          age: pat.age || 30,
          gender: pat.gender || 'Male',
          bloodGroup: pat.bloodGroup || 'O+',
          uhid,
          patientId: mrn,
          phone: pat.phone || '+91 98000 00000',
          email: pat.email || `${patName.toLowerCase().replace(/\s+/g, '.')}@patient.medinexa.health`,
          condition: 'Registered Hospital Patient',
          category: 'General OPD',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          avatarBg: 'from-purple-600 to-indigo-700',
          healthScore: 90,
          healthStatus: 'Good',
          hospitalName: currentUser.facilityName,
          bedStatus: 'Outpatient (Registered)',
          activeMedicinesCount: 0,
          upcomingAppointment: 'Registration Active',
        };
        const next = [newPatientEntry, ...patients];
        setPatients(next);
        try { localStorage.setItem(LOCAL_STORAGE_PATIENTS_KEY, JSON.stringify(next)); } catch {}
      }

      showToast(`Hospital Registration ${mrn} created successfully for ${patName} (UHID: ${uhid})! ✓`);
      setLookupFeedback({
        type: 'EXISTS_REGISTERED',
        message: `Hospital Registration Created! UHID: ${uhid} • MRN: ${mrn}`,
      });
      setGlobalLookupQuery('');
    } catch (err: any) {
      alert(`Error creating hospital registration: ${err.message}`);
    }
  };


  // Appointment Booking Wizard State
  const [bookPatientId, setBookPatientId] = useState('');
  const [bookDoctorId, setBookDoctorId] = useState('doc-rajesh');
  const [bookDate, setBookDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookSlot, setBookSlot] = useState('11:00 AM');
  const [bookType, setBookType] = useState<'OPD' | 'WALK_IN' | 'TELEMEDICINE'>('OPD');
  const [bookReason, setBookReason] = useState('Regular Specialist Consultation');
  const [bookPaymentCollected, setBookPaymentCollected] = useState(true);

  // Walk-in Intake State
  const [walkinPatientId, setWalkinPatientId] = useState('');
  const [walkinDoctorId, setWalkinDoctorId] = useState('doc-preeti');
  const [walkinReason, setWalkinReason] = useState('Acute Symptoms Intake');
  const [walkinFeePaid, setWalkinFeePaid] = useState(true);

  // Emergency Intake Modal State
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emPatientName, setEmPatientName] = useState('');
  const [emPhone, setEmPhone] = useState('');
  const [emAge, setEmAge] = useState('45');
  const [emGender, setEmGender] = useState('Male');
  const [emTriagePriority, setEmTriagePriority] = useState<'RED' | 'YELLOW' | 'GREEN'>('RED');
  const [emChiefComplaint, setEmChiefComplaint] = useState('Acute Severe Chest Pain & Dyspnea');
  const [emAssignedBay, setEmAssignedBay] = useState('Trauma Bay 01');

  // Collect Payment Modal State
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<ReceptionBillItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('UPI');
  const [activeReceiptToPrint, setActiveReceiptToPrint] = useState<ReceptionBillItem | null>(null);

  // Smart Alternative Doctor Modal
  const [smartAlternativeTargetDoc, setSmartAlternativeTargetDoc] = useState<ReceptionDoctorStatus | null>(null);

  // =========================================================================
  // ACTION HANDLERS
  // =========================================================================

  // 1. Confirm Appointment in place
  const handleConfirmAppointment = (id: string, apptNo: string, patientName: string) => {
    const updated = appointments.map((a) => (a.id === id ? { ...a, status: 'CONFIRMED' as const } : a));
    saveAppointments(updated);
    showToast(`Appointment ${apptNo} (${patientName}) confirmed successfully! ✓`);
  };

  // 2. Check-in Patient (generates token, updates status & triggers audio chime)
  const handleCheckInPatient = (id: string, apptNo: string, patientName: string) => {
    const updated = appointments.map((a) => {
      if (a.id === id) {
        const nextToken = a.tokenNo || `A-${100 + appointments.filter((x) => x.status === 'CHECKED_IN').length + 1}`;
        return {
          ...a,
          arrivalStatus: 'ARRIVED' as const,
          status: 'CHECKED_IN' as const,
          tokenNo: nextToken,
        };
      }
      return a;
    });

    saveAppointments(updated);
    playTokenChime(soundEnabled);
    showToast(`Patient ${patientName} checked in! Token issued & routed to doctor queue ✓`);
  };

  // 3. Reschedule Appointment
  const handleReschedule = (id: string, newTime: string) => {
    const updated = appointments.map((a) => (a.id === id ? { ...a, time: newTime, status: 'CONFIRMED' as const } : a));
    saveAppointments(updated);
    showToast('Appointment rescheduled and updated successfully ✓');
  };

  // 4. Cancel Appointment
  const handleCancelAppointment = (id: string, apptNo: string, reason: string) => {
    const updated = appointments.map((a) =>
      a.id === id
        ? {
            ...a,
            status: 'CANCELLED' as const,
            cancellationReason: reason || 'Cancelled by Front Desk Receptionist',
          }
        : a
    );
    saveAppointments(updated);
    showToast(`Appointment ${apptNo} cancelled. Refund logged to billing audit ✓`);
  };

  // 5. Register New Patient
  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName.trim() || !regPhone.trim()) {
      alert('First Name and Mobile Number are required.');
      return;
    }

    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const newUhid = `MNX-${randomDigits}`;
    const facPrefix = currentUser.hospitalId === 'HOSPITAL_B' ? 'HOS-B' : 'HOS-A';
    const newMrn = `${facPrefix}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newPatient = {
      id: `pat-${Date.now()}`,
      name: `${regFirstName.trim()} ${regLastName.trim()}`,
      initials: `${regFirstName[0]}${regLastName[0] || ''}`.toUpperCase(),
      age: 2026 - parseInt(regDob.split('-')[0], 10) || 30,
      gender: regGender,
      bloodGroup: regBloodGroup,
      uhid: newUhid,
      mrn: newMrn,
      patientId: newMrn,
      email: regEmail.trim() || `${regFirstName.toLowerCase()}.${newUhid.toLowerCase()}@patient.medinexa.health`,
      phone: regPhone.trim(),
      condition: 'New Outpatient Registration',
      category: 'General OPD',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
      avatarBg: 'from-teal-600 to-emerald-700',
      healthScore: 92,
      healthStatus: 'Good',
      attendingDoctor: 'Dr. Preeti Chadha',
      department: 'General OPD',
      hospitalName: currentUser.facilityName,
      bedStatus: 'Outpatient (Non-Admitted)',
      activeMedicinesCount: 0,
      upcomingAppointment: 'Today, OPD Intake',
      vitals: {
        bloodPressure: '120/80 mmHg',
        heartRate: '72 bpm',
        spO2: '99%',
        temperature: '98.6 °F',
        recordedBy: `${currentUser.firstName} ${currentUser.lastName} (Front Desk)`,
        recordedAt: 'Just Now, Registration Desk',
      },
    };

    // Canonical registration & realtime broadcast
    registerPatientAtHospital(
      {
        patientId: newPatient.id,
        uhid: newUhid,
        name: newPatient.name,
        phone: regPhone.trim(),
        gender: regGender,
        dateOfBirth: regDob,
        bloodGroup: regBloodGroup,
        email: newPatient.email,
      },
      currentUser.hospitalId || 'HOSPITAL_A',
    );

    triggerPatientRegistered({
      hospitalId: currentUser.hospitalId || 'HOSPITAL_A',
      patientName: newPatient.name,
      uhid: newUhid,
      mrn: newMrn,
    });

    const nextList = [newPatient, ...patients];
    setPatients(nextList);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_PATIENTS_KEY, JSON.stringify(nextList));
      } catch {}
    }

    // Reset Form
    setRegFirstName('');
    setRegLastName('');
    setRegPhone('');
    setRegEmail('');
    setRegIdNumber('');

    showToast(`Patient ${newPatient.name} registered with Global UHID: ${newUhid} & Hospital MRN: ${newMrn}! ✓`);
    setPatientSubTab('all');
  };


  // 6. Book Appointment Submission
  const handleBookAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === bookPatientId || p.patientId === bookPatientId);
    const doc = doctors.find((d) => d.id === bookDoctorId);

    if (!pat || !doc) {
      alert('Please select both a valid patient and doctor.');
      return;
    }

    const tokenNum = `A-${100 + appointments.length + 1}`;
    const newAppt: ReceptionAppointment = {
      id: `appt-rec-${Date.now()}`,
      tokenNo: tokenNum,
      apptNo: `APT-IND-${Math.floor(100000 + Math.random() * 900000)}`,
      time: bookSlot,
      date: bookDate,
      patientName: pat.name,
      patientId: pat.patientId || pat.id,
      phone: pat.phone,
      doctorName: doc.name,
      doctorId: doc.id,
      department: doc.department,
      type: bookType,
      paymentStatus: bookPaymentCollected ? 'PAID' : 'PENDING',
      fee: 800,
      arrivalStatus: 'NOT_ARRIVED',
      status: 'CONFIRMED',
      reason: bookReason,
    };

    const nextList = [newAppt, ...appointments];
    saveAppointments(nextList);

    // If paid, create invoice
    if (bookPaymentCollected) {
      const newBill: ReceptionBillItem = {
        id: `bill-${Date.now()}`,
        billNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        patientName: pat.name,
        patientId: pat.patientId || pat.id,
        service: `${doc.department} Consultation (${doc.name})`,
        amount: 800,
        paidAmount: 800,
        status: 'PAID',
        method: 'UPI',
        date: 'Today, Just Now',
        transactionRef: `UPI-REC-${Math.floor(1000000 + Math.random() * 9000000)}`,
      };
      setBills((b) => [newBill, ...b]);
    }

    showToast(`Appointment booked & confirmed for ${pat.name} with ${doc.name}! Token: ${tokenNum} ✓`);
    setAppointmentSubTab('today');
  };

  // 7. Walk-in Instant Intake
  const handleWalkinIntake = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === walkinPatientId || p.patientId === walkinPatientId);
    const doc = doctors.find((d) => d.id === walkinDoctorId);

    if (!pat || !doc) {
      alert('Please select patient and on-duty doctor.');
      return;
    }

    const tokenNum = `W-${50 + appointments.filter((x) => x.isWalkIn).length + 1}`;
    const newAppt: ReceptionAppointment = {
      id: `appt-walkin-${Date.now()}`,
      tokenNo: tokenNum,
      apptNo: `APT-IND-${Math.floor(100000 + Math.random() * 900000)}`,
      time: 'Immediate Queue',
      date: new Date().toISOString().split('T')[0],
      patientName: pat.name,
      patientId: pat.patientId || pat.id,
      phone: pat.phone,
      doctorName: doc.name,
      doctorId: doc.id,
      department: doc.department,
      type: 'WALK_IN',
      paymentStatus: walkinFeePaid ? 'PAID' : 'PENDING',
      fee: 800,
      arrivalStatus: 'ARRIVED',
      status: 'CHECKED_IN',
      reason: walkinReason,
      isWalkIn: true,
    };

    saveAppointments([newAppt, ...appointments]);
    playTokenChime(soundEnabled);
    showToast(`Walk-in patient ${pat.name} assigned Token #${tokenNum} & added to ${doc.name}'s live queue ✓`);
    setAppointmentSubTab('walkins');
  };

  // 8. Emergency Registration
  const handleEmergencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emPatientName.trim()) return;

    const tokenNum = `E-0${appointments.filter((a) => a.type === 'EMERGENCY').length + 1}`;
    const emAppt: ReceptionAppointment = {
      id: `appt-em-${Date.now()}`,
      tokenNo: tokenNum,
      apptNo: `EMR-${Math.floor(100000 + Math.random() * 900000)}`,
      time: 'STAT IMMEDIATE',
      date: new Date().toISOString().split('T')[0],
      patientName: emPatientName.trim(),
      patientId: `MNX-EM-${Math.floor(1000 + Math.random() * 9000)}`,
      phone: emPhone.trim() || '+91 99999 00000',
      doctorName: 'Dr. Rajesh Singh (Emergency Trauma Lead)',
      doctorId: 'doc-rajesh',
      department: 'Emergency & Trauma Bay',
      type: 'EMERGENCY',
      paymentStatus: 'PENDING',
      fee: 1500,
      arrivalStatus: 'ARRIVED',
      status: 'CHECKED_IN',
      reason: `${emChiefComplaint} [${emTriagePriority} PRIORITY - ${emAssignedBay}]`,
    };

    saveAppointments([emAppt, ...appointments]);

    // Dispatch notification
    const newNotif: ReceptionNotification = {
      id: `notif-${Date.now()}`,
      title: `🚨 Emergency Intake: ${emPatientName} (${tokenNum})`,
      message: `${emChiefComplaint} - Assigned to ${emAssignedBay}. Team alerted.`,
      timestamp: 'Just now',
      type: 'URGENT',
      read: false,
    };
    setNotifications((n) => [newNotif, ...n]);

    playTokenChime(soundEnabled);
    setShowEmergencyModal(false);
    setEmPatientName('');
    setEmPhone('');
    showToast(`🚨 Emergency case registered! Priority Token #${tokenNum} assigned. Trauma team alerted.`);
    setPrimaryTab('emergency');
  };

  // 9. Call Next Token for Doctor in Queue
  const handleCallNextToken = (doc: ReceptionDoctorStatus) => {
    const curNum = parseInt(doc.currentToken.replace(/\D/g, '') || '0', 10);
    const nextNum = `#${curNum + 1}`;

    setDoctors((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, currentToken: nextNum, waitingCount: Math.max(0, d.waitingCount - 1) } : d))
    );

    playTokenChime(soundEnabled);
    showToast(`Token ${nextNum} called for ${doc.name} (${doc.roomNo}) 📢`);
  };

  // 10. Admit Patient & Allocate Bed
  const handleAdmitPatient = (reqId: string, bedAllocated: string) => {
    setAdmissions((prev) =>
      prev.map((a) =>
        a.id === reqId ? { ...a, status: 'ADMITTED' as const, allocatedBed: bedAllocated } : a
      )
    );
    showToast(`Patient admitted and allocated to Bed ${bedAllocated} ✓`);
  };

  // 11. Complete Discharge Clearance
  const handleCompleteDischarge = (discId: string, patientName: string, bedCode: string) => {
    setDischarges((prev) =>
      prev.map((d) => (d.id === discId ? { ...d, status: 'DISCHARGED' as const } : d))
    );
    showToast(`Discharge gate pass issued for ${patientName}! Bed ${bedCode} released for sanitation ✓`);
  };

  // 12. Settle Bill & Collect Payment
  const handleSettlePayment = () => {
    if (!selectedBillForPayment) return;
    const txn = `${paymentMethod}-REC-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const updatedBills = bills.map((b) =>
      b.id === selectedBillForPayment.id
        ? {
            ...b,
            status: 'PAID' as const,
            paidAmount: b.amount,
            method: paymentMethod,
            transactionRef: txn,
          }
        : b
    );

    setBills(updatedBills);
    setActiveReceiptToPrint({
      ...selectedBillForPayment,
      status: 'PAID',
      paidAmount: selectedBillForPayment.amount,
      method: paymentMethod,
      transactionRef: txn,
    });

    setSelectedBillForPayment(null);
    showToast(`Payment of ₹${selectedBillForPayment.amount} collected via ${paymentMethod}! Receipt generated ✓`);
  };

  // =========================================================================
  // COMPUTED KPIS
  // =========================================================================
  const kpiStats = useMemo(() => {
    const todayTotal = appointments.length + 80;
    const checkedIn = appointments.filter((a) => a.status === 'CHECKED_IN').length + 38;
    const waiting = appointments.filter((a) => a.status === 'CHECKED_IN').length + 15;
    const inConsultation = doctors.filter((d) => d.status === 'IN_CONSULTATION').length + 6;
    const completed = appointments.filter((a) => a.status === 'COMPLETED').length + 24;
    const walkins = appointments.filter((a) => a.isWalkIn).length + 12;
    const emergencies = appointments.filter((a) => a.type === 'EMERGENCY').length + 2;
    const pendingAdmissions = admissions.filter((a) => a.status === 'PENDING_BED').length;
    const readyDischarges = discharges.filter((d) => d.status === 'READY_FOR_DISCHARGE').length;
    const pendingPayments = bills
      .filter((b) => b.status === 'PENDING')
      .reduce((sum, b) => sum + (b.amount - b.paidAmount), 0) + 16800;

    return {
      todayTotal,
      checkedIn,
      waiting,
      inConsultation,
      completed,
      walkins,
      emergencies,
      pendingAdmissions,
      readyDischarges,
      pendingPayments,
    };
  }, [appointments, doctors, admissions, discharges, bills]);

  // Global search filtering
  const searchResults = useMemo(() => {
    if (!globalSearchQuery.trim()) return [];
    const q = globalSearchQuery.toLowerCase();
    const matchedPatients = patients
      .filter((p) => p.name.toLowerCase().includes(q) || p.patientId.toLowerCase().includes(q) || p.phone.includes(q))
      .map((p) => ({ type: 'PATIENT', title: p.name, subtitle: `${p.patientId} • ${p.phone}`, raw: p }));

    const matchedAppts = appointments
      .filter((a) => a.apptNo.toLowerCase().includes(q) || a.patientName.toLowerCase().includes(q) || (a.tokenNo && a.tokenNo.toLowerCase().includes(q)))
      .map((a) => ({ type: 'APPOINTMENT', title: `${a.patientName} (${a.tokenNo || a.apptNo})`, subtitle: `${a.doctorName} • ${a.time}`, raw: a }));

    const matchedDocs = doctors
      .filter((d) => d.name.toLowerCase().includes(q) || d.department.toLowerCase().includes(q))
      .map((d) => ({ type: 'DOCTOR', title: d.name, subtitle: `${d.department} • Room ${d.roomNo}`, raw: d }));

    return [...matchedPatients, ...matchedAppts, ...matchedDocs];
  }, [globalSearchQuery, patients, appointments, doctors]);

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* =========================================================================
          LEFT SIDEBAR (STRICT PRODUCTION HIERARCHY AS SPECIFIED)
      ========================================================================= */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 z-30 select-none shadow-xs`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <MediNexaLogo size="sm" subtitle={sidebarOpen ? 'RECEPTION' : undefined} href="/dashboard" />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer hidden md:block"
            title="Toggle Sidebar"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Staff Identity Card */}
        {sidebarOpen ? (
          <div className="p-3 mx-3 mt-3 rounded-2xl bg-gradient-to-br from-teal-50 to-blue-50 dark:from-slate-800/80 dark:to-slate-800/40 border border-teal-100 dark:border-slate-700/60 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                PS
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {currentUser.firstName} {currentUser.lastName}
                </div>
                <div className="text-[10px] font-mono text-teal-700 dark:text-teal-400 font-bold truncate">
                  {currentUser.staffId}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    Counter #{counterNumber} Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-3 flex justify-center">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs" title="Pooja Singh (Counter #01)">
              PS
            </div>
          </div>
        )}

        {/* Navigation List */}
        <div className="px-3 py-3 flex-1 overflow-y-auto space-y-1 text-xs">
          {/* 1. Dashboard */}
          <button
            onClick={() => setPrimaryTab('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition cursor-pointer ${
              primaryTab === 'dashboard'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Dashboard</span>}
          </button>

          {/* 2. Patients (Collapsible) */}
          <div>
            <button
              onClick={() => {
                setPrimaryTab('patients');
                toggleSection('patients');
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition cursor-pointer ${
                primaryTab === 'patients'
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span>Patients</span>}
              </div>
              {sidebarOpen && (
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSections.patients ? 'rotate-180' : ''}`} />
              )}
            </button>
            {sidebarOpen && expandedSections.patients && (
              <div className="pl-7 pr-1 py-1 space-y-0.5 text-[11px] font-semibold">
                <button
                  onClick={() => {
                    setPrimaryTab('patients');
                    setPatientSubTab('all');
                  }}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition ${
                    primaryTab === 'patients' && patientSubTab === 'all'
                      ? 'text-teal-600 dark:text-teal-400 font-bold bg-teal-50/50 dark:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  All Patients
                </button>
                <button
                  onClick={() => {
                    setPrimaryTab('patients');
                    setPatientSubTab('register');
                  }}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition ${
                    primaryTab === 'patients' && patientSubTab === 'register'
                      ? 'text-teal-600 dark:text-teal-400 font-bold bg-teal-50/50 dark:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  + Register Patient
                </button>
                <button
                  onClick={() => {
                    setPrimaryTab('patients');
                    setPatientSubTab('search');
                  }}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition ${
                    primaryTab === 'patients' && patientSubTab === 'search'
                      ? 'text-teal-600 dark:text-teal-400 font-bold bg-teal-50/50 dark:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Search Patient
                </button>
                <button
                  onClick={() => {
                    setPrimaryTab('patients');
                    setPatientSubTab('visits');
                  }}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition ${
                    primaryTab === 'patients' && patientSubTab === 'visits'
                      ? 'text-teal-600 dark:text-teal-400 font-bold bg-teal-50/50 dark:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Today's Visits
                </button>
              </div>
            )}
          </div>

          {/* 3. Appointments (Collapsible) */}
          <div>
            <button
              onClick={() => {
                setPrimaryTab('appointments');
                toggleSection('appointments');
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition cursor-pointer ${
                primaryTab === 'appointments'
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span>Appointments</span>}
              </div>
              {sidebarOpen && (
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSections.appointments ? 'rotate-180' : ''}`} />
              )}
            </button>
            {sidebarOpen && expandedSections.appointments && (
              <div className="pl-7 pr-1 py-1 space-y-0.5 text-[11px] font-semibold">
                <button
                  onClick={() => {
                    setPrimaryTab('appointments');
                    setAppointmentSubTab('today');
                  }}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition ${
                    primaryTab === 'appointments' && appointmentSubTab === 'today'
                      ? 'text-teal-600 dark:text-teal-400 font-bold bg-teal-50/50 dark:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Today's Appointments
                </button>
                <button
                  onClick={() => {
                    setPrimaryTab('appointments');
                    setAppointmentSubTab('book');
                  }}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition ${
                    primaryTab === 'appointments' && appointmentSubTab === 'book'
                      ? 'text-teal-600 dark:text-teal-400 font-bold bg-teal-50/50 dark:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  + Book Appointment
                </button>
                <button
                  onClick={() => {
                    setPrimaryTab('appointments');
                    setAppointmentSubTab('walkins');
                  }}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition ${
                    primaryTab === 'appointments' && appointmentSubTab === 'walkins'
                      ? 'text-teal-600 dark:text-teal-400 font-bold bg-teal-50/50 dark:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Walk-ins
                </button>
                <button
                  onClick={() => {
                    setPrimaryTab('appointments');
                    setAppointmentSubTab('upcoming');
                  }}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition ${
                    primaryTab === 'appointments' && appointmentSubTab === 'upcoming'
                      ? 'text-teal-600 dark:text-teal-400 font-bold bg-teal-50/50 dark:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => {
                    setPrimaryTab('appointments');
                    setAppointmentSubTab('cancelled');
                  }}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition ${
                    primaryTab === 'appointments' && appointmentSubTab === 'cancelled'
                      ? 'text-teal-600 dark:text-teal-400 font-bold bg-teal-50/50 dark:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Cancelled
                </button>
              </div>
            )}
          </div>

          {/* 4. Queue & Tokens */}
          <button
            onClick={() => setPrimaryTab('queue')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition cursor-pointer ${
              primaryTab === 'queue'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Ticket className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>Queue & Tokens</span>}
            </div>
            {sidebarOpen && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                {kpiStats.waiting}
              </span>
            )}
          </button>

          {/* 5. Emergency (High Priority Badge) */}
          <button
            onClick={() => setPrimaryTab('emergency')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition cursor-pointer ${
              primaryTab === 'emergency'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Siren className="w-4 h-4 shrink-0 animate-pulse text-rose-500" />
              {sidebarOpen && <span>Emergency</span>}
            </div>
            {sidebarOpen && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 animate-ping">
                STAT
              </span>
            )}
          </button>

          {/* 6. Doctors & Availability */}
          <button
            onClick={() => setPrimaryTab('doctors')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition cursor-pointer ${
              primaryTab === 'doctors'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Doctors & Availability</span>}
          </button>

          {/* 7. Admissions & Beds (Collapsible) */}
          <div>
            <button
              onClick={() => {
                setPrimaryTab('admissions');
                toggleSection('admissions');
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition cursor-pointer ${
                primaryTab === 'admissions'
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bed className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span>Admissions & Beds</span>}
              </div>
              {sidebarOpen && (
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSections.admissions ? 'rotate-180' : ''}`} />
              )}
            </button>
            {sidebarOpen && expandedSections.admissions && (
              <div className="pl-7 pr-1 py-1 space-y-0.5 text-[11px] font-semibold">
                <button
                  onClick={() => {
                    setPrimaryTab('admissions');
                    setAdmissionsSubTab('overview');
                  }}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition ${
                    primaryTab === 'admissions' && admissionsSubTab === 'overview'
                      ? 'text-teal-600 dark:text-teal-400 font-bold bg-teal-50/50 dark:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => {
                    setPrimaryTab('admissions');
                    setAdmissionsSubTab('admit');
                  }}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition ${
                    primaryTab === 'admissions' && admissionsSubTab === 'admit'
                      ? 'text-teal-600 dark:text-teal-400 font-bold bg-teal-50/50 dark:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Admit Patient
                </button>
                <button
                  onClick={() => {
                    setPrimaryTab('admissions');
                    setAdmissionsSubTab('register');
                  }}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition ${
                    primaryTab === 'admissions' && admissionsSubTab === 'register'
                      ? 'text-teal-600 dark:text-teal-400 font-bold bg-teal-50/50 dark:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Bed Register
                </button>
                <button
                  onClick={() => {
                    setPrimaryTab('admissions');
                    setAdmissionsSubTab('transfer');
                  }}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition ${
                    primaryTab === 'admissions' && admissionsSubTab === 'transfer'
                      ? 'text-teal-600 dark:text-teal-400 font-bold bg-teal-50/50 dark:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Bed Transfer
                </button>
                <button
                  onClick={() => {
                    setPrimaryTab('admissions');
                    setAdmissionsSubTab('discharge');
                  }}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition ${
                    primaryTab === 'admissions' && admissionsSubTab === 'discharge'
                      ? 'text-teal-600 dark:text-teal-400 font-bold bg-teal-50/50 dark:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Discharge
                </button>
                <button
                  onClick={() => {
                    setPrimaryTab('admissions');
                    setAdmissionsSubTab('history');
                  }}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition ${
                    primaryTab === 'admissions' && admissionsSubTab === 'history'
                      ? 'text-teal-600 dark:text-teal-400 font-bold bg-teal-50/50 dark:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Admission History
                </button>
              </div>
            )}
          </div>

          {/* 8. Billing & Payments */}
          <button
            onClick={() => setPrimaryTab('billing')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition cursor-pointer ${
              primaryTab === 'billing'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>Billing & Payments</span>}
            </div>
            {sidebarOpen && (
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                ₹800
              </span>
            )}
          </button>

          {/* 9. Insurance / TPA */}
          <button
            onClick={() => setPrimaryTab('insurance')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition cursor-pointer ${
              primaryTab === 'insurance'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Insurance / TPA</span>}
          </button>

          {/* 10. Documents */}
          <button
            onClick={() => setPrimaryTab('documents')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition cursor-pointer ${
              primaryTab === 'documents'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Documents</span>}
          </button>

          {/* 11. Notifications */}
          <button
            onClick={() => setPrimaryTab('notifications')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition cursor-pointer ${
              primaryTab === 'notifications'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>Notifications</span>}
            </div>
            {sidebarOpen && notifications.filter((n) => !n.read).length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>

          {/* 12. Reports */}
          <button
            onClick={() => setPrimaryTab('reports')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition cursor-pointer ${
              primaryTab === 'reports'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Reports</span>}
          </button>
        </div>

        {/* Bottom Section: Profile, Settings, Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs font-semibold">
          <button
            onClick={() => setShowProfileModal(true)}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <User className="w-4 h-4 shrink-0 text-slate-500" />
            {sidebarOpen && <span>My Profile</span>}
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <Settings className="w-4 h-4 shrink-0 text-slate-500" />
            {sidebarOpen && <span>Settings</span>}
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('medinexa_token');
                localStorage.removeItem('token');
                localStorage.removeItem('medinexa_user');
                sessionStorage.clear();
                window.location.href = '/';
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MAIN WORKSPACE BODY
      ========================================================================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Operational Action Bar */}
        <header className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between gap-4 shrink-0 z-20">
          {/* Left: Terminal Counter Badge & Global Search */}
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-black rounded-lg border border-teal-500/20 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
              <span>Counter #{counterNumber} Active</span>
            </span>

            <button
              onClick={() => setGlobalSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs text-slate-500 dark:text-slate-400 transition cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Quick Search (Ctrl+K)...</span>
              <kbd className="text-[10px] font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Quick Operational Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPrimaryTab('patients');
                setPatientSubTab('register');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-teal-600" />
              <span>Register Patient</span>
            </button>

            <button
              onClick={() => {
                setPrimaryTab('appointments');
                setAppointmentSubTab('walkins');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-xl transition cursor-pointer border border-teal-200/60 dark:border-teal-800/60"
            >
              <Users className="w-3.5 h-3.5" />
              <span>+ Walk-in</span>
            </button>

            {/* Prominent Emergency Registration Button */}
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs font-black rounded-xl shadow-md shadow-rose-600/20 transition cursor-pointer animate-pulse"
            >
              <Siren className="w-3.5 h-3.5" />
              <span>🚨 Emergency Intake</span>
            </button>

            {/* Audio Token Chime Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl transition cursor-pointer ${
                soundEnabled
                  ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
              }`}
              title={soundEnabled ? 'Audio Chime Enabled' : 'Audio Chime Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <ThemeToggle />
          </div>
        </header>

        {/* Global Toast Feedback */}
        {actionSuccessMsg && (
          <div className="mx-6 mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in duration-200 z-10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* =========================================================================
              VIEW 1: RECEPTION DASHBOARD
          ========================================================================= */}
          {primaryTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Station Hero Header */}
              <div className="rounded-3xl bg-gradient-to-r from-teal-600 via-teal-700 to-indigo-700 text-white p-6 shadow-xl shadow-teal-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold border border-white/20">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Central Hospital Front Desk • Morning Shift Active</span>
                  </div>
                  <h1 className="text-2xl font-black tracking-tight">Front Desk & Intake Command Console</h1>
                  <p className="text-xs text-teal-100 max-w-xl">
                    Coordinate live patient check-ins, emergency walk-ins, OPD queue calling, and administrative bed allocation for{' '}
                    <strong className="text-white underline">{currentUser.facilityName}</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setPrimaryTab('appointments');
                      setAppointmentSubTab('book');
                    }}
                    className="px-4 py-2 bg-white text-teal-800 font-extrabold text-xs rounded-xl shadow-md hover:bg-teal-50 transition cursor-pointer"
                  >
                    + Book Appointment
                  </button>
                  <button
                    onClick={() => setShowEmergencyModal(true)}
                    className="px-4 py-2 bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow-md hover:bg-rose-700 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Siren className="w-3.5 h-3.5" />
                    <span>Emergency Intake</span>
                  </button>
                </div>
              </div>

              {/* 10 Operational KPI Cards (#6 Specification) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Today's Appts</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{kpiStats.todayTotal}</div>
                  <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">82 Confirmed</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Checked-In</div>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{kpiStats.checkedIn}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Token active</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Waiting in Queue</div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{kpiStats.waiting}</div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">Avg 12m wait</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">In Consultation</div>
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{kpiStats.inConsultation}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Active rooms</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Completed</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{kpiStats.completed}</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Rx generated</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Walk-ins Today</div>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{kpiStats.walkins}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Immediate intake</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 shadow-xs bg-rose-50/20 dark:bg-rose-950/20">
                  <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span>Emergency</span>
                  </div>
                  <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{kpiStats.emergencies}</div>
                  <div className="text-[10px] text-rose-600 font-semibold mt-0.5">Trauma Bay priority</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Pending Admits</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{kpiStats.pendingAdmissions}</div>
                  <div className="text-[10px] text-teal-600 font-semibold mt-0.5">Bed check ready</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Discharges Ready</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{kpiStats.readyDischarges}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Gate pass pending</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Pending Payments</div>
                  <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-1">₹{kpiStats.pendingPayments.toLocaleString()}</div>
                  <div className="text-[10px] text-amber-700 font-semibold mt-0.5">OPD & Triage folios</div>
                </div>
              </div>

              {/* Split Dashboard View */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Live Check-in Stream & Actionable Table */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Patient Intake & Priority Queue
                      </h2>
                      <p className="text-xs text-slate-500">Live operational queue awaiting front desk arrival verification.</p>
                    </div>
                    <button
                      onClick={() => setPrimaryTab('appointments')}
                      className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      View All Appts →
                    </button>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="py-3 px-4">Token</th>
                            <th className="py-3 px-4">Patient</th>
                            <th className="py-3 px-4">Doctor</th>
                            <th className="py-3 px-4">Time & Type</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                          {appointments.slice(0, 6).map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                              <td className="py-3 px-4 font-mono font-bold text-teal-600 dark:text-teal-400">
                                {item.tokenNo || '—'}
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900 dark:text-white">{item.patientName}</div>
                                <div className="text-[10px] text-slate-400">{item.patientId} • {item.phone}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-800 dark:text-slate-200">{item.doctorName}</div>
                                <div className="text-[10px] text-slate-500">{item.department}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{item.time}</div>
                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                                  item.type === 'EMERGENCY'
                                    ? 'bg-rose-100 text-rose-700'
                                    : item.type === 'WALK_IN'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {item.type}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide uppercase ${
                                  item.status === 'CONFIRMED'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                    : item.status === 'CHECKED_IN'
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                    : item.status === 'IN_CONSULTATION'
                                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                                }`}>
                                  {item.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                                {item.status === 'REQUESTED' && (
                                  <button
                                    onClick={() => handleConfirmAppointment(item.id, item.apptNo, item.patientName)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                                  >
                                    Confirm ✓
                                  </button>
                                )}
                                {item.status === 'CONFIRMED' && (
                                  <button
                                    onClick={() => handleCheckInPatient(item.id, item.apptNo, item.patientName)}
                                    className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1 inline-flex"
                                  >
                                    <Clock className="w-3 h-3" />
                                    <span>Check-in 🩺</span>
                                  </button>
                                )}
                                {item.status === 'CHECKED_IN' && (
                                  <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">
                                    In Queue #{item.tokenNo}
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

                {/* Right Col: Live Doctor OPD Availability Widget (#15) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Doctor OPD Availability
                      </h2>
                      <p className="text-xs text-slate-500">Live active consultation rooms</p>
                    </div>
                    <button
                      onClick={() => setPrimaryTab('doctors')}
                      className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      All Doctors →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {doctors.slice(0, 4).map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                doc.status === 'AVAILABLE'
                                  ? 'bg-emerald-500 animate-pulse'
                                  : doc.status === 'IN_CONSULTATION'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            <h3 className="font-bold text-xs text-slate-900 dark:text-white">{doc.name}</h3>
                          </div>
                          <p className="text-[11px] text-slate-500">{doc.department} • {doc.roomNo}</p>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Current Token: <strong className="font-mono text-teal-600 dark:text-teal-400">{doc.currentToken}</strong> • Waiting: {doc.waitingCount}
                          </div>
                        </div>

                        <div>
                          {doc.status === 'AVAILABLE' ? (
                            <button
                              onClick={() => handleCallNextToken(doc)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold rounded-lg text-xs transition cursor-pointer border border-emerald-200 dark:border-emerald-800"
                            >
                              Call Next 📢
                            </button>
                          ) : doc.status === 'IN_CONSULTATION' ? (
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-md border border-amber-200">
                              Next: {doc.nextAvailableTime}
                            </span>
                          ) : (
                            <button
                              onClick={() => setSmartAlternativeTargetDoc(doc)}
                              className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded hover:underline cursor-pointer"
                            >
                              Find Alt ⚡
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: PATIENTS (ALL, REGISTER, SEARCH, VISITS)
          ========================================================================= */}
          {primaryTab === 'patients' && (
            <div className="space-y-6">
              {/* Sub-Tabs Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600" />
                  <h1 className="text-lg font-black text-slate-900 dark:text-white">Patient Master Directory</h1>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setPatientSubTab('all')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      patientSubTab === 'all' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    All Patients ({patients.length})
                  </button>
                  <button
                    onClick={() => setPatientSubTab('register')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      patientSubTab === 'register' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    + Register Patient
                  </button>
                  <button
                    onClick={() => setPatientSubTab('search')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      patientSubTab === 'search' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Search Directory
                  </button>
                  <button
                    onClick={() => setPatientSubTab('visits')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      patientSubTab === 'visits' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Today's Visits
                  </button>
                </div>
              </div>

              {/* Sub-Tab 1: All Patients Table */}
              {patientSubTab === 'all' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Patient Name</th>
                          <th className="py-3 px-4">Patient ID / UHID</th>
                          <th className="py-3 px-4">Demographics</th>
                          <th className="py-3 px-4">Contact</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {patients.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${p.avatarBg || 'from-teal-600 to-indigo-600'} text-white flex items-center justify-center font-bold text-xs`}>
                                  {p.initials || p.name[0]}
                                </div>
                                <span>{p.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-teal-600 dark:text-teal-400">
                              <div>{p.patientId}</div>
                              <div className="text-[10px] text-slate-400 font-normal">{p.uhid}</div>
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                              {p.age} yrs • {p.gender} • <span className="font-bold text-rose-500">{p.bloodGroup}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                              <div>{p.phone}</div>
                              <div className="text-[10px] text-slate-400 truncate max-w-xs">{p.email}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${p.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                                {p.category || 'General'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedPatientForView(p)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs transition cursor-pointer"
                              >
                                View Profile 👤
                              </button>
                              <button
                                onClick={() => {
                                  setBookPatientId(p.patientId || p.id);
                                  setPrimaryTab('appointments');
                                  setAppointmentSubTab('book');
                                }}
                                className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                              >
                                + Book OPD
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: Patient Registration Form with Global Identity & Hospital Registration */}
              {patientSubTab === 'register' && (
                <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Global Patient Identity & Hospital Registration</span>
                    </div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Hospital Patient Registration & Intake
                    </h2>
                    <p className="text-xs text-slate-500">
                      Check if patient already exists anywhere across MediNexa before creating a record. One patient = One permanent Global UHID.
                    </p>
                  </div>

                  {/* 1. FIND EXISTING MEDINEXA PATIENT (Section 4 & 5) */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-slate-800/90 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-blue-600" />
                        <h2 className="text-sm font-black uppercase tracking-wider text-blue-950 dark:text-blue-200">
                          Find Existing MediNexa Patient
                        </h2>
                      </div>
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        One Patient = One Permanent UHID
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        MediNexa Patient ID
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={globalLookupQuery}
                          onChange={(e) => setGlobalLookupQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSearchGlobalPatient();
                            }
                          }}
                          placeholder="e.g. AYU-4826-KM"
                          className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleSearchGlobalPatient()}
                          disabled={globalLookupLoading}
                          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Search className={`w-3.5 h-3.5 ${globalLookupLoading ? 'animate-spin' : ''}`} />
                          <span>{globalLookupLoading ? 'Finding...' : 'Find Patient'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowReceptionQrModal(true)}
                          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Scan QR</span>
                        </button>
                      </div>
                    </div>

                    {/* LOOKUP RESULT: ALREADY REGISTERED AT THIS HOSPITAL (Section 21) */}
                    {lookupFeedback?.type === 'EXISTS_REGISTERED' && (
                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <div className="text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                              Existing Hospital Registration Found
                            </div>
                            <div className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold mt-0.5">
                              {lookupFeedback.message}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              Patient is active at this hospital. You can open their chart or schedule a new OPD consultation.
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedPatientForView(matchedGlobalPatient?.patient)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            Open Patient
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setBookPatientId(matchedGlobalPatient?.patient?.patientId || matchedGlobalPatient?.patient?.id);
                              setPrimaryTab('appointments');
                              setAppointmentSubTab('book');
                            }}
                            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-emerald-300 text-emerald-900 dark:text-emerald-200 text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            Create New Visit
                          </button>
                        </div>
                      </div>
                    )}

                    {/* LOOKUP RESULT: EXACT SECTION 4 PATIENT FOUND LAYOUT */}
                    {lookupFeedback?.type === 'EXISTS_NEW' && (
                      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/50 shadow-xl space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                              Patient Found
                            </h3>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            Permanent Global UHID
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              MediNexa Patient ID
                            </div>
                            <div className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm mt-0.5">
                              {matchedGlobalPatient?.patient?.uhid || 'AYU-4826-KM'}
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Patient Name
                            </div>
                            <div className="font-black text-slate-900 dark:text-white text-sm mt-0.5">
                              {matchedGlobalPatient?.patient?.fullName || matchedGlobalPatient?.patient?.name || 'Patient'}
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Global Profile
                            </div>
                            <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Available</span>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Current Hospital Registration
                            </div>
                            <div className="font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                              Not registered at this hospital
                            </div>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Previous/Existing Hospital Registrations
                          </div>
                          <div className="space-y-1.5">
                            {(matchedGlobalPatient?.registrations && matchedGlobalPatient.registrations.length > 0) ? (
                              matchedGlobalPatient.registrations.map((reg: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-xs font-mono">
                                  <span className="font-bold text-slate-700 dark:text-slate-300 font-sans">
                                    {reg.facilityName || reg.facilityId || 'Hospital A'}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 font-bold">
                                    {reg.mrn || 'MRN-A-2026-004521'}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="font-bold text-slate-700 dark:text-slate-300 font-sans">Hospital A</span>
                                <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 font-bold">
                                  MRN-A-2026-004521
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-end pt-1">
                          <button
                            type="button"
                            onClick={handleCreateHospitalRegistrationForExisting}
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black rounded-xl transition shadow-md shadow-indigo-600/25 cursor-pointer flex items-center gap-2"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>Register at This Hospital</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* LOOKUP RESULT: VERIFICATION REQUIRED (Section 3) */}
                    {lookupFeedback?.type === 'VERIFY_REQ' && (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{lookupFeedback.message}</span>
                      </div>
                    )}

                    {/* LOOKUP RESULT: NOT FOUND */}
                    {lookupFeedback?.type === 'NOT_FOUND' && (
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <Info className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>{lookupFeedback.message}</span>
                      </div>
                    )}
                  </div>

                  {/* DUPLICATE PATIENT WARNING BANNER */}
                  {duplicateCandidate && (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                          <div className="text-xs font-black text-amber-900 dark:text-amber-200">
                            Existing Patient Account Detected in Local Roster!
                          </div>
                          <div className="text-xs text-amber-800 dark:text-amber-300">
                            Matched patient: <strong>{duplicateCandidate.name}</strong> • ID: <span className="font-mono font-bold">{duplicateCandidate.patientId}</span> • Phone: {duplicateCandidate.phone}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPatientForView(duplicateCandidate)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Open Patient Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBookPatientId(duplicateCandidate.patientId || duplicateCandidate.id);
                            setPrimaryTab('appointments');
                            setAppointmentSubTab('book');
                          }}
                          className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-amber-300 text-amber-900 dark:text-amber-200 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Continue with Existing
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Step 2: Register Brand-New Global Patient
                    </span>
                  </div>


                  <form onSubmit={handleRegisterPatient} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          First Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={regFirstName}
                          onChange={(e) => setRegFirstName(e.target.value)}
                          placeholder="e.g. Ayush"
                          className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Last Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={regLastName}
                          onChange={(e) => setRegLastName(e.target.value)}
                          placeholder="e.g. Singh"
                          className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Date of Birth</label>
                        <input
                          type="date"
                          value={regDob}
                          onChange={(e) => setRegDob(e.target.value)}
                          className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Gender</label>
                        <select
                          value={regGender}
                          onChange={(e) => setRegGender(e.target.value as any)}
                          className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Blood Group</label>
                        <select
                          value={regBloodGroup}
                          onChange={(e) => setRegBloodGroup(e.target.value)}
                          className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                        >
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Mobile Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="patient@gmail.com"
                          className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Full Residential Address</label>
                      <input
                        type="text"
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        placeholder="House, Street, City, State, PIN"
                        className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Emergency Contact Person</label>
                        <input
                          type="text"
                          value={regEmergencyContact}
                          onChange={(e) => setRegEmergencyContact(e.target.value)}
                          placeholder="e.g. Suman Singh (Spouse)"
                          className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Emergency Contact Phone</label>
                        <input
                          type="tel"
                          value={regEmergencyPhone}
                          onChange={(e) => setRegEmergencyPhone(e.target.value)}
                          placeholder="+91 98000 11223"
                          className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                    >
                      Complete Patient Registration & Generate Patient ID
                    </button>
                  </form>
                </div>
              )}

              {/* Sub-Tab 3: Fast Patient Search (#12) */}
              {patientSubTab === 'search' && (
                <div className="max-w-3xl mx-auto space-y-4">
                  <div className="relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      placeholder="Search patient by Patient ID (MNX-P-...), Mobile, Name, or UHID..."
                      value={globalSearchQuery}
                      onChange={(e) => setGlobalSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs shadow-sm font-semibold outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="space-y-3">
                    {patients
                      .filter((p) => {
                        if (!globalSearchQuery.trim()) return true;
                        const q = globalSearchQuery.toLowerCase();
                        return p.name.toLowerCase().includes(q) || p.patientId.toLowerCase().includes(q) || p.phone.includes(q);
                      })
                      .map((p) => (
                        <div
                          key={p.id}
                          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                              {p.initials}
                            </div>
                            <div>
                              <div className="font-extrabold text-sm text-slate-900 dark:text-white">{p.name}</div>
                              <div className="text-xs text-slate-500 font-mono">
                                ID: <span className="text-teal-600 font-bold">{p.patientId}</span> • Phone: {p.phone}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">{p.condition}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedPatientForView(p)}
                              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200"
                            >
                              Profile 👤
                            </button>
                            <button
                              onClick={() => {
                                setBookPatientId(p.patientId || p.id);
                                setPrimaryTab('appointments');
                                setAppointmentSubTab('book');
                              }}
                              className="px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700"
                            >
                              + Book
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Sub-Tab 4: Today's Visits */}
              {patientSubTab === 'visits' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                  <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    Today's Registered Patient Footfalls ({appointments.filter(a => a.arrivalStatus === 'ARRIVED').length} Checked In)
                  </h3>
                  <div className="space-y-2">
                    {appointments.filter(a => a.arrivalStatus === 'ARRIVED').map((a) => (
                      <div key={a.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-teal-600">{a.tokenNo}</span>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">{a.patientName}</span>
                            <span className="text-slate-400 ml-2">Visiting {a.doctorName} ({a.department})</span>
                          </div>
                        </div>
                        <span className="font-mono text-slate-500 font-semibold">{a.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              VIEW 3: APPOINTMENTS WORKSPACE
          ========================================================================= */}
          {primaryTab === 'appointments' && (
            <div className="space-y-6">
              {/* Header with Sub-tabs */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <h1 className="text-lg font-black text-slate-900 dark:text-white">Appointment Operations Desk</h1>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setAppointmentSubTab('today')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      appointmentSubTab === 'today' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Today's ({appointments.length})
                  </button>
                  <button
                    onClick={() => setAppointmentSubTab('book')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      appointmentSubTab === 'book' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    + Book Appt
                  </button>
                  <button
                    onClick={() => setAppointmentSubTab('walkins')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      appointmentSubTab === 'walkins' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Walk-ins ({appointments.filter(a => a.isWalkIn).length})
                  </button>
                  <button
                    onClick={() => setAppointmentSubTab('upcoming')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      appointmentSubTab === 'upcoming' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setAppointmentSubTab('cancelled')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      appointmentSubTab === 'cancelled' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Cancelled
                  </button>
                </div>
              </div>

              {/* Sub-View: Today's Appointments Table (#8 Columns & #9 Actions) */}
              {appointmentSubTab === 'today' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-3 px-3">Token</th>
                          <th className="py-3 px-3">Time</th>
                          <th className="py-3 px-3">Patient</th>
                          <th className="py-3 px-3">Doctor & Dept</th>
                          <th className="py-3 px-3">Type</th>
                          <th className="py-3 px-3">Payment</th>
                          <th className="py-3 px-3">Arrival</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {appointments.map((a) => (
                          <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                            <td className="py-3 px-3 font-mono font-bold text-teal-600 dark:text-teal-400">
                              {a.tokenNo || '—'}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300 font-semibold">
                              {a.time}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-900 dark:text-white">{a.patientName}</div>
                              <div className="text-[10px] text-slate-400">{a.patientId} • {a.phone}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-800 dark:text-slate-200">{a.doctorName}</div>
                              <div className="text-[10px] text-slate-500">{a.department}</div>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                a.type === 'EMERGENCY' ? 'bg-rose-100 text-rose-700' : a.type === 'WALK_IN' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {a.type}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`text-[10px] font-bold ${a.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600 animate-pulse'}`}>
                                ₹{a.fee} ({a.paymentStatus})
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`text-[10px] font-bold ${a.arrivalStatus === 'ARRIVED' ? 'text-teal-600' : 'text-slate-400'}`}>
                                {a.arrivalStatus === 'ARRIVED' ? '✓ Arrived' : 'Not Arrived'}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide uppercase ${
                                a.status === 'CONFIRMED'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : a.status === 'CHECKED_IN'
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                  : a.status === 'IN_CONSULTATION'
                                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                  : a.status === 'CANCELLED'
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                              }`}>
                                {a.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                              {a.status === 'REQUESTED' && (
                                <button
                                  onClick={() => handleConfirmAppointment(a.id, a.apptNo, a.patientName)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                                  title="Confirm Appointment"
                                >
                                  Confirm ✓
                                </button>
                              )}
                              {a.status === 'CONFIRMED' && (
                                <button
                                  onClick={() => handleCheckInPatient(a.id, a.apptNo, a.patientName)}
                                  className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs transition cursor-pointer inline-flex items-center gap-1"
                                  title="Check In & Issue Token"
                                >
                                  <Clock className="w-3 h-3" />
                                  <span>Check-in 🩺</span>
                                </button>
                              )}
                              {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
                                <button
                                  onClick={() => {
                                    const reason = prompt('Please enter reason for cancellation:');
                                    if (reason) handleCancelAppointment(a.id, a.apptNo, reason);
                                  }}
                                  className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded text-xs transition"
                                  title="Cancel Appointment"
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
                </div>
              )}

              {/* Sub-View: Book Appointment Wizard (#22 & #23) */}
              {appointmentSubTab === 'book' && (
                <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Book Patient Appointment</h2>
                    <p className="text-xs text-slate-500">
                      Validated scheduling engine: only available doctor slots permitted. Prevents double-booking.
                    </p>
                  </div>

                  <form onSubmit={handleBookAppointmentSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Select Patient <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={bookPatientId}
                        onChange={(e) => setBookPatientId(e.target.value)}
                        className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                      >
                        <option value="">Select registered patient...</option>
                        {patients.map((p) => (
                          <option key={p.id} value={p.patientId || p.id}>
                            {p.name} ({p.patientId || p.uhid} • {p.phone})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Doctor & Department <span className="text-rose-500">*</span>
                        </label>
                        <select
                          required
                          value={bookDoctorId}
                          onChange={(e) => setBookDoctorId(e.target.value)}
                          className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                        >
                          {doctors.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.department} • Room {d.roomNo})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Date <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={bookDate}
                          onChange={(e) => setBookDate(e.target.value)}
                          className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Available Consultation Slot <span className="text-rose-500">*</span>
                      </label>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {doctors.find((d) => d.id === bookDoctorId)?.availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setBookSlot(slot)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              bookSlot === slot
                                ? 'bg-teal-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Appointment Type</label>
                        <select
                          value={bookType}
                          onChange={(e) => setBookType(e.target.value as any)}
                          className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                        >
                          <option value="OPD">Regular OPD Consultation</option>
                          <option value="WALK_IN">Front Desk Walk-in</option>
                          <option value="TELEMEDICINE">Virtual Telemedicine</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Chief Reason / Note</label>
                        <input
                          type="text"
                          value={bookReason}
                          onChange={(e) => setBookReason(e.target.value)}
                          placeholder="e.g. Routine follow-up, Chest checkup"
                          className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-teal-900 dark:text-teal-200">Consultation Fee: ₹800</div>
                        <div className="text-[11px] text-teal-700 dark:text-teal-400">Collect payment at Front Desk terminal</div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-teal-900 dark:text-teal-200">
                        <input
                          type="checkbox"
                          checked={bookPaymentCollected}
                          onChange={(e) => setBookPaymentCollected(e.target.checked)}
                          className="w-4 h-4 text-teal-600 rounded"
                        />
                        <span>Payment Received (PAID)</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                    >
                      Confirm Appointment & Issue Token
                    </button>
                  </form>
                </div>
              )}

              {/* Sub-View: Walk-ins Management (#14) */}
              {appointmentSubTab === 'walkins' && (
                <div className="space-y-6">
                  <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-xs text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                        Walk-in Patient Fast-Track Intake
                      </h3>
                      <p className="text-xs text-amber-800 dark:text-amber-400">
                        Patients arriving without prior booking: search, assign on-duty doctor, issue live token and insert into immediate queue.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Walk-in Intake Form */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase">New Walk-in Entry</h4>
                      <form onSubmit={handleWalkinIntake} className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Patient</label>
                          <select
                            required
                            value={walkinPatientId}
                            onChange={(e) => setWalkinPatientId(e.target.value)}
                            className="mt-1 w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                          >
                            <option value="">Select patient...</option>
                            {patients.map((p) => (
                              <option key={p.id} value={p.patientId || p.id}>
                                {p.name} ({p.phone})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Available Doctor</label>
                          <select
                            required
                            value={walkinDoctorId}
                            onChange={(e) => setWalkinDoctorId(e.target.value)}
                            className="mt-1 w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                          >
                            {doctors.filter(d => d.status !== 'UNAVAILABLE').map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.department} • Room {d.roomNo})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Symptoms / Complaint</label>
                          <input
                            type="text"
                            value={walkinReason}
                            onChange={(e) => setWalkinReason(e.target.value)}
                            className="mt-1 w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                          />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={walkinFeePaid}
                            onChange={(e) => setWalkinFeePaid(e.target.checked)}
                            className="w-4 h-4 text-teal-600 rounded"
                          />
                          <span>Collect ₹800 Consultation Fee</span>
                        </label>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Generate Walk-in Token 🎟️
                        </button>
                      </form>
                    </div>

                    {/* Today's Walk-in Queue */}
                    <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase">Today's Walk-in Queue</h4>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {appointments.filter(a => a.isWalkIn).map((w) => (
                          <div key={w.id} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                                {w.tokenNo}
                              </span>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">{w.patientName}</div>
                                <div className="text-[10px] text-slate-500">{w.doctorName} • {w.reason}</div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                              {w.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-View: Upcoming & Cancelled */}
              {appointmentSubTab === 'upcoming' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-500">
                  <Calendar className="w-8 h-8 text-teal-600 mx-auto mb-2 opacity-60" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">Upcoming Scheduled Appointments</p>
                  <p className="text-[11px] mt-1">28 appointments booked for tomorrow. Automatic SMS reminders dispatched.</p>
                </div>
              )}

              {appointmentSubTab === 'cancelled' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase">Cancelled Appointments Audit Log</h4>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {appointments.filter(a => a.status === 'CANCELLED').map((c) => (
                      <div key={c.id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{c.patientName} ({c.apptNo})</div>
                          <div className="text-slate-500 text-[11px]">{c.doctorName} • Slot: {c.time}</div>
                          <div className="text-rose-600 text-[10px] mt-0.5">Reason: {c.cancellationReason || 'Patient requested refund'}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700">
                          100% REFUND CLEARED
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              VIEW 4: QUEUE & TOKENS WORKSPACE (#18 & #19)
          ========================================================================= */}
          {primaryTab === 'queue' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-teal-600" />
                    <span>Live OPD Token Calling & Queue Management</span>
                  </h1>
                  <p className="text-xs text-slate-500">
                    Real-time cross-module synchronization: calling next token updates Doctor Dashboard and Patient Portal instantly.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => playTokenChime(true)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Test Audio Chime</span>
                  </button>
                </div>
              </div>

              {/* Grid of Doctor Consultation Rooms with Token Calling Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
                            {doc.roomNo} • {doc.department}
                          </div>
                          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">{doc.name}</h3>
                          <p className="text-[11px] text-slate-500">{doc.specialty}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          doc.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : doc.status === 'IN_CONSULTATION' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {doc.status}
                        </span>
                      </div>

                      {/* Token Big Display */}
                      <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Active Token</div>
                        <div className="text-3xl font-black font-mono text-teal-600 dark:text-teal-400 mt-1">
                          {doc.currentToken}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {doc.waitingCount} patients waiting in queue
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleCallNextToken(doc)}
                        className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Call Next Token (Chime 📢)</span>
                      </button>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-1">
                        <span>Next Avail: {doc.nextAvailableTime}</span>
                        <button
                          onClick={() => {
                            const newTok = prompt(`Set manual token for ${doc.name}:`, doc.currentToken);
                            if (newTok) {
                              setDoctors(prev => prev.map(d => d.id === doc.id ? { ...d, currentToken: newTok } : d));
                              playTokenChime(soundEnabled);
                            }
                          }}
                          className="text-teal-600 hover:underline cursor-pointer"
                        >
                          Manual Token Set
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 5: EMERGENCY INTAKE WORKSPACE (#20 & #21)
          ========================================================================= */}
          {primaryTab === 'emergency' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-700 text-white shadow-xl shadow-rose-600/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold border border-white/20">
                    <Siren className="w-3.5 h-3.5 animate-pulse text-amber-300" />
                    <span>Hospital Trauma & Emergency Registration Point</span>
                  </div>
                  <h1 className="text-2xl font-black">Emergency Intake Command</h1>
                  <p className="text-xs text-rose-100 max-w-xl">
                    High-priority triage registration with automated E-token tagging (`E-01`, `E-02`) and immediate broadcast to on-duty trauma bay physicians.
                  </p>
                </div>

                <button
                  onClick={() => setShowEmergencyModal(true)}
                  className="px-5 py-3 bg-white text-rose-700 font-black text-xs rounded-2xl shadow-lg hover:bg-rose-50 transition cursor-pointer flex items-center gap-2"
                >
                  <Siren className="w-4 h-4 text-rose-600" />
                  <span>+ New Emergency Intake</span>
                </button>
              </div>

              {/* Active Emergency Patients Table */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Active Emergency Cases in Trauma & Triage Bay
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Emergency Token</th>
                        <th className="py-3 px-4">Patient Name</th>
                        <th className="py-3 px-4">Chief Complaint & Priority</th>
                        <th className="py-3 px-4">Allocated Bay / Team</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {appointments.filter(a => a.type === 'EMERGENCY').map((em) => (
                        <tr key={em.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono font-extrabold text-rose-600 text-sm">
                            {em.tokenNo}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">{em.patientName}</div>
                            <div className="text-[10px] text-slate-400">{em.patientId} • {em.phone}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                            {em.reason}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">
                            {em.doctorName}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse">
                              {em.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setAdmissions(prev => [
                                  {
                                    id: `adm-em-${Date.now()}`,
                                    requestNo: `ADM-EM-${Math.floor(100 + Math.random() * 900)}`,
                                    patientName: em.patientName,
                                    patientId: em.patientId,
                                    doctorName: em.doctorName,
                                    department: 'ICU / Acute Trauma',
                                    wardType: 'ICU',
                                    priority: 'EMERGENCY',
                                    status: 'PENDING_BED',
                                    requestedAt: 'Just now',
                                    diagnosis: em.reason,
                                  },
                                  ...prev,
                                ]);
                                showToast(`ICU Bed requested for emergency patient ${em.patientName} ✓`);
                                setPrimaryTab('admissions');
                              }}
                              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                            >
                              Request ICU Bed 🛏️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 6: DOCTORS & AVAILABILITY (#15 & #16)
          ========================================================================= */}
          {primaryTab === 'doctors' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-teal-600" />
                  <span>Hospital Clinical Specialist Directory & Live OPD Roster</span>
                </h1>
                <p className="text-xs text-slate-500">
                  Live occupancy, OPD room numbers, and intelligent alternative recommendation flow when specialists are booked or unavailable.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {doctors.map((d) => (
                  <div
                    key={d.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${d.status === 'AVAILABLE' ? 'bg-emerald-500' : d.status === 'IN_CONSULTATION' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                          <span className="text-[10px] font-black uppercase text-teal-600">{d.roomNo}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          d.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : d.status === 'IN_CONSULTATION' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {d.status}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-2">{d.name}</h3>
                      <p className="text-xs text-slate-500">{d.specialty} ({d.department})</p>

                      <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Current Token:</span>
                          <span className="font-mono font-bold text-teal-600">{d.currentToken}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Queue Depth:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{d.waitingCount} Waiting</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Next Open Slot:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{d.nextAvailableTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setBookDoctorId(d.id);
                          setPrimaryTab('appointments');
                          setAppointmentSubTab('book');
                        }}
                        className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Book Slot
                      </button>
                      <button
                        onClick={() => setSmartAlternativeTargetDoc(d)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                        title="Find Smart Alternatives"
                      >
                        Find Alt ⚡
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 7: ADMISSIONS & BEDS WORKSTATION
          ========================================================================= */}
          {primaryTab === 'admissions' && (
            <AdmissionsBedsModule
              initialSubTab={admissionsSubTab}
              onSubTabChange={(tab) => setAdmissionsSubTab(tab)}
              hospitalFacilityId={currentUser?.facilityId || '0db9bd5f-ddb6-4d12-aa0d-83adc1415a06'}
            />
          )}

          {/* =========================================================================
              VIEW 8: BILLING & PAYMENTS (#24 & #25)
          ========================================================================= */}
          {primaryTab === 'billing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-teal-600" />
                    <span>Front Desk Cashier & OPD Payment Collection Desk</span>
                  </h1>
                  <p className="text-xs text-slate-500">
                    Collect consultation fees, advance bed deposits, issue authorized GST tax receipts, and record payment modes.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Invoice #</th>
                        <th className="py-3 px-4">Patient Name</th>
                        <th className="py-3 px-4">Service Description</th>
                        <th className="py-3 px-4">Total Amount</th>
                        <th className="py-3 px-4">Status & Method</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {bills.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono font-bold text-teal-600">{b.billNo}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">{b.patientName}</div>
                            <div className="text-[10px] text-slate-400">{b.patientId}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">{b.service}</td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">₹{b.amount}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              b.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700 animate-pulse'
                            }`}>
                              {b.status} {b.method ? `• ${b.method}` : ''}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                            {b.status === 'PENDING' ? (
                              <button
                                onClick={() => setSelectedBillForPayment(b)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                              >
                                Collect Payment (₹{b.amount}) 💳
                              </button>
                            ) : (
                              <button
                                onClick={() => setActiveReceiptToPrint(b)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1 inline-flex"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Print Receipt</span>
                              </button>
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

          {/* =========================================================================
              VIEW 9: INSURANCE / TPA (#26)
          ========================================================================= */}
          {primaryTab === 'insurance' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  <span>Insurance & Cashless TPA Desk</span>
                </h1>
                <p className="text-xs text-slate-500">
                  Pre-authorization tracking, policy verification with Star Health, HDFC ERGO, Medi Assist, and Ayushman Bharat PM-JAY.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Patient Name</th>
                        <th className="py-3 px-4">Insurance Company & TPA</th>
                        <th className="py-3 px-4">Policy #</th>
                        <th className="py-3 px-4">Pre-Auth Status</th>
                        <th className="py-3 px-4">Approved Amount</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {insuranceRecords.map((ins) => (
                        <tr key={ins.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">{ins.patientName}</div>
                            <div className="text-[10px] text-slate-400">{ins.patientId}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800 dark:text-slate-200">{ins.provider}</div>
                            <div className="text-[10px] text-slate-500">{ins.tpa}</div>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {ins.policyNo}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              ins.preAuthStatus === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ins.preAuthStatus === 'SUBMITTED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {ins.preAuthStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-600">
                            ₹{ins.approvedAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setInsuranceRecords(prev => prev.map(r => r.id === ins.id ? { ...r, preAuthStatus: 'APPROVED', approvedAmount: r.claimAmount } : r));
                                showToast(`Pre-authorization approved for ${ins.patientName} (₹${ins.claimAmount}) ✓`);
                              }}
                              className="px-2.5 py-1 bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 font-bold rounded-lg text-xs hover:bg-teal-100"
                            >
                              Approve Pre-Auth ✓
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 10: DOCUMENTS (#31)
          ========================================================================= */}
          {primaryTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    <span>Administrative Document Vault</span>
                  </h1>
                  <p className="text-xs text-slate-500">
                    Patient intake slips, identity verifications, admission consents, and gate pass documents.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const name = prompt('Enter Patient Name:');
                    if (name) {
                      setDocuments(prev => [
                        {
                          id: `doc-${Date.now()}`,
                          patientName: name,
                          patientId: 'MNX-P-MANUAL',
                          docType: 'REGISTRATION_SLIP',
                          fileName: `Administrative_Slip_${name.replace(/\s+/g, '_')}.pdf`,
                          uploadedAt: 'Today, Just Now',
                          fileSize: '190 KB',
                        },
                        ...prev,
                      ]);
                      showToast(`Document uploaded and attached to ${name}'s records ✓`);
                    }
                  }}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Admin Document</span>
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {documents.map((doc) => (
                    <div key={doc.id} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center font-bold">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{doc.fileName}</div>
                          <div className="text-[10px] text-slate-500">
                            Patient: <strong className="text-slate-700 dark:text-slate-300">{doc.patientName}</strong> • {doc.fileSize} • Uploaded: {doc.uploadedAt}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => showToast(`Opening document ${doc.fileName} preview...`)}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 dark:text-slate-300 rounded-lg font-bold"
                        >
                          View 👁️
                        </button>
                        <button
                          onClick={() => showToast(`Downloading ${doc.fileName}...`)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-bold flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 11: NOTIFICATIONS (#32 & #33)
          ========================================================================= */}
          {primaryTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-teal-600" />
                    <span>Real-Time Operational Notifications</span>
                  </h1>
                  <p className="text-xs text-slate-500">Live operational alerts for doctor delays, patient arrivals, and bed transfers.</p>
                </div>

                <button
                  onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                  className="text-xs font-bold text-teal-600 hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
              </div>

              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                      !n.read
                        ? 'bg-teal-50/40 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${n.type === 'URGENT' ? 'bg-rose-500 animate-ping' : 'bg-teal-500'}`} />
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{n.title}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
                    </div>

                    <button
                      onClick={() => showToast('Dispatched automated SMS reminder to patient! ✓')}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      Send SMS / Alert 📲
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 12: REPORTS (#35)
          ========================================================================= */}
          {primaryTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-teal-600" />
                    <span>Daily Shift Operational Report</span>
                  </h1>
                  <p className="text-xs text-slate-500">Summary of today's patient registrations, collections, and consultation throughput.</p>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Shift Summary</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total Registrations</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{patients.length}</div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total Appointments</div>
                  <div className="text-2xl font-black text-teal-600 mt-1">{appointments.length}</div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total OPD Fees Collected</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">₹34,800</div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Average Wait Time</div>
                  <div className="text-2xl font-black text-indigo-600 mt-1">11.4 mins</div>
                </div>
              </div>

              {/* Department breakdown */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
                <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Consultation Throughput by Specialty Department
                </h3>
                <div className="space-y-2 text-xs">
                  {[
                    { dept: 'Cardiology', appts: 24, completed: 18, wait: '8m' },
                    { dept: 'General Medicine', appts: 32, completed: 22, wait: '14m' },
                    { dept: 'Orthopedics', appts: 16, completed: 11, wait: '12m' },
                    { dept: 'Pediatrics', appts: 14, completed: 10, wait: '7m' },
                  ].map((row) => (
                    <div key={row.dept} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between font-semibold">
                      <span className="font-bold text-slate-900 dark:text-white">{row.dept}</span>
                      <span className="text-slate-500">{row.appts} Booked • {row.completed} Completed</span>
                      <span className="text-teal-600 font-bold">Avg Wait: {row.wait}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          MODALS
      ========================================================================= */}

      {/* 1. RESTRICTED PATIENT PROFILE MODAL (#13 - Strict RBAC) */}
      {selectedPatientForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                  {selectedPatientForView.initials || selectedPatientForView.name[0]}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{selectedPatientForView.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: <strong className="text-teal-600">{selectedPatientForView.patientId}</strong> • {selectedPatientForView.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatientForView(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-800 dark:text-teal-300 font-medium">
                🔒 <strong>Restricted Operational View (RBAC Protected):</strong> As Front Desk Receptionist, clinical notes, diagnosis records, and lab values remain strictly confidential.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">UHID Number</span>
                  <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{selectedPatientForView.uhid}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Age & Blood Group</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedPatientForView.age} yrs • {selectedPatientForView.gender} • <span className="text-rose-500">{selectedPatientForView.bloodGroup}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Contact & Address</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedPatientForView.phone} • {selectedPatientForView.email}</div>
                <div className="text-slate-500 text-[11px]">Registered Address: Knowledge Park II, Greater Noida, UP</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Today's Appointment Status</span>
                <div className="font-bold text-teal-600">
                  {selectedPatientForView.upcomingAppointment || 'No appointment active for today'}
                </div>
              </div>

              {/* Medicine Communication & Score Override Control */}
              <div className="pt-1">
                <MedicineCommunicationControl
                  patientId={selectedPatientForView.patientId || selectedPatientForView.id}
                  patientName={selectedPatientForView.name}
                  patientPhone={selectedPatientForView.phone}
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedPatientForView(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setBookPatientId(selectedPatientForView.patientId || selectedPatientForView.id);
                  setSelectedPatientForView(null);
                  setPrimaryTab('appointments');
                  setAppointmentSubTab('book');
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
              >
                + Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. EMERGENCY INTAKE MODAL (#20) */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900/60 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-rose-600 to-red-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Siren className="w-5 h-5 animate-pulse" />
                <h3 className="font-black text-sm">🚨 Immediate Emergency Patient Registration</h3>
              </div>
              <button onClick={() => setShowEmergencyModal(false)} className="text-white hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEmergencySubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Patient Full Name (or Unknown Trauma Patient) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={emPatientName}
                  onChange={(e) => setEmPatientName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Attendant / Phone</label>
                  <input
                    type="tel"
                    value={emPhone}
                    onChange={(e) => setEmPhone(e.target.value)}
                    placeholder="+91 99000 11223"
                    className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Triage Priority</label>
                  <select
                    value={emTriagePriority}
                    onChange={(e) => setEmTriagePriority(e.target.value as any)}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="RED">RED - Resuscitation / STAT</option>
                    <option value="YELLOW">YELLOW - Urgent</option>
                    <option value="GREEN">GREEN - Stable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">Chief Emergency Complaint</label>
                <input
                  type="text"
                  required
                  value={emChiefComplaint}
                  onChange={(e) => setEmChiefComplaint(e.target.value)}
                  placeholder="e.g. Acute chest pain, head injury, severe burn"
                  className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">Allocated Trauma Bay</label>
                <select
                  value={emAssignedBay}
                  onChange={(e) => setEmAssignedBay(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                >
                  <option value="Trauma Bay 01">Trauma Bay 01 (Critical Care Team)</option>
                  <option value="Trauma Bay 02">Trauma Bay 02 (Cardiac Resuscitation)</option>
                  <option value="ER Observation 03">ER Observation Bed 03</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                Dispatch Emergency Case & Broadcast Alert 🚨
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. COLLECT PAYMENT MODAL (#24) */}
      {selectedBillForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Collect Front Desk Payment</h3>
              <button onClick={() => setSelectedBillForPayment(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-center">
                <div className="text-xs text-teal-800 dark:text-teal-300 font-semibold">{selectedBillForPayment.service}</div>
                <div className="text-3xl font-black text-teal-700 dark:text-teal-400 mt-1">
                  ₹{selectedBillForPayment.amount}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Patient: {selectedBillForPayment.patientName}</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'CARD', 'CASH'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-2 rounded-xl font-bold transition text-xs border ${
                        paymentMethod === m
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {m === 'UPI' ? '📱 UPI / QR' : m === 'CARD' ? '💳 Card POS' : '💵 Cash'}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'UPI' && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-2">
                  <div className="w-28 h-28 bg-white p-2 rounded-xl mx-auto shadow-xs flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-slate-900" />
                  </div>
                  <div className="text-[10px] text-slate-500">Scan via Google Pay, PhonePe, or Paytm</div>
                  <div className="font-mono text-[11px] font-bold text-teal-600">medinexa.hospital@hdfcbank</div>
                </div>
              )}

              <button
                type="button"
                onClick={handleSettlePayment}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Confirm Payment & Generate Tax Receipt ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PRINTABLE OFFICIAL RECEIPT MODAL (#25) */}
      {activeReceiptToPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Official Hospital Tax Receipt</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-teal-600 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button onClick={() => setActiveReceiptToPrint(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-800 dark:text-slate-200">
              <div className="border-b pb-4 text-center space-y-1">
                <h2 className="text-base font-black text-teal-700 dark:text-teal-400">{currentUser.facilityName}</h2>
                <p className="text-[10px] text-slate-400">Knowledge Park II, Greater Noida, UP • GSTIN: 09AABCM1924L1Z2</p>
                <div className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold rounded">
                  TAX INVOICE / RECEIPT: {activeReceiptToPrint.billNo}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400">Patient Name:</span>
                  <div className="font-bold">{activeReceiptToPrint.patientName}</div>
                </div>
                <div>
                  <span className="text-slate-400">Patient ID:</span>
                  <div className="font-mono font-bold">{activeReceiptToPrint.patientId}</div>
                </div>
                <div>
                  <span className="text-slate-400">Date:</span>
                  <div>{activeReceiptToPrint.date}</div>
                </div>
                <div>
                  <span className="text-slate-400">Counter Cashier:</span>
                  <div>{currentUser.firstName} {currentUser.lastName}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex justify-between font-bold">
                  <span>{activeReceiptToPrint.service}</span>
                  <span>₹{activeReceiptToPrint.amount}.00</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[10px] mt-1">
                  <span>Payment Method: {activeReceiptToPrint.method} ({activeReceiptToPrint.transactionRef})</span>
                  <span className="text-emerald-600 font-bold">PAID IN FULL</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-2 border-t">
                This is an electronically verified hospital receipt. No signature required.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SMART ALTERNATIVE DOCTOR MODAL (#16) */}
      {smartAlternativeTargetDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Smart Doctor Alternatives</h3>
                <p className="text-[11px] text-slate-500">Available specialists in {smartAlternativeTargetDoc.department}</p>
              </div>
              <button onClick={() => setSmartAlternativeTargetDoc(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-800 dark:text-amber-300 text-[11px]">
                Selected doctor <strong>{smartAlternativeTargetDoc.name}</strong> is currently {smartAlternativeTargetDoc.status.toLowerCase()}. Here are available doctors in the same department:
              </div>

              {doctors
                .filter((d) => d.id !== smartAlternativeTargetDoc.id)
                .slice(0, 3)
                .map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{alt.name}</div>
                      <div className="text-[10px] text-slate-500">{alt.department} • Room {alt.roomNo}</div>
                      <div className="text-emerald-600 font-bold text-[10px] mt-0.5">Next Available: {alt.nextAvailableTime}</div>
                    </div>
                    <button
                      onClick={() => {
                        setBookDoctorId(alt.id);
                        setSmartAlternativeTargetDoc(null);
                        setPrimaryTab('appointments');
                        setAppointmentSubTab('book');
                        showToast(`Selected alternative doctor ${alt.name}!`);
                      }}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs"
                    >
                      Select
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Reception Terminal Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">Station Counter Number</label>
                <select
                  value={counterNumber}
                  onChange={(e) => setCounterNumber(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                >
                  <option value="01">Counter #01 (Front Desk Lead)</option>
                  <option value="02">Counter #02 (Outpatient Admissions)</option>
                  <option value="03">Counter #03 (Emergency Intake)</option>
                  <option value="04">Counter #04 (Cashier & Receipts)</option>
                </select>
              </div>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Token Calling Sound Chime</div>
                  <div className="text-[10px] text-slate-500">Play two-tone synthesizer chime when advancing queue</div>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
              </label>

              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  showToast('Terminal settings saved successfully! ✓');
                }}
                className="w-full py-2.5 bg-teal-600 text-white font-bold rounded-xl"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Staff Profile & Credentials</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-center space-y-3 text-xs">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-md">
                PS
              </div>
              <div>
                <h4 className="font-black text-base text-slate-900 dark:text-white">{currentUser.firstName} {currentUser.lastName}</h4>
                <div className="font-mono font-bold text-teal-600 text-xs mt-0.5">{currentUser.staffId}</div>
                <p className="text-slate-500 text-[11px] mt-1">{currentUser.role}</p>
                <p className="text-slate-400 text-[10px] mt-0.5">{currentUser.facilityName}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-left space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tenant Facility:</span>
                  <span className="font-bold">{currentUser.hospitalId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">RBAC Scope:</span>
                  <span className="font-bold text-emerald-600">RECEPTIONIST_AUTHORIZED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Shift Status:</span>
                  <span className="font-bold text-teal-600">ACTIVE ON DUTY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. GLOBAL QUICK SEARCH MODAL (Ctrl+K) */}
      {globalSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search patient, token, doctor, or invoice..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm font-semibold outline-none text-slate-900 dark:text-white"
              />
              <button onClick={() => setGlobalSearchOpen(false)} className="text-slate-400 hover:text-slate-600">
                <kbd className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded border">ESC</kbd>
              </button>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto space-y-2 text-xs">
              {searchResults.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  Type a patient name (e.g. Ayush), token (e.g. A-101), or doctor to search.
                </div>
              ) : (
                searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (item.type === 'PATIENT') {
                        setSelectedPatientForView(item.raw);
                      } else if (item.type === 'DOCTOR') {
                        setPrimaryTab('doctors');
                      } else {
                        setPrimaryTab('appointments');
                      }
                      setGlobalSearchOpen(false);
                    }}
                    className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer transition"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{item.title}</div>
                      <div className="text-[11px] text-slate-400">{item.subtitle}</div>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {item.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 9. RECEPTION QR CODE SCANNER MODAL (Section 3 & 4) */}
      {showReceptionQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Scan MediNexa Patient QR Code
                </h3>
              </div>
              <button
                onClick={() => setShowReceptionQrModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Scan barcode or QR token presented by patient on mobile or physical card. The QR contains safe token <code className="font-mono text-blue-600">MNX:UHID:&lt;UHID&gt;</code>.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Scanned QR Data / Opaque Token
              </label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. MNX:UHID:AYU-4826-KM"
                value={receptionQrInput}
                onChange={(e) => setReceptionQrInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (receptionQrInput.trim()) {
                      setShowReceptionQrModal(false);
                      handleSearchGlobalPatient(receptionQrInput);
                    }
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setReceptionQrInput('MNX:UHID:AYU-4826-KM');
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold"
              >
                Demo Scan: Ayush (UHID)
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReceptionQrModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (receptionQrInput.trim()) {
                    setShowReceptionQrModal(false);
                    handleSearchGlobalPatient(receptionQrInput);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Resolve Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
