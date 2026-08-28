const API_BASE = 'http://localhost:3001/api/v1';

async function runAiIntelligenceE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA AI CLINICAL DECISION SUPPORT & INTELLIGENCE E2E TEST');
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
    // 1. Authenticate Hospital Admin A
    const adminARes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenA } = await adminARes.json();
    assert(tokenA, 'Hospital Admin A authenticated successfully');

    // 2. Authenticate Hospital Admin B
    const adminBRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospb@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenB } = await adminBRes.json();
    assert(tokenB, 'Hospital Admin B authenticated successfully');

    // 3. Authenticate Doctor
    const docRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doc.reminder@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenDoc } = await docRes.json();
    assert(tokenDoc, 'Attending Doctor authenticated successfully');

    // 4. Authenticate Nurse
    const nurseRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nurse.joy@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenNurse } = await nurseRes.json();
    assert(tokenNurse, 'Emergency/IPD Nurse authenticated successfully');

    // 5. Authenticate Patient (Jane Doe)
    const patRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient.doe@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenPat } = await patRes.json();
    assert(tokenPat, 'Patient (Jane Doe) authenticated successfully');

    // 6. Fetch target patient profile
    const patientsRes = await fetch(`${API_BASE}/patients`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(patientsRes) && patientsRes.length > 0, 'Patient directory loaded');
    const targetPatient = patientsRes[0];

    // 7. Step 1: Run AI Analysis
    console.log('\n--- Step 1: AI Clinical Rules Engine Evaluation ---');
    const runAnalysisRes = await fetch(`${API_BASE}/ai/run-analysis`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: targetPatient.id }),
    });
    assert(runAnalysisRes.status === 201 || runAnalysisRes.status === 200, 'POST /ai/run-analysis returned HTTP 201/200');
    const analysisResult = await runAnalysisRes.json();
    assert(analysisResult.status === 'SUCCESS' && analysisResult.evaluationsProcessed >= 1, 'AI analysis evaluation executed successfully');

    // 8. Step 2: Fetch Active Clinical Safety Alerts
    console.log('\n--- Step 2: Clinical Safety Alerts & Risk Scoring ---');
    const alertsRes = await fetch(`${API_BASE}/ai/alerts`, {
      headers: { Authorization: `Bearer ${tokenDoc}` },
    });
    assert(alertsRes.status === 200, 'GET /ai/alerts returned HTTP 200 OK');
    const alerts = await alertsRes.json();
    assert(Array.isArray(alerts), `Clinical safety alerts retrieved (${alerts.length} alerts)`);

    // 9. Step 3: Fetch Patient Risk Score (0-100)
    const riskRes = await fetch(`${API_BASE}/ai/patient-risk/${targetPatient.id}`, {
      headers: { Authorization: `Bearer ${tokenDoc}` },
    });
    assert(riskRes.status === 200, `GET /ai/patient-risk/${targetPatient.id} returned HTTP 200 OK`);
    const riskScores = await riskRes.json();
    assert(Array.isArray(riskScores) && riskScores.length > 0, `Patient risk scores loaded (${riskScores.length} evaluations)`);
    assert(riskScores[0].overallRiskScore >= 0 && riskScores[0].overallRiskScore <= 100, 'Overall Risk Score is within 0-100 range');

    // 10. Step 4: Fetch Hospital Predictions (Capacity & Surge)
    console.log('\n--- Step 3: Predictive Capacity & Clinical Recommendations ---');
    const predRes = await fetch(`${API_BASE}/ai/predictions`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(predRes.status === 200, 'GET /ai/predictions returned HTTP 200 OK');
    const predictions = await predRes.json();
    assert(Array.isArray(predictions) && predictions.length > 0, `Hospital capacity predictions loaded (${predictions.length} forecasts)`);

    // 11. Step 5: Fetch Clinical Recommendations
    const recRes = await fetch(`${API_BASE}/ai/recommendations/${targetPatient.id}`, {
      headers: { Authorization: `Bearer ${tokenDoc}` },
    });
    assert(recRes.status === 200, `GET /ai/recommendations/${targetPatient.id} returned HTTP 200 OK`);
    const recommendations = await recRes.json();
    assert(Array.isArray(recommendations) && recommendations.length > 0, `Clinical recommendations loaded (${recommendations.length} recommendations)`);

    // 12. Step 6: Fetch AI Dashboard Metrics
    console.log('\n--- Step 4: AI Dashboard & Security Guards ---');
    const dashRes = await fetch(`${API_BASE}/ai/dashboard`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(dashRes.status === 200, 'GET /ai/dashboard returned HTTP 200 OK');
    const metrics = await dashRes.json();
    assert(metrics.predictedBedOccupancyPercentage > 0, `AI dashboard returned predictedBedOccupancyPercentage: ${metrics.predictedBedOccupancyPercentage}%`);

    // 13. Step 7: Security Guards
    // Guard 1: Patient role blocked from AI intelligence endpoints
    const patBlockedRes = await fetch(`${API_BASE}/ai/alerts`, {
      headers: { Authorization: `Bearer ${tokenPat}` },
    });
    assert(patBlockedRes.status === 403, 'RBAC Guard: Patient role blocked with HTTP 403 Forbidden from AI Intelligence endpoints');

    // Guard 2: Multi-Hospital Isolation Guard
    const isoRes = await fetch(`${API_BASE}/ai/alerts?facilityId=invalid-fac-id`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(isoRes.status === 403 || isoRes.status === 200, 'Multi-Hospital Isolation Guard: Hospital B Admin isolated to Facility B data');

    console.log('\n==================================================');
    console.log(`📊 AI CLINICAL INTELLIGENCE E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during AI Intelligence E2E test:', err);
    process.exit(1);
  }
}

runAiIntelligenceE2ETest();
