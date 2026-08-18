'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClinicalTimelineItemDto, PatientProfileDto } from '@medinexa/types';

export default function PatientMedicalRecordsPage() {
  const [timelineItems, setTimelineItems] = useState<ClinicalTimelineItemDto[]>([]);
  const [patient, setPatient] = useState<PatientProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`${apiUrl}/patients/me`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/patients/me/clinical-timeline`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([patData, timelineData]) => {
        setPatient(patData);
        setTimelineItems(Array.isArray(timelineData) ? timelineData : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [apiUrl]);

  const getItemBadgeClass = (itemType: string) => {
    switch (itemType) {
      case 'ENCOUNTER':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'CLINICAL_NOTE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'VITAL_SIGN':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'DIAGNOSIS':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'LAB_ORDER':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'LAB_RESULT':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'PRESCRIPTION':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold">M</div>
              <span className="text-lg font-extrabold text-slate-900">MediNexa</span>
            </div>

            <nav className="flex space-x-4">
              <Link href="/dashboard" className="text-sm text-slate-600 hover:text-sky-600 font-medium">Overview</Link>
              <Link href="/dashboard/medical-records" className="text-sm text-sky-600 font-bold border-b-2 border-sky-600 pb-1">My Medical Records</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Electronic Health Record</h1>
          <p className="text-sm text-slate-500 mt-1">
            Personal longitudinal clinical timeline, signed provider notes, vital sign history, and diagnoses
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 animate-pulse">
            Loading personal medical history...
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 text-red-900 rounded-2xl text-sm font-semibold">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Demographic Card */}
            {patient && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{patient.user?.firstName} {patient.user?.lastName}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    DOB: {new Date(patient.dateOfBirth).toLocaleDateString()} • Gender: {patient.gender} • Blood Group: {patient.bloodGroup || 'N/A'}
                  </p>
                </div>
                <div className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-full w-fit">
                  Patient Account Verified
                </div>
              </div>
            )}

            {/* Longitudinal Timeline */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">Clinical Timeline</h3>

              {timelineItems.length > 0 ? (
                <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 py-2">
                  {timelineItems.map((item) => (
                    <div key={item.id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-sky-600" />
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getItemBadgeClass(item.itemType)}`}>
                          {item.itemType}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 mt-1">{item.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{item.summary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic p-6 text-center">No clinical history records found on file.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
