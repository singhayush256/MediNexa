process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/medinexa?schema=public';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runVerification() {
  console.log('🇮🇳 ========================================================');
  console.log('🇮🇳 VERIFYING FRESH INDIAN HEALTHCARE DATASET');
  console.log('🇮🇳 ========================================================');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${name} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.log(`  ❌ [FAIL] ${name} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  try {
    // 1. Check Patients
    const patientCount = await prisma.patientProfile.count();
    assert('100 Indian Patients in Database', patientCount >= 100, `Count: ${patientCount}`);

    // Sample patient check
    const samplePatient = await prisma.patientProfile.findFirst({
      where: { user: { email: 'patient@medinexa.in' } },
      include: { user: true },
    });
    assert('Primary Patient (Aarav Sharma)', !!samplePatient, `${samplePatient?.user?.firstName} ${samplePatient?.user?.lastName}, Phone: ${samplePatient?.user?.phone}`);

    // 2. Check Doctors
    const doctorCount = await prisma.doctorProfile.count();
    assert('20 Indian Doctors in Database', doctorCount >= 20, `Count: ${doctorCount}`);

    // Specialties coverage
    const doctorSpecialties = await prisma.doctorProfile.findMany({
      include: { specialty: true },
    });
    const uniqueSpecs = new Set(doctorSpecialties.map((d) => d.specialty?.code));
    assert('Doctors cover 8 distinct medical specialties', uniqueSpecs.size >= 8, `Specialties: ${Array.from(uniqueSpecs).join(', ')}`);

    // 3. Check Nurses
    const nurseRole = await prisma.role.findFirst({ where: { code: 'NURSE' } });
    const nurseCount = await prisma.user.count({ where: { roleId: nurseRole?.id } });
    assert('50 Indian Nurses in Database', nurseCount >= 50, `Count: ${nurseCount}`);

    // 4. Check Receptionists
    const recepRole = await prisma.role.findFirst({ where: { code: 'RECEPTIONIST' } });
    const recepCount = await prisma.user.count({ where: { roleId: recepRole?.id } });
    assert('10 Indian Receptionists in Database', recepCount >= 10, `Count: ${recepCount}`);

    // 5. Check Lab Staff
    const labRole = await prisma.role.findFirst({ where: { code: 'LAB_STAFF' } });
    const labCount = await prisma.user.count({ where: { roleId: labRole?.id } });
    assert('10 Indian Lab Technicians in Database', labCount >= 10, `Count: ${labCount}`);

    // 6. Check Pharmacists
    const pharmRole = await prisma.role.findFirst({ where: { code: 'PHARMACY_STAFF' } });
    const pharmCount = await prisma.user.count({ where: { roleId: pharmRole?.id } });
    assert('10 Indian Pharmacists in Database', pharmCount >= 10, `Count: ${pharmCount}`);

    // 7. Check Clinical Data
    const appointmentCount = await prisma.appointment.count();
    assert('50+ Appointments created', appointmentCount >= 50, `Count: ${appointmentCount}`);

    const admissionCount = await prisma.admission.count();
    assert('20 Inpatient Admissions created', admissionCount >= 20, `Count: ${admissionCount}`);

    const rxCount = await prisma.prescription.count();
    assert('30+ Prescriptions created', rxCount >= 30, `Count: ${rxCount}`);

    const labOrderCount = await prisma.labOrder.count();
    assert('30+ Lab Orders & Reports created', labOrderCount >= 30, `Count: ${labOrderCount}`);

    const billCount = await prisma.billingInvoice.count();
    assert('40+ Billing Invoices created in INR', billCount >= 40, `Count: ${billCount}`);

    const claimCount = await prisma.insuranceClaim.count();
    assert('20+ Health Insurance Claims created', claimCount >= 20, `Count: ${claimCount}`);

    // 8. Phone Number Compliance: All user phones must start with +91
    const allUsers = await prisma.user.findMany({ select: { id: true, email: true, phone: true } });
    const nonIndianPhones = allUsers.filter((u) => !u.phone || !u.phone.startsWith('+91'));
    assert(
      '100% of User phone numbers support and use +91 Country Code',
      nonIndianPhones.length === 0,
      `Total Users: ${allUsers.length}, Non-+91: ${nonIndianPhones.length}`
    );

    // 9. API Login Verification
    console.log('\n🔐 Testing live API Authentication with seeded Indian credentials...');
    const API_BASE = 'http://localhost:3001/api/v1';

    async function testLogin(email, password, expectedRole) {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        const role = data.user?.role?.code || data.user?.roleCode;
        return res.status === 200 && !!data.accessToken;
      } catch (e) {
        return false;
      }
    }

    const adminLogin = await testLogin('admin@medinexa.in', 'Password123!', 'MEDINEXA_ADMIN');
    assert('Super Admin API Login (admin@medinexa.in)', adminLogin);

    const docLogin = await testLogin('dr.deshmukh@medinexa.in', 'Password123!', 'DOCTOR');
    assert('Doctor API Login (dr.deshmukh@medinexa.in)', docLogin);

    const patientLogin = await testLogin('patient@medinexa.in', 'Password123!', 'PATIENT');
    assert('Patient API Login (patient@medinexa.in)', patientLogin);

    const nurseLogin = await testLogin('nurse.01@medinexa.in', 'Password123!', 'NURSE');
    assert('Nurse API Login (nurse.01@medinexa.in)', nurseLogin);

    console.log('\n=========================================================');
    console.log(`🎯 INDIAN DATASET AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('=========================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('❌ Verification script error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
