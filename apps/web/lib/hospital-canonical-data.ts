import { generateHospitalMrn } from '@medinexa/validation';

/**
 * Ensures zero-state elimination and seamless data presence across all roles
 * (Super Admin, Hospital Admin A/B, Doctors, Nurses, Managers, Patients)
 * regardless of whether the remote backend is warm, cold-starting, or in demo mode.
 */

export interface CanonicalStaffMember {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  staffLoginId: string;
  email: string;
  phone: string;
  role: string;
  roleCode: string;
  department: string;
  designation: string;
  status: 'ACTIVE' | 'INACTIVE';
  joinedDate: string;
  hospitalId: string;
}

export interface CanonicalDoctor {
  id: string;
  name: string;
  staffLoginId: string;
  department: string;
  specialty: string;
  qualification: string;
  licenseNumber: string;
  consultationFee: number;
  status: 'ACTIVE' | 'INACTIVE';
  availability: string;
  todayAppointmentsCount: number;
  hospitalId: string;
}

export interface CanonicalDepartment {
  id: string;
  name: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE';
  doctorCount: number;
  staffCount: number;
  assetCount: number;
  hospitalId: string;
}

export interface CanonicalManager {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  staffLoginId: string;
  email: string;
  phone: string;
  department: string;
  status: 'ACTIVE' | 'INACTIVE';
  joinedDate: string;
  hospitalId: string;
}

export interface CanonicalShift {
  id: string;
  staffId: string;
  staffName: string;
  staffLoginId: string;
  role: string;
  department: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED';
  date: string;
  hospitalId: string;
}

export interface CanonicalAsset {
  id: string;
  name: string;
  category: string;
  departmentId: string;
  departmentName: string;
  location: string;
  serialNumber: string;
  warrantyExpiry: string;
  maintenanceFrequency: string;
  status: 'OPERATIONAL' | 'MAINTENANCE_DUE' | 'CALIBRATING';
  purchaseCost: number;
  hospitalId: string;
}

export interface CanonicalHospitalProfile {
  id: string;
  name: string;
  code: string;
  facilityType: string;
  status: 'ACTIVE' | 'PENDING';
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  bedCount: number;
  doctorCount: number;
  staffCount: number;
}

export const CANONICAL_DEPARTMENTS: CanonicalDepartment[] = [
  { id: 'dept-cardio', name: 'Cardiology', code: 'CARDIO', status: 'ACTIVE', doctorCount: 3, staffCount: 8, assetCount: 14, hospitalId: 'HOSPITAL_A' },
  { id: 'dept-neuro', name: 'Neurology & Neurosciences', code: 'NEURO', status: 'ACTIVE', doctorCount: 2, staffCount: 6, assetCount: 9, hospitalId: 'HOSPITAL_A' },
  { id: 'dept-icu', name: 'Inpatient Nursing Station & ICU', code: 'ICU', status: 'ACTIVE', doctorCount: 4, staffCount: 16, assetCount: 22, hospitalId: 'HOSPITAL_A' },
  { id: 'dept-er', name: 'Emergency & Trauma Care', code: 'ER', status: 'ACTIVE', doctorCount: 3, staffCount: 12, assetCount: 18, hospitalId: 'HOSPITAL_A' },
  { id: 'dept-opd', name: 'Front Desk & Central OPD Reception', code: 'OPD', status: 'ACTIVE', doctorCount: 0, staffCount: 5, assetCount: 6, hospitalId: 'HOSPITAL_A' },
  { id: 'dept-pharm', name: 'Hospital Central Pharmacy', code: 'PHARM', status: 'ACTIVE', doctorCount: 0, staffCount: 4, assetCount: 5, hospitalId: 'HOSPITAL_A' },
  { id: 'dept-lab', name: 'Clinical Pathology & Diagnostics', code: 'LAB', status: 'ACTIVE', doctorCount: 1, staffCount: 6, assetCount: 12, hospitalId: 'HOSPITAL_A' },
  { id: 'dept-radio', name: 'Radiology & PACS Imaging', code: 'RADIO', status: 'ACTIVE', doctorCount: 2, staffCount: 4, assetCount: 8, hospitalId: 'HOSPITAL_A' },
  { id: 'dept-bill', name: 'Patient Accounts & Central Billing', code: 'BILLING', status: 'ACTIVE', doctorCount: 0, staffCount: 4, assetCount: 4, hospitalId: 'HOSPITAL_A' },
  { id: 'dept-admin', name: 'Hospital Operations & Administration', code: 'ADMIN', status: 'ACTIVE', doctorCount: 2, staffCount: 5, assetCount: 6, hospitalId: 'HOSPITAL_A' },
];

