'use client';

import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Check,
  Building2,
  Trash2,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  category:
    | 'Bed shortage'
    | 'Staff shortage'
    | 'Emergency'
    | 'Shift gap'
    | 'Queue congestion'
    | 'Transfer'
    | 'Discharge delay'
    | 'System alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function ManagerNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      category: 'Staff shortage',
      title: 'ICU Nursing Deployment Alert',
      message: '2 rostered staff reported sick leave for morning shift in ICU Ward 1.',
      timestamp: '15 mins ago',
      read: false,
    },
    {
      id: 'notif-2',
      category: 'Queue congestion',
      title: 'OPD Congestion Escalation',
      message: 'Cardiology clinic average consultation wait reached 38 minutes.',
      timestamp: '25 mins ago',
      read: false,
    },
    {
      id: 'notif-3',
      category: 'Bed shortage',
      title: 'HDU Ward Capacity at 85%',
      message: '5 of 6 High Dependency Unit beds currently occupied with 1 reserved.',
      timestamp: '1 hour ago',
      read: false,
    },
    {
      id: 'notif-4',
      category: 'Emergency',
      title: 'Inbound ALS Trauma Ambulance',
      message: 'Trauma Unit 1 en route with severe blunt trauma. ETA 6 mins.',
      timestamp: '1 hour ago',
      read: false,
    },
    {
      id: 'notif-5',
      category: 'Transfer',
      title: 'Inter-Ward Bed Transfer Logged',
      message: 'Patient Ananya Verma transferred from ICU-B02 to HDU-N04.',
      timestamp: '2 hours ago',
      read: true,
    },
    {
      id: 'notif-6',
      category: 'System alert',
      title: 'Central O2 Pressure Auto-Check',
      message: 'Telemetry confirmed nominal pressure at 4.2 bar.',
      timestamp: '3 hours ago',
      read: true,
    },
  ]);

  const [filterCat, setFilterCat] = useState('ALL');

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const filtered = notifications.filter((n) => {
    if (filterCat === 'ALL') return true;
    return n.category === filterCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Centralized Notification Engine</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Manager Operational Notifications
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Centralized notification feed for bed shortages, staffing gaps, queue spikes, and rapid emergencies.
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-md shadow-teal-600/20 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Check className="w-4 h-4" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          'ALL',
          'Staff shortage',
          'Queue congestion',
          'Bed shortage',
          'Emergency',
          'Transfer',
          'System alert',
        ].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterCat === cat
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {cat} (
            {cat === 'ALL'
              ? notifications.length
              : notifications.filter((n) => n.category === cat).length}
            )
          </button>
        ))}
      </div>

      {/* Notifications List conforming to Section 30 */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleRead(item.id)}
            className={`p-4 rounded-2xl border transition shadow-xs flex items-start justify-between gap-4 cursor-pointer ${
              item.read
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
                : 'bg-teal-50/40 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                  {item.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.timestamp}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">{item.message}</p>
            </div>

            <div className="shrink-0 pt-1">
              <span
                className={`w-2.5 h-2.5 rounded-full inline-block ${
                  item.read ? 'bg-transparent' : 'bg-teal-600'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
