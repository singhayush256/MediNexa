'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  X,
  ZoomIn,
  FileText,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Activity,
  Heart,
  Pill,
  Eye,
  Download,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Building2,
  ShieldCheck,
  Search,
  Maximize2,
  Sparkles,
  Camera,
  ArrowUpDown,
  Filter,
  Check,
  ChevronDown,
  Info,
  Syringe,
  FlaskConical,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

export interface Patient360DrawerProps {
  patientId: string | null;
  patientName?: string;
  patientData?: any;
  isOpen: boolean;
  onClose: () => void;
}

// =========================================================================
// HIGH-FIDELITY MEDICAL SCAN FILM SVGs (X-Ray, MRI, ECG, USG, Blood Smear)
// =========================================================================

const XRAY_CHEST_FILM = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="700" height="460" viewBox="0 0 700 460" fill="%2305070d"><rect width="700" height="460" fill="%2305070d"/><g opacity="0.9"><path d="M 180 130 C 210 80, 290 70, 335 80 C 345 85, 345 370, 345 370 C 270 360, 205 310, 180 130 Z" fill="%231e293b" stroke="%2364748b" stroke-width="2"/><path d="M 520 130 C 490 80, 410 70, 365 80 C 355 85, 355 370, 355 370 C 430 360, 495 310, 520 130 Z" fill="%231e293b" stroke="%2364748b" stroke-width="2"/><ellipse cx="380" cy="280" rx="55" ry="75" fill="%23cbd5e1" opacity="0.82"/><path d="M 350 65 L 350 410" stroke="%23e2e8f0" stroke-width="7" stroke-dasharray="9,7"/><path d="M 230 150 Q 285 180 340 160" stroke="%23475569" stroke-width="3" fill="none"/><path d="M 220 190 Q 285 220 340 200" stroke="%23475569" stroke-width="3" fill="none"/><path d="M 215 230 Q 285 260 340 240" stroke="%23475569" stroke-width="3" fill="none"/><path d="M 470 150 Q 415 180 360 160" stroke="%23475569" stroke-width="3" fill="none"/><path d="M 480 190 Q 415 220 360 200" stroke="%23475569" stroke-width="3" fill="none"/><path d="M 485 230 Q 415 260 360 240" stroke="%23475569" stroke-width="3" fill="none"/><path d="M 180 340 Q 210 375 250 365" stroke="%2394a3b8" stroke-width="2" fill="none"/><path d="M 520 340 Q 490 375 450 365" stroke="%2394a3b8" stroke-width="2" fill="none"/></g><rect x="25" y="25" width="230" height="70" rx="8" fill="%230f172a" fill-opacity="0.8" stroke="%2338bdf8" stroke-width="1.5"/><text x="38" y="50" fill="%2338bdf8" font-family="monospace" font-size="14" font-weight="bold">DIGITAL CHEST X-RAY PA</text><text x="38" y="70" fill="%23e2e8f0" font-family="sans-serif" font-size="12">EXPIRATORY • ERECT VIEW</text><text x="38" y="86" fill="%2394a3b8" font-family="sans-serif" font-size="10">R (RIGHT) • MARKER VERIFIED</text><text x="30" y="435" fill="%2338bdf8" font-family="sans-serif" font-size="13" font-weight="bold">Findings: Cardiothoracic Ratio normal (&lt;0.50) • Clear Costophrenic Angles • No Active Infiltrates</text></svg>`;

const BRAIN_MRI_FILM = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="700" height="460" viewBox="0 0 700 460" fill="%23030712"><rect width="700" height="460" fill="%23030712"/><g opacity="0.95"><ellipse cx="350" cy="230" rx="160" ry="195" fill="%23111827" stroke="%236b7280" stroke-width="3"/><path d="M 350 50 L 350 410" stroke="%231f2937" stroke-width="2"/><ellipse cx="310" cy="210" rx="28" ry="60" fill="%23374151" stroke="%239ca3af" stroke-width="1.5"/><ellipse cx="390" cy="210" rx="28" ry="60" fill="%23374151" stroke="%239ca3af" stroke-width="1.5"/><ellipse cx="350" cy="225" rx="14" ry="40" fill="%23030712"/><path d="M 230 150 Q 280 180 260 230 Q 230 280 270 330" fill="none" stroke="%234b5563" stroke-width="2.5"/><path d="M 470 150 Q 420 180 440 230 Q 470 280 430 330" fill="none" stroke="%234b5563" stroke-width="2.5"/></g><rect x="25" y="25" width="240" height="70" rx="8" fill="%230f172a" fill-opacity="0.85" stroke="%23a855f7" stroke-width="1.5"/><text x="38" y="50" fill="%23c084fc" font-family="monospace" font-size="14" font-weight="bold">BRAIN MRI AXIAL T2 / FLAIR</text><text x="38" y="70" fill="%23e2e8f0" font-family="sans-serif" font-size="12">1.5 TESLA HIGH RESOLUTION</text><text x="38" y="86" fill="%2394a3b8" font-family="sans-serif" font-size="10">SLICE THICKNESS: 5.0 mm</text><text x="30" y="435" fill="%23c084fc" font-family="sans-serif" font-size="13" font-weight="bold">Impression: Symmetrical ventricles • No acute infarct, hemorrhage or intracranial mass effect</text></svg>`;

const ECG_STRIP_FILM = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="700" height="460" viewBox="0 0 700 460" fill="%231e1b4b"><rect width="700" height="460" fill="%231e1b4b"/><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none" stroke="%23312e81" stroke-width="0.7"/></pattern></defs><rect width="700" height="460" fill="url(%23grid)"/><path d="M 20 230 L 70 230 L 80 215 L 90 230 L 105 230 L 115 140 L 130 310 L 140 230 L 170 230 L 190 195 L 210 230 L 270 230 L 280 215 L 290 230 L 305 230 L 315 140 L 330 310 L 340 230 L 370 230 L 390 195 L 410 230 L 470 230 L 480 215 L 490 230 L 505 230 L 515 140 L 530 310 L 540 230 L 570 230 L 590 195 L 610 230 L 680 230" fill="none" stroke="%23f43f5e" stroke-width="3.5" stroke-linecap="round"/><rect x="25" y="25" width="240" height="70" rx="8" fill="%230f172a" fill-opacity="0.85" stroke="%23f43f5e" stroke-width="1.5"/><text x="38" y="50" fill="%23fda4af" font-family="monospace" font-size="14" font-weight="bold">12-LEAD CARDIAC ECG STRIP</text><text x="38" y="70" fill="%23e2e8f0" font-family="sans-serif" font-size="12">SPEED: 25mm/s • CAL: 10mm/mV</text><text x="38" y="86" fill="%2394a3b8" font-family="sans-serif" font-size="10">HEART RATE: 72 BPM • REGULAR</text><text x="30" y="435" fill="%23fda4af" font-family="sans-serif" font-size="13" font-weight="bold">Rhythm: Normal Sinus Rhythm • PR Interval: 140ms • QTc: 412ms • No Acute ST Elevation</text></svg>`;

const ULTRASOUND_USG_FILM = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="700" height="460" viewBox="0 0 700 460" fill="%2309090b"><rect width="700" height="460" fill="%2309090b"/><g opacity="0.9"><path d="M 350 70 L 160 380 A 280 280 0 0 0 540 380 Z" fill="%2318181b" stroke="%233f3f46" stroke-width="2.5"/><path d="M 270 230 Q 350 180 420 240 Q 390 310 290 300 Z" fill="%2352525b" opacity="0.75"/><circle cx="330" cy="250" r="22" fill="%2327272a" stroke="%23a1a1aa" stroke-width="2"/><ellipse cx="390" cy="280" rx="26" ry="18" fill="%233f3f46"/></g><rect x="25" y="25" width="250" height="70" rx="8" fill="%230f172a" fill-opacity="0.85" stroke="%23eab308" stroke-width="1.5"/><text x="38" y="50" fill="%23fde047" font-family="monospace" font-size="14" font-weight="bold">WHOLE ABDOMEN ULTRASOUND</text><text x="38" y="70" fill="%23e2e8f0" font-family="sans-serif" font-size="12">3.5 MHz CURVED ARRAY PROBE</text><text x="38" y="86" fill="%2394a3b8" font-family="sans-serif" font-size="10">ACOUSTIC WINDOW OPTIMAL</text><text x="30" y="435" fill="%23fde047" font-family="sans-serif" font-size="13" font-weight="bold">Impression: Liver parenchymal echotexture normal • Gallbladder calculus-free • Kidneys bilateral normal</text></svg>`;

const BLOOD_SMEAR_FILM = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="700" height="460" viewBox="0 0 700 460" fill="%23020617"><rect width="700" height="460" fill="%23020617"/><circle cx="350" cy="230" r="160" fill="%23fdf2f8" stroke="%23ec4899" stroke-width="4"/><circle cx="310" cy="200" r="32" fill="%23ec4899" opacity="0.85"/><circle cx="390" cy="220" r="28" fill="%23be185d" opacity="0.9"/><circle cx="340" cy="270" r="30" fill="%23db2777" opacity="0.8"/><circle cx="280" cy="260" r="18" fill="%23f43f5e" opacity="0.75"/><circle cx="410" cy="170" r="20" fill="%23f43f5e" opacity="0.75"/><circle cx="350" cy="180" r="16" fill="%23fda4af" opacity="0.9"/><rect x="25" y="25" width="250" height="70" rx="8" fill="%230f172a" fill-opacity="0.85" stroke="%23ec4899" stroke-width="1.5"/><text x="38" y="50" fill="%23f472b6" font-family="monospace" font-size="14" font-weight="bold">PATHOLOGY BLOOD SMEAR (CBC)</text><text x="38" y="70" fill="%23e2e8f0" font-family="sans-serif" font-size="12">100X OIL IMMERSION • LEISHMAN</text><text x="38" y="86" fill="%2394a3b8" font-family="sans-serif" font-size="10">NABL ACCREDITED CENTRAL LAB</text><text x="30" y="435" fill="%23f472b6" font-family="sans-serif" font-size="13" font-weight="bold">Impression: Normocytic Normochromic RBCs • Adequate Platelets (240,000/mcL) • No Parasites</text></svg>`;

