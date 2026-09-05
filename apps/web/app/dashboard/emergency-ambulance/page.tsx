'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  PhoneCall,
  Car,
  Navigation,
  ShieldAlert,
  Clock,
  Radio,
  RefreshCw,
  Search,
  CheckCircle2,
  Building2,
  Bed,
  MapPin,
  ExternalLink,
  Plus,
  Send,
  Sparkles,
} from 'lucide-react';

interface CriticalHospital {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  emergencyHelpline: string;
  distanceKm: number;
  etaMinutes: number;
  availableBeds: {
    totalCritical: number;
    icu: number;
    ventilator: number;
    oxygen: number;
    emergency: number;
  };
}

interface ActiveDispatch {
  id: string;
  emergencyNumber: string;
  callerName: string;
  callerPhone: string;
  emergencyType: string;
  severity: string;
  pickupAddress: string;
  status: string;
  dispatchedAt: string;
  destinationHospital: string;
  ambulanceVehicle: string;
  etaMinutes: number;
}

export default function EmergencyAmbulanceCommandCenter() {
  const [criticalHospitals, setCriticalHospitals] = useState<CriticalHospital[]>([]);
  const [activeDispatches, setActiveDispatches] = useState<ActiveDispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosForm, setSosForm] = useState({
    callerName: '',
    callerPhone: '',
    pickupAddress: '',
    emergencyType: 'CARDIAC',
    severity: 'CRITICAL',
  });
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);

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

  const fetchData = async () => {
    try {
      // 1. Fetch nearest critical beds
      const resBeds = await fetch(`${apiUrl}/emergency/nearest-critical-beds?radiusKm=40`);
      if (resBeds.ok) {
        const data = await resBeds.json();
        setCriticalHospitals(data.hospitals || []);
      }

      // 2. Fetch emergency queue / visits
      const resQueue = await fetch(`${apiUrl}/emergency/queue`, {
        headers: getHeaders(),
      });
      if (resQueue.ok) {
        const queueData = await resQueue.json();
        const mappedDispatches: ActiveDispatch[] = (queueData || []).map((item: any, idx: number) => ({
          id: item.id || `DSP-${idx}`,
          emergencyNumber: item.emergencyNumber || `EMG-${2026}-${100 + idx}`,
          callerName: item.patient ? `${item.patient.firstName} ${item.patient.lastName}` : 'Walk-in / Triage Emergency',
          callerPhone: item.patient?.phone || '+91 98110 00000',
          emergencyType: item.triageLevel || 'CRITICAL',
          severity: item.triageLevel || 'RESUSCITATION',
          pickupAddress: item.facility?.name || 'Central Trauma Facility ER',
          status: item.status || 'IN_TREATMENT',
          dispatchedAt: item.createdAt || new Date().toISOString(),
          destinationHospital: item.facility?.name || 'Apollo MediNexa Hospital',
          ambulanceVehicle: `DL-01-EMS-${3000 + idx}`,
          etaMinutes: idx * 4 + 3,
        }));

        // Default mock dispatches if database queue is fresh
        if (mappedDispatches.length === 0) {
          setActiveDispatches([
            {
              id: 'dsp-101',
              emergencyNumber: 'SOS-2026-8812',
              callerName: 'Rajesh Sharma',
              callerPhone: '+91 98100 44321',
              emergencyType: 'CARDIAC',
              severity: 'CRITICAL',
              pickupAddress: 'Block C, Greater Kailash 1, New Delhi',
              status: 'EN_ROUTE',
              dispatchedAt: new Date(Date.now() - 6 * 60000).toISOString(),
              destinationHospital: 'Apollo MediNexa Super Speciality Hospital',
              ambulanceVehicle: 'DL-01-EMS-4042 (ALS-1)',
              etaMinutes: 4,
            },
            {
              id: 'dsp-102',
              emergencyNumber: 'SOS-2026-9041',
              callerName: 'Ananya Verma',
              callerPhone: '+91 98112 33455',
              emergencyType: 'TRAUMA',
              severity: 'CRITICAL',
              pickupAddress: 'Noida-Greater Noida Expressway, Sector 128',
              status: 'DISPATCHED',
              dispatchedAt: new Date(Date.now() - 3 * 60000).toISOString(),
              destinationHospital: 'Max Healthcare Trauma Center',
              ambulanceVehicle: 'UP-16-EMS-1090 (ALS-2)',
              etaMinutes: 9,
            },
          ]);
        } else {
          setActiveDispatches(mappedDispatches);
        }
      }
    } catch (err) {
      console.error('Failed to load emergency command data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Live poll every 15s
    return () => clearInterval(interval);
  }, []);

  const handleManualSosSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDispatchError(null);
    setDispatchSuccess(null);

    try {
      const res = await fetch(`${apiUrl}/emergency/one-click-sos`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          callerName: sosForm.callerName,
          callerPhone: sosForm.callerPhone,
          pickupAddress: sosForm.pickupAddress,
          emergencyType: sosForm.emergencyType,
          severity: sosForm.severity,
          latitude: 28.5398,
          longitude: 77.2882,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to dispatch ambulance');
      }

      const data = await res.json();
      setDispatchSuccess(`Ambulance successfully dispatched! Incident: ${data.emergencyNumber}`);
      setSosModalOpen(false);
      setSosForm({
        callerName: '',
        callerPhone: '',
        pickupAddress: '',
        emergencyType: 'CARDIAC',
        severity: 'CRITICAL',
      });
      fetchData();
    } catch (err: any) {
      setDispatchError(err.message || 'Ambulance dispatch broadcast failed');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black mb-2">
            <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" /> Live Telemetry & Dispatch Grid
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Emergency & Ambulance Command Center
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Real-time ambulance dispatching, nearest critical ICU/Ventilator beds, and active telemetry radar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              fetchData();
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>

          <Link
            href="/emergency/sos"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Citizen SOS Portal
          </Link>

          <button
            type="button"
            onClick={() => setSosModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-rose-600/20"
          >
            <Plus className="w-4 h-4" /> Dispatch Ambulance
          </button>
        </div>
      </div>

      {dispatchSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {dispatchSuccess}
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Active Dispatches</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{activeDispatches.length}</p>
          <span className="text-[11px] text-rose-600 font-bold mt-1 block">Priority Green Wave Active</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Fleet Available</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">12 Units</p>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">ALS & BLS Ready on Pad</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Avg Response Time</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">6.8 mins</p>
          <span className="text-[11px] text-sky-600 font-bold mt-1 block">-1.2 mins vs national SLA</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Network ICU Beds</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {criticalHospitals.reduce((acc, h) => acc + (h.availableBeds?.icu || 0), 0)} Available
          </p>
          <span className="text-[11px] text-indigo-600 font-bold mt-1 block">Across 5 Network Facilities</span>
        </div>
      </div>

      {/* Split Section: Active Dispatches + Critical Bed Capacities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Dispatches (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-600" /> Active Emergency Incidents & Dispatches
            </h2>
            <span className="text-xs font-bold text-slate-500">{activeDispatches.length} Units En-Route</span>
          </div>

          <div className="space-y-3">
            {activeDispatches.map((dispatch) => (
              <div
                key={dispatch.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                      {dispatch.emergencyNumber}
                    </span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-slate-900 text-white">
                      {dispatch.emergencyType}
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {dispatch.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> ETA: {dispatch.etaMinutes} mins
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Caller & Contact</span>
                    <p className="font-bold text-slate-800">{dispatch.callerName}</p>
                    <p className="text-slate-500">{dispatch.callerPhone}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Pickup Coordinate / Address</span>
                    <p className="font-semibold text-slate-800 truncate">{dispatch.pickupAddress}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Assigned Unit & Hospital</span>
                    <p className="font-bold text-sky-700">{dispatch.ambulanceVehicle}</p>
                    <p className="text-slate-500 truncate">{dispatch.destinationHospital}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Network Critical Bed Status (1 Column) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-sky-600" /> Critical Bed Reserves
            </h2>
            <span className="text-xs font-bold text-slate-500">Live Hospital Grid</span>
          </div>

          <div className="space-y-3">
            {criticalHospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{hospital.name}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" /> {hospital.distanceKm} km • ETA: {hospital.etaMinutes} mins
                    </p>
                  </div>
                  <a
                    href={`tel:${hospital.phone}`}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <div className="p-2 rounded-xl bg-rose-50 border border-rose-100">
                    <span className="text-[10px] font-bold text-rose-700 block">ICU</span>
                    <span className="text-xs font-black text-rose-900">{hospital.availableBeds?.icu || 0}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-sky-50 border border-sky-100">
                    <span className="text-[10px] font-bold text-sky-700 block">VENT</span>
                    <span className="text-xs font-black text-sky-900">{hospital.availableBeds?.ventilator || 0}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                    <span className="text-[10px] font-bold text-indigo-700 block">O2</span>
                    <span className="text-xs font-black text-indigo-900">{hospital.availableBeds?.oxygen || 0}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                    <span className="text-[10px] font-bold text-amber-700 block">EMERG</span>
                    <span className="text-xs font-black text-amber-900">{hospital.availableBeds?.emergency || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Ambulance Dispatch Modal */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Manual EMS Ambulance Dispatch</h3>
                  <p className="text-xs text-slate-500">Initiate immediate trauma dispatch from command center</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSosModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {dispatchError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {dispatchError}
              </div>
            )}

            <form onSubmit={handleManualSosSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Caller / Reporter Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Police Control / Bystander"
                  value={sosForm.callerName}
                  onChange={(e) => setSosForm({ ...sosForm, callerName: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Callback Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 99999 88888"
                  value={sosForm.callerPhone}
                  onChange={(e) => setSosForm({ ...sosForm, callerPhone: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Incident / Pickup Location</label>
                <input
                  type="text"
                  required
                  placeholder="Intersection, landmark, or GPS address"
                  value={sosForm.pickupAddress}
                  onChange={(e) => setSosForm({ ...sosForm, pickupAddress: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Nature</label>
                  <select
                    value={sosForm.emergencyType}
                    onChange={(e) => setSosForm({ ...sosForm, emergencyType: e.target.value })}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="CARDIAC">Cardiac Arrest</option>
                    <option value="TRAUMA">Major Trauma</option>
                    <option value="STROKE">Acute Stroke</option>
                    <option value="RESPIRATORY">Respiratory Failure</option>
                    <option value="PEDIATRIC">Pediatric Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Triage Severity</label>
                  <select
                    value={sosForm.severity}
                    onChange={(e) => setSosForm({ ...sosForm, severity: e.target.value })}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="CRITICAL">Critical (Level 1)</option>
                    <option value="URGENT">Urgent (Level 2)</option>
                    <option value="STANDARD">Standard (Level 3)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSosModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-rose-600/20"
                >
                  <Send className="w-3.5 h-3.5" /> Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
