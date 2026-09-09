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
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, MedicalTimeline, TimelineEvent } from '@/components/ui';

const COMPREHENSIVE_CLINICAL_EVENTS: TimelineEvent[] = [
  {
    id: 'evt-adm-1',
    date: 'Aug 10 – Aug 14, 2026',
    type: 'ADMISSION',
    title: 'Inpatient Hospital Admission - Acute Coronary Care Unit',
    doctorName: 'Dr. Rajesh Sharma, MD, DM',
    doctorSpecialty: 'Senior Consultant Interventional Cardiologist',
    hospitalName: 'Apollo MediNexa Super Specialty Hospital',
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
      inchargeNurse: 'Sister Priya Nair, RN (Critical Care Lead)',
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
        technicianName: 'Rajinder Kumar (Senior ECG Tech)',
        verifiedAt: 'Aug 10 & Aug 14, 2026',
      },
      {
        testName: '2D Echocardiography & Color Doppler',
        category: 'Cardiology',
        modality: 'ECHO',
        resultValue: 'LVEF: 55%, Mild anterior wall hypokinesia',
        status: 'VERIFIED',
        findings: 'Preserved left ventricular systolic function. No thrombus, no significant valvular regurgitation, normal pericardium.',
        technicianName: 'Dr. Sunita Kulkarni (Consultant Cardiologist)',
        verifiedAt: 'Aug 11, 2026',
      },
      {
        testName: 'Digital Chest X-Ray PA View',
        category: 'Radiology',
        modality: 'XRAY',
        resultValue: 'Normal Bronchovascular Markings',
        status: 'NORMAL',
        findings: 'Both lung fields clear. No infiltrates, consolidation or pleural effusion. Normal cardiac silhouette (cardiothoracic ratio < 0.5).',
        technicianName: 'Manoj Sinha (Radiology Lead)',
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
    doctorName: 'Dr. Sunita Kulkarni, MD',
    doctorSpecialty: 'Consultant Radiologist & PACS Lead',
    hospitalName: 'MediNexa Advanced Imaging & Clinical Pathology Institute',
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
        technicianName: 'Manoj Sinha (Senior Radiographer)',
        verifiedAt: 'Aug 24, 2026, 09:40 AM',
      },
      {
        testName: 'Whole Abdomen Ultrasound (USG)',
        category: 'Radiology - Ultrasonography',
        modality: 'ULTRASOUND',
        resultValue: 'Grade 1 Mild Hepatic Steatosis',
        status: 'VERIFIED',
        findings: 'Liver mildly enlarged (14.5 cm) with increased echogenicity of parenchymal echoes consistent with Grade 1 Fatty Liver. Gallbladder, spleen, pancreas, and bilateral kidneys normal in size, shape, and echotexture.',
        technicianName: 'Dr. Sunita Kulkarni (Consultant Radiologist)',
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
        technicianName: 'Anil K. Verma (Senior Pathologist)',
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
        technicianName: 'Anil K. Verma (Senior Pathologist)',
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
    doctorName: 'Dr. Rajesh Sharma, MD, DM',
    doctorSpecialty: 'Senior Consultant Interventional Cardiologist',
    hospitalName: 'Apollo MediNexa Hospital - OPD Clinic Suite #302',
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
    doctorName: 'Dr. Vivek Mishra, MD',
    doctorSpecialty: 'Consultant Internal Medicine',
    hospitalName: 'Apollo MediNexa Community Hospital',
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
      inchargeNurse: 'Sister Sunita Rao, RN',
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
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(COMPREHENSIVE_CLINICAL_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [activeDossierTab, setActiveDossierTab] = useState<'overview' | 'admission' | 'medicines' | 'diagnostics' | 'notes' | 'vitals'>('overview');

  // Load any self-reported medicines added by the patient from localStorage
  useEffect(() => {
    const loadSelfReportedMeds = () => {
      try {
        const raw = localStorage.getItem('medinexa_patient_self_meds');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.length > 0) {
            const selfEvents: TimelineEvent[] = list.map((m: any) => ({
              id: `self-${m.id}`,
              date: m.date || 'Today',
              type: 'PRESCRIPTION',
              title: `Self-Reported Medicine: ${m.medicineName} (${m.dosage || '1 dose'})`,
              doctorName: m.doctorName ? `Prescribed by Dr. ${m.doctorName}` : 'Self-Reported by Patient (Over-The-Counter)',
              hospitalName: 'Patient Self-Managed Medication Record',
              facilityDepartment: 'Personal Healthcare Dossier',
              summary: `Patient self-added this medication into their daily schedule. Timing: ${(m.timings || [m.reminderTime || '08:00 AM']).join(', ')} (${(m.foodTiming || 'AFTER_FOOD').replace('_', ' ')}). Instructions: ${m.instructions || 'Self-managed dose'}. Recorded in longitudinal EHR.`,
              badge: 'Self-Added by Patient',
              medicines: [
                {
                  name: m.medicineName,
                  dosage: m.dosage || '1 dose',
                  route: 'Oral Formulation',
                  frequency: m.frequency || 'Daily',
                  timing: m.timings || [m.reminderTime || '08:00 AM'],
                  isInjection: false,
                  instructions: m.instructions || 'Self-reported medication',
                },
              ],
              staffNotes: {
                doctorNotes: m.doctorName
                  ? `Patient self-reported being prescribed this formulation by Dr. ${m.doctorName}. Added to ongoing home medication reconciliation.`
                  : 'Over-the-counter medication initiated directly by the patient.',
                nurseNotes: 'Logged automatically via MediNexa Patient Portal self-reporting system.',
              },
            }));
            setTimelineEvents([...selfEvents, ...COMPREHENSIVE_CLINICAL_EVENTS]);
            return;
          }
        }
        setTimelineEvents(COMPREHENSIVE_CLINICAL_EVENTS);
      } catch (err) {
        setTimelineEvents(COMPREHENSIVE_CLINICAL_EVENTS);
      }
    };

    loadSelfReportedMeds();
    window.addEventListener('storage', loadSelfReportedMeds);
    return () => window.removeEventListener('storage', loadSelfReportedMeds);
  }, []);

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

          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-900 font-bold whitespace-nowrap self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4" />
            <span>ABDM & HIPAA Verified Record</span>
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
            <MedicalTimeline events={timelineEvents} onSelectEvent={handleOpenEvent} />
          </CardContent>
        </Card>
      </main>

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
                              </div>

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
    </div>
  );
}
