'use client';

import React, { useEffect, useState } from 'react';
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
  Sparkles,
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/api-config';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { triggerLiveBedBooking, triggerLiveBedDischarge, subscribeTelemetry } from '@/lib/realtime-telemetry';
import { io } from 'socket.io-client';

interface OpdTokenItem {
  id: string;
  tokenNumber: string;
  queueNumber: number;
  patientName: string;
  patientPhone?: string;
  status: string; // WAITING, IN_CONSULTATION, COMPLETED, CANCELLED
  priority: string; // NORMAL, URGENT, VIP, EMERGENCY
  doctorName?: string;
  departmentName?: string;
  checkInTime: string;
  estimatedWaitMinutes: number;
}

interface AdmissionRequestItem {
  id: string;
  requestNumber: string;
  patientName: string;
  doctorName: string;
  department: string;
  wardType: string;
  priority: string;
  status: string; // PENDING_BED, BED_ASSIGNED, ADMITTED
  requestedAt: string;
}

interface DischargeWorkflowItem {
  id: string;
  admissionNumber: string;
  patientName: string;
  doctorName: string;
  bedCode: string;
  clearanceStatus: string; // MEDICAL_CLEARED, BILLING_PENDING, FULLY_DISCHARGED
  dischargePlannedAt: string;
}