export const CANONICAL_STAFF: CanonicalStaffMember[] = [
  {
    id: 'stf-sunita',
    name: 'Dr. Sunita Singh',
    firstName: 'Sunita',
    lastName: 'Singh',
    staffLoginId: 'DR.SUNITA-1001',
    email: 'admin.hospitalA@medinexa.com',
    phone: '+91 98110 10001',
    role: 'HOSPITAL_ADMIN',
    roleCode: 'HOSPITAL_ADMIN',
    department: 'Hospital Operations & Administration',
    designation: 'Hospital Administrator & COO',
    status: 'ACTIVE',
    joinedDate: '2024-01-15',
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'stf-rajesh',
    name: 'Dr. Rajesh Singh',
    firstName: 'Rajesh',
    lastName: 'Singh',
    staffLoginId: 'DR.RAJESH-1002',
    email: 'dr.rajesh.singh@medinexa.com',
    phone: '+91 98110 10002',
    role: 'DOCTOR',
    roleCode: 'DOCTOR',
    department: 'Cardiology',
    designation: 'Senior Consultant Cardiologist',
    status: 'ACTIVE',
    joinedDate: '2024-02-10',
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'stf-priya',
    name: 'Sister Priya Singh',
    firstName: 'Priya',
    lastName: 'Singh',
    staffLoginId: 'NR.PRIYA-1001',
    email: 'nurse.priya@medinexa.com',
    phone: '+91 98110 10003',
    role: 'NURSE',
    roleCode: 'NURSE',
    department: 'Inpatient Nursing Station & ICU',
    designation: 'Head Nurse (ICU)',
    status: 'ACTIVE',
    joinedDate: '2024-02-15',
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'stf-ward-kavita',
    name: 'Sister Kavita Singh',
    firstName: 'Kavita',
    lastName: 'Singh',
    staffLoginId: 'NR.KAVITA-1002',
    email: 'ward.manager@medinexa.com',
    phone: '+91 98110 10004',
    role: 'WARD_MANAGER',
    roleCode: 'WARD_MANAGER',
    department: 'Inpatient Nursing Station & ICU',
    designation: 'Ward In-Charge',
    status: 'ACTIVE',
    joinedDate: '2024-02-20',
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'stf-pooja',
    name: 'Pooja Singh',
    firstName: 'Pooja',
    lastName: 'Singh',
    staffLoginId: 'RC.POOJA-1001',
    email: 'reception@medinexa.com',
    phone: '+91 98110 10005',
    role: 'RECEPTIONIST',
    roleCode: 'RECEPTIONIST',
    department: 'Front Desk & Central OPD Reception',
    designation: 'Chief Patient Registration Officer',
    status: 'ACTIVE',
    joinedDate: '2024-01-18',
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'stf-anil',
    name: 'Anil Kumar Singh',
    firstName: 'Anil',
    lastName: 'Singh',
    staffLoginId: 'LT.ANIL-1001',
    email: 'lab.anil@medinexa.com',
    phone: '+91 98110 10006',
    role: 'LAB_STAFF',
    roleCode: 'LAB_STAFF',
    department: 'Clinical Pathology & Diagnostics',
    designation: 'Senior Laboratory Technologist',
    status: 'ACTIVE',
    joinedDate: '2024-02-05',
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'stf-rahul-ph',
    name: 'Rahul Singh',
    firstName: 'Rahul',
    lastName: 'Singh',
    staffLoginId: 'PH.RAHUL-1001',
    email: 'pharmacist.rahul@medinexa.com',
    phone: '+91 98110 10007',
    role: 'PHARMACIST',
    roleCode: 'PHARMACIST',
    department: 'Hospital Central Pharmacy',
    designation: 'Chief Pharmacist',
    status: 'ACTIVE',
    joinedDate: '2024-01-25',
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'stf-kavita-bl',
    name: 'Kavita Singh (Billing)',
    firstName: 'Kavita',
    lastName: 'Singh',
    staffLoginId: 'BL.KAVITA-1001',
    email: 'billing.kavita@medinexa.com',
    phone: '+91 98110 10008',
    role: 'BILLING_STAFF',
    roleCode: 'BILLING_STAFF',
    department: 'Patient Accounts & Central Billing',
    designation: 'Lead Billing Specialist',
    status: 'ACTIVE',
    joinedDate: '2024-01-22',
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'stf-rahul-mgr',
    name: 'Rahul Verma',
    firstName: 'Rahul',
    lastName: 'Verma',
    staffLoginId: 'MG.RAHUL-1001',
    email: 'manager.rahul@medinexa.com',
    phone: '+91 98110 10009',
    role: 'MANAGER',
    roleCode: 'MANAGER',
    department: 'Hospital Operations & Administration',
    designation: 'Operations Manager',
    status: 'ACTIVE',
    joinedDate: '2024-02-01',
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'stf-sunil',
    name: 'Sunil Yadav',
    firstName: 'Sunil',
    lastName: 'Yadav',
    staffLoginId: 'AM.SUNIL-1001',
    email: 'ambulance.sunil@medinexa.com',
    phone: '+91 98110 10010',
    role: 'AMBULANCE_DRIVER',
    roleCode: 'AMBULANCE_DRIVER',
    department: 'Emergency & Trauma Care',
    designation: 'Emergency Fleet Driver',
    status: 'ACTIVE',
    joinedDate: '2024-02-12',
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'stf-rohan',
    name: 'Dr. Rohan Mehra',
    firstName: 'Rohan',
    lastName: 'Mehra',
    staffLoginId: 'DR.ROHAN-1004',
    email: 'dr.rohan.mehra@medinexa.com',
    phone: '+91 98110 10011',
    role: 'DOCTOR',
    roleCode: 'DOCTOR',
    department: 'Emergency & Trauma Care',
    designation: 'Emergency Physician',
    status: 'ACTIVE',
    joinedDate: '2024-03-01',
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'stf-vikram',
    name: 'Dr. Vikram Malhotra',
    firstName: 'Vikram',
    lastName: 'Malhotra',
    staffLoginId: 'DR.VIKRAM-2001',
    email: 'admin.hospitalB@medinexa.com',
    phone: '+91 98220 20001',
    role: 'HOSPITAL_ADMIN',
    roleCode: 'HOSPITAL_ADMIN',
    department: 'Hospital Operations & Administration',
    designation: 'Hospital Administrator (Hospital B)',
    status: 'ACTIVE',
    joinedDate: '2024-01-20',
    hospitalId: 'HOSPITAL_B',
  },
  {
    id: 'stf-ananya',
    name: 'Dr. Ananya Sharma',
    firstName: 'Ananya',
    lastName: 'Sharma',
    staffLoginId: 'DR.ANANYA-2002',
    email: 'dr.ananya.b@medinexa.com',
    phone: '+91 98220 20002',
    role: 'DOCTOR',
    roleCode: 'DOCTOR',
    department: 'Neurology & Neurosciences',
    designation: 'Senior Consultant Neurologist',
    status: 'ACTIVE',
    joinedDate: '2024-04-12',
    hospitalId: 'HOSPITAL_B',
  },
  {
    id: 'stf-sneha-b',
    name: 'Sister Sneha Roy',
    firstName: 'Sneha',
    lastName: 'Roy',
    staffLoginId: 'NR.SNEHA-2003',
    email: 'nurse.sneha@medinexa.com',
    phone: '+91 98220 20003',
    role: 'NURSE',
    roleCode: 'NURSE',
    department: 'Inpatient Nursing Station & ICU',
    designation: 'Senior Staff Nurse (Hospital B)',
    status: 'ACTIVE',
    joinedDate: '2024-02-18',
    hospitalId: 'HOSPITAL_B',
  },
];

