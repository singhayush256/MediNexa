const API_BASE = 'http://localhost:3001/api/v1';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDoctorIdEncounterFlow() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA DOCTOR ID ENCOUNTER AUTO-ASSOCIATION E2E TEST');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate Doctor & Admin
    const doctorLogin = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dr.smith@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(doctorLogin.accessToken, 'Doctor authenticated successfully');

    const adminLogin = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(adminLogin.accessToken, 'Hospital Admin authenticated successfully');

    // 2. Fetch Doctor Profile & Patient
    const docProfile = await prisma.doctorProfile.findFirst({
      where: { user: { email: 'dr.smith@medinexa.local' } },
    });
    assert(docProfile, `Found Doctor Profile for Dr. Smith (${docProfile.id})`);

    const patientProfile = await prisma.patientProfile.findFirst({
      where: { user: { email: 'patient.doe@medinexa.local' } },
    });
    assert(patientProfile, `Found Patient Profile for Jane Doe (${patientProfile.id})`);

    const facility = await prisma.facility.findFirst();
    const department = await prisma.department.findFirst({ where: { facilityId: facility.id } });

    // TEST 1: Doctor creates encounter WITH explicit doctorId
    const enc1Res = await fetch(API_BASE + '/encounters', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + doctorLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId: patientProfile.id,
        doctorId: docProfile.id,
        facilityId: facility.id,
        departmentId: department.id,
        encounterType: 'OUTPATIENT',
        reasonForVisit: 'Explicit doctorId test consultation',
      }),
    });
    const enc1Data = await enc1Res.json();
    assert(enc1Res.status === 201, `Test 1: Doctor created encounter with explicit doctorId (#${enc1Data.encounterNumber})`);
    assert(enc1Data.doctorId === docProfile.id, 'Test 1: Persisted doctorId matches Dr. Smith profile ID');

    // TEST 2: Doctor creates encounter WITHOUT doctorId (Auto-association)
    const enc2Res = await fetch(API_BASE + '/encounters', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + doctorLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId: patientProfile.id,
        facilityId: facility.id,
        departmentId: department.id,
        encounterType: 'OUTPATIENT',
        reasonForVisit: 'Auto-association doctorId test consultation',
      }),
    });
    const enc2Data = await enc2Res.json();
    assert(enc2Res.status === 201, `Test 2: Doctor created encounter WITHOUT doctorId payload (#${enc2Data.encounterNumber})`);
    assert(enc2Data.doctorId === docProfile.id, 'Test 2: Backend auto-associated logged-in doctor profile ID successfully');

    // TEST 3: Admin (No doctor profile attached) attempts creation WITHOUT doctorId -> Validation Guard Rejection
    const invalidEncRes = await fetch(API_BASE + '/encounters', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + adminLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId: patientProfile.id,
        facilityId: facility.id,
        departmentId: department.id,
        encounterType: 'OUTPATIENT',
        reasonForVisit: 'Missing doctorId test by admin',
      }),
    });
    assert(invalidEncRes.status === 400, 'Test 3: Validation Guard: Non-doctor encounter creation without doctorId rejected with HTTP 400');

    // TEST 4: Appointment -> Encounter Transition Persists doctorId
    const appt = await prisma.appointment.findFirst({
      where: { doctorId: docProfile.id, status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
    });
    if (appt) {
      const startRes = await fetch(API_BASE + `/appointments/${appt.id}/start`, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + doctorLogin.accessToken },
      });
      const startData = await startRes.json();
      assert(startRes.status === 200 || startRes.status === 201, 'Test 4: Started appointment successfully');
      assert(startData.encounter && startData.encounter.doctorId === docProfile.id, 'Test 4: Appointment -> Encounter transition persisted doctorId');
    } else {
      console.log('ℹ️ [INFO] Skipped Test 4 (no CONFIRMED/CHECKED_IN appointment found)');
    }

    console.log('\n==================================================');
    console.log(`📊 DOCTOR ID ENCOUNTER E2E VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal E2E test execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDoctorIdEncounterFlow();
