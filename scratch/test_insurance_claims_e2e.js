const BASE_URL = process.env.API_URL || 'http://localhost:3001/api/v1';

let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ [PASS] ${passedAssertions + 1}. ${message}`);
    passedAssertions++;
  } else {
    console.error(`❌ [FAIL] ${passedAssertions + failedAssertions + 1}. ${message}`);
    failedAssertions++;
  }
}

async function runInsuranceE2ETests() {
  console.log('==================================================');
  console.log('🛡️ MEDINEXA INSURANCE CLAIMS & TPA INTEGRATION E2E TEST');
  console.log('==================================================\n');

  try {
    const login = async (email, password) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      return { token: data.accessToken || data.token, user: data.user };
    };

    // 1. Authenticate Hospital Admin A
    const adminAAuth = await login('admin.hospa@medinexa.local', 'Password123!');
    assert(!!adminAAuth.token, 'Hospital Admin A authenticated successfully');
    const adminAToken = adminAAuth.token;

    // 2. Authenticate Hospital Admin B
    const adminBAuth = await login('admin.hospb@medinexa.local', 'Password123!');
    assert(!!adminBAuth.token, 'Hospital Admin B authenticated successfully');
    const adminBToken = adminBAuth.token;

    // 3. Authenticate Patient
    const patientAuth = await login('patient.doe@medinexa.local', 'Password123!');
    assert(!!patientAuth.token, 'Patient authenticated successfully');
    const patientToken = patientAuth.token;

    // 4. Resolve target patient
    const patientMeRes = await fetch(`${BASE_URL}/patients/me`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const targetPatient = await patientMeRes.json();
    assert(!!targetPatient?.id, `Target Patient identified (${targetPatient?.user?.firstName || 'Jane'} ${targetPatient?.user?.lastName || 'Doe'})`);
    const patientId = targetPatient.id;

    console.log('\n--- Step 1: Strict RBAC Security Guards ---');
    // 5. Patient blocked from creating insurance providers
    const patientProvRes = await fetch(`${BASE_URL}/insurance/providers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({ providerName: 'Unauthorized TPA' }),
    });
    assert(patientProvRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from creating TPA providers');

    // 6. Patient blocked from enrolling policies
    const patientPolRes = await fetch(`${BASE_URL}/insurance/policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({
        patientId,
        insuranceProviderId: 'dummy-id',
        policyNumber: 'POL-UNAUTH-01',
        coverageAmount: 50000,
        validTill: '2028-12-31',
      }),
    });
    assert(patientPolRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from enrolling insurance policies');

    // 7. Patient blocked from creating insurance claims
    const patientClaimRes = await fetch(`${BASE_URL}/insurance/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({
        patientId,
        totalClaimAmount: 10000,
      }),
    });
    assert(patientClaimRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from creating claims');

    console.log('\n--- Step 2: TPA / Insurance Provider Registry ---');
    // 8. Create TPA Insurance Provider
    const provCode = `TPA-STAR-${Date.now().toString().slice(-4)}`;
    const createProvRes = await fetch(`${BASE_URL}/insurance/providers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        providerName: 'Star Health & Allied Insurance TPA Desk',
        providerCode: provCode,
        contactEmail: 'cashless.tpa@starhealth.in',
        contactPhone: '+91 1800-425-2255',
        address: 'Star Health Towers, Cyber City, Gurugram',
      }),
    });
    const provData = await createProvRes.json();
    assert(createProvRes.status === 201 || createProvRes.status === 200, 'POST /insurance/providers returned HTTP 201/200');
    assert(provData.providerName === 'Star Health & Allied Insurance TPA Desk', 'TPA Provider created with correct providerName');
    const providerId = provData.id;

    // 9. List Providers
    const listProvsRes = await fetch(`${BASE_URL}/insurance/providers`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const provsList = await listProvsRes.json();
    assert(listProvsRes.status === 200 && Array.isArray(provsList) && provsList.length > 0, `GET /insurance/providers returned ${provsList.length} providers`);

    console.log('\n--- Step 3: Patient Policy Enrollment ---');
    // 10. Enroll Health Policy
    const polNum = `POL-STAR-${Date.now().toString().slice(-6)}`;
    const createPolRes = await fetch(`${BASE_URL}/insurance/policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        patientId,
        insuranceProviderId: providerId,
        policyNumber: polNum,
        memberId: `MEM-STAR-${Date.now().toString().slice(-4)}`,
        coverageAmount: 100000,
        insuranceType: 'CASHLESS',
        policyStatus: 'ACTIVE',
        validTill: '2028-12-31T23:59:59.000Z',
      }),
    });
    const polData = await createPolRes.json();
    assert(createPolRes.status === 201 || createPolRes.status === 200, 'POST /insurance/policies returned HTTP 201/200');
    assert(polData.policyNumber === polNum, `Policy enrolled with policyNumber: ${polNum}`);
    assert(polData.coverageAmount === 100000, 'Policy coverage amount verified as $100,000');
    const policyId = polData.id;

    // 11. Fetch Policy by ID
    const getPolRes = await fetch(`${BASE_URL}/insurance/policies/${policyId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const fetchedPol = await getPolRes.json();
    assert(getPolRes.status === 200 && fetchedPol.id === policyId, 'GET /insurance/policies/:id returned HTTP 200 OK');

    // 12. Update Policy Coverage
    const updatePolRes = await fetch(`${BASE_URL}/insurance/policies/${policyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({ coverageAmount: 125000 }),
    });
    const updatedPol = await updatePolRes.json();
    assert(updatePolRes.status === 200 && updatedPol.coverageAmount === 125000, 'PATCH /insurance/policies/:id updated coverageAmount to $125,000');

    console.log('\n--- Step 4: Cashless Claim Docket Creation ---');
    // 13. Create Cashless Claim
    const createClaimRes = await fetch(`${BASE_URL}/insurance/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        patientId,
        insuranceProviderId: providerId,
        policyId,
        totalClaimAmount: 15000,
        claimType: 'CASHLESS',
        remarks: 'Emergency Laparoscopic Appendectomy Cashless Preauth',
      }),
    });
    const claimData = await createClaimRes.json();
    assert(createClaimRes.status === 201 || createClaimRes.status === 200, 'POST /insurance/claims returned HTTP 201/200');
    assert(claimData.claimNumber.startsWith('CLM-'), `Claim number generated: ${claimData.claimNumber}`);
    assert(claimData.status === 'DRAFT', 'Initial claim status is DRAFT');
    const claimId = claimData.id;

    console.log('\n--- Step 5: Cashless Pre-Authorization Workflow ---');
    // 14. Transmit Pre-Authorization
    const preauthRes = await fetch(`${BASE_URL}/insurance/claims/${claimId}/preauth`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const preauthData = await preauthRes.json();
    assert(preauthRes.status === 201 || preauthRes.status === 200, 'POST /insurance/claims/:id/preauth returned HTTP 201/200');
    assert(preauthData.status === 'PREAUTH_PENDING', 'Claim status advanced to PREAUTH_PENDING');

    console.log('\n--- Step 6: Digital Claim Package Compilation & Submission ---');
    // 15. Submit Claim Package
    const submitClaimRes = await fetch(`${BASE_URL}/insurance/claims/${claimId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        remarks: 'Discharge summary, OT notes, pharmacy ledger and diagnostic reports uploaded',
      }),
    });
    const submitData = await submitClaimRes.json();
    assert(submitClaimRes.status === 201 || submitClaimRes.status === 200, 'POST /insurance/claims/:id/submit returned HTTP 201/200');
    assert(submitData.status === 'CLAIM_SUBMITTED', 'Claim status transitioned to CLAIM_SUBMITTED');
    assert(submitData.documents && submitData.documents.length >= 4, `Claim package compiled with ${submitData.documents?.length} digital attachments`);

    console.log('\n--- Step 7: TPA Query & Clarification Cycle ---');
    // 16. TPA Raises Information Query
    const queryRes = await fetch(`${BASE_URL}/insurance/claims/${claimId}/query`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        queryText: 'Please furnish histopathology biopsy report and itemized implant invoice breakdown.',
      }),
    });
    const queryData = await queryRes.json();
    assert(queryRes.status === 200, 'PATCH /insurance/claims/:id/query returned HTTP 200 OK');
    assert(queryData.status === 'QUERY_RAISED', 'Claim status updated to QUERY_RAISED');

    // 17. Hospital Coordinator Responds to Query
    const respondRes = await fetch(`${BASE_URL}/insurance/claims/${claimId}/respond`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        responseText: 'Biopsy report #BX-99402 uploaded to document vault confirming acute appendicitis.',
      }),
    });
    const respondData = await respondRes.json();
    assert(respondRes.status === 200, 'PATCH /insurance/claims/:id/respond returned HTTP 200 OK');
    assert(respondData.status === 'UNDER_REVIEW', 'Claim status transitioned to UNDER_REVIEW');

    console.log('\n--- Step 8: TPA Claim Adjudication & Approval ---');
    // 18. TPA Approves Claim (Partial or Full)
    const approveRes = await fetch(`${BASE_URL}/insurance/claims/${claimId}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        approvedAmount: 13500,
        remarks: 'Approved $13,500 after standard room-rent cap and non-medical deduction ($1,500 co-pay)',
      }),
    });
    const approveData = await approveRes.json();
    assert(approveRes.status === 200, 'PATCH /insurance/claims/:id/approve returned HTTP 200 OK');
    assert(approveData.status === 'PARTIALLY_APPROVED' || approveData.status === 'APPROVED', `Claim adjudicated with status: ${approveData.status}`);
    assert(approveData.approvedAmount === 13500, 'Approved amount recorded as $13,500');
    assert(approveData.patientPayableAmount === 1500, 'Patient co-payment calculated as $1,500');

    console.log('\n--- Step 9: Electronic Remittance Settlement ---');
    // 19. Record Settlement
    const utrNumber = `UTR-NEFT-${Date.now().toString().slice(-6)}`;
    const settleRes = await fetch(`${BASE_URL}/insurance/claims/${claimId}/settle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        approvedAmount: 13500,
        paymentReference: utrNumber,
        notes: 'Electronic remittance payout cleared to hospital treasury bank account',
      }),
    });
    const settleData = await settleRes.json();
    assert(settleRes.status === 200, 'PATCH /insurance/claims/:id/settle returned HTTP 200 OK');
    assert(settleData.status === 'SETTLED', 'Claim marked as SETTLED');
    assert(settleData.settlements && settleData.settlements.length > 0, 'ClaimSettlement transaction recorded');

    // 20. Verify Policy Utilization Incremented
    const verifiedPolRes = await fetch(`${BASE_URL}/insurance/policies/${policyId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const verifiedPolData = await verifiedPolRes.json();
    assert(verifiedPolData.utilizedAmount === 13500, `Policy utilized amount updated to $${verifiedPolData.utilizedAmount}`);

    console.log('\n--- Step 10: Repudiation / Rejection Workflow ---');
    // 21. Create Second Claim for Rejection Testing
    const secondClaimRes = await fetch(`${BASE_URL}/insurance/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        patientId,
        insuranceProviderId: providerId,
        policyId,
        totalClaimAmount: 8000,
        remarks: 'Cosmetic elective procedure claim',
      }),
    });
    const secondClaimData = await secondClaimRes.json();
    const secondClaimId = secondClaimData.id;

    // 22. Reject Claim
    const rejectRes = await fetch(`${BASE_URL}/insurance/claims/${secondClaimId}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        reason: 'Clause 4.2 Exclusion: Aesthetic elective procedures not covered under standard medical policy',
      }),
    });
    const rejectData = await rejectRes.json();
    assert(rejectRes.status === 200, 'PATCH /insurance/claims/:id/reject returned HTTP 200 OK');
    assert(rejectData.status === 'REJECTED', 'Claim marked as REJECTED');

    console.log('\n--- Step 11: Claim Dossier & Audit Log Verification ---');
    // 23. Fetch Full Claim Details
    const getClaimRes = await fetch(`${BASE_URL}/insurance/claims/${claimId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const fullClaim = await getClaimRes.json();
    assert(getClaimRes.status === 200, 'GET /insurance/claims/:id returned HTTP 200 OK');
    assert(fullClaim.documents && fullClaim.documents.length >= 4, 'Claim contains verified supporting digital documents');
    assert(fullClaim.queries && fullClaim.queries.length > 0, 'Claim tracks full TPA query communication exchange');
    assert(fullClaim.auditLogs && fullClaim.auditLogs.length >= 4, `Claim tracks ${fullClaim.auditLogs?.length} audit trail lifecycle transitions`);

    console.log('\n--- Step 12: Insurance Analytics & Executive KPI Dashboard ---');
    // 24. Fetch Insurance Analytics
    const analyticsRes = await fetch(`${BASE_URL}/insurance/analytics`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const analyticsData = await analyticsRes.json();
    assert(analyticsRes.status === 200, 'GET /insurance/analytics returned HTTP 200 OK');
    assert(analyticsData.totalClaims !== undefined, `Analytics: Total Claims tracked: ${analyticsData.totalClaims}`);
    assert(analyticsData.approvedClaims !== undefined, `Analytics: Approved Claims: ${analyticsData.approvedClaims}`);
    assert(analyticsData.settlementValue !== undefined, `Analytics: Settlement Value: $${analyticsData.settlementValue?.toLocaleString()}`);
    assert(analyticsData.avgApprovalTime !== undefined, `Analytics: Average Turnaround Time: ${analyticsData.avgApprovalTime}`);

    console.log('\n--- Step 13: Multi-Hospital Isolation Guard ---');
    // 25. Hospital B Admin blocked from accessing Hospital A claim
    const crossClaimRes = await fetch(`${BASE_URL}/insurance/claims/${claimId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminBToken}` },
    });
    assert(crossClaimRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from accessing Hospital A insurance claim');

    console.log('\n==================================================');
    console.log(`🛡️ INSURANCE CLAIMS E2E RESULT: ${passedAssertions} PASSED, ${failedAssertions} FAILED`);
    console.log('==================================================\n');

    if (failedAssertions > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal execution error during Insurance Claims E2E test:', error);
    process.exit(1);
  }
}

runInsuranceE2ETests();
