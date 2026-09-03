'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, X, AlertTriangle, Info, Calendar, FlaskConical } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category?: 'CLINICAL' | 'APPOINTMENT' | 'ALERT' | 'SYSTEM';
}

export function NotificationCenter({
  className = '',
}: {
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Emergency Triage Alert',
      message: 'Trauma patient admitted to Bay 4 - SIRS score 3.',
      timestamp: '2m ago',
      read: false,
      category: 'ALERT',
    },
    {
      id: '2',
      title: 'Lab Results Verified',
      message: 'Comprehensive Metabolic Panel ready for review.',
      timestamp: '15m ago',
      read: false,
      category: 'CLINICAL',
    },
    {
      id: '3',
      title: 'Telehealth Consultation',
      message: 'Upcoming session with Jane Doe in 30 minutes.',
      timestamp: '1h ago',
      read: true,
      category: 'APPOINTMENT',
    },
    {
      id: '4',
      title: 'Formulary Inventory Warning',
      message: 'Ceftriaxone 1g stock dropped below threshold (12 vials left).',
      timestamp: '3h ago',
      read: true,
      category: 'ALERT',
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const markOneRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const filtered = notifications.filter((n) => (filter === 'UNREAD' ? !n.read : true));

  return (
    <div className={`relative ${className}`}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-150">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Hospital Notifications
                </h4>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs">
              <button
                onClick={() => setFilter('ALL')}
                className={`flex-1 py-2 text-center font-bold text-[11px] transition ${
                  filter === 'ALL'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('UNREAD')}
                className={`flex-1 py-2 text-center font-bold text-[11px] transition ${
                  filter === 'UNREAD'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No notifications to display.
                </div>
              ) : (
                filtered.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => markOneRead(item.id)}
                    className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex items-start gap-3 cursor-pointer ${
                      !item.read ? 'bg-blue-50/30 dark:bg-blue-950/15' : ''
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        item.category === 'ALERT'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-500'
                          : item.category === 'CLINICAL'
                          ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-500'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-500'
                      }`}
                    >
                      {item.category === 'ALERT' ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : item.category === 'CLINICAL' ? (
                        <FlaskConical className="w-3.5 h-3.5" />
                      ) : (
                        <Calendar className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {item.title}
                        </h5>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {item.message}
                      </p>
                    </div>

                    {!item.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