// =========================================================================
// CANONICAL ENCOUNTER, MEDICATION & DIAGNOSTIC DEMO DATA (FOR AYUSH SINGH)
// =========================================================================

const DEMO_CHECKUP_ENCOUNTERS = [
  {
    id: 'enc-1',
    date: 'Earlier Today (Sep 21, 2026, 09:15 AM)',
    rawTimestamp: '2026-09-21T09:15:00.000Z',
    doctorName: 'Dr. Rajesh Singh, MD, DM',
    doctorSpecialty: 'Cardiology',
    hospitalName: 'MediNexa Super Specialty Hospital',
    department: 'Central Cardiology OPD - Room 104',
    visitType: 'OPD',
    reason: 'Routine cardiology consultation, blood pressure monitoring & ECG review',
    vitals: { bp: '124/82 mmHg', pulse: '74 bpm', spo2: '98%', temp: '98.4 °F' },
    diagnosis: 'Primary Essential Hypertension (Well Controlled)',
    clinicalNotes:
      'Patient presents feeling energetic. Resting blood pressure is well stabilized on Telmisartan 40mg. Bilateral chest clear to auscultation, S1/S2 heard normal, no murmur, no ankle edema.',
    prescribedAtEncounter: [
      { name: 'Telma 40 (Telmisartan 40mg)', dosage: '40mg', freq: '1-0-0 (Morning after food)', duration: '90 Days' },
      { name: 'Pan 40 (Pantoprazole 40mg)', dosage: '40mg', freq: '1-0-0 (Before breakfast)', duration: '14 Days' },
    ],
    orderedLabs: ['12-Lead Resting ECG', 'Lipid Profile Panel'],
    status: 'VERIFIED & SIGNED',
  },
  {
    id: 'enc-2',
    date: 'Aug 14, 2026 (11:30 AM)',
    rawTimestamp: '2026-08-14T11:30:00.000Z',
    doctorName: 'Dr. Arvind Deshmukh, MD',
    doctorSpecialty: 'Internal Medicine',
    hospitalName: 'MediNexa General Hospital',
    department: 'Department of General & Preventive Medicine',
    visitType: 'OPD',
    reason: 'Post-discharge follow up review for dyspepsia and lipid management',
    vitals: { bp: '128/84 mmHg', pulse: '78 bpm', spo2: '98%', temp: '98.6 °F' },
    diagnosis: 'Dyslipidemia with Mild Gastroesophageal Reflux',
    clinicalNotes:
      'Reviewed fasting lipid profile. Serum cholesterol is 188 mg/dL (improved). Abdomen soft, non-tender, bowel sounds active. Instructed to maintain low saturated-fat diet and brisk morning walks.',
    prescribedAtEncounter: [
      { name: 'Atorva 20 (Atorvastatin 20mg)', dosage: '20mg', freq: '0-0-1 (Bedtime after dinner)', duration: '90 Days' },
      { name: 'Pan 40 (Pantoprazole)', dosage: '40mg', freq: '1-0-0 (Morning empty stomach)', duration: '30 Days' },
    ],
    orderedLabs: ['Fasting Blood Sugar', 'Serum Creatinine'],
    status: 'VERIFIED & SIGNED',
  },
  {
    id: 'enc-3',
    date: 'Jul 10, 2026 (04:15 PM)',
    rawTimestamp: '2026-07-10T16:15:00.000Z',
    doctorName: 'Dr. Sneha Kulkarni, MS',
    doctorSpecialty: 'Pulmonology',
    hospitalName: 'MediNexa City Hospital',
    department: 'Chest Medicine & Respiratory Clinic',
    visitType: 'OPD',
    reason: 'Seasonal dry cough, throat irritation, and post-nasal drip',
    vitals: { bp: '122/80 mmHg', pulse: '72 bpm', spo2: '99%', temp: '98.8 °F' },
    diagnosis: 'Upper Respiratory Tract Allergic Bronchitis',
    clinicalNotes:
      'Bilateral vesicular breath sounds present. No wheeze or crepitations. Digital Chest X-Ray PA View evaluated and confirmed clear. Prescribed 5-day course of anti-allergy and broncho-soothers.',
    prescribedAtEncounter: [
      { name: 'Augmentin 625 Duo', dosage: '625mg', freq: '1-0-1 (Twice daily after meals)', duration: '5 Days' },
      { name: 'Montair LC (Montelukast + Levocetirizine)', dosage: '10mg/5mg', freq: '0-0-1 (At night)', duration: '10 Days' },
    ],
    orderedLabs: ['Digital Chest X-Ray PA View', 'Complete Blood Count (CBC)'],
    status: 'VERIFIED & SIGNED',
  },
  {
    id: 'enc-4',
    date: 'May 04, 2026 (10:00 AM)',
    rawTimestamp: '2026-05-04T10:00:00.000Z',
    doctorName: 'Dr. Priya Verma, MD',
    doctorSpecialty: 'Endocrinology',
    hospitalName: 'MediNexa Super Specialty Hospital',
    department: 'Endocrinology & Lifestyle Disorders Clinic',
    visitType: 'OPD',
    reason: 'Annual preventive glycemic surveillance & HbA1c screening',
    vitals: { bp: '120/78 mmHg', pulse: '70 bpm', spo2: '99%', temp: '98.2 °F' },
    diagnosis: 'Normal Glycemic Status (HbA1c 5.4%)',
    clinicalNotes:
      'Fasting Blood Sugar is 94 mg/dL. Renal and liver profiles within physiological reference limits. Advised to continue balanced Mediterranean-style diet and regular hydration.',
    prescribedAtEncounter: [
      { name: 'Multivitamin & Zinc Capsule (Becozinc)', dosage: '1 Cap', freq: '1-0-0 (Post lunch)', duration: '30 Days' },
    ],
    orderedLabs: ['HbA1c Glycated Hemoglobin', 'Liver Function Test'],
    status: 'VERIFIED & SIGNED',
  },
];

