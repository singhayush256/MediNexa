'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Bell,
  BellRing,
  CheckCircle2,
  Calendar,
  Pill,
  FlaskConical,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Volume2,
  Check,
  Send,
  Trash2,
} from 'lucide-react';
import { Card } from '@/components/ui';
import { browserNotifications } from '@/lib/browser-notifications';

export default function PatientNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [testSent, setTestSent] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = useCallback(async () => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('medinexa_token') || localStorage.getItem('token')
        : null;

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn('Failed to fetch notifications:', e);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadData();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, [loadData]);

  const handleEnablePush = async () => {
    const perm = await browserNotifications.requestPermission();
    setPushPermission(perm);
    if (perm === 'granted') {
      browserNotifications.sendNotification({
        title: '🔔 MediNexa Push Notifications Active',
        body: 'You will now receive instant push alerts for scheduled medicines and appointments.',
      });
      setTestSent('Push notifications enabled successfully!');
      setTimeout(() => setTestSent(null), 4000);
    }
  };

  const handleSendTestMedicineAlert = () => {
    browserNotifications.notifyMedicineTime('Metformin HCl', '500 mg', 'Morning');
    setTestSent('Dispatched test medicine reminder push alert!');
    setTimeout(() => setTestSent(null), 4000);
  };

  const handleSendTestAppointmentAlert = () => {
    browserNotifications.notifyUpcomingAppointment('Dr. Rajesh Sharma', 'Tomorrow at 10:30 AM', 'Cardiology');
    setTestSent('Dispatched test appointment alert!');
    setTimeout(() => setTestSent(null), 4000);
  };

  const handleSendTestMissedAlert = () => {
    browserNotifications.notifyMissedDose('Atorvastatin', '02:00 PM');
    setTestSent('Dispatched test missed dose alert!');
    setTimeout(() => setTestSent(null), 4000);
  };

  const handleMarkRead = async (id: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    if (!token) return;

    try {
      await fetch(`${apiUrl}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    if (!token) return;

    try {
      await fetch(`${apiUrl}/notifications/read-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('MEDICATION')) {
      return <Pill className="w-5 h-5 text-rose-500" />;
    }
    if (type.includes('APPOINTMENT')) {
      return <Calendar className="w-5 h-5 text-blue-500" />;
    }
    if (type.includes('LAB')) {
      return <FlaskConical className="w-5 h-5 text-teal-500" />;
    }
    return <Bell className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BellRing className="w-4 h-4 animate-bounce" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              PATIENT HEALTH ALERTS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Notifications & Browser Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time push notifications for scheduled medicine times, missed dose warnings, and doctor visits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              Mark All Read
            </button>
          )}
          <Link
            href="/portal"
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Portal</span>
          </Link>
        </div>
      </div>

      {/* Browser Push Permission Banner */}
      <Card className="p-5 border-teal-500/30 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-blue-500/10 dark:from-teal-950/20 dark:to-blue-950/20 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Browser Push Notifications
                </h3>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  pushPermission === 'granted'
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                }`}>
                  {pushPermission === 'granted' ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Receive instant popups on your device when it's time to take medicine or if a dose was missed.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {pushPermission !== 'granted' && (
              <button
                onClick={handleEnablePush}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 transition cursor-pointer"
              >
                Enable Push Alerts
              </button>
            )}

            {/* Test Trigger Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSendTestMedicineAlert}
                title="Trigger Medicine Time Notification"
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-rose-500 text-rose-600 dark:text-rose-400 text-xs font-bold shadow-sm transition cursor-pointer flex items-center gap-1"
              >
                <Pill className="w-3.5 h-3.5" />
                <span>Test Dose Alert</span>
              </button>

              <button
                onClick={handleSendTestMissedAlert}
                title="Trigger Missed Dose Alert"
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-sm transition cursor-pointer flex items-center gap-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Test Missed Alert</span>
              </button>

              <button
                onClick={handleSendTestAppointmentAlert}
                title="Trigger Appointment Alert"
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-blue-600 dark:text-blue-400 text-xs font-bold shadow-sm transition cursor-pointer flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Test Appt Alert</span>
              </button>
            </div>
          </div>
        </div>

        {testSent && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{testSent}</span>
          </div>
        )}
      </Card>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs animate-pulse">
          Syncing patient notification archive...
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Bell className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
            No New Notifications
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            You are completely caught up with your clinical updates, medicine alerts, and appointments.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`p-5 transition-all duration-200 flex items-start justify-between gap-4 border-slate-200 dark:border-slate-800 ${
                n.isRead
                  ? 'opacity-80'
                  : 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-300/40 dark:border-blue-800/40 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  {getNotificationIcon(n.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-md uppercase tracking-wider">
                      {n.type}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {n.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition shadow-sm shrink-0 cursor-pointer"
                >
                  Mark as Read
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
