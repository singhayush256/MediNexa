const API_BASE = 'http://localhost:3001/api/v1';

async function runNursingMarE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA IPD MAR & NURSING SHIFT STATION E2E TEST');
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

    // 3. Authenticate Nurse (Nurse Joy)
    const nurseRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nurse.joy@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenNurse, user: nurseUser } = await nurseRes.json();
    assert(tokenNurse, 'Emergency/IPD Nurse authenticated successfully');

    // 4. Authenticate Doctor
    const docRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doc.reminder@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenDoc } = await docRes.json();
    assert(tokenDoc, 'Attending Doctor authenticated successfully');

    // 5. Authenticate Receptionist
    const recepRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'reception.a@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenRecep } = await recepRes.json();
    assert(tokenRecep, 'Receptionist authenticated successfully');

    // 6. Fetch target active admission & patient ID
    const admissionsRes = await fetch(`${API_BASE}/admissions`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const admissions = await admissionsRes.json();
    assert(Array.isArray(admissions) && admissions.length > 0, 'Active admissions retrieved from database');
    const targetAdm = admissions[0];
    const targetPatientId = targetAdm.patientId || targetAdm.patient?.id;

    // 7. Step 1: Create Nursing Shift
    console.log('\n--- Step 1: Nursing Shift Roster & Handovers ---');
    const shift1Res = await fetch(`${API_BASE}/nursing/shifts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenNurse}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shiftType: 'MORNING',
        handoverNotes: 'Shift started with 5 active ward inpatients.',
      }),
    });
    assert(shift1Res.status === 201 || shift1Res.status === 200, 'POST /nursing/shifts returned HTTP 201/200');
    const shift1 = await shift1Res.json();
    assert(shift1.id && shift1.status === 'ACTIVE', `Nurse shift #${shift1.id} (MORNING) created`);

    // 8. Step 2: List Active Facility Shifts
    const listShiftsRes = await fetch(`${API_BASE}/nursing/shifts`, {
      headers: { Authorization: `Bearer ${tokenNurse}` },
    });
    assert(listShiftsRes.status === 200, 'GET /nursing/shifts returned HTTP 200 OK');
    const activeShifts = await listShiftsRes.json();
    assert(Array.isArray(activeShifts) && activeShifts.length > 0, `Facility shifts listed successfully (${activeShifts.length})`);

    // 9. Step 3: Complete Nurse Shift
    const completeShiftRes = await fetch(`${API_BASE}/nursing/shifts/${shift1.id}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenNurse}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ handoverNotes: 'All MORNING meds given. Bed 201 stable.' }),
    });
    assert(completeShiftRes.status === 200, `PATCH /nursing/shifts/${shift1.id}/complete returned HTTP 200 OK`);
    const completedShift = await completeShiftRes.json();
    assert(completedShift.status === 'COMPLETED' && completedShift.endTime, 'Shift status updated to COMPLETED');

    // 10. Step 4: Record Bedside Vitals Flowsheet Entry
    console.log('\n--- Step 2: Bedside Vitals Flowsheet Entry ---');
    const vitalsRes = await fetch(`${API_BASE}/nursing/vitals`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenNurse}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        admissionId: targetAdm.id,
        patientId: targetPatientId,
        temperature: 98.6,
        pulse: 76,
        respiratoryRate: 16,
        oxygenSaturation: 98,
        systolicBP: 120,
        diastolicBP: 80,
        bloodGlucose: 110,
        painScore: 2,
        notes: 'Patient resting comfortably.',
      }),
    });
    assert(vitalsRes.status === 201 || vitalsRes.status === 200, 'POST /nursing/vitals returned HTTP 201/200');
    const vitalsEntry = await vitalsRes.json();
    assert(vitalsEntry.id && vitalsEntry.systolicBP === 120, 'Vitals entry saved in flowsheet');

    // 11. Step 5: Vitals Flowsheet History Retrieval
    const vitalsHistRes = await fetch(`${API_BASE}/nursing/vitals/${targetAdm.id}`, {
      headers: { Authorization: `Bearer ${tokenNurse}` },
    });
    assert(vitalsHistRes.status === 200, `GET /nursing/vitals/${targetAdm.id} returned HTTP 200 OK`);
    const vitalsHistory = await vitalsHistRes.json();
    assert(Array.isArray(vitalsHistory) && vitalsHistory.length > 0, `Vitals history flowsheet retrieved (${vitalsHistory.length} entries)`);

    // 12. Step 6: Standard Medication Administration
    console.log('\n--- Step 3: Medication Administration Record (MAR) ---');
    const stdMedRes = await fetch(`${API_BASE}/nursing/mar/administer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenNurse}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        admissionId: targetAdm.id,
        patientId: targetPatientId,
        medicationName: 'Amoxicillin 500mg',
        doseGiven: '500mg PO',
        isControlled: false,
      }),
    });
    assert(stdMedRes.status === 201 || stdMedRes.status === 200, 'POST /nursing/mar/administer (Standard) returned HTTP 201/200');
    const stdMed = await stdMedRes.json();
    assert(stdMed.id && stdMed.status === 'ADMINISTERED', 'Standard medication recorded as ADMINISTERED');

    // 13. Step 7: Controlled Medication Dual-Nurse Witness Validation Guards
    console.log('\n--- Step 4: Controlled Medication Dual-Nurse Witness Validation ---');
    // Guard 1: Missing witness nurse ID rejected
    const ctrlNoWitnessRes = await fetch(`${API_BASE}/nursing/mar/administer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenNurse}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        admissionId: targetAdm.id,
        patientId: targetPatientId,
        medicationName: 'Morphine Sulfate 5mg',
        doseGiven: '5mg IV push',
        isControlled: true,
      }),
    });
    assert(ctrlNoWitnessRes.status === 400, 'Controlled Drug Guard: Missing witness nurse rejected with HTTP 400 Bad Request');

    // Guard 2: Same nurse witness rejected
    const ctrlSameWitnessRes = await fetch(`${API_BASE}/nursing/mar/administer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenNurse}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        admissionId: targetAdm.id,
        patientId: targetPatientId,
        medicationName: 'Morphine Sulfate 5mg',
        doseGiven: '5mg IV push',
        isControlled: true,
        witnessNurseId: nurseUser.id,
      }),
    });
    assert(ctrlSameWitnessRes.status === 400, 'Controlled Drug Guard: Same nurse witness rejected with HTTP 400 Bad Request');

    // Guard 3: Valid second witness nurse accepted
    const usersRes = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    const secondNurseId = usersRes.id;
    const ctrlValidRes = await fetch(`${API_BASE}/nursing/mar/administer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenNurse}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        admissionId: targetAdm.id,
        patientId: targetPatientId,
        medicationName: 'Morphine Sulfate 5mg',
        doseGiven: '5mg IV push',
        isControlled: true,
        witnessNurseId: secondNurseId,
      }),
    });
    assert(ctrlValidRes.status === 201 || ctrlValidRes.status === 200, 'Controlled Drug Guard: Valid second witness nurse accepted (HTTP 201/200)');
    const ctrlMed = await ctrlValidRes.json();
    assert(ctrlMed.witnessNurseId === secondNurseId, 'Witness nurse ID saved in MAR administration record');

    // 14. Step 8: MAR Status Modifications (Missed, Refused, Held)
    console.log('\n--- Step 5: MAR Status Workflow Controls ---');
    const missedRes = await fetch(`${API_BASE}/nursing/mar/${stdMed.id}/missed`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenNurse}` },
    });
    assert(missedRes.status === 200, `PATCH /nursing/mar/${stdMed.id}/missed returned HTTP 200 OK`);
    const missedMed = await missedRes.json();
    assert(missedMed.status === 'MISSED', 'MAR record updated to MISSED');

    const refusedRes = await fetch(`${API_BASE}/nursing/mar/${stdMed.id}/refused`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenNurse}` },
    });
    assert(refusedRes.status === 200, `PATCH /nursing/mar/${stdMed.id}/refused returned HTTP 200 OK`);
    const refusedMed = await refusedRes.json();
    assert(refusedMed.status === 'REFUSED', 'MAR record updated to REFUSED');

    const heldRes = await fetch(`${API_BASE}/nursing/mar/${stdMed.id}/held`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenNurse}` },
    });
    assert(heldRes.status === 200, `PATCH /nursing/mar/${stdMed.id}/held returned HTTP 200 OK`);
    const heldMed = await heldRes.json();
    assert(heldMed.status === 'HELD', 'MAR record updated to HELD');

    // 15. Step 9: MAR Administration Timeline Retrieval
    console.log('\n--- Step 6: MAR Timeline & Analytics ---');
    const timelineRes = await fetch(`${API_BASE}/nursing/mar/${targetAdm.id}`, {
      headers: { Authorization: `Bearer ${tokenNurse}` },
    });
    assert(timelineRes.status === 200, `GET /nursing/mar/${targetAdm.id} returned HTTP 200 OK`);
    const timeline = await timelineRes.json();
    assert(Array.isArray(timeline) && timeline.length >= 2, `MAR timeline loaded (${timeline.length} doses)`);

    // 16. Step 10: Nursing Analytics Cards
    const analyticsRes = await fetch(`${API_BASE}/nursing/analytics`, {
      headers: { Authorization: `Bearer ${tokenNurse}` },
    });
    assert(analyticsRes.status === 200, 'GET /nursing/analytics returned HTTP 200 OK');
    const analytics = await analyticsRes.json();
    assert(analytics.activeAdmissions >= 1, `Analytics returned activeAdmissions: ${analytics.activeAdmissions}`);

    // 17. Step 11: RBAC Security Guard (Receptionist Denied Access)
    console.log('\n--- Step 7: RBAC Security Guards ---');
    const recepDeniedRes = await fetch(`${API_BASE}/nursing/shifts`, {
      headers: { Authorization: `Bearer ${tokenRecep}` },
    });
    assert(recepDeniedRes.status === 403, 'RBAC Guard: Receptionist role blocked with HTTP 403 Forbidden from nursing operations');

    // 18. Step 12: Doctor Read-Only Access
    const docReadRes = await fetch(`${API_BASE}/nursing/mar/${targetAdm.id}`, {
      headers: { Authorization: `Bearer ${tokenDoc}` },
    });
    assert(docReadRes.status === 200, 'RBAC Guard: Doctor authorized for read-only MAR timeline lookup (HTTP 200 OK)');

    // 19. Step 13: Multi-Hospital Isolation Security Guard
    console.log('\n--- Step 8: Multi-Hospital Isolation Security Guard ---');
    const isoRes = await fetch(`${API_BASE}/nursing/mar/${targetAdm.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(isoRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from Hospital A MAR records');

    console.log('\n==================================================');
    console.log(`📊 NURSING MAR & SHIFT E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during Nursing MAR E2E test:', err);
    process.exit(1);
  }
}

runNursingMarE2ETest();
