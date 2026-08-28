'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AdmissionDto,
  FacilityDto,
  DepartmentDto,
  PatientProfileDto,
  BedDto,
  AdmissionStatus,
  AdmissionType,
} from '@medinexa/types';

import DischargeSummaryModal from '@/components/DischargeSummaryModal';

export default function AdmissionsDashboardPage() {
  const [admissions, setAdmissions] = useState<AdmissionDto[]>([]);
  const [facilities, setFacilities] = useState<FacilityDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [patients, setPatients] = useState<PatientProfileDto[]>([]);
  const [availableBeds, setAvailableBeds] = useState<BedDto[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Filters
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [transferModalAdmission, setTransferModalAdmission] = useState<AdmissionDto | null>(null);
  const [dischargeModalAdmission, setDischargeModalAdmission] = useState<AdmissionDto | null>(null);

  // Discharge Summary Modal State
  const [showDischargeSummaryModal, setShowDischargeSummaryModal] = useState(false);
  const [summaryAdmissionId, setSummaryAdmissionId] = useState<string | null>(null);

  // Form State - Create
  const [newPatientId, setNewPatientId] = useState('');
  const [newFacilityId, setNewFacilityId] = useState('');
  const [newDepartmentId, setNewDepartmentId] = useState('');
  const [newAdmissionType, setNewAdmissionType] = useState<AdmissionType>(AdmissionType.EMERGENCY);
  const [newBedId, setNewBedId] = useState('');
  const [newExpectedDischarge, setNewExpectedDischarge] = useState('');
  const [newReason, setNewReason] = useState('');

  // Quick Patient Registration State inside Admission Modal
  const [showQuickReg, setShowQuickReg] = useState(false);
  const [quickFirstName, setQuickFirstName] = useState('');
  const [quickLastName, setQuickLastName] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickDob, setQuickDob] = useState('1995-01-01');
  const [quickGender, setQuickGender] = useState('FEMALE');

  // Form State - Transfer
  const [targetBedId, setTargetBedId] = useState('');
  const [transferReason, setTransferReason] = useState('');

  // Form State - Discharge
  const [dischargeReason, setDischargeReason] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('medinexa_token') || localStorage.getItem('token');
  };

  const getHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchAdmissions = () => {
    const queryParams = new URLSearchParams();
    if (selectedFacility) queryParams.set('facilityId', selectedFacility);
    if (selectedDept) queryParams.set('departmentId', selectedDept);
    if (selectedStatus) queryParams.set('status', selectedStatus);
    if (selectedType) queryParams.set('admissionType', selectedType);

    const token = getToken();
    if (!token) return;

    fetch(`${apiUrl}/admissions?${queryParams.toString()}`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => setAdmissions(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    const userStr = localStorage.getItem('medinexa_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserRole(u.roleCode || u.role?.code || '');
      } catch {}
    }

    const token = getToken();
    Promise.all([
      fetch(`${apiUrl}/facilities`).then((res) => res.json()),
      token
        ? fetch(`${apiUrl}/patients`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json())
        : Promise.resolve([]),
    ])
      .then(([facList, patList]) => {
        const validFacs = Array.isArray(facList) ? facList : [];
        setFacilities(validFacs);
        setPatients(Array.isArray(patList) ? patList : []);
        if (validFacs.length > 0) {
          setSelectedFacility(validFacs[0].id);
          setNewFacilityId(validFacs[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiUrl]);

  useEffect(() => {
    if (selectedFacility) {
      fetch(`${apiUrl}/facilities/${selectedFacility}/departments`)
        .then((res) => res.json())
        .then((depts) => {
          const validDepts = Array.isArray(depts) ? depts : [];
          setDepartments(validDepts);
          if (validDepts.length > 0) {
            setNewDepartmentId(validDepts[0].id);
          }
        })
        .catch(() => {});

      fetch(`${apiUrl}/beds/available?facilityId=${selectedFacility}`)
        .then((res) => res.json())
        .then((beds) => setAvailableBeds(Array.isArray(beds) ? beds : []))
        .catch(() => {});
    }
  }, [apiUrl, selectedFacility]);

  useEffect(() => {
    fetchAdmissions();
    const interval = setInterval(fetchAdmissions, 4000);
    return () => clearInterval(interval);
  }, [apiUrl, selectedFacility, selectedDept, selectedStatus, selectedType]);

  const handleCreateAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`${apiUrl}/admissions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          patientId: newPatientId,
          facilityId: newFacilityId,
          departmentId: newDepartmentId,
          admissionType: newAdmissionType,
          bedId: newBedId || undefined,
          expectedDischargeAt: newExpectedDischarge || undefined,
          reason: newReason || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to create admission');
      }

      setActionSuccess(`Admission '${data.admissionNumber}' created successfully!`);
      setShowCreateModal(false);
      setNewPatientId('');
      setNewBedId('');
      setNewReason('');
      fetchAdmissions();
    } catch (err: any) {
      setActionError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModalAdmission) return;

    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`${apiUrl}/admissions/${transferModalAdmission.id}/transfer`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          targetBedId,
          reason: transferReason,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Bed transfer failed');
      }

      setActionSuccess(`Bed transfer completed successfully for Admission '${data.admissionNumber}'!`);
      setTransferModalAdmission(null);
      setTargetBedId('');
      setTransferReason('');
      fetchAdmissions();
    } catch (err: any) {
      setActionError(err.message || 'Transfer failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`${apiUrl}/patients`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          firstName: quickFirstName,
          lastName: quickLastName,
          email: quickEmail || undefined,
          phone: quickPhone || undefined,
          dateOfBirth: quickDob,
          gender: quickGender,
        }),
      });

      const newPat = await res.json();
      if (!res.ok) throw new Error(newPat.message || 'Failed to register patient');

      setActionSuccess(`New Patient '${newPat.user?.firstName} ${newPat.user?.lastName}' registered and selected!`);
      setNewPatientId(newPat.id);
      setShowQuickReg(false);
      setQuickFirstName('');
      setQuickLastName('');
      setQuickEmail('');
      setQuickPhone('');

      // Refresh patients dropdown
      fetch(`${apiUrl}/patients`, { headers: getHeaders() })
        .then((r) => r.json())
        .then((pData) => setPatients(Array.isArray(pData) ? pData : []));
    } catch (err: any) {
      setActionError(err.message || 'Quick registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDischarge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dischargeModalAdmission) return;

    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`${apiUrl}/admissions/${dischargeModalAdmission.id}/discharge`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          dischargeReason,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Discharge failed');
      }

      setActionSuccess(`Patient discharged successfully for Admission '${data.admissionNumber}'!`);
      setDischargeModalAdmission(null);
      setDischargeReason('');
      fetchAdmissions();
    } catch (err: any) {
      setActionError(err.message || 'Discharge failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAdmissions = admissions.filter((a) => {
    const num = (a.admissionNumber || '').toLowerCase();
    const patName = `${a.patient?.user?.firstName || ''} ${a.patient?.user?.lastName || ''}`.toLowerCase();
    const q = search.toLowerCase();
    return num.includes(q) || patName.includes(q);
  });

  const getStatusBadgeClass = (status: AdmissionStatus) => {
    switch (status) {
      case AdmissionStatus.ADMITTED:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case AdmissionStatus.TRANSFERRED:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case AdmissionStatus.PLANNED:
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case AdmissionStatus.DISCHARGE_PENDING:
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case AdmissionStatus.DISCHARGED:
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case AdmissionStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="text-lg font-extrabold text-slate-900">MediNexa</span>
            </div>

            <nav className="flex space-x-4">
              <Link href="/dashboard" className="text-sm text-slate-600 hover:text-sky-600 font-medium">
                Overview
              </Link>
              <Link href="/dashboard/hospital" className="text-sm text-slate-600 hover:text-sky-600 font-medium">
                Hospital
              </Link>
              <Link href="/dashboard/hospital/beds" className="text-sm text-slate-600 hover:text-sky-600 font-medium">
                Live Bed Engine
              </Link>
              <Link href="/dashboard/admissions" className="text-sm text-sky-600 font-bold border-b-2 border-sky-600 pb-1">
                Admissions Engine
              </Link>
            </nav>
          </div>

          {userRole !== 'DOCTOR' && userRole !== 'PATIENT' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-sm"
            >
              + Admit New Patient
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Admissions & Discharge Engine</h1>
            <p className="text-sm text-slate-500 mt-1">
              Clinical inpatient admissions, real-time bed assignments, bed transfers, and discharge management
            </p>
          </div>

          {(user?.role?.code === RoleCode.MEDINEXA_ADMIN || user?.roleCode === 'MEDINEXA_ADMIN') && (
            <div className="flex items-center space-x-3">
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 shadow-sm"
              >
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Live Messages */}
        {actionSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold rounded-xl flex items-center justify-between">
            <span>✅ {actionSuccess}</span>
            <button onClick={() => setActionSuccess(null)} className="text-xs font-bold text-emerald-700">Dismiss</button>
          </div>
        )}
        {actionError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-900 text-sm font-semibold rounded-xl flex items-center justify-between">
            <span>⚠️ {actionError}</span>
            <button onClick={() => setActionError(null)} className="text-xs font-bold text-red-700">Dismiss</button>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Search Patient / Number</label>
            <input
              type="text"
              placeholder="Search admission number or patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm bg-white"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Admission Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm bg-white"
            >
              <option value="">All Statuses</option>
              {Object.values(AdmissionStatus).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Admission Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm bg-white"
            >
              <option value="">All Admission Types</option>
              {Object.values(AdmissionType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Admissions Table */}
        {loading ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 animate-pulse">
            Loading Admissions Directory...
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-bold tracking-wider border-b border-slate-200">
                  <th className="p-4">Admission Details</th>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Department & Bed</th>
                  <th className="p-4">Status & Type</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdmissions.length > 0 ? (
                  filteredAdmissions.map((adm) => (
                    <tr key={adm.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-black text-slate-900">{adm.admissionNumber}</div>
                        <div className="text-xs text-slate-500">Admitted: {new Date(adm.admittedAt).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">
                          {adm.patient?.user?.firstName} {adm.patient?.user?.lastName}
                        </div>
                        <div className="text-xs text-slate-500">{adm.patient?.user?.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{adm.department?.name}</div>
                        <div className="text-xs text-sky-600 font-semibold">
                          {adm.currentAssignment?.bed
                            ? `Bed ${adm.currentAssignment.bed.bedNumber} (Room ${adm.currentAssignment.bed.room?.roomNumber})`
                            : 'No Bed Assigned'}
                        </div>
                      </td>
                      <td className="p-4 space-y-1">
                        <div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-extrabold border ${getStatusBadgeClass(adm.status)}`}>
                            {adm.status}
                          </span>
                        </div>
                        <div>
                          <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded font-bold">
                            {adm.admissionType}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSummaryAdmissionId(adm.id);
                            setShowDischargeSummaryModal(true);
                          }}
                          className="text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-sm"
                        >
                          📜 Summary
                        </button>
                        {userRole !== 'DOCTOR' && userRole !== 'PATIENT' && (adm.status === AdmissionStatus.ADMITTED || adm.status === AdmissionStatus.TRANSFERRED) && (
                          <>
                            <button
                              onClick={() => {
                                setTransferModalAdmission(adm);
                                setTargetBedId('');
                              }}
                              className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg shadow-sm"
                            >
                              Transfer Bed
                            </button>
                            <button
                              onClick={() => {
                                setDischargeModalAdmission(adm);
                                setDischargeReason('');
                              }}
                              className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg shadow-sm"
                            >
                              Discharge
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No clinical admissions found matching search or filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Create Admission Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateAdmission} className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Create Clinical Admission</h3>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Select Patient *</label>
                <button
                  type="button"
                  onClick={() => setShowQuickReg(!showQuickReg)}
                  className="text-xs text-sky-600 font-bold hover:underline"
                >
                  {showQuickReg ? '← Select Existing' : '+ Quick Register New Patient'}
                </button>
              </div>

              {showQuickReg ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="First Name *"
                      required
                      value={quickFirstName}
                      onChange={(e) => setQuickFirstName(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Last Name *"
                      required
                      value={quickLastName}
                      onChange={(e) => setQuickLastName(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="email"
                      placeholder="Email (Optional)"
                      value={quickEmail}
                      onChange={(e) => setQuickEmail(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Phone (Optional)"
                      value={quickPhone}
                      onChange={(e) => setQuickPhone(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      required
                      value={quickDob}
                      onChange={(e) => setQuickDob(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                    />
                    <select
                      value={quickGender}
                      onChange={(e) => setQuickGender(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                    >
                      <option value="FEMALE">FEMALE</option>
                      <option value="MALE">MALE</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickRegisterPatient}
                    disabled={isSubmitting || !quickFirstName || !quickLastName}
                    className="w-full py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Save & Select Patient
                  </button>
                </div>
              ) : (
                <select
                  required
                  value={newPatientId}
                  onChange={(e) => setNewPatientId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.firstName} {p.user?.lastName} ({p.user?.email || p.phone || 'Patient'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Facility</label>
                <select
                  disabled
                  value={newFacilityId}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-slate-100"
                >
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Department *</label>
                <select
                  required
                  value={newDepartmentId}
                  onChange={(e) => setNewDepartmentId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Admission Type *</label>
                <select
                  value={newAdmissionType}
                  onChange={(e) => setNewAdmissionType(e.target.value as AdmissionType)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  {Object.values(AdmissionType).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Assign Initial Bed (Optional)</label>
                <select
                  value={newBedId}
                  onChange={(e) => setNewBedId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  <option value="">-- No Bed (Planned) --</option>
                  {availableBeds.map((b) => (
                    <option key={b.id} value={b.id}>
                      Bed {b.bedNumber} (Room {b.room?.roomNumber} - {b.ward?.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Clinical Intake Reason</label>
              <input
                type="text"
                placeholder="Reason or medical notes..."
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !newPatientId}
                className="text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Create Admission
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bed Transfer Modal */}
      {transferModalAdmission && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleTransfer} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Bed Transfer</h3>
            <p className="text-xs text-slate-500">
              Transfer admission <strong className="text-slate-900">{transferModalAdmission.admissionNumber}</strong> to a new bed
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <div><strong className="text-slate-700">Patient:</strong> {transferModalAdmission.patient?.user?.firstName} {transferModalAdmission.patient?.user?.lastName}</div>
              <div>
                <strong className="text-slate-700">Current Location:</strong>{' '}
                {transferModalAdmission.currentAssignment?.bed
                  ? `Bed ${transferModalAdmission.currentAssignment.bed.bedNumber} (Room ${transferModalAdmission.currentAssignment.bed.room?.roomNumber} - ${transferModalAdmission.currentAssignment.bed.ward?.name})`
                  : 'None'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Select Target Bed *</label>
              <select
                required
                value={targetBedId}
                onChange={(e) => setTargetBedId(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
              >
                <option value="">-- Choose Target Available Bed --</option>
                {availableBeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    Bed {b.bedNumber} (Room {b.room?.roomNumber} - {b.ward?.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Transfer Reason</label>
              <input
                type="text"
                placeholder="Reason e.g. Moved to ICU for monitoring..."
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setTransferModalAdmission(null)}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !targetBedId}
                className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Confirm Transfer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discharge Modal */}
      {dischargeModalAdmission && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleDischarge} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Discharge Patient</h3>
            <p className="text-xs text-slate-500">
              Confirm patient discharge for admission <strong className="text-slate-900">{dischargeModalAdmission.admissionNumber}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Discharge Reason / Summary *</label>
              <input
                required
                type="text"
                placeholder="Clinical recovery, routine discharge..."
                value={dischargeReason}
                onChange={(e) => setDischargeReason(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDischargeModalAdmission(null)}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !dischargeReason}
                className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Confirm Discharge
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discharge Summary Modal */}
      <DischargeSummaryModal
        admissionId={summaryAdmissionId}
        isOpen={showDischargeSummaryModal}
        onClose={() => setShowDischargeSummaryModal(false)}
      />
    </div>
  );
}
