export interface DemoPatientAccount {
  id: string;
  name: string;
  initials: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  uhid: string;
  patientId: string;
  email: string;
  phone: string;
  condition: string;
  category: string;
  badgeColor: string;
  avatarBg: string;
  healthScore: number;
  healthStatus: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical Monitoring';
  attendingDoctor: string;
  department: string;
  hospitalName: string;
  bedStatus: string;
  activeMedicinesCount: number;
  upcomingAppointment: string;
  vitals: {
    bloodPressure: string;
    heartRate: string;
    spO2: string;
    temperature: string;
    recordedBy: string;
    recordedAt: string;
  };
  sampleMedicines: {
    id: string;
    name: string;
    dosage: string;
    scheduledTime: string;
    timeSlot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
    status: 'PENDING' | 'TAKEN';
  }[];
  overviewSnippet: string;
}

export const DEMO_PATIENT_ACCOUNTS: DemoPatientAccount[] = [
  // 1. Ayush Singh
  {
    id: 'demo-p-01',
    name: 'Ayush Singh',
    initials: 'AS',
    age: 34,
    gender: 'Male',
    bloodGroup: 'O+',
    uhid: 'AYU-4826-KM',
    patientId: 'MNX-P-AYUSH921',
    email: 'ayush.singh@patient.medinexa.health',
    phone: '+91 98765 43210',
    condition: 'Post-Angioplasty Cardiac Rehab & Lipid Control',
    category: 'Cardiology',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    avatarBg: 'from-emerald-600 to-teal-700',
    healthScore: 88,
    healthStatus: 'Good',
    attendingDoctor: 'Dr. Rajesh Singh (Attending Cardiologist)',
    department: 'Department of Cardiology & Tele-Rehab',
    hospitalName: 'MediNexa General Hospital (Hospital A)',
    bedStatus: 'Home Telemetry Monitored (Outpatient)',
    activeMedicinesCount: 3,
    upcomingAppointment: 'Tomorrow at 10:30 AM (Cardio Follow-up)',
    vitals: {
      bloodPressure: '120/80 mmHg',
      heartRate: '72 bpm',
      spO2: '99%',
      temperature: '98.6 °F',
      recordedBy: 'Dr. Rajesh Singh (Attending Cardiologist)',
      recordedAt: 'Today, OPD Review',
    },
    sampleMedicines: [
      { id: '1', name: 'Metformin HCl', dosage: '500 mg', scheduledTime: '08:00 AM', timeSlot: 'Morning', status: 'PENDING' },
      { id: '2', name: 'Atorvastatin', dosage: '20 mg', scheduledTime: '02:00 PM', timeSlot: 'Afternoon', status: 'PENDING' },
      { id: '3', name: 'Lisinopril', dosage: '10 mg', scheduledTime: '08:00 PM', timeSlot: 'Evening', status: 'PENDING' },
    ],
    overviewSnippet: 'Post-stent recovery tracking on schedule. Normal cardiac biomarkers and telemetry sync.',
  },

  // 2. Priya Sharma
  {
    id: 'demo-p-02',
    name: 'Priya Sharma',
    initials: 'PS',
    age: 28,
    gender: 'Female',
    bloodGroup: 'B+',
    uhid: 'PRI-2841-XD',
    patientId: 'MNX-P-PRIYA418',
    email: 'priya.sharma@patient.medinexa.health',
    phone: '+91 98112 34567',
    condition: 'Trimester-2 High-Risk Maternity & Fetal Care',
    category: 'Maternity',
    badgeColor: 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300 border-pink-300 dark:border-pink-800',
    avatarBg: 'from-pink-500 to-rose-600',
    healthScore: 92,
    healthStatus: 'Excellent',
    attendingDoctor: 'Dr. Ananya Sen (Lead Obstetrician)',
    department: 'Department of Obstetrics & Maternal Medicine',
    hospitalName: 'MediNexa Institute of Medical Sciences (Hospital B)',
    bedStatus: 'Outpatient Tele-Maternity Flowsheet',
    activeMedicinesCount: 4,
    upcomingAppointment: 'Thursday at 02:15 PM (Fetal Anomaly Scan)',
    vitals: {
      bloodPressure: '114/74 mmHg',
      heartRate: '78 bpm',
      spO2: '98%',
      temperature: '98.4 °F',
      recordedBy: 'Dr. Ananya Sen (Lead Obstetrician)',
      recordedAt: 'Yesterday, Prenatal Wellness Check',
    },
    sampleMedicines: [
      { id: '1', name: 'Folic Acid Chelate', dosage: '5 mg', scheduledTime: '08:30 AM', timeSlot: 'Morning', status: 'TAKEN' },
      { id: '2', name: 'Iron Calcium Forte', dosage: '1 Tab', scheduledTime: '01:00 PM', timeSlot: 'Afternoon', status: 'PENDING' },
      { id: '3', name: 'Progesterone Sustained', dosage: '200 mg', scheduledTime: '09:00 PM', timeSlot: 'Night', status: 'PENDING' },
    ],
    overviewSnippet: '24-week fetal growth scan on target. Maternal blood pressure and hemoglobin levels stable.',
  },

  // 3. Rajesh Gupta
  {
    id: 'demo-p-03',
    name: 'Rajesh Gupta',
    initials: 'RG',
    age: 52,
    gender: 'Male',
    bloodGroup: 'A+',
    uhid: 'RAJ-3910-GU',
    patientId: 'MNX-P-RAJESH024',
    email: 'rajesh.gupta@patient.medinexa.health',
    phone: '+91 97234 56789',
    condition: 'Type-2 Diabetes Mellitus & Essential Hypertension',
    category: 'Diabetes & Endo',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    avatarBg: 'from-amber-600 to-orange-700',
    healthScore: 74,
    healthStatus: 'Needs Attention',
    attendingDoctor: 'Dr. Alok Mathur (Chief Diabetologist)',
    department: 'Department of Endocrinology & Metabolism',
    hospitalName: 'MediNexa General Hospital (Hospital A)',
    bedStatus: 'Home Glucose & BP Telemetry Monitored',
    activeMedicinesCount: 4,
    upcomingAppointment: 'Friday at 11:00 AM (HbA1c Evaluation)',
    vitals: {
      bloodPressure: '136/88 mmHg',
      heartRate: '82 bpm',
      spO2: '97%',
      temperature: '98.2 °F',
      recordedBy: 'Dr. Alok Mathur (Chief Diabetologist)',
      recordedAt: '2 days ago, Endocrine Review',
    },
    sampleMedicines: [
      { id: '1', name: 'Glimepiride + Metformin', dosage: '2mg / 500mg', scheduledTime: '08:00 AM', timeSlot: 'Morning', status: 'PENDING' },
      { id: '2', name: 'Telmisartan', dosage: '40 mg', scheduledTime: '09:00 AM', timeSlot: 'Morning', status: 'PENDING' },
      { id: '3', name: 'Rosuvastatin', dosage: '10 mg', scheduledTime: '08:30 PM', timeSlot: 'Evening', status: 'PENDING' },
    ],
    overviewSnippet: 'Fasting blood glucose 134 mg/dL. BP monitoring recommended twice daily.',
  },

  // 4. Meera Nair
  {
    id: 'demo-p-04',
    name: 'Meera Nair',
    initials: 'MN',
    age: 45,
    gender: 'Female',
    bloodGroup: 'AB+',
    uhid: 'MEE-4829-NR',
    patientId: 'MNX-P-MEERA910',
    email: 'meera.nair@patient.medinexa.health',
    phone: '+91 99456 78901',
    condition: 'Post-Op Orthopedic ACL Reconstruction (Day 14 Rehab)',
    category: 'Orthopedics',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    avatarBg: 'from-purple-600 to-indigo-700',
    healthScore: 85,
    healthStatus: 'Good',
    attendingDoctor: 'Dr. Vivek Chawla (Consultant Arthroscopy Surgeon)',
    department: 'Department of Orthopedics & Joint Care',
    hospitalName: 'MediNexa General Hospital (Hospital A)',
    bedStatus: 'Home Knee Physiotherapy Protocol',
    activeMedicinesCount: 3,
    upcomingAppointment: 'In 4 days (Post-Op Suture & Range of Motion Review)',
    vitals: {
      bloodPressure: '118/76 mmHg',
      heartRate: '70 bpm',
      spO2: '99%',
      temperature: '98.7 °F',
      recordedBy: 'Dr. Vivek Chawla (Consultant Arthroscopy Surgeon)',
      recordedAt: 'Today, Physical Therapy Flowsheet',
    },
    sampleMedicines: [
      { id: '1', name: 'Aceclofenac + Paracetamol', dosage: '100mg / 325mg', scheduledTime: '09:00 AM', timeSlot: 'Morning', status: 'PENDING' },
      { id: '2', name: 'Chymoral Forte', dosage: '1 Tab', scheduledTime: '02:00 PM', timeSlot: 'Afternoon', status: 'PENDING' },
      { id: '3', name: 'Calcium D3 60k', dosage: 'Weekly Sachet', scheduledTime: '08:00 PM', timeSlot: 'Evening', status: 'PENDING' },
    ],
    overviewSnippet: 'Knee flexion achieving 90 degrees with zero effusion. Pain well-managed on oral analgesics.',
  },

  // 5. Vikram Malhotra
  {
    id: 'demo-p-05',
    name: 'Vikram Malhotra',
    initials: 'VM',
    age: 61,
    gender: 'Male',
    bloodGroup: 'O-',
    uhid: 'VIK-5719-ML',
    patientId: 'MNX-P-VIKRAM932',
    email: 'vikram.malhotra@patient.medinexa.health',
    phone: '+91 98101 23456',
    condition: 'Chronic Kidney Disease (Stage-2) & Renovascular Care',
    category: 'Nephrology',
    badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800',
    avatarBg: 'from-cyan-600 to-blue-700',
    healthScore: 71,
    healthStatus: 'Needs Attention',
    attendingDoctor: 'Dr. Sudhir Bansal (Director of Nephrology)',
    department: 'Department of Nephrology & Renal Care',
    hospitalName: 'MediNexa Institute of Medical Sciences (Hospital B)',
    bedStatus: 'eGFR Telemetry & Fluid Balance Protocol',
    activeMedicinesCount: 4,
    upcomingAppointment: 'Next Monday at 10:00 AM (Serum Creatinine & Electrolytes)',
    vitals: {
      bloodPressure: '128/82 mmHg',
      heartRate: '68 bpm',
      spO2: '96%',
      temperature: '98.4 °F',
      recordedBy: 'Dr. Sudhir Bansal (Director of Nephrology)',
      recordedAt: '3 days ago, Renal Telemetry Panel',
    },
    sampleMedicines: [
      { id: '1', name: 'Torsemide', dosage: '10 mg', scheduledTime: '07:30 AM', timeSlot: 'Morning', status: 'PENDING' },
      { id: '2', name: 'Sodium Bicarbonate', dosage: '500 mg', scheduledTime: '01:30 PM', timeSlot: 'Afternoon', status: 'PENDING' },
      { id: '3', name: 'Febuxostat', dosage: '40 mg', scheduledTime: '08:00 PM', timeSlot: 'Evening', status: 'PENDING' },
    ],
    overviewSnippet: 'Serum Creatinine 1.5 mg/dL, eGFR 68 mL/min/1.73m². Strict low-potassium diet adherence maintained.',
  },

  // 6. Sneha Sen
  {
    id: 'demo-p-06',
    name: 'Sneha Sen',
    initials: 'SS',
    age: 22,
    gender: 'Female',
    bloodGroup: 'A-',
    uhid: 'SNE-6184-SN',
    patientId: 'MNX-P-SNEHA492',
    email: 'sneha.sen@patient.medinexa.health',
    phone: '+91 98300 12345',
    condition: 'Acute Bronchial Asthma & Seasonal Allergy Exacerbation',
    category: 'Pulmonology',
    badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 dark:border-sky-800',
    avatarBg: 'from-sky-500 to-blue-600',
    healthScore: 79,
    healthStatus: 'Good',
    attendingDoctor: 'Dr. Farhan Akhtar (Consultant Pulmonologist)',
    department: 'Department of Pulmonary Medicine & Allergy',
    hospitalName: 'MediNexa General Hospital (Hospital A)',
    bedStatus: 'Peak Expiratory Flow Telemetry Monitored',
    activeMedicinesCount: 3,
    upcomingAppointment: 'In 3 days at 04:30 PM (Spirometry Reassessment)',
    vitals: {
      bloodPressure: '112/70 mmHg',
      heartRate: '86 bpm',
      spO2: '95%',
      temperature: '99.1 °F',
      recordedBy: 'Dr. Farhan Akhtar (Consultant Pulmonologist)',
      recordedAt: 'Today, Peak Flow Clinic',
    },
    sampleMedicines: [
      { id: '1', name: 'Budesonide + Formoterol Inhaler', dosage: '2 Puffs', scheduledTime: '08:00 AM', timeSlot: 'Morning', status: 'PENDING' },
      { id: '2', name: 'Montelukast Sodium', dosage: '10 mg', scheduledTime: '08:30 PM', timeSlot: 'Evening', status: 'PENDING' },
      { id: '3', name: 'Levocetirizine', dosage: '5 mg', scheduledTime: '09:30 PM', timeSlot: 'Night', status: 'PENDING' },
    ],
    overviewSnippet: 'Peak Flow 380 L/min (85% of baseline). Respiratory rate comfortable, wheeze cleared after nebulizer.',
  },

  // 7. Amit Patel
  {
    id: 'demo-p-07',
    name: 'Amit Patel',
    initials: 'AP',
    age: 41,
    gender: 'Male',
    bloodGroup: 'B-',
    uhid: 'AMI-7291-PT',
    patientId: 'MNX-P-AMIT104',
    email: 'amit.patel@patient.medinexa.health',
    phone: '+91 97123 45678',
    condition: 'Severe GERD & Grade-2 Non-Alcoholic Fatty Liver (NAFLD)',
    category: 'Gastroenterology',
    badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300 dark:border-orange-800',
    avatarBg: 'from-orange-600 to-amber-700',
    healthScore: 81,
    healthStatus: 'Good',
    attendingDoctor: 'Dr. Renu Khurana (Lead Gastroenterologist)',
    department: 'Department of Gastroenterology & Hepatology',
    hospitalName: 'MediNexa Institute of Medical Sciences (Hospital B)',
    bedStatus: 'Dietary & LFT Longitudinal Tracker',
    activeMedicinesCount: 3,
    upcomingAppointment: 'In 1 week (Abdominal Ultrasound & Fibroscan)',
    vitals: {
      bloodPressure: '124/80 mmHg',
      heartRate: '74 bpm',
      spO2: '98%',
      temperature: '98.5 °F',
      recordedBy: 'Dr. Renu Khurana (Lead Gastroenterologist)',
      recordedAt: '4 days ago, Liver Function Review',
    },
    sampleMedicines: [
      { id: '1', name: 'Pantoprazole + Domperidone', dosage: '40mg / 30mg', scheduledTime: '07:30 AM', timeSlot: 'Morning', status: 'PENDING' },
      { id: '2', name: 'Ursodeoxycholic Acid', dosage: '300 mg', scheduledTime: '01:00 PM', timeSlot: 'Afternoon', status: 'PENDING' },
      { id: '3', name: 'Silymarin Forte', dosage: '140 mg', scheduledTime: '08:00 PM', timeSlot: 'Evening', status: 'PENDING' },
    ],
    overviewSnippet: 'ALT/AST downward trend noted. Strict dietary protocol followed with 2.5 kg weight reduction.',
  },

  // 8. Sunita Rao
  {
    id: 'demo-p-08',
    name: 'Sunita Rao',
    initials: 'SR',
    age: 68,
    gender: 'Female',
    bloodGroup: 'O+',
    uhid: 'SUN-8392-RO',
    patientId: 'MNX-P-SUNITA211',
    email: 'sunita.rao@patient.medinexa.health',
    phone: '+91 94480 12345',
    condition: 'Geriatric Bilateral Knee Osteoarthritis & Arrhythmia Surveillance',
    category: 'Geriatric Care',
    badgeColor: 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300 border-violet-300 dark:border-violet-800',
    avatarBg: 'from-violet-600 to-purple-800',
    healthScore: 68,
    healthStatus: 'Needs Attention',
    attendingDoctor: 'Dr. K. Radhakrishnan (Head of Geriatric Care)',
    department: 'Department of Geriatric Medicine',
    hospitalName: 'MediNexa General Hospital (Hospital A)',
    bedStatus: 'Home Assisted Care Telemetry',
    activeMedicinesCount: 5,
    upcomingAppointment: 'Friday at 03:00 PM (Geriatric Holter Review)',
    vitals: {
      bloodPressure: '132/84 mmHg',
      heartRate: '66 bpm',
      spO2: '97%',
      temperature: '98.1 °F',
      recordedBy: 'Dr. K. Radhakrishnan (Head of Geriatric Care)',
      recordedAt: 'Today, Geriatric Home Visit',
    },
    sampleMedicines: [
      { id: '1', name: 'Glucosamine + Diacerein', dosage: '750mg / 50mg', scheduledTime: '08:30 AM', timeSlot: 'Morning', status: 'PENDING' },
      { id: '2', name: 'Digoxin Low-Dose', dosage: '0.125 mg', scheduledTime: '12:00 PM', timeSlot: 'Afternoon', status: 'PENDING' },
      { id: '3', name: 'Atorvastatin', dosage: '10 mg', scheduledTime: '08:30 PM', timeSlot: 'Evening', status: 'PENDING' },
    ],
    overviewSnippet: 'Assisted mobility stable. ECG rhythm reveals sinus bradycardia within safe geriatric limits.',
  },

  // 9. Kabir Mehta
  {
    id: 'demo-p-09',
    name: 'Kabir Mehta',
    initials: 'KM',
    age: 19,
    gender: 'Male',
    bloodGroup: 'AB-',
    uhid: 'KAB-9041-MH',
    patientId: 'MNX-P-KABIR128',
    email: 'kabir.mehta@patient.medinexa.health',
    phone: '+91 99990 87654',
    condition: 'High-Performance Sports Injury (Rotator Cuff Strain & Tendonitis)',
    category: 'Sports Medicine',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    avatarBg: 'from-blue-600 to-indigo-700',
    healthScore: 94,
    healthStatus: 'Excellent',
    attendingDoctor: 'Dr. Nikhil Bajaj (Sports Orthopedic Surgeon)',
    department: 'Department of Sports Performance & Rehabilitation',
    hospitalName: 'MediNexa General Hospital (Hospital A)',
    bedStatus: 'Active Athletic Recovery Phase 2',
    activeMedicinesCount: 2,
    upcomingAppointment: 'In 5 days (Shoulder Isometric Resistance Check)',
    vitals: {
      bloodPressure: '116/72 mmHg',
      heartRate: '58 bpm',
      spO2: '99%',
      temperature: '98.6 °F',
      recordedBy: 'Dr. Nikhil Bajaj (Sports Orthopedic Surgeon)',
      recordedAt: 'Yesterday, Athletic Recovery Followup',
    },
    sampleMedicines: [
      { id: '1', name: 'Thiocolchicoside + Etoricoxib', dosage: '4mg / 60mg', scheduledTime: '09:00 AM', timeSlot: 'Morning', status: 'PENDING' },
      { id: '2', name: 'Collagen Peptide Hydrolysate', dosage: '1 Sachet', scheduledTime: '08:00 PM', timeSlot: 'Evening', status: 'PENDING' },
    ],
    overviewSnippet: 'Resting athletic bradycardia (58 bpm). Supraspinatus tendon ultrasound reveals excellent healing.',
  },

  // 10. Ananya Verma
  {
    id: 'demo-p-10',
    name: 'Ananya Verma',
    initials: 'AV',
    age: 31,
    gender: 'Female',
    bloodGroup: 'A+',
    uhid: 'ANA-9921-VM',
    patientId: 'MNX-P-ANANYA147',
    email: 'ananya.verma@patient.medinexa.health',
    phone: '+91 98200 45678',
    condition: "Hashimoto's Hypothyroidism & Preventive Metabolic Wellness",
    category: 'Endocrinology & Wellness',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300 dark:border-teal-800',
    avatarBg: 'from-teal-600 to-emerald-700',
    healthScore: 90,
    healthStatus: 'Excellent',
    attendingDoctor: 'Dr. Deepika Pillai (Consultant Endocrinologist)',
    department: 'Department of Preventive & Lifestyle Medicine',
    hospitalName: 'MediNexa Institute of Medical Sciences (Hospital B)',
    bedStatus: 'Preventive Health Shield & Hormone Flowsheet',
    activeMedicinesCount: 2,
    upcomingAppointment: 'In 2 weeks (Serum TSH, Free T3/T4 Profile)',
    vitals: {
      bloodPressure: '110/70 mmHg',
      heartRate: '70 bpm',
      spO2: '99%',
      temperature: '98.3 °F',
      recordedBy: 'Dr. Deepika Pillai (Consultant Endocrinologist)',
      recordedAt: '5 days ago, Hormone Panel Check',
    },
    sampleMedicines: [
      { id: '1', name: 'Thyroxine Sodium (Empty Stomach)', dosage: '75 mcg', scheduledTime: '07:00 AM', timeSlot: 'Morning', status: 'TAKEN' },
      { id: '2', name: 'Selenium + Vitamin D3 Chelate', dosage: '1 Capsule', scheduledTime: '01:00 PM', timeSlot: 'Afternoon', status: 'PENDING' },
    ],
    overviewSnippet: 'Euthyroid state achieved on 75mcg daily dose. Energy levels, lipid profile, and vitals optimal.',
  },
];

