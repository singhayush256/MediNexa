'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bed,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Phone,
  ShieldCheck,
  MapPin,
  Plus,
  ArrowLeft,
  Filter,
  Search,
  Hourglass,
} from 'lucide-react';
import { BedBookingDto, BedBookingStatus, BedType } from '@medinexa/types';
import { apiFetch } from '@/lib/api-client';
import { MediNexaLogo } from '@/components/brand/MediNexaLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function PatientBedBookingsHistoryPage() {
  const [bookings, setBookings] = useState<BedBookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const loadMyBookings = async () => {
    try {
      const res = await apiFetch<BedBookingDto[]>('/bed-bookings/my');
      if (res.ok && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Error loading patient bed reservations', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMyBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this bed reservation?')) return;
    setActionLoadingId(bookingId);
    try {
      const res = await apiFetch(`/bed-bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: BedBookingStatus.CANCELLED,
          notes: 'Cancelled by patient from citizen portal',
        }),
      });
      if (res.ok) {
        setFeedbackMsg({ type: 'info', text: 'Reservation cancelled successfully.' });
        await loadMyBookings();
      } else {
        setFeedbackMsg({ type: 'error', text: res.message || 'Failed to cancel reservation.' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Network error cancelling reservation.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesSearch =
      search === '' ||
      b.bookingNumber?.toLowerCase().includes(search.toLowerCase()) ||
      b.facility?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.bedType?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: BedBookingStatus, expiresAt?: string | null) => {
    switch (status) {
      case BedBookingStatus.APPROVED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Allocated
          </span>
        );
      case BedBookingStatus.PENDING:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5 animate-spin" /> Pending Review
          </span>
        );
      case BedBookingStatus.ADMITTED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
            <Bed className="w-3.5 h-3.5" /> Admitted Inpatient
          </span>
        );
      case BedBookingStatus.EXPIRED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <Hourglass className="w-3.5 h-3.5" /> Hold Expired
          </span>
        );
      case BedBookingStatus.REJECTED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <XCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
      case BedBookingStatus.CANCELLED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Cancelled
          </span>
        );
      default:
        return <span className="text-xs font-bold">{status}</span>;
    }
  };

  const formatExpiryTimer = (expiresAt?: string | null) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Hold Window Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m left to arrive`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col">
      {/* Top Portal Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/portal"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-2">
              <MediNexaLogo className="w-8 h-8" />
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">MediNexa</span>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                  Bed Reservations
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/bed-booking"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Book a Bed
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner Section */}
        <section className="bg-gradient-to-r from-teal-800 via-sky-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-bold border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" /> Patient Pre-Admission & Hospital Stays
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              My Bed Booking History & Active Holds
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm">
              Track your pre-admission reservations, hospital ward assignments, and admission expiry windows across premier network facilities.
            </p>
          </div>
        </section>

        {feedbackMsg && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : feedbackMsg.type === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-sky-50 text-sky-800 border border-sky-200'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg(null)} className="text-slate-500 hover:text-slate-700">✕</button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search reference # or hospital..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {['ALL', 'PENDING', 'APPROVED', 'ADMITTED', 'EXPIRED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st === 'ALL' ? 'All Bookings' : st}
              </button>
            ))}

            <button
              onClick={() => {
                setRefreshing(true);
                loadMyBookings();
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Refresh reservations"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading your bed reservations...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
              <Bed className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-800 dark:text-slate-200">No Bed Reservations Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You do not have any bed reservations matching the selected filter. You can reserve a bed in advance online anytime.
            </p>
            <Link
              href="/bed-booking"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Book a Hospital Bed Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBookings.map((b) => {
              const timer = formatExpiryTimer(b.expiresAt);
              return (
                <div
                  key={b.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs hover:border-teal-500/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <span className="font-mono text-xs font-black text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-900">
                          {b.bookingNumber}
                        </span>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">
                          {b.facility?.name || 'MediNexa Network Hospital'}
                        </h4>
                        {b.facility?.address && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" /> {b.facility.address}
                          </p>
                        )}
                      </div>
                      <div>{getStatusBadge(b.status, b.expiresAt)}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                      <div>
                        <span className="text-[11px] text-slate-400 font-semibold uppercase block">Requested Type</span>
                        <span className="font-extrabold text-indigo-700 dark:text-indigo-400">{b.bedType}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 font-semibold uppercase block">Assigned Bed</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">
                          {b.allocatedBed ? `#${b.allocatedBed.bedNumber}` : 'Pending assignment'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 font-semibold uppercase block">Expected Date</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {b.expectedDate ? new Date(b.expectedDate).toLocaleDateString() : 'Immediate'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 font-semibold uppercase block">Priority Level</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{b.priority || 'NORMAL'}</span>
                      </div>
                    </div>

                    {b.status === BedBookingStatus.APPROVED && timer && (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-600 animate-spin" /> Expiry Countdown:
                        </span>
                        <span className="font-mono font-black">{timer}</span>
                      </div>
                    )}

                    {b.chiefComplaint && (
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Complaint:</span> {b.chiefComplaint}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    {b.facility?.phone ? (
                      <a
                        href={`tel:${b.facility.phone}`}
                        className="text-xs text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1 hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Hospital Desk
                      </a>
                    ) : (
                      <div />
                    )}

                    {(b.status === BedBookingStatus.PENDING || b.status === BedBookingStatus.APPROVED) && (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        disabled={actionLoadingId === b.id}
                        className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 transition"
                      >
                        {actionLoadingId === b.id ? 'Cancelling...' : 'Cancel Reservation'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Portal Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>MediNexa Citizen Portal • Real-Time Bed Reservations & Admission Logistics</p>
      </footer>
    </div>
  );
}
