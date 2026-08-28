const API_BASE = 'http://localhost:3001/api/v1';

async function runEmergencyTriageE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA EMERGENCY & TRIAGE (ESI 1–5) E2E TEST');
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

    // 3. Authenticate Nurse
    const nurseRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nurse.joy@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenNurse } = await nurseRes.json();
    assert(tokenNurse, 'Emergency Nurse authenticated successfully');

    // 4. Authenticate Doctor
    const docRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doc.reminder@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenDoc } = await docRes.json();
    assert(tokenDoc, 'Emergency Doctor authenticated successfully');

    // 5. Step 1: Register Emergency Intake Visits
    console.log('\n--- Step 1: Register Emergency Intake Visits ---');
    const visit1Res = await fetch(`${API_BASE}/emergency/visit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: 'Patient One (Standard Abdominal Pain)',
        chiefComplaint: 'Mild abdominal pain for 2 days',
        arrivalMode: 'WALK_IN',
      }),
    });
    assert(visit1Res.status === 201 || visit1Res.status === 200, 'POST /emergency/visit (1) returned HTTP 201/200');
    const visit1 = await visit1Res.json();
    assert(visit1.id && visit1.visitNumber, `Emergency Visit #${visit1.visitNumber} created`);

    const visit2Res = await fetch(`${API_BASE}/emergency/visit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: 'Patient Two (Cardiac Arrest Trauma)',
        chiefComplaint: 'Unresponsive cardiac arrest',
        arrivalMode: 'AMBULANCE',
      }),
    });
    assert(visit2Res.status === 201 || visit2Res.status === 200, 'POST /emergency/visit (2) returned HTTP 201/200');
    const visit2 = await visit2Res.json();
    assert(visit2.id && visit2.visitNumber, `Emergency Visit #${visit2.visitNumber} created`);

    const visit3Res = await fetch(`${API_BASE}/emergency/visit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: 'Patient Three (Acute Respiratory Distress)',
        chiefComplaint: 'Severe shortness of breath & SpO2 drop',
        arrivalMode: 'REFERRAL',
      }),
    });
    assert(visit3Res.status === 201 || visit3Res.status === 200, 'POST /emergency/visit (3) returned HTTP 201/200');
    const visit3 = await visit3Res.json();
    assert(visit3.id && visit3.visitNumber, `Emergency Visit #${visit3.visitNumber} created`);

    // 6. Step 2: Nurse Triage Assessment & Vitals Persistence
    console.log('\n--- Step 2: Nurse Triage Vitals & ESI Assignment ---');
    const triage1Res = await fetch(`${API_BASE}/emergency/triage`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenNurse}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emergencyVisitId: visit1.id,
        triageLevel: 'ESI_3',
        temperature: 98.6,
        pulse: 78,
        systolicBP: 120,
        diastolicBP: 80,
        painScore: 4,
      }),
    });
    assert(triage1Res.status === 201 || triage1Res.status === 200, 'POST /emergency/triage (Visit 1 -> ESI_3) returned HTTP 201/200');
    const triaged1 = await triage1Res.json();
    assert(triaged1.triageLevel === 'ESI_3', 'Visit 1 assigned ESI_3');

    const triage2Res = await fetch(`${API_BASE}/emergency/triage`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenNurse}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emergencyVisitId: visit2.id,
        triageLevel: 'ESI_1',
        temperature: 97.2,
        pulse: 140,
        systolicBP: 80,
        diastolicBP: 50,
        oxygenSaturation: 82,
        painScore: 10,
      }),
    });
    assert(triage2Res.status === 201 || triage2Res.status === 200, 'POST /emergency/triage (Visit 2 -> ESI_1 Resuscitation) returned HTTP 201/200');
    const triaged2 = await triage2Res.json();
    assert(triaged2.triageLevel === 'ESI_1', 'Visit 2 assigned ESI_1');

    const triage3Res = await fetch(`${API_BASE}/emergency/triage`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenNurse}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emergencyVisitId: visit3.id,
        triageLevel: 'ESI_2',
        temperature: 99.1,
        pulse: 110,
        systolicBP: 100,
        diastolicBP: 65,
        oxygenSaturation: 88,
        painScore: 8,
      }),
    });
    assert(triage3Res.status === 201 || triage3Res.status === 200, 'POST /emergency/triage (Visit 3 -> ESI_2 Emergent) returned HTTP 201/200');
    const triaged3 = await triage3Res.json();
    assert(triaged3.triageLevel === 'ESI_2', 'Visit 3 assigned ESI_2');

    // 7. Step 3: Emergency Queue Priority Sorting Verification
    console.log('\n--- Step 3: Emergency Queue ESI Prioritization ---');
    const queueRes = await fetch(`${API_BASE}/emergency/queue`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(queueRes.status === 200, 'GET /emergency/queue returned HTTP 200 OK');
    const queue = await queueRes.json();
    assert(Array.isArray(queue) && queue.length >= 3, `Queue returned ${queue.length} active emergency patients`);
    assert(queue[0].triageLevel === 'ESI_1', 'Critical Guard: Top-ranked patient in queue is ESI_1 (Resuscitation)');
    assert(queue[1].triageLevel === 'ESI_2', 'Critical Guard: Second-ranked patient in queue is ESI_2 (Emergent)');

    // 8. Step 4: Doctor Treatment & Status Workflows
    console.log('\n--- Step 4: Doctor Treatment & Status Workflows ---');
    const startRes = await fetch(`${API_BASE}/emergency/${visit2.id}/start-treatment`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenDoc}` },
    });
    assert(startRes.status === 200, `PATCH /emergency/${visit2.id}/start-treatment returned HTTP 200 OK`);
    const started = await startRes.json();
    assert(started.status === 'IN_TREATMENT', 'Visit 2 status updated to IN_TREATMENT');

    const admitRes = await fetch(`${API_BASE}/emergency/${visit2.id}/admit`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenDoc}` },
    });
    assert(admitRes.status === 200, `PATCH /emergency/${visit2.id}/admit returned HTTP 200 OK`);
    const admitted = await admitRes.json();
    assert(admitted.status === 'ADMITTED', 'Visit 2 admitted to IPD');

    const dischargeRes = await fetch(`${API_BASE}/emergency/${visit1.id}/discharge`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenDoc}` },
    });
    assert(dischargeRes.status === 200, `PATCH /emergency/${visit1.id}/discharge returned HTTP 200 OK`);
    const discharged = await dischargeRes.json();
    assert(discharged.status === 'DISCHARGED', 'Visit 1 discharged from ED');

    const transferRes = await fetch(`${API_BASE}/emergency/${visit3.id}/transfer`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenDoc}` },
    });
    assert(transferRes.status === 200, `PATCH /emergency/${visit3.id}/transfer returned HTTP 200 OK`);
    const transferred = await transferRes.json();
    assert(transferred.status === 'TRANSFERRED', 'Visit 3 transferred');

    // 9. Step 5: ED Analytics Metrics
    console.log('\n--- Step 5: ED Analytics Metrics ---');
    const analyticsRes = await fetch(`${API_BASE}/emergency/analytics`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(analyticsRes.status === 200, 'GET /emergency/analytics returned HTTP 200 OK');
    const analytics = await analyticsRes.json();
    assert(analytics.totalEmergencyVisits >= 3, `Total visits count verified: ${analytics.totalEmergencyVisits}`);
    assert(analytics.esi1Count >= 1, `ESI-1 count verified: ${analytics.esi1Count}`);
    assert(analytics.esi2Count >= 1, `ESI-2 count verified: ${analytics.esi2Count}`);

    // 10. Step 6: Multi-Hospital Isolation Security Guard
    console.log('\n--- Step 6: Multi-Hospital Isolation Security Guard ---');
    const isoRes = await fetch(`${API_BASE}/emergency/${visit2.id}/start-treatment`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(isoRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden');

    console.log('\n==================================================');
    console.log(`📊 EMERGENCY & TRIAGE E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during Emergency & Triage E2E test:', err);
    process.exit(1);
  }
}

runEmergencyTriageE2ETest();
