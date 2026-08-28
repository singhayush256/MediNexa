'use client';

import React, { useEffect, useState } from 'react';

interface AdmissionItem {
  id: string;
  admissionNumber: string;
  patient: { id: string; user: { firstName: string; lastName: string; phone?: string } };
  department?: { name: string };
  bedAssignments?: any[];
  admittedAt: string;
  status: string;
}

interface ClearanceItem {
  id: string;
  departmentType: string;
  status: string;
  remarks?: string;
  approvedBy?: { firstName: string; lastName: string };
}

interface SummaryItem {
  id?: string;
  chiefComplaint: string;
  diagnosis: string;
  treatmentProvided: string;
  proceduresPerformed?: string;
  medicationsOnDischarge: string;
  followUpInstructions?: string;
  dischargeCondition?: string;
  status?: string;
  dischargeDate?: string;
}

export default function MultiDepartmentDischargePage() {
  const [admissions, setAdmissions] = useState<AdmissionItem[]>([]);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState('');
  const [clearances, setClearances] = useState<ClearanceItem[]>([]);
  const [summary, setSummary] = useState<SummaryItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Analytics
  const [analytics, setAnalytics] = useState({
    dischargesToday: 0,
    pendingClearances: 0,
    avgLengthOfStayDays: 4.2,
    avgDischargeProcessingTimeMinutes: 28,
  });

  // Summary Form Modal State
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [chiefComplaint, setChiefComplaint] = useState('Chest pain and dyspnea on exertion');
  const [diagnosis, setDiagnosis] = useState('Acute Coronary Syndrome - Inferior Wall MI (Stabilized)');
  const [treatmentProvided, setTreatmentProvided] = useState('Percutaneous Coronary Intervention (PCI) with drug-eluting stent placement');
  const [proceduresPerformed, setProceduresPerformed] = useState('Coronary Angiography & PCI to RCA');
  const [medicationsOnDischarge, setMedicationsOnDischarge] = useState('Aspirin 75mg OD, Clopidogrel 75mg OD, Atorvastatin 40mg HS, Metoprolol 25mg BD');
  const [followUpInstructions, setFollowUpInstructions] = useState('Cardiology OPD Follow-up in 7 days with ECG & Serum Creatinine.');
  const [dischargeCondition, setDischargeCondition] = useState('STABLE');

  // Print PDF Modal State
  const [showPdfModal, setShowPdfModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    fetchAdmissions();
  }, []);

  useEffect(() => {
    if (selectedAdmissionId) {
      fetchDischargeData(selectedAdmissionId);
    }
  }, [selectedAdmissionId]);

  const fetchAdmissions = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [admRes, anaRes] = await Promise.all([
        fetch(`${apiUrl}/admissions`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${apiUrl}/discharge/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      ]);

      if (Array.isArray(admRes) && admRes.length > 0) {
        setAdmissions(admRes);
        setSelectedAdmissionId(admRes[0].id);
      }
      if (anaRes && typeof anaRes === 'object') setAnalytics(anaRes);
    } catch (err) {
      console.error('Failed to load discharge admissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDischargeData = async (admId: string) => {
    const token = localStorage.getItem('medinexa_token');
    try {
      const [clrRes, sumRes] = await Promise.all([
        fetch(`${apiUrl}/discharge/clearance/${admId}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${apiUrl}/discharge/summary/${admId}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      ]);

      setClearances(Array.isArray(clrRes) ? clrRes : []);
      if (sumRes && sumRes.id) {
        setSummary(sumRes);
        setChiefComplaint(sumRes.chiefComplaint || '');
        setDiagnosis(sumRes.diagnosis || '');
        setTreatmentProvided(sumRes.treatmentProvided || '');
        setProceduresPerformed(sumRes.proceduresPerformed || '');
        setMedicationsOnDischarge(sumRes.medicationsOnDischarge || '');
        setFollowUpInstructions(sumRes.followUpInstructions || '');
        setDischargeCondition(sumRes.dischargeCondition || 'STABLE');
      } else {
        setSummary(null);
      }
    } catch (err) {
      console.error('Failed to load clearance & summary data:', err);
    }
  };

  const handleApproveClearance = async (deptType: 'pharmacy' | 'lab' | 'ward' | 'billing') => {
    setActionError('');
    setActionSuccess('');

    try {
      const token = localStorage.getItem('medinexa_token');
      const res = await fetch(`${apiUrl}/discharge/clearance/${deptType}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admissionId: selectedAdmissionId,
          status: 'APPROVED',
          remarks: `${deptType.toUpperCase()} department clearance approved. Zero outstanding dues.`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to approve ${deptType} clearance`);

      setActionSuccess(`✓ ${deptType.toUpperCase()} Clearance Approved!`);
      fetchDischargeData(selectedAdmissionId);
    } catch (err: any) {
      setActionError(err.message || 'Clearance approval failed');
    }
  };

  const handleSaveSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('medinexa_token');
      const payload = {
        admissionId: selectedAdmissionId,
        chiefComplaint,
        diagnosis,
        treatmentProvided,
        proceduresPerformed,
        medicationsOnDischarge,
        followUpInstructions,
        dischargeCondition,
      };

      const res = await fetch(`${apiUrl}/discharge/summary`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save discharge summary');

      setShowSummaryModal(false);
      setActionSuccess('✓ Doctor Discharge Summary draft saved successfully!');
      fetchDischargeData(selectedAdmissionId);
    } catch (err: any) {
      setActionError(err.message || 'Failed to save summary');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalizeDischarge = async () => {
    setActionError('');
    setActionSuccess('');

    // Check clearances locally
    const requiredDepts = ['PHARMACY', 'LAB', 'WARD', 'BILLING'];
    const pendingDepts = requiredDepts.filter((d) => {
      const c = clearances.find((cl) => cl.departmentType === d);
      return !c || c.status !== 'APPROVED';
    });

    if (pendingDepts.length > 0) {
      setActionError(`Final discharge is blocked! Pending clearances: ${pendingDepts.join(', ')}.`);
      return;
    }

    try {
      const token = localStorage.getItem('medinexa_token');
      const res = await fetch(`${apiUrl}/discharge/finalize/${selectedAdmissionId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Final discharge failed');

      setActionSuccess('🎉 Final Discharge Completed! Bed assignment released and patient discharged.');
      fetchAdmissions();
      fetchDischargeData(selectedAdmissionId);
    } catch (err: any) {
      setActionError(err.message || 'Final discharge failed');
    }
  };

  const currentAdm = admissions.find((a) => a.id === selectedAdmissionId);
  const allClearancesApproved =
    clearances.length >= 4 && clearances.every((c) => c.status === 'APPROVED');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Multi-Department Discharge Summary & Clearance Engine
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Apollo & Fortis Style 4-Department Clearance Tracking, Bed Release & Discharge Summaries.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSummaryModal(true)}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            📝 Edit Discharge Summary
          </button>
          <button
            onClick={() => setShowPdfModal(true)}
            disabled={!summary}
            className={`px-4 py-2.5 font-bold text-xs rounded-xl shadow-md transition ${summary ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            📄 Print Discharge Summary PDF
          </button>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase block">Discharges Today</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{analytics.dischargesToday} Patients</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase block">Pending Clearances</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{analytics.pendingClearances}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase block">Avg Length of Stay</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{analytics.avgLengthOfStayDays} Days</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase block">Avg Processing Time</span>
          <span className="text-2xl font-black text-purple-600 mt-1 block">~{analytics.avgDischargeProcessingTimeMinutes} Mins</span>
        </div>
      </div>

      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold shadow-sm">
          ⚠️ {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold shadow-sm">
          {actionSuccess}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-medium animate-pulse">
          Loading discharge roster...
        </div>
      ) : admissions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
          No inpatient admissions ready for discharge.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admission Selector & Clearance Roster */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Selector Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-extrabold text-slate-500 uppercase block">Select Inpatient for Discharge:</span>
                <select
                  value={selectedAdmissionId}
                  onChange={(e) => setSelectedAdmissionId(e.target.value)}
                  className="mt-1 px-4 py-2 border border-slate-300 rounded-xl font-bold text-xs bg-slate-50 text-slate-900"
                >
                  {admissions.map((a) => (
                    <option key={a.id} value={a.id}>
                      #{a.admissionNumber} — {a.patient?.user?.firstName} {a.patient?.user?.lastName} ({a.status})
                    </option>
                  ))}
                </select>
              </div>

              {currentAdm && (
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Bed Assignment</span>
                  <span className="text-xs font-mono font-bold text-sky-600 block">
                    🛏️ {currentAdm.bedAssignments?.[0]?.bed?.code || 'CARDIO-201'}
                  </span>
                </div>
              )}
            </div>

            {/* 4-Department Clearance Tracker Grid */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Multi-Department Clearance Tracker</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    All 4 departments (Pharmacy, Lab, Ward, Billing) must approve before final discharge.
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${allClearancesApproved ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
                  {allClearancesApproved ? 'READY FOR DISCHARGE ✓' : 'CLEARANCE PENDING ⏳'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(['pharmacy', 'lab', 'ward', 'billing'] as const).map((dept) => {
                  const clr = clearances.find((c) => c.departmentType.toLowerCase() === dept);
                  const isApproved = clr?.status === 'APPROVED';

                  return (
                    <div
                      key={dept}
                      className={`p-5 rounded-2xl border transition ${isApproved ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                          {dept === 'pharmacy' && '💊 Pharmacy Clearance'}
                          {dept === 'lab' && '🔬 Lab Clearance'}
                          {dept === 'ward' && '🛏️ Ward Nursing Clearance'}
                          {dept === 'billing' && '💳 Financial Billing Clearance'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${isApproved ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
                          {clr?.status || 'PENDING'}
                        </span>
                      </div>

                      {clr?.approvedBy && (
                        <p className="text-[11px] text-slate-500 font-medium mb-3">
                          Approved by Nurse/Staff {clr.approvedBy.firstName} {clr.approvedBy.lastName}
                        </p>
                      )}

                      {!isApproved && (
                        <button
                          onClick={() => handleApproveClearance(dept)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
                        >
                          Approve {dept.toUpperCase()} Clearance ✓
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Final Discharge CTA Card */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Finalize Hospital Discharge</span>
                  <span className="text-[11px] text-slate-500 font-semibold block">
                    Releases assigned bed to AVAILABLE and records official discharge timestamp.
                  </span>
                </div>

                <button
                  onClick={handleFinalizeDischarge}
                  disabled={!allClearancesApproved || currentAdm?.status === 'DISCHARGED'}
                  className={`px-6 py-3 font-extrabold text-xs rounded-xl shadow-lg transition ${allClearancesApproved && currentAdm?.status !== 'DISCHARGED' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                  {currentAdm?.status === 'DISCHARGED' ? 'Patient Discharged ✓' : 'Execute Final Discharge & Release Bed 🚀'}
                </button>
              </div>
            </div>
          </div>

          {/* Discharge Summary Summary Sidebar */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Clinical Discharge Summary</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Draft Status</span>
            </div>

            {!summary ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium space-y-3">
                <p>No discharge summary draft created yet.</p>
                <button
                  onClick={() => setShowSummaryModal(true)}
                  className="px-4 py-2 bg-sky-600 text-white font-bold text-xs rounded-xl shadow"
                >
                  Create Summary Draft +
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-extrabold text-slate-500 uppercase block text-[10px]">Chief Complaint</span>
                  <p className="font-bold text-slate-900 mt-0.5">{summary.chiefComplaint}</p>
                </div>

                <div>
                  <span className="font-extrabold text-slate-500 uppercase block text-[10px]">Primary Diagnosis</span>
                  <p className="font-bold text-sky-700 mt-0.5">{summary.diagnosis}</p>
                </div>

                <div>
                  <span className="font-extrabold text-slate-500 uppercase block text-[10px]">Treatment Provided</span>
                  <p className="font-medium text-slate-700 mt-0.5">{summary.treatmentProvided}</p>
                </div>

                <div>
                  <span className="font-extrabold text-slate-500 uppercase block text-[10px]">Discharge Medications</span>
                  <p className="font-semibold text-slate-800 mt-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {summary.medicationsOnDischarge}
                  </p>
                </div>

                <div>
                  <span className="font-extrabold text-slate-500 uppercase block text-[10px]">Follow-Up Instructions</span>
                  <p className="font-medium text-slate-700 mt-0.5">{summary.followUpInstructions}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Attending Doctor Discharge Summary Builder</h3>
              <button onClick={() => setShowSummaryModal(false)} className="text-slate-400 font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleSaveSummary} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Chief Complaint *</label>
                <input
                  type="text"
                  required
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Primary Diagnosis *</label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Treatment Provided *</label>
                <textarea
                  rows={2}
                  required
                  value={treatmentProvided}
                  onChange={(e) => setTreatmentProvided(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Procedures Performed</label>
                <input
                  type="text"
                  value={proceduresPerformed}
                  onChange={(e) => setProceduresPerformed(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Medications on Discharge *</label>
                <textarea
                  rows={2}
                  required
                  value={medicationsOnDischarge}
                  onChange={(e) => setMedicationsOnDischarge(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Follow-up Instructions</label>
                <input
                  type="text"
                  value={followUpInstructions}
                  onChange={(e) => setFollowUpInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md transition"
              >
                {isSubmitting ? 'Saving Summary...' : 'Save Discharge Summary ✓'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Printable Discharge Summary PDF Preview Modal */}
      {showPdfModal && summary && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🏥</span>
                <div>
                  <h2 className="text-lg font-black text-slate-900">MediNexa General Hospital</h2>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Official Clinical Discharge Summary</p>
                </div>
              </div>
              <button onClick={() => setShowPdfModal(false)} className="text-slate-400 font-bold text-sm">✕</button>
            </div>

            {/* Printable PDF Content */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 font-serif space-y-6 text-slate-900 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-300 font-sans">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Patient Name</span>
                  <span className="font-bold text-sm text-slate-900">
                    {currentAdm?.patient?.user?.firstName} {currentAdm?.patient?.user?.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Admission #</span>
                  <span className="font-mono font-bold text-sky-600">{currentAdm?.admissionNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Admission Date</span>
                  <span>{currentAdm?.admittedAt ? new Date(currentAdm.admittedAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Discharge Date</span>
                  <span>{summary.dischargeDate ? new Date(summary.dischargeDate).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <h4 className="font-sans font-extrabold text-slate-800 uppercase text-[11px] mb-1">Chief Complaint</h4>
                <p className="italic">{summary.chiefComplaint}</p>
              </div>

              <div>
                <h4 className="font-sans font-extrabold text-slate-800 uppercase text-[11px] mb-1">Final Clinical Diagnosis</h4>
                <p className="font-bold text-sky-900">{summary.diagnosis}</p>
              </div>

              <div>
                <h4 className="font-sans font-extrabold text-slate-800 uppercase text-[11px] mb-1">Hospital Treatment & Procedures</h4>
                <p>{summary.treatmentProvided}</p>
                {summary.proceduresPerformed && (
                  <p className="mt-1 text-slate-700"><strong>Procedures:</strong> {summary.proceduresPerformed}</p>
                )}
              </div>

              <div>
                <h4 className="font-sans font-extrabold text-slate-800 uppercase text-[11px] mb-1">Medications Prescribed on Discharge</h4>
                <p className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] font-semibold text-slate-800">
                  {summary.medicationsOnDischarge}
                </p>
              </div>

              <div>
                <h4 className="font-sans font-extrabold text-slate-800 uppercase text-[11px] mb-1">Follow-Up Instructions</h4>
                <p>{summary.followUpInstructions}</p>
              </div>

              <div className="pt-6 border-t border-slate-300 flex justify-between items-end font-sans">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Discharge Condition</span>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                    {summary.dischargeCondition || 'STABLE'}
                  </span>
                </div>

                <div className="text-center">
                  <div className="border-b border-slate-400 w-36 mb-1"></div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">Attending Doctor Signature</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                🖨️ Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
