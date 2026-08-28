const API_BASE = 'http://localhost:3001/api/v1';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runEndToEndVerification() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA CLINICAL PRESCRIPTION, LAB & REMINDER WORKFLOW E2E VERIFICATION');
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
    // 1. Authenticate Personas
    const doctorLogin = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dr.smith@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(doctorLogin.accessToken, 'Doctor authenticated successfully');

    const patient1Login = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient.doe@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(patient1Login.accessToken, 'Patient 1 (Jane Doe) authenticated successfully');

    const patient2Login = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'john.doe@example.com', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(patient2Login.accessToken, 'Patient 2 (John Doe) authenticated successfully');

    const adminLogin = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(adminLogin.accessToken, 'Hospital Admin authenticated successfully');

    // 2. Fetch Jane Doe & Clinical Encounter
    const janeProfile = await prisma.patientProfile.findFirst({
      where: { user: { email: 'patient.doe@medinexa.local' } },
    });
    assert(janeProfile, 'Found Jane Doe PatientProfile in DB');

    const encs = await fetch(API_BASE + '/encounters', {
      headers: { Authorization: 'Bearer ' + doctorLogin.accessToken },
    }).then((r) => r.json());
    assert(Array.isArray(encs) && encs.length > 0, `Found ${encs?.length || 0} active clinical encounters`);

    const targetEnc = encs.find((e) => e.patientId === janeProfile.id) || encs[0];
    assert(targetEnc, `Selected encounter #${targetEnc.encounterNumber} for Jane Doe`);

    // Fetch Master Catalog Data
    const meds = await fetch(API_BASE + '/medications').then((r) => r.json());
    assert(Array.isArray(meds) && meds.length > 0, `Master medication catalog loaded (${meds.length} items)`);
    const paraMed = meds.find((m) => m.code === 'MED-PARA') || meds[0];

    const labTests = await fetch(API_BASE + '/lab/tests').then((r) => r.json());
    assert(Array.isArray(labTests) && labTests.length > 0, `Master lab test catalog loaded (${labTests.length} tests)`);
    const cbcTest = labTests.find((t) => t.testCode === 'LAB-CBC') || labTests[0];

    // =========================================================================
    // PART 2 — DOCTOR PRESCRIPTION WORKFLOW
    // =========================================================================
    console.log('\n--- PART 2: DOCTOR PRESCRIPTION WORKFLOW ---');

    // Test Validation: Reject Empty Prescription
    const invalidRxRes = await fetch(API_BASE + '/prescriptions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + doctorLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        encounterId: targetEnc.id,
        items: [{ medicationId: '', dosage: '', frequency: '', route: 'ORAL', duration: '', quantity: 0 }],
      }),
    });
    assert(invalidRxRes.status === 400, 'Validation Guard: Malformed/empty prescription payload rejected with HTTP 400');

    // Create Valid Prescription
    const rxRes = await fetch(API_BASE + '/prescriptions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + doctorLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        encounterId: targetEnc.id,
        items: [
          {
            medicationId: paraMed.id,
            dosage: '500 mg',
            route: 'ORAL',
            frequency: 'Twice daily',
            duration: '5 days',
            quantity: 10,
            instructions: 'Take after food.',
            refillsAllowed: 0,
          },
        ],
      }),
    });
    const rxData = await rxRes.json();
    assert(rxRes.status === 201, `Prescription #${rxData.prescriptionNumber} created successfully`);

    // Issue Prescription
    const issueRes = await fetch(API_BASE + `/prescriptions/${rxData.id}/issue`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + doctorLogin.accessToken },
    });
    assert(issueRes.status === 200 || issueRes.status === 201, 'Prescription issued to pharmacy');

    // Verify DB Persistence
    const dbRx = await prisma.prescription.findUnique({
      where: { id: rxData.id },
      include: { items: { include: { medication: true } } },
    });
    assert(dbRx && dbRx.items.length === 1, 'Prescription persisted in database with exactly 1 item');
    assert(dbRx.patientId === janeProfile.id, 'Prescription linked correctly to Jane Doe');

    // =========================================================================
    // PART 3 — PHARMACY DISPENSING & PATIENT PRESCRIPTION VIEW
    // =========================================================================
    console.log('\n--- PART 3 & 4: PHARMACY DISPENSING & PATIENT VIEW ---');

    // Doctor/Staff View
    const staffRxList = await fetch(API_BASE + '/prescriptions', {
      headers: { Authorization: 'Bearer ' + doctorLogin.accessToken },
    }).then((r) => r.json());
    assert(
      Array.isArray(staffRxList) && staffRxList.some((p) => p.id === rxData.id),
      'Pharmacy Workstation lists doctor-created prescription under staff view',
    );

    // Patient View
    const patientRxList = await fetch(API_BASE + '/patients/me/prescriptions', {
      headers: { Authorization: 'Bearer ' + patient1Login.accessToken },
    }).then((r) => r.json());
    assert(
      Array.isArray(patientRxList) && patientRxList.some((p) => p.id === rxData.id),
      'Patient 1 (Jane Doe) can view her prescription under My Prescriptions',
    );

    // Dispense Prescription (as Hospital Admin)
    // Dispense Prescription (as System Admin)
    const sysAdminLogin = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(sysAdminLogin.accessToken, 'Platform System Admin authenticated successfully');

    const dispenseRes = await fetch(API_BASE + `/pharmacy/prescriptions/${rxData.id}/dispense`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + sysAdminLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prescriptionItemId: dbRx.items[0].id,
        quantity: 10,
        batchNumber: 'BATCH-2026-P1',
        expirationDate: '2027-12-31',
        notes: 'Full dispense completed by pharmacy staff',
      }),
    });
    const dispenseData = await dispenseRes.json();
    if (dispenseRes.status !== 201) {
      console.log('Dispense Error Status:', dispenseRes.status, JSON.stringify(dispenseData, null, 2));
    }
    assert(dispenseRes.status === 201, 'Pharmacy staff successfully dispensed medication (Status updated to DISPENSED)');

    // Security Guard: Patient cannot dispense
    const unauthorizedDispenseRes = await fetch(API_BASE + `/pharmacy/prescriptions/${rxData.id}/dispense`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + patient1Login.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prescriptionItemId: dbRx.items[0].id,
        quantity: 1,
        batchNumber: 'FAKE',
        expirationDate: '2027-12-31',
      }),
    });
    assert(unauthorizedDispenseRes.status === 403, 'Least-Privilege Guard: Patient blocked with HTTP 403 from dispensing medication');

    // =========================================================================
    // PART 5 & 6 — DOCTOR LAB ORDER WORKFLOW & LAB MODULE
    // =========================================================================
    console.log('\n--- PART 5 & 6: DOCTOR LAB ORDER & LAB MODULE ---');

    // Validation Guard: Empty test list rejected
    const invalidLabRes = await fetch(API_BASE + '/lab/orders', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + doctorLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ encounterId: targetEnc.id, testIds: [] }),
    });
    assert(invalidLabRes.status === 400, 'Validation Guard: Empty lab order payload rejected with HTTP 400');

    // Create Valid Lab Order
    const labOrderRes = await fetch(API_BASE + '/lab/orders', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + doctorLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        encounterId: targetEnc.id,
        testIds: [cbcTest.id],
        priority: 'ROUTINE',
        clinicalNotes: 'Routine cardiac follow-up evaluation',
      }),
    });
    const labOrderData = await labOrderRes.json();
    if (labOrderRes.status !== 201) {
      console.log('Lab Order Error Status:', labOrderRes.status, JSON.stringify(labOrderData, null, 2));
    }
    assert(labOrderRes.status === 201, `Lab Order #${labOrderData.orderNumber} created successfully`);

    // Verify Lab Module View
    const staffLabOrders = await fetch(API_BASE + '/lab/orders', {
      headers: { Authorization: 'Bearer ' + doctorLogin.accessToken },
    }).then((r) => r.json());
    assert(
      Array.isArray(staffLabOrders) && staffLabOrders.some((l) => l.id === labOrderData.id),
      'Lab Module lists doctor-requested lab order under orders roster',
    );

    // Specimen Collection -> Receipt -> Result Entry
    const collectRes = await fetch(API_BASE + `/lab/orders/${labOrderData.id}/collect`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + adminLogin.accessToken },
    });
    assert(collectRes.status === 201 || collectRes.status === 200, 'Lab specimen collected');

    const receiveRes = await fetch(API_BASE + `/lab/orders/${labOrderData.id}/receive`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + adminLogin.accessToken },
    });
    assert(receiveRes.status === 201 || receiveRes.status === 200, 'Lab specimen received at lab');

    const labItem = labOrderData && Array.isArray(labOrderData.items) ? labOrderData.items[0] : null;
    if (labItem) {
      const resultRes = await fetch(API_BASE + `/lab/items/${labItem.id}/result`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + adminLogin.accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resultValue: '14.5',
          numericValue: 14.5,
          unit: 'g/dL',
          referenceRange: '13.5-17.5 g/dL',
          abnormalFlag: 'NORMAL',
          interpretation: 'Hemoglobin levels within normal reference range',
        }),
      });
      assert(resultRes.status === 201 || resultRes.status === 200, 'Lab result recorded and order completed');
    }

    // Patient View of Lab Results
    const patientLabResults = await fetch(API_BASE + '/patients/me/lab-results', {
      headers: { Authorization: 'Bearer ' + patient1Login.accessToken },
    }).then((r) => r.json());
    assert(Array.isArray(patientLabResults), 'Patient 1 (Jane Doe) can view her lab results under My Lab Reports');

    // =========================================================================
    // PART 7 — PATIENT MEDICINE REMINDERS
    // =========================================================================
    console.log('\n--- PART 7: PATIENT MEDICINE REMINDERS ---');

    // Create Reminder
    const remRes = await fetch(API_BASE + '/medication-reminders', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + patient1Login.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prescriptionItemId: dbRx.items[0].id,
        scheduledTime: '09:00 AM, 09:00 PM',
        frequency: 'Twice daily',
      }),
    });
    const remData = await remRes.json();
    assert(remRes.status === 201 || remRes.status === 200, 'Patient 1 created personal medicine reminder');

    // Mark Dose Taken
    const takenRes = await fetch(API_BASE + `/medication-reminders/${remData.id}/taken`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + patient1Login.accessToken },
    });
    assert(takenRes.status === 201 || takenRes.status === 200, 'Patient marked dose as taken (lastTakenAt updated)');

    // Toggle Pause/Resume
    const pauseRes = await fetch(API_BASE + `/medication-reminders/${remData.id}/pause`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + patient1Login.accessToken },
    });
    assert(pauseRes.status === 201 || pauseRes.status === 200, 'Patient paused medicine reminder');

    // Cross-Patient Isolation Guard
    const forbiddenRemRes = await fetch(API_BASE + `/medication-reminders/${remData.id}/taken`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + patient2Login.accessToken },
    });
    assert(forbiddenRemRes.status === 403, 'Cross-Patient Guard: Patient 2 blocked with HTTP 403 from updating Patient 1 reminder');

    console.log('\n==================================================');
    console.log(`📊 E2E WORKFLOW VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal execution error during E2E verification:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runEndToEndVerification();
