'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { NearbyHospitalDto } from '@medinexa/types';
import { getApiBaseUrl } from '@/lib/api-config';
import {
  MapPin,
  Navigation,
  Phone,
  Bed,
  Activity,
  Wind,
  Cpu,
  Star,
  Compass,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Search,
  Crosshair,
  ExternalLink,
  Car,
} from 'lucide-react';

interface HospitalFinderViewProps {
  isPublic?: boolean;
}

export function HospitalFinderView({ isPublic = false }: HospitalFinderViewProps) {
  const [userLat, setUserLat] = useState<number>(28.5398);
  const [userLon, setUserLon] = useState<number>(77.2882);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationName, setLocationName] = useState<string>('Sarita Vihar, New Delhi');

  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [selectedBedType, setSelectedBedType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hospitals, setHospitals] = useState<NearbyHospitalDto[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<NearbyHospitalDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const apiUrl = getApiBaseUrl();

  const fetchNearbyHospitals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        latitude: userLat.toString(),
        longitude: userLon.toString(),
        radiusKm: radiusKm.toString(),
      });
      if (selectedBedType) params.append('bedType', selectedBedType);
      if (searchQuery) params.append('search', searchQuery);

      const endpoint = isPublic
        ? `${apiUrl}/public/nearby-hospitals?${params.toString()}`
        : `${apiUrl}/facilities/nearby?${params.toString()}`;

      const res = await fetch(endpoint);
      const data = await res.json();
      if (data && Array.isArray(data.hospitals)) {
        setHospitals(data.hospitals);
        if (data.hospitals.length > 0 && !selectedHospital) {
          setSelectedHospital(data.hospitals[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch nearby hospitals:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyHospitals();
  }, [userLat, userLon, radiusKm, selectedBedType, searchQuery]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(Number(pos.coords.latitude.toFixed(4)));
        setUserLon(Number(pos.coords.longitude.toFixed(4)));
        setLocationName('Your Current GPS Location');
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation failed or denied:', err.message);
        setIsLocating(false);
        // default fallback remains active
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Location & GPS */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-50 text-sky-600">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600">Your Search Center</span>
                <span className="text-[11px] text-slate-400">({userLat}, {userLon})</span>
              </div>
              <p className="text-base font-bold text-slate-900 mt-0.5">{locationName}</p>
            </div>
            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              className="ml-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              {isLocating ? 'Locating...' : 'Use My GPS'}
            </button>
          </div>

          {/* Search Query */}
          <div className="relative min-w-[240px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search hospital by name or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Filter Badges & Radius */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          {/* Distance Radius Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Radius:</span>
            {[5, 10, 25, 50].map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  radiusKm === r
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>

          {/* Bed Types Quick Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1">Must Have:</span>
            {[
              { label: 'All Beds', value: '' },
              { label: 'ICU Beds', value: 'ICU' },
              { label: 'Ventilator', value: 'VENTILATOR' },
              { label: 'Oxygen', value: 'OXYGEN' },
              { label: 'Emergency', value: 'EMERGENCY' },
            ].map((bt) => (
              <button
                key={bt.value}
                onClick={() => setSelectedBedType(bt.value)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedBedType === bt.value
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {bt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Hospital List + Interactive Radar & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Hospital Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-800">
              Nearby Hospitals with Live Beds ({hospitals.length})
            </h3>
            <span className="text-xs text-slate-500">Sorted by proximity</span>
          </div>

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
              <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-600">Calculating driving distances & live bed counts...</p>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No hospitals found within {radiusKm} km</h4>
              <p className="text-xs text-slate-500 mt-1">Try expanding your radius or changing the bed type filter.</p>
              <button
                onClick={() => {
                  setRadiusKm(50);
                  setSelectedBedType('');
                }}
                className="mt-3 px-4 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold"
              >
                Expand Radius to 50 km
              </button>
            </div>
          ) : (
            hospitals.map((hosp) => {
              const isSelected = selectedHospital?.id === hosp.id;
              return (
                <div
                  key={hosp.id}
                  onClick={() => setSelectedHospital(hosp)}
                  className={`bg-white border rounded-3xl p-5 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-sky-500 shadow-md ring-2 ring-sky-500/10'
                      : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-extrabold">
                          {hosp.facilityType?.replace(/_/g, ' ') || 'HOSPITAL'}
                        </span>
                        <div className="flex items-center text-amber-500 text-xs font-bold gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{hosp.rating}</span>
                        </div>
                      </div>

                      <h4 className="text-base font-black text-slate-900 mt-1.5 tracking-tight">{hosp.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{hosp.address}, {hosp.city}</span>
                      </p>
                    </div>

                    {/* Distance Badge */}
                    <div className="sm:text-right shrink-0">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-extrabold shadow-xs">
                        <Navigation className="w-3 h-3 text-sky-400" />
                        {hosp.distanceKm} km
                      </span>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 flex items-center sm:justify-end gap-1">
                        <Car className="w-3 h-3" /> ~{hosp.estimatedDriveMinutes} mins drive
                      </p>
                    </div>
                  </div>

                  {/* Bed Capacity Counters Pill Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100">
                    <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100/60 text-center">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase">Available</p>
                      <p className="text-lg font-black text-emerald-700">{hosp.availableBeds}</p>
                      <p className="text-[10px] text-emerald-600/70">of {hosp.totalBeds} total</p>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-rose-50/70 border border-rose-100/60 text-center">
                      <p className="text-[10px] font-bold text-rose-700 uppercase flex items-center justify-center gap-1">
                        <Activity className="w-2.5 h-2.5" /> ICU Beds
                      </p>
                      <p className="text-lg font-black text-rose-700">{hosp.availableIcuBeds}</p>
                      <p className="text-[10px] text-rose-600/70">Ready</p>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-cyan-50/70 border border-cyan-100/60 text-center">
                      <p className="text-[10px] font-bold text-cyan-700 uppercase flex items-center justify-center gap-1">
                        <Wind className="w-2.5 h-2.5" /> Oxygen
                      </p>
                      <p className="text-lg font-black text-cyan-700">{hosp.availableOxygenBeds}</p>
                      <p className="text-[10px] text-cyan-600/70">Ready</p>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-100/60 text-center">
                      <p className="text-[10px] font-bold text-indigo-700 uppercase flex items-center justify-center gap-1">
                        <Cpu className="w-2.5 h-2.5" /> Ventilators
                      </p>
                      <p className="text-lg font-black text-indigo-700">{hosp.availableVentilatorBeds}</p>
                      <p className="text-[10px] text-indigo-600/70">Ready</p>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${hosp.phone}`}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        Call {hosp.phone}
                      </a>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLon}&destination=${hosp.latitude},${hosp.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                        Directions
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/bed-booking?facilityId=${hosp.id}&facilityName=${encodeURIComponent(hosp.name)}`}
                        className="px-4 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Bed className="w-3.5 h-3.5" /> Book Bed Online
                      </Link>

                      <Link
                        href={`/emergency/sos?destinationFacilityId=${hosp.id}&hospitalName=${encodeURIComponent(hosp.name)}`}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Activity className="w-3.5 h-3.5" /> SOS Dispatch
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Interactive Vector & GPS Radar Map */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl sticky top-24 overflow-hidden">
            {/* Background Radar Grid Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-black tracking-wider uppercase text-emerald-400">Live Hospital Radar</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Radius: {radiusKm} km</span>
              </div>

              {/* Vector Compass / Radar Display */}
              <div className="my-6 relative flex items-center justify-center h-64 bg-slate-950/70 rounded-2xl border border-slate-800/80 overflow-hidden">
                {/* Concentric distance rings */}
                <div className="absolute w-56 h-56 rounded-full border border-slate-800" />
                <div className="absolute w-40 h-40 rounded-full border border-slate-800" />
                <div className="absolute w-24 h-24 rounded-full border border-slate-800/90" />

                {/* Radar sweep line */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-0.5 bg-gradient-to-r from-sky-400 to-transparent origin-left animate-spin-slow" />
                </div>

                {/* User Center Marker */}
                <div className="relative z-20 flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-sky-400 ring-4 ring-sky-400/30 shadow-lg shadow-sky-500" />
                  <span className="mt-1 text-[9px] font-black uppercase text-sky-300">You</span>
                </div>

                {/* Hospital Pins Positioned on Radar */}
                {hospitals.slice(0, 6).map((hosp, idx) => {
                  const angle = (idx * 60 + 20) * (Math.PI / 180);
                  const radiusScale = Math.min(100, Math.max(30, (hosp.distanceKm / radiusKm) * 110));
                  const x = Math.cos(angle) * radiusScale;
                  const y = Math.sin(angle) * radiusScale;
                  const isCur = selectedHospital?.id === hosp.id;

                  return (
                    <button
                      key={hosp.id}
                      onClick={() => setSelectedHospital(hosp)}
                      style={{ transform: `translate(${x}px, ${y}px)` }}
                      className={`absolute z-20 flex flex-col items-center transition-transform hover:scale-125 ${
                        isCur ? 'scale-110' : ''
                      }`}
                      title={`${hosp.name} (${hosp.distanceKm} km)`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                          isCur
                            ? 'bg-amber-400 ring-4 ring-amber-400/30 text-slate-950'
                            : 'bg-emerald-400 text-slate-950 ring-2 ring-emerald-400/20'
                        }`}
                      >
                        +
                      </div>
                      <span className="text-[8px] font-bold text-slate-300 whitespace-nowrap max-w-[80px] truncate mt-0.5">
                        {hosp.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Hospital Details Preview */}
              {selectedHospital ? (
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-sky-400">Selected Facility</span>
                      <h5 className="text-sm font-black text-white mt-0.5">{selectedHospital.name}</h5>
                      <p className="text-slate-400 text-[11px] mt-0.5">{selectedHospital.address}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-700 text-white font-black text-xs shrink-0">
                      {selectedHospital.distanceKm} km
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-700/60 text-center">
                    <div className="p-2 rounded-xl bg-slate-900/60">
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Total Beds</p>
                      <p className="text-sm font-black text-white">{selectedHospital.totalBeds}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-950/60 text-emerald-300">
                      <p className="text-[9px] uppercase font-bold">Available</p>
                      <p className="text-sm font-black">{selectedHospital.availableBeds}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-950/60 text-rose-300">
                      <p className="text-[9px] uppercase font-bold">ICU Free</p>
                      <p className="text-sm font-black">{selectedHospital.availableIcuBeds}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLon}&destination=${selectedHospital.latitude},${selectedHospital.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-center text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Navigate via Google Maps
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-3">Select a hospital marker to inspect details.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
