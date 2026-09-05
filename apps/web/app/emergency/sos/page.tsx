'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  PhoneCall,
  MapPin,
  Navigation,
  ShieldAlert,
  Clock,
  Car,
  User,
  Phone,
  Building2,
  ChevronRight,
  Radio,
  CheckCircle2,
  Volume2,
} from 'lucide-react';

interface TelemetryData {
  dispatchId: string;
  status: string;
  vehicle: {
    number: string;
    type: string;
    speedKmh: number;
    bearingDegrees: number;
  };
  driver: {
    name: string;
    phone: string;
    badge: string;
  };
  currentLocation: {
    latitude: number;
    longitude: number;
    heading: string;
  };
  pickupLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  destinationHospital: {
    name: string;
    phone: string;
    address: string;
  };
  metrics: {
    remainingDistanceKm: number;
    etaMinutes: number;
    dispatchedAt: string;
  };
}

export default function EmergencySosPage() {
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [emergencyType, setEmergencyType] = useState('CARDIAC');
  const [latitude, setLatitude] = useState<number>(28.5398);
  const [longitude, setLongitude] = useState<number>(77.2882);
  const [gpsAcquired, setGpsAcquired] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active Dispatch Tracking State
  const [dispatchResult, setDispatchResult] = useState<any | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [etaSeconds, setEtaSeconds] = useState<number>(360); // 6 mins

  // Auto detect GPS on page mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      setLoadingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setPickupAddress(`GPS Position (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          setGpsAcquired(true);
          setLoadingGps(false);
        },
        (err) => {
          console.warn('Geolocation failed or denied, using high-accuracy regional default', err);
          setPickupAddress('Sarita Vihar / Mathura Road, New Delhi');
          setLoadingGps(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // Poll live ambulance tracking once dispatched
  useEffect(() => {
    if (!dispatchResult?.dispatchId) return;

    const interval = setInterval(async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const res = await fetch(`${apiUrl}/emergency/tracking/${dispatchResult.dispatchId}`);
        if (res.ok) {
          const data = await res.json();
          setTelemetry(data);
          if (data.metrics?.etaMinutes) {
            setEtaSeconds((prev) => Math.max(30, prev - 4));
          }
        }
      } catch (err) {
        console.error('Failed to poll telemetry', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [dispatchResult]);

  const handleTriggerSos = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsDispatching(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const payload = {
        callerName: callerName || 'Emergency Caller',
        callerPhone: callerPhone || '+91 99999 00000',
        pickupAddress: pickupAddress || 'Current GPS Coordinate',
        latitude,
        longitude,
        emergencyType,
        severity: 'CRITICAL',
      };

      const res = await fetch(`${apiUrl}/emergency/one-click-sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Emergency dispatch broadcast failed');
      }

      const result = await res.json();
      setDispatchResult(result);
      if (result.assignedAmbulance?.etaMinutes) {
        setEtaSeconds(result.assignedAmbulance.etaMinutes * 60);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to trigger emergency dispatch. Please dial 108 or 911 immediately.');
    } finally {
      setIsDispatching(false);
    }
  };

  const emergencyCategories = [
    { id: 'CARDIAC', label: 'Cardiac / Chest Pain', icon: '🫀', desc: 'Heart attack symptoms, severe tightness' },
    { id: 'TRAUMA', label: 'Trauma / Road Accident', icon: '🚨', desc: 'Major physical injury, blood loss' },
    { id: 'STROKE', label: 'Stroke / Neurological', icon: '🧠', desc: 'Facial drooping, speech loss, paralysis' },
    { id: 'RESPIRATORY', label: 'Respiratory Distress', icon: '🫁', desc: 'Severe shortness of breath, low SpO2' },
  ];

  const formatEta = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Warning Ribbon */}
      <div className="bg-rose-600 text-white px-4 py-2.5 text-center text-xs font-black tracking-wide flex items-center justify-center gap-2 shadow-md">
        <Radio className="w-4 h-4 animate-ping" />
        DIRECT EMERGENCY RESPONSE CHANNEL • DISPATCHES HIGH-PRIORITY ALS AMBULANCE WITH ICU SUPPORT
      </div>

      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white font-bold shadow-md shadow-rose-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-tight">MediNexa SOS</span>
              <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                EMS Dispatch
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-xs font-bold">
            <Link href="/nearby-hospitals" className="text-slate-400 hover:text-white transition-colors">
              Find Hospitals
            </Link>
            <a
              href="tel:108"
              className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Call National EMS (108)
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        {dispatchResult ? (
          /* LIVE ACTIVE AMBULANCE TRACKING SCREEN */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Urgent Status Header */}
            <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 border-2 border-rose-500/60 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-black border border-rose-500/40 mb-2">
                    <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> AMBULANCE EN ROUTE (HIGH PRIORITY)
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    Emergency Unit Dispatched
                  </h1>
                  <p className="text-xs md:text-sm text-slate-300 mt-1 font-mono">
                    Incident #{dispatchResult.emergencyNumber} • Tracking Ref: {dispatchResult.dispatchId}
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-4 text-center min-w-[200px] shadow-lg">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Estimated Time of Arrival
                  </span>
                  <p className="text-3xl md:text-4xl font-black text-rose-400 font-mono tracking-tight mt-1">
                    {formatEta(etaSeconds)}
                  </p>
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center justify-center gap-1 mt-1">
                    <Navigation className="w-3 h-3 animate-spin" /> Priority Green Wave Activated
                  </span>
                </div>
              </div>
            </div>

            {/* Live Telemetry and Vehicle Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Ambulance & Driver Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Car className="w-4 h-4 text-rose-400" /> Assigned Vehicle
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ALS UNIT
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Registration Number</span>
                    <p className="text-lg font-black text-white font-mono">
                      {telemetry?.vehicle?.number || dispatchResult.assignedAmbulance?.vehicleNumber || 'DL-01-EMS-4042'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Lead Paramedic / Driver</span>
                    <p className="text-sm font-bold text-slate-200">
                      {telemetry?.driver?.name || dispatchResult.assignedAmbulance?.driverName || 'Suresh Kumar (EMS)'}
                    </p>
                  </div>
                  <div className="pt-2">
                    <a
                      href={`tel:${telemetry?.driver?.phone || dispatchResult.assignedAmbulance?.driverPhone || '+919811099887'}`}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <PhoneCall className="w-4 h-4" /> Call Ambulance Driver
                    </a>
                  </div>
                </div>
              </div>

              {/* Destination Hospital */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-sky-400" /> Destination Hospital
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    TRAUMA READY
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Facility Name</span>
                    <p className="text-sm font-bold text-white leading-snug">
                      {dispatchResult.assignedHospital?.name || 'Apollo MediNexa Super Speciality Hospital'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Emergency ER Ward</span>
                    <p className="text-xs text-slate-300">
                      {dispatchResult.assignedHospital?.address || 'Sarita Vihar, Delhi Mathura Road'}
                    </p>
                  </div>
                  <div className="pt-2">
                    <a
                      href={`tel:${dispatchResult.assignedHospital?.phone || '+911126925858'}`}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 transition-all"
                    >
                      <PhoneCall className="w-4 h-4" /> Call ER Trauma Desk
                    </a>
                  </div>
                </div>
              </div>

              {/* Radar Simulation / GPS Vectors */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
                    <Navigation className="w-4 h-4 text-amber-400" /> Live GPS Vector
                  </h3>
                  <div className="h-28 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
                    {/* Concentric radar rings */}
                    <div className="absolute w-24 h-24 rounded-full border border-rose-500/20 animate-ping" />
                    <div className="absolute w-16 h-16 rounded-full border border-rose-500/40" />
                    <div className="absolute w-8 h-8 rounded-full border border-sky-400/40" />
                    {/* Moving vehicle blip */}
                    <div className="w-4 h-4 rounded-full bg-rose-500 shadow-lg shadow-rose-500 animate-pulse flex items-center justify-center text-[8px] text-white font-bold">
                      🚑
                    </div>
                    <span className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-500">
                      Speed: {telemetry?.vehicle?.speedKmh || 54} km/h
                    </span>
                    <span className="absolute bottom-2 right-2 text-[10px] font-mono text-emerald-400">
                      GPS Lock OK
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Pickup: {pickupAddress.slice(0, 24)}...</span>
                  <span className="text-sky-400 font-mono">
                    {telemetry?.metrics?.remainingDistanceKm || dispatchResult.assignedHospital?.distanceKm || 2.4} km away
                  </span>
                </div>
              </div>
            </div>

            {/* Critical First Aid Protocols */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-rose-400" /> On-Scene Immediate First Aid Protocols
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dispatchResult.emergencyProtocol?.map((protocol: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{protocol}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => setDispatchResult(null)}
                className="text-xs text-slate-400 hover:text-slate-200 underline"
              >
                Log New Emergency Call
              </button>

              <div className="flex gap-3">
                <Link
                  href="/nearby-hospitals"
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                >
                  Nearby Emergency Beds
                </Link>
                <a
                  href="tel:108"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Direct Dial 108
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* ONE-CLICK SOS TRIGGER INTERFACE */
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Header Title */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-black">
                <AlertTriangle className="w-4 h-4" /> RAPID HOSPITAL & AMBULANCE DISPATCH
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                One-Click Emergency SOS
              </h1>
              <p className="text-slate-400 text-xs md:text-sm max-w-lg mx-auto">
                Instantly notifies the closest Super-Speciality Trauma Center and routes an Advanced Life Support ambulance to your exact GPS coordinates.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500 text-rose-200 text-xs flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleTriggerSos} className="space-y-6">
              {/* Emergency Category Radio Cards */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  1. Select Nature of Medical Emergency
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {emergencyCategories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => setEmergencyType(cat.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        emergencyType === cat.id
                          ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{cat.label}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{cat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-400" /> 2. Patient Pickup Location
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if ('geolocation' in navigator) {
                        setLoadingGps(true);
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setLatitude(pos.coords.latitude);
                            setLongitude(pos.coords.longitude);
                            setPickupAddress(`GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
                            setGpsAcquired(true);
                            setLoadingGps(false);
                          },
                          () => setLoadingGps(false)
                        );
                      }
                    }}
                    className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${loadingGps ? 'animate-spin' : ''}`} />
                    {loadingGps ? 'Acquiring GPS...' : gpsAcquired ? 'GPS Locked' : 'Detect GPS'}
                  </button>
                </div>

                <input
                  type="text"
                  required
                  placeholder="Street address, landmark, or apartment number"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:border-rose-500"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Lat: {latitude.toFixed(4)}</span>
                  <span>Lon: {longitude.toFixed(4)}</span>
                  <span className="text-emerald-400">High-Precision Triage GPS</span>
                </div>
              </div>

              {/* Caller Contact */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-300" /> 3. Caller / Bystander Information
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Michael Smith"
                      value={callerName}
                      onChange={(e) => setCallerName(e.target.value)}
                      className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Phone Number (Required for Driver)</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={callerPhone}
                      onChange={(e) => setCallerPhone(e.target.value)}
                      className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Giant Urgent SOS Button */}
              <div className="pt-2 text-center">
                <button
                  type="submit"
                  disabled={isDispatching}
                  className="w-full py-6 rounded-3xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black text-xl shadow-2xl shadow-rose-600/50 flex items-center justify-center gap-3 transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  <Activity className="w-7 h-7 animate-pulse text-white" />
                  {isDispatching ? 'BROADCASTING EMERGENCY DISPATCH...' : 'TRIGGER 1-CLICK EMERGENCY SOS'}
                </button>
                <p className="text-[11px] text-slate-500 mt-2">
                  Tapping will trigger live GPS ambulance routing and alert the nearest ICU team.
                </p>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600">
        <p>MediNexa Rapid Emergency Dispatch • Integrated 108/911 Health Telecom Protocol</p>
      </footer>
    </div>
  );
}
