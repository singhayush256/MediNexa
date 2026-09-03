'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import Patient360Drawer from '@/components/Patient360Drawer';
import { CheckCircle2, XCircle, Clock, Calendar, AlertCircle, X, Stethoscope, User, FileText } from 'lucide-react';

interface Appointment {
  id: string;
  appointmentNumber: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  reason: string;
  encounterId?: string;
  patientId: string;
  patient: { id: string; user: { firstName: string; lastName: string; phone?: string; email?: string } };
}

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPatient360Id, setSelectedPatient360Id] = useState<string | null>(null);

  // Reject Modal State
  const [rejectModalAppt, setRejectModalAppt] = useState<Appointment | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  useEffect(() => {
    apiFetch('/auth/me').then((meRes) => {
      if (meRes.ok && meRes.data) {
        const role = meRes.data.roleCode || meRes.data.role?.code;
        if (role === 'PATIENT') {
          router.replace('/portal/appointments');
          return;
        }
      }
      fetchDoctorAppointments();
    });
  }, [router]);

  async function fetchDoctorAppointments() {
    setLoading(true);
    setError('');
    const res = await apiFetch<Appointment[]>('/doctors/me/appointments');
    if (res.ok && res.data) {
      setAppointments(res.data);
    } else {
      setError(res.message || 'Failed to load doctor Queue');
    }
    setLoading(false);
  }

  // Doctor Action: Accept Appointment
  async function handleAcceptAppointment(id: string) {
    const res = await apiFetch(`/appointments/${id}/accept`, { method: 'POST' });
    if (res.ok) {
      fetchDoctorAppointments();
    } else {
      alert(res.message || 'Failed to accept appointment');
    }
  }

  // Doctor Action: Reject Appointment
  async function handleRejectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectModalAppt) return;
    setRejectLoading(true);

    const res = await apiFetch(`/appointments/${rejectModalAppt.id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason: rejectReason.trim() || 'Doctor unavailable at requested time' }),
    });

    if (res.ok) {
      setRejectModalAppt(null);
      setRejectReason('');
      fetchDoctorAppointments();
    } else {
      alert(res.message || 'Failed to reject appointment');
    }
    setRejectLoading(false);
  }

  // Doctor Action: Complete Appointment
  async function handleCompleteAppointment(id: string) {
    const res = await apiFetch(`/appointments/${id}/complete`, { method: 'POST' });
    if (res.ok) {
      fetchDoctorAppointments();
    } else {
      alert(res.message || 'Failed to complete appointment');
    }
  }

  async function handleCheckIn(id: string) {
    const res = await apiFetch(`/appointments/${id}/check-in`, { method: 'POST' });
    if (res.ok) {
      fetchDoctorAppointments();
    } else {
      alert(res.message || 'Failed to check-in appointment');
    }
  }

  async function handleStartConsultation(id: string) {
    const res = await apiFetch(`/appointments/${id}/start`, { method: 'POST' });
    if (res.ok) {
      fetchDoctorAppointments();
    } else {
      alert(res.message || 'Failed to start consultation');
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Doctor Workstation...</div>;

  const requestedAppts = appointments.filter((a) => a.status === 'REQUESTED');
  const activeQueue = appointments.filter((a) =>
    ['CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'RESCHEDULED'].includes(a.status),
  );
  const completedAppts = appointments.filter((a) =>
    ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(a.status),
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Doctor Clinical Workstation & Appointments
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Accept or decline incoming consultation requests, manage active queue, and complete patient encounters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchDoctorAppointments()}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <span>Refresh</span>
          </button>
          <Link
            href="/dashboard/clinical"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm shadow-blue-600/20 transition flex items-center gap-1.5"
          >
            <span>Open Clinical EHR</span>
            <span>➔</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded-2xl border border-rose-200 dark:border-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* 1. Pending Consultation Requests */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Pending Appointment Requests</span>
            <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {requestedAppts.length}
            </span>
          </h2>
        </div>

        {requestedAppts.length === 0 ? (
          <p className="text-slate-400 text-xs py-4">No pending patient appointment requests awaiting confirmation.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold">
                  <th className="px-4 py-3">Appt #</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Requested Slot</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3 text-right">Decision Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {requestedAppts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{a.appointmentNumber}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {a.patient?.user?.firstName} {a.patient?.user?.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      📅 {new Date(a.appointmentDate).toLocaleDateString()} at {a.startTime}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{a.type}</td>
                    <td className="px-4 py-3 text-slate-500 italic max-w-xs truncate">{a.reason}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleAcceptAppointment(a.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm shadow-emerald-600/20"
                      >
                        ✓ Accept Appointment
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectModalAppt(a)}
                        className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 font-bold rounded-xl text-xs cursor-pointer border border-rose-200 dark:border-rose-800"
                      >
                        ✕ Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. Active Consultation Queue */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>Active OPD Consultation Queue</span>
          <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
            {activeQueue.length}
          </span>
        </h2>

        {activeQueue.length === 0 ? (
          <p className="text-slate-400 text-xs py-4">No active patients currently in waiting queue.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold">
                  <th className="px-4 py-3">Appt #</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Clinical Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeQueue.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{a.appointmentNumber}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {a.patient?.user?.firstName} {a.patient?.user?.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      📅 {new Date(a.appointmentDate).toLocaleDateString()} • {a.startTime}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{a.type}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        a.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        a.status === 'RESCHEDULED' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        a.status === 'CHECKED_IN' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' :
                        a.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPatient360Id(a.patientId || a.patient?.id)}
                        className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        Patient 360
                      </button>

                      {a.status === 'CONFIRMED' && (
                        <button
                          type="button"
                          onClick={() => handleCheckIn(a.id)}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Check-in
                        </button>
                      )}

                      {(a.status === 'CHECKED_IN' || a.status === 'CONFIRMED') && (
                        <button
                          type="button"
                          onClick={() => handleStartConsultation(a.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Start Consultation
                        </button>
                      )}

                      {/* Doctor Action: Complete Appointment */}
                      {(a.status === 'IN_PROGRESS' || a.status === 'CHECKED_IN' || a.status === 'CONFIRMED') && (
                        <button
                          type="button"
                          onClick={() => handleCompleteAppointment(a.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm shadow-emerald-600/20"
                        >
                          ✓ Complete Appointment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Completed & Past Appointments */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Completed Consultations & History</span>
          <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
            {completedAppts.length}
          </span>
        </h2>

        {completedAppts.length === 0 ? (
          <p className="text-slate-400 text-xs py-4">No completed appointments recorded today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold">
                  <th className="px-4 py-3">Appt #</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {completedAppts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 opacity-80">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{a.appointmentNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {a.patient?.user?.firstName} {a.patient?.user?.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      📅 {new Date(a.appointmentDate).toLocaleDateString()} at {a.startTime}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{a.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        a.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Appointment Modal */}
      {rejectModalAppt && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-950 dark:text-white">
                  Decline Consultation Request
                </h3>
                <p className="text-xs text-slate-500">
                  {rejectModalAppt.appointmentNumber} • Patient: {rejectModalAppt.patient?.user?.firstName} {rejectModalAppt.patient?.user?.lastName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalAppt(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Please state the reason for declining this request. A notification will be dispatched to the patient to reschedule with another slot or physician.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Decline Reason
                </label>
                <input
                  type="text"
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Schedule full, emergency surgery scheduled..."
                  className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalAppt(null)}
                  className="flex-1 py-2 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={rejectLoading}
                  className="flex-1 py-2 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition cursor-pointer"
                >
                  {rejectLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient 360 Drawer */}
      {selectedPatient360Id && (
        <Patient360Drawer
          patientId={selectedPatient360Id}
          isOpen={Boolean(selectedPatient360Id)}
          onClose={() => setSelectedPatient360Id(null)}
        />
      )}
    </div>
  );
}
