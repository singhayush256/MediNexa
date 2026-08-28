'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface FileAttachmentItem {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  publicUrl?: string;
  category: string;
  createdAt: string;
  patient?: { user?: { firstName: string; lastName: string } };
  uploadedBy?: { firstName: string; lastName: string; roleCode: string };
  facility?: { name: string; code: string };
}

interface Patient {
  id: string;
  user: { firstName: string; lastName: string; email: string };
}

export default function PatientMedicalRecordsPage() {
  const [attachments, setAttachments] = useState<FileAttachmentItem[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [uploadCategory, setUploadCategory] = useState('LAB_REPORT');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Preview Modal State
  const [previewItem, setPreviewItem] = useState<FileAttachmentItem | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    fetchInitialData();
  }, [selectedCategory]);

  const fetchInitialData = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const catParam = selectedCategory !== 'ALL' ? `?category=${selectedCategory}` : '';
      const [attRes, patRes] = await Promise.all([
        fetch(`${apiUrl}/attachments${catParam}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${apiUrl}/patients`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      ]);

      setAttachments(Array.isArray(attRes) ? attRes : []);
      if (Array.isArray(patRes)) {
        setPatients(patRes);
        if (patRes.length > 0 && !selectedPatientId) {
          setSelectedPatientId(patRes[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load attachments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }
    if (!selectedPatientId) {
      setUploadError('Please select a target patient.');
      return;
    }

    setUploadError('');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('medinexa_token');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('patientId', selectedPatientId);
      formData.append('category', uploadCategory);

      const res = await fetch(`${apiUrl}/attachments/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to upload file');

      setShowUploadModal(false);
      setSelectedFile(null);
      fetchInitialData();
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAttachment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document attachment?')) return;
    try {
      const token = localStorage.getItem('medinexa_token');
      const res = await fetch(`${apiUrl}/attachments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAttachments((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'XRAY':
      case 'MRI':
      case 'CT_SCAN':
      case 'ULTRASOUND':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'LAB_REPORT':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'PRESCRIPTION':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'DISCHARGE_SUMMARY':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const categories = [
    { code: 'ALL', label: 'All Documents' },
    { code: 'LAB_REPORT', label: 'Lab Reports' },
    { code: 'PRESCRIPTION', label: 'Prescriptions' },
    { code: 'XRAY', label: 'X-Rays' },
    { code: 'MRI', label: 'MRI Scans' },
    { code: 'CT_SCAN', label: 'CT Scans' },
    { code: 'ULTRASOUND', label: 'Ultrasounds' },
    { code: 'DISCHARGE_SUMMARY', label: 'Discharge Summaries' },
  ];

  const filteredAttachments = attachments.filter((att) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      att.fileName.toLowerCase().includes(q) ||
      att.category.toLowerCase().includes(q) ||
      att.patient?.user?.firstName.toLowerCase().includes(q) ||
      att.patient?.user?.lastName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Medical Document & Diagnostic Imaging Vault
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            HIPAA-compliant document storage for X-Rays, MRI/CT Scans, Lab Reports, and Prescriptions.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
        >
          <span>+ Upload Medical Document</span>
        </button>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.code}
                onClick={() => setSelectedCategory(cat.code)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                  selectedCategory === cat.code
                    ? 'bg-sky-600 border-sky-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-sky-400 hover:bg-sky-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search by file name or patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 bg-white w-64 shadow-sm"
          />
        </div>
      </div>

      {/* Attachments Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 font-medium animate-pulse">
          Loading document vault...
        </div>
      ) : filteredAttachments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
          <p className="text-base font-bold">No document attachments found</p>
          <p className="text-xs mt-1">Upload an X-Ray, Lab Report, or Prescription to populate the patient vault.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttachments.map((att) => (
            <div
              key={att.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-extrabold text-lg flex-shrink-0">
                    {att.mimeType.includes('pdf') ? '📄' : att.category.includes('XRAY') ? '🦴' : '📁'}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${getCategoryBadgeColor(att.category)}`}>
                    {att.category.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 truncate" title={att.fileName}>
                    {att.fileName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Size: {formatFileSize(att.fileSize)} • Uploaded: {new Date(att.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Patient:</span>
                    <span className="font-bold text-slate-800">
                      {att.patient?.user ? `${att.patient.user.firstName} ${att.patient.user.lastName}` : 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Uploaded By:</span>
                    <span className="font-bold text-slate-800">
                      {att.uploadedBy ? `${att.uploadedBy.firstName} (${att.uploadedBy.roleCode})` : 'Staff'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPreviewItem(att)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
                >
                  Preview
                </button>
                <a
                  href={`${apiUrl}/attachments/${att.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl text-center shadow-sm transition"
                >
                  Download
                </a>
                <button
                  onClick={() => handleDeleteAttachment(att.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition font-bold text-xs"
                  title="Delete Document"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Upload Medical Document</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 font-bold text-sm">✕</button>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleFileUpload} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Target Patient *</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 font-bold text-slate-800"
                >
                  <option value="">Select Patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.firstName} {p.user?.lastName} ({p.user?.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Document Category *</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 font-bold text-slate-800"
                >
                  <option value="LAB_REPORT">Lab Report</option>
                  <option value="PRESCRIPTION">Prescription</option>
                  <option value="XRAY">X-Ray Image</option>
                  <option value="MRI">MRI Scan</option>
                  <option value="CT_SCAN">CT Scan</option>
                  <option value="ULTRASOUND">Ultrasound Report</option>
                  <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                  <option value="GENERAL_DOCUMENT">General Document</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Select File (PDF, JPG, PNG, DICOM) *</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.dcm"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 text-xs font-semibold text-slate-700"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md transition"
              >
                {isSubmitting ? 'Uploading to Vault...' : 'Upload File to Patient Vault →'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{previewItem.fileName}</h3>
                <p className="text-xs text-slate-500">{previewItem.category} • {formatFileSize(previewItem.fileSize)}</p>
              </div>
              <button onClick={() => setPreviewItem(null)} className="text-slate-400 font-bold text-sm">✕</button>
            </div>

            <div className="flex-1 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center p-4 min-h-[300px]">
              {previewItem.mimeType.includes('image') ? (
                <img
                  src={`${apiUrl}/attachments/${previewItem.id}/download`}
                  alt={previewItem.fileName}
                  className="max-h-[500px] object-contain rounded-lg shadow-md"
                />
              ) : (
                <iframe
                  src={`${apiUrl}/attachments/${previewItem.id}/download`}
                  className="w-full h-[500px] rounded-lg border border-slate-300"
                  title={previewItem.fileName}
                />
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
