'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api-client';

interface PrescriptionItem {
  id: string;
  dosage: string;
  frequency: string;
  route?: string;
  duration?: string;
  instructions?: string;
  medication: { name: string; brandName?: string };
}

interface Reminder {
  id: string;
  scheduledTime: string;
  frequency: string;
  status: string;
  lastTakenAt?: string;
  skippedAt?: string;
  prescriptionItem: PrescriptionItem;
}

export default function MedicationRemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [unconfiguredItems, setUnconfiguredItems] = useState<PrescriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [selectedItem, setSelectedItem] = useState<PrescriptionItem | null>(null);
  const [reminderTimes, setReminderTimes] = useState('08:00 AM, 08:00 PM');
  const [modalLoading, setModalLoading] = useState(false);

  // Custom Reminder Modal State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [medications, setMedications] = useState<any[]>([]);
  const [customMedId, setCustomMedId] = useState('');
  const [customTime, setCustomTime] = useState('09:00 AM, 09:00 PM');
  const [customFrequency, setCustomFrequency] = useState('Twice daily');
  const [customInstructions, setCustomInstructions] = useState('Take after food.');

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);
    setError('');
    try {
      const [remRes, rxRes, medRes] = await Promise.all([
        apiFetch<Reminder[]>('/medication-reminders'),
        apiFetch<any[]>('/patients/me/prescriptions'),
        apiFetch<any[]>('/medications'),
      ]);

      if (remRes.ok && remRes.data) {
        setReminders(remRes.data);
      } else {
        setError(remRes.message || 'Unable to load medication reminders.');
      }

      if (medRes.ok && medRes.data) {
        const meds = Array.isArray(medRes.data) ? medRes.data : [];
        setMedications(meds);
        if (meds.length > 0) setCustomMedId(meds[0].id);
      }

      if (rxRes.ok && rxRes.data) {
        // Collect all prescription items from active prescriptions
        const allItems: PrescriptionItem[] = [];
        rxRes.data.forEach((rx: any) => {
          if (rx.items && Array.isArray(rx.items)) {
            allItems.push(...rx.items);
          }
        });

        // Filter items that don't have configured reminders yet
        const configuredItemIds = new Set(
          (remRes.data || []).map((r) => r.prescriptionItem?.id),
        );
        const unconfigured = allItems.filter((item) => !configuredItemIds.has(item.id));
        setUnconfiguredItems(unconfigured);
      }
    } catch (err: any) {
      setError('Unable to connect to MediNexa API.');
    } finally {
      setLoading(false);
    }
  }

  async function handleTakeDose(id: string) {
    setSuccess('');
    setError('');
    const res = await apiFetch(`/medication-reminders/${id}/taken`, { method: 'POST' });
    if (res.ok) {
      setSuccess('Medication marked as taken.');
      fetchInitialData();
    } else {
      setError(res.message || 'Failed to mark dose as taken.');
    }
  }

  async function handleSkipDose(id: string) {
    setSuccess('');
    setError('');
    const res = await apiFetch(`/medication-reminders/${id}/skipped`, { method: 'POST' });
    if (res.ok) {
      setSuccess('Dose marked as skipped.');
      fetchInitialData();
    } else {
      setError(res.message || 'Failed to mark dose as skipped.');
    }
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    setSuccess('');
    setError('');
    const endpoint = currentStatus === 'ACTIVE' ? 'pause' : 'resume';
    const res = await apiFetch(`/medication-reminders/${id}/${endpoint}`, { method: 'POST' });
    if (res.ok) {
      setSuccess(`Reminder ${endpoint}d successfully.`);
      fetchInitialData();
    } else {
      setError(res.message || `Failed to ${endpoint} reminder.`);
    }
  }

  async function handleConfigureReminder(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem) return;

    setModalLoading(true);
    setError('');
    const res = await apiFetch('/medication-reminders', {
      method: 'POST',
      body: JSON.stringify({
        prescriptionItemId: selectedItem.id,
        scheduledTime: reminderTimes,
        frequency: selectedItem.frequency,
      }),
    });

    if (res.ok) {
      setSuccess(`Medication reminder configured for ${selectedItem.medication?.name}.`);
      setSelectedItem(null);
      fetchInitialData();
    } else {
      setError(res.message || 'Failed to configure reminder.');
    }
    setModalLoading(false);
  }

  async function handleCreateCustomReminder(e: React.FormEvent) {
    e.preventDefault();
    if (!customMedId) {
      setError('Please select a medication');
      return;
    }
    if (!customTime.trim()) {
      setError('Reminder time cannot be empty');
      return;
    }

    setModalLoading(true);
    setError('');
    setSuccess('');

    const res = await apiFetch('/medication-reminders', {
      method: 'POST',
      body: JSON.stringify({
        medicationId: customMedId,
        scheduledTime: customTime.trim(),
        frequency: customFrequency.trim(),
        instructions: customInstructions.trim() || undefined,
      }),
    });

    if (res.ok) {
      setSuccess('Personal medicine reminder created successfully.');
      setShowCustomModal(false);
      fetchInitialData();
    } else {
      setError(res.message || 'Failed to create medicine reminder.');
    }
    setModalLoading(false);
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading your medication schedule...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Personal Medication Reminders</h1>
          <p className="text-slate-600">Track daily dosages, mark doses as taken or skipped, and configure schedules</p>
        </div>
        <button
          onClick={() => setShowCustomModal(true)}
          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center space-x-1.5"
        >
          <span>+ Add Medicine Reminder</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm font-medium">
          {success}
        </div>
      )}

      {/* Section 1: Active Reminders / Today's Medicines */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
          <span>Today's Medicines & Schedule</span>
          <span className="bg-sky-100 text-sky-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
            {reminders.length}
          </span>
        </h2>

        {reminders.length === 0 ? (
          <p className="text-slate-500 text-sm py-4 italic">
            No active medication reminders configured for your prescriptions.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders.map((r) => (
              <div key={r.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {r.prescriptionItem?.medication?.name}{' '}
                      {r.prescriptionItem?.medication?.brandName && (
                        <span className="text-slate-500 text-xs font-normal">
                          ({r.prescriptionItem.medication.brandName})
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-600">
                      Dosage: <span className="font-semibold text-slate-800">{r.prescriptionItem?.dosage}</span> • {r.prescriptionItem?.frequency}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                      r.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-white p-3 rounded-lg border border-slate-200">
                  <p className="font-semibold text-slate-800">⏰ Scheduled Times: <span className="text-sky-600 font-bold">{r.scheduledTime}</span></p>
                  {r.prescriptionItem?.instructions && <p>📝 Instructions: {r.prescriptionItem.instructions}</p>}
                  {r.lastTakenAt && <p className="text-emerald-600 font-semibold">✅ Taken at: {new Date(r.lastTakenAt).toLocaleString()}</p>}
                  {r.skippedAt && <p className="text-amber-600 font-semibold">⏭️ Skipped at: {new Date(r.skippedAt).toLocaleString()}</p>}
                </div>

                <div className="flex space-x-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => handleTakeDose(r.id)}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    Take
                  </button>
                  <button
                    onClick={() => handleSkipDose(r.id)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => handleToggleStatus(r.id, r.status)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    {r.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Prescription Items Without Reminders */}
      {unconfiguredItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-800">You Have Active Prescriptions Without Reminders</h2>
          <div className="divide-y divide-slate-200">
            {unconfiguredItems.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm">{item.medication?.name}</span>{' '}
                  <span className="text-slate-600">({item.dosage} • {item.frequency})</span>
                  <span className="block text-slate-400">Reminder not configured</span>
                </div>
                <button
                  onClick={() => setSelectedItem(item)}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Set Reminder
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configure Reminder Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Configure Medication Reminder</h3>
            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p><strong>Medicine:</strong> {selectedItem.medication?.name}</p>
              <p><strong>Dosage:</strong> {selectedItem.dosage}</p>
              <p><strong>Frequency:</strong> {selectedItem.frequency}</p>
            </div>

            <form onSubmit={handleConfigureReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Reminder Times (comma-separated e.g. 08:00 AM, 08:00 PM)
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                  value={reminderTimes}
                  onChange={(e) => setReminderTimes(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {modalLoading ? 'Saving...' : 'Save Reminder Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Personal Medicine Reminder Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateCustomReminder} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Add Personal Medicine Reminder</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Medication *</label>
              <select
                required
                value={customMedId}
                onChange={(e) => setCustomMedId(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white font-medium"
              >
                {medications.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.genericName} ({m.brandName || m.code}) — {m.strength}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Reminder Times *</label>
              <input
                required
                type="text"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold"
                placeholder="e.g. 09:00 AM, 09:00 PM"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Frequency</label>
              <input
                type="text"
                value={customFrequency}
                onChange={(e) => setCustomFrequency(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                placeholder="e.g. Twice daily"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Instructions</label>
              <textarea
                rows={2}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2 text-sm"
                placeholder="Take after food..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={modalLoading || !customMedId || !customTime}
                className="text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Save Reminder
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
