const API_BASE = 'http://localhost:3001/api/v1';

async function runOpdQueueE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA OPD WALK-IN TOKEN QUEUE E2E TEST');
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
    // 1. Authenticate Hospital Admin A (Facility A)
    const adminARes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenA } = await adminARes.json();
    assert(tokenA, 'Hospital Admin A authenticated successfully');

    // 2. Authenticate Hospital Admin B (Facility B)
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
    const { accessToken: tokenDoc, user: docUser } = await docRes.json();
    assert(tokenDoc, 'Attending Doctor authenticated successfully');

    // 4. Fetch target doctor profile ID
    const doctorsListRes = await fetch(`${API_BASE}/public/doctors`);
    const doctors = await doctorsListRes.json();
    const targetDoctor = doctors[0];
    assert(targetDoctor && targetDoctor.id, `Target doctor profile identified #${targetDoctor.id}`);

    // 5. Test 1: Generate Normal Priority OPD Walk-in Token
    console.log('\n--- Step 1: Generate OPD Walk-in Tokens ---');
    const token1Res = await fetch(`${API_BASE}/opd/tokens`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientName: 'Normal Walk-in Patient',
        patientPhone: '+1-800-555-0101',
        doctorId: targetDoctor.id,
        priority: 'NORMAL',
        notes: 'Routine fever checkup',
      }),
    });
    assert(token1Res.status === 201 || token1Res.status === 200, 'POST /opd/tokens (Normal) returned HTTP 201/200');
    const token1 = await token1Res.json();
    assert(token1.id && token1.tokenNumber && token1.queueNumber > 0, `Normal token #${token1.tokenNumber} created (Queue #${token1.queueNumber})`);

    // 6. Test 2: Generate Urgent Priority OPD Token
    const token2Res = await fetch(`${API_BASE}/opd/tokens`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientName: 'Urgent Senior Citizen Patient',
        patientPhone: '+1-800-555-0102',
        doctorId: targetDoctor.id,
        priority: 'URGENT',
        notes: 'High fever and fatigue',
      }),
    });
    assert(token2Res.status === 201 || token2Res.status === 200, 'POST /opd/tokens (Urgent) returned HTTP 201/200');
    const token2 = await token2Res.json();
    assert(token2.priority === 'URGENT', `Urgent token #${token2.tokenNumber} created successfully`);

    // 7. Test 3: Generate Emergency Priority OPD Token
    const token3Res = await fetch(`${API_BASE}/opd/tokens`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientName: 'Emergency Triage Patient',
        patientPhone: '+1-800-555-0103',
        doctorId: targetDoctor.id,
        priority: 'EMERGENCY',
        notes: 'Acute shortness of breath',
      }),
    });
    assert(token3Res.status === 201 || token3Res.status === 200, 'POST /opd/tokens (Emergency) returned HTTP 201/200');
    const token3 = await token3Res.json();
    assert(token3.priority === 'EMERGENCY', `Emergency token #${token3.tokenNumber} created successfully`);

    // 8. Test 4: Verify Today's Queue Priority Sorting
    console.log('\n--- Step 2: Queue Roster & Priority Sorting ---');
    const queueListRes = await fetch(`${API_BASE}/opd/tokens`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(queueListRes.status === 200, 'GET /opd/tokens returned HTTP 200 OK');
    const todayQueue = await queueListRes.json();
    assert(Array.isArray(todayQueue) && todayQueue.length >= 3, `Today's facility queue returned ${todayQueue.length} tokens`);
    assert(todayQueue[0].priority === 'EMERGENCY', 'Priority Guard: Emergency token is sorted first in queue roster');

    // 9. Test 5: Doctor Queue Workstation Lookup
    console.log('\n--- Step 3: Doctor Workstation Queue Lookup ---');
    const docQueueRes = await fetch(`${API_BASE}/opd/doctors/${targetDoctor.id}/queue`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(docQueueRes.status === 200, `GET /opd/doctors/${targetDoctor.id}/queue returned HTTP 200 OK`);
    const docQueue = await docQueueRes.json();
    assert(Array.isArray(docQueue), 'Doctor workstation queue loaded');

    // 10. Test 6: Doctor Call Token Workflow
    console.log('\n--- Step 4: Doctor Queue Call & Consultation Workflow ---');
    const callRes = await fetch(`${API_BASE}/opd/tokens/${token3.id}/call`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(callRes.status === 200, `PATCH /opd/tokens/${token3.id}/call returned HTTP 200 OK`);
    const calledToken = await callRes.json();
    assert(calledToken.status === 'CALLED' && calledToken.calledAt, 'Token status transitioned to CALLED with timestamp');

    // 11. Test 7: Doctor Start Consultation Workflow
    const startRes = await fetch(`${API_BASE}/opd/tokens/${token3.id}/start`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(startRes.status === 200, `PATCH /opd/tokens/${token3.id}/start returned HTTP 200 OK`);
    const startedToken = await startRes.json();
    assert(startedToken.status === 'IN_PROGRESS' && startedToken.startedAt, 'Token status transitioned to IN_PROGRESS');

    // 12. Test 8: Doctor Complete Consultation Workflow
    const completeRes = await fetch(`${API_BASE}/opd/tokens/${token3.id}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(completeRes.status === 200, `PATCH /opd/tokens/${token3.id}/complete returned HTTP 200 OK`);
    const completedToken = await completeRes.json();
    assert(completedToken.status === 'COMPLETED' && completedToken.completedAt, 'Token status transitioned to COMPLETED');

    // 13. Test 9: Skip Patient Workflow
    console.log('\n--- Step 5: Skip & Cancel Workflows ---');
    const skipRes = await fetch(`${API_BASE}/opd/tokens/${token2.id}/skip`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(skipRes.status === 200, `PATCH /opd/tokens/${token2.id}/skip returned HTTP 200 OK`);
    const skippedToken = await skipRes.json();
    assert(skippedToken.status === 'SKIPPED', 'Token status transitioned to SKIPPED');

    // 14. Test 10: Cancel Token Workflow
    const cancelRes = await fetch(`${API_BASE}/opd/tokens/${token1.id}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(cancelRes.status === 200, `PATCH /opd/tokens/${token1.id}/cancel returned HTTP 200 OK`);
    const cancelledToken = await cancelRes.json();
    assert(cancelledToken.status === 'CANCELLED', 'Token status transitioned to CANCELLED');

    // 15. Test 11: Public Unauthenticated Digital Display Live Board
    console.log('\n--- Step 6: Public Live Digital Display Board ---');
    const liveBoardRes = await fetch(`${API_BASE}/opd/live-board`);
    assert(liveBoardRes.status === 200, 'GET /opd/live-board returned HTTP 200 without authentication');
    const liveBoard = await liveBoardRes.json();
    assert(liveBoard && Array.isArray(liveBoard.nowServing), 'Public live board returned nowServing list');

    // 16. Test 12: OPD Analytics Metrics
    console.log('\n--- Step 7: OPD Queue Analytics Metrics ---');
    const analyticsRes = await fetch(`${API_BASE}/opd/analytics`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(analyticsRes.status === 200, 'GET /opd/analytics returned HTTP 200 OK');
    const analytics = await analyticsRes.json();
    assert(analytics.todayPatients >= 3 && analytics.completedConsultations >= 1, `Analytics returned todayPatients: ${analytics.todayPatients}, completed: ${analytics.completedConsultations}`);

    // 17. Test 13: Multi-Hospital Isolation Security Guard
    console.log('\n--- Step 8: Multi-Hospital Isolation Security Guard ---');
    const isoRes = await fetch(`${API_BASE}/opd/tokens/${token3.id}/call`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(isoRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden');

    console.log('\n==================================================');
    console.log(`📊 OPD QUEUE E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during OPD queue E2E test:', err);
    process.exit(1);
  }
}

runOpdQueueE2ETest();
