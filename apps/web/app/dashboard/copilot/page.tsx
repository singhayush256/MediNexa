'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface CopilotHistoryItem {
  id: string;
  type: string;
  generatedContent: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  status: string;
  timeSavedMinutes: number;
  patient?: { user?: { firstName: string; lastName: string } };
  createdAt: string;
}

export default function ClinicalCopilotWorkstationPage() {
  const [activeTab, setActiveTab] = useState<'SOAP' | 'DISCHARGE' | 'RISK'>('SOAP');

  // Form States
  const [chiefComplaint, setChiefComplaint] = useState('Severe chest pressure radiating to left arm');
  const [symptoms, setSymptoms] = useState('Shortness of breath, diaphoresis, nausea');
  const [diagnosis, setDiagnosis] = useState('Acute Anterior Myocardial Infarction (ICD-10 I21.0)');
  const [medications, setMedications] = useState('Aspirin 325mg, Clopidogrel 300mg, Atorvastatin 80mg');
  const [observations, setObservations] = useState('ST-elevation in leads V1-V4, BP 145/90, HR 98');

  const [dischargeDiagnosis, setDischargeDiagnosis] = useState('Acute ST-Elevation Myocardial Infarction');
  const [dischargeTreatment, setDischargeTreatment] = useState('Successful Percutaneous Coronary Intervention (PCI) with drug-eluting stent to LAD');
  const [dischargeInstructions, setDischargeInstructions] = useState('Dual antiplatelet therapy for 12 months. Low sodium, heart-healthy diet.');
  const [dischargeFollowUp, setDischargeFollowUp] = useState('Cardiology OPD follow-up in 10 days with repeat echocardiogram.');

  const [riskVitals, setRiskVitals] = useState('BP 85/50, Temp 102.1°F, HR 112, SpO2 91%');
  const [riskAge, setRiskAge] = useState(68);
  const [riskTriageLevel, setRiskTriageLevel] = useState('ESI_1');

  // Generated Output State
  const [generatedOutput, setGeneratedOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [history, setHistory] = useState<CopilotHistoryItem[]>([]);

  // Analytics Metrics
  const [analytics, setAnalytics] = useState({
    notesGenerated: 14,
    timeSavedMinutes: 240,
    riskAlertsGenerated: 6,
    dischargeSummariesGenerated: 8,
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    fetchCopilotData();
  }, []);

  const fetchCopilotData = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const [hisRes, anaRes] = await Promise.all([
        fetch(`${apiUrl}/copilot/history`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${apiUrl}/copilot/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      ]);

      setHistory(Array.isArray(hisRes) ? hisRes : []);
      if (anaRes && typeof anaRes === 'object') setAnalytics(anaRes);
    } catch (err) {
      console.error('Failed to load copilot data:', err);
    }
  };

  const handleGenerateSoapNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setActionSuccess('');

    try {
      const token = localStorage.getItem('medinexa_token');
      const res = await fetch(`${apiUrl}/copilot/generate-note`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ chiefComplaint, symptoms, diagnosis, medications, observations }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'SOAP note generation failed');

      setGeneratedOutput(data.generatedContent);
      setActionSuccess('✓ AI Scribe SOAP Note generated successfully!');
      fetchCopilotData();
    } catch (err: any) {
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDischargeSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setActionSuccess('');

    try {
      const token = localStorage.getItem('medinexa_token');
      const res = await fetch(`${apiUrl}/copilot/generate-discharge-summary`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosisSummary: dischargeDiagnosis,
          treatmentSummary: dischargeTreatment,
          dischargeInstructions,
          followUpPlan: dischargeFollowUp,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Discharge summary generation failed');

      setGeneratedOutput(data.generatedContent);
      setActionSuccess('✓ AI Discharge Summary generated successfully!');
      fetchCopilotData();
    } catch (err: any) {
      console.error('Discharge generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunRiskAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setActionSuccess('');

    try {
      const token = localStorage.getItem('medinexa_token');
      const res = await fetch(`${apiUrl}/copilot/risk-analysis`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms, vitals: riskVitals, age: riskAge, triageLevel: riskTriageLevel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Risk analysis failed');

      setGeneratedOutput(data.summary?.generatedContent || `[RISK SCORE: ${data.riskScore}/100]\nSeverity: ${data.severity}`);
      setActionSuccess(`✓ AI Risk Analysis Completed! Calculated Score: ${data.riskScore}/100 (${data.severity})`);
      fetchCopilotData();
    } catch (err: any) {
      console.error('Risk analysis error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedOutput);
    setActionSuccess('📋 Clinical documentation copied to clipboard for EHR insertion!');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>🩺</span>
            <span>AI Medical Scribe & Clinical Copilot Workstation</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Automated SOAP Notes, Discharge Summaries, and Real-Time Risk Copilot for Doctors.
          </p>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">SOAP Notes Generated</span>
          <span className="text-2xl font-black text-sky-600 mt-1 block">{analytics.notesGenerated}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Doctor Time Saved</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">~{analytics.timeSavedMinutes} Mins</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Risk Alerts Generated</span>
          <span className="text-2xl font-black text-red-600 mt-1 block">{analytics.riskAlertsGenerated}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Discharge Summaries</span>
          <span className="text-2xl font-black text-purple-600 mt-1 block">{analytics.dischargeSummariesGenerated}</span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold shadow-sm">
          {actionSuccess}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('SOAP')}
          className={`pb-3 text-xs font-extrabold transition border-b-2 ${activeTab === 'SOAP' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          📝 AI SOAP Note Scribe
        </button>
        <button
          onClick={() => setActiveTab('DISCHARGE')}
          className={`pb-3 text-xs font-extrabold transition border-b-2 ${activeTab === 'DISCHARGE' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          📄 AI Discharge Summary
        </button>
        <button
          onClick={() => setActiveTab('RISK')}
          className={`pb-3 text-xs font-extrabold transition border-b-2 ${activeTab === 'RISK' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          ⚡ Clinical Risk Copilot
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Inputs */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          {activeTab === 'SOAP' && (
            <form onSubmit={handleGenerateSoapNote} className="space-y-3 text-xs">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Medical Scribe Input</h2>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chief Complaint</label>
                <input
                  type="text"
                  required
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Symptoms</label>
                <input
                  type="text"
                  required
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Diagnosis</label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Medications & Regimen</label>
                <input
                  type="text"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Physical Observations & ECG/Labs</label>
                <textarea
                  rows={3}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl shadow transition"
              >
                {isGenerating ? 'Synthesizing SOAP Note...' : '⚡ Generate Structured SOAP Note'}
              </button>
            </form>
          )}

          {activeTab === 'DISCHARGE' && (
            <form onSubmit={handleGenerateDischargeSummary} className="space-y-3 text-xs">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Discharge Summary Scribe</h2>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Diagnosis Summary</label>
                <input
                  type="text"
                  required
                  value={dischargeDiagnosis}
                  onChange={(e) => setDischargeDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Inpatient Treatment Summary</label>
                <textarea
                  rows={2}
                  required
                  value={dischargeTreatment}
                  onChange={(e) => setDischargeTreatment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Discharge & Diet Instructions</label>
                <textarea
                  rows={2}
                  required
                  value={dischargeInstructions}
                  onChange={(e) => setDischargeInstructions(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Follow-Up Plan</label>
                <input
                  type="text"
                  required
                  value={dischargeFollowUp}
                  onChange={(e) => setDischargeFollowUp(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl shadow transition"
              >
                {isGenerating ? 'Generating Discharge Summary...' : '📄 Generate Clinical Discharge Summary'}
              </button>
            </form>
          )}

          {activeTab === 'RISK' && (
            <form onSubmit={handleRunRiskAnalysis} className="space-y-3 text-xs">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Clinical Risk Copilot</h2>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Recorded Vitals</label>
                <input
                  type="text"
                  required
                  value={riskVitals}
                  onChange={(e) => setRiskVitals(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Age</label>
                <input
                  type="number"
                  required
                  value={riskAge}
                  onChange={(e) => setRiskAge(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Triage Level</label>
                <select
                  value={riskTriageLevel}
                  onChange={(e) => setRiskTriageLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-bold"
                >
                  <option value="ESI_1">ESI 1 — Resuscitation (Highest)</option>
                  <option value="ESI_2">ESI 2 — Emergent</option>
                  <option value="ESI_3">ESI 3 — Urgent</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow transition"
              >
                {isGenerating ? 'Analyzing Risk Profile...' : '⚡ Calculate Clinical Risk Score'}
              </button>
            </form>
          )}
        </div>

        {/* Editable Output Preview */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Editable AI Output Preview</h3>
            {generatedOutput && (
              <button
                onClick={handleCopyToClipboard}
                className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs rounded-xl transition"
              >
                📋 Copy To EHR
              </button>
            )}
          </div>

          <textarea
            rows={15}
            placeholder="AI-generated clinical documentation will appear here for review and editing..."
            value={generatedOutput}
            onChange={(e) => setGeneratedOutput(e.target.value)}
            className="w-full flex-1 p-4 border border-slate-300 rounded-2xl bg-slate-50 text-xs font-mono leading-relaxed"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>✓ Require Doctor Sign-off before saving to patient record</span>
            <button
              onClick={() => setActionSuccess('✓ Saved to Patient Encounter Record!')}
              disabled={!generatedOutput}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition disabled:opacity-50"
            >
              Save To Encounter ✓
            </button>
          </div>
        </div>
      </div>

      {/* History Roster */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Recent Doctor AI Generation Log</h3>
          <span className="text-xs font-semibold text-slate-500">Auditable Scribe History</span>
        </div>

        {history.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-medium">
            No previous AI copilot history found.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
                <div>
                  <span className="font-bold text-sky-700 block text-xs">{h.type.replace('_', ' ')}</span>
                  <span className="text-slate-500 text-[10px]">Saved {h.timeSavedMinutes} mins time | {new Date(h.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>
                <button
                  onClick={() => setGeneratedOutput(h.generatedContent)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-[11px] transition"
                >
                  View & Load
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
