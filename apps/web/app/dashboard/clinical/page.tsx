'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ClinicalEncounterDto,
  ClinicalNoteDto,
  VitalSignDto,
  DiagnosisDto,
  FacilityDto,
  DepartmentDto,
  PatientProfileDto,
  DoctorProfileDto,
  EncounterType,
  NoteType,
  DiagnosisType,
  DiagnosisStatus,
} from '@medinexa/types';

import Patient360Drawer from '@/components/Patient360Drawer';

export default function DoctorClinicalDashboardPage() {
  const [encounters, setEncounters] = useState<ClinicalEncounterDto[]>([]);
  const [selectedEncounter, setSelectedEncounter] = useState<ClinicalEncounterDto | null>(null);
  const [facilities, setFacilities] = useState<FacilityDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [patients, setPatients] = useState<PatientProfileDto[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfileDto[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [loggedInDoctor, setLoggedInDoctor] = useState<DoctorProfileDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Action States
  const [showNewEncounterModal, setShowNewEncounterModal] = useState(false);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [showVitalModal, setShowVitalModal] = useState(false);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showLabOrderModal, setShowLabOrderModal] = useState(false);
  const [amendModalNote, setAmendModalNote] = useState<ClinicalNoteDto | null>(null);

  // Patient 360 Drawer State
  const [showPatient360Drawer, setShowPatient360Drawer] = useState(false);
  const [drawerPatientId, setDrawerPatientId] = useState<string | null>(null);

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Inputs
  const [newEncPatientId, setNewEncPatientId] = useState('');
  const [newEncDoctorId, setNewEncDoctorId] = useState('');
  const [newEncFacilityId, setNewEncFacilityId] = useState('');
  const [newEncDepartmentId, setNewEncDepartmentId] = useState('');
  const [newEncType, setNewEncType] = useState<EncounterType>(EncounterType.OUTPATIENT);
  const [newEncReason, setNewEncReason] = useState('');

  // Note Input
  const [noteType, setNoteType] = useState<NoteType>(NoteType.PROGRESS_NOTE);
  const [noteContent, setNoteContent] = useState('');

  // Amend Note Input
  const [amendContent, setAmendContent] = useState('');
  const [amendReason, setAmendReason] = useState('');

  // Vitals Input
  const [temp, setTemp] = useState('');
  const [hr, setHr] = useState('');
  const [rr, setRr] = useState('');
  const [sysBp, setSysBp] = useState('');
  const [diaBp, setDiaBp] = useState('');
  const [spo2, setSpo2] = useState('');

  // Diagnosis Input
  const [diagName, setDiagName] = useState('');
  const [diagCode, setDiagCode] = useState('');
  const [diagType, setDiagType] = useState<DiagnosisType>(DiagnosisType.PRIMARY);

  // Prescription State
  const [medications, setMedications] = useState<any[]>([]);
  const [rxMedicationId, setRxMedicationId] = useState('');
  const [rxDosage, setRxDosage] = useState('500 mg');
  const [rxRoute, setRxRoute] = useState('ORAL');
  const [rxFrequency, setRxFrequency] = useState('Twice daily');
  const [rxDuration, setRxDuration] = useState('5 days');
  const [rxQuantity, setRxQuantity] = useState('10');
  const [rxInstructions, setRxInstructions] = useState('Take after food.');
  const [rxRefills, setRxRefills] = useState('0');
  const [encounterPrescriptions, setEncounterPrescriptions] = useState<any[]>([]);

  // Lab Order State
  const [labTests, setLabTests] = useState<any[]>([]);
  const [labTestId, setLabTestId] = useState('');
  const [labPriority, setLabPriority] = useState('ROUTINE');
  const [labReason, setLabReason] = useState('Routine cardiac follow-up evaluation');
  const [encounterLabOrders, setEncounterLabOrders] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'notes' | 'vitals' | 'diagnoses' | 'prescriptions' | 'labOrders' | 'timeline'>('notes');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const getHeaders = () => {
    const token = localStorage.getItem('medinexa_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchEncounters = (facId?: string) => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    const targetFac = facId || newEncFacilityId;
    const url = targetFac ? `${apiUrl}/encounters?facilityId=${targetFac}` : `${apiUrl}/encounters`;

    fetch(url, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setEncounters(list);
        if (list.length > 0) {
          fetchEncounterDetail(list[0].id);
        } else {
          setSelectedEncounter(null);
        }
      })
      .catch(() => {});
  };

  const fetchEncounterDetail = (id: string) => {
    const token = localStorage.getItem('medinexa_token');
    fetch(`${apiUrl}/encounters/${id}`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((detail) => {
        setSelectedEncounter(detail);
        fetchEncounterPrescriptionsAndLabs(id);
      })
      .catch(() => {});
  };

  const fetchEncounterPrescriptionsAndLabs = (encId: string) => {
    fetch(`${apiUrl}/encounters/${encId}/prescriptions`, { headers: getHeaders() })
      .then((r) => r.json())
      .then((data) => setEncounterPrescriptions(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch(`${apiUrl}/encounters/${encId}/lab-orders`, { headers: getHeaders() })
      .then((r) => r.json())
      .then((data) => setEncounterLabOrders(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    Promise.all([
      fetch(`${apiUrl}/facilities`).then((r) => r.json()),
      token ? fetch(`${apiUrl}/patients`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()) : Promise.resolve([]),
      fetch(`${apiUrl}/doctors`).then((r) => r.json()),
      fetch(`${apiUrl}/medications`).then((r) => r.json()),
      fetch(`${apiUrl}/lab/tests`).then((r) => r.json()),
      token ? fetch(`${apiUrl}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()) : Promise.resolve(null),
    ])
      .then(([facList, patList, docList, medList, labTestList, meRes]) => {
        const validFacs = Array.isArray(facList) ? facList : [];
        setFacilities(validFacs);
        const validPats = Array.isArray(patList) ? patList : [];
        setPatients(validPats);
        if (validPats.length > 0 && !newEncPatientId) setNewEncPatientId(validPats[0].id);

        const validDocs = Array.isArray(docList) ? docList : [];
        setDoctors(validDocs);

        const validMeds = Array.isArray(medList) ? medList : [];
        setMedications(validMeds);
        if (validMeds.length > 0) setRxMedicationId(validMeds[0].id);

        const validLabTests = Array.isArray(labTestList) ? labTestList : [];
        setLabTests(validLabTests);
        if (validLabTests.length > 0) setLabTestId(validLabTests[0].id);

        // Auto-associate logged-in doctor profile
        let autoDocId = '';
        if (meRes) {
          const role = meRes.roleCode || meRes.role?.code || meRes.role || '';
          setUserRole(role);
          if (role === 'PATIENT') {
            window.location.href = '/dashboard/appointments';
            return;
          }
          if (meRes.doctorProfile?.id) {
            autoDocId = meRes.doctorProfile.id;
            setLoggedInDoctor(meRes.doctorProfile);
          } else {
            const docMatch = validDocs.find(
              (d: any) => d.userId === meRes.id || d.user?.id === meRes.id || d.user?.email === meRes.email
            );
            if (docMatch) {
              autoDocId = docMatch.id;
              setLoggedInDoctor(docMatch);
            }
          }
        }

        if (!autoDocId && validDocs.length > 0) {
          autoDocId = validDocs[0].id;
        }
        if (autoDocId) {
          setNewEncDoctorId(autoDocId);
        }

        const initialFacId = meRes?.facilityId || meRes?.doctorProfile?.facilityId || (validFacs.length > 0 ? validFacs[0].id : undefined);

        if (initialFacId) {
          setNewEncFacilityId(initialFacId);
          fetchEncounters(initialFacId);
          fetch(`${apiUrl}/facilities/${initialFacId}/departments`)
            .then((r) => r.json())
            .then((depts) => {
              const validDepts = Array.isArray(depts) ? depts : [];
              setDepartments(validDepts);
              if (validDepts.length > 0) setNewEncDepartmentId(validDepts[0].id);
            });
        } else {
          fetchEncounters();
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetchEncounters();
  }, [apiUrl]);

  useEffect(() => {
    if (newEncFacilityId) {
      fetch(`${apiUrl}/facilities/${newEncFacilityId}/departments`)
        .then((r) => r.json())
        .then((depts) => {
          const validDepts = Array.isArray(depts) ? depts : [];
          setDepartments(validDepts);
          if (validDepts.length > 0) setNewEncDepartmentId(validDepts[0].id);
        })
        .catch(() => {});
    }
  }, [apiUrl, newEncFacilityId]);

  useEffect(() => {
    fetchEncounters();
    const interval = setInterval(fetchEncounters, 5000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  const handleCreateEncounter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionError(null);

    const docId = newEncDoctorId || loggedInDoctor?.id;
    if (!docId) {
      setActionError('Doctor ID is required. Please log in as a doctor or select an attending doctor.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/encounters`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          patientId: newEncPatientId,
          doctorId: docId,
          facilityId: newEncFacilityId,
          departmentId: newEncDepartmentId,
          encounterType: newEncType,
          reasonForVisit: newEncReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create encounter');

      setActionSuccess(`Encounter '${data.encounterNumber}' created successfully!`);
      setShowNewEncounterModal(false);
      fetchEncounterDetail(data.id);
      fetchEncounters();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEncounter) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch(`${apiUrl}/encounters/${selectedEncounter.id}/notes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ noteType, content: noteContent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add note');

      setActionSuccess('Draft clinical note added');
      setShowNewNoteModal(false);
      setNoteContent('');
      fetchEncounterDetail(selectedEncounter.id);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignNote = async (noteId: string) => {
    if (!selectedEncounter) return;
    setIsSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch(`${apiUrl}/notes/${noteId}/sign`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to sign clinical note');

      setActionSuccess('Clinical note officially SIGNED and locked');
      fetchEncounterDetail(selectedEncounter.id);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEncounter || !amendModalNote) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch(`${apiUrl}/notes/${amendModalNote.id}/amend`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ content: amendContent, reason: amendReason }),
      });
      if (!res.ok) throw new Error('Failed to amend clinical note');

      setActionSuccess('Clinical note amended; prior version preserved');
      setAmendModalNote(null);
      fetchEncounterDetail(selectedEncounter.id);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEncounter) return;

    setActionError(null);

    const parsedTemp = temp.trim() ? Number(temp) : undefined;
    const parsedHr = hr.trim() ? Number(hr) : undefined;
    const parsedRr = rr.trim() ? Number(rr) : undefined;
    const parsedSysBp = sysBp.trim() ? Number(sysBp) : undefined;
    const parsedDiaBp = diaBp.trim() ? Number(diaBp) : undefined;
    const parsedSpo2 = spo2.trim() ? Number(spo2) : undefined;

    // Validate at least one vital metric is supplied
    const hasValue =
      (parsedTemp !== undefined && !isNaN(parsedTemp)) ||
      (parsedHr !== undefined && !isNaN(parsedHr)) ||
      (parsedRr !== undefined && !isNaN(parsedRr)) ||
      (parsedSysBp !== undefined && !isNaN(parsedSysBp)) ||
      (parsedDiaBp !== undefined && !isNaN(parsedDiaBp)) ||
      (parsedSpo2 !== undefined && !isNaN(parsedSpo2));

    if (!hasValue) {
      setActionError('Please provide at least one valid vital sign measurement (e.g., BP 120/80, HR 72, Temp 36.5, SpO2 98)');
      return;
    }

    // Validate Blood Pressure pair consistency
    if (sysBp.trim() || diaBp.trim()) {
      if (!sysBp.trim() || !diaBp.trim()) {
        setActionError('Both Systolic and Diastolic Blood Pressure values must be provided together');
        return;
      }
      if (isNaN(parsedSysBp!) || parsedSysBp! <= 0) {
        setActionError('Systolic BP must be a valid positive number');
        return;
      }
      if (isNaN(parsedDiaBp!) || parsedDiaBp! <= 0) {
        setActionError('Diastolic BP must be a valid positive number');
        return;
      }
      if (parsedSysBp! <= parsedDiaBp!) {
        setActionError('Systolic BP must be greater than Diastolic BP');
        return;
      }
    }

    if (hr.trim()) {
      if (isNaN(parsedHr!) || parsedHr! <= 0 || !Number.isInteger(parsedHr)) {
        setActionError('Heart Rate must be a valid positive integer');
        return;
      }
    }

    if (temp.trim()) {
      if (isNaN(parsedTemp!) || parsedTemp! < 30 || parsedTemp! > 45) {
        setActionError('Temperature must be a valid numeric value between 30°C and 45°C');
        return;
      }
    }

    if (spo2.trim()) {
      if (isNaN(parsedSpo2!) || parsedSpo2! < 0 || parsedSpo2! > 100) {
        setActionError('Oxygen Saturation (SpO2) must be a valid percentage between 0% and 100%');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${apiUrl}/encounters/${selectedEncounter.id}/vitals`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          temperature: parsedTemp,
          heartRate: parsedHr,
          respiratoryRate: parsedRr,
          systolicBP: parsedSysBp,
          diastolicBP: parsedDiaBp,
          oxygenSaturation: parsedSpo2,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to record vitals');

      setActionSuccess('Physiological vital signs recorded successfully');
      setShowVitalModal(false);
      setTemp(''); setHr(''); setRr(''); setSysBp(''); setDiaBp(''); setSpo2('');
      fetchEncounterDetail(selectedEncounter.id);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEncounter) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch(`${apiUrl}/encounters/${selectedEncounter.id}/diagnoses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          diagnosisName: diagName,
          diagnosisCode: diagCode || undefined,
          diagnosisType: diagType,
        }),
      });
      if (!res.ok) throw new Error('Failed to record diagnosis');

      setActionSuccess('Clinical diagnosis added to encounter record');
      setShowDiagnosisModal(false);
      setDiagName(''); setDiagCode('');
      fetchEncounterDetail(selectedEncounter.id);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEncounter) return;

    if (!rxMedicationId) {
      setActionError('Please select a medication');
      return;
    }
    if (!rxDosage.trim()) {
      setActionError('Dosage cannot be empty');
      return;
    }
    if (!rxFrequency.trim()) {
      setActionError('Frequency cannot be empty');
      return;
    }
    if (!rxDuration.trim()) {
      setActionError('Duration cannot be empty');
      return;
    }
    const qtyNum = Number(rxQuantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setActionError('Quantity must be a valid positive number');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch(`${apiUrl}/prescriptions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          encounterId: selectedEncounter.id,
          items: [
            {
              medicationId: rxMedicationId,
              dosage: rxDosage.trim(),
              route: rxRoute.trim(),
              frequency: rxFrequency.trim(),
              duration: rxDuration.trim(),
              quantity: qtyNum,
              instructions: rxInstructions.trim() || undefined,
              refillsAllowed: Number(rxRefills) || 0,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create prescription');

      // Automatically issue prescription so it appears in Pharmacy Workstation
      await fetch(`${apiUrl}/prescriptions/${data.id}/issue`, {
        method: 'POST',
        headers: getHeaders(),
      }).catch(() => {});

      setActionSuccess(`Prescription #${data.prescriptionNumber || 'created'} issued successfully! Visible in Pharmacy Workstation.`);
      setShowPrescriptionModal(false);
      fetchEncounterPrescriptionsAndLabs(selectedEncounter.id);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateLabOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEncounter) return;

    if (!labTestId) {
      setActionError('Please select a lab test');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch(`${apiUrl}/lab/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          encounterId: selectedEncounter.id,
          testIds: [labTestId],
          priority: labPriority,
          clinicalNotes: labReason.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create lab order');

      setActionSuccess(`Lab Order #${data.orderNumber || 'created'} requested successfully! Visible in Lab Module.`);
      setShowLabOrderModal(false);
      fetchEncounterPrescriptionsAndLabs(selectedEncounter.id);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold">M</div>
              <span className="text-lg font-extrabold text-slate-900">MediNexa</span>
            </div>

            <nav className="flex space-x-4">
              <Link href="/dashboard" className="text-sm text-slate-600 hover:text-sky-600 font-medium">Overview</Link>
              <Link href="/dashboard/clinical" className="text-sm text-sky-600 font-bold border-b-2 border-sky-600 pb-1">Clinical Workstation</Link>
              <Link href="/dashboard/lab" className="text-sm text-slate-600 hover:text-sky-600 font-medium">Lab</Link>
              <Link href="/dashboard/pharmacy" className="text-sm text-slate-600 hover:text-sky-600 font-medium">Pharmacy</Link>
              <Link href="/dashboard/admissions" className="text-sm text-slate-600 hover:text-sky-600 font-medium">Admissions</Link>
              <Link href="/dashboard/hospital/beds" className="text-sm text-slate-600 hover:text-sky-600 font-medium">Live Beds</Link>
            </nav>
          </div>

          <button
            onClick={() => setShowNewEncounterModal(true)}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-sm"
          >
            + Start New Encounter
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {actionSuccess && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold rounded-xl flex items-center justify-between">
            <span>✅ {actionSuccess}</span>
            <button onClick={() => setActionSuccess(null)} className="text-xs font-bold text-emerald-700">Dismiss</button>
          </div>
        )}
        {actionError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-900 text-sm font-semibold rounded-xl flex items-center justify-between">
            <span>⚠️ {actionError}</span>
            <button onClick={() => setActionError(null)} className="text-xs font-bold text-red-700">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Encounter Directory */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col h-[750px]">
            <h2 className="text-lg font-black text-slate-900 mb-3 px-2">Clinical Encounters</h2>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {encounters.map((enc) => (
                <div
                  key={enc.id}
                  onClick={() => fetchEncounterDetail(enc.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedEncounter?.id === enc.id
                      ? 'bg-sky-50 border-sky-300 shadow-sm'
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">{enc.encounterNumber}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-sky-100 text-sky-800">
                      {enc.encounterType}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-1">
                    Patient: {enc.patient?.user?.firstName} {enc.patient?.user?.lastName}
                  </div>
                  <div className="text-xs text-slate-500">
                    Dr. {enc.doctor?.user?.lastName} • {enc.department?.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Active Encounter Workspace */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-[750px]">
            {selectedEncounter ? (
              <>
                {/* Header Info */}
                <div className="border-b border-slate-200 pb-4 mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">
                      Encounter {selectedEncounter.encounterNumber}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Patient: <strong className="text-slate-800">{selectedEncounter.patient?.user?.firstName} {selectedEncounter.patient?.user?.lastName}</strong> ({selectedEncounter.patient?.user?.email})
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const pId = selectedEncounter?.patientId || (selectedEncounter as any)?.patient?.id;
                        if (pId) {
                          setDrawerPatientId(pId);
                          setShowPatient360Drawer(true);
                        } else {
                          setActionError('No patient ID associated with selected encounter.');
                        }
                      }}
                      className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg flex items-center space-x-1"
                    >
                      <span>🔍</span>
                      <span>Patient 360</span>
                    </button>
                    <button
                      onClick={() => setShowNewNoteModal(true)}
                      className="text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-lg"
                    >
                      + Note
                    </button>
                    <button
                      onClick={() => setShowVitalModal(true)}
                      className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg"
                    >
                      + Vitals
                    </button>
                    <button
                      onClick={() => setShowDiagnosisModal(true)}
                      className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg"
                    >
                      + Diagnosis
                    </button>
                    <button
                      onClick={() => setShowPrescriptionModal(true)}
                      className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg"
                    >
                      + Prescription
                    </button>
                    <button
                      onClick={() => setShowLabOrderModal(true)}
                      className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg"
                    >
                      + Lab Order
                    </button>
                  </div>
                </div>

                {/* Workspace Tabs */}
                <div className="flex space-x-4 border-b border-slate-100 pb-2 mb-4">
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`text-xs font-bold pb-1 ${activeTab === 'notes' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-500'}`}
                  >
                    Clinical Notes ({selectedEncounter.clinicalNotes?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('vitals')}
                    className={`text-xs font-bold pb-1 ${activeTab === 'vitals' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-500'}`}
                  >
                    Vital Signs ({selectedEncounter.vitalSigns?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('diagnoses')}
                    className={`text-xs font-bold pb-1 ${activeTab === 'diagnoses' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-500'}`}
                  >
                    Diagnoses ({selectedEncounter.diagnoses?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('prescriptions')}
                    className={`text-xs font-bold pb-1 ${activeTab === 'prescriptions' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-500'}`}
                  >
                    Prescriptions ({encounterPrescriptions.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('labOrders')}
                    className={`text-xs font-bold pb-1 ${activeTab === 'labOrders' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-500'}`}
                  >
                    Lab Orders ({encounterLabOrders.length})
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                  {activeTab === 'notes' && (
                    <div className="space-y-3">
                      {selectedEncounter.clinicalNotes && selectedEncounter.clinicalNotes.length > 0 ? (
                        selectedEncounter.clinicalNotes.map((n) => (
                          <div key={n.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black uppercase text-slate-700">{n.noteType}</span>
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs px-2 py-0.5 rounded font-extrabold ${n.status === 'SIGNED' ? 'bg-emerald-100 text-emerald-800' : n.status === 'AMENDED' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'}`}>
                                  {n.status}
                                </span>
                                {n.status === 'DRAFT' && (
                                  <button
                                    onClick={() => handleSignNote(n.id)}
                                    className="text-xs font-bold bg-emerald-600 text-white px-2.5 py-1 rounded"
                                  >
                                    Sign Note
                                  </button>
                                )}
                                {(n.status === 'SIGNED' || n.status === 'AMENDED') && (
                                  <button
                                    onClick={() => {
                                      setAmendModalNote(n);
                                      setAmendContent(n.content);
                                    }}
                                    className="text-xs font-bold bg-amber-600 text-white px-2.5 py-1 rounded"
                                  >
                                    Amend
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-slate-800 whitespace-pre-wrap">{n.content}</p>
                            <div className="text-xs text-slate-500">By Dr. {n.author?.lastName} • {new Date(n.createdAt).toLocaleString()}</div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic p-4 text-center">No clinical notes recorded yet.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'vitals' && (
                    <div className="space-y-3">
                      {selectedEncounter.vitalSigns && selectedEncounter.vitalSigns.length > 0 ? (
                        selectedEncounter.vitalSigns.map((v) => (
                          <div key={v.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div><span className="text-slate-500">Temp:</span> <strong className="text-slate-900">{v.temperature ? `${v.temperature}°C` : 'N/A'}</strong></div>
                            <div><span className="text-slate-500">HR:</span> <strong className="text-slate-900">{v.heartRate ? `${v.heartRate} bpm` : 'N/A'}</strong></div>
                            <div><span className="text-slate-500">BP:</span> <strong className="text-slate-900">{v.systolicBP && v.diastolicBP ? `${v.systolicBP}/${v.diastolicBP}` : 'N/A'}</strong></div>
                            <div><span className="text-slate-500">SpO2:</span> <strong className="text-slate-900">{v.oxygenSaturation ? `${v.oxygenSaturation}%` : 'N/A'}</strong></div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic p-4 text-center">No vital signs recorded yet.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'diagnoses' && (
                    <div className="space-y-3">
                      {selectedEncounter.diagnoses && selectedEncounter.diagnoses.length > 0 ? (
                        selectedEncounter.diagnoses.map((d) => (
                          <div key={d.id} className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-sm text-purple-950">{d.diagnosisName}</span>
                              <span className="text-xs px-2 py-0.5 bg-purple-200 text-purple-900 rounded font-bold">{d.diagnosisType}</span>
                            </div>
                            <div className="text-xs text-purple-800">Status: {d.status}</div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic p-4 text-center">No diagnoses recorded yet.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'prescriptions' && (
                    <div className="space-y-3">
                      {encounterPrescriptions && encounterPrescriptions.length > 0 ? (
                        encounterPrescriptions.map((rx) => (
                          <div key={rx.id} className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-sm text-teal-950">Rx #{rx.prescriptionNumber}</span>
                              <span className="text-xs px-2.5 py-0.5 bg-teal-200 text-teal-900 rounded-full font-bold">{rx.status}</span>
                            </div>
                            {rx.items && rx.items.map((item: any) => (
                              <div key={item.id} className="bg-white p-3 rounded-lg border border-teal-100 text-xs space-y-1">
                                <div className="font-bold text-slate-900 text-sm">
                                  {item.medication?.genericName || item.medication?.brandName || 'Medication'} ({item.dosage})
                                </div>
                                <div className="text-slate-600">
                                  Route: <strong>{item.route}</strong> • Frequency: <strong>{item.frequency}</strong> • Duration: <strong>{item.duration}</strong> • Qty: <strong>{item.quantity}</strong>
                                </div>
                                {item.instructions && <div className="text-slate-500 italic">Instructions: {item.instructions}</div>}
                              </div>
                            ))}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic p-4 text-center">No prescriptions created for this encounter yet.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'labOrders' && (
                    <div className="space-y-3">
                      {encounterLabOrders && encounterLabOrders.length > 0 ? (
                        encounterLabOrders.map((lab) => (
                          <div key={lab.id} className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-sm text-amber-950">Lab Order #{lab.orderNumber}</span>
                              <div className="flex space-x-2">
                                <span className="text-xs px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-bold">{lab.priority}</span>
                                <span className="text-xs px-2 py-0.5 bg-sky-200 text-sky-900 rounded font-bold">{lab.status}</span>
                              </div>
                            </div>
                            {lab.items && lab.items.map((item: any) => (
                              <div key={item.id} className="bg-white p-3 rounded-lg border border-amber-100 text-xs space-y-1">
                                <div className="font-bold text-slate-900">{item.test?.testName || 'Lab Test'}</div>
                                {item.result && (
                                  <div className="text-emerald-700 font-semibold">
                                    Result: {item.result.resultValue} {item.result.unit} (Flag: {item.result.abnormalFlag})
                                  </div>
                                )}
                              </div>
                            ))}
                            {lab.clinicalNotes && <div className="text-xs text-amber-900 italic">Notes: {lab.clinicalNotes}</div>}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic p-4 text-center">No lab orders created for this encounter yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-500 my-auto">Select a clinical encounter to open workspace.</div>
            )}
          </div>
        </div>
      </main>

      {/* New Encounter Modal */}
      {showNewEncounterModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateEncounter} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Start New Clinical Encounter</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Patient *</label>
              <select
                required
                value={newEncPatientId}
                onChange={(e) => setNewEncPatientId(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
              >
                <option value="">-- Select Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.user?.firstName} {p.user?.lastName} ({p.user?.email})</option>
                ))}
              </select>
            </div>

            {userRole === 'DOCTOR' || loggedInDoctor ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Attending Doctor</label>
                <div className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 flex items-center justify-between">
                  <span>Dr. {loggedInDoctor?.user?.firstName || 'Rajesh'} {loggedInDoctor?.user?.lastName || 'Sharma'}</span>
                  <span className="text-xs bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full">Logged-in Doctor</span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Attending Doctor *</label>
                <select
                  required
                  value={newEncDoctorId}
                  onChange={(e) => setNewEncDoctorId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white font-medium"
                >
                  <option value="">Select Doctor...</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.user?.firstName} {d.user?.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Encounter Type *</label>
                <select
                  value={newEncType}
                  onChange={(e) => setNewEncType(e.target.value as EncounterType)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  {Object.values(EncounterType).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Department</label>
                <select
                  value={newEncDepartmentId}
                  onChange={(e) => setNewEncDepartmentId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Chief Complaint / Reason</label>
              <input
                type="text"
                placeholder="Reason for clinical visit..."
                value={newEncReason}
                onChange={(e) => setNewEncReason(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewEncounterModal(false)}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !newEncPatientId}
                className="text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Start Encounter
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Note Modal */}
      {showNewNoteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateNote} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Add Draft Clinical Note</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Note Type</label>
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as NoteType)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
              >
                {Object.values(NoteType).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Clinical Note Content *</label>
              <textarea
                required
                rows={5}
                placeholder="SOAP note or clinical progress content..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewNoteModal(false)}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !noteContent}
                className="text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Save Draft Note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Amend Note Modal */}
      {amendModalNote && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAmendNote} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Amend Signed Note</h3>
            <p className="text-xs text-slate-500">Original signed content will be preserved in audit version history.</p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Amended Content *</label>
              <textarea
                required
                rows={5}
                value={amendContent}
                onChange={(e) => setAmendContent(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Amendment Reason *</label>
              <input
                required
                type="text"
                placeholder="Reason for amendment..."
                value={amendReason}
                onChange={(e) => setAmendReason(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setAmendModalNote(null)}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !amendReason}
                className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Confirm Amendment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Record Vitals Modal */}
      {showVitalModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleRecordVitals} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Record Vital Signs</h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Temp (°C)</label>
                <input type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} className="w-full border rounded-xl p-2" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Heart Rate (bpm)</label>
                <input type="number" value={hr} onChange={(e) => setHr(e.target.value)} className="w-full border rounded-xl p-2" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Systolic BP</label>
                <input type="number" value={sysBp} onChange={(e) => setSysBp(e.target.value)} className="w-full border rounded-xl p-2" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Diastolic BP</label>
                <input type="number" value={diaBp} onChange={(e) => setDiaBp(e.target.value)} className="w-full border rounded-xl p-2" />
              </div>
              <div>
                <label className="block font-semibold mb-1">SpO2 (%)</label>
                <input type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} className="w-full border rounded-xl p-2" />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowVitalModal(false)}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Record Vitals
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Diagnosis Modal */}
      {showDiagnosisModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddDiagnosis} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Record Clinical Diagnosis</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Diagnosis Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Acute Bronchitis..."
                value={diagName}
                onChange={(e) => setDiagName(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Diagnosis Type</label>
              <select
                value={diagType}
                onChange={(e) => setDiagType(e.target.value as DiagnosisType)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
              >
                {Object.values(DiagnosisType).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDiagnosisModal(false)}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !diagName}
                className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Add Diagnosis
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreatePrescription} className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Issue Clinical Prescription</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Medication *</label>
              <select
                required
                value={rxMedicationId}
                onChange={(e) => setRxMedicationId(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
              >
                {medications.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.genericName} ({m.brandName || m.code}) — {m.strength}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Dosage *</label>
                <input required type="text" value={rxDosage} onChange={(e) => setRxDosage(e.target.value)} className="w-full border rounded-xl p-2" placeholder="e.g. 500 mg" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Route *</label>
                <select value={rxRoute} onChange={(e) => setRxRoute(e.target.value)} className="w-full border rounded-xl p-2 bg-white">
                  <option value="ORAL">ORAL</option>
                  <option value="INJECTION">INJECTION</option>
                  <option value="SUBCUTANEOUS">SUBCUTANEOUS</option>
                  <option value="TOPICAL">TOPICAL</option>
                  <option value="IV">INTRAVENOUS (IV)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Frequency *</label>
                <input required type="text" value={rxFrequency} onChange={(e) => setRxFrequency(e.target.value)} className="w-full border rounded-xl p-2" placeholder="e.g. Twice daily" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Duration *</label>
                <input required type="text" value={rxDuration} onChange={(e) => setRxDuration(e.target.value)} className="w-full border rounded-xl p-2" placeholder="e.g. 5 days" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Quantity *</label>
                <input required type="number" min="1" value={rxQuantity} onChange={(e) => setRxQuantity(e.target.value)} className="w-full border rounded-xl p-2" placeholder="10" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Refills Allowed</label>
                <input type="number" min="0" value={rxRefills} onChange={(e) => setRxRefills(e.target.value)} className="w-full border rounded-xl p-2" placeholder="0" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Instructions</label>
              <textarea
                rows={2}
                value={rxInstructions}
                onChange={(e) => setRxInstructions(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2 text-sm"
                placeholder="Take after food..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPrescriptionModal(false)}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !rxMedicationId || !rxDosage}
                className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Issue Prescription
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lab Order Modal */}
      {showLabOrderModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateLabOrder} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Request Lab Order</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Select Lab Test *</label>
              <select
                required
                value={labTestId}
                onChange={(e) => setLabTestId(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
              >
                {labTests.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.testName} ({t.testCode}) — {t.category || 'General'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Priority</label>
              <select
                value={labPriority}
                onChange={(e) => setLabPriority(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
              >
                <option value="ROUTINE">ROUTINE</option>
                <option value="URGENT">URGENT</option>
                <option value="STAT">STAT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Reason / Clinical Notes</label>
              <textarea
                rows={2}
                value={labReason}
                onChange={(e) => setLabReason(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2 text-sm"
                placeholder="Clinical justification for lab test..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLabOrderModal(false)}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !labTestId}
                className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Request Lab Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Patient 360 Slide-over Drawer */}
      <Patient360Drawer
        patientId={drawerPatientId}
        isOpen={showPatient360Drawer}
        onClose={() => {
          setShowPatient360Drawer(false);
          setDrawerPatientId(null);
        }}
      />
    </div>
  );
}