/**
 * Sanitizes any raw patient string so that hospital affiliations, staff titles, or (Hospital A)/(Hospital B)
 * NEVER appear in patient greetings or profiles.
 */
export function sanitizePatientName(name: string | null | undefined): string {
  if (!name) return 'Ayush Singh';
  
  // 1. Remove bracketed hospital affiliations: "(Hospital A)", "(Hospital B)", "(Hospital ...)", etc.
  let cleaned = name.replace(/\s*\((?:Hospital\s+[A-Z0-9_-]+|Hospital|Admin|Staff|Doctor|Nurse|Chief|Lead|Receptionist|Front\s*Desk)[^)]*\)/gi, '').trim();
  
  // 2. Remove trailing standalone hospital references
  cleaned = cleaned.replace(/\s*Hospital\s+[AB]\b/gi, '').trim();
  
  // 3. Remove leading clinical prefixes if mistakenly applied to patient
  cleaned = cleaned.replace(/^Dr\.\s*/i, '').trim();
  
  return cleaned || 'Ayush Singh';
}

/**
 * Checks localStorage and active session to return a clean, staff-free patient session.
 * If a staff user (e.g. Receptionist, Admin, Doctor) is found in localStorage,
 * it returns a valid Patient persona rather than leaking hospital staff details.
 */
