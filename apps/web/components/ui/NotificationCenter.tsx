'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  X,
  AlertTriangle,
  Info,
  Calendar,
  FlaskConical,
  Bed,
  Pill,
  CreditCard,
  Siren,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp?: string;
  createdAt?: string;
  read: boolean;
  isRead?: boolean;
  entityType?: string | null;
  entityId?: string | null;
  category?: 'CLINICAL' | 'APPOINTMENT' | 'ALERT' | 'SYSTEM' | 'ADMISSION' | 'BILLING';
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Just now';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return dateStr;
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function resolveNotificationCategory(type?: string): NotificationItem['category'] {
  if (!type) return 'SYSTEM';
  const upper = type.toUpperCase();
  if (upper.includes('EMERGENCY') || upper.includes('ALERT') || upper.includes('CRITICAL')) return 'ALERT';
  if (upper.includes('BED') || upper.includes('ADMISSION') || upper.includes('DISCHARGE') || upper.includes('TRANSFER')) return 'ADMISSION';
  if (upper.includes('LAB') || upper.includes('CLINICAL') || upper.includes('VITALS')) return 'CLINICAL';
  if (upper.includes('APPOINTMENT') || upper.includes('QUEUE') || upper.includes('CONSULTATION')) return 'APPOINTMENT';
  if (upper.includes('BILLING') || upper.includes('INVOICE') || upper.includes('PAYMENT')) return 'BILLING';
  return 'SYSTEM';
}

