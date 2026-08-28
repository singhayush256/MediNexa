const API_BASE = 'http://localhost:3001/api/v1';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runRbacAndHospitalIsolationAudit() {
  console.log('==================================================');
  console.log('🔒 MEDINEXA CRITICAL RBAC & MULTI-HOSPITAL ISOLATION AUDIT');
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
    // Fetch Facilities
    const facilities = await prisma.facility.findMany({ orderBy: { createdAt: 'asc' } });
    const facA = facilities[0];
    const facB = facilities[1] || facilities[0];

    assert(facA && facB, `Loaded multi-hospital test targets: Facility A (${facA.name}), Facility B (${facB.name})`);

    // -------------------------------------------------------------------------
    // 1. SYSTEM ADMIN (MEDINEXA_ADMIN): Full Platform Access
    // -------------------------------------------------------------------------
    console.log('\n--- 1. SYSTEM ADMIN (MEDINEXA_ADMIN) ---');
    const sysAdminLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(sysAdminLogin.accessToken, 'System Admin authenticated');

    const sysAdminHeaders = { Authorization: `Bearer ${sysAdminLogin.accessToken}` };

    const sysAdminAdmissionsA = await fetch(`${API_BASE}/admissions?facilityId=${facA.id}`, { headers: sysAdminHeaders });
    assert(sysAdminAdmissionsA.status === 200, 'System Admin can query Hospital A admissions');

    const sysAdminAdmissionsB = await fetch(`${API_BASE}/admissions?facilityId=${facB.id}`, { headers: sysAdminHeaders });
    assert(sysAdminAdmissionsB.status === 200, 'System Admin can query Hospital B admissions');

    // -------------------------------------------------------------------------
    // 2. HOSPITAL ADMIN A (HOSPITAL_ADMIN): Hospital A Assigned Only
    // -------------------------------------------------------------------------
    console.log('\n--- 2. HOSPITAL ADMIN A (HOSPITAL_ADMIN - Hospital A) ---');
    const adminALogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(adminALogin.accessToken, 'Hospital Admin A authenticated');

    const adminAHeaders = { Authorization: `Bearer ${adminALogin.accessToken}` };

    const adminAOwnAdmissions = await fetch(`${API_BASE}/admissions?facilityId=${facA.id}`, { headers: adminAHeaders });
    assert(adminAOwnAdmissions.status === 200, 'Hospital Admin A can query own facility admissions (HTTP 200)');

    if (facB.id !== facA.id) {
      const adminACrossAdmissions = await fetch(`${API_BASE}/admissions?facilityId=${facB.id}`, { headers: adminAHeaders });
      assert(adminACrossAdmissions.status === 403, 'Hospital Admin A blocked from Hospital B admissions (HTTP 403 Forbidden)');

      const adminACrossAppts = await fetch(`${API_BASE}/appointments?facilityId=${facB.id}`, { headers: adminAHeaders });
      assert(adminACrossAppts.status === 403, 'Hospital Admin A blocked from Hospital B appointments (HTTP 403 Forbidden)');

      const adminACrossEncounters = await fetch(`${API_BASE}/encounters?facilityId=${facB.id}`, { headers: adminAHeaders });
      assert(adminACrossEncounters.status === 403, 'Hospital Admin A blocked from Hospital B clinical encounters (HTTP 403 Forbidden)');

      const adminACrossWards = await fetch(`${API_BASE}/wards?facilityId=${facB.id}`, { headers: adminAHeaders });
      assert(adminACrossWards.status === 403, 'Hospital Admin A blocked from Hospital B wards (HTTP 403 Forbidden)');

      const adminACrossBeds = await fetch(`${API_BASE}/beds?facilityId=${facB.id}`, { headers: adminAHeaders });
      assert(adminACrossBeds.status === 403, 'Hospital Admin A blocked from Hospital B beds (HTTP 403 Forbidden)');
    }

    // -------------------------------------------------------------------------
    // 3. RECEPTIONIST: Front Desk Intake Scoped to Assigned Facility
    // -------------------------------------------------------------------------
    console.log('\n--- 3. RECEPTIONIST ROLE ---');
    const receptLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'receptionist@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(receptLogin.accessToken, 'Receptionist authenticated');

    const receptHeaders = { Authorization: `Bearer ${receptLogin.accessToken}` };

    const receptAppts = await fetch(`${API_BASE}/appointments`, { headers: receptHeaders });
    assert(receptAppts.status === 200, 'Receptionist can query facility appointments roster (HTTP 200)');

    if (facB.id !== facA.id) {
      const receptCrossAppts = await fetch(`${API_BASE}/appointments?facilityId=${facB.id}`, { headers: receptHeaders });
      assert(receptCrossAppts.status === 403, 'Receptionist blocked from Hospital B appointments (HTTP 403 Forbidden)');
    }

    // -------------------------------------------------------------------------
    // 4. NURSE: Nursing Workstation Scoped to Assigned Facility
    // -------------------------------------------------------------------------
    console.log('\n--- 4. NURSE ROLE ---');
    const nurseLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nurse@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(nurseLogin.accessToken, 'Nurse authenticated');

    const nurseHeaders = { Authorization: `Bearer ${nurseLogin.accessToken}` };

    const nurseAdmissions = await fetch(`${API_BASE}/admissions`, { headers: nurseHeaders });
    assert(nurseAdmissions.status === 200, 'Nurse can query inpatient admissions roster (HTTP 200)');

    if (facB.id !== facA.id) {
      const nurseCrossAdmissions = await fetch(`${API_BASE}/admissions?facilityId=${facB.id}`, { headers: nurseHeaders });
      assert(nurseCrossAdmissions.status === 403, 'Nurse blocked from Hospital B admissions (HTTP 403 Forbidden)');
    }

    // -------------------------------------------------------------------------
    // 5. DOCTOR: Doctor Workstation Scoped to Assigned Facility
    // -------------------------------------------------------------------------
    console.log('\n--- 5. DOCTOR ROLE ---');
    const docLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dr.smith@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(docLogin.accessToken, 'Doctor authenticated');

    const docHeaders = { Authorization: `Bearer ${docLogin.accessToken}` };

    const docAppts = await fetch(`${API_BASE}/doctors/me/appointments`, { headers: docHeaders });
    assert(docAppts.status === 200, 'Doctor can access personal doctor workstation queue (HTTP 200)');

    if (facB.id !== facA.id) {
      const docCrossAdmissions = await fetch(`${API_BASE}/admissions?facilityId=${facB.id}`, { headers: docHeaders });
      assert(docCrossAdmissions.status === 403, 'Doctor blocked from Hospital B admissions (HTTP 403 Forbidden)');
    }

    // -------------------------------------------------------------------------
    // 6. PATIENT: Self-Portal Scoped Profile
    // -------------------------------------------------------------------------
    console.log('\n--- 6. PATIENT ROLE ---');
    const patientLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient.doe@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(patientLogin.accessToken, 'Patient authenticated');

    const patHeaders = { Authorization: `Bearer ${patientLogin.accessToken}` };

    const patProfile = await fetch(`${API_BASE}/patients/me`, { headers: patHeaders });
    assert(patProfile.status === 200, 'Patient can view own demographic profile (HTTP 200)');

    const patAppts = await fetch(`${API_BASE}/patients/me/appointments`, { headers: patHeaders });
    assert(patAppts.status === 200, 'Patient can view own appointments (HTTP 200)');

    // Least Privilege Guard: Patient cannot list all platform patients
    const patListAll = await fetch(`${API_BASE}/patients`, { headers: patHeaders });
    const patListData = await patListAll.json();
    assert(
      patListAll.status === 200 && Array.isArray(patListData) && patListData.length === 1,
      'Least Privilege Guard: Patient GET /patients returns ONLY self profile (length 1)',
    );

    console.log('\n==================================================');
    console.log(`📊 CRITICAL RBAC & ISOLATION AUDIT RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal execution error during RBAC audit test:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runRbacAndHospitalIsolationAudit();
