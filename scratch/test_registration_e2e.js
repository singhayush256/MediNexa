process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/medinexa?schema=public";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = 'http://localhost:3001/api/v1';

async function runRegistrationSuite() {
  console.log('================================================================');
  console.log('🧪 MEDINEXA REGISTRATION & AUTHENTICATION END-TO-END TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, desc) {
    if (condition) {
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${desc}`);
      failed++;
    }
  }

  try {
    // Clean up any previous test user
    const testEmail = `ayush.test.${Date.now()}@example.com`;
    console.log(`--- Test Email: ${testEmail} ---\n`);

    // 1. POST /api/v1/auth/register with exact expected payload
    console.log('--- 1. Testing Registration Endpoint (POST /api/v1/auth/register) ---');
    const registerPayload = {
      name: 'Ayush Singh',
      email: testEmail,
      password: 'Password123!',
      role: 'PATIENT',
    };

    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerPayload),
    });

    const regData = await regRes.json();
    assert(regRes.status === 201, `Registration returned HTTP 201 Created (Actual: ${regRes.status})`);
    assert(!!regData.accessToken, 'Access token (JWT) returned in registration response');
    assert(regData.user?.email === testEmail, `User email in response matches (${regData.user?.email})`);
    assert(regData.user?.firstName === 'Ayush', `User firstName is 'Ayush'`);
    assert(regData.user?.lastName === 'Singh', `User lastName is 'Singh'`);
    assert(regData.user?.role?.code === 'PATIENT', `User roleCode is 'PATIENT'`);

    // 2. Verify User saved in PostgreSQL database
    console.log('\n--- 2. Direct PostgreSQL Database Verification ---');
    const dbUser = await prisma.user.findUnique({
      where: { email: testEmail },
      include: { role: true },
    });
    assert(!!dbUser, 'User successfully found in PostgreSQL database');
    assert(dbUser?.firstName === 'Ayush', 'Database firstName matches Ayush');
    assert(dbUser?.lastName === 'Singh', 'Database lastName matches Singh');
    assert(dbUser?.status === 'ACTIVE', 'Database user status is ACTIVE');
    assert(dbUser?.role?.code === 'PATIENT', 'Database role is PATIENT');

    // 3. Test Login immediately after registration
    console.log('\n--- 3. Immediate Login Flow (POST /api/v1/auth/login) ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password123!',
      }),
    });

    const loginData = await loginRes.json();
    assert(loginRes.status === 200, `Login returned HTTP 200 OK (Actual: ${loginRes.status})`);
    assert(!!loginData.accessToken, 'Login returned valid JWT access token');
    assert(loginData.user?.email === testEmail, 'Login returned correct user profile');

    // 4. Test Authenticated Route (GET /api/v1/auth/me)
    console.log('\n--- 4. Authenticated Me Route (GET /api/v1/auth/me) ---');
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${loginData.accessToken}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, `GET /auth/me returned HTTP 200 OK (Actual: ${meRes.status})`);
    assert(meData.id === dbUser?.id, 'GET /auth/me user ID matches database ID');

    // 5. Test AI Assistant Chat Endpoint with registered user token
    console.log('\n--- 5. AI Assistant Chat Endpoint (POST /api/v1/ai/chat) ---');
    const aiChatRes = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginData.accessToken}`,
      },
      body: JSON.stringify({ message: 'hello' }),
    });
    const aiChatData = await aiChatRes.json();
    assert(aiChatRes.status === 201 || aiChatRes.status === 200, `AI Chat returned HTTP 201/200 (Actual: ${aiChatRes.status})`);
    assert(aiChatData.success === true, 'AI Chat response success is true');
    assert(aiChatData.response?.includes('Hello from MediNexa AI'), 'AI Chat returns conversational greeting');

    // 6. Test Doctor Role Registration
    console.log('\n--- 6. Multi-Role Registration: DOCTOR ---');
    const docEmail = `doctor.test.${Date.now()}@example.com`;
    const docRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Dr. Sarah Smith',
        email: docEmail,
        password: 'Password123!',
        role: 'DOCTOR',
      }),
    });
    const docData = await docRes.json();
    assert(docRes.status === 201, `Doctor registration returned HTTP 201 Created`);
    assert(docData.user?.role?.code === 'DOCTOR', `Doctor role registered accurately`);

    // 7. Test Admin Role Registration (alias 'ADMIN' -> 'HOSPITAL_ADMIN')
    console.log('\n--- 7. Multi-Role Registration: ADMIN ---');
    const adminEmail = `admin.test.${Date.now()}@example.com`;
    const adminRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Facility Admin',
        email: adminEmail,
        password: 'Password123!',
        role: 'ADMIN',
      }),
    });
    const adminData = await adminRes.json();
    assert(adminRes.status === 201, `Admin registration returned HTTP 201 Created`);
    assert(adminData.user?.role?.code === 'HOSPITAL_ADMIN', `Admin mapped to HOSPITAL_ADMIN`);

    // 8. Test Validation Error Handling
    console.log('\n--- 8. Validation Rejection Verification ---');
    const invalidEmailRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Invalid Test',
        email: 'not-an-email',
        password: 'Password123!',
        role: 'PATIENT',
      }),
    });
    assert(invalidEmailRes.status === 400, `Invalid email properly rejected with HTTP 400`);

    const shortPwRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Invalid Test',
        email: 'valid@example.com',
        password: '123',
        role: 'PATIENT',
      }),
    });
    assert(shortPwRes.status === 400, `Short password properly rejected with HTTP 400`);

    console.log('\n================================================================');
    console.log(`📊 SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal Test Suite Error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runRegistrationSuite();
