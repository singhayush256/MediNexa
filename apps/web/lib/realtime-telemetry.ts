/**
 * MediNexa Real-Time Telemetry & Cross-Module Event Bus
 * Synchronizes bed allocations, payments, emergency admissions, and KPI metrics
 * across all browser tabs, windows, and components via BroadcastChannel + WebSockets.
 */

import { io, Socket } from 'socket.io-client';
import { getApiBaseUrl } from './api-config';

export type HospitalId = 'HOSPITAL_A' | 'HOSPITAL_B';
export type WardType = 'general' | 'semiPrivate' | 'icu';

export interface TelemetryBedCell {
  id: string;
  number: string;
  ward: WardType;
  hospitalId: HospitalId;
  status: 'occupied' | 'available' | 'cleaning';
  patient?: string;
  diagnosis?: string;
  admittedAt?: string;
}

export interface WardCensus {
  name: string;
  total: number;
  occupied: number;
  occupancyRate: number;
  badge: string;
  prefix: string;
}

export interface HospitalTelemetryState {
  id: HospitalId;
  name: string;
  shortName: string;
  campus: string;
  totalBeds: number; // 50 beds
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  revenueToday: number; // in INR
  dailyTarget: number;
  revenueTargetPct: number;
  collections: {
    card: number;
    cash: number;
    upi: number;
  };
  wards: {
    general: WardCensus;
    semiPrivate: WardCensus;
    icu: WardCensus;
  };
  beds: TelemetryBedCell[];
  recentEvents: Array<{
    id: string;
    type: 'BED_BOOKED' | 'BED_DISCHARGED' | 'PAYMENT_RECEIVED' | 'EMERGENCY_SOS' | 'ADMISSION_TREND';
    title: string;
    description: string;
    timestamp: string;
    highlight?: boolean;
  }>;
}

export interface GlobalTelemetryState {
  hospitals: Record<HospitalId, HospitalTelemetryState>;
  emergencyQueue: {
    red: number;
    orange: number;
    yellow: number;
    avgWaitMins: number;
    activeSos: number;
  };
  admissionTrends: Array<{
    time: string;
    admissions: number;
    discharges: number;
  }>;
  medicationAdherence: {
    takenDoses: number;
    missedDoses: number;
    skippedDoses: number;
    complianceScore: number;
  };
  lastUpdated: string;
}

const STORAGE_KEY = 'medinexa_live_telemetry_v2';
const CHANNEL_NAME = 'medinexa_live_telemetry_channel';

