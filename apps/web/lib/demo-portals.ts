export interface PortalDemoAccount {
  id: string;
  portalKey: 'admin' | 'manager' | 'reception' | 'doctor' | 'nurse' | 'lab' | 'pharmacy' | 'ambulance' | 'billing' | 'superadmin' | 'patient';
  portalName: string;
  name: string;
  title: string;
  department: string;
  hospitalId: 'HOSPITAL_A' | 'HOSPITAL_B' | 'ALL';
  hospitalName: string;
  staffId: string;
  email: string;
  password: string;
  roleCode: string;
  defaultRoute: string;
  badgeColor: string;
  avatarBg: string;
  description: string;
  keyFeatures: string[];
}

export interface PortalGroup {
  key: string;
  title: string;
  subtitle: string;
  badge: string;
  iconName: string;
  badgeColor: string;
  accounts: PortalDemoAccount[];
}

export const PORTALS_DEMO_DATA: PortalGroup[] = [
  // =========================================================================
  // 1. HOSPITAL ADMIN PORTAL (2 Accounts) - Top Priority
  // =========================================================================
  {
    key: 'admin',
    title: 'Hospital Admin Portal (Operations & Census)',
    subtitle: 'Facility ward census, bed occupancy matrix, staff HRMS compliance, and financial analytics.',
    badge: 'Admin Portal',
    iconName: 'Building',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    accounts: [
      {
        id: 'admin-demo-1',
        portalKey: 'admin',
        portalName: 'Hospital Admin (Hospital A)',
        name: 'Dr. Sunita Singh',
        title: 'Chief Operating Officer & Hospital Administrator',
        department: 'Hospital Administration & Executive Operations',
        hospitalId: 'HOSPITAL_A',
        hospitalName: 'MediNexa General Hospital (Hospital A)',
        staffId: 'ADM.SUNITA-0101',
        email: 'admin.hospitalA@medinexa.com',
        password: 'Admin@2026',
        roleCode: 'HOSPITAL_ADMIN',
        defaultRoute: '/dashboard',
        badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        avatarBg: 'from-purple-600 to-indigo-700',
        description: 'Dedicated administration for Hospital A. Manages 50-bed census, ward occupancy, staff compliance, and operational analytics.',
        keyFeatures: ['Hospital A Operations', 'Ward Census Grid', 'Staff Management & HRMS', 'Financial P&L'],
      },
      {
        id: 'admin-demo-2',
        portalKey: 'admin',
        portalName: 'Hospital Admin (Hospital B)',
        name: 'Dr. Vikram Malhotra',
        title: 'Hospital Director & Inpatient Operations Lead',
        department: 'Clinical Governance & Super-Specialty Management',
        hospitalId: 'HOSPITAL_B',
        hospitalName: 'MediNexa Institute of Medical Sciences (Hospital B)',
        staffId: 'ADM.VIKRAM-0102',
        email: 'admin.hospitalB@medinexa.com',
        password: 'Admin@2026',
        roleCode: 'HOSPITAL_ADMIN',
        defaultRoute: '/dashboard',
        badgeColor: 'bg-violet-50 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300 border-violet-200 dark:border-violet-800',
        avatarBg: 'from-violet-600 to-purple-800',
        description: 'Directs 54-bed Institute with surgical suites, cardiac cath labs, and quaternary care referral networks.',
        keyFeatures: ['Hospital B Command Desk', 'Surgical OT Scheduling', 'Specialist Roster', 'Inter-Facility Transfers'],
      },
    ],
  },

  // =========================================================================
  // 2. MANAGER PORTAL (Inpatient Ward & Operations) (2 Accounts)
  // =========================================================================
  {
    key: 'manager',
    title: 'Manager Portal (Inpatient Ward & Operations)',
    subtitle: 'Real-time bed matrix grid, IPD ward transfers, admission clearance, and discharge coordination.',
    badge: 'Manager Portal',
    iconName: 'BedDouble',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300 dark:border-teal-800',
    accounts: [
      {
        id: 'mgr-demo-1',
        portalKey: 'manager',
        portalName: 'Hospital Operations Manager (Hospital A)',
        name: 'Rajesh Verma',
        title: 'Hospital Operations Manager (Hospital A)',
        department: 'Hospital Operational Command & Workforce Deployment',
        hospitalId: 'HOSPITAL_A',
        hospitalName: 'MediNexa Memorial Hospital (Hospital A)',
        staffId: 'MGR.RAJESH-0801',
        email: 'ward.manager@medinexa.com',
        password: 'Manager@2026',
        roleCode: 'MANAGER',
        defaultRoute: '/dashboard/manager',
        badgeColor: 'bg-teal-50 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300 border-teal-200 dark:border-teal-800',
        avatarBg: 'from-teal-600 to-cyan-700',
        description: 'Complete hospital operations, staff deployment, OPD queues, bed capacity, emergency, and live floor telemetry for Hospital A.',
        keyFeatures: ['Command Center', 'Staff Deployment', 'OPD & Bed Capacity', 'Live Operations Telemetry'],
      },
      {
        id: 'mgr-demo-2',
        portalKey: 'manager',
        portalName: 'Hospital Operations Manager (Hospital B)',
        name: 'Arun Saxena',
        title: 'Hospital Operations Manager (Hospital B)',
        department: 'Hospital Operational Command & Workforce Deployment',
        hospitalId: 'HOSPITAL_B',
        hospitalName: 'MediNexa Institute of Medical Sciences (Hospital B)',
        staffId: 'MGR.ARUN-0802',
        email: 'ward.manager.b@medinexa.com',
        password: 'Manager@2026',
        roleCode: 'MANAGER',
        defaultRoute: '/dashboard/manager',
        badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
        avatarBg: 'from-cyan-600 to-teal-700',
        description: 'Multi-specialty hospital operations, ICU capacity, staff deployment, and emergency command for Hospital B.',
        keyFeatures: ['Command Center', 'ICU & Ward Capacity', 'Staff Roster & Attendance', 'Emergency Escalations'],
      },
    ],
  },

  // =========================================================================
  // 3. FRONT DESK & RECEPTION PORTAL (2 Accounts)
  // =========================================================================
  {
    key: 'reception',
    title: 'Reception & OPD Portal (Intake & Tokens)',
    subtitle: 'Patient registrations, new UHID biometric issuance, doctor slot reservations, and queue tokens.',
    badge: 'Reception Portal',
    iconName: 'UserCheck',
    badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300 dark:border-orange-800',
    accounts: [
      {
        id: 'rec-demo-1',
        portalKey: 'reception',
        portalName: 'Reception Portal (Hospital A)',
        name: 'Pooja Singh',
        title: 'Chief Patient Registration Officer (Hospital A)',
        department: 'Front Desk & Central OPD Reception (Hospital A)',
        hospitalId: 'HOSPITAL_A',
        hospitalName: 'MediNexa General Hospital (Hospital A)',
        staffId: 'REC.POOJA-0401',
        email: 'reception@medinexa.com',
        password: 'Reception@2026',
        roleCode: 'RECEPTIONIST',
        defaultRoute: '/dashboard/reception',
        badgeColor: 'bg-orange-50 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300 border-orange-200 dark:border-orange-800',
        avatarBg: 'from-orange-500 to-amber-600',
        description: 'Patient check-ins, new UHID generation, doctor slot bookings, and token printing at Hospital A.',
        keyFeatures: ['New UHID Generation', 'OPD Slot Booking', 'Queue Token Console', 'Emergency Triage Check-in'],
      },
      {
        id: 'rec-demo-2',
        portalKey: 'reception',
        portalName: 'Reception Portal (Hospital B)',
        name: 'Rahul Varma',
        title: 'OPD Token Desk & Patient Intake Coordinator (Hospital B)',
        department: 'Ambulatory Care Reception & Queue Management',
        hospitalId: 'HOSPITAL_B',
        hospitalName: 'MediNexa Institute of Medical Sciences (Hospital B)',
        staffId: 'REC.RAHUL-0402',
        email: 'reception.b@medinexa.com',
        password: 'Reception@2026',
        roleCode: 'RECEPTIONIST',
        defaultRoute: '/dashboard/reception',
        badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        avatarBg: 'from-amber-500 to-orange-600',
        description: 'Rapid intake officer managing high-volume super-specialty queue tokens, ABHA ID linking, and triage desk at Hospital B.',
        keyFeatures: ['ABHA Verification', 'Express OPD Check-In', 'Specialist Tokens', 'Inpatient Escort Desk'],
      },
    ],
  },

  // =========================================================================
  // 4. DOCTOR / CLINICAL PORTAL (2 Accounts)
  // =========================================================================
  {
    key: 'doctor',
    title: 'Doctor Portal (Clinical Specialists)',
    subtitle: 'OPD queue management, inpatient rounds, digital prescriptions, and clinical telemetry.',
    badge: 'Doctor Portal',
    iconName: 'Stethoscope',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    accounts: [
      {
        id: 'doc-demo-1',
        portalKey: 'doctor',
        portalName: 'Doctor Portal (Hospital A)',
        name: 'Dr. Rajesh Singh',
        title: 'Senior Consultant Cardiologist & Tele-ICU Lead',
        department: 'Department of Cardiology & Telemedicine',
        hospitalId: 'HOSPITAL_A',
        hospitalName: 'MediNexa General Hospital (Hospital A)',
        staffId: 'DR.RAJESH-0263',
        email: 'dr.rajesh.singh@medinexa.com',
        password: 'Doctor@2026',
        roleCode: 'DOCTOR',
        defaultRoute: '/dashboard/doctor-appointments',
        badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        avatarBg: 'from-blue-600 to-indigo-700',
        description: 'Hospital A cardiologist managing OPD consultation queue, patient vitals, and cardiac ward admissions.',
        keyFeatures: ['OPD Queue Tracking', 'Digital Rx Signing', 'Bedside Vitals Stream', 'Telemedicine Suite'],
      },
      {
        id: 'doc-demo-2',
        portalKey: 'doctor',
        portalName: 'Doctor Portal (Hospital B)',
        name: 'Dr. Ananya Sen',
        title: 'Senior Consultant Obstetrician & Fetal Medicine Lead',
        department: 'Department of Obstetrics & Maternal Health',
        hospitalId: 'HOSPITAL_B',
        hospitalName: 'MediNexa Institute of Medical Sciences (Hospital B)',
        staffId: 'DR.ANANYA-0264',
        email: 'dr.ananya.b@medinexa.com',
        password: 'Doctor@2026',
        roleCode: 'DOCTOR',
        defaultRoute: '/dashboard/doctor-appointments',
        badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        avatarBg: 'from-indigo-600 to-purple-700',
        description: 'Hospital B lead obstetrician managing prenatal maternal flowsheet, ultrasound diagnostics, and delivery triage.',
        keyFeatures: ['Fetal Monitoring Flowsheet', 'Maternal Vitals Review', 'Antenatal Appointments', 'Specialist Consults'],
      },
    ],
  },

  // =========================================================================
  // 5. NURSING & INPATIENT CARE PORTAL (2 Accounts)
  // =========================================================================
  {
    key: 'nurse',
    title: 'Nursing Portal (Inpatient & Ward Care)',
    subtitle: 'Bedside telemetry recording, Medication Administration Records (MAR), and nurse shift handovers.',
    badge: 'Nursing Portal',
    iconName: 'HeartPulse',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800',
    accounts: [
      {
        id: 'nurse-demo-1',
        portalKey: 'nurse',
        portalName: 'Nursing Portal (Hospital A)',
        name: 'Nurse Priya Sharma',
        title: 'Head Ward & Critical Care Nurse (Hospital A)',
        department: 'Department of Inpatient Nursing & Critical Care',
        hospitalId: 'HOSPITAL_A',
        hospitalName: 'MediNexa General Hospital (Hospital A)',
        staffId: 'NUR.PRIYA-0301',
        email: 'nurse.priya@medinexa.com',
        password: 'Nurse@2026',
        roleCode: 'NURSE',
        defaultRoute: '/dashboard/nursing',
        badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        avatarBg: 'from-rose-500 to-pink-600',
        description: 'Head nurse for General Ward & Step-Down ICU at Hospital A, administering medications and logging vital signs.',
        keyFeatures: ['Medication Admin (MAR)', 'Vital Signs Flowsheet', 'Shift Handover Notes', 'Doctor STAT Alerts'],
      },
      {
        id: 'nurse-demo-2',
        portalKey: 'nurse',
        portalName: 'Nursing Portal (Hospital B)',
        name: 'Nurse Kavita Nair',
        title: 'Lead ICU & Emergency Trauma Nurse (Hospital B)',
        department: 'Intensive Cardiac Care Unit (ICCU)',
        hospitalId: 'HOSPITAL_B',
        hospitalName: 'MediNexa Institute of Medical Sciences (Hospital B)',
        staffId: 'NUR.KAVITA-0302',
        email: 'nurse.kavita.b@medinexa.com',
        password: 'Nurse@2026',
        roleCode: 'NURSE',
        defaultRoute: '/dashboard/nursing',
        badgeColor: 'bg-pink-50 text-pink-700 dark:bg-pink-950/80 dark:text-pink-300 border-pink-200 dark:border-pink-800',
        avatarBg: 'from-pink-600 to-rose-700',
        description: 'Critical care nurse managing ventilators, syringe pumps, continuous arterial line telemetry, and trauma triage at Hospital B.',
        keyFeatures: ['ICU Bedside Telemetry', 'Blood Infusion Protocol', 'Infusion Pump Register', 'Crash Cart Checklists'],
      },
    ],
  },

  // =========================================================================
  // 6. LABORATORY & DIAGNOSTICS PORTAL (2 Accounts)
  // =========================================================================
  {
    key: 'lab',
    title: 'Laboratory Portal (Pathology & Diagnostics)',
    subtitle: 'Sample barcoding, automated analyzer accessioning, critical value panic alerts, and signed reports.',
    badge: 'Lab Portal',
    iconName: 'FlaskConical',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300 dark:border-teal-800',
    accounts: [
      {
        id: 'lab-demo-1',
        portalKey: 'lab',
        portalName: 'Lab Portal (Hospital A)',
        name: 'Anil Kumar Singh',
        title: 'Senior Laboratory Technician & Pathology Lead (Hospital A)',
        department: 'Central Clinical Pathology & Biochemistry',
        hospitalId: 'HOSPITAL_A',
        hospitalName: 'MediNexa General Hospital (Hospital A)',
        staffId: 'LAB.ANIL-0501',
        email: 'lab.anil@medinexa.com',
        password: 'Lab@2026',
        roleCode: 'LAB_STAFF',
        defaultRoute: '/dashboard/lab',
        badgeColor: 'bg-teal-50 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300 border-teal-200 dark:border-teal-800',
        avatarBg: 'from-teal-600 to-emerald-700',
        description: 'Blood sample accessioning, automated analyzer imports, test validation, and signed lab report release at Hospital A.',
        keyFeatures: ['Sample Barcoding', 'Diagnostic Test Entry', 'Panic Value Alerts', 'NABL Verified PDFs'],
      },
      {
        id: 'lab-demo-2',
        portalKey: 'lab',
        portalName: 'Lab Portal (Hospital B)',
        name: 'Ramesh Patel',
        title: 'Chief Medical Laboratory Technologist (Hospital B)',
        department: 'Department of Diagnostic Hematology & Molecular Lab',
        hospitalId: 'HOSPITAL_B',
        hospitalName: 'MediNexa Institute of Medical Sciences (Hospital B)',
        staffId: 'LAB.RAMESH-0502',
        email: 'lab.ramesh.b@medinexa.com',
        password: 'Lab@2026',
        roleCode: 'LAB_STAFF',
        defaultRoute: '/dashboard/lab',
        badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        avatarBg: 'from-emerald-600 to-teal-700',
        description: 'Runs high-throughput Roche/Sysmex analyzers, troponin STAT tests, blood culture incubators, and bi-directional LIS.',
        keyFeatures: ['STAT Cardiac Biomarkers', 'Blood Culture Telemetry', 'Bi-directional LIS', 'Signed Digital Signatures'],
      },
    ],
  },

  // =========================================================================
  // 7. PHARMACY & MEDICAL SUPPLIES PORTAL (2 Accounts)
  // =========================================================================
  {
    key: 'pharmacy',
    title: 'Pharmacy Portal (Dispensing & Stock)',
    subtitle: 'Prescription dispensing, batch & expiry verification, Schedule H1 drug registries, and reordering.',
    badge: 'Pharmacy Portal',
    iconName: 'Pill',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    accounts: [
      {
        id: 'phar-demo-1',
        portalKey: 'pharmacy',
        portalName: 'Pharmacy Portal (Hospital A)',
        name: 'Rahul Singh',
        title: 'Chief Hospital Pharmacist (Hospital A)',
        department: 'Inpatient & Outpatient Central Pharmacy',
        hospitalId: 'HOSPITAL_A',
        hospitalName: 'MediNexa General Hospital (Hospital A)',
        staffId: 'PHAR.RAHUL-0601',
        email: 'pharmacist.rahul@medinexa.com',
        password: 'Pharmacy@2026',
        roleCode: 'PHARMACY_STAFF',
        defaultRoute: '/dashboard/pharmacy',
        badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        avatarBg: 'from-amber-600 to-yellow-700',
        description: 'Hospital A prescription dispensing, batch & expiry verification, Schedule H1 drug registries, and stock reordering.',
        keyFeatures: ['Prescription Dispensing', 'Schedule H1 Compliance', 'Near-Expiry Stock Alerts', 'Automated Reorder POS'],
      },
      {
        id: 'phar-demo-2',
        portalKey: 'pharmacy',
        portalName: 'Pharmacy Portal (Hospital B)',
        name: 'Neha Gupta',
        title: 'Lead Inpatient Medication Dispenser (Hospital B)',
        department: 'Clinical Pharmacy & Formularies (Hospital B)',
        hospitalId: 'HOSPITAL_B',
        hospitalName: 'MediNexa Institute of Medical Sciences (Hospital B)',
        staffId: 'PHAR.NEHA-0602',
        email: 'pharmacy.b@medinexa.com',
        password: 'Pharmacy@2026',
        roleCode: 'PHARMACY_STAFF',
        defaultRoute: '/dashboard/pharmacy',
        badgeColor: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/80 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
        avatarBg: 'from-yellow-600 to-amber-700',
        description: 'Hospital B lead pharmacist managing unit-dose dispensing, oncology chemotherapy regimens, and IV compounding protocols.',
        keyFeatures: ['Unit-Dose Cart Fills', 'Oncology Chemo Protocols', 'Narcotics Vault Audit', 'Automated Dispense Cabinets'],
      },
    ],
  },

  // =========================================================================
  // 8. AMBULANCE & EMS EMERGENCY DISPATCH PORTAL (2 Accounts)
  // =========================================================================
  {
    key: 'ambulance',
    title: 'Ambulance & EMS Portal (Emergency & Trauma Dispatch)',
    subtitle: 'Live GPS fleet tracking, emergency SOS dispatch, mobile ICU telemetry, and trauma triage coordination.',
    badge: 'Ambulance Portal',
    iconName: 'Ambulance',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800',
    accounts: [
      {
        id: 'amb-demo-1',
        portalKey: 'ambulance',
        portalName: 'Ambulance Fleet & Dispatch (Hospital A)',
        name: 'Suresh Kumar (EMS Lead)',
        title: 'Emergency ALS Ambulance Lead & Paramedic (Hospital A)',
        department: 'Emergency Trauma Care & Fleet Operations',
        hospitalId: 'HOSPITAL_A',
        hospitalName: 'MediNexa General Hospital (Hospital A)',
        staffId: 'AMB.SURESH-0901',
        email: 'ambulance.driver@medinexa.com',
        password: 'Ambulance@2026',
        roleCode: 'AMBULANCE_DRIVER',
        defaultRoute: '/dashboard/emergency-ambulance',
        badgeColor: 'bg-red-50 text-red-700 dark:bg-red-950/80 dark:text-red-300 border-red-200 dark:border-red-800',
        avatarBg: 'from-red-600 to-rose-700',
        description: 'Hospital A emergency ALS ambulance routing, live GPS telemetry, SOS trauma dispatch, and bedside ICU handover.',
        keyFeatures: ['Live GPS Telemetry', 'Emergency SOS Dispatch', 'Patient Onboard Status', 'ICU Triage Coordination'],
      },
      {
        id: 'amb-demo-2',
        portalKey: 'ambulance',
        portalName: 'Ambulance Fleet & Dispatch (Hospital B)',
        name: 'Vikram Rathore (EMS Officer)',
        title: 'Rapid Response ALS Ambulance Pilot (Hospital B)',
        department: 'Super-Specialty Transit & ALS Fleet (Hospital B)',
        hospitalId: 'HOSPITAL_B',
        hospitalName: 'MediNexa Institute of Medical Sciences (Hospital B)',
        staffId: 'AMB.VIKRAM-0902',
        email: 'ambulance.b@medinexa.com',
        password: 'Ambulance@2026',
        roleCode: 'AMBULANCE_DRIVER',
        defaultRoute: '/dashboard/emergency-ambulance',
        badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        avatarBg: 'from-rose-600 to-red-700',
        description: 'High-velocity critical care mobile ICU, cath lab pre-activation transit, and inter-facility neonatal transport at Hospital B.',
        keyFeatures: ['Mobile ICU Telemetry', 'Cath Lab Pre-Alert', 'Inter-Facility Transit', 'Haversine Route Engine'],
      },
    ],
  },

  // =========================================================================
  // 9. BILLING, ACCOUNTS & INSURANCE PORTAL (2 Accounts)
  // =========================================================================
  {
    key: 'billing',
    title: 'Billing & Finance Portal (Invoicing & Claims)',
    subtitle: 'Unified OPD/IPD invoices, statutory tax compliance, cashless insurance claims, and payment gateway.',
    badge: 'Billing Portal',
    iconName: 'Receipt',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    accounts: [
      {
        id: 'bil-demo-1',
        portalKey: 'billing',
        portalName: 'Billing Portal (Hospital A)',
        name: 'Kavita Singh',
        title: 'Lead Medical Billing Specialist (Hospital A)',
        department: 'Patient Accounts & Central Invoicing',
        hospitalId: 'HOSPITAL_A',
        hospitalName: 'MediNexa General Hospital (Hospital A)',
        staffId: 'BIL.KAVITA-0701',
        email: 'billing.kavita@medinexa.com',
        password: 'Billing@2026',
        roleCode: 'BILLING_STAFF',
        defaultRoute: '/dashboard/billing',
        badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        avatarBg: 'from-emerald-600 to-teal-700',
        description: 'Consolidated OPD/IPD invoices, statutory tax compliance, cash/card/UPI reconciliation, and receipt generation.',
        keyFeatures: ['Consolidated Invoices', 'GST/Tax Calculation', 'Deposit Receipts', 'Cashless TPA Pre-Auth'],
      },
      {
        id: 'bil-demo-2',
        portalKey: 'billing',
        portalName: 'Billing Portal (Hospital B)',
        name: 'Gaurav Mehta',
        title: 'Insurance & Revenue Operations Manager (Hospital B)',
        department: 'TPA Claims & Inpatient Billing (Hospital B)',
        hospitalId: 'HOSPITAL_B',
        hospitalName: 'MediNexa Institute of Medical Sciences (Hospital B)',
        staffId: 'BIL.GAURAV-0702',
        email: 'billing.gaurav.b@medinexa.com',
        password: 'Billing@2026',
        roleCode: 'BILLING_STAFF',
        defaultRoute: '/dashboard/billing',
        badgeColor: 'bg-teal-50 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300 border-teal-200 dark:border-teal-800',
        avatarBg: 'from-teal-600 to-cyan-700',
        description: 'Manages Ayushman Bharat PM-JAY packages, private corporate TPA claim adjudications, and discharge clearance.',
        keyFeatures: ['PM-JAY Pre-Auth Workflow', 'Discharge Billing Clearance', 'Corporate TPA Claims', 'Real-Time Payment Logs'],
      },
    ],
  },

  // =========================================================================
  // 10. SUPER ADMIN / ENTERPRISE GOVERNANCE PORTAL (2 Accounts)
  // =========================================================================
  {
    key: 'superadmin',
    title: 'Super Admin Portal (Multi-Facility Control)',
    subtitle: 'Cross-enterprise governance, multi-facility oversight, security audits, and system configuration.',
    badge: 'Super Admin',
    iconName: 'Crown',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    accounts: [
      {
        id: 'sa-demo-1',
        portalKey: 'superadmin',
        portalName: 'Super Admin (Enterprise Master)',
        name: 'Ayush Singh',
        title: 'Super Administrator & Chief Systems Architect',
        department: 'Enterprise Healthcare System Governance',
        hospitalId: 'ALL',
        hospitalName: 'All Network Hospitals (Cross-Enterprise Master Control)',
        staffId: 'ADM.AYUSH-0001',
        email: 'admin@medinexa.com',
        password: 'SuperAdmin@2026',
        roleCode: 'MEDINEXA_ADMIN',
        defaultRoute: '/dashboard',
        badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        avatarBg: 'from-purple-600 to-indigo-700',
        description: 'Complete cross-enterprise master control, multi-facility oversight, security audits, and system configuration across all hospitals.',
        keyFeatures: ['Cross-Hospital Control', 'Security Audit Vault', 'Master Facility Config', 'Enterprise Analytics'],
      },
      {
        id: 'sa-demo-2',
        portalKey: 'superadmin',
        portalName: 'Super Admin (Medical Director)',
        name: 'Dr. Dev Narayan',
        title: 'Enterprise Medical Director & Quality Assurance Lead',
        department: 'Clinical Governance & Enterprise Standards',
        hospitalId: 'ALL',
        hospitalName: 'All Network Hospitals (Cross-Enterprise Master Control)',
        staffId: 'ADM.DEV-0002',
        email: 'director@medinexa.com',
        password: 'SuperAdmin@2026',
        roleCode: 'MEDINEXA_ADMIN',
        defaultRoute: '/dashboard',
        badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        avatarBg: 'from-indigo-600 to-violet-700',
        description: 'Clinical quality auditor across Hospital A & B. Verifies clinical protocols, infection control statistics, and NABH compliance.',
        keyFeatures: ['NABH Quality Audits', 'Clinical Incident Tracking', 'Cross-Facility Roster', 'Antibiotic Stewardship'],
      },
    ],
  },

  // =========================================================================
  // 11. PATIENT PORTAL (2 Accounts)
  // =========================================================================
  {
    key: 'patient',
    title: 'Patient Portal (Health OS & Vitals)',
    subtitle: 'Personal medical records, real-time bed availability telemetry, medicine reminders, and appointments.',
    badge: 'Patient Portal',
    iconName: 'User',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    accounts: [
      {
        id: 'pat-demo-1',
        portalKey: 'patient',
        portalName: 'Patient Portal (Ayush Singh)',
        name: 'Ayush Singh',
        title: 'Post-Angioplasty Cardiac Rehab Patient',
        department: 'Cardiology Tele-Rehabilitation',
        hospitalId: 'HOSPITAL_A',
        hospitalName: 'MediNexa General Hospital (Hospital A)',
        staffId: 'AYU-4826-KM',
        email: 'ayush.singh@patient.medinexa.health',
        password: 'Patient@2026',
        roleCode: 'PATIENT',
        defaultRoute: '/portal',
        badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        avatarBg: 'from-emerald-600 to-teal-700',
        description: 'Post-angioplasty patient tracking daily medicine adherence, bedside vitals sync, and live hospital bed availability.',
        keyFeatures: ['Live Bed Availability', 'Medicine Reminders', 'Bedside Vitals', 'Guardian Health Score'],
      },
      {
        id: 'pat-demo-2',
        portalKey: 'patient',
        portalName: 'Patient Portal (Priya Sharma)',
        name: 'Priya Sharma',
        title: 'Trimester-2 High-Risk Maternity Patient',
        department: 'Obstetrics & Maternal Wellness',
        hospitalId: 'HOSPITAL_B',
        hospitalName: 'MediNexa Institute of Medical Sciences (Hospital B)',
        staffId: 'PRI-2841-XD',
        email: 'priya.sharma@patient.medinexa.health',
        password: 'Patient@2026',
        roleCode: 'PATIENT',
        defaultRoute: '/portal',
        badgeColor: 'bg-pink-50 text-pink-700 dark:bg-pink-950/80 dark:text-pink-300 border-pink-200 dark:border-pink-800',
        avatarBg: 'from-pink-500 to-rose-600',
        description: 'High-risk prenatal patient tracking fetal biometric scans, scheduled ultrasound appointments, and nutritional logs.',
        keyFeatures: ['Fetal Scan Archives', 'Obstetrician Chat', 'Prescription Refills', 'Emergency SOS'],
      },
    ],
  },
];

