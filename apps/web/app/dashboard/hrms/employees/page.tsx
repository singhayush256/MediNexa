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
  Eye,
  Edit,
  Key,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Send,
} from 'lucide-react';
import { getApiBaseUrl, fetchWithTimeout } from '@/lib/api-config';
import { generateStaffLoginId, isValidStaffLoginId } from '@medinexa/validation';

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
  const [currentUserRole, setCurrentUserRole] = useState<string>('HOSPITAL_ADMIN');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const u = localStorage.getItem('medinexa_user');
        if (u) {
          const parsed = JSON.parse(u);
          const r = parsed.role?.code || parsed.roleCode || parsed.role || 'HOSPITAL_ADMIN';
          setCurrentUserRole(String(r).toUpperCase());
        }
      } catch (e) {}
    }
  }, []);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [viewStaffModal, setViewStaffModal] = useState<StaffMember | null>(null);
  const [editStaffModal, setEditStaffModal] = useState<StaffMember | null>(null);
  const [permissionsModal, setPermissionsModal] = useState<StaffMember | null>(null);

  // Edit Staff Form State
  const [editFullName, setEditFullName] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('MANAGER');
  const [editStatus, setEditStatus] = useState<string>('ACTIVE');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  // Add Staff Form State
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('MANAGER');
  const [newDepartment, setNewDepartment] = useState('General Medicine');
  const [newDesignation, setNewDesignation] = useState('Operational Manager');
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [newJoiningDate, setNewJoiningDate] = useState(new Date().toISOString().slice(0, 10));
  const [newStatus, setNewStatus] = useState('ACTIVE');
  const [newPassword, setNewPassword] = useState('Staff@123456');
  const [isCustomStaffId, setIsCustomStaffId] = useState(false);
  const [customStaffId, setCustomStaffId] = useState('');
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // Created Confirmation Screen State
  const [createdConfirmation, setCreatedConfirmation] = useState<{
    id: string;
    fullName: string;
    role: string;
    department: string;
    staffLoginId: string;
    email: string;
  } | null>(null);
  const [invitationMessage, setInvitationMessage] = useState<string | null>(null);
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);

  // Edit Staff Login ID Modal State
  const [editLoginIdStaff, setEditLoginIdStaff] = useState<StaffMember | null>(null);
  const [customLoginIdInput, setCustomLoginIdInput] = useState('');
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [isUpdatingLoginId, setIsUpdatingLoginId] = useState(false);
  const [loginIdModalError, setLoginIdModalError] = useState<string | null>(null);
  const [loginIdModalSuccess, setLoginIdModalSuccess] = useState<string | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Bulk Upload State
  const [bulkCsvText, setBulkCsvText] = useState(
    'Name,Email,Phone,Role,Department,Designation,EmployeeId\nDr. Maya Patel,maya.patel@hospital.com,+91-9876543201,DOCTOR,Cardiology,Senior Cardiologist,EMP-101\nSister Sarah Khan,sarah.khan@hospital.com,+91-9876543202,NURSE,ICU,Head Nurse,EMP-102\nVikram Verma,vikram.verma@hospital.com,+91-9876543203,MANAGER,Operations,Operational Manager,EMP-103'
  );
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  const [bulkReport, setBulkReport] = useState<any | null>(null);

  // Copy status
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Computed Auto-Generated Staff Login ID Preview
  const effectiveFirstName = newFirstName.trim() || newFullName.trim().split(/\s+/)[0] || 'Staff';
  const effectiveLastName = newLastName.trim() || newFullName.trim().split(/\s+/).slice(1).join(' ') || '';
  const effectiveFullName = newFullName.trim() || `${effectiveFirstName} ${effectiveLastName}`.trim();
  
  const autoGeneratedStaffId = React.useMemo(() => {
    return generateStaffLoginId(newRole, effectiveFullName, newPhone);
  }, [newRole, effectiveFullName, newPhone]);

  const activeStaffLoginId = isCustomStaffId && customStaffId.trim() ? customStaffId.trim().toUpperCase() : autoGeneratedStaffId;

  const copyToClipboard = (text: string, customToast = 'Staff ID copied.') => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setToastMessage(customToast);
    setTimeout(() => {
      setCopiedId(null);
      setToastMessage(null);
    }, 2500);
  };

  const resetAddForm = () => {
    setNewFirstName('');
    setNewLastName('');
    setNewFullName('');
    setNewEmail('');
    setNewPhone('');
    setNewRole('MANAGER');
    setNewDepartment('General Medicine');
    setNewDesignation('Operational Manager');
    setNewEmployeeId('');
    setNewJoiningDate(new Date().toISOString().slice(0, 10));
    setNewStatus('ACTIVE');
    setNewPassword('Staff@123456');
    setIsCustomStaffId(false);
    setCustomStaffId('');
    setAddError(null);
    setAddSuccess(null);
  };

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

      const fullName = (newFullName.trim() || `${newFirstName.trim()} ${newLastName.trim()}`).trim();
      if (!fullName) {
        throw new Error('Please enter the staff member name.');
      }
      if (isCustomStaffId && customStaffId.trim() && !isValidStaffLoginId(customStaffId.trim())) {
        throw new Error('Invalid custom Staff Login ID format. Allowed format: e.g. DR.AYUSH-0263 or DR.AYUSH-CARDIO-0263');
      }

      const res = await fetchWithTimeout(`${baseUrl}/hrms/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          fullName,
          firstName: newFirstName.trim() || undefined,
          lastName: newLastName.trim() || undefined,
          email: newEmail.trim() || undefined,
          phone: newPhone.trim() || undefined,
          roleCode: newRole,
          department: newDepartment,
          designation: newDesignation,
          employeeCode: newEmployeeId.trim() || undefined,
          joiningDate: newJoiningDate,
          employeeStatus: newStatus,
          staffLoginId: isCustomStaffId && customStaffId.trim() ? customStaffId.trim().toUpperCase() : undefined,
          password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to register staff member.');
      }

      const assignedStaffId = data.staffId || data.employeeCode || activeStaffLoginId;
      setCreatedConfirmation({
        id: data.id,
        fullName: data.fullName || fullName,
        role: newRole,
        department: newDepartment,
        staffLoginId: assignedStaffId,
        email: data.email || newEmail,
      });

      fetchStaffData();
    } catch (err: any) {
      setAddError(err.message || 'Error creating staff record');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Handle Send Invitation
  const handleSendInvitation = async (employeeId: string) => {
    setIsSendingInvitation(true);
    setInvitationMessage(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
      const baseUrl = getApiBaseUrl();

      const res = await fetchWithTimeout(`${baseUrl}/hrms/employees/${employeeId}/send-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to dispatch invitation.');
      }

      setInvitationMessage(
        `Onboarding invitation generated for ${data.staffName}. Staff Login ID: ${data.staffLoginId}. Secure activation instructions dispatched to ${data.email || 'employee address'}.`
      );
      setToastMessage('Invitation sent successfully!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      setInvitationMessage(`Notice: ${err.message}`);
    } finally {
      setIsSendingInvitation(false);
    }
  };

  // Handle Save Custom Staff Login ID
  const handleSaveCustomStaffId = async (employeeId: string) => {
    if (!customLoginIdInput.trim()) return;
    const normalized = customLoginIdInput.trim().toUpperCase();
    if (!isValidStaffLoginId(normalized)) {
      setLoginIdModalError('Invalid Staff Login ID format. Allowed format: e.g. DR.AYUSH-0263 or DR.AYUSH-CARDIO-0263');
      return;
    }

    setIsUpdatingLoginId(true);
    setLoginIdModalError(null);
    setLoginIdModalSuccess(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
      const baseUrl = getApiBaseUrl();

      const res = await fetchWithTimeout(`${baseUrl}/hrms/employees/${employeeId}/staff-login-id`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          staffLoginId: normalized,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update Staff Login ID.');
      }

      setLoginIdModalSuccess(`Staff Login ID successfully updated to ${normalized}`);
      setToastMessage('Staff Login ID updated.');
      fetchStaffData();
      setTimeout(() => {
        setEditLoginIdStaff(null);
        setLoginIdModalSuccess(null);
        setCustomLoginIdInput('');
        setToastMessage(null);
      }, 1500);
    } catch (err: any) {
      setLoginIdModalError(err.message || 'Failed to update Staff Login ID.');
    } finally {
      setIsUpdatingLoginId(false);
    }
  };

  // Handle Regenerate Staff Login ID
  const handleRegenerateStaffId = async (employeeId: string) => {
    setIsUpdatingLoginId(true);
    setLoginIdModalError(null);
    setLoginIdModalSuccess(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
      const baseUrl = getApiBaseUrl();

      const res = await fetchWithTimeout(`${baseUrl}/hrms/employees/${employeeId}/staff-login-id`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          regenerate: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to regenerate Staff Login ID.');
      }

      const newId = data.user?.staffId || data.employeeCode;
      setLoginIdModalSuccess(`Staff Login ID regenerated: ${newId}`);
      setToastMessage('Staff Login ID regenerated.');
      fetchStaffData();
      setTimeout(() => {
        setEditLoginIdStaff(null);
        setShowRegenerateConfirm(false);
        setLoginIdModalSuccess(null);
        setToastMessage(null);
      }, 1500);
    } catch (err: any) {
      setLoginIdModalError(err.message || 'Failed to regenerate Staff Login ID.');
    } finally {
      setIsUpdatingLoginId(false);
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

  const handleOpenEdit = (emp: StaffMember) => {
    setEditStaffModal(emp);
    setEditFullName(emp.fullName);
    setEditDepartment(typeof emp.department === 'string' ? emp.department : emp.department?.name || 'General Medicine');
    setEditDesignation(emp.designation || 'Staff');
    setEditPhone(emp.phone || '');
    setEditRole(emp.user?.role?.code || 'STAFF');
    setEditStatus(emp.employeeStatus || (emp.user?.isActive ? 'ACTIVE' : 'INACTIVE'));
    setEditError(null);
    setEditSuccess(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStaffModal) return;
    setIsSubmittingEdit(true);
    setEditError(null);
    setEditSuccess(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
      const baseUrl = getApiBaseUrl();

      const res = await fetchWithTimeout(`${baseUrl}/hrms/employees/${editStaffModal.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          fullName: editFullName,
          department: editDepartment,
          designation: editDesignation,
          phone: editPhone,
          roleCode: editRole,
          employeeStatus: editStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update staff record');
      }

      setEditSuccess('Staff profile updated successfully!');
      fetchStaffData();
      setTimeout(() => {
        setEditStaffModal(null);
        setEditSuccess(null);
      }, 1200);
    } catch (err: any) {
      setEditError(err.message || 'Error updating staff record');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const getStaffCapabilities = (role?: string) => {
    const norm = (role || '').toUpperCase();
    switch (norm) {
      case 'SUPER_ADMIN':
      case 'MEDINEXA_ADMIN':
        return [
          { name: 'Universal System Access', active: true, desc: 'Full root clearance across all hospital tenants and databases' },
          { name: 'Multi-Hospital Tenant Governance', active: true, desc: 'Configure, audit, and provision medical institutions' },
          { name: 'Staff & Workforce Management', active: true, desc: 'Create, modify, and assign administrators and staff' },
          { name: 'Clinical Telemetry & Analytics', active: true, desc: 'Platform-wide telemetry, occupancy, and compliance' },
        ];
      case 'HOSPITAL_ADMIN':
      case 'ADMIN':
        return [
          { name: 'Hospital Facility Administration', active: true, desc: 'Full management of wards, rooms, beds, and departments' },
          { name: 'Staff Management (HRMS)', active: true, desc: 'Register staff, bulk upload rosters, modify permissions' },
          { name: 'Operational & Bed Telemetry', active: true, desc: 'Live bed allocation, admissions, and discharge controls' },
          { name: 'Financial & Billing Auditing', active: true, desc: 'Reconcile bills, insurance claims, and statutory reports' },
        ];
      case 'MANAGER':
      case 'HR_MANAGER':
        return [
          { name: 'Operations Command Center', active: true, desc: 'Real-time hospital operations, triage queues, and bed telemetry' },
          { name: 'Staff Workforce Registry', active: true, desc: 'Add personnel, schedule duty shifts, monitor attendance' },
          { name: 'Department Workload Balancing', active: true, desc: 'Monitor patient-to-staff ratios and resolve shift shortages' },
          { name: 'Payroll & Leave Administration', active: true, desc: 'Review attendance records and leave authorizations' },
        ];
      case 'DOCTOR':
        return [
          { name: 'OPD Consultation Workspace', active: true, desc: 'Access assigned queue, call tokens, and examine patients' },
          { name: 'Clinical Records & EMR', active: true, desc: 'Document diagnoses, review lab history, and track vitals' },
          { name: 'Digital Rx Prescriptions', active: true, desc: 'Issue validated electronic prescriptions to pharmacy' },
          { name: 'Diagnostic & Lab Ordering', active: true, desc: 'Order pathology tests, imaging, and microbiology' },
        ];
      case 'NURSE':
        return [
          { name: 'Inpatient Care & Vitals Station', active: true, desc: 'Record temperature, BP, SpO2, and fluid balance' },
          { name: 'Ward Bed Management', active: true, desc: 'Assist bed transfers, discharges, and handover notes' },
          { name: 'Medication Administration Record', active: true, desc: 'Verify and administer doctor-ordered medications' },
          { name: 'Emergency Triage Intake', active: true, desc: 'Assess patient acuity and assign urgent triage priority' },
        ];
      case 'RECEPTIONIST':
        return [
          { name: 'Patient Registration & Check-in', active: true, desc: 'Generate unique Patient IDs and verify identity' },
          { name: 'Doctor Appointment Scheduling', active: true, desc: 'Book, reschedule, confirm, and intake OPD slots' },
          { name: 'Live Token Queue Calling', active: true, desc: 'Call tokens, manage priority queues, and announce numbers' },
          { name: 'Live Bed Availability Inquiries', active: true, desc: 'View available beds across wards for incoming requests' },
        ];
      case 'PHARMACIST':
      case 'PHARMACY_STAFF':
        return [
          { name: 'Prescription Dispensing', active: true, desc: 'Validate doctor signatures and dispense medication batches' },
          { name: 'Inventory & Stock Management', active: true, desc: 'Track batch expiries, manage reorders, and stock levels' },
          { name: 'Pharmacy Billing Reconciliation', active: true, desc: 'Generate medicine invoices and receipt printouts' },
        ];
      case 'LAB_STAFF':
      case 'LAB_TECH':
        return [
          { name: 'Specimen Collection & Processing', active: true, desc: 'Log sample tubes, barcode labeling, and test queues' },
          { name: 'Diagnostic Results Entry', active: true, desc: 'Record numeric values, reference ranges, and flags' },
          { name: 'Report Verification & Publishing', active: true, desc: 'Finalize diagnostic reports for doctor & patient review' },
        ];
      case 'BILLING_STAFF':
        return [
          { name: 'Hospital Invoicing', active: true, desc: 'Consolidate bed, lab, doctor, and pharmacy charges' },
          { name: 'Payment Processing & Cashier', active: true, desc: 'Process card, cash, UPI, and online portal payments' },
          { name: 'Financial Revenue Reports', active: true, desc: 'Track daily collections, refunds, and outstanding balances' },
        ];
      case 'INSURANCE_STAFF':
        return [
          { name: 'TPA Cashless Pre-Authorization', active: true, desc: 'Submit clinical pre-auth requests to insurance payers' },
          { name: 'Claims Adjudication Tracking', active: true, desc: 'Track approval letters, deductions, and claim queries' },
          { name: 'Discharge Settlement', active: true, desc: 'Finalize cashless authorization at patient discharge' },
        ];
      case 'AMBULANCE_DRIVER':
        return [
          { name: 'Emergency Dispatch Alerts', active: true, desc: 'Receive real-time 108 SOS emergency calls and addresses' },
          { name: 'Live GPS Telemetry Updates', active: true, desc: 'Broadcast vehicle coordinates to ER command center' },
          { name: 'Patient Pickup & ER Handover', active: true, desc: 'Confirm patient transit and emergency triage handover' },
        ];
      default:
        return [
          { name: 'Standard Staff Directory Access', active: true, desc: 'View assigned shift schedules and facility announcements' },
          { name: 'Attendance Self Clock-In', active: true, desc: 'Record daily duty arrival and departure' },
        ];
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = emp.fullName?.toLowerCase() || '';
    const code = emp.employeeCode?.toLowerCase() || '';
    const staffId = emp.user?.staffId?.toLowerCase() || '';
    const email = emp.email?.toLowerCase() || '';
    const phone = emp.phone?.toLowerCase() || '';
    return name.includes(q) || code.includes(q) || staffId.includes(q) || email.includes(q) || phone.includes(q);
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
              <option value="INSURANCE_STAFF">Insurance Coordinator</option>
              <option value="AMBULANCE_DRIVER">Ambulance Driver</option>
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
                <th className="py-3 px-4 text-right">Actions & Governance</th>
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

                    {/* Actions & Governance */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* View Action */}
                        <button
                          type="button"
                          onClick={() => setViewStaffModal(emp)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition cursor-pointer"
                          title="View Staff Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Staff Login ID / Regenerate Action */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditLoginIdStaff(emp);
                            setCustomLoginIdInput(effectiveStaffId);
                            setLoginIdModalError(null);
                            setLoginIdModalSuccess(null);
                            setShowRegenerateConfirm(false);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer"
                          title="Edit or Regenerate Staff Login ID"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        </button>

                        {/* Send Invitation Action */}
                        <button
                          type="button"
                          onClick={() => handleSendInvitation(emp.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
                          title="Dispatch Onboarding Invitation"
                        >
                          <Send className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        </button>

                        {/* Edit Profile Action */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                          title="Edit Staff Profile"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Permissions Action */}
                        <button
                          type="button"
                          onClick={() => setPermissionsModal(emp)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
                          title="Role Permissions & Capabilities"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>

                        <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

                        {/* Lifecycle Status Buttons */}
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {createdConfirmation ? 'Staff Enrolled Successfully' : 'Add Hospital Staff'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setCreatedConfirmation(null);
                  setInvitationMessage(null);
                  resetAddForm();
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CONFIRMATION SCREEN (Section 14 & 15) */}
            {createdConfirmation ? (
              <div className="space-y-5 text-center py-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Staff Account Created Successfully
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Official MediNexa Staff Login Identity has been generated and saved.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-left space-y-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400">Employee Name</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{createdConfirmation.fullName}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400">Role</span>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{createdConfirmation.role}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400">Department</span>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{createdConfirmation.department}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                        MediNexa Staff Login ID
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                        CANONICAL IDENTITY
                      </span>
                    </div>

                    <div className="p-3 bg-purple-50 dark:bg-purple-950/60 rounded-xl border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                      <span className="font-mono text-base font-black text-purple-900 dark:text-purple-200 tracking-wide">
                        {createdConfirmation.staffLoginId}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(createdConfirmation.staffLoginId, 'Staff ID copied.')}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        {copiedId === createdConfirmation.staffLoginId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === createdConfirmation.staffLoginId ? 'Copied' : 'Copy Staff ID'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      Provide this Staff Login ID to the employee. They will use this ID to authenticate at the MediNexa Hospital Portal.
                    </p>
                  </div>
                </div>

                {invitationMessage && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 text-left">
                    <div className="font-bold flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Invitation Status</span>
                    </div>
                    <div className="text-[11px] leading-relaxed">{invitationMessage}</div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isSendingInvitation}
                    onClick={() => handleSendInvitation(createdConfirmation.id)}
                    className="px-4 py-2 rounded-xl border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 font-bold text-xs flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingInvitation ? 'Sending Invitation...' : 'Send Invitation'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setCreatedConfirmation(null);
                      setInvitationMessage(null);
                      resetAddForm();
                    }}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* ADD STAFF FORM (Section 10) */
              <>
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
                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">First Name *</label>
                      <input
                        type="text"
                        required
                        value={newFirstName}
                        onChange={(e) => {
                          setNewFirstName(e.target.value);
                          if (!newFullName) setNewFullName(`${e.target.value} ${newLastName}`.trim());
                        }}
                        placeholder="e.g. Ayush"
                        className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Last Name</label>
                      <input
                        type="text"
                        value={newLastName}
                        onChange={(e) => {
                          setNewLastName(e.target.value);
                          if (!newFullName) setNewFullName(`${newFirstName} ${e.target.value}`.trim());
                        }}
                        placeholder="e.g. Singh"
                        className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Email & Mobile Number */}
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
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Mobile Number *</label>
                      <input
                        type="text"
                        required
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="+91 8114240263"
                        className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Role & Department */}
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
                          if (e.target.value === 'RECEPTIONIST') setNewDesignation('Front Desk Receptionist');
                          if (e.target.value === 'PHARMACIST') setNewDesignation('Clinical Pharmacist');
                          if (e.target.value === 'LAB_STAFF') setNewDesignation('Laboratory Technician');
                          if (e.target.value === 'BILLING_STAFF') setNewDesignation('Billing Specialist');
                          if (e.target.value === 'AMBULANCE_DRIVER') setNewDesignation('Ambulance Fleet Driver');
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
                        <option value="INSURANCE_STAFF">INSURANCE COORDINATOR</option>
                        <option value="AMBULANCE_DRIVER">AMBULANCE DRIVER</option>
                        <option value="RADIOLOGIST">RADIOLOGIST</option>
                        <option value="WARD_MANAGER">WARD MANAGER</option>
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
                        <option value="Billing & Accounts">Billing & Accounts</option>
                      </select>
                    </div>
                  </div>

                  {/* Designation & Employee ID */}
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
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Employee ID</label>
                      <input
                        type="text"
                        value={newEmployeeId}
                        onChange={(e) => setNewEmployeeId(e.target.value)}
                        placeholder="EMP-104 (Optional)"
                        className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  {/* Joining Date & Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Joining Date</label>
                      <input
                        type="date"
                        value={newJoiningDate}
                        onChange={(e) => setNewJoiningDate(e.target.value)}
                        className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Status</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </div>
                  </div>

                  {/* =========================================================================
                      MEDINEXA STAFF LOGIN ID (Section 10 & 35)
                  ========================================================================= */}
                  <div className="p-3.5 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          MediNexa Staff Login ID
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isCustomStaffId
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {isCustomStaffId ? 'CUSTOM' : 'AUTO-GENERATED'}
                      </span>
                    </div>

                    {!isCustomStaffId ? (
                      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900">
                        <div>
                          <div className="font-mono text-sm font-black text-purple-700 dark:text-purple-300">
                            {activeStaffLoginId}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Automatically generated from role, first name and last 4 digits of mobile number.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomStaffId(true);
                            setCustomStaffId(autoGeneratedStaffId);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800 cursor-pointer"
                        >
                          Edit ID
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={customStaffId}
                          onChange={(e) => setCustomStaffId(e.target.value.toUpperCase())}
                          placeholder="e.g. DR.AYUSH-CARDIO-0263"
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 rounded-xl font-mono uppercase font-bold focus:ring-2 focus:ring-purple-500"
                        />
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Custom ID will be validated for uniqueness and format.</span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomStaffId(false);
                              setCustomStaffId('');
                            }}
                            className="text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
                          >
                            Reset to Auto
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Temporary Password */}
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
              </>
            )}
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

      {/* =========================================================================
          MODAL 3: VIEW STAFF DETAILS
      ========================================================================= */}
      {viewStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-sm">
                  {viewStaffModal.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{viewStaffModal.fullName}</h3>
                  <div className="text-xs text-slate-500">{viewStaffModal.designation || 'Hospital Staff'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewStaffModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MediNexa Digital Staff ID Card (Section 27) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-950 text-white shadow-lg border border-purple-500/30 space-y-3 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between border-b border-purple-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-300" />
                  <span className="text-[11px] font-black tracking-wider text-purple-200 uppercase">
                    MediNexa Hospital ID Card
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  VERIFIED
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-800/80 text-purple-200 border border-purple-400/30 flex items-center justify-center font-black text-base shadow-inner">
                  {viewStaffModal.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-sm truncate text-white">{viewStaffModal.fullName}</div>
                  <div className="text-xs text-purple-200 font-medium">
                    {viewStaffModal.user?.role?.code || viewStaffModal.designation} • {typeof viewStaffModal.department === 'string' ? viewStaffModal.department : viewStaffModal.department?.name || 'General Medicine'}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/20 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-purple-300">Staff Login ID</div>
                  <div className="font-mono text-sm font-black text-amber-300 tracking-wider">
                    {viewStaffModal.user?.staffId || viewStaffModal.employeeCode}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(viewStaffModal.user?.staffId || viewStaffModal.employeeCode, 'Staff ID copied.')}
                  className="px-2.5 py-1 rounded-lg bg-purple-800 hover:bg-purple-700 text-purple-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-purple-600/40"
                >
                  {copiedId === (viewStaffModal.user?.staffId || viewStaffModal.employeeCode) ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === (viewStaffModal.user?.staffId || viewStaffModal.employeeCode) ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-purple-300/80 pt-1">
                <span>Employee Code: <code className="font-mono font-bold text-white">{viewStaffModal.employeeCode}</code></span>
                <span className="flex items-center gap-1 text-[10px] text-purple-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Safe QR Identity Enabled
                </span>
              </div>
            </div>

            {/* Detailed Properties */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-semibold">Assigned Role:</span>
                <span className="font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {viewStaffModal.user?.role?.code || viewStaffModal.designation}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-semibold">Department:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {typeof viewStaffModal.department === 'string' ? viewStaffModal.department : viewStaffModal.department?.name || 'General Medicine'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-semibold">Official Email:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{viewStaffModal.email || viewStaffModal.user?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-semibold">Contact Phone:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{viewStaffModal.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-semibold">Account Status:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  (viewStaffModal.employeeStatus || 'ACTIVE') === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                }`}>
                  {viewStaffModal.employeeStatus || 'ACTIVE'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 font-semibold">Joining Date:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{new Date(viewStaffModal.joiningDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setViewStaffModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: EDIT STAFF MEMBER
      ========================================================================= */}
      {editStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Edit Staff Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditStaffModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
                {editError}
              </div>
            )}
            {editSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-700 dark:text-emerald-300">
                {editSuccess}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Role *</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="MANAGER">MANAGER</option>
                    <option value="DOCTOR">DOCTOR</option>
                    <option value="NURSE">NURSE</option>
                    <option value="RECEPTIONIST">RECEPTIONIST</option>
                    <option value="PHARMACIST">PHARMACIST</option>
                    <option value="LAB_STAFF">LAB TECHNICIAN</option>
                    <option value="BILLING_STAFF">BILLING STAFF</option>
                    <option value="INSURANCE_STAFF">INSURANCE COORDINATOR</option>
                    <option value="AMBULANCE_DRIVER">AMBULANCE DRIVER</option>
                    <option value="HOSPITAL_ADMIN">HOSPITAL ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Department</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Designation</label>
                  <input
                    type="text"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditStaffModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEdit ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: PERMISSIONS & CAPABILITIES
      ========================================================================= */}
      {permissionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Role Capabilities & Permissions</h3>
                  <div className="text-xs text-slate-500 font-mono">
                    {permissionsModal.fullName} ({permissionsModal.user?.role?.code || permissionsModal.designation})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPermissionsModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Granular access capabilities enforced by MediNexa Hospital RBAC and Multi-Hospital Tenant Isolation.
            </p>

            {/* Capabilities List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {getStaffCapabilities(permissionsModal.user?.role?.code || permissionsModal.designation).map((cap, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{cap.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{cap.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setPermissionsModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: EDIT / REGENERATE STAFF LOGIN ID (Sections 11, 12, 13, 38)
      ========================================================================= */}
      {editLoginIdStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Edit / Regenerate Staff Login ID
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">
                    {editLoginIdStaff.fullName} ({editLoginIdStaff.user?.role?.code || editLoginIdStaff.designation || 'Staff'})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditLoginIdStaff(null);
                  setShowRegenerateConfirm(false);
                  setLoginIdModalError(null);
                  setLoginIdModalSuccess(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loginIdModalError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
                {loginIdModalError}
              </div>
            )}
            {loginIdModalSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-700 dark:text-emerald-300">
                {loginIdModalSuccess}
              </div>
            )}

            {/* Current Staff Login ID */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500">Current Login Identifier</span>
                <div className="font-mono text-sm font-black text-purple-700 dark:text-purple-300">
                  {editLoginIdStaff.user?.staffId || editLoginIdStaff.employeeCode}
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(editLoginIdStaff.user?.staffId || editLoginIdStaff.employeeCode)}
                className="px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>

            {/* Manager Permission Guard (Sections 12 & 33) */}
            {(() => {
              const targetRole = (editLoginIdStaff.user?.role?.code || editLoginIdStaff.designation || '').toUpperCase();
              const isTargetAdminOrManager = ['MANAGER', 'HR_MANAGER', 'HOSPITAL_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'MEDINEXA_ADMIN'].includes(targetRole);
              const isManager = currentUserRole === 'MANAGER' || currentUserRole === 'HR_MANAGER';
              const isRestricted = isManager && isTargetAdminOrManager;

              if (isRestricted) {
                return (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Manager Security Restriction:</strong> Hospital Managers cannot modify or regenerate Staff Login IDs of Administrators or peer Managers (Sections 12 & 33).
                    </span>
                  </div>
                );
              }
              return null;
            })()}

            {/* Custom Edit Option (Section 11) */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Custom Staff Login ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customLoginIdInput}
                  onChange={(e) => setCustomLoginIdInput(e.target.value.toUpperCase())}
                  placeholder="e.g. DR.AYUSH-CARDIO-0263"
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-purple-300 dark:border-purple-700 rounded-xl font-mono uppercase font-bold focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => handleSaveCustomStaffId(editLoginIdStaff.id)}
                  disabled={
                    isUpdatingLoginId ||
                    !customLoginIdInput.trim() ||
                    ((currentUserRole === 'MANAGER' || currentUserRole === 'HR_MANAGER') &&
                      ['MANAGER', 'HR_MANAGER', 'HOSPITAL_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'MEDINEXA_ADMIN'].includes(
                        (editLoginIdStaff.user?.role?.code || editLoginIdStaff.designation || '').toUpperCase(),
                      ))
                  }
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingLoginId ? 'Saving...' : 'Save New ID'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Format: <code>ROLE_PREFIX.NAME[-SUBDEPT]-LAST4MOBILE</code>. Example: <code>DR.AYUSH-CARDIO-0263</code>. Validated for uniqueness and hospital scope.
              </p>
            </div>

            {/* Invalidation Security Notice (Section 13) */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Security Notice:</strong> Updating the Staff Login ID updates the canonical database record. The previous ID will immediately become invalid.
              </div>
            </div>

            {/* Regenerate Staff Login ID Section (Section 38) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {!showRegenerateConfirm ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Auto-Regenerate ID</div>
                    <div className="text-[11px] text-slate-500">
                      Re-compute canonical ID using current role, normalized first name, and phone.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRegenerateConfirm(true)}
                    disabled={
                      (currentUserRole === 'MANAGER' || currentUserRole === 'HR_MANAGER') &&
                      ['MANAGER', 'HR_MANAGER', 'HOSPITAL_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'MEDINEXA_ADMIN'].includes(
                        (editLoginIdStaff.user?.role?.code || editLoginIdStaff.designation || '').toUpperCase(),
                      )
                    }
                    className="px-3 py-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    Regenerate Staff ID
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-2.5">
                  <div className="text-xs font-bold text-rose-800 dark:text-rose-300">
                    Confirm Staff ID Regeneration
                  </div>
                  <p className="text-[11px] text-rose-700 dark:text-rose-400 leading-relaxed">
                    Changing the Staff Login ID will require the staff member to use the new ID for future login. The old ID will be permanently invalidated.
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowRegenerateConfirm(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRegenerateStaffId(editLoginIdStaff.id)}
                      disabled={isUpdatingLoginId}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {isUpdatingLoginId ? 'Regenerating...' : 'Yes, Regenerate ID'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setEditLoginIdStaff(null);
                  setShowRegenerateConfirm(false);
                  setLoginIdModalError(null);
                  setLoginIdModalSuccess(null);
                }}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-200 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

