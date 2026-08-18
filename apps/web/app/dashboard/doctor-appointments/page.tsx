'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
  patient: { user: { firstName: string; lastName: string } };
}

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  async function fetchDoctorAppointments() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/doctors/me/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAppointments(await res.json());
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to load doctor queue');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartConsultation(id: string) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/appointments/${id}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchDoctorAppointments();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to start consultation');
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleCompleteAppointment(id: string) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/appointments/${id}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchDoctorAppointments();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to complete appointment');
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Doctor Workstation...</div>;

  const queue = appointments.filter((a) => a.status === 'CHECKED_IN' || a.status === 'IN_PROGRESS' || a.status === 'CONFIRMED');
  const completed = appointments.filter((a) => a.status === 'COMPLETED');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Clinical Workstation & Queue</h1>
          <p className="text-gray-600">Manage checked-in patients, start encounters, issue prescriptions and labs</p>
        </div>
        <Link href="/dashboard/clinical" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md text-sm">
          Open Clinical EHR Module ➔
        </Link>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">{error}</div>}

      {/* Active Patient Queue */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
          <span>Active Waiting Queue</span>
          <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">{queue.length}</span>
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
                  <th className="px-4 py-3">Time</th>
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
                    <td className="px-4 py-3 font-medium text-gray-900">{a.patient?.user?.firstName} {a.patient?.user?.lastName}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{a.startTime} - {a.endTime}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-700">{a.type}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{a.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        a.status === 'CHECKED_IN' ? 'bg-purple-100 text-purple-800' :
                        a.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {a.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => handleStartConsultation(a.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md"
                        >
                          Start Consultation
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
        <h2 className="text-xl font-bold text-gray-800">Completed Consultations Today ({completed.length})</h2>
        {completed.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No completed consultations yet today.</p>
        ) : (
          <div className="space-y-2">
            {completed.map((a) => (
              <div key={a.id} className="p-3 bg-gray-50 rounded-md border border-gray-200 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-gray-900">{a.appointmentNumber}</span> — Patient: <span className="font-medium text-gray-900">{a.patient?.user?.firstName} {a.patient?.user?.lastName}</span> ({a.startTime})
                </div>
                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 font-semibold rounded">Completed</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
