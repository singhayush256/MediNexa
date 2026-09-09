/**
 * Standardized Seed for All 16 Enterprise Healthcare Roles in MediNexa
 * Password for all 16 accounts: Password@123
 */

const { PrismaClient, UserStatus } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/medinexa?schema=public',
    },
  },
});

const DEFAULT_PASSWORD = 'Password@123';
const passwordHash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);

const ROLES_TO_ENSURE = [
  { name: 'SUPER_ADMIN', code: 'MEDINEXA_ADMIN', description: 'Platform Super Administrator with Global multi-tenant clearance' },
  { name: 'HOSPITAL_ADMIN', code: 'HOSPITAL_ADMIN', description: 'Hospital Facility Administrator' },
  { name: 'DOCTOR', code: 'DOCTOR', description: 'Consultant Physician / Specialist' },
  { name: 'NURSE', code: 'NURSE', description: 'Clinical Nurse / Nursing Officer' },
  { name: 'RECEPTIONIST', code: 'RECEPTIONIST', description: 'Front Desk & OPD Receptionist' },
  { name: 'PHARMACY_STAFF', code: 'PHARMACY_STAFF', description: 'Dispensing Pharmacist' },
  { name: 'LAB_STAFF', code: 'LAB_STAFF', description: 'Laboratory Diagnostic Technician' },
  { name: 'RADIOLOGIST', code: 'RADIOLOGIST', description: 'Consultant Radiologist & PACS Specialist' },
  { name: 'BILLING_STAFF', code: 'BILLING_STAFF', description: 'Hospital Billing & RCM Specialist' },
  { name: 'INSURANCE_COORDINATOR', code: 'INSURANCE_COORDINATOR', description: 'TPA & Cashless Claims Coordinator' },
  { name: 'AMBULANCE_DRIVER', code: 'AMBULANCE_DRIVER', description: 'Emergency Ambulance Fleet Pilot' },
  { name: 'HR_MANAGER', code: 'HR_MANAGER', description: 'Hospital Human Resources Manager' },
  { name: 'WARD_MANAGER', code: 'WARD_MANAGER', description: 'Inpatient Ward & Bed Logistics Manager' },
  { name: 'EMERGENCY_STAFF', code: 'EMERGENCY_STAFF', description: 'Emergency & Trauma Triage Officer' },
  { name: 'EXECUTIVE', code: 'EXECUTIVE', description: 'Hospital Owner / Managing Director' },
  { name: 'PATIENT', code: 'PATIENT', description: 'Registered Hospital Patient' },
];

const PERSONAS = [
  {
    email: 'admin@medinexa.com',
    roleCode: 'MEDINEXA_ADMIN',
    firstName: 'Vikramaditya',
    lastName: 'Singhania',
    phone: '+91 99990 00001',
    title: 'Super Admin',
    specialty: 'Hospital OS Platform Management',
  },
  {
    email: 'hospitaladmin@medinexa.com',
    roleCode: 'HOSPITAL_ADMIN',
    firstName: 'Dr. Alok',
    lastName: 'Mathur',
    phone: '+91 99990 00002',
    title: 'Medical Superintendent & Admin',
    specialty: 'Hospital Administration',
  },
  {
    email: 'dr.rajesh.sharma@medinexa.com',
    roleCode: 'DOCTOR',
    firstName: 'Dr. Rajesh',
    lastName: 'Sharma',
    phone: '+91 99990 00003',
    title: 'Senior Consultant Cardiologist',
    specialty: 'Cardiology',
    license: 'MCI-DEL-2005-4819',
  },
  {
    email: 'nurse.priya@medinexa.com',
    roleCode: 'NURSE',
    firstName: 'Priya',
    lastName: 'Nair',
    phone: '+91 99990 00004',
    title: 'Head Nursing Officer',
    specialty: 'Critical Care Nursing',
  },
  {
    email: 'reception@medinexa.com',
    roleCode: 'RECEPTIONIST',
    firstName: 'Sunita',
    lastName: 'Verma',
    phone: '+91 99990 00005',
    title: 'Chief OPD Receptionist',
    specialty: 'Front Desk & Patient Intake',
  },
  {
    email: 'pharmacist.rahul@medinexa.com',
    roleCode: 'PHARMACY_STAFF',
    firstName: 'Rahul',
    lastName: 'Deshmukh',
    phone: '+91 99990 00006',
    title: 'Chief Inpatient Pharmacist',
    specialty: 'Clinical Pharmacy & Formulary',
  },
  {
    email: 'lab.anil@medinexa.com',
    roleCode: 'LAB_STAFF',
    firstName: 'Anil',
    lastName: 'Saxena',
    phone: '+91 99990 00007',
    title: 'Senior Diagnostic Pathologist',
    specialty: 'Hematology & Biochemistry',
  },
  {
    email: 'radiology.sunita@medinexa.com',
    roleCode: 'RADIOLOGIST',
    firstName: 'Dr. Sunita',
    lastName: 'Kulkarni',
    phone: '+91 99990 00008',
    title: 'Consultant Radiologist',
    specialty: 'Radiodiagnosis & Imaging',
    license: 'MCI-DEL-2010-9281',
  },
  {
    email: 'billing.kavita@medinexa.com',
    roleCode: 'BILLING_STAFF',
    firstName: 'Kavita',
    lastName: 'Iyer',
    phone: '+91 99990 00009',
    title: 'Senior Billing & RCM Specialist',
    specialty: 'Revenue Cycle & Statutory GST',
  },
  {
    email: 'insurance.vikram@medinexa.com',
    roleCode: 'INSURANCE_COORDINATOR',
    firstName: 'Vikram',
    lastName: 'Malhotra',
    phone: '+91 99990 00010',
    title: 'Cashless TPA Coordinator',
    specialty: 'Health Insurance Claims',
  },
  {
    email: 'ambulance.driver@medinexa.com',
    roleCode: 'AMBULANCE_DRIVER',
    firstName: 'Ramesh',
    lastName: 'Yadav',
    phone: '+91 99990 00011',
    title: 'Emergency EMS Fleet Captain',
    specialty: 'Advanced Life Support Dispatch',
  },
  {
    email: 'hr.manager@medinexa.com',
    roleCode: 'HR_MANAGER',
    firstName: 'Deepa',
    lastName: 'Menon',
    phone: '+91 99990 00012',
    title: 'Chief HR Officer',
    specialty: 'Workforce & Medical Credentialing',
  },
  {
    email: 'ward.manager@medinexa.com',
    roleCode: 'WARD_MANAGER',
    firstName: 'Suresh',
    lastName: 'Bhatt',
    phone: '+91 99990 00013',
    title: 'Inpatient Bed & Ward Superintendent',
    specialty: 'Bed Management & Sanitation Logistics',
  },
  {
    email: 'emergency.triage@medinexa.com',
    roleCode: 'EMERGENCY_STAFF',
    firstName: 'Dr. Neha',
    lastName: 'Gupta',
    phone: '+91 99990 00014',
    title: 'ER Triage & Trauma Specialist',
    specialty: 'Emergency Medicine',
    license: 'MCI-DEL-2014-3819',
  },
  {
    email: 'executive.owner@medinexa.com',
    roleCode: 'EXECUTIVE',
    firstName: 'Dr. Devendra',
    lastName: 'Singhal',
    phone: '+91 99990 00015',
    title: 'Hospital Owner & Managing Director',
    specialty: 'Executive Governance & Healthcare Economics',
  },
  {
    email: 'patient.aarav@medinexa.com',
    roleCode: 'PATIENT',
    firstName: 'Aarav',
    lastName: 'Sharma',
    phone: '+91 98765 43210',
    title: 'Registered Patient',
    specialty: 'OPD & Inpatient Follow-up',
    gender: 'MALE',
    dob: new Date('1988-05-14'),
    blood: 'O_POSITIVE',
    city: 'New Delhi',
    address: 'Flat 402, Shanti Kunj, Vasant Vihar, New Delhi - 110057',
  },
];

