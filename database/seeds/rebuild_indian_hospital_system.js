const {
  PrismaClient,
  UserStatus,
  WardType,
  WardStatus,
  RoomType,
  RoomStatus,
  BedType,
  BedStatus,
  AdmissionType,
  AdmissionStatus,
  AppointmentType,
  AppointmentStatus,
  PaymentStatus,
  InvoiceStatus,
  PaymentMethod,
  InsuranceType,
  PolicyStatus,
  ClaimType,
  ClaimStatus,
  LabOrderPriority,
  LabOrderStatus,
} = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/medinexa?schema=public',
    },
  },
});

function getHash(password) {
  return bcrypt.hashSync(password, 10);
}

// -------------------------------------------------------------
// 105 AUTHENTIC INDIAN PATIENT PROFILES
// -------------------------------------------------------------
const INDIAN_FIRST_NAMES_MALE = [
  'Arjun', 'Aditya', 'Aman', 'Rohit', 'Karan', 'Rajesh', 'Sanjay', 'Vikram', 'Rohan', 'Siddharth',
  'Deepak', 'Alok', 'Manish', 'Harish', 'Tarun', 'Gaurav', 'Vikas', 'Ashwin', 'Prakash', 'Dinesh',
  'Abhinav', 'Prashant', 'Girish', 'Hemant', 'Sunil', 'Vijay', 'Naveen', 'Ramesh', 'Suresh', 'Ajay',
  'Mahesh', 'Kishore', 'Praveen', 'Anand', 'Vivek', 'Sachin', 'Rahul', 'Nitin', 'Ashish', 'Varun'
];

const INDIAN_FIRST_NAMES_FEMALE = [
  'Aditi', 'Neha', 'Pooja', 'Sneha', 'Riya', 'Priya', 'Ananya', 'Meera', 'Kavita', 'Sunita',
  'Swati', 'Deepa', 'Tanvi', 'Shweta', 'Divya', 'Smita', 'Monika', 'Ankita', 'Pallavi', 'Shalini',
  'Geetanjali', 'Nisha', 'Bhavna', 'Aparna', 'Payal', 'Rashmi', 'Madhavi', 'Kiran', 'Sonali', 'Anita',
  'Ritu', 'Komal', 'Suman', 'Archana', 'Poonam', 'Reena', 'Meenakshi', 'Usha', 'Preeti', 'Sangeeta'
];

const INDIAN_LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Mishra', 'Nair', 'Patel', 'Yadav', 'Kulkarni', 'Iyer',
  'Malhotra', 'Reddy', 'Joshi', 'Bhatt', 'Mukherjee', 'Das', 'Rao', 'Choudhary', 'Deshmukh', 'Nambiar',
  'Trivedi', 'Saxena', 'Sen', 'Pillai', 'Hegde', 'Mehra', 'Kapoor', 'Bansal', 'Chawla', 'Sethi',
  'Menon', 'Tiwari', 'Pandey', 'Subramanian', 'Dubey', 'Kumar', 'Sinha', 'Chauhan', 'Khatri', 'Vaidya'
];

const NOIDA_NCR_LOCALITIES = [
  'Sector 62, Noida, Uttar Pradesh - 201309',
  'Sector 50, Noida, Uttar Pradesh - 201301',
  'Sector 18, Noida, Uttar Pradesh - 201301',
  'Sector 137, Noida, Uttar Pradesh - 201305',
  'Sector 76, Noida, Uttar Pradesh - 201304',
  'Beta 1, Greater Noida, Uttar Pradesh - 201310',
  'Alpha 2, Greater Noida, Uttar Pradesh - 201308',
  'Indirapuram, Ghaziabad, Uttar Pradesh - 201014',
  'Vaishali, Ghaziabad, Uttar Pradesh - 201010',
  'Raj Nagar Extension, Ghaziabad, Uttar Pradesh - 201017',
  'Mayur Vihar Phase 1, New Delhi - 110091',
  'Preet Vihar, Vikas Marg, New Delhi - 110092',
  'Vasundhara Enclave, New Delhi - 110096',
  'Civil Lines, Lucknow, Uttar Pradesh - 226001',
  'Hazratganj, Park Road, Lucknow, Uttar Pradesh - 226001',
  'Swaroop Nagar, Kanpur, Uttar Pradesh - 208002',
  'Civil Lines, Meerut, Uttar Pradesh - 250001',
  'Sanjay Place, Agra, Uttar Pradesh - 282002',
  'Sigra Mehmoorganj Road, Varanasi, Uttar Pradesh - 221010',
  'Civil Lines, Prayagraj, Uttar Pradesh - 211001',
];

const BLOOD_GROUPS = ['A_POSITIVE', 'B_POSITIVE', 'O_POSITIVE', 'AB_POSITIVE', 'A_NEGATIVE', 'B_NEGATIVE', 'O_NEGATIVE', 'AB_NEGATIVE'];

