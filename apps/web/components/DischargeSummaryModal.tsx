'use client';

import React, { useEffect, useState } from 'react';
import { DischargeSummaryDto } from '@medinexa/types';
import { apiFetch } from '@/lib/api-client';

interface DischargeSummaryModalProps {
  admissionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DischargeSummaryModal({ admissionId, isOpen, onClose }: DischargeSummaryModalProps) {
  const [data, setData] = useState<DischargeSummaryDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && admissionId) {
      fetchDischargeSummary(admissionId);
    }
  }, [isOpen, admissionId]);

  const fetchDischargeSummary = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<DischargeSummaryDto>(`/admissions/${id}/discharge-summary`);
      if (res.ok && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Unable to load discharge summary');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    if (admissionId) {
      try {
        await apiFetch(`/admissions/${admissionId}/discharge-summary/print`, { method: 'POST' });
      } catch (e) {
        console.warn('Failed to record print audit event', e);
      }
    }
    window.print();
  };

  if (!isOpen) return null;

  const adm = data?.admission;
  const patient = data?.patient;
  const user = patient?.user;
  const facility = data?.facility;
  const doctor = data?.attendingDoctor?.user;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex justify-center items-center p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Action Header (Hidden during print) */}
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center print:hidden">
          <div className="flex items-center space-x-3">
            <span className="text-xl">📜</span>
            <h3 className="font-bold text-lg">Hospital Patient Discharge Summary</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              disabled={loading || !data}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow flex items-center space-x-2 transition disabled:opacity-50"
            >
              <span>🖨️</span>
              <span>Print Discharge Summary</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl font-bold p-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 print:p-0 print:overflow-visible">
          {loading && (
            <div className="flex justify-center items-center py-20 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              Generating Official Clinical Discharge Summary...
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && data && (
            <div className="space-y-6 print:space-y-4">
              {/* Facility Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{facility?.name || 'MediNexa Network Hospital'}</h1>
                  <p className="text-xs text-slate-600 mt-1 font-medium">{facility?.address || 'Healthcare City Center'}</p>
                  <p className="text-xs text-slate-500">Contact Phone: {facility?.phone || '+1 (800) 555-MEDINEXA'}</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-mono font-bold rounded">
                    {data.summaryNumber}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Generated: {new Date(data.generatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Patient & Admission Meta Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs p-4 bg-slate-50 rounded-xl border border-slate-200 print:bg-white print:border-slate-300">
                <div>
                  <h4 className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider text-blue-700 mb-2">Patient Details</h4>
                  <p className="font-bold text-sm text-slate-900">{user ? `${user.firstName} ${user.lastName}` : 'N/A'}</p>
                  <p className="text-slate-600">Gender: <span className="font-semibold text-slate-900">{patient?.gender || 'N/A'}</span> • Blood Group: <span className="font-semibold text-slate-900">{patient?.bloodGroup || 'N/A'}</span></p>
                  <p className="text-slate-600">DOB: <span className="font-semibold text-slate-900">{patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</span></p>
                  <p className="text-slate-600">Emergency Contact: <span className="font-semibold text-slate-900">{patient?.emergencyContacts?.[0]?.name ? `${patient.emergencyContacts[0].name} (${patient.emergencyContacts[0].phone})` : 'N/A'}</span></p>
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider text-blue-700 mb-2">Admission & Discharge Details</h4>
                  <p className="text-slate-600">Admission Date: <span className="font-semibold text-slate-900">{adm?.admittedAt ? new Date(adm.admittedAt).toLocaleString() : 'N/A'}</span></p>
                  <p className="text-slate-600">Discharge Date: <span className="font-semibold text-slate-900">{adm?.dischargedAt ? new Date(adm.dischargedAt).toLocaleString() : 'Pending Discharge'}</span></p>
                  <p className="text-slate-600">Admission Type: <span className="font-semibold text-slate-900">{adm?.admissionType || 'INPATIENT'}</span></p>
                  <p className="text-slate-600">Bed Location: <span className="font-semibold text-slate-900">{data.bedLocation ? `Ward: ${data.bedLocation.wardName || 'General'} | Room: ${data.bedLocation.roomNumber || 'N/A'} | Bed: ${data.bedLocation.bedNumber}` : 'N/A'}</span></p>
                </div>
              </div>

              {/* Diagnoses Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1">Final & Working Diagnoses</h3>
                {data.diagnoses.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No formal diagnoses logged during admission.</p>
                ) : (
                  <div className="space-y-1.5">
                    {data.diagnoses.map((d) => (
                      <div key={d.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded border border-slate-100 print:bg-white print:border-slate-200">
                        <div>
                          <span className="font-bold text-slate-900">{d.diagnosisName}</span>
                          {d.diagnosisCode && <span className="ml-2 font-mono text-slate-500">[{d.diagnosisCode}]</span>}
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800">
                          {d.diagnosisType}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Latest Vital Signs */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1">Physiological Vital Signs</h3>
                {data.vitals.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No vital signs logged during admission.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-50 rounded border border-slate-100 print:border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Blood Pressure</span>
                      <span className="font-bold text-slate-900">
                        {data.vitals[0]?.systolicBP && data.vitals[0]?.diastolicBP
                          ? `${data.vitals[0].systolicBP}/${data.vitals[0].diastolicBP} mmHg`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100 print:border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Heart Rate</span>
                      <span className="font-bold text-slate-900">
                        {data.vitals[0]?.heartRate != null ? `${data.vitals[0].heartRate} bpm` : 'N/A'}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100 print:border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Temperature</span>
                      <span className="font-bold text-slate-900">
                        {data.vitals[0]?.temperature != null ? `${data.vitals[0].temperature}°C` : 'N/A'}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100 print:border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Oxygen Saturation</span>
                      <span className="font-bold text-slate-900">
                        {data.vitals[0]?.oxygenSaturation != null ? `${data.vitals[0].oxygenSaturation}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Discharge Medication Orders */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1">Discharge Medication Plan</h3>
                {data.prescriptions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No discharge medications prescribed.</p>
                ) : (
                  <div className="space-y-2">
                    {data.prescriptions.map((p) => (
                      <div key={p.id} className="text-xs border border-slate-200 rounded p-2.5 space-y-1.5">
                        <p className="font-bold text-slate-800">Prescription #{p.prescriptionNumber}</p>
                        {p.items?.map((item: any) => (
                          <div key={item.id} className="pl-3 border-l-2 border-blue-500 text-xs">
                            <span className="font-bold text-slate-900">{item.medication?.name || item.medicationName}</span>
                            <span className="text-slate-600 ml-2">— Dosage: {item.dosage} | Frequency: {item.frequency} | Duration: {item.durationDays} days</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Clinical Summary & Notes */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1">Signed Clinical Progress Notes</h3>
                {data.clinicalNotes.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No clinical progress notes recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {data.clinicalNotes.map((n) => (
                      <div key={n.id} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 print:bg-white">
                        <span className="font-bold text-slate-900">{n.noteType}: </span>
                        <span>{n.content}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Attending Physician Sign-off */}
              <div className="pt-8 border-t border-slate-300 flex justify-between items-end text-xs">
                <div>
                  <p className="text-slate-500">Facility Stamp & Verification</p>
                  <p className="font-bold text-slate-800 mt-6">MediNexa Clinical Governance</p>
                </div>
                <div className="text-right">
                  <div className="border-b border-slate-400 w-48 mb-1"></div>
                  <p className="font-bold text-slate-900">{doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Attending Physician'}</p>
                  <p className="text-slate-500 text-[10px]">Licensed Attending Doctor</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