/**
 * All flattened accounts for instant lookup by Staff ID or Email
 */
export const ALL_DEMO_PORTAL_ACCOUNTS: PortalDemoAccount[] = PORTALS_DEMO_DATA.flatMap((g) => g.accounts);

/**
 * Finds a demo account by either its Staff ID (e.g. DR.RAJESH-0263) or email
 */
export function findDemoPortalAccount(identifier: string): PortalDemoAccount | undefined {
  if (!identifier) return undefined;
  const clean = identifier.trim().toLowerCase();
  return ALL_DEMO_PORTAL_ACCOUNTS.find(
    (a) => a.staffId.toLowerCase() === clean || a.email.toLowerCase() === clean,
  );
}

/**
 * 1-Click Launch helper: instantly signs into the authorized portal workspace
 */
export function launchDemoPortalSession(account: PortalDemoAccount, redirect: boolean = true) {
  if (typeof window === 'undefined') return;

  const token = `demo_token_${account.id}_${Date.now()}`;
  const user = {
    id: account.id,
    staffId: account.staffId,
    patientId: account.roleCode === 'PATIENT' ? account.staffId : undefined,
    uhid: account.roleCode === 'PATIENT' ? account.staffId : undefined,
    firstName: account.name.split(' ')[0],
    lastName: account.name.split(' ').slice(1).join(' '),
    email: account.email,
    role: { code: account.roleCode, name: account.portalName },
    roleCode: account.roleCode,
    isDemo: true,
    facilityId: account.hospitalId === 'HOSPITAL_B' ? 'fac-hospital-b' : 'fac-hospital-a',
    facility: {
      id: account.hospitalId === 'HOSPITAL_B' ? 'fac-hospital-b' : 'fac-hospital-a',
      name: account.hospitalName,
      code: account.hospitalId,
    },
  };

  localStorage.setItem('medinexa_token', token);
  localStorage.setItem('token', token);
  sessionStorage.setItem('medinexa_token', token);
  document.cookie = `medinexa_token=${token}; path=/; max-age=86400; SameSite=Lax`;
  localStorage.setItem('medinexa_user', JSON.stringify(user));

  if (account.roleCode === 'PATIENT') {
    localStorage.setItem('medinexa_patient_persona', JSON.stringify({
      id: account.id,
      name: account.name,
      email: account.email,
      uhid: account.staffId,
      condition: account.title,
      category: account.department,
      initials: account.name.split(' ').map((n) => n[0]).join('').slice(0, 2),
      vitals: {
        bloodPressure: '120/80 mmHg',
        heartRate: '72 bpm',
        spO2: '99%',
        temperature: '98.6 °F',
        recordedBy: 'Attending Physician',
        recordedAt: 'Today, OPD Review',
      },
    }));
  } else {
    localStorage.removeItem('medinexa_patient_persona');
  }

  window.dispatchEvent(new CustomEvent('medinexa:auth:changed', { detail: user }));

  if (redirect) {
    window.location.href = account.defaultRoute;
  }
}
