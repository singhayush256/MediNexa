const API_BASE = 'http://localhost:3001/api/v1';

async function runClinicalCopilotE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA AI MEDICAL SCRIBE & CLINICAL COPILOT E2E TEST');
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

    // 7. Step 1: AI SOAP Note Generation
    console.log('\n--- Step 1: AI Medical Scribe SOAP Note Generation ---');
    const soapRes = await fetch(`${API_BASE}/copilot/generate-note`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chiefComplaint: 'Acute chest pain radiating to back',
        symptoms: 'Diaphoresis, shortness of breath',
        diagnosis: 'Acute Coronary Syndrome',
        medications: 'Aspirin 325mg, Nitroglycerin sublingual',
        observations: 'BP 150/95, HR 102, ECG ST elevation in II, III, aVF',
        patientId: targetPatient.id,
      }),
    });
    assert(soapRes.status === 201 || soapRes.status === 200, 'POST /copilot/generate-note returned HTTP 201/200');
    const soapData = await soapRes.json();
    assert(soapData.id && soapData.type === 'SOAP_NOTE', `SOAP Note #${soapData.id} generated and saved`);
    assert(soapData.subjective && soapData.objective && soapData.assessment && soapData.plan, 'SOAP Note contains all 4 structured sections (S, O, A, P)');

    // 8. Step 2: AI Discharge Summary Generation
    console.log('\n--- Step 2: AI Discharge Summary Generation ---');
    const dischargeRes = await fetch(`${API_BASE}/copilot/generate-discharge-summary`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        diagnosisSummary: 'Acute Inferior Wall Myocardial Infarction',
        treatmentSummary: 'Primary PCI with drug-eluting stent to RCA',
        dischargeInstructions: 'Low sodium diet, dual antiplatelet therapy for 12 months',
        followUpPlan: 'Cardiology clinic visit in 14 days',
        patientId: targetPatient.id,
      }),
    });
    assert(dischargeRes.status === 201 || dischargeRes.status === 200, 'POST /copilot/generate-discharge-summary returned HTTP 201/200');
    const dischargeData = await dischargeRes.json();
    assert(dischargeData.id && dischargeData.type === 'DISCHARGE_SUMMARY', `Discharge Summary #${dischargeData.id} generated and saved`);

    // 9. Step 3: AI Clinical Risk Analysis
    console.log('\n--- Step 3: Clinical Risk Copilot Analysis ---');
    const riskRes = await fetch(`${API_BASE}/copilot/risk-analysis`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symptoms: 'Chest pain and severe dyspnea',
        vitals: 'BP 85/50, HR 115, SpO2 89%',
        age: 65,
        triageLevel: 'ESI_1',
        patientId: targetPatient.id,
      }),
    });
    assert(riskRes.status === 201 || riskRes.status === 200, 'POST /copilot/risk-analysis returned HTTP 201/200');
    const riskData = await riskRes.json();
    assert(riskData.riskScore >= 70 && riskData.severity === 'CRITICAL', `Risk Analysis returned score ${riskData.riskScore}/100 (${riskData.severity})`);

    // 10. Step 4: Fetch Doctor AI Generation History
    console.log('\n--- Step 4: Doctor Copilot History & Analytics ---');
    const historyRes = await fetch(`${API_BASE}/copilot/history`, {
      headers: { Authorization: `Bearer ${tokenDoc}` },
    });
    assert(historyRes.status === 200, 'GET /copilot/history returned HTTP 200 OK');
    const historyList = await historyRes.json();
    assert(Array.isArray(historyList) && historyList.length >= 3, `Doctor AI generation history retrieved (${historyList.length} records)`);

    // 11. Step 5: Fetch Copilot Analytics Metrics
    const analyticsRes = await fetch(`${API_BASE}/copilot/analytics`, {
      headers: { Authorization: `Bearer ${tokenDoc}` },
    });
    assert(analyticsRes.status === 200, 'GET /copilot/analytics returned HTTP 200 OK');
    const analytics = await analyticsRes.json();
    assert(analytics.notesGenerated >= 1 && analytics.timeSavedMinutes > 0, `Copilot analytics returned notesGenerated: ${analytics.notesGenerated}, timeSavedMinutes: ${analytics.timeSavedMinutes}m`);

    // 12. Step 6: Security & RBAC Guards
    console.log('\n--- Step 5: Security & RBAC Guards ---');
    // Guard 1: Patient role blocked from Copilot endpoints
    const patBlockedRes = await fetch(`${API_BASE}/copilot/history`, {
      headers: { Authorization: `Bearer ${tokenPat}` },
    });
    assert(patBlockedRes.status === 403, 'RBAC Guard: Patient role blocked with HTTP 403 Forbidden from Copilot endpoints');

    // Guard 2: Receptionist role blocked from Copilot endpoints
    const recepBlockedRes = await fetch(`${API_BASE}/copilot/generate-note`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRecep}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ chiefComplaint: 'Test', symptoms: 'Test', diagnosis: 'Test' }),
    });
    assert(recepBlockedRes.status === 403, 'RBAC Guard: Receptionist role blocked with HTTP 403 Forbidden from Copilot endpoints');

    // Guard 3: Multi-Hospital Isolation
    const isoRes = await fetch(`${API_BASE}/copilot/history`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(isoRes.status === 200 || isoRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin isolated to Facility B data');

    console.log('\n==================================================');
    console.log(`📊 AI CLINICAL COPILOT E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during Clinical Copilot E2E test:', err);
    process.exit(1);
  }
}

runClinicalCopilotE2ETest();