export function NotificationCenter({
  className = '',
}: {
  className?: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

  const fetchNotifications = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: NotificationItem[] = data.map((item: any) => ({
            id: item.id,
            type: item.type,
            title: item.title,
            message: item.message,
            timestamp: formatRelativeTime(item.createdAt),
            createdAt: item.createdAt,
            read: item.isRead || item.read || Boolean(item.readAt),
            isRead: item.isRead || item.read || Boolean(item.readAt),
            entityType: item.entityType,
            entityId: item.entityId,
            category: resolveNotificationCategory(item.type),
          }));
          setNotifications(mapped);
        }
      }
    } catch (err) {
      console.warn('Failed to load notifications from backend:', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Connect to live WebSocket /events namespace for real-time notification push
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let socket: Socket | null = null;
    try {
      const userRaw = localStorage.getItem('medinexa_user');
      const user = userRaw ? JSON.parse(userRaw) : null;
      const facilityId = user?.facilityId || user?.facility?.id || '';
      const userId = user?.id || '';

      socket = io(`${wsUrl}/events`, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        query: { facilityId, userId },
      });

      socket.on('connect', () => {
        if (facilityId) socket?.emit('join_facility', { facilityId });
        if (userId) socket?.emit('join_user', { userId });
      });

      socket.on('notification.created', (notif: any) => {
        setNotifications((prev) => {
          if (prev.some((n) => n.id === notif.id)) return prev;
          const newItem: NotificationItem = {
            id: notif.id || `notif-${Date.now()}`,
            type: notif.type || 'SYSTEM',
            title: notif.title || 'New Notification',
            message: notif.message || '',
            timestamp: 'Just now',
            createdAt: notif.createdAt || new Date().toISOString(),
            read: false,
            isRead: false,
            entityType: notif.entityType,
            entityId: notif.entityId,
            category: resolveNotificationCategory(notif.type),
          };
          return [newItem, ...prev];
        });
      });

      socket.on('bed.transfer.completed', (data: any) => {
        setNotifications((prev) => {
          const transferNotif: NotificationItem = {
            id: `transfer-${Date.now()}`,
            type: 'BED_TRANSFERRED',
            title: 'Bed Transfer Completed',
            message: `Patient transferred: Bed ${data.fromBedNumber || 'Source'} → Bed ${data.toBedNumber || 'Target'}${data.toWardName ? ` (${data.toWardName})` : ''}.`,
            timestamp: 'Just now',
            createdAt: new Date().toISOString(),
            read: false,
            isRead: false,
            entityType: 'ADMISSION',
            entityId: data.admissionId,
            category: 'ADMISSION',
          };
          return [transferNotif, ...prev];
        });
      });
    } catch (err) {
      console.warn('Real-time notification socket listener failed:', err);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [wsUrl]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;
    if (token) {
      try {
        await fetch(`${apiUrl}/notifications/read-all`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn('Failed to mark all notifications read:', err);
      }
    }
  };

  const markOneRead = async (item: NotificationItem) => {
    if (!item.read) {
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true, isRead: true } : n)));
      const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;
      if (token) {
        try {
          await fetch(`${apiUrl}/notifications/${item.id}/read`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (err) {
          console.warn('Failed to mark notification read:', err);
        }
      }
    }

    // Action Navigation based on related resource
    if (item.entityType === 'ADMISSION' || item.category === 'ADMISSION') {
      const isPortal = typeof window !== 'undefined' && window.location.pathname.startsWith('/portal');
      if (isPortal) {
        router.push('/portal/admissions');
      } else {
        router.push('/dashboard/reception?tab=history');
      }
      setIsOpen(false);
    } else if (item.entityType === 'APPOINTMENT' || item.category === 'APPOINTMENT') {
      const isPortal = typeof window !== 'undefined' && window.location.pathname.startsWith('/portal');
      if (isPortal) {
        router.push('/portal/appointments');
      } else {
        router.push('/dashboard/reception?tab=overview');
      }
      setIsOpen(false);
    } else if (item.entityType === 'LAB_ORDER' || item.category === 'CLINICAL') {
      const isPortal = typeof window !== 'undefined' && window.location.pathname.startsWith('/portal');
      if (isPortal) {
        router.push('/portal/lab-reports');
      } else {
        router.push('/dashboard/lab');
      }
      setIsOpen(false);
    } else if (item.entityType === 'PRESCRIPTION') {
      const isPortal = typeof window !== 'undefined' && window.location.pathname.startsWith('/portal');
      if (isPortal) {
        router.push('/portal/prescriptions');
      } else {
        router.push('/dashboard/pharmacy');
      }
      setIsOpen(false);
    } else if (item.entityType === 'INVOICE' || item.category === 'BILLING') {
      const isPortal = typeof window !== 'undefined' && window.location.pathname.startsWith('/portal');
      if (isPortal) {
        router.push('/portal/billing');
      } else {
        router.push('/dashboard/billing');
      }
      setIsOpen(false);
    }
  };

  const filtered = notifications.filter((n) => (filter === 'UNREAD' ? !n.read : true));

  const renderIcon = (cat?: NotificationItem['category']) => {
    switch (cat) {
      case 'ALERT':
        return <Siren className="w-3.5 h-3.5" />;
      case 'ADMISSION':
        return <Bed className="w-3.5 h-3.5" />;
      case 'CLINICAL':
        return <FlaskConical className="w-3.5 h-3.5" />;
      case 'APPOINTMENT':
        return <Calendar className="w-3.5 h-3.5" />;
      case 'BILLING':
        return <CreditCard className="w-3.5 h-3.5" />;
      default:
        return <Info className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
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

          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Notification Center
                </h4>
                {unreadCount > 0 ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                    {unreadCount} unread
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    All caught up
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10 text-xs">
              <button
                onClick={() => setFilter('ALL')}
                className={`flex-1 py-2 text-center font-bold text-[11px] transition cursor-pointer ${
                  filter === 'ALL'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-slate-900'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('UNREAD')}
                className={`flex-1 py-2 text-center font-bold text-[11px] transition cursor-pointer ${
                  filter === 'UNREAD'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-slate-900'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
                  Syncing live notifications...
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  {filter === 'UNREAD' ? 'No unread notifications.' : 'No notifications to display.'}
                </div>
              ) : (
                filtered.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => markOneRead(item)}
                    className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex items-start gap-3 cursor-pointer group ${
                      !item.read ? 'bg-blue-50/20 dark:bg-blue-950/15' : ''
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        item.category === 'ALERT'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-500'
                          : item.category === 'ADMISSION'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500'
                          : item.category === 'CLINICAL'
                          ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-500'
                          : item.category === 'BILLING'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-500'
                      }`}
                    >
                      {renderIcon(item.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className={`text-xs truncate ${!item.read ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                          {item.title}
                        </h5>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {item.timestamp || formatRelativeTime(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
                        {item.message}
                      </p>
                      {item.entityType && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                          <span>View {item.entityType.toLowerCase()}</span>
                          <ChevronRight className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 mt-2 shadow-xs" />
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