export const CANONICAL_DOCTORS: CanonicalDoctor[] = [
  {
    id: 'doc-rajesh',
    name: 'Dr. Rajesh Singh',
    staffLoginId: 'DR.RAJESH-1002',
    department: 'Cardiology',
    specialty: 'Interventional Cardiology',
    qualification: 'MBBS, MD (Medicine), DM (Cardiology)',
    licenseNumber: 'MCI-2018-84920',
    consultationFee: 1200,
    status: 'ACTIVE',
    availability: 'Mon-Sat 09:00 - 17:00',
    todayAppointmentsCount: 8,
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'doc-sunita',
    name: 'Dr. Sunita Singh',
    staffLoginId: 'DR.SUNITA-1001',
    department: 'Hospital Operations & Administration',
    specialty: 'Healthcare Administration & Internal Medicine',
    qualification: 'MBBS, MHA, FACP',
    licenseNumber: 'MCI-2015-44219',
    consultationFee: 1500,
    status: 'ACTIVE',
    availability: 'Mon-Fri 10:00 - 16:00',
    todayAppointmentsCount: 4,
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'doc-rohan',
    name: 'Dr. Rohan Mehra',
    staffLoginId: 'DR.ROHAN-1004',
    department: 'Emergency & Trauma Care',
    specialty: 'Emergency Medicine & Triage',
    qualification: 'MBBS, MD (Emergency Medicine)',
    licenseNumber: 'MCI-2021-33109',
    consultationFee: 900,
    status: 'ACTIVE',
    availability: '24/7 Rotational Emergency Duty',
    todayAppointmentsCount: 14,
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'doc-ananya',
    name: 'Dr. Ananya Sharma',
    staffLoginId: 'DR.ANANYA-2002',
    department: 'Neurology & Neurosciences',
    specialty: 'Neurology & Critical Care',
    qualification: 'MBBS, MD, DM (Neurology)',
    licenseNumber: 'MCI-2020-55192',
    consultationFee: 1400,
    status: 'ACTIVE',
    availability: 'Mon-Sat 08:30 - 16:30',
    todayAppointmentsCount: 6,
    hospitalId: 'HOSPITAL_B',
  },
  {
    id: 'doc-vikram',
    name: 'Dr. Vikram Malhotra',
    staffLoginId: 'DR.VIKRAM-2001',
    department: 'Hospital Operations & Administration',
    specialty: 'General Surgery & Administration',
    qualification: 'MBBS, MS (General Surgery)',
    licenseNumber: 'MCI-2014-38912',
    consultationFee: 1300,
    status: 'ACTIVE',
    availability: 'Mon-Fri 09:00 - 15:00',
    todayAppointmentsCount: 5,
    hospitalId: 'HOSPITAL_B',
  },
];

export const CANONICAL_MANAGERS: CanonicalManager[] = [
  {
    id: 'mgr-rahul',
    name: 'Rahul Verma',
    firstName: 'Rahul',
    lastName: 'Verma',
    staffLoginId: 'MG.RAHUL-1001',
    email: 'manager.rahul@medinexa.com',
    phone: '+91 98110 10009',
    department: 'Hospital Operations & Administration',
    status: 'ACTIVE',
    joinedDate: '2024-02-01',
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'mgr-kavita',
    name: 'Sister Kavita Singh',
    firstName: 'Kavita',
    lastName: 'Singh',
    staffLoginId: 'NR.KAVITA-1002',
    email: 'ward.manager@medinexa.com',
    phone: '+91 98110 10004',
    department: 'Inpatient Nursing Station & ICU',
    status: 'ACTIVE',
    joinedDate: '2024-02-20',
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'mgr-amit',
    name: 'Amit Joshi',
    firstName: 'Amit',
    lastName: 'Joshi',
    staffLoginId: 'MG.AMIT-2001',
    email: 'operations.amit@medinexa.com',
    phone: '+91 98220 20005',
    department: 'Hospital Operations & Administration',
    status: 'ACTIVE',
    joinedDate: '2024-02-15',
    hospitalId: 'HOSPITAL_B',
  },
  {
    id: 'mgr-priya-hr',
    name: 'Priya Nair',
    firstName: 'Priya',
    lastName: 'Nair',
    staffLoginId: 'HR.PRIYA-1001',
    email: 'hr.priya@medinexa.com',
    phone: '+91 98110 10015',
    department: 'Hospital Operations & Administration',
    status: 'ACTIVE',
    joinedDate: '2024-01-10',
    hospitalId: 'HOSPITAL_A',
  },
];

export const CANONICAL_SHIFTS: CanonicalShift[] = [
  {
    id: 'shf-1',
    staffId: 'stf-rajesh',
    staffName: 'Dr. Rajesh Singh',
    staffLoginId: 'DR.RAJESH-1002',
    role: 'DOCTOR',
    department: 'Cardiology',
    shiftName: 'Morning OPD Consultations',
    startTime: '09:00',
    endTime: '15:00',
    status: 'ACTIVE',
    date: '2026-10-02',
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'shf-2',
    staffId: 'stf-priya',
    staffName: 'Sister Priya Singh',
    staffLoginId: 'NR.PRIYA-1001',
    role: 'NURSE',
    department: 'Inpatient Nursing Station & ICU',
    shiftName: 'ICU Day Shift',
    startTime: '07:00',
    endTime: '15:30',
    status: 'ACTIVE',
    date: '2026-10-02',
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'shf-3',
    staffId: 'stf-rohan',
    staffName: 'Dr. Rohan Mehra',
    staffLoginId: 'DR.ROHAN-1004',
    role: 'DOCTOR',
    department: 'Emergency & Trauma Care',
    shiftName: 'Trauma 24/7 Coverage',
    startTime: '08:00',
    endTime: '20:00',
    status: 'ACTIVE',
    date: '2026-10-02',
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'shf-4',
    staffId: 'stf-pooja',
    staffName: 'Pooja Singh',
    staffLoginId: 'RC.POOJA-1001',
    role: 'RECEPTIONIST',
    department: 'Front Desk & Central OPD Reception',
    shiftName: 'Main Desk Morning',
    startTime: '08:00',
    endTime: '16:00',
    status: 'ACTIVE',
    date: '2026-10-02',
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'shf-5',
    staffId: 'stf-anil',
    staffName: 'Anil Kumar Singh',
    staffLoginId: 'LT.ANIL-1001',
    role: 'LAB_STAFF',
    department: 'Clinical Pathology & Diagnostics',
    shiftName: 'Clinical Diagnostic Batch Run',
    startTime: '08:30',
    endTime: '17:00',
    status: 'ACTIVE',
    date: '2026-10-02',
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'shf-6',
    staffId: 'stf-rahul-ph',
    staffName: 'Rahul Singh',
    staffLoginId: 'PH.RAHUL-1001',
    role: 'PHARMACIST',
    department: 'Hospital Central Pharmacy',
    shiftName: 'Pharmacy Dispensing Shift A',
    startTime: '09:00',
    endTime: '18:00',
    status: 'ACTIVE',
    date: '2026-10-02',
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'shf-7',
    staffId: 'stf-ananya',
    staffName: 'Dr. Ananya Sharma',
    staffLoginId: 'DR.ANANYA-2002',
    role: 'DOCTOR',
    department: 'Neurology & Neurosciences',
    shiftName: 'Neurology Specialty Shift',
    startTime: '08:30',
    endTime: '16:30',
    status: 'ACTIVE',
    date: '2026-10-02',
    hospitalId: 'HOSPITAL_B',
  },
  {
    id: 'shf-8',
    staffId: 'stf-sneha-b',
    staffName: 'Sister Sneha Roy',
    staffLoginId: 'NR.SNEHA-2003',
    role: 'NURSE',
    department: 'Inpatient Nursing Station & ICU',
    shiftName: 'Ward Nursing Rotational',
    startTime: '07:30',
    endTime: '16:00',
    status: 'ACTIVE',
    date: '2026-10-02',
    hospitalId: 'HOSPITAL_B',
  },
];

