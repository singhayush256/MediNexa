const API_BASE = 'http://localhost:3001/api/v1';

async function runOtSurgeryE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA OPERATION THEATRE (OT) & SURGERY E2E TEST');
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
    // 1. Authenticate Doctor (Surgeon)
    const docRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doc.reminder@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenDoc, user: docUser } = await docRes.json();
    assert(tokenDoc, 'Attending Doctor (Surgeon) authenticated successfully');

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

    // 4. Authenticate Nurse
    const nurseRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nurse.joy@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenNurse, user: nurseUser } = await nurseRes.json();
    assert(tokenNurse, 'Scrub Nurse authenticated successfully');

    // 5. Authenticate Patient (Jane Doe)
    const patRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient.doe@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenPat } = await patRes.json();
    assert(tokenPat, 'Patient (Jane Doe) authenticated successfully');

    // 6. Authenticate Receptionist
    const recepRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'receptionist@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenRecep } = await recepRes.json();
    assert(tokenRecep, 'Receptionist authenticated successfully');

    // 7. Fetch target patient profile
    const patientsRes = await fetch(`${API_BASE}/patients`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(patientsRes) && patientsRes.length > 0, 'Patient directory loaded');
    const targetPatient = patientsRes[0];

    // 8. Step 1: Create Operation Theatre Suite Room
    console.log('\n--- Step 1: Create Operation Theatre Suite Room ---');
    const createRoomRes = await fetch(`${API_BASE}/ot/rooms`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hybrid Cardiac & Vascular Suite 01',
        code: `OT-CARDIAC-${Date.now().toString().slice(-4)}`,
        equipmentDetails: 'Advanced Fluoroscopy, Cardiopulmonary Bypass Machine, Robotic Surgical Arm',
      }),
    });
    assert(createRoomRes.status === 201 || createRoomRes.status === 200, 'POST /ot/rooms returned HTTP 201/200');
    const roomData = await createRoomRes.json();
    assert(roomData.id && roomData.status === 'AVAILABLE', `OT Room '${roomData.name}' created with code #${roomData.code}`);

    // List OT Rooms
    const listRoomsRes = await fetch(`${API_BASE}/ot/rooms`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(listRoomsRes) && listRoomsRes.length >= 1, 'Operation Theatre rooms roster listed');

    // 9. Step 2: Schedule Surgery (Elective & Emergency STAT)
    console.log('\n--- Step 2: Surgery Scheduling & Emergency Prioritization ---');
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    const endTime = new Date(now.getTime() + 180 * 60 * 1000).toISOString();

    const scheduleRes = await fetch(`${API_BASE}/ot/surgeries`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        otId: roomData.id,
        patientId: targetPatient.id,
        leadSurgeonId: docUser.id,
        anesthetistId: docUser.id,
        procedureName: 'Coronary Artery Bypass Graft (CABG)',
        priority: 'EMERGENCY',
        scheduledStartTime: startTime,
        scheduledEndTime: endTime,
        notes: 'STAT Emergency bypass required for multi-vessel CAD',
        teamMembers: [
          { userId: nurseUser.id, role: 'SCRUB_NURSE' },
        ],
      }),
    });
    assert(scheduleRes.status === 201 || scheduleRes.status === 200, 'POST /ot/surgeries returned HTTP 201/200');
    const surgeryData = await scheduleRes.json();
    assert(surgeryData.id && surgeryData.priority === 'EMERGENCY', `STAT Emergency Surgery #${surgeryData.id} scheduled`);

    // List Surgeries Queue
    const listSurgeriesRes = await fetch(`${API_BASE}/ot/surgeries`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(listSurgeriesRes) && listSurgeriesRes.length >= 1, 'Surgery schedule queue listed');

    // 10. Step 3: Transition Surgery Status to IN_PROGRESS
    console.log('\n--- Step 3: Live OT Transition & Room Allocation ---');
    const startSurgeryRes = await fetch(`${API_BASE}/ot/surgeries/${surgeryData.id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'IN_PROGRESS' }),
    });
    assert(startSurgeryRes.status === 200, 'PATCH /ot/surgeries/:id/status (IN_PROGRESS) returned HTTP 200 OK');
    const startedSurgery = await startSurgeryRes.json();
    assert(startedSurgery.actualStartTime && startedSurgery.ot.status === 'OCCUPIED', 'OT Suite status updated to OCCUPIED upon surgery start');

    // 11. Step 4: Record WHO Surgical Safety Checklist
    console.log('\n--- Step 4: WHO Surgical Safety Checklist Compliance ---');
    const checklistRes = await fetch(`${API_BASE}/ot/checklist`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenNurse}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        surgeryId: surgeryData.id,
        signInCompleted: true,
        timeOutCompleted: true,
        signOutCompleted: true,
      }),
    });
    assert(checklistRes.status === 201 || checklistRes.status === 200, 'POST /ot/checklist returned HTTP 201/200');
    const checklistData = await checklistRes.json();
    assert(checklistData.id && checklistData.timeOutCompleted === true, 'WHO Surgical Safety Checklist verified & logged');

    // Fetch Checklist
    const getChecklistRes = await fetch(`${API_BASE}/ot/checklist/${surgeryData.id}`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(getChecklistRes) && getChecklistRes.length >= 1, 'Surgical checklist history retrieved');

    // 12. Step 5: Record Anesthesia Assessment & Intra-op Vitals
    console.log('\n--- Step 5: Anesthesia Record & Intra-Op Vitals ---');
    const anesthesiaRes = await fetch(`${API_BASE}/ot/anesthesia`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        surgeryId: surgeryData.id,
        anesthesiaType: 'GENERAL',
        preOpAssessment: 'ASA Class III, Airway Mallampati Class II',
        intraOpVitals: 'BP: 120/80 mmHg, HR: 72 bpm, SpO2: 99% on Mechanical Vent',
        complications: 'None',
      }),
    });
    assert(anesthesiaRes.status === 201 || anesthesiaRes.status === 200, 'POST /ot/anesthesia returned HTTP 201/200');
    const anesthesiaData = await anesthesiaRes.json();
    assert(anesthesiaData.id && anesthesiaData.anesthesiaType === 'GENERAL', 'Anesthesia record logged');

    // Fetch Anesthesia Records
    const getAnesthesiaRes = await fetch(`${API_BASE}/ot/anesthesia/${surgeryData.id}`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(getAnesthesiaRes) && getAnesthesiaRes.length >= 1, 'Anesthesia records list retrieved');

    // 13. Step 6: Record Implant Usage Tracking
    console.log('\n--- Step 6: Implant & Prosthetics Tracking ---');
    const implantRes = await fetch(`${API_BASE}/ot/implants`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        surgeryId: surgeryData.id,
        implantName: 'Drug-Eluting Cardiac Graft Stent (Resolute Onyx)',
        serialNumber: `SN-GRAFT-${Date.now()}`,
        manufacturer: 'Medtronic Surgical',
        quantity: 1,
        cost: 3500.0,
      }),
    });
    assert(implantRes.status === 201 || implantRes.status === 200, 'POST /ot/implants returned HTTP 201/200');
    const implantData = await implantRes.json();
    assert(implantData.id && implantData.serialNumber.startsWith('SN-GRAFT-'), 'Surgical implant serial number tracked');

    // Fetch Implants
    const getImplantsRes = await fetch(`${API_BASE}/ot/implants/${surgeryData.id}`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(getImplantsRes) && getImplantsRes.length >= 1, 'Surgical implants list retrieved');

    // 14. Step 7: Record PACU Post-Operative Notes
    console.log('\n--- Step 7: PACU Recovery & Post-Op Care Notes ---');
    const postOpRes = await fetch(`${API_BASE}/ot/post-op`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        surgeryId: surgeryData.id,
        pacuStatus: 'STABLE',
        recoveryInstructions: 'Transfer to Cardiac ICU. Continuous arterial line monitoring q15m for 4 hours.',
      }),
    });
    assert(postOpRes.status === 201 || postOpRes.status === 200, 'POST /ot/post-op returned HTTP 201/200');
    const postOpData = await postOpRes.json();
    assert(postOpData.id && postOpData.pacuStatus === 'STABLE', 'PACU recovery status & post-op notes saved');

    // Complete Surgery
    const completeSurgeryRes = await fetch(`${API_BASE}/ot/surgeries/${surgeryData.id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    assert(completeSurgeryRes.status === 200, 'PATCH /ot/surgeries/:id/status (COMPLETED) returned HTTP 200 OK');

    // 15. Step 8: OT Analytics & Security Guards
    console.log('\n--- Step 8: OT Analytics & Security Guards ---');
    const analyticsRes = await fetch(`${API_BASE}/ot/analytics`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(analyticsRes.status === 200, 'GET /ot/analytics returned HTTP 200 OK');
    const analytics = await analyticsRes.json();
    assert(analytics.surgeriesToday >= 1 && analytics.otUtilizationPercentage > 0, `OT Analytics returned surgeriesToday: ${analytics.surgeriesToday}, utilization: ${analytics.otUtilizationPercentage}%`);

    // RBAC Guard: Receptionist blocked from scheduling surgeries
    const recepBlockRes = await fetch(`${API_BASE}/ot/rooms`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRecep}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Unauthorized OT', code: 'OT-UNAUTH' }),
    });
    assert(recepBlockRes.status === 403, 'RBAC Guard: Receptionist role blocked with HTTP 403 Forbidden from creating OT rooms');

    // Multi-Hospital Isolation Guard
    const isoRes = await fetch(`${API_BASE}/ot/checklist/${surgeryData.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(isoRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from Hospital A surgical records');

    console.log('\n==================================================');
    console.log(`📊 OT & SURGERY MANAGEMENT E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during OT Surgery E2E test:', err);
    process.exit(1);
  }
}

runOtSurgeryE2ETest();