function generate105IndianPatients() {
  const patients = [];

  // Top 10 specific examples from user prompt
  const explicitTop10 = [
    { firstName: 'Arjun', lastName: 'Nair', gender: 'MALE', age: 34, blood: 'O_POSITIVE', address: 'Flat 402, Prateek Fedora, Sector 120, Noida - 201301' },
    { firstName: 'Aditya', lastName: 'Sharma', gender: 'MALE', age: 29, blood: 'A_POSITIVE', address: 'B-104, ATS Greens Village, Sector 93A, Noida - 201304' },
    { firstName: 'Aman', lastName: 'Gupta', gender: 'MALE', age: 42, blood: 'B_POSITIVE', address: 'Tower 4, Apex Athena, Sector 75, Noida - 201307' },
    { firstName: 'Rohit', lastName: 'Verma', gender: 'MALE', age: 38, blood: 'O_POSITIVE', address: 'House 82, Sector 15A, Noida - 201301' },
    { firstName: 'Karan', lastName: 'Singh', gender: 'MALE', age: 45, blood: 'AB_POSITIVE', address: 'C-22, Golf City, Sector 75, Noida - 201307' },
    { firstName: 'Aditi', lastName: 'Mishra', gender: 'FEMALE', age: 27, blood: 'B_NEGATIVE', address: 'Tower B, Supertech Capetown, Sector 74, Noida - 201301' },
    { firstName: 'Neha', lastName: 'Sharma', gender: 'FEMALE', age: 31, blood: 'O_POSITIVE', address: 'D-401, Mahagun Moderne, Sector 78, Noida - 201305' },
    { firstName: 'Pooja', lastName: 'Yadav', gender: 'FEMALE', age: 25, blood: 'A_POSITIVE', address: 'Flat 506, Express Zenith, Sector 77, Noida - 201301' },
    { firstName: 'Sneha', lastName: 'Gupta', gender: 'FEMALE', age: 36, blood: 'B_POSITIVE', address: 'Villa 12, Jaypee Greens, Greater Noida - 201310' },
    { firstName: 'Riya', lastName: 'Verma', gender: 'FEMALE', age: 22, blood: 'O_POSITIVE', address: 'B-602, Gaur City 2, Greater Noida West - 201009' },
  ];

  let phoneCounter = 9810100000;

  for (let i = 0; i < explicitTop10.length; i++) {
    const p = explicitTop10[i];
    const birthYear = 2026 - p.age;
    const dob = new Date(birthYear, (i * 2) % 12, (i * 3 + 1) % 28 + 1);
    const phone = `+91 ${phoneCounter++}`;
    const email = `${p.firstName.toLowerCase()}.${p.lastName.toLowerCase()}.${i + 1}@gmail.com`;
    const uhid = `UHID-2026-${(100100 + i).toString()}`;
    patients.push({ ...p, dob, phone, email, uhid });
  }

  // Generate 95 more patients (total 105)
  for (let i = 10; i < 105; i++) {
    const isMale = i % 2 === 0;
    const firstNames = isMale ? INDIAN_FIRST_NAMES_MALE : INDIAN_FIRST_NAMES_FEMALE;
    const firstName = firstNames[i % firstNames.length];
    const lastName = INDIAN_LAST_NAMES[(i * 3) % INDIAN_LAST_NAMES.length];
    const gender = isMale ? 'MALE' : 'FEMALE';
    const age = 18 + ((i * 7) % 62); // ages 18 to 79
    const birthYear = 2026 - age;
    const dob = new Date(birthYear, (i * 5) % 12, (i * 7) % 28 + 1);
    const blood = BLOOD_GROUPS[i % BLOOD_GROUPS.length];
    const locality = NOIDA_NCR_LOCALITIES[i % NOIDA_NCR_LOCALITIES.length];
    const address = `Flat ${101 + (i * 9) % 800}, Tower ${(i % 9) + 1}, ${locality}`;
    const phone = `+91 ${phoneCounter++}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i + 100}@gmail.com`;
    const uhid = `UHID-2026-${(100100 + i).toString()}`;

    patients.push({ firstName, lastName, gender, age, dob, blood, address, phone, email, uhid });
  }

  return patients;
}

// -------------------------------------------------------------
// ESSENTIAL INDIAN FORMULARY MEDICINES
// -------------------------------------------------------------
const INDIAN_MEDICINES = [
  { name: 'Dolo 650 (Paracetamol 650mg)', generic: 'Paracetamol', form: 'TABLET', strength: '650mg', price: 3.5, hsn: '30049060' },
  { name: 'Telma 40 (Telmisartan 40mg)', generic: 'Telmisartan', form: 'TABLET', strength: '40mg', price: 12.0, hsn: '30049099' },
  { name: 'Pan 40 (Pantoprazole 40mg)', generic: 'Pantoprazole Sodium', form: 'TABLET', strength: '40mg', price: 11.5, hsn: '30049099' },
  { name: 'Augmentin 625 Duo', generic: 'Amoxicillin + Clavulanic Acid', form: 'TABLET', strength: '625mg', price: 22.0, hsn: '30041010' },
  { name: 'Atorva 20 (Atorvastatin 20mg)', generic: 'Atorvastatin Calcium', form: 'TABLET', strength: '20mg', price: 18.0, hsn: '30049099' },
  { name: 'Glycomet 500 (Metformin 500mg)', generic: 'Metformin Hydrochloride', form: 'TABLET', strength: '500mg', price: 4.5, hsn: '30049099' },
  { name: 'Azee 500 (Azithromycin 500mg)', generic: 'Azithromycin', form: 'TABLET', strength: '500mg', price: 24.0, hsn: '30042090' },
  { name: 'Montair LC', generic: 'Montelukast + Levocetirizine', form: 'TABLET', strength: '10mg/5mg', price: 16.5, hsn: '30049099' },
  { name: 'Rosuvas 10 (Rosuvastatin 10mg)', generic: 'Rosuvastatin', form: 'TABLET', strength: '10mg', price: 14.0, hsn: '30049099' },
  { name: 'Cifran 500 (Ciprofloxacin 500mg)', generic: 'Ciprofloxacin', form: 'TABLET', strength: '500mg', price: 9.0, hsn: '30042090' },
];

// -------------------------------------------------------------
// NABL ACCREDITED DIAGNOSTIC LAB TESTS
// -------------------------------------------------------------
const INDIAN_LAB_PANELS = [
  { name: 'Complete Blood Count (CBC with ESR)', code: 'LAB-CBC', category: 'HEMATOLOGY', price: 450, unit: 'cells/mcL', range: '4.5-11.0' },
  { name: 'Comprehensive Lipid Profile Panel', code: 'LAB-LIPID', category: 'BIOCHEMISTRY', price: 850, unit: 'mg/dL', range: '< 200' },
  { name: 'Glycated Hemoglobin (HbA1c)', code: 'LAB-HBA1C', category: 'BIOCHEMISTRY', price: 600, unit: '%', range: '< 5.7' },
  { name: 'Liver Function Test (LFT Comprehensive)', code: 'LAB-LFT', category: 'BIOCHEMISTRY', price: 900, unit: 'U/L', range: '10-40' },
  { name: 'Kidney Function Test (KFT with Electrolytes)', code: 'LAB-KFT', category: 'BIOCHEMISTRY', price: 850, unit: 'mg/dL', range: '0.7-1.3' },
  { name: 'Thyroid Profile Total (T3, T4, TSH)', code: 'LAB-THYROID', category: 'BIOCHEMISTRY', price: 750, unit: 'uIU/mL', range: '0.4-4.2' },
  { name: 'Digital Chest X-Ray (PA View)', code: 'RAD-XRAY', category: 'RADIOLOGY', price: 650, unit: 'visual', range: 'Clear' },
  { name: '12-Lead Resting Electrocardiogram (ECG)', code: 'CARD-ECG', category: 'CARDIOLOGY', price: 350, unit: 'bpm', range: '60-100' },
];