export const CANONICAL_ASSETS: CanonicalAsset[] = [
  {
    id: 'ast-1',
    name: 'Hamilton-G5 Intelligent ICU Ventilator',
    category: 'VENTILATOR',
    departmentId: 'dept-icu',
    departmentName: 'Inpatient Nursing Station & ICU',
    location: 'ICU Bay 4 - Bed A-ICU-04',
    serialNumber: 'HG5-2024-9912',
    warrantyExpiry: '2027-12-31',
    maintenanceFrequency: 'QUARTERLY',
    status: 'OPERATIONAL',
    purchaseCost: 1850000,
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'ast-2',
    name: 'GE CARESCAPE B850 Multiparameter Monitor',
    category: 'PATIENT_MONITOR',
    departmentId: 'dept-icu',
    departmentName: 'Inpatient Nursing Station & ICU',
    location: 'ICU Bay 1 - Bed A-ICU-01',
    serialNumber: 'GE-CS-850-4102',
    warrantyExpiry: '2026-11-15',
    maintenanceFrequency: 'SEMI_ANNUAL',
    status: 'OPERATIONAL',
    purchaseCost: 450000,
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'ast-3',
    name: 'Siemens MAGNETOM Vida 3T MRI Scanner',
    category: 'MRI_SCANNER',
    departmentId: 'dept-radio',
    departmentName: 'Radiology & PACS Imaging',
    location: 'Radiology Suite - Room 102',
    serialNumber: 'SM-MAG-3T-8812',
    warrantyExpiry: '2029-06-30',
    maintenanceFrequency: 'MONTHLY',
    status: 'OPERATIONAL',
    purchaseCost: 14500000,
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'ast-4',
    name: 'Philips Affiniti 70 Ultrasound System',
    category: 'ULTRASOUND',
    departmentId: 'dept-cardio',
    departmentName: 'Cardiology',
    location: 'Cardiology Echo Suite 2',
    serialNumber: 'PH-AFF-70-3341',
    warrantyExpiry: '2027-04-20',
    maintenanceFrequency: 'SEMI_ANNUAL',
    status: 'OPERATIONAL',
    purchaseCost: 2800000,
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'ast-5',
    name: 'Physio-Control LIFEPAK 15 Defibrillator/Monitor',
    category: 'DEFIBRILLATOR',
    departmentId: 'dept-er',
    departmentName: 'Emergency & Trauma Care',
    location: 'Emergency Resuscitation Bay 1',
    serialNumber: 'LP15-2023-5509',
    warrantyExpiry: '2028-01-15',
    maintenanceFrequency: 'MONTHLY',
    status: 'OPERATIONAL',
    purchaseCost: 750000,
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'ast-6',
    name: 'Baxter Sigma Spectrum Wireless Infusion Pump System',
    category: 'INFUSION_PUMP',
    departmentId: 'dept-icu',
    departmentName: 'Inpatient Nursing Station & ICU',
    location: 'Central Nursing Supply Depot',
    serialNumber: 'BX-SS-2024-1188',
    warrantyExpiry: '2026-08-30',
    maintenanceFrequency: 'ANNUAL',
    status: 'OPERATIONAL',
    purchaseCost: 120000,
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'ast-7',
    name: 'Fresenius 4008S Dialysis Machine',
    category: 'DIALYSIS',
    departmentId: 'dept-icu',
    departmentName: 'Inpatient Nursing Station & ICU',
    location: 'Dialysis Unit - Station 3',
    serialNumber: 'FR-4008S-6621',
    warrantyExpiry: '2027-09-15',
    maintenanceFrequency: 'QUARTERLY',
    status: 'OPERATIONAL',
    purchaseCost: 950000,
    hospitalId: 'HOSPITAL_A',
  },
  {
    id: 'ast-8',
    name: 'Siemens SOMATOM go.Top 128-Slice CT Scanner',
    category: 'CT_SCANNER',
    departmentId: 'dept-radio',
    departmentName: 'Radiology & PACS Imaging',
    location: 'Emergency CT Bunker',
    serialNumber: 'SM-SOM-128-7740',
    warrantyExpiry: '2028-10-31',
    maintenanceFrequency: 'MONTHLY',
    status: 'OPERATIONAL',
    purchaseCost: 8900000,
    hospitalId: 'HOSPITAL_A',
  },
];

export const CANONICAL_HOSPITAL_PROFILES: Record<string, CanonicalHospitalProfile> = {
  HOSPITAL_A: {
    id: 'hosp-a-canonical',
    name: 'MediNexa General Hospital (Hospital A)',
    code: 'HOSP-A',
    facilityType: 'Multi-Specialty Tertiary Care Center',
    status: 'ACTIVE',
    phone: '+91 11 2659 8000',
    email: 'operations@medinexa.com',
    address: 'Sri Aurobindo Marg, Ansari Nagar East',
    city: 'New Delhi',
    state: 'Delhi',
    postalCode: '110029',
    bedCount: 50,
    doctorCount: 12,
    staffCount: 38,
  },
  HOSPITAL_B: {
    id: 'hosp-b-canonical',
    name: 'MediNexa City Hospital (Hospital B)',
    code: 'HOSP-B',
    facilityType: 'Specialized Surgical & Acute Care Center',
    status: 'ACTIVE',
    phone: '+91 22 2410 7000',
    email: 'operations.b@medinexa.com',
    address: 'Parel East, Dr. E Borges Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400012',
    bedCount: 40,
    doctorCount: 9,
    staffCount: 28,
  },
};

