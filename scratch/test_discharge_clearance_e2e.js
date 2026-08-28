const API_BASE = 'http://localhost:3001/api/v1';

async function runDischargeClearanceE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA DISCHARGE SUMMARY & CLEARANCE E2E TEST');
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
    assert(tokenNurse, 'Ward Nurse authenticated successfully');

    // 5. Authenticate Receptionist
    const recepRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'reception.a@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenRecep } = await recepRes.json();
    assert(tokenRecep, 'Billing Receptionist authenticated successfully');

    // 6. Fetch target active admission
    const admissionsRes = await fetch(`${API_BASE}/admissions`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const admissions = await admissionsRes.json();
    assert(Array.isArray(admissions) && admissions.length > 0, 'Active admissions retrieved from database');
    const targetAdm = admissions[0];

    // 7. Step 1: Create Doctor Discharge Summary Draft
    console.log('\n--- Step 1: Doctor Discharge Summary Builder ---');
    const createSummaryRes = await fetch(`${API_BASE}/discharge/summary`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        admissionId: targetAdm.id,
        chiefComplaint: 'Chest pain and dyspnea on exertion',
        diagnosis: 'Acute Coronary Syndrome - Inferior Wall MI',
        treatmentProvided: 'Percutaneous Coronary Intervention (PCI) to RCA',
        proceduresPerformed: 'Coronary Angiography & Drug-eluting stent',
        medicationsOnDischarge: 'Aspirin 75mg OD, Clopidogrel 75mg OD, Atorvastatin 40mg HS',
        followUpInstructions: 'Cardiology OPD Follow-up in 7 days.',
        dischargeCondition: 'STABLE',
      }),
    });
    assert(createSummaryRes.status === 201 || createSummaryRes.status === 200, 'POST /discharge/summary returned HTTP 201/200');
    const summary = await createSummaryRes.json();
    assert(summary.id && summary.diagnosis.includes('Acute Coronary'), 'Discharge summary draft saved in database');

    // 8. Step 2: Fetch Discharge Summary
    const getSummaryRes = await fetch(`${API_BASE}/discharge/summary/${targetAdm.id}`, {
      headers: { Authorization: `Bearer ${tokenDoc}` },
    });
    assert(getSummaryRes.status === 200, `GET /discharge/summary/${targetAdm.id} returned HTTP 200 OK`);

    // 9. Step 3: Blocked Discharge Guard (Pending Clearances)
    console.log('\n--- Step 2: Multi-Department Clearance Enforcement ---');
    const prematureFinalizeRes = await fetch(`${API_BASE}/discharge/finalize/${targetAdm.id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}` },
    });
    assert(prematureFinalizeRes.status === 400, 'Clearance Security Guard: Final discharge blocked with HTTP 400 when clearances are pending');

    // 10. Step 4: Approve 4 Department Clearances (Pharmacy, Lab, Ward, Billing)
    const pharmClearanceRes = await fetch(`${API_BASE}/discharge/clearance/pharmacy`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ admissionId: targetAdm.id, status: 'APPROVED', remarks: 'Pharmacy inventory reconciled.' }),
    });
    assert(pharmClearanceRes.status === 201 || pharmClearanceRes.status === 200, 'Pharmacy Clearance approved');

    const labClearanceRes = await fetch(`${API_BASE}/discharge/clearance/lab`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ admissionId: targetAdm.id, status: 'APPROVED', remarks: 'All lab reports completed.' }),
    });
    assert(labClearanceRes.status === 201 || labClearanceRes.status === 200, 'Lab Clearance approved');

    const wardClearanceRes = await fetch(`${API_BASE}/discharge/clearance/ward`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenNurse}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ admissionId: targetAdm.id, status: 'APPROVED', remarks: 'Ward inventory returned.' }),
    });
    assert(wardClearanceRes.status === 201 || wardClearanceRes.status === 200, 'Ward Nursing Clearance approved');

    const billingClearanceRes = await fetch(`${API_BASE}/discharge/clearance/billing`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRecep}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ admissionId: targetAdm.id, status: 'APPROVED', remarks: 'Final bill paid in full.' }),
    });
    assert(billingClearanceRes.status === 201 || billingClearanceRes.status === 200, 'Billing Financial Clearance approved');

    // 11. Step 5: Verify Clearances List
    const clearancesRes = await fetch(`${API_BASE}/discharge/clearance/${targetAdm.id}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(clearancesRes.status === 200, `GET /discharge/clearance/${targetAdm.id} returned HTTP 200 OK`);
    const clearances = await clearancesRes.json();
    assert(clearances.length >= 4 && clearances.every((c) => c.status === 'APPROVED'), 'All 4 multi-department clearances are APPROVED');

    // 12. Step 6: Execute Final Discharge & Bed Release
    console.log('\n--- Step 3: Final Discharge & Bed Release Execution ---');
    const finalizeRes = await fetch(`${API_BASE}/discharge/finalize/${targetAdm.id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}` },
    });
    assert(finalizeRes.status === 200 || finalizeRes.status === 201, `POST /discharge/finalize/${targetAdm.id} returned HTTP 200 OK`);
    const dischargedAdm = await finalizeRes.json();
    assert(dischargedAdm.status === 'DISCHARGED' && dischargedAdm.dischargedAt, 'Admission status transitioned to DISCHARGED with timestamp');

    // 13. Step 7: Discharge Analytics Retrieval
    console.log('\n--- Step 4: Analytics & Isolation Guards ---');
    const analyticsRes = await fetch(`${API_BASE}/discharge/analytics`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(analyticsRes.status === 200, 'GET /discharge/analytics returned HTTP 200 OK');
    const analytics = await analyticsRes.json();
    assert(analytics.dischargesToday >= 1, `Discharge analytics returned dischargesToday: ${analytics.dischargesToday}`);

    // 14. Step 8: Multi-Hospital Isolation Security Guard
    const isoRes = await fetch(`${API_BASE}/discharge/summary/${targetAdm.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(isoRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from Hospital A discharge records');

    console.log('\n==================================================');
    console.log(`📊 DISCHARGE SUMMARY & CLEARANCE E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during Discharge Clearance E2E test:', err);
    process.exit(1);
  }
}

runDischargeClearanceE2ETest();
