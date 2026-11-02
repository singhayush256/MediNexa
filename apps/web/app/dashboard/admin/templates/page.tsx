'use client';

import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Copy,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';

export default function DocumentTemplatesPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const templates = [
    {
      id: 'DISCHARGE_SUMMARY',
      name: 'Standard Inpatient Discharge Summary',
      category: 'Clinical Governance',
      format: 'NABH / Clinical Inpatient Spec',
      description: 'Canonical multi-department clearance verified discharge template with ICD-10 codings, vitals course, and pharmacy instructions.',
      fields: ['UHID', 'Admission Date', 'Discharge Date', 'Diagnosis', 'Course in Hospital', 'Medications on Discharge', 'Follow-up Advice'],
    },
    {
      id: 'CONSENT_GENERAL',
      name: 'Informed Surgical & Clinical Consent Form',
      category: 'Legal & Compliance',
      format: 'ABDM & Medical Council Compliance',
      description: 'Bilingual patient consent for diagnostic procedures, invasive surgeries, blood transfusions, and anesthesia.',
      fields: ['Patient Name', 'Procedure Name', 'Risks Explained', 'Anesthesia Type', 'Attending Surgeon', 'Witness Signature'],
    },
    {
      id: 'INVOICE_ITEMIZED',
      name: 'Itemized Hospital Billing & TPA Claim Bill',
      category: 'Revenue & Billing',
      format: 'IRDAI / Cashless TPA Standard',
      description: 'Departmental billing invoice breaking down consultation charges, bed occupancy, pharmacy consumables, and lab diagnostics.',
      fields: ['Invoice #', 'UHID', 'Bed Charges', 'Lab Charges', 'Pharmacy Charges', 'Taxes / GST', 'TPA Claim Id'],
    },
    {
      id: 'ADMISSION_ORDER',
      name: 'Inpatient Ward Admission Slip',
      category: 'Front Desk & Triage',
      format: 'Reception / Ward Handover Spec',
      description: 'Standard admission docket routing patient from triage/OPD consultation to allocated ward, floor, and bed.',
      fields: ['UHID', 'Admitting Doctor', 'Department', 'Allocated Ward', 'Allocated Bed Number', 'Attendant Contact'],
    },
  ];

  const handleCopy = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col font-sans transition-colors duration-200">
      <DashboardNav />
      <div className="flex-1 flex min-h-[calc(100vh-4rem)]">
        <DashboardSidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                  DOCUMENTATION & TEMPLATES
                </span>
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Standardized Healthcare Formats
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
                Hospital Document Templates
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <Card key={tpl.id} className="hover:shadow-md transition">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                      {tpl.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 font-bold">{tpl.format}</span>
                  </div>
                  <CardTitle className="text-sm font-extrabold mt-1">{tpl.name}</CardTitle>
                  <CardDescription className="text-xs">{tpl.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                      Included Document Sections
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {tpl.fields.map((f, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleCopy(tpl.id)}
                      className="text-xs flex items-center gap-1.5"
                    >
                      {copiedId === tpl.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied Schema</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Schema</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