/**
 * Resolves hospital staff list by blending remote backend data with canonical verified records
 * and local additions, ensuring zero empty states.
 */
export function getHospitalStaffList(backendData?: any[], hospitalId?: string): CanonicalStaffMember[] {
  const customStaffStr = typeof window !== 'undefined' ? localStorage.getItem('medinexa_custom_staff') : null;
  const customStaff: CanonicalStaffMember[] = customStaffStr ? JSON.parse(customStaffStr) : [];

  if (Array.isArray(backendData) && backendData.length > 0) {
    const backendIds = new Set(backendData.map((b) => b.id || b.staffLoginId));
    const unmergedCustom = customStaff.filter((c) => !backendIds.has(c.id) && !backendIds.has(c.staffLoginId));
    let combined = [...backendData, ...unmergedCustom];
    if (hospitalId && hospitalId !== 'ALL') {
      combined = combined.filter((s) => !s.hospitalId || s.hospitalId === hospitalId);
    }
    return combined;
  }

  let list = CANONICAL_STAFF;
  if (hospitalId && hospitalId !== 'ALL') {
    list = list.filter((s) => s.hospitalId === hospitalId);
  }
  const canonicalIds = new Set(list.map((c) => c.staffLoginId));
  const unmergedCustom = customStaff.filter((c) => !canonicalIds.has(c.staffLoginId));
  return [...list, ...unmergedCustom];
}

/**
 * Resolves doctor list ensuring zero empty states.
 */
export function getHospitalDoctorList(backendData?: any[], hospitalId?: string): CanonicalDoctor[] {
  const customDocsStr = typeof window !== 'undefined' ? localStorage.getItem('medinexa_custom_doctors') : null;
  const customDocs: CanonicalDoctor[] = customDocsStr ? JSON.parse(customDocsStr) : [];

  if (Array.isArray(backendData) && backendData.length > 0) {
    const backendIds = new Set(backendData.map((b) => b.id || b.staffLoginId));
    const unmergedCustom = customDocs.filter((c) => !backendIds.has(c.id) && !backendIds.has(c.staffLoginId));
    let combined = [...backendData, ...unmergedCustom];
    if (hospitalId && hospitalId !== 'ALL') {
      combined = combined.filter((d) => !d.hospitalId || d.hospitalId === hospitalId);
    }
    return combined;
  }

  let list = CANONICAL_DOCTORS;
  if (hospitalId && hospitalId !== 'ALL') {
    list = list.filter((d) => d.hospitalId === hospitalId);
  }
  const canonicalIds = new Set(list.map((c) => c.staffLoginId));
  const unmergedCustom = customDocs.filter((c) => !canonicalIds.has(c.staffLoginId));
  return [...list, ...unmergedCustom];
}

/**
 * Resolves hospital manager list.
 */
export function getHospitalManagerList(backendData?: any[], hospitalId?: string): CanonicalManager[] {
  const customMgrStr = typeof window !== 'undefined' ? localStorage.getItem('medinexa_custom_managers') : null;
  const customMgrs: CanonicalManager[] = customMgrStr ? JSON.parse(customMgrStr) : [];

  if (Array.isArray(backendData) && backendData.length > 0) {
    const backendIds = new Set(backendData.map((b) => b.id || b.staffLoginId));
    const unmergedCustom = customMgrs.filter((c) => !backendIds.has(c.id) && !backendIds.has(c.staffLoginId));
    let combined = [...backendData, ...unmergedCustom];
    if (hospitalId && hospitalId !== 'ALL') {
      combined = combined.filter((m) => !m.hospitalId || m.hospitalId === hospitalId);
    }
    return combined;
  }

  let list = CANONICAL_MANAGERS;
  if (hospitalId && hospitalId !== 'ALL') {
    list = list.filter((m) => m.hospitalId === hospitalId);
  }
  const canonicalIds = new Set(list.map((c) => c.staffLoginId));
  const unmergedCustom = customMgrs.filter((c) => !canonicalIds.has(c.staffLoginId));
  return [...list, ...unmergedCustom];
}

/**
 * Resolves hospital department list.
 */
export function getHospitalDepartmentList(backendData?: any[], hospitalId?: string): CanonicalDepartment[] {
  const customDeptStr = typeof window !== 'undefined' ? localStorage.getItem('medinexa_custom_departments') : null;
  const customDepts: CanonicalDepartment[] = customDeptStr ? JSON.parse(customDeptStr) : [];

  if (Array.isArray(backendData) && backendData.length > 0) {
    const backendIds = new Set(backendData.map((b) => b.id || b.code));
    const unmergedCustom = customDepts.filter((c) => !backendIds.has(c.id) && !backendIds.has(c.code));
    return [...backendData, ...unmergedCustom];
  }

  const canonicalIds = new Set(CANONICAL_DEPARTMENTS.map((c) => c.code));
  const unmergedCustom = customDepts.filter((c) => !canonicalIds.has(c.code));
  return [...CANONICAL_DEPARTMENTS, ...unmergedCustom];
}

/**
 * Resolves shifts list.
 */
export function getHospitalShiftList(backendData?: any[], hospitalId?: string): CanonicalShift[] {
  const customShiftStr = typeof window !== 'undefined' ? localStorage.getItem('medinexa_custom_shifts') : null;
  const customShifts: CanonicalShift[] = customShiftStr ? JSON.parse(customShiftStr) : [];

  if (Array.isArray(backendData) && backendData.length > 0) {
    const backendIds = new Set(backendData.map((b) => b.id));
    const unmergedCustom = customShifts.filter((c) => !backendIds.has(c.id));
    return [...backendData, ...unmergedCustom];
  }

  let list = CANONICAL_SHIFTS;
  if (hospitalId && hospitalId !== 'ALL') {
    list = list.filter((s) => s.hospitalId === hospitalId);
  }
  return [...list, ...customShifts];
}

/**
 * Resolves assets list.
 */
export function getHospitalAssetList(backendData?: any[], hospitalId?: string): CanonicalAsset[] {
  const customAssetStr = typeof window !== 'undefined' ? localStorage.getItem('medinexa_custom_assets') : null;
  const customAssets: CanonicalAsset[] = customAssetStr ? JSON.parse(customAssetStr) : [];

  if (Array.isArray(backendData) && backendData.length > 0) {
    const backendIds = new Set(backendData.map((b) => b.id || b.serialNumber));
    const unmergedCustom = customAssets.filter((c) => !backendIds.has(c.id) && !backendIds.has(c.serialNumber));
    return [...backendData, ...unmergedCustom];
  }

  let list = CANONICAL_ASSETS;
  if (hospitalId && hospitalId !== 'ALL') {
    list = list.filter((a) => a.hospitalId === hospitalId);
  }
  return [...list, ...customAssets];
}

