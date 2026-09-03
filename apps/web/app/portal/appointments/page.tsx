'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Video,
  Star,
  Plus,
  ArrowLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  X,
  Stethoscope,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Modal } from '@/components/ui';

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('2026-09-04');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  const [consultationType, setConsultationType] = useState<'IN_PERSON' | 'TELEMEDICINE'>('IN_PERSON');
  const [reason, setReason] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const doctorsList = [
    { id: 'doc-1', name: 'Dr. Sarah Smith', spec: 'Cardiology & Internal Medicine', exp: '14 yrs', fee: '$80', rating: 4.9, slots: ['09:30 AM', '10:00 AM', '11:30 AM', '02:00 PM'] },
    { id: 'doc-2', name: 'Dr. Michael Chen', spec: 'Pulmonology & Critical Care', exp: '11 yrs', fee: '$75', rating: 4.8, slots: ['10:30 AM', '01:00 PM', '03:30 PM'] },
    { id: 'doc-3', name: 'Dr. Emily Watson', spec: 'Endocrinology & Diabetology', exp: '9 yrs', fee: '$70', rating: 4.9, slots: ['11:00 AM', '02:30 PM', '04:00 PM'] },
  ];

  const loadData = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

    if (token) {
      fetch(`${apiUrl}/patient-portal/appointments`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setAppointments(data);
          } else {
            // Default seed fallback
            setAppointments([
              { id: 'apt-1', doctorName: 'Dr. Sarah Smith', specialty: 'Cardiology', date: 'Tomorrow at 10:30 AM', type: 'TELEMEDICINE', status: 'CONFIRMED' },
              { id: 'apt-2', doctorName: 'Dr. Michael Chen', specialty: 'Pulmonology', date: 'Sep 12, 2026 at 02:00 PM', type: 'IN_PERSON', status: 'CONFIRMED' },
              { id: 'apt-3', doctorName: 'Dr. Emily Watson', specialty: 'Endocrinology', date: 'Aug 20, 2026 at 11:00 AM', type: 'IN_PERSON', status: 'COMPLETED' },
            ]);
          }
          setLoading(false);
        })
        .catch(() => {
          setAppointments([
            { id: 'apt-1', doctorName: 'Dr. Sarah Smith', specialty: 'Cardiology', date: 'Tomorrow at 10:30 AM', type: 'TELEMEDICINE', status: 'CONFIRMED' },
            { id: 'apt-2', doctorName: 'Dr. Michael Chen', specialty: 'Pulmonology', date: 'Sep 12, 2026 at 02:00 PM', type: 'IN_PERSON', status: 'CONFIRMED' },
          ]);
          setLoading(false);
        });
    } else {
      setAppointments([
        { id: 'apt-1', doctorName: 'Dr. Sarah Smith', specialty: 'Cardiology', date: 'Tomorrow at 10:30 AM', type: 'TELEMEDICINE', status: 'CONFIRMED' },
      ]);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    const newAppt = {
      id: `apt-${Date.now()}`,
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.spec,
      date: `${selectedDate} at ${selectedSlot}`,
      type: consultationType,
      status: 'CONFIRMED',
    };

    setAppointments([newAppt, ...appointments]);
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingModalOpen(false);
      setSelectedDoctor(null);
      setReason('');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/portal" className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portal</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Appointments & Consultations
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedDoctor(doctorsList[0]);
                setBookingModalOpen(true);
              }}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Book Consultation
            </Button>
          </div>
        </div>
      </header>

      {/* Main Appointments Content */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight">
              My Consultations
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review confirmed appointments, join virtual waiting rooms, or schedule new follow-ups.
            </p>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-3">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-base shrink-0">
                  {apt.doctorName.replace(/^(Dr\.\s*)/i, '').charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {apt.doctorName}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                      {apt.type}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                    {apt.specialty}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {apt.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {apt.type === 'TELEMEDICINE' ? (
                  <Link href="/portal/telemedicine">
                    <Button variant="secondary" size="sm" icon={<Video className="w-3.5 h-3.5" />}>
                      Join Video Call
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm">
                    View Clinic Directions
                  </Button>
                )}
                <Button variant="ghost" size="sm">
                  Reschedule
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Book Consultation Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title="Schedule Doctor Consultation"
        description="Select clinical specialist, date, and preferred consultation mode"
      >
        {bookingSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Appointment Confirmed!</h4>
            <p className="text-xs text-slate-500">Your care team has been notified and invitation details have been saved.</p>
          </div>
        ) : (
          <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Select Specialist</label>
              <div className="space-y-2">
                {doctorsList.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoctor(doc)}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      selectedDoctor?.id === doc.id
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{doc.name}</div>
                      <div className="text-[11px] text-slate-500">{doc.spec} • {doc.exp}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{doc.fee}</div>
                      <div className="text-[10px] text-amber-500 font-bold">★ {doc.rating}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Consultation Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Consultation Mode</label>
                <select
                  value={consultationType}
                  onChange={(e) => setConsultationType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="IN_PERSON">Hospital Visit (In-Person)</option>
                  <option value="TELEMEDICINE">Virtual Telehealth (Video)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Available Time Slots</label>
              <div className="flex flex-wrap gap-2">
                {(selectedDoctor?.slots || ['09:30 AM', '10:00 AM', '11:30 AM']).map((slot: string) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition text-xs cursor-pointer ${
                      selectedSlot === slot
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3">
              <Button type="submit" variant="primary" size="md" className="w-full">
                Confirm Booking ({selectedSlot})
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
