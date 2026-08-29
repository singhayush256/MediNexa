const BASE_URL = process.env.API_URL || 'http://localhost:3001/api/v1';

let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ [PASS] ${passedAssertions + 1}. ${message}`);
    passedAssertions++;
  } else {
    console.error(`❌ [FAIL] ${passedAssertions + failedAssertions + 1}. ${message}`);
    failedAssertions++;
  }
}

async function runRadiologyPacsE2ETests() {
  console.log('==================================================');
  console.log('🩻 MEDINEXA RADIOLOGY INFORMATION SYSTEM (RIS) & PACS E2E TEST');
  console.log('==================================================\n');

  try {
    const login = async (email, password) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      return { token: data.accessToken || data.token, user: data.user };
    };

    // 1. Authenticate Hospital Admin A
    const adminAAuth = await login('admin.hospa@medinexa.local', 'Password123!');
    assert(!!adminAAuth.token, 'Hospital Admin A authenticated successfully');
    const adminAToken = adminAAuth.token;

    // 2. Authenticate Hospital Admin B
    const adminBAuth = await login('admin.hospb@medinexa.local', 'Password123!');
    assert(!!adminBAuth.token, 'Hospital Admin B authenticated successfully');
    const adminBToken = adminBAuth.token;

    // 3. Authenticate Doctor
    const docAuth = await login('doc.reminder@medinexa.local', 'Password123!');
    assert(!!docAuth.token, 'Attending Doctor authenticated successfully');
    const docToken = docAuth.token;

    // 4. Authenticate Patient
    const patientAuth = await login('patient.doe@medinexa.local', 'Password123!');
    assert(!!patientAuth.token, 'Patient authenticated successfully');
    const patientToken = patientAuth.token;

    // 5. Resolve target patient
    const patientMeRes = await fetch(`${BASE_URL}/patients/me`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const targetPatient = await patientMeRes.json();
    assert(!!targetPatient?.id, `Target Patient identified (${targetPatient?.user?.firstName || 'Jane'} ${targetPatient?.user?.lastName || 'Doe'})`);
    const patientId = targetPatient.id;

    console.log('\n--- Step 1: Strict RBAC Security Guards ---');
    // 6. Patient blocked from placing radiology orders
    const patientOrderRes = await fetch(`${BASE_URL}/radiology/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({ patientId, modality: 'CT', studyName: 'Unauthorized Order' }),
    });
    assert(patientOrderRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from creating radiology orders');

    // 7. Patient blocked from uploading PACS studies
    const patientStudyRes = await fetch(`${BASE_URL}/radiology/studies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({ modality: 'XRAY', imageCount: 1 }),
    });
    assert(patientStudyRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from archiving PACS studies');

    // 8. Patient blocked from authoring diagnostic reports
    const patientReportRes = await fetch(`${BASE_URL}/radiology/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({ findings: 'Unauthorized', impression: 'Unauthorized' }),
    });
    assert(patientReportRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from authoring radiology reports');

    console.log('\n--- Step 2: Radiology Order Lifecycle (Order -> Schedule -> In Progress) ---');
    // 9. Place STAT CT Pulmonary Angiography Order
    const createOrderRes = await fetch(`${BASE_URL}/radiology/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docToken}` },
      body: JSON.stringify({
        patientId,
        modality: 'CT',
        studyName: 'CT Pulmonary Angiography with IV Contrast',
        clinicalIndication: 'Acute onset pleuritic chest pain, dyspnea, suspected pulmonary embolism',
        priority: 'STAT',
      }),
    });
    const orderData = await createOrderRes.json();
    assert(createOrderRes.status === 201 || createOrderRes.status === 200, 'POST /radiology/orders returned HTTP 201/200');
    assert(orderData.orderNumber && orderData.orderNumber.startsWith('ORD-RAD-'), `Order number generated: ${orderData.orderNumber}`);
    assert(orderData.modality === 'CT', 'Modality recorded as CT');
    assert(orderData.priority === 'STAT', 'Priority recorded as STAT');
    assert(orderData.status === 'ORDERED', 'Initial order status is ORDERED');
    const orderId = orderData.id;

    // 10. List Orders
    const listOrdersRes = await fetch(`${BASE_URL}/radiology/orders`, {
      headers: { Authorization: `Bearer ${docToken}` },
    });
    const ordersList = await listOrdersRes.json();
    assert(listOrdersRes.status === 200, 'GET /radiology/orders returned HTTP 200 OK');
    assert(Array.isArray(ordersList) && ordersList.some((o) => o.id === orderId), 'Order present in facility worklist');

    // 11. Schedule Imaging Scan
    const scheduleRes = await fetch(`${BASE_URL}/radiology/orders/${orderId}/schedule`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        scheduledAt: new Date(Date.now() + 30 * 60000).toISOString(),
        notes: 'Priority CT Gantry 2 reserved',
      }),
    });
    const scheduledData = await scheduleRes.json();
    assert(scheduleRes.status === 200, 'PATCH /radiology/orders/:id/schedule returned HTTP 200 OK');
    assert(scheduledData.status === 'SCHEDULED', 'Order status advanced to SCHEDULED');

    // 12. Start Scan Acquisition
    const startRes = await fetch(`${BASE_URL}/radiology/orders/${orderId}/start`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const startedData = await startRes.json();
    assert(startRes.status === 200, 'PATCH /radiology/orders/:id/start returned HTTP 200 OK');
    assert(startedData.status === 'IN_PROGRESS', 'Order status advanced to IN_PROGRESS');

    console.log('\n--- Step 3: PACS DICOM Study Archival & Series Creation ---');
    // 13. Archive DICOM Study to PACS
    const createStudyRes = await fetch(`${BASE_URL}/radiology/studies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        radiologyOrderId: orderId,
        imageCount: 48,
        seriesDescription: 'CT Angio Chest 0.625mm Axial Reconstructions',
      }),
    });
    const studyData = await createStudyRes.json();
    assert(createStudyRes.status === 201 || createStudyRes.status === 200, 'POST /radiology/studies returned HTTP 201/200');
    assert(studyData.accessionNumber && studyData.accessionNumber.startsWith('ACC-'), `PACS Accession generated: ${studyData.accessionNumber}`);
    assert(!!studyData.studyUid, `DICOM Study UID generated: ${studyData.studyUid}`);
    assert(studyData.series && studyData.series.length > 0, 'DicomSeries stack created with thumbnail URL');
    const studyId = studyData.id;

    // 14. Verify Order Status Updated to IMAGE_ACQUIRED
    const orderAfterStudy = await (await fetch(`${BASE_URL}/radiology/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${docToken}` },
    })).json();
    assert(orderAfterStudy.status === 'IMAGE_ACQUIRED', 'Order status automatically updated to IMAGE_ACQUIRED');

    // 15. Fetch PACS Study by ID
    const getStudyRes = await fetch(`${BASE_URL}/radiology/studies/${studyId}`, {
      headers: { Authorization: `Bearer ${docToken}` },
    });
    const fetchedStudy = await getStudyRes.json();
    assert(getStudyRes.status === 200, 'GET /radiology/studies/:id returned HTTP 200 OK');
    assert(fetchedStudy.accessionNumber === studyData.accessionNumber, 'Study accession number matches');

    console.log('\n--- Step 4: Radiologist Diagnostic Reporting & Critical Findings Engine ---');
    // 16. Author Diagnostic Radiology Report with CRITICAL Finding
    const createReportRes = await fetch(`${BASE_URL}/radiology/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docToken}` },
      body: JSON.stringify({
        studyId,
        findings: 'Large saddle embolus identified at bifurcation of main pulmonary trunk with extensive occlusive filling defects in right and left pulmonary arteries.',
        impression: 'Critical Acute Massive Pulmonary Embolism with Right Ventricular Strain (RV/LV ratio > 1.2).',
        recommendation: 'Immediate emergency ICU admission, catheter-directed thrombolysis / embolectomy evaluation.',
        severity: 'CRITICAL',
      }),
    });
    const reportData = await createReportRes.json();
    assert(createReportRes.status === 201 || createReportRes.status === 200, 'POST /radiology/reports returned HTTP 201/200');
    assert(reportData.severity === 'CRITICAL', 'Report severity flagged as CRITICAL');
    assert(reportData.verified === false, 'Initial report verified status is false');
    const reportId = reportData.id;

    // 17. Verify Order Status Advanced to REPORTED
    const orderAfterReport = await (await fetch(`${BASE_URL}/radiology/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${docToken}` },
    })).json();
    assert(orderAfterReport.status === 'REPORTED', 'Order status advanced to REPORTED');

    console.log('\n--- Step 5: Report Verification & Digital Signature ---');
    // 18. Electronically Sign and Verify Diagnostic Report
    const verifyReportRes = await fetch(`${BASE_URL}/radiology/reports/${reportId}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docToken}` },
      body: JSON.stringify({ verificationNotes: 'Peer-reviewed and verified by Senior Radiologist' }),
    });
    const verifiedReport = await verifyReportRes.json();
    assert(verifyReportRes.status === 200, 'PATCH /radiology/reports/:id/verify returned HTTP 200 OK');
    assert(verifiedReport.verified === true, 'Report verified status is true');
    assert(!!verifiedReport.verifiedAt, 'Report verifiedAt timestamp recorded');

    // 19. Verify Order Status Advanced to VERIFIED
    const orderAfterVerify = await (await fetch(`${BASE_URL}/radiology/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${docToken}` },
    })).json();
    assert(orderAfterVerify.status === 'VERIFIED', 'Order status advanced to VERIFIED');

    // 20. Fetch Report Details Dossier
    const getReportRes = await fetch(`${BASE_URL}/radiology/reports/${reportId}`, {
      headers: { Authorization: `Bearer ${docToken}` },
    });
    const reportDossier = await getReportRes.json();
    assert(getReportRes.status === 200, 'GET /radiology/reports/:id returned HTTP 200 OK');
    assert(reportDossier.impression.includes('Pulmonary Embolism'), 'Report dossier contains complete clinical impression');

    console.log('\n--- Step 6: Critical Findings Alert Verification & Acknowledgment ---');
    // 21. Query Critical Alerts Queue
    const alertsRes = await fetch(`${BASE_URL}/radiology/critical-alerts`, {
      headers: { Authorization: `Bearer ${docToken}` },
    });
    const alertsList = await alertsRes.json();
    assert(alertsRes.status === 200, 'GET /radiology/critical-alerts returned HTTP 200 OK');
    assert(Array.isArray(alertsList) && alertsList.length > 0, 'Critical findings alert queue contains active emergency alert');
    const targetAlert = alertsList.find((a) => a.reportId === reportId || a.patientId === patientId);
    assert(!!targetAlert, 'Emergency critical alert generated for Pulmonary Embolism study');
    const alertId = targetAlert.id;

    // 22. Acknowledge Critical Finding Alert
    const ackRes = await fetch(`${BASE_URL}/radiology/critical-alerts/${alertId}/acknowledge`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${docToken}` },
    });
    const ackData = await ackRes.json();
    assert(ackRes.status === 200, 'PATCH /radiology/critical-alerts/:id/acknowledge returned HTTP 200 OK');
    assert(ackData.acknowledged === true, 'Critical alert marked as acknowledged');
    assert(!!ackData.acknowledgedAt, 'Acknowledgment timestamp recorded');

    console.log('\n--- Step 7: Radiology RIS & PACS Analytics Dashboard ---');
    // 23. Query RIS Analytics
    const analyticsRes = await fetch(`${BASE_URL}/radiology/analytics`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const analyticsData = await analyticsRes.json();
    assert(analyticsRes.status === 200, 'GET /radiology/analytics returned HTTP 200 OK');
    assert(analyticsData.totalOrdersToday !== undefined, `Analytics: Total Orders Today: ${analyticsData.totalOrdersToday}`);
    assert(analyticsData.scheduledScans !== undefined, `Analytics: Scheduled Scans: ${analyticsData.scheduledScans}`);
    assert(analyticsData.criticalFindingsCount !== undefined, `Analytics: Critical Findings: ${analyticsData.criticalFindingsCount}`);
    assert(analyticsData.modalityDistribution && analyticsData.modalityDistribution.CT !== undefined, 'Analytics: Modality distribution tracks CT scans');

    console.log('\n--- Step 8: Multi-Hospital Isolation Guard ---');
    // 24. Hospital B Admin blocked from accessing Hospital A radiology order
    const crossOrderRes = await fetch(`${BASE_URL}/radiology/orders/${orderId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminBToken}` },
    });
    assert(crossOrderRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from accessing Hospital A radiology order');

    console.log('\n==================================================');
    console.log(`🩻 RADIOLOGY RIS & PACS E2E RESULT: ${passedAssertions} PASSED, ${failedAssertions} FAILED`);
    console.log('==================================================\n');

    if (failedAssertions > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal execution error during Radiology PACS E2E test:', error);
    process.exit(1);
  }
}

runRadiologyPacsE2ETests();
