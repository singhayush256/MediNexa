'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import Patient360Drawer from '@/components/Patient360Drawer';

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
  patient: { id: string; user: { firstName: string; lastName: string } };
}

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPatient360Id, setSelectedPatient360Id] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/auth/me').then((meRes) => {
      if (meRes.ok && meRes.data) {
        const role = meRes.data.roleCode || meRes.data.role?.code;
        if (role === 'PATIENT') {
          router.replace('/dashboard/appointments');
          return;
        }
      }
      fetchDoctorAppointments();
    });
  }, []);

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

  async function handleCompleteAppointment(id: string) {
    const res = await apiFetch(`/appointments/${id}/complete`, { method: 'POST' });
    if (res.ok) {
      fetchDoctorAppointments();
    } else {
      alert(res.message || 'Failed to complete appointment');
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Doctor Workstation...</div>;

  const queue = appointments.filter((a) => a.status === 'CHECKED_IN' || a.status === 'IN_PROGRESS' || a.status === 'CONFIRMED' || a.status === 'REQUESTED' || a.status === 'RESCHEDULED');
  const completed = appointments.filter((a) => a.status === 'COMPLETED');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Clinical Workstation & Queue</h1>
          <p className="text-gray-600">Manage checked-in patients, start encounters, review Patient 360, issue prescriptions & lab orders</p>
        </div>
        <Link href="/dashboard/clinical" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md text-sm shadow-sm">
          Open Clinical EHR Module ➔
        </Link>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">{error}</div>}

      {/* Active Patient Queue */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
          <span>Active Patient Queue</span>
          <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">{queue.length}</span>
        </h2>

        {queue.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No active patients currently in waiting queue.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-700 uppercase text-xs">
                  <th className="px-4 py-3">Appt #</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {queue.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{a.appointmentNumber}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {a.patient?.user?.firstName} {a.patient?.user?.lastName}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      📅 {new Date(a.appointmentDate).toLocaleDateString()} <br />
                      ⏰ {a.startTime} - {a.endTime}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-700">{a.type}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{a.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        a.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        a.status === 'RESCHEDULED' ? 'bg-purple-100 text-purple-800' :
                        a.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-800' :
                        a.status === 'IN_PROGRESS' ? 'bg-teal-100 text-teal-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {/* Patient 360 Drawer Button */}
                      <button
                        onClick={() => setSelectedPatient360Id(a.patientId || a.patient?.id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md border border-slate-300"
                        title="View Patient 360 History"
                      >
                        🔍 Patient 360
                      </button>

                      {(a.status === 'CONFIRMED' || a.status === 'REQUESTED' || a.status === 'RESCHEDULED') && (
                        <button
                          onClick={() => handleCheckIn(a.id)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-md"
                        >
                          Check-in
                        </button>
                      )}

                      {(a.status === 'CHECKED_IN' || a.status === 'CONFIRMED') && (
                        <button
                          onClick={() => handleStartConsultation(a.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md"
                        >
                          Start Encounter
                        </button>
                      )}

                      {a.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleCompleteAppointment(a.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-md"
                        >
                          Complete & Close
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

      {/* Completed Queue */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Completed Consultations ({completed.length})</h2>
        {completed.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No completed consultations yet.</p>
        ) : (
          <div className="space-y-2">
            {completed.map((a) => (
              <div key={a.id} className="p-3 bg-gray-50 rounded-md border border-gray-200 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-gray-900">{a.appointmentNumber}</span> — Patient: <span className="font-medium text-gray-900">{a.patient?.user?.firstName} {a.patient?.user?.lastName}</span> (📅 {new Date(a.appointmentDate).toLocaleDateString()} ⏰ {a.startTime})
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedPatient360Id(a.patientId || a.patient?.id)}
                    className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded"
                  >
                    🔍 Patient 360
                  </button>
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-700 font-semibold rounded">Completed</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-over Patient 360 Drawer */}
      <Patient360Drawer
        patientId={selectedPatient360Id}
        isOpen={!!selectedPatient360Id}
        onClose={() => setSelectedPatient360Id(null)}
      />
    </div>
  );
}
