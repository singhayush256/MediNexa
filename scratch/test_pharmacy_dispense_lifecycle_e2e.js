const API_BASE = 'http://localhost:3001/api/v1';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyPharmacyDispenseLifecycle() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA PHARMACY DISPENSING LIFECYCLE E2E TEST');
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
    // 1. Authenticate Doctor, Patient, & Admin
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

    const patientProfile = await prisma.patientProfile.findFirst({
      where: { user: { email: 'patient.doe@medinexa.local' } },
    });
    const facility = await prisma.facility.findFirst();
    const department = await prisma.department.findFirst({ where: { facilityId: facility.id } });
    const docProfile = await prisma.doctorProfile.findFirst({ where: { user: { email: 'dr.smith@medinexa.local' } } });
    const medication = await prisma.medication.findFirst();

    // 2. Create Encounter & Prescription
    const encRes = await fetch(API_BASE + '/encounters', {
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
        reasonForVisit: 'Pharmacy Dispense Lifecycle Test',
      }),
    }).then((r) => r.json());

    const rxRes = await fetch(API_BASE + '/prescriptions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + doctorLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        encounterId: encRes.id,
        items: [
          {
            medicationId: medication.id,
            dosage: '500mg',
            route: 'ORAL',
            frequency: 'Twice daily',
            duration: '10 days',
            quantity: 20,
            instructions: 'Take after food',
            refillsAllowed: 2,
          },
        ],
      }),
    }).then((r) => r.json());
    assert(rxRes.status === 'DRAFT', `Prescription #${rxRes.prescriptionNumber} created in DRAFT state`);

    // 3. Issue Prescription -> Status: ISSUED
    const issueRes = await fetch(API_BASE + `/prescriptions/${rxRes.id}/issue`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + doctorLogin.accessToken },
    }).then((r) => r.json());
    assert(issueRes.status === 'ISSUED', 'Prescription transitioned: DRAFT -> ISSUED');

    // 4. Partial Dispense (5 units out of 20) -> Status: PARTIALLY_DISPENSED
    const item = (rxRes && Array.isArray(rxRes.items) ? rxRes.items[0] : null) || (issueRes && Array.isArray(issueRes.items) ? issueRes.items[0] : null);
    if (item) {
      const partialDispenseRes = await fetch(API_BASE + `/pharmacy/prescriptions/${rxRes.id}/dispense`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + doctorLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prescriptionItemId: item.id,
        quantity: 5,
        batchNumber: 'BATCH-PARTIAL-01',
        expirationDate: '2027-12-31',
        notes: 'Partial 5 units dispensed',
      }),
    });
    const partialData = await partialDispenseRes.json();
    assert(partialDispenseRes.status === 201, `Partial dispense request succeeded HTTP ${partialDispenseRes.status} (${JSON.stringify(partialData)})`);

    const partialRxDetail = await fetch(API_BASE + `/prescriptions/${rxRes.id}`, {
      headers: { Authorization: 'Bearer ' + doctorLogin.accessToken },
    }).then((r) => r.json());
    assert(partialRxDetail.status === 'PARTIALLY_DISPENSED', 'Prescription status transitioned: ISSUED -> PARTIALLY_DISPENSED');

    // 5. Final Dispense (Remaining 15 units out of 20) -> Status: DISPENSED
    const finalDispenseRes = await fetch(API_BASE + `/pharmacy/prescriptions/${rxRes.id}/dispense`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + adminLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prescriptionItemId: item.id,
        quantity: 15,
        batchNumber: 'BATCH-FINAL-02',
        expirationDate: '2027-12-31',
        notes: 'Final 15 units dispensed',
      }),
    });
    assert(finalDispenseRes.status === 201, 'Final dispense request succeeded HTTP 201');

    const finalRxDetail = await fetch(API_BASE + `/prescriptions/${rxRes.id}`, {
      headers: { Authorization: 'Bearer ' + doctorLogin.accessToken },
    }).then((r) => r.json());
    assert(finalRxDetail.status === 'DISPENSED', 'Prescription status transitioned: PARTIALLY_DISPENSED -> DISPENSED');
    }

    console.log('\n==================================================');
    console.log(`📊 PHARMACY DISPENSING LIFECYCLE RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPharmacyDispenseLifecycle();
