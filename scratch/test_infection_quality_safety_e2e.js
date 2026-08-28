const API_BASE = 'http://localhost:3001/api/v1';

async function runQualityInfectionSafetyE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA INFECTION CONTROL, QUALITY & PATIENT SAFETY E2E TEST');
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
    // 1. Authenticate Doctor
    const docRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doc.reminder@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenDoc } = await docRes.json();
    assert(tokenDoc, '1. Attending Doctor authenticated successfully');

    // 2. Authenticate Hospital Admin A (Quality Director)
    const adminARes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenA } = await adminARes.json();
    assert(tokenA, '2. Hospital Admin A (Quality Director) authenticated successfully');

    // 3. Authenticate Hospital Admin B
    const adminBRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospb@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenB } = await adminBRes.json();
    assert(tokenB, '3. Hospital Admin B authenticated successfully');

    // 4. Authenticate Nurse (Infection Control Nurse)
    const nurseRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nurse.joy@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenNurse } = await nurseRes.json();
    assert(tokenNurse, '4. Infection Control Nurse authenticated successfully');

    // 5. Authenticate Receptionist
    const recepRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'reception.a@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenRecep } = await recepRes.json();
    assert(tokenRecep, '5. Receptionist authenticated successfully');

    // 6. Authenticate Patient
    const patRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient.doe@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenPatient } = await patRes.json();
    assert(tokenPatient, '6. Patient authenticated successfully');

    // Get patients and departments for testing
    const patListRes = await fetch(`${API_BASE}/patients`, { headers: { Authorization: `Bearer ${tokenA}` } });
    const patients = await patListRes.json();
    const testPatient = patients[0];
    assert(testPatient && testPatient.id, '7. Master test patient identified');

    // --- Step 1: RBAC Security Guards ---
    console.log('\n--- Step 1: RBAC Security Guards ---');
    const rbacPatRes = await fetch(`${API_BASE}/quality/incidents`, {
      headers: { Authorization: `Bearer ${tokenPatient}` },
    });
    assert(rbacPatRes.status === 403, '8. RBAC Guard: Patient role blocked with HTTP 403 Forbidden from Quality endpoints');

    // --- Step 2: Incident Reporting & Sentinel Event Logging ---
    console.log('\n--- Step 2: Incident Reporting & Sentinel Event Logging ---');
    const incRes1 = await fetch(`${API_BASE}/quality/incidents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenNurse}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incidentType: 'MEDICATION_ERROR',
        severity: 'MEDIUM',
        description: 'Incorrect dosage rate detected before infusion start. Intercepted by nurse.',
        patientId: testPatient.id,
      }),
    });
    assert(incRes1.status === 201 || incRes1.status === 200, '9. POST /quality/incidents (Medication Error) returned HTTP 201/200');
    const incident1 = await incRes1.json();
    assert(incident1.id && incident1.incidentNumber, `10. Adverse Incident #${incident1.incidentNumber} created with status OPEN`);

    const incRes2 = await fetch(`${API_BASE}/quality/incidents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incidentType: 'SENTINEL_EVENT',
        severity: 'SENTINEL',
        description: 'Unplanned return to operating room due to acute internal hemorrhage.',
        patientId: testPatient.id,
      }),
    });
    assert(incRes2.status === 201 || incRes2.status === 200, '11. POST /quality/incidents (Sentinel Event) returned HTTP 201/200');
    const sentinelInc = await incRes2.json();
    assert(sentinelInc.severity === 'SENTINEL', `12. Sentinel Event logged: #${sentinelInc.incidentNumber}`);

    const incListRes = await fetch(`${API_BASE}/quality/incidents`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(incListRes.status === 200, '13. GET /quality/incidents returned HTTP 200 OK');
    const incidents = await incListRes.json();
    assert(Array.isArray(incidents) && incidents.length >= 2, `14. Incidents roster retrieved (${incidents.length} active incidents)`);

    // --- Step 3: Healthcare-Associated Infection (HAI) Surveillance & RCA ---
    console.log('\n--- Step 3: Healthcare-Associated Infection (HAI) Surveillance & RCA ---');
    const infRes = await fetch(`${API_BASE}/quality/infections`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenNurse}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: testPatient.id,
        infectionType: 'CAUTI',
        infectionSource: 'HOSPITAL_ACQUIRED',
        severity: 'MODERATE',
        rootCauseAnalysis: 'Catheter retention exceeded 7 days without daily necessity review.',
        correctiveAction: 'Catheter removed immediately and targeted antimicrobial therapy initiated.',
        preventiveAction: 'Implement daily nursing checklist for indwelling urinary catheter review.',
      }),
    });
    assert(infRes.status === 201 || infRes.status === 200, '15. POST /quality/infections returned HTTP 201/200');
    const infection = await infRes.json();
    assert(infection.id && infection.caseNumber, `16. HAI Surveillance Case #${infection.caseNumber} recorded`);

    const infListRes = await fetch(`${API_BASE}/quality/infections`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(infListRes.status === 200, '17. GET /quality/infections returned HTTP 200 OK');
    const infections = await infListRes.json();
    assert(Array.isArray(infections) && infections.length >= 1, `18. Infection surveillance roster listed (${infections.length} cases)`);

    // --- Step 4: Quality Audits (NABH / JCI Compliance) ---
    console.log('\n--- Step 4: Quality Audits (NABH / JCI Compliance) ---');
    const departmentsRes = await fetch(`${API_BASE}/hospital/wards`, { headers: { Authorization: `Bearer ${tokenA}` } });
    const wards = await departmentsRes.json();
    const targetDeptId = wards[0]?.facilityId || testPatient.facilityId;

    const auditRes = await fetch(`${API_BASE}/quality/audits`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auditName: 'NABH Clinical Governance & Nursing Medication Safety Audit',
        departmentId: targetDeptId,
        score: 96.5,
        findings: 'High adherence to high-risk drug dual-nurse sign-off protocols. Minor labeling gap in satellite fridge.',
        recommendations: 'Implement automated barcode scanning on all medication satellite refrigerators.',
      }),
    });
    assert(auditRes.status === 201 || auditRes.status === 200, '19. POST /quality/audits returned HTTP 201/200');
    const audit = await auditRes.json();
    assert(audit.id && audit.score === 96.5, `20. Quality Audit #${audit.auditNumber} completed with score 96.5%`);

    const auditListRes = await fetch(`${API_BASE}/quality/audits`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(auditListRes.status === 200, '21. GET /quality/audits returned HTTP 200 OK');
    const audits = await auditListRes.json();
    assert(Array.isArray(audits) && audits.length >= 1, '22. Quality Audits roster listed');

    // --- Step 5: CAPA Lifecycle Management ---
    console.log('\n--- Step 5: CAPA Lifecycle Management ---');
    const capaRes = await fetch(`${API_BASE}/quality/capa`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auditId: audit.id,
        incidentId: incident1.id,
        correctiveAction: 'Calibrate all volumetric infusion pumps across Ward 3B.',
        preventiveAction: 'Introduce monthly biomedical preventive maintenance checks.',
      }),
    });
    assert(capaRes.status === 201 || capaRes.status === 200, '23. POST /quality/capa returned HTTP 201/200');
    const capa = await capaRes.json();
    assert(capa.id && capa.status === 'OPEN', `24. CAPA #${capa.capaNumber} created with status OPEN`);

    const compCapaRes = await fetch(`${API_BASE}/quality/capa/${capa.id}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(compCapaRes.status === 200, '25. PATCH /quality/capa/:id/complete returned HTTP 200 OK');
    const completedCapa = await compCapaRes.json();
    assert(completedCapa.status === 'COMPLETED', '26. CAPA status successfully updated to COMPLETED');

    // --- Step 6: Hand Hygiene Surveillance (WHO 5-Moments) ---
    console.log('\n--- Step 6: Hand Hygiene Surveillance (WHO 5-Moments) ---');
    const hhRes = await fetch(`${API_BASE}/quality/hand-hygiene`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenNurse}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        departmentId: targetDeptId,
        compliancePercentage: 98.2,
      }),
    });
    assert(hhRes.status === 201 || hhRes.status === 200, '27. POST /quality/hand-hygiene returned HTTP 201/200');
    const hh = await hhRes.json();
    assert(hh.compliancePercentage === 98.2, `28. Hand Hygiene audit logged: ${hh.compliancePercentage}% compliance`);

    const hhListRes = await fetch(`${API_BASE}/quality/hand-hygiene`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(hhListRes.status === 200, '29. GET /quality/hand-hygiene returned HTTP 200 OK');

    // --- Step 7: Patient Safety Checklists ---
    console.log('\n--- Step 7: Patient Safety Checklists ---');
    const chkRes = await fetch(`${API_BASE}/quality/checklists`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenNurse}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: testPatient.id,
        checklistType: 'FALL_RISK_ASSESSMENT',
        status: 'COMPLIANT',
        notes: 'Morse Fall Scale evaluated score 25. Bedside rails elevated and yellow wristband applied.',
      }),
    });
    assert(chkRes.status === 201 || chkRes.status === 200, '30. POST /quality/checklists returned HTTP 201/200');
    const checklist = await chkRes.json();
    assert(checklist.checklistType === 'FALL_RISK_ASSESSMENT' && checklist.status === 'COMPLIANT', '31. Safety Checklist logged as COMPLIANT');

    const chkListRes = await fetch(`${API_BASE}/quality/checklists`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(chkListRes.status === 200, '32. GET /quality/checklists returned HTTP 200 OK');

    // --- Step 8: Quality & Safety Analytics Dashboard ---
    console.log('\n--- Step 8: Quality & Safety Analytics Dashboard ---');
    const analyticsRes = await fetch(`${API_BASE}/quality/analytics`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(analyticsRes.status === 200, '33. GET /quality/analytics returned HTTP 200 OK');
    const analytics = await analyticsRes.json();
    assert(analytics.patientSafetyScore > 90, `34. Executive Patient Safety Score: ${analytics.patientSafetyScore}%`);
    assert(analytics.handHygieneCompliancePercentage > 90, `35. Overall Hand Hygiene Compliance: ${analytics.handHygieneCompliancePercentage}%`);

    // --- Step 9: Multi-Hospital Isolation Guards ---
    console.log('\n--- Step 9: Multi-Hospital Isolation Guards ---');
    const isoRes = await fetch(`${API_BASE}/quality/capa/${capa.id}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(isoRes.status === 403, '36. Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from modifying Hospital A CAPA');

    console.log('\n==================================================');
    console.log(`📊 INFECTION CONTROL & QUALITY RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during Quality & Infection Control E2E test:', err);
    process.exit(1);
  }
}

runQualityInfectionSafetyE2ETest();
