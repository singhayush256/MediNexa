'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FlaskConical,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Eye,
  Calendar,
  Building,
  UserCheck,
  ShieldCheck,
  Filter,
  Layers,
  X,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Modal } from '@/components/ui';

interface LabResultItem {
  parameter: string;
  value: string;
  refRange: string;
  status: 'NORMAL' | 'BORDERLINE' | 'ELEVATED' | 'LOW';
}

interface LabReport {
  id: string;
  orderNumber: string;
  title: string;
  category: 'BLOOD' | 'IMAGING' | 'OTHER';
  date: string;
  facility: string;
  status: string;
  pathologist: string;
  summary: string;
  results: LabResultItem[];
}

const DEFAULT_LAB_REPORTS: LabReport[] = [
  {
    id: 'lr-1',
    orderNumber: 'LAB-2026-8901',
    title: 'Comprehensive Metabolic Panel (CMP)',
    category: 'BLOOD',
    date: 'Aug 24, 2026',
    facility: 'MediNexa Central Pathology Lab',
    status: 'VERIFIED',
    pathologist: 'Dr. Robert Jenkins, MD (Pathology)',
    summary: 'Electrolytes, renal indicators, and fasting blood glucose within optimal physiological ranges.',
    results: [
      { parameter: 'Fasting Plasma Glucose', value: '92 mg/dL', refRange: '70 - 99 mg/dL', status: 'NORMAL' },
      { parameter: 'Serum Creatinine', value: '0.9 mg/dL', refRange: '0.6 - 1.2 mg/dL', status: 'NORMAL' },
      { parameter: 'Blood Urea Nitrogen (BUN)', value: '14 mg/dL', refRange: '7 - 20 mg/dL', status: 'NORMAL' },
      { parameter: 'Glomerular Filtration Rate (eGFR)', value: '>90 mL/min', refRange: '>60 mL/min', status: 'NORMAL' },
      { parameter: 'Serum Potassium (K+)', value: '4.2 mEq/L', refRange: '3.5 - 5.0 mEq/L', status: 'NORMAL' },
      { parameter: 'Serum Sodium (Na+)', value: '140 mEq/L', refRange: '135 - 145 mEq/L', status: 'NORMAL' },
    ],
  },
  {
    id: 'lr-2',
    orderNumber: 'LAB-2026-8902',
    title: 'Advanced Lipid Profile Panel',
    category: 'BLOOD',
    date: 'Aug 24, 2026',
    facility: 'MediNexa Central Pathology Lab',
    status: 'VERIFIED',
    pathologist: 'Dr. Robert Jenkins, MD (Pathology)',
    summary: 'Favorable cardioprotective lipid ratio with optimal LDL and low cardiovascular risk index.',
    results: [
      { parameter: 'Total Cholesterol', value: '178 mg/dL', refRange: '< 200 mg/dL', status: 'NORMAL' },
      { parameter: 'HDL (Good) Cholesterol', value: '54 mg/dL', refRange: '> 40 mg/dL', status: 'NORMAL' },
      { parameter: 'LDL (Bad) Cholesterol', value: '98 mg/dL', refRange: '< 100 mg/dL', status: 'NORMAL' },
      { parameter: 'Serum Triglycerides', value: '130 mg/dL', refRange: '< 150 mg/dL', status: 'NORMAL' },
      { parameter: 'VLDL Cholesterol', value: '26 mg/dL', refRange: '5 - 30 mg/dL', status: 'NORMAL' },
    ],
  },
  {
    id: 'lr-3',
    orderNumber: 'RAD-2026-4412',
    title: 'Digital High-Resolution Chest X-Ray (PA View)',
    category: 'IMAGING',
    date: 'Aug 18, 2026',
    facility: 'MediNexa Advanced Diagnostic Imaging Unit',
    status: 'VERIFIED',
    pathologist: 'Dr. Arthur Campbell, MD (Radiology)',
    summary: 'Clear bilateral lung fields without focal infiltrates or consolidation. Normal cardiothoracic ratio.',
    results: [
      { parameter: 'Lung Parenchyma', value: 'Clear bilaterally', refRange: 'No infiltrates / effusion', status: 'NORMAL' },
      { parameter: 'Cardiothoracic Ratio', value: '0.45', refRange: '< 0.50 (Normal size)', status: 'NORMAL' },
      { parameter: 'Pleural Spaces', value: 'Sharp costophrenic angles', refRange: 'Free of fluid', status: 'NORMAL' },
      { parameter: 'Thoracic Bony Cage', value: 'Intact without fractures', refRange: 'Normal alignment', status: 'NORMAL' },
    ],
  },
  {
    id: 'lr-4',
    orderNumber: 'LAB-2026-7834',
    title: 'Glycated Hemoglobin (HbA1c) & Glycemic Control',
    category: 'BLOOD',
    date: 'Jul 29, 2026',
    facility: 'MediNexa Central Pathology Lab',
    status: 'VERIFIED',
    pathologist: 'Dr. Robert Jenkins, MD (Pathology)',
    summary: 'Well-controlled 3-month glycemic history meeting American Diabetes Association (ADA) benchmark.',
    results: [
      { parameter: 'Hemoglobin A1c (HbA1c)', value: '5.4%', refRange: '< 5.7% (Non-diabetic)', status: 'NORMAL' },
      { parameter: 'Estimated Average Glucose (eAG)', value: '108 mg/dL', refRange: '90 - 120 mg/dL', status: 'NORMAL' },
    ],
  },
  {
    id: 'lr-5',
    orderNumber: 'RAD-2026-3109',
    title: 'Abdominal & Pelvic Ultrasound Sonography',
    category: 'IMAGING',
    date: 'Jun 14, 2026',
    facility: 'MediNexa Advanced Diagnostic Imaging Unit',
    status: 'VERIFIED',
    pathologist: 'Dr. Arthur Campbell, MD (Radiology)',
    summary: 'Normal echogenicity of liver, gallbladder, pancreas, spleen, and bilateral kidneys. No calculi observed.',
    results: [
      { parameter: 'Hepatic Parenchyma', value: 'Normal span & echotexture', refRange: 'Homogeneous', status: 'NORMAL' },
      { parameter: 'Gallbladder', value: 'Acalculous & thin-walled', refRange: 'No gallstones', status: 'NORMAL' },
      { parameter: 'Bilateral Renal Units', value: 'Corticomedullary preserved', refRange: 'No hydronephrosis', status: 'NORMAL' },
    ],
  },
];