export function getCleanPatientSession() {
  if (typeof window === 'undefined') {
    return {
      name: 'Ayush Singh',
      email: 'ayush.singh@patient.medinexa.health',
      uhid: 'AYU-4826-KM',
      patientId: 'MNX-P-AYUSH921',
      initials: 'AS',
      age: 34,
      gender: 'Male',
      condition: 'Post-Angioplasty Cardiac Rehab & Lipid Control',
      category: 'Cardiology',
      healthScore: 88,
      isDemo: true,
    };
  }

  try {
    // 1. Check dedicated patient persona
    const rawPersona = localStorage.getItem('medinexa_patient_persona');
    if (rawPersona) {
      const persona = JSON.parse(rawPersona);
      if (persona?.name) {
        return {
          name: sanitizePatientName(persona.name),
          email: persona.email || 'ayush.singh@patient.medinexa.health',
          uhid: persona.uhid || 'AYU-4826-KM',
          patientId: persona.patientId || 'MNX-P-AYUSH921',
          initials: persona.initials || 'AS',
          age: persona.age || 34,
          gender: persona.gender || 'Male',
          condition: persona.condition || 'General Healthcare Monitoring',
          category: persona.category || 'Cardiology',
          healthScore: persona.healthScore || 88,
          isDemo: true,
          personaData: persona,
        };
      }
    }

    // 2. Check general user in localStorage
    const rawUser = localStorage.getItem('medinexa_user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      const roleCode = (u.roleCode || u.role?.code || u.role || '').toUpperCase();
      
      // If role is ANY hospital staff (Receptionist, Doctor, Nurse, Admin, Lab, etc.) -> DO NOT USE AS PATIENT!
      const isStaff = /DOCTOR|STAFF|ADMIN|NURSE|RECEPTIONIST|PHARMAC|LAB|BILLING|COORDINATOR|HRMS/i.test(roleCode);
      const hasStaffName = (u.firstName && u.firstName.startsWith('Dr.')) || /hospital\s+[ab]/i.test(`${u.firstName || ''} ${u.lastName || ''}`);

      if (!isStaff && !hasStaffName && (roleCode === 'PATIENT' || roleCode === 'USER' || !roleCode)) {
        if (u.firstName) {
          const cleanedName = sanitizePatientName(`${u.firstName} ${u.lastName || ''}`.trim());
          if (cleanedName && !/hospital\s+[ab]/i.test(cleanedName)) {
            const firstChar = u.firstName.charAt(0) || 'A';
            const lastChar = u.lastName ? u.lastName.charAt(0) : 'S';
            return {
              name: cleanedName,
              email: u.email && !u.email.includes('reception@') && !u.email.includes('admin') && !u.email.includes('dr.')
                ? u.email
                : 'ayush.singh@patient.medinexa.health',
              uhid: u.patientId || u.uhid || 'AYU-4826-KM',
              patientId: u.patientId || 'MNX-P-AYUSH921',
              initials: `${firstChar}${lastChar}`.toUpperCase(),
              age: u.age || 34,
              gender: u.gender || 'Male',
              condition: u.condition || 'General Healthcare Monitoring',
              category: u.category || 'General',
              healthScore: 88,
              isDemo: !!u.isDemo,
            };
          }
        }
      }
    }
  } catch (e) {}

  // Fallback to default patient Ayush Singh
  return {
    name: 'Ayush Singh',
    email: 'ayush.singh@patient.medinexa.health',
    uhid: 'AYU-4826-KM',
    patientId: 'MNX-P-AYUSH921',
    initials: 'AS',
    age: 34,
    gender: 'Male',
    condition: 'Post-Angioplasty Cardiac Rehab & Lipid Control',
    category: 'Cardiology',
    healthScore: 88,
    isDemo: true,
  };
}

