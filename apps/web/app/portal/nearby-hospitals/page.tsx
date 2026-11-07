'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Navigation,
  Phone,
  Bed,
  Activity,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  Compass,
  CheckCircle2,
  ExternalLink,
  Locate,
  Clock,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';

interface NearbyHospital {
  id: string;
  facilityId: string;
  name: string;
  address: string;
  contactNumber: string;
  phone: string;
  distance: number;
  distanceText: string;
  latitude: number;
  longitude: number;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  icuBedsAvailable: number;
  generalBedsAvailable: number;
  emergencyBedsAvailable: number;
  status: 'AVAILABLE' | 'LIMITED' | 'FULL';
  indicator: 'green' | 'yellow' | 'red';
  rating: number;
  navigateUrl: string;
}

export default function NearbyHospitalsPage() {
  const [hospitals, setHospitals] = useState<NearbyHospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState<5 | 10 | 25>(25);
  const [bedTypeFilter, setBedTypeFilter] = useState<'ALL' | 'ICU' | 'GENERAL' | 'EMERGENCY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'locating' | 'granted' | 'denied' | 'fallback'>('locating');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  // 1. Fetch nearby hospitals from backend
  const fetchNearbyHospitals = useCallback(async (lat?: number, lng?: number, rad: number = 25, type?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (lat !== undefined && lng !== undefined) {
        params.append('latitude', lat.toString());
        params.append('longitude', lng.toString());
      }
      params.append('radius', rad.toString());
      if (type && type !== 'ALL') {
        params.append('bedType', type);
      }

      const res = await fetch(`${apiUrl}/bed-availability/nearby?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setHospitals(data);
      }
    } catch (err) {
      console.error('Error loading nearby hospitals:', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  // 2. Obtain Browser Geolocation
  const requestGeolocation = useCallback(() => {
    setGeoStatus('locating');
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setGeoStatus('granted');
          fetchNearbyHospitals(loc.lat, loc.lng, radius, bedTypeFilter);
        },
        (err) => {
          console.warn('Geolocation denied or unavailable:', err.message);
          setGeoStatus('denied');
          // Default to central healthcare corridor
          fetchNearbyHospitals(undefined, undefined, radius, bedTypeFilter);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setGeoStatus('fallback');
      fetchNearbyHospitals(undefined, undefined, radius, bedTypeFilter);
    }
  }, [fetchNearbyHospitals, radius, bedTypeFilter]);

  // Initial trigger
  useEffect(() => {
    requestGeolocation();
  }, [requestGeolocation]);

  // Re-fetch when radius or bed type changes
  const handleRadiusChange = (newRadius: 5 | 10 | 25) => {
    setRadius(newRadius);
    fetchNearbyHospitals(userLocation?.lat, userLocation?.lng, newRadius, bedTypeFilter);
  };

  const handleBedTypeChange = (type: 'ALL' | 'ICU' | 'GENERAL' | 'EMERGENCY') => {
    setBedTypeFilter(type);
    fetchNearbyHospitals(userLocation?.lat, userLocation?.lng, radius, type);
  };

  // Client-side search filtering
  const filteredHospitals = hospitals.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (indicator: 'green' | 'yellow' | 'red') => {
    if (indicator === 'green') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Beds Available
        </span>
      );
    }
    if (indicator === 'yellow') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Limited Beds
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
        Capacity Full
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
              GPS EMERGENCY RADIUS NAVIGATOR
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Nearby Hospital Bed Search
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Locate nearest healthcare centers within 5km, 10km, or 25km radius with live ICU and emergency bed telemetry.
          </p>
        </div>

        {/* GPS Status Indicator & Re-locate Button */}
        <div className="flex items-center gap-2.5">
          <div className="px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm flex items-center gap-2">
            <Locate className={`w-3.5 h-3.5 ${geoStatus === 'locating' ? 'animate-pulse text-amber-500' : 'text-teal-500'}`} />
            <span>
              {geoStatus === 'locating' && 'Detecting your GPS...'}
              {geoStatus === 'granted' && `GPS Active (${userLocation?.lat.toFixed(2)}, ${userLocation?.lng.toFixed(2)})`}
              {geoStatus === 'denied' && 'Default Metro Corridor (GPS Denied)'}
              {geoStatus === 'fallback' && 'Metro Healthcare Corridor'}
            </span>
          </div>

          <button
            onClick={requestGeolocation}
            className="p-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition cursor-pointer"
            title="Recalculate Current Location"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar: Radius Tabs & Bed Type Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Radius Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
            Search Radius:
          </span>
          {([5, 10, 25] as const).map((r) => (
            <button
              key={r}
              onClick={() => handleRadiusChange(r)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                radius === r
                  ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-md shadow-teal-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Within {r} km
            </button>
          ))}
        </div>

        {/* Bed Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
            Required Beds:
          </span>
          {(['ALL', 'ICU', 'EMERGENCY', 'GENERAL'] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleBedTypeChange(type)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                bedTypeFilter === type
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {type === 'ALL' ? 'All Types' : type}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospital or area..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          />
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <span>Found {filteredHospitals.length} Hospitals</span>
          <span className="text-xs font-normal text-slate-400">within {radius}km of your location</span>
        </h2>
        <Link
          href="/portal/live-beds"
          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
        >
          <span>View Live Network Telemetry</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Hospital Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 space-y-4 animate-pulse">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4"></div>
              <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded-lg w-1/2"></div>
              <div className="h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            </Card>
          ))}
        </div>
      ) : filteredHospitals.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              No Hospitals Found in {radius}km
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Try expanding your search radius to 10km or 25km to discover regional multi-specialty trauma centers.
            </p>
          </div>
          <button
            onClick={() => handleRadiusChange(25)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer"
          >
            Expand to 25 km Radius
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHospitals.map((hospital) => (
            <Card
              key={hospital.id}
              className="p-5 flex flex-col justify-between space-y-4 hover:shadow-xl hover:border-teal-500/40 transition-all duration-200 border-slate-200 dark:border-slate-800"
            >
              {/* Header: Name, Distance Badge, Status */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-black bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                    <MapPin className="w-3 h-3 text-sky-500" />
                    {hospital.distanceText} away
                  </span>
                  {getStatusBadge(hospital.indicator)}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {hospital.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {hospital.address}
                  </p>
                </div>
              </div>

              {/* Bed Availability Telemetry Breakdown */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Live Available Beds Breakdown
                </div>
                <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60">
                  {/* ICU Beds */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 uppercase">
                      ICU
                    </span>
                    <div className="text-lg font-black text-slate-900 dark:text-slate-100">
                      {hospital.icuBedsAvailable}
                    </div>
                    <div className="text-[9px] text-slate-400">Ventilator</div>
                  </div>

                  {/* General Beds */}
                  <div className="space-y-0.5 border-x border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase">
                      General
                    </span>
                    <div className="text-lg font-black text-slate-900 dark:text-slate-100">
                      {hospital.generalBedsAvailable}
                    </div>
                    <div className="text-[9px] text-slate-400">Wards</div>
                  </div>

                  {/* Emergency Beds */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 uppercase">
                      Emergency
                    </span>
                    <div className="text-lg font-black text-slate-900 dark:text-slate-100">
                      {hospital.emergencyBedsAvailable}
                    </div>
                    <div className="text-[9px] text-slate-400">Trauma</div>
                  </div>
                </div>
              </div>

              {/* Contact & Navigation Actions */}
              <div className="space-y-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">Hospital Hotline:</span>
                  <a
                    href={`tel:${hospital.contactNumber.replace(/[^0-9+]/g, '')}`}
                    className="font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {hospital.contactNumber}
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Click to Call */}
                  <a
                    href={`tel:${hospital.contactNumber.replace(/[^0-9+]/g, '')}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition text-center"
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-600" />
                    <span>Call Now</span>
                  </a>

                  {/* Navigate Button */}
                  <a
                    href={hospital.navigateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 transition text-center"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Navigate</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
