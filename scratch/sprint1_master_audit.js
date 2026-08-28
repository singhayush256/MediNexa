const API_BASE = 'http://localhost:3001/api/v1';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runSprint1MasterAudit() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA SPRINT 1 — MASTER PRODUCT & SECURITY AUDIT');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;
  const bugLog = [];

  function assert(condition, message, severity = 'HIGH', details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] [${severity}] ${message}`);
      bugLog.push({ message, severity, details });
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // 1. AUTHENTICATION & ROLE SESSIONS AUDIT
    // -------------------------------------------------------------------------
    console.log('--- SECTION 1: AUTHENTICATION & ROLE AUDIT ---');
    const doctorLogin = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dr.smith@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(doctorLogin.accessToken, 'Doctor Login (dr.smith@medinexa.local)', 'CRITICAL');

    const patientLogin = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient.doe@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(patientLogin.accessToken, 'Patient Login (patient.doe@medinexa.local)', 'CRITICAL');

    const adminLogin = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(adminLogin.accessToken, 'Admin Login (admin.hospa@medinexa.local)', 'CRITICAL');

    const recepLogin = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'receptionist@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(recepLogin.accessToken, 'Receptionist Login (receptionist@medinexa.local)', 'CRITICAL');

    const nurseLogin = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nurse@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(nurseLogin.accessToken, 'Nurse Login (nurse@medinexa.local)', 'CRITICAL');

    // -------------------------------------------------------------------------
    // 2. ROUTE & ENDPOINT HEALTH AUDIT
    // -------------------------------------------------------------------------
    console.log('\n--- SECTION 2: ENDPOINT & ROUTE HEALTH AUDIT ---');
    const endpointsToTest = [
      { url: '/auth/me', auth: doctorLogin.accessToken, expectedStatus: 200, name: 'GET /auth/me (Doctor)' },
      { url: '/auth/me', auth: patientLogin.accessToken, expectedStatus: 200, name: 'GET /auth/me (Patient)' },
      { url: '/auth/me', auth: adminLogin.accessToken, expectedStatus: 200, name: 'GET /auth/me (Admin)' },
      { url: '/facilities', auth: null, expectedStatus: 200, name: 'GET /facilities (Public)' },
      { url: '/doctors', auth: null, expectedStatus: 200, name: 'GET /doctors (Public)' },
      { url: '/medications', auth: null, expectedStatus: 200, name: 'GET /medications (Public)' },
      { url: '/lab/tests', auth: null, expectedStatus: 200, name: 'GET /lab/tests (Public)' },
      { url: '/encounters', auth: doctorLogin.accessToken, expectedStatus: 200, name: 'GET /encounters (Doctor)' },
      { url: '/admissions', auth: doctorLogin.accessToken, expectedStatus: 200, name: 'GET /admissions (Doctor)' },
      { url: '/beds', auth: adminLogin.accessToken, expectedStatus: 200, name: 'GET /beds (Admin)' },
      { url: '/patients', auth: recepLogin.accessToken, expectedStatus: 200, name: 'GET /patients (Receptionist)' },
      { url: '/patients/me/prescriptions', auth: patientLogin.accessToken, expectedStatus: 200, name: 'GET /patients/me/prescriptions (Patient)' },
      { url: '/patients/me/lab-results', auth: patientLogin.accessToken, expectedStatus: 200, name: 'GET /patients/me/lab-results (Patient)' },
      { url: '/medication-reminders', auth: patientLogin.accessToken, expectedStatus: 200, name: 'GET /medication-reminders (Patient)' },
    ];

    for (const ep of endpointsToTest) {
      const headers = ep.auth ? { Authorization: 'Bearer ' + ep.auth } : {};
      const res = await fetch(API_BASE + ep.url, { headers });
      assert(res.status === ep.expectedStatus, `${ep.name} returns HTTP ${ep.expectedStatus}`, 'HIGH');
    }

    // -------------------------------------------------------------------------
    // 3. VALIDATION GUARDS AUDIT (Empty Strings & Malformed Data)
    // -------------------------------------------------------------------------
    console.log('\n--- SECTION 3: VALIDATION GUARDS AUDIT ---');

    // Empty Vital Signs Payload
    const emptyVitalRes = await fetch(API_BASE + '/encounters/fake-id/vitals', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + doctorLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ systolicBP: '', diastolicBP: '', heartRate: '', temperature: '', oxygenSaturation: '' }),
    });
    assert(emptyVitalRes.status === 400, 'Validation Guard: Empty vital sign submission rejected with HTTP 400', 'HIGH');

    // Empty Lab Order testIds Array
    const emptyLabRes = await fetch(API_BASE + '/lab/orders', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + doctorLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ encounterId: 'fake-id', testIds: [] }),
    });
    assert(emptyLabRes.status === 400, 'Validation Guard: Empty lab order testIds array rejected with HTTP 400', 'HIGH');

    // Empty Prescription Item Quantity (0 or negative)
    const invalidRxQtyRes = await fetch(API_BASE + '/prescriptions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + doctorLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        encounterId: 'fake-id',
        items: [{ medicationId: 'med-id', dosage: '500mg', route: 'ORAL', frequency: 'Daily', duration: '5 days', quantity: 0 }],
      }),
    });
    assert(invalidRxQtyRes.status === 400, 'Validation Guard: Zero quantity prescription item rejected with HTTP 400', 'HIGH');

    // -------------------------------------------------------------------------
    // 4. LEAST-PRIVILEGE SECURITY & ISOLATION AUDIT
    // -------------------------------------------------------------------------
    console.log('\n--- SECTION 4: SECURITY & RBAC ISOLATION AUDIT ---');

    // Doctor attempting administrative bed discharge -> 403 Forbidden
    const fakeAdmId = '00000000-0000-0000-0000-000000000000';
    const docDischargeRes = await fetch(API_BASE + `/admissions/${fakeAdmId}/discharge`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + doctorLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dischargeReason: 'Unapproved doctor discharge' }),
    });
    assert(docDischargeRes.status === 403, 'RBAC Security Guard: Doctor blocked with HTTP 403 from administrative discharge', 'CRITICAL');

    // Patient attempting pharmacy dispensing -> 403 Forbidden
    const patientDispenseRes = await fetch(API_BASE + `/pharmacy/prescriptions/fake-rx/dispense`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + patientLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prescriptionItemId: 'fake-item', quantity: 1, batchNumber: 'X', expirationDate: '2027-12-31' }),
    });
    assert(patientDispenseRes.status === 403, 'RBAC Security Guard: Patient blocked with HTTP 403 from dispensing medication', 'CRITICAL');

    // -------------------------------------------------------------------------
    // 5. DATA INTEGRITY & MODEL AUDIT
    // -------------------------------------------------------------------------
    console.log('\n--- SECTION 5: DATA INTEGRITY AUDIT ---');
    const totalEncounters = await prisma.clinicalEncounter.count();
    assert(totalEncounters > 0, `Data Integrity: ${totalEncounters} clinical encounters exist with non-null doctorId`, 'HIGH');

    const admissionsWithNullBed = await prisma.admission.findMany({ where: { status: 'ADMITTED', bedAssignments: { none: { status: 'ACTIVE' } } } });
    assert(admissionsWithNullBed.length === 0, 'Data Integrity: Zero active ADMITTED patients exist without active bed assignment', 'HIGH');

    console.log('\n==================================================');
    console.log(`📊 MASTER AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal execution error during master audit:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSprint1MasterAudit();
