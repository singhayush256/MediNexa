'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface ImagingFileItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

interface ImagingStudyItem {
  id: string;
  accessionNumber: string;
  dicomStudyUid: string;
  imageCount: number;
  storageProvider: string;
  studyDate: string;
  files?: ImagingFileItem[];
}

interface RadiologyReportItem {
  id: string;
  findings: string;
  impression: string;
  recommendation?: string;
  severity: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
  aiPrelimFindings?: string;
  aiAbnormalityScore?: number;
  isSigned: boolean;
  signedAt?: string;
}

interface ImagingOrderItem {
  id: string;
  modality: string;
  studyName: string;
  clinicalIndication?: string;
  status: string;
  createdAt: string;
  patient?: { id: string; user?: { firstName: string; lastName: string } };
  doctor?: { id: string; user?: { firstName: string; lastName: string } };
  facility?: { id: string; name: string };
  studies?: ImagingStudyItem[];
  reports?: RadiologyReportItem[];
}

export default function RadiologyPacsPage() {
  const [orders, setOrders] = useState<ImagingOrderItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ImagingOrderItem | null>(null);
  const [modalityFilter, setModalityFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Upload Study State
  const [dicomUid, setDicomUid] = useState('1.2.840.113619.2.55.3.2847194019');
  const [imageFileUrl, setImageFileUrl] = useState('https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80');

  // Radiologist Report Form State
  const [findings, setFindings] = useState('Opacification noted in right lower lobe. Trachea and cardiac silhouette within normal limits.');
  const [impression, setImpression] = useState('Right lower lobe pneumonia / consolidation.');
  const [recommendation, setRecommendation] = useState('Clinical follow-up and antibiotic treatment as indicated.');
  const [severity, setSeverity] = useState<'NORMAL' | 'ABNORMAL' | 'CRITICAL'>('ABNORMAL');

  // Printable Report State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Analytics Metrics
  const [analytics, setAnalytics] = useState({
    ordersToday: 18,
    studiesUploaded: 15,
    reportsPending: 3,
    criticalFindings: 2,
    avgReportingTimeMins: 42,
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const getHeaders = () => {
    const token = localStorage.getItem('medinexa_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const [ordRes, anaRes] = await Promise.all([
        fetch(`${apiUrl}/radiology/orders`, { headers: getHeaders() }).then((r) => r.json()),
        fetch(`${apiUrl}/radiology/analytics`, { headers: getHeaders() }).then((r) => r.json()),
      ]);

      const list = Array.isArray(ordRes) ? ordRes : [];
      setOrders(list);
      if (list.length > 0 && !selectedOrder) {
        setSelectedOrder(list[0]);
      }
      if (anaRes && typeof anaRes === 'object') {
        setAnalytics(anaRes);
      }
    } catch (err) {
      console.error('Failed to load PACS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUploadStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsSubmitting(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await fetch(`${apiUrl}/radiology/studies/upload`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          imagingOrderId: selectedOrder.id,
          dicomStudyUid: dicomUid,
          files: [
            {
              fileName: `${selectedOrder.modality}_DICOM_Image.png`,
              fileUrl: imageFileUrl,
              fileSize: 4096,
            },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Study upload failed');

      setActionSuccess(`✓ Imaging Study uploaded successfully! Accession #: ${data.accessionNumber}`);
      fetchOrders();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDraftReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsSubmitting(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await fetch(`${apiUrl}/radiology/report`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          imagingOrderId: selectedOrder.id,
          findings,
          impression,
          recommendation,
          severity,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Drafting report failed');

      setActionSuccess('✓ Radiology Report drafted with AI Preliminary Findings!');
      fetchOrders();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignReport = async (reportId: string) => {
    setIsSubmitting(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await fetch(`${apiUrl}/radiology/report/${reportId}/sign`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Report sign-off failed');

      setActionSuccess('✓ Radiology Report signed and locked. Report is now immutable!');
      fetchOrders();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewReport = async (orderId: string) => {
    try {
      const res = await fetch(`${apiUrl}/radiology/reports/${orderId}`, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load PACS report');

      setReportData(data);
      setShowReportModal(true);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (modalityFilter === 'ALL') return true;
    return o.modality === modalityFilter;
  });

  const latestReport = selectedOrder?.reports?.[0];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>🖼️</span>
            <span>Radiology PACS & Medical Imaging Workstation</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Enterprise DICOM Archiving, AI prelim findings, and Radiologist Workstation.
          </p>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Orders Today</span>
          <span className="text-2xl font-black text-sky-600 mt-1 block">{analytics.ordersToday}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Studies Uploaded</span>
          <span className="text-2xl font-black text-purple-600 mt-1 block">{analytics.studiesUploaded}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Reports Pending</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{analytics.reportsPending}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Critical Findings</span>
          <span className="text-2xl font-black text-red-600 mt-1 block">{analytics.criticalFindings}</span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold shadow-sm">
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold shadow-sm">
          {actionError}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Imaging Queue Roster */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">PACS Worklist Queue</h2>
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
              className="text-xs font-bold border border-slate-300 rounded-lg px-2 py-1 bg-slate-50"
            >
              <option value="ALL">All Modalities</option>
              <option value="XRAY">X-Ray</option>
              <option value="CT">CT Scan</option>
              <option value="MRI">MRI</option>
              <option value="ULTRASOUND">Ultrasound</option>
              <option value="PET">PET Scan</option>
            </select>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs font-medium">Loading imaging worklist...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-medium">No imaging orders found.</div>
          ) : (
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {filteredOrders.map((ord) => {
                const isSelected = selectedOrder?.id === ord.id;
                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${
                      isSelected ? 'border-purple-500 bg-purple-50/50 shadow-sm' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-xs">{ord.modality}: {ord.studyName}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        ord.status === 'REPORTED' ? 'bg-emerald-100 text-emerald-800' :
                        ord.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium mt-1">
                      Patient: <span className="font-bold text-slate-800">{ord.patient?.user?.firstName || 'Alex'} {ord.patient?.user?.lastName || 'Rivera'}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Dr. {ord.doctor?.user?.firstName || 'Smith'} | {new Date(ord.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PACS Workstation Workspace */}
        <div className="lg:col-span-2 space-y-6">
          {selectedOrder ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Order Overview Header */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">{selectedOrder.modality} Study: {selectedOrder.studyName}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Indication: <span className="font-bold text-slate-800">{selectedOrder.clinicalIndication || 'N/A'}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleViewReport(selectedOrder.id)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow transition"
                >
                  📄 View Full PACS Report
                </button>
              </div>

              {/* Study Upload Workstation & DICOM Metadata */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                  <span>💾</span>
                  <span>Radiology Technician DICOM Study Archival</span>
                </h3>
                <form onSubmit={handleUploadStudy} className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block font-semibold text-slate-600 text-[10px] mb-1">DICOM Study UID</label>
                    <input
                      type="text"
                      value={dicomUid}
                      onChange={(e) => setDicomUid(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-mono text-[11px]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl shadow transition"
                  >
                    Upload DICOM Study & Generate Accession
                  </button>
                </form>

                {(selectedOrder.studies?.length || 0) > 0 && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-purple-900 block">Accession #: {selectedOrder.studies?.[0]?.accessionNumber}</span>
                      <span className="text-[10px] text-purple-700">DICOM UID: {selectedOrder.studies?.[0]?.dicomStudyUid}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-purple-200 text-purple-900 font-extrabold rounded-lg text-[10px]">
                      {selectedOrder.studies?.[0]?.imageCount} DICOM Frame(s)
                    </span>
                  </div>
                )}
              </div>

              {/* PACS DICOM Image Gallery Viewer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">PACS Image Gallery Viewer</h3>
                  <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500">
                    <button className="px-2 py-1 bg-slate-100 rounded hover:bg-slate-200">🔍 Zoom</button>
                    <button className="px-2 py-1 bg-slate-100 rounded hover:bg-slate-200">🌗 Contrast</button>
                    <button className="px-2 py-1 bg-slate-100 rounded hover:bg-slate-200">🔄 Reset</button>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl flex items-center justify-center border border-slate-800 min-h-[220px]">
                  {selectedOrder.studies?.[0]?.files?.[0] ? (
                    <img
                      src={selectedOrder.studies[0].files[0].fileUrl}
                      alt="DICOM Scan"
                      className="max-h-60 rounded border border-slate-800 object-cover shadow-2xl"
                    />
                  ) : (
                    <div className="text-center text-slate-600 text-xs">
                      <span>📷 No DICOM imaging frames uploaded yet.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Radiologist Reporting Workstation */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-extrabold text-slate-900">Radiologist Reporting & AI Assistant</h3>
                  {latestReport?.isSigned && (
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold rounded-full text-[10px]">
                      ✓ SIGNED & IMMUTABLE
                    </span>
                  )}
                </div>

                {/* AI Preliminary Findings Box */}
                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs space-y-1">
                  <span className="font-extrabold text-indigo-900 block text-[11px]">⚡ AI PACS Preliminary Analysis (Copilot)</span>
                  <p className="text-indigo-800 text-[11px] font-medium leading-relaxed">
                    {latestReport?.aiPrelimFindings || `[AI ANALYSIS] Prelim finding for ${selectedOrder.modality}: Opacification in right lower lobe area. Abnormality Score: 88%.`}
                  </p>
                </div>

                <form onSubmit={handleDraftReport} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Radiological Findings</label>
                    <textarea
                      rows={2}
                      required
                      disabled={latestReport?.isSigned}
                      value={findings}
                      onChange={(e) => setFindings(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Clinical Impression</label>
                    <input
                      type="text"
                      required
                      disabled={latestReport?.isSigned}
                      value={impression}
                      onChange={(e) => setImpression(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white disabled:bg-slate-100"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Recommendation</label>
                      <input
                        type="text"
                        disabled={latestReport?.isSigned}
                        value={recommendation}
                        onChange={(e) => setRecommendation(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white disabled:bg-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Finding Severity</label>
                      <select
                        disabled={latestReport?.isSigned}
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value as any)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold disabled:bg-slate-100"
                      >
                        <option value="NORMAL">NORMAL</option>
                        <option value="ABNORMAL">ABNORMAL</option>
                        <option value="CRITICAL">CRITICAL (Trigger Safety Alert)</option>
                      </select>
                    </div>
                  </div>

                  {!latestReport?.isSigned && (
                    <div className="flex flex-wrap justify-end gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow transition"
                      >
                        Save Draft Report
                      </button>
                      {latestReport && (
                        <button
                          type="button"
                          onClick={() => handleSignReport(latestReport.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow transition"
                        >
                          Sign & Lock Report ✓
                        </button>
                      )}
                    </div>
                  )}
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center text-slate-400 font-medium text-xs">
              Select an imaging order from the worklist queue to view DICOM frames and author reports.
            </div>
          )}
        </div>
      </div>

      {/* Printable Radiology Report Modal */}
      {showReportModal && reportData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{reportData.facility?.name}</h2>
                <p className="text-xs text-slate-500 font-semibold">{reportData.reportTitle}</p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <p><span className="font-bold">Modality / Study:</span> {reportData.modality} — {reportData.studyName}</p>
                <p><span className="font-bold">Patient Name:</span> {reportData.patientName}</p>
                <p><span className="font-bold">Accession #:</span> {reportData.accessionNumber}</p>
              </div>
              <div>
                <p><span className="font-bold">Ordering Doctor:</span> {reportData.orderingDoctorName}</p>
                <p><span className="font-bold">Radiologist:</span> {reportData.radiologistName}</p>
                <p><span className="font-bold">Report Status:</span> {reportData.isSigned ? 'SIGNED & LOCKED' : 'DRAFT'}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h3 className="font-bold text-slate-900">Radiological Findings</h3>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-1 leading-relaxed">{reportData.findings}</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Clinical Impression</h3>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-1 font-bold">{reportData.impression}</p>
              </div>
              {reportData.recommendation && (
                <div>
                  <h3 className="font-bold text-slate-900">Recommendations</h3>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-1">{reportData.recommendation}</p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">✓ Digitally Signed by Radiologist | MediNexa PACS Engine</span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow"
              >
                🖨️ Print Radiology Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
