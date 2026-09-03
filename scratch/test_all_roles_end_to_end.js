const assert = require('assert');

const BASE_URL = 'http://localhost:3001/api/v1';

const ROLES_TO_TEST = [
  { role: 'PATIENT', email: 'patient@medinexa.in', name: 'Primary Patient' },
  { role: 'DOCTOR', email: 'dr.deshmukh@medinexa.in', name: 'Dr. Arvind Deshmukh' },
  { role: 'NURSE', email: 'nurse.01@medinexa.in', name: 'Ancy Thomas' },
  { role: 'RECEPTIONIST', email: 'receptionist.01@medinexa.in', name: 'Amit Saxena' },
  { role: 'LAB_STAFF', email: 'lab.01@medinexa.in', name: 'Ramesh Chandra' },
  { role: 'PHARMACY_STAFF', email: 'pharmacy.01@medinexa.in', name: 'Sandeep Shinde' },
  { role: 'HOSPITAL_ADMIN', email: 'admin.delhi@medinexa.in', name: 'Rajiv Mehta' },
  { role: 'MEDINEXA_ADMIN', email: 'admin@medinexa.in', name: 'MediNexa SuperAdmin' },
];

async function testAllRolesAuth() {
  console.log('===========================================================');
  console.log('👑 TESTING ALL 8 HOSPITAL ROLES AUTH & ACCESS (E2E)');
  console.log('===========================================================\n');

  for (const account of ROLES_TO_TEST) {
    console.log(`Testing Login & Identity: ${account.role} (${account.email})...`);
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: account.email,
        password: 'Password123!',
      }),
    });

    assert(res.status === 200, `Login failed for ${account.role} with status ${res.status}`);
    const data = await res.json();
    const token = data.accessToken || data.token;
    assert(token, `Must receive JWT token for ${account.role}`);

    const user = data.user;
    assert(user, `Must return user profile for ${account.role}`);
    const receivedRole = user.roleCode || user.role?.code || user.role;
    console.log(`  [PASS] Logged in as: ${user.firstName} ${user.lastName} | Role Code: ${receivedRole}`);

    // Verify /auth/me
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(meRes.status === 200, `/auth/me failed for ${account.role}`);
    const meData = await meRes.json();
    assert(meData.id === user.id, 'User ID must match in /auth/me');
    console.log(`  [PASS] Session verified via /auth/me (Active Status: ${meData.status})\n`);
  }

  console.log('===========================================================');
  console.log('🎉 ALL 8 HOSPITAL ROLES AUTHENTICATED SUCCESSFULLY (100%)');
  console.log('===========================================================\n');
}

testAllRolesAuth().catch((err) => {
  console.error('\n❌ ALL ROLES AUTH TEST FAILED:', err);
  process.exit(1);
});
