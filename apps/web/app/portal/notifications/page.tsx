'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PatientNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/patient-portal/notifications`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setNotifications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkRead = async (id: string) => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    await fetch(`${apiUrl}/patient-portal/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadData();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black uppercase rounded-full">
              NOTIFICATIONS
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Push Notification Center</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">In-app health alerts, appointment reminders, and diagnostic updates.</p>
        </div>
        <Link href="/portal" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
          ← Portal
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-4xl">🔔</div>
          <h3 className="font-extrabold text-sm text-slate-900">No New Notifications</h3>
          <p className="text-xs text-slate-500">You are all caught up with your clinical updates and alerts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-3xl border transition flex items-start justify-between gap-4 ${
                n.isRead ? 'bg-white border-slate-200' : 'bg-blue-50/50 border-blue-200 shadow-sm'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full uppercase">
                    {n.type}
                  </span>
                  <h3 className="font-extrabold text-xs text-slate-900">{n.title}</h3>
                </div>
                <p className="text-xs text-slate-600">{n.message}</p>
                <div className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleString()}</div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition shadow-sm"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
