const API_BASE = 'http://localhost:3001/api/v1';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyPatientRegistrationAndMasterDataE2E() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA PATIENT REGISTRATION & MASTER DATA E2E');
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
    // 1. Authenticate Hospital Admin
    const adminLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(adminLogin.accessToken, 'Hospital Admin authenticated successfully');

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminLogin.accessToken}`,
    };

    // 2. Standalone Patient Registration: Register brand new patient Alex Rivera
    const uniqueEmail = `alex.rivera.${Date.now()}@example.com`;
    const regPayload = {
      firstName: 'Alex',
      lastName: 'Rivera',
      email: uniqueEmail,
      phone: `+1-800-555-${Math.floor(1000 + Math.random() * 9000)}`,
      dateOfBirth: '1992-06-14',
      gender: 'MALE',
      bloodGroup: 'B_POSITIVE',
      address: '456 Innovation Way, San Francisco, CA',
    };

    const regRes = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers,
      body: JSON.stringify(regPayload),
    });

    const newPatient = await regRes.json();
    assert(regRes.status === 201 || regRes.status === 200, 'Test 1: Standalone Patient Registration API returned HTTP 201/200');
    assert(newPatient.id && newPatient.user?.firstName === 'Alex', 'Test 1: Patient Profile & User created for Alex Rivera');

    // 3. Duplicate Patient Detection Guard
    const dupRes = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers,
      body: JSON.stringify(regPayload),
    });
    assert(dupRes.status === 409 || dupRes.status === 400, 'Test 2: Duplicate Patient Registration rejected with HTTP 409/400');

    // 4. Patient Directory Search
    const listRes = await fetch(`${API_BASE}/patients`, { headers });
    const allPatients = await listRes.json();
    const found = Array.isArray(allPatients) && allPatients.some((p) => p.id === newPatient.id);
    assert(found, 'Test 3: Newly registered patient immediately visible in Patient Directory');

    // 5. Master Data Integration: Doctor & Facility lookup
    const doc = await prisma.doctorProfile.findFirst({ include: { facility: true, department: true } });
    assert(doc, `Master Data Lookup: Target doctor Dr. ${doc.id}`);

    // 6. Master Data: Book Appointment for Alex Rivera
    const apptRes = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        patientId: newPatient.id,
        doctorId: doc.id,
        facilityId: doc.facilityId,
        departmentId: doc.departmentId,
        appointmentDate: '2026-08-31',
        startTime: '11:00',
        endTime: '11:30',
        type: 'CONSULTATION',
        reason: 'Initial cardiology intake for new patient',
      }),
    });
    const apptData = await apptRes.json();
    assert(apptRes.status === 201, 'Test 4: Appointment successfully booked for newly registered patient');

    // 7. Master Data: Admission Engine
    const admRes = await fetch(`${API_BASE}/admissions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        patientId: newPatient.id,
        facilityId: doc.facilityId,
        departmentId: doc.departmentId,
        admissionType: 'EMERGENCY',
        reason: 'Acute chest pain observation',
      }),
    });
    const admData = await admRes.json();
    assert(admRes.status === 201, 'Test 5: Admission successfully created for newly registered patient');

    // 8. Master Data: Clinical Encounter
    const encRes = await fetch(`${API_BASE}/encounters`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        patientId: newPatient.id,
        doctorId: doc.id,
        facilityId: doc.facilityId,
        departmentId: doc.departmentId,
        encounterType: 'EMERGENCY',
        reason: 'Emergency room intake',
      }),
    });
    const encData = await encRes.json();
    assert(encRes.status === 201, 'Test 6: Clinical Encounter created for newly registered patient');

    // 9. Master Data: Lab Order
    const labTest = await prisma.labTest.findFirst();
    const labRes = await fetch(`${API_BASE}/lab-orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        patientId: newPatient.id,
        doctorId: doc.id,
        facilityId: doc.facilityId,
        encounterId: encData.id,
        priority: 'URGENT',
        clinicalReason: 'Initial cardiac markers panel',
        items: [{ labTestId: labTest.id, priority: 'URGENT' }],
      }),
    });
    const labData = await labRes.json();
    assert(labRes.status === 201, 'Test 7: Lab Order created for newly registered patient');

    // 10. Master Data: Referral Request
    const facB = (await prisma.facility.findMany())[1];
    if (facB && facB.id !== doc.facilityId) {
      const refRes = await fetch(`${API_BASE}/referrals`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          patientId: newPatient.id,
          sourceFacilityId: doc.facilityId,
          destinationFacilityId: facB.id,
          urgency: 'URGENT',
          reason: 'Inter-facility transfer for specialized cardiac ICU bed',
        }),
      });
      const refData = await refRes.json();
      assert(refRes.status === 201, 'Test 8: Inter-Hospital Referral created for newly registered patient');
    }

    console.log('\n==================================================');
    console.log(`📊 PATIENT REGISTRATION & MASTER DATA RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal execution error during patient master data E2E test:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPatientRegistrationAndMasterDataE2E();
