import { PrismaClient, UserStatus, WardType, WardStatus, RoomType, RoomStatus, BedType, BedStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function getHash(password: string): string {
  if (typeof bcrypt.hashSync === 'function') {
    return bcrypt.hashSync(password, 10);
  }
  if ((bcrypt as any).default && typeof (bcrypt as any).default.hashSync === 'function') {
    return (bcrypt as any).default.hashSync(password, 10);
  }
  return '$2b$10$e7Z1h9F1G1H1I1J1K1L1M.PlaceholderFallbackHash';
}

async function main() {
  console.log('🌱 Starting MediNexa Day 4 database seed...');

  // 1. Seed All 9 Required Application Roles
  const roles = [
    { code: 'PATIENT', name: 'Patient', description: 'Patient access portal' },
    { code: 'DOCTOR', name: 'Doctor / Physician', description: 'Medical provider access' },
    { code: 'NURSE', name: 'Nurse / Caregiver', description: 'Clinical nursing staff access' },
    { code: 'RECEPTIONIST', name: 'Receptionist / Registrar', description: 'Front desk and intake access' },
    { code: 'LAB_STAFF', name: 'Laboratory Staff', description: 'Pathology & lab management access' },
    { code: 'PHARMACY_STAFF', name: 'Pharmacy Staff', description: 'Pharmacy management access' },
    { code: 'AMBULANCE_DRIVER', name: 'Ambulance Driver', description: 'Emergency response and dispatch access' },
    { code: 'HOSPITAL_ADMIN', name: 'Hospital Administrator', description: 'Facility administrative management' },
    { code: 'MEDINEXA_ADMIN', name: 'MediNexa System Administrator', description: 'Full platform system administration' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: { name: role.name, description: role.description },
      create: role,
    });
  }
  console.log('✅ 9 Application Roles seeded successfully.');

  // 2. Seed Primary Organization
  const org = await prisma.organization.upsert({
    where: { code: 'MEDINEXA-HQ' },
    update: {},
    create: {
      name: 'MediNexa Central Health Network',
      code: 'MEDINEXA-HQ',
      type: 'HOSPITAL',
      address: '100 Healthcare Boulevard, Suite 500',
      email: 'admin@medinexa.local',
      phone: '+1-800-MEDINEXA',
    },
  });
  console.log('✅ Central Organization seeded:', org.name);

  // 3. Seed Multi-Hospital Facilities
  const facilityA = await prisma.facility.upsert({
    where: { code: 'MEDINEXA-GH' },
    update: {},
    create: {
      organizationId: org.id,
      name: 'MediNexa General Hospital (Hospital A)',
      code: 'MEDINEXA-GH',
      address: '200 Medical Center Drive',
      city: 'Metropolis',
      state: 'NY',
      postalCode: '10001',
      phone: '+1-800-555-HOSP-A',
      email: 'hospital-a@medinexa.local',
      status: 'ACTIVE',
    },
  });

  const facilityB = await prisma.facility.upsert({
    where: { code: 'MEDINEXA-MC' },
    update: {},
    create: {
      organizationId: org.id,
      name: 'MediNexa Metro Center (Hospital B)',
      code: 'MEDINEXA-MC',
      address: '500 Innovation Parkway',
      city: 'Gotham',
      state: 'NJ',
      postalCode: '07001',
      phone: '+1-800-555-HOSP-B',
      email: 'hospital-b@medinexa.local',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Facilities seeded: Hospital A & Hospital B.');

  // 4. Seed Departments under Facilities
  const deptCardioA = await prisma.department.upsert({
    where: { facilityId_code: { facilityId: facilityA.id, code: 'CARDIO-A' } },
    update: {},
    create: {
      facilityId: facilityA.id,
      name: 'Cardiology Department',
      code: 'CARDIO-A',
      status: 'ACTIVE',
    },
  });

  const deptNeuroA = await prisma.department.upsert({
    where: { facilityId_code: { facilityId: facilityA.id, code: 'NEURO-A' } },
    update: {},
    create: {
      facilityId: facilityA.id,
      name: 'Neurology Department',
      code: 'NEURO-A',
      status: 'ACTIVE',
    },
  });

  const deptIcuA = await prisma.department.upsert({
    where: { facilityId_code: { facilityId: facilityA.id, code: 'ICU-DEPT-A' } },
    update: {},
    create: {
      facilityId: facilityA.id,
      name: 'Intensive Care Unit Department',
      code: 'ICU-DEPT-A',
      status: 'ACTIVE',
    },
  });

  const deptGeneralB = await prisma.department.upsert({
    where: { facilityId_code: { facilityId: facilityB.id, code: 'GEN-B' } },
    update: {},
    create: {
      facilityId: facilityB.id,
      name: 'General Medicine Department',
      code: 'GEN-B',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Departments seeded across facilities.');

  // 5. Seed Specialties
  const specCardio = await prisma.specialty.upsert({
    where: { code: 'CARDIO' },
    update: {},
    create: {
      name: 'Cardiology',
      code: 'CARDIO',
      description: 'Cardiovascular medical care and surgery',
    },
  });

  await prisma.specialty.upsert({
    where: { code: 'NEURO' },
    update: {},
    create: {
      name: 'Neurology',
      code: 'NEURO',
      description: 'Neurological disorders and brain health',
    },
  });

  await prisma.specialty.upsert({
    where: { code: 'GEN_PRACTICE' },
    update: {},
    create: {
      name: 'General Practice',
      code: 'GEN_PRACTICE',
      description: 'Primary care and internal medicine',
    },
  });
  console.log('✅ Medical Specialties seeded.');

  // 6. Seed System Admin User & Hospital Admin Users
  const adminRole = await prisma.role.findUnique({ where: { code: 'MEDINEXA_ADMIN' } });
  const hospAdminRole = await prisma.role.findUnique({ where: { code: 'HOSPITAL_ADMIN' } });
  const passwordHash = getHash('AdminPass123!');

  if (adminRole) {
    await prisma.user.upsert({
      where: { email: 'admin@medinexa.local' },
      update: { passwordHash, status: UserStatus.ACTIVE, roleId: adminRole.id },
      create: {
        email: 'admin@medinexa.local',
        passwordHash,
        firstName: 'MediNexa',
        lastName: 'SystemAdmin',
        phone: '+1-800-555-0100',
        status: UserStatus.ACTIVE,
        roleId: adminRole.id,
        organizationId: org.id,
      },
    });
    console.log('✅ System Admin User seeded: admin@medinexa.local');
  }

  if (hospAdminRole) {
    await prisma.user.upsert({
      where: { email: 'admin.hospa@medinexa.local' },
      update: { passwordHash, status: UserStatus.ACTIVE, roleId: hospAdminRole.id, facilityId: facilityA.id },
      create: {
        email: 'admin.hospa@medinexa.local',
        passwordHash,
        firstName: 'HospitalA',
        lastName: 'Admin',
        phone: '+1-800-555-0101',
        status: UserStatus.ACTIVE,
        roleId: hospAdminRole.id,
        organizationId: org.id,
        facilityId: facilityA.id,
      },
    });
    console.log('✅ Hospital A Admin User seeded: admin.hospa@medinexa.local');
  }

  // 7. Seed Wards, Rooms, and Beds for Hospital A
  const wardIcuA = await prisma.ward.upsert({
    where: { facilityId_code: { facilityId: facilityA.id, code: 'WARD-ICU-A' } },
    update: {},
    create: {
      facilityId: facilityA.id,
      departmentId: deptIcuA.id,
      name: 'ICU Critical Care Ward',
      code: 'WARD-ICU-A',
      wardType: WardType.ICU,
      floor: 'Floor 3',
      status: WardStatus.ACTIVE,
    },
  });

  const wardCardioA = await prisma.ward.upsert({
    where: { facilityId_code: { facilityId: facilityA.id, code: 'WARD-CARDIO-A' } },
    update: {},
    create: {
      facilityId: facilityA.id,
      departmentId: deptCardioA.id,
      name: 'Cardiology General Ward',
      code: 'WARD-CARDIO-A',
      wardType: WardType.GENERAL,
      floor: 'Floor 2',
      status: WardStatus.ACTIVE,
    },
  });

  // Rooms under ICU Ward A
  const roomIcu1 = await prisma.room.upsert({
    where: { wardId_roomNumber: { wardId: wardIcuA.id, roomNumber: 'ICU-101' } },
    update: {},
    create: {
      wardId: wardIcuA.id,
      roomNumber: 'ICU-101',
      roomType: RoomType.ICU,
      floor: 'Floor 3',
      capacity: 2,
      status: RoomStatus.ACTIVE,
    },
  });

  const roomCardio1 = await prisma.room.upsert({
    where: { wardId_roomNumber: { wardId: wardCardioA.id, roomNumber: 'CARDIO-201' } },
    update: {},
    create: {
      wardId: wardCardioA.id,
      roomNumber: 'CARDIO-201',
      roomType: RoomType.GENERAL,
      floor: 'Floor 2',
      capacity: 3,
      status: RoomStatus.ACTIVE,
    },
  });

  // Beds under Rooms in Hospital A
  const bedsData = [
    { roomId: roomIcu1.id, wardId: wardIcuA.id, facilityId: facilityA.id, bedNumber: 'BED-ICU-01', bedType: BedType.ICU, status: BedStatus.AVAILABLE },
    { roomId: roomIcu1.id, wardId: wardIcuA.id, facilityId: facilityA.id, bedNumber: 'BED-ICU-02', bedType: BedType.ICU, status: BedStatus.OCCUPIED },
    { roomId: roomCardio1.id, wardId: wardCardioA.id, facilityId: facilityA.id, bedNumber: 'BED-CARD-01', bedType: BedType.GENERAL, status: BedStatus.AVAILABLE },
    { roomId: roomCardio1.id, wardId: wardCardioA.id, facilityId: facilityA.id, bedNumber: 'BED-CARD-02', bedType: BedType.GENERAL, status: BedStatus.MAINTENANCE },
    { roomId: roomCardio1.id, wardId: wardCardioA.id, facilityId: facilityA.id, bedNumber: 'BED-CARD-03', bedType: BedType.GENERAL, status: BedStatus.CLEANING },
  ];

  for (const b of bedsData) {
    await prisma.bed.upsert({
      where: { roomId_bedNumber: { roomId: b.roomId, bedNumber: b.bedNumber } },
      update: {},
      create: b,
    });
  }
  console.log('✅ Wards, Rooms, & Beds seeded for Hospital A.');

  // 8. Seed Wards, Rooms, and Beds for Hospital B
  const wardGenB = await prisma.ward.upsert({
    where: { facilityId_code: { facilityId: facilityB.id, code: 'WARD-GEN-B' } },
    update: {},
    create: {
      facilityId: facilityB.id,
      departmentId: deptGeneralB.id,
      name: 'General Medicine Ward B',
      code: 'WARD-GEN-B',
      wardType: WardType.GENERAL,
      floor: 'Floor 1',
      status: WardStatus.ACTIVE,
    },
  });

  const roomGenB1 = await prisma.room.upsert({
    where: { wardId_roomNumber: { wardId: wardGenB.id, roomNumber: 'RM-B101' } },
    update: {},
    create: {
      wardId: wardGenB.id,
      roomNumber: 'RM-B101',
      roomType: RoomType.GENERAL,
      floor: 'Floor 1',
      capacity: 2,
      status: RoomStatus.ACTIVE,
    },
  });

  await prisma.bed.upsert({
    where: { roomId_bedNumber: { roomId: roomGenB1.id, bedNumber: 'BED-B101-A' } },
    update: {},
    create: {
      roomId: roomGenB1.id,
      wardId: wardGenB.id,
      facilityId: facilityB.id,
      bedNumber: 'BED-B101-A',
      bedType: BedType.GENERAL,
      status: BedStatus.AVAILABLE,
    },
  });
  console.log('✅ Wards, Rooms, & Beds seeded for Hospital B.');

  // 9. Seed Demo Doctor User & Profile in Hospital A
  const doctorRole = await prisma.role.findUnique({ where: { code: 'DOCTOR' } });
  if (doctorRole) {
    const docUser = await prisma.user.upsert({
      where: { email: 'dr.smith@medinexa.local' },
      update: { passwordHash, status: UserStatus.ACTIVE },
      create: {
        email: 'dr.smith@medinexa.local',
        passwordHash,
        firstName: 'Dr. Sarah',
        lastName: 'Smith',
        phone: '+1-800-555-DOC1',
        status: UserStatus.ACTIVE,
        roleId: doctorRole.id,
        organizationId: org.id,
      },
    });

    await prisma.doctorProfile.upsert({
      where: { userId: docUser.id },
      update: {},
      create: {
        userId: docUser.id,
        facilityId: facilityA.id,
        departmentId: deptCardioA.id,
        specialtyId: specCardio.id,
        licenseNumber: 'MD-LICENSE-10001',
        status: 'ACTIVE',
      },
    });
    console.log('✅ Demo Doctor seeded: Dr. Sarah Smith');
  }

  // 10. Seed Demo Patient User & Profile
  const patientRole = await prisma.role.findUnique({ where: { code: 'PATIENT' } });
  if (patientRole) {
    const patientUser = await prisma.user.upsert({
      where: { email: 'patient.doe@medinexa.local' },
      update: { passwordHash, status: UserStatus.ACTIVE },
      create: {
        email: 'patient.doe@medinexa.local',
        passwordHash,
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '+1-800-555-PAT1',
        status: UserStatus.ACTIVE,
        roleId: patientRole.id,
        organizationId: org.id,
      },
    });

    await prisma.patientProfile.upsert({
      where: { userId: patientUser.id },
      update: {},
      create: {
        userId: patientUser.id,
        dateOfBirth: new Date('1990-05-15'),
        gender: 'FEMALE',
        bloodGroup: 'O_POSITIVE',
        phone: '+1-800-555-PAT1',
        address: '742 Evergreen Terrace, Springfield',
        status: 'ACTIVE',
      },
    });
    console.log('✅ Demo Patient seeded: Jane Doe');
  }

  // 11. Seed Lab Test Catalog
  const labTests = [
    { code: 'CBC', name: 'Complete Blood Count', category: 'HEMATOLOGY', specimenType: 'Whole Blood', turnaroundTimeMinutes: 30, price: 25.0 },
    { code: 'LFT', name: 'Liver Function Test', category: 'BIOCHEMISTRY', specimenType: 'Serum', turnaroundTimeMinutes: 45, price: 40.0 },
    { code: 'KFT', name: 'Kidney Function Test', category: 'BIOCHEMISTRY', specimenType: 'Serum', turnaroundTimeMinutes: 45, price: 40.0 },
    { code: 'GLUCOSE', name: 'Blood Glucose Test', category: 'BIOCHEMISTRY', specimenType: 'Plasma', turnaroundTimeMinutes: 15, price: 15.0 },
    { code: 'HBA1C', name: 'Glycated Hemoglobin (HbA1c)', category: 'BIOCHEMISTRY', specimenType: 'Whole Blood', turnaroundTimeMinutes: 60, price: 35.0 },
    { code: 'LIPID', name: 'Lipid Profile', category: 'BIOCHEMISTRY', specimenType: 'Serum', turnaroundTimeMinutes: 60, price: 45.0 },
    { code: 'URINE', name: 'Urine Routine Examination', category: 'MICROBIOLOGY', specimenType: 'Urine', turnaroundTimeMinutes: 30, price: 20.0 },
    { code: 'THYROID', name: 'Thyroid Function Profile', category: 'IMMUNOLOGY', specimenType: 'Serum', turnaroundTimeMinutes: 90, price: 50.0 },
    { code: 'ELECTROLYTES', name: 'Serum Electrolytes', category: 'BIOCHEMISTRY', specimenType: 'Serum', turnaroundTimeMinutes: 30, price: 30.0 },
    { code: 'CRP', name: 'C-Reactive Protein (CRP)', category: 'IMMUNOLOGY', specimenType: 'Serum', turnaroundTimeMinutes: 45, price: 25.0 },
  ];

  for (const lt of labTests) {
    await prisma.labTest.upsert({
      where: { code: lt.code },
      update: {},
      create: lt as any,
    });
  }
  console.log('✅ Master Lab Test Catalog seeded (10 tests).');

  // 12. Seed Medication Catalog
  const medications = [
    { code: 'MED-PARA', genericName: 'Paracetamol', brandName: 'Crocin / Tylenol', strength: '500mg', dosageForm: 'Tablet', route: 'Oral', category: 'ANALGESIC', prescriptionRequired: false },
    { code: 'MED-AMOX', genericName: 'Amoxicillin', brandName: 'Amoxil', strength: '500mg', dosageForm: 'Capsule', route: 'Oral', category: 'ANTIBIOTIC', prescriptionRequired: true },
    { code: 'MED-AZITH', genericName: 'Azithromycin', brandName: 'Zithromax', strength: '250mg', dosageForm: 'Tablet', route: 'Oral', category: 'ANTIBIOTIC', prescriptionRequired: true },
    { code: 'MED-METF', genericName: 'Metformin', brandName: 'Glucophage', strength: '500mg', dosageForm: 'Tablet', route: 'Oral', category: 'ANTIDIABETIC', prescriptionRequired: true },
    { code: 'MED-INSULIN', genericName: 'Regular Insulin', brandName: 'Humulin R', strength: '100IU/ml', dosageForm: 'Injection', route: 'Subcutaneous', category: 'ANTIDIABETIC', prescriptionRequired: true },
    { code: 'MED-PANTO', genericName: 'Pantoprazole', brandName: 'Protonix', strength: '40mg', dosageForm: 'Tablet', route: 'Oral', category: 'GASTROENTEROLOGY', prescriptionRequired: true },
  ];

  for (const med of medications) {
    await prisma.medication.upsert({
      where: { code: med.code },
      update: {},
      create: med,
    });
  }
  console.log('✅ Master Medication Catalog seeded (6 medications).');

  // 13. Seed Ambulances
  const amb1 = await prisma.ambulance.upsert({
    where: { vehicleNumber: 'AMB-101' },
    update: {},
    create: {
      vehicleNumber: 'AMB-101',
      registrationNumber: 'NY-AMB-9001',
      ambulanceType: 'ADVANCED_LIFE_SUPPORT' as any,
      status: 'AVAILABLE' as any,
      facilityId: facilityA.id,
      currentLatitude: 40.7128,
      currentLongitude: -74.0060,
      equipmentSummary: 'Defibrillator, Ventilator, Oxygen, ECG Monitor',
    },
  });

  await prisma.ambulance.upsert({
    where: { vehicleNumber: 'AMB-102' },
    update: {},
    create: {
      vehicleNumber: 'AMB-102',
      registrationNumber: 'NY-AMB-9002',
      ambulanceType: 'BASIC_LIFE_SUPPORT' as any,
      status: 'AVAILABLE' as any,
      facilityId: facilityA.id,
      currentLatitude: 40.7135,
      currentLongitude: -74.0050,
      equipmentSummary: 'First Aid Kit, Stretcher, Portable Oxygen',
    },
  });

  await prisma.ambulance.upsert({
    where: { vehicleNumber: 'AMB-201' },
    update: {},
    create: {
      vehicleNumber: 'AMB-201',
      registrationNumber: 'NJ-AMB-8001',
      ambulanceType: 'ADVANCED_LIFE_SUPPORT' as any,
      status: 'AVAILABLE' as any,
      facilityId: facilityB.id,
      currentLatitude: 40.7306,
      currentLongitude: -73.9352,
      equipmentSummary: 'ALS Transport Equipment Suite',
    },
  });
  console.log('✅ Demo Ambulance Fleet seeded (3 ambulances).');

  // 14. Seed Driver Profile
  const driverRole = await prisma.role.findUnique({ where: { code: 'AMBULANCE_DRIVER' } });
  if (driverRole) {
    const driverUser = await prisma.user.upsert({
      where: { email: 'driver1@medinexa.local' },
      update: { passwordHash, status: UserStatus.ACTIVE, roleId: driverRole.id, facilityId: facilityA.id },
      create: {
        email: 'driver1@medinexa.local',
        passwordHash,
        firstName: 'John',
        lastName: 'Driver',
        phone: '+1-800-555-DRV1',
        status: UserStatus.ACTIVE,
        roleId: driverRole.id,
        organizationId: org.id,
        facilityId: facilityA.id,
      },
    });

    await prisma.ambulanceDriverProfile.upsert({
      where: { userId: driverUser.id },
      update: {},
      create: {
        userId: driverUser.id,
        facilityId: facilityA.id,
        licenseNumber: 'DRV-LIC-1001',
        licenseExpiry: new Date('2030-01-01'),
        status: 'AVAILABLE' as any,
      },
    });
    console.log('✅ Demo Ambulance Driver Profile seeded: John Driver');
  }

  console.log('🎉 Day 9 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
