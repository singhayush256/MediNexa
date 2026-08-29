'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PatientTelemedicinePage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/patient-portal/telemedicine`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setSessions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-black uppercase rounded-full">
              VIRTUAL CLINIC
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Telemedicine Video Consultations</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">Connect with licensed doctors for secure online video visits from home.</p>
        </div>
        <Link href="/portal" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
          ← Portal
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading virtual clinic sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="text-4xl">📹</div>
          <h3 className="font-extrabold text-sm text-slate-900">No Scheduled Video Consultations</h3>
          <p className="text-xs text-slate-500">Book an instant online video appointment with an on-call specialist.</p>
          <Link href="/doctors" className="inline-block px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow">
            Book Video Doctor →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((sess) => (
            <div key={sess.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Dr. {sess.doctor?.user?.firstName} {sess.doctor?.user?.lastName || 'Telehealth Physician'}
                  </h3>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full">
                    {sess.doctor?.specialty?.name || 'General Practice'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Scheduled: {new Date(sess.scheduledStartTime).toLocaleString()}
                </div>
                <div className="text-[11px] text-indigo-600 font-semibold">Room: {sess.roomName || 'telemed-room-active'}</div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${
                  sess.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {sess.status}
                </span>
                {sess.status !== 'COMPLETED' && (
                  <Link
                    href={`/dashboard/telemedicine/${sess.id}`}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow transition"
                  >
                    Join Video Room →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
