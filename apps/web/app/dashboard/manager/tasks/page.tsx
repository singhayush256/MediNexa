'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Filter,
  Calendar,
  User,
  ArrowRight,
} from 'lucide-react';

interface ManagerTask {
  id: string;
  title: string;
  department: string;
  assignedTo: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ESCALATED';
  category: 'ROSTER' | 'EQUIPMENT' | 'QUALITY' | 'DISCHARGE';
}

export default function ManagerTasksPage() {
  const [tasks, setTasks] = useState<ManagerTask[]>([
    {
      id: 'task-101',
      title: 'Sign off morning shift ICU nursing handover logs',
      department: 'Critical Care ICU',
      assignedTo: 'Rahul Verma (Manager)',
      priority: 'CRITICAL',
      dueDate: 'Today, 11:30 AM',
      status: 'PENDING',
      category: 'ROSTER',
    },
    {
      id: 'task-102',
      title: 'Inspect Emergency Bay 3 Defibrillator calibration certificate',
      department: 'Emergency & Trauma',
      assignedTo: 'Biomedical Lead / Manager',
      priority: 'HIGH',
      dueDate: 'Today, 02:00 PM',
      status: 'IN_PROGRESS',
      category: 'EQUIPMENT',
    },
    {
      id: 'task-103',
      title: 'Resolve fast-track clearance bottleneck for 3 post-op discharges',
      department: 'Orthopedics Post-Op',
      assignedTo: 'Rahul Verma (Manager)',
      priority: 'HIGH',
      dueDate: 'Today, 01:00 PM',
      status: 'PENDING',
      category: 'DISCHARGE',
    },
    {
      id: 'task-104',
      title: 'Review weekly staff attendance anomalies & punch discrepancies',
      department: 'HRMS / Operations',
      assignedTo: 'Rahul Verma (Manager)',
      priority: 'MEDIUM',
      dueDate: 'Tomorrow, 10:00 AM',
      status: 'PENDING',
      category: 'QUALITY',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDept, setNewTaskDept] = useState('General Medicine');
  const [showAddModal, setShowAddModal] = useState(false);

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const next = t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
          return { ...t, status: next };
        }
        return t;
      })
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: ManagerTask = {
      id: `task-${Date.now().toString().slice(-4)}`,
      title: newTaskTitle.trim(),
      department: newTaskDept,
      assignedTo: 'Rahul Verma (Manager)',
      priority: 'HIGH',
      dueDate: 'Today, 05:00 PM',
      status: 'PENDING',
      category: 'QUALITY',
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setShowAddModal(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold mb-2">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Operations Task Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            My Operational Tasks & Action Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational action items, clinical handover verifications, and compliance checklists.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-md shadow-teal-600/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Operational Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'ESCALATED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === st
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {st.replace('_', ' ')} (
            {st === 'ALL' ? tasks.length : tasks.filter((t) => t.status === st).length})
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            No operational tasks in this status.
          </div>
        ) : (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                t.status === 'COMPLETED'
                  ? 'border-emerald-200 dark:border-emerald-900/40 opacity-70'
                  : t.priority === 'CRITICAL'
                  ? 'border-rose-300 dark:border-rose-900'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <button
                  onClick={() => toggleTaskStatus(t.id)}
                  className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition cursor-pointer shrink-0 ${
                    t.status === 'COMPLETED'
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-700 hover:border-teal-600'
                  }`}
                >
                  {t.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${
                        t.priority === 'CRITICAL'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : t.priority === 'HIGH'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {t.priority}
                    </span>
                    <span className="text-xs font-mono text-slate-400 font-semibold">{t.id}</span>
                    <span className="text-xs text-slate-500 font-semibold">• {t.department}</span>
                  </div>

                  <h3
                    className={`text-sm font-bold text-slate-900 dark:text-white ${
                      t.status === 'COMPLETED' ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {t.title}
                  </h3>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Due: {t.dueDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> {t.assignedTo}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => toggleTaskStatus(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    t.status === 'COMPLETED'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      : 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100'
                  }`}
                >
                  {t.status === 'COMPLETED' ? 'Mark Reopened' : 'Complete Task'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Create Manager Operational Task
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Confirm triage emergency nursing coverage"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <select
                  value={newTaskDept}
                  onChange={(e) => setNewTaskDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="ICU Ward">ICU Ward</option>
                  <option value="Emergency & Trauma">Emergency & Trauma</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Housekeeping & Sanitation">Housekeeping & Sanitation</option>
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
