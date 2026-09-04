'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Building2,
  ArrowRight,
  Send,
  ShieldCheck,
  Check,
  Star,
  Activity,
  Zap,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, StatCard } from '@/components/ui';

export default function SmartAppointmentSchedulerPage() {
  const [symptoms, setSymptoms] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [bookingDocId, setBookingDocId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('09:30');
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const handleAnalyze = async (queryText?: string) => {
    const textToSearch = queryText || symptoms;
    if (!textToSearch.trim()) {
      setError('Please enter your symptoms or chief complaint.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setBookingSuccess(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/appointments/smart-recommend`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ symptoms: textToSearch }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to analyze symptoms');
      }

      const data = await res.json();
      setRecommendations(data);
    } catch (err: any) {
      setError(err.message || 'Error processing recommendation');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExpressBook = async (doctor: any, slot: string) => {
    setBookingDocId(doctor.doctorId);
    setError(null);

    try {
      const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/appointments/express-book`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          symptoms,
          doctorId: doctor.doctorId,
          slotTime: slot,
          appointmentDate: doctor.recommendedDate,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to express book appointment');
      }

      const data = await res.json();
      setBookingSuccess({
        ...data,
        doctorName: doctor.name,
        slot,
        date: doctor.recommendedDate,
      });
    } catch (err: any) {
      setError(err.message || 'Booking error. Slot might already be occupied.');
    } finally {
      setBookingDocId(null);
    }
  };

  const quickSymptoms = [
    { label: 'Chest Tightness & Palpitations', spec: 'Cardiology' },
    { label: 'Severe Knee Joint Pain & Mobility Loss', spec: 'Orthopedics' },
    { label: 'Chronic Migraine, Dizziness & Vertigo', spec: 'Neurology' },
    { label: 'Cutaneous Skin Rash, Itching & Eczema', spec: 'Dermatology' },
    { label: 'Pediatric Fever, Cough & Milestone Check', spec: 'Pediatrics' },
    { label: 'Sinus Congestion & Throat Soreness', spec: 'ENT' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 antialiased overflow-hidden">
      <DashboardSidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardNav />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/40 border border-blue-500/30 p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-500/30">
                  <Zap className="h-3.5 w-3.5" /> Smart Clinical Scheduling Engine
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  Smart AI Appointment Scheduler & Triage
                </h1>
                <p className="text-slate-300 text-sm mt-2 max-w-2xl">
                  Natural language symptom matching to specialized Indian medical departments, predictive queue wait-time estimation, double-booking conflict mitigation, and 1-click Express OPD reservation.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-xl">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Zero Double-Booking Guarantee</span>
              </div>
            </div>
          </div>

          {/* Booking Success Confirmation Modal / Banner */}
          {bookingSuccess && (
            <div className="p-6 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 shadow-xl space-y-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Appointment Successfully Confirmed: {bookingSuccess.appointment?.appointmentNumber}
                  </h3>
                  <p className="text-xs text-emerald-300">
                    Booked with {bookingSuccess.doctorName} for {bookingSuccess.date} at {bookingSuccess.slot}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-300 bg-emerald-900/20 p-3 rounded-xl border border-emerald-500/20">
                {bookingSuccess.instructions} An SMS confirmation has been scheduled via TRAI DLT Header <strong>MDNEXA</strong>.
              </p>
            </div>
          )}

          {/* Feedback Alerts */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-sm">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Symptom Input & Quick Triage Selection */}
          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                Patient Symptom Intake & NLP Triage
              </CardTitle>
              <CardDescription className="text-slate-400">
                Describe patient symptoms in plain English or select a common clinical presentation below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="E.g., Severe bilateral knee pain while climbing stairs, morning stiffness..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  className="flex-1 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:border-blue-500 focus:outline-none"
                />
                <Button
                  onClick={() => handleAnalyze()}
                  disabled={analyzing}
                  size="md"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shrink-0"
                >
                  <Sparkles className={`h-4 w-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
                  {analyzing ? 'Analyzing Clinical NLP...' : 'Recommend Doctor & Slot'}
                </Button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Quick Diagnostic Presets
                </span>
                <div className="flex flex-wrap gap-2">
                  {quickSymptoms.map((qs, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSymptoms(qs.label);
                        handleAnalyze(qs.label);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/60 transition flex items-center gap-1.5"
                    >
                      <span>{qs.label}</span>
                      <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded">
                        {qs.spec}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendation Output */}
          {recommendations && (
            <div className="space-y-6">
              {/* Symptom NLP Analysis Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/30 border border-blue-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      Recommended Specialty: {recommendations.symptomAnalysis?.matchedSpecialty}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {recommendations.symptomAnalysis?.confidence}% Match Confidence
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs">
                    {recommendations.symptomAnalysis?.clinicalRationale}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase text-slate-400 block font-bold">Suggested Date</span>
                  <span className="font-mono text-sm font-bold text-blue-400">
                    {recommendations.dateSuggested} (Tomorrow)
                  </span>
                </div>
              </div>

              {/* Recommended Doctors Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.recommendedDoctors?.map((doc: any, idx: number) => {
                  const isBooking = bookingDocId === doc.doctorId;

                  return (
                    <Card key={idx} className="border-slate-800 bg-slate-900/70 hover:border-slate-700 transition">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow">
                              {doc.name.replace('Dr. ', '')[0]}
                            </div>
                            <div>
                              <CardTitle className="text-white text-sm">{doc.name}</CardTitle>
                              <CardDescription className="text-xs text-blue-400 font-medium">
                                {doc.specialty} • {doc.department}
                              </CardDescription>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Reg: {doc.licenseNumber} • {doc.experienceYears} yrs experience
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-emerald-400 text-sm">{doc.consultationFee}</span>
                            <div className="flex items-center gap-1 text-[11px] text-amber-400 mt-0.5 justify-end">
                              <Star className="h-3 w-3 fill-amber-400" />
                              <span>{doc.rating}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4 text-xs">
                        {/* Wait time badge */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Clock className="h-3.5 w-3.5 text-blue-400" />
                            Predicted Queue Wait-Time:
                          </span>
                          <span className="font-bold text-emerald-400 font-mono">
                            {doc.estimatedWaitTime}
                          </span>
                        </div>

                        {/* Available Slots */}
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                            Select Available Slot (Auto-Suggested):
                          </label>
                          <div className="grid grid-cols-5 gap-1.5">
                            {doc.availableSlots?.map((slot: any, sIdx: number) => (
                              <button
                                key={sIdx}
                                type="button"
                                disabled={!slot.available}
                                onClick={() => setSelectedSlot(slot.time)}
                                className={`p-1.5 rounded-lg font-mono text-[11px] font-semibold text-center transition ${
                                  selectedSlot === slot.time
                                    ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                    : slot.available
                                    ? 'bg-slate-800/80 text-slate-200 hover:bg-slate-700'
                                    : 'bg-slate-900 text-slate-600 line-through cursor-not-allowed'
                                }`}
                              >
                                {slot.time}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 1-Click Express Book Button */}
                        <Button
                          onClick={() => handleExpressBook(doc, selectedSlot)}
                          disabled={isBooking}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-900/30"
                        >
                          <Zap className={`h-3.5 w-3.5 mr-1.5 ${isBooking ? 'animate-spin' : ''}`} />
                          {isBooking ? 'Securing Verified Slot...' : `Express Book ${selectedSlot} Slot`}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