// Deterministic initial bed layout for exactly 50 beds per hospital
function createInitialBeds(hospitalId: HospitalId): TelemetryBedCell[] {
  const PATIENT_POOL = [
    'Sarah Jenkins', 'Priya Sharma', 'Vikram Malhotra', 'Ananya Sen',
    'Robert Chen', 'Rajesh Verma', 'Meera Patel', 'Arjun Nair',
    'Sunil Mathur', 'Pooja Aggarwal', 'Kunal Singhania', 'Deepak Chopra',
    'Anita Desai', 'Rohan Gupta', 'Kavita Rao', 'Amitabh Banerjee',
    'Siddharth Joshi', 'Neha Chawla', 'Manoj Tiwari', 'Preeti Saxena',
  ];

  const DIAGNOSES = [
    'Post-Op Recovery', 'Acute Coronary Syndrome', 'Type 2 Diabetes Mellitus',
    'Hypertension Observation', 'Bacterial Pneumonia', 'Orthopedic Post-Arthroplasty',
    'Gastroenteritis', 'Cardiac Dysrhythmia',
  ];

  const beds: TelemetryBedCell[] = [];

  // General Ward: 25 beds (Hospital A: 19 occ, Hospital B: 18 occ)
  const genOcc = hospitalId === 'HOSPITAL_A' ? 19 : 18;
  for (let i = 1; i <= 25; i++) {
    const isOcc = i <= genOcc;
    const isClean = !isOcc && i === genOcc + 1;
    beds.push({
      id: `${hospitalId}-GW-${String(i).padStart(2, '0')}`,
      number: `GW-${String(i).padStart(2, '0')}`,
      ward: 'general',
      hospitalId,
      status: isOcc ? 'occupied' : isClean ? 'cleaning' : 'available',
      patient: isOcc ? PATIENT_POOL[(i + (hospitalId === 'HOSPITAL_B' ? 2 : 0)) % PATIENT_POOL.length] : undefined,
      diagnosis: isOcc ? DIAGNOSES[i % DIAGNOSES.length] : undefined,
      admittedAt: isOcc ? new Date(Date.now() - (i * 3600000)).toISOString() : undefined,
    });
  }

  // Semi-Private: 15 beds (Hospital A: 12 occ, Hospital B: 11 occ)
  const semiOcc = hospitalId === 'HOSPITAL_A' ? 12 : 11;
  for (let i = 1; i <= 15; i++) {
    const isOcc = i <= semiOcc;
    const isClean = !isOcc && i === semiOcc + 1;
    beds.push({
      id: `${hospitalId}-SP-${String(i).padStart(2, '0')}`,
      number: `SP-${String(i).padStart(2, '0')}`,
      ward: 'semiPrivate',
      hospitalId,
      status: isOcc ? 'occupied' : isClean ? 'cleaning' : 'available',
      patient: isOcc ? PATIENT_POOL[(i + 5) % PATIENT_POOL.length] : undefined,
      diagnosis: isOcc ? DIAGNOSES[(i + 2) % DIAGNOSES.length] : undefined,
      admittedAt: isOcc ? new Date(Date.now() - (i * 7200000)).toISOString() : undefined,
    });
  }

  // ICU: 10 beds (Hospital A: 8 occ, Hospital B: 7 occ)
  const icuOcc = hospitalId === 'HOSPITAL_A' ? 8 : 7;
  for (let i = 1; i <= 10; i++) {
    const isOcc = i <= icuOcc;
    const isClean = !isOcc && i === icuOcc + 1;
    beds.push({
      id: `${hospitalId}-ICU-${String(i).padStart(2, '0')}`,
      number: `ICU-${String(i).padStart(2, '0')}`,
      ward: 'icu',
      hospitalId,
      status: isOcc ? 'occupied' : isClean ? 'cleaning' : 'available',
      patient: isOcc ? PATIENT_POOL[(i + 9) % PATIENT_POOL.length] : undefined,
      diagnosis: isOcc ? DIAGNOSES[(i + 4) % DIAGNOSES.length] : undefined,
      admittedAt: isOcc ? new Date(Date.now() - (i * 5400000)).toISOString() : undefined,
    });
  }

  return beds;
}

