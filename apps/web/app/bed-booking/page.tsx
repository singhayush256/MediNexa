'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Building2,
  Bed,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Activity,
  HeartPulse,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { BedType } from '@medinexa/types';
import { getApiBaseUrl, fetchWithTimeout } from '@/lib/api-config';

interface FacilityOption {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  availableBeds?: number;
  totalBeds?: number;
  bedSummary?: Record<string, { total: number; available: number }>;
}

function BedBookingContent() {
  const searchParams = useSearchParams();
  const preselectedFacilityId = searchParams.get('facilityId') || '';
  const preselectedFacilityName = searchParams.get('facilityName') || '';

  const [facilities, setFacilities] = useState<FacilityOption[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    facilityId: preselectedFacilityId,
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    bedType: BedType.GENERAL,
    priority: 'NORMAL',
    chiefComplaint: '',
    medicalCondition: '',
    expectedDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    async function loadHospitals() {
      try {
        const apiUrl = getApiBaseUrl();
        const res = await fetchWithTimeout(`${apiUrl}/public/nearby-hospitals`, {}, 15000);
        if (res.ok) {
          const data = await res.json();
          const hospitalList: FacilityOption[] = Array.isArray(data)
            ? data
            : Array.isArray(data?.hospitals)
            ? data.hospitals
            : [];
          setFacilities(hospitalList);

          if (preselectedFacilityId && hospitalList.some((h) => h.id === preselectedFacilityId)) {
            setFormData((prev) => ({ ...prev, facilityId: preselectedFacilityId }));
          } else if (hospitalList.length > 0 && !formData.facilityId) {
            setFormData((prev) => ({ ...prev, facilityId: hospitalList[0].id }));
          }
        }
      } catch (err) {
        console.error('Failed to load facilities', err);
      } finally {
        setLoadingFacilities(false);
      }
    }
    loadHospitals();
  }, [preselectedFacilityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const apiUrl = getApiBaseUrl();
      const payload = {
        facilityId: formData.facilityId,
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        patientEmail: formData.patientEmail || undefined,
        bedType: formData.bedType,
        priority: formData.priority,
        chiefComplaint: formData.chiefComplaint || undefined,
        medicalCondition: formData.medicalCondition || undefined,
        expectedDate: formData.expectedDate ? new Date(formData.expectedDate).toISOString() : undefined,
        notes: formData.notes || undefined,
      };

      const res = await fetchWithTimeout(`${apiUrl}/bed-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }, 20000);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to submit bed reservation request');
      }

      const bookingData = await res.json();
      setSubmittedBooking(bookingData);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedFacility = (facilities || []).find((f) => f.id === formData.facilityId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Public Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight">MediNexa</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Citizen Portal
              </span>
            </div>
          </Link>

          <nav className="flex items-center space-x-4 text-xs font-bold">
            <Link href="/nearby-hospitals" className="text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100">
              Find Hospitals
            </Link>
            <Link href="/bed-booking" className="text-sky-600 bg-sky-50 px-3 py-1.5 rounded-xl">
              Book a Bed
            </Link>
            <Link
              href="/emergency/sos"
              className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5" /> Emergency SOS
            </Link>
            <Link href="/auth/login" className="border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 py-1.5 rounded-xl">
              Staff Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        {submittedBooking ? (
          /* Confirmation State */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-8 md:p-12 animate-in fade-in duration-300">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Pre-Admission Request Received
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
                  Bed Reservation Registered Successfully
                </h1>
                <p className="text-slate-500 text-sm">
                  Our triage intake coordinator has logged your request and will prioritize allocation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Booking Reference</span>
                <p className="text-xl font-black font-mono text-sky-700 mt-0.5">
                  {submittedBooking.bookingNumber || `BKG-${submittedBooking.id?.slice(0, 8).toUpperCase()}`}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Hospital Destination</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  {submittedBooking.facility?.name || selectedFacility?.name || preselectedFacilityName || 'MediNexa Network Facility'}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Patient Name</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{submittedBooking.patientName}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Requested Ward / Bed Type</span>
                <p className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-black rounded-md">
                    {submittedBooking.bedType}
                  </span>
                  <span className="text-xs text-slate-500 font-normal">
                    Priority: {submittedBooking.priority || 'NORMAL'}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Contact Phone</span>
                <p className="text-base font-medium text-slate-800 mt-0.5">{submittedBooking.patientPhone}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Status</span>
                <p className="text-sm font-bold text-amber-700 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-4 h-4 text-amber-600 animate-spin" /> Pending Intake Review & Bed Assignment
                </p>
              </div>
            </div>

            <div className="border border-sky-100 bg-sky-50/70 rounded-2xl p-5 mb-8">
              <h4 className="text-sm font-bold text-sky-900 flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-sky-600" /> Next Steps For Patient Arrival
              </h4>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-5">
                <li>Keep this booking number handy on your smartphone or print this receipt.</li>
                <li>Please present valid government identification and medical insurance cards at the admission desk.</li>
                <li>If the patient's condition suddenly worsens, immediately dial 108/911 or visit our Emergency SOS page.</li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-2"
              >
                <Printer className="w-4 h-4 text-slate-500" /> Print Reservation Slip
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedBooking(null);
                    setFormData({
                      facilityId: facilities[0]?.id || '',
                      patientName: '',
                      patientPhone: '',
                      patientEmail: '',
                      bedType: BedType.GENERAL,
                      priority: 'NORMAL',
                      chiefComplaint: '',
                      medicalCondition: '',
                      expectedDate: new Date().toISOString().split('T')[0],
                      notes: '',
                    });
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold"
                >
                  Book Another Bed
                </button>
                <Link
                  href="/nearby-hospitals"
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2"
                >
                  View Network Hospitals <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Form State */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-extrabold mb-3">
                <HeartPulse className="w-3.5 h-3.5 text-sky-400" /> Fast-Track Hospital Admission Portal
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Online Patient Bed Reservation
              </h1>
              <p className="text-slate-300 text-xs md:text-sm mt-2 max-w-2xl">
                Reserve hospital beds in advance across our network. Choose between General, ICU, Oxygen, Ventilator, Emergency, and Private rooms.
              </p>
            </div>

            {error && (
              <div className="mx-8 mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-rose-900">Booking Submission Error</h4>
                  <p className="text-xs text-rose-700 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
              {/* Section 1: Hospital & Bed Selection */}
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-600" /> 1. Select Hospital & Bed Category
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Destination Hospital Facility <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.facilityId}
                      onChange={(e) => setFormData({ ...formData, facilityId: e.target.value })}
                      required
                      className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {(facilities || []).map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} {f.availableBeds !== undefined ? `(${f.availableBeds} beds available)` : ''}
                        </option>
                      ))}
                    </select>
                    {selectedFacility?.address && (
                      <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                        📍 {selectedFacility.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Bed Category Required <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.bedType}
                      onChange={(e) => setFormData({ ...formData, bedType: e.target.value as BedType })}
                      required
                      className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value={BedType.GENERAL}>General Ward Bed</option>
                      <option value={BedType.ICU}>ICU (Intensive Care Unit)</option>
                      <option value={BedType.OXYGEN}>Oxygen Supported Bed</option>
                      <option value={BedType.VENTILATOR}>Ventilator Equipped Bed</option>
                      <option value={BedType.EMERGENCY}>Emergency / Trauma Bed</option>
                      <option value={BedType.PRIVATE}>Private Deluxe Room</option>
                    </select>
                    <p className="text-xs text-slate-400 mt-1.5">
                      Oxygen and Ventilator beds are monitored with continuous pulse-ox telemetry.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Patient Information */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-sky-600" /> 2. Patient & Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Patient Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. John Doe"
                        value={formData.patientName}
                        onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                        className="w-full text-xs font-semibold pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Contact Phone <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 019-2834"
                        value={formData.patientPhone}
                        onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                        className="w-full text-xs font-semibold pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Address (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="patient@example.com"
                        value={formData.patientEmail}
                        onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                        className="w-full text-xs font-semibold pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Clinical Details & Timing */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-600" /> 3. Medical Status & Expected Timing
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Priority Level
                    </label>
                    <div className="flex gap-3">
                      {['NORMAL', 'URGENT', 'HIGH'].map((p) => (
                        <button
                          type="button"
                          key={p}
                          onClick={() => setFormData({ ...formData, priority: p })}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                            formData.priority === p
                              ? p === 'HIGH'
                                ? 'bg-rose-50 border-rose-400 text-rose-700'
                                : p === 'URGENT'
                                ? 'bg-amber-50 border-amber-400 text-amber-800'
                                : 'bg-sky-50 border-sky-400 text-sky-800'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Expected Admission Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.expectedDate}
                        onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                        className="w-full text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Chief Complaint / Primary Symptoms
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chest tightness, Post-operative recovery, High fever"
                      value={formData.chiefComplaint}
                      onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                      className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Known Medical Conditions / Allergies
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Type 2 Diabetes, Hypertension, Penicillin allergy"
                      value={formData.medicalCondition}
                      onChange={(e) => setFormData({ ...formData, medicalCondition: e.target.value })}
                      className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Special Requests / Additional Clinical Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide any doctor referrals, mobility requirements, oxygen flow rate details, or dietary preferences..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full text-xs font-normal px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Submit Action */}
              <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> HIPAA & GDPR compliant data transmission
                </div>

                <button
                  type="submit"
                  disabled={submitting || loadingFacilities}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-sm shadow-md shadow-sky-600/20 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {submitting ? 'Submitting Reservation...' : 'Confirm Bed Pre-Admission'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Public Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>MediNexa Healthcare SaaS • Patient Bed Reservation & Pre-Admission Service</p>
      </footer>
    </div>
  );
}

export default function PublicBedBookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-xs">Loading Bed Reservation System...</div>}>
      <BedBookingContent />
    </Suspense>
  );
}
