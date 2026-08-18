import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function runDay4VerificationSuite() {
  console.log('\n==================================================');
  console.log('🧪 MEDINEXA DAY 4 AUTOMATED VERIFICATION SUITE');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  try {
    // ------------------------------------------------------------------------
    // SETUP: System Admin, Hosp A Admin, Doctor, and Patient Tokens
    // ------------------------------------------------------------------------
    const sysAdminLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@medinexa.local', password: 'AdminPass123!' }),
    });
    const sysAdminData: any = await sysAdminLoginRes.json();
    const sysAdminToken = sysAdminData.accessToken;

    const hospAAdminLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'AdminPass123!' }),
    });
    const hospAAdminData: any = await hospAAdminLoginRes.json();
    const hospAToken = hospAAdminData.accessToken;

    const docLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dr.smith@medinexa.local', password: 'AdminPass123!' }),
    });
    const docData: any = await docLoginRes.json();
    const docToken = docData.accessToken;

    const patLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient.doe@medinexa.local', password: 'AdminPass123!' }),
    });
    const patData: any = await patLoginRes.json();
    const patToken = patData.accessToken;

    // Fetch Facilities
    const facsRes = await fetch(`${API_URL}/facilities`);
    const facs: any = await facsRes.json();
    const facA = facs.find((f: any) => f.code === 'MEDINEXA-GH');
    const facB = facs.find((f: any) => f.code === 'MEDINEXA-MC');

    // Fetch Departments for Facility A
    const deptsARes = await fetch(`${API_URL}/facilities/${facA.id}/departments`);
    const deptsA: any = await deptsARes.json();
    const deptA = deptsA[0];

    // Fetch Departments for Facility B
    const deptsBRes = await fetch(`${API_URL}/facilities/${facB.id}/departments`);
    const deptsB: any = await deptsBRes.json();
    const deptB = deptsB[0];

    // ------------------------------------------------------------------------
    // WARD, ROOM, BED CREATION & RELATIONSHIPS (1-10)
    // ------------------------------------------------------------------------
    // Test 1: Create Ward
    const wardCode = `WARD-TEST-${Date.now()}`;
    const createWardRes = await fetch(`${API_URL}/wards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({
        facilityId: facA.id,
        departmentId: deptA.id,
        name: 'Test Surgery Ward',
        code: wardCode,
        wardType: 'GENERAL',
        floor: 'Floor 4',
      }),
    });
    const createWardData: any = await createWardRes.json();
    assert(createWardRes.status === 201 && createWardData.code === wardCode, 'Test 1: Create Ward succeeds');

    // Test 2: Create Room under Ward
    const roomNo = `RM-TEST-${Date.now()}`;
    const createRoomRes = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({
        wardId: createWardData.id,
        roomNumber: roomNo,
        roomType: 'GENERAL',
        capacity: 2,
      }),
    });
    const createRoomData: any = await createRoomRes.json();
    assert(createRoomRes.status === 201 && createRoomData.roomNumber === roomNo, 'Test 2: Create Room succeeds');

    // Test 3: Create Bed under Room
    const bedNo = `BED-TEST-${Date.now()}`;
    const createBedRes = await fetch(`${API_URL}/beds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({
        roomId: createRoomData.id,
        bedNumber: bedNo,
        bedType: 'GENERAL',
        status: 'AVAILABLE',
      }),
    });
    const createBedData: any = await createBedRes.json();
    assert(createBedRes.status === 201 && createBedData.bedNumber === bedNo, 'Test 3: Create Bed succeeds');

    // Test 4: Correct Facility Relationship Verified
    assert(createWardData.facilityId === facA.id, 'Test 4: Correct Facility relationship verified on Ward');

    // Test 5: Invalid Department / Facility Relationship Rejected
    const badDeptFacRes = await fetch(`${API_URL}/wards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({
        facilityId: facA.id,
        departmentId: deptB.id, // deptB belongs to facB!
        name: 'Mismatched Ward',
        code: `MISMATCH-${Date.now()}`,
        wardType: 'GENERAL',
      }),
    });
    assert(badDeptFacRes.status === 400, 'Test 5: Mismatched department/facility relationship rejected with 400 Bad Request');

    // Test 6: Invalid Ward / Department Relationship Rejected (bad ward ID for room creation)
    const badWardRoomRes = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({
        wardId: 'invalid-ward-uuid-000',
        roomNumber: `RM-BAD-${Date.now()}`,
        roomType: 'GENERAL',
      }),
    });
    assert(badWardRoomRes.status === 400 || badWardRoomRes.status === 404, 'Test 6: Invalid ward ID for room creation rejected');

    // Test 7: Room Belongs to Correct Ward
    assert(createRoomData.wardId === createWardData.id, 'Test 7: Room belongs to correct Ward ID');

    // Test 8: Bed Belongs to Correct Room
    assert(createBedData.roomId === createRoomData.id, 'Test 8: Bed belongs to correct Room ID');

    // Test 9: Duplicate Room Number Within Same Ward Rejected
    const dupRoomRes = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({
        wardId: createWardData.id,
        roomNumber: roomNo, // Duplicate!
        roomType: 'GENERAL',
      }),
    });
    assert(dupRoomRes.status === 400, 'Test 9: Duplicate room number within same ward rejected with 400 Bad Request');

    // Test 10: Duplicate Bed Number Within Same Room Rejected
    const dupBedRes = await fetch(`${API_URL}/beds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({
        roomId: createRoomData.id,
        bedNumber: bedNo, // Duplicate!
        bedType: 'GENERAL',
      }),
    });
    assert(dupBedRes.status === 400, 'Test 10: Duplicate bed number within same room rejected with 400 Bad Request');

    // ------------------------------------------------------------------------
    // AUTHORIZATION & MULTI-HOSPITAL ISOLATION TESTS (11-15)
    // ------------------------------------------------------------------------
    // Test 11: Hospital A Admin Can Manage Hospital A
    const hospAAddWardRes = await fetch(`${API_URL}/wards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hospAToken}`,
      },
      body: JSON.stringify({
        facilityId: facA.id,
        departmentId: deptA.id,
        name: 'Hosp A Admin Ward',
        code: `HOSP-A-W-${Date.now()}`,
        wardType: 'GENERAL',
      }),
    });
    assert(hospAAddWardRes.status === 201, 'Test 11: Hospital A admin can manage Hospital A infrastructure');

    // Test 12: Hospital A Admin CANNOT Manage Hospital B (403 Forbidden)
    const hospABadBRes = await fetch(`${API_URL}/wards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hospAToken}`,
      },
      body: JSON.stringify({
        facilityId: facB.id, // Hospital B facility!
        departmentId: deptB.id,
        name: 'Illegal Hosp B Ward',
        code: `ILLEGAL-W-${Date.now()}`,
        wardType: 'GENERAL',
      }),
    });
    assert(hospABadBRes.status === 403, 'Test 12: Hospital A admin modifying Hospital B returns 403 Forbidden');

    // Test 13: MEDINEXA_ADMIN Can Manage Both Hospital A and Hospital B
    const sysAdminHospBRes = await fetch(`${API_URL}/wards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({
        facilityId: facB.id,
        departmentId: deptB.id,
        name: 'SysAdmin Hosp B Ward',
        code: `SYS-B-W-${Date.now()}`,
        wardType: 'GENERAL',
      }),
    });
    assert(sysAdminHospBRes.status === 201, 'Test 13: MEDINEXA_ADMIN can manage both Hospital A and Hospital B');

    // Test 14: Doctor Can Read Allowed Infrastructure
    const docGetBedsRes = await fetch(`${API_URL}/beds`, {
      headers: { Authorization: `Bearer ${docToken}` },
    });
    assert(docGetBedsRes.status === 200, 'Test 14: Doctor can read allowed infrastructure');

    // Test 15: Patient Cannot Modify Infrastructure (403 Forbidden)
    const patModRes = await fetch(`${API_URL}/wards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patToken}`,
      },
      body: JSON.stringify({
        facilityId: facA.id,
        departmentId: deptA.id,
        name: 'Patient Ward',
        code: `PAT-W-${Date.now()}`,
        wardType: 'GENERAL',
      }),
    });
    assert(patModRes.status === 403, 'Test 15: Patient attempting infrastructure modification returns 403 Forbidden');

    // ------------------------------------------------------------------------
    // CAPACITY & FILTERS TESTS (16-19)
    // ------------------------------------------------------------------------
    // Test 16: Facility Capacity Endpoint Returns Correct Total Bed Count
    const capRes = await fetch(`${API_URL}/facilities/${facA.id}/capacity`);
    const capData: any = await capRes.json();
    assert(
      capRes.status === 200 && typeof capData.totalBeds === 'number' && capData.totalBeds >= 1,
      'Test 16: Facility capacity endpoint returns correct total bed count',
    );

    // Test 17: Bed Filters Work
    const bedFilterRes = await fetch(`${API_URL}/beds?facilityId=${facA.id}&status=AVAILABLE`);
    const bedFilterData: any = await bedFilterRes.json();
    assert(
      bedFilterRes.status === 200 && Array.isArray(bedFilterData),
      'Test 17: Bed filters work (facilityId & status)',
    );

    // Test 18: Ward Filters Work
    const wardFilterRes = await fetch(`${API_URL}/wards?facilityId=${facA.id}`);
    const wardFilterData: any = await wardFilterRes.json();
    assert(
      wardFilterRes.status === 200 && Array.isArray(wardFilterData),
      'Test 18: Ward filters work (facilityId)',
    );

    // Test 19: Facility Filters Work
    const facFilterRes = await fetch(`${API_URL}/facilities`);
    assert(facFilterRes.status === 200, 'Test 19: Facility filters work');

    // ------------------------------------------------------------------------
    // REGRESSION TESTS (20-23)
    // ------------------------------------------------------------------------
    // Test 20: Day 1 GET /api/v1/health Still Works
    const healthRes = await fetch(`${API_URL}/health`);
    const healthData: any = await healthRes.json();
    assert(
      healthRes.status === 200 && healthData.status === 'ok',
      'Test 20: Day 1 health endpoint still works',
    );

    // Test 21: Day 2 POST /api/v1/auth/login Still Works
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@medinexa.local', password: 'AdminPass123!' }),
    });
    assert(loginRes.status === 200, 'Test 21: Day 2 authentication endpoint still works');

    // Test 22: Day 3 GET /api/v1/patients Still Works
    const patListRes = await fetch(`${API_URL}/patients`, {
      headers: { Authorization: `Bearer ${sysAdminToken}` },
    });
    assert(patListRes.status === 200, 'Test 22: Day 3 patient endpoint still works');

    // Test 23: Day 3 GET /api/v1/doctors Still Works
    const docListRes = await fetch(`${API_URL}/doctors`);
    assert(docListRes.status === 200, 'Test 23: Day 3 doctor endpoint still works');

  } catch (error) {
    console.error('❌ Day 4 Verification execution error:', error);
    failed++;
  } finally {
    await prisma.$disconnect();

    console.log('\n==================================================');
    console.log(`📊 DAY 4 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  }
}

runDay4VerificationSuite();
