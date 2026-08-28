const API_BASE = 'http://localhost:3001/api/v1';

async function runTelemedicineE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA TELEMEDICINE & VIRTUAL CONSULTATION E2E TEST');
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
    const { accessToken: tokenDoc, user: docUser } = await docRes.json();
    assert(tokenDoc, 'Attending Doctor authenticated successfully');

    // 4. Authenticate Patient 1 (Jane Doe)
    const pat1Res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient.doe@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenPat1 } = await pat1Res.json();
    assert(tokenPat1, 'Patient 1 (Jane Doe) authenticated successfully');

    // 5. Authenticate Patient 2 (John Doe)
    const pat2Res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient.john@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenPat2 } = await pat2Res.json();
    assert(tokenPat2, 'Patient 2 (John Doe) authenticated successfully');

    // 6. Fetch profiles to link session
    const doctorProfileRes = await fetch(`${API_BASE}/doctors`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    const targetDoctor = doctorProfileRes[0];

    const patientsRes = await fetch(`${API_BASE}/patients`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    const targetPatient = patientsRes[0];

    // 7. Step 1: Create Telemedicine Session
    console.log('\n--- Step 1: Telemedicine Session Creation ---');
    const createSessionRes = await fetch(`${API_BASE}/telemedicine/session`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: targetPatient.id,
        doctorId: targetDoctor.id,
        scheduledStartTime: new Date().toISOString(),
        notes: 'Cardiology online follow-up virtual consultation',
      }),
    });
    assert(createSessionRes.status === 201 || createSessionRes.status === 200, 'POST /telemedicine/session returned HTTP 201/200');
    const session = await createSessionRes.json();
    assert(session.id && session.roomName.startsWith('telemed-room-'), `Telemedicine session #${session.id} created (Room: ${session.roomName})`);
    assert(session.status === 'SCHEDULED', 'Initial session status is SCHEDULED');

    // 8. Step 2: Fetch Telemedicine Session Details
    const getSessionRes = await fetch(`${API_BASE}/telemedicine/session/${session.id}`, {
      headers: { Authorization: `Bearer ${tokenPat1}` },
    });
    assert(getSessionRes.status === 200, `GET /telemedicine/session/${session.id} returned HTTP 200 OK`);

    // 9. Step 3: Patient Joins Room (Waiting Room State)
    console.log('\n--- Step 2: Room Join & Waiting Room State ---');
    const joinPatRes = await fetch(`${API_BASE}/telemedicine/session/${session.id}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenPat1}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceInfo: 'Chrome Mac Desktop WebRTC Client' }),
    });
    assert(joinPatRes.status === 201 || joinPatRes.status === 200, 'POST /telemedicine/session/:id/join (Patient) returned HTTP 201/200');
    const joinPatData = await joinPatRes.json();
    assert(joinPatData.status === 'WAITING', 'Session status updated to WAITING upon patient join');

    // 10. Step 4: Doctor Starts Live Consultation
    console.log('\n--- Step 3: Live Video Consultation State ---');
    const startSessionRes = await fetch(`${API_BASE}/telemedicine/session/${session.id}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}` },
    });
    assert(startSessionRes.status === 200 || startSessionRes.status === 201, 'POST /telemedicine/session/:id/start returned HTTP 200 OK');
    const liveSession = await startSessionRes.json();
    assert(liveSession.status === 'LIVE' && liveSession.actualStartTime, 'Session status updated to LIVE with actualStartTime');

    // 11. Step 5: Real-time In-Call Chat Messaging
    console.log('\n--- Step 4: In-Session Chat & Doctor Workstation ---');
    const chatMsg1Res = await fetch(`${API_BASE}/telemedicine/chat`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenPat1}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id, message: 'Hello Doctor, I am experiencing mild chest discomfort.' }),
    });
    assert(chatMsg1Res.status === 201 || chatMsg1Res.status === 200, 'Patient chat message logged');

    const chatMsg2Res = await fetch(`${API_BASE}/telemedicine/chat`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id, message: 'Hello Jane, let us review your latest ECG reading now.' }),
    });
    assert(chatMsg2Res.status === 201 || chatMsg2Res.status === 200, 'Doctor chat message logged');

    const chatListRes = await fetch(`${API_BASE}/telemedicine/chat/${session.id}`, {
      headers: { Authorization: `Bearer ${tokenPat1}` },
    });
    assert(chatListRes.status === 200, `GET /telemedicine/chat/${session.id} returned HTTP 200 OK`);
    const chatList = await chatListRes.json();
    assert(Array.isArray(chatList) && chatList.length >= 2, `Session chat messages loaded (${chatList.length} messages)`);

    // 12. Step 6: In-Session Doctor Actions (Prescription & Lab Order)
    const inCallRxRes = await fetch(`${API_BASE}/prescriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: targetPatient.id,
        doctorId: targetDoctor.id,
        facilityId: targetDoctor.facilityId,
        medications: [{ medicationName: 'Aspirin 75mg', dosage: '75mg', frequency: 'OD', duration: '30 days' }],
      }),
    });
    assert(inCallRxRes.status === 201 || inCallRxRes.status === 200, 'In-session E-Prescription issued to patient successfully');

    // 13. Step 7: Doctor Ends Consultation (Completed State + Duration)
    console.log('\n--- Step 5: Session Completion & Duration Calculation ---');
    const endSessionRes = await fetch(`${API_BASE}/telemedicine/session/${session.id}/end`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: 'Patient advised to continue Aspirin and schedule follow-up in 14 days.' }),
    });
    assert(endSessionRes.status === 200 || endSessionRes.status === 201, 'POST /telemedicine/session/:id/end returned HTTP 200 OK');
    const completedSession = await endSessionRes.json();
    assert(completedSession.status === 'COMPLETED' && completedSession.durationMinutes >= 1, 'Session marked COMPLETED with calculated durationMinutes');

    // 14. Step 8: Telemedicine List & Analytics
    console.log('\n--- Step 6: Telemedicine Roster & Analytics ---');
    const mySessionsRes = await fetch(`${API_BASE}/telemedicine/my-sessions`, {
      headers: { Authorization: `Bearer ${tokenDoc}` },
    });
    assert(mySessionsRes.status === 200, 'GET /telemedicine/my-sessions returned HTTP 200 OK');
    const mySessions = await mySessionsRes.json();
    assert(Array.isArray(mySessions) && mySessions.length > 0, `User telemedicine roster returned ${mySessions.length} sessions`);

    const analyticsRes = await fetch(`${API_BASE}/telemedicine/analytics`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(analyticsRes.status === 200, 'GET /telemedicine/analytics returned HTTP 200 OK');
    const analytics = await analyticsRes.json();
    assert(analytics.completedSessions >= 1, `Analytics returned completedSessions: ${analytics.completedSessions}`);

    // 15. Step 9: Security Guards
    console.log('\n--- Step 7: Telemedicine Security & Isolation Guards ---');
    // Guard 1: Unauthorized patient blocked from joining another patient's session
    const unauthPatJoinRes = await fetch(`${API_BASE}/telemedicine/session/${session.id}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenPat2}` },
    });
    assert(unauthPatJoinRes.status === 403, 'Security Guard: Unauthorized Patient 2 blocked with HTTP 403 from joining Patient 1 session');

    // Guard 2: Multi-Hospital Isolation
    const isoRes = await fetch(`${API_BASE}/telemedicine/session/${session.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(isoRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from Hospital A telemedicine session');

    // Guard 3: Re-joining completed session rejected
    const joinCompletedRes = await fetch(`${API_BASE}/telemedicine/session/${session.id}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenPat1}` },
    });
    assert(joinCompletedRes.status === 400, 'Security Guard: Joining COMPLETED session rejected with HTTP 400 Bad Request');

    console.log('\n==================================================');
    console.log(`📊 TELEMEDICINE E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during Telemedicine E2E test:', err);
    process.exit(1);
  }
}

runTelemedicineE2ETest();
