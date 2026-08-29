'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CredentialManagementPage() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [expiringCredentials, setExpiringCredentials] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [employeeId, setEmployeeId] = useState('');
  const [credentialType, setCredentialType] = useState('Medical License');
  const [licenseNumber, setLicenseNumber] = useState('MED-LIC-2026-9901');
  const [issueDate, setIssueDate] = useState('2024-01-15');
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/hrms/credentials`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/hrms/credentials/expiring?days=90`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/hrms/employees`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([credData, expData, empData]) => {
      setCredentials(Array.isArray(credData) ? credData : []);
      setExpiringCredentials(Array.isArray(expData) ? expData : []);
      const emps = Array.isArray(empData) ? empData : [];
      setEmployees(emps);
      if (emps.length > 0) setEmployeeId(emps[0].id);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/hrms/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          employeeId,
          credentialType,
          licenseNumber,
          issueDate: new Date(issueDate).toISOString(),
          expiryDate: new Date(expiryDate).toISOString(),
        }),
      });

      if (res.ok) {
        alert('Credential registered successfully!');
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
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider rounded-full">
              CREDENTIALING & COMPLIANCE
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Staff Credentials & License Verification</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Track medical licenses, nursing registrations, pharmacy certifications, and automated 30/60/90-day expiry notifications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition"
          >
            + Register Credential
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
        <Link href="/dashboard/hrms/credentials" className="px-4 py-2 bg-amber-50 text-amber-800 font-black text-xs rounded-xl">Credentials</Link>
        <Link href="/dashboard/hrms/performance" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Performance</Link>
      </div>

      {/* Alert Banner for Expiring Credentials */}
      {expiringCredentials.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-extrabold text-xs text-amber-900">
                {expiringCredentials.length} Professional License(s) Expiring Within 90 Days!
              </div>
              <div className="text-[11px] text-amber-700">
                Action required: Notify medical board liaison to complete renewal before clinical clearance expiry.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <h2 className="text-base font-extrabold text-slate-900 mb-4">Active & Expiring Hospital Staff Credentials</h2>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Staff Member</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Credential Type</th>
              <th className="py-3 px-4">License / Registration #</th>
              <th className="py-3 px-4">Issue Date</th>
              <th className="py-3 px-4">Expiry Date</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {credentials.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-800">{c.employee?.fullName || 'Staff Member'}</td>
                <td className="py-3 px-4 text-slate-600">{c.employee?.department || 'Clinical'}</td>
                <td className="py-3 px-4 font-extrabold text-indigo-900">{c.credentialType}</td>
                <td className="py-3 px-4 font-mono text-slate-800">{c.licenseNumber}</td>
                <td className="py-3 px-4 text-slate-500">{new Date(c.issueDate).toLocaleDateString()}</td>
                <td className="py-3 px-4 font-bold text-amber-700">{new Date(c.expiryDate).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                    {c.verificationStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Register Staff Credential</h3>
            <form onSubmit={handleAddCredential} className="space-y-3 text-xs font-bold text-slate-700">
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
              <div>
                <label>Credential Type *</label>
                <select
                  value={credentialType}
                  onChange={(e) => setCredentialType(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Medical License">Medical License (MCI / State Medical Council)</option>
                  <option value="Nursing License">Nursing Registration (INC / State Council)</option>
                  <option value="Pharmacy Registration">Pharmacy Board Registration</option>
                  <option value="Lab Certification">NABL / Lab Technologist Board</option>
                  <option value="BLS/ACLS Certification">AHA BLS / ACLS Emergency Life Support</option>
                </select>
              </div>
              <div>
                <label>License / Registration Number *</label>
                <input
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Issue Date *</label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label>Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
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
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black shadow"
                >
                  Save Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
