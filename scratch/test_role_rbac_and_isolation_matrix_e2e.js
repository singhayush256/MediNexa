const API_BASE = 'http://localhost:3001/api/v1';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runRoleValidationMatrixAudit() {
  console.log('==================================================');
  console.log('🛡️ MEDINEXA ROLE RBAC & MULTI-HOSPITAL ISOLATION MATRIX');
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
    const facilities = await prisma.facility.findMany({ orderBy: { createdAt: 'asc' } });
    const facA = facilities[0];
    const facB = facilities[1] || facilities[0];

    // -------------------------------------------------------------------------
    // 1. PATIENT ROLE MATRIX
    // -------------------------------------------------------------------------
    console.log('--- 1. PATIENT ROLE MATRIX ---');
    const patLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient.doe@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(patLogin.accessToken, 'Patient authenticated');

    const patHeaders = { Authorization: `Bearer ${patLogin.accessToken}` };

    const patAppts = await fetch(`${API_BASE}/patients/me/appointments`, { headers: patHeaders }).then((r) => r.json());
    assert(Array.isArray(patAppts), 'Patient can view own appointments roster');

    const patListAll = await fetch(`${API_BASE}/patients`, { headers: patHeaders }).then((r) => r.json());
    assert(
      Array.isArray(patListAll) && patListAll.length === 1,
      'Patient GET /patients returns strictly self profile (length 1)',
    );

    // -------------------------------------------------------------------------
    // 2. DOCTOR ROLE MATRIX
    // -------------------------------------------------------------------------
    console.log('\n--- 2. DOCTOR ROLE MATRIX ---');
    const docLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dr.smith@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(docLogin.accessToken, 'Doctor authenticated');

    const docHeaders = { Authorization: `Bearer ${docLogin.accessToken}` };

    const docAppts = await fetch(`${API_BASE}/doctors/me/appointments`, { headers: docHeaders }).then((r) => r.json());
    assert(Array.isArray(docAppts), 'Doctor can access personal doctor workstation queue');

    if (facB.id !== facA.id) {
      const docCrossAdmissions = await fetch(`${API_BASE}/admissions?facilityId=${facB.id}`, { headers: docHeaders });
      assert(docCrossAdmissions.status === 403, 'Doctor blocked from Hospital B admissions (HTTP 403 Forbidden)');
    }

    // -------------------------------------------------------------------------
    // 3. NURSE ROLE MATRIX
    // -------------------------------------------------------------------------
    console.log('\n--- 3. NURSE ROLE MATRIX ---');
    const nurseLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nurse@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(nurseLogin.accessToken, 'Nurse authenticated');

    const nurseHeaders = { Authorization: `Bearer ${nurseLogin.accessToken}` };

    const nurseAdmissions = await fetch(`${API_BASE}/admissions`, { headers: nurseHeaders }).then((r) => r.json());
    assert(Array.isArray(nurseAdmissions), 'Nurse can view inpatient admissions roster for assigned hospital');

    if (facB.id !== facA.id) {
      const nurseCrossRooms = await fetch(`${API_BASE}/rooms?facilityId=${facB.id}`, { headers: nurseHeaders });
      assert(nurseCrossRooms.status === 403, 'Nurse blocked from Hospital B rooms (HTTP 403 Forbidden)');
    }

    // -------------------------------------------------------------------------
    // 4. RECEPTIONIST ROLE MATRIX
    // -------------------------------------------------------------------------
    console.log('\n--- 4. RECEPTIONIST ROLE MATRIX ---');
    const receptLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'receptionist@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(receptLogin.accessToken, 'Receptionist authenticated');

    const receptHeaders = { Authorization: `Bearer ${receptLogin.accessToken}` };

    const regRes = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: { ...receptHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'MatrixTest',
        lastName: 'Patient',
        email: `matrix.test.${Date.now()}@medinexa.local`,
        phone: `+1-888-${Math.floor(1000000 + Math.random() * 9000000)}`,
        dateOfBirth: '1992-06-20',
        gender: 'MALE',
      }),
    });
    assert(regRes.status === 201 || regRes.status === 200, 'Receptionist can register brand-new patient via standalone API');

    if (facB.id !== facA.id) {
      const receptCrossDocs = await fetch(`${API_BASE}/doctors?facilityId=${facB.id}`, { headers: receptHeaders });
      assert(receptCrossDocs.status === 403, 'Receptionist blocked from Hospital B doctor roster (HTTP 403 Forbidden)');
    }

    // -------------------------------------------------------------------------
    // 5. ADMIN ROLE MATRIX
    // -------------------------------------------------------------------------
    console.log('\n--- 5. ADMIN ROLE MATRIX ---');
    const adminLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(adminLogin.accessToken, 'System Admin authenticated');

    const adminHeaders = { Authorization: `Bearer ${adminLogin.accessToken}` };

    const adminRoomsA = await fetch(`${API_BASE}/rooms?facilityId=${facA.id}`, { headers: adminHeaders });
    assert(adminRoomsA.status === 200, 'Admin can view Hospital A rooms');

    const adminRoomsB = await fetch(`${API_BASE}/rooms?facilityId=${facB.id}`, { headers: adminHeaders });
    assert(adminRoomsB.status === 200, 'Admin can view Hospital B rooms');

    console.log('\n==================================================');
    console.log(`📊 ROLE MATRIX VALIDATION RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during role matrix audit:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runRoleValidationMatrixAudit();