async function seedAll16Roles() {
  console.log('🚀 [SEED] Initializing 16 Enterprise Hospital Personas...');

  // 1. Fetch organization & facility
  const org = await prisma.organization.findFirst();
  const facility = await prisma.facility.findFirst();

  if (!org || !facility) {
    throw new Error('Organization or Facility not found. Please run rebuild_indian_hospital_system.js first.');
  }

  console.log(`🏥 Linking personas to: ${facility.name} (${facility.id})`);

  // 2. Ensure all Roles exist
  const roleMap = {};
  for (const r of ROLES_TO_ENSURE) {
    const existing = await prisma.role.findFirst({
      where: {
        OR: [{ code: r.code }, { name: r.name }],
      },
    });

    if (existing) {
      roleMap[r.code] = existing.id;
    } else {
      const created = await prisma.role.create({
        data: {
          name: r.name,
          code: r.code,
          description: r.description,
        },
      });
      roleMap[r.code] = created.id;
    }
  }
  console.log(`✅ All ${Object.keys(roleMap).length} Roles verified in database.`);

  // Find a clinical department for doctors/radiologists
  const cardioDept = await prisma.department.findFirst({ where: { code: 'CARDIO' } });
  const radioDept = await prisma.department.findFirst({ where: { code: 'RADIO' } }) || cardioDept;
  const erDept = await prisma.department.findFirst({ where: { code: 'GEN_MED' } }) || cardioDept;

  const cardioSpec = await prisma.specialty.findFirst({ where: { code: 'CARDIO' } });
  const radioSpec = await prisma.specialty.findFirst({ where: { code: 'RADIO' } }) || cardioSpec;

  // 3. Create or update each persona
  for (const persona of PERSONAS) {
    const roleId = roleMap[persona.roleCode];
    if (!roleId) {
      console.warn(`⚠️ Warning: No roleId found for code ${persona.roleCode}`);
      continue;
    }

    const userData = {
      email: persona.email,
      passwordHash: passwordHash,
      firstName: persona.firstName,
      lastName: persona.lastName,
      phone: persona.phone,
      status: UserStatus.ACTIVE,
      roleId: roleId,
      organizationId: org.id,
      facilityId: facility.id,
    };

    let user = await prisma.user.findUnique({ where: { email: persona.email } });
    if (user) {
      user = await prisma.user.update({
        where: { email: persona.email },
        data: userData,
      });
    } else {
      user = await prisma.user.create({
        data: userData,
      });
    }

    // Role-specific Profiles
    if (persona.roleCode === 'DOCTOR') {
      const existingDoc = await prisma.doctorProfile.findFirst({ where: { userId: user.id } });
      if (!existingDoc) {
        await prisma.doctorProfile.create({
          data: {
            userId: user.id,
            facilityId: facility.id,
            departmentId: cardioDept ? cardioDept.id : null,
            specialtyId: cardioSpec ? cardioSpec.id : null,
            licenseNumber: persona.license || 'MCI-DEL-2005-4819',
            status: 'ACTIVE',
          },
        });
      }
    } else if (persona.roleCode === 'RADIOLOGIST') {
      const existingRadio = await prisma.doctorProfile.findFirst({ where: { userId: user.id } });
      if (!existingRadio) {
        await prisma.doctorProfile.create({
          data: {
            userId: user.id,
            facilityId: facility.id,
            departmentId: radioDept ? radioDept.id : null,
            specialtyId: radioSpec ? radioSpec.id : null,
            licenseNumber: persona.license || 'MCI-DEL-2010-9281',
            status: 'ACTIVE',
          },
        });
      }
    } else if (persona.roleCode === 'EMERGENCY_STAFF') {
      const existingEr = await prisma.doctorProfile.findFirst({ where: { userId: user.id } });
      if (!existingEr) {
        await prisma.doctorProfile.create({
          data: {
            userId: user.id,
            facilityId: facility.id,
            departmentId: erDept ? erDept.id : null,
            specialtyId: cardioSpec ? cardioSpec.id : null,
            licenseNumber: persona.license || 'MCI-DEL-2014-3819',
            status: 'ACTIVE',
          },
        });
      }
    } else if (persona.roleCode === 'PATIENT') {
      const existingPatient = await prisma.patientProfile.findFirst({ where: { userId: user.id } });
      if (!existingPatient) {
        await prisma.patientProfile.create({
          data: {
            userId: user.id,
            gender: persona.gender || 'MALE',
            dateOfBirth: persona.dob || new Date('1988-05-14'),
            bloodGroup: persona.blood || 'O_POSITIVE',
            address: `UHID: UHID-2026-999001 | ${persona.address || 'Flat 402, Shanti Kunj, Vasant Vihar, New Delhi - 110057'}`,
            phone: persona.phone || '+91 98765 43210',
          },
        });
      }
    } else if (persona.roleCode === 'AMBULANCE_DRIVER') {
      const existingDriver = await prisma.ambulanceDriverProfile.findFirst({ where: { userId: user.id } });
      if (!existingDriver) {
        await prisma.ambulanceDriverProfile.create({
          data: {
            userId: user.id,
            facilityId: facility.id,
            licenseNumber: 'DL-UP-14-2012-009841',
            licenseExpiry: new Date('2030-12-31'),
            status: 'AVAILABLE',
          },
        });
      }
    }

    console.log(`👤 Seeded Persona: [${persona.roleCode.padEnd(20)}] ${persona.email} (${persona.firstName} ${persona.lastName})`);
  }

  console.log('\n================================================================');
  console.log('🎉 ALL 16 ENTERPRISE HEALTHCARE PERSONAS CONFIGURED SUCCESSFULLY!');
  console.log('Standard Password for All 16 Accounts: Password@123');
  console.log('================================================================\n');

  await prisma.$disconnect();
}

seedAll16Roles().catch((err) => {
  console.error('Error seeding 16 roles:', err);
  process.exit(1);
});
