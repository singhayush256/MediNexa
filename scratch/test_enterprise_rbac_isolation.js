const API_BASE = 'http://localhost:3001/api/v1';

async function runEnterpriseRBACTests() {
  console.log('🔒 ========================================================');
  console.log('🔒 ENTERPRISE RBAC & DASHBOARD ISOLATION AUDIT SUITE');
  console.log('🔒 ========================================================');

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

  // Helper to authenticate
  async function login(email, password = 'Password123!') {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    return { token: data.accessToken, user: data.user, status: res.status };
  }

  // 1. Authenticate Personas
  console.log('\n🔑 1. Authenticating Persona Test Tokens...');
  const patientAuth = await login('patient@medinexa.in');
  const doctorAuth = await login('dr.deshmukh@medinexa.in');
  const receptionistAuth = await login('receptionist.01@medinexa.in');
  const labAuth = await login('lab.01@medinexa.in');
  const pharmacyAuth = await login('pharmacy.01@medinexa.in');
  const adminAuth = await login('admin@medinexa.in');

  assert('Patient authenticated', !!patientAuth.token, patientAuth.user?.role?.code);
  assert('Doctor authenticated', !!doctorAuth.token, doctorAuth.user?.role?.code);
  assert('Receptionist authenticated', !!receptionistAuth.token, receptionistAuth.user?.role?.code);
  assert('Lab Staff authenticated', !!labAuth.token, labAuth.user?.role?.code);
  assert('Pharmacist authenticated', !!pharmacyAuth.token, pharmacyAuth.user?.role?.code);
  assert('Admin authenticated', !!adminAuth.token, adminAuth.user?.role?.code);

  // 2. Patient RBAC Verification
  console.log('\n🧑‍💼 2. Patient Role RBAC Audits (Access Whitelist & Blacklist)...');
  // Whitelist: Profile, Appointments, Prescriptions, Lab Reports, Billing
  const pProfile = await fetch(`${API_BASE}/patient-portal/profile`, { headers: { Authorization: `Bearer ${patientAuth.token}` } });
  assert('Patient CAN access Profile', pProfile.status === 200, `HTTP ${pProfile.status}`);

  const pAppts = await fetch(`${API_BASE}/patient-portal/appointments`, { headers: { Authorization: `Bearer ${patientAuth.token}` } });
  assert('Patient CAN access Appointments', pAppts.status === 200, `HTTP ${pAppts.status}`);

  const pRx = await fetch(`${API_BASE}/patient-portal/prescriptions`, { headers: { Authorization: `Bearer ${patientAuth.token}` } });
  assert('Patient CAN access Prescriptions', pRx.status === 200, `HTTP ${pRx.status}`);

  const pLab = await fetch(`${API_BASE}/patient-portal/lab-reports`, { headers: { Authorization: `Bearer ${patientAuth.token}` } });
  assert('Patient CAN access Lab Reports', pLab.status === 200, `HTTP ${pLab.status}`);

  const pBills = await fetch(`${API_BASE}/patient-portal/bills`, { headers: { Authorization: `Bearer ${patientAuth.token}` } });
  assert('Patient CAN access Billing', pBills.status === 200, `HTTP ${pBills.status}`);

  // Blacklist: Revenue, Admin Dashboard, Staff Management, Claims Management
  const pRevenue = await fetch(`${API_BASE}/revenue/dashboard`, { headers: { Authorization: `Bearer ${patientAuth.token}` } });
  assert('Patient CANNOT access Hospital Revenue', pRevenue.status === 403, `Blocked HTTP ${pRevenue.status}`);

  const pAdmin = await fetch(`${API_BASE}/command-center/dashboard`, { headers: { Authorization: `Bearer ${patientAuth.token}` } });
  assert('Patient CANNOT access Admin Dashboard', pAdmin.status === 403, `Blocked HTTP ${pAdmin.status}`);

  const pHrms = await fetch(`${API_BASE}/hrms/employees`, { headers: { Authorization: `Bearer ${patientAuth.token}` } });
  assert('Patient CANNOT access Staff Management', pHrms.status === 403, `Blocked HTTP ${pHrms.status}`);

  const pClaims = await fetch(`${API_BASE}/insurance/claims`, { headers: { Authorization: `Bearer ${patientAuth.token}` } });
  assert('Patient CANNOT access Claims Management', pClaims.status === 403, `Blocked HTTP ${pClaims.status}`);

  // 3. Doctor RBAC Verification
  console.log('\n👨‍⚕️ 3. Doctor Role RBAC Audits (Access Whitelist & Blacklist)...');
  // Whitelist: Assigned Patients, Consultations, Prescriptions
  const dPatients = await fetch(`${API_BASE}/patients`, { headers: { Authorization: `Bearer ${doctorAuth.token}` } });
  assert('Doctor CAN access Assigned Patients', dPatients.status === 200, `HTTP ${dPatients.status}`);

  const dDoctorMe = await fetch(`${API_BASE}/doctors/me`, { headers: { Authorization: `Bearer ${doctorAuth.token}` } });
  assert('Doctor CAN access Consultations Profile', dDoctorMe.status === 200, `HTTP ${dDoctorMe.status}`);

  // Blacklist: Hospital Revenue, Admin Settings
  const dRevenue = await fetch(`${API_BASE}/revenue/dashboard`, { headers: { Authorization: `Bearer ${doctorAuth.token}` } });
  assert('Doctor CANNOT access Hospital Revenue', dRevenue.status === 403, `Blocked HTTP ${dRevenue.status}`);

  const dAdmin = await fetch(`${API_BASE}/command-center/dashboard`, { headers: { Authorization: `Bearer ${doctorAuth.token}` } });
  assert('Doctor CANNOT access Admin Settings / Command Center', dAdmin.status === 403, `Blocked HTTP ${dAdmin.status}`);

  const dHrms = await fetch(`${API_BASE}/hrms/employees`, { headers: { Authorization: `Bearer ${doctorAuth.token}` } });
  assert('Doctor CANNOT access Staff Management (HRMS)', dHrms.status === 403, `Blocked HTTP ${dHrms.status}`);

  const dBilling = await fetch(`${API_BASE}/billing/invoices`, { headers: { Authorization: `Bearer ${doctorAuth.token}` } });
  assert('Doctor CANNOT access Hospital Billing Invoices', dBilling.status === 403, `Blocked HTTP ${dBilling.status}`);

  // 4. Receptionist RBAC Verification
  console.log('\n👩‍💼 4. Receptionist Role RBAC Audits...');
  // Whitelist: Appointment Booking, Patient Registration
  const rPatients = await fetch(`${API_BASE}/patients`, { headers: { Authorization: `Bearer ${receptionistAuth.token}` } });
  assert('Receptionist CAN access Patient Registration', rPatients.status === 200, `HTTP ${rPatients.status}`);

  const rAppts = await fetch(`${API_BASE}/appointments`, { headers: { Authorization: `Bearer ${receptionistAuth.token}` } });
  assert('Receptionist CAN access Appointment Booking', rAppts.status === 200, `HTTP ${rAppts.status}`);

  // Blacklist: Revenue, Admin Command Center, HRMS, Claims
  const rRevenue = await fetch(`${API_BASE}/revenue/dashboard`, { headers: { Authorization: `Bearer ${receptionistAuth.token}` } });
  assert('Receptionist CANNOT access Hospital Revenue', rRevenue.status === 403, `Blocked HTTP ${rRevenue.status}`);

  const rAdmin = await fetch(`${API_BASE}/command-center/dashboard`, { headers: { Authorization: `Bearer ${receptionistAuth.token}` } });
  assert('Receptionist CANNOT access Admin Dashboard', rAdmin.status === 403, `Blocked HTTP ${rAdmin.status}`);

  const rClaims = await fetch(`${API_BASE}/insurance/claims`, { headers: { Authorization: `Bearer ${receptionistAuth.token}` } });
  assert('Receptionist CANNOT access Claims Management', rClaims.status === 403, `Blocked HTTP ${rClaims.status}`);

  // 5. Lab Staff RBAC Verification
  console.log('\n🔬 5. Lab Staff Role RBAC Audits...');
  // Whitelist: Lab Reports
  const lOrders = await fetch(`${API_BASE}/lab/orders`, { headers: { Authorization: `Bearer ${labAuth.token}` } });
  assert('Lab Staff CAN access Lab Reports & Orders', lOrders.status === 200, `HTTP ${lOrders.status}`);

  // Blacklist: Revenue, Admin, HRMS, Claims
  const lRevenue = await fetch(`${API_BASE}/revenue/dashboard`, { headers: { Authorization: `Bearer ${labAuth.token}` } });
  assert('Lab Staff CANNOT access Hospital Revenue', lRevenue.status === 403, `Blocked HTTP ${lRevenue.status}`);

  const lAdmin = await fetch(`${API_BASE}/command-center/dashboard`, { headers: { Authorization: `Bearer ${labAuth.token}` } });
  assert('Lab Staff CANNOT access Admin Command Center', lAdmin.status === 403, `Blocked HTTP ${lAdmin.status}`);

  const lClaims = await fetch(`${API_BASE}/insurance/claims`, { headers: { Authorization: `Bearer ${labAuth.token}` } });
  assert('Lab Staff CANNOT access Claims Management', lClaims.status === 403, `Blocked HTTP ${lClaims.status}`);

  // 6. Pharmacist RBAC Verification
  console.log('\n💊 6. Pharmacist Role RBAC Audits...');
  // Whitelist: Pharmacy Module
  const pStock = await fetch(`${API_BASE}/pharmacy/inventory`, { headers: { Authorization: `Bearer ${pharmacyAuth.token}` } });
  assert('Pharmacist CAN access Pharmacy Module', pStock.status === 200, `HTTP ${pStock.status}`);

  // Blacklist: Revenue, Admin, HRMS, Claims
  const phRevenue = await fetch(`${API_BASE}/revenue/dashboard`, { headers: { Authorization: `Bearer ${pharmacyAuth.token}` } });
  assert('Pharmacist CANNOT access Hospital Revenue', phRevenue.status === 403, `Blocked HTTP ${phRevenue.status}`);

  const phAdmin = await fetch(`${API_BASE}/command-center/dashboard`, { headers: { Authorization: `Bearer ${pharmacyAuth.token}` } });
  assert('Pharmacist CANNOT access Admin Command Center', phAdmin.status === 403, `Blocked HTTP ${phAdmin.status}`);

  const phClaims = await fetch(`${API_BASE}/insurance/claims`, { headers: { Authorization: `Bearer ${pharmacyAuth.token}` } });
  assert('Pharmacist CANNOT access Claims Management', phClaims.status === 403, `Blocked HTTP ${phClaims.status}`);

  // 7. Admin RBAC Verification (Full Access)
  console.log('\n👑 7. Admin Role Full Access Audits...');
  const aRevenue = await fetch(`${API_BASE}/revenue/dashboard`, { headers: { Authorization: `Bearer ${adminAuth.token}` } });
  assert('Admin HAS Full Access to Hospital Revenue', aRevenue.status === 200, `HTTP ${aRevenue.status}`);

  const aAdmin = await fetch(`${API_BASE}/command-center/dashboard`, { headers: { Authorization: `Bearer ${adminAuth.token}` } });
  assert('Admin HAS Full Access to Admin Command Center', aAdmin.status === 200, `HTTP ${aAdmin.status}`);

  const aHrms = await fetch(`${API_BASE}/hrms/employees`, { headers: { Authorization: `Bearer ${adminAuth.token}` } });
  assert('Admin HAS Full Access to Staff Management (HRMS)', aHrms.status === 200, `HTTP ${aHrms.status}`);

  const aClaims = await fetch(`${API_BASE}/insurance/claims`, { headers: { Authorization: `Bearer ${adminAuth.token}` } });
  assert('Admin HAS Full Access to Claims Management', aClaims.status === 200, `HTTP ${aClaims.status}`);

  const aBilling = await fetch(`${API_BASE}/billing/invoices`, { headers: { Authorization: `Bearer ${adminAuth.token}` } });
  assert('Admin HAS Full Access to Hospital Billing', aBilling.status === 200, `HTTP ${aBilling.status}`);

  console.log('\n=========================================================');
  console.log(`🎯 ENTERPRISE RBAC AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=========================================================');

  if (failed > 0) process.exit(1);
}

runEnterpriseRBACTests();
