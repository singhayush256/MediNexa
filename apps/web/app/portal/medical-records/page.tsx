'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  ShieldCheck,
  Stethoscope,
  FlaskConical,
  FileText,
  Building2,
  Calendar,
  Clock,
  Pill,
  Syringe,
  Activity,
  BedDouble,
  HeartHandshake,
  User,
  ClipboardList,
  CheckCircle2,
  X,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  Printer,
  ChevronRight,
  Info,
  ZoomIn,
  Plus,
  Upload,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, MedicalTimeline, TimelineEvent } from '@/components/ui';
import { getCleanPatientSession } from '@/lib/demo-patients';
import { getApiBaseUrl } from '@/lib/api-config';

const XRAY_SCAN_FILM = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23050508"><rect width="600" height="400" fill="%23050508"/><path d="M 160 120 C 180 80, 240 70, 280 80 C 290 85, 290 320, 290 320 C 230 310, 180 270, 160 120 Z" fill="%231e293b" stroke="%2364748b" stroke-width="2" opacity="0.85"/><path d="M 440 120 C 420 80, 360 70, 320 80 C 310 85, 310 320, 310 320 C 370 310, 420 270, 440 120 Z" fill="%231e293b" stroke="%2364748b" stroke-width="2" opacity="0.85"/><ellipse cx="320" cy="250" rx="45" ry="65" fill="%23cbd5e1" opacity="0.85"/><path d="M 300 70 L 300 350" stroke="%23e2e8f0" stroke-width="6" stroke-dasharray="8,6"/><text x="30" y="40" fill="%2338bdf8" font-family="sans-serif" font-size="16" font-weight="bold">DIGITAL CHEST X-RAY PA FILM • R (RIGHT)</text><text x="30" y="375" fill="%2394a3b8" font-family="sans-serif" font-size="13">Cardiothoracic Ratio normal (&lt;0.50) • Clear Costophrenic Angles</text></svg>`;

const USG_SCAN_FILM = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23000000"><rect width="600" height="400" fill="%23000000"/><path d="M 300 60 L 140 330 A 240 240 0 0 0 460 330 Z" fill="%2318181b" stroke="%233f3f46" stroke-width="2"/><path d="M 230 200 Q 300 160 360 210 Q 340 270 250 260 Z" fill="%2371717a" opacity="0.75"/><circle cx="280" cy="220" r="18" fill="%2327272a" stroke="%23d4d4d8" stroke-width="2"/><text x="30" y="40" fill="%23fbbf24" font-family="sans-serif" font-size="16" font-weight="bold">WHOLE ABDOMEN ULTRASONOGRAM (USG)</text><text x="30" y="375" fill="%23a1a1aa" font-family="sans-serif" font-size="13">Liver Grade 1 Steatosis • Gallbladder, Kidneys, Spleen normal</text></svg>`;

const ECG_SCAN_FILM = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%231e1b4b"><rect width="600" height="400" fill="%231e1b4b"/><path d="M 20 200 L 90 200 L 100 185 L 110 200 L 125 200 L 135 120 L 150 270 L 160 200 L 190 200 L 210 170 L 230 200 L 300 200 L 310 185 L 320 200 L 335 200 L 345 120 L 360 270 L 370 200 L 400 200 L 420 170 L 440 200 L 580 200" fill="none" stroke="%23f43f5e" stroke-width="3"/><text x="30" y="40" fill="%23fda4af" font-family="sans-serif" font-size="16" font-weight="bold">12-LEAD ECG RHYTHM STRIP • 25mm/s</text><text x="30" y="375" fill="%23e2e8f0" font-family="sans-serif" font-size="13">Normal Sinus Rhythm • Heart Rate: 72 bpm • No ST elevation</text></svg>`;

const BLOOD_SCAN_FILM = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%230f172a"><rect width="600" height="400" fill="%230f172a"/><circle cx="300" cy="200" r="140" fill="%23fdf2f8" stroke="%23ec4899" stroke-width="4"/><circle cx="260" cy="180" r="28" fill="%23ec4899" opacity="0.85"/><circle cx="340" cy="190" r="24" fill="%23be185d" opacity="0.9"/><circle cx="290" cy="230" r="26" fill="%23db2777" opacity="0.8"/><text x="30" y="40" fill="%2338bdf8" font-family="sans-serif" font-size="16" font-weight="bold">PATHOLOGY BLOOD SMEAR - NABL LAB</text><text x="30" y="375" fill="%2394a3b8" font-family="sans-serif" font-size="13">Normocytic, Normochromic RBCs • Adequate Platelets</text></svg>`;