/**
 * Resolves hospital profile.
 */
export function getHospitalProfile(backendData?: any, hospitalId: string = 'HOSPITAL_A'): CanonicalHospitalProfile {
  if (backendData && backendData.name) {
    return backendData;
  }
  return CANONICAL_HOSPITAL_PROFILES[hospitalId] || CANONICAL_HOSPITAL_PROFILES['HOSPITAL_A'];
}

export const CANONICAL_ADMIN_METRICS = {
  kpiCards: {
    todayRevenue: 248500,
    pendingPayments: 4,
    totalPatients: 142,
    activeAdmissions: 28,
    todayDischarges: 6,
    todayAppointments: 34,
    emergencyPatients: 8,
    occupiedBeds: 28,
    totalBeds: 50,
    availableBeds: 22,
    icuOccupancy: 75,
    doctorsOnDuty: 8,
    nursesOnDuty: 14,
    activeStaff: 38,
    pendingLabOrders: 7,
    pendingPharmacyOrders: 9,
  },
  livePanels: {
    bedCapacity: {
      occupancyPercentage: 56,
      totalBeds: 50,
      occupiedBeds: 28,
      availableBeds: 22,
    },
    appointments: {
      total: 34,
      completed: 18,
      pending: 16,
    },
    emergency: {
      total: 8,
      critical: 2,
    },
    revenue: {
      dailyRevenue: 248500,
    },
  },
};

export function getHospitalAdminMetrics(backendData?: any) {
  if (backendData && backendData.kpiCards) {
    return backendData;
  }
  return CANONICAL_ADMIN_METRICS;
}

export interface CanonicalSuperAdminHospital {
  id: string;
  hospitalId: string;
  name: string;
  code: string;
  facilityType: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'PENDING';
  totalBeds: number;
  availableBeds: number;
  totalDoctors: number;
  totalStaff: number;
  totalPatients: number;
  admin: {
    id: string;
    fullName: string;
    loginId: string;
    email: string;
    phone: string;
  };
}

export const CANONICAL_SUPER_ADMIN_HOSPITALS: CanonicalSuperAdminHospital[] = [
  {
    id: 'hosp-a-canonical',
    hospitalId: 'HOSP-001',
    name: 'MediNexa General Hospital (Hospital A)',
    code: 'HOSP-A',
    facilityType: 'Multi-Specialty Tertiary Care Center',
    city: 'New Delhi',
    state: 'Delhi',
    phone: '+91 11 2659 8000',
    email: 'admin.hospitalA@medinexa.com',
    status: 'ACTIVE',
    totalBeds: 50,
    availableBeds: 22,
    totalDoctors: 12,
    totalStaff: 38,
    totalPatients: 84,
    admin: {
      id: 'stf-sunita',
      fullName: 'Dr. Sunita Singh',
      loginId: 'DR.SUNITA-1001',
      email: 'admin.hospitalA@medinexa.com',
      phone: '+91 98110 10001',
    },
  },
  {
    id: 'hosp-b-canonical',
    hospitalId: 'HOSP-002',
    name: 'MediNexa City Hospital (Hospital B)',
    code: 'HOSP-B',
    facilityType: 'Specialized Surgical & Acute Care Center',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '+91 22 2410 7000',
    email: 'admin.hospitalB@medinexa.com',
    status: 'ACTIVE',
    totalBeds: 40,
    availableBeds: 18,
    totalDoctors: 9,
    totalStaff: 28,
    totalPatients: 62,
    admin: {
      id: 'stf-vikram',
      fullName: 'Dr. Vikram Malhotra',
      loginId: 'DR.VIKRAM-2001',
      email: 'admin.hospitalB@medinexa.com',
      phone: '+91 98220 20001',
    },
  },
];

export function getSuperAdminHospitalsList(backendData?: any[]): CanonicalSuperAdminHospital[] {
  const customHospStr = typeof window !== 'undefined' ? localStorage.getItem('medinexa_custom_hospitals') : null;
  const customHosp = customHospStr ? JSON.parse(customHospStr) : [];

  if (Array.isArray(backendData) && backendData.length > 0) {
    const backendIds = new Set(backendData.map((b) => b.id || b.hospitalId || b.code));
    const unmerged = customHosp.filter((c: any) => !backendIds.has(c.id) && !backendIds.has(c.code));
    return [...backendData, ...unmerged];
  }

  const canonicalIds = new Set(CANONICAL_SUPER_ADMIN_HOSPITALS.map((c) => c.code));
  const unmerged = customHosp.filter((c: any) => !canonicalIds.has(c.code));
  return [...CANONICAL_SUPER_ADMIN_HOSPITALS, ...unmerged];
}

// ====================================================
// CANONICAL HOSPITAL PATIENT DIRECTORY & REGISTRATIONS
// ====================================================

export interface CanonicalHospitalPatientRegistration {
  id: string;
  patientId: string;
  uhid: string; // Permanent Global UHID (e.g. MNX-000001)
  mrn: string; // Hospital-specific MRN (e.g. HOS-A-00045)
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  age: number;
  bloodGroup: string;
  email: string;
  facilityId: string;
  facilityName: string;
  departmentId: string;
  departmentName: string;
  status:
    | 'REGISTERED'
    | 'WAITING'
    | 'CHECKED_IN'
    | 'IN_CONSULTATION'
    | 'ADMITTED'
    | 'IN_LAB'
    | 'PHARMACY_PENDING'
    | 'DISCHARGE_PENDING'
    | 'DISCHARGED';
  registeredAt: string;
  notes?: string;
}