// -------------------------------------------------------------
// TOP INDIAN HEALTH INSURANCE COMPANIES
// -------------------------------------------------------------
const INDIAN_INSURERS = [
  { name: 'Star Health and Allied Insurance Co. Ltd.', code: 'STAR-HEALTH', email: 'claims@starhealth.in', phone: '+91 1800 425 2255' },
  { name: 'HDFC ERGO General Insurance', code: 'HDFC-ERGO', email: 'care@hdfcergo.com', phone: '+91 1800 266 6444' },
  { name: 'ICICI Lombard Health Care', code: 'ICICI-LOMBARD', email: 'customersupport@icicilombard.com', phone: '+91 1800 2666' },
  { name: 'Care Health Insurance (Religare)', code: 'CARE-HEALTH', email: 'customerfirst@careinsurance.com', phone: '+91 1800 102 4455' },
  { name: 'Niva Bupa Health Insurance', code: 'NIVA-BUPA', email: 'customercare@nivabupa.com', phone: '+91 1860 500 8888' },
  { name: 'The New India Assurance Co. Ltd.', code: 'NEW-INDIA', email: 'health.claims@newindia.co.in', phone: '+91 1800 209 1415' },
];

async function runRebuild() {
  console.log('🇮🇳 ================================================================');
  console.log('🇮🇳 MEDINEXA TERTIARY HOSPITAL MIGRATION & REBUILD SYSTEM');
  console.log('🇮🇳 MediNexa Multispeciality Hospital, Noida, Uttar Pradesh, India');
  console.log('🇮🇳 ================================================================\n');

  const defaultHash = getHash('Password123!');

  // =================================================================
  // PHASE 1: PURGE ALL OLD DATA
  // =================================================================
  console.log('🗑️ [PHASE 1] Purging all old demo records, western names, and mockup entities...');
  await prisma.$executeRawUnsafe(`
    DO $$ DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        IF r.tablename != '_prisma_migrations' THEN
          EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
        END IF;
      END LOOP;
    END $$;
  `);
  console.log('✅ Entire database wiped clean. 0 legacy records remaining.\n');

  // =================================================================
  // SYSTEM ROLES CONFIGURATION
  // =================================================================
  console.log('👑 Configuring system roles...');
  const rolesList = [
    { code: 'PATIENT', name: 'Patient', description: 'Patient access portal' },
    { code: 'DOCTOR', name: 'Doctor / Specialist', description: 'Clinical provider workspace' },
    { code: 'NURSE', name: 'Nurse / Caregiver', description: 'Clinical nursing and bed monitoring' },
    { code: 'RECEPTIONIST', name: 'Receptionist', description: 'Front desk intake and OPD ticketing' },
    { code: 'PHARMACIST', name: 'Pharmacist', description: 'Medication dispensing and pharmacy inventory' },
    { code: 'PHARMACY_STAFF', name: 'Pharmacy Staff', description: 'Pharmacy staff alias' },
    { code: 'LAB_STAFF', name: 'Lab Technician', description: 'Diagnostic pathology and radiology orders' },
    { code: 'BILLING_STAFF', name: 'Billing Staff', description: 'Hospital revenue, GST invoices, cashier' },
    { code: 'INSURANCE_STAFF', name: 'Insurance Staff', description: 'TPA cashless pre-authorizations and claims' },
    { code: 'INSURANCE_COORDINATOR', name: 'Insurance Coordinator', description: 'Insurance desk coordinator' },
    { code: 'HOSPITAL_ADMIN', name: 'Hospital Administrator', description: 'Executive facility administration' },
    { code: 'ADMIN', name: 'Admin Alias', description: 'Admin alias' },
    { code: 'MEDINEXA_ADMIN', name: 'System Administrator', description: 'Full system super administrator' },
    { code: 'SUPER_ADMIN', name: 'Super Admin Alias', description: 'Platform administrator alias' },
  ];

  const roleMap = {};
  for (const r of rolesList) {
    const rec = await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name, description: r.description },
      create: r,
    });
    roleMap[r.code] = rec.id;
  }
  console.log(`✅ ${rolesList.length} application roles mapped successfully.\n`);

  // =================================================================
  // PHASE 2: CREATE INDIAN HOSPITAL
  // =================================================================
  console.log('🏥 [PHASE 2] Creating MediNexa Multispeciality Hospital, Noida...');
  const org = await prisma.organization.create({
    data: {
      name: 'MediNexa Healthcare India Private Limited',
      code: 'MEDINEXA-INDIA',
      type: 'HOSPITAL',
      address: 'Plot No. A-42/01, Sector 62, Institutional Area, Noida, Uttar Pradesh - 201309',
      email: 'corporate@medinexa.in',
      phone: '+91 120 456 7890',
    },
  });

  const hospital = await prisma.facility.create({
    data: {
      organizationId: org.id,
      name: 'MediNexa Multispeciality Hospital',
      code: 'MDNX-NOIDA',
      address: 'Sector 62, Institutional Area',
      city: 'Noida',
      state: 'Uttar Pradesh',
      postalCode: '201309',
      phone: '+91 120 456 7890',
      email: 'contact.noida@medinexa.in',
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Hospital created: ${hospital.name} (Noida, Uttar Pradesh, India - Timezone: Asia/Kolkata, Currency: INR, GST: Enabled).\n`);

  // Create Hospital Departments & Specialties
  const departmentsData = [
    { name: 'Cardiology & Cardiac Sciences', code: 'CARDIO' },
    { name: 'General Medicine & Internal Health', code: 'GEN_MED' },
    { name: 'Orthopedics & Joint Replacement', code: 'ORTHO' },
    { name: 'Dermatology & Cosmetology', code: 'DERMA' },
    { name: 'Neurology & Neurosciences', code: 'NEURO' },
    { name: 'Pediatrics & Neonatal Care', code: 'PEDIA' },
    { name: 'Otorhinolaryngology (ENT)', code: 'ENT' },
    { name: 'Radiology & Diagnostic Imaging', code: 'RADIO' },
  ];

  const deptMap = {};
  const specialtyMap = {};

  for (const d of departmentsData) {
    const dept = await prisma.department.create({
      data: {
        facilityId: hospital.id,
        name: d.name,
        code: d.code,
        status: 'ACTIVE',
      },
    });
    deptMap[d.code] = dept.id;

    const spec = await prisma.specialty.create({
      data: {
        name: d.name,
        code: d.code,
        description: `Specialty in ${d.name}`,
      },
    });
    specialtyMap[d.code] = spec.id;
  }
  console.log(`✅ ${departmentsData.length} Clinical Departments & Specialties created.`);

  // Create Inpatient Wards, Rooms & Beds
  const wardsData = [
    { name: 'General Ward A (Male)', code: 'GW-A', type: WardType.GENERAL, beds: 10 },
    { name: 'General Ward B (Female)', code: 'GW-B', type: WardType.GENERAL, beds: 10 },
    { name: 'Semi-Private Wing', code: 'SPW-1', type: WardType.SEMI_PRIVATE, beds: 10 },
    { name: 'Private Deluxe Wing', code: 'PDW-1', type: WardType.PRIVATE, beds: 10 },
    { name: 'Intensive Care Unit (ICU)', code: 'ICU-1', type: WardType.ICU, beds: 10 },
    { name: 'Emergency Trauma Bay', code: 'EMR-1', type: WardType.EMERGENCY, beds: 5 },
  ];

  const allBeds = [];
  for (const w of wardsData) {
    const ward = await prisma.ward.create({
      data: {
        facilityId: hospital.id,
        departmentId: deptMap['GEN_MED'],
        name: w.name,
        code: w.code,
        wardType: w.type,
        floor: 'Floor 2',
        status: WardStatus.ACTIVE,
      },
    });

    const room = await prisma.room.create({
      data: {
        wardId: ward.id,
        roomNumber: `${w.code}-R01`,
        roomType: w.type === WardType.ICU ? RoomType.ICU : w.type === WardType.PRIVATE ? RoomType.PRIVATE : RoomType.GENERAL,
        floor: 'Floor 2',
        capacity: w.beds,
        status: RoomStatus.ACTIVE,
      },
    });

    for (let b = 1; b <= w.beds; b++) {
      const bed = await prisma.bed.create({
        data: {
          facilityId: hospital.id,
          wardId: ward.id,
          roomId: room.id,
          bedNumber: `${w.code}-BED-${b.toString().padStart(2, '0')}`,
          bedType: w.type,
          status: BedStatus.AVAILABLE,
        },
      });
      allBeds.push(bed);
    }
  }
  console.log(`✅ ${wardsData.length} Wards and ${allBeds.length} Hospital Beds created.\n`);

  // =================================================================
  // PHASE 3: CREATE INDIAN STAFF (EXACT SPECIFICATION)
  // =================================================================
  console.log('👥 [PHASE 3] Creating 26 Indian Hospital Staff Members...');

  // 1. Admins (2)
  const adminUsers = [
    { firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh.kumar@medinexa.in', phone: '+91 98110 00001' },
    { firstName: 'Amit', lastName: 'Sharma', email: 'amit.sharma@medinexa.in', phone: '+91 98110 00002' },
  ];
  let primaryAdminUser = null;
  for (const a of adminUsers) {
    const adminRec = await prisma.user.create({
      data: {
        email: a.email,
        passwordHash: defaultHash,
        firstName: a.firstName,
        lastName: a.lastName,
        phone: a.phone,
        status: UserStatus.ACTIVE,
        roleId: roleMap['HOSPITAL_ADMIN'],
        organizationId: org.id,
        facilityId: hospital.id,
      },
    });
    if (!primaryAdminUser) primaryAdminUser = adminRec;
  }

  // 2. Doctors (8)
  const doctorsData = [
    { firstName: 'Sanjay', lastName: 'Deshmukh', specialtyCode: 'CARDIO', email: 'dr.sanjay@medinexa.in', phone: '+91 98101 20001', reg: 'MCI-2004-12948', qual: 'MBBS, MD, DM (Cardiology)' },
    { firstName: 'Priya', lastName: 'Verma', specialtyCode: 'GEN_MED', email: 'dr.priya@medinexa.in', phone: '+91 98101 20002', reg: 'MCI-2008-34821', qual: 'MBBS, MD (General Medicine)' },
    { firstName: 'Ankit', lastName: 'Singh', specialtyCode: 'ORTHO', email: 'dr.ankit@medinexa.in', phone: '+91 98101 20003', reg: 'MCI-2010-48192', qual: 'MBBS, MS (Orthopedics)' },
    { firstName: 'Neha', lastName: 'Gupta', specialtyCode: 'DERMA', email: 'dr.neha@medinexa.in', phone: '+91 98101 20004', reg: 'MCI-2012-59102', qual: 'MBBS, MD (Dermatology)' },
    { firstName: 'Rohit', lastName: 'Mehra', specialtyCode: 'NEURO', email: 'dr.rohit@medinexa.in', phone: '+91 98101 20005', reg: 'MCI-2011-67123', qual: 'MBBS, DM (Neurology)' },
    { firstName: 'Pooja', lastName: 'Mishra', specialtyCode: 'PEDIA', email: 'dr.pooja@medinexa.in', phone: '+91 98101 20006', reg: 'MCI-2013-78291', qual: 'MBBS, MD (Pediatrics)' },
    { firstName: 'Vivek', lastName: 'Jain', specialtyCode: 'ENT', email: 'dr.vivek@medinexa.in', phone: '+91 98101 20007', reg: 'MCI-2009-89210', qual: 'MBBS, MS (ENT)' },
    { firstName: 'Rakesh', lastName: 'Tiwari', specialtyCode: 'RADIO', email: 'dr.rakesh@medinexa.in', phone: '+91 98101 20008', reg: 'MCI-2007-90124', qual: 'MBBS, MD (Radiology)' },
  ];

  const seededDoctors = [];
  for (const doc of doctorsData) {
    const u = await prisma.user.create({
      data: {
        email: doc.email,
        passwordHash: defaultHash,
        firstName: `Dr. ${doc.firstName}`,
        lastName: doc.lastName,
        phone: doc.phone,
        status: UserStatus.ACTIVE,
        roleId: roleMap['DOCTOR'],
        organizationId: org.id,
        facilityId: hospital.id,
      },
    });

    const dp = await prisma.doctorProfile.create({
      data: {
        userId: u.id,
        facilityId: hospital.id,
        departmentId: deptMap[doc.specialtyCode],
        specialtyId: specialtyMap[doc.specialtyCode],
        licenseNumber: doc.reg,
        status: 'ACTIVE',
      },
    });

    // Create Doctor OPD Schedule (Mon-Sat 09:00 - 17:00)
    for (let day = 1; day <= 6; day++) {
      await prisma.doctorSchedule.create({
        data: {
          doctorId: dp.id,
          facilityId: hospital.id,
          departmentId: dp.departmentId,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          slotDurationMinutes: 30,
          status: 'ACTIVE',
        },
      });
    }

    seededDoctors.push({ ...dp, user: u, spec: doc.specialtyCode });
  }

  // 3. Nurses (5)
  const nursesData = [
    { firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@medinexa.in', phone: '+91 98200 30001' },
    { firstName: 'Kavita', lastName: 'Singh', email: 'kavita.singh@medinexa.in', phone: '+91 98200 30002' },
    { firstName: 'Neetu', lastName: 'Yadav', email: 'neetu.yadav@medinexa.in', phone: '+91 98200 30003' },
    { firstName: 'Anjali', lastName: 'Verma', email: 'anjali.verma@medinexa.in', phone: '+91 98200 30004' },
    { firstName: 'Poonam', lastName: 'Gupta', email: 'poonam.gupta@medinexa.in', phone: '+91 98200 30005' },
  ];
  for (const n of nursesData) {
    await prisma.user.create({
      data: {
        email: n.email,
        passwordHash: defaultHash,
        firstName: n.firstName,
        lastName: n.lastName,
        phone: n.phone,
        status: UserStatus.ACTIVE,
        roleId: roleMap['NURSE'],
        organizationId: org.id,
        facilityId: hospital.id,
      },
    });
  }

  // 4. Receptionists (3)
  const receptionistsData = [
    { firstName: 'Ritu', lastName: 'Sharma', email: 'ritu.sharma@medinexa.in', phone: '+91 98300 40001' },
    { firstName: 'Shweta', lastName: 'Mishra', email: 'shweta.mishra@medinexa.in', phone: '+91 98300 40002' },
    { firstName: 'Sonali', lastName: 'Singh', email: 'sonali.singh@medinexa.in', phone: '+91 98300 40003' },
  ];
  for (const r of receptionistsData) {
    await prisma.user.create({
      data: {
        email: r.email,
        passwordHash: defaultHash,
        firstName: r.firstName,
        lastName: r.lastName,
        phone: r.phone,
        status: UserStatus.ACTIVE,
        roleId: roleMap['RECEPTIONIST'],
        organizationId: org.id,
        facilityId: hospital.id,
      },
    });
  }

  // 5. Pharmacists (2)
  const pharmacistsData = [
    { firstName: 'Deepak', lastName: 'Verma', email: 'deepak.verma@medinexa.in', phone: '+91 98400 50001' },
    { firstName: 'Mohit', lastName: 'Gupta', email: 'mohit.gupta@medinexa.in', phone: '+91 98400 50002' },
  ];
  const seededPharmacists = [];
  for (const p of pharmacistsData) {
    const phUser = await prisma.user.create({
      data: {
        email: p.email,
        passwordHash: defaultHash,
        firstName: p.firstName,
        lastName: p.lastName,
        phone: p.phone,
        status: UserStatus.ACTIVE,
        roleId: roleMap['PHARMACIST'],
        organizationId: org.id,
        facilityId: hospital.id,
      },
    });
    seededPharmacists.push(phUser);
  }

  // 6. Lab Technicians (2)
  const labTechsData = [
    { firstName: 'Ashish', lastName: 'Kumar', email: 'ashish.kumar@medinexa.in', phone: '+91 98500 60001' },
    { firstName: 'Nitin', lastName: 'Sharma', email: 'nitin.sharma@medinexa.in', phone: '+91 98500 60002' },
  ];
  for (const l of labTechsData) {
    await prisma.user.create({
      data: {
        email: l.email,
        passwordHash: defaultHash,
        firstName: l.firstName,
        lastName: l.lastName,
        phone: l.phone,
        status: UserStatus.ACTIVE,
        roleId: roleMap['LAB_STAFF'],
        organizationId: org.id,
        facilityId: hospital.id,
      },
    });
  }

  // 7. Billing Staff (2)
  const billingStaffData = [
    { firstName: 'Rahul', lastName: 'Singh', email: 'rahul.singh@medinexa.in', phone: '+91 98600 70001' },
    { firstName: 'Saurabh', lastName: 'Mishra', email: 'saurabh.mishra@medinexa.in', phone: '+91 98600 70002' },
  ];
  for (const b of billingStaffData) {
    await prisma.user.create({
      data: {
        email: b.email,
        passwordHash: defaultHash,
        firstName: b.firstName,
        lastName: b.lastName,
        phone: b.phone,
        status: UserStatus.ACTIVE,
        roleId: roleMap['BILLING_STAFF'],
        organizationId: org.id,
        facilityId: hospital.id,
      },
    });
  }

  // 8. Insurance Staff (2)
  const insuranceStaffData = [
    { firstName: 'Nidhi', lastName: 'Gupta', email: 'nidhi.gupta@medinexa.in', phone: '+91 98700 80001' },
    { firstName: 'Kunal', lastName: 'Verma', email: 'kunal.verma@medinexa.in', phone: '+91 98700 80002' },
  ];
  for (const i of insuranceStaffData) {
    await prisma.user.create({
      data: {
        email: i.email,
        passwordHash: defaultHash,
        firstName: i.firstName,
        lastName: i.lastName,
        phone: i.phone,
        status: UserStatus.ACTIVE,
        roleId: roleMap['INSURANCE_STAFF'],
        organizationId: org.id,
        facilityId: hospital.id,
      },
    });
  }

  const totalStaff = adminUsers.length + doctorsData.length + nursesData.length + receptionistsData.length + pharmacistsData.length + labTechsData.length + billingStaffData.length + insuranceStaffData.length;
  console.log(`✅ ${totalStaff} Indian Hospital Staff accounts created.\n`);

  // =================================================================
  // PHASE 4: CREATE 105 INDIAN PATIENTS
  // =================================================================
  console.log('🏥 [PHASE 4] Creating 105 authentic Indian Patients with unique statutory UHIDs...');
  const patientDataList = generate105IndianPatients();
  const seededPatients = [];

  for (const p of patientDataList) {
    const userRec = await prisma.user.create({
      data: {
        email: p.email,
        passwordHash: defaultHash,
        firstName: p.firstName,
        lastName: p.lastName,
        phone: p.phone,
        status: UserStatus.ACTIVE,
        roleId: roleMap['PATIENT'],
        organizationId: org.id,
        facilityId: hospital.id,
      },
    });

    const patProf = await prisma.patientProfile.create({
      data: {
        userId: userRec.id,
        gender: p.gender,
        dateOfBirth: p.dob,
        bloodGroup: p.blood,
        address: `UHID: ${p.uhid} | ${p.address}`,
        phone: p.phone,
      },
    });

    seededPatients.push({ ...patProf, user: userRec, uhid: p.uhid });
  }
  console.log(`✅ ${seededPatients.length} Indian Patients & Clinical Profiles created with UHID & +91 phones.\n`);

  // =================================================================
  // SEED MEDICATIONS, LAB TESTS, INSURANCE PROVIDERS & PHARMACY INVENTORY
  // =================================================================
  console.log('💊 Seeding Indian Formulary, Lab Tests, Pharmacy Stock & Insurance Providers...');
  const seededMeds = [];
  for (let i = 0; i < INDIAN_MEDICINES.length; i++) {
    const m = INDIAN_MEDICINES[i];
    const med = await prisma.medication.create({
      data: {
        code: `MED-${(i + 1).toString().padStart(3, '0')}`,
        brandName: m.name,
        genericName: m.generic,
        strength: m.strength,
        dosageForm: m.form,
        route: 'ORAL',
        category: 'GENERAL',
        manufacturer: 'Cipla / Sun Pharma India',
        status: 'ACTIVE',
      },
    });
    seededMeds.push({ ...med, price: m.price, hsn: m.hsn, brandName: m.name });
  }

  // Seed Pharmacy Inventory
  const seededInventories = [];
  for (const med of seededMeds) {
    const inv = await prisma.pharmacyInventory.create({
      data: {
        facilityId: hospital.id,
        medicineName: med.brandName,
        genericName: med.genericName,
        batchNumber: `BATCH-2026-${med.code}`,
        manufacturer: 'Cipla / Sun Pharma India',
        stockQuantity: 500,
        reorderLevel: 50,
        expiryDate: new Date(Date.now() + 365 * 86400000),
        purchasePrice: med.price * 0.6,
        sellingPrice: med.price,
      },
    });
    seededInventories.push(inv);
  }

  const seededLabTests = [];
  for (const lt of INDIAN_LAB_PANELS) {
    const test = await prisma.labTest.create({
      data: {
        code: lt.code,
        name: lt.name,
        category: lt.category,
        specimenType: lt.category === 'RADIOLOGY' ? 'IMAGING' : 'BLOOD',
        price: lt.price,
        status: 'ACTIVE',
      },
    });
    seededLabTests.push({ ...test, unit: lt.unit, range: lt.range });
  }

  const seededInsurers = [];
  for (const ins of INDIAN_INSURERS) {
    const prov = await prisma.insuranceProvider.create({
      data: {
        providerName: ins.name,
        name: ins.name,
        providerCode: ins.code,
        code: ins.code,
        contactEmail: ins.email,
        contactPhone: ins.phone,
        address: 'Sector 62, Noida, Uttar Pradesh',
        active: true,
      },
    });
    seededInsurers.push(prov);
  }
  console.log(`✅ Formularies, stock, tests, and insurers configured.\n`);

  // =================================================================
  // PHASE 5: CREATE REAL HOSPITAL DATA
  // =================================================================
  console.log('📊 [PHASE 5] Generating Real Hospital Data: 200 Appointments, 50 Admissions, 100 Prescriptions, 80 Lab Reports, 50 Claims, 100 Pharmacy Transactions, 50 GST Invoices...');

  // 1. 200 Appointments
  const clinicalReasons = [
    'Annual cardiology checkup & 12-lead ECG review',
    'Follow-up for chronic hypertension and blood pressure regulation',
    'Persistent migraine, cluster headache, and dizziness evaluation',
    'Bilateral knee joint pain and osteoarthritis screening',
    'Routine pediatric immunization and growth milestone checkup',
    'Evaluation of chronic allergic dermatitis and eczema',
    'Sinus congestion, allergic rhinitis, and nasal endoscopy',
    'Type 2 Diabetes Mellitus fasting blood sugar management',
    'GERD acid reflux and upper abdominal dyspepsia',
    'Follow-up post fever, cold, cough, and throat irritation',
  ];

  let apptIndex = 0;
  for (let docIdx = 0; docIdx < seededDoctors.length; docIdx++) {
    const doctor = seededDoctors[docIdx];
    for (let slot = 0; slot < 25; slot++) {
      const patient = seededPatients[apptIndex % seededPatients.length];
      const reason = clinicalReasons[apptIndex % clinicalReasons.length];

      // Distribute across 25 different days (-18 to +6)
      const dayOffset = slot - 18;
      const apptDate = new Date();
      apptDate.setDate(apptDate.getDate() + dayOffset);
      apptDate.setHours(9 + (slot % 7), (slot % 2) * 30, 0, 0);

      const isPast = dayOffset < 0;
      const status = isPast ? AppointmentStatus.COMPLETED : AppointmentStatus.CONFIRMED;
      const startHour = (9 + (slot % 7)).toString().padStart(2, '0');
      const startMin = ((slot % 2) * 30).toString().padStart(2, '0');
      const endMin = ((slot % 2) * 30 + 30).toString().padStart(2, '0');

      await prisma.appointment.create({
        data: {
          appointmentNumber: `APT-IND-${(apptIndex + 1001).toString()}`,
          patientId: patient.id,
          doctorId: doctor.id,
          facilityId: hospital.id,
          departmentId: doctor.departmentId,
          appointmentDate: apptDate,
          startTime: `${startHour}:${startMin}`,
          endTime: `${startHour}:${endMin}`,
          type: AppointmentType.CONSULTATION,
          status,
          reason,
        },
      });
      apptIndex++;
    }
  }
  console.log(`✅ ${apptIndex} Appointments generated across 8 Indian specialists (25 unique slots each).`);

  // 2. 50 Inpatient Admissions
  const admittedDiagnoses = [
    'Acute Coronary Syndrome (Unstable Angina)',
    'Severe Community-Acquired Pneumonia with Hypoxia',
    'Severe Exacerbation of Bronchial Asthma',
    'Acute Febrile Illness (Dengue with Thrombocytopenia)',
    'Subtrochanteric Femur Fracture Right Hip (Pre-Op)',
    'Acute Appendicitis with Localized Peritonitis',
    'Decompensated Congestive Heart Failure',
    'Diabetic Ketoacidosis (DKA) with Hyperglycemia',
    'Ischemic Stroke / TIA Middle Cerebral Artery',
    'Severe Acute Gastroenteritis with Grade 3 Dehydration',
  ];

  for (let i = 0; i < 50; i++) {
    const patient = seededPatients[i % seededPatients.length];
    const doctor = seededDoctors[i % seededDoctors.length];
    const bed = allBeds[i % allBeds.length];
    const diag = admittedDiagnoses[i % admittedDiagnoses.length];

    const isCurrent = i < 18; // 18 currently admitted, 32 discharged
    const admDate = new Date();
    admDate.setDate(admDate.getDate() - (20 - (i % 20)));

    const admission = await prisma.admission.create({
      data: {
        admissionNumber: `ADM-IND-${(i + 5001).toString()}`,
        patientId: patient.id,
        facilityId: hospital.id,
        departmentId: deptMap['GEN_MED'],
        admissionType: i % 4 === 0 ? AdmissionType.EMERGENCY : AdmissionType.ELECTIVE,
        status: isCurrent ? AdmissionStatus.ADMITTED : AdmissionStatus.DISCHARGED,
        admittedBy: primaryAdminUser.id,
        admittedAt: admDate,
        dischargedAt: isCurrent ? null : new Date(admDate.getTime() + 86400000 * 4),
        reason: diag,
      },
    });

    if (isCurrent) {
      await prisma.bedAssignment.create({
        data: {
          admissionId: admission.id,
          bedId: bed.id,
          patientId: patient.id,
          status: 'ACTIVE',
          assignedBy: primaryAdminUser.id,
          assignedAt: admDate,
        },
      });

      await prisma.bed.update({
        where: { id: bed.id },
        data: { status: BedStatus.OCCUPIED },
      });
    }
  }
  console.log('✅ 50 Inpatient Admissions generated (18 currently admitted, 32 discharged).');

  // 3. 100 Electronic Prescriptions
  for (let i = 0; i < 100; i++) {
    const patient = seededPatients[i % seededPatients.length];
    const doctor = seededDoctors[i % seededDoctors.length];
    const med1 = seededMeds[i % seededMeds.length];
    const med2 = seededMeds[(i + 3) % seededMeds.length];

    const encDate = new Date();
    encDate.setDate(encDate.getDate() - (i % 25 + 1));

    const encounter = await prisma.clinicalEncounter.create({
      data: {
        encounterNumber: `ENC-IND-${(i + 2001).toString()}`,
        patientId: patient.id,
        doctorId: doctor.id,
        facilityId: hospital.id,
        departmentId: doctor.departmentId,
        encounterType: 'OUTPATIENT',
        status: 'COMPLETED',
        reasonForVisit: 'Consultation & Electronic Prescription formulation',
        startedAt: encDate,
        endedAt: new Date(encDate.getTime() + 1800000),
      },
    });

    const rx = await prisma.prescription.create({
      data: {
        prescriptionNumber: `RX-IND-${(3001 + i).toString()}`,
        encounterId: encounter.id,
        patientId: patient.id,
        doctorId: doctor.id,
        facilityId: hospital.id,
        status: 'DISPENSED',
        notes: `Take medication orally after meals. Complete the entire prescribed course. Follow-up SOS.`,
      },
    });

    await prisma.prescriptionItem.create({
      data: {
        prescriptionId: rx.id,
        medicationId: med1.id,
        dosage: '1 Tablet',
        frequency: 'Twice daily after meals (1-0-1)',
        route: 'ORAL',
        duration: '5 Days',
        quantity: 10,
        instructions: 'Take orally with lukewarm water',
      },
    });

    await prisma.prescriptionItem.create({
      data: {
        prescriptionId: rx.id,
        medicationId: med2.id,
        dosage: '1 Tablet',
        frequency: 'Once daily before breakfast (1-0-0)',
        route: 'ORAL',
        duration: '14 Days',
        quantity: 14,
        instructions: 'Empty stomach in the morning',
      },
    });
  }
  console.log('✅ 100 Electronic Prescriptions generated referencing Indian doctors & medicines.');

  // 4. 80 Diagnostic Lab Reports
  for (let i = 0; i < 80; i++) {
    const patient = seededPatients[i % seededPatients.length];
    const doctor = seededDoctors[i % seededDoctors.length];
    const test = seededLabTests[i % seededLabTests.length];

    const order = await prisma.labOrder.create({
      data: {
        orderNumber: `LAB-ORD-${(5001 + i).toString()}`,
        patientId: patient.id,
        doctorId: doctor.id,
        facilityId: hospital.id,
        priority: i % 5 === 0 ? LabOrderPriority.STAT : LabOrderPriority.ROUTINE,
        status: LabOrderStatus.COMPLETED,
        clinicalNotes: `Diagnostic assessment for ${test.name}. Clinical telemetry parameters normal.`,
        orderedAt: new Date(Date.now() - (i + 1) * 86400000),
        completedAt: new Date(),
        verifiedAt: new Date(),
        verifiedBy: doctor.user.id,
      },
    });

    await prisma.labTestItem.create({
      data: {
        labOrderId: order.id,
        testName: test.name,
        category: test.category,
        status: LabOrderStatus.COMPLETED,
        resultValue: 'Normal (NABL Accredited)',
        referenceRange: test.range,
        unit: test.unit,
        flag: 'NORMAL',
        verifiedById: doctor.user.id,
        verifiedAt: new Date(),
      },
    });
  }
  console.log('✅ 80 Diagnostic Lab Reports & Pathology Results generated.');

  // 5. 50 Health Insurance Claims
  for (let i = 0; i < 50; i++) {
    const patient = seededPatients[i % seededPatients.length];
    const insurer = seededInsurers[i % seededInsurers.length];
    const requestedAmount = 45000.0 + (i * 2500);

    const policy = await prisma.patientInsurance.create({
      data: {
        patientId: patient.id,
        insuranceProviderId: insurer.id,
        policyNumber: `POL-IND-${(990000 + i).toString()}`,
        coverageAmount: 500000.0,
        validFrom: new Date('2026-01-01'),
        validTill: new Date('2026-12-31'),
        status: 'ACTIVE',
      },
    });

    await prisma.insuranceClaim.create({
      data: {
        claimNumber: `CLM-IND-${(7001 + i).toString()}`,
        patientInsuranceId: policy.id,
        patientId: patient.id,
        insuranceProviderId: insurer.id,
        providerId: insurer.id,
        facilityId: hospital.id,
        claimType: ClaimType.CASHLESS,
        amountClaimed: requestedAmount,
        amountApproved: requestedAmount * 0.95,
        amountPaid: requestedAmount * 0.95,
        totalClaimAmount: requestedAmount,
        approvedAmount: requestedAmount * 0.95,
        status: ClaimStatus.APPROVED,
        claimStatus: ClaimStatus.APPROVED,
        submittedAt: new Date(Date.now() - 86400000 * 5),
        settledAt: new Date(Date.now() - 86400000 * 1),
        approvalDate: new Date(Date.now() - 86400000 * 2),
        remarks: `Pre-authorized cashless inpatient claim under ${insurer.name}`,
      },
    });
  }
  console.log('✅ 50 Health Insurance Cashless Pre-Authorizations and Claims generated.');

  // 6. 100 Pharmacy Dispensing Transactions
  for (let i = 0; i < 100; i++) {
    const inv = seededInventories[i % seededInventories.length];
    const qty = 10 + (i % 20);

    await prisma.inventoryTransaction.create({
      data: {
        inventoryId: inv.id,
        type: 'DISPENSE',
        quantity: qty,
        performedById: seededPharmacists[i % seededPharmacists.length].id,
        remarks: `Prescription fulfillment batch decrement - Invoice #${9001 + (i % 50)}`,
      },
    });
  }
  console.log('✅ 100 Pharmacy Inventory Dispensing Transactions generated.');

  // 7. 50 Hospital GST Invoices
  for (let i = 0; i < 50; i++) {
    const patient = seededPatients[i % seededPatients.length];
    const subtotal = 12000 + (i * 1500);
    const cgst = Math.round(subtotal * 0.06);
    const sgst = Math.round(subtotal * 0.06);
    const tax = cgst + sgst;
    const total = subtotal + tax;

    const billingInv = await prisma.billingInvoice.create({
      data: {
        invoiceNumber: `INV-2026-${(9001 + i).toString()}`,
        patientId: patient.id,
        facilityId: hospital.id,
        subtotal: subtotal,
        taxAmount: tax,
        discountAmount: 0,
        totalAmount: total,
        amountPaid: total,
        balanceDue: 0,
        paymentStatus: PaymentStatus.PAID,
        invoiceStatus: InvoiceStatus.PAID,
        notes: `Hospital GST Tax Invoice (SAC 999311 Healthcare Services Exempt + HSN 3004 12% GST)`,
      },
    });

    await prisma.billingLineItem.create({
      data: {
        invoiceId: billingInv.id,
        itemType: 'OPD',
        itemName: 'Tertiary Inpatient Care & Specialist Consultation (SAC 999311 - Exempt)',
        quantity: 1,
        unitPrice: Math.round(subtotal * 0.7),
        taxPercent: 0,
        discountPercent: 0,
        totalPrice: Math.round(subtotal * 0.7),
      },
    });

    await prisma.billingLineItem.create({
      data: {
        invoiceId: billingInv.id,
        itemType: 'PHARMACY',
        itemName: 'Hospital Formularies & Surgical Consumables (HSN 3004 - 12% GST)',
        quantity: 1,
        unitPrice: Math.round(subtotal * 0.3),
        taxPercent: 12,
        discountPercent: 0,
        totalPrice: Math.round(subtotal * 0.3 * 1.12),
      },
    });

    await prisma.paymentTransaction.create({
      data: {
        invoiceId: billingInv.id,
        paymentMethod: PaymentMethod.UPI,
        transactionReference: `UPI-IND-REF-${Math.floor(100000000 + Math.random() * 900000000)}`,
        amount: total,
        status: 'SUCCESS',
        collectedById: primaryAdminUser.id,
      },
    });
  }
  console.log('✅ 50 Hospital GST Invoices generated (SAC 999311 + HSN 3004 12% GST).\n');

  console.log('================================================================');
  console.log('🎉 REBUILD COMPLETED SUCCESSFULLY!');
  console.log('Hospital: MediNexa Multispeciality Hospital (Noida, Uttar Pradesh)');
  console.log(`Staff Members: ${totalStaff}`);
  console.log(`Indian Patients: ${seededPatients.length}`);
  console.log('Appointments: 200');
  console.log('Admissions: 50');
  console.log('Prescriptions: 100');
  console.log('Lab Reports: 80');
  console.log('Insurance Claims: 50');
  console.log('Pharmacy Transactions: 100');
  console.log('Billing Invoices: 50');
  console.log('================================================================\n');
}

runRebuild()
  .catch((e) => {
    console.error('❌ MIGRATION FAILED:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
