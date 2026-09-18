'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  User,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  HeartPulse,
  Pill,
  FlaskConical,
  Save,
  Send,
  Plus,
  Trash2,
  ChevronRight,
  ShieldAlert,
  Zap,
  Check,
} from 'lucide-react';

interface QueuePatient {
  id: string;
  uhid: string;
  name: string;
  age: number;
  gender: string;
  appointmentTime: string;
  tokenNumber: number;
  status: 'CURRENT' | 'WAITING' | 'COMPLETED';
}

interface PrescriptionItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  timing: string;
}

export function DoctorWorkstationConsultation({
  onOpenNewPrescription,
  onOpenNewVitals,
  onOpenNewLab,
}: {
  onOpenNewPrescription?: () => void;
  onOpenNewVitals?: () => void;
  onOpenNewLab?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'consult' | 'history' | 'meds' | 'labs'>('consult');
  const [selectedPatientId, setSelectedPatientId] = useState('P034');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // SOAP State
  const [soapData, setSoapData] = useState({
    subjective:
      'Pt reports worsening dyspnea on exertion, occasional chest tightness (CCS Class II) over 2 weeks. Fatigue. No nocturnal dyspnea.',
    objective:
      'BP: 142/88 mmHg, HR: 84 bpm (Regular), SpO2: 96% (RA)\nCardio: S1, S2, no murmurs. Lungs clear\nECG (10/10/23): Sinus rhythm, LVH pattern',
    assessment:
      '1. Stable Angina (NYHA II)\n2. Essential Hypertension (Grade 1)\n3. LVH (on ECG)',
    plan:
      'Start Aspirin 75mg daily\nAdd Bisoprolol 5mg\nCheck Fasting Lipid Profile\nF/U in 4 weeks',
  });

  // Outpatient Queue
  const queuePatients: QueuePatient[] = [
    {
      id: 'P034',
      uhid: 'MH-DEL-90034',
      name: 'Sarah Jones',
      age: 45,
      gender: 'F',
      appointmentTime: '10:15 AM',
      tokenNumber: 0,
      status: 'CURRENT',
    },
    {
      id: 'P035',
      uhid: 'MH-DEL-90035',
      name: 'Robert Chen',
      age: 52,
      gender: 'M',
      appointmentTime: '10:30 AM',
      tokenNumber: 1,
      status: 'WAITING',
    },
    {
      id: 'P036',
      uhid: 'MH-DEL-90036',
      name: 'Maria Garcia',
      age: 38,
      gender: 'F',
      appointmentTime: '10:45 AM',
      tokenNumber: 2,
      status: 'WAITING',
    },
    {
      id: 'P037',
      uhid: 'MH-DEL-90037',
      name: 'James Wilson',
      age: 61,
      gender: 'M',
      appointmentTime: '11:00 AM',
      tokenNumber: 3,
      status: 'WAITING',
    },
    {
      id: 'P038',
      uhid: 'MH-DEL-90038',
      name: 'Fatima Khan',
      age: 29,
      gender: 'F',
      appointmentTime: '11:15 AM',
      tokenNumber: 5,
      status: 'WAITING',
    },
  ];

  // Prescriptions State
  const [rxList, setRxList] = useState<PrescriptionItem[]>([
    { id: '1', name: 'Atenolol', dosage: '50mg', frequency: '1 daily', route: 'Oral', timing: 'Morning' },
    { id: '2', name: 'Atorvastatin', dosage: '20mg', frequency: '1 daily', route: 'Oral', timing: 'Night' },
    { id: '3', name: 'Aspirin', dosage: '75mg', frequency: '1 daily', route: 'Oral', timing: 'Morning' },
    { id: '4', name: 'Bisoprolol', dosage: '5mg', frequency: '1 daily', route: 'Oral', timing: 'Morning' },
  ]);

  const [newMedSearch, setNewMedSearch] = useState('');

  // Lab Orders
  const [labOrders, setLabOrders] = useState([
    { id: 'l1', name: 'Lipid Profile', status: 'Ordered', urgent: false },
    { id: 'l2', name: 'HbA1c', status: 'Ordered', urgent: false },
    { id: 'l3', name: 'Echocardiogram', status: 'New', urgent: true },
    { id: 'l4', name: 'ECG', status: 'New', urgent: false },
  ]);

  // Batch Prescribe Clinical Regimens
  const applyClinicalRegimen = (regimenName: string) => {
    let batch: PrescriptionItem[] = [];
    if (regimenName === 'CARDIO') {
      batch = [
        { id: String(Date.now() + 1), name: 'Aspirin', dosage: '75mg', frequency: '1 daily', route: 'Oral', timing: 'Morning' },
        { id: String(Date.now() + 2), name: 'Atorvastatin', dosage: '20mg', frequency: '1 daily', route: 'Oral', timing: 'Night' },
        { id: String(Date.now() + 3), name: 'Bisoprolol', dosage: '5mg', frequency: '1 daily', route: 'Oral', timing: 'Morning' },
        { id: String(Date.now() + 4), name: 'Ramipril', dosage: '2.5mg', frequency: '1 daily', route: 'Oral', timing: 'Morning' },
      ];
    } else if (regimenName === 'HTN') {
      batch = [
        { id: String(Date.now() + 1), name: 'Telmisartan', dosage: '40mg', frequency: '1 daily', route: 'Oral', timing: 'Morning' },
        { id: String(Date.now() + 2), name: 'Amlodipine', dosage: '5mg', frequency: '1 daily', route: 'Oral', timing: 'Morning' },
        { id: String(Date.now() + 3), name: 'Hydrochlorothiazide', dosage: '12.5mg', frequency: '1 daily', route: 'Oral', timing: 'Morning' },
      ];
    } else if (regimenName === 'DIABETES') {
      batch = [
        { id: String(Date.now() + 1), name: 'Metformin HCl', dosage: '500mg', frequency: '2 daily', route: 'Oral', timing: 'Morning & Night' },
        { id: String(Date.now() + 2), name: 'Teneligliptin', dosage: '20mg', frequency: '1 daily', route: 'Oral', timing: 'Morning' },
        { id: String(Date.now() + 3), name: 'Glimepiride', dosage: '1mg', frequency: '1 daily', route: 'Oral', timing: 'Morning' },
      ];
    } else if (regimenName === 'POST_OP') {
      batch = [
        { id: String(Date.now() + 1), name: 'Amoxicillin + Clavulanic Acid', dosage: '625mg', frequency: '2 daily', route: 'Oral', timing: 'Morning & Night' },
        { id: String(Date.now() + 2), name: 'Paracetamol', dosage: '650mg', frequency: '3 daily', route: 'Oral', timing: 'Morning, Afternoon, Night' },
        { id: String(Date.now() + 3), name: 'Pantoprazole', dosage: '40mg', frequency: '1 daily', route: 'Oral', timing: 'Morning Empty Stomach' },
      ];
    }

    setRxList((prev) => [...prev, ...batch]);
    alert(`Batch Prescribed: ${batch.length} medicines added to prescription in 1 click!`);
  };

  const handleAddSingleMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedSearch.trim()) return;
    setRxList((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: newMedSearch.trim(),
        dosage: '1 tablet',
        frequency: '1 daily',
        route: 'Oral',
        timing: 'Morning',
      },
    ]);
    setNewMedSearch('');
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSubmit = () => {
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 3000);
  };

  const activePatient = queuePatients.find((p) => p.id === selectedPatientId) || queuePatients[0];

  return (
    <div className="rounded-3xl bg-[#091024] border border-[#1E293B] text-slate-100 p-5 md:p-6 shadow-2xl space-y-6 font-sans">
      {/* Workstation Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-[#1E293B] gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
            AD
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white">Dr. Arvind Deshmukh</h2>
              <span className="text-[10px] font-bold text-slate-400">MD (Cardiology)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active • On-Duty
              </span>
              <span>•</span>
              <span>Cardiology Department</span>
            </div>
          </div>
        </div>

        {/* Global Action Status */}
        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5" /> Clinical Notes Saved
            </span>
          )}
          {submittedSuccess && (
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" /> Consultation Encounter Submitted
            </span>
          )}
        </div>
      </div>

      {/* 3-Column Clinical Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Outpatient Queue (3 cols)                                    */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Outpatient Queue</h3>
            <span className="text-[11px] font-semibold text-slate-400">Waiting: <strong className="text-white">8 patients</strong></span>
          </div>

          {/* Current Patient Card */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Patient:</span>
            <div
              onClick={() => setSelectedPatientId('P034')}
              className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                selectedPatientId === 'P034'
                  ? 'bg-blue-950/50 border-blue-500 shadow-md shadow-blue-500/10 text-white'
                  : 'bg-[#101935] border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="font-extrabold text-sm">P034 - Sarah Jones</div>
              <div className="text-[11px] text-blue-400 font-semibold mt-0.5">(Appt: 10:15 AM)</div>
              <div className="text-[10px] text-slate-400 mt-1">45Y Female • UHID: MH-DEL-90034</div>
            </div>
          </div>

          {/* Next Patients in Queue */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Next:</span>
            <div className="space-y-2">
              {queuePatients.slice(1).map((pat) => (
                <div
                  key={pat.id}
                  onClick={() => setSelectedPatientId(pat.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                    selectedPatientId === pat.id
                      ? 'bg-blue-950/50 border-blue-500 text-white'
                      : 'bg-[#101935] border-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold">{pat.id} - {pat.name}</div>
                    <div className="text-[10px] text-slate-400">Arrival {pat.appointmentTime}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    Token {pat.tokenNumber}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CENTER COLUMN: Active Patient Consultation, SOAP & Tabs (5 cols)          */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
            <div>
              <h3 className="text-sm font-black text-white">
                Active Patient: {activePatient.name} <span className="font-normal text-slate-400 text-xs">(ID: {activePatient.id}, {activePatient.age}Y {activePatient.gender})</span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenNewLab}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-[#142042] hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
              >
                Order
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
              >
                Save
              </button>
              <button
                onClick={handleSubmit}
                className="px-3.5 py-1 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Workstation Navigation Tabs */}
          <div className="flex items-center gap-4 border-b border-slate-800 pb-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('consult')}
              className={`pb-1 transition ${
                activeTab === 'consult' ? 'text-blue-400 border-b-2 border-blue-400 font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Consult
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-1 transition ${
                activeTab === 'history' ? 'text-blue-400 border-b-2 border-blue-400 font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab('meds')}
              className={`pb-1 transition ${
                activeTab === 'meds' ? 'text-blue-400 border-b-2 border-blue-400 font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Meds
            </button>
            <button
              onClick={() => setActiveTab('labs')}
              className={`pb-1 transition ${
                activeTab === 'labs' ? 'text-blue-400 border-b-2 border-blue-400 font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Labs
            </button>
          </div>

          {/* TAB 1: CONSULT - Clinical SOAP Notes */}
          {activeTab === 'consult' && (
            <div className="p-4 rounded-2xl bg-[#101935] border border-slate-800/80 space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <h4 className="font-bold text-white">Clinical SOAP Notes</h4>
                <span className="text-[11px] text-slate-400">15 Oct 2026, 10:20 AM</span>
              </div>

              {/* Subjective */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">Subjective:</label>
                <textarea
                  rows={2}
                  value={soapData.subjective}
                  onChange={(e) => setSoapData({ ...soapData, subjective: e.target.value })}
                  className="w-full bg-[#080E21] border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Objective */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">Objective:</label>
                <textarea
                  rows={3}
                  value={soapData.objective}
                  onChange={(e) => setSoapData({ ...soapData, objective: e.target.value })}
                  className="w-full bg-[#080E21] border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              {/* Assessment */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">Assessment:</label>
                <textarea
                  rows={2}
                  value={soapData.assessment}
                  onChange={(e) => setSoapData({ ...soapData, assessment: e.target.value })}
                  className="w-full bg-[#080E21] border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Plan */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">Plan:</label>
                <textarea
                  rows={3}
                  value={soapData.plan}
                  onChange={(e) => setSoapData({ ...soapData, plan: e.target.value })}
                  className="w-full bg-[#080E21] border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Bottom Buttons */}
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#142042] hover:bg-slate-800 text-white border border-slate-700 transition"
                >
                  Save
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: HISTORY - Longitudinal Records */}
          {activeTab === 'history' && (
            <div className="p-4 rounded-2xl bg-[#101935] border border-slate-800/80 space-y-3 text-xs">
              <h4 className="font-bold text-white">Patient Longitudinal History</h4>
              <div className="space-y-2 text-slate-300">
                <div className="p-3 bg-[#080E21] rounded-xl border border-slate-800">
                  <div className="font-bold text-white">Chronic Conditions:</div>
                  <p className="text-slate-400 mt-0.5">Essential Hypertension (Diagnosed 2021), Hyperlipidemia (Diagnosed 2023)</p>
                </div>
                <div className="p-3 bg-[#080E21] rounded-xl border border-slate-800">
                  <div className="font-bold text-white">Allergies & Contraindications:</div>
                  <p className="text-rose-400 mt-0.5">Penicillin (Severe Rash / Urticaria), Sulfa drugs (Mild)</p>
                </div>
                <div className="p-3 bg-[#080E21] rounded-xl border border-slate-800">
                  <div className="font-bold text-white">Previous Consultations:</div>
                  <p className="text-slate-400 mt-0.5">14 Aug 2026: Routine follow-up with Dr. Deshmukh. BP 138/86 mmHg.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEDS - Active & Past Prescriptions */}
          {activeTab === 'meds' && (
            <div className="p-4 rounded-2xl bg-[#101935] border border-slate-800/80 space-y-3 text-xs">
              <h4 className="font-bold text-white">Current Active Medications</h4>
              <div className="space-y-2">
                {rxList.map((m) => (
                  <div key={m.id} className="p-2.5 bg-[#080E21] rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{m.name} {m.dosage}</div>
                      <div className="text-[10px] text-slate-400">{m.frequency} • {m.timing}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: LABS - Lab Reports */}
          {activeTab === 'labs' && (
            <div className="p-4 rounded-2xl bg-[#101935] border border-slate-800/80 space-y-3 text-xs">
              <h4 className="font-bold text-white">Diagnostic & Pathology Orders</h4>
              <div className="space-y-2">
                {labOrders.map((l) => (
                  <div key={l.id} className="p-2.5 bg-[#080E21] rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{l.name}</div>
                      <div className="text-[10px] text-slate-400">Status: {l.status}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400">
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Vital Signs, Electronic Rx (Batch Adder), Labs (4 cols)     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-4">
          {/* 1. Vital Signs Card */}
          <div className="p-4 rounded-2xl bg-[#101935] border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <h4 className="font-bold text-white">Vital Signs</h4>
              <button
                onClick={onOpenNewVitals}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300"
              >
                + Update
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-[#080E21] border border-slate-800">
                <span className="text-[10px] text-slate-400">BP:</span>{' '}
                <strong className="text-white">142/88</strong>{' '}
                <span className="text-[10px] font-black text-rose-400">(High)</span>
              </div>
              <div className="p-2 rounded-xl bg-[#080E21] border border-slate-800">
                <span className="text-[10px] text-slate-400">HR:</span>{' '}
                <strong className="text-white">84 bpm</strong>{' '}
                <span className="text-[10px] font-black text-emerald-400">(OK)</span>
              </div>
              <div className="p-2 rounded-xl bg-[#080E21] border border-slate-800">
                <span className="text-[10px] text-slate-400">SpO2:</span>{' '}
                <strong className="text-white">96%</strong>{' '}
                <span className="text-[10px] font-semibold text-emerald-400">(Normal)</span>
              </div>
              <div className="p-2 rounded-xl bg-[#080E21] border border-slate-800">
                <span className="text-[10px] text-slate-400">RR:</span>{' '}
                <strong className="text-white">16</strong>{' '}
                <span className="text-[10px] font-semibold text-emerald-400">(Normal)</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 px-1">
              Temp: <strong className="text-slate-200">98.6°F</strong> (Normal)
            </div>
          </div>

          {/* 2. Electronic Prescription with 1-CLICK BATCH ADDER */}
          <div className="p-4 rounded-2xl bg-[#101935] border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-blue-400" />
                <h4 className="font-bold text-white">Electronic Prescription</h4>
              </div>
              <span className="text-[10px] font-bold text-cyan-400">e-Rx</span>
            </div>

            {/* List of active prescribed meds */}
            <div className="space-y-1.5">
              {rxList.map((m) => (
                <div key={m.id} className="p-2 rounded-xl bg-[#080E21] border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-200">{m.name} {m.dosage}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    {m.frequency} <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              ))}
            </div>

            {/* Quick single medicine search */}
            <form onSubmit={handleAddSingleMed} className="relative pt-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search individual medicine..."
                value={newMedSearch}
                onChange={(e) => setNewMedSearch(e.target.value)}
                className="w-full bg-[#080E21] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </form>

            {/* 1-CLICK BATCH MEDICINE ADDER SECTION */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> 1-Click Batch Medicine Presets
                </span>
                <span className="text-[9px] text-slate-400">Adds all at once</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => applyClinicalRegimen('CARDIO')}
                  className="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 border border-blue-700/60 text-blue-200 font-bold text-left transition cursor-pointer"
                >
                  ⚡ Cardio Regimen (4 Meds)
                </button>
                <button
                  type="button"
                  onClick={() => applyClinicalRegimen('HTN')}
                  className="p-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/60 text-indigo-200 font-bold text-left transition cursor-pointer"
                >
                  ⚡ HTN Triple Trio (3 Meds)
                </button>
                <button
                  type="button"
                  onClick={() => applyClinicalRegimen('DIABETES')}
                  className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/60 text-emerald-200 font-bold text-left transition cursor-pointer"
                >
                  ⚡ Diabetes Protocol (3 Meds)
                </button>
                <button
                  type="button"
                  onClick={() => applyClinicalRegimen('POST_OP')}
                  className="p-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-700/60 text-amber-200 font-bold text-left transition cursor-pointer"
                >
                  ⚡ Post-OP / Infection (3 Meds)
                </button>
              </div>

              {/* Full E-Prescription Suite Modal Trigger */}
              <button
                type="button"
                onClick={onOpenNewPrescription}
                className="w-full py-1.5 rounded-xl bg-[#142042] hover:bg-slate-800 text-cyan-300 border border-cyan-800/50 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Configure Full Prescription Suite
              </button>
            </div>
          </div>

          {/* 3. Laboratory & Diagnostic Orders Card */}
          <div className="p-4 rounded-2xl bg-[#101935] border border-slate-800/80 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white">Laboratory & Diagnostic Orders</h4>
              <button
                onClick={onOpenNewLab}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300"
              >
                + Order
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="p-2 rounded-xl bg-[#080E21] border border-slate-800 flex items-center justify-between">
                <span className="font-semibold text-slate-200">Lipid Profile</span>
                <span className="text-[10px] text-emerald-400 font-bold">(Ordered)</span>
              </div>
              <div className="p-2 rounded-xl bg-[#080E21] border border-slate-800 flex items-center justify-between">
                <span className="font-semibold text-slate-200">HbA1c</span>
                <span className="text-[10px] text-emerald-400 font-bold">(Ordered)</span>
              </div>
              <div className="p-2 rounded-xl bg-[#080E21] border border-slate-800 flex items-center justify-between">
                <span className="font-semibold text-slate-200">Echocardiogram</span>
                <span className="text-[10px] text-blue-400 font-bold">New</span>
              </div>
              <div className="p-2 rounded-xl bg-[#080E21] border border-slate-800 flex items-center justify-between">
                <span className="font-semibold text-slate-200">ECG</span>
                <span className="text-[10px] text-blue-400 font-bold">New</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
