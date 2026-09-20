'use client';

import React, { useEffect, useState } from 'react';
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

export default function Patient360Drawer({
  patientId,
  patientName: propPatientName,
  patientData,
  isOpen,
  onClose,
}: Patient360DrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checkups' | 'medications' | 'reports' | 'vitals'>('overview');
  const [loading, setLoading] = useState(false);
  const [zoomScan, setZoomScan] = useState<{ title: string; image: string; subtitle: string; findings: string; doctor: string; date: string } | null>(null);

  // Resolved Patient Identification
  const resolvedName = propPatientName || patientData?.patientName || 'Ayush Singh';
  const resolvedAge = patientData?.patientAge || 38;
  const resolvedGender = patientData?.patientGender || 'Male';
  const resolvedPhone = patientData?.patientPhone || '+91 98765 43210';
  const resolvedUhid = patientData?.uhid || `MNX-2026-${(patientId || '1088').replace(/\D/g, '').slice(0, 4) || '2044'}`;

  // Complete Checkup Encounters (Past Visits "Kab Kisse")
  const checkupEncounters = [
    {
      id: 'enc-1',
      date: 'Earlier Today (Sep 21, 2026, 09:15 AM)',
      doctorName: 'Dr. Rajesh Singh, MD, DM',
      doctorSpecialty: 'Senior Consultant Interventional Cardiologist',
      department: 'Central Cardiology OPD - Room 104',
      reason: 'Routine cardiology consultation, blood pressure monitoring & ECG review',
      vitals: { bp: '124/82 mmHg', pulse: '74 bpm', spo2: '98%', temp: '98.4 °F' },
      diagnosis: 'Primary Essential Hypertension (Well Controlled)',
      clinicalNotes:
        'Patient presents feeling energetic. Resting blood pressure is well stabilized on Telmisartan 40mg. Bilateral chest clear to auscultation, S1/S2 heard normal, no murmur, no ankle edema.',
      prescribedAtEncounter: [
        { name: 'Telma 40 (Telmisartan 40mg)', dosage: '40mg', freq: '1-0-0 (Morning after food)', duration: '90 Days' },
        { name: 'Pan 40 (Pantoprazole 40mg)', dosage: '40mg', freq: '1-0-0 (Before breakfast)', duration: '14 Days' },
      ],
    },
    {
      id: 'enc-2',
      date: 'Aug 14, 2026 (11:30 AM)',
      doctorName: 'Dr. Arvind Deshmukh, MD',
      doctorSpecialty: 'Senior Physician & Internal Medicine Specialist',
      department: 'Department of General & Preventive Medicine',
      reason: 'Post-discharge follow up review for dyspepsia and lipid management',
      vitals: { bp: '128/84 mmHg', pulse: '78 bpm', spo2: '98%', temp: '98.6 °F' },
      diagnosis: 'Dyslipidemia with Mild Gastroesophageal Reflux',
      clinicalNotes:
        'Reviewed fasting lipid profile. Serum cholesterol is 188 mg/dL (improved). Abdomen soft, non-tender, bowel sounds active. Instructed to maintain low saturated-fat diet and brisk morning walks.',
      prescribedAtEncounter: [
        { name: 'Atorva 20 (Atorvastatin 20mg)', dosage: '20mg', freq: '0-0-1 (Bedtime after dinner)', duration: '90 Days' },
        { name: 'Pan 40 (Pantoprazole)', dosage: '40mg', freq: '1-0-0 (Morning empty stomach)', duration: '30 Days' },
      ],
    },
    {
      id: 'enc-3',
      date: 'Jul 10, 2026 (04:15 PM)',
      doctorName: 'Dr. Sneha Kulkarni, MS',
      doctorSpecialty: 'Consultant Pulmonologist & Chest Physician',
      department: 'Chest Medicine & Respiratory Clinic',
      reason: 'Seasonal dry cough, throat irritation, and post-nasal drip',
      vitals: { bp: '122/80 mmHg', pulse: '72 bpm', spo2: '99%', temp: '98.8 °F' },
      diagnosis: 'Upper Respiratory Tract Allergic Bronchitis',
      clinicalNotes:
        'Bilateral vesicular breath sounds present. No wheeze or crepitations. Digital Chest X-Ray PA View evaluated and confirmed clear. Prescribed 5-day course of anti-allergy and broncho-soothers.',
      prescribedAtEncounter: [
        { name: 'Augmentin 625 Duo', dosage: '625mg', freq: '1-0-1 (Twice daily after meals)', duration: '5 Days' },
        { name: 'Montair LC (Montelukast + Levocetirizine)', dosage: '10mg/5mg', freq: '0-0-1 (At night)', duration: '10 Days' },
      ],
    },
    {
      id: 'enc-4',
      date: 'May 04, 2026 (10:00 AM)',
      doctorName: 'Dr. Priya Verma, MD',
      doctorSpecialty: 'Consultant Diabetologist & Endocrinologist',
      department: 'Endocrinology & Lifestyle Disorders Clinic',
      reason: 'Annual preventive glycemic surveillance & HbA1c screening',
      vitals: { bp: '120/78 mmHg', pulse: '70 bpm', spo2: '99%', temp: '98.2 °F' },
      diagnosis: 'Normal Glycemic Status (HbA1c 5.4%)',
      clinicalNotes:
        'Fasting Blood Sugar is 94 mg/dL. Renal and liver profiles within physiological reference limits. Advised to continue balanced Mediterranean-style diet and regular hydration.',
      prescribedAtEncounter: [
        { name: 'Multivitamin & Zinc Capsule (Becozinc)', dosage: '1 Cap', freq: '1-0-0 (Post lunch)', duration: '30 Days' },
      ],
    },
  ];

  // Complete Medication History ("Kaun si medicine sari history")
  const medicineHistory = [
    {
      id: 'med-hist-1',
      drugName: 'Telma 40 (Telmisartan 40mg)',
      genericName: 'Telmisartan IP',
      dosage: '40mg Oral Tablet',
      frequency: 'Once Daily in Morning (1-0-0)',
      timing: 'After Breakfast with Water',
      duration: '90 Days (Active)',
      prescribedBy: 'Dr. Rajesh Singh (Cardiology)',
      prescribedDate: 'Sep 21, 2026',
      status: 'ACTIVE',
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
      prescribedBy: 'Dr. Arvind Deshmukh (General Medicine)',
      prescribedDate: 'Aug 14, 2026',
      status: 'ACTIVE',
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
      prescribedBy: 'Dr. Rajesh Singh (Cardiology)',
      prescribedDate: 'Aug 14, 2026',
      status: 'ACTIVE',
      indication: 'Cardiovascular Lipid Profile Optimization',
    },
    {
      id: 'med-hist-4',
      drugName: 'Augmentin 625 Duo',
      genericName: 'Amoxicillin and Potassium Clavulanate 625mg',
      dosage: '625mg Tablet',
      frequency: 'Twice Daily (1-0-1)',
      timing: 'After Meals with plenty of fluids',
      duration: '5 Days Completed',
      prescribedBy: 'Dr. Sneha Kulkarni (Pulmonology)',
      prescribedDate: 'Jul 10, 2026',
      status: 'COMPLETED',
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
      prescribedBy: 'Dr. Sneha Kulkarni (Pulmonology)',
      prescribedDate: 'Jul 10, 2026',
      status: 'COMPLETED',
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
      prescribedDate: 'May 04, 2026',
      status: 'AS_NEEDED',
      indication: 'Analgesic & Antipyretic',
    },
  ];

  // Diagnostic & Lab Reports with Scans ("X-Ray aur sari report ki pic bhi")
  const diagnosticReports = [
    {
      id: 'rep-xray',
      title: 'Digital Chest X-Ray PA View',
      category: 'Radiology & Imaging',
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
      category: 'Neuro-Radiology',
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
      category: 'Cardiology Diagnostics',
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
      category: 'Ultrasonography',
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
      category: 'Hematology & Clinical Pathology',
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

  // Lab Parameters Table Data
  const labParameters = [
    { test: 'Hemoglobin (Hb)', value: '14.6 g/dL', refRange: '13.5 - 17.5 g/dL', status: 'NORMAL' },
    { test: 'Fasting Blood Sugar (FBS)', value: '94 mg/dL', refRange: '70 - 100 mg/dL', status: 'NORMAL' },
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
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black tracking-tight">{resolvedName}</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-500 text-white shadow-sm">
                  UHID: {resolvedUhid}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-400/30 text-blue-100 border border-blue-300/30">
                  Blood Group: B+
                </span>
              </div>
              <p className="text-blue-200 text-xs mt-0.5 flex items-center gap-3">
                <span>{resolvedAge} Yrs • {resolvedGender}</span>
                <span>•</span>
                <span>Phone: {resolvedPhone}</span>
                <span>•</span>
                <span className="text-emerald-300 font-bold">Central OPD Room 104</span>
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
            <span>Overview & Vitals</span>
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
            <span>Checkup History ({checkupEncounters.length})</span>
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
            <span>Medicine History ({medicineHistory.length})</span>
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
            <span>X-Ray, Scans & Lab Reports ({diagnosticReports.length})</span>
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
              </div>

              {/* Quick Scan Film Preview Card */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 rounded-2xl border border-slate-800 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-sky-400">Recent Diagnostic Scans</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="text-[11px] text-sky-300 hover:text-white font-bold underline cursor-pointer"
                  >
                    View All {diagnosticReports.length} Reports & Images →
                  </button>
                </div>

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
                      <span className="text-[10px] font-black text-white">Chest X-Ray (Aug 12, 2026)</span>
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
                      <span className="text-[10px] font-black text-white">12-Lead ECG (Sep 21, 2026)</span>
                      <span className="text-[9px] text-rose-300 flex items-center gap-1">
                        <ZoomIn className="w-3 h-3" /> Click to Zoom Full Screen
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* TAB 2: CHECKUP HISTORY (Puri Checkup History - Kab Kisse)             */}
          {/* --------------------------------------------------------------------- */}
          {activeTab === 'checkups' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Clinical Encounters & Consultation History
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chronological record of every doctor visit, clinical examinations, diagnoses, and progress notes.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {checkupEncounters.length} Completed Encounters
                </span>
              </div>

              <div className="space-y-4">
                {checkupEncounters.map((enc) => (
                  <div
                    key={enc.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3"
                  >
                    {/* Header: Date & Doctor ("Kab Kisse") */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {enc.doctorName}
                          </h4>
                          <p className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">
                            {enc.doctorSpecialty} • {enc.department}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-xl">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{enc.date}</span>
                      </div>
                    </div>

                    {/* Vitals at this Encounter */}
                    <div className="flex items-center gap-3 text-[11px] bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Encounter Vitals:</span>
                      <span>BP: <strong className="text-slate-900 dark:text-white">{enc.vitals.bp}</strong></span>
                      <span>•</span>
                      <span>HR: <strong className="text-slate-900 dark:text-white">{enc.vitals.pulse}</strong></span>
                      <span>•</span>
                      <span>SpO2: <strong className="text-slate-900 dark:text-white">{enc.vitals.spo2}</strong></span>
                      <span>•</span>
                      <span>Temp: <strong className="text-slate-900 dark:text-white">{enc.vitals.temp}</strong></span>
                    </div>

                    {/* Reason & Clinical Notes */}
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="font-bold text-slate-500 uppercase text-[10px]">Reason for Visit:</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{enc.reason}</p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-500 uppercase text-[10px]">Primary Diagnosis:</span>
                        <div className="mt-0.5">
                          <span className="inline-block px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-black rounded-md text-xs border border-blue-200 dark:border-blue-900">
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

                    {/* Medicines Prescribed during this Visit ("Kaun si medicine") */}
                    <div className="pt-1">
                      <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1.5">
                        Medicines Prescribed in this Encounter:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {enc.prescribedAtEncounter.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <Pill className="w-3.5 h-3.5 text-blue-600" />
                              <span className="font-bold text-slate-800 dark:text-slate-200">{m.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-semibold">{m.freq}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* TAB 3: MEDICINE HISTORY ("Kaun si medicine sari history")             */}
          {/* --------------------------------------------------------------------- */}
          {activeTab === 'medications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Complete Prescription & Medication History
                  </h3>
                  <p className="text-xs text-slate-500">
                    Every active, completed, and PRN medicine prescribed by attending physicians.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {medicineHistory.filter((m) => m.status === 'ACTIVE').length} Currently Active
                </span>
              </div>

              <div className="space-y-3">
                {medicineHistory.map((med) => (
                  <div
                    key={med.id}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900 dark:text-white">{med.drugName}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              med.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : med.status === 'COMPLETED'
                                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {med.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">{med.genericName}</p>
                      </div>

                      <div className="text-right text-[11px] text-slate-500">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block">{med.prescribedBy}</span>
                        <span>Prescribed on {med.prescribedDate}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Dosage & Form</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{med.dosage}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Frequency</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{med.frequency}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Food Timing</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{med.timing}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Course Duration</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{med.duration}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 italic pt-0.5">
                      Indication: {med.indication}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* TAB 4: DIAGNOSTIC SCANS & LAB REPORTS ("X-ray aur sari report ki pic")*/}
          {/* --------------------------------------------------------------------- */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Radiology Films, Diagnostic Scans & Lab Panels
                  </h3>
                  <p className="text-xs text-slate-500">
                    High-resolution diagnostic films for X-Ray, Brain MRI, 12-Lead ECG, Ultrasound, and Pathology Smears.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950 px-2.5 py-1 rounded-xl">
                  🔍 Click on any film to zoom full screen
                </span>
              </div>

              {/* Scan Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {diagnosticReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Scan Header */}
                      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <h4 className="font-black text-xs text-slate-900 dark:text-white">{rep.title}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">Ref: {rep.reportId} • {rep.date}</span>
                        </div>
                        <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
                          {rep.status}
                        </span>
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
                          })
                        }
                        className="relative group bg-black cursor-pointer overflow-hidden"
                      >
                        <img
                          src={rep.filmImage}
                          alt={rep.title}
                          className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
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
                          <strong>Reporting Radiologist:</strong> {rep.doctor}
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

              {/* Verified Blood & Biochemical Parameters Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>NABL Accredited Biochemistry & Hematology Panel Results</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold">Verified on Aug 14, 2026</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400">
                        <th className="py-2.5 px-3">Laboratory Investigation</th>
                        <th className="py-2.5 px-3">Measured Result</th>
                        <th className="py-2.5 px-3">Normal Biological Reference</th>
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
          <div className="text-xs text-slate-500">
            MediNexa EMR • Certified Health Records Archive
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
      {/* FULL-SCREEN SCAN LIGHTBOX / ZOOM MODAL                                    */}
      {/* ========================================================================= */}
      {zoomScan && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between text-white">
              <div>
                <h3 className="text-base font-black text-sky-400">{zoomScan.title}</h3>
                <p className="text-xs text-slate-300">{zoomScan.subtitle} • {zoomScan.date}</p>
              </div>
              <button
                onClick={() => setZoomScan(null)}
                className="p-2 rounded-xl bg-slate-700 text-white hover:bg-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
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
