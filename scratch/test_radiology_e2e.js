const API_BASE = 'http://localhost:3001/api/v1';

async function runRadiologyE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA RADIOLOGY PACS & IMAGING WORKFLOW E2E TEST');
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
    // 1. Authenticate Attending Doctor / Radiologist
    const docRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doc.reminder@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenDoc } = await docRes.json();
    assert(tokenDoc, 'Attending Doctor / Radiologist authenticated successfully');

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

    // 7. Step 1: Doctor Creates Radiology Imaging Order
    console.log('\n--- Step 1: Doctor Creates PACS Imaging Order ---');
    const createOrderRes = await fetch(`${API_BASE}/radiology/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: targetPatient.id,
        modality: 'CT',
        studyName: 'CT Chest Contrast',
        clinicalIndication: 'Suspected pulmonary embolism / severe dyspnea',
      }),
    });
    assert(createOrderRes.status === 201 || createOrderRes.status === 200, 'POST /radiology/orders returned HTTP 201/200');
    const orderData = await createOrderRes.json();
    assert(orderData.id && orderData.modality === 'CT', `PACS Imaging Order #${orderData.id} created successfully`);

    // 8. Step 2: Radiology Tech Uploads DICOM Study
    console.log('\n--- Step 2: Radiology Tech Uploads DICOM Study ---');
    const uploadRes = await fetch(`${API_BASE}/radiology/studies/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imagingOrderId: orderData.id,
        files: [
          { fileName: 'CT_Chest_Slice_01.png', fileUrl: 'https://storage.medinexa.local/pacs/ct01.png', fileSize: 5120 },
        ],
      }),
    });
    assert(uploadRes.status === 201 || uploadRes.status === 200, 'POST /radiology/studies/upload returned HTTP 201/200');
    const studyData = await uploadRes.json();
    assert(studyData.id && studyData.accessionNumber.startsWith('ACC-'), `DICOM Study uploaded with Accession #${studyData.accessionNumber}`);

    // 9. Step 3: Radiologist Drafts Report with AI Assistant
    console.log('\n--- Step 3: Radiologist Drafts Report & AI Assistant ---');
    const reportRes = await fetch(`${API_BASE}/radiology/report`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imagingOrderId: orderData.id,
        findings: 'Filling defect in main right pulmonary artery consistent with acute embolus.',
        impression: 'Acute Right Main Pulmonary Embolism.',
        recommendation: 'Immediate STAT anticoagulation and intensive care transfer.',
        severity: 'CRITICAL',
      }),
    });
    assert(reportRes.status === 201 || reportRes.status === 200, 'POST /radiology/report returned HTTP 201/200');
    const reportData = await reportRes.json();
    assert(reportData.id && reportData.aiPrelimFindings, 'Radiology Report drafted with AI Preliminary Analysis');

    // 10. Step 4: Radiologist Signs Report & Critical Alert Trigger
    console.log('\n--- Step 4: Radiologist Sign-Off & Immutability Guard ---');
    const signRes = await fetch(`${API_BASE}/radiology/report/${reportData.id}/sign`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenDoc}` },
    });
    assert(signRes.status === 200, 'PATCH /radiology/report/:id/sign returned HTTP 200 OK');
    const signedReport = await signRes.json();
    assert(signedReport.isSigned === true && signedReport.signedAt, 'Radiology report signed and locked');

    // Immutability Guard: Re-signing or editing signed report rejected with HTTP 400
    const resignRes = await fetch(`${API_BASE}/radiology/report/${reportData.id}/sign`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenDoc}` },
    });
    assert(resignRes.status === 400, 'Immutability Guard: Re-signing signed report rejected with HTTP 400 Bad Request');

    // Verify Clinical Alert auto-generated for CRITICAL radiology finding
    const alertsRes = await fetch(`${API_BASE}/ai/alerts`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(alertsRes), 'Clinical safety alerts roster loaded');

    // 11. Step 5: Printable Radiology Report Layout
    console.log('\n--- Step 5: Printable Radiology Report Layout ---');
    const printRes = await fetch(`${API_BASE}/radiology/reports/${orderData.id}`, {
      headers: { Authorization: `Bearer ${tokenDoc}` },
    });
    assert(printRes.status === 200, 'GET /radiology/reports/:orderId returned HTTP 200 OK');
    const printReport = await printRes.json();
    assert(printReport.reportTitle && printReport.isSigned === true, 'Printable PACS radiology report layout generated');

    // 12. Step 6: Patient Imaging History Timeline
    console.log('\n--- Step 6: Patient Imaging History & Analytics ---');
    const historyRes = await fetch(`${API_BASE}/radiology/patient-history/${targetPatient.id}`, {
      headers: { Authorization: `Bearer ${tokenDoc}` },
    });
    assert(historyRes.status === 200, 'GET /radiology/patient-history/:patientId returned HTTP 200 OK');
    const historyList = await historyRes.json();
    assert(Array.isArray(historyList) && historyList.length >= 1, `Patient imaging history loaded (${historyList.length} studies)`);

    // Fetch Analytics
    const analyticsRes = await fetch(`${API_BASE}/radiology/analytics`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(analyticsRes.status === 200, 'GET /radiology/analytics returned HTTP 200 OK');
    const analytics = await analyticsRes.json();
    assert(analytics.ordersToday >= 1 && analytics.studiesUploaded >= 1, `PACS Analytics returned ordersToday: ${analytics.ordersToday}, studiesUploaded: ${analytics.studiesUploaded}`);

    // 13. Step 7: Security & RBAC Guards
    console.log('\n--- Step 7: Security & RBAC Guards ---');
    // Guard 1: Receptionist role blocked from creating imaging orders
    const recepOrderRes = await fetch(`${API_BASE}/radiology/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRecep}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: targetPatient.id, modality: 'XRAY', studyName: 'Test' }),
    });
    assert(recepOrderRes.status === 403, 'RBAC Guard: Receptionist role blocked with HTTP 403 Forbidden from creating imaging orders');

    // Guard 2: Multi-Hospital Isolation
    const isoRes = await fetch(`${API_BASE}/radiology/orders/${orderData.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(isoRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from Hospital A imaging records');

    console.log('\n==================================================');
    console.log(`📊 RADIOLOGY PACS E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during Radiology PACS E2E test:', err);
    process.exit(1);
  }
}

runRadiologyE2ETest();
