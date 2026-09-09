'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  Radio,
  Activity,
  Scan,
  Layers,
  HeartPulse,
  Eye,
  Plus,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Upload,
  Download,
  Printer,
  ChevronRight,
  Filter,
  Search,
  Pill,
  Clock,
  ShieldCheck,
  Building2,
  Stethoscope,
  X,
  ExternalLink,
  ZoomIn,
} from 'lucide-react';

type DiagnosticDepartment =
  | 'ALL'
  | 'PATHOLOGY'
  | 'XRAY'
  | 'CT'
  | 'MRI'
  | 'USG'
  | 'CARDIOLOGY';

interface DiagnosticDepartmentInfo {
  id: DiagnosticDepartment;
  name: string;
  hindiName: string;
  icon: any;
  color: string;
  bgColor: string;
  badgeColor: string;
  description: string;
}

const DIAGNOSTIC_DEPARTMENTS: DiagnosticDepartmentInfo[] = [

  {
    id: 'ALL',
    name: 'All Diagnostics (Master View)',
    hindiName: 'सारे लैब और टेस्ट (मास्टर)',
    icon: Layers,
    color: 'text-slate-700 dark:text-slate-300',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    badgeColor: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    description: 'Central triage, supervisor overview & multi-modality audit',
  },
  {
    id: 'PATHOLOGY',
    name: 'Pathology & Blood Lab',
    hindiName: 'पैथोलॉजी एवं ब्लड टेस्ट',
    icon: FlaskConical,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-950/40',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
    description: 'Hematology, Biochemistry, CBC, Lipid, HbA1c, LFT, KFT & Urine Routine',
  },
  {
    id: 'XRAY',
    name: 'Digital X-Ray',
    hindiName: 'डिजिटल एक्स-रे',
    icon: Radio,
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-50 dark:bg-sky-950/40',
    badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    description: 'Digital Radiography, Chest PA, Orthopedic views, Spine & Extremities',
  },
  {
    id: 'CT',
    name: 'CT Scan (Computed Tomography)',
    hindiName: 'सीटी स्कैन',
    icon: Scan,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    description: 'Multi-slice spiral CT, Brain, HRCT Chest, Abdomen & CT Angiography',
  },
  {
    id: 'MRI',
    name: 'MRI Scan (Magnetic Resonance)',
    hindiName: 'एमआरआई स्कैन',
    icon: Activity,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/40',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    description: '3.0 Tesla High-Field MRI, Neuro, Spine, Musculoskeletal & Soft Tissue',
  },
  {
    id: 'USG',
    name: 'Ultrasound (USG) & Doppler',
    hindiName: 'अल्ट्रासाउंड एवं डॉपलर',
    icon: Radio,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    description: 'High-Resolution 4D USG, Abdomen, Pelvis, Carotid Doppler & Fetal',
  },
  {
    id: 'CARDIOLOGY',
    name: 'Cardiology Diagnostics',
    hindiName: 'कार्डियोलॉजी जांच (ECG / Echo)',
    icon: HeartPulse,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    description: '12-Lead ECG, 2D Echocardiography with Color Doppler, Stress TMT & Holter',
  },
];

