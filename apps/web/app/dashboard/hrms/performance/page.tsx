'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PerformanceManagementPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [employeeId, setEmployeeId] = useState('');
  const [reviewPeriod, setReviewPeriod] = useState('2026-Q3');
  const [rating, setRating] = useState(4.5);
  const [strengths, setStrengths] = useState('Exemplary clinical precision, excellent patient bedside manner, zero medication administration errors.');
  const [improvements, setImprovements] = useState('Continue mentoring junior nursing staff in ICU hemodynamic monitoring.');
  const [comments, setComments] = useState('Outstanding performance in high-acuity critical care workflows.');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/hrms/performance`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/hrms/employees`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([revData, empData]) => {
      setReviews(Array.isArray(revData) ? revData : []);
      const emps = Array.isArray(empData) ? empData : [];
      setEmployees(emps);
      if (emps.length > 0) setEmployeeId(emps[0].id);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/hrms/performance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          employeeId,
          reviewPeriod,
          rating: Number(rating),
          strengths,
          improvements,
          comments,
        }),
      });

      if (res.ok) {
        alert('Performance appraisal submitted successfully!');
        setShowAddModal(false);
        loadData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider rounded-full">
              STAFF APPRAISALS & KPIs
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Staff Performance & Clinical Appraisals</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Structured quarterly reviews, competency scoring, clinical strengths, and professional growth tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition"
          >
            + New Appraisal
          </button>
        </div>
      </div>

      {/* Navigation Sub-Links */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <Link href="/dashboard/hrms" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Overview</Link>
        <Link href="/dashboard/hrms/employees" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Employee Directory</Link>
        <Link href="/dashboard/hrms/attendance" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Attendance</Link>
        <Link href="/dashboard/hrms/shifts" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Shift Roster</Link>
        <Link href="/dashboard/hrms/leave" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Leave Requests</Link>
        <Link href="/dashboard/hrms/payroll" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Payroll</Link>
        <Link href="/dashboard/hrms/credentials" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Credentials</Link>
        <Link href="/dashboard/hrms/performance" className="px-4 py-2 bg-emerald-50 text-emerald-800 font-black text-xs rounded-xl">Performance</Link>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((rev) => (
          <div key={rev.id} className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-slate-900">{rev.employee?.fullName || 'Employee'}</h3>
                <p className="text-xs text-slate-500 font-medium">{rev.employee?.designation} • {rev.employee?.department}</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-amber-500 font-black text-xs">⭐</span>
                <span className="font-black text-xs text-emerald-800">{rev.rating} / 5.0</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div>
                <strong className="text-slate-900">Period:</strong> <span className="font-mono">{rev.reviewPeriod}</span>
              </div>
              <div>
                <strong className="text-slate-900">Strengths:</strong> {rev.strengths}
              </div>
              <div>
                <strong className="text-slate-900">Growth Areas:</strong> {rev.improvements}
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                <strong>Reviewer Remarks:</strong> &ldquo;{rev.comments}&rdquo;
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-bold flex justify-between pt-2 border-t border-slate-100">
              <span>Reviewed by: {rev.reviewer?.firstName} {rev.reviewer?.lastName || 'Department Head'}</span>
              <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">New Performance Review</h3>
            <form onSubmit={handleAddReview} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Select Staff Member *</label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Review Period (e.g. 2026-Q3) *</label>
                  <input
                    required
                    value={reviewPeriod}
                    onChange={(e) => setReviewPeriod(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label>Rating (1.0 - 5.0) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    required
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
              <div>
                <label>Key Strengths *</label>
                <textarea
                  rows={2}
                  required
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Areas for Improvement *</label>
                <textarea
                  rows={2}
                  required
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Evaluator Comments *</label>
                <textarea
                  rows={2}
                  required
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow"
                >
                  Submit Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
