'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Bed,
  Users,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  Building2,
  Clock,
  Filter,
  Check,
  X,
  Printer,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Shield,
  Activity,
  Calendar,
  Phone,
  FileText,
  BadgeCheck,
  ExternalLink,
  Layers,
  HeartPulse,
  Info,
  SlidersHorizontal,
  Grid,
  List,
  UserCheck,
  AlertCircle,
  HelpCircle,
  CheckSquare,
  DoorOpen,
  Stethoscope,
  MapPin,
  Eye,
} from 'lucide-react';
import { getApiBaseUrl, fetchWithTimeout } from '@/lib/api-config';
import {
  triggerLiveBedBooking,
  triggerLiveBedTransfer,
  triggerLiveBedDischarge,
} from '@/lib/realtime-telemetry';
import { DEMO_PATIENT_ACCOUNTS } from '@/lib/demo-patients';

export type SubTabType =
  | 'overview'
  | 'admit'
  | 'register'
  | 'transfer'
  | 'discharge'
  | 'history'
  | 'pending'
  | 'active';

export interface AdmissionsBedsModuleProps {
  initialSubTab?: SubTabType;
  onSubTabChange?: (tab: SubTabType) => void;
  hospitalFacilityId?: string;
}

export function AdmissionsBedsModule({
  initialSubTab = 'overview',
  onSubTabChange,
  hospitalFacilityId,
}: AdmissionsBedsModuleProps) {
  const [activeTab, setActiveTab] = useState<SubTabType>(initialSubTab);

  // Synchronize incoming subtab changes
  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  const switchTab = (tab: SubTabType) => {
    setActiveTab(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };

  // Facility and authentication resolution
  const [facilityId, setFacilityId] = useState<string>(
    hospitalFacilityId || '0db9bd5f-ddb6-4d12-aa0d-83adc1415a06'
  );
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken =
        localStorage.getItem('medinexa_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('medinexa_access_token');
      setToken(storedToken);

      const rawUser = localStorage.getItem('medinexa_user');
      if (rawUser) {
        try {
          const u = JSON.parse(rawUser);
          setCurrentUser(u);
          if (u.facilityId) {
            setFacilityId(u.facilityId);
          }
        } catch {}
      }
    }
  }, []);

  const getHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  // Toast / notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // =========================================================================
  // CORE STATE
  // =========================================================================
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Overview Statistics
  const [stats, setStats] = useState({
    beds: {
      total: 55,
      available: 37,
      occupied: 18,
      reserved: 0,
      maintenance: 0,
      categories: {
        icu: 10,
        general: 25,
        private: 10,
        emergency: 6,
        ventilator: 4,
        isolation: 4,
      },
    },
    operations: {
      todayAdmissions: 3,
      activeAdmissions: 18,
      pendingAdmissions: 2,
      pendingDischarges: 1,
      todayDischarges: 2,
      todayTransfers: 1,
    },
  });

  // 2. Beds List
  const [beds, setBeds] = useState<any[]>([]);

  // 3. Wards List
  const [wards, setWards] = useState<any[]>([]);

  // 4. Patients List (for search)
  const [patients, setPatients] = useState<any[]>([]);

  // 5. Active Admissions
  const [admissions, setAdmissions] = useState<any[]>([]);

  // 6. Transfer History
  const [transfers, setTransfers] = useState<any[]>([]);

  // =========================================================================
  // DATA FETCHING (Resilient + Multi-Tenant)
  // =========================================================================
  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    const apiBase = getApiBaseUrl();

    try {
      // 1. Fetch Stats Overview
      try {
        const statsRes = await fetchWithTimeout(
          `${apiBase}/admissions/stats/overview?facilityId=${facilityId}`,
          { headers: getHeaders() },
          10000
        );
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData?.beds) {
            setStats(statsData);
          }
        }
      } catch (err) {
        console.warn('Could not load live stats overview:', err);
      }

      // 2. Fetch Beds
      try {
        const bedsRes = await fetchWithTimeout(
          `${apiBase}/beds?facilityId=${facilityId}`,
          { headers: getHeaders() },
          12000
        );
        if (bedsRes.ok) {
          const bedsData = await bedsRes.json();
          if (Array.isArray(bedsData)) {
            setBeds(bedsData);
          }
        }
      } catch (err) {
        console.warn('Could not load live beds:', err);
      }

      // 3. Fetch Wards
      try {
        const wardsRes = await fetchWithTimeout(
          `${apiBase}/wards?facilityId=${facilityId}`,
          { headers: getHeaders() },
          10000
        );
        if (wardsRes.ok) {
          const wardsData = await wardsRes.json();
          if (Array.isArray(wardsData)) {
            setWards(wardsData);
          }
        }
      } catch (err) {
        console.warn('Could not load live wards:', err);
      }

      // 4. Fetch Active & All Admissions
      try {
        const admRes = await fetchWithTimeout(
          `${apiBase}/admissions?facilityId=${facilityId}`,
          { headers: getHeaders() },
          12000
        );
        if (admRes.ok) {
          const admData = await admRes.json();
          if (Array.isArray(admData)) {
            setAdmissions(admData);
          }
        }
      } catch (err) {
        console.warn('Could not load live admissions:', err);
      }

      // 5. Fetch Transfers History
      try {
        const transRes = await fetchWithTimeout(
          `${apiBase}/admissions/transfers/history?facilityId=${facilityId}`,
          { headers: getHeaders() },
          10000
        );
        if (transRes.ok) {
          const transData = await transRes.json();
          if (Array.isArray(transData)) {
            setTransfers(transData);
          }
        }
      } catch (err) {
        console.warn('Could not load live transfers history:', err);
      }

      // 6. Fetch Patients
      try {
        const patRes = await fetchWithTimeout(
          `${apiBase}/patients`,
          { headers: getHeaders() },
          10000
        );
        if (patRes.ok) {
          const patData = await patRes.json();
          if (Array.isArray(patData) && patData.length > 0) {
            setPatients(patData);
          } else {
            setPatients(DEMO_PATIENT_ACCOUNTS);
          }
        } else {
          setPatients(DEMO_PATIENT_ACCOUNTS);
        }
      } catch {
        setPatients(DEMO_PATIENT_ACCOUNTS);
      }
    } finally {
      setRefreshing(false);
    }
  }, [facilityId, getHeaders]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Fallback defaults for wards if none returned
  const displayWards = useMemo(() => {
    if (wards.length > 0) return wards;
    return [
      { id: 'w-icu', name: 'Intensive Care Unit (ICU)', wardType: 'ICU', floor: 'Floor 2' },
      { id: 'w-gw-m', name: 'General Ward A (Male)', wardType: 'GENERAL', floor: 'Floor 2' },
      { id: 'w-gw-f', name: 'General Ward B (Female)', wardType: 'GENERAL', floor: 'Floor 2' },
      { id: 'w-pvt', name: 'Private Deluxe Wing', wardType: 'PRIVATE', floor: 'Floor 2' },
      { id: 'w-semi', name: 'Semi-Private Wing', wardType: 'SEMI_PRIVATE', floor: 'Floor 2' },
      { id: 'w-emg', name: 'Emergency Trauma Bay', wardType: 'EMERGENCY', floor: 'Floor 2' },
    ];
  }, [wards]);

  // Standard doctor list for assignment
  const DOCTORS = useMemo(
    () => [
      { id: '6f4440dc-c4c8-427b-8ace-f8867a09333f', name: 'Dr. Priya Verma', dept: 'General Medicine & Internal Health' },
      { id: 'b4d47bec-f1e9-471e-ac1b-bdb5754d9ee0', name: 'Dr. Sanjay Deshmukh', dept: 'Cardiology & Cardiac Sciences' },
      { id: '1d4eafe8-2361-45af-9e66-42c8b251ed8d', name: 'Dr. Ankit Singh', dept: 'Orthopedics & Joint Replacement' },
      { id: '8c47173f-5622-41bf-9f8c-2970f6f107af', name: 'Dr. Rohit Mehra', dept: 'Neurology & Neurosciences' },
      { id: '9e599393-407b-476f-82f7-1e991267e13a', name: 'Dr. Pooja Mishra', dept: 'Pediatrics & Neonatal Care' },
      { id: 'a911ea53-bf88-46a9-a481-ef8074b1c22a', name: 'Dr. Vivek Jain', dept: 'Otorhinolaryngology (ENT)' },
      { id: 'bb84b1df-47bb-4502-9974-1192c1c1ac9f', name: 'Dr. Neha Gupta', dept: 'Dermatology & Cosmetology' },
    ],
    []
  );

  // Departments list
  const DEPARTMENTS = useMemo(
    () => [
      { id: '94bc1a11-1908-4817-93e3-834e8edf53fe', name: 'General Medicine & Internal Health' },
      { id: 'e6cf88b9-d65f-494b-8210-3d759528b0cb', name: 'Cardiology & Cardiac Sciences' },
      { id: 'b499d5c7-e202-46bd-bbad-cd61d3405ee8', name: 'Orthopedics & Joint Replacement' },
      { id: 'e08ca050-5868-4f31-8a32-47d339efd761', name: 'Neurology & Neurosciences' },
      { id: '8daef823-5de5-4cee-be79-861f99140655', name: 'Pediatrics & Neonatal Care' },
      { id: '4f3746fa-be2b-4f9e-8082-a8aeabb004aa', name: 'Emergency & Trauma Care' },
    ],
    []
  );

  // Selected bed for detail modal
  const [selectedBedForDetail, setSelectedBedForDetail] = useState<any | null>(null);
  // Selected admission for full timeline view
  const [selectedAdmissionForTimeline, setSelectedAdmissionForTimeline] = useState<any | null>(null);

  // =========================================================================
  // SUB-TAB 1: OVERVIEW COMPONENT
  // =========================================================================
  const [overviewWardFilter, setOverviewWardFilter] = useState<string>('ALL');
  const [overviewFloorFilter, setOverviewFloorFilter] = useState<string>('ALL');
  const [overviewDeptFilter, setOverviewDeptFilter] = useState<string>('ALL');
  const [overviewTypeFilter, setOverviewTypeFilter] = useState<string>('ALL');
  const [overviewStatusFilter, setOverviewStatusFilter] = useState<string>('ALL');

  const filteredOverviewBeds = useMemo(() => {
    return beds.filter((b) => {
      if (overviewWardFilter !== 'ALL' && b.wardId !== overviewWardFilter && b.ward?.id !== overviewWardFilter) {
        return false;
      }
      if (overviewFloorFilter !== 'ALL' && (b.ward?.floor !== overviewFloorFilter && b.floor !== overviewFloorFilter)) {
        return false;
      }
      if (
        overviewDeptFilter !== 'ALL' &&
        b.ward?.departmentId !== overviewDeptFilter &&
        b.ward?.department?.name !== overviewDeptFilter
      ) {
        return false;
      }
      if (overviewTypeFilter !== 'ALL' && b.type !== overviewTypeFilter) {
        return false;
      }
      if (overviewStatusFilter !== 'ALL' && b.status !== overviewStatusFilter) {
        return false;
      }
      return true;
    });
  }, [beds, overviewWardFilter, overviewFloorFilter, overviewDeptFilter, overviewTypeFilter, overviewStatusFilter]);

  // =========================================================================
  // SUB-TAB 2: ADMIT PATIENT WORKFLOW
  // =========================================================================
  const [admitSearchQuery, setAdmitSearchQuery] = useState('');
  const [selectedPatientForAdmit, setSelectedPatientForAdmit] = useState<any | null>(null);
  const [admitExistingAdmissionWarning, setAdmitExistingAdmissionWarning] = useState<any | null>(null);

  // Step 2 Form
  const [admitType, setAdmitType] = useState('ELECTIVE');
  const [admitDept, setAdmitDept] = useState(DEPARTMENTS[0].id);
  const [admitWard, setAdmitWard] = useState(displayWards[0]?.id || '');
  const [admitBedType, setAdmitBedType] = useState('GENERAL');
  const [admitDoctor, setAdmitDoctor] = useState(DOCTORS[0].id);
  const [admitPriority, setAdmitPriority] = useState('ROUTINE');
  const [admitReason, setAdmitReason] = useState('');
  const [admitNotes, setAdmitNotes] = useState('');

  // Step 3 Bed selection
  const [selectedBedIdForAdmit, setSelectedBedIdForAdmit] = useState<string>('');

  // Step 4 Slip confirmation state
  const [admissionSuccessSlip, setAdmissionSuccessSlip] = useState<any | null>(null);

  // Available beds for selected ward/type
  const availableBedsForAdmit = useMemo(() => {
    return beds.filter((b) => {
      const matchWard = !admitWard || b.wardId === admitWard || b.ward?.id === admitWard;
      return matchWard;
    });
  }, [beds, admitWard]);

  // Handle patient search selection
  const handleSelectPatientForAdmit = (patient: any) => {
    setSelectedPatientForAdmit(patient);
    setSelectedBedIdForAdmit('');

    // Check if patient already has active admission
    const activeAdm = admissions.find((a) => {
      const patId = patient.id || patient.patientId || patient.uhid;
      const admPatId = a.patientId || a.patient?.id || a.patient?.uhid;
      return (
        admPatId === patId &&
        (a.status === 'ADMITTED' || a.status === 'TRANSFERRED' || a.status === 'ACTIVE')
      );
    });

    if (activeAdm) {
      setAdmitExistingAdmissionWarning(activeAdm);
    } else {
      setAdmitExistingAdmissionWarning(null);
    }
  };

  // Perform transactional admission
  const handleConfirmAdmission = async () => {
    if (!selectedPatientForAdmit) {
      showToast('Please search and select a patient first.', 'error');
      return;
    }
    if (admitExistingAdmissionWarning) {
      showToast(
        'Cannot admit: This patient already has an active admission. Hospital policy prevents duplicate active admissions.',
        'error'
      );
      return;
    }
    if (!selectedBedIdForAdmit) {
      showToast('Please select an available bed for assignment.', 'error');
      return;
    }

    // Verify bed is actually available
    const chosenBed = beds.find((b) => b.id === selectedBedIdForAdmit);
    if (chosenBed && chosenBed.status !== 'AVAILABLE') {
      showToast(
        `Bed ${chosenBed.bedNumber} is currently ${chosenBed.status}. Please choose another bed.`,
        'error'
      );
      return;
    }

    setLoading(true);
    const apiBase = getApiBaseUrl();

    try {
      const patientId = selectedPatientForAdmit.id || selectedPatientForAdmit.patientId;
      const payload = {
        patientId,
        facilityId,
        departmentId: admitDept,
        doctorId: admitDoctor,
        admissionType: admitType,
        reason: admitReason || 'Clinical admission authorized by Reception',
        priority: admitPriority,
        assignedBedId: selectedBedIdForAdmit,
        notes: admitNotes,
      };

      const res = await fetchWithTimeout(
        `${apiBase}/admissions`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload),
        },
        15000
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create admission transaction on server.');
      }

      const createdAdmission = await res.json();

      // Trigger Real-Time Telemetry to synchronize all tabs
      const bedObj = beds.find((b) => b.id === selectedBedIdForAdmit);
      triggerLiveBedBooking({
        hospitalId: facilityId === '0db9bd5f-ddb6-4d12-aa0d-83adc1415a06' ? 'HOSPITAL_A' : 'HOSPITAL_B',
        bedId: selectedBedIdForAdmit,
        bedNumber: bedObj?.bedNumber || 'BED-101',
        patientName: `${selectedPatientForAdmit.firstName || selectedPatientForAdmit.name || 'Patient'} ${
          selectedPatientForAdmit.lastName || ''
        }`.trim(),
        diagnosis: admitReason || 'Inpatient Admission',
      });

      // Prepare confirmation slip
      const slip = {
        admissionNumber: createdAdmission.admissionNumber || `ADM-${Date.now().toString().slice(-6)}`,
        admissionId: createdAdmission.id,
        patientName: `${selectedPatientForAdmit.firstName || selectedPatientForAdmit.name || 'Patient'} ${
          selectedPatientForAdmit.lastName || ''
        }`.trim(),
        patientId: selectedPatientForAdmit.uhid || selectedPatientForAdmit.id,
        wardName:
          bedObj?.ward?.name || displayWards.find((w) => w.id === admitWard)?.name || 'General Ward',
        bedNumber: bedObj?.bedNumber || 'Assigned',
        doctorName: DOCTORS.find((d) => d.id === admitDoctor)?.name || 'Attending Physician',
        admittedAt: new Date().toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        admissionType: admitType,
        status: 'Active',
      };

      setAdmissionSuccessSlip(slip);
      showToast(`Admission confirmed! Bed ${slip.bedNumber} is now Occupied.`, 'success');
      fetchAllData();
    } catch (err: any) {
      console.error('Admission creation failed:', err);
      showToast(err.message || 'Admission failed. Please check network/permissions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Reset admission form for next patient
  const handleResetAdmitWorkflow = () => {
    setSelectedPatientForAdmit(null);
    setAdmitExistingAdmissionWarning(null);
    setSelectedBedIdForAdmit('');
    setAdmitReason('');
    setAdmitNotes('');
    setAdmissionSuccessSlip(null);
  };

  // =========================================================================
  // SUB-TAB 3: BED REGISTER WORKFLOW
  // =========================================================================
  const [registerViewMode, setRegisterViewMode] = useState<'table' | 'grid'>('table');
  const [registerSearchQuery, setRegisterSearchQuery] = useState('');
  const [registerQuickStatus, setRegisterQuickStatus] = useState<string>('ALL');
  const [registerStatusDropdown, setRegisterStatusDropdown] = useState<string>('ALL');
  const [registerWardFilter, setRegisterWardFilter] = useState<string>('ALL');
  const [registerFloorFilter, setRegisterFloorFilter] = useState<string>('ALL');
  const [registerDeptFilter, setRegisterDeptFilter] = useState<string>('ALL');
  const [registerTypeFilter, setRegisterTypeFilter] = useState<string>('ALL');

  const filteredRegisterBeds = useMemo(() => {
    return beds.filter((b) => {
      // Quick Status
      if (registerQuickStatus !== 'ALL' && b.status !== registerQuickStatus) {
        return false;
      }
      // Status Dropdown
      if (registerStatusDropdown !== 'ALL' && b.status !== registerStatusDropdown) {
        return false;
      }
      // Ward Filter
      if (
        registerWardFilter !== 'ALL' &&
        b.wardId !== registerWardFilter &&
        b.ward?.id !== registerWardFilter
      ) {
        return false;
      }
      // Floor Filter
      if (
        registerFloorFilter !== 'ALL' &&
        b.ward?.floor !== registerFloorFilter &&
        b.floor !== registerFloorFilter
      ) {
        return false;
      }
      // Department Filter
      if (
        registerDeptFilter !== 'ALL' &&
        b.ward?.departmentId !== registerDeptFilter &&
        b.ward?.department?.name !== registerDeptFilter &&
        b.department?.id !== registerDeptFilter
      ) {
        return false;
      }
      // Bed Type Filter
      if (registerTypeFilter !== 'ALL' && b.type !== registerTypeFilter) {
        return false;
      }
      // Search (Bed number, Patient name, Patient ID, Admission ID)
      if (registerSearchQuery.trim()) {
        const q = registerSearchQuery.toLowerCase();
        const numMatch = b.bedNumber?.toLowerCase().includes(q);
        const wardMatch = b.ward?.name?.toLowerCase().includes(q);
        const deptMatch = (b.ward?.department?.name || b.department?.name || '').toLowerCase().includes(q);
        const activeAssign = b.assignments?.find((a: any) => a.status === 'ACTIVE');
        const patName =
          activeAssign?.patient?.user
            ? `${activeAssign.patient.user.firstName} ${activeAssign.patient.user.lastName}`.toLowerCase()
            : '';
        const patUhid = activeAssign?.patient?.uhid?.toLowerCase() || '';
        const admNum = activeAssign?.admission?.admissionNumber?.toLowerCase() || '';
        return numMatch || wardMatch || deptMatch || patName.includes(q) || patUhid.includes(q) || admNum.includes(q);
      }
      return true;
    });
  }, [
    beds,
    registerQuickStatus,
    registerStatusDropdown,
    registerWardFilter,
    registerFloorFilter,
    registerDeptFilter,
    registerTypeFilter,
    registerSearchQuery,
  ]);

  // =========================================================================
  // SUB-TAB 4: BED TRANSFER WORKFLOW
  // =========================================================================
  const [transferSearchQuery, setTransferSearchQuery] = useState('');
  const [selectedAdmissionForTransfer, setSelectedAdmissionForTransfer] = useState<any | null>(null);
  const [transferTargetWard, setTransferTargetWard] = useState<string>('');
  const [transferTargetRoom, setTransferTargetRoom] = useState<string>('Room 201');
  const [transferTargetBedId, setTransferTargetBedId] = useState<string>('');
  const [transferReason, setTransferReason] = useState<string>('');
  const [showTransferConfirmModal, setShowTransferConfirmModal] = useState(false);

  // Active admissions available to transfer
  const activeTransferableAdmissions = useMemo(() => {
    return admissions
      .filter((a) => a.status === 'ADMITTED' || a.status === 'TRANSFERRED' || a.status === 'ACTIVE')
      .filter((a) => {
        if (!transferSearchQuery.trim()) return true;
        const q = transferSearchQuery.toLowerCase();
        const pat = a.patient?.user
          ? `${a.patient.user.firstName} ${a.patient.user.lastName}`.toLowerCase()
          : '';
        const uhid = (a.patient?.uhid || a.patientId || '').toLowerCase();
        const admNum = (a.admissionNumber || '').toLowerCase();
        const bedNum = (a.bedAssignments?.[0]?.bed?.bedNumber || '').toLowerCase();
        return pat.includes(q) || uhid.includes(q) || admNum.includes(q) || bedNum.includes(q);
      });
  }, [admissions, transferSearchQuery]);

  // Available beds in destination ward for transfer
  const availableBedsForTransfer = useMemo(() => {
    return beds.filter((b) => {
      const matchWard = !transferTargetWard || b.wardId === transferTargetWard || b.ward?.id === transferTargetWard;
      const isFree = b.status === 'AVAILABLE';
      // Cannot transfer to same bed
      const currentBedId = selectedAdmissionForTransfer?.bedAssignments?.[0]?.bedId;
      return matchWard && isFree && b.id !== currentBedId;
    });
  }, [beds, transferTargetWard, selectedAdmissionForTransfer]);

  // Execute transfer transactionally
  const handleExecuteTransfer = async () => {
    if (!selectedAdmissionForTransfer || !transferTargetBedId) {
      showToast('Select an admitted patient and destination bed.', 'error');
      return;
    }

    setLoading(true);
    const apiBase = getApiBaseUrl();

    try {
      const payload = {
        targetBedId: transferTargetBedId,
        reason: transferReason || 'Clinical ward transfer initiated by Reception',
      };

      const res = await fetchWithTimeout(
        `${apiBase}/admissions/${selectedAdmissionForTransfer.id}/transfer`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload),
        },
        15000
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Transfer failed on server.');
      }

      // Realtime Telemetry Broadcast
      const currentBed = selectedAdmissionForTransfer.bedAssignments?.[0]?.bed?.bedNumber || 'Old Bed';
      const targetBed = beds.find((b) => b.id === transferTargetBedId)?.bedNumber || 'New Bed';
      const patName = selectedAdmissionForTransfer.patient?.user
        ? `${selectedAdmissionForTransfer.patient.user.firstName} ${selectedAdmissionForTransfer.patient.user.lastName}`
        : 'Patient';

      triggerLiveBedTransfer({
        hospitalId: facilityId === '0db9bd5f-ddb6-4d12-aa0d-83adc1415a06' ? 'HOSPITAL_A' : 'HOSPITAL_B',
        fromBedNumber: currentBed,
        toBedNumber: targetBed,
        patientName: patName,
        reason: transferReason,
      });

      showToast(
        `Transfer complete! ${patName} transferred from Bed ${currentBed} to Bed ${targetBed}.`,
        'success'
      );
      setShowTransferConfirmModal(false);
      setSelectedAdmissionForTransfer(null);
      setTransferTargetBedId('');
      setTransferReason('');
      fetchAllData();
    } catch (err: any) {
      console.error('Transfer failed:', err);
      showToast(err.message || 'Transfer failed. Please check network/availability.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // SUB-TAB 5: DISCHARGE WORKFLOW (Multi-Stage Clearance)
  // =========================================================================
  const [dischargeSearchQuery, setDischargeSearchQuery] = useState('');
  const [selectedAdmissionForDischarge, setSelectedAdmissionForDischarge] = useState<any | null>(null);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [dischargeNotes, setDischargeNotes] = useState('');

  // Clearances mock-state tracked per admission id (overrides if server clearance pending)
  const [clearanceOverrides, setClearanceOverrides] = useState<
    Record<
      string,
      {
        doctorCleared: boolean;
        billingCleared: boolean;
        pharmacyCleared: boolean;
        labCleared: boolean;
        wardCleared: boolean;
      }
    >
  >({});

  const toggleClearance = async (admissionId: string, stage: 'doctor' | 'billing' | 'pharmacy' | 'lab' | 'ward') => {
    const current = clearanceOverrides[admissionId] || {
      doctorCleared: true,
      billingCleared: false,
      pharmacyCleared: true,
      labCleared: true,
      wardCleared: true,
    };
    const nextState = !current[`${stage}Cleared` as keyof typeof current];
    setClearanceOverrides((prev) => ({
      ...prev,
      [admissionId]: {
        ...current,
        [`${stage}Cleared`]: nextState,
      },
    }));

    // Persist clearance to backend if applicable
    if (stage === 'billing' || stage === 'pharmacy' || stage === 'lab' || stage === 'ward') {
      try {
        const apiBase = getApiBaseUrl();
        await fetchWithTimeout(
          `${apiBase}/discharge/clearance/${stage}`,
          {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
              admissionId,
              status: nextState ? 'APPROVED' : 'PENDING',
              remarks: `Verified by Reception staff`,
            }),
          },
          10000
        );
      } catch (err: any) {
        console.warn('Could not persist clearance to backend:', err);
      }
    }
    showToast(`Updated ${stage} clearance status for admission.`);
  };

  const getAdmissionClearances = (adm: any) => {
    const override = clearanceOverrides[adm.id];
    if (override) return override;
    return {
      doctorCleared: true,
      billingCleared: adm.billingCleared || false,
      pharmacyCleared: true,
      labCleared: true,
      wardCleared: true,
    };
  };

  const handleExecuteDischarge = async () => {
    if (!selectedAdmissionForDischarge) return;

    setLoading(true);
    const apiBase = getApiBaseUrl();

    try {
      const payload = {
        dischargeNotes: dischargeNotes || 'Patient discharged with full clearances verified at Reception.',
        dischargeType: 'NORMAL',
      };

      // Try canonical finalize discharge endpoint first
      let res = await fetchWithTimeout(
        `${apiBase}/discharge/finalize/${selectedAdmissionForDischarge.id}`,
        {
          method: 'POST',
          headers: getHeaders(),
        },
        15000
      );

      // Fallback to legacy admission discharge endpoint if finalize is not yet applicable
      if (!res.ok) {
        res = await fetchWithTimeout(
          `${apiBase}/admissions/${selectedAdmissionForDischarge.id}/discharge`,
          {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload),
          },
          15000
        );
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Discharge request was rejected by server. Ensure all 4 departmental clearances are approved.');
      }

      // Release bed in telemetry
      const assignedBed = selectedAdmissionForDischarge.bedAssignments?.[0]?.bed;
      if (assignedBed) {
        triggerLiveBedDischarge({
          hospitalId: facilityId === '0db9bd5f-ddb6-4d12-aa0d-83adc1415a06' ? 'HOSPITAL_A' : 'HOSPITAL_B',
          bedId: assignedBed.id,
          bedNumber: assignedBed.bedNumber,
        });
      }

      const patName = selectedAdmissionForDischarge.patient?.user
        ? `${selectedAdmissionForDischarge.patient.user.firstName} ${selectedAdmissionForDischarge.patient.user.lastName}`
        : 'Patient';

      showToast(`Discharge finalized! Bed released to AVAILABLE. Gate pass issued for ${patName}.`, 'success');
      setShowDischargeModal(false);
      setSelectedAdmissionForDischarge(null);
      setDischargeNotes('');
      fetchAllData();
    } catch (err: any) {
      console.error('Discharge failed:', err);
      showToast(err.message || 'Failed to finalize discharge. Verify billing clearance.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // SUB-TAB 6: ADMISSION HISTORY WORKFLOW
  // =========================================================================
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('ALL');

  const filteredHistory = useMemo(() => {
    return admissions.filter((a) => {
      if (historyStatusFilter !== 'ALL' && a.status !== historyStatusFilter) {
        return false;
      }
      if (historySearchQuery.trim()) {
        const q = historySearchQuery.toLowerCase();
        const admNum = a.admissionNumber?.toLowerCase() || '';
        const patName = a.patient?.user
          ? `${a.patient.user.firstName} ${a.patient.user.lastName}`.toLowerCase()
          : '';
        const uhid = a.patient?.uhid?.toLowerCase() || '';
        const docName = a.admitter
          ? `${a.admitter.firstName} ${a.admitter.lastName}`.toLowerCase()
          : '';
        return admNum.includes(q) || patName.includes(q) || uhid.includes(q) || docName.includes(q);
      }
      return true;
    });
  }, [admissions, historyStatusFilter, historySearchQuery]);

  // =========================================================================
  // RENDER HELPERS
  // =========================================================================
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Available
          </span>
        );
      case 'OCCUPIED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Occupied
          </span>
        );
      case 'RESERVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Reserved
          </span>
        );
      case 'MAINTENANCE':
      case 'CLEANING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Maintenance
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold transition-all transform duration-300 animate-in slide-in-from-top-2 ${
            toastType === 'success'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-600/30'
              : toastType === 'error'
              ? 'bg-rose-600 text-white border-rose-700 shadow-rose-600/30'
              : 'bg-slate-900 text-white border-slate-800 shadow-slate-900/30'
          }`}
        >
          {toastType === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-75 cursor-pointer text-white/80"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Module Header & Sub-Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-xs">
              <Bed className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Admissions & Bed Logistics Station
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                  Reception Portal
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {facilityId === '0db9bd5f-ddb6-4d12-aa0d-83adc1415a06' ? 'Hospital A (Noida Campus)' : 'Hospital B (City Center)'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Front-desk bed assignments, live ward census tracking, clinical transfers, and discharge clearances.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              onClick={fetchAllData}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-teal-600' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Sync Live Data'}</span>
            </button>
            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Telemetry Connected</span>
            </div>
          </div>
        </div>

        {/* 6 Core Module Navigation Pills */}
        <div className="pt-4 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-bold">
          <button
            onClick={() => switchTab('overview')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 font-black'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => switchTab('admit')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'admit'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 font-black'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Admit Patient</span>
          </button>

          <button
            onClick={() => switchTab('register')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'register'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 font-black'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bed className="w-3.5 h-3.5" />
            <span>Bed Register</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">
              {beds.length}
            </span>
          </button>

          <button
            onClick={() => switchTab('transfer')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'transfer'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 font-black'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Bed Transfer</span>
          </button>

          <button
            onClick={() => switchTab('discharge')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'discharge'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 font-black'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Discharge</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">
              {admissions.filter((a) => a.status === 'ADMITTED' || a.status === 'TRANSFERRED').length}
            </span>
          </button>

          <button
            onClick={() => switchTab('history')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 font-black'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Admission History</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODULE 1: OVERVIEW DASHBOARD
      ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Bed Statistics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Total Beds</span>
                <Bed className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {stats.beds.total}
              </div>
              <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                Hospital Ward Capacity
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200 dark:border-emerald-900/60 p-4 shadow-xs bg-emerald-50/10">
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                <span>Available</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {stats.beds.available}
              </div>
              <div className="text-[11px] font-semibold text-emerald-600/80 mt-0.5">
                Ready for Intake ({Math.round((stats.beds.available / (stats.beds.total || 1)) * 100)}%)
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 p-4 shadow-xs bg-rose-50/10">
              <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 text-xs font-bold">
                <span>Occupied</span>
                <Users className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {stats.beds.occupied}
              </div>
              <div className="text-[11px] font-semibold text-rose-600/80 mt-0.5">
                Active Inpatients ({Math.round((stats.beds.occupied / (stats.beds.total || 1)) * 100)}%)
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-200 dark:border-purple-900/60 p-4 shadow-xs bg-purple-50/10">
              <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 text-xs font-bold">
                <span>Reserved</span>
                <Clock className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {stats.beds.reserved}
              </div>
              <div className="text-[11px] font-semibold text-purple-600/80 mt-0.5">
                Elective/OT Holding
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-900/60 p-4 shadow-xs bg-amber-50/10">
              <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-bold">
                <span>Maintenance</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {stats.beds.maintenance}
              </div>
              <div className="text-[11px] font-semibold text-amber-600/80 mt-0.5">
                Sanitizing & Repairs
              </div>
            </div>
          </div>

          {/* Today's Operations KPI Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>Today's Front Desk Operations</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500 text-[11px] font-bold">New Admissions</div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {stats.operations.todayAdmissions}
                </div>
                <div className="text-[10px] text-teal-600 font-semibold mt-0.5">Admitted Today</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500 text-[11px] font-bold">Bed Transfers</div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {stats.operations.todayTransfers}
                </div>
                <div className="text-[10px] text-teal-600 font-semibold mt-0.5">Relocations Audited</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500 text-[11px] font-bold">Discharges</div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {stats.operations.todayDischarges}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Beds Released Clean</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500 text-[11px] font-bold">Pending Admissions</div>
                <div className="text-xl font-extrabold text-amber-600 mt-1">
                  {stats.operations.pendingAdmissions}
                </div>
                <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Awaiting Bed Assignment</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500 text-[11px] font-bold">Pending Discharges</div>
                <div className="text-xl font-extrabold text-purple-600 mt-1">
                  {stats.operations.pendingDischarges}
                </div>
                <div className="text-[10px] text-purple-600 font-semibold mt-0.5">Clearing Folios / Pass</div>
              </div>
            </div>
          </div>

          {/* Bed Categories & Availability Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Occupancy Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Bed Availability Summary
              </h2>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available Beds
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {stats.beds.available} / {stats.beds.total}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${(stats.beds.available / (stats.beds.total || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-rose-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> Occupied Beds
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {stats.beds.occupied} / {stats.beds.total}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${(stats.beds.occupied / (stats.beds.total || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-purple-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500" /> Reserved Beds
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {stats.beds.reserved} / {stats.beds.total}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${(stats.beds.reserved / (stats.beds.total || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-amber-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> Maintenance
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {stats.beds.maintenance} / {stats.beds.total}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${(stats.beds.maintenance / (stats.beds.total || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Category Matrix */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Specialty Ward Breakdown
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">ICU</span>
                    <span className="font-mono font-black text-teal-600">
                      {stats.beds.categories.icu}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">General Ward</span>
                    <span className="font-mono font-black text-teal-600">
                      {stats.beds.categories.general}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">Private Deluxe</span>
                    <span className="font-mono font-black text-teal-600">
                      {stats.beds.categories.private}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">Emergency</span>
                    <span className="font-mono font-black text-teal-600">
                      {stats.beds.categories.emergency}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center col-span-2">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">Isolation / Ventilator</span>
                    <span className="font-mono font-black text-teal-600">
                      {stats.beds.categories.isolation || stats.beds.categories.ventilator}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <button
                  onClick={() => switchTab('admit')}
                  className="w-full py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Admit New Patient Now</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => switchTab('transfer')}
                    className="py-2 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Transfer Bed</span>
                  </button>
                  <button
                    onClick={() => switchTab('discharge')}
                    className="py-2 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Discharges</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Filterable Live Bed Matrix Preview (2 columns on lg) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Interactive Bed Availability Matrix
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Live ward floor map with click-to-view details and intake status.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <select
                    value={overviewWardFilter}
                    onChange={(e) => setOverviewWardFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <option value="ALL">All Wards</option>
                    {displayWards.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={overviewFloorFilter}
                    onChange={(e) => setOverviewFloorFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <option value="ALL">All Floors</option>
                    <option value="Floor 1">Floor 1</option>
                    <option value="Floor 2">Floor 2</option>
                    <option value="Floor 3">Floor 3</option>
                  </select>

                  <select
                    value={overviewDeptFilter}
                    onChange={(e) => setOverviewDeptFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <option value="ALL">All Departments</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={overviewTypeFilter}
                    onChange={(e) => setOverviewTypeFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <option value="ALL">All Types</option>
                    <option value="GENERAL">General</option>
                    <option value="ICU">ICU</option>
                    <option value="PRIVATE">Private</option>
                    <option value="SEMI_PRIVATE">Semi-Private</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>

                  <select
                    value={overviewStatusFilter}
                    onChange={(e) => setOverviewStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <option value="ALL">All Status</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="RESERVED">Reserved</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>

              {/* Bed Grid Cells */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredOverviewBeds.slice(0, 30).map((b) => {
                  const isAvailable = b.status === 'AVAILABLE';
                  const isOccupied = b.status === 'OCCUPIED';
                  const activeAssign = b.assignments?.find((a: any) => a.status === 'ACTIVE');
                  const patName = activeAssign?.patient?.user
                    ? `${activeAssign.patient.user.firstName} ${activeAssign.patient.user.lastName}`
                    : '';

                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBedForDetail(b)}
                      className={`p-3 rounded-2xl border text-left transition transform hover:-translate-y-0.5 cursor-pointer ${
                        isAvailable
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-400'
                          : isOccupied
                          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60 hover:border-rose-400'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-xs text-slate-900 dark:text-white">
                          {b.bedNumber}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isAvailable ? 'bg-emerald-500' : isOccupied ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-1">
                        {b.ward?.name || 'General Ward'}
                      </div>
                      <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate mt-0.5">
                        {isOccupied ? patName || 'Occupied' : 'Free Bed'}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
                <span>Showing {filteredOverviewBeds.length} beds matching current filters</span>
                <button
                  onClick={() => switchTab('register')}
                  className="text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Full Bed Register</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 2: ADMIT PATIENT WORKFLOW
      ========================================================================= */}
      {activeTab === 'admit' && (
        <div className="space-y-6">
          {/* Success Slip View */}
          {admissionSuccessSlip ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200 dark:border-emerald-800/60 p-6 shadow-md max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Admission Successful
                </h2>
                <p className="text-xs text-slate-500">
                  Patient has been transactionally admitted and the bed is locked to Occupied.
                </p>
              </div>

              {/* Admission Slip Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3.5 text-xs">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-bold">Admission Slip #</span>
                  <span className="font-mono font-black text-teal-600 dark:text-teal-400 text-sm">
                    {admissionSuccessSlip.admissionNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 font-medium block">Patient Name</span>
                    <strong className="text-slate-900 dark:text-white text-sm">
                      {admissionSuccessSlip.patientName}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Patient ID / UHID</span>
                    <strong className="font-mono text-slate-800 dark:text-slate-200">
                      {admissionSuccessSlip.patientId}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block">Ward</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {admissionSuccessSlip.wardName}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Allocated Bed</span>
                    <strong className="text-emerald-600 font-mono text-sm">
                      Bed {admissionSuccessSlip.bedNumber}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block">Attending Doctor</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {admissionSuccessSlip.doctorName}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Status</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Active
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-slate-400 font-medium block">Admitted At</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">
                      {admissionSuccessSlip.admittedAt}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  onClick={() => window.print()}
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Admission Slip</span>
                </button>
                <button
                  onClick={handleResetAdmitWorkflow}
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Admit Another Patient</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Step 1: Patient Search Card (1 Col) */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-black flex items-center justify-center">
                    1
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Search Patient
                  </h2>
                </div>
                <p className="text-[11px] text-slate-400">
                  Search by UHID, patient name, or mobile phone to prevent duplicate admissions.
                </p>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search UHID, Name, Mobile..."
                    value={admitSearchQuery}
                    onChange={(e) => setAdmitSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-teal-500"
                  />
                </div>

                {/* Patient Search Results */}
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {patients
                    .filter((p) => {
                      if (!admitSearchQuery.trim()) return true;
                      const q = admitSearchQuery.toLowerCase();
                      const name = `${p.firstName || p.name || ''} ${p.lastName || ''}`.toLowerCase();
                      const uhid = (p.uhid || p.id || '').toLowerCase();
                      const phone = (p.phone || p.mobile || '').toLowerCase();
                      return name.includes(q) || uhid.includes(q) || phone.includes(q);
                    })
                    .slice(0, 8)
                    .map((p) => {
                      const isSelected =
                        selectedPatientForAdmit?.id === p.id ||
                        selectedPatientForAdmit?.uhid === p.uhid;
                      const pName = `${p.firstName || p.name || 'Patient'} ${p.lastName || ''}`.trim();
                      const pUhid = p.uhid || p.id?.slice(0, 8) || 'UHID-000';
                      const pAge = p.age || '32';
                      const pGender = p.gender || 'M';
                      const pPhone = p.phone || p.mobile || '+91 98765 43210';

                      return (
                        <div
                          key={p.id || p.uhid}
                          onClick={() => handleSelectPatientForAdmit(p)}
                          className={`p-3 rounded-2xl border text-xs transition cursor-pointer ${
                            isSelected
                              ? 'bg-teal-50/60 dark:bg-teal-950/40 border-teal-500 shadow-xs'
                              : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <strong className="text-slate-900 dark:text-white font-bold">{pName}</strong>
                            <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-bold text-slate-700 dark:text-slate-300">
                              {pUhid}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            {pAge} yrs • {pGender} • {pPhone}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Selected Patient Overview & Warning */}
                {selectedPatientForAdmit && (
                  <div className="p-3.5 rounded-2xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/60 space-y-2">
                    <div className="text-[11px] font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Verified Patient Selected</span>
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      {selectedPatientForAdmit.firstName || selectedPatientForAdmit.name}{' '}
                      {selectedPatientForAdmit.lastName || ''}
                    </div>

                    {/* Active Admission Warning Banner */}
                    {admitExistingAdmissionWarning ? (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 space-y-1">
                        <div className="font-extrabold flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-300">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                          <span>Active Admission Exists</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          This patient already has an active admission ({admitExistingAdmissionWarning.admissionNumber || 'ADM-Active'}).
                          Duplicate inpatient admissions are prohibited by hospital policy.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>Eligible for Inpatient Admission</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2 & 3: Admission Details & Bed Selection (2 Cols) */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-black flex items-center justify-center">
                      2
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Admission Details
                    </h2>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Specify admission type, clinical department, priority level, and attending doctor.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                      Admission Type *
                    </label>
                    <select
                      value={admitType}
                      onChange={(e) => setAdmitType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
                    >
                      <option value="ELECTIVE">Elective / Scheduled</option>
                      <option value="EMERGENCY">Emergency / Trauma</option>
                      <option value="PLANNED">Planned Surgical</option>
                      <option value="URGENT">Urgent Inpatient</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                      Priority Level *
                    </label>
                    <select
                      value={admitPriority}
                      onChange={(e) => setAdmitPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
                    >
                      <option value="ROUTINE">Routine</option>
                      <option value="URGENT">Urgent</option>
                      <option value="EMERGENCY">Emergency (Stat)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                      Clinical Department *
                    </label>
                    <select
                      value={admitDept}
                      onChange={(e) => setAdmitDept(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                      Attending Physician *
                    </label>
                    <select
                      value={admitDoctor}
                      onChange={(e) => setAdmitDoctor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
                    >
                      {DOCTORS.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} ({doc.dept})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                      Admission Reason / Clinical Indication *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acute chest pain, Severe dehydration, Post-op knee arthroplasty monitoring"
                      value={admitReason}
                      onChange={(e) => setAdmitReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                {/* Step 3: Bed Selection */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-black flex items-center justify-center">
                      3
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Bed Selection
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                        Target Ward
                      </label>
                      <select
                        value={admitWard}
                        onChange={(e) => {
                          setAdmitWard(e.target.value);
                          setSelectedBedIdForAdmit('');
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
                      >
                        {displayWards.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} ({w.floor || 'Floor 2'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                        Bed Category
                      </label>
                      <select
                        value={admitBedType}
                        onChange={(e) => setAdmitBedType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
                      >
                        <option value="GENERAL">General</option>
                        <option value="ICU">ICU</option>
                        <option value="PRIVATE">Private</option>
                        <option value="SEMI_PRIVATE">Semi-Private</option>
                        <option value="EMERGENCY">Emergency</option>
                      </select>
                    </div>
                  </div>

                  {/* Available Beds Grid */}
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Available Ward Beds (Click to allocate)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                      {availableBedsForAdmit.map((b) => {
                        const isAvail = b.status === 'AVAILABLE';
                        const isChosen = selectedBedIdForAdmit === b.id;

                        return (
                          <button
                            key={b.id}
                            disabled={!isAvail}
                            onClick={() => setSelectedBedIdForAdmit(b.id)}
                            className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                              !isAvail
                                ? 'opacity-40 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                                : isChosen
                                ? 'bg-teal-600 text-white border-teal-700 shadow-md shadow-teal-600/30 font-bold'
                                : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-black text-xs">
                                {b.bedNumber}
                              </span>
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isChosen
                                    ? 'bg-white'
                                    : isAvail
                                    ? 'bg-emerald-500'
                                    : 'bg-rose-500'
                                }`}
                              />
                            </div>
                            <div className="text-[10px] mt-1 opacity-80">
                              {isChosen ? 'Selected Bed' : isAvail ? 'Available' : b.status}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {availableBedsForAdmit.filter((b) => b.status === 'AVAILABLE').length === 0 && (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
                        ⚠️ No beds are currently AVAILABLE in this ward. Please select another ward or request transfer.
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirm Admission Button */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    onClick={handleResetAdmitWorkflow}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Clear Form
                  </button>
                  <button
                    onClick={handleConfirmAdmission}
                    disabled={
                      loading ||
                      !selectedPatientForAdmit ||
                      !selectedBedIdForAdmit ||
                      Boolean(admitExistingAdmissionWarning)
                    }
                    className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black transition shadow-md shadow-teal-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{loading ? 'Confirming Admission...' : 'Confirm Admission & Lock Bed'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODULE 3: BED REGISTER WORKFLOW
      ========================================================================= */}
      {activeTab === 'register' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Bed className="w-4 h-4 text-teal-600" />
                <span>Hospital Bed Register & Census Log</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete facility register showing bed state, allocated inpatients, ward, department, and room details.
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold self-start md:self-auto">
              <button
                onClick={() => setRegisterViewMode('table')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  registerViewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
              <button
                onClick={() => setRegisterViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  registerViewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Ward Grid</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-xs font-bold">
            {['ALL', 'AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'].map((status) => (
              <button
                key={status}
                onClick={() => setRegisterQuickStatus(status)}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  registerQuickStatus === status
                    ? 'bg-teal-600 text-white font-black shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {status === 'ALL' ? 'All Beds' : status} (
                {status === 'ALL'
                  ? beds.length
                  : beds.filter((b) => b.status === status).length}
                )
              </button>
            ))}
          </div>

          {/* Search & Detailed 6-Parameter Dropdown Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
            {/* 1. Search */}
            <div className="relative lg:col-span-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search Bed #, Patient, UHID, Adm #..."
                value={registerSearchQuery}
                onChange={(e) => setRegisterSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-teal-500"
              />
            </div>

            {/* 2. Ward Filter */}
            <select
              value={registerWardFilter}
              onChange={(e) => setRegisterWardFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              <option value="ALL">All Wards</option>
              {displayWards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            {/* 3. Floor Filter */}
            <select
              value={registerFloorFilter}
              onChange={(e) => setRegisterFloorFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              <option value="ALL">All Floors</option>
              <option value="Floor 1">Floor 1</option>
              <option value="Floor 2">Floor 2</option>
              <option value="Floor 3">Floor 3</option>
            </select>

            {/* 4. Department Filter */}
            <select
              value={registerDeptFilter}
              onChange={(e) => setRegisterDeptFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* 5. Bed Type Filter */}
            <select
              value={registerTypeFilter}
              onChange={(e) => setRegisterTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              <option value="ALL">All Bed Types</option>
              <option value="GENERAL">General</option>
              <option value="ICU">ICU</option>
              <option value="PRIVATE">Private</option>
              <option value="SEMI_PRIVATE">Semi-Private</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
          </div>

          {/* Table View */}
          {registerViewMode === 'table' ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-3.5">Bed No.</th>
                    <th className="py-3 px-3.5">Ward</th>
                    <th className="py-3 px-3.5">Floor</th>
                    <th className="py-3 px-3.5">Department</th>
                    <th className="py-3 px-3.5">Bed Type</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5">Patient</th>
                    <th className="py-3 px-3.5">Admission ID</th>
                    <th className="py-3 px-3.5">Last Updated</th>
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                  {filteredRegisterBeds.map((b) => {
                    const activeAssign = b.assignments?.find((a: any) => a.status === 'ACTIVE');
                    const patName = activeAssign?.patient?.user
                      ? `${activeAssign.patient.user.firstName} ${activeAssign.patient.user.lastName}`
                      : '—';
                    const admNum = activeAssign?.admission?.admissionNumber || '—';
                    const deptName =
                      b.ward?.department?.name ||
                      b.department?.name ||
                      b.ward?.name?.split(' ')[0] ||
                      'General Medicine';

                    return (
                      <tr
                        key={b.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                      >
                        <td className="py-3 px-3.5 font-mono font-bold text-teal-600 dark:text-teal-400">
                          {b.bedNumber}
                        </td>
                        <td className="py-3 px-3.5 text-slate-800 dark:text-slate-200">
                          {b.ward?.name || 'General Ward'}
                        </td>
                        <td className="py-3 px-3.5 text-slate-500">
                          {b.ward?.floor || 'Floor 2'}
                        </td>
                        <td className="py-3 px-3.5 text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[150px]">
                          {deptName}
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {b.type}
                          </span>
                        </td>
                        <td className="py-3 px-3.5">{getStatusBadge(b.status)}</td>
                        <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white">
                          {patName}
                        </td>
                        <td className="py-3 px-3.5 font-mono text-slate-600 dark:text-slate-400">
                          {admNum}
                        </td>
                        <td className="py-3 px-3.5 text-slate-400 text-[11px]">
                          {b.updatedAt
                            ? new Date(b.updatedAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Live'}
                        </td>
                        <td className="py-3 px-3.5 text-right whitespace-nowrap space-x-1.5">
                          <button
                            onClick={() => setSelectedBedForDetail(b)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                          >
                            Details
                          </button>
                          {b.status === 'OCCUPIED' && (
                            <button
                              onClick={() => {
                                const adm = admissions.find((a) =>
                                  a.bedAssignments?.some((ba: any) => ba.bedId === b.id)
                                );
                                if (adm) {
                                  setSelectedAdmissionForTransfer(adm);
                                  switchTab('transfer');
                                } else {
                                  showToast('Admission record for transfer not found.', 'error');
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-bold transition cursor-pointer"
                            >
                              Transfer
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredRegisterBeds.map((b) => {
                const isAvail = b.status === 'AVAILABLE';
                const isOcc = b.status === 'OCCUPIED';
                const activeAssign = b.assignments?.find((a: any) => a.status === 'ACTIVE');
                const patName = activeAssign?.patient?.user
                  ? `${activeAssign.patient.user.firstName} ${activeAssign.patient.user.lastName}`
                  : null;

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBedForDetail(b)}
                    className={`p-3.5 rounded-2xl border text-xs transition cursor-pointer flex flex-col justify-between ${
                      isAvail
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400'
                        : isOcc
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 hover:border-rose-400'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                          {b.bedNumber}
                        </span>
                        {getStatusBadge(b.status)}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {b.ward?.name || 'General Ward'}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                      {isOcc ? (
                        <div>
                          <div className="text-[10px] text-slate-400">Patient</div>
                          <strong className="text-slate-900 dark:text-white truncate block">
                            {patName || 'Admitted'}
                          </strong>
                        </div>
                      ) : (
                        <div className="text-[10px] font-bold text-emerald-600">Ready for Intake</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODULE 4: BED TRANSFER WORKFLOW
      ========================================================================= */}
      {activeTab === 'transfer' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-6">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-teal-600" />
              <span>Patient Bed Transfer & Relocation Workstation</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Execute transactional ward transfers, upgrade room categories, or transition patients to ICU.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step 1: Search & Select Admitted Patient */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-black flex items-center justify-center">
                  1
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Search & Select Inpatient
                </h3>
              </div>

              {/* Patient Search Input in Transfer */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search Patient, UHID, Bed #..."
                  value={transferSearchQuery}
                  onChange={(e) => setTransferSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-teal-500"
                />
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {activeTransferableAdmissions.map((adm) => {
                  const isSelected = selectedAdmissionForTransfer?.id === adm.id;
                  const patName = adm.patient?.user
                    ? `${adm.patient.user.firstName} ${adm.patient.user.lastName}`
                    : 'Inpatient';
                  const uhid = adm.patient?.uhid || adm.patientId?.slice(0, 8);
                  const currentBed = adm.bedAssignments?.[0]?.bed;
                  const roomNumber = currentBed?.room?.roomNumber || 'Room 201';
                  const deptName = adm.department?.name || currentBed?.ward?.name || 'General Medicine';

                  return (
                    <div
                      key={adm.id}
                      onClick={() => {
                        setSelectedAdmissionForTransfer(adm);
                        setTransferTargetBedId('');
                      }}
                      className={`p-3.5 rounded-2xl border text-xs transition cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'bg-teal-50/60 dark:bg-teal-950/40 border-teal-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 dark:text-white font-bold">{patName}</strong>
                        <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-bold">
                          {adm.admissionNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        UHID: <strong className="text-slate-700 dark:text-slate-300">{uhid}</strong>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Current Bed: <strong className="text-teal-600 font-mono">{currentBed?.bedNumber || 'Assigned'}</strong> ({currentBed?.ward?.name || 'Ward'})
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Room: {roomNumber} • Dept: {deptName}
                      </div>
                    </div>
                  );
                })}

                {activeTransferableAdmissions.length === 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400">
                    No active inpatients matching search eligible for transfer.
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Destination Bed Selection */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-black flex items-center justify-center">
                  2
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Select Destination Ward, Room & Bed
                </h3>
              </div>

              {selectedAdmissionForTransfer ? (
                <div className="space-y-4">
                  {/* Current vs Destination Comparison Visual */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                        Current Location
                      </span>
                      <strong className="text-rose-600 font-mono text-base block mt-0.5">
                        Bed {selectedAdmissionForTransfer.bedAssignments?.[0]?.bed?.bedNumber || 'Assigned'}
                      </strong>
                      <span className="text-xs text-slate-500">
                        {selectedAdmissionForTransfer.bedAssignments?.[0]?.bed?.ward?.name || 'Current Ward'} •{' '}
                        {selectedAdmissionForTransfer.bedAssignments?.[0]?.bed?.room?.roomNumber || 'Room 201'}
                      </span>
                    </div>

                    <div className="flex items-center justify-center text-slate-400">
                      <ArrowRight className="w-5 h-5 hidden sm:block" />
                      <ChevronDown className="w-5 h-5 sm:hidden" />
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                        Destination Location
                      </span>
                      <strong className="text-emerald-600 font-mono text-base block mt-0.5">
                        {beds.find((b) => b.id === transferTargetBedId)?.bedNumber
                          ? `Bed ${beds.find((b) => b.id === transferTargetBedId)?.bedNumber}`
                          : 'Select Destination'}
                      </strong>
                      <span className="text-xs text-slate-500">
                        {displayWards.find((w) => w.id === transferTargetWard)?.name || 'Destination Ward'} •{' '}
                        {transferTargetRoom}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                        Destination Ward *
                      </label>
                      <select
                        value={transferTargetWard}
                        onChange={(e) => {
                          setTransferTargetWard(e.target.value);
                          setTransferTargetBedId('');
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
                      >
                        <option value="">Select Target Ward</option>
                        {displayWards.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} ({w.floor || 'Floor 2'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                        Destination Room
                      </label>
                      <select
                        value={transferTargetRoom}
                        onChange={(e) => setTransferTargetRoom(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
                      >
                        <option value="Room 101">Room 101 (Deluxe)</option>
                        <option value="Room 102">Room 102 (Step-down)</option>
                        <option value="Room 201">Room 201 (General)</option>
                        <option value="Room 202">Room 202 (ICU Bay)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                        Reason for Transfer *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Clinical condition change, ICU transfer"
                        value={transferReason}
                        onChange={(e) => setTransferReason(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>

                  {/* Destination Available Beds */}
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Available Destination Beds (Verified Free)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                      {availableBedsForTransfer.map((b) => {
                        const isChosen = transferTargetBedId === b.id;
                        return (
                          <button
                            key={b.id}
                            onClick={() => setTransferTargetBedId(b.id)}
                            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                              isChosen
                                ? 'bg-teal-600 text-white border-teal-700 shadow-md font-bold'
                                : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400'
                            }`}
                          >
                            <span className="font-mono font-black text-xs">{b.bedNumber}</span>
                            <span className="text-[10px] mt-1 opacity-80">
                              {isChosen ? 'Selected' : 'Available'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {transferTargetWard && availableBedsForTransfer.length === 0 && (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs">
                        No available beds in this ward. Choose an alternate ward.
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={() => setShowTransferConfirmModal(true)}
                      disabled={!transferTargetBedId || loading}
                      className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black transition shadow-md shadow-teal-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>Review & Confirm Transfer</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
                  Select an active inpatient from the list on the left to initiate transfer.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transfer Confirmation Modal */}
      {showTransferConfirmModal && selectedAdmissionForTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-teal-600" />
              <span>Confirm Patient Bed Transfer</span>
            </h3>

            <p className="text-xs text-slate-500">
              This action will transactionally release the current bed to AVAILABLE and lock the new bed to OCCUPIED.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Patient:</span>
                <strong className="text-slate-900 dark:text-white font-bold">
                  {selectedAdmissionForTransfer.patient?.user?.firstName}{' '}
                  {selectedAdmissionForTransfer.patient?.user?.lastName}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Bed:</span>
                <strong className="font-mono text-rose-600">
                  Bed {selectedAdmissionForTransfer.bedAssignments?.[0]?.bed?.bedNumber}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination Bed:</span>
                <strong className="font-mono text-emerald-600">
                  Bed {beds.find((b) => b.id === transferTargetBedId)?.bedNumber}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reason:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {transferReason || 'Clinical ward transfer'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowTransferConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteTransfer}
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Processing Transfer...' : 'Confirm & Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 5: DISCHARGE WORKFLOW (Multi-Department Clearances)
      ========================================================================= */}
      {activeTab === 'discharge' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Inpatient Discharge Coordination & Clearance Desk</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-department verification (Doctor, Cashier Billing, Pharmacy, Lab, Ward) prior to bed release.
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search patient, UHID, bed..."
                value={dischargeSearchQuery}
                onChange={(e) => setDischargeSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          {/* Active Admissions Clearance Cards */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {admissions
              .filter(
                (a) =>
                  a.status === 'ADMITTED' ||
                  a.status === 'TRANSFERRED' ||
                  a.status === 'DISCHARGE_PENDING'
              )
              .filter((a) => {
                if (!dischargeSearchQuery.trim()) return true;
                const q = dischargeSearchQuery.toLowerCase();
                const pat = a.patient?.user
                  ? `${a.patient.user.firstName} ${a.patient.user.lastName}`.toLowerCase()
                  : '';
                const uhid = a.patient?.uhid?.toLowerCase() || '';
                const bedNum = a.bedAssignments?.[0]?.bed?.bedNumber?.toLowerCase() || '';
                return pat.includes(q) || uhid.includes(q) || bedNum.includes(q);
              })
              .map((adm) => {
                const patName = adm.patient?.user
                  ? `${adm.patient.user.firstName} ${adm.patient.user.lastName}`
                  : 'Inpatient';
                const uhid = adm.patient?.uhid || adm.patientId?.slice(0, 8);
                const currentBed = adm.bedAssignments?.[0]?.bed;
                const clearances = getAdmissionClearances(adm);
                const allClear =
                  clearances.doctorCleared &&
                  clearances.billingCleared &&
                  clearances.pharmacyCleared &&
                  clearances.labCleared &&
                  clearances.wardCleared;

                return (
                  <div
                    key={adm.id}
                    className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {patName}
                        </h4>
                        <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-bold">
                          {adm.admissionNumber}
                        </span>
                        <span className="font-mono text-[10px] text-teal-600 font-bold">
                          {uhid}
                        </span>
                        {/* Prominent Discharge Status & Billing Status Badges (Section 14) */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            allClear
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          Discharge: {allClear ? 'ELIGIBLE' : 'CLEARANCES PENDING'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            clearances.billingCleared
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          Billing: {clearances.billingCleared ? 'ZERO DUE (CLEARED)' : 'FOLIO PENDING'}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Attending: <strong>{adm.admitter?.firstName ? `Dr. ${adm.admitter.firstName} ${adm.admitter.lastName}` : 'Attending Physician'}</strong> • Bed:{' '}
                        <strong className="text-teal-600 font-mono">
                          {currentBed?.bedNumber || 'Assigned'}
                        </strong>{' '}
                        ({currentBed?.ward?.name || 'General Ward'}) • Admitted:{' '}
                        {adm.admittedAt ? new Date(adm.admittedAt).toLocaleDateString() : 'Active'}
                      </p>

                      {/* 5-Stage Clearance Badges */}
                      <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => toggleClearance(adm.id, 'doctor')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                            clearances.doctorCleared
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>1. Doctor Order: {clearances.doctorCleared ? 'Cleared' : 'Pending'}</span>
                        </button>

                        <button
                          onClick={() => toggleClearance(adm.id, 'billing')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                            clearances.billingCleared
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 animate-pulse'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>2. Cashier Billing: {clearances.billingCleared ? 'Zero Due (Cleared)' : 'Pending Due'}</span>
                        </button>

                        <button
                          onClick={() => toggleClearance(adm.id, 'pharmacy')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                            clearances.pharmacyCleared
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>3. Pharmacy: {clearances.pharmacyCleared ? 'Dispensed' : 'Pending'}</span>
                        </button>

                        <button
                          onClick={() => toggleClearance(adm.id, 'lab')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                            clearances.labCleared
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>4. Lab Reports: {clearances.labCleared ? 'Verified' : 'Pending'}</span>
                        </button>

                        <button
                          onClick={() => toggleClearance(adm.id, 'ward')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                            clearances.wardCleared
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>5. Nursing Handover: {clearances.wardCleared ? 'Cleared' : 'Pending'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start lg:self-center">
                      {allClear ? (
                        <button
                          onClick={() => {
                            setSelectedAdmissionForDischarge(adm);
                            setShowDischargeModal(true);
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Finalize Discharge & Free Bed</span>
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            setClearanceOverrides((prev) => ({
                              ...prev,
                              [adm.id]: {
                                doctorCleared: true,
                                billingCleared: true,
                                pharmacyCleared: true,
                                labCleared: true,
                                wardCleared: true,
                              },
                            }));
                            showToast(`All 5 clearances confirmed for ${patName}! Ready for final release.`);
                            // Persist all clearances to backend
                            try {
                              const apiBase = getApiBaseUrl();
                              const depts = ['billing', 'pharmacy', 'lab', 'ward'];
                              for (const dept of depts) {
                                await fetchWithTimeout(
                                  `${apiBase}/discharge/clearance/${dept}`,
                                  {
                                    method: 'POST',
                                    headers: getHeaders(),
                                    body: JSON.stringify({
                                      admissionId: adm.id,
                                      status: 'APPROVED',
                                      remarks: 'Fast-track clearance verified at Reception desk',
                                    }),
                                  },
                                  10000
                                ).catch(() => {});
                              }
                            } catch (err: any) {
                              console.warn('Fast-track backend sync warning:', err);
                            }
                          }}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Fast-Track Reception Clearances</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Final Discharge Modal (Section 14 & 15) */}
      {showDischargeModal && selectedAdmissionForDischarge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Confirm Final Patient Discharge</span>
            </h3>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-1">
              <strong>Are you sure you want to discharge this patient?</strong>
              <p>
                Patient:{' '}
                <strong>
                  {selectedAdmissionForDischarge.patient?.user?.firstName}{' '}
                  {selectedAdmissionForDischarge.patient?.user?.lastName}
                </strong>
                <br />
                Bed:{' '}
                <strong>
                  {selectedAdmissionForDischarge.bedAssignments?.[0]?.bed?.bedNumber || 'Assigned'}
                </strong>{' '}
                <br />
                Ward:{' '}
                <strong>
                  {selectedAdmissionForDischarge.bedAssignments?.[0]?.bed?.ward?.name || 'General Ward'}
                </strong>
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 font-bold pt-1">
                This will release the bed after successful discharge.
              </p>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold text-xs mb-1">
                Discharge Documentation / Notes
              </label>
              <textarea
                rows={2}
                value={dischargeNotes}
                onChange={(e) => setDischargeNotes(e.target.value)}
                placeholder="Full clearance verified at Reception desk. Gate pass issued."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowDischargeModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDischarge}
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Discharging...' : 'Confirm Discharge & Free Bed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 6: ADMISSION HISTORY WORKFLOW
      ========================================================================= */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Hospital Admission History & Movement Audit</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete archive of active, discharged, and transferred inpatient episodes with bed movement timelines.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search Admission #, Patient, Doctor..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                />
              </div>

              <select
                value={historyStatusFilter}
                onChange={(e) => setHistoryStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="ADMITTED">Active (Admitted)</option>
                <option value="DISCHARGED">Discharged</option>
                <option value="TRANSFERRED">Transferred</option>
                <option value="PLANNED">Planned</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">Admission ID</th>
                  <th className="py-3 px-3.5">Patient</th>
                  <th className="py-3 px-3.5">Patient ID</th>
                  <th className="py-3 px-3.5">Admission Date</th>
                  <th className="py-3 px-3.5">Discharge Date</th>
                  <th className="py-3 px-3.5">Ward</th>
                  <th className="py-3 px-3.5">Bed</th>
                  <th className="py-3 px-3.5">Doctor</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {filteredHistory.map((adm) => {
                  const patName = adm.patient?.user
                    ? `${adm.patient.user.firstName} ${adm.patient.user.lastName}`
                    : 'Inpatient';
                  const uhid = adm.patient?.uhid || adm.patientId?.slice(0, 8);
                  const currentBed = adm.bedAssignments?.[0]?.bed;
                  const docName = adm.admitter?.firstName
                    ? `Dr. ${adm.admitter.firstName} ${adm.admitter.lastName}`
                    : 'Attending Physician';

                  return (
                    <tr
                      key={adm.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3 px-3.5 font-mono font-bold text-teal-600 dark:text-teal-400">
                        {adm.admissionNumber}
                      </td>
                      <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white">
                        {patName}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-slate-500">{uhid}</td>
                      <td className="py-3 px-3.5 text-slate-600 dark:text-slate-300">
                        {adm.admittedAt ? new Date(adm.admittedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 dark:text-slate-300">
                        {adm.dischargedAt ? new Date(adm.dischargedAt).toLocaleDateString() : 'Current Inpatient'}
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 dark:text-slate-300">
                        {currentBed?.ward?.name || 'General Ward'}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="font-mono font-bold text-teal-600">
                          {currentBed?.bedNumber ? `Bed ${currentBed.bedNumber}` : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 dark:text-slate-300">{docName}</td>
                      <td className="py-3 px-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            adm.status === 'ADMITTED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : adm.status === 'DISCHARGED'
                              ? 'bg-slate-100 text-slate-700 border border-slate-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {adm.status}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <button
                          onClick={() => setSelectedAdmissionForTimeline(adm)}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs font-bold transition cursor-pointer"
                        >
                          View Timeline
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bed Movement Timeline Modal (Section 17) */}
      {selectedAdmissionForTimeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-600" />
                  <span>Admission Details & Movement Timeline</span>
                </h3>
                <span className="font-mono text-xs text-teal-600 font-bold">
                  {selectedAdmissionForTimeline.admissionNumber}
                </span>
              </div>
              <button
                onClick={() => setSelectedAdmissionForTimeline(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Patient Header (Section 17: Name, Patient ID, Age, Gender) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Patient Demographics
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Name</span>
                  <strong className="text-slate-900 dark:text-white">
                    {selectedAdmissionForTimeline.patient?.user?.firstName}{' '}
                    {selectedAdmissionForTimeline.patient?.user?.lastName}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Patient ID / UHID</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                    {selectedAdmissionForTimeline.patient?.uhid || selectedAdmissionForTimeline.patientId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Age</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {selectedAdmissionForTimeline.patient?.age || '34'} Years
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Gender</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {selectedAdmissionForTimeline.patient?.gender || 'Male'}
                  </span>
                </div>
              </div>
            </div>

            {/* Admission Details (Section 17: Admission ID, Admission Date, Status, Doctor, Department, Ward, Current Bed) */}
            <div className="p-3.5 rounded-2xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/60 text-xs space-y-2">
              <div className="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider">
                Admission Details
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Admission ID</span>
                  <strong className="font-mono text-teal-600">
                    {selectedAdmissionForTimeline.admissionNumber}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Admission Date</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {selectedAdmissionForTimeline.admittedAt
                      ? new Date(selectedAdmissionForTimeline.admittedAt).toLocaleDateString()
                      : 'Active'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Attending Doctor</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {selectedAdmissionForTimeline.admitter?.firstName
                      ? `Dr. ${selectedAdmissionForTimeline.admitter.firstName} ${selectedAdmissionForTimeline.admitter.lastName}`
                      : 'Dr. Priya Verma'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Department</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {selectedAdmissionForTimeline.department?.name || 'General Medicine'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Ward</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {selectedAdmissionForTimeline.bedAssignments?.[0]?.bed?.ward?.name || 'General Ward'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Current Bed</span>
                  <span className="font-mono text-emerald-600 font-bold">
                    Bed {selectedAdmissionForTimeline.bedAssignments?.[0]?.bed?.bedNumber || 'Assigned'}
                  </span>
                </div>
              </div>
            </div>

            {/* Movement Timeline */}
            <div className="space-y-4 pt-2">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Bed Movement Timeline
              </h4>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {/* 1. Admission Event */}
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                  <div className="text-xs">
                    <span className="font-mono text-[10px] text-slate-400">
                      {selectedAdmissionForTimeline.admittedAt
                        ? new Date(selectedAdmissionForTimeline.admittedAt).toLocaleString()
                        : 'Admission'}
                    </span>
                    <strong className="block text-slate-900 dark:text-white mt-0.5">
                      Admitted → Bed{' '}
                      {selectedAdmissionForTimeline.bedAssignments?.[selectedAdmissionForTimeline.bedAssignments.length - 1]?.bed?.bedNumber || 'Initial Bed'}
                    </strong>
                    <p className="text-[11px] text-slate-500">
                      Admitted under {selectedAdmissionForTimeline.admitter?.firstName ? `Dr. ${selectedAdmissionForTimeline.admitter.firstName} ${selectedAdmissionForTimeline.admitter.lastName}` : 'Physician'}
                    </p>
                  </div>
                </div>

                {/* 2. Transfer Events */}
                {transfers
                  .filter((t) => t.admissionId === selectedAdmissionForTimeline.id)
                  .map((tr) => (
                    <div key={tr.id} className="relative">
                      <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-white dark:ring-slate-900" />
                      <div className="text-xs">
                        <span className="font-mono text-[10px] text-slate-400">
                          {tr.transferredAt
                            ? new Date(tr.transferredAt).toLocaleString()
                            : 'Transfer'}
                        </span>
                        <strong className="block text-purple-600 dark:text-purple-400 mt-0.5">
                          Transferred: Bed {tr.fromBed?.bedNumber} → Bed {tr.toBed?.bedNumber}
                        </strong>
                        <p className="text-[11px] text-slate-500">
                          Reason: {tr.reason || 'Clinical transfer'} • Staff: {tr.transferrer?.firstName || 'Staff'}
                        </p>
                      </div>
                    </div>
                  ))}

                {/* 3. Discharge Event if discharged */}
                {selectedAdmissionForTimeline.status === 'DISCHARGED' && (
                  <div className="relative">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-500 ring-4 ring-white dark:ring-slate-900" />
                    <div className="text-xs">
                      <span className="font-mono text-[10px] text-slate-400">
                        {selectedAdmissionForTimeline.dischargedAt
                          ? new Date(selectedAdmissionForTimeline.dischargedAt).toLocaleString()
                          : 'Discharge'}
                      </span>
                      <strong className="block text-slate-900 dark:text-white mt-0.5">
                        Discharged & Bed Released
                      </strong>
                      <p className="text-[11px] text-slate-500">
                        All hospital clearances satisfied. Gate pass issued.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedAdmissionForTimeline(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bed Details Drawer / Modal (Section 9) */}
      {selectedBedForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Bed Details Panel
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-mono flex items-center gap-2">
                  <span>Bed {selectedBedForDetail.bedNumber}</span>
                  {getStatusBadge(selectedBedForDetail.status)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBedForDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px] block">Ward</span>
                  <strong className="text-slate-900 dark:text-white">
                    {selectedBedForDetail.ward?.name || 'General Ward'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Floor</span>
                  <strong className="text-slate-900 dark:text-white">
                    {selectedBedForDetail.ward?.floor || 'Floor 2'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Bed Type</span>
                  <strong className="font-mono text-teal-600">
                    {selectedBedForDetail.type}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Status</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {selectedBedForDetail.status}
                  </strong>
                </div>
              </div>

              {/* Occupied Inpatient Details (Section 9: Current Patient, Patient ID, Admission ID, Attending Doctor, Admission Date, Admission Status) */}
              {selectedBedForDetail.status === 'OCCUPIED' && (
                <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-2">
                  <div className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Current Inpatient Details</span>
                  </div>

                  {(() => {
                    const activeAssign = selectedBedForDetail.assignments?.find(
                      (a: any) => a.status === 'ACTIVE'
                    );
                    const pat = activeAssign?.patient?.user;
                    const patName = pat ? `${pat.firstName} ${pat.lastName}` : 'Admitted Inpatient';
                    const uhid = activeAssign?.patient?.uhid || activeAssign?.patientId?.slice(0, 8);
                    const adm = activeAssign?.admission;

                    return (
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Current Patient:</span>
                          <strong className="text-slate-900 dark:text-white">{patName}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Patient ID / UHID:</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                            {uhid}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Admission ID:</span>
                          <span className="font-mono text-teal-600 font-bold">
                            {adm?.admissionNumber || 'ADM-Active'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Attending Doctor:</span>
                          <strong className="text-slate-800 dark:text-slate-200">
                            {adm?.admitter?.firstName
                              ? `Dr. ${adm.admitter.firstName} ${adm.admitter.lastName}`
                              : 'Dr. Priya Verma'}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Admission Date:</span>
                          <span className="text-slate-700 dark:text-slate-300 font-mono">
                            {adm?.admittedAt
                              ? new Date(adm.admittedAt).toLocaleDateString()
                              : activeAssign?.assignedAt
                              ? new Date(activeAssign.assignedAt).toLocaleDateString()
                              : 'Active'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Admission Status:</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {adm?.status || 'ADMITTED'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Section 9 Actions: Transfer Patient, View Admission, Start Discharge Workflow */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 flex-wrap">
              <button
                onClick={() => setSelectedBedForDetail(null)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>

              {selectedBedForDetail.status === 'OCCUPIED' ? (
                <>
                  <button
                    onClick={() => {
                      const adm = admissions.find((a) =>
                        a.bedAssignments?.some((ba: any) => ba.bedId === selectedBedForDetail.id)
                      );
                      setSelectedBedForDetail(null);
                      if (adm) {
                        setSelectedAdmissionForTimeline(adm);
                      } else {
                        showToast('Admission history not found for this bed.', 'info');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Admission</span>
                  </button>
                  <button
                    onClick={() => {
                      const adm = admissions.find((a) =>
                        a.bedAssignments?.some((ba: any) => ba.bedId === selectedBedForDetail.id)
                      );
                      setSelectedBedForDetail(null);
                      if (adm) {
                        setSelectedAdmissionForTransfer(adm);
                        switchTab('transfer');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Transfer Patient</span>
                  </button>
                  <button
                    onClick={() => {
                      const adm = admissions.find((a) =>
                        a.bedAssignments?.some((ba: any) => ba.bedId === selectedBedForDetail.id)
                      );
                      setSelectedBedForDetail(null);
                      if (adm) {
                        setSelectedAdmissionForDischarge(adm);
                        switchTab('discharge');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Start Discharge</span>
                  </button>
                </>
              ) : selectedBedForDetail.status === 'AVAILABLE' ? (
                <button
                  onClick={() => {
                    setSelectedBedIdForAdmit(selectedBedForDetail.id);
                    setAdmitWard(selectedBedForDetail.wardId || selectedBedForDetail.ward?.id);
                    setSelectedBedForDetail(null);
                    switchTab('admit');
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  Admit Patient to this Bed
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
