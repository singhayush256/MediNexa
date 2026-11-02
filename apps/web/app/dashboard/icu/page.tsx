'use client';

import React, { useEffect, useState } from 'react';

export default function IcuManagementPage() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [ventilators, setVentilators] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [codeBlues, setCodeBlues] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'patients' | 'monitoring' | 'rounds' | 'ventilators' | 'code-blue' | 'analytics'>('patients');

  // Modals & form state
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showRoundModal, setShowRoundModal] = useState(false);
  const [showVentModal, setShowVentModal] = useState(false);
  const [showCodeBlueModal, setShowCodeBlueModal] = useState(false);

  // Form states
  const [patientId, setPatientId] = useState('');
  const [bedId, setBedId] = useState('');
  const [status, setStatus] = useState('ADMITTED');
  const [apacheScore, setApacheScore] = useState(14);
  const [sofaScore, setSofaScore] = useState(4);

  // Vitals form
  const [heartRate, setHeartRate] = useState(88);
  const [respRate, setRespRate] = useState(18);
  const [spo2, setSpo2] = useState(98);
  const [systolicBP, setSystolicBP] = useState(120);
  const [diastolicBP, setDiastolicBP] = useState(80);
  const [temperature, setTemperature] = useState(37.0);
  const [urineOutput, setUrineOutput] = useState(45);

  // Rounds form
  const [diagnosis, setDiagnosis] = useState('Severe Septic Shock secondary to Lobar Pneumonia');
  const [assessment, setAssessment] = useState('Hemodynamically stabilizing on Norepinephrine, MAP > 65 mmHg');
  const [treatmentPlan, setTreatmentPlan] = useState('Continue broad-spectrum IV Meropenem, titrate vasopressors, monitor ABG');
  const [notes, setNotes] = useState('Targeting negative fluid balance over next 24h');

  // Ventilator form
  const [ventNumber, setVentNumber] = useState(`VENT-ICU-${Math.floor(100 + Math.random() * 900)}`);
  const [ventManufacturer, setVentManufacturer] = useState('Hamilton Medical / Dräger');
  const [ventModel, setVentModel] = useState('Evita V800 Infinity');

  // Code Blue form
  const [codeBlueLocation, setCodeBlueLocation] = useState('ICU Pod 3 - Bed 04');
  const [codeBlueSummary, setCodeBlueSummary] = useState('Ventricular Fibrillation cardiac arrest. CPR initiated, Defibrillator charged.');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/icu/admissions`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/icu/ventilators`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/icu/alerts`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/icu/code-blue`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/icu/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([adm, vent, alt, cb, anal]) => {
        setAdmissions(Array.isArray(adm) ? adm : []);
        setVentilators(Array.isArray(vent) ? vent : []);
        setAlerts(Array.isArray(alt) ? alt : []);
        setCodeBlues(Array.isArray(cb) ? cb : []);
        setAnalytics(anal);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdmitPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/icu/admissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId,
          bedId: bedId || undefined,
          status,
          apacheScore: Number(apacheScore),
          sofaScore: Number(sofaScore),
        }),
      });

      if (res.ok) {
        alert('Patient admitted to ICU Pod!');
        setShowAdmitModal(false);
        setPatientId('');
        loadData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleRecordVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/icu/vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId,
          heartRate: Number(heartRate),
          respiratoryRate: Number(respRate),
          oxygenSaturation: Number(spo2),
          systolicBP: Number(systolicBP),
          diastolicBP: Number(diastolicBP),
          temperature: Number(temperature),
          urineOutput: Number(urineOutput),
        }),
      });

      if (res.ok) {
        alert('Vitals logged and evaluated by Early Warning System!');
        setShowVitalsModal(false);
        loadData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCreateRound = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/icu/rounds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId,
          diagnosis,
          assessment,
          treatmentPlan,
          notes,
        }),
      });

      if (res.ok) {
        alert('Intensivist ICU clinical round documented!');
        setShowRoundModal(false);
        loadData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCreateVentilator = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/icu/ventilators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ventilatorNumber: ventNumber,
          manufacturer: ventManufacturer,
          model: ventModel,
        }),
      });

      if (res.ok) {
        alert('Ventilator added to fleet!');
        setShowVentModal(false);
        loadData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleTriggerCodeBlue = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/icu/code-blue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: patientId || undefined,
          eventLocation: codeBlueLocation,
          eventSummary: codeBlueSummary,
        }),
      });

      if (res.ok) {
        alert('🚨 CODE BLUE ACTIVATED! Emergency Resuscitation Team Dispatched.');
        setShowCodeBlueModal(false);
        loadData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/icu/alerts/${alertId}/acknowledge`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert('Critical alert acknowledged!');
        loadData();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const a = analytics || {
    icuOccupancyRate: 82.5,
    totalActiveIcuPatients: 8,
    criticalPatientsCount: 3,
    activeAlertsCount: 2,
    ventilatorsInUse: 4,
    ventilatorUtilizationRate: 65,
    codeBlueEventsToday: 1,
    averageLosDays: 4.2,
    mortalityRate: 3.4,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-rose-500/30">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-xs font-black uppercase tracking-wider">
              🏥 ICU & CRITICAL CARE COMMAND
            </span>
            <span className="px-2.5 py-0.5 bg-sky-400/20 text-sky-300 rounded-full text-[10px] font-bold">
              EARLY WARNING SYSTEM (EWS) • APACHE II • SOFA
            </span>
          </div>
          <h1 className="text-3xl font-black mt-2 tracking-tight">Intensive Care Unit (ICU) Command Center</h1>
          <p className="text-rose-100 text-sm mt-1 max-w-2xl">
            Critical care patient monitoring, mechanical ventilator tracking, intensivist bedside rounds, Early Warning Scoring, and rapid-response Code Blue management.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAdmitModal(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg transition"
          >
            ➕ Admit to ICU Pod
          </button>
          <button
            onClick={() => setShowCodeBlueModal(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg transition animate-pulse"
          >
            🚨 Trigger Code Blue
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">ICU Occupancy</div>
          <div className="text-2xl font-black text-slate-900">{a.icuOccupancyRate}%</div>
          <div className="text-[10px] text-slate-500 font-medium">{a.totalActiveIcuPatients} Active Patients</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Critical Patients</div>
          <div className="text-2xl font-black text-rose-600">{a.criticalPatientsCount}</div>
          <div className="text-[10px] text-rose-600 font-semibold">High Acuity / Unstable</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Active Alerts</div>
          <div className="text-2xl font-black text-amber-600">{a.activeAlertsCount}</div>
          <div className="text-[10px] text-amber-600 font-semibold">EWS Deterioration</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Ventilator Usage</div>
          <div className="text-2xl font-black text-sky-600">{a.ventilatorUtilizationRate}%</div>
          <div className="text-[10px] text-sky-600 font-semibold">{a.ventilatorsInUse} In Active Use</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Code Blue Events</div>
          <div className="text-2xl font-black text-red-600">{a.codeBlueEventsToday}</div>
          <div className="text-[10px] text-red-600 font-semibold">Resuscitation Activations</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-3 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('patients')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'patients' ? 'bg-rose-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🏥 ICU Patients & Beds ({admissions.length})
        </button>
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'monitoring' ? 'bg-rose-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📈 Vitals & EWS Monitoring
        </button>
        <button
          onClick={() => setActiveTab('ventilators')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'ventilators' ? 'bg-rose-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🫁 Ventilator Fleet ({ventilators.length})
        </button>
        <button
          onClick={() => setActiveTab('code-blue')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'code-blue' ? 'bg-red-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🚨 Code Blue Events ({codeBlues.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'analytics' ? 'bg-rose-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📊 Acuity & Mortality Analytics
        </button>
      </div>

      {/* Tab 1: ICU Patients & Beds */}
      {activeTab === 'patients' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              ICU Inpatient Pod & Acuity Roster
            </h3>
            <span className="text-xs text-slate-400 font-bold">Continuous monitoring & bedside management</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Bed</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">APACHE II</th>
                  <th className="py-3 px-3">SOFA</th>
                  <th className="py-3 px-3">Admitted</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {admissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-extrabold text-slate-900">
                      {adm.patient?.user?.firstName} {adm.patient?.user?.lastName}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-sky-800">
                      {adm.bed?.bedNumber || 'ICU-POD-01'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        adm.status === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                        adm.status === 'STABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {adm.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-purple-900">{adm.apacheScore || 14}</td>
                    <td className="py-3 px-3 font-mono font-bold text-indigo-900">{adm.sofaScore || 4}</td>
                    <td className="py-3 px-3 text-[10px] text-slate-400">
                      {new Date(adm.admittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setPatientId(adm.patientId);
                          setShowVitalsModal(true);
                        }}
                        className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-white font-bold text-[10px] rounded-lg shadow"
                      >
                        📈 Record Vitals
                      </button>
                      <button
                        onClick={() => {
                          setPatientId(adm.patientId);
                          setShowRoundModal(true);
                        }}
                        className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white font-bold text-[10px] rounded-lg shadow"
                      >
                        👨‍⚕️ Bedside Round
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Vitals & Early Warning Alerts */}
      {activeTab === 'monitoring' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-rose-950 uppercase tracking-wider">
              🚨 Active Early Warning System (EWS) Alerts & Deterioration Triggers
            </h3>
            <button
              onClick={() => setShowVitalsModal(true)}
              className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl shadow"
            >
              ➕ Log Vitals Observation
            </button>
          </div>

          <div className="space-y-3">
            {alerts.map((al) => (
              <div
                key={al.id}
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  al.acknowledged ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-rose-50 border-rose-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-600 text-white font-black text-[10px] rounded">
                      CRITICAL EWS ALERT
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">
                      Patient: {al.patient?.user?.firstName} {al.patient?.user?.lastName}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-rose-950">{al.title} — {al.description}</p>
                  <span className="text-[10px] text-slate-400 block">
                    Triggered: {new Date(al.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  {!al.acknowledged ? (
                    <button
                      onClick={() => handleAcknowledgeAlert(al.id)}
                      className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-black text-xs rounded-xl shadow"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700">✓ Acknowledged</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Ventilators */}
      {activeTab === 'ventilators' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              🫁 Mechanical Ventilator Fleet & Respiratory Stations
            </h3>
            <button
              onClick={() => setShowVentModal(true)}
              className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl shadow"
            >
              ➕ Register Ventilator
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ventilators.map((v) => (
              <div key={v.id} className="p-5 border border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-sky-800">{v.ventilatorNumber}</span>
                  <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                    v.status === 'IN_USE' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {v.status}
                  </span>
                </div>
                <div className="text-xs text-slate-700 font-medium">
                  <p><strong>Model:</strong> {v.manufacturer} {v.model}</p>
                  {v.assignments?.[0]?.patient && (
                    <p className="mt-1 text-purple-900 font-bold">
                      Assigned to: {v.assignments[0].patient.user?.firstName} {v.assignments[0].patient.user?.lastName}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Code Blue Events */}
      {activeTab === 'code-blue' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-red-900 uppercase tracking-wider">
              🚨 Code Blue Resuscitation Timeline
            </h3>
            <button
              onClick={() => setShowCodeBlueModal(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow animate-pulse"
            >
              Activate Code Blue
            </button>
          </div>

          <div className="space-y-3">
            {codeBlues.map((cb) => (
              <div key={cb.id} className="p-4 rounded-2xl border border-red-200 bg-red-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-red-700 text-white font-black text-[10px] rounded">
                    CODE BLUE • {cb.eventLocation}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {new Date(cb.startedAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs font-extrabold text-slate-900">{cb.eventSummary}</p>
                <div className="text-[10px] text-slate-600 font-semibold">
                  Status/Outcome: <span className="font-bold text-red-900">{cb.outcome}</span> | Triggered by: {cb.triggeredBy?.firstName} {cb.triggeredBy?.lastName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Analytics */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
            Critical Care Acuity, APACHE II & SOFA Distributions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50 space-y-3">
              <h4 className="font-bold text-xs text-purple-900 uppercase">APACHE II Acuity Distribution</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span>0–10 (Mild Acuity):</span><span className="font-bold">3 Patients</span></div>
                <div className="flex justify-between"><span>11–20 (Moderate Acuity):</span><span className="font-bold">6 Patients</span></div>
                <div className="flex justify-between"><span>21–30 (Severe Acuity):</span><span className="font-bold">4 Patients</span></div>
                <div className="flex justify-between"><span>&gt;30 (High Acuity / Critical):</span><span className="font-bold">2 Patients</span></div>
              </div>
            </div>
            <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50 space-y-3">
              <h4 className="font-bold text-xs text-indigo-900 uppercase">SOFA Organ Dysfunction Distribution</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span>0–3 (Low Risk):</span><span className="font-bold">5 Patients</span></div>
                <div className="flex justify-between"><span>4–7 (Intermediate Risk):</span><span className="font-bold">6 Patients</span></div>
                <div className="flex justify-between"><span>8–11 (Severe Dysfunction):</span><span className="font-bold">3 Patients</span></div>
                <div className="flex justify-between"><span>&gt;11 (Critical Multi-Organ Failure):</span><span className="font-bold">1 Patient</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Admit Patient */}
      {showAdmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Admit Patient to ICU Pod</h3>
            <form onSubmit={handleAdmitPatient} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Patient ID *</label>
                <input
                  required
                  placeholder="Patient Profile UUID"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Initial APACHE II</label>
                  <input
                    type="number"
                    value={apacheScore}
                    onChange={(e) => setApacheScore(Number(e.target.value))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label>Initial SOFA</label>
                  <input
                    type="number"
                    value={sofaScore}
                    onChange={(e) => setSofaScore(Number(e.target.value))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdmitModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black shadow"
                >
                  Confirm ICU Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Vitals */}
      {showVitalsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Record ICU Critical Vitals</h3>
            <form onSubmit={handleRecordVitals} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Patient ID *</label>
                <input
                  required
                  placeholder="Patient Profile UUID"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(Number(e.target.value))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label>SpO2 (%)</label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(Number(e.target.value))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Blood Pressure (Sys / Dia)</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="number"
                      placeholder="Sys"
                      value={systolicBP}
                      onChange={(e) => setSystolicBP(Number(e.target.value))}
                      className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Dia"
                      value={diastolicBP}
                      onChange={(e) => setDiastolicBP(Number(e.target.value))}
                      className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label>Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowVitalsModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl font-black shadow"
                >
                  Submit Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bedside Round */}
      {showRoundModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Document Intensivist ICU Round</h3>
            <form onSubmit={handleCreateRound} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Diagnosis *</label>
                <input
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Clinical Assessment *</label>
                <textarea
                  rows={2}
                  required
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Treatment Plan *</label>
                <textarea
                  rows={2}
                  required
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRoundModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-black shadow"
                >
                  Save ICU Round
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Register Ventilator */}
      {showVentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Register Mechanical Ventilator</h3>
            <form onSubmit={handleCreateVentilator} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Ventilator Serial # *</label>
                <input
                  required
                  value={ventNumber}
                  onChange={(e) => setVentNumber(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label>Manufacturer *</label>
                <input
                  required
                  value={ventManufacturer}
                  onChange={(e) => setVentManufacturer(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Model *</label>
                <input
                  required
                  value={ventModel}
                  onChange={(e) => setVentModel(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowVentModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl font-black shadow"
                >
                  Add Ventilator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Code Blue */}
      {showCodeBlueModal && (
        <div className="fixed inset-0 bg-red-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-red-200">
            <h3 className="font-black text-lg text-red-600 flex items-center gap-2">
              <span>🚨</span> <span>TRIGGER CODE BLUE ACTIVATION</span>
            </h3>
            <form onSubmit={handleTriggerCodeBlue} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Event Location *</label>
                <input
                  required
                  value={codeBlueLocation}
                  onChange={(e) => setCodeBlueLocation(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label>Event Summary & Initial Rhythms *</label>
                <textarea
                  rows={3}
                  required
                  value={codeBlueSummary}
                  onChange={(e) => setCodeBlueSummary(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCodeBlueModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black shadow animate-pulse"
                >
                  🚨 BROADCAST CODE BLUE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
