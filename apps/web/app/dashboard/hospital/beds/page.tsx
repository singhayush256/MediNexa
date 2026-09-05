'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BedDto,
  FacilityDto,
  WardDto,
  BedStatus,
  BedType,
  PatientProfileDto,
  FacilityCapacityDto,
  UserDto,
  RoleCode,
  OccupancyReportDto,
} from '@medinexa/types';
import {
  Bed,
  ArrowRightLeft,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  Layers,
  Wind,
  Cpu,
  User,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

export default function LiveBedsDashboardPage() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [beds, setBeds] = useState<BedDto[]>([]);
  const [facilities, setFacilities] = useState<FacilityDto[]>([]);
  const [wards, setWards] = useState<WardDto[]>([]);
  const [patients, setPatients] = useState<PatientProfileDto[]>([]);
  const [capacity, setCapacity] = useState<FacilityCapacityDto | null>(null);
  const [reportData, setReportData] = useState<OccupancyReportDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'grid' | 'analytics'>('grid');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'peak'>('weekly');
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Filters
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [transferModalBed, setTransferModalBed] = useState<BedDto | null>(null);
  const [targetBedId, setTargetBedId] = useState('');
  const [transferReason, setTransferReason] = useState('');

  const [reserveModalBed, setReserveModalBed] = useState<BedDto | null>(null);
  const [assignModalBed, setAssignModalBed] = useState<BedDto | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [expiresInMinutes, setExpiresInMinutes] = useState(30);
  const [actionReason, setActionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('medinexa_token') || localStorage.getItem('token');
  };

  const getHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchBedsAndCapacity = () => {
    const queryParams = new URLSearchParams();
    if (selectedFacility) queryParams.set('facilityId', selectedFacility);
    if (selectedWard) queryParams.set('wardId', selectedWard);
    if (selectedStatus) queryParams.set('status', selectedStatus);
    if (selectedType) queryParams.set('bedType', selectedType);

    fetch(`${apiUrl}/beds?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((bedList) => setBeds(Array.isArray(bedList) ? bedList : []))
      .catch(() => {});

    if (selectedFacility) {
      fetch(`${apiUrl}/facilities/${selectedFacility}/capacity`)
        .then((res) => res.json())
        .then((capData) => setCapacity(capData))
        .catch(() => {});

      fetch(`${apiUrl}/beds/reports/occupancy?facilityId=${selectedFacility}&timeframe=${timeframe}`)
        .then((res) => res.json())
        .then((rep) => setReportData(rep))
        .catch(() => {});
    }
  };

  // Initial Load
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: UserDto) => {
          if (data) setUser(data);
        })
        .catch(() => {});
    }

    Promise.all([
      fetch(`${apiUrl}/facilities`).then((res) => res.json()),
      fetch(`${apiUrl}/wards`).then((res) => res.json()),
      token
        ? fetch(`${apiUrl}/patients`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json())
        : Promise.resolve([]),
    ])
      .then(([facList, wardList, patList]) => {
        const validFacs = Array.isArray(facList) ? facList : [];
        setFacilities(validFacs);
        setWards(Array.isArray(wardList) ? wardList : []);
        setPatients(Array.isArray(patList) ? patList : []);
        if (validFacs.length > 0) {
          setSelectedFacility(validFacs[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiUrl]);

  // Polling and Re-fetch
  useEffect(() => {
    fetchBedsAndCapacity();
    const interval = setInterval(fetchBedsAndCapacity, 5000);
    return () => clearInterval(interval);
  }, [apiUrl, selectedFacility, selectedWard, selectedStatus, selectedType, timeframe]);

  // WebSocket Live Events Connection
  useEffect(() => {
    const wsUrl = apiUrl.replace(/\/api\/v1$/, '');
    let socket: Socket | null = null;
    try {
      socket = io(`${wsUrl}/events`, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        setIsLiveConnected(true);
        if (selectedFacility) {
          socket?.emit('join', `facility_${selectedFacility}`);
        }
      });

      socket.on('disconnect', () => {
        setIsLiveConnected(false);
      });

      socket.on('bed.status.changed', () => {
        fetchBedsAndCapacity();
      });

      socket.on('bed.occupancy.updated', () => {
        fetchBedsAndCapacity();
      });

      socket.on('bed.transfer.completed', (data) => {
        fetchBedsAndCapacity();
        setActionSuccess(`Live Transfer: Bed ${data.fromBedNumber} ➔ Bed ${data.targetBedNumber} completed.`);
      });
    } catch (e) {
      console.warn('WebSocket connection not initialized, fallback to auto-polling');
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [apiUrl, selectedFacility]);

  // Action Handler
  const handleAction = async (url: string, body: any, successMsg: string) => {
    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Operation failed');
      }

      setActionSuccess(successMsg);
      setReserveModalBed(null);
      setAssignModalBed(null);
      setTransferModalBed(null);
      setSelectedPatientId('');
      setActionReason('');
      setTargetBedId('');
      fetchBedsAndCapacity();
    } catch (err: any) {
      setActionError(err.message || 'Operation failed due to a server or authorization error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransfer = () => {
    if (!transferModalBed || !targetBedId) return;
    handleAction(
      `${apiUrl}/beds/${transferModalBed.id}/transfer`,
      { targetBedId, reason: transferReason || 'Clinical inpatient transfer' },
      `Patient transferred successfully from Bed ${transferModalBed.bedNumber}!`
    );
  };

  const filteredBeds = useMemo(() => {
    return beds.filter((b) => {
      const num = (b.bedNumber || '').toLowerCase();
      const room = (b.room?.roomNumber || '').toLowerCase();
      const ward = (b.ward?.name || '').toLowerCase();
      const q = search.toLowerCase();
      const matchSearch = num.includes(q) || room.includes(q) || ward.includes(q);
      const matchType = !selectedType || b.bedType === selectedType;
      return matchSearch && matchType;
    });
  }, [beds, search, selectedType]);

  const availableTargetBeds = useMemo(() => {
    return beds.filter(
      (b) => b.status === BedStatus.AVAILABLE && b.id !== transferModalBed?.id
    );
  }, [beds, transferModalBed]);

  const getStatusBadgeClass = (status: BedStatus) => {
    switch (status) {
      case BedStatus.AVAILABLE:
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
      case BedStatus.OCCUPIED:
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case BedStatus.RESERVED:
        return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      case BedStatus.CLEANING:
        return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case BedStatus.MAINTENANCE:
      case BedStatus.OUT_OF_SERVICE:
        return 'bg-rose-500/10 text-rose-600 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ICU':
      case 'CCU':
        return <Activity className="w-3.5 h-3.5 text-rose-600" />;
      case 'EMERGENCY':
        return <Activity className="w-3.5 h-3.5 text-amber-600" />;
      case 'OXYGEN':
        return <Wind className="w-3.5 h-3.5 text-cyan-600" />;
      case 'VENTILATOR':
        return <Cpu className="w-3.5 h-3.5 text-indigo-600" />;
      case 'PRIVATE':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Bed className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  const totalBedsCount = capacity?.totalBeds || beds.length || 1;
  const occupiedCount = capacity?.occupiedBeds || beds.filter((b) => b.status === BedStatus.OCCUPIED).length;
  const occupancyPercentage = Math.round((occupiedCount / totalBedsCount) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-extrabold text-slate-900 tracking-tight">MediNexa</span>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">BedEngine 2.0</span>
              </div>
            </div>

            <nav className="hidden md:flex space-x-1 text-sm">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
              >
                Overview
              </Link>
              <Link
                href="/dashboard/hospital/beds"
                className="px-3 py-1.5 rounded-lg text-sky-600 bg-sky-50 font-bold"
              >
                Live Bed Engine
              </Link>
              <Link
                href="/dashboard/nearby-hospitals"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
              >
                Nearby Hospitals
              </Link>
              <Link
                href="/dashboard/bed-bookings"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
              >
                Booking Queue
              </Link>
              <Link
                href="/dashboard/ai/occupancy-forecast"
                className="px-3 py-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> AI Forecast
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-xs font-semibold text-slate-700">
                {isLiveConnected ? 'WebSockets Live' : 'Polling Active'}
              </span>
            </div>

            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-sky-500 outline-hidden max-w-[220px] truncate"
            >
              {facilities.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Title and Tab Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Live Bed Availability & Inpatient Management
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Real-time multi-ward bed telemetry, one-click patient transfers, sanitization tracking, and capacity analytics.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('grid')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Live Bed Grid
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
              Occupancy Analytics & Reports
            </button>
          </div>
        </div>

        {/* Notifications */}
        {actionSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-xs font-bold text-emerald-700 hover:underline">
              Dismiss
            </button>
          </div>
        )}
        {actionError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-900 text-sm font-semibold rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-xs font-bold text-rose-700 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Live Capacity KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hospital Total</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{capacity?.totalBeds || beds.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{wards.length} Inpatient Wards</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Available</p>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-2xl font-black text-emerald-600 mt-1">{capacity?.availableBeds ?? beds.filter((b) => b.status === BedStatus.AVAILABLE).length}</p>
            <p className="text-[11px] text-emerald-600/80 mt-0.5">Ready for intake</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Occupied</p>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <p className="text-2xl font-black text-blue-600 mt-1">{capacity?.occupiedBeds ?? beds.filter((b) => b.status === BedStatus.OCCUPIED).length}</p>
            <p className="text-[11px] text-blue-600/80 mt-0.5">Active Inpatients</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Reserved</p>
              <span className="w-2 h-2 rounded-full bg-purple-500" />
            </div>
            <p className="text-2xl font-black text-purple-600 mt-1">{capacity?.reservedBeds ?? beds.filter((b) => b.status === BedStatus.RESERVED).length}</p>
            <p className="text-[11px] text-purple-600/80 mt-0.5">Pre-Admission Holds</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Sanitizing</p>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <p className="text-2xl font-black text-amber-600 mt-1">{capacity?.cleaningBeds ?? beds.filter((b) => b.status === BedStatus.CLEANING).length}</p>
            <p className="text-[11px] text-amber-600/80 mt-0.5">Disinfection active</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Maintenance</p>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </div>
            <p className="text-2xl font-black text-rose-600 mt-1">{capacity?.maintenanceBeds ?? beds.filter((b) => b.status === BedStatus.MAINTENANCE).length}</p>
            <p className="text-[11px] text-rose-600/80 mt-0.5">Bio-med service</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-xs col-span-2 sm:col-span-1">
            <p className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">Occupancy Rate</p>
            <p className="text-2xl font-black text-white mt-1">{occupancyPercentage}%</p>
            <div className="w-full bg-indigo-950/60 rounded-full h-1.5 mt-2">
              <div
                className="bg-indigo-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, occupancyPercentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* TAB 1: LIVE BED GRID */}
        {activeTab === 'grid' && (
          <div>
            {/* Filter Bar */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <div className="relative min-w-[200px] max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search bed, room, ward..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  <option value="">All Wards</option>
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  <option value="">All Statuses</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="CLEANING">Cleaning</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  <option value="">All Bed Types</option>
                  <option value="GENERAL">General Beds</option>
                  <option value="ICU">ICU Beds</option>
                  <option value="EMERGENCY">Emergency Beds</option>
                  <option value="OXYGEN">Oxygen Beds</option>
                  <option value="VENTILATOR">Ventilator Beds</option>
                  <option value="PRIVATE">Private Rooms</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchBedsAndCapacity}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  title="Refresh Beds"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bed Cards Grid */}
            {filteredBeds.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
                <Bed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No beds found</h3>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredBeds.map((bed) => {
                  const assignment = bed.activeAssignment;
                  const reservation = bed.activeReservation;
                  const patientUser = assignment?.patient?.user || reservation?.patient?.user;

                  return (
                    <div
                      key={bed.id}
                      className="bg-white border border-slate-200/80 rounded-2xl p-4.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Bed Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-slate-100">{getTypeIcon(bed.bedType)}</span>
                            <div>
                              <p className="text-sm font-black text-slate-900">{bed.bedNumber}</p>
                              <p className="text-[11px] text-slate-500">
                                {bed.room?.roomNumber || 'Room'} • {bed.ward?.name || 'Ward'}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusBadgeClass(
                              bed.status
                            )}`}
                          >
                            {bed.status}
                          </span>
                        </div>

                        {/* Bed Type Tag */}
                        <div className="flex items-center gap-1.5 my-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">
                            {bed.bedType} BED
                          </span>
                          {bed.room?.roomType && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">
                              {bed.room.roomType}
                            </span>
                          )}
                        </div>

                        {/* Occupancy / Patient Information */}
                        {bed.status === BedStatus.OCCUPIED && assignment ? (
                          <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 my-2 text-xs">
                            <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                              <User className="w-3.5 h-3.5 text-blue-600" />
                              <span>
                                {patientUser ? `${patientUser.firstName} ${patientUser.lastName}` : 'Admitted Patient'}
                              </span>
                            </div>
                            <p className="text-[11px] text-blue-700/80 mt-1">
                              Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                            </p>
                          </div>
                        ) : bed.status === BedStatus.RESERVED && reservation ? (
                          <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 my-2 text-xs">
                            <div className="flex items-center gap-1.5 text-purple-900 font-bold">
                              <Clock className="w-3.5 h-3.5 text-purple-600" />
                              <span>Hold: {patientUser?.firstName || 'Patient Reservation'}</span>
                            </div>
                            <p className="text-[11px] text-purple-700/80 mt-1">
                              Expires: {new Date(reservation.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ) : bed.status === BedStatus.CLEANING ? (
                          <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 my-2 text-xs text-amber-800">
                            <p className="font-semibold flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                              Sanitization in progress
                            </p>
                          </div>
                        ) : bed.status === BedStatus.AVAILABLE ? (
                          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 my-2 text-xs text-emerald-800">
                            <p className="font-semibold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Available for immediate intake
                            </p>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 my-2 text-xs text-rose-800">
                            <p className="font-semibold">Maintenance or Calibration Hold</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                        {bed.status === BedStatus.AVAILABLE && (
                          <>
                            <button
                              onClick={() => {
                                setAssignModalBed(bed);
                                setSelectedPatientId(patients[0]?.id || '');
                              }}
                              className="flex-1 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors"
                            >
                              Assign Patient
                            </button>
                            <button
                              onClick={() => {
                                setReserveModalBed(bed);
                                setSelectedPatientId(patients[0]?.id || '');
                              }}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                            >
                              Hold
                            </button>
                          </>
                        )}

                        {bed.status === BedStatus.OCCUPIED && (
                          <>
                            <button
                              onClick={() => {
                                setTransferModalBed(bed);
                                setTargetBedId('');
                              }}
                              className="flex-1 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer Bed
                            </button>
                            <button
                              onClick={() =>
                                handleAction(
                                  `${apiUrl}/beds/${bed.id}/release`,
                                  { reason: 'Discharged or transferred out' },
                                  `Bed ${bed.bedNumber} released for sanitization.`
                                )
                              }
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                              title="Discharge & Release"
                            >
                              Release
                            </button>
                          </>
                        )}

                        {bed.status === BedStatus.CLEANING && (
                          <button
                            onClick={() =>
                              handleAction(
                                `${apiUrl}/beds/${bed.id}/clean`,
                                { notes: 'Sanitized and inspected' },
                                `Bed ${bed.bedNumber} marked AVAILABLE!`
                              )
                            }
                            className="w-full py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Cleaned & Ready
                          </button>
                        )}

                        {bed.status === BedStatus.RESERVED && (
                          <button
                            onClick={() =>
                              handleAction(
                                `${apiUrl}/beds/${bed.id}/cancel-reservation`,
                                { reason: 'Cancelled by desk' },
                                `Reservation on Bed ${bed.bedNumber} cancelled.`
                              )
                            }
                            className="w-full py-1.5 rounded-xl border border-slate-200 text-rose-600 text-xs font-bold hover:bg-rose-50 transition-colors"
                          >
                            Release Reservation
                          </button>
                        )}

                        {bed.status === BedStatus.MAINTENANCE && (
                          <button
                            onClick={() =>
                              handleAction(
                                `${apiUrl}/beds/${bed.id}/maintenance/complete`,
                                { reason: 'Maintenance checklist verified' },
                                `Bed ${bed.bedNumber} maintenance completed.`
                              )
                            }
                            className="w-full py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                          >
                            Complete Maintenance
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: OCCUPANCY ANALYTICS & REPORTS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Timeframe Bar */}
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Occupancy Trend Analysis</h3>
                <p className="text-xs text-slate-500">Historical admission load, peak spikes, and unit-by-unit utilization.</p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {(['daily', 'weekly', 'monthly', 'peak'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      timeframe === tf
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trend Chart */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Occupancy Rate Over Time</h4>
                    <p className="text-xs text-slate-400">Peak Rate: {reportData?.metrics?.peakOccupancyRate || occupancyPercentage}%</p>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold">
                    {timeframe.toUpperCase()}
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData?.trendData || []}>
                      <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="occupancyRate"
                        name="Occupancy %"
                        stroke="#4f46e5"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorRate)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bed Types Breakdown Bar Chart */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Capacity by Bed Type</h4>
                    <p className="text-xs text-slate-400">Occupied vs Available beds per category</p>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        reportData?.typeBreakdown
                          ? Object.entries(reportData.typeBreakdown).map(([key, val]) => ({
                              category: key,
                              Occupied: val.occupied,
                              Available: val.available,
                            }))
                          : []
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Occupied" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Available" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Ward Utilization Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-800">Ward-Level Occupancy Breakdown</h4>
                <span className="text-xs text-slate-500">{reportData?.wardBreakdown?.length || 0} Wards Reported</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Ward Name</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-center">Total Beds</th>
                      <th className="py-3 px-4 text-center">Occupied</th>
                      <th className="py-3 px-4 text-center">Available</th>
                      <th className="py-3 px-4">Occupancy Gauge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData?.wardBreakdown?.map((ward) => (
                      <tr key={ward.wardId} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{ward.wardName}</td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold">{ward.wardType}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-800">{ward.total}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-blue-600">{ward.occupied}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-600">{ward.available}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  ward.occupancyRate > 85
                                    ? 'bg-rose-500'
                                    : ward.occupancyRate > 65
                                    ? 'bg-indigo-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, ward.occupancyRate)}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-slate-700 min-w-[35px]">
                              {ward.occupancyRate}%
                            </span>
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
      </main>

      {/* MODAL: TRANSFER BED */}
      {transferModalBed && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Transfer Inpatient Bed</h3>
                  <p className="text-xs text-slate-500">
                    Source: Bed {transferModalBed.bedNumber} ({transferModalBed.ward?.name})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTransferModalBed(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Destination Bed</label>
                <select
                  value={targetBedId}
                  onChange={(e) => setTargetBedId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value="">-- Choose Available Bed --</option>
                  {availableTargetBeds.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bedNumber} ({b.bedType}) - {b.ward?.name || 'Ward'} Room {b.room?.roomNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Transfer Reason</label>
                <textarea
                  rows={3}
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="e.g., Step down from ICU to General Ward, patient vitals stabilized..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-900 text-xs">
                <p className="font-semibold">Clinical Procedure Note:</p>
                <p className="mt-0.5 text-amber-800/90 text-[11px]">
                  Upon execution, source Bed {transferModalBed.bedNumber} will transition to <b>CLEANING</b> for terminal disinfection. Target bed will be marked <b>OCCUPIED</b>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setTransferModalBed(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={isSubmitting || !targetBedId}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Transferring...' : 'Execute Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN PATIENT */}
      {assignModalBed && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Assign Patient to {assignModalBed.bedNumber}</h3>
              <button onClick={() => setAssignModalBed(null)} className="text-slate-400 font-bold">✕</button>
            </div>
            <div className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Inpatient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.firstName} {p.user?.lastName} (DOB: {p.dateOfBirth?.slice(0, 10)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admission Notes</label>
                <input
                  type="text"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Primary admission intake notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setAssignModalBed(null)} className="px-4 py-2 text-xs font-bold text-slate-600">Cancel</button>
              <button
                onClick={() =>
                  handleAction(
                    `${apiUrl}/beds/${assignModalBed.id}/assign`,
                    { patientId: selectedPatientId, reason: actionReason },
                    `Patient assigned to Bed ${assignModalBed.bedNumber}!`
                  )
                }
                disabled={isSubmitting || !selectedPatientId}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700"
              >
                {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HOLD / RESERVE */}
      {reserveModalBed && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Reserve Bed {reserveModalBed.bedNumber}</h3>
              <button onClick={() => setReserveModalBed(null)} className="text-slate-400 font-bold">✕</button>
            </div>
            <div className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.firstName} {p.user?.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hold Duration (Minutes)</label>
                <input
                  type="number"
                  value={expiresInMinutes}
                  onChange={(e) => setExpiresInMinutes(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setReserveModalBed(null)} className="px-4 py-2 text-xs font-bold text-slate-600">Cancel</button>
              <button
                onClick={() =>
                  handleAction(
                    `${apiUrl}/beds/${reserveModalBed.id}/reserve`,
                    { patientId: selectedPatientId, expiresInMinutes },
                    `Bed ${reserveModalBed.bedNumber} reserved for ${expiresInMinutes} minutes.`
                  )
                }
                disabled={isSubmitting || !selectedPatientId}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700"
              >
                {isSubmitting ? 'Holding...' : 'Confirm Hold'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
