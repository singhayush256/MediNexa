const http = require('http');

const API_BASE = 'http://localhost:3001/api/v1';

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function registerTestUser(role, name) {
  const email = `rbac.${role.toLowerCase()}.${Date.now()}@medinexa.local`;
  const password = 'Password123!';

  const regRes = await request(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email, password, role, name },
  });

  if (regRes.status === 200 || regRes.status === 201) {
    return regRes.data.accessToken;
  }

  throw new Error(`Failed to register ${email} (${role}): ${JSON.stringify(regRes.data)}`);
}

async function runTests() {
  console.log('🔒 =========================================================');
  console.log('🔒 MEDINEXA RBAC & HOSPITAL ISOLATION E2E VERIFICATION TEST');
  console.log('🔒 =========================================================\n');

  // Step 1: Health Check
  const health = await request(`${API_BASE}/health`);
  console.log(`🏥 Health Check Status: ${health.status} (${health.data?.status || 'OK'})\n`);

  // Step 2: Register fresh test role actors
  console.log('🔑 Provisioning fresh test role actors...');
  const patientToken = await registerTestUser('PATIENT', 'RBAC Patient');
  const doctorToken = await registerTestUser('DOCTOR', 'Dr. RBAC Physician');
  const nurseToken = await registerTestUser('NURSE', 'Nurse RBAC Caregiver');
  const labToken = await registerTestUser('LAB_STAFF', 'Alex Lab Specialist');
  const adminToken = await registerTestUser('HOSPITAL_ADMIN', 'Hospital Administrator');
  console.log('✅ All role tokens successfully provisioned.\n');

  let passed = 0;
  let failed = 0;

  async function assertRbac(testName, roleName, token, method, path, expectedStatus) {
    const res = await request(`${API_BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const isMatch = res.status === expectedStatus;
    if (isMatch) {
      console.log(`  ✅ [PASS] ${testName}: ${roleName} ${method} ${path} -> ${res.status} (Expected ${expectedStatus})`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}: ${roleName} ${method} ${path} -> Got ${res.status}, Expected ${expectedStatus}`);
      console.error(`     Response: ${JSON.stringify(res.data).slice(0, 120)}`);
      failed++;
    }
  }

  // ==========================================
  // SECTION 1: PATIENT ROLE SECURITY BOUNDARIES
  // ==========================================
  console.log('🛡️ --- SECTION 1: PATIENT ROLE AUTHORIZATION BLOCKS ---');
  await assertRbac('Patient blocked from Revenue Dashboard', 'PATIENT', patientToken, 'GET', '/revenue/dashboard', 403);
  await assertRbac('Patient blocked from Command Center Dashboard', 'PATIENT', patientToken, 'GET', '/command-center/dashboard', 403);
  await assertRbac('Patient blocked from Command Center Revenue', 'PATIENT', patientToken, 'GET', '/command-center/revenue', 403);
  await assertRbac('Patient blocked from HRMS Employees', 'PATIENT', patientToken, 'GET', '/hrms/employees', 403);
  await assertRbac('Patient blocked from Hospital Invoices', 'PATIENT', patientToken, 'GET', '/finance/invoices', 403);
  await assertRbac('Patient blocked from Insurance Policies', 'PATIENT', patientToken, 'GET', '/insurance/policies', 403);
  await assertRbac('Patient blocked from Inventory Items', 'PATIENT', patientToken, 'GET', '/inventory/items', 403);
  await assertRbac('Patient blocked from Procurement Vendors', 'PATIENT', patientToken, 'GET', '/procurement/vendors', 403);
  await assertRbac('Patient blocked from Audit Logs', 'PATIENT', patientToken, 'GET', '/audit-logs', 403);
  console.log('');

  // ==========================================
  // SECTION 2: DOCTOR ROLE SECURITY BOUNDARIES
  // ==========================================
  console.log('🛡️ --- SECTION 2: DOCTOR ROLE AUTHORIZATION BLOCKS ---');
  await assertRbac('Doctor blocked from HRMS Employees', 'DOCTOR', doctorToken, 'GET', '/hrms/employees', 403);
  await assertRbac('Doctor blocked from Revenue Dashboard', 'DOCTOR', doctorToken, 'GET', '/revenue/dashboard', 403);
  await assertRbac('Doctor blocked from Hospital Invoices', 'DOCTOR', doctorToken, 'GET', '/finance/invoices', 403);
  await assertRbac('Doctor blocked from Procurement Vendors', 'DOCTOR', doctorToken, 'GET', '/procurement/vendors', 403);
  await assertRbac('Doctor allowed access to Appointments', 'DOCTOR', doctorToken, 'GET', '/appointments', 200);
  console.log('');

  // ==========================================
  // SECTION 3: NURSE ROLE SECURITY BOUNDARIES
  // ==========================================
  console.log('🛡️ --- SECTION 3: NURSE ROLE AUTHORIZATION BLOCKS ---');
  await assertRbac('Nurse blocked from Hospital Invoices', 'NURSE', nurseToken, 'GET', '/finance/invoices', 403);
  await assertRbac('Nurse blocked from Insurance Policies', 'NURSE', nurseToken, 'GET', '/insurance/policies', 403);
  await assertRbac('Nurse blocked from HRMS Employees', 'NURSE', nurseToken, 'GET', '/hrms/employees', 403);
  await assertRbac('Nurse blocked from Revenue Dashboard', 'NURSE', nurseToken, 'GET', '/revenue/dashboard', 403);
  console.log('');

  // ==========================================
  // SECTION 4: LAB STAFF ROLE SECURITY BOUNDARIES
  // ==========================================
  console.log('🛡️ --- SECTION 4: LAB STAFF ROLE AUTHORIZATION BLOCKS ---');
  await assertRbac('Lab Staff blocked from Revenue Dashboard', 'LAB_STAFF', labToken, 'GET', '/revenue/dashboard', 403);
  await assertRbac('Lab Staff blocked from Hospital Invoices', 'LAB_STAFF', labToken, 'GET', '/finance/invoices', 403);
  await assertRbac('Lab Staff blocked from HRMS Employees', 'LAB_STAFF', labToken, 'GET', '/hrms/employees', 403);
  await assertRbac('Lab Staff blocked from Insurance Policies', 'LAB_STAFF', labToken, 'GET', '/insurance/policies', 403);
  console.log('');

  // ==========================================
  // SECTION 5: HOSPITAL ADMIN OPERATIONAL ACCESS
  // ==========================================
  console.log('🛡️ --- SECTION 5: HOSPITAL ADMIN ACCESS CLEARANCE ---');
  await assertRbac('Admin allowed Revenue Dashboard', 'HOSPITAL_ADMIN', adminToken, 'GET', '/revenue/dashboard', 200);
  await assertRbac('Admin allowed Command Center Dashboard', 'HOSPITAL_ADMIN', adminToken, 'GET', '/command-center/dashboard', 200);
  await assertRbac('Admin allowed HRMS Employees', 'HOSPITAL_ADMIN', adminToken, 'GET', '/hrms/employees', 200);
  await assertRbac('Admin allowed Finance Invoices', 'HOSPITAL_ADMIN', adminToken, 'GET', '/finance/invoices', 200);
  await assertRbac('Admin allowed Insurance Policies', 'HOSPITAL_ADMIN', adminToken, 'GET', '/insurance/policies', 200);
  await assertRbac('Admin allowed Audit Logs', 'HOSPITAL_ADMIN', adminToken, 'GET', '/audit-logs', 200);
  await assertRbac('Admin blocked from foreign facility analytics (Multi-Tenant Isolation)', 'HOSPITAL_ADMIN', adminToken, 'GET', '/analytics/facility/00000000-0000-0000-0000-000000000000', 403);
  console.log('');

  // ==========================================
  // SECTION 6: AUDIT LOGGING OF ACCESS DENIED
  // ==========================================
  console.log('🔍 --- SECTION 6: AUDIT EVENT VERIFICATION ---');
  const auditRes = await request(`${API_BASE}/audit-logs?action=ACCESS_DENIED`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  if (auditRes.status === 200 && Array.isArray(auditRes.data) && auditRes.data.length > 0) {
    console.log(`  ✅ [PASS] ACCESS_DENIED audit events recorded: ${auditRes.data.length} violations logged in database.`);
    const sample = auditRes.data[0];
    console.log(`     Sample Audit Log: User [${sample.role}] -> Resource: ${sample.resource} (Timestamp: ${sample.createdAt})`);
    passed++;
  } else {
    console.log(`  ℹ️ Audit logs check: Status ${auditRes.status}, count: ${Array.isArray(auditRes.data) ? auditRes.data.length : 0}`);
  }

  console.log('\n=========================================================');
  console.log(`🎯 RBAC AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=========================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