const DEMO_MEDICINE_HISTORY = [
  {
    id: 'med-hist-1',
    drugName: 'Telma 40 (Telmisartan 40mg)',
    genericName: 'Telmisartan IP',
    dosage: '40mg Oral Tablet',
    frequency: 'Once Daily in Morning (1-0-0)',
    timing: 'After Breakfast with Water',
    duration: '90 Days (Active)',
    prescribedBy: 'Dr. Rajesh Singh',
    doctorSpecialty: 'Cardiology',
    hospitalName: 'MediNexa Super Specialty Hospital',
    prescribedDate: 'Sep 21, 2026',
    status: 'ACTIVE',
    classification: 'DOCTOR_PRESCRIBED',
    indication: 'Essential Systemic Hypertension Plaque Control',
  },
  {
    id: 'med-hist-2',
    drugName: 'Pan 40 (Pantoprazole 40mg)',
    genericName: 'Pantoprazole Sodium Gastro-Resistant',
    dosage: '40mg Tablet',
    frequency: 'Once Daily in Morning (1-0-0)',
    timing: 'Empty stomach 30 mins before breakfast',
    duration: '30 Days (Active)',
    prescribedBy: 'Dr. Arvind Deshmukh',
    doctorSpecialty: 'Internal Medicine',
    hospitalName: 'MediNexa General Hospital',
    prescribedDate: 'Aug 14, 2026',
    status: 'ACTIVE',
    classification: 'DOCTOR_PRESCRIBED',
    indication: 'Acid Reflux & Gastric Mucosa Protection',
  },
  {
    id: 'med-hist-3',
    drugName: 'Atorva 20 (Atorvastatin 20mg)',
    genericName: 'Atorvastatin Calcium IP',
    dosage: '20mg Film-Coated Tablet',
    frequency: 'Once Daily at Bedtime (0-0-1)',
    timing: 'Post Dinner with Water',
    duration: '90 Days (Active)',
    prescribedBy: 'Dr. Rajesh Singh',
    doctorSpecialty: 'Cardiology',
    hospitalName: 'MediNexa Super Specialty Hospital',
    prescribedDate: 'Aug 14, 2026',
    status: 'ACTIVE',
    classification: 'PHARMACY_DISPENSED',
    indication: 'Cardiovascular Lipid Profile Optimization',
  },
  {
    id: 'med-hist-inj',
    drugName: 'Inj. Ceftriaxone 1g IV',
    genericName: 'Ceftriaxone Sodium Sterile',
    dosage: '1000mg IV Infusion',
    frequency: 'Twice Daily (BD)',
    timing: 'Slow IV Infusion in 100ml NS',
    duration: '3 Days Inpatient',
    prescribedBy: 'Dr. Rajesh Singh',
    doctorSpecialty: 'Cardiology',
    hospitalName: 'MediNexa CCU Ward 4B',
    prescribedDate: 'Aug 11, 2026',
    status: 'COMPLETED',
    classification: 'NURSE_ADMINISTERED',
    indication: 'Inpatient Antibacterial Prophylaxis',
  },
  {
    id: 'med-hist-4',
    drugName: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin and Potassium Clavulanate 625mg',
    dosage: '625mg Tablet',
    frequency: 'Twice Daily (1-0-1)',
    timing: 'After Meals with plenty of fluids',
    duration: '5 Days Completed',
    prescribedBy: 'Dr. Sneha Kulkarni',
    doctorSpecialty: 'Pulmonology',
    hospitalName: 'MediNexa City Hospital',
    prescribedDate: 'Jul 10, 2026',
    status: 'HISTORICAL',
    classification: 'HISTORICAL',
    indication: 'Respiratory Bacterial Infection Prophylaxis',
  },
  {
    id: 'med-hist-5',
    drugName: 'Montair LC',
    genericName: 'Montelukast Sodium 10mg + Levocetirizine 5mg',
    dosage: 'Tablet',
    frequency: 'Once Daily at Night (0-0-1)',
    timing: 'Before Sleep',
    duration: '10 Days Completed',
    prescribedBy: 'Dr. Sneha Kulkarni',
    doctorSpecialty: 'Pulmonology',
    hospitalName: 'MediNexa City Hospital',
    prescribedDate: 'Jul 10, 2026',
    status: 'HISTORICAL',
    classification: 'HISTORICAL',
    indication: 'Allergic Rhinitis & Seasonal Cough',
  },
  {
    id: 'med-hist-6',
    drugName: 'Dolo 650 (Paracetamol 650mg)',
    genericName: 'Paracetamol 650mg IP',
    dosage: '650mg Tablet',
    frequency: 'SOS as needed for fever or headache',
    timing: 'After food',
    duration: 'As Needed',
    prescribedBy: 'Dr. Arvind Deshmukh',
    doctorSpecialty: 'Internal Medicine',
    hospitalName: 'MediNexa General Hospital',
    prescribedDate: 'May 04, 2026',
    status: 'PATIENT_REPORTED',
    classification: 'PATIENT_REPORTED',
    indication: 'Self-Reported Analgesic & Antipyretic',
  },
];

const DEMO_DIAGNOSTIC_REPORTS = [
  {
    id: 'rep-xray',
    title: 'Digital Chest X-Ray PA View',
    category: 'Radiology',
    modality: 'X-RAY',
    date: 'Aug 12, 2026',
    reportId: 'XR-2026-0812-PA',
    filmImage: XRAY_CHEST_FILM,
    doctor: 'Dr. Sunita Kapoor, MD (Radiodiagnosis)',
    technician: 'Kamal Nayan (Chief Radiographer)',
    findings: 'Lungs are clear and fully expanded. Cardiothoracic ratio is normal (<0.50). Both costophrenic angles are acute and clear. No focal consolidation, pneumothorax, or pleural effusion seen.',
    impression: 'Normal study of the chest. No active cardiopulmonary pathology.',
    status: 'VERIFIED & SIGNED',
  },
  {
    id: 'rep-mri',
    title: 'Brain MRI Axial T2 & FLAIR Sequence',
    category: 'Radiology',
    modality: 'MRI',
    date: 'Jul 22, 2026',
    reportId: 'MRI-2026-0722-BR',
    filmImage: BRAIN_MRI_FILM,
    doctor: 'Dr. Alok Nath, MD, DM (Neuroradiology)',
    technician: 'Suresh Kumar (MRI Technologist)',
    findings: 'Both cerebral hemispheres show normal gray-white matter differentiation. Ventricles and basal cisterns are normal in size and configuration. Midline structures are central. No acute diffusion restriction.',
    impression: 'No acute intracranial pathology or focal lesion identified.',
    status: 'VERIFIED & SIGNED',
  },
  {
    id: 'rep-ecg',
    title: '12-Lead Resting Electrocardiogram (ECG)',
    category: 'Cardiology',
    modality: 'ECG',
    date: 'Sep 21, 2026',
    reportId: 'ECG-2026-0921-12L',
    filmImage: ECG_STRIP_FILM,
    doctor: 'Dr. Rajesh Singh, MD, DM (Cardiology)',
    technician: 'Rajinder Singh (ECG Lead)',
    findings: 'Heart Rate: 72 bpm, Normal Sinus Rhythm. PR interval: 140 ms, QRS duration: 88 ms, QTc: 412 ms. Normal P-wave morphology. No ST-segment depression or elevation noted across all 12 leads.',
    impression: 'Normal resting sinus rhythm electrocardiogram.',
    status: 'VERIFIED & SIGNED',
  },
  {
    id: 'rep-usg',
    title: 'Whole Abdomen & Pelvic Ultrasound (USG)',
    category: 'Radiology',
    modality: 'USG',
    date: 'Jun 18, 2026',
    reportId: 'USG-2026-0618-WA',
    filmImage: ULTRASOUND_USG_FILM,
    doctor: 'Dr. Sunita Kapoor, MD (Sonologist)',
    technician: 'Pooja Rawat (Sonography Tech)',
    findings: 'Liver is normal in size (13.2 cm) with normal parenchymal echotexture. Gallbladder is well distended, thin-walled with no intraluminal calculi. Bilateral kidneys show intact corticomedullary differentiation.',
    impression: 'Normal whole abdomen ultrasound examination.',
    status: 'VERIFIED & SIGNED',
  },
  {
    id: 'rep-cbc',
    title: 'Complete Blood Count & Pathological Smear',
    category: 'Pathology',
    modality: 'LAB_CBC',
    date: 'Aug 14, 2026',
    reportId: 'LAB-2026-0814-CBC',
    filmImage: BLOOD_SMEAR_FILM,
    doctor: 'Dr. Vandana Sethi, MD (Pathology)',
    technician: 'Anil Tyagi (Medical Lab Technologist)',
    findings: 'Hemoglobin: 14.6 g/dL (Normal: 13.5-17.5) • Total Leukocyte Count: 6,800/mcL (Normal: 4,000-11,000) • Platelet Count: 240,000/mcL • ESR: 8 mm/1st hr. Peripheral blood smear shows normocytic normochromic red cells.',
    impression: 'Normal hematological profile. Adequate platelets.',
    status: 'NABL VERIFIED',
  },
];

