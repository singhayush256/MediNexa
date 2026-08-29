'use client';

import React, { useEffect, useState } from 'react';

export default function RadiologyPacsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [studies, setStudies] = useState<any[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'studies' | 'workstation' | 'alerts' | 'analytics'>('orders');

  // Selected items & modals
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedStudy, setSelectedStudy] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Form states
  const [patientId, setPatientId] = useState('');
  const [modality, setModality] = useState('CT');
  const [studyName, setStudyName] = useState('CT Chest with Contrast');
  const [clinicalIndication, setClinicalIndication] = useState('Suspected Pulmonary Embolism');
  const [priority, setPriority] = useState('STAT');
  const [scheduledAt, setScheduledAt] = useState(new Date().toISOString().slice(0, 16));

  // Report form states
  const [findings, setFindings] = useState('Filling defect noted within the right main pulmonary artery extending into lower lobe branches.');
  const [impression, setImpression] = useState('Acute pulmonary embolism with right ventricular strain.');
  const [recommendation, setRecommendation] = useState('Immediate therapeutic anticoagulation and pulmonary consult.');
  const [severity, setSeverity] = useState('CRITICAL');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/radiology/orders`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/radiology/studies`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/radiology/critical-alerts`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/radiology/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([ords, stds, alerts, anal]) => {
        setOrders(Array.isArray(ords) ? ords : []);
        setStudies(Array.isArray(stds) ? stds : []);
        setCriticalAlerts(Array.isArray(alerts) ? alerts : []);
        setAnalytics(anal);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/radiology/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId,
          modality,
          studyName,
          clinicalIndication,
          priority,
        }),
      });

      if (res.ok) {
        alert('Radiology imaging order placed successfully!');
        setShowOrderModal(false);
        setPatientId('');
        loadData();
      } else {
        const err = await res.json();
        alert(`Error creating order: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleScheduleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token || !selectedOrder) return;

    try {
      const res = await fetch(`${apiUrl}/radiology/orders/${selectedOrder.id}/schedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ scheduledAt }),
      });

      if (res.ok) {
        alert('Scan scheduled!');
        setShowScheduleModal(false);
        loadData();
      } else {
        const err = await res.json();
        alert(`Error scheduling: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleUploadStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token || !selectedOrder) return;

    try {
      const res = await fetch(`${apiUrl}/radiology/studies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          radiologyOrderId: selectedOrder.id,
          modality: selectedOrder.modality,
          imageCount: 48,
          seriesDescription: `${selectedOrder.modality} High-Res Axial Series 1.25mm`,
        }),
      });

      if (res.ok) {
        alert('DICOM study archived to PACS successfully!');
        setShowUploadModal(false);
        loadData();
      } else {
        const err = await res.json();
        alert(`Error uploading study: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token || !selectedStudy) return;

    try {
      const res = await fetch(`${apiUrl}/radiology/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          studyId: selectedStudy.id,
          findings,
          impression,
          recommendation,
          severity,
        }),
      });

      if (res.ok) {
        alert('Radiology diagnostic report created!');
        setShowReportModal(false);
        loadData();
      } else {
        const err = await res.json();
        alert(`Error creating report: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleVerifyReport = async (reportId: string) => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/radiology/reports/${reportId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        alert('Report electronically signed and verified!');
        loadData();
      } else {
        const err = await res.json();
        alert(`Error verifying: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/radiology/critical-alerts/${alertId}/acknowledge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert('Critical alert acknowledged!');
        loadData();
      } else {
        const err = await res.json();
        alert(`Error acknowledging alert: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const a = analytics || {
    totalOrdersToday: 18,
    scheduledScans: 6,
    pendingReports: 4,
    criticalFindingsCount: 2,
    averageReportingTimeHours: 1.8,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-sky-500/30">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-sky-500/20 text-sky-300 rounded-full text-xs font-black uppercase tracking-wider">
              🖼️ RIS & PACS IMAGING PLATFORM
            </span>
            <span className="px-2.5 py-0.5 bg-purple-400/20 text-purple-300 rounded-full text-[10px] font-bold">
              DICOM ARCHIVE & CRITICAL FINDINGS
            </span>
          </div>
          <h1 className="text-3xl font-black mt-2 tracking-tight">Radiology Information System & PACS Station</h1>
          <p className="text-sky-100 text-sm mt-1 max-w-2xl">
            Enterprise imaging order management, DICOM study tracking, Radiologist workstation reporting, and automated critical finding physician alerts.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowOrderModal(true)}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs rounded-xl shadow-lg transition"
          >
            ➕ Place Imaging Order
          </button>
        </div>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Orders Today</div>
          <div className="text-2xl font-black text-slate-900">{a.totalOrdersToday}</div>
          <div className="text-[10px] text-slate-500 font-medium">Placed by Physicians</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Scheduled Scans</div>
          <div className="text-2xl font-black text-sky-600">{a.scheduledScans}</div>
          <div className="text-[10px] text-sky-600 font-semibold">Ready for Acquisition</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Pending Reports</div>
          <div className="text-2xl font-black text-amber-600">{a.pendingReports}</div>
          <div className="text-[10px] text-amber-600 font-semibold">In Radiologist Queue</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Critical Findings</div>
          <div className="text-2xl font-black text-rose-600">{a.criticalFindingsCount}</div>
          <div className="text-[10px] text-rose-600 font-semibold">Emergency Safety Alerts</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Avg Turnaround</div>
          <div className="text-2xl font-black text-indigo-600">{a.averageReportingTimeHours} hrs</div>
          <div className="text-[10px] text-indigo-600 font-semibold">Order to Signed Report</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'orders' ? 'bg-sky-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📋 Orders Workstation ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('studies')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'studies' ? 'bg-sky-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🩻 PACS Studies & DICOM Series ({studies.length})
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'alerts' ? 'bg-rose-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🚨 Critical Finding Alerts ({criticalAlerts.length})
        </button>
      </div>

      {/* Tab 1: Orders Workstation */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Radiology Orders Workstation Queue
            </h3>
            <span className="text-xs text-slate-400 font-bold">Live RIS scheduling & acquisition status</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-3">Order #</th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Modality & Study</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-sky-800">{ord.orderNumber}</td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">
                      {ord.patient?.user?.firstName} {ord.patient?.user?.lastName}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800 block">{ord.modality}</span>
                      <span className="text-[10px] text-slate-400">{ord.studyName}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        ord.priority === 'STAT' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {ord.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-black text-[10px]">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5">
                      {ord.status === 'ORDERED' && (
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setShowScheduleModal(true);
                          }}
                          className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-white font-bold text-[10px] rounded-lg shadow"
                        >
                          📅 Schedule
                        </button>
                      )}
                      {(ord.status === 'SCHEDULED' || ord.status === 'IN_PROGRESS') && (
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setShowUploadModal(true);
                          }}
                          className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white font-bold text-[10px] rounded-lg shadow"
                        >
                          🩻 Acquire DICOM
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: PACS Studies & DICOM Series */}
      {activeTab === 'studies' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
            PACS Imaging Studies & DICOM Series Archive
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studies.map((s) => (
              <div key={s.id} className="p-5 border border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-sky-800">{s.accessionNumber}</span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-black text-[10px]">
                    {s.modality} • {s.imageCount} Frames
                  </span>
                </div>
                <div className="text-xs text-slate-700 font-medium">
                  <p><strong>Patient:</strong> {s.radiologyOrder?.patient?.user?.firstName} {s.radiologyOrder?.patient?.user?.lastName}</p>
                  <p className="font-mono text-[10px] text-slate-400 mt-1">Study UID: {s.studyUid}</p>
                </div>
                <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500">Storage: {s.storageProvider}</span>
                  <button
                    onClick={() => {
                      setSelectedStudy(s);
                      setShowReportModal(true);
                    }}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow"
                  >
                    📝 Author Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Critical Findings Alerts */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-rose-900 uppercase tracking-wider">
            🚨 Emergency Critical Findings & Physician Safety Alerts
          </h3>
          <div className="space-y-3">
            {criticalAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  alert.acknowledged ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-rose-50 border-rose-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-600 text-white font-black text-[10px] rounded">
                      CRITICAL FINDING
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">
                      Patient: {alert.patient?.user?.firstName} {alert.patient?.user?.lastName}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-rose-950">{alert.alertMessage}</p>
                  <span className="text-[10px] text-slate-400 block">
                    Triggered: {new Date(alert.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  {!alert.acknowledged ? (
                    <button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-black text-xs rounded-xl shadow"
                    >
                      Acknowledge Alert
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

      {/* Modal: Place Imaging Order */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Place Radiology Imaging Order</h3>
            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Patient ID *</label>
                <input
                  required
                  placeholder="Patient UUID"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Modality</label>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="XRAY">X-Ray</option>
                    <option value="CT">CT Scan</option>
                    <option value="MRI">MRI</option>
                    <option value="ULTRASOUND">Ultrasound</option>
                    <option value="MAMMOGRAPHY">Mammography</option>
                    <option value="PET_CT">PET-CT</option>
                  </select>
                </div>
                <div>
                  <label>Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="ROUTINE">Routine</option>
                    <option value="URGENT">Urgent</option>
                    <option value="STAT">STAT (Emergency)</option>
                  </select>
                </div>
              </div>
              <div>
                <label>Study Name *</label>
                <input
                  required
                  value={studyName}
                  onChange={(e) => setStudyName(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Clinical Indication</label>
                <input
                  value={clinicalIndication}
                  onChange={(e) => setClinicalIndication(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl font-black shadow"
                >
                  Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Author Report */}
      {showReportModal && selectedStudy && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Radiologist Diagnostic Reporting Workstation</h3>
            <p className="text-xs text-slate-500 font-medium">Accession #: {selectedStudy.accessionNumber}</p>
            <form onSubmit={handleCreateReport} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Radiological Findings *</label>
                <textarea
                  rows={3}
                  required
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Clinical Impression *</label>
                <input
                  required
                  value={impression}
                  onChange={(e) => setImpression(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Recommendations</label>
                <input
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Finding Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="ABNORMAL">Abnormal</option>
                  <option value="CRITICAL">CRITICAL (Trigger Emergency Alert)</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black shadow"
                >
                  Save Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