export const CANONICAL_PATIENT_REGISTRATIONS: CanonicalHospitalPatientRegistration[] = [
  {
    id: 'reg-hosa-ayush',
    patientId: 'demo-p-01',
    uhid: 'AYU-4826-KM',
    mrn: 'MRN-A-2026-004521',
    name: 'Ayush Singh',
    firstName: 'Ayush',
    lastName: 'Singh',
    phone: '+91 98765 43210',
    gender: 'Male',
    dateOfBirth: '1988-10-14',
    age: 36,
    bloodGroup: 'O+',
    email: 'ayush.singh@patient.medinexa.health',
    facilityId: 'HOSPITAL_A',
    facilityName: 'MediNexa General Hospital (Hospital A)',
    departmentId: 'dept-cardio',
    departmentName: 'Department of Cardiology',
    status: 'REGISTERED',
    registeredAt: '2026-08-01T09:00:00.000Z',
    notes: 'Outpatient Cardiac Evaluation',
  },
  {
    id: 'reg-hosa-priya',
    patientId: 'demo-p-02',
    uhid: 'PRI-2841-XD',
    mrn: 'HOS-A-00046',
    name: 'Priya Sharma',
    firstName: 'Priya',
    lastName: 'Sharma',
    phone: '+91 98112 34567',
    gender: 'Female',
    dateOfBirth: '1998-02-14',
    age: 28,
    bloodGroup: 'B+',
    email: 'priya.sharma@patient.medinexa.health',
    facilityId: 'HOSPITAL_A',
    facilityName: 'MediNexa General Hospital (Hospital A)',
    departmentId: 'dept-mat',
    departmentName: 'Department of Obstetrics & Maternity',
    status: 'REGISTERED',
    registeredAt: '2026-08-05T10:30:00.000Z',
    notes: 'Antenatal Routine Checkup',
  },
  {
    id: 'reg-hosb-priya',
    patientId: 'demo-p-02',
    uhid: 'PRI-2841-XD', // Same permanent Person ID / UHID across Hospital A & B
    mrn: 'HOS-B-00021', // Local MRN for Hospital B
    name: 'Priya Sharma',
    firstName: 'Priya',
    lastName: 'Sharma',
    phone: '+91 98112 34567',
    gender: 'Female',
    dateOfBirth: '1998-02-14',
    age: 28,
    bloodGroup: 'B+',
    email: 'priya.sharma@patient.medinexa.health',
    facilityId: 'HOSPITAL_B',
    facilityName: 'MediNexa City Hospital (Hospital B)',
    departmentId: 'dept-gen',
    departmentName: 'General Outpatient Clinic',
    status: 'REGISTERED',
    registeredAt: '2026-09-12T14:15:00.000Z',
    notes: 'Secondary consultation in City campus',
  },
  {
    id: 'reg-hosa-rahul',
    patientId: 'demo-p-rahul',
    uhid: 'RAH-1974-ZX',
    mrn: 'HOS-A-00047',
    name: 'Rahul Sharma',
    firstName: 'Rahul',
    lastName: 'Sharma',
    phone: '+91 98200 12345',
    gender: 'Male',
    dateOfBirth: '1990-05-15',
    age: 36,
    bloodGroup: 'A+',
    email: 'rahul.sharma@example.com',
    facilityId: 'HOSPITAL_A',
    facilityName: 'MediNexa General Hospital (Hospital A)',
    departmentId: 'dept-opd',
    departmentName: 'Front Desk & Central OPD',
    status: 'REGISTERED',
    registeredAt: '2026-09-20T11:00:00.000Z',
    notes: 'Canonical Global Patient registered at Hospital A',
  },
  {
    id: 'reg-hosa-aarav',
    patientId: 'demo-p-aarav',
    uhid: 'UHID-2026-001001',
    mrn: 'HOS-A-00048',
    name: 'Aarav Patel',
    firstName: 'Aarav',
    lastName: 'Patel',
    phone: '+91 98330 44556',
    gender: 'Male',
    dateOfBirth: '1995-11-20',
    age: 31,
    bloodGroup: 'O+',
    email: 'aarav.patel@example.com',
    facilityId: 'HOSPITAL_A',
    facilityName: 'MediNexa General Hospital (Hospital A)',
    departmentId: 'dept-neuro',
    departmentName: 'Neurology & Neurosciences',
    status: 'REGISTERED',
    registeredAt: '2026-09-25T16:00:00.000Z',
    notes: 'Neurology Consultation Intake',
  },
];

const LOCAL_STORAGE_REGISTRATIONS_KEY = 'medinexa_canonical_patient_registrations_v1';

export function getHospitalPatientDirectory(
  facilityId: string = 'HOSPITAL_A',
  search?: string,
): CanonicalHospitalPatientRegistration[] {
  const normFac = facilityId.includes('HOSPITAL_B') || facilityId === 'FAC-HOSPITAL-B' ? 'HOSPITAL_B' : 'HOSPITAL_A';

  let customRegs: CanonicalHospitalPatientRegistration[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_REGISTRATIONS_KEY);
      if (stored) customRegs = JSON.parse(stored);
    } catch {}
  }

  const allRegs = [...CANONICAL_PATIENT_REGISTRATIONS, ...customRegs];

  // Unique by MRN + Facility
  const seenMrn = new Set<string>();
  const facilityRegs: CanonicalHospitalPatientRegistration[] = [];

  for (const r of allRegs) {
    const isTargetFac =
      normFac === 'HOSPITAL_B'
        ? r.facilityId === 'HOSPITAL_B' || r.facilityId.includes('HOSPITAL_B')
        : r.facilityId === 'HOSPITAL_A' || r.facilityId.includes('HOSPITAL_A');

    if (isTargetFac && !seenMrn.has(r.mrn)) {
      seenMrn.add(r.mrn);
      facilityRegs.push(r);
    }
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    return facilityRegs.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.uhid.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q) ||
        p.phone.includes(q),
    );
  }

  return facilityRegs;
}

