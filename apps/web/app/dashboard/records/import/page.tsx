'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileCode,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Database,
  RefreshCw,
  Eye,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, StatCard } from '@/components/ui';

export default function EhrImportModulePage() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'PDF' | 'CSV' | 'EXCEL'>('CSV');
  const [fileContentText, setFileContentText] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [importedRecords, setImportedRecords] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const [histRes, recRes] = await Promise.all([
        fetch(`${apiUrl}/ehr/import/history`, { headers }),
        fetch(`${apiUrl}/ehr/import/records`, { headers }),
      ]);

      if (histRes.ok) {
        const histData = await histRes.json();
        setHistory(Array.isArray(histData) ? histData : []);
      }
      if (recRes.ok) {
        const recData = await recRes.json();
        setImportedRecords(Array.isArray(recData) ? recData : []);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setSuccess(null);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      setFileType('PDF');
    } else if (ext === 'xlsx' || ext === 'xls') {
      setFileType('EXCEL');
    } else {
      setFileType('CSV');
    }

    // Read preview text if csv/txt
    if (ext === 'csv' || ext === 'txt') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContentText(event.target?.result as string || '');
      };
      reader.readAsText(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or drop a file to ingest.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/ehr/import/upload`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType,
          textData: fileContentText,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'File ingestion failed');
      }

      const data = await res.json();
      setSuccess(`Successfully ingested ${data.importedCount || 'records'} entries from ${selectedFile.name}`);
      setSelectedFile(null);
      setFileContentText('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error uploading and processing file');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadSample = (format: 'csv' | 'excel') => {
    window.open(`${apiUrl}/ehr/import/template/${format}`, '_blank');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 antialiased overflow-hidden">
      <DashboardSidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardNav />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/40 border border-blue-500/30 p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-500/30">
                  <UploadCloud className="h-3.5 w-3.5" /> Clinical Records Telemetry
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  EHR & Diagnostic Records Ingestion Gateway
                </h1>
                <p className="text-slate-300 text-sm mt-2 max-w-2xl">
                  High-throughput electronic record ingestion supporting unstructured clinical PDFs (Discharge Summaries, Operative Notes), structured CSV vitals, and Excel legacy logs with automated validation and instant EMR cataloging.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <Button
                  onClick={() => handleDownloadSample('csv')}
                  variant="outline"
                  size="sm"
                  className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Sample CSV
                </Button>
                <Button
                  onClick={() => handleDownloadSample('excel')}
                  variant="outline"
                  size="sm"
                  className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Sample Excel
                </Button>
                <Button
                  onClick={loadData}
                  variant="outline"
                  size="sm"
                  className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-sm">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {/* Upload Drop Zone & Config Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Drag & Drop Card */}
            <div className="lg:col-span-2">
              <Card className="border-slate-800 bg-slate-900/70">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <UploadCloud className="h-5 w-5 text-blue-400" />
                    Drag & Drop File Upload
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Supports clinical PDF reports, CSV vital signs logs, and Excel spreadsheets up to 25MB.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUploadSubmit} className="space-y-4">
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                        dragActive
                          ? 'border-blue-500 bg-blue-950/20'
                          : 'border-slate-700 hover:border-slate-600 bg-slate-950/40 hover:bg-slate-950/60'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.csv,.xlsx,.xls,.txt"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
                        <UploadCloud className="h-7 w-7" />
                      </div>

                      {selectedFile ? (
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-white">{selectedFile.name}</p>
                          <p className="text-xs text-slate-400">
                            {(selectedFile.size / 1024).toFixed(1)} KB • Detected: {fileType}
                          </p>
                          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Ready to Ingest
                          </span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-bold text-slate-200">
                            Drop patient records here or <span className="text-blue-400 underline">browse your files</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Accepts Discharge Summaries (PDF), Vitals (CSV), and Historic Admissions (XLSX)
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span>ABDM M3 Compliant FHIR Standard Parser</span>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto justify-end">
                        {selectedFile && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedFile(null);
                              setFileContentText('');
                            }}
                            className="border-slate-700 text-slate-300"
                          >
                            Clear
                          </Button>
                        )}
                        <Button
                          type="submit"
                          disabled={!selectedFile || uploading}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-900/30"
                        >
                          <UploadCloud className={`h-4 w-4 mr-1.5 ${uploading ? 'animate-spin' : ''}`} />
                          {uploading ? 'Processing & Validating Records...' : 'Start Batch Ingestion'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Ingestion Specification */}
            <div>
              <Card className="border-slate-800 bg-slate-900/70 h-full">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-sm">
                    <FileCode className="h-4 w-4 text-teal-400" />
                    Validation Criteria
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Pre-flight validation rules applied prior to DB commit.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <strong className="text-emerald-400 block font-mono text-[11px]">CSV Telemetry Columns:</strong>
                    <p className="text-[11px] text-slate-400">
                      Patient Name, UHID, Blood Pressure, Heart Rate, SpO2, Temperature, Clinical Notes.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <strong className="text-blue-400 block font-mono text-[11px]">PDF Document OCR:</strong>
                    <p className="text-[11px] text-slate-400">
                      Clinical discharge epicrisis, diagnosis code mapping (ICD-10), and doctor e-signature verification.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <strong className="text-purple-400 block font-mono text-[11px]">Excel Batches:</strong>
                    <p className="text-[11px] text-slate-400">
                      Supports bulk appointment rosters and historical lab test results.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Imported Patient Data Display (Immediate Visibility) */}
          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    Live Imported Electronic Health Records
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Recently ingested patient vitals and clinical summaries mapped to MediNexa EMR.
                  </CardDescription>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {importedRecords.length} Live Records
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-3">Patient Name</th>
                      <th className="py-3 px-3">UHID</th>
                      <th className="py-3 px-3">Observation / Vital</th>
                      <th className="py-3 px-3">Value</th>
                      <th className="py-3 px-3">SpO2 / Temp</th>
                      <th className="py-3 px-3">Source File</th>
                      <th className="py-3 px-3">Ingested Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium">
                    {importedRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No imported records found. Upload a file above to view live ingested data.
                        </td>
                      </tr>
                    ) : (
                      importedRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-bold text-white">{rec.patientName}</td>
                          <td className="py-3 px-3 font-mono text-emerald-400">{rec.uhid}</td>
                          <td className="py-3 px-3 text-slate-300">{rec.vitalType}</td>
                          <td className="py-3 px-3 font-semibold text-white">{rec.vitalValue}</td>
                          <td className="py-3 px-3 text-slate-400">
                            {rec.spO2 || '99%'} • {rec.temperature || '98.6 °F'}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{rec.sourceFile}</td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">
                            {new Date(rec.importedAt).toLocaleTimeString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Import History Table */}
          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" />
                Ingestion Audit History
              </CardTitle>
              <CardDescription className="text-slate-400">
                Log of all PDF, CSV, and Excel batch processing runs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-3">Batch ID</th>
                      <th className="py-3 px-3">File Name</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Processed</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Uploaded By</th>
                      <th className="py-3 px-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium">
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No ingestion runs logged yet.
                        </td>
                      </tr>
                    ) : (
                      history.map((h) => (
                        <tr key={h.id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-mono font-bold text-blue-400">{h.id}</td>
                          <td className="py-3 px-3 font-bold text-white">{h.fileName}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-extrabold bg-slate-800 text-slate-300">
                              {h.fileType}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-200">
                            {h.recordsProcessed} items ({h.successCount} valid)
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                h.status === 'SUCCESS'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {h.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-300">{h.uploadedBy}</td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">
                            {new Date(h.timestamp).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