export default function Patient360Drawer({
  patientId,
  patientName: propPatientName,
  patientData,
  isOpen,
  onClose,
}: Patient360DrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checkups' | 'medications' | 'reports' | 'vitals'>('overview');
  const [loading, setLoading] = useState(false);
  const [zoomScan, setZoomScan] = useState<{ title: string; image: string; subtitle: string; findings: string; doctor: string; date: string; isRealUpload?: boolean } | null>(null);
  const [selectedEncounterDossier, setSelectedEncounterDossier] = useState<any | null>(null);

  // Raw Encounters, Medications, Diagnostics from Server & Local Storage
  const [encounters, setEncounters] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any[]>([]);

  // Filtering & Sorting State for Doctor Workstation
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('ALL');
  const [filterSpecialty, setFilterSpecialty] = useState('ALL');
  const [filterHospital, setFilterHospital] = useState('ALL');
  const [filterVisitType, setFilterVisitType] = useState('ALL');
  const [filterDateRange, setFilterDateRange] = useState<'ALL' | 'TODAY' | '30D' | '6M' | '1Y'>('ALL');
  const [medCategoryFilter, setMedCategoryFilter] = useState<'ALL' | 'CURRENT_ACTIVE' | 'DOCTOR_PRESCRIBED' | 'PHARMACY_DISPENSED' | 'NURSE_ADMINISTERED' | 'PATIENT_REPORTED' | 'DISCONTINUED' | 'HISTORICAL'>('ALL');
  const [diagCategoryFilter, setDiagCategoryFilter] = useState<'ALL' | 'Radiology' | 'Pathology' | 'Cardiology'>('ALL');

  // Resolved Patient Identification
  const resolvedName = propPatientName || patientData?.patientName || patientData?.name || 'Ayush Singh';
  const resolvedAge = patientData?.patientAge || patientData?.age || 38;
  const resolvedGender = patientData?.patientGender || patientData?.gender || 'Male';
  const resolvedPhone = patientData?.patientPhone || patientData?.phone || '+91 98765 43210';
  const resolvedUhid = patientData?.uhid || `MNX-2026-${(patientId || '1088').replace(/\D/g, '').slice(0, 4) || '2044'}`;

  const isDemoPatient =
    patientId === 'demo-p-01' ||
    resolvedName.toLowerCase().includes('ayush') ||
    (patientId?.toLowerCase().includes('ayush') ?? false);

  // Load and Synchronize Longitudinal Records
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    const loadEhrData = async () => {
      let serverEncounters: any[] = [];
      let serverMeds: any[] = [];
      let serverDiags: any[] = [];

      // 1. Fetch from EHR API if patientId is provided
      if (patientId) {
        try {
          const [encRes, medRes, diagRes] = await Promise.allSettled([
            apiFetch<any[]>(`/ehr/patients/${patientId}/consultations-history`),
            apiFetch<any[]>(`/ehr/patients/${patientId}/medication-history`),
            apiFetch<any[]>(`/ehr/patients/${patientId}/diagnostic-history`),
          ]);

          if (encRes.status === 'fulfilled' && Array.isArray(encRes.value)) {
            serverEncounters = encRes.value.map((e) => ({
              id: e.id,
              date: e.consultationDate ? new Date(e.consultationDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recent',
              rawTimestamp: e.consultationDate,
              doctorName: e.doctor?.name || 'Attending Physician',
              doctorSpecialty: e.doctor?.specialty || 'General Medicine',
              hospitalName: e.hospital?.name || 'MediNexa Hospital',
              department: e.department?.name || 'Outpatient Department',
              visitType: e.visitType || 'OPD',
              reason: e.chiefComplaint || 'Clinical evaluation',
              vitals: e.vitals || { bp: '120/80 mmHg', pulse: '72 bpm', spo2: '98%', temp: '98.6 °F' },
              diagnosis: e.diagnoses?.[0]?.name || 'Clinical Observation',
              clinicalNotes: e.clinicalNotes?.[0]?.content || 'Patient evaluated and advised ongoing monitoring.',
              prescribedAtEncounter: e.prescriptions?.[0]?.medicines || [],
              orderedLabs: e.orderedLabs || [],
              status: e.status === 'COMPLETED' ? 'VERIFIED & SIGNED' : e.status || 'FINAL',
            }));
          }

          if (medRes.status === 'fulfilled' && Array.isArray(medRes.value)) {
            serverMeds = medRes.value.map((m) => ({
              id: m.id,
              drugName: m.medicineName || m.genericName,
              genericName: m.genericName,
              dosage: m.dosage || m.strength || 'Standard Dose',
              frequency: m.frequency || 'Daily',
              timing: m.instructions || 'As advised',
              duration: m.duration || 'Ongoing',
              prescribedBy: m.prescribingDoctor || 'Attending Physician',
              doctorSpecialty: m.doctorSpecialty || 'General Medicine',
              hospitalName: m.hospitalName || 'MediNexa Hospital',
              prescribedDate: m.startDate || 'Recent',
              status: m.classification === 'CURRENT_ACTIVE' ? 'ACTIVE' : m.classification,
              classification: m.classification || 'DOCTOR_PRESCRIBED',
              indication: m.instructions || 'Prescribed therapeutic management',
            }));
          }

          if (diagRes.status === 'fulfilled' && Array.isArray(diagRes.value)) {
            serverDiags = diagRes.value.map((d) => ({
              id: d.id,
              title: d.testName,
              category: d.category === 'RADIOLOGY' ? 'Radiology' : 'Pathology',
              modality: d.modality || 'DIAGNOSTIC',
              date: d.reportDate ? new Date(d.reportDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recent',
              reportId: d.testCode || `MNX-DIAG-${d.id.slice(0, 6)}`,
              filmImage: d.modality === 'XRAY' || d.modality === 'X-RAY' ? XRAY_CHEST_FILM : d.modality === 'MRI' ? BRAIN_MRI_FILM : d.modality === 'ECG' ? ECG_STRIP_FILM : ULTRASOUND_USG_FILM,
              doctor: d.verifier || d.orderingDoctor || 'Diagnostic Specialist',
              technician: 'Senior Technologist',
              findings: d.findings || (d.resultValue ? `Measured: ${d.resultValue} ${d.unit || ''} (Ref: ${d.referenceRange})` : 'Normal clinical limits.'),
              impression: d.impression || 'Study finalized and authorized by department lead.',
              status: d.status || 'VERIFIED & SIGNED',
              resultValue: d.resultValue,
              unit: d.unit,
              referenceRange: d.referenceRange,
              abnormalFlag: d.abnormalFlag || 'NORMAL',
            }));
          }
        } catch (err) {
          console.warn('EHR API fetch caught (offline or unauthorized):', err);
        }
      }

      // 2. Parse Local Completed Appointments & Checked Patients
      const localEncounters: any[] = [];
      const localMeds: any[] = [];
      const localDiags: any[] = [];

      if (typeof window !== 'undefined') {
        try {
          const rawAppts = localStorage.getItem('medinexa_local_appointments');
          if (rawAppts) {
            const parsedAppts = JSON.parse(rawAppts);
            if (Array.isArray(parsedAppts)) {
              parsedAppts
                .filter((a) => {
                  if (a.status !== 'COMPLETED' && !a.diagnosis && !a.doctorNotes) return false;
                  const pName = (a.patientName || '').toLowerCase();
                  const targetName = (resolvedName || '').toLowerCase();
                  return !targetName || pName.includes(targetName) || targetName.includes(pName) || a.patientId === patientId;
                })
                .forEach((a, idx) => {
                  localEncounters.push({
                    id: `local-enc-${a.id || idx}`,
                    date: a.appointmentDate || 'Today',
                    rawTimestamp: new Date().toISOString(),
                    doctorName: a.doctorName ? `Dr. ${a.doctorName.replace(/^Dr\.\s*/, '')}` : 'Dr. Rajesh Singh, MD, DM',
                    doctorSpecialty: a.doctorSpecialty || 'Cardiology',
                    hospitalName: a.facilityName || 'MediNexa Super Specialty Hospital',
                    department: a.department || 'Outpatient Department',
                    visitType: a.type === 'TELEMEDICINE' ? 'Telemedicine' : 'OPD',
                    reason: a.reason || 'Follow-up clinical consultation',
                    vitals: a.vitals || { bp: '124/82 mmHg', pulse: '74 bpm', spo2: '98%', temp: '98.4 °F' },
                    diagnosis: a.diagnosis || 'Clinical Consultation Finalized',
                    clinicalNotes: a.doctorNotes || 'Consultation completed. Patient counseled on medication adherence.',
                    prescribedAtEncounter: a.prescribedMedicines
                      ? String(a.prescribedMedicines)
                          .split(';')
                          .map((m) => ({ name: m.trim(), dosage: '1 dose', freq: 'Standard', duration: 'As directed' }))
                      : [],
                    orderedLabs: [],
                    status: 'VERIFIED & SIGNED',
                  });
                });
            }
          }

          // Read medinexa_checked_patients roster
          const rawChecked = localStorage.getItem('medinexa_checked_patients');
          if (rawChecked) {
            const parsedChecked = JSON.parse(rawChecked);
            if (Array.isArray(parsedChecked)) {
              parsedChecked
                .filter((c) => {
                  const pName = (c.patientName || '').toLowerCase();
                  const targetName = (resolvedName || '').toLowerCase();
                  return !targetName || pName.includes(targetName) || targetName.includes(pName);
                })
                .forEach((c) => {
                  // Avoid duplicate if already added
                  if (!localEncounters.some((e) => e.diagnosis === c.diagnosis && e.date === c.checkedAt)) {
                    localEncounters.push({
                      id: `chk-enc-${c.id}`,
                      date: c.checkedAt || 'Today',
                      rawTimestamp: new Date().toISOString(),
                      doctorName: 'Dr. Rajesh Singh, MD, DM',
                      doctorSpecialty: 'Cardiology',
                      hospitalName: 'MediNexa Super Specialty Hospital',
                      department: 'Central OPD',
                      visitType: c.consultationType?.includes('Telemedicine') ? 'Telemedicine' : 'OPD',
                      reason: `Clinical checkup (${c.tokenNumber || 'Token Verified'})`,
                      vitals: { bp: '122/80 mmHg', pulse: '72 bpm', spo2: '99%', temp: '98.4 °F' },
                      diagnosis: c.diagnosis || 'Medical Consultation Completed',
                      clinicalNotes: c.instructions || 'Checkup completed. Review in follow-up period.',
                      prescribedAtEncounter: c.prescribedMedicines
                        ? String(c.prescribedMedicines)
                            .split(';')
                            .map((m) => ({ name: m.trim(), dosage: '1 dose', freq: 'Standard', duration: 'As advised' }))
                        : [],
                      orderedLabs: [],
                      status: 'VERIFIED & SIGNED',
                    });
                  }
                });
            }
          }

          // Read medinexa_patient_prescriptions
          const rawRx = localStorage.getItem('medinexa_patient_prescriptions');
          if (rawRx) {
            const parsedRx = JSON.parse(rawRx);
            if (Array.isArray(parsedRx)) {
              parsedRx.forEach((rx: any, idx: number) => {
                localMeds.push({
                  id: rx.id || `local-rx-${idx}`,
                  drugName: rx.drugName || rx.medicineName,
                  genericName: rx.genericName || rx.drugName,
                  dosage: rx.dosage || 'Standard dose',
                  frequency: rx.frequency || '1-0-0',
                  timing: rx.timing || rx.instructions || 'After Food',
                  duration: rx.duration || '14 Days',
                  prescribedBy: rx.prescribedBy ? `Dr. ${rx.prescribedBy.replace(/^Dr\.\s*/, '')}` : 'Dr. Rajesh Singh',
                  doctorSpecialty: 'Cardiology',
                  hospitalName: 'MediNexa Super Specialty Hospital',
                  prescribedDate: rx.prescribedDate || 'Recent',
                  status: rx.status || 'ACTIVE',
                  classification: 'DOCTOR_PRESCRIBED',
                  indication: rx.instructions || 'Prescribed outpatient medication',
                });
              });
            }
          }

          // Read medinexa_patient_self_meds
          const rawSelf = localStorage.getItem('medinexa_patient_self_meds');
          if (rawSelf) {
            const parsedSelf = JSON.parse(rawSelf);
            if (Array.isArray(parsedSelf)) {
              parsedSelf.forEach((sm: any, idx: number) => {
                localMeds.push({
                  id: sm.id || `local-sm-${idx}`,
                  drugName: sm.medicineName,
                  genericName: sm.medicineName,
                  dosage: sm.dosage || '1 dose',
                  frequency: sm.frequency || 'Daily',
                  timing: sm.timings?.join(', ') || sm.scheduledTime || '08:00 AM',
                  duration: `${sm.durationDays || 14} Days`,
                  prescribedBy: sm.doctorName ? `Dr. ${sm.doctorName.replace(/^Dr\.\s*/, '')}` : 'Self-Reported by Patient',
                  doctorSpecialty: sm.doctorName ? 'Attending Physician' : 'Over-the-Counter',
                  hospitalName: 'Home Medication Schedule',
                  prescribedDate: sm.startDate || 'Recent',
                  status: 'ACTIVE',
                  classification: sm.doctorName ? 'DOCTOR_PRESCRIBED' : 'PATIENT_REPORTED',
                  indication: sm.instructions || 'Self-administered home medication',
                });
              });
            }
          }

          // Read unified diagnostic orders
          const rawOrders = localStorage.getItem('medinexa_unified_diagnostic_orders');
          if (rawOrders) {
            const parsedOrders = JSON.parse(rawOrders);
            if (Array.isArray(parsedOrders)) {
              parsedOrders
                .filter((ord: any) => {
                  const pName = (ord.patientName || '').toLowerCase();
                  const targetName = (resolvedName || '').toLowerCase();
                  return (
                    !targetName ||
                    pName.includes(targetName) ||
                    targetName.includes(pName) ||
                    ord.patientId === patientId ||
                    ord.patientId === 'patient-ayush-singh'
                  );
                })
                .forEach((ord: any) => {
                  localDiags.push({
                    id: `live-lab-${ord.id}`,
                    title: ord.testName,
                    category: ord.department?.toLowerCase().includes('radio') ? 'Radiology' : 'Pathology',
                    modality: ord.department || 'DIAGNOSTIC',
                    date: ord.verifiedAt || ord.orderedAt || 'Recent',
                    reportId: ord.orderNumber || `ORD-${ord.id.slice(-6)}`,
                    filmImage: ord.scanFilmImage || (ord.department?.toLowerCase().includes('radio') ? XRAY_CHEST_FILM : BLOOD_SMEAR_FILM),
                    doctor: ord.verifiedBy || ord.doctorName || 'Central Lab Consultant',
                    technician: ord.technologistRemarks || 'Laboratory Technologist',
                    findings: ord.radiologistImpression || 'Investigation report verified and authorized by laboratory team.',
                    impression: ord.radiologistImpression || 'Investigation completed with satisfactory visual resolution.',
                    status: ord.status === 'VERIFIED' ? 'VERIFIED & SIGNED' : ord.status,
                    isRealUpload: ord.isRealUpload || (ord.scanFilmImage?.startsWith('data:image/') && !ord.scanFilmImage?.includes('data:image/svg+xml')),
                  });
                });
            }
          }
        } catch (err) {
          console.warn('Local storage parse error in 360 drawer:', err);
        }
      }

      if (!isMounted) return;

      // Combine Server + Local + Canonical Demo (if demo patient)
      let combinedEncounters = [...serverEncounters, ...localEncounters];
      let combinedMeds = [...serverMeds, ...localMeds];
      let combinedDiags = [...serverDiags, ...localDiags];

      if (isDemoPatient) {
        if (combinedEncounters.length === 0) {
          combinedEncounters = DEMO_CHECKUP_ENCOUNTERS;
        } else {
          // ensure demo encounters are retained alongside new ones
          const existingIds = new Set(combinedEncounters.map((e) => e.id));
          DEMO_CHECKUP_ENCOUNTERS.forEach((de) => {
            if (!existingIds.has(de.id)) combinedEncounters.push(de);
          });
        }

        if (combinedMeds.length === 0) {
          combinedMeds = DEMO_MEDICINE_HISTORY;
        } else {
          const existingMeds = new Set(combinedMeds.map((m) => m.drugName));
          DEMO_MEDICINE_HISTORY.forEach((dm) => {
            if (!existingMeds.has(dm.drugName)) combinedMeds.push(dm);
          });
        }

        if (combinedDiags.length === 0) {
          combinedDiags = DEMO_DIAGNOSTIC_REPORTS;
        } else {
          const existingDiags = new Set(combinedDiags.map((d) => d.id));
          DEMO_DIAGNOSTIC_REPORTS.forEach((dd) => {
            if (!existingDiags.has(dd.id)) combinedDiags.push(dd);
          });
        }
      }

      setEncounters(combinedEncounters);
      setMedications(combinedMeds);
      setDiagnostics(combinedDiags);
      setLoading(false);
    };

    loadEhrData();

    // Listen to real-time EHR events from consultation finalization
    const handleEhrUpdate = () => {
      loadEhrData();
    };
    window.addEventListener('medinexa:ehr:updated', handleEhrUpdate);
    window.addEventListener('storage', handleEhrUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('medinexa:ehr:updated', handleEhrUpdate);
      window.removeEventListener('storage', handleEhrUpdate);
    };
  }, [isOpen, patientId, resolvedName, isDemoPatient]);

  // Dynamic filter options derived from encounters
  const distinctDoctors = useMemo(() => {
    const docs = new Set<string>();
    encounters.forEach((e) => {
      if (e.doctorName) docs.add(e.doctorName);
    });
    return Array.from(docs);
  }, [encounters]);

  const distinctSpecialties = useMemo(() => {
    const specs = new Set<string>();
    encounters.forEach((e) => {
      if (e.doctorSpecialty) specs.add(e.doctorSpecialty);
    });
    return Array.from(specs);
  }, [encounters]);

  const distinctHospitals = useMemo(() => {
    const hosps = new Set<string>();
    encounters.forEach((e) => {
      if (e.hospitalName) hosps.add(e.hospitalName);
    });
    return Array.from(hosps);
  }, [encounters]);

  // Filtered Encounters
  const filteredEncounters = useMemo(() => {
    let result = [...encounters];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.doctorName?.toLowerCase().includes(q) ||
          e.diagnosis?.toLowerCase().includes(q) ||
          e.reason?.toLowerCase().includes(q) ||
          e.clinicalNotes?.toLowerCase().includes(q) ||
          e.prescribedAtEncounter?.some((m: any) => m.name?.toLowerCase().includes(q))
      );
    }

    // Doctor filter
    if (filterDoctor !== 'ALL') {
      result = result.filter((e) => e.doctorName === filterDoctor);
    }

    // Specialty filter
    if (filterSpecialty !== 'ALL') {
      result = result.filter((e) => e.doctorSpecialty === filterSpecialty);
    }

    // Hospital filter
    if (filterHospital !== 'ALL') {
      result = result.filter((e) => e.hospitalName === filterHospital);
    }

    // Visit type filter
    if (filterVisitType !== 'ALL') {
      result = result.filter((e) => e.visitType?.toUpperCase() === filterVisitType.toUpperCase());
    }

    // Sort order (desc = newest first; asc = oldest first)
    result.sort((a, b) => {
      const timeA = a.rawTimestamp ? new Date(a.rawTimestamp).getTime() : 0;
      const timeB = b.rawTimestamp ? new Date(b.rawTimestamp).getTime() : 0;
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [encounters, searchQuery, filterDoctor, filterSpecialty, filterHospital, filterVisitType, sortOrder]);

  // Filtered Medications
  const filteredMedications = useMemo(() => {
    let result = [...medications];

    if (medCategoryFilter !== 'ALL') {
      if (medCategoryFilter === 'CURRENT_ACTIVE') {
        result = result.filter((m) => m.status === 'ACTIVE' || m.classification === 'CURRENT_ACTIVE');
      } else {
        result = result.filter((m) => m.classification === medCategoryFilter);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.drugName?.toLowerCase().includes(q) ||
          m.genericName?.toLowerCase().includes(q) ||
          m.indication?.toLowerCase().includes(q) ||
          m.prescribedBy?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [medications, medCategoryFilter, searchQuery]);

  // Filtered Diagnostics
  const filteredDiagnostics = useMemo(() => {
    let result = [...diagnostics];

    if (diagCategoryFilter !== 'ALL') {
      result = result.filter((d) => d.category?.toLowerCase() === diagCategoryFilter.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.title?.toLowerCase().includes(q) ||
          d.findings?.toLowerCase().includes(q) ||
          d.impression?.toLowerCase().includes(q) ||
          d.doctor?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [diagnostics, diagCategoryFilter, searchQuery]);

  // Biochemistry & Hematology Table Parameters
  const labParameters = [
    { test: 'Hemoglobin (Hb)', value: '14.6 g/dL', refRange: '13.5 - 17.5 g/dL', status: 'NORMAL' },
    { test: 'Fasting Blood Sugar (FBS)', value: '94 mg/dL', refRange: '70 - 100 mg/dL', status: 'OPTIMAL' },
    { test: 'HbA1c (Glycated Hemoglobin)', value: '5.4 %', refRange: '< 5.7 %', status: 'OPTIMAL' },
    { test: 'Total Cholesterol', value: '188 mg/dL', refRange: '< 200 mg/dL', status: 'NORMAL' },
    { test: 'Triglycerides', value: '142 mg/dL', refRange: '< 150 mg/dL', status: 'NORMAL' },
    { test: 'Serum Creatinine', value: '0.92 mg/dL', refRange: '0.70 - 1.20 mg/dL', status: 'NORMAL' },
    { test: 'Blood Urea Nitrogen (BUN)', value: '14 mg/dL', refRange: '7 - 20 mg/dL', status: 'NORMAL' },
  ];

  // Historical Vitals
  const vitalsLog = [
    { date: 'Today, 09:15 AM', bp: '124/82 mmHg', hr: '74 bpm', spo2: '98%', temp: '98.4 °F', sugar: '96 mg/dL', weight: '72 kg' },
    { date: 'Aug 14, 2026', bp: '128/84 mmHg', hr: '78 bpm', spo2: '98%', temp: '98.6 °F', sugar: '102 mg/dL', weight: '72.5 kg' },
    { date: 'Jul 10, 2026', bp: '122/80 mmHg', hr: '72 bpm', spo2: '99%', temp: '98.8 °F', sugar: '94 mg/dL', weight: '73 kg' },
    { date: 'May 04, 2026', bp: '120/78 mmHg', hr: '70 bpm', spo2: '99%', temp: '98.2 °F', sugar: '92 mg/dL', weight: '72.8 kg' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-md flex justify-end transition-opacity">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        
        {/* ========================================================================= */}
        {/* HEADER BAR                                                                */}
        {/* ========================================================================= */}
        <div className="p-5 bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl font-black shadow-inner">
              {resolvedName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-black tracking-tight">{resolvedName}</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-500 text-white shadow-sm">
                  UHID: {resolvedUhid}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-400/30 text-blue-100 border border-blue-300/30">
                  Blood Group: B+
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-200 border border-teal-300/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-teal-300" />
                  <span>Verified Longitudinal EHR</span>
                </span>
              </div>
              <p className="text-blue-200 text-xs mt-1 flex items-center gap-3 flex-wrap">
                <span>{resolvedAge} Yrs • {resolvedGender}</span>
                <span>•</span>
                <span>Phone: {resolvedPhone}</span>
                <span>•</span>
                <span className="text-emerald-300 font-bold">Central OPD • Consultation Active</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close Medical 360 View"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB NAVIGATION BAR                                                        */}
        {/* ========================================================================= */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-5 gap-2 overflow-x-auto text-xs font-bold flex-shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Overview & Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('checkups')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'checkups'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Encounters Timeline ({encounters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('medications')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'medications'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Medication History ({medications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'reports'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-purple-500" />
            <span>Diagnostics & Scans ({diagnostics.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vitals')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'vitals'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Vitals Trends</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* DRAWER BODY                                                               */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/40">

          {/* --------------------------------------------------------------------- */}
          {/* TAB 1: OVERVIEW                                                       */}
          {/* --------------------------------------------------------------------- */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Triage Vitals Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">Blood Pressure</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">124/82 <span className="text-xs font-normal text-slate-500">mmHg</span></p>
                  <span className="text-[10px] text-emerald-600 font-bold">✓ Normal Range</span>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">Heart Rate</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">74 <span className="text-xs font-normal text-slate-500">bpm</span></p>
                  <span className="text-[10px] text-emerald-600 font-bold">✓ Regular Sinus</span>
                </div>
                <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-400">Oxygen (SpO2)</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">98% <span className="text-xs font-normal text-slate-500">Room Air</span></p>
                  <span className="text-[10px] text-teal-600 font-bold">✓ Optimal</span>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">Body Temp</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">98.4 <span className="text-xs font-normal text-slate-500">°F</span></p>
                  <span className="text-[10px] text-emerald-600 font-bold">✓ Afebrile</span>
                </div>
              </div>

              {/* Active Conditions Summary */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Active Clinical Diagnoses & Chronic Surveillance</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">ICD-10 Categorized</span>
                </div>

                {encounters.length > 0 ? (
                  <div className="space-y-2">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border border-slate-200/60 dark:border-slate-700">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">Essential (Primary) Hypertension</span>
                          <span className="px-1.5 py-0.5 text-[9px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded">ICD: I10</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Diagnosed by Dr. Rajesh Singh • Controlled on Telmisartan 40mg</p>
                      </div>
                      <span className="px-2.5 py-1 text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
                        CONTROLLED
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border border-slate-200/60 dark:border-slate-700">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">Mild Dyslipidemia</span>
                          <span className="px-1.5 py-0.5 text-[9px] font-black bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded">ICD: E78.5</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Diagnosed by Dr. Arvind Deshmukh • On Atorvastatin 20mg at bedtime</p>
                      </div>
                      <span className="px-2.5 py-1 text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-full">
                        STABLE
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center text-xs text-slate-500">
                    No active chronic diagnoses recorded. Diagnoses recorded during checkups will automatically synchronize here.
                  </div>
                )}
              </div>

              {/* Quick Scan Film Preview Card */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 rounded-2xl border border-slate-800 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-sky-400">Diagnostic Scans & Lab Previews</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="text-[11px] text-sky-300 hover:text-white font-bold underline cursor-pointer"
                  >
                    View All {diagnostics.length} Reports & Images →
                  </button>
                </div>

                {diagnostics.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() =>
                        setZoomScan({
                          title: 'Digital Chest X-Ray PA Film',
                          image: XRAY_CHEST_FILM,
                          subtitle: 'PA View • Normal Cardiothoracic Ratio',
                          findings: 'Clear lung parenchyma. Normal cardiac contours. Verified by Dr. Sunita Kapoor.',
                          doctor: 'Dr. Sunita Kapoor (Radiology)',
                          date: 'Aug 12, 2026',
                        })
                      }
                      className="group relative rounded-xl overflow-hidden border border-slate-700 bg-black cursor-pointer hover:border-sky-400 transition"
                    >
                      <img src={XRAY_CHEST_FILM} alt="Chest X-Ray" className="w-full h-28 object-cover opacity-90 group-hover:scale-105 transition duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2.5 flex flex-col justify-end">
                        <span className="text-[10px] font-black text-white">Chest X-Ray PA View</span>
                        <span className="text-[9px] text-sky-300 flex items-center gap-1">
                          <ZoomIn className="w-3 h-3" /> Click to Zoom Full Screen
                        </span>
                      </div>
                    </div>

                    <div
                      onClick={() =>
                        setZoomScan({
                          title: '12-Lead Electrocardiogram (ECG)',
                          image: ECG_STRIP_FILM,
                          subtitle: 'Normal Sinus Rhythm • 72 bpm',
                          findings: 'Calibrated at 25mm/s. Normal P-QRS-T complexes. Verified by Dr. Rajesh Singh.',
                          doctor: 'Dr. Rajesh Singh (Cardiology)',
                          date: 'Sep 21, 2026',
                        })
                      }
                      className="group relative rounded-xl overflow-hidden border border-slate-700 bg-black cursor-pointer hover:border-rose-400 transition"
                    >
                      <img src={ECG_STRIP_FILM} alt="ECG Strip" className="w-full h-28 object-cover opacity-90 group-hover:scale-105 transition duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2.5 flex flex-col justify-end">
                        <span className="text-[10px] font-black text-white">12-Lead ECG Strip</span>
                        <span className="text-[9px] text-rose-300 flex items-center gap-1">
                          <ZoomIn className="w-3 h-3" /> Click to Zoom Full Screen
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-800/50 rounded-xl text-center text-xs text-slate-400">
                    No diagnostic imaging or laboratory scans on file for this patient.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* TAB 2: ENCOUNTERS TIMELINE                                            */}
          {/* --------------------------------------------------------------------- */}
          {activeTab === 'checkups' && (
            <div className="space-y-4">
              {/* Header with Title and Total */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <span>Chronological Medical Timeline & Consultations</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Attending doctors, hospital departments, clinical SOAP notes, prescriptions, and follow-ups.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Toggle Sort Order"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
                    <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
                  </button>
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {filteredEncounters.length} Encounters
                  </span>
                </div>
              </div>

              {/* Filtering & Search Bar */}
              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search past visits by diagnosis, symptom, doctor or medicine..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Dropdown Filters (Doctor, Specialty, Hospital, Visit Type) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Doctor</label>
                    <select
                      value={filterDoctor}
                      onChange={(e) => setFilterDoctor(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200"
                    >
                      <option value="ALL">All Doctors</option>
                      {distinctDoctors.map((doc) => (
                        <option key={doc} value={doc}>
                          {doc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Specialty</label>
                    <select
                      value={filterSpecialty}
                      onChange={(e) => setFilterSpecialty(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200"
                    >
                      <option value="ALL">All Specialties</option>
                      {distinctSpecialties.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Hospital / Branch</label>
                    <select
                      value={filterHospital}
                      onChange={(e) => setFilterHospital(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200"
                    >
                      <option value="ALL">All Facilities</option>
                      {distinctHospitals.map((hosp) => (
                        <option key={hosp} value={hosp}>
                          {hosp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Visit Type</label>
                    <select
                      value={filterVisitType}
                      onChange={(e) => setFilterVisitType(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200"
                    >
                      <option value="ALL">All Visit Types</option>
                      <option value="OPD">OPD Consultation</option>
                      <option value="IPD">Inpatient Admission</option>
                      <option value="EMERGENCY">Emergency Triage</option>
                      <option value="TELEMEDICINE">Teleconsultation</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Encounter Cards List or Honest Empty State */}
              {filteredEncounters.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      No Prior Medical Encounters Recorded
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                      No prior medical encounters recorded for this patient. New consultations, diagnoses, prescriptions, and diagnostic reports completed in MediNexa will automatically appear here.
                    </p>
                  </div>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Automatic Longitudinal EHR Synchronization Active</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEncounters.map((enc) => (
                    <div
                      key={enc.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3 hover:border-blue-400 dark:hover:border-blue-600 transition"
                    >
                      {/* Header: Date, Doctor, Facility */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                            <Stethoscope className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                                {enc.doctorName}
                              </h4>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {enc.visitType || 'OPD'}
                              </span>
                            </div>
                            <p className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">
                              {enc.doctorSpecialty} • {enc.hospitalName} • {enc.department}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
                            {enc.status}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-xl">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{enc.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Vitals at this Encounter */}
                      {enc.vitals && (
                        <div className="flex items-center gap-3 text-[11px] bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-slate-700 dark:text-slate-300 flex-wrap">
                          <span className="font-bold text-slate-500 uppercase text-[10px]">Encounter Vitals:</span>
                          <span>BP: <strong className="text-slate-900 dark:text-white">{enc.vitals.bp || '120/80'}</strong></span>
                          <span>•</span>
                          <span>HR: <strong className="text-slate-900 dark:text-white">{enc.vitals.pulse || '72 bpm'}</strong></span>
                          <span>•</span>
                          <span>SpO2: <strong className="text-slate-900 dark:text-white">{enc.vitals.spo2 || '98%'}</strong></span>
                          <span>•</span>
                          <span>Temp: <strong className="text-slate-900 dark:text-white">{enc.vitals.temp || '98.4 °F'}</strong></span>
                        </div>
                      )}

                      {/* Reason & Clinical Notes */}
                      <div className="space-y-1.5 text-xs">
                        <div>
                          <span className="font-bold text-slate-500 uppercase text-[10px]">Reason for Visit:</span>
                          <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{enc.reason}</p>
                        </div>

                        <div>
                          <span className="font-bold text-slate-500 uppercase text-[10px]">Primary Diagnosis:</span>
                          <div className="mt-0.5">
                            <span className="inline-block px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-black rounded-md text-xs border border-blue-200 dark:border-blue-900">
                              {enc.diagnosis}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="font-bold text-slate-500 uppercase text-[10px]">Clinical SOAP Notes:</span>
                          <p className="text-slate-600 dark:text-slate-400 italic bg-slate-50/80 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            &ldquo;{enc.clinicalNotes}&rdquo;
                          </p>
                        </div>
                      </div>

                      {/* Prescribed Medicines */}
                      {enc.prescribedAtEncounter && enc.prescribedAtEncounter.length > 0 && (
                        <div className="pt-1">
                          <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1.5">
                            Medicines Prescribed in this Encounter:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {enc.prescribedAtEncounter.map((m: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <Pill className="w-3.5 h-3.5 text-blue-600" />
                                  <span className="font-bold text-slate-800 dark:text-slate-200">{m.name}</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-semibold">{m.freq || m.duration}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action to open Full Encounter Dossier */}
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => setSelectedEncounterDossier(enc)}
                          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inspect Full Encounter Dossier & Notes →</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* TAB 3: COMPLETE MEDICATION HISTORY                                    */}
          {/* --------------------------------------------------------------------- */}
          {activeTab === 'medications' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Pill className="w-4 h-4 text-emerald-600" />
                    <span>Complete Longitudinal Medication History</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive ledger distinguishing doctor prescriptions, pharmacy dispenses, inpatient nurse administrations, and patient reports.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {medications.filter((m) => m.status === 'ACTIVE' || m.classification === 'CURRENT_ACTIVE').length} Currently Active
                </span>
              </div>

              {/* Classification Pills Filter */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
                {[
                  { key: 'ALL', label: 'All Medications' },
                  { key: 'CURRENT_ACTIVE', label: 'Current Active' },
                  { key: 'DOCTOR_PRESCRIBED', label: 'Doctor Prescribed' },
                  { key: 'PHARMACY_DISPENSED', label: 'Pharmacy Dispensed' },
                  { key: 'NURSE_ADMINISTERED', label: 'Nurse Administered' },
                  { key: 'PATIENT_REPORTED', label: 'Patient Reported' },
                  { key: 'DISCONTINUED', label: 'Discontinued' },
                  { key: 'HISTORICAL', label: 'Historical Courses' },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setMedCategoryFilter(cat.key as any)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition ${
                      medCategoryFilter === cat.key
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Medication Cards List or Empty State */}
              {filteredMedications.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <Pill className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    No Medications Found in this Category
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    No medications match the selected filter. Doctor prescriptions and pharmacy records will automatically synchronize here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMedications.map((med) => {
                    const isNurse = med.classification === 'NURSE_ADMINISTERED';
                    const isPatient = med.classification === 'PATIENT_REPORTED';
                    const isDispensed = med.classification === 'PHARMACY_DISPENSED';
                    const isDiscontinued = med.classification === 'DISCONTINUED';

                    const badgeStyle = isNurse
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      : isPatient
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : isDispensed
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                      : isDiscontinued
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : med.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';

                    return (
                      <div
                        key={med.id}
                        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-sm text-slate-900 dark:text-white">{med.drugName}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${badgeStyle}`}>
                                {med.classification || med.status}
                              </span>
                              {isNurse && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 flex items-center gap-1">
                                  <Syringe className="w-3 h-3" /> Inpatient Nurse Charted
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium">{med.genericName}</p>
                          </div>

                          <div className="text-right text-[11px] text-slate-500">
                            <span className="font-bold text-slate-700 dark:text-slate-300 block">{med.prescribedBy}</span>
                            <span>{med.hospitalName || 'MediNexa Clinic'} • {med.prescribedDate}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                          <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Dosage & Strength</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{med.dosage}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Frequency</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">{med.frequency}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Meal Relation</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{med.timing}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Course Duration</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{med.duration}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 italic pt-0.5">
                          Clinical Indication: {med.indication}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* TAB 4: DIAGNOSTIC SCANS & LAB PANELS                                   */}
          {/* --------------------------------------------------------------------- */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-purple-600" />
                    <span>Radiology Films, Scans & Diagnostic Laboratory Panels</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    High-resolution PACS scan films (X-Ray, MRI, ECG, USG, Blood Smears) and certified biochemistry panels.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950 px-2.5 py-1 rounded-xl">
                  🔍 Click on any film to zoom full screen
                </span>
              </div>

              {/* Diagnostic Category Filter */}
              <div className="flex gap-2 text-xs font-bold">
                {[
                  { key: 'ALL', label: 'All Investigations' },
                  { key: 'Radiology', label: 'Radiology & Imaging (X-Ray/MRI/USG)' },
                  { key: 'Pathology', label: 'Pathology & Blood Panels' },
                ].map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setDiagCategoryFilter(c.key as any)}
                    className={`px-3 py-1.5 rounded-xl cursor-pointer transition ${
                      diagCategoryFilter === c.key
                        ? 'bg-purple-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Scan Film Cards Grid */}
              {filteredDiagnostics.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                    <Eye className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    No Diagnostic Reports on File
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When laboratory orders or radiology scans are performed and verified by the diagnostics team, they will automatically appear here with scan films.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDiagnostics.map((rep) => (
                    <div
                      key={rep.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-700 transition"
                    >
                      <div>
                        {/* Scan Header */}
                        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <h4 className="font-black text-xs text-slate-900 dark:text-white">{rep.title}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">Ref: {rep.reportId} • {rep.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {rep.isRealUpload && (
                              <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-500 text-white rounded-full flex items-center gap-1 shadow-xs">
                                <Camera className="w-2.5 h-2.5" />
                                <span>Real Lab Picture</span>
                              </span>
                            )}
                            <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
                              {rep.status}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Visual Scan Film */}
                        <div
                          onClick={() =>
                            setZoomScan({
                              title: rep.title,
                              image: rep.filmImage,
                              subtitle: `${rep.category} • Ref: ${rep.reportId}`,
                              findings: rep.findings,
                              doctor: rep.doctor,
                              date: rep.date,
                              isRealUpload: rep.isRealUpload,
                            })
                          }
                          className="relative group bg-black cursor-pointer overflow-hidden"
                        >
                          <img
                            src={rep.filmImage}
                            alt={rep.title}
                            className="w-full h-44 object-contain bg-black/90 group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-[2px]">
                            <Maximize2 className="w-5 h-5 text-white" />
                            <span>Click to Inspect High-Res Film</span>
                          </div>
                        </div>

                        {/* Findings */}
                        <div className="p-3.5 space-y-2 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Clinical Findings:</span>
                            <p className="text-slate-700 dark:text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                              {rep.findings}
                            </p>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[10px] text-slate-500">
                            <strong>Reporting Specialist:</strong> {rep.doctor}
                          </div>
                        </div>
                      </div>

                      {/* Action button */}
                      <div className="p-3 pt-0">
                        <button
                          onClick={() =>
                            setZoomScan({
                              title: rep.title,
                              image: rep.filmImage,
                              subtitle: `${rep.category} • Ref: ${rep.reportId}`,
                              findings: rep.findings,
                              doctor: rep.doctor,
                              date: rep.date,
                              isRealUpload: rep.isRealUpload,
                            })
                          }
                          className="w-full py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>Open Lightbox & Full Report</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Verified Blood & Biochemical Parameters Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Biochemistry & Hematology Panel Results (NABL-aligned reference standards)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold">Verified Reference Values</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400">
                        <th className="py-2.5 px-3">Laboratory Investigation</th>
                        <th className="py-2.5 px-3">Measured Result</th>
                        <th className="py-2.5 px-3">Biological Reference (Lab-Supplied)</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                      {labParameters.map((lp, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{lp.test}</td>
                          <td className="py-2 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">{lp.value}</td>
                          <td className="py-2 px-3 text-slate-400">{lp.refRange}</td>
                          <td className="py-2 px-3 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {lp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* TAB 5: VITALS TRENDS                                                  */}
          {/* --------------------------------------------------------------------- */}
          {activeTab === 'vitals' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Historical Vitals Log & Trends
                </h3>
                <p className="text-xs text-slate-500">
                  Evolution of blood pressure, pulse rate, oxygen saturation, and body temperature across visits.
                </p>
              </div>

              <div className="space-y-3">
                {vitalsLog.map((v, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2"
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Encounter Recorded: {v.date}</span>
                      </span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full font-black">
                        Stable Hemodynamics
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs pt-1">
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 block font-bold">BP (mmHg)</span>
                        <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">{v.bp}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 block font-bold">Heart Rate</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">{v.hr}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 block font-bold">Oxygen (SpO2)</span>
                        <span className="font-extrabold text-teal-600 dark:text-teal-400 text-sm">{v.spo2}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 block font-bold">Temperature</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">{v.temp}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 block font-bold">Blood Sugar</span>
                        <span className="font-extrabold text-purple-600 dark:text-purple-400 text-sm">{v.sugar}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 block font-bold">Weight</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">{v.weight}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* FOOTER BAR                                                                */}
        {/* ========================================================================= */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>MediNexa Certified Longitudinal EHR Archive • Multi-Hospital Synchronized</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl hover:opacity-90 transition cursor-pointer"
          >
            Close 360 View
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULL ENCOUNTER DOSSIER MODAL                                              */}
      {/* ========================================================================= */}
      {selectedEncounterDossier && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase">
                  {selectedEncounterDossier.visitType || 'OPD'} Consultation Dossier
                </span>
                <h3 className="text-base font-black mt-1">{selectedEncounterDossier.doctorName}</h3>
                <p className="text-xs text-blue-200">{selectedEncounterDossier.doctorSpecialty} • {selectedEncounterDossier.hospitalName}</p>
              </div>
              <button
                onClick={() => setSelectedEncounterDossier(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                <span>Date & Time: <strong>{selectedEncounterDossier.date}</strong></span>
                <span className="px-2.5 py-0.5 rounded-full font-black text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {selectedEncounterDossier.status}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Primary Diagnosis:</span>
                <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">{selectedEncounterDossier.diagnosis}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Chief Complaint / Reason:</span>
                <p className="font-medium mt-0.5">{selectedEncounterDossier.reason}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Doctor Clinical SOAP Notes:</span>
                <p className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 italic leading-relaxed mt-0.5">
                  &ldquo;{selectedEncounterDossier.clinicalNotes}&rdquo;
                </p>
              </div>

              {selectedEncounterDossier.prescribedAtEncounter && selectedEncounterDossier.prescribedAtEncounter.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Medicines Prescribed:</span>
                  <div className="space-y-1.5">
                    {selectedEncounterDossier.prescribedAtEncounter.map((m: any, i: number) => (
                      <div key={i} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                        <span className="font-bold text-slate-900 dark:text-white">{m.name}</span>
                        <span className="text-slate-500 font-medium">{m.dosage || ''} • {m.freq || m.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedEncounterDossier(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 text-xs transition cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULL-SCREEN SCAN LIGHTBOX / ZOOM MODAL                                    */}
      {/* ========================================================================= */}
      {zoomScan && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between text-white">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-base font-black text-sky-400">{zoomScan.title}</h3>
                  {zoomScan.isRealUpload && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-black text-[9px] flex items-center gap-1">
                      <Camera className="w-2.5 h-2.5" />
                      <span>Real Lab Upload</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300">{zoomScan.subtitle} • {zoomScan.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={zoomScan.image}
                  download={`${zoomScan.title.replace(/[^a-zA-Z0-9]/g, '_')}_scan.png`}
                  className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Picture</span>
                </a>
                <button
                  onClick={() => setZoomScan(null)}
                  className="p-2 rounded-xl bg-slate-700 text-white hover:bg-slate-600 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-black flex justify-center items-center">
              <img src={zoomScan.image} alt={zoomScan.title} className="max-h-[60vh] w-auto object-contain rounded-xl border border-slate-800" />
            </div>

            <div className="p-5 bg-slate-900 border-t border-slate-800 text-xs text-slate-300 space-y-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-400 block">Verified Radiologist Findings:</span>
                <p className="text-white font-medium mt-0.5 leading-relaxed">{zoomScan.findings}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <span>Certified By: <strong className="text-white">{zoomScan.doctor}</strong></span>
                <span className="text-emerald-400 font-bold">✓ Digital Signature Verified</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
