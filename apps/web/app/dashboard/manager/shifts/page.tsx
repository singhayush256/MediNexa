'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Clock,
  UserCheck,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import {
  getHospitalShiftList,
  getHospitalStaffList,
  CanonicalShift,
} from '@/lib/hospital-canonical-data';

export default function ManagerShiftsPage() {
  const [shifts, setShifts] = useState<CanonicalShift[]>([]);
  const [activeTab, setActiveTab] = useState<'TODAY' | 'WEEKLY' | 'VACANT'>('TODAY');
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form states
  const [newStaffLoginId, setNewStaffLoginId] = useState('');
  const [newShiftName, setNewShiftName] = useState('Morning (08:00 - 16:00)');
  const [newDept, setNewDept] = useState('Critical Care ICU');

  const loadShifts = () => {
    const activeHosp = typeof window !== 'undefined' ? localStorage.getItem('medinexa_active_hospital_id') || 'HOSPITAL_A' : 'HOSPITAL_A';
    const list = getHospitalShiftList(undefined, activeHosp);
    setShifts(list);
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const handleAssignShift = (e: React.FormEvent) => {
    e.preventDefault();
    const activeHosp = typeof window !== 'undefined' ? localStorage.getItem('medinexa_active_hospital_id') || 'HOSPITAL_A' : 'HOSPITAL_A';

    const staffList = getHospitalStaffList(undefined, activeHosp);
    const matched = staffList.find(
      (s) => s.staffLoginId.toLowerCase() === newStaffLoginId.trim().toLowerCase()
    );

    const shiftRecord: CanonicalShift = {
      id: `shift-mgr-${Date.now().toString().slice(-4)}`,
      staffId: matched?.id || `stf-${Date.now()}`,
      staffName: matched?.name || newStaffLoginId.toUpperCase(),
      staffLoginId: newStaffLoginId.toUpperCase(),
      role: matched?.role || 'Staff Nurse',
      department: newDept,
      shiftName: newShiftName,
      startTime: '08:00',
      endTime: '16:00',
      status: 'SCHEDULED',
      date: new Date().toISOString().split('T')[0],
      hospitalId: activeHosp,
    };

    // Save to custom shifts in localStorage for persistent refresh
    const customShiftStr = localStorage.getItem('medinexa_custom_shifts');
    const custom = customShiftStr ? JSON.parse(customShiftStr) : [];
    custom.unshift(shiftRecord);
    localStorage.setItem('medinexa_custom_shifts', JSON.stringify(custom));

    setShifts([shiftRecord, ...shifts]);
    setActionSuccess(`Shift successfully assigned to ${shiftRecord.staffLoginId} and persisted.`);
    setTimeout(() => setActionSuccess(null), 4000);
    setShowAddModal(false);
    setNewStaffLoginId('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold mb-2">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Operational Rostering Command</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Shifts & Duty Rosters
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Coordinate daily rosters, manage shift allocations, resolve roster conflicts, and assign cover.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-md shadow-teal-600/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Staff to Shift</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-xs font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {[
          { key: 'TODAY', label: "Today's Active Roster" },
          { key: 'WEEKLY', label: 'Weekly Schedule Overview' },
          { key: 'VACANT', label: 'Vacant Shifts & Coverage Gaps' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === tab.key
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Shift Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Staff Login ID</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Shift Name</th>
                <th className="py-3 px-4">Timings</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {shifts.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">
                    {s.staffName}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-teal-700 dark:text-teal-300">
                    {s.staffLoginId}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {s.department}
                  </td>
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold">
                    {s.shiftName}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {s.startTime} - {s.endTime}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{s.date}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Assign Staff Member to Shift
            </h3>
            <form onSubmit={handleAssignShift} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Staff Login ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NR.PRIYA-1842"
                  value={newStaffLoginId}
                  onChange={(e) => setNewStaffLoginId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Shift Timing *
                </label>
                <select
                  value={newShiftName}
                  onChange={(e) => setNewShiftName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Morning (08:00 - 16:00)">Morning (08:00 - 16:00)</option>
                  <option value="Evening (16:00 - 24:00)">Evening (16:00 - 24:00)</option>
                  <option value="Night (00:00 - 08:00)">Night (00:00 - 08:00)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Critical Care ICU">Critical Care ICU</option>
                  <option value="Emergency & Trauma Station">Emergency & Trauma Station</option>
                  <option value="Cardiology OPD">Cardiology OPD</option>
                  <option value="General Medicine Ward 3">General Medicine Ward 3</option>
                  <option value="Pediatrics Inpatient">Pediatrics Inpatient</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold"
                >
                  Confirm & Persist Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
