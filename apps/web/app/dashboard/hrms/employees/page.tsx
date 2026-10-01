'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  Check,
  Shield,
  Briefcase,
  Building,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  Slash,
} from 'lucide-react';
import { getApiBaseUrl, fetchWithTimeout } from '@/lib/api-config';

interface StaffMember {
  id: string;
  employeeCode: string;
  fullName: string;
  department: string | { name: string };
  designation: string;
  employmentType?: string;
  employeeStatus?: string;
  phone?: string;
  email?: string;
  joiningDate: string;
  user?: {
    id: string;
    email: string;
    status: string;
    isActive: boolean;
    staffId?: string;
    role?: { code: string; name: string };
  };
}

export default function HrmsEmployeesEnhancedPage() {
  const [employees, setEmployees] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState<StaffMember | null>(null);

  // Add Staff Form State
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('MANAGER');
  const [newDepartment, setNewDepartment] = useState('General Medicine');
  const [newDesignation, setNewDesignation] = useState('Operational Manager');
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [newPassword, setNewPassword] = useState('Staff@123456');
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // Bulk Upload State
  const [bulkCsvText, setBulkCsvText] = useState(
    'Name,Email,Phone,Role,Department,Designation,EmployeeId\nDr. Maya Patel,maya.patel@hospital.com,+91-9876543201,DOCTOR,Cardiology,Senior Cardiologist,EMP-101\nSister Sarah Khan,sarah.khan@hospital.com,+91-9876543202,NURSE,ICU,Head Nurse,EMP-102\nVikram Verma,vikram.verma@hospital.com,+91-9876543203,MANAGER,Operations,Operational Manager,EMP-103'
  );
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  const [bulkReport, setBulkReport] = useState<any | null>(null);

  // Copy status
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchStaffData = () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    const baseUrl = getApiBaseUrl();

    let queryParams = new URLSearchParams();
    if (selectedDept !== 'ALL') queryParams.append('department', selectedDept);
    if (selectedRole !== 'ALL') queryParams.append('role', selectedRole);
    if (selectedStatus !== 'ALL') queryParams.append('status', selectedStatus);

    fetchWithTimeout(`${baseUrl}/hrms/employees?${queryParams.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEmployees(data);
        }
      })
      .catch((e) => console.warn('Failed to load employees', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStaffData();
  }, [selectedDept, selectedRole, selectedStatus]);

  // Handle Add Staff Submit
  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddSuccess(null);
    setIsSubmittingAdd(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
      const baseUrl = getApiBaseUrl();

      const res = await fetchWithTimeout(`${baseUrl}/hrms/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          fullName: newFullName,
          email: newEmail,
          phone: newPhone,
          roleCode: newRole,
          department: newDepartment,
          designation: newDesignation,
          employeeCode: newEmployeeId || undefined,
          password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to register staff member.');
      }

      setAddSuccess(`Staff member created successfully! Staff ID: ${data.staffId || data.employeeCode}`);
      fetchStaffData();
      setTimeout(() => {
        setShowAddModal(false);
        setAddSuccess(null);
        setNewFullName('');
        setNewEmail('');
        setNewPhone('');
      }, 1500);
    } catch (err: any) {
      setAddError(err.message || 'Error creating staff record');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Handle Bulk Upload Submit
  const handleBulkUploadSubmit = async () => {
    setIsSubmittingBulk(true);
    setBulkReport(null);

    try {
      const lines = bulkCsvText.trim().split('\n');
      if (lines.length <= 1) {
        throw new Error('CSV must contain a header row and at least one staff data row.');
      }

      const items = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const [fullName, email, phone, roleCode, department, designation, employeeId] = line.split(',').map((s) => s.trim());
        items.push({
          fullName,
          email,
          phone,
          roleCode: roleCode || 'MANAGER',
          department: department || 'General Medicine',
          designation: designation || 'Staff',
          employeeId: employeeId || undefined,
        });
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
      const baseUrl = getApiBaseUrl();

      const res = await fetchWithTimeout(`${baseUrl}/hrms/employees/bulk-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Bulk upload failed.');
      }

      setBulkReport(data);
      fetchStaffData();
    } catch (err: any) {
      setBulkReport({ error: err.message || 'Bulk upload failed' });
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  // Handle Status Update
  const handleUpdateStatus = async (staffId: string, newStatus: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE') => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
      const baseUrl = getApiBaseUrl();

      const res = await fetchWithTimeout(`${baseUrl}/hrms/employees/${staffId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchStaffData();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredEmployees = employees.filter((emp) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = emp.fullName?.toLowerCase() || '';
    const code = emp.employeeCode?.toLowerCase() || '';
    const staffId = emp.user?.staffId?.toLowerCase() || '';
    const email = emp.email?.toLowerCase() || '';
    return name.includes(q) || code.includes(q) || staffId.includes(q) || email.includes(q);
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold mb-2">
            <Building className="w-3.5 h-3.5" />
            <span>Hospital Administration & Staff Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Staff Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Register, invite, and govern clinical personnel, Managers, and administrative staff with unique MediNexa Identities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Upload className="w-4 h-4 text-purple-600" />
            <span>Bulk Upload</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Staff</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, Staff ID, or code..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
            >
              <option value="ALL">All Roles</option>
              <option value="MANAGER">MANAGER</option>
              <option value="DOCTOR">Doctor</option>
              <option value="NURSE">Nurse</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="PHARMACIST">Pharmacist</option>
              <option value="LAB_STAFF">Lab Technician</option>
              <option value="BILLING_STAFF">Billing Staff</option>
              <option value="HOSPITAL_ADMIN">Hospital Admin</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400">Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
            >
              <option value="ALL">All Departments</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Emergency">Emergency</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/40">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">MediNexa Staff ID</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joining Date</th>
                <th className="py-3 px-4 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEmployees.map((emp) => {
                const effectiveStaffId = emp.user?.staffId || emp.employeeCode;
                const effectiveRole = emp.user?.role?.code || emp.designation || 'STAFF';
                const status = emp.employeeStatus || (emp.user?.isActive ? 'ACTIVE' : 'INACTIVE');

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    {/* Name & Email */}
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">{emp.fullName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{emp.email || emp.user?.email || 'N/A'}</div>
                    </td>

                    {/* Staff ID */}
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800">
                        <span>{effectiveStaffId}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(effectiveStaffId)}
                          className="hover:text-purple-900 dark:hover:text-white"
                          title="Copy Staff ID"
                        >
                          {copiedId === effectiveStaffId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>

                    {/* Employee ID */}
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {emp.employeeCode}
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          effectiveRole === 'MANAGER'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                            : effectiveRole.includes('DOCTOR')
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                            : effectiveRole.includes('NURSE')
                            ? 'bg-pink-100 text-pink-800 dark:bg-pink-950/80 dark:text-pink-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {effectiveRole}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {typeof emp.department === 'string' ? emp.department : emp.department?.name || 'General Medicine'}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : status === 'SUSPENDED'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    {/* Joining Date */}
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(emp.joiningDate).toLocaleDateString()}
                    </td>

                    {/* Lifecycle Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {status !== 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(emp.id, 'ACTIVE')}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 transition cursor-pointer"
                          >
                            Activate
                          </button>
                        )}
                        {status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(emp.id, 'SUSPENDED')}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 transition cursor-pointer"
                          >
                            Suspend
                          </button>
                        )}
                        {status !== 'INACTIVE' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(emp.id, 'INACTIVE')}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 transition cursor-pointer"
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: ADD STAFF MEMBER
      ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Register Hospital Staff</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
                {addError}
              </div>
            )}
            {addSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-700 dark:text-emerald-300">
                {addSuccess}
              </div>
            )}

            <form onSubmit={handleAddStaffSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Kumar or Priya Sharma"
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="staff@hospital.com"
                    className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91-9876543210"
                    className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Role *</label>
                  <select
                    value={newRole}
                    onChange={(e) => {
                      setNewRole(e.target.value);
                      if (e.target.value === 'MANAGER') setNewDesignation('Operational Manager');
                      if (e.target.value === 'DOCTOR') setNewDesignation('Attending Physician');
                      if (e.target.value === 'NURSE') setNewDesignation('Staff Nurse');
                    }}
                    className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="MANAGER">MANAGER</option>
                    <option value="DOCTOR">DOCTOR</option>
                    <option value="NURSE">NURSE</option>
                    <option value="RECEPTIONIST">RECEPTIONIST</option>
                    <option value="PHARMACIST">PHARMACIST</option>
                    <option value="LAB_STAFF">LAB TECHNICIAN</option>
                    <option value="BILLING_STAFF">BILLING STAFF</option>
                    <option value="HOSPITAL_ADMIN">HOSPITAL ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="Operations">Operations</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Nursing">Nursing</option>
                    <option value="Diagnostics">Diagnostics</option>
                    <option value="Pharmacy">Pharmacy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Designation</label>
                  <input
                    type="text"
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    placeholder="Operational Manager"
                    className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Internal Employee ID</label>
                  <input
                    type="text"
                    value={newEmployeeId}
                    onChange={(e) => setNewEmployeeId(e.target.value)}
                    placeholder="EMP-104 (Optional)"
                    className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Temporary Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAdd ? 'Generating Identity & Enrolling...' : 'Confirm & Register Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: BULK STAFF UPLOAD
      ========================================================================= */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Bulk Staff Onboarding</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste CSV rows below. Format: <code>Name,Email,Phone,Role,Department,Designation,EmployeeId</code>.
              Row-by-row validation will be executed.
            </p>

            <textarea
              rows={6}
              value={bulkCsvText}
              onChange={(e) => setBulkCsvText(e.target.value)}
              className="w-full p-3 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />

            {bulkReport && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="font-bold flex items-center justify-between">
                  <span>Bulk Upload Report:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                    {bulkReport.successful} Successful, {bulkReport.failed} Failed
                  </span>
                </div>
                {bulkReport.results && (
                  <div className="max-h-36 overflow-y-auto space-y-1 font-mono text-[11px]">
                    {bulkReport.results.map((r: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-1.5 rounded-md flex items-center justify-between ${
                          r.status === 'SUCCESS' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        <span>
                          Row {r.row}: {r.name}
                        </span>
                        <span>{r.status === 'SUCCESS' ? `Staff ID: ${r.staffId}` : r.error}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleBulkUploadSubmit}
                disabled={isSubmittingBulk}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {isSubmittingBulk ? 'Validating & Uploading...' : 'Execute Bulk Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
