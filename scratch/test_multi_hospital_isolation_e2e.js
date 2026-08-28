const API_BASE = 'http://localhost:3001/api/v1';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyMultiHospitalIsolation() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA MULTI-HOSPITAL ISOLATION E2E TEST');
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
    // 1. Authenticate Admin A & Admin B
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

    const facs = await prisma.facility.findMany();
    const facA = facs[0];
    const facB = facs[1] || facs[0];

    // TEST 1: Wards & Rooms Isolation
    const wardsA = await fetch(API_BASE + `/wards?facilityId=${facA.id}`, {
      headers: { Authorization: 'Bearer ' + adminALogin.accessToken },
    }).then((r) => r.json());
    const wardsB = await fetch(API_BASE + `/wards?facilityId=${facB.id}`, {
      headers: { Authorization: 'Bearer ' + adminBLogin.accessToken },
    }).then((r) => r.json());
    assert(Array.isArray(wardsA) && wardsA.every((w) => w.facilityId === facA.id), 'Test 1: Wards for Hospital A isolated to Facility A');
    assert(Array.isArray(wardsB) && wardsB.every((w) => w.facilityId === facB.id), 'Test 1: Wards for Hospital B isolated to Facility B');

    // TEST 2: Beds Isolation
    const bedsA = await fetch(API_BASE + `/beds?facilityId=${facA.id}`, {
      headers: { Authorization: 'Bearer ' + adminALogin.accessToken },
    }).then((r) => r.json());
    const bedsB = await fetch(API_BASE + `/beds?facilityId=${facB.id}`, {
      headers: { Authorization: 'Bearer ' + adminBLogin.accessToken },
    }).then((r) => r.json());
    assert(Array.isArray(bedsA) && bedsA.every((b) => b.facilityId === facA.id), 'Test 2: Beds for Hospital A isolated to Facility A');
    assert(Array.isArray(bedsB) && bedsB.every((b) => b.facilityId === facB.id), 'Test 2: Beds for Hospital B isolated to Facility B');

    // TEST 3: Admissions Isolation
    const admA = await fetch(API_BASE + `/admissions?facilityId=${facA.id}`, {
      headers: { Authorization: 'Bearer ' + adminALogin.accessToken },
    }).then((r) => r.json());
    const admB = await fetch(API_BASE + `/admissions?facilityId=${facB.id}`, {
      headers: { Authorization: 'Bearer ' + adminBLogin.accessToken },
    }).then((r) => r.json());
    assert(Array.isArray(admA) && admA.every((a) => a.facilityId === facA.id), 'Test 3: Admissions for Hospital A isolated to Facility A');
    assert(Array.isArray(admB) && admB.every((a) => a.facilityId === facB.id), 'Test 3: Admissions for Hospital B isolated to Facility B');

    // TEST 4: Encounters Isolation
    const encA = await fetch(API_BASE + `/encounters?facilityId=${facA.id}`, {
      headers: { Authorization: 'Bearer ' + adminALogin.accessToken },
    }).then((r) => r.json());
    const encB = await fetch(API_BASE + `/encounters?facilityId=${facB.id}`, {
      headers: { Authorization: 'Bearer ' + adminBLogin.accessToken },
    }).then((r) => r.json());
    assert(Array.isArray(encA) && encA.every((e) => e.facilityId === facA.id), 'Test 4: Encounters for Hospital A isolated to Facility A');
    assert(Array.isArray(encB) && encB.every((e) => e.facilityId === facB.id), 'Test 4: Encounters for Hospital B isolated to Facility B');

    // TEST 5: Appointments Isolation
    const apptsA = await fetch(API_BASE + `/appointments?facilityId=${facA.id}`, {
      headers: { Authorization: 'Bearer ' + adminALogin.accessToken },
    }).then((r) => r.json());
    const apptsB = await fetch(API_BASE + `/appointments?facilityId=${facB.id}`, {
      headers: { Authorization: 'Bearer ' + adminBLogin.accessToken },
    }).then((r) => r.json());
    assert(Array.isArray(apptsA) && apptsA.every((a) => a.facilityId === facA.id), 'Test 5: Appointments for Hospital A isolated to Facility A');
    assert(Array.isArray(apptsB) && apptsB.every((a) => a.facilityId === facB.id), 'Test 5: Appointments for Hospital B isolated to Facility B');

    // TEST 6: Referrals Facility Filter
    const refA = await fetch(API_BASE + `/referrals?facilityId=${facA.id}`, {
      headers: { Authorization: 'Bearer ' + adminALogin.accessToken },
    }).then((r) => r.json());
    assert(
      Array.isArray(refA) && refA.every((r) => r.sourceFacilityId === facA.id || r.destinationFacilityId === facA.id),
      'Test 6: Referrals filtered by facilityId include only relevant cross-hospital transfer requests',
    );

    console.log('\n==================================================');
    console.log(`📊 MULTI-HOSPITAL ISOLATION RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal execution error during isolation E2E test:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyMultiHospitalIsolation();
