'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface ShiftItem {
  id: string;
  shiftType: string;
  status: string;
  startTime: string;
  endTime?: string;
  handoverNotes?: string;
  nurse?: { firstName: string; lastName: string };
  facility?: { id: string; name: string };
}

export default function NursingShiftHandoverPage() {
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Shift Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [shiftType, setShiftType] = useState('MORNING');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/nursing/shifts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setShifts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('medinexa_token');
      const payload = {
        shiftType,
        handoverNotes: handoverNotes || undefined,
      };

      const res = await fetch(`${apiUrl}/nursing/shifts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to start shift');

      setShowCreateModal(false);
      setHandoverNotes('');
      fetchShifts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteShift = async (id: string) => {
    const token = localStorage.getItem('medinexa_token');
    const notesPrompt = prompt('Enter Shift Handover Notes for incoming nurse team:');
    if (notesPrompt === null) return;

    try {
      const res = await fetch(`${apiUrl}/nursing/shifts/${id}/complete`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ handoverNotes: notesPrompt }),
      });
      if (res.ok) fetchShifts();
    } catch (err) {
      console.error('Failed to complete shift:', err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Nursing Shift Handover & Duty Station
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Shift-by-shift nurse roster handovers, pending task summaries & duty completion.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/nursing"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            ← Command Center
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            + Start New Shift
          </button>
        </div>
      </div>

      {/* Shift Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Shift Handover Log Roster</h2>
          <span className="text-xs font-semibold text-slate-500">Shift Duty Station</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium animate-pulse">
            Loading nursing shift logs...
          </div>
        ) : shifts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">
            No active nursing shifts recorded. Click "+ Start New Shift" to begin shift.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-100">
                <tr>
                  <th className="p-4">Nurse Name</th>
                  <th className="p-4">Shift Type</th>
                  <th className="p-4">Start Time</th>
                  <th className="p-4">End Time</th>
                  <th className="p-4">Handover Notes</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {shifts.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-slate-900">
                      {s.nurse ? `Nurse ${s.nurse.firstName} ${s.nurse.lastName}` : 'Staff'}
                    </td>
                    <td className="p-4 font-semibold text-purple-700">{s.shiftType}</td>
                    <td className="p-4 text-slate-500">
                      {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-slate-500">
                      {s.endTime ? new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">{s.handoverNotes || 'No notes entered'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] border font-bold ${s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {s.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleCompleteShift(s.id)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition text-[11px]"
                        >
                          Complete Shift ✓
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

      {/* Start Shift Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Start Nursing Duty Shift</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 font-bold text-sm">✕</button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateShift} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Shift Type</label>
                <select
                  value={shiftType}
                  onChange={(e) => setShiftType(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold bg-slate-50 text-slate-900"
                >
                  <option value="MORNING">Morning Shift (07:00 – 15:00)</option>
                  <option value="EVENING">Evening Shift (15:00 – 23:00)</option>
                  <option value="NIGHT">Night Shift (23:00 – 07:00)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Initial Shift Notes</label>
                <textarea
                  rows={3}
                  placeholder="Notes from outgoing team..."
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition"
              >
                {isSubmitting ? 'Starting Shift...' : 'Begin Duty Shift ✓'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
