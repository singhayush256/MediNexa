const API_BASE = 'http://localhost:3001/api/v1';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyReferralWorkflow() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA HOSPITAL REFERRAL WORKFLOW E2E TEST');
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
    // 1. Authenticate Admin A, Admin B, & Doctor
    const adminALogin = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(adminALogin.accessToken, 'Hospital A Admin authenticated successfully');

    const adminBLogin = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospb@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(adminBLogin.accessToken, 'Hospital B Admin authenticated successfully');

    const doctorLogin = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dr.smith@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(doctorLogin.accessToken, 'Doctor authenticated successfully');

    const patientProfile = await prisma.patientProfile.findFirst({
      where: { user: { email: 'patient.doe@medinexa.local' } },
    });
    const facs = await prisma.facility.findMany();
    const facA = facs[0];
    const facB = facs[1] || facs[0];

    // TEST 1: Admin A creates Referral from Hospital A to Hospital B
    const ref1Res = await fetch(API_BASE + '/referrals', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + adminALogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId: patientProfile.id,
        sourceFacilityId: facA.id,
        destinationFacilityId: facB.id,
        reason: 'Inter-hospital specialty care referral',
        clinicalSummary: 'Patient requires specialized cardiac monitoring',
        urgency: 'URGENT',
      }),
    });
    const ref1Data = await ref1Res.json();
    assert(ref1Res.status === 201, `Test 1: Admin A created referral #${ref1Data.referralNumber} successfully (HTTP 201)`);
    assert(ref1Data.referringDoctorId, 'Test 1: referringDoctorId correctly auto-associated for admin user');

    // TEST 2: Query Referrals roster for Admin A & Admin B
    const listARes = await fetch(API_BASE + '/referrals', {
      headers: { Authorization: 'Bearer ' + adminALogin.accessToken },
    }).then((r) => r.json());
    assert(Array.isArray(listARes) && listARes.some((r) => r.id === ref1Data.id), 'Test 2: Hospital A Admin successfully lists referral roster');

    const listBRes = await fetch(API_BASE + '/referrals', {
      headers: { Authorization: 'Bearer ' + adminBLogin.accessToken },
    }).then((r) => r.json());
    assert(Array.isArray(listBRes) && listBRes.some((r) => r.id === ref1Data.id), 'Test 2: Hospital B Admin successfully lists referral roster');

    // TEST 3: Admin B Accepts Referral
    const acceptRes = await fetch(API_BASE + `/referrals/${ref1Data.id}/accept`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + adminBLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    const acceptData = await acceptRes.json();
    assert(acceptRes.status === 200 || acceptRes.status === 201, `Test 3: Admin B accepted referral (Status: ${acceptData.status})`);
    assert(acceptData.status === 'ACCEPTED', 'Test 3: Referral status transitioned: REQUESTED -> ACCEPTED');

    // TEST 4: Record Access Authorization
    const authRecordRes = await fetch(API_BASE + `/referrals/${ref1Data.id}/record-access-authorize`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + adminALogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authorizationType: 'ENCOUNTER_SUMMARY',
        expiresInDays: 7,
      }),
    });
    const authRecordData = await authRecordRes.json();
    assert(authRecordRes.status === 200 || authRecordRes.status === 201, 'Test 4: Medical record access authorized for cross-facility transfer');

    // TEST 5: Create & Reject Referral Workflow
    const ref2Res = await fetch(API_BASE + '/referrals', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + doctorLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId: patientProfile.id,
        sourceFacilityId: facA.id,
        destinationFacilityId: facB.id,
        reason: 'Routine outpatient consultation transfer',
        clinicalSummary: 'Second opinion request',
        urgency: 'ROUTINE',
      }),
    }).then((r) => r.json());

    const rejectRes = await fetch(API_BASE + `/referrals/${ref2Res.id}/reject`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + adminBLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: 'Capacity full at destination facility' }),
    });
    const rejectData = await rejectRes.json();
    assert(rejectRes.status === 200 || rejectRes.status === 201, 'Test 5: Admin B rejected referral request successfully');
    assert(rejectData.status === 'REJECTED', 'Test 5: Referral status transitioned: REQUESTED -> REJECTED');

    console.log('\n==================================================');
    console.log(`📊 REFERRAL WORKFLOW E2E VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal execution error during referral E2E test:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyReferralWorkflow();
