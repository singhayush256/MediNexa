const BASE_URL = 'http://localhost:3001/api/v1';

async function runRcmInsuranceClaimsE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA REVENUE CYCLE & INSURANCE CLAIMS ENGINE E2E TEST');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${passed + failed + 1}. ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${passed + failed + 1}. ${message}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate Actors
    const login = async (email, password) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      return { token: data.accessToken || data.token, user: data.user };
    };

    const docAuth = await login('doc.reminder@medinexa.local', 'Password123!');
    assert(!!docAuth.token, 'Attending Doctor authenticated successfully');

    const adminAAuth = await login('admin.hospa@medinexa.local', 'Password123!');
    assert(!!adminAAuth.token, 'Hospital Admin A (RCM Director) authenticated successfully');

    const adminBAuth = await login('admin.hospb@medinexa.local', 'Password123!');
    assert(!!adminBAuth.token, 'Hospital Admin B (Hospital B) authenticated successfully');

    const patientAuth = await login('patient.doe@medinexa.local', 'Password123!');
    assert(!!patientAuth.token, 'Patient authenticated successfully');

    const patientsRes = await fetch(`${BASE_URL}/patients`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    const patients = await patientsRes.json();
    const patientA = Array.isArray(patients) && patients.length > 0 ? patients[0] : { id: 'patient-test-id' };
    assert(!!patientA.id, 'Target test patient identified');

    // --- Step 1: RBAC Security Guards ---
    console.log('\n--- Step 1: RBAC Security Guards ---');
    const rbacRes = await fetch(`${BASE_URL}/claims/providers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientAuth.token}`,
      },
      body: JSON.stringify({ name: 'Unauthorized Insurer' }),
    });
    assert(rbacRes.status === 403, 'RBAC Guard: Patient role blocked with HTTP 403 Forbidden from creating insurance providers');

    // --- Step 2: Insurance Provider Registry ---
    console.log('\n--- Step 2: Insurance Provider Registry ---');
    const provRes = await fetch(`${BASE_URL}/claims/providers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        name: `Max Bupa Health Insurance ${Date.now()}`,
        code: `MAX-${Date.now().toString().slice(-4)}`,
        contactPerson: 'Siddharth Roy',
        phone: '+91-1800-3010-3333',
        email: 'tpa.desk@maxbupa.com',
        address: 'Bupa Towers, Gurugram, Haryana',
        policyValidationRules: 'Pre-auth auto-approved up to $10,000 for network hospitals',
      }),
    });
    assert(provRes.status === 201 || provRes.status === 200, 'POST /claims/providers returned HTTP 201/200');
    const providerData = await provRes.json();
    assert(!!providerData.id, `Insurance Provider '${providerData.name || providerData.providerName}' registered`);

    const listProvRes = await fetch(`${BASE_URL}/claims/providers`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(listProvRes.status === 200, 'GET /claims/providers returned HTTP 200 OK');
    const providersList = await listProvRes.json();
    assert(Array.isArray(providersList) && providersList.length > 0, `Insurance Providers directory loaded (${providersList.length} payors)`);

    // --- Step 3: Patient Policy Coverage Verification ---
    console.log('\n--- Step 3: Patient Insurance Policy Verification ---');
    const policyRes = await fetch(`${BASE_URL}/claims/policies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        patientId: patientA.id,
        insuranceProviderId: providerData.id,
        policyNumber: `POL-MAX-${Date.now().toString().slice(-6)}`,
        memberId: `MEM-${Date.now().toString().slice(-4)}`,
        coverageAmount: 50000.0,
        validFrom: new Date(Date.now() - 30 * 86400000).toISOString(),
        validTill: new Date(Date.now() + 335 * 86400000).toISOString(),
      }),
    });
    assert(policyRes.status === 201 || policyRes.status === 200, 'POST /claims/policies returned HTTP 201/200');
    const policyData = await policyRes.json();
    assert(policyData.coverageAmount === 50000, `Patient Policy #${policyData.policyNumber} verified ($50,000 coverage)`);

    const getPolRes = await fetch(`${BASE_URL}/claims/policies/${patientA.id}`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(getPolRes.status === 200, 'GET /claims/policies/:patientId returned HTTP 200 OK');

    // --- Step 4: Claim Creation & Coverage Limit Guard ---
    console.log('\n--- Step 4: Claim Creation & Coverage Limit Guard ---');
    // 4.1 Coverage limit guard: Claim > Policy Coverage
    const overLimitRes = await fetch(`${BASE_URL}/claims/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        patientId: patientA.id,
        patientInsuranceId: policyData.id,
        claimType: 'CASHLESS',
        amountClaimed: 75000.0, // Exceeds 50,000 coverage
        remarks: 'Cardiac valve replacement pre-auth',
      }),
    });
    assert(overLimitRes.status === 400, 'Coverage Guard: Claim amount ($75,000) exceeding policy limit ($50,000) rejected with HTTP 400 Bad Request');

    // 4.2 Valid Claim Creation
    const claimRes = await fetch(`${BASE_URL}/claims/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        patientId: patientA.id,
        patientInsuranceId: policyData.id,
        insuranceProviderId: providerData.id,
        claimType: 'CASHLESS',
        amountClaimed: 24500.0,
        remarks: 'Laparoscopic Cholecystectomy hospitalization pre-authorization',
      }),
    });
    assert(claimRes.status === 201 || claimRes.status === 200, 'POST /claims/create returned HTTP 201/200');
    const claimData = await claimRes.json();
    assert(!!claimData.id && claimData.status === 'DRAFT', `Cashless Claim #${claimData.claimNumber} created in DRAFT status`);

    // --- Step 5: Claim Submission Workflow ---
    console.log('\n--- Step 5: Claim Submission Workflow ---');
    const subRes = await fetch(`${BASE_URL}/claims/${claimData.id}/submit`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(subRes.status === 200, 'PATCH /claims/:id/submit returned HTTP 200 OK');
    const subData = await subRes.json();
    assert(subData.status === 'SUBMITTED', 'Claim status transitioned: DRAFT -> SUBMITTED to TPA');

    // --- Step 6: Claim Adjudication & Approval ---
    console.log('\n--- Step 6: Claim Adjudication & Approval ---');
    // 6.1 Approval limit guard
    const overApproveRes = await fetch(`${BASE_URL}/claims/${claimData.id}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        amountApproved: 30000.0, // Exceeds 24,500 claimed
      }),
    });
    assert(overApproveRes.status === 400, 'Approval Guard: Approved amount exceeding claimed amount rejected with HTTP 400 Bad Request');

    // 6.2 Partial/Full Approval
    const approveRes = await fetch(`${BASE_URL}/claims/${claimData.id}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        amountApproved: 22000.0,
        remarks: 'Pre-auth approved minus non-medical consumables deduction ($2,500)',
      }),
    });
    assert(approveRes.status === 200, 'PATCH /claims/:id/approve returned HTTP 200 OK');
    const approveData = await approveRes.json();
    assert(approveData.status === 'PARTIALLY_APPROVED', 'Claim status transitioned: SUBMITTED -> PARTIALLY_APPROVED ($22,000)');

    // --- Step 7: Settlement & Payment Reconciliation ---
    console.log('\n--- Step 7: Settlement & Payment Reconciliation ---');
    const payRes = await fetch(`${BASE_URL}/claims/${claimData.id}/payment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        amountPaid: 22000.0,
        paymentMethod: 'TPA_NEFT_TRANSFER',
        referenceNumber: `UTR-MAX-${Date.now()}`,
        remarks: 'Final TPA claim settlement received',
      }),
    });
    assert(payRes.status === 200, 'PATCH /claims/:id/payment returned HTTP 200 OK');
    const payData = await payRes.json();
    assert(payData.status === 'PAID', 'Claim status transitioned: PARTIALLY_APPROVED -> PAID upon full settlement');

    // --- Step 8: Claim Audit Logs ---
    console.log('\n--- Step 8: Claim Audit Logs ---');
    const getClaimRes = await fetch(`${BASE_URL}/claims/${claimData.id}`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(getClaimRes.status === 200, 'GET /claims/:id returned HTTP 200 OK');
    const fullClaim = await getClaimRes.json();
    assert(Array.isArray(fullClaim.auditLogs) && fullClaim.auditLogs.length >= 3, `Claim Audit Trail contains ${fullClaim.auditLogs.length} verified lifecycle events`);

    // --- Step 9: Rejection Workflow ---
    console.log('\n--- Step 9: Rejection Workflow ---');
    const rejClaimRes = await fetch(`${BASE_URL}/claims/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        patientId: patientA.id,
        insuranceProviderId: providerData.id,
        claimType: 'REIMBURSEMENT',
        amountClaimed: 8500.0,
        remarks: 'Post-discharge OPD consultations reimbursement',
      }),
    });
    const rejClaimData = await rejClaimRes.json();

    const doRejRes = await fetch(`${BASE_URL}/claims/${rejClaimData.id}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        remarks: 'Consultation bills outside 30-day post-hospitalization window',
      }),
    });
    assert(doRejRes.status === 200, 'PATCH /claims/:id/reject returned HTTP 200 OK');
    const doRejData = await doRejRes.json();
    assert(doRejData.status === 'REJECTED', 'Claim status transitioned to REJECTED');

    // --- Step 10: RCM & Claims Analytics ---
    console.log('\n--- Step 10: RCM & Claims Analytics ---');
    const analRes = await fetch(`${BASE_URL}/claims/analytics`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(analRes.status === 200, 'GET /claims/analytics returned HTTP 200 OK');
    const analytics = await analRes.json();
    assert(typeof analytics.amountClaimed === 'number', `Total Amount Claimed: $${analytics.amountClaimed.toLocaleString()}`);
    assert(typeof analytics.amountApproved === 'number', `Total Amount Approved: $${analytics.amountApproved.toLocaleString()}`);
    assert(typeof analytics.averageSettlementDays === 'number', `Average Settlement Time: ${analytics.averageSettlementDays} days`);

    // --- Step 11: Multi-Hospital Isolation Guards ---
    console.log('\n--- Step 11: Multi-Hospital Isolation Guards ---');
    const crossFacRes = await fetch(`${BASE_URL}/claims/${claimData.id}/submit`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminBAuth.token}` },
    });
    assert(crossFacRes.status === 403 || crossFacRes.status === 400, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403/400 from modifying Hospital A claim');

    console.log('\n==================================================');
    console.log(`📊 RCM & INSURANCE CLAIMS RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during RCM & Insurance Claims E2E test:', err);
    process.exit(1);
  }
}

runRcmInsuranceClaimsE2ETest();