export function getDefaultTelemetryState(): GlobalTelemetryState {
  const bedsA = createInitialBeds('HOSPITAL_A');
  const bedsB = createInitialBeds('HOSPITAL_B');

  const occA = bedsA.filter((b) => b.status === 'occupied').length; // 39
  const occB = bedsB.filter((b) => b.status === 'occupied').length; // 36

  return {
    hospitals: {
      HOSPITAL_A: {
        id: 'HOSPITAL_A',
        name: 'MediNexa General Hospital (Hospital A)',
        shortName: 'Hospital A',
        campus: 'Knowledge Park II Facility, Greater Noida',
        totalBeds: 50,
        occupiedBeds: occA,
        availableBeds: 50 - occA,
        occupancyRate: Number(((occA / 50) * 100).toFixed(1)),
        revenueToday: 1482500,
        dailyTarget: 1550000,
        revenueTargetPct: Number(((1482500 / 1550000) * 100).toFixed(1)),
        collections: {
          card: 520000,
          cash: 282500,
          upi: 680000,
        },
        wards: {
          general: {
            name: 'General Ward',
            total: 25,
            occupied: bedsA.filter((b) => b.ward === 'general' && b.status === 'occupied').length,
            occupancyRate: Number(((19 / 25) * 100).toFixed(1)),
            badge: 'Optimal',
            prefix: 'GW-',
          },
          semiPrivate: {
            name: 'Semi-Private & Deluxe Ward',
            total: 15,
            occupied: bedsA.filter((b) => b.ward === 'semiPrivate' && b.status === 'occupied').length,
            occupancyRate: Number(((12 / 15) * 100).toFixed(1)),
            badge: 'High Load',
            prefix: 'SP-',
          },
          icu: {
            name: 'Critical Care ICU & CCU',
            total: 10,
            occupied: bedsA.filter((b) => b.ward === 'icu' && b.status === 'occupied').length,
            occupancyRate: Number(((8 / 10) * 100).toFixed(1)),
            badge: 'Monitored',
            prefix: 'ICU-',
          },
        },
        beds: bedsA,
        recentEvents: [
          {
            id: 'evt-init-1',
            type: 'BED_BOOKED',
            title: 'Bed Allocation Completed',
            description: 'Patient Arjun Nair admitted to GW-19 via Inpatient Desk',
            timestamp: '10 mins ago',
          },
          {
            id: 'evt-init-2',
            type: 'PAYMENT_RECEIVED',
            title: 'OPD Consultation Paid',
            description: '₹1,500 collected via UPI for INV-9041',
            timestamp: '18 mins ago',
          },
        ],
      },
      HOSPITAL_B: {
        id: 'HOSPITAL_B',
        name: 'MediNexa Super-Specialty Medical Institute (Hospital B)',
        shortName: 'Hospital B',
        campus: 'South Extension Medical Wing, New Delhi',
        totalBeds: 50,
        occupiedBeds: occB,
        availableBeds: 50 - occB,
        occupancyRate: Number(((occB / 50) * 100).toFixed(1)),
        revenueToday: 1245000,
        dailyTarget: 1400000,
        revenueTargetPct: Number(((1245000 / 1400000) * 100).toFixed(1)),
        collections: {
          card: 440000,
          cash: 245000,
          upi: 560000,
        },
        wards: {
          general: {
            name: 'General Ward',
            total: 25,
            occupied: bedsB.filter((b) => b.ward === 'general' && b.status === 'occupied').length,
            occupancyRate: Number(((18 / 25) * 100).toFixed(1)),
            badge: 'Optimal',
            prefix: 'GW-',
          },
          semiPrivate: {
            name: 'Semi-Private & Deluxe Ward',
            total: 15,
            occupied: bedsB.filter((b) => b.ward === 'semiPrivate' && b.status === 'occupied').length,
            occupancyRate: Number(((11 / 15) * 100).toFixed(1)),
            badge: 'Balanced',
            prefix: 'SP-',
          },
          icu: {
            name: 'Critical Care ICU & CCU',
            total: 10,
            occupied: bedsB.filter((b) => b.ward === 'icu' && b.status === 'occupied').length,
            occupancyRate: Number(((7 / 10) * 100).toFixed(1)),
            badge: 'Stable',
            prefix: 'ICU-',
          },
        },
        beds: bedsB,
        recentEvents: [
          {
            id: 'evt-init-b1',
            type: 'BED_BOOKED',
            title: 'Cardiology Bed Reserved',
            description: 'Patient Vikram Malhotra assigned to SP-11',
            timestamp: '25 mins ago',
          },
        ],
      },
    },
    emergencyQueue: {
      red: 1,
      orange: 2,
      yellow: 3,
      avgWaitMins: 28,
      activeSos: 2,
    },
    admissionTrends: [
      { time: '1 AM', admissions: 2, discharges: 1 },
      { time: '3 AM', admissions: 3, discharges: 2 },
      { time: '6 AM', admissions: 4, discharges: 2 },
      { time: '9 AM', admissions: 8, discharges: 5 },
      { time: '12 PM', admissions: 6, discharges: 4 },
      { time: '3 PM', admissions: 7, discharges: 5 },
      { time: '6 PM', admissions: 5, discharges: 4 },
      { time: '9 PM', admissions: 4, discharges: 3 },
      { time: '12 AM', admissions: 3, discharges: 2 },
    ],
    medicationAdherence: {
      takenDoses: 184,
      missedDoses: 12,
      skippedDoses: 4,
      complianceScore: 92,
    },
    lastUpdated: new Date().toISOString(),
  };
}

