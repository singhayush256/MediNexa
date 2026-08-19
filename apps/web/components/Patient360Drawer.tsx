'use client';

import React, { useEffect, useState } from 'react';
import { Patient360Dto } from '@medinexa/types';
import { apiFetch } from '@/lib/api-client';

interface Patient360DrawerProps {
  patientId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function Patient360Drawer({ patientId, isOpen, onClose }: Patient360DrawerProps) {
  const [data, setData] = useState<Patient360Dto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'diagnoses' | 'medications' | 'encounters'>('overview');

  useEffect(() => {
    if (isOpen && patientId) {
      fetchPatient360(patientId);
    }
  }, [isOpen, patientId]);

  const fetchPatient360 = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<Patient360Dto>(`/patients/${id}/360`);
      if (res.ok && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Unable to load patient 360 clinical history');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const patient = data?.patient;
  const user = patient?.user;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900/50 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold">
                  {user ? `${user.firstName} ${user.lastName}` : 'Patient 360 Consultation View'}
                </h2>
                {patient?.bloodGroup && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500 text-white">
                    {patient.bloodGroup}
                  </span>
                )}
              </div>
              <p className="text-blue-100 text-sm mt-1">
                Gender: {patient?.gender || 'N/A'} • DOB: {patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'} • Phone: {patient?.phone || user?.phone || 'N/A'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-blue-200 hover:text-white rounded-full hover:bg-white/10 transition"
            >
              ✕
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-gray-50 px-6 space-x-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 text-sm font-semibold border-b-2 transition ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('vitals')}
              className={`py-3 text-sm font-semibold border-b-2 transition ${
                activeTab === 'vitals'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Vitals ({data?.vitals.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('diagnoses')}
              className={`py-3 text-sm font-semibold border-b-2 transition ${
                activeTab === 'diagnoses'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Diagnoses ({data?.diagnoses.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('medications')}
              className={`py-3 text-sm font-semibold border-b-2 transition ${
                activeTab === 'medications'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Meds ({data?.prescriptions.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('encounters')}
              className={`py-3 text-sm font-semibold border-b-2 transition ${
                activeTab === 'encounters'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Encounters ({data?.encounters.length || 0})
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading && (
              <div className="flex justify-center items-center py-20 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                Loading Patient 360 Clinical History...
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                ⚠️ {error}
              </div>
            )}

            {!loading && !error && data && (
              <>
                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <span className="text-xs text-blue-600 font-semibold uppercase">Latest Blood Pressure</span>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {data.vitals[0] ? `${data.vitals[0].systolicBP}/${data.vitals[0].diastolicBP} mmHg` : 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <span className="text-xs text-emerald-600 font-semibold uppercase">Latest Heart Rate</span>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {data.vitals[0] ? `${data.vitals[0].heartRate} bpm` : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Active Diagnoses Card */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="text-base font-bold text-gray-900 mb-3">Active Diagnostic Summary</h3>
                      {data.diagnoses.length === 0 ? (
                        <p className="text-sm text-gray-500">No diagnostic records found.</p>
                      ) : (
                        <div className="space-y-2">
                          {data.diagnoses.map((diag) => (
                            <div key={diag.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <span className="font-semibold text-gray-900">{diag.diagnosisName}</span>
                                {diag.diagnosisCode && <span className="ml-2 text-xs font-mono text-gray-500">({diag.diagnosisCode})</span>}
                              </div>
                              <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded">
                                {diag.diagnosisType}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Emergency Contacts */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="text-base font-bold text-gray-900 mb-3">Emergency Contacts</h3>
                      {patient?.emergencyContacts && patient.emergencyContacts.length > 0 ? (
                        <div className="space-y-2">
                          {patient.emergencyContacts.map((contact) => (
                            <div key={contact.id} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-semibold text-gray-900">{contact.name} ({contact.relationship})</p>
                                <p className="text-xs text-gray-500">{contact.phone}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No emergency contacts listed.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: VITALS */}
                {activeTab === 'vitals' && (
                  <div className="space-y-4">
                    {data.vitals.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">No vitals history available.</p>
                    ) : (
                      data.vitals.map((v) => (
                        <div key={v.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-2">
                          <div className="flex justify-between text-xs text-gray-500 font-medium">
                            <span>Recorded: {new Date(v.recordedAt).toLocaleString()}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-center text-sm pt-1">
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-xs text-gray-500 block">BP</span>
                              <span className="font-bold text-gray-900">{v.systolicBP}/{v.diastolicBP}</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-xs text-gray-500 block">Heart Rate</span>
                              <span className="font-bold text-gray-900">{v.heartRate} bpm</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-xs text-gray-500 block">Temp</span>
                              <span className="font-bold text-gray-900">{v.temperature}°F</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-xs text-gray-500 block">SpO2</span>
                              <span className="font-bold text-gray-900">{v.oxygenSaturation}%</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB 3: DIAGNOSES */}
                {activeTab === 'diagnoses' && (
                  <div className="space-y-3">
                    {data.diagnoses.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">No diagnostic history available.</p>
                    ) : (
                      data.diagnoses.map((d) => (
                        <div key={d.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-gray-900">{d.diagnosisName}</h4>
                              <p className="text-xs text-gray-500 mt-1">ICD Code: {d.diagnosisCode || 'N/A'}</p>
                            </div>
                            <span className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                              {d.diagnosisType}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB 4: MEDICATIONS */}
                {activeTab === 'medications' && (
                  <div className="space-y-4">
                    {data.prescriptions.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">No active prescriptions available.</p>
                    ) : (
                      data.prescriptions.map((p) => (
                        <div key={p.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-3">
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Prescription #{p.prescriptionNumber}</span>
                            <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                          </div>
                          {p.items && p.items.map((item: any) => (
                            <div key={item.id} className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                              <p className="font-bold text-gray-900">{item.medication?.name || item.medicationName}</p>
                              <p className="text-xs text-gray-600">Dosage: {item.dosage} | Frequency: {item.frequency} | Duration: {item.durationDays} days</p>
                            </div>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB 5: ENCOUNTERS */}
                {activeTab === 'encounters' && (
                  <div className="space-y-4">
                    {data.encounters.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">No clinical encounters on record.</p>
                    ) : (
                      data.encounters.map((enc) => (
                        <div key={enc.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="px-2.5 py-1 text-xs font-bold rounded bg-indigo-100 text-indigo-800">
                              {enc.encounterType}
                            </span>
                            <span className="text-xs text-gray-500">Started: {new Date(enc.startedAt).toLocaleString()}</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">Reason: {enc.reasonForVisit || 'General Consultation'}</p>
                          {enc.clinicalNotes && enc.clinicalNotes.map((n: any) => (
                            <div key={n.id} className="p-3 bg-gray-50 rounded-lg text-xs text-gray-700 space-y-1 border-l-2 border-indigo-500">
                              <p className="font-bold text-gray-900">{n.noteType}:</p>
                              <p>{n.content}</p>
                            </div>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