export default function ReceptionMasterDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'tokens' | 'walkin' | 'appointments' | 'admissions' | 'discharge' | 'tasks' | 'logs'
  >('dashboard');

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('medinexa_token');
      localStorage.removeItem('token');
      localStorage.removeItem('medinexa_user');
      sessionStorage.removeItem('medinexa_token');
      document.cookie = 'medinexa_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.href = '/login';
    }
  };

  const [tokens, setTokens] = useState<OpdTokenItem[]>([]);
  const [admissionRequests, setAdmissionRequests] = useState<AdmissionRequestItem[]>([]);
  const [dischargeWorkflows, setDischargeWorkflows] = useState<DischargeWorkflowItem[]>([]);
  const [onlineBookings, setOnlineBookings] = useState<any[]>([]);
  const [bedBookingAlert, setBedBookingAlert] = useState<{ id: string; bookingNumber: string; patientName: string; bedType: string } | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Walk-in / OPD intake form
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Arvind Deshmukh (Internal Medicine)');
  const [priority, setPriority] = useState('NORMAL');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Quick stats
  const [stats, setStats] = useState({
    todayTokens: 38,
    activeQueue: 9,
    avgWaitTimeMinutes: 12,
    admissionsPending: 3,
    dischargesPending: 4,
    checkInsToday: 42,
  });

  const DEMO_TOKENS: OpdTokenItem[] = [
    {
      id: 'tok-1',
      tokenNumber: 'A-101',
      queueNumber: 1,
      patientName: 'Kavita Rathore',
      patientPhone: '+91 98112 34211',
      status: 'IN_CONSULTATION',
      priority: 'NORMAL',
      doctorName: 'Dr. Arvind Deshmukh',
      departmentName: 'Internal Medicine',
      checkInTime: new Date(Date.now() - 35 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedWaitMinutes: 0,
    },
    {
      id: 'tok-2',
      tokenNumber: 'A-102',
      queueNumber: 2,
      patientName: 'Rameshwar Verma',
      patientPhone: '+91 98201 99881',
      status: 'WAITING',
      priority: 'URGENT',
      doctorName: 'Dr. Arvind Deshmukh',
      departmentName: 'Internal Medicine',
      checkInTime: new Date(Date.now() - 22 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedWaitMinutes: 8,
    },
    {
      id: 'tok-3',
      tokenNumber: 'A-103',
      queueNumber: 3,
      patientName: 'Meenakshi Iyer',
      patientPhone: '+91 98450 11223',
      status: 'WAITING',
      priority: 'NORMAL',
      doctorName: 'Dr. Meera Nambiar',
      departmentName: 'Cardiology',
      checkInTime: new Date(Date.now() - 14 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedWaitMinutes: 18,
    },
    {
      id: 'tok-4',
      tokenNumber: 'A-104',
      queueNumber: 4,
      patientName: 'Praveen Chawla',
      patientPhone: '+91 99100 44556',
      status: 'COMPLETED',
      priority: 'NORMAL',
      doctorName: 'Dr. Rajesh Khanna',
      departmentName: 'Pediatrics',
      checkInTime: new Date(Date.now() - 75 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedWaitMinutes: 0,
    },
  ];

  const DEMO_ADMISSIONS: AdmissionRequestItem[] = [
    {
      id: 'adm-req-1',
      requestNumber: 'REQ-2026-081',
      patientName: 'Harish Goel',
      doctorName: 'Dr. Deepak Singh',
      department: 'Pulmonology',
      wardType: 'Oxygen Ward',
      priority: 'HIGH',
      status: 'PENDING_BED',
      requestedAt: '30 mins ago',
    },
    {
      id: 'adm-req-2',
      requestNumber: 'REQ-2026-082',
      patientName: 'Sneha Kulkarni',
      doctorName: 'Dr. Priya Desai',
      department: 'Obstetrics',
      wardType: 'Maternity Ward',
      priority: 'MEDIUM',
      status: 'BED_ASSIGNED',
      requestedAt: '1.5 hrs ago',
    },
  ];

  const DEMO_DISCHARGES: DischargeWorkflowItem[] = [
    {
      id: 'disc-1',
      admissionNumber: 'ADM-2026-0412',
      patientName: 'Sunita Mehra',
      doctorName: 'Dr. Arvind Deshmukh',
      bedCode: 'MED-204',
      clearanceStatus: 'MEDICAL_CLEARED',
      dischargePlannedAt: 'Today, 2:00 PM',
    },
    {
      id: 'disc-2',
      admissionNumber: 'ADM-2026-0398',
      patientName: 'Gopal Krishnan',
      doctorName: 'Dr. Rajesh Khanna',
      bedCode: 'SURG-102',
      clearanceStatus: 'BILLING_PENDING',
      dischargePlannedAt: 'Today, 4:30 PM',
    },
  ];

  useEffect(() => {
    fetchReceptionData();
  }, []);

  const fetchReceptionData = async () => {
    setLoading(true);
    const token = localStorage.getItem('medinexa_token');
    const apiUrl = getApiBaseUrl();

    if (!token) {
      setTokens(DEMO_TOKENS);
      setAdmissionRequests(DEMO_ADMISSIONS);
      setDischargeWorkflows(DEMO_DISCHARGES);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/opd/tokens`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTokens(
            data.map((d: any, idx: number) => ({
              id: d.id,
              tokenNumber: d.tokenNumber || `T-${100 + idx}`,
              queueNumber: d.queueNumber || idx + 1,
              patientName: d.patientName || `${d.patient?.user?.firstName || 'Patient'} ${d.patient?.user?.lastName || ''}`,
              patientPhone: d.patientPhone || d.patient?.user?.phone,
              status: d.status || 'WAITING',
              priority: d.priority || 'NORMAL',
              doctorName: d.doctor?.user ? `Dr. ${d.doctor.user.firstName} ${d.doctor.user.lastName}` : 'Attending Physician',
              departmentName: d.department?.name || 'General OPD',
              checkInTime: new Date(d.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              estimatedWaitMinutes: d.estimatedWaitMinutes || (idx + 1) * 7,
            })),
          );
        } else {
          setTokens(DEMO_TOKENS);
        }
      } else {
        setTokens(DEMO_TOKENS);
      }
      // Also fetch live online bed bookings from patients
      try {
        const bRes = await fetch(`${apiUrl}/bed-bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (bRes.ok) {
          const bData = await bRes.json();
          if (Array.isArray(bData)) {
            setOnlineBookings(bData);
            setStats((prev) => ({
              ...prev,
              admissionsPending: bData.filter((b) => b.status === 'PENDING').length || prev.admissionsPending,
            }));
          }
        }
      } catch {}

      setAdmissionRequests(DEMO_ADMISSIONS);
      setDischargeWorkflows(DEMO_DISCHARGES);
      setLoading(false);
    } catch {
      setTokens(DEMO_TOKENS);
      setAdmissionRequests(DEMO_ADMISSIONS);
      setDischargeWorkflows(DEMO_DISCHARGES);
      setLoading(false);
    }
  };

  // Subscribe to real-time telemetry and WebSocket bed booking events
  useEffect(() => {
    const unsubscribe = subscribeTelemetry(() => {
      fetchReceptionData();
    });

    const apiUrl = getApiBaseUrl();
    const wsUrl = apiUrl.replace(/\/api\/v1$/, '');
    let socket: any = null;
    try {
      socket = io(`${wsUrl}/events`, { transports: ['websocket', 'polling'] });
      socket.on('bed.booking.created', (bookingData: any) => {
        setBedBookingAlert({
          id: bookingData.id,
          bookingNumber: bookingData.bookingNumber,
          patientName: bookingData.patientName,
          bedType: bookingData.bedType,
        });
        fetchReceptionData();
      });
    } catch {}

    return () => {
      unsubscribe();
      if (socket) socket.disconnect();
    };
  }, []);

  const handleConfirmBedBooking = async (bookingId: string, patientNameParam?: string) => {
    const token = localStorage.getItem('medinexa_token');
    const apiUrl = getApiBaseUrl();
    try {
      const res = await fetch(`${apiUrl}/bed-bookings/${bookingId}/allocate-bed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: 'Confirmed and allocated by Front Desk Reception' }),
      });
      if (res.ok) {
        // Trigger live bed sync to decrement available beds across the entire platform
        triggerLiveBedBooking({
          hospitalId: 'HOSPITAL_A',
          wardType: 'general',
          patientName: patientNameParam || 'Inpatient Bed Reservation',
        });
        setActionSuccessMsg(`Bed Reservation successfully confirmed! Available beds decremented by 1.`);
        setBedBookingAlert(null);
        setTimeout(() => setActionSuccessMsg(null), 4000);
        fetchReceptionData();
      }
    } catch (e: any) {
      console.error('Failed to confirm bed booking:', e);
    }
  };

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    const newToken: OpdTokenItem = {
      id: `tok-${Date.now()}`,
      tokenNumber: `A-${100 + tokens.length + 1}`,
      queueNumber: tokens.length + 1,
      patientName,
      patientPhone: patientPhone || '+91 98000 00000',
      status: 'WAITING',
      priority,
      doctorName: selectedDoctor,
      departmentName: 'Outpatient Care',
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedWaitMinutes: (tokens.filter((t) => t.status === 'WAITING').length + 1) * 8,
    };

    setTokens([newToken, ...tokens]);
    setStats((prev) => ({
      ...prev,
      todayTokens: prev.todayTokens + 1,
      activeQueue: prev.activeQueue + 1,
    }));

    setFormSuccess(`Token #${newToken.tokenNumber} issued successfully for ${patientName}!`);
    setTimeout(() => {
      setFormSuccess(null);
      setShowWalkinModal(false);
      setPatientName('');
      setPatientPhone('');
      setChiefComplaint('');
    }, 1400);
  };

  const handleUpdateTokenStatus = (id: string, newStatus: string) => {
    setTokens((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 z-20">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-teal-500/20">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">MediNexa</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  RECEPTION
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Front Desk Workstation</p>
            </div>
          </div>
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
            { id: 'dashboard', label: 'Station Dashboard', icon: LayoutDashboard },
            { id: 'tokens', label: 'Live Token Queue', icon: Ticket, badge: tokens.filter(t => t.status === 'WAITING').length },
            { id: 'walkin', label: 'OPD Registration', icon: Users },
            { id: 'appointments', label: 'Book Appointment', icon: Calendar },
            { id: 'admissions', label: 'Admission Requests', icon: Bed, badge: stats.admissionsPending },
            { id: 'discharge', label: 'Discharge Workflow', icon: FileCheck, badge: stats.dischargesPending },
            { id: 'tasks', label: 'Tasks & Handover', icon: ListTodo },
            { id: 'logs', label: 'Activity Logs', icon: Activity },
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
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-black rounded-lg border border-teal-500/20 uppercase tracking-wide">
              OPD Counter #01
            </span>
            <span className="text-xs font-bold text-slate-500">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowWalkinModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + New Walk-in Patient
            </button>
            <button
              onClick={fetchReceptionData}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition cursor-pointer"
              title="Refresh Station"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Real-Time Live Bed Booking Arrival Alert Banner */}
        {bedBookingAlert && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-teal-500/15 border border-emerald-400/40 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Bed className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 dark:text-white">
                  🔔 New Online Bed Reservation Received from Patient Portal!
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  Booking #{bedBookingAlert.bookingNumber} • Patient: <strong className="font-bold text-emerald-700 dark:text-emerald-400">{bedBookingAlert.patientName}</strong> • Type: {bedBookingAlert.bedType}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleConfirmBedBooking(bedBookingAlert.id, bedBookingAlert.patientName)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Bed & Decrement Live Available Count</span>
              </button>
              <button
                onClick={() => setBedBookingAlert(null)}
                className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {actionSuccessMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Main Station Content */}
        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 flex-1">
          {/* Dashboard Tab Content */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-teal-700 to-blue-700 text-white p-6 md:p-8 shadow-xl shadow-teal-500/10">
                <div className="relative z-10 max-w-2xl space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold border border-white/20">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Front Desk Command Center • Active Morning Shift</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                    Reception & OPD Registration Station
                  </h1>
                  <p className="text-teal-100 text-xs md:text-sm font-medium leading-relaxed">
                    Automated digital token queue triage, walk-in registration, doctor chamber routing, inpatient bed intake, and discharge clearances.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setShowWalkinModal(true)}
                      className="px-4 py-2 bg-white text-teal-800 font-bold text-xs rounded-xl shadow hover:bg-teal-50 transition"
                    >
                      + Quick Walk-in Token
                    </button>
                    <button
                      onClick={() => setActiveTab('tokens')}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl backdrop-blur-md transition"
                    >
                      View Live Queue ({tokens.filter(t => t.status === 'WAITING').length})
                    </button>
                    <button
                      onClick={() => setActiveTab('admissions')}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl backdrop-blur-md transition"
                    >
                      Bed Admissions ({stats.admissionsPending})
                    </button>
                  </div>
                </div>
              </div>

              {/* KPI Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today Tokens</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.todayTokens}</div>
                  <div className="text-[11px] text-teal-600 font-semibold mt-0.5">+14% vs yesterday</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Queue</div>
                  <div className="text-2xl font-black text-amber-500 mt-1">{stats.activeQueue}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Patients waiting</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Wait Time</div>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.avgWaitTimeMinutes}m</div>
                  <div className="text-[11px] text-emerald-500 font-semibold mt-0.5">Well within target (15m)</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Check-ins</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.checkInsToday}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">OPD & Diagnostic</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Admissions Req</div>
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{stats.admissionsPending}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Awaiting bed allocate</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Discharges</div>
                  <div className="text-2xl font-black text-rose-500 mt-1">{stats.dischargesPending}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Clearance pending</div>
                </div>
              </div>

              {/* Operational Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active OPD Waiting Snapshot (2 cols) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Active Queue Snapshot</h3>
                      <p className="text-[11px] text-slate-500">Immediate patients in line for consultation</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('tokens')}
                      className="flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700"
                    >
                      Full Queue <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {tokens.slice(0, 5).map((token) => (
                      <div key={token.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black text-xs">
                            {token.tokenNumber}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{token.patientName}</div>
                            <div className="text-[11px] text-slate-500">{token.doctorName} • {token.departmentName}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            token.priority === 'URGENT' || token.priority === 'EMERGENCY'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {token.priority}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            token.status === 'WAITING'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                          }`}>
                            {token.status}
                          </span>
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
                      { doctor: 'Dr. Arvind Deshmukh', spec: 'Internal Medicine', room: 'Room 102', status: 'In Consultation', color: 'emerald' },
                      { doctor: 'Dr. Meera Nambiar', spec: 'Cardiology', room: 'Room 204', status: 'In Consultation', color: 'emerald' },
                      { doctor: 'Dr. Rajesh Khanna', spec: 'Pediatrics', room: 'Room 105', status: 'Available', color: 'teal' },
                      { doctor: 'Dr. Priya Desai', spec: 'OB-GYN', room: 'Room 301', status: 'Available', color: 'teal' },
                      { doctor: 'Dr. Deepak Singh', spec: 'Emergency Medicine', room: 'ER-01', status: 'On Duty', color: 'rose' },
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

      {/* Main Tab Content */}
      {activeTab === 'tokens' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search patient, token number or doctor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="text-xs text-slate-500 font-semibold">
              Live automated token announcer connected 🔊
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Token #</th>
                    <th className="py-3.5 px-4">Patient Name</th>
                    <th className="py-3.5 px-4">Consulting Doctor</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Check-in Time</th>
                    <th className="py-3.5 px-4">Est. Wait</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {tokens
                    .filter(
                      (t) =>
                        t.patientName.toLowerCase().includes(search.toLowerCase()) ||
                        t.tokenNumber.toLowerCase().includes(search.toLowerCase()) ||
                        (t.doctorName && t.doctorName.toLowerCase().includes(search.toLowerCase())),
                    )
                    .map((token) => (
                      <tr key={token.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-sm px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                            {token.tokenNumber}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{token.patientName}</div>
                          <div className="text-[11px] text-slate-500">{token.patientPhone || 'Walk-in record'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                          {token.doctorName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{token.departmentName}</td>
                        <td className="py-3.5 px-4 text-slate-500">{token.checkInTime}</td>
                        <td className="py-3.5 px-4">
                          {token.status === 'IN_CONSULTATION' ? (
                            <span className="text-teal-600 font-bold">In Room</span>
                          ) : token.status === 'COMPLETED' ? (
                            <span className="text-slate-400">Done</span>
                          ) : (
                            <span className="font-bold text-amber-600 dark:text-amber-400">~{token.estimatedWaitMinutes} min</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              token.priority === 'URGENT'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : token.priority === 'EMERGENCY'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {token.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                              token.status === 'IN_CONSULTATION'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 animate-pulse'
                                : token.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {token.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {token.status === 'WAITING' && (
                              <button
                                onClick={() => handleUpdateTokenStatus(token.id, 'IN_CONSULTATION')}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg transition"
                              >
                                Call Patient
                              </button>
                            )}
                            {token.status === 'IN_CONSULTATION' && (
                              <button
                                onClick={() => handleUpdateTokenStatus(token.id, 'COMPLETED')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition"
                              >
                                Complete
                              </button>
                            )}
                            <button
                              onClick={() => handleUpdateTokenStatus(token.id, 'CANCELLED')}
                              className="px-2 py-1 text-slate-400 hover:text-rose-600 text-[10px] font-bold transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>Appointment Booking & Front Desk Scheduling</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Intake patient appointments, confirm requested doctor consultations, and manage OPD slot attendance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/appointments"
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Dedicated Scheduling Console →
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Appt #</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Doctor</th>
                    <th className="py-3 px-4">Date & Slot</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {[
                    { id: '1', apptNo: 'APT-IND-100848', patient: 'Patient10 Beta', phone: '+91 98100 12345', doctor: 'Dr. Sandeep Vashisht', date: '10/28/2026', slot: '12:30 - 13:00', status: 'CONFIRMED', reason: 'Post-viral Acute Fatigue Follow-up' },
                    { id: '2', apptNo: 'APT-IND-100608', patient: 'Karan Das', phone: '+91 98100 03264', doctor: 'Dr. Suresh Menon', date: '10/28/2026', slot: '12:30 - 13:00', status: 'CONFIRMED', reason: 'Upper Respiratory Infection Consultation' },
                    { id: '3', apptNo: 'APT-IND-100728', patient: 'Meera Menon', phone: '+91 98100 01649', doctor: 'Dr. Preeti Chadha', date: '10/28/2026', slot: '16:30 - 17:00', status: 'REQUESTED', reason: 'Routine Health Checkup & HbA1c Review' },
                    { id: '4', apptNo: 'APT-IND-100968', patient: 'Arjun Roy', phone: '+91 98100 01496', doctor: 'Dr. Madhavi Sharma', date: '10/28/2026', slot: '16:30 - 17:00', status: 'REQUESTED', reason: 'Acute joint stiffness and musculoskeletal pain' },
                  ].map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-teal-600 dark:text-teal-400 font-mono">{item.apptNo}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{item.patient}</div>
                        <div className="text-[10px] text-slate-400">{item.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200">{item.doctor}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{item.date} • {item.slot}</td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{item.reason}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          item.status === 'CONFIRMED'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <Link
                          href="/dashboard/appointments"
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm ✓</span>
                        </Link>
                        <Link
                          href="/dashboard/appointments"
                          className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold rounded-xl text-xs inline-flex items-center gap-1 transition"
                        >
                          Modify
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'admissions' && (
        <div className="space-y-6">
          {/* Online Patient Portal Bed Reservations */}
          {onlineBookings.length > 0 && (
            <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-5 rounded-3xl border border-emerald-500/30 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Online Bed Reservations from Patient Portal ({onlineBookings.filter(b => b.status === 'PENDING').length} Pending)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Patients reserved beds via Portal. Confirming automatically allocates the bed and decrements live available count across all systems.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {onlineBookings.map((b) => (
                  <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-teal-600 dark:text-teal-400">#{b.bookingNumber}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                          b.status === 'CONFIRMED' || b.status === 'ALLOCATED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {b.status}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">Ward: {b.bedType || 'General'}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Patient: <span className="text-slate-900 dark:text-white">{b.patientName || b.patient?.user ? `${b.patient.user.firstName} ${b.patient.user.lastName}` : 'Direct Patient'}</span>
                        {b.contactPhone && <span className="text-slate-400 ml-2">({b.contactPhone})</span>}
                      </div>
                      {b.expectedArrival && (
                        <div className="text-[11px] text-slate-500">
                          Expected Arrival: {new Date(b.expectedArrival).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div>
                      {b.status === 'PENDING' ? (
                        <button
                          onClick={() => handleConfirmBedBooking(b.id, b.patientName)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm Bed & Decrement Live Bed Count</span>
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Bed Allocated & Sync Active
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Inpatient Admission Requests</h2>
            <Link
              href="/dashboard/hospital/beds"
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              Open Live Bed Census Matrix <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {admissionRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-purple-600 dark:text-purple-400">{req.requestNumber}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    {req.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{req.patientName}</h3>
                  <div className="text-xs text-slate-500">
                    Recommended by {req.doctorName} • {req.department}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-500">Requested Bed: <strong>{req.wardType}</strong></span>
                  <Link
                    href={`/dashboard/admissions`}
                    className="px-3 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold rounded-xl hover:opacity-90 transition"
                  >
                    Allocate Bed
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'discharge' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Patient Discharge Clearances</h2>
            <Link
              href="/dashboard/discharge"
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              Full Discharge Center <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dischargeWorkflows.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-teal-600 dark:text-teal-400">{item.admissionNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      item.clearanceStatus === 'MEDICAL_CLEARED'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {item.clearanceStatus.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{item.patientName}</h3>
                  <div className="text-xs text-slate-500">
                    Bed: {item.bedCode} • Attending: {item.doctorName}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-500">{item.dischargePlannedAt}</span>
                  <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition">
                    Approve Clearance
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </main>
      </div>

      {/* OPD Walkin Modal */}
      {showWalkinModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Quick OPD Walk-In Registration</h3>
                <p className="text-xs text-slate-500">Generate an automated consultation queue token</p>
              </div>
              <button
                onClick={() => setShowWalkinModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {formSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateToken} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98..."
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Queue Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="NORMAL">Normal Queue</option>
                    <option value="URGENT">Urgent / Elderly</option>
                    <option value="VIP">Senior Citizen / VIP</option>
                    <option value="EMERGENCY">Emergency Triage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Consulting Doctor</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Dr. Arvind Deshmukh (Internal Medicine)">Dr. Arvind Deshmukh (Internal Medicine) - Room 102</option>
                  <option value="Dr. Meera Nambiar (Cardiology)">Dr. Meera Nambiar (Cardiology) - Room 204</option>
                  <option value="Dr. Rajesh Khanna (Pediatrics)">Dr. Rajesh Khanna (Pediatrics) - Room 105</option>
                  <option value="Dr. Priya Desai (Obstetrics & Gynecology)">Dr. Priya Desai (OB-GYN) - Room 301</option>
                  <option value="Dr. Deepak Singh (Emergency Medicine)">Dr. Deepak Singh (Trauma/ER) - ER-01</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Chief Complaint / Symptoms</label>
                <textarea
                  rows={2}
                  placeholder="Fever for 3 days, body ache, dry cough..."
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWalkinModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition shadow-md shadow-teal-500/20"
                >
                  Issue Token & Print Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