// In-Memory & LocalStorage Singleton Engine
let currentTelemetryState: GlobalTelemetryState = getDefaultTelemetryState();
let broadcastChannel: BroadcastChannel | null = null;
const listeners = new Set<(state: GlobalTelemetryState) => void>();
let isInitialized = false;

function saveState(state: GlobalTelemetryState) {
  currentTelemetryState = state;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save telemetry to localStorage:', e);
    }
  }
}

function notifySubscribers() {
  listeners.forEach((fn) => {
    try {
      fn(currentTelemetryState);
    } catch (e) {
      console.error('Telemetry subscriber error:', e);
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('medinexa:telemetry:updated', {
        detail: currentTelemetryState,
      }),
    );
  }
}

function broadcastState() {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'STATE_SYNC',
        state: currentTelemetryState,
      });
    } catch (e) {
      console.warn('BroadcastChannel post error:', e);
    }
  }
}

export function initTelemetryEngine() {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  // 1. Load persisted state from localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.hospitals?.HOSPITAL_A?.totalBeds === 50) {
        currentTelemetryState = parsed;
      }
    }
  } catch (e) {
    console.warn('Failed reading telemetry from storage:', e);
  }

  // 2. Initialize Native BroadcastChannel for zero-latency multi-tab sync
  try {
    if ('BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
      broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'STATE_SYNC' && event.data?.state) {
          currentTelemetryState = event.data.state;
          saveState(currentTelemetryState);
          notifySubscribers();
        }
      };
    }
  } catch (e) {
    console.warn('BroadcastChannel not available:', e);
  }

  // 3. Connect to backend WebSockets if available to bridge backend events
  try {
    const wsUrl = getApiBaseUrl().replace(/\/api\/v1$/, '');
    const socket: Socket = io(`${wsUrl}/events`, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 3,
    });

    socket.on('bed.status.changed', (evt: any) => {
      if (evt?.bedNumber || evt?.bedId) {
        triggerLiveBedBooking({
          hospitalId: 'HOSPITAL_A',
          wardType: 'general',
          bedNumber: evt.bedNumber,
          patientName: evt.patientName || 'Inpatient Admission',
          diagnosis: evt.diagnosis || 'Clinical Admission',
        });
      }
    });

    socket.on('payment.received', (evt: any) => {
      if (evt?.amount) {
        triggerLivePayment({
          amount: Number(evt.amount),
          method: evt.method || 'UPI',
          patientName: evt.patientName,
          invoiceNumber: evt.invoiceNumber,
        });
      }
    });
  } catch (e) {
    // Graceful offline fallback
  }
}

export function getTelemetryState(): GlobalTelemetryState {
  if (typeof window !== 'undefined' && !isInitialized) {
    initTelemetryEngine();
  }
  return currentTelemetryState;
}

export function subscribeTelemetry(callback: (state: GlobalTelemetryState) => void): () => void {
  if (typeof window !== 'undefined' && !isInitialized) {
    initTelemetryEngine();
  }
  listeners.add(callback);
  callback(currentTelemetryState);

  return () => {
    listeners.delete(callback);
  };
}

// -------------------------------------------------------------
// LIVE TRIGGER ACTIONS (Reception Booking, Billing Payment, etc.)
// -------------------------------------------------------------

export interface LiveBookingParams {
  hospitalId?: HospitalId;
  wardType?: WardType;
  bedId?: string;
  bedNumber?: string;
  patientName?: string;
  diagnosis?: string;
}