/**
 * Activates a demo patient account by setting token, user, persona, and vitals in localStorage,
 * and seamlessly redirects into the Patient Portal.
 */
export function activateDemoPatientSession(patient: DemoPatientAccount, redirect: boolean = true) {
  if (typeof window === 'undefined') return;

  const token = `demo_patient_token_${patient.id}_${Date.now()}`;
  const cleanUser = {
    id: patient.id,
    patientId: patient.patientId,
    uhid: patient.uhid,
    firstName: patient.name.split(' ')[0],
    lastName: patient.name.split(' ').slice(1).join(' '),
    email: patient.email,
    role: { code: 'PATIENT', name: 'Patient' },
    roleCode: 'PATIENT',
    isDemo: true,
    condition: patient.condition,
    category: patient.category,
    age: patient.age,
    gender: patient.gender,
    bloodGroup: patient.bloodGroup,
    attendingDoctor: patient.attendingDoctor,
  };

  localStorage.setItem('medinexa_token', token);
  localStorage.setItem('token', token);
  sessionStorage.setItem('medinexa_token', token);
  document.cookie = `medinexa_token=${token}; path=/; max-age=86400; SameSite=Lax`;
  localStorage.setItem('medinexa_user', JSON.stringify(cleanUser));
  localStorage.setItem('medinexa_patient_persona', JSON.stringify(patient));
  localStorage.setItem('medinexa_patient_latest_vitals', JSON.stringify(patient.vitals));

  // Dispatch custom storage & patient change event for multi-tab or open components
  window.dispatchEvent(new CustomEvent('medinexa:patient:changed', { detail: patient }));

  if (redirect) {
    window.location.href = '/portal';
  }
}