// Presets for realistic diagnostic scan film SVGs / images
const DIAGNOSTIC_PRESET_IMAGES: Record<DiagnosticDepartment, { title: string; imageSvg: string }[]> = {

  ALL: [],
  PATHOLOGY: [
    {
      title: 'Peripheral Blood Smear & Microscopic Hemogram Slip',
      imageSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%230f172a"><rect width="600" height="400" fill="%230f172a"/><circle cx="300" cy="200" r="140" fill="%23fdf2f8" stroke="%23ec4899" stroke-width="4"/><circle cx="260" cy="180" r="28" fill="%23ec4899" opacity="0.85"/><circle cx="340" cy="190" r="24" fill="%23be185d" opacity="0.9"/><circle cx="290" cy="230" r="26" fill="%23db2777" opacity="0.8"/><circle cx="310" cy="150" r="20" fill="%23f472b6" opacity="0.85"/><circle cx="230" cy="220" r="18" fill="%23f43f5e" opacity="0.75"/><circle cx="360" cy="240" r="22" fill="%23ec4899" opacity="0.8"/><text x="30" y="40" fill="%2338bdf8" font-family="sans-serif" font-size="16" font-weight="bold">PATHOLOGY BLOOD SMEAR - NABL LAB</text><text x="30" y="375" fill="%2394a3b8" font-family="sans-serif" font-size="13">Normocytic, Normochromic RBCs • Adequate Platelets</text></svg>`,
    },
  ],
  XRAY: [
    {
      title: 'Digital Chest X-Ray (PA View Film)',
      imageSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23050508"><rect width="600" height="400" fill="%23050508"/><path d="M 160 120 C 180 80, 240 70, 280 80 C 290 85, 290 290, 290 320 C 230 310, 180 270, 160 120 Z" fill="%231e293b" stroke="%2364748b" stroke-width="2" opacity="0.85"/><path d="M 440 120 C 420 80, 360 70, 320 80 C 310 85, 310 290, 310 320 C 370 310, 420 270, 440 120 Z" fill="%231e293b" stroke="%2364748b" stroke-width="2" opacity="0.85"/><ellipse cx="320" cy="250" rx="45" ry="65" fill="%23cbd5e1" opacity="0.85"/><path d="M 300 70 L 300 350" stroke="%23e2e8f0" stroke-width="6" stroke-dasharray="8,6"/><path d="M 210 140 Q 300 130 390 140 M 200 180 Q 300 170 400 180 M 205 220 Q 300 210 395 220" stroke="%2394a3b8" stroke-width="3" fill="none" opacity="0.5"/><text x="30" y="40" fill="%2338bdf8" font-family="sans-serif" font-size="16" font-weight="bold">DIGITAL CHEST X-RAY PA FILM • R (RIGHT)</text><text x="30" y="375" fill="%2394a3b8" font-family="sans-serif" font-size="13">Cardiothoracic Ratio normal (&lt;0.50) • Clear Costophrenic Angles</text></svg>`,
    },
  ],
  CT: [
    {
      title: 'High-Resolution Computed Tomography (HRCT Axial)',
      imageSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23020617"><rect width="600" height="400" fill="%23020617"/><circle cx="300" cy="200" r="150" fill="%230f172a" stroke="%23475569" stroke-width="5"/><path d="M 220 150 C 260 130, 270 190, 240 250 C 200 240, 190 180, 220 150 Z" fill="%231e293b" opacity="0.9"/><path d="M 380 150 C 340 130, 330 190, 360 250 C 400 240, 410 180, 380 150 Z" fill="%231e293b" opacity="0.9"/><ellipse cx="300" cy="230" rx="35" ry="40" fill="%23cbd5e1" opacity="0.8"/><circle cx="300" cy="200" r="142" fill="none" stroke="%23f8fafc" stroke-width="4" stroke-dasharray="14,10" opacity="0.7"/><text x="30" y="40" fill="%23818cf8" font-family="sans-serif" font-size="16" font-weight="bold">HRCT CHEST AXIAL SLICE • 1.0mm THICKNESS</text><text x="30" y="375" fill="%2394a3b8" font-family="sans-serif" font-size="13">No bronchiectasis • No consolidations or honeycombing</text></svg>`,
    },
  ],
  MRI: [
    {
      title: 'MRI 3.0T Sagittal / Axial T2-Weighted Scan',
      imageSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23030712"><rect width="600" height="400" fill="%23030712"/><ellipse cx="300" cy="200" rx="140" ry="160" fill="%23111827" stroke="%23a855f7" stroke-width="3"/><path d="M 250 120 Q 300 90 350 120 Q 370 180 340 240 Q 300 280 260 240 Z" fill="%23374151" opacity="0.85"/><path d="M 270 150 Q 300 130 330 150 Q 340 190 320 220 Q 300 240 280 220 Z" fill="%23f3e8ff" opacity="0.7"/><text x="30" y="40" fill="%23c084fc" font-family="sans-serif" font-size="16" font-weight="bold">MRI BRAIN / SPINE 3.0T T2W SAGITTAL</text><text x="30" y="375" fill="%2394a3b8" font-family="sans-serif" font-size="13">Normal grey-white matter differentiation • No focal demyelination</text></svg>`,
    },
  ],
  USG: [
    {
      title: 'High-Resolution Ultrasound (USG) Sonogram',
      imageSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23000000"><rect width="600" height="400" fill="%23000000"/><path d="M 300 60 L 140 330 A 240 240 0 0 0 460 330 Z" fill="%2318181b" stroke="%233f3f46" stroke-width="2"/><path d="M 230 200 Q 300 160 360 210 Q 340 270 250 260 Z" fill="%2371717a" opacity="0.75"/><circle cx="280" cy="220" r="18" fill="%2327272a" stroke="%23d4d4d8" stroke-width="2"/><text x="30" y="40" fill="%23fbbf24" font-family="sans-serif" font-size="16" font-weight="bold">WHOLE ABDOMEN ULTRASONOGRAM (USG)</text><text x="30" y="375" fill="%23a1a1aa" font-family="sans-serif" font-size="13">Liver Grade 1 Steatosis • Gallbladder, Kidneys, Spleen normal</text></svg>`,
    },
  ],
  CARDIOLOGY: [
    {
      title: '12-Lead Electrocardiogram (ECG Strip & 2D Echo)',
      imageSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%231e1b4b"><rect width="600" height="400" fill="%231e1b4b"/><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23312e81" stroke-width="0.7"/></pattern></defs><rect width="600" height="400" fill="url(%23grid)"/><path d="M 20 200 L 90 200 L 100 185 L 110 200 L 125 200 L 135 120 L 150 270 L 160 200 L 190 200 L 210 170 L 230 200 L 300 200 L 310 185 L 320 200 L 335 200 L 345 120 L 360 270 L 370 200 L 400 200 L 420 170 L 440 200 L 580 200" fill="none" stroke="%23f43f5e" stroke-width="3"/><text x="30" y="40" fill="%23fda4af" font-family="sans-serif" font-size="16" font-weight="bold">12-LEAD ECG RHYTHM STRIP • 25mm/s • 10mm/mV</text><text x="30" y="375" fill="%23e2e8f0" font-family="sans-serif" font-size="13">Normal Sinus Rhythm • Heart Rate: 72 bpm • No ST elevation</text></svg>`,
    },
  ],
};

interface DiagnosticOrderItem {
  id: string;
  orderNumber: string;
  department: DiagnosticDepartment;
  testName: string;
  category: string;
  patientName: string;
  patientId: string;
  mrn: string;
  doctorName: string;
  priority: 'ROUTINE' | 'URGENT' | 'STAT';
  status: 'ORDERED' | 'SAMPLE_COLLECTED' | 'IN_PROCESS' | 'REPORTED' | 'VERIFIED';
  orderedAt: string;
  clinicalNotes?: string;
  results?: {
    parameter: string;
    value: string;
    unit?: string;
    refRange?: string;
    flag: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
  }[];
  scanFilmImage?: string;
  scanFilmTitle?: string;
  radiologistImpression?: string;
  technologistRemarks?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  associatedPrescriptions?: {
    medicineName: string;
    dosage: string;
    duration: string;
    instructions: string;
    prescribedAt: string;
  }[];
}

const DEFAULT_DIAGNOSTIC_ORDERS: DiagnosticOrderItem[] = [
  {
    id: 'diag-ord-xray-01',
    orderNumber: 'XR-2026-0908-01',
    department: 'XRAY',
    testName: 'Digital Chest X-Ray (PA View)',
    category: 'DIGITAL_RADIOLOGY',
    patientName: 'Aarav Patel',
    patientId: 'patient-aarav-patel',
    mrn: 'MRN-90214',
    doctorName: 'Dr. Rajesh Sharma (Cardiology)',
    priority: 'STAT',
    status: 'VERIFIED',
    orderedAt: 'Sep 08, 2026, 09:30 AM',
    clinicalNotes: 'Suspected acute chest discomfort & rule out cardiomegaly, pneumonia or pneumothorax.',
    scanFilmImage: DIAGNOSTIC_PRESET_IMAGES.XRAY[0].imageSvg,
    scanFilmTitle: 'Digital Chest X-Ray (PA View Film)',
    radiologistImpression:
      'Cardiothoracic ratio is normal (< 0.50). Lung fields are clear bilaterally with no active focal parenchymal consolidation, effusion, or pneumothorax. Costophrenic sulci and dome of diaphragms are well visualized.',
    technologistRemarks: 'Acquired on Siemens Multix Impact High-Frequency Digital DR System. Optimal inspiration, zero motion artifact.',
    verifiedBy: 'Dr. Sunita Kulkarni, MD (Senior Consultant Radiologist)',
    verifiedAt: 'Sep 08, 2026, 11:15 AM',
    results: [
      { parameter: 'Cardiothoracic Ratio (CTR)', value: '0.45', unit: 'Ratio', refRange: '< 0.50', flag: 'NORMAL' },
      { parameter: 'Lung Parenchyma', value: 'Clear bilaterally', unit: '', refRange: 'Clear', flag: 'NORMAL' },
      { parameter: 'Costophrenic Angles', value: 'Sharp & free', unit: '', refRange: 'Sharp', flag: 'NORMAL' },
      { parameter: 'Bony Thorax & Ribs', value: 'Intact, no fracture', unit: '', refRange: 'Intact', flag: 'NORMAL' },
    ],
    associatedPrescriptions: [
      {
        medicineName: 'Pan 40 (Pantoprazole 40mg)',
        dosage: '1 Tablet Once Daily',
        duration: '14 Days',
        instructions: 'Take in morning 30 mins before breakfast to prevent epigastric burning.',
        prescribedAt: 'Sep 08, 2026, 11:45 AM',
      },
    ],
  },
  {
    id: 'diag-ord-path-01',
    orderNumber: 'LAB-2026-0908-02',
    department: 'PATHOLOGY',
    testName: 'Complete Blood Count (CBC) & Lipid Profile',
    category: 'HEMATOLOGY_BIOCHEMISTRY',
    patientName: 'Aarav Patel',
    patientId: 'patient-aarav-patel',
    mrn: 'MRN-90214',
    doctorName: 'Dr. Rajesh Sharma (Cardiology)',
    priority: 'URGENT',
    status: 'VERIFIED',
    orderedAt: 'Sep 08, 2026, 09:45 AM',
    clinicalNotes: 'Cardiovascular risk evaluation and baseline infection workup.',
    scanFilmImage: DIAGNOSTIC_PRESET_IMAGES.PATHOLOGY[0].imageSvg,
    scanFilmTitle: 'Peripheral Blood Smear & Microscopic Hemogram Slip',
    radiologistImpression:
      'Hemoglobin and total leukocyte count within standard biological range. Mild borderline elevation in LDL Cholesterol (138 mg/dL). Preserved platelets and normal erythrocyte indices.',
    technologistRemarks: 'Beckman Coulter DxH 900 automated hematology analyzer + Roche Cobas c502 chemistry.',
    verifiedBy: 'Dr. Arvind Deshmukh, MD (Chief Pathologist)',
    verifiedAt: 'Sep 08, 2026, 12:30 PM',
    results: [
      { parameter: 'Hemoglobin (Hb)', value: '14.2', unit: 'g/dL', refRange: '13.0 - 17.0', flag: 'NORMAL' },
      { parameter: 'Total Leukocyte Count (WBC)', value: '7,800', unit: '/uL', refRange: '4,000 - 11,000', flag: 'NORMAL' },
      { parameter: 'Platelet Count', value: '240,000', unit: '/uL', refRange: '150,000 - 450,000', flag: 'NORMAL' },
      { parameter: 'Total Cholesterol', value: '210', unit: 'mg/dL', refRange: '< 200', flag: 'ABNORMAL' },
      { parameter: 'LDL Cholesterol', value: '138', unit: 'mg/dL', refRange: '< 100', flag: 'ABNORMAL' },
      { parameter: 'Triglycerides', value: '142', unit: 'mg/dL', refRange: '< 150', flag: 'NORMAL' },
    ],
    associatedPrescriptions: [
      {
        medicineName: 'Atorva 20 (Atorvastatin 20mg)',
        dosage: '1 Tablet Once Daily at Bedtime (0-0-1)',
        duration: '90 Days',
        instructions: 'Take at night after food for targeted LDL cholesterol lowering.',
        prescribedAt: 'Sep 08, 2026, 01:00 PM',
      },
    ],
  },
  {
    id: 'diag-ord-ct-01',
    orderNumber: 'CT-2026-0907-03',
    department: 'CT',
    testName: 'High-Resolution Computed Tomography (HRCT Chest)',
    category: 'COMPUTED_TOMOGRAPHY',
    patientName: 'Aarav Patel',
    patientId: 'patient-aarav-patel',
    mrn: 'MRN-90214',
    doctorName: 'Dr. Sunita Kulkarni (Radiology)',
    priority: 'ROUTINE',
    status: 'VERIFIED',
    orderedAt: 'Sep 07, 2026, 10:00 AM',
    clinicalNotes: 'Follow-up evaluation for post-viral pulmonary parenchyma.',
    scanFilmImage: DIAGNOSTIC_PRESET_IMAGES.CT[0].imageSvg,
    scanFilmTitle: 'High-Resolution Computed Tomography (HRCT Axial)',
    radiologistImpression:
      'High-resolution non-contrast CT of the thorax reveals normal lung attenuation. No ground glass opacities, consolidation, or fibrosis. Tracheobronchial tree is normal. Mediastinal and hilar structures are unremarkable.',
    technologistRemarks: 'GE Revolution 128-Slice CT scanner with iterative dose reduction (ASiR-V).',
    verifiedBy: 'Dr. Sunita Kulkarni, MD (Radiology)',
    verifiedAt: 'Sep 07, 2026, 02:45 PM',
    results: [
      { parameter: 'Lung Parenchyma Attenuation', value: 'Normal', unit: '', refRange: 'Homogeneous', flag: 'NORMAL' },
      { parameter: 'Ground Glass Opacities (GGO)', value: 'Nil detected', unit: '', refRange: 'Absent', flag: 'NORMAL' },
      { parameter: 'Mediastinal Lymph Nodes', value: 'No lymphadenopathy', unit: '', refRange: '< 10mm short axis', flag: 'NORMAL' },
    ],
  },
  {
    id: 'diag-ord-mri-01',
    orderNumber: 'MRI-2026-0906-04',
    department: 'MRI',
    testName: 'MRI Lumbar Spine with Screening Whole Spine',
    category: 'MAGNETIC_RESONANCE',
    patientName: 'Aarav Patel',
    patientId: 'patient-aarav-patel',
    mrn: 'MRN-90214',
    doctorName: 'Dr. Vikram Seth (Orthopedics / Spine)',
    priority: 'ROUTINE',
    status: 'VERIFIED',
    orderedAt: 'Sep 06, 2026, 11:30 AM',
    clinicalNotes: 'Intermittent lower back strain radiating to left thigh. Evaluate disc bulge.',
    scanFilmImage: DIAGNOSTIC_PRESET_IMAGES.MRI[0].imageSvg,
    scanFilmTitle: 'MRI 3.0T Sagittal / Axial T2-Weighted Scan',
    radiologistImpression:
      'Mild diffuse disc bulge noted at L4-L5 level with slight indentation over anterior thecal sac. No significant neural foraminal encroachment. Spinal cord and conus medullaris normal in signal intensity and morphology.',
    technologistRemarks: 'Siemens MAGNETOM Vida 3.0T MRI. Dedicated spine matrix coil with motion correction.',
    verifiedBy: 'Dr. Sunita Kulkarni, MD (Radiology)',
    verifiedAt: 'Sep 06, 2026, 04:15 PM',
    results: [
      { parameter: 'L4-L5 Intervertebral Disc', value: 'Mild diffuse disc bulge', unit: '', refRange: 'Normal alignment', flag: 'ABNORMAL' },
      { parameter: 'Thecal Sac & Canal Caliber', value: 'Mild anterior indentation', unit: '', refRange: 'Adequate canal', flag: 'NORMAL' },
      { parameter: 'Conus Medullaris', value: 'Terminates at L1 level', unit: '', refRange: 'Normal L1-L2', flag: 'NORMAL' },
    ],
  },
  {
    id: 'diag-ord-usg-01',
    orderNumber: 'USG-2026-0905-05',
    department: 'USG',
    testName: 'Whole Abdomen Ultrasound (USG)',
    category: 'ULTRASONOGRAPHY',
    patientName: 'Aarav Patel',
    patientId: 'patient-aarav-patel',
    mrn: 'MRN-90214',
    doctorName: 'Dr. Rajesh Sharma (Cardiology)',
    priority: 'ROUTINE',
    status: 'VERIFIED',
    orderedAt: 'Sep 05, 2026, 02:00 PM',
    clinicalNotes: 'Annual systemic screening and liver architecture check.',
    scanFilmImage: DIAGNOSTIC_PRESET_IMAGES.USG[0].imageSvg,
    scanFilmTitle: 'High-Resolution Ultrasound (USG) Sonogram',
    radiologistImpression:
      'Liver is normal in size (13.8 cm) with diffuse increased parenchymal echogenicity suggestive of Grade 1 fatty liver (hepatic steatosis). Gallbladder is well distended, lumen is clear, no calculi. Spleen, pancreas, and kidneys are normal in size and echotexture.',
    technologistRemarks: 'Philips EPIQ Elite Ultra-Premium USG with C5-1 curved broadband transducer.',
    verifiedBy: 'Dr. Sunita Kulkarni, MD (Radiology)',
    verifiedAt: 'Sep 05, 2026, 03:30 PM',
    results: [
      { parameter: 'Liver Size', value: '13.8', unit: 'cm', refRange: '< 15.0 cm', flag: 'NORMAL' },
      { parameter: 'Hepatic Echogenicity', value: 'Grade 1 Fatty Infiltration', unit: '', refRange: 'Normal homogeneic', flag: 'ABNORMAL' },
      { parameter: 'Gallbladder & CBD', value: 'Clear lumen, no calculi', unit: '', refRange: 'Acalculous', flag: 'NORMAL' },
      { parameter: 'Bilateral Kidneys', value: 'Normal CMD, no hydronephrosis', unit: '', refRange: 'Normal', flag: 'NORMAL' },
    ],
  },
  {
    id: 'diag-ord-cardio-01',
    orderNumber: 'CARD-2026-0908-06',
    department: 'CARDIOLOGY',
    testName: '12-Lead ECG & 2D Echocardiography',
    category: 'CARDIOLOGY_DIAGNOSTICS',
    patientName: 'Aarav Patel',
    patientId: 'patient-aarav-patel',
    mrn: 'MRN-90214',
    doctorName: 'Dr. Rajesh Sharma (Cardiology)',
    priority: 'STAT',
    status: 'VERIFIED',
    orderedAt: 'Sep 08, 2026, 09:35 AM',
    clinicalNotes: 'Acute chest evaluation and cardiac function assessment.',
    scanFilmImage: DIAGNOSTIC_PRESET_IMAGES.CARDIOLOGY[0].imageSvg,
    scanFilmTitle: '12-Lead Electrocardiogram (ECG Strip & 2D Echo)',
    radiologistImpression:
      'ECG shows Normal Sinus Rhythm at 72 bpm with normal axis, no ischemic ST-T changes. 2D Echocardiography reveals preserved Left Ventricular Systolic Function with LVEF of 55%. No regional wall motion abnormalities. Normal cardiac chamber dimensions.',
    technologistRemarks: 'GE Vivid E95 4D Cardiovascular Ultrasound + Schiller Cardiovit 12-lead recorder.',
    verifiedBy: 'Dr. Rajesh Sharma, MD, DM (Cardiology)',
    verifiedAt: 'Sep 08, 2026, 11:30 AM',
    results: [
      { parameter: 'Heart Rate (ECG)', value: '72', unit: 'bpm', refRange: '60 - 100', flag: 'NORMAL' },
      { parameter: 'Left Ventricular Ejection Fraction (LVEF)', value: '55', unit: '%', refRange: '50 - 70', flag: 'NORMAL' },
      { parameter: 'Regional Wall Motion Abnormality (RWMA)', value: 'Absent', unit: '', refRange: 'Absent', flag: 'NORMAL' },
      { parameter: 'Valvular Function', value: 'Normal, no MR/AR', unit: '', refRange: 'Physiological', flag: 'NORMAL' },
    ],
    associatedPrescriptions: [
      {
        medicineName: 'Metoprolol Succinate 25mg',
        dosage: '1 Tablet Once Daily (1-0-0)',
        duration: '60 Days',
        instructions: 'Take in morning with breakfast for rate and blood pressure stabilization.',
        prescribedAt: 'Sep 08, 2026, 11:50 AM',
      },
    ],
  },
];

export default function UnifiedLabDiagnosticsPage() {
  const [activeDepartment, setActiveDepartment] = useState<DiagnosticDepartment>('ALL');
  const [orders, setOrders] = useState<DiagnosticOrderItem[]>(DEFAULT_DIAGNOSTIC_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<DiagnosticOrderItem | null>(DEFAULT_DIAGNOSTIC_ORDERS[0]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPrescribeMedicineModal, setShowPrescribeMedicineModal] = useState(false);
  const [showImageZoomModal, setShowImageZoomModal] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<{ src: string; title: string } | null>(null);

  // New Diagnostic Order Form State
  const [newOrderDept, setNewOrderDept] = useState<DiagnosticDepartment>('XRAY');
  const [newOrderTestName, setNewOrderTestName] = useState('Digital Chest X-Ray (PA View)');
  const [newOrderPatientName, setNewOrderPatientName] = useState('Aarav Patel');
  const [newOrderPriority, setNewOrderPriority] = useState<'ROUTINE' | 'URGENT' | 'STAT'>('ROUTINE');
  const [newOrderDoctor, setNewOrderDoctor] = useState('Dr. Rajesh Sharma');
  const [newOrderNotes, setNewOrderNotes] = useState('');

  // Prescribe Lab Medicine Form State
  const [rxDrugName, setRxDrugName] = useState('');
  const [rxDosage, setRxDosage] = useState('1 Tablet');
  const [rxFrequency, setRxFrequency] = useState('Once Daily (1-0-0)');
  const [rxDuration, setRxDuration] = useState('14 Days');
  const [rxFoodTiming, setRxFoodTiming] = useState('AFTER_FOOD');
  const [rxInstructions, setRxInstructions] = useState('Take after food with water');

  // Technician / Radiologist Result Entry State
  const [showResultEntryForm, setShowResultEntryForm] = useState(false);
  const [entryImpression, setEntryImpression] = useState('');
  const [entryRemarks, setEntryRemarks] = useState('');
  const [entrySelectedImageIndex, setEntrySelectedImageIndex] = useState(0);

  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Synchronize with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('medinexa_unified_diagnostic_orders');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOrders(parsed);
            setSelectedOrder(parsed[0]);
          }
        }
      } catch (err) {
        console.error('Failed reading saved diagnostic orders:', err);
      }
    }
  }, []);

  const saveOrdersToStorage = (updated: DiagnosticOrderItem[]) => {
    setOrders(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('medinexa_unified_diagnostic_orders', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const notify = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotificationMsg({ text, type });
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  // Department Live Count Badges
  const departmentCounts = useMemo(() => {
    const counts: Record<DiagnosticDepartment, number> = {
      ALL: orders.length,
      PATHOLOGY: 0,
      XRAY: 0,
      CT: 0,
      MRI: 0,
      USG: 0,
      CARDIOLOGY: 0,
    };
    orders.forEach((ord) => {
      if (counts[ord.department] !== undefined) {
        counts[ord.department] += 1;
      }
    });
    return counts;
  }, [orders]);

  // Strict Department Filtering
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // 1. Department Isolation
      if (activeDepartment !== 'ALL' && ord.department !== activeDepartment) {
        return false;
      }
      // 2. Status Filter
      if (statusFilter !== 'ALL' && ord.status !== statusFilter) {
        return false;
      }
      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = ord.testName.toLowerCase().includes(q);
        const matchPatient = ord.patientName.toLowerCase().includes(q);
        const matchNumber = ord.orderNumber.toLowerCase().includes(q);
        const matchDoctor = ord.doctorName.toLowerCase().includes(q);
        if (!matchName && !matchPatient && !matchNumber && !matchDoctor) {
          return false;
        }
      }
      return true;
    });
  }, [orders, activeDepartment, statusFilter, searchQuery]);

  // Handle department change: ensure selected order remains in scope or selects first
  const handleSelectDepartment = (dept: DiagnosticDepartment) => {
    setActiveDepartment(dept);
    const inDept = orders.filter((o) => dept === 'ALL' || o.department === dept);
    if (inDept.length > 0) {
      setSelectedOrder(inDept[0]);
    } else {
      setSelectedOrder(null);
    }
  };

  // Doctor creates new diagnostic order (Strict Department Routing)
  const handleCreateDiagnosticOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const deptInfo = DIAGNOSTIC_DEPARTMENTS.find((d) => d.id === newOrderDept);
    const newId = `diag-ord-${newOrderDept.toLowerCase()}-${Date.now()}`;
    const newNumber = `${newOrderDept}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const presetImg = DIAGNOSTIC_PRESET_IMAGES[newOrderDept]?.[0];

    const newOrder: DiagnosticOrderItem = {
      id: newId,
      orderNumber: newNumber,
      department: newOrderDept,
      testName: newOrderTestName,
      category: `${newOrderDept}_EXAMINATION`,
      patientName: newOrderPatientName,
      patientId: 'patient-aarav-patel',
      mrn: 'MRN-90214',
      doctorName: newOrderDoctor,
      priority: newOrderPriority,
      status: 'ORDERED',
      orderedAt: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
      clinicalNotes: newOrderNotes || 'Doctor prescribed diagnostic investigation.',
      scanFilmImage: presetImg?.imageSvg,
      scanFilmTitle: presetImg?.title || `${newOrderTestName} Scan Film`,
      results: [
        { parameter: 'Investigation Status', value: 'Scheduled in Queue', unit: '', refRange: 'Standard', flag: 'NORMAL' },
      ],
    };

    const updated = [newOrder, ...orders];
    saveOrdersToStorage(updated);
    setSelectedOrder(newOrder);
    setShowOrderModal(false);
    setNewOrderNotes('');

    notify(
      `✓ Diagnostic Order #${newNumber} sent directly to ${deptInfo?.name}! (Sirf ${deptInfo?.hindiName} walo ke paas route hua hai)`,
      'success'
    );
  };

  // Technician / Radiologist Enters Results & Finalizes Report
  const handleSaveTechnicianResults = () => {
    if (!selectedOrder) return;

    const preset = DIAGNOSTIC_PRESET_IMAGES[selectedOrder.department]?.[entrySelectedImageIndex] ||
      DIAGNOSTIC_PRESET_IMAGES[selectedOrder.department]?.[0];

    const updated = orders.map((o) => {
      if (o.id === selectedOrder.id) {
        return {
          ...o,
          status: 'VERIFIED' as const,
          radiologistImpression: entryImpression || o.radiologistImpression || 'Investigation completed with satisfactory clinical visualization. No acute pathological abnormality seen.',
          technologistRemarks: entryRemarks || o.technologistRemarks || 'Standard high-definition protocol executed without motion artifacts.',
          scanFilmImage: preset?.imageSvg || o.scanFilmImage,
          scanFilmTitle: preset?.title || o.scanFilmTitle,
          verifiedBy: 'Dr. Sunita Kulkarni, MD (Chief Radiologist & Pathologist)',
          verifiedAt: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
        };
      }
      return o;
    });

    saveOrdersToStorage(updated);
    const refreshed = updated.find((o) => o.id === selectedOrder.id) || null;
    setSelectedOrder(refreshed);
    setShowResultEntryForm(false);

    notify('✓ Diagnostic Report with Scan Film verified and saved! Available to Doctor & Patient.', 'success');
  };

  // Doctor prescribes "Lab Medicine" based on this report
  const handlePrescribeLabMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !rxDrugName.trim()) {
      notify('Please enter a medicine name', 'error');
      return;
    }

    const newRxItem = {
      medicineName: rxDrugName,
      dosage: rxDosage,
      duration: rxDuration,
      instructions: `${rxInstructions} (${rxFoodTiming})`,
      prescribedAt: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
    };

    // Update order with associated prescription
    const updatedOrders = orders.map((o) => {
      if (o.id === selectedOrder.id) {
        return {
          ...o,
          associatedPrescriptions: [...(o.associatedPrescriptions || []), newRxItem],
        };
      }
      return o;
    });
    saveOrdersToStorage(updatedOrders);
    setSelectedOrder(updatedOrders.find((o) => o.id === selectedOrder.id) || null);

    // Save to shared prescriptions store for Patient Portal & Pharmacy with [Lab Medicine] and [NOT_BOUGHT] status
    if (typeof window !== 'undefined') {
      try {
        const existingRx = JSON.parse(localStorage.getItem('medinexa_patient_prescriptions') || '[]');
        const newRecord = {
          id: `rx-lab-${Date.now()}`,
          drugName: rxDrugName,
          genericName: 'Post-Diagnostic Therapeutic Formulation',
          dosage: rxDosage,
          frequency: rxFrequency,
          duration: rxDuration,
          refillsLeft: 1,
          prescribedBy: selectedOrder.doctorName,
          prescribedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          status: 'ACTIVE',
          isLabMedicine: true,
          labReportRef: `${selectedOrder.testName} (#${selectedOrder.orderNumber})`,
          purchaseStatus: 'NOT_BOUGHT', // Default: Medicine Not Bought
        };
        localStorage.setItem('medinexa_patient_prescriptions', JSON.stringify([newRecord, ...existingRx]));
      } catch (err) {
        console.error('Failed saving lab medicine to prescriptions:', err);
      }
    }

    setShowPrescribeMedicineModal(false);
    setRxDrugName('');
    notify(
      `✓ Lab Medicine '${rxDrugName}' prescribed successfully! Added to Patient Prescription as [🧪 Lab Medicine] and flagged as [⚠️ Medicine Not Bought] in Pharmacy.`,
      'success'
    );
  };

  const activeDeptInfo = DIAGNOSTIC_DEPARTMENTS.find((d) => d.id === activeDepartment);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-500 hover:text-teal-600 transition flex items-center gap-1.5"
            >
              <span>← Back to Hub</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 font-bold">
                <FlaskConical className="w-4 h-4" />
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Central Diagnostic & Laboratory Ecosystem (Unified Hub)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOrderModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Doctor: Order Lab / Scan</span>
            </button>
          </div>
        </div>
      </header>

      {/* Global Notification Banner */}
      {notificationMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-sm ${
              notificationMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                : notificationMsg.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                : 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notificationMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <span>{notificationMsg.text}</span>
            </div>
            <button
              onClick={() => setNotificationMsg(null)}
              className="text-slate-400 hover:text-slate-600 font-bold text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Layout with Left Sidebar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================================= */}
          {/* LEFT SIDEBAR: MODALITY & DEPARTMENT NAVIGATOR (USER REQUIREMENT) */}
          {/* ========================================================================= */}
          <aside className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3 sticky top-20">
            <div className="px-2 py-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Diagnostic Departments
              </span>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                Department Routing
              </h3>
            </div>

            <nav className="space-y-1.5">
              {DIAGNOSTIC_DEPARTMENTS.map((dept) => {
                const IconComponent = dept.icon;
                const isSelected = activeDepartment === dept.id;
                const count = departmentCounts[dept.id] || 0;

                return (
                  <button
                    key={dept.id}
                    onClick={() => handleSelectDepartment(dept.id)}
                    className={`w-full text-left p-3 rounded-2xl transition flex items-center justify-between group ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md'
                        : 'bg-slate-50/70 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition ${
                          isSelected
                            ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                            : `${dept.bgColor} ${dept.color}`
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold block truncate">{dept.name}</span>
                        <span
                          className={`text-[10px] block truncate ${
                            isSelected ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400'
                          }`}
                        >
                          {dept.hindiName}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                          : dept.badgeColor
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 px-2 text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Isolated Desk Routing</span>
              </p>
              <p className="text-[10px] text-slate-400">
                Doctor jo test order karte hain wo sidha uske specific department desk par hi route hota hai.
              </p>
            </div>
          </aside>

          {/* ========================================================================= */}
          {/* MIDDLE COLUMN: DEPARTMENT ORDERS QUEUE */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 space-y-4">
            {/* Header & Filter */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>{activeDeptInfo?.name}</span>
                  </h2>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Showing {filteredOrders.length} isolated orders
                  </p>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="ORDERED">ORDERED</option>
                  <option value="IN_PROCESS">IN PROCESS</option>
                  <option value="VERIFIED">VERIFIED</option>
                </select>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search test, patient, or doctor..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
              {filteredOrders.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 space-y-2">
                  <p className="font-bold">No diagnostic orders found</p>
                  <p className="text-[11px]">
                    {activeDepartment !== 'ALL'
                      ? `Is ${activeDeptInfo?.name} queue me abhi koi order pending nahi hai.`
                      : 'Koi order match nahi hua.'}
                  </p>
                </div>
              ) : (
                filteredOrders.map((ord) => {
                  const isSelected = selectedOrder?.id === ord.id;
                  const deptInfo = DIAGNOSTIC_DEPARTMENTS.find((d) => d.id === ord.department);
                  const Icon = deptInfo?.icon || Activity;

                  return (
                    <div
                      key={ord.id}
                      onClick={() => {
                        setSelectedOrder(ord);
                        setShowResultEntryForm(false);
                      }}
                      className={`p-4 rounded-2xl border transition cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/30 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`p-1.5 rounded-lg ${deptInfo?.bgColor} ${deptInfo?.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </span>
                          <div>
                            <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 block">
                              {ord.testName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {ord.orderNumber}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            ord.status === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : ord.status === 'IN_PROCESS'
                              ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">Patient</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{ord.patientName}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">Ordering Doctor</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                            {ord.doctorName}
                          </span>
                        </div>
                      </div>

                      {/* Associated Lab Medicine Pill if any */}
                      {(ord.associatedPrescriptions?.length || 0) > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
                          <Pill className="w-3 h-3" />
                          <span>
                            {ord.associatedPrescriptions?.length} Lab Medicine(s) Prescribed
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: WORKSTATION, SCAN FILM PREVIEW & REPORT DETAILS */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 space-y-6">
            {selectedOrder ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                {/* Header with Title and Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                        {selectedOrder.department}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        Order #{selectedOrder.orderNumber}
                      </span>
                    </div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                      {selectedOrder.testName}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Report</span>
                    </button>

                    {/* Prescribe Lab Medicine Button (USER REQUIREMENT) */}
                    <button
                      onClick={() => {
                        setRxDrugName('');
                        setShowPrescribeMedicineModal(true);
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-purple-500/20 transition flex items-center gap-1.5"
                    >
                      <Pill className="w-3.5 h-3.5" />
                      <span>+ Prescribe Lab Medicine</span>
                    </button>
                  </div>
                </div>

                {/* Patient & Doctor Context Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Patient</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{selectedOrder.patientName}</span>
                    <span className="text-[10px] text-slate-400 block">{selectedOrder.mrn}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Prescribing Doctor</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedOrder.doctorName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Ordered At</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{selectedOrder.orderedAt}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Priority</span>
                    <span
                      className={`font-black text-[11px] ${
                        selectedOrder.priority === 'STAT'
                          ? 'text-rose-600'
                          : selectedOrder.priority === 'URGENT'
                          ? 'text-amber-600'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {selectedOrder.priority}
                    </span>
                  </div>
                </div>

                {/* Clinical Indication Notes */}
                {selectedOrder.clinicalNotes && (
                  <div className="p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs">
                    <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 block uppercase">
                      Clinical Indication / Reason
                    </span>
                    <p className="text-amber-950 dark:text-amber-200 font-medium mt-0.5">
                      {selectedOrder.clinicalNotes}
                    </p>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SCAN FILM / REPORT IMAGE SECTION (USER REQUIREMENT) */}
                {/* ========================================================================= */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Scan className="w-3.5 h-3.5 text-teal-600" />
                      <span>Diagnostic Scan Film / Report Image</span>
                    </h3>
                    {selectedOrder.scanFilmImage && (
                      <button
                        onClick={() => {
                          setZoomedImage({
                            src: selectedOrder.scanFilmImage!,
                            title: selectedOrder.scanFilmTitle || selectedOrder.testName,
                          });
                          setShowImageZoomModal(true);
                        }}
                        className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                      >
                        <ZoomIn className="w-3 h-3" />
                        <span>Zoom Scan Film</span>
                      </button>
                    )}
                  </div>

                  {selectedOrder.scanFilmImage ? (
                    <div
                      onClick={() => {
                        setZoomedImage({
                          src: selectedOrder.scanFilmImage!,
                          title: selectedOrder.scanFilmTitle || selectedOrder.testName,
                        });
                        setShowImageZoomModal(true);
                      }}
                      className="relative rounded-2xl overflow-hidden border-2 border-slate-800 bg-black cursor-pointer shadow-md group"
                    >
                      <img
                        src={selectedOrder.scanFilmImage}
                        alt={selectedOrder.scanFilmTitle || 'Scan Film'}
                        className="w-full h-52 object-cover object-center group-hover:scale-105 transition duration-300 opacity-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3 text-white">
                        <div>
                          <span className="text-[10px] font-bold text-teal-400 block uppercase">
                            Official Medical Scan Film
                          </span>
                          <span className="text-xs font-extrabold">{selectedOrder.scanFilmTitle}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-black/60 backdrop-blur-sm border border-white/20">
                          Click to Expand ⤢
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                      Scan film not attached yet. Complete verification below to attach film.
                    </div>
                  )}
                </div>

                {/* Radiologist / Pathologist Findings & Impression */}
                {selectedOrder.radiologistImpression && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block">
                      Radiologist / Clinical Impression
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                      {selectedOrder.radiologistImpression}
                    </p>
                    {selectedOrder.technologistRemarks && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        Technician Remarks: {selectedOrder.technologistRemarks}
                      </p>
                    )}
                    {selectedOrder.verifiedBy && (
                      <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Electronically Verified by: <strong className="text-slate-700 dark:text-slate-300">{selectedOrder.verifiedBy}</strong></span>
                        <span>{selectedOrder.verifiedAt}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Measured Results Table */}
                {(selectedOrder.results?.length || 0) > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Measured Parameters & Biomarkers
                    </h3>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 text-[10px] uppercase font-bold">
                          <tr>
                            <th className="p-2.5">Parameter</th>
                            <th className="p-2.5">Value</th>
                            <th className="p-2.5">Biological Ref.</th>
                            <th className="p-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {selectedOrder.results?.map((res, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                              <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">{res.parameter}</td>
                              <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                                {res.value} {res.unit || ''}
                              </td>
                              <td className="p-2.5 text-slate-500">{res.refRange || 'N/A'}</td>
                              <td className="p-2.5">
                                <span
                                  className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                    res.flag === 'CRITICAL'
                                      ? 'bg-rose-100 text-rose-800 animate-pulse'
                                      : res.flag === 'ABNORMAL'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {res.flag}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* ASSOCIATED LAB MEDICINES SECTION (USER REQUIREMENT) */}
                {/* ========================================================================= */}
                {(selectedOrder.associatedPrescriptions?.length || 0) > 0 && (
                  <div className="p-4 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-purple-900 dark:text-purple-200 flex items-center gap-1.5 uppercase">
                        <Pill className="w-4 h-4 text-purple-600" />
                        <span>Doctor-Prescribed Lab Medicines</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-200">
                        Post-Investigation Rx
                      </span>
                    </div>
                    <div className="space-y-2">
                      {selectedOrder.associatedPrescriptions?.map((rx, idx) => (
                        <div
                          key={idx}
                          className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-purple-100 dark:border-purple-900/60 text-xs flex items-start justify-between gap-2"
                        >
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-slate-100 block">
                              {rx.medicineName}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              Dosage: {rx.dosage} • Course: {rx.duration}
                            </span>
                            <span className="text-[10px] text-purple-700 dark:text-purple-400 block mt-0.5 font-medium">
                              Instructions: {rx.instructions}
                            </span>
                          </div>
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                            Medicine Not Bought
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technician Action Buttons */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-medium text-slate-400">
                    Technician Workstation Actions
                  </span>
                  <button
                    onClick={() => {
                      setEntryImpression(selectedOrder.radiologistImpression || '');
                      setEntryRemarks(selectedOrder.technologistRemarks || '');
                      setShowResultEntryForm(true);
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                  >
                    Edit / Attach Scan Film & Sign Off
                  </button>
                </div>

                {/* Technician Edit / Result Entry Drawer */}
                {showResultEntryForm && (
                  <div className="p-4 bg-teal-50/50 dark:bg-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-800 space-y-3">
                    <h4 className="text-xs font-black text-teal-950 dark:text-teal-200 uppercase">
                      Technician & Radiologist Result Verification Form
                    </h4>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                          Select Scan Film / Report Image Preset
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(DIAGNOSTIC_PRESET_IMAGES[selectedOrder.department] || []).map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setEntrySelectedImageIndex(idx)}
                              className={`p-2 rounded-xl text-left border text-[11px] font-bold transition flex items-center gap-2 ${
                                entrySelectedImageIndex === idx
                                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <Scan className="w-4 h-4 shrink-0" />
                              <span className="truncate">{preset.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                          Clinical Findings & Impression
                        </label>
                        <textarea
                          rows={3}
                          value={entryImpression}
                          onChange={(e) => setEntryImpression(e.target.value)}
                          placeholder="Enter diagnostic report impressions..."
                          className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                          Technician Remarks / Instrument Protocol
                        </label>
                        <input
                          type="text"
                          value={entryRemarks}
                          onChange={(e) => setEntryRemarks(e.target.value)}
                          placeholder="e.g. Siemens Multix Impact DR / GE CT Scanner..."
                          className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowResultEntryForm(false)}
                          className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveTechnicianResults}
                          className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold rounded-xl shadow transition"
                        >
                          Save & Verify Report
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-xs text-slate-400 font-medium">
                Select an order from the queue to view full diagnostic film and report.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: DOCTOR ORDER LAB / SCAN (DEPARTMENT SPECIFIC ROUTING) */}
      {/* ========================================================================= */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Doctor Order: Laboratory & Radiology Scan
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select department to strictly route to that specific lab/radiology team
                </p>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDiagnosticOrder} className="space-y-4 text-xs font-semibold">
              {/* Department Selector */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">
                  1. Select Target Lab / Imaging Department (Routing Target)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DIAGNOSTIC_DEPARTMENTS.filter((d) => d.id !== 'ALL').map((dept) => (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => {
                        setNewOrderDept(dept.id);
                        if (dept.id === 'XRAY') setNewOrderTestName('Digital Chest X-Ray (PA View)');
                        else if (dept.id === 'PATHOLOGY') setNewOrderTestName('Complete Blood Count (CBC) & Lipid Profile');
                        else if (dept.id === 'CT') setNewOrderTestName('High-Resolution CT Chest (HRCT)');
                        else if (dept.id === 'MRI') setNewOrderTestName('MRI Brain 3.0T with Contrast');
                        else if (dept.id === 'USG') setNewOrderTestName('Whole Abdomen Ultrasound (USG)');
                        else if (dept.id === 'CARDIOLOGY') setNewOrderTestName('12-Lead ECG & 2D Echocardiography');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                        newOrderDept === dept.id
                          ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 font-black text-teal-900 dark:text-teal-200'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <dept.icon className="w-4 h-4 shrink-0 text-teal-600" />
                      <span className="truncate text-[11px]">{dept.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Name */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">
                  2. Specific Test / Investigation Name
                </label>
                <input
                  type="text"
                  required
                  value={newOrderTestName}
                  onChange={(e) => setNewOrderTestName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  placeholder="e.g. Digital Chest X-Ray (PA View), CBC with ESR..."
                />
              </div>

              {/* Patient Name & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Patient Name</label>
                  <input
                    type="text"
                    required
                    value={newOrderPatientName}
                    onChange={(e) => setNewOrderPatientName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Clinical Priority</label>
                  <select
                    value={newOrderPriority}
                    onChange={(e) => setNewOrderPriority(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  >
                    <option value="ROUTINE">ROUTINE - Standard</option>
                    <option value="URGENT">URGENT - Within 2 Hours</option>
                    <option value="STAT">STAT - Emergency Immediate</option>
                  </select>
                </div>
              </div>

              {/* Clinical Notes */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">
                  Clinical Indication / Symptoms
                </label>
                <textarea
                  rows={2}
                  value={newOrderNotes}
                  onChange={(e) => setNewOrderNotes(e.target.value)}
                  placeholder="e.g. Chest discomfort, recurrent fever, preoperative clearance..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md transition"
                >
                  Dispatch to {newOrderDept} Desk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PRESCRIBE LAB MEDICINE (USER REQUIREMENT) */}
      {/* ========================================================================= */}
      {showPrescribeMedicineModal && selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                  <Pill className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                    Prescribe Medicine for this Lab Report
                  </h3>
                  <p className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold">
                    Linked to: {selectedOrder.testName} (#{selectedOrder.orderNumber})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPrescribeMedicineModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePrescribeLabMedicine} className="space-y-3.5 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">
                  Medicine / Drug Name
                </label>
                <input
                  type="text"
                  required
                  value={rxDrugName}
                  onChange={(e) => setRxDrugName(e.target.value)}
                  placeholder="e.g. Azithromycin 500mg, Atorva 20, Pan 40..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={rxDosage}
                    onChange={(e) => setRxDosage(e.target.value)}
                    placeholder="e.g. 1 Tablet / 500mg"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
                  <input
                    type="text"
                    value={rxFrequency}
                    onChange={(e) => setRxFrequency(e.target.value)}
                    placeholder="e.g. Once daily (1-0-0) / Twice daily"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Duration / Course</label>
                  <input
                    type="text"
                    value={rxDuration}
                    onChange={(e) => setRxDuration(e.target.value)}
                    placeholder="e.g. 5 Days / 14 Days"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Food Timing</label>
                  <select
                    value={rxFoodTiming}
                    onChange={(e) => setRxFoodTiming(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  >
                    <option value="AFTER_FOOD">After Food (खाने के बाद)</option>
                    <option value="BEFORE_FOOD">Before Food (खाने से पहले / खाली पेट)</option>
                    <option value="WITH_FOOD">With Food</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">
                  Doctor Instructions for Patient
                </label>
                <input
                  type="text"
                  value={rxInstructions}
                  onChange={(e) => setRxInstructions(e.target.value)}
                  placeholder="e.g. Take with warm water, avoid dairy for 1 hr..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 text-[11px] text-purple-900 dark:text-purple-200">
                ⚡ <strong>Platform Sync Note:</strong> Yeh medicine patient ke prescription me{' '}
                <strong>[🧪 Lab Medicine]</strong> ke name se add hogi aur Pharmacy queue me{' '}
                <strong>[⚠️ Medicine Not Bought]</strong> tag ke sath jayegi.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPrescribeMedicineModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl shadow-md transition"
                >
                  Save Lab Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: SCAN FILM / IMAGE ZOOM LIGHTBOX */}
      {/* ========================================================================= */}
      {showImageZoomModal && zoomedImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-slate-950 border border-slate-800 rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between text-white border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                Full-Screen Diagnostic Scan Film
              </span>
              <button
                onClick={() => setShowImageZoomModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2"
              >
                ✕ Close
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center max-h-[75vh]">
              <img
                src={zoomedImage.src}
                alt={zoomedImage.title}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-slate-200">{zoomedImage.title}</span>
              <button
                onClick={() => window.print()}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold"
              >
                Print Film
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: FULL PRINTABLE CLINICAL REPORT */}
      {/* ========================================================================= */}
      {showReportModal && selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  APOLLO MEDINEXA CENTRAL DIAGNOSTICS
                </h3>
                <p className="text-[10px] text-teal-600 font-bold">
                  NABL ACCREDITED & ISO 15189:2022 CERTIFIED LABORATORY & PACS
                </p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div>
                <p><strong>Order Number:</strong> {selectedOrder.orderNumber}</p>
                <p><strong>Patient Name:</strong> {selectedOrder.patientName} ({selectedOrder.mrn})</p>
                <p><strong>Department:</strong> {selectedOrder.department}</p>
              </div>
              <div>
                <p><strong>Ordering Doctor:</strong> {selectedOrder.doctorName}</p>
                <p><strong>Date & Time:</strong> {selectedOrder.orderedAt}</p>
                <p><strong>Status:</strong> {selectedOrder.status}</p>
              </div>
            </div>

            {selectedOrder.scanFilmImage && (
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-black">
                <img
                  src={selectedOrder.scanFilmImage}
                  alt="Scan Film"
                  className="w-full h-44 object-cover"
                />
              </div>
            )}

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block uppercase text-[10px]">
                Clinical Findings & Impression
              </span>
              <p className="text-slate-700 dark:text-slate-300">
                {selectedOrder.radiologistImpression}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400">
                Verified by: {selectedOrder.verifiedBy || 'Chief Radiologist / Pathologist'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 text-white font-extrabold rounded-xl"
                >
                  Print Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
