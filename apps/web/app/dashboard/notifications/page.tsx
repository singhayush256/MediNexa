'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api-client';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  readAt?: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    setError('');
    const res = await apiFetch<Notification[]>('/notifications');
    if (res.ok && res.data) {
      setNotifications(res.data);
    } else {
      setError(res.message || 'Unable to load notifications.');
    }
    setLoading(false);
  }

  async function handleMarkRead(id: string) {
    const res = await apiFetch(`/notifications/${id}/read`, { method: 'POST' });
    if (res.ok) {
      fetchNotifications();
    }
  }

  async function handleMarkAllRead() {
    const res = await apiFetch('/notifications/read-all', { method: 'POST' });
    if (res.ok) {
      fetchNotifications();
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading Notification Center...
      </div>
    );
  }

  const filtered = filter === 'UNREAD' ? notifications.filter((n) => !n.readAt) : notifications;
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center space-x-3">
            <span>In-App Notification Center</span>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="text-slate-600">
            Real-time alerts for appointments, medication reminders, emergencies, referrals, labs, and system events
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setFilter('ALL')}
          className={`pb-2 px-4 text-sm font-semibold border-b-2 transition-colors ${
            filter === 'ALL'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`pb-2 px-4 text-sm font-semibold border-b-2 transition-colors ${
            filter === 'UNREAD'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-200">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 italic">No notifications to display.</div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex justify-between items-start space-x-4 transition-colors ${
                !n.readAt ? 'bg-sky-50/50 font-medium' : 'bg-white'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-sm">{n.title}</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      n.type === 'MEDICATION_REMINDER'
                        ? 'bg-purple-100 text-purple-800'
                        : n.type.startsWith('APPOINTMENT')
                        ? 'bg-blue-100 text-blue-800'
                        : n.type.startsWith('EMERGENCY')
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {n.type}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{n.message}</p>
                <p className="text-xs text-slate-400">🕒 {new Date(n.createdAt).toLocaleString()}</p>
              </div>

              {!n.readAt && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
