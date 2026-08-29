const BASE_URL = 'http://localhost:3001/api/v1';

async function runAbdmIntegrationE2ETest() {
  console.log('==================================================');
  console.log('🇮🇳 MEDINEXA ABDM (AYUSHMAN BHARAT DIGITAL MISSION) E2E TEST');
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

    const adminAAuth = await login('admin.hospa@medinexa.local', 'Password123!');
    assert(!!adminAAuth.token, 'Hospital Admin A (ABDM Nodal Officer) authenticated successfully');

    const adminBAuth = await login('admin.hospb@medinexa.local', 'Password123!');
    assert(!!adminBAuth.token, 'Hospital Admin B authenticated successfully');

    const docAuth = await login('doc.reminder@medinexa.local', 'Password123!');
    assert(!!docAuth.token, 'Clinician authenticated successfully');

    let nurseAuth = await login('nurse@medinexa.local', 'Password123!');
    if (!nurseAuth.token) nurseAuth = await login('nurse.joy@medinexa.local', 'Password123!');
    assert(!!nurseAuth.token, 'Ward Nurse authenticated successfully');

    const patientAuth = await login('patient.doe@medinexa.local', 'Password123!');
    assert(!!patientAuth.token, 'Patient (Aadhaar/ABHA Holder) authenticated successfully');

    // Identify target patient
    const patientMeRes = await fetch(`${BASE_URL}/patients/me`, {
      headers: { Authorization: `Bearer ${patientAuth.token}` },
    });
    const targetPatient = await patientMeRes.json();
    assert(!!targetPatient?.id, `Target Patient identified (${targetPatient?.user?.firstName || 'Jane'} ${targetPatient?.user?.lastName || 'Doe'})`);
    const patientId = targetPatient.id;

    // --- Step 1: RBAC Security Guards ---
    console.log('\n--- Step 1: RBAC Security Guards ---');
    const docLinkRes = await fetch(`${BASE_URL}/abdm/abha/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docAuth.token}` },
      body: JSON.stringify({ patientId, abhaNumber: '12345678901234', abhaAddress: 'jane@abdm' }),
    });
    assert(docLinkRes.status === 403, 'RBAC Guard: Doctor role blocked with HTTP 403 Forbidden from ABDM admin actions');

    const nurseLinkRes = await fetch(`${BASE_URL}/abdm/abha/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${nurseAuth.token}` },
      body: JSON.stringify({ patientId, abhaNumber: '12345678901234', abhaAddress: 'jane@abdm' }),
    });
    assert(nurseLinkRes.status === 403, 'RBAC Guard: Nurse role blocked with HTTP 403 Forbidden from ABDM admin actions');

    const patientLinkRes = await fetch(`${BASE_URL}/abdm/abha/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientAuth.token}` },
      body: JSON.stringify({ patientId, abhaNumber: '12345678901234', abhaAddress: 'jane@abdm' }),
    });
    assert(patientLinkRes.status === 403, 'RBAC Guard: Patient role blocked with HTTP 403 Forbidden from administrative ABHA linking');

    // --- Step 2: ABHA Number Format Validation ---
    console.log('\n--- Step 2: ABHA Number Format Validation ---');
    const invalidAbhaRes = await fetch(`${BASE_URL}/abdm/abha/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAAuth.token}` },
      body: JSON.stringify({ patientId, abhaNumber: '12345', abhaAddress: 'invalid@abdm' }),
    });
    assert(invalidAbhaRes.status === 400, 'Format Guard: Invalid ABHA number (< 14 digits) rejected with HTTP 400 Bad Request');

    // --- Step 3: ABHA Linking Workstation ---
    console.log('\n--- Step 3: ABHA Linking Workstation ---');
    const rawAbhaNumber = `91${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const abhaAddress = `jane.doe.${Date.now().toString().slice(-4)}@abdm`;

    const linkRes = await fetch(`${BASE_URL}/abdm/abha/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAAuth.token}` },
      body: JSON.stringify({
        patientId,
        abhaNumber: rawAbhaNumber,
        abhaAddress,
        mobile: '+91 9876543210',
      }),
    });
    assert(linkRes.status === 201 || linkRes.status === 200, 'POST /abdm/abha/link returned HTTP 201/200');
    const linkedProfile = await linkRes.json();
    assert(linkedProfile.linked === true, 'ABHA profile successfully marked linked: true');
    assert(linkedProfile.abhaAddress.endsWith('@abdm'), `ABHA address standardized (${linkedProfile.abhaAddress})`);
    assert(linkedProfile.abhaNumber.includes('-'), `14-digit ABHA formatted with national hyphens (${linkedProfile.abhaNumber})`);
    assert(!!linkedProfile.verifiedAt, 'ABHA verification timestamp recorded');

    // --- Step 4: ABHA Profile & Care Context Retrieval ---
    console.log('\n--- Step 4: ABHA Profile & Care Context Retrieval ---');
    const getProfileRes = await fetch(`${BASE_URL}/abdm/abha/${patientId}`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(getProfileRes.status === 200, 'GET /abdm/abha/:patientId returned HTTP 200 OK');
    const fetchedProfile = await getProfileRes.json();
    assert(fetchedProfile.patientId === patientId, 'ABHA profile matched target patient ID');
    assert(typeof fetchedProfile.careContexts?.prescriptions === 'number', 'Care context telemetry (prescriptions, encounters, lab orders) linked');

    // Patient Self-Access check
    const patientSelfRes = await fetch(`${BASE_URL}/abdm/abha/${patientId}`, {
      headers: { Authorization: `Bearer ${patientAuth.token}` },
    });
    assert(patientSelfRes.status === 200, 'Patient allowed self-access to their own ABHA profile');

    // --- Step 5: ABDM Consent Artefact Request ---
    console.log('\n--- Step 5: ABDM Consent Artefact Request ---');
    const requestConsentRes = await fetch(`${BASE_URL}/abdm/consent/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAAuth.token}` },
      body: JSON.stringify({
        patientId,
        purpose: 'Comprehensive Clinical Review & Diagnostic Second Opinion',
      }),
    });
    assert(requestConsentRes.status === 201 || requestConsentRes.status === 200, 'POST /abdm/consent/request returned HTTP 201/200');
    const createdConsent = await requestConsentRes.json();
    assert(createdConsent.status === 'REQUESTED', 'Initial consent status is REQUESTED');
    assert(createdConsent.consentReference.startsWith('AR-ABDM-'), `Generated unique consent reference (${createdConsent.consentReference})`);
    const consentId = createdConsent.id;

    // List consents
    const listConsentRes = await fetch(`${BASE_URL}/abdm/consents`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(listConsentRes.status === 200, 'GET /abdm/consents returned HTTP 200 OK');
    const consentList = await listConsentRes.json();
    assert(Array.isArray(consentList) && consentList.length > 0, `Consent directory loaded (${consentList.length} records)`);

    // --- Step 6: Unapproved Share Safety Guard ---
    console.log('\n--- Step 6: Unapproved Share Safety Guard ---');
    const prematureShareRes = await fetch(`${BASE_URL}/abdm/share-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAAuth.token}` },
      body: JSON.stringify({
        consentId,
        recordType: 'PRESCRIPTION',
      }),
    });
    assert(prematureShareRes.status === 400, 'Safety Guard: Sharing records under unapproved consent rejected with HTTP 400 Bad Request');

    // --- Step 7: Approve Consent Artefact ---
    console.log('\n--- Step 7: Approve Consent Artefact ---');
    const approveRes = await fetch(`${BASE_URL}/abdm/consent/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAAuth.token}` },
      body: JSON.stringify({
        consentId,
        validDays: 30,
      }),
    });
    assert(approveRes.status === 201 || approveRes.status === 200, 'POST /abdm/consent/approve returned HTTP 201/200');
    const approvedConsent = await approveRes.json();
    assert(approvedConsent.status === 'APPROVED', 'Consent status transitioned to APPROVED');
    assert(!!approvedConsent.approvedAt, 'Consent approval timestamp recorded');
    assert(!!approvedConsent.expiresAt, 'Consent expiration timestamp set (30 days validity)');

    // --- Step 8: Health Information Exchange (Record Sharing) ---
    console.log('\n--- Step 8: Health Information Exchange (Record Sharing) ---');
    const shareRxRes = await fetch(`${BASE_URL}/abdm/share-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAAuth.token}` },
      body: JSON.stringify({
        consentId,
        recordType: 'PRESCRIPTION',
        recordReference: `REC-RX-${Date.now()}`,
      }),
    });
    assert(shareRxRes.status === 201 || shareRxRes.status === 200, 'POST /abdm/share-records (Prescription) returned HTTP 201/200');
    const sharedRx = await shareRxRes.json();
    assert(sharedRx.recordType === 'PRESCRIPTION', 'Prescription record shared via ABDM gateway');

    const shareLabRes = await fetch(`${BASE_URL}/abdm/share-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAAuth.token}` },
      body: JSON.stringify({
        consentId,
        recordType: 'LAB',
        recordReference: `REC-LAB-${Date.now()}`,
      }),
    });
    assert(shareLabRes.status === 201 || shareLabRes.status === 200, 'POST /abdm/share-records (Diagnostic Lab) returned HTTP 201/200');
    const sharedLab = await shareLabRes.json();
    assert(sharedLab.recordType === 'LAB', 'Diagnostic Lab record shared via ABDM gateway');

    // Retrieve shared records history
    const listSharedRes = await fetch(`${BASE_URL}/abdm/shared-records`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(listSharedRes.status === 200, 'GET /abdm/shared-records returned HTTP 200 OK');
    const sharedList = await listSharedRes.json();
    assert(Array.isArray(sharedList) && sharedList.length >= 2, `Health record exchange audit trail loaded (${sharedList.length} shared records)`);

    // --- Step 9: Consent Revocation & Post-Revocation Guard ---
    console.log('\n--- Step 9: Consent Revocation & Post-Revocation Guard ---');
    const revokeRes = await fetch(`${BASE_URL}/abdm/consent/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAAuth.token}` },
      body: JSON.stringify({ consentId }),
    });
    assert(revokeRes.status === 201 || revokeRes.status === 200, 'POST /abdm/consent/revoke returned HTTP 201/200');
    const revokedConsent = await revokeRes.json();
    assert(revokedConsent.status === 'REVOKED', 'Consent status transitioned to REVOKED');

    const postRevokeShareRes = await fetch(`${BASE_URL}/abdm/share-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAAuth.token}` },
      body: JSON.stringify({
        consentId,
        recordType: 'DISCHARGE_SUMMARY',
      }),
    });
    assert(postRevokeShareRes.status === 400, 'Safety Guard: Sharing records under REVOKED consent rejected with HTTP 400 Bad Request');

    // --- Step 10: ABDM Analytics Platform ---
    console.log('\n--- Step 10: ABDM Analytics Platform ---');
    const analRes = await fetch(`${BASE_URL}/abdm/analytics`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(analRes.status === 200, 'GET /abdm/analytics returned HTTP 200 OK');
    const analytics = await analRes.json();
    assert(typeof analytics.linkedAbhaAccounts === 'number', `Analytics: Linked ABHA Accounts: ${analytics.linkedAbhaAccounts}`);
    assert(typeof analytics.recordsShared === 'number', `Analytics: Records Shared: ${analytics.recordsShared}`);
    assert(typeof analytics.facilitiesConnected === 'number', `Analytics: Connected Facilities: ${analytics.facilitiesConnected}`);

    // --- Step 11: Multi-Hospital Isolation Guard ---
    console.log('\n--- Step 11: Multi-Hospital Isolation Guard ---');
    const crossHospitalConsentRes = await fetch(`${BASE_URL}/abdm/consent/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminBAuth.token}` },
      body: JSON.stringify({
        patientId,
        facilityId: '95001a7a-3a65-4fb4-85ad-c0cf7e7d2fa8',
        purpose: 'Cross Hospital Unauthorized Consent Attempt',
      }),
    });
    assert(crossHospitalConsentRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from managing Hospital A ABDM consents');

    console.log('\n==================================================');
    console.log(`🇮🇳 ABDM INTEGRATION E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during ABDM Integration E2E test:', err);
    process.exit(1);
  }
}

runAbdmIntegrationE2ETest();
