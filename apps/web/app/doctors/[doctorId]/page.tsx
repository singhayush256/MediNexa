'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Slot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface PublicDoctorDetail {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  specialty: string;
  specialtyId: string;
  facilityName: string;
  facilityCode: string;
  facilityAddress: string;
  facilityId: string;
  departmentName?: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  currency: string;
  languages: string[];
  bio: string;
  selectedDate: string;
  availableSlots: Slot[];
}

export default function PublicDoctorProfilePage() {
  const params = useParams();
  const doctorId = params?.doctorId as string;

  const [doctor, setDoctor] = useState<PublicDoctorDetail | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestAge, setGuestAge] = useState('30');
  const [guestGender, setGuestGender] = useState('MALE');
  const [bookingReason, setBookingReason] = useState('General health checkup and consultation');

  // OTP Verification State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Booking Confirmation Ticket State
  const [confirmationTicket, setConfirmationTicket] = useState<any | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    if (doctorId) {
      fetchDoctorDetail(selectedDate);
    }
  }, [doctorId, selectedDate]);

  const fetchDoctorDetail = async (dateStr: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/public/doctors/${doctorId}?date=${dateStr}`);
      if (!res.ok) throw new Error('Failed to load doctor profile');
      const data = await res.json();
      setDoctor(data);
    } catch (err: any) {
      setError(err.message || 'Doctor profile not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!guestPhone || guestPhone.trim().length < 8) {
      setModalError('Please enter a valid mobile phone number.');
      return;
    }
    setModalError('');
    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/public/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: guestPhone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');

      setOtpSent(true);
      setOtpMessage(data.message || 'OTP sent successfully');
      if (data.otp) {
        setOtpCode(data.otp); // Pre-fill in dev/test for convenience
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to dispatch OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setModalError('Please enter 6-digit OTP code.');
      return;
    }
    setModalError('');
    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/public/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: guestPhone.trim(), otp: otpCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP verification failed');

      setVerificationToken(data.verificationToken);
      // Auto-trigger appointment booking once verified
      await handleCompleteBooking(data.verificationToken);
    } catch (err: any) {
      setModalError(err.message || 'Verification failed');
      setIsSubmitting(false);
    }
  };

  const handleCompleteBooking = async (token: string) => {
    if (!doctor || !selectedSlot) return;
    try {
      const payload = {
        name: guestName,
        phone: guestPhone,
        email: guestEmail || undefined,
        age: Number(guestAge),
        gender: guestGender,
        doctorId: doctor.id,
        facilityId: doctor.facilityId,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason: bookingReason,
        verificationToken: token,
      };

      const res = await fetch(`${apiUrl}/public/appointments/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');

      setConfirmationTicket(data);
      setShowBookingModal(false);
    } catch (err: any) {
      setModalError(err.message || 'Failed to complete booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Public Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/doctors" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
              M
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">MediNexa</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                Doctor Profile
              </span>
            </div>
          </Link>

          <Link
            href="/doctors"
            className="text-xs font-bold text-sky-600 hover:underline flex items-center space-x-1"
          >
            <span>← Back to Doctor Directory</span>
          </Link>
        </div>
      </header>

      {/* Main Profile & Booking Content */}
      <main className="max-w-5xl mx-auto px-6 py-10 flex-1 w-full space-y-8">
        {loading ? (
          <div className="py-20 text-center text-slate-500 font-medium animate-pulse">
            Loading doctor profile & available slots...
          </div>
        ) : error || !doctor ? (
          <div className="bg-white p-12 rounded-2xl border border-red-200 text-center text-red-600">
            <h2 className="text-xl font-bold">Doctor Not Found</h2>
            <p className="text-sm mt-1">{error}</p>
            <Link
              href="/doctors"
              className="inline-block mt-4 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Return to Doctors List
            </Link>
          </div>
        ) : (
          <>
            {/* Doctor Profile Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row gap-8 items-start">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-sky-600 text-white flex items-center justify-center font-extrabold text-4xl shadow-lg flex-shrink-0">
                {doctor.firstName[0]}
                {doctor.lastName[0]}
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{doctor.name}</h1>
                    <p className="text-sm font-bold text-sky-600 mt-1">
                      {doctor.specialty} • {doctor.qualification}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-600">${doctor.consultationFee}</span>
                    <span className="text-xs text-slate-500 block font-semibold">per consultation</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{doctor.bio}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
                  <div>
                    <span className="block font-semibold text-slate-400 uppercase">Experience</span>
                    <span className="font-bold text-slate-800">{doctor.experienceYears}+ Years Active Practice</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-slate-400 uppercase">Hospital Campus</span>
                    <span className="font-bold text-slate-800">{doctor.facilityName}</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-slate-400 uppercase">Languages</span>
                    <span className="font-bold text-slate-800">{doctor.languages.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Slot Picker Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Select Consultation Date & Time</h2>
                  <p className="text-xs text-slate-500">Pick an available time slot for instant guest appointment reservation.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 shadow-sm"
                  />
                </div>
              </div>

              {/* Slots Grid */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">
                  Available Slots for {selectedDate} ({doctor.availableSlots.filter((s) => s.available).length})
                </h3>

                {doctor.availableSlots.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl text-xs text-slate-500">
                    No consultation slots generated for this date. Please select another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {doctor.availableSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center border ${
                          !slot.available
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                            : selectedSlot?.startTime === slot.startTime
                            ? 'bg-sky-600 border-sky-600 text-white shadow-md ring-2 ring-sky-400 ring-offset-1'
                            : 'bg-white border-slate-200 text-slate-800 hover:border-sky-500 hover:bg-sky-50'
                        }`}
                      >
                        <span>{slot.startTime}</span>
                        <span className="text-[10px] font-normal opacity-80">{slot.endTime}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Selection CTA */}
              {selectedSlot && (
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-sky-900 block">Selected Slot: {selectedDate} @ {selectedSlot.startTime} - {selectedSlot.endTime}</span>
                    <span className="text-[11px] text-sky-700">No pre-login required. Verification via SMS OTP.</span>
                  </div>
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    Proceed to Guest Booking →
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Guest Booking Modal */}
      {showBookingModal && doctor && selectedSlot && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Guest Appointment Booking</h3>
                <p className="text-xs text-slate-500">{doctor.name} • {selectedDate} @ {selectedSlot.startTime}</p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                {modalError}
              </div>
            )}

            {!otpSent ? (
              /* Step 1: Patient Demographics Form */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendOtp();
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Rivera"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 uppercase">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+1-800-555-9999"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 uppercase">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 uppercase">Age</label>
                    <input
                      type="number"
                      required
                      value={guestAge}
                      onChange={(e) => setGuestAge(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 uppercase">Gender</label>
                    <select
                      value={guestGender}
                      onChange={(e) => setGuestGender(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Reason for Consultation *</label>
                  <textarea
                    rows={2}
                    required
                    value={bookingReason}
                    onChange={(e) => setBookingReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  {isSubmitting ? 'Sending OTP...' : 'Send SMS Verification Code →'}
                </button>
              </form>
            ) : (
              /* Step 2: OTP Verification Form */
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl text-sky-800">
                  <p className="font-bold">{otpMessage}</p>
                  <p className="text-[11px] mt-0.5">Please enter the 6-digit code dispatched to <strong>{guestPhone}</strong>.</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">6-Digit Verification Code *</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-center font-mono font-extrabold text-lg tracking-widest"
                  />
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify OTP & Confirm Appointment ✓'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Ticket Modal */}
      {confirmationTicket && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl font-extrabold mx-auto shadow-md">
              ✓
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Appointment Confirmed!</h3>
              <p className="text-xs text-slate-500 mt-1">Your guest reservation has been logged into the hospital roster.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2 font-sans">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Booking Ticket #:</span>
                <span className="font-extrabold text-sky-600">{confirmationTicket.bookingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Patient Name:</span>
                <span className="font-bold text-slate-800">{confirmationTicket.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Doctor:</span>
                <span className="font-bold text-slate-800">{confirmationTicket.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Date & Time:</span>
                <span className="font-bold text-slate-800">{confirmationTicket.appointmentDate} @ {confirmationTicket.startTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Hospital:</span>
                <span className="font-bold text-slate-800">{confirmationTicket.facilityName}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setConfirmationTicket(null)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Close Confirmation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
