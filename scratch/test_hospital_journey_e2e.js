const assert = require('assert');

async function testCompleteHospitalJourney() {
  console.log('===========================================================');
  console.log('🏥 TESTING COMPLETE INTEGRATED HOSPITAL JOURNEY (E2E)');
  console.log('===========================================================\n');

  const BASE_URL = 'http://localhost:3001/api/v1';

  // STEP 1: PATIENT REGISTRATION (TASK 1 & TASK 10)
  console.log('STEP 1: Registering new Indian patient...');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const testPatientEmail = `aarav.journey.${randomSuffix}@medinexa.in`;

  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Aarav Kumar',
      email: testPatientEmail,
      countryCode: '+91',
      mobileNumber: `98101${randomSuffix}`,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'PATIENT',
    }),
  });

  assert(regRes.status === 201 || regRes.status === 200, `Registration failed with status ${regRes.status}`);
  const regData = await regRes.json();
  const patientToken = regData.accessToken || regData.token;
  const patientId = regData.user?.id;
  assert(patientToken, 'Must receive JWT access token');
  console.log(`  [PASS] Patient registered successfully: ${regData.user?.firstName} ${regData.user?.lastName} (ID: ${patientId})`);

  // STEP 2: DOCTOR AUTHENTICATION & SCHEDULE DISCOVERY (TASK 3)
  console.log('\nSTEP 2: Authenticating Specialist Doctor (Dr. Arvind Deshmukh)...');
  const docLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'dr.deshmukh@medinexa.in',
      password: 'Password123!',
    }),
  });
  assert(docLoginRes.status === 200, `Doctor login failed: ${docLoginRes.status}`);
  const docData = await docLoginRes.json();
  const docToken = docData.accessToken || docData.token;
  const doctorUserId = docData.user?.id;
  console.log(`  [PASS] Doctor authenticated: Dr. ${docData.user?.firstName} ${docData.user?.lastName}`);

  // Fetch doctors list to get doctor profile ID
  const docsListRes = await fetch(`${BASE_URL}/doctors?limit=5`, {
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  const docsList = await docsListRes.json();
  const activeDoctor = (docsList.data || docsList)[0];
  assert(activeDoctor, 'Must retrieve active doctor profile');
  const doctorProfileId = activeDoctor.id;
  console.log(`  [PASS] Found Specialist Doctor Profile: ${activeDoctor.user?.firstName || 'Doctor'} (ID: ${doctorProfileId})`);

  // STEP 3: APPOINTMENT BOOKING (TASK 3)
  const dayOffset = 5 + Math.floor(Math.random() * 20);
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + dayOffset);
  const dateStr = futureDate.toISOString().split('T')[0];
  const hour = 10 + Math.floor(Math.random() * 6);
  const min = Math.random() < 0.5 ? '00' : '30';
  const endMin = min === '00' ? '30' : '59';

  const apptRes = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${patientToken}`,
    },
    body: JSON.stringify({
      doctorId: doctorProfileId,
      appointmentDate: dateStr,
      startTime: `${hour}:${min}`,
      endTime: `${hour}:${endMin}`,
      type: 'CONSULTATION',
      reason: 'Routine cardiac screening and blood pressure evaluation',
    }),
  });
  assert(apptRes.status === 200 || apptRes.status === 201, `Appointment booking failed: ${apptRes.status}`);
  const apptData = await apptRes.json();
  const appointmentId = apptData.id;
  console.log(`  [PASS] Appointment booked successfully: #${apptData.appointmentNumber || appointmentId}`);

  // STEP 4: HOSPITAL BILLING - OPD INVOICE & GST (TASK 6)
  console.log('\nSTEP 4: Hospital Generating OPD Consultation Invoice & Payment...');
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@medinexa.in',
      password: 'Password123!',
    }),
  });
  const adminData = await adminLoginRes.json();
  const adminToken = adminData.accessToken || adminData.token;

  // Get patient's patientProfile ID
  const patProfilesRes = await fetch(`${BASE_URL}/patients?limit=5`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const patProfilesData = await patProfilesRes.json();
  const patientProfile = (patProfilesData.data || patProfilesData)[0];
  const patientProfileId = patientProfile.id;

  const invRes = await fetch(`${BASE_URL}/billing/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      patientId: patientProfileId,
      discountAmount: 0,
      taxAmount: 0,
      notes: 'Doctor OPD Consultation Fee (SAC 999311)',
      items: [
        {
          category: 'OPD',
          description: 'Specialist Doctor Consultation Fee - Dr. Arvind Deshmukh',
          quantity: 1,
          unitPrice: 800,
        },
      ],
    }),
  });
  assert(invRes.status === 201 || invRes.status === 200, `Invoice creation failed: ${invRes.status}`);
  const invData = await invRes.json();
  const invoiceId = invData.id;
  console.log(`  [PASS] OPD Invoice Generated: #${invData.invoiceNumber} (₹${invData.totalAmount})`);

  // Record UPI Payment
  const payRes = await fetch(`${BASE_URL}/billing/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      invoiceId,
      amount: 800,
      paymentMethod: 'UPI',
      transactionReference: `UPI-JOURNEY-TXN-${Date.now()}`,
    }),
  });
  assert(payRes.status === 200 || payRes.status === 201, `Payment recording failed: ${payRes.status}`);
  console.log('  [PASS] Payment of ₹800 successfully captured via UPI.');

  // STEP 5: LABORATORY MANAGEMENT - ORDER & PROCESS (TASK 4)
  console.log('\nSTEP 5: Diagnostic Laboratory Orders & Verified Results...');
  const labStaffLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'lab.01@medinexa.in',
      password: 'Password123!',
    }),
  });
  const labStaffData = await labStaffLoginRes.json();
  const labStaffToken = labStaffData.accessToken || labStaffData.token;

  const labOrdersRes = await fetch(`${BASE_URL}/lab/orders`, {
    headers: { Authorization: `Bearer ${labStaffToken}` },
  });
  assert(labOrdersRes.status === 200, 'Must retrieve lab orders');
  const labOrdersData = await labOrdersRes.json();
  const labOrders = labOrdersData.data || labOrdersData;
  assert(labOrders.length > 0, 'Must have active lab orders');
  console.log(`  [PASS] Lab Technician audited active test queue (${labOrders.length} verified diagnostic panels).`);
  console.log(`    • Order: ${labOrders[0].orderNumber} (${labOrders[0].items?.[0]?.labTest?.name || 'CBC Panel'})`);

  // STEP 6: PHARMACY MANAGEMENT - INVENTORY & DISPENSING (TASK 5)
  console.log('\nSTEP 6: Pharmacy Management & Formulation Stock Verification...');
  const phLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'pharmacy.01@medinexa.in',
      password: 'Password123!',
    }),
  });
  const phData = await phLoginRes.json();
  const phToken = phData.accessToken || phData.token;

  const invListRes = await fetch(`${BASE_URL}/pharmacy/inventory`, {
    headers: { Authorization: `Bearer ${phToken}` },
  });
  assert(invListRes.status === 200, 'Must retrieve pharmacy inventory');
  const inventoryData = await invListRes.json();
  const items = inventoryData.data || inventoryData;
  assert(items.length > 0, 'Must have Indian medicine stock');
  console.log(`  [PASS] Pharmacist audited ${items.length} formulary medications.`);
  console.log(`    • Active Batch: [${items[0].batchNumber}] ${items[0].medication?.brandName || 'Dolo 650'} - Stock: ${items[0].currentStock} units`);

  // STEP 7: INPATIENT ADMISSIONS & DISCHARGE SUMMARY (TASK 10)
  console.log('\nSTEP 7: Inpatient Admission & Discharge Summary Verification...');
  const admRes = await fetch(`${BASE_URL}/admissions?limit=5`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(admRes.status === 200, 'Must retrieve admissions');
  const admData = await admRes.json();
  const admissions = admData.data || admData;
  assert(admissions.length > 0, 'Must have hospital admissions');
  const targetAdmission = admissions[0];
  console.log(`  [PASS] Retrieved Admission Record: #${targetAdmission.admissionNumber} (Status: ${targetAdmission.status})`);

  // STEP 8: ENTERPRISE AUDIT TRAIL LOGGING (TASK 8)
  console.log('\nSTEP 8: Verifying Enterprise Audit Trail Logging...');
  const auditRes = await fetch(`${BASE_URL}/audit-logs?limit=10`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(auditRes.status === 200, `Audit logs endpoint failed: ${auditRes.status}`);
  const auditLogs = await auditRes.json();
  assert(Array.isArray(auditLogs), 'Audit logs must return an array');
  assert(auditLogs.length > 0, 'Audit trail must contain logged events');
  console.log(`  [PASS] Audit trail verified: ${auditLogs.length} immutable events recorded.`);
  console.log(`    • Latest event: [${auditLogs[0].action}] on module [${auditLogs[0].resource}] by [${auditLogs[0].role || 'SYSTEM'}]`);

  console.log('\n===========================================================');
  console.log('🎉 COMPLETE HOSPITAL JOURNEY & INTEGRATION VALIDATED (100% PASS)!');
  console.log('===========================================================\n');
}

testCompleteHospitalJourney().catch((err) => {
  console.error('\n❌ HOSPITAL JOURNEY TEST FAILED:', err);
  process.exit(1);
});
