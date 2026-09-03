const API_BASE = 'http://localhost:3001/api/v1';

async function runAuthSystemTests() {
  console.log('🛡️ ========================================================');
  console.log('🛡️ MEDINEXA COMPREHENSIVE AUTH SYSTEM TEST SUITE');
  console.log('🛡️ ========================================================');

  let passed = 0;
  let failed = 0;

  function assert(title, condition, details = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${title} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.log(`  ❌ [FAIL] ${title} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  const timestamp = Date.now();

  // Test 1: Register all 7 requested roles
  console.log('\n📝 1. Testing Registration for all 7 requested roles...');
  const testRoles = [
    { role: 'PATIENT', name: 'Ayush Patient', expectedRole: 'PATIENT' },
    { role: 'DOCTOR', name: 'Dr. Neeraj Doctor', expectedRole: 'DOCTOR' },
    { role: 'NURSE', name: 'Sister Preeti Nurse', expectedRole: 'NURSE' },
    { role: 'RECEPTIONIST', name: 'Kavita FrontDesk', expectedRole: 'RECEPTIONIST' },
    { role: 'LAB_STAFF', name: 'Ravi LabTech', expectedRole: 'LAB_STAFF' },
    { role: 'PHARMACY_STAFF', name: 'Sanjay Pharmacist', expectedRole: 'PHARMACY_STAFF' },
    { role: 'ADMIN', name: 'Vikram Admin', expectedRole: 'HOSPITAL_ADMIN' },
  ];

  const registeredUsers = {};

  for (const item of testRoles) {
    const email = `test.${item.role.toLowerCase()}.${timestamp}@medinexa.in`;
    const payload = {
      name: item.name,
      email,
      phone: '+91 98765 00000',
      password: 'Password123!',
      role: item.role,
    };

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      const success = res.status === 201 && !!data.accessToken;
      const roleMatches =
        data.user?.role?.code === item.expectedRole || data.user?.roleCode === item.expectedRole;
      assert(`Register role: ${item.role}`, success && roleMatches, `Assigned: ${data.user?.role?.code}`);
      if (success) {
        registeredUsers[item.role] = { email, password: 'Password123!', token: data.accessToken, user: data.user };
      }
    } catch (e) {
      assert(`Register role: ${item.role}`, false, e.message);
    }
  }

  // Test 2: Validation Errors & Bug Prevention
  console.log('\n🚫 2. Testing Registration Validation Errors & Safeguards...');
  // 2a. Invalid Email
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Invalid Email User',
        email: 'invalid-email-format',
        password: 'Password123!',
        role: 'PATIENT',
      }),
    });
    assert('Reject invalid email format', res.status === 400, `HTTP ${res.status}`);
  } catch (e) {
    assert('Reject invalid email format', false, e.message);
  }

  // 2b. Password too short (<6 chars)
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Password User',
        email: `shortpw.${timestamp}@medinexa.in`,
        password: '123',
        role: 'PATIENT',
      }),
    });
    assert('Reject short password (< 6 chars)', res.status === 400, `HTTP ${res.status}`);
  } catch (e) {
    assert('Reject short password (< 6 chars)', false, e.message);
  }

  // 2c. Missing Name
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '',
        email: `noname.${timestamp}@medinexa.in`,
        password: 'Password123!',
        role: 'PATIENT',
      }),
    });
    assert('Reject missing name', res.status === 400, `HTTP ${res.status}`);
  } catch (e) {
    assert('Reject missing name', false, e.message);
  }

  // 2d. Duplicate Email
  try {
    const existingEmail = registeredUsers['PATIENT']?.email;
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Patient',
        email: existingEmail,
        password: 'Password123!',
        role: 'PATIENT',
      }),
    });
    assert('Reject duplicate email registration', res.status === 400, `HTTP ${res.status}`);
  } catch (e) {
    assert('Reject duplicate email registration', false, e.message);
  }

  // Test 3: Login & JWT Authentication
  console.log('\n🔑 3. Testing Login & JWT Authentication...');
  const testPatient = registeredUsers['PATIENT'];
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testPatient.email,
        password: testPatient.password,
      }),
    });
    const data = await res.json();
    assert('Login with correct credentials', res.status === 200 && !!data.accessToken);

    // Verify JWT structure
    const parts = (data.accessToken || '').split('.');
    assert('JWT Token structure (header.payload.signature)', parts.length === 3);

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    assert('JWT claims include sub, email, role', !!payload.sub && payload.email === testPatient.email && payload.role === 'PATIENT');
  } catch (e) {
    assert('Login with correct credentials', false, e.message);
  }

  // 3b. Wrong password
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testPatient.email,
        password: 'WrongPassword999!',
      }),
    });
    assert('Reject incorrect password with 401', res.status === 401, `HTTP ${res.status}`);
  } catch (e) {
    assert('Reject incorrect password with 401', false, e.message);
  }

  // Test 4: Session Persistence (GET /auth/me)
  console.log('\n👤 4. Testing Session Persistence (GET /auth/me)...');
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${testPatient.token}` },
    });
    const data = await res.json();
    assert('GET /auth/me with valid Bearer token returns current user', res.status === 200 && data.email === testPatient.email);
  } catch (e) {
    assert('GET /auth/me with valid Bearer token', false, e.message);
  }

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer invalid-junk-token` },
    });
    assert('GET /auth/me rejects invalid token with 401', res.status === 401, `HTTP ${res.status}`);
  } catch (e) {
    assert('GET /auth/me rejects invalid token', false, e.message);
  }

  // Test 5: Forgot Password Flow
  console.log('\n🔄 5. Testing Forgot Password Flow...');
  let resetToken = '';
  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testPatient.email }),
    });
    const data = await res.json();
    assert('POST /auth/forgot-password returns reset token and link', res.status === 200 && !!data.resetToken && !!data.resetLink);
    resetToken = data.resetToken;
  } catch (e) {
    assert('POST /auth/forgot-password', false, e.message);
  }

  // Test 6: Verify Reset Token
  console.log('\n🔍 6. Testing Verify Reset Token...');
  try {
    const res = await fetch(`${API_BASE}/auth/verify-reset-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken }),
    });
    const data = await res.json();
    assert('POST /auth/verify-reset-token validates active token', res.status === 200 && data.valid === true && data.email === testPatient.email);
  } catch (e) {
    assert('POST /auth/verify-reset-token', false, e.message);
  }

  // Test 7: Password Reset Flow
  console.log('\n🔐 7. Testing Password Reset Execution...');
  const newSecretPassword = 'BrandNewPassword2026!';
  try {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, newPassword: newSecretPassword }),
    });
    const data = await res.json();
    assert('POST /auth/reset-password updates credentials', res.status === 200 && data.success === true);
  } catch (e) {
    assert('POST /auth/reset-password', false, e.message);
  }

  // 7b. Verify OLD password is rejected
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testPatient.email, password: testPatient.password }),
    });
    assert('Old password rejected after reset', res.status === 401, `HTTP ${res.status}`);
  } catch (e) {
    assert('Old password rejected after reset', false, e.message);
  }

  // 7c. Verify NEW password succeeds
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testPatient.email, password: newSecretPassword }),
    });
    const data = await res.json();
    assert('New password authenticates successfully', res.status === 200 && !!data.accessToken);
  } catch (e) {
    assert('New password authenticates successfully', false, e.message);
  }

  // Test 8: Logout Endpoint
  console.log('\n🚪 8. Testing Logout Endpoint...');
  try {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testPatient.token}`,
      },
    });
    const data = await res.json();
    assert('POST /auth/logout returns 200 OK', res.status === 200 && data.message.includes('logged out'));
  } catch (e) {
    assert('POST /auth/logout', false, e.message);
  }

  console.log('\n=========================================================');
  console.log(`🎯 AUTH SYSTEM AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=========================================================');

  if (failed > 0) process.exit(1);
}

runAuthSystemTests();
