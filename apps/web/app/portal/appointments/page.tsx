'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/patient-portal/appointments`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setAppointments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token || !feedbackModal) return;

    await fetch(`${apiUrl}/patient-portal/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        appointmentId: feedbackModal.id,
        doctorId: feedbackModal.doctorId,
        rating,
        comments,
      }),
    });

    setFeedbackModal(null);
    setComments('');
    loadData();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-black uppercase rounded-full">
              CONSULTATIONS
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Appointments & Visits</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">Timeline of your past consultations, upcoming visits, and doctor review ratings.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/doctors" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow transition">
            + Book New Appointment
          </Link>
          <Link href="/portal" className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
            ← Portal
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading appointments timeline...</div>
      ) : appointments.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="text-4xl">📅</div>
          <h3 className="font-extrabold text-sm text-slate-900">No Consultations Scheduled</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Book an in-person or video consultation with top medical specialists.</p>
          <Link href="/doctors" className="inline-block px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow">
            Find a Doctor →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-lg">
                  🩺
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900">
                      Dr. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName || 'Specialist'}
                    </h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full">
                      {apt.doctor?.specialty?.name || 'Cardiology'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.startTime} - {apt.endTime}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Hospital: {apt.facility?.name || 'MediNexa Hospital'} • Reason: {apt.reason || 'Routine consultation'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${
                  apt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {apt.status}
                </span>
                {apt.status === 'COMPLETED' && (
                  <button
                    onClick={() => setFeedbackModal(apt)}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl transition border border-amber-200"
                  >
                    ⭐ Review Doctor
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-base text-slate-900">
              Rate Dr. {feedbackModal.doctor?.user?.firstName} {feedbackModal.doctor?.user?.lastName}
            </h3>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Consultation Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl ${rating >= star ? 'text-amber-400' : 'text-slate-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Consultation Experience & Feedback</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  placeholder="The doctor was very attentive and explained the treatment plan clearly..."
                  className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow"
                >
                  Submit Review →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