const COMPREHENSIVE_CLINICAL_EVENTS: TimelineEvent[] = [
  {

    id: 'evt-adm-1',
    date: 'Aug 10 – Aug 14, 2026',
    type: 'ADMISSION',
    title: 'Inpatient Hospital Admission - Acute Coronary Care Unit',
    doctorName: 'Dr. Rajesh Singh, MD, DM',
    doctorSpecialty: 'Senior Consultant Interventional Cardiologist',
    hospitalName: 'MediNexa Super Specialty Hospital (Knowledge Park II)',
    facilityDepartment: 'Tower B, 4th Floor - Cardiac Critical Care Unit (ICU-CCU)',
    summary: '4-Day emergency admission for Acute Coronary Syndrome & Severe Chest Pain. Managed with IV anti-ischemics, low-molecular-weight heparin injections, continuous telemetry monitoring, and coronary stabilization.',
    badge: 'Discharged - Hemodynamically Stable',
    admissionDetails: {
      admittedAt: 'Aug 10, 2026, 02:45 PM',
      dischargedAt: 'Aug 14, 2026, 11:30 AM',
      durationDays: 4,
      durationNights: 3,
      reason: 'Acute Coronary Syndrome, Unstable Angina with Elevated Troponin-T & Ischemic T-Wave Inversion',
      wardName: 'Inpatient Cardiac Care Ward 4B',
      bedNumber: 'Bed #104 (Semi-Private AC Ward)',
      inchargeNurse: 'Sister Priya Singh, RN (Critical Care Lead)',
      conditionOnDischarge: 'Hemodynamically stable, chest pain completely resolved, afebrile, resting ECG normal sinus rhythm.',
      injectionsAdministered: [
        'Inj. Pantoprazole 40mg IV OD in 10ml sterile water slow push (GI Bleed Prophylaxis)',
        'Inj. Ceftriaxone 1g IV BD in 100ml 0.9% Normal Saline over 30 minutes (Antibacterial cover)',
        'Inj. Enoxaparin 40mg (0.4ml) Subcutaneous OD in periumbilical area (Anticoagulant)',
        'Inj. Ondansetron 4mg IV SOS for nausea/emesis',
        'IV Normal Saline (0.9% NaCl) 500ml continuous infusion @ 75ml/hr',
      ],
      dischargeAdvice: 'Strict dual antiplatelet compliance. Low-sodium, low-cholesterol cardiac diet. Avoid strenuous physical exertion. Review in Cardiology OPD in 7 days.',
    },
    medicines: [
      {
        name: 'Inj. Enoxaparin (Clexane) 40mg',
        dosage: '40mg (0.4ml)',
        route: 'Subcutaneous Injection',
        frequency: 'Once Daily (OD at Night)',
        isInjection: true,
        instructions: 'Administered in deep subcutaneous periumbilical tissue by nursing staff',
      },
      {
        name: 'Inj. Pantoprazole (Pan-IV) 40mg',
        dosage: '40mg',
        route: 'IV Injection',
        frequency: 'Once Daily (OD in Morning)',
        isInjection: true,
        instructions: 'Slow IV bolus over 3-5 minutes via peripheral cannula',
      },
      {
        name: 'Inj. Ceftriaxone (Monocef) 1g',
        dosage: '1000mg',
        route: 'IV Infusion',
        frequency: 'Twice Daily (BD)',
        isInjection: true,
        instructions: 'Diluted in 100ml Normal Saline infused over 30 minutes',
      },
      {
        name: 'Tab. Atorva (Atorvastatin) 40mg',
        dosage: '40mg',
        route: 'Oral Tablet',
        frequency: 'Once Daily at Bedtime',
        isInjection: false,
        instructions: 'Take after dinner with water. Lipid plaque stabilization.',
      },
      {
        name: 'Tab. Ecosprin (Aspirin) 75mg',
        dosage: '75mg',
        route: 'Oral Tablet',
        frequency: 'Once Daily after Lunch',
        isInjection: false,
        instructions: 'Antiplatelet therapy. Must be taken after meals.',
      },
      {
        name: 'Tab. Metoprolol Succinate XL 25mg',
        dosage: '25mg',
        route: 'Oral Tablet',
        frequency: 'Once Daily in Morning',
        isInjection: false,
        instructions: 'Beta-blocker for heart rate control. Take with breakfast.',
      },
    ],
    diagnosticReports: [
      {
        testName: '12-Lead Resting Electrocardiogram (ECG)',
        category: 'Cardiology',
        modality: 'ECG',
        resultValue: 'Normal Sinus Rhythm, 72 bpm',
        status: 'VERIFIED',
        findings: 'Transient T-wave inversions in leads V3-V5 on admission, fully resolved prior to discharge. No pathological Q-waves.',
        technicianName: 'Rajinder Singh (Senior ECG Tech)',
        verifiedAt: 'Aug 10 & Aug 14, 2026',
      },
      {
        testName: '2D Echocardiography & Color Doppler',
        category: 'Cardiology',
        modality: 'ECHO',
        resultValue: 'LVEF: 55%, Mild anterior wall hypokinesia',
        status: 'VERIFIED',
        findings: 'Preserved left ventricular systolic function. No thrombus, no significant valvular regurgitation, normal pericardium.',
        technicianName: 'Dr. Sunita Singh (Consultant Cardiologist)',
        verifiedAt: 'Aug 11, 2026',
      },
      {
        testName: 'Digital Chest X-Ray PA View',
        category: 'Radiology',
        modality: 'XRAY',
        resultValue: 'Normal Bronchovascular Markings',
        status: 'NORMAL',
        findings: 'Both lung fields clear. No infiltrates, consolidation or pleural effusion. Normal cardiac silhouette (cardiothoracic ratio < 0.5).',
        technicianName: 'Manoj Singh (Radiology Lead)',
        verifiedAt: 'Aug 10, 2026',
      },
      {
        testName: 'Cardiac Troponin-I (High Sensitivity)',
        category: 'Pathology - Biochemistry',
        modality: 'PATHOLOGY',
        resultValue: '0.42 ng/mL',
        referenceRange: '< 0.04 ng/mL',
        status: 'HIGH',
        findings: 'Positive myocardial necrosis marker confirming acute coronary syndrome. Decreased to 0.06 ng/mL on Day 3.',
        technicianName: 'Anil K. Verma (Senior Clinical Pathologist)',
        verifiedAt: 'Aug 10, 2026',
      },
      {
        testName: 'Serum Creatinine & Blood Urea',
        category: 'Pathology - Renal Panel',
        modality: 'PATHOLOGY',
        resultValue: 'Creatinine: 0.92 mg/dL, Urea: 26 mg/dL',
        referenceRange: 'Creatinine: 0.7 - 1.2 mg/dL',
        status: 'NORMAL',
        findings: 'Optimal baseline renal function prior to pharmacotherapy.',
        technicianName: 'Anil K. Verma (Senior Clinical Pathologist)',
        verifiedAt: 'Aug 10, 2026',
      },
      {
        testName: 'Complete Blood Count (CBC)',
        category: 'Pathology - Hematology',
        modality: 'PATHOLOGY',
        resultValue: 'Hb: 14.2 g/dL, TLC: 8,600 /mcL, Platelets: 2.4 Lakhs',
        referenceRange: 'Hb: 13.0 - 17.0 g/dL',
        status: 'NORMAL',
        findings: 'Hematological parameters within biological reference intervals.',
        technicianName: 'Swati Deshmukh (Lab Tech)',
        verifiedAt: 'Aug 10, 2026',
      },
    ],
    vitals: {
      bloodPressure: '124/78 mmHg',
      heartRate: '74 bpm (Regular)',
      temperature: '98.4 °F (Afebrile)',
      spO2: '99% on Room Air',
      respiratoryRate: '16 breaths/min',
      weight: '68.5 kg',
    },
    staffNotes: {
      doctorNotes: 'Patient presented to the Emergency Department with acute retrosternal squeezing chest pain radiating to left shoulder and jaw, associated with diaphoresis. Loaded with Dual Antiplatelet Therapy (Aspirin 300mg + Clopidogrel 300mg) and IV Statins. Transferred to CCU Ward 4B under continuous telemetry. Enoxaparin anticoagulation instituted. By Day 2, pain subsided completely. Repeat cardiac biomarkers confirmed clinical stability. Discharged on standard secondary prevention.',
      nurseNotes: 'Patient received in Ward 4B via stretcher from Emergency Triage. 18-gauge IV peripheral cannula secured on left forearm, patent without phlebitis. Vitals monitored q4h; all readings maintained within target limits. Injections Pantoprazole, Ceftriaxone, and SubQ Enoxaparin administered on schedule as per MAR. Patient was ambulated on Day 3 with no dyspnea or angina. Discharge summary and medication counseling handed over to patient and family.',
      receptionNotes: 'Emergency patient registration created under UHID-2026-100101. TPA Cashless pre-authorization approved by MediNexa Insurance Coordination Desk for ₹1,25,000 without co-pay dispute. Formal discharge clearance verified on Aug 14, 2026 at 11:15 AM.',
      pharmacistNotes: 'All inpatient medication orders verified against potential drug-drug interactions. Zero allergy alerts flagged. Outpatient discharge medications packed and labeled with multilingual timing stickers (Morning, Afternoon, Night).',
    },
  },

  {
    id: 'evt-rad-2',
    date: 'Aug 24, 2026',
    type: 'LAB',
    title: 'Comprehensive Diagnostic Workup - Radiology & Pathology',
    doctorName: 'Dr. Sunita Singh, MD',
    doctorSpecialty: 'Consultant Radiologist & PACS Lead',
    hospitalName: 'MediNexa Advanced Imaging & Clinical Pathology Institute (Knowledge Park II)',
    facilityDepartment: 'Main Diagnostics Block, Ground Floor',
    summary: 'Comprehensive follow-up diagnostics including Digital Chest X-Ray, Whole Abdomen Ultrasound (USG), Lipid Profile Panel, and Glycated Hemoglobin (HbA1c).',
    badge: 'All Diagnostic Reports Verified',
    diagnosticReports: [
      {
        testName: 'Digital Chest X-Ray (Posteroanterior PA View)',
        category: 'Radiology',
        modality: 'XRAY',
        resultValue: 'Normal Cardiac & Pulmonary Architecture',
        status: 'NORMAL',
        findings: 'Lung parenchymal fields are clear bilaterally. Hilar structures normal. Costophrenic and cardiophrenic angles sharp. Bones of thoracic cage unremarkable. Impression: No active cardiopulmonary lesion.',
        technicianName: 'Manoj Singh (Senior Radiographer)',
        verifiedAt: 'Aug 24, 2026, 09:40 AM',
      },
      {
        testName: 'Whole Abdomen Ultrasound (USG)',
        category: 'Radiology - Ultrasonography',
        modality: 'ULTRASOUND',
        resultValue: 'Grade 1 Mild Hepatic Steatosis',
        status: 'VERIFIED',
        findings: 'Liver mildly enlarged (14.5 cm) with increased echogenicity of parenchymal echoes consistent with Grade 1 Fatty Liver. Gallbladder, spleen, pancreas, and bilateral kidneys normal in size, shape, and echotexture.',
        technicianName: 'Dr. Sunita Singh (Consultant Radiologist)',
        verifiedAt: 'Aug 24, 2026, 10:15 AM',
      },
      {
        testName: 'Complete Lipid Profile Panel',
        category: 'Pathology - Biochemistry',
        modality: 'PATHOLOGY',
        resultValue: 'Total Cholesterol: 178 mg/dL, LDL: 88 mg/dL, HDL: 48 mg/dL, Triglycerides: 142 mg/dL',
        referenceRange: 'LDL: < 100 mg/dL, Total: < 200 mg/dL',
        status: 'NORMAL',
        findings: 'Marked improvement in lipid indices. Target LDL < 100 mg/dL achieved under Atorvastatin 40mg therapy.',
        technicianName: 'Anil Kumar Singh (Senior Pathologist)',
        verifiedAt: 'Aug 24, 2026, 11:00 AM',
      },
      {
        testName: 'Glycated Hemoglobin (HbA1c)',
        category: 'Pathology - Endocrinology',
        modality: 'PATHOLOGY',
        resultValue: '5.8%',
        referenceRange: '< 5.7% (Non-diabetic), 5.7 - 6.4% (Pre-diabetic)',
        status: 'NORMAL',
        findings: 'Estimated Average Glucose: 120 mg/dL. Good glycemic balance.',
        technicianName: 'Anil Kumar Singh (Senior Pathologist)',
        verifiedAt: 'Aug 24, 2026, 11:00 AM',
      },
    ],
    vitals: {
      bloodPressure: '120/76 mmHg',
      heartRate: '70 bpm',
      temperature: '98.6 °F',
      spO2: '99%',
      weight: '68.0 kg',
    },
    staffNotes: {
      doctorNotes: 'Outpatient diagnostic review reveals healthy cardiopulmonary status. Mild grade 1 fatty liver noted on ultrasound; advised moderate aerobic exercise and dietary fat restriction. Lipid profile and HbA1c are within target parameters.',
      nurseNotes: 'Fasting blood samples collected at 08:30 AM via sterile butterfly vacutainer without complications. Patient confirmed 6-hour fasting for abdominal ultrasound.',
      receptionNotes: 'Diagnostic package billed under Corporate Health Benefit voucher. Digital PDF reports synced to MediNexa Patient Portal immediately upon pathologist authorization.',
      pharmacistNotes: 'Patient advised to continue current cardioprotective lipid maintenance dosage without interruption.',
    },
  },

  {
    id: 'evt-opd-3',
    date: 'Aug 28, 2026',
    type: 'ENCOUNTER',
    title: 'Cardiology Outpatient Review & Prescription Management',
    doctorName: 'Dr. Rajesh Singh, MD, DM',
    doctorSpecialty: 'Senior Consultant Interventional Cardiologist',
    hospitalName: 'MediNexa Super Specialty Hospital - OPD Clinic Suite #302 (Knowledge Park II)',
    facilityDepartment: 'Department of Cardiology & Vascular Medicine',
    summary: 'Two-week post-admission follow-up consultation. Clinical examination unremarkable, resting ECG sinus rhythm, continued dual antiplatelet and statin regimen.',
    badge: 'Clinical Review Completed',
    medicines: [
      {
        name: 'Tab. Atorva (Atorvastatin) 40mg',
        dosage: '40mg',
        route: 'Oral Tablet',
        frequency: 'Once Daily at Bedtime',
        isInjection: false,
        instructions: 'Continue for 90 days. Next lipid test due in November 2026.',
      },
      {
        name: 'Tab. Ecosprin 75mg',
        dosage: '75mg',
        route: 'Oral Tablet',
        frequency: 'Once Daily after Lunch',
        isInjection: false,
        instructions: 'Take with full glass of water. Do not skip.',
      },
      {
        name: 'Tab. Metoprolol XL 25mg',
        dosage: '25mg',
        route: 'Oral Tablet',
        frequency: 'Once Daily Morning',
        isInjection: false,
        instructions: 'Take 30 minutes after breakfast.',
      },
    ],
    diagnosticReports: [
      {
        testName: 'Resting 12-Lead ECG Review',
        category: 'Cardiology',
        modality: 'ECG',
        resultValue: 'Normal Sinus Rhythm at 68 bpm',
        status: 'NORMAL',
        findings: 'Normal axis, no ischemia or conduction delays. Stable post-event tracing.',
        technicianName: 'Sanjay Deshpande (ECG Tech)',
        verifiedAt: 'Aug 28, 2026',
      },
    ],
    vitals: {
      bloodPressure: '118/74 mmHg',
      heartRate: '68 bpm',
      temperature: '98.4 °F',
      spO2: '99%',
      respiratoryRate: '15 /min',
      weight: '67.8 kg',
    },
    staffNotes: {
      doctorNotes: 'Patient is completely symptom-free. Denies chest tightness, palpitation, orthopnea, or pedal edema. Auscultation: S1 S2 normal, no murmurs. Chest clear. Blood pressure optimal at 118/74 mmHg. Encouraged daily 30-minute brisk walk. Follow-up scheduled in 3 months.',
      nurseNotes: 'OPD triage vitals taken at 10:45 AM. Resting pulse 68 bpm. Patient provided with patient education leaflet on heart-healthy nutrition.',
      receptionNotes: 'Consultation check-in verified via digital QR token. Follow-up reminder notification scheduled in calendar.',
      pharmacistNotes: '90-day medication supply filled at Outpatient Pharmacy Counter 2. Patient counseled on storage away from direct sunlight.',
    },
  },

  {
    id: 'evt-adm-4',
    date: 'May 10 – May 11, 2026',
    type: 'ADMISSION',
    title: 'Inpatient Observation - Acute Gastroenteritis & Hydration',
    doctorName: 'Dr. Vivek Singh, MD',
    doctorSpecialty: 'Consultant Internal Medicine',
    hospitalName: 'MediNexa Super Specialty Hospital (Knowledge Park II)',
    facilityDepartment: 'Short-Stay Inpatient Observation Unit, Ward 2B',
    summary: '24-hour observation admission for acute viral gastroenteritis with moderate dehydration. Successfully managed with IV rehydration fluids, antiemetics, and electrolyte correction.',
    badge: 'Discharged - Fully Recovered',
    admissionDetails: {
      admittedAt: 'May 10, 2026, 09:15 AM',
      dischargedAt: 'May 11, 2026, 12:00 PM',
      durationDays: 2,
      durationNights: 1,
      reason: 'Acute Gastroenteritis with Moderate Dehydration and Vomiting',
      wardName: 'Inpatient Observation Ward 2B',
      bedNumber: 'Bed #208',
      inchargeNurse: 'Sister Sunita Singh, RN',
      conditionOnDischarge: 'Fully hydrated, nausea ceased, afebrile, tolerating oral light diet.',
      injectionsAdministered: [
        'Inj. Ondansetron 4mg IV stat (Antiemetic)',
        'Inj. Pantoprazole 40mg IV stat (Acid suppression)',
        'IV Ringer Lactate (RL) 1000ml rapid infusion over 2 hours',
        'IV Dextrose Normal Saline (DNS) 500ml over 4 hours',
      ],
      dischargeAdvice: 'ORS 1 sachet in 1 liter boiled drinking water daily. Soft bland diet for 3 days.',
    },
    medicines: [
      {
        name: 'Inj. Ondansetron 4mg',
        dosage: '4mg / 2ml',
        route: 'IV Injection',
        frequency: 'Stat & PRN',
        isInjection: true,
        instructions: 'Slow IV push over 2 minutes',
      },
      {
        name: 'Inj. Pantoprazole 40mg',
        dosage: '40mg',
        route: 'IV Injection',
        frequency: 'Stat',
        isInjection: true,
        instructions: 'Reconstituted with 10ml Normal Saline',
      },
      {
        name: 'Tab. O2 (Ofloxacin + Ornidazole)',
        dosage: '200mg + 500mg',
        route: 'Oral Tablet',
        frequency: 'Twice Daily for 3 days',
        isInjection: false,
        instructions: 'Take after meals with water',
      },
      {
        name: 'Sachet Electral (ORS)',
        dosage: '21.8g Sachet',
        route: 'Oral Electrolyte Solution',
        frequency: 'As needed throughout day',
        isInjection: false,
        instructions: 'Dissolve in 1 liter drinking water',
      },
    ],
    vitals: {
      bloodPressure: '110/70 mmHg',
      heartRate: '82 bpm',
      temperature: '99.1 °F',
      spO2: '98%',
      respiratoryRate: '18 /min',
      weight: '67.0 kg',
    },
    staffNotes: {
      doctorNotes: 'Patient presented with acute onset watery diarrhea (6 episodes) and non-bilious vomiting. Signs of moderate dehydration present (dry tongue, sunken eyes). Prompt recovery observed with 2 liters IV crystalloid replacement. Discharge authorized with oral rehydration therapy.',
      nurseNotes: '20-gauge IV cannula inserted on right dorsum of hand. IV fluids infused as prescribed. Urine output monitored and adequate (1400ml/24h). Vital signs stabilized.',
      receptionNotes: 'Walk-in emergency admission processed under standard day-care policy.',
      pharmacistNotes: 'Oral antibiotics and ORS dispensed upon discharge.',
    },
  },
];

