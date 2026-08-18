import { PrismaClient, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function runVerificationSuite() {
  console.log('\n==================================================');
  console.log('🧪 MEDINEXA DAY 2 AUTOMATED VERIFICATION SUITE');
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
    // Test 1: Day 1 Health API Endpoint Still Works
    const healthRes = await fetch(`${API_URL}/health`);
    const healthData: any = await healthRes.json();
    assert(
      healthRes.status === 200 && healthData.status === 'ok' && healthData.service === 'MediNexa API',
      'Test 1: GET /api/v1/health returns expected status and payload',
    );

    // Test 2: Block Public Self-Registration for Privileged Administrative Roles
    const privRegRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hacker Admin',
        email: `hacker-${Date.now()}@test.local`,
        password: 'Password123!',
        role: 'MEDINEXA_ADMIN',
      }),
    });
    assert(
      privRegRes.status === 400,
      'Test 2: Public registration of MEDINEXA_ADMIN is blocked (400 Bad Request)',
    );

    // Test 3: Public Self-Registration for Standard Role (PATIENT)
    const patientEmail = `patient-${Date.now()}@test.local`;
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Patient',
        email: patientEmail,
        password: 'PatientPass123!',
        role: 'PATIENT',
      }),
    });
    const regData: any = await regRes.json();
    assert(
      regRes.status === 201 && !!regData.accessToken && regData.user.role.code === 'PATIENT',
      'Test 3: User registration for PATIENT works and returns JWT token & User DTO',
    );

    const patientToken = regData.accessToken;
    const patientUserId = regData.user.id;

    // Test 4: Verify Password is Hashed with bcrypt and Plaintext is Never Stored or Returned
    const dbUser = await prisma.user.findUnique({ where: { id: patientUserId } });
    const isHashed = !!(dbUser && (dbUser.passwordHash.startsWith('$2a$') || dbUser.passwordHash.startsWith('$2b$')));
    const notPlaintext = !!(dbUser && dbUser.passwordHash !== 'PatientPass123!');
    const notInDto = !regData.user.passwordHash && !regData.user.password;

    assert(
      isHashed && notPlaintext && notInDto,
      'Test 4: Password is bcrypt-hashed in DB and never returned in API DTOs',
    );

    // Test 5: User Login with Valid Credentials
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: patientEmail,
        password: 'PatientPass123!',
      }),
    });
    const loginData: any = await loginRes.json();
    assert(
      loginRes.status === 200 && !!loginData.accessToken,
      'Test 5: User login with valid credentials succeeds and returns JWT token',
    );

    // Test 6: User Login with Invalid Credentials Fails with 401
    const badLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: patientEmail,
        password: 'WrongPassword123!',
      }),
    });
    assert(
      badLoginRes.status === 401,
      'Test 6: Login with invalid password fails with 401 Unauthorized',
    );

    // Test 7: Authenticated /me Profile Retrieval Works
    const meRes = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const meData: any = await meRes.json();
    assert(
      meRes.status === 200 && meData.email === patientEmail && meData.role.code === 'PATIENT',
      'Test 7: Authenticated GET /api/v1/auth/me returns current user profile',
    );

    // Test 8: Missing Authentication Returns 401 Unauthorized
    const noAuthRes = await fetch(`${API_URL}/auth/me`);
    assert(
      noAuthRes.status === 401,
      'Test 8: Unauthenticated request to /me returns 401 Unauthorized',
    );

    // Test 9: Correct Role Succeeds on Role-Protected Test Endpoint
    const patientEndpointRes = await fetch(`${API_URL}/auth/test/patient`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    assert(
      patientEndpointRes.status === 200,
      'Test 9: PATIENT user accesses /test/patient endpoint successfully (200 OK)',
    );

    // Test 10: Unauthorized Role Fails with 403 Forbidden
    const doctorEndpointRes = await fetch(`${API_URL}/auth/test/doctor`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    assert(
      doctorEndpointRes.status === 403,
      'Test 10: PATIENT user accessing /test/doctor returns 403 Forbidden',
    );

    // Test 11: Register a DOCTOR User and Verify Doctor Role Endpoint Access
    const doctorEmail = `doctor-${Date.now()}@test.local`;
    const docRegRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Dr. Sarah Smith',
        email: doctorEmail,
        password: 'DoctorPass123!',
        role: 'DOCTOR',
      }),
    });
    const docRegData: any = await docRegRes.json();
    const docToken = docRegData.accessToken;

    const docAccessRes = await fetch(`${API_URL}/auth/test/doctor`, {
      headers: { Authorization: `Bearer ${docToken}` },
    });
    assert(
      docAccessRes.status === 200,
      'Test 11: DOCTOR user accesses /test/doctor endpoint successfully (200 OK)',
    );

    // Test 12: Suspended / Disabled User Cannot Authenticate
    const disabledUserEmail = `disabled-${Date.now()}@test.local`;
    const disRegRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Disabled User',
        email: disabledUserEmail,
        password: 'DisabledPass123!',
        role: 'PATIENT',
      }),
    });
    const disRegData: any = await disRegRes.json();

    // Set user status to SUSPENDED in database
    await prisma.user.update({
      where: { id: disRegData.user.id },
      data: { status: UserStatus.SUSPENDED },
    });

    const disLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: disabledUserEmail,
        password: 'DisabledPass123!',
      }),
    });
    assert(
      disLoginRes.status === 401,
      'Test 12: Suspended/Disabled user login attempt fails with 401 Unauthorized',
    );

  } catch (error) {
    console.error('❌ Verification suite execution error:', error);
    failed++;
  } finally {
    await prisma.$disconnect();

    console.log('\n==================================================');
    console.log(`📊 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  }
}

runVerificationSuite();
