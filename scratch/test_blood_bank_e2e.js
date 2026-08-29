const BASE_URL = 'http://localhost:3001/api/v1';

async function runBloodBankE2ETest() {
  console.log('==================================================');
  console.log('🩸 MEDINEXA ENTERPRISE BLOOD BANK & TRANSFUSION E2E TEST');
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
    assert(!!adminAAuth.token, 'Hospital Admin A (Blood Bank Supervisor) authenticated successfully');

    const adminBAuth = await login('admin.hospb@medinexa.local', 'Password123!');
    assert(!!adminBAuth.token, 'Hospital Admin B authenticated successfully');

    const nurseAuth = await login('nurse.station@medinexa.local', 'Password123!');
    assert(!!nurseAuth.token, 'Transfusion Ward Nurse authenticated successfully');

    const patientAuth = await login('patient.doe@medinexa.local', 'Password123!');
    assert(!!patientAuth.token, 'Patient authenticated successfully');

    // Retrieve target test patient profile
    const patProfRes = await fetch(`${BASE_URL}/patient-portal/profile`, {
      headers: { Authorization: `Bearer ${patientAuth.token}` },
    });
    const patientProfile = await patProfRes.json();
    assert(!!patientProfile.id, `Target patient identified (${patientProfile.user?.firstName} ${patientProfile.user?.lastName})`);

    // --- Step 1: RBAC Security Guards ---
    console.log('\n--- Step 1: RBAC Security Guards ---');
    const patDonorRes = await fetch(`${BASE_URL}/blood-bank/donors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientAuth.token}`,
      },
      body: JSON.stringify({
        fullName: 'Hacker Donor',
        phone: '+1-555-000-9999',
        bloodGroup: 'O_POSITIVE',
      }),
    });
    assert(patDonorRes.status === 403, 'RBAC Guard: Patient role blocked with HTTP 403 Forbidden from Blood Bank donor registration');

    // --- Step 2: Donor Registration & Directory ---
    console.log('\n--- Step 2: Donor Registration & Directory ---');
    const donorPayload = {
      fullName: `Marcus Aurelius ${Date.now().toString().slice(-4)}`,
      phone: '+1-800-555-BLOOD',
      email: 'marcus.donor@example.com',
      bloodGroup: 'O_NEGATIVE', // Universal donor
      dateOfBirth: '1992-06-15T00:00:00.000Z',
      gender: 'MALE',
      address: '450 Donor Way, Suite 10',
    };

    const regDonorRes = await fetch(`${BASE_URL}/blood-bank/donors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify(donorPayload),
    });
    assert(regDonorRes.status === 201 || regDonorRes.status === 200, 'POST /blood-bank/donors returned HTTP 201/200');
    const donor1 = await regDonorRes.json();
    assert(!!donor1.donorCode, `Universal Blood Donor registered (#${donor1.donorCode} - ${donor1.bloodGroup})`);

    const getDonorsRes = await fetch(`${BASE_URL}/blood-bank/donors`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(getDonorsRes.status === 200, 'GET /blood-bank/donors returned HTTP 200 OK');
    const donorsList = await getDonorsRes.json();
    assert(Array.isArray(donorsList) && donorsList.length > 0, `Donor registry loaded (${donorsList.length} registered donors)`);

    // --- Step 3: Low-Hemoglobin Safety Guard ---
    console.log('\n--- Step 3: Low-Hemoglobin Safety Guard ---');
    const lowHbRes = await fetch(`${BASE_URL}/blood-bank/donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        donorId: donor1.id,
        hemoglobin: 11.2, // Below 12.5 g/dL threshold
        bloodPressure: '110/70',
        weight: 65,
      }),
    });
    assert(lowHbRes.status === 400, 'Safety Guard: Donation with low hemoglobin (<12.5 g/dL) rejected with HTTP 400 Bad Request');

    // --- Step 4: Record Donation & Generate Cold-Chain Inventory ---
    console.log('\n--- Step 4: Record Donation & Generate Cold-Chain Inventory ---');
    const recordDonationRes = await fetch(`${BASE_URL}/blood-bank/donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        donorId: donor1.id,
        hemoglobin: 14.2,
        bloodPressure: '120/80',
        weight: 74,
        component: 'PACKED_RBC',
        infectiousScreening: 'NEGATIVE',
      }),
    });
    assert(recordDonationRes.status === 201 || recordDonationRes.status === 200, 'POST /blood-bank/donations returned HTTP 201/200');
    const donationData = await recordDonationRes.json();
    assert(donationData.donation.status === 'COMPLETED', `Donation recorded (#${donationData.donation.donationNumber})`);
    assert(!!donationData.inventoryUnit?.unitNumber, `Separated Packed RBC inventory unit created (#${donationData.inventoryUnit?.unitNumber})`);

    const bloodUnit = donationData.inventoryUnit;

    // --- Step 5: Cold-Chain Inventory Repository ---
    console.log('\n--- Step 5: Cold-Chain Inventory Repository ---');
    const getInvRes = await fetch(`${BASE_URL}/blood-bank/inventory`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(getInvRes.status === 200, 'GET /blood-bank/inventory returned HTTP 200 OK');
    const inventory = await getInvRes.json();
    assert(Array.isArray(inventory) && inventory.length > 0, `Cold-chain inventory loaded (${inventory.length} blood units)`);

    // --- Step 6: Clinician Blood Requisition ---
    console.log('\n--- Step 6: Clinician Blood Requisition ---');
    const reqBloodRes = await fetch(`${BASE_URL}/blood-bank/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${docAuth.token}`,
      },
      body: JSON.stringify({
        patientId: patientProfile.id,
        bloodGroup: 'O_POSITIVE',
        component: 'PACKED_RBC',
        unitsRequested: 1,
        urgency: 'STAT_EMERGENCY',
        clinicalIndication: 'Acute gastrointestinal hemorrhage stabilization',
      }),
    });
    assert(reqBloodRes.status === 201 || reqBloodRes.status === 200, 'POST /blood-bank/request returned HTTP 201/200');
    const bloodRequest = await reqBloodRes.json();
    assert(bloodRequest.status === 'REQUESTED', `Blood Requisition logged (#${bloodRequest.requestNumber})`);

    // --- Step 7: Serological Crossmatch Testing ---
    console.log('\n--- Step 7: Serological Crossmatch Testing ---');
    const crossMatchRes = await fetch(`${BASE_URL}/blood-bank/crossmatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        requestId: bloodRequest.id,
        unitId: bloodUnit.id,
        method: 'AHG_GEL_CARD',
        compatibility: 'COMPATIBLE',
      }),
    });
    assert(crossMatchRes.status === 201 || crossMatchRes.status === 200, 'POST /blood-bank/crossmatch returned HTTP 201/200');
    const crossMatch = await crossMatchRes.json();
    assert(crossMatch.compatibility === 'COMPATIBLE', `Crossmatch verified: Unit #${bloodUnit.unitNumber} is COMPATIBLE with Patient`);

    // --- Step 8: Blood Dispensing & Issue Workflow ---
    console.log('\n--- Step 8: Blood Dispensing & Issue Workflow ---');
    const issueRes = await fetch(`${BASE_URL}/blood-bank/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        requestId: bloodRequest.id,
        unitId: bloodUnit.id,
        issuedToStaffName: 'Nurse Station 4 - ICU',
      }),
    });
    assert(issueRes.status === 200 || issueRes.status === 201, 'POST /blood-bank/issue returned HTTP 200/201');
    const issueData = await issueRes.json();
    assert(issueData.unit.status === 'ISSUED', 'Blood unit status transitioned: RESERVED -> ISSUED');
    assert(issueData.request.status === 'ISSUED', 'Blood request status transitioned: APPROVED -> ISSUED');

    // --- Step 9: Bedside Transfusion & Adverse Reaction Telemetry ---
    console.log('\n--- Step 9: Bedside Transfusion & Adverse Reaction Telemetry ---');
    const transfusionRes = await fetch(`${BASE_URL}/blood-bank/transfusion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${nurseAuth.token}`,
      },
      body: JSON.stringify({
        requestId: bloodRequest.id,
        unitId: bloodUnit.id,
        adverseReaction: false,
        preVitals: 'BP: 116/74, HR: 76 bpm, SpO2: 98%, Temp: 98.4 F',
        postVitals: 'BP: 120/80, HR: 74 bpm, SpO2: 99%, Temp: 98.6 F',
      }),
    });
    assert(transfusionRes.status === 201 || transfusionRes.status === 200, 'POST /blood-bank/transfusion returned HTTP 201/200');
    const transfusion = await transfusionRes.json();
    assert(transfusion.status === 'TRANSFUSED', `Bedside transfusion completed for unit #${bloodUnit.unitNumber}`);

    // --- Step 10: Blood Bank Intelligence & Analytics ---
    console.log('\n--- Step 10: Blood Bank Intelligence & Analytics ---');
    const getAnalRes = await fetch(`${BASE_URL}/blood-bank/analytics`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(getAnalRes.status === 200, 'GET /blood-bank/analytics returned HTTP 200 OK');
    const analytics = await getAnalRes.json();
    assert(typeof analytics.totalUnits === 'number', `Analytics: Total Units in Cold-Chain: ${analytics.totalUnits}`);
    assert(typeof analytics.availableUnits === 'number', `Analytics: Available Units: ${analytics.availableUnits}`);
    assert(typeof analytics.transfusedToday === 'number', `Analytics: Transfusions Today: ${analytics.transfusedToday}`);
    assert(analytics.stockByGroup !== undefined, 'Analytics: Stock by Blood Group histogram available');

    // --- Step 11: Multi-Hospital Isolation Guards ---
    console.log('\n--- Step 11: Multi-Hospital Isolation Guards ---');
    const crossInvRes = await fetch(`${BASE_URL}/blood-bank/inventory?facilityId=95001a7a-3a65-4fb4-85ad-c0cf7e7d2fa8`, {
      headers: { Authorization: `Bearer ${adminBAuth.token}` },
    });
    assert(crossInvRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from Hospital A inventory');

    console.log('\n==================================================');
    console.log(`📊 BLOOD BANK E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during Blood Bank E2E test:', err);
    process.exit(1);
  }
}

runBloodBankE2ETest();