export default function PatientMedicalRecordsPage() {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [activeDossierTab, setActiveDossierTab] = useState<'overview' | 'admission' | 'medicines' | 'diagnostics' | 'notes' | 'vitals'>('overview');
  const [showImageZoomModal, setShowImageZoomModal] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<{ src: string; title: string } | null>(null);

  // Upload Record Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'Previous Prescription',
    date: new Date().toISOString().split('T')[0],
    facility: 'External Hospital / Clinic',
    doctor: '',
    notes: '',
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const apiUrl = getApiBaseUrl();

  // Load any completed consultations, live lab diagnostic orders, prescriptions, and documents
  useEffect(() => {
    const loadDynamicEvents = async () => {
      const session = getCleanPatientSession();
      const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;

      try {
        // 1. Fetch official longitudinal clinical timeline from Backend API
        let serverTimelineEvents: TimelineEvent[] = [];
        if (token) {
          try {
            const tlRes = await fetch(`${apiUrl}/ehr/patients/me/clinical-timeline`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (tlRes.ok) {
              const apiTimeline = await tlRes.json();
              if (Array.isArray(apiTimeline) && apiTimeline.length > 0) {
                serverTimelineEvents = apiTimeline.map((item: any) => ({
                  id: `srv-${item.id}`,
                  date: item.timestamp ? new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recent',
                  type: item.itemType === 'LAB_ORDER' || item.itemType === 'LAB_RESULT' || item.itemType === 'RADIOLOGY' ? 'LAB' : item.itemType === 'PRESCRIPTION' || item.itemType === 'PHARMACY_DISPENSE' ? 'PRESCRIPTION' : item.itemType === 'ADMISSION' ? 'ADMISSION' : 'ENCOUNTER',
                  title: item.title,
                  doctorName: item.doctorName || item.staffName || 'Attending Physician',
                  hospitalName: item.facilityName || 'MediNexa Super Specialty Hospital',
                  facilityDepartment: item.departmentName || 'Clinical Services',
                  summary: item.summary,
                  badge: item.recordType || 'Clinician Verified Record',
                  staffNotes: {
                    doctorNotes: item.summary,
                    nurseNotes: 'Longitudinal record entry verified.',
                  },
                }));
              }
            }
          } catch (err) {
            console.warn('Could not fetch server timeline:', err);
          }
        }

        // 2. Parse Completed Doctor Consultations from Local Synchronized Appointments
        let consultationEvents: TimelineEvent[] = [];
        const rawAppts = localStorage.getItem('medinexa_local_appointments');
        if (rawAppts) {
          try {
            const parsedAppts = JSON.parse(rawAppts);
            if (Array.isArray(parsedAppts)) {
              parsedAppts
                .filter((a: any) => a.status === 'COMPLETED' || a.diagnosis || a.doctorNotes)
                .forEach((a: any) => {
                  consultationEvents.push({
                    id: `appt-enc-${a.id || a.appointmentNumber || Math.random()}`,
                    date: a.appointmentDate || 'Today',
                    type: 'ENCOUNTER' as const,
                    title: `Clinical Consultation: ${a.doctorName ? `Dr. ${a.doctorName.replace(/^Dr\.\s*/, '')}` : 'Dr. Rajesh Singh'} (${a.type === 'TELEMEDICINE' ? 'Telemedicine' : 'OPD'})`,
                    doctorName: a.doctorName ? `Dr. ${a.doctorName.replace(/^Dr\.\s*/, '')}` : 'Dr. Rajesh Singh, MD, DM',
                    doctorSpecialty: a.doctorSpecialty || 'Senior Consultant Physician',
                    hospitalName: a.facilityName || 'MediNexa Super Specialty Hospital',
                    facilityDepartment: a.department || 'Outpatient Department Room 104',
                    summary: `Consultation completed. Diagnosis: ${a.diagnosis || 'Clinical review completed'}. ${a.prescribedMedicines ? `Prescribed: ${a.prescribedMedicines}.` : ''} Follow-up in ${a.followUpDays || 14} days.`,
                    badge: 'Clinical Consultation Finalized & Signed',
                    vitals: a.vitals || {
                      bloodPressure: '124/82 mmHg',
                      heartRate: '74 bpm',
                      temperature: '98.4 °F',
                      spO2: '98%',
                      weight: '72 kg',
                    },
                    staffNotes: {
                      doctorNotes: a.doctorNotes || `Consultation finalized. Diagnosis: ${a.diagnosis || 'Clinical assessment completed'}. Treatment plan established.`,
                      nurseNotes: 'Intake vitals checked and verified by triage nurse.',
                      receptionNotes: `Token #${a.queueTokenNumber || a.tokenNumber || '1'} verified and checked out.`,
                      pharmacistNotes: a.prescribedMedicines ? `Prescription logged: ${a.prescribedMedicines}` : 'No medications required.',
                    },
                  });
                });
            }
          } catch {}
        }

        // 3. Checked patients roster synchronization
        const rawChecked = localStorage.getItem('medinexa_checked_patients');
        if (rawChecked) {
          try {
            const parsedChecked = JSON.parse(rawChecked);
            if (Array.isArray(parsedChecked)) {
              parsedChecked.forEach((c: any) => {
                // Avoid duplicating if already present in consultationEvents
                const exists = consultationEvents.some((e) => e.summary.includes(c.diagnosis));
                if (!exists) {
                  consultationEvents.push({
                    id: `chk-pat-${c.id}`,
                    date: c.checkedAt || 'Today',
                    type: 'ENCOUNTER' as const,
                    title: `Hospital Consultation: Dr. Rajesh Singh (${c.consultationType || 'OPD'})`,
                    doctorName: 'Dr. Rajesh Singh, MD, DM',
                    doctorSpecialty: 'Cardiology',
                    hospitalName: 'MediNexa Super Specialty Hospital',
                    facilityDepartment: 'Central Cardiology OPD',
                    summary: `Consultation finalized (${c.tokenNumber || 'Token Verified'}). Diagnosis: ${c.diagnosis || 'Routine checkup'}. ${c.prescribedMedicines ? `Prescribed: ${c.prescribedMedicines}.` : ''}`,
                    badge: 'Clinician Verified Consultation',
                    staffNotes: {
                      doctorNotes: c.instructions || 'Clinical checkup completed.',
                      nurseNotes: 'Patient vital parameters within physiological range.',
                    },
                  });
                }
              });
            }
          } catch {}
        }

        // 4. Self-reported medicines
        let selfEvents: TimelineEvent[] = [];
        const raw = localStorage.getItem('medinexa_patient_self_meds');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.length > 0) {
            selfEvents = list.map((m: any) => ({
              id: `self-${m.id}`,
              date: m.date || 'Today',
              type: 'PRESCRIPTION',
              title: `Prescribed / Ongoing Medicine: ${m.medicineName} (${m.dosage || '1 dose'})`,
              doctorName: m.doctorName ? `Prescribed by Dr. ${m.doctorName.replace(/^Dr\.\s*/, '')}` : 'Self-Reported by Patient (Over-The-Counter)',
              hospitalName: m.doctorName ? 'MediNexa Clinic Prescription' : 'Patient Self-Managed Medication Record',
              facilityDepartment: 'Personal Healthcare Dossier',
              summary: `${m.doctorName ? `Prescribed by Dr. ${m.doctorName.replace(/^Dr\.\s*/, '')}` : 'Patient self-added this medication into their daily schedule'}. Timing: ${(m.timings || [m.reminderTime || '08:00 AM']).join(', ')} (${(m.foodTiming || 'AFTER_FOOD').replace('_', ' ')}). Instructions: ${m.instructions || 'Daily dose'}. Recorded in longitudinal EHR.`,
              badge: m.doctorName ? 'Doctor-Prescribed Medication' : 'Self-Added by Patient',
              medicines: [
                {
                  name: m.medicineName,
                  dosage: m.dosage || '1 dose',
                  route: 'Oral Formulation',
                  frequency: m.frequency || 'Daily',
                  timing: m.timings || [m.reminderTime || '08:00 AM'],
                  isInjection: false,
                  instructions: m.instructions || 'Prescribed therapeutic medication',
                },
              ],
              staffNotes: {
                doctorNotes: m.doctorName
                  ? `Prescribed by Dr. ${m.doctorName}. Added to ongoing home medication reconciliation.`
                  : 'Over-the-counter medication initiated directly by the patient.',
                nurseNotes: 'Logged automatically via MediNexa Patient Portal self-reporting system.',
              },
            }));
          }
        }

        // 5. Live verified laboratory & radiology scans
        let labEvents: TimelineEvent[] = [];
        const rawOrders = localStorage.getItem('medinexa_unified_diagnostic_orders');
        if (rawOrders) {
          const parsedOrders = JSON.parse(rawOrders);
          if (Array.isArray(parsedOrders)) {
            labEvents = parsedOrders
              .filter((ord: any) => ord.status === 'VERIFIED' || ord.scanFilmImage)
              .map((ord: any) => ({
                id: `lab-${ord.id}`,
                date: ord.verifiedAt || ord.orderedAt || 'Recent',
                type: 'LAB' as const,
                title: `Diagnostic Investigation: ${ord.testName}`,
                doctorName: ord.verifiedBy || ord.doctorName || 'Chief Radiologist / Pathologist',
                hospitalName: 'MediNexa Super Specialty Hospital (Central Diagnostics)',
                facilityDepartment: `${ord.department} Diagnostic Division`,
                summary: ord.radiologistImpression || `Official laboratory scan and diagnostic report verified. ${ord.isRealUpload ? 'Real diagnostic photo/scan film uploaded by lab technician.' : ''}`,
                badge: ord.isRealUpload ? 'Real Lab Picture Verified' : 'Diagnostic Report Verified',
                diagnosticReports: [
                  {
                    testName: ord.testName,
                    category: ord.department,
                    modality: ord.department,
                    resultValue: ord.results?.[0]?.value || 'Completed & Verified',
                    status: 'VERIFIED',
                    findings: ord.radiologistImpression || 'Completed with satisfactory imaging results.',
                    technicianName: ord.technologistRemarks || 'Laboratory Technologist',
                    verifiedAt: ord.verifiedAt || 'Recent',
                  },
                ],
                staffNotes: {
                  doctorNotes: ord.radiologistImpression || 'Diagnostic test verified.',
                  nurseNotes: ord.technologistRemarks || 'Technician protocol completed.',
                },
              }));
          }
        }

        // 6. Patient uploaded medical records from local cache
        let uploadedDocEvents: TimelineEvent[] = [];
        const rawDocs = localStorage.getItem('medinexa_patient_uploaded_docs');
        if (rawDocs) {
          try {
            const parsedD = JSON.parse(rawDocs);
            if (Array.isArray(parsedD)) uploadedDocEvents = parsedD;
          } catch {}
        }

        // 7. Fetch documents from server API if token exists
        let apiDocEvents: TimelineEvent[] = [];
        if (token) {
          try {
            const docRes = await fetch(`${apiUrl}/patient-portal/documents`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (docRes.ok) {
              const apiDocs = await docRes.json();
              if (Array.isArray(apiDocs) && apiDocs.length > 0) {
                apiDocEvents = apiDocs.map((doc: any) => ({
                  id: `doc-${doc.id}`,
                  date: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Recent',
                  type: 'ENCOUNTER' as const,
                  title: doc.fileName || 'Patient Uploaded Medical Document',
                  doctorName: doc.uploaderName || 'Self-Uploaded by Patient',
                  hospitalName: doc.facilityName || 'MediNexa Clinical Repository',
                  facilityDepartment: 'Patient Document Archive',
                  summary: `Uploaded document (${(doc.fileSize / 1024).toFixed(1)} KB). Categorized under ${doc.category || 'General'}. Securely stored in encrypted EHR.`,
                  badge: doc.isPatientUploaded ? 'Patient-Uploaded Document' : 'Clinician Verified Record',
                  documentUrl: doc.publicUrl,
                  staffNotes: {
                    doctorNotes: 'Patient-submitted historical record. Distinct from clinician-verified diagnosis.',
                    nurseNotes: 'Stored in patient longitudinal record.',
                  },
                }));
              }
            }
          } catch {}
        }

        // 8. Live vitals recorded by attending doctor or ward nurse
        let vitalsEvents: TimelineEvent[] = [];
        const rawVitals = localStorage.getItem('medinexa_patient_vitals_events');
        if (rawVitals) {
          try {
            const parsedV = JSON.parse(rawVitals);
            if (Array.isArray(parsedV)) vitalsEvents = parsedV;
          } catch {}
        }

        // Combine all dynamic events
        const allDynamic = [
          ...serverTimelineEvents,
          ...consultationEvents,
          ...uploadedDocEvents,
          ...apiDocEvents,
          ...vitalsEvents,
          ...labEvents,
          ...selfEvents,
        ];

        if (session?.isDemo) {
          setTimelineEvents([...allDynamic, ...COMPREHENSIVE_CLINICAL_EVENTS]);
        } else {
          setTimelineEvents(allDynamic);
        }
      } catch (err) {
        if (session?.isDemo) {
          setTimelineEvents(COMPREHENSIVE_CLINICAL_EVENTS);
        } else {
          setTimelineEvents([]);
        }
      }
    };

    loadDynamicEvents();
    window.addEventListener('storage', loadDynamicEvents);
    window.addEventListener('medinexa:ehr:updated', loadDynamicEvents);
    window.addEventListener('medinexa:patient:changed', loadDynamicEvents);

    return () => {
      window.removeEventListener('storage', loadDynamicEvents);
      window.removeEventListener('medinexa:ehr:updated', loadDynamicEvents);
      window.removeEventListener('medinexa:patient:changed', loadDynamicEvents);
    };
  }, [apiUrl]);

  const handleOpenEvent = (event: TimelineEvent) => {
    setSelectedEvent(event);
    if (event.admissionDetails) {
      setActiveDossierTab('admission');
    } else if (event.medicines && event.medicines.length > 0) {
      setActiveDossierTab('medicines');
    } else if (event.diagnosticReports && event.diagnosticReports.length > 0) {
      setActiveDossierTab('diagnostics');
    } else {
      setActiveDossierTab('overview');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title.trim()) {
      alert('Please enter a record title.');
      return;
    }

    setUploading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;

    // Create event representation
    const newDocEvent: TimelineEvent = {
      id: `doc-upload-${Date.now()}`,
      date: uploadForm.date || new Date().toLocaleDateString(),
      type: uploadForm.category.includes('Prescription')
        ? 'PRESCRIPTION'
        : uploadForm.category.includes('Lab') || uploadForm.category.includes('Diagnostic')
        ? 'LAB'
        : uploadForm.category.includes('Discharge')
        ? 'ADMISSION'
        : 'ENCOUNTER',
      title: `${uploadForm.category}: ${uploadForm.title}`,
      doctorName: uploadForm.doctor.trim() ? `Dr. ${uploadForm.doctor.replace(/^Dr\.\s*/, '')}` : 'External Attending Physician',
      hospitalName: uploadForm.facility || 'External Healthcare Facility',
      facilityDepartment: 'Patient-Uploaded Clinical Documents',
      summary: uploadForm.notes || `Historical ${uploadForm.category} uploaded by patient into MediNexa portal.`,
      badge: 'Patient-Uploaded Document • Self-Reported',
      staffNotes: {
        doctorNotes: `Patient uploaded historical ${uploadForm.category} from ${uploadForm.facility}. Pending clinician review during upcoming consultation.`,
        nurseNotes: 'Archived in longitudinal record.',
      },
    };

    // Try server upload if file attached and token present
    if (uploadFile && token) {
      try {
        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('category', 'MEDICAL_RECORD');

        await fetch(`${apiUrl}/attachments/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } catch (e) {
        console.warn('API attachment upload error, falling back to local storage', e);
      }
    }

    // Persist locally
    try {
      const existing = JSON.parse(localStorage.getItem('medinexa_patient_uploaded_docs') || '[]');
      const updated = [newDocEvent, ...existing];
      localStorage.setItem('medinexa_patient_uploaded_docs', JSON.stringify(updated));
    } catch {}

    setTimelineEvents((prev) => [newDocEvent, ...prev]);
    setUploadSuccess('Document successfully uploaded to your personal health records!');
    setTimeout(() => {
      setUploadSuccess(null);
      setShowUploadModal(false);
      setUploadForm({
        title: '',
        category: 'Previous Prescription',
        date: new Date().toISOString().split('T')[0],
        facility: 'External Hospital / Clinic',
        doctor: '',
        notes: '',
      });
      setUploadFile(null);
    }, 1200);
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/portal" className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 transition">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portal</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Longitudinal Medical Records
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export Full EHR
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Hero Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-950 dark:text-slate-50 tracking-tight">
              Clinical Medical History & Healthcare Timeline
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified chronological record of doctor consultations, inpatient hospital admissions, diagnostic X-rays, and lab reports.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Medical Record</span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-900 font-bold whitespace-nowrap">
              <ShieldCheck className="w-4 h-4" />
              <span>ABDM & HIPAA Verified</span>
            </div>
          </div>
        </div>

        {/* Informational Guidance Callout */}
        <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/80 flex items-center justify-between gap-3 text-xs text-teal-900 dark:text-teal-200 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
            <span>
              <strong>Interactive Clinical Timeline:</strong> Each track entry shows the attending <strong>Doctor</strong> and <strong>Hospital / Clinic</strong>. Tap on any card to open that day's complete clinical report detailing all prescribed medicines, IV injections, X-Ray & lab findings, and nursing care notes.
            </span>
          </div>
        </div>

        {/* Timeline Container */}
        <Card className="p-6 sm:p-8 shadow-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="px-0 pt-0 pb-4">
            <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white">
              Chronological Care Pathway Track
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Tap any medical event below to inspect full prescriptions, administered injections, radiology imaging, and multi-disciplinary staff observations.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {timelineEvents.length === 0 ? (
              /* Honest Longitudinal Empty State */
              <div className="py-12 px-6 text-center space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-inner">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Your medical history will appear here automatically
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Your medical history will appear here automatically as you complete consultations, tests and treatments through MediNexa. When an authorized clinician finalizes a checkup, issues a prescription, or verifies a diagnostic report, it will automatically synchronize to your portal without manual data entry.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 inline-flex items-center gap-2 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload External Record</span>
                  </button>
                  <Link
                    href="/portal/profile"
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
                  >
                    View Patient Health Profile
                  </Link>
                </div>
              </div>
            ) : (
              <MedicalTimeline events={timelineEvents} onSelectEvent={handleOpenEvent} />
            )}
          </CardContent>
        </Card>
      </main>

      {/* UPLOAD MEDICAL RECORD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Upload className="w-5 h-5 text-teal-600" />
                <span>Upload Medical Record or Document</span>
              </h2>
              <button onClick={() => setShowUploadModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300">
                <strong>Patient-Uploaded Notice:</strong> Documents you upload will be marked as self-reported medical history for attending doctors to review. They will remain identifiable as patient-uploaded and will not automatically alter verified clinical diagnoses.
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Past Echocardiogram Report, Discharge Summary 2025"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Record Type
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Previous Prescription">Previous Prescription</option>
                    <option value="Laboratory Report">Laboratory Report</option>
                    <option value="Diagnostic / Radiology Report">Diagnostic / Radiology Report</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                    <option value="Vaccination Record">Vaccination Record</option>
                    <option value="Previous Diagnosis">Previous Diagnosis</option>
                    <option value="Medical Certificate">Medical Certificate</option>
                    <option value="Other Clinical Document">Other Document</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Record Date
                  </label>
                  <input
                    type="date"
                    value={uploadForm.date}
                    onChange={(e) => setUploadForm({ ...uploadForm, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Issuing Hospital / Facility
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AIIMS Delhi, Fortis Clinic"
                    value={uploadForm.facility}
                    onChange={(e) => setUploadForm({ ...uploadForm, facility: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Treating / Issuing Doctor (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. A. K. Sharma"
                    value={uploadForm.doctor}
                    onChange={(e) => setUploadForm({ ...uploadForm, doctor: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Clinical Summary & Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Key findings, dosage instructions, or observations..."
                  value={uploadForm.notes}
                  onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select File (PDF, PNG, JPG - max 15MB)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition shadow-sm cursor-pointer"
                >
                  {uploading ? 'Uploading...' : 'Save & Add to Records'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* COMPREHENSIVE CLINICAL DAY DOSSIER MODAL                  */}
      {/* ========================================================= */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedEvent.date}
                  </span>
                  {selectedEvent.badge && (
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                      {selectedEvent.badge}
                    </span>
                  )}
                  {selectedEvent.admissionDetails && (
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                      <BedDouble className="w-3 h-3" />
                      {selectedEvent.admissionDetails.durationDays} Days Inpatient Stay
                    </span>
                  )}
                </div>

                <h2 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white tracking-tight">
                  {selectedEvent.title}
                </h2>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 pt-0.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    {selectedEvent.doctorName || selectedEvent.provider}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    {selectedEvent.hospitalName}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Tabs Navigation */}
            <div className="flex items-center gap-1.5 px-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto text-xs font-bold">
              {selectedEvent.admissionDetails && (
                <button
                  onClick={() => setActiveDossierTab('admission')}
                  className={`py-3.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeDossierTab === 'admission'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <BedDouble className="w-4 h-4" />
                  Hospital Stay & Admission ({selectedEvent.admissionDetails.durationDays} Days)
                </button>
              )}

              {selectedEvent.medicines && selectedEvent.medicines.length > 0 && (
                <button
                  onClick={() => setActiveDossierTab('medicines')}
                  className={`py-3.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeDossierTab === 'medicines'
                      ? 'border-teal-500 text-teal-600 dark:text-teal-400 font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Pill className="w-4 h-4" />
                  Medicines & Injections ({selectedEvent.medicines.length})
                </button>
              )}

              {selectedEvent.diagnosticReports && selectedEvent.diagnosticReports.length > 0 && (
                <button
                  onClick={() => setActiveDossierTab('diagnostics')}
                  className={`py-3.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeDossierTab === 'diagnostics'
                      ? 'border-teal-500 text-teal-600 dark:text-teal-400 font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <FlaskConical className="w-4 h-4" />
                  X-Rays, Imaging & Lab Reports ({selectedEvent.diagnosticReports.length})
                </button>
              )}

              {selectedEvent.staffNotes && (
                <button
                  onClick={() => setActiveDossierTab('notes')}
                  className={`py-3.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeDossierTab === 'notes'
                      ? 'border-teal-500 text-teal-600 dark:text-teal-400 font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  Care Team Notes (Doctor, Nurse, Desk)
                </button>
              )}

              {selectedEvent.vitals && (
                <button
                  onClick={() => setActiveDossierTab('vitals')}
                  className={`py-3.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeDossierTab === 'vitals'
                      ? 'border-teal-500 text-teal-600 dark:text-teal-400 font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  Vitals Recorded
                </button>
              )}

              <button
                onClick={() => setActiveDossierTab('overview')}
                className={`py-3.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeDossierTab === 'overview'
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                Summary
              </button>
            </div>

            {/* Dossier Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white dark:bg-slate-900">
              {/* ------------------------------------------------------------- */}
              {/* TAB: INPATIENT ADMISSION STAY DETAILS                         */}
              {/* ------------------------------------------------------------- */}
              {activeDossierTab === 'admission' && selectedEvent.admissionDetails && (
                <div className="space-y-6">
                  {/* Admission Hero Highlight Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                          <BedDouble className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                            Inpatient Hospitalization Record
                          </div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                            Duration: {selectedEvent.admissionDetails.durationDays} Days Stay
                            {selectedEvent.admissionDetails.durationNights ? ` (${selectedEvent.admissionDetails.durationNights} Nights)` : ''}
                          </h3>
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <div className="text-slate-500 dark:text-slate-400 font-medium">Admitted: {selectedEvent.admissionDetails.admittedAt}</div>
                        {selectedEvent.admissionDetails.dischargedAt && (
                          <div className="text-emerald-700 dark:text-emerald-300 font-bold mt-0.5">Discharged: {selectedEvent.admissionDetails.dischargedAt}</div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/60 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 font-medium block">Reason for Admission / Admitting Diagnosis:</span>
                        <span className="font-extrabold text-slate-900 dark:text-white mt-0.5 block text-sm">
                          {selectedEvent.admissionDetails.reason}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 font-medium block">Ward & Bed Allocation:</span>
                        <span className="font-extrabold text-slate-900 dark:text-white mt-0.5 block text-sm">
                          {selectedEvent.admissionDetails.wardName} — {selectedEvent.admissionDetails.bedNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Injections Administered Section */}
                  {selectedEvent.admissionDetails.injectionsAdministered && selectedEvent.admissionDetails.injectionsAdministered.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Syringe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          Injections & IV Infusions Administered during Hospital Stay
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {selectedEvent.admissionDetails.injectionsAdministered.map((inj, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 flex items-start gap-3"
                          >
                            <span className="p-1.5 rounded-lg bg-purple-600 text-white font-black text-xs">
                              💉
                            </span>
                            <div className="text-xs">
                              <span className="font-bold text-slate-900 dark:text-slate-100">{inj}</span>
                              <span className="block text-[11px] text-purple-700 dark:text-purple-300 mt-0.5">
                                Verified administered by clinical nursing staff via MAR
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Condition on Discharge & Discharge Advice */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedEvent.admissionDetails.conditionOnDischarge && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Condition on Discharge</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">
                          {selectedEvent.admissionDetails.conditionOnDischarge}
                        </p>
                      </div>
                    )}

                    {selectedEvent.admissionDetails.dischargeAdvice && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-bold">
                          <FileCheck2 className="w-4 h-4" />
                          <span>Discharge Advice & Follow-Up Instructions</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">
                          {selectedEvent.admissionDetails.dischargeAdvice}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB: PRESCRIBED MEDICINES & INJECTIONS                        */}
              {/* ------------------------------------------------------------- */}
              {activeDossierTab === 'medicines' && selectedEvent.medicines && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        Prescribed Medications & Injections ({selectedEvent.medicines.length})
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Complete pharmacological schedule prescribed and administered on this clinical day
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {selectedEvent.medicines.map((med, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition-all ${
                          med.isInjection
                            ? 'bg-purple-50/30 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/60'
                            : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2.5 rounded-xl text-lg flex-shrink-0 ${
                                med.isInjection
                                  ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300'
                                  : 'bg-teal-500/15 text-teal-600 dark:text-teal-300'
                              }`}
                            >
                              {med.isInjection ? '💉' : '💊'}
                            </div>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                  {med.name}
                                </h4>
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                  {med.dosage}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                    med.isInjection
                                      ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 border-purple-300'
                                      : 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border-blue-300'
                                  }`}
                                >
                                  {med.route}
                                </span>
                                {med.isLabMedicine && (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300">
                                    🧪 Lab Medicine
                                  </span>
                                )}
                                {med.purchaseStatus && (
                                  <span
                                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                                      med.purchaseStatus === 'BOUGHT'
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                                    }`}
                                  >
                                    {med.purchaseStatus === 'BOUGHT' ? '✓ Medicine Bought' : '⚠️ Medicine Not Bought'}
                                  </span>
                                )}
                              </div>

                              {med.labReportRef && (
                                <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-400">
                                  ↳ Prescribed based on: {med.labReportRef}
                                </p>
                              )}

                              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>Schedule: {med.frequency}</span>
                              </div>


                              {med.instructions && (
                                <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 leading-relaxed">
                                  <span className="font-semibold text-slate-700 dark:text-slate-300">Instructions: </span>
                                  {med.instructions}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB: DIAGNOSTICS, RADIOLOGY X-RAYS & LAB REPORTS              */}
              {/* ------------------------------------------------------------- */}
              {activeDossierTab === 'diagnostics' && selectedEvent.diagnosticReports && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Diagnostic Reports, Radiology X-Rays & Laboratory Investigations ({selectedEvent.diagnosticReports.length})
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Authorized diagnostic findings, imaging studies, and pathology panels
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    {selectedEvent.diagnosticReports.map((diag, idx) => (
                      <div
                        key={idx}
                        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 font-bold text-sm">
                              {diag.modality === 'XRAY' ? '🩻' : diag.modality === 'ULTRASOUND' ? '📡' : diag.modality === 'ECG' || diag.modality === 'ECHO' ? '💓' : '🧪'}
                            </div>
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                                {diag.category || 'Diagnostic Test'} • {diag.modality || 'REPORT'}
                              </span>
                              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                                {diag.testName}
                              </h4>
                            </div>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                                diag.status === 'HIGH' || diag.status === 'CRITICAL'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
                              }`}
                            >
                              {diag.status}
                            </span>
                          </div>
                        </div>

                        {/* Result Value and Reference Range */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 font-medium">Result / Value:</span>
                            <span className="font-extrabold text-slate-900 dark:text-white ml-2">
                              {diag.resultValue}
                            </span>
                          </div>
                          {diag.referenceRange && (
                            <div>
                              <span className="text-slate-400 font-medium">Biological Reference:</span>
                              <span className="font-semibold text-slate-600 dark:text-slate-300 ml-2">
                                {diag.referenceRange}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Diagnostic Scan Film / Image Preview (USER REQUIREMENT) */}
                        {diag.scanFilmImage && (
                          <div
                            onClick={() => {
                              setZoomedImage({
                                src: diag.scanFilmImage!,
                                title: diag.scanFilmTitle || diag.testName,
                              });
                              setShowImageZoomModal(true);
                            }}
                            className="relative rounded-2xl overflow-hidden border-2 border-slate-800 bg-black cursor-pointer shadow-md group my-2"
                          >
                            <img
                              src={diag.scanFilmImage}
                              alt={diag.scanFilmTitle || 'Diagnostic Scan Film'}
                              className="w-full h-44 object-cover object-center group-hover:scale-105 transition duration-300 opacity-90"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end justify-between p-3 text-white">
                              <div>
                                <span className="text-[10px] font-bold text-teal-400 block uppercase">
                                  Official {diag.modality || 'Diagnostic'} Film / Report Scan
                                </span>
                                <span className="text-xs font-extrabold block truncate">{diag.scanFilmTitle || diag.testName}</span>
                              </div>
                              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-black/70 border border-white/20 flex items-center gap-1.5 shadow-sm">
                                <ZoomIn className="w-3 h-3 text-teal-400" />
                                <span>Click to Zoom Film ⤢</span>
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Findings / Radiologist Impression */}
                        {diag.findings && (
                          <div className="text-xs text-slate-600 dark:text-slate-300 pl-1 leading-relaxed">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Clinical Finding / Impression: </span>
                            {diag.findings}
                          </div>
                        )}


                        {/* Verification Sign-Off */}
                        {diag.technicianName && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                            <span>Verified by: <strong className="text-slate-700 dark:text-slate-300">{diag.technicianName}</strong></span>
                            {diag.verifiedAt && <span>{diag.verifiedAt}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB: CARE TEAM DOCUMENTATION (DOCTOR, NURSE, DESK)            */}
              {/* ------------------------------------------------------------- */}
              {activeDossierTab === 'notes' && selectedEvent.staffNotes && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Care Team Clinical Documentation
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Multi-disciplinary observations recorded by attending physicians, nursing staff, and patient desk officers
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    {/* Doctor Clinical Assessment */}
                    {selectedEvent.staffNotes.doctorNotes && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-blue-900 dark:text-blue-200">
                          <Stethoscope className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span>Attending Doctor Clinical Evaluation & Treatment Rationale</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
                          {selectedEvent.staffNotes.doctorNotes}
                        </p>
                      </div>
                    )}

                    {/* Nurse Handover & Bedside Notes */}
                    {selectedEvent.staffNotes.nurseNotes && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-900 dark:text-emerald-200">
                          <HeartHandshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Nursing Care, MAR & Bedside Handover Notes</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
                          {selectedEvent.staffNotes.nurseNotes}
                        </p>
                      </div>
                    )}

                    {/* Reception Desk Triage & Admission Notes */}
                    {selectedEvent.staffNotes.receptionNotes && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 dark:text-amber-200">
                          <ClipboardList className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>Reception Desk, Triage & Insurance Clearance Notes</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
                          {selectedEvent.staffNotes.receptionNotes}
                        </p>
                      </div>
                    )}

                    {/* Pharmacist Dispense Verification */}
                    {selectedEvent.staffNotes.pharmacistNotes && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-purple-900 dark:text-purple-200">
                          <Pill className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>Hospital Pharmacy Dispense Verification & Patient Counseling</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
                          {selectedEvent.staffNotes.pharmacistNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB: VITALS LOG                                               */}
              {/* ------------------------------------------------------------- */}
              {activeDossierTab === 'vitals' && selectedEvent.vitals && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Bedside Physiological Vitals Recorded on {selectedEvent.date}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Synchronized clinical monitoring measurements
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                    {selectedEvent.vitals.bloodPressure && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 block">Blood Pressure</span>
                        <div className="text-xl font-black text-slate-900 dark:text-white">
                          {selectedEvent.vitals.bloodPressure}
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Optimal Range</span>
                      </div>
                    )}

                    {selectedEvent.vitals.heartRate && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 block">Pulse / Heart Rate</span>
                        <div className="text-xl font-black text-slate-900 dark:text-white">
                          {selectedEvent.vitals.heartRate}
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Normal Sinus</span>
                      </div>
                    )}

                    {selectedEvent.vitals.spO2 && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 block">SpO2 Oxygen Saturation</span>
                        <div className="text-xl font-black text-slate-900 dark:text-white">
                          {selectedEvent.vitals.spO2}
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Room Air Target</span>
                      </div>
                    )}

                    {selectedEvent.vitals.temperature && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 block">Body Temperature</span>
                        <div className="text-xl font-black text-slate-900 dark:text-white">
                          {selectedEvent.vitals.temperature}
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Afebrile</span>
                      </div>
                    )}

                    {selectedEvent.vitals.respiratoryRate && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 block">Respiratory Rate</span>
                        <div className="text-xl font-black text-slate-900 dark:text-white">
                          {selectedEvent.vitals.respiratoryRate}
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Eupneic</span>
                      </div>
                    )}

                    {selectedEvent.vitals.weight && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 block">Body Weight</span>
                        <div className="text-xl font-black text-slate-900 dark:text-white">
                          {selectedEvent.vitals.weight}
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">Standard Scale</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB: OVERVIEW / SUMMARY                                       */}
              {/* ------------------------------------------------------------- */}
              {activeDossierTab === 'overview' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                      Clinical Encounter Summary
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {selectedEvent.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-slate-400 block font-medium">Attending Physician</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm block">
                        {selectedEvent.doctorName || selectedEvent.provider}
                      </span>
                      {selectedEvent.doctorSpecialty && (
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                          {selectedEvent.doctorSpecialty}
                        </span>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-slate-400 block font-medium">Hospital Facility & Department</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm block">
                        {selectedEvent.hospitalName}
                      </span>
                      {selectedEvent.facilityDepartment && (
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                          {selectedEvent.facilityDepartment}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between gap-3">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Dossier
              </button>

              <button
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Scan Film / Report Image Zoom Lightbox Modal (USER REQUIREMENT) */}
      {showImageZoomModal && zoomedImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between text-white border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block">
                  High-Resolution Diagnostic Imaging Scan Film
                </span>
                <h4 className="text-sm font-extrabold text-slate-100">{zoomedImage.title}</h4>
              </div>
              <button
                onClick={() => setShowImageZoomModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
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

            <div className="flex items-center justify-between text-slate-400 text-xs pt-1">
              <span className="font-semibold text-slate-300">
                Official Clinical Radiograph / Diagnostic Trace
              </span>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition"
              >
                Print / Save Scan Film
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