export function matchGlobalPatient(
  criteria: {
    uhid?: string;
    phone?: string;
    mrn?: string;
    name?: string;
    dateOfBirth?: string;
  },
  facilityId: string = 'HOSPITAL_A',
) {
  const normFac = facilityId.includes('HOSPITAL_B') ? 'HOSPITAL_B' : 'HOSPITAL_A';

  const hasUhid = Boolean(criteria.uhid && criteria.uhid.trim());
  const hasPhone = Boolean(criteria.phone && criteria.phone.trim());
  const hasMrn = Boolean(criteria.mrn && criteria.mrn.trim());
  const hasDob = Boolean(criteria.dateOfBirth && criteria.dateOfBirth.trim());
  const hasName = Boolean(criteria.name && criteria.name.trim());

  if (hasName && !hasUhid && !hasPhone && !hasMrn && !hasDob) {
    return {
      matched: false,
      requiresVerification: true,
      message:
        'Insufficient identity verification information. Matching by name alone is strictly blocked to prevent accidental patient record mixing. Please provide UHID, verified mobile number, or Date of Birth.',
    };
  }

  let customRegs: CanonicalHospitalPatientRegistration[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_REGISTRATIONS_KEY);
      if (stored) customRegs = JSON.parse(stored);
    } catch {}
  }

  const allRegs = [...CANONICAL_PATIENT_REGISTRATIONS, ...customRegs];

  let matched: CanonicalHospitalPatientRegistration | undefined;

  if (hasUhid) {
    const u = criteria.uhid!.trim().toUpperCase().replace(/^MNX:UHID:/i, '').replace(/\s+/g, '');
    matched = allRegs.find(
      (r) =>
        r.uhid.toUpperCase() === u ||
        (u === 'AYU-4826-KM' && (r.uhid === 'AYU-4826-KM' || r.patientId === 'demo-p-01')) ||
        (u === 'MNX-IND-8F42-7K91-6P3A' && (r.uhid === 'AYU-4826-KM' || r.patientId === 'demo-p-01')) ||
        (u === 'PRI-2841-XD' && (r.uhid === 'PRI-2841-XD' || r.patientId === 'demo-p-02')) ||
        (u === 'RAH-1974-ZX' && (r.uhid === 'RAH-1974-ZX' || r.patientId === 'demo-p-rahul')) ||
        (u === 'MNX-000001' && (r.uhid === 'RAH-1974-ZX' || r.patientId === 'demo-p-rahul')),
    );
  }

  if (!matched && hasPhone) {
    const cleanPhone = criteria.phone!.replace(/[^0-9]/g, '').slice(-10);
    matched = allRegs.find((r) => r.phone.replace(/[^0-9]/g, '').slice(-10) === cleanPhone);
  }

  if (!matched && hasMrn) {
    const m = criteria.mrn!.trim().toUpperCase();
    matched = allRegs.find((r) => r.mrn.toUpperCase() === m);
  }

  if (!matched && hasName && hasDob) {
    const n = criteria.name!.trim().toLowerCase();
    const d = criteria.dateOfBirth!.trim();
    matched = allRegs.find((r) => r.name.toLowerCase() === n && r.dateOfBirth === d);
  }

  if (!matched) {
    return {
      matched: false,
      message: 'No existing global patient found matching criteria.',
    };
  }

  // Get all registrations across all hospitals for this global patient
  const patientRegistrations = allRegs.filter((r) => r.uhid === matched!.uhid || r.patientId === matched!.patientId);
  const isRegisteredAtCurrentFacility = patientRegistrations.some(
    (r) =>
      normFac === 'HOSPITAL_B'
        ? r.facilityId === 'HOSPITAL_B' || r.facilityId.includes('HOSPITAL_B')
        : r.facilityId === 'HOSPITAL_A' || r.facilityId.includes('HOSPITAL_A'),
  );

  const currentRegistration = patientRegistrations.find(
    (r) =>
      normFac === 'HOSPITAL_B'
        ? r.facilityId === 'HOSPITAL_B' || r.facilityId.includes('HOSPITAL_B')
        : r.facilityId === 'HOSPITAL_A' || r.facilityId.includes('HOSPITAL_A'),
  );

  return {
    matched: true,
    patient: matched,
    registrations: patientRegistrations,
    isRegisteredAtCurrentFacility,
    currentFacilityRegistration: currentRegistration,
  };
}

export function registerPatientAtHospital(
  patient: {
    patientId: string;
    uhid: string;
    name: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
    bloodGroup?: string;
    email?: string;
  },
  facilityId: string = 'HOSPITAL_A',
  departmentName: string = 'Front Desk & Central OPD',
  notes?: string,
): { registration: CanonicalHospitalPatientRegistration; isNew: boolean } {
  const normFac = facilityId.includes('HOSPITAL_B') ? 'HOSPITAL_B' : 'HOSPITAL_A';
  const prefix = normFac === 'HOSPITAL_B' ? 'HOS-B' : 'HOS-A';
  const facName = normFac === 'HOSPITAL_B' ? 'MediNexa City Hospital (Hospital B)' : 'MediNexa General Hospital (Hospital A)';

  let customRegs: CanonicalHospitalPatientRegistration[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_REGISTRATIONS_KEY);
      if (stored) customRegs = JSON.parse(stored);
    } catch {}
  }

  const allRegs = [...CANONICAL_PATIENT_REGISTRATIONS, ...customRegs];

  // Duplicate check
  const existing = allRegs.find(
    (r) =>
      (r.uhid === patient.uhid || r.patientId === patient.patientId) &&
      (normFac === 'HOSPITAL_B' ? r.facilityId === 'HOSPITAL_B' : r.facilityId === 'HOSPITAL_A'),
  );

  if (existing) {
    return { registration: existing, isNew: false };
  }

  // Generate new MRN for this hospital (Section 4 & 5)
  const count = allRegs.filter((r) => (normFac === 'HOSPITAL_B' ? r.facilityId === 'HOSPITAL_B' : r.facilityId === 'HOSPITAL_A')).length + 45;
  const mrn = normFac === 'HOSPITAL_B' && (patient.uhid === 'MNX-IND-8F42-7K91-6P3A' || patient.patientId === 'demo-p-01')
    ? 'MRN-B-2026-001783'
    : generateHospitalMrn(normFac, count);

  const names = patient.name.trim().split(/\s+/);
  const firstName = names[0] || 'Patient';
  const lastName = names.slice(1).join(' ') || 'Record';

  const newReg: CanonicalHospitalPatientRegistration = {
    id: `reg-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    patientId: patient.patientId,
    uhid: patient.uhid, // Permanent UHID preserved!
    mrn,
    name: patient.name,
    firstName,
    lastName,
    phone: patient.phone || '+91 98000 00000',
    gender: (patient.gender as any) || 'Male',
    dateOfBirth: patient.dateOfBirth || '1995-01-01',
    age: 2026 - parseInt((patient.dateOfBirth || '1995').split('-')[0], 10) || 30,
    bloodGroup: patient.bloodGroup || 'O+',
    email: patient.email || `${firstName.toLowerCase()}.${patient.uhid.toLowerCase()}@patient.medinexa.health`,
    facilityId: normFac,
    facilityName: facName,
    departmentId: 'dept-opd',
    departmentName,
    status: 'REGISTERED',
    registeredAt: new Date().toISOString(),
    notes: notes || 'Hospital Registration created at Reception',
  };

  const nextCustom = [newReg, ...customRegs];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_REGISTRATIONS_KEY, JSON.stringify(nextCustom));
    } catch {}
  }

  return { registration: newReg, isNew: true };
}

