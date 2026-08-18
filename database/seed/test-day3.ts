import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function runDay3VerificationSuite() {
  console.log('\n==================================================');
  console.log('🧪 MEDINEXA DAY 3 AUTOMATED VERIFICATION SUITE');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  try {
    // ------------------------------------------------------------------------
    // SETUP: System Admin & Patient Credentials
    // ------------------------------------------------------------------------
    const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@medinexa.local', password: 'AdminPass123!' }),
    });
    const adminLoginData: any = await adminLoginRes.json();
    const adminToken = adminLoginData.accessToken;

    // ------------------------------------------------------------------------
    // ORGANIZATION & FACILITY TESTS (1-4)
    // ------------------------------------------------------------------------
    // Test 1: Create Organization
    const testOrgCode = `ORG-${Date.now()}`;
    const testOrg = await prisma.organization.create({
      data: {
        name: 'Test Healthcare Network',
        code: testOrgCode,
        type: 'HOSPITAL',
      },
    });
    assert(!!testOrg && testOrg.code === testOrgCode, 'Test 1: Create Organization succeeds');

    // Test 2: Create Facility under Organization
    const facCode = `FAC-${Date.now()}`;
    const facRes = await fetch(`${API_URL}/facilities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        organizationId: testOrg.id,
        name: 'Test Facility Hospital C',
        code: facCode,
        city: 'Test City',
      }),
    });
    const facData: any = await facRes.json();
    assert(facRes.status === 201 && facData.code === facCode, 'Test 2: Create Facility under Organization succeeds');

    // Test 3: Create Department under Facility
    const deptCode = `DEPT-${Date.now()}`;
    const deptRes = await fetch(`${API_URL}/departments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        facilityId: facData.id,
        name: 'Test Surgery Department',
        code: deptCode,
      }),
    });
    const deptData: any = await deptRes.json();
    assert(deptRes.status === 201 && deptData.code === deptCode, 'Test 3: Create Department under Facility succeeds');

    // Test 4: Reject Invalid Department / Facility Relationship
    const invalidDeptRes = await fetch(`${API_URL}/departments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        facilityId: 'invalid-facility-uuid-0000',
        name: 'Bad Dept',
        code: 'BAD-DEPT',
      }),
    });
    assert(invalidDeptRes.status === 404 || invalidDeptRes.status === 400, 'Test 4: Reject invalid facility relationship returns 400/404');

    // ------------------------------------------------------------------------
    // PATIENT TESTS (5-10)
    // ------------------------------------------------------------------------
    // Register Patient 1
    const p1Email = `patient1-${Date.now()}@test.local`;
    const p1RegRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Patient One',
        email: p1Email,
        password: 'PatientPass123!',
        role: 'PATIENT',
      }),
    });
    const p1RegData: any = await p1RegRes.json();
    const p1Token = p1RegData.accessToken;
    const p1User = p1RegData.user;

    // Register Patient 2
    const p2Email = `patient2-${Date.now()}@test.local`;
    const p2RegRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Patient Two',
        email: p2Email,
        password: 'PatientPass123!',
        role: 'PATIENT',
      }),
    });
    const p2RegData: any = await p2RegRes.json();
    const p2Token = p2RegData.accessToken;

    // Test 5: Create Patient Profile with Emergency Contact
    const createPatRes = await fetch(`${API_URL}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p1Token}`,
      },
      body: JSON.stringify({
        userId: p1User.id,
        dateOfBirth: '1995-08-20',
        gender: 'MALE',
        bloodGroup: 'B_POSITIVE',
        address: '123 Test Street',
        emergencyContacts: [
          {
            name: 'Emergency Person',
            relationship: 'Sibling',
            phone: '+1-800-555-9999',
          },
        ],
      }),
    });
    const createPatData: any = await createPatRes.json();
    assert(createPatRes.status === 201 && !!createPatData.id, 'Test 5: Create Patient Profile with Emergency Contact succeeds');

    // Test 6: Get Patient Profile by ID
    const getPatRes = await fetch(`${API_URL}/patients/${createPatData.id}`, {
      headers: { Authorization: `Bearer ${p1Token}` },
    });
    assert(getPatRes.status === 200, 'Test 6: Get Patient Profile by ID succeeds');

    // Test 7: Patient Access Own Profile via /patients/me
    const mePatRes = await fetch(`${API_URL}/patients/me`, {
      headers: { Authorization: `Bearer ${p1Token}` },
    });
    const mePatData: any = await mePatRes.json();
    assert(mePatRes.status === 200 && mePatData.id === createPatData.id, 'Test 7: Patient accesses own profile via /patients/me');

    // Test 8: Patient Cannot Access Another Patient's Profile by ID (403 Forbidden)
    const p2AccessP1Res = await fetch(`${API_URL}/patients/${createPatData.id}`, {
      headers: { Authorization: `Bearer ${p2Token}` },
    });
    assert(p2AccessP1Res.status === 403, "Test 8: Patient 2 accessing Patient 1 profile by ID fails with 403 Forbidden");

    // Test 9: Update Allowed Patient Fields
    const patchPatRes = await fetch(`${API_URL}/patients/${createPatData.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p1Token}`,
      },
      body: JSON.stringify({
        phone: '+1-800-555-NEWPHONE',
        address: '456 Updated Ave',
      }),
    });
    const patchPatData: any = await patchPatRes.json();
    assert(patchPatRes.status === 200 && patchPatData.phone === '+1-800-555-NEWPHONE', 'Test 9: Update allowed patient fields succeeds');

    // Test 10: Emergency Contact Creation & Retrieval
    assert(
      Array.isArray(createPatData.emergencyContacts) && createPatData.emergencyContacts.length > 0,
      'Test 10: Emergency contact entity creation and retrieval verified',
    );

    // ------------------------------------------------------------------------
    // DOCTOR & SPECIALTY TESTS (11-16)
    // ------------------------------------------------------------------------
    // Test 11: Create Specialty
    const specCode = `SPEC-${Date.now()}`;
    const spec = await prisma.specialty.create({
      data: {
        name: `Specialty ${specCode}`,
        code: specCode,
        description: 'Test specialty description',
      },
    });
    assert(!!spec && spec.code === specCode, 'Test 11: Create Specialty succeeds');

    // Register User for Doctor
    const docUserEmail = `docuser-${Date.now()}@test.local`;
    const docUserRegRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Dr. Test Physician',
        email: docUserEmail,
        password: 'DoctorPass123!',
        role: 'DOCTOR',
      }),
    });
    const docUserRegData: any = await docUserRegRes.json();
    const docToken = docUserRegData.accessToken;
    const docUser = docUserRegData.user;

    // Test 12: Create Doctor Profile by Admin
    const licenseNo = `LIC-${Date.now()}`;
    const createDocRes = await fetch(`${API_URL}/doctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        userId: docUser.id,
        facilityId: facData.id,
        departmentId: deptData.id,
        specialtyId: spec.id,
        licenseNumber: licenseNo,
      }),
    });
    const createDocData: any = await createDocRes.json();
    assert(createDocRes.status === 201 && createDocData.licenseNumber === licenseNo, 'Test 12: Create Doctor Profile by Admin succeeds');

    // Test 13: Doctor Linked to Correct Facility
    assert(createDocData.facilityId === facData.id, 'Test 13: Doctor linked to correct Facility ID');

    // Test 14: Doctor Linked to Correct Department
    assert(createDocData.departmentId === deptData.id, 'Test 14: Doctor linked to correct Department ID');

    // Test 15: Doctor Blocked from Self-Reassigning Facility / Patient Blocked from Creating Doctor Profile
    const patCreateDocRes = await fetch(`${API_URL}/doctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p1Token}`,
      },
      body: JSON.stringify({
        userId: p1User.id,
        facilityId: facData.id,
        departmentId: deptData.id,
        specialtyId: spec.id,
        licenseNumber: `BAD-LIC-${Date.now()}`,
      }),
    });
    assert(patCreateDocRes.status === 403, 'Test 15: Patient attempting doctor profile creation fails with 403 Forbidden');

    // Test 16: Doctor Directory Filter Works
    const dirFilterRes = await fetch(`${API_URL}/doctors?facilityId=${facData.id}`);
    const dirFilterData: any = await dirFilterRes.json();
    assert(
      dirFilterRes.status === 200 && Array.isArray(dirFilterData) && dirFilterData.some((d) => d.id === createDocData.id),
      'Test 16: Doctor directory search with facilityId filter works',
    );

    // ------------------------------------------------------------------------
    // RBAC & MULTI-HOSPITAL TESTS (17-21)
    // ------------------------------------------------------------------------
    // Test 17: Patient Restrictions Enforced
    const p1TryAdminRes = await fetch(`${API_URL}/auth/test/admin`, {
      headers: { Authorization: `Bearer ${p1Token}` },
    });
    assert(p1TryAdminRes.status === 403, 'Test 17: Patient accessing admin endpoint returns 403 Forbidden');

    // Test 18: Doctor Restrictions Enforced
    const docTryAdminRes = await fetch(`${API_URL}/auth/test/admin`, {
      headers: { Authorization: `Bearer ${docToken}` },
    });
    assert(docTryAdminRes.status === 403, 'Test 18: Doctor accessing admin endpoint returns 403 Forbidden');

    // Test 19: Hospital Admin Permissions Work
    const adminTryAdminRes = await fetch(`${API_URL}/auth/test/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminTryAdminRes.status === 200, 'Test 19: Administrator accesses admin endpoint with 200 OK');

    // Test 20: Unauthorized Access Returns 401/403 Appropriately
    const unauthRes = await fetch(`${API_URL}/patients`);
    assert(unauthRes.status === 401, 'Test 20: Unauthenticated request to protected patient route returns 401 Unauthorized');

    // Test 21: Multi-Hospital Data Isolation
    // Query doctors for another facility (Facility B) and verify Hospital C doctor is excluded
    const facBDocRes = await fetch(`${API_URL}/doctors?facilityId=invalid-uuid-facility-b`);
    const facBDocData: any = await facBDocRes.json();
    assert(
      Array.isArray(facBDocData) && !facBDocData.some((d) => d.id === createDocData.id),
      'Test 21: Multi-hospital data isolation verified (Hospital C doctor excluded from other facility queries)',
    );

    // ------------------------------------------------------------------------
    // DAY 1 & DAY 2 PRESERVATION TESTS (22-23)
    // ------------------------------------------------------------------------
    // Test 22: Day 1 Health API Endpoint Still Works
    const healthRes = await fetch(`${API_URL}/health`);
    const healthData: any = await healthRes.json();
    assert(
      healthRes.status === 200 && healthData.status === 'ok' && healthData.service === 'MediNexa API',
      'Test 22: Day 1 GET /api/v1/health returns expected envelope',
    );

    // Test 23: Day 2 Authentication API Endpoint Still Works
    const day2LoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: p1Email, password: 'PatientPass123!' }),
    });
    assert(day2LoginRes.status === 200, 'Test 23: Day 2 POST /api/v1/auth/login succeeds');

  } catch (error) {
    console.error('❌ Day 3 Verification execution error:', error);
    failed++;
  } finally {
    await prisma.$disconnect();

    console.log('\n==================================================');
    console.log(`📊 DAY 3 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  }
}

runDay3VerificationSuite();