export function triggerLiveBedBooking(params: LiveBookingParams): GlobalTelemetryState {
  const state = { ...currentTelemetryState };
  const hId = params.hospitalId || 'HOSPITAL_A';
  const hospital = { ...state.hospitals[hId] };
  const beds = [...hospital.beds];

  // Find target bed or first available bed
  let targetIndex = -1;
  if (params.bedId) {
    targetIndex = beds.findIndex((b) => b.id === params.bedId);
  } else if (params.bedNumber) {
    targetIndex = beds.findIndex((b) => b.number === params.bedNumber);
  } else if (params.wardType) {
    targetIndex = beds.findIndex((b) => b.ward === params.wardType && b.status === 'available');
  } else {
    targetIndex = beds.findIndex((b) => b.status === 'available');
  }

  if (targetIndex !== -1) {
    const targetBed = beds[targetIndex];
    const patName = params.patientName || 'Ayush Singh';
    const diag = params.diagnosis || 'Post-Op Inpatient Admission';

    beds[targetIndex] = {
      ...targetBed,
      status: 'occupied',
      patient: patName,
      diagnosis: diag,
      admittedAt: new Date().toISOString(),
    };

    hospital.beds = beds;
    hospital.occupiedBeds = Math.min(50, beds.filter((b) => b.status === 'occupied').length);
    hospital.availableBeds = Math.max(0, 50 - hospital.occupiedBeds);
    hospital.occupancyRate = Number(((hospital.occupiedBeds / 50) * 100).toFixed(1));

    // Update ward census
    const wardKey = targetBed.ward;
    const wardTotal = hospital.wards[wardKey].total;
    const wardOcc = beds.filter((b) => b.ward === wardKey && b.status === 'occupied').length;
    hospital.wards[wardKey] = {
      ...hospital.wards[wardKey],
      occupied: wardOcc,
      occupancyRate: Number(((wardOcc / wardTotal) * 100).toFixed(1)),
      badge: wardOcc / wardTotal > 0.85 ? 'Critical' : wardOcc / wardTotal > 0.75 ? 'High Load' : 'Optimal',
    };

    // Add Live Event to feed
    hospital.recentEvents = [
      {
        id: `evt-${Date.now()}`,
        type: 'BED_BOOKED',
        title: `⚡ Reception: Bed ${targetBed.number} Booked`,
        description: `Patient ${patName} admitted for ${diag} (${hospital.wards[wardKey].name})`,
        timestamp: 'Just now',
        highlight: true,
      },
      ...hospital.recentEvents.slice(0, 9),
    ];

    state.hospitals[hId] = hospital;
    state.lastUpdated = new Date().toISOString();

    saveState(state);
    notifySubscribers();
    broadcastState();
  }

  return currentTelemetryState;
}

export interface LiveDischargeParams {
  hospitalId?: HospitalId;
  bedId?: string;
  bedNumber?: string;
}

export function triggerLiveBedDischarge(params: LiveDischargeParams): GlobalTelemetryState {
  const state = { ...currentTelemetryState };
  const hId = params.hospitalId || 'HOSPITAL_A';
  const hospital = { ...state.hospitals[hId] };
  const beds = [...hospital.beds];

  let targetIndex = -1;
  if (params.bedId) {
    targetIndex = beds.findIndex((b) => b.id === params.bedId);
  } else if (params.bedNumber) {
    targetIndex = beds.findIndex((b) => b.number === params.bedNumber);
  } else {
    targetIndex = beds.findIndex((b) => b.status === 'occupied');
  }

  if (targetIndex !== -1) {
    const targetBed = beds[targetIndex];
    const prevPatient = targetBed.patient || 'Patient';

    beds[targetIndex] = {
      ...targetBed,
      status: 'available',
      patient: undefined,
      diagnosis: undefined,
      admittedAt: undefined,
    };

    hospital.beds = beds;
    hospital.occupiedBeds = Math.max(0, beds.filter((b) => b.status === 'occupied').length);
    hospital.availableBeds = Math.min(50, 50 - hospital.occupiedBeds);
    hospital.occupancyRate = Number(((hospital.occupiedBeds / 50) * 100).toFixed(1));

    const wardKey = targetBed.ward;
    const wardTotal = hospital.wards[wardKey].total;
    const wardOcc = beds.filter((b) => b.ward === wardKey && b.status === 'occupied').length;
    hospital.wards[wardKey] = {
      ...hospital.wards[wardKey],
      occupied: wardOcc,
      occupancyRate: Number(((wardOcc / wardTotal) * 100).toFixed(1)),
      badge: wardOcc / wardTotal > 0.85 ? 'Critical' : 'Optimal',
    };

    hospital.recentEvents = [
      {
        id: `evt-${Date.now()}`,
        type: 'BED_DISCHARGED',
        title: `✓ Patient Discharged: Bed ${targetBed.number}`,
        description: `${prevPatient} discharged. Bed marked clean & available.`,
        timestamp: 'Just now',
        highlight: true,
      },
      ...hospital.recentEvents.slice(0, 9),
    ];

    state.hospitals[hId] = hospital;
    state.lastUpdated = new Date().toISOString();

    saveState(state);
    notifySubscribers();
    broadcastState();
  }

  return currentTelemetryState;
}