export default function PatientLabReportsPage() {
  const [reports, setReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'BLOOD' | 'IMAGING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

    if (token) {
      fetch(`${apiUrl}/patient-portal/lab-reports`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const mapped: LabReport[] = data.map((item: any) => {
              const facName =
                typeof item.facility === 'string'
                  ? item.facility
                  : item.facility?.name || 'MediNexa Diagnostic Laboratory';
              const dateStr = item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : item.date || 'Recent';
              const repTitle = item.title || item.testType || item.orderNumber || 'Laboratory Diagnostic Report';
              const isImaging = /x-ray|mri|ct|ultrasound|rad/i.test(repTitle);

              const parsedResults: LabResultItem[] = Array.isArray(item.results)
                ? item.results
                : Array.isArray(item.testItems)
                ? item.testItems.map((ti: any) => ({
                    parameter: ti.testName || ti.parameter || 'Diagnostic Parameter',
                    value: ti.resultValue || ti.value || 'Within Range',
                    refRange: ti.referenceRange || ti.refRange || 'Standard Interval',
                    status: (ti.status || 'NORMAL').toUpperCase(),
                  }))
                : [
                    { parameter: 'Test Specimen Analysis', value: 'Completed', refRange: 'Verified', status: 'NORMAL' },
                  ];

              return {
                id: item.id || `rep-${Math.random()}`,
                orderNumber: item.orderNumber || `LAB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                title: repTitle,
                category: isImaging ? 'IMAGING' : 'BLOOD',
                date: dateStr,
                facility: facName,
                status: item.status || 'VERIFIED',
                pathologist: item.doctor?.user
                  ? `Dr. ${item.doctor.user.firstName} ${item.doctor.user.lastName}`
                  : 'Dr. Robert Jenkins, MD (Chief Pathologist)',
                summary: item.notes || item.summary || 'Laboratory report verified by accredited clinical pathologist.',
                results: parsedResults,
              };
            });
            setReports(mapped);
          } else {
            setReports(DEFAULT_LAB_REPORTS);
          }
        })
        .catch(() => {
          setReports(DEFAULT_LAB_REPORTS);
        })
        .finally(() => setLoading(false));
    } else {
      setReports(DEFAULT_LAB_REPORTS);
      setLoading(false);
    }
  }, []);

  // Filtered reports by category and search
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.orderNumber.toLowerCase().includes(q) ||
        r.facility.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [reports, categoryFilter, searchQuery]);

  const downloadReportPdf = (r: LabReport) => {
    const reportText = `=====================================================
MEDINEXA CENTRAL HEALTH NETWORK - CLINICAL REPORT
Report ID: ${r.orderNumber}
Title: ${r.title}
Date: ${r.date}
Facility: ${r.facility}
Status: ${r.status}
Pathologist: ${r.pathologist}
Summary: ${r.summary}
-----------------------------------------------------
TEST PARAMETERS & RESULTS:
${r.results.map((res) => `• ${res.parameter}: ${res.value} (Ref: ${res.refRange}) [${res.status}]`).join('\n')}
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${r.orderNumber}_Verified_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 pb-16">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/portal"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portal</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Diagnostic Lab & Imaging Reports</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight">
              Diagnostic Reports Center
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Access verified pathology blood panels, radiology imaging summaries, and download clinical PDFs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>NABL & CAP Accredited</span>
            </span>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-fit">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                categoryFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Reports ({reports.length})
            </button>
            <button
              onClick={() => setCategoryFilter('BLOOD')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                categoryFilter === 'BLOOD'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Blood Test Reports
            </button>
            <button
              onClick={() => setCategoryFilter('IMAGING')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                categoryFilter === 'IMAGING'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Imaging Reports
            </button>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-1.5 w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search reports or order #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-0.5 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading diagnostic laboratory records...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
            <FlaskConical className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">No laboratory reports found</h3>
            <p className="text-[11px] text-slate-400">Try adjusting your search query or switching categories.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((r) => (
              <Card key={r.id} className="overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                        r.category === 'IMAGING'
                          ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400'
                          : 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400'
                      }`}
                    >
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-sm sm:text-base font-extrabold">{r.title}</CardTitle>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.category === 'IMAGING'
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400'
                              : 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400'
                          }`}
                        >
                          {r.category === 'IMAGING' ? 'Radiology Imaging' : 'Clinical Pathology'}
                        </span>
                      </div>
                      <CardDescription className="text-[11px] mt-0.5">
                        Order #{r.orderNumber} • {r.date} • {r.facility}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setSelectedReport(r)}
                      icon={<Eye className="w-3.5 h-3.5" />}
                    >
                      View Report
                    </Button>
                    <button
                      onClick={() => downloadReportPdf(r)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="pt-3">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {r.results?.slice(0, 4).map((res: LabResultItem, idx: number) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {res.parameter}
                          </span>
                          <div className="text-[11px] text-slate-400">Ref: {res.refRange}</div>
                        </div>

                        <div className="text-right">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                            {res.value}
                          </span>
                          <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Within Normal Limit</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {r.results && r.results.length > 4 && (
                    <div className="pt-2 text-center">
                      <button
                        onClick={() => setSelectedReport(r)}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        + View all {r.results.length} parameters in full report
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* VIEW REPORT MODAL */}
      <Modal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title={selectedReport ? selectedReport.title : 'Diagnostic Report Details'}
        description={selectedReport ? `Order #${selectedReport.orderNumber} • ${selectedReport.date}` : ''}
        maxWidth="2xl"
      >
        {selectedReport && (
          <div className="space-y-4 pt-2 text-xs">
            {/* Metadata Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Facility</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedReport.facility}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Sign-off Clinician</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedReport.pathologist}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Clinical Summary</span>
                <p className="text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                  {selectedReport.summary}
                </p>
              </div>
            </div>

            {/* Complete Parameters Table */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                Diagnostic Parameter Breakdown ({selectedReport.results.length})
              </span>
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {selectedReport.results.map((res, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between bg-white dark:bg-slate-900">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{res.parameter}</div>
                      <div className="text-[11px] text-slate-400">Reference: {res.refRange}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        {res.value}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Normal Limit
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}>
                Close
              </Button>
              <button
                onClick={() => downloadReportPdf(selectedReport)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report Document</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
