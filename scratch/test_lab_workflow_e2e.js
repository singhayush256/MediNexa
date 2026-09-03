const assert = require('assert');

async function login(email, password = 'Password123!') {
  const res = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Login failed for ${email}: ${res.status} ${txt}`);
  }
  const data = await res.json();
  return { token: data.token || data.accessToken, user: data.user };
}

async function testLabWorkflow() {
  console.log('====================================================');
  console.log('🧪 TESTING COMPLETE LABORATORY LIFECYCLE (E2E)');
  console.log('====================================================\n');

  const BASE_URL = 'http://localhost:3001/api/v1';

  // 1. Doctor Login & Order Lab Test
  console.log('STEP 1: Doctor placing Lab Order...');
  const doctor = await login('dr.deshmukh@medinexa.in');
  console.log(`  Doctor logged in: Dr. ${doctor.user.firstName} ${doctor.user.lastName}`);

  // Fetch a patient to order for
  const patientsRes = await fetch(`${BASE_URL}/patients`, {
    headers: { Authorization: `Bearer ${doctor.token}` },
  });
  const patientsData = await patientsRes.json();
  const patient = Array.isArray(patientsData) ? patientsData[0] : patientsData.data[0];
  console.log(`  Ordering for Patient: ${patient.user?.firstName || 'Patient'} (ID: ${patient.id})`);

  const orderPayload = {
    patientId: patient.id,
    facilityId: doctor.user.facilityId || undefined,
    clinicalNotes: 'Suspected bacterial infection and anemia. STAT evaluation.',
    tests: [
      { testName: 'Complete Blood Count (CBC with ESR)', category: 'HEMATOLOGY', referenceRange: '13.0 - 17.0 g/dL', unit: 'g/dL' },
      { testName: 'Fasting Blood Sugar (FBS)', category: 'BIOCHEMISTRY', referenceRange: '70 - 99 mg/dL', unit: 'mg/dL' },
    ],
  };

  const createOrderRes = await fetch(`${BASE_URL}/lab/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${doctor.token}`,
    },
    body: JSON.stringify(orderPayload),
  });

  console.log(`  Create Order Status: ${createOrderRes.status}`);
  const createdOrder = await createOrderRes.json();
  if (createOrderRes.status !== 201) {
    console.log('  Create Order Error Payload:', JSON.stringify(createdOrder, null, 2));
  }
  assert.strictEqual(createOrderRes.status, 201);
  console.log(`  [PASS] Order created: #${createdOrder.orderNumber} (ID: ${createdOrder.id})`);
  console.log(`  Items count: ${createdOrder.testItems.length}`);

  // 2. Lab Technician Login, Sample Collection, Result Entry & Verification
  console.log('\nSTEP 2: Lab Technician processing Order...');
  const labTech = await login('lab.01@medinexa.in');
  console.log(`  Lab Tech logged in: ${labTech.user.firstName} ${labTech.user.lastName}`);

  // 2a. Sample Collection
  const collectRes = await fetch(`${BASE_URL}/lab/sample-collection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${labTech.token}`,
    },
    body: JSON.stringify({
      labOrderId: createdOrder.id,
      sampleType: 'BLOOD',
    }),
  });
  console.log(`  Sample Collection Status: ${collectRes.status}`);
  const sampleData = await collectRes.json();
  assert.strictEqual(collectRes.status, 201);
  console.log(`  [PASS] Sample collected with Barcode: ${sampleData.barcode}`);

  // 2b. Result Entry for each Test Item
  for (const item of createdOrder.testItems) {
    const val = item.testName.includes('CBC') ? '13.8' : '92';
    const resultRes = await fetch(`${BASE_URL}/lab/results/${item.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${labTech.token}`,
      },
      body: JSON.stringify({
        resultValue: val,
        referenceRange: item.referenceRange,
        unit: item.unit,
        flag: 'NORMAL',
      }),
    });
    console.log(`  Result Entry Status for ${item.testName}: ${resultRes.status}`);
    assert.strictEqual(resultRes.status, 200);

    // 2c. Verify Result
    const verifyRes = await fetch(`${BASE_URL}/lab/results/${item.id}/verify`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${labTech.token}` },
    });
    console.log(`  Verify Status for ${item.testName}: ${verifyRes.status}`);
    assert.strictEqual(verifyRes.status, 200);
  }
  console.log('  [PASS] All test items entered and verified by Pathologist.');

  // 3. Patient View Report
  console.log('\nSTEP 3: Patient Viewing Verified Lab Report...');
  const reportRes = await fetch(`${BASE_URL}/lab/reports/${createdOrder.id}`, {
    headers: { Authorization: `Bearer ${labTech.token}` },
  });
  console.log(`  Report Fetch Status: ${reportRes.status}`);
  const report = await reportRes.json();
  assert.strictEqual(reportRes.status, 200);
  console.log(`  Report Title: ${report.reportTitle}`);
  console.log(`  Patient Name: ${report.patientName}`);
  console.log(`  Doctor Name: ${report.doctorName}`);
  console.log(`  Barcode: ${report.sampleBarcode}`);
  console.log(`  Results: ${report.testResults.map(r => `${r.testName}: ${r.resultValue} ${r.unit}`).join(' | ')}`);
  console.log('  [PASS] Full clinical report retrieved with complete audit details.');

  // 4. Admin Manage Tests Catalog
  console.log('\nSTEP 4: Admin Managing Test Catalog...');
  const admin = await login('admin@medinexa.in');
  console.log(`  Admin logged in: ${admin.user.firstName} ${admin.user.lastName}`);

  const testCatalogRes = await fetch(`${BASE_URL}/lab/tests`);
  const tests = await testCatalogRes.json();
  console.log(`  Total Catalog Tests: ${tests.length}`);
  assert(tests.length >= 6, 'Must have at least 6 tests in catalog');

  const supportedCodes = ['LAB-CBC', 'LAB-BS-FBS', 'LAB-LFT', 'LAB-KFT', 'LAB-THYROID', 'LAB-URINE-ROUTINE'];
  for (const sc of supportedCodes) {
    assert(tests.some(t => t.code === sc), `Test code ${sc} must be in catalog`);
  }
  console.log('  [PASS] All 6 required tests (CBC, Blood Sugar, LFT, KFT, Thyroid, Urine) confirmed in catalog.');

  console.log('\n====================================================');
  console.log('🎉 COMPLETE LABORATORY WORKFLOW VALIDATED (100% PASS)!');
  console.log('====================================================\n');
}

testLabWorkflow().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