export interface LivePaymentParams {
  hospitalId?: HospitalId;
  amount: number;
  method?: string; // 'UPI' | 'CARD' | 'CASH'
  patientName?: string;
  invoiceNumber?: string;
}

export function triggerLivePayment(params: LivePaymentParams): GlobalTelemetryState {
  const state = { ...currentTelemetryState };
  const hId = params.hospitalId || 'HOSPITAL_A';
  const hospital = { ...state.hospitals[hId] };

  const amt = Number(params.amount) || 2500;
  const method = (params.method || 'UPI').toUpperCase();

  hospital.revenueToday += amt;
  hospital.revenueTargetPct = Number(((hospital.revenueToday / hospital.dailyTarget) * 100).toFixed(1));

  if (method.includes('CARD')) {
    hospital.collections.card += amt;
  } else if (method.includes('CASH')) {
    hospital.collections.cash += amt;
  } else {
    hospital.collections.upi += amt;
  }

  hospital.recentEvents = [
    {
      id: `evt-pay-${Date.now()}`,
      type: 'PAYMENT_RECEIVED',
      title: `💳 Live Payment: ₹${amt.toLocaleString('en-IN')} Received`,
      description: `Collected via ${method} for ${params.invoiceNumber || 'OPD Billing'} (${params.patientName || 'Counter'})`,
      timestamp: 'Just now',
      highlight: true,
    },
    ...hospital.recentEvents.slice(0, 9),
  ];

  state.hospitals[hId] = hospital;
  state.lastUpdated = new Date().toISOString();

  saveState(state);
  notifySubscribers();
  broadcastState();

  return currentTelemetryState;
}

export function triggerLiveEmergency(acuity: 'RED' | 'ORANGE' | 'YELLOW' = 'RED'): GlobalTelemetryState {
  const state = { ...currentTelemetryState };
  const q = { ...state.emergencyQueue };

  if (acuity === 'RED') {
    q.red += 1;
    q.activeSos += 1;
    q.avgWaitMins = Math.max(10, q.avgWaitMins - 2);
  } else if (acuity === 'ORANGE') {
    q.orange += 1;
  } else {
    q.yellow += 1;
  }

  state.emergencyQueue = q;

  // Add event to Hospital A
  const h = state.hospitals.HOSPITAL_A;
  h.recentEvents = [
    {
      id: `evt-er-${Date.now()}`,
      type: 'EMERGENCY_SOS',
      title: `🚨 Emergency Trauma Triage: ${acuity}`,
      description: `Critical patient triaged into ER Bay. ALS team alerted.`,
      timestamp: 'Just now',
      highlight: true,
    },
    ...h.recentEvents.slice(0, 9),
  ];

  state.lastUpdated = new Date().toISOString();
  saveState(state);
  notifySubscribers();
  broadcastState();

  return currentTelemetryState;
}

export function resetTelemetryToBaseline(): GlobalTelemetryState {
  const baseline = getDefaultTelemetryState();
  saveState(baseline);
  notifySubscribers();
  broadcastState();
  return baseline;
}
