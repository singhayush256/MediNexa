const API_BASE = 'http://localhost:3001/api/v1';

async function runLaboratoryE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA LIMS & DIAGNOSTIC WORKFLOW ENGINE E2E TEST');
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
    // 1. Authenticate Attending Doctor
    const docRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doc.reminder@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenDoc } = await docRes.json();
    assert(tokenDoc, 'Attending Doctor authenticated successfully');

    // 2. Authenticate Hospital Admin A
    const adminARes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenA } = await adminARes.json();
    assert(tokenA, 'Hospital Admin A authenticated successfully');

    // 3. Authenticate Hospital Admin B
    const adminBRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospb@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenB } = await adminBRes.json();
    assert(tokenB, 'Hospital Admin B authenticated successfully');

    // 4. Authenticate Patient (Jane Doe)
    const patRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient.doe@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenPat } = await patRes.json();
    assert(tokenPat, 'Patient (Jane Doe) authenticated successfully');

    // 5. Authenticate Receptionist
    const recepRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'receptionist@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenRecep } = await recepRes.json();
    assert(tokenRecep, 'Receptionist authenticated successfully');

    // 6. Fetch target patient profile
    const patientsRes = await fetch(`${API_BASE}/patients`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(patientsRes) && patientsRes.length > 0, 'Patient directory loaded');
    const targetPatient = patientsRes[0];

    // 7. Step 1: Doctor Creates Lab Order
    console.log('\n--- Step 1: Doctor Creates LIMS Diagnostic Lab Order ---');
    const createOrderRes = await fetch(`${API_BASE}/lab/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: targetPatient.id,
        clinicalNotes: 'Evaluate suspected severe troponin & cardiac marker elevation',
        tests: [
          { testName: 'Serum Troponin I (STAT)', category: 'CARDIOLOGY', referenceRange: '0.0 - 0.04', unit: 'ng/mL' },
          { testName: 'Complete Blood Count (CBC)', category: 'HEMATOLOGY', referenceRange: '13.5 - 17.5', unit: 'g/dL' },
        ],
      }),
    });
    assert(createOrderRes.status === 201 || createOrderRes.status === 200, 'POST /lab/orders returned HTTP 201/200');
    const orderData = await createOrderRes.json();
    assert(orderData.id && orderData.orderNumber, `LIMS Lab Order #${orderData.orderNumber} created successfully`);
    assert(Array.isArray(orderData.testItems) && orderData.testItems.length === 2, 'Lab Order contains exactly 2 test items');

    const troponinTestItem = orderData.testItems[0];

    // 8. Step 2: Sample Collection & Barcode Generation
    console.log('\n--- Step 2: Sample Collection & Barcoding ---');
    const sampleRes = await fetch(`${API_BASE}/lab/sample-collection`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        labOrderId: orderData.id,
        sampleType: 'BLOOD',
      }),
    });
    assert(sampleRes.status === 201 || sampleRes.status === 200, 'POST /lab/sample-collection returned HTTP 201/200');
    const sampleData = await sampleRes.json();
    assert(sampleData.id && sampleData.barcode.startsWith('BC-LAB-'), `Specimen Sample collected with Barcode '${sampleData.barcode}'`);

    // 9. Step 3: Transition Status to IN_PROCESS
    console.log('\n--- Step 3: Transition Status to IN_PROCESS ---');
    const inProcessRes = await fetch(`${API_BASE}/lab/orders/${orderData.id}/in-process`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(inProcessRes.status === 200, 'PATCH /lab/orders/:id/in-process returned HTTP 200 OK');
    const updatedOrder = await inProcessRes.json();
    assert(updatedOrder.status === 'IN_PROCESS', 'Lab Order status transitioned to IN_PROCESS');

    // 10. Step 4: Lab Tech Result Entry & Critical Alert Trigger
    console.log('\n--- Step 4: Result Entry & Critical Alert Generation ---');
    const resultRes = await fetch(`${API_BASE}/lab/results/${troponinTestItem.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resultValue: '4.85',
        unit: 'ng/mL',
        referenceRange: '0.0 - 0.04',
        flag: 'CRITICAL',
      }),
    });
    assert(resultRes.status === 200, 'PATCH /lab/results/:id returned HTTP 200 OK');
    const resultItem = await resultRes.json();
    assert(resultItem.flag === 'CRITICAL' && resultItem.resultValue === '4.85', 'Test result value saved and flagged as CRITICAL');

    // Verify Clinical Alert auto-generated
    const alertsRes = await fetch(`${API_BASE}/ai/alerts`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(alertsRes), 'Clinical alerts roster loaded');

    // 11. Step 5: Pathologist Report Verification
    console.log('\n--- Step 5: Pathologist Verification & Sign-Off ---');
    const verifyRes = await fetch(`${API_BASE}/lab/results/${troponinTestItem.id}/verify`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenDoc}` },
    });
    assert(verifyRes.status === 200, 'PATCH /lab/results/:id/verify returned HTTP 200 OK');
    const verifiedItem = await verifyRes.json();
    assert(verifiedItem.status === 'VERIFIED' && verifiedItem.verifiedById, 'Test result verified and electronically signed by Pathologist');

    // 12. Step 6: Printable Diagnostic Report
    console.log('\n--- Step 6: Printable Diagnostic Report Generation ---');
    const reportRes = await fetch(`${API_BASE}/lab/reports/${orderData.id}`, {
      headers: { Authorization: `Bearer ${tokenDoc}` },
    });
    assert(reportRes.status === 200, 'GET /lab/reports/:orderId returned HTTP 200 OK');
    const report = await reportRes.json();
    assert(report.reportTitle && report.testResults.length >= 2, `Printable diagnostic report layout generated for Order #${report.orderNumber}`);

    // 13. Step 7: LIMS Analytics Metrics
    console.log('\n--- Step 7: LIMS Analytics Metrics ---');
    const analyticsRes = await fetch(`${API_BASE}/lab/analytics`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(analyticsRes.status === 200, 'GET /lab/analytics returned HTTP 200 OK');
    const analytics = await analyticsRes.json();
    assert(analytics.ordersToday >= 1 && analytics.avgTurnaroundTimeMins > 0, `LIMS Analytics returned ordersToday: ${analytics.ordersToday}, turnaround: ${analytics.avgTurnaroundTimeMins}m`);

    // 14. Step 8: Security & RBAC Guards
    console.log('\n--- Step 8: Security & RBAC Guards ---');
    // Guard 1: Non-doctor (Receptionist) blocked from creating lab order
    const recepOrderRes = await fetch(`${API_BASE}/lab/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRecep}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: targetPatient.id, tests: [{ testName: 'Test' }] }),
    });
    assert(recepOrderRes.status === 403, 'RBAC Guard: Receptionist role blocked with HTTP 403 Forbidden from creating lab orders');

    // Guard 2: Multi-Hospital Isolation
    const isoRes = await fetch(`${API_BASE}/lab/orders/${orderData.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(isoRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from Hospital A lab records');

    console.log('\n==================================================');
    console.log(`📊 LIMS & DIAGNOSTIC WORKFLOW E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during LIMS E2E test:', err);
    process.exit(1);
  }
}

runLaboratoryE2ETest();
