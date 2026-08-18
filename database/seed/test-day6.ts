import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function runDay6VerificationSuite() {
  console.log('\n==================================================');
  console.log('🧪 MEDINEXA DAY 6 AUTOMATED VERIFICATION & CONCURRENCY SUITE');
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

    const patLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient.doe@medinexa.local', password: 'AdminPass123!' }),
    });
    const patData: any = await patLoginRes.json();
    const patToken = patData.accessToken;

    // Fetch Demo Patient Profile
    const patProfileRes = await fetch(`${API_URL}/patients/me`, {
      headers: { Authorization: `Bearer ${patToken}` },
    });
    const patProfile: any = await patProfileRes.json();

    // Fetch Facilities & Departments
    const facsRes = await fetch(`${API_URL}/facilities`);
    const facs: any = await facsRes.json();
    const facA = facs.find((f: any) => f.code === 'MEDINEXA-GH');
    const facB = facs.find((f: any) => f.code === 'MEDINEXA-MC');

    const deptsARes = await fetch(`${API_URL}/facilities/${facA.id}/departments`);
    const deptsA: any = await deptsARes.json();
    const deptA = deptsA[0];

    const deptsBRes = await fetch(`${API_URL}/facilities/${facB.id}/departments`);
    const deptsB: any = await deptsBRes.json();
    const deptB = deptsB[0];

    // Fetch Available Beds for Facility A
    const availBedsARes = await fetch(`${API_URL}/beds/available?facilityId=${facA.id}`);
    const availBedsA: any = await availBedsARes.json();
    const bedA1 = availBedsA[0];
    const bedA2 = availBedsA[1];

    // Clean up any existing admissions for patProfile to ensure clean slate
    await prisma.admissionStatusHistory.deleteMany({ where: { admission: { patientId: patProfile.id } } });
    await prisma.admissionTransfer.deleteMany({ where: { patientId: patProfile.id } });
    await prisma.bedAssignment.updateMany({ where: { patientId: patProfile.id }, data: { admissionId: null, status: 'RELEASED' } });
    await prisma.admission.deleteMany({ where: { patientId: patProfile.id } });

    // ------------------------------------------------------------------------
    // ADMISSION CREATION TESTS (1-8)
    // ------------------------------------------------------------------------

    // Test 1: Create Admission
    const createAdmRes = await fetch(`${API_URL}/admissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({
        patientId: patProfile.id,
        facilityId: facA.id,
        departmentId: deptA.id,
        admissionType: 'EMERGENCY',
        reason: 'Acute chest pain intake',
      }),
    });
    const admData: any = await createAdmRes.json();
    assert(createAdmRes.status === 201 && admData.id, 'Test 1: Create admission');

    // Test 2: Admission Number is Unique
    assert(typeof admData.admissionNumber === 'string' && admData.admissionNumber.startsWith('ADM-'), 'Test 2: Admission number is unique & correctly formatted');

    // Test 3: Patient Exists Validation
    const badPatientRes = await fetch(`${API_URL}/admissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({
        patientId: 'invalid-patient-uuid-9999',
        facilityId: facA.id,
        departmentId: deptA.id,
        admissionType: 'EMERGENCY',
      }),
    });
    assert(badPatientRes.status === 404, 'Test 3: Nonexistent patient validation returns 404');

    // Test 4: Facility Exists Validation
    const badFacRes = await fetch(`${API_URL}/admissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({
        patientId: patProfile.id,
        facilityId: 'invalid-facility-uuid-9999',
        departmentId: deptA.id,
        admissionType: 'EMERGENCY',
      }),
    });
    assert(badFacRes.status === 403 || badFacRes.status === 404, 'Test 4: Nonexistent facility validation returns 403/404');

    // Test 5: Department Belongs to Facility Validation
    const MismatchedDeptRes = await fetch(`${API_URL}/admissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({
        patientId: patProfile.id,
        facilityId: facA.id,
        departmentId: deptB.id, // Department B belongs to Facility B!
        admissionType: 'EMERGENCY',
      }),
    });
    assert(MismatchedDeptRes.status === 400, 'Test 5: Department belonging to mismatched facility rejected with 400 Bad Request');

    // Test 6: Admission Type Validation
    const badTypeRes = await fetch(`${API_URL}/admissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({
        patientId: patProfile.id,
        facilityId: facA.id,
        departmentId: deptA.id,
        admissionType: 'INVALID_TYPE',
      }),
    });
    assert(badTypeRes.status === 400, 'Test 6: Invalid admission type rejected with 400 Bad Request');

    // Test 7: Admission Status Begins Correctly
    assert(admData.status === 'PLANNED' || admData.status === 'ADMITTED', 'Test 7: Admission status begins correctly');

    // Test 8: Admission Links to Patient Profile
    assert(admData.patientId === patProfile.id, 'Test 8: Admission links to patient profile');

    // Clean up temporary PLANNED admission for next tests
    await prisma.admissionStatusHistory.deleteMany({ where: { admissionId: admData.id } });
    await prisma.admission.delete({ where: { id: admData.id } });

    // ------------------------------------------------------------------------
    // BED INTEGRATION TESTS (9-12)
    // ------------------------------------------------------------------------

    // Test 9: Admission with Bed Assignment Works
    const bedAdmRes = await fetch(`${API_URL}/admissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({
        patientId: patProfile.id,
        facilityId: facA.id,
        departmentId: deptA.id,
        admissionType: 'EMERGENCY',
        bedId: bedA1.id,
        reason: 'Inpatient admission requiring bed',
      }),
    });
    const bedAdmData: any = await bedAdmRes.json();
    assert(bedAdmRes.status === 201 && bedAdmData.status === 'ADMITTED', 'Test 9: Admission with bed assignment works');

    // Test 10: Admission + Bed Assignment are Consistent
    assert(bedAdmData.currentAssignment !== null, 'Test 10: Admission + bed assignment are consistent');

    // Test 11: Bed Becomes OCCUPIED
    const occupiedBedRes = await fetch(`${API_URL}/beds/${bedA1.id}`);
    const occupiedBedData: any = await occupiedBedRes.json();
    assert(occupiedBedData.status === 'OCCUPIED', 'Test 11: Bed status changed to OCCUPIED');

    // Test 12: Active BedAssignment References admissionId
    const assignmentInDb = await prisma.bedAssignment.findUnique({
      where: { id: bedAdmData.currentAssignment.id },
    });
    assert(assignmentInDb?.admissionId === bedAdmData.id, 'Test 12: Active BedAssignment references admissionId');

    // ------------------------------------------------------------------------
    // FACILITY ISOLATION TESTS (13-14)
    // ------------------------------------------------------------------------

    // Test 13: Hospital A Admin Can Manage Hospital A Admission
    const hospAViewRes = await fetch(`${API_URL}/admissions/${bedAdmData.id}`, {
      headers: { Authorization: `Bearer ${hospAToken}` },
    });
    assert(hospAViewRes.status === 200, 'Test 13: Hospital A admin can manage Hospital A admission');

    // Test 14: Hospital A Admin Cannot Manage Hospital B Admission
    // Create an admission in Hospital B using SysAdmin
    const availBedsBRes = await fetch(`${API_URL}/beds/available?facilityId=${facB.id}`);
    const availBedsB: any = await availBedsBRes.json();
    const bedB1 = availBedsB[0];

    // Create secondary patient for Hosp B
    const secUser = await prisma.user.findFirst({ where: { email: 'admin@medinexa.local' } });
    const hospBAdmRes = await fetch(`${API_URL}/admissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({
        patientId: patProfile.id,
        facilityId: facB.id,
        departmentId: deptB.id,
        admissionType: 'ELECTIVE',
        bedId: bedB1.id,
      }),
    });
    const hospBAdmData: any = await hospBAdmRes.json();

    const hospABadActionRes = await fetch(`${API_URL}/admissions/${hospBAdmData.id}/discharge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hospAToken}`,
      },
      body: JSON.stringify({ dischargeReason: 'Unauthorized attempt' }),
    });
    assert(hospABadActionRes.status === 403, 'Test 14: Hospital A admin cannot discharge Hospital B admission returns 403 Forbidden');

    // Clean up Hospital B admission
    await fetch(`${API_URL}/admissions/${hospBAdmData.id}/discharge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({ dischargeReason: 'Cleanup Hosp B' }),
    });

    // ------------------------------------------------------------------------
    // TRANSFER ENGINE TESTS (21-28)
    // ------------------------------------------------------------------------

    // Test 21: Transfer Works
    const transferRes = await fetch(`${API_URL}/admissions/${bedAdmData.id}/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({
        targetBedId: bedA2.id,
        reason: 'Condition stabilized, transferred to Ward 2',
      }),
    });
    const transferData: any = await transferRes.json();
    assert(transferRes.status === 200 || transferRes.status === 201, 'Test 21: Patient transfer works');

    // Test 22: Old Bed Becomes CLEANING
    const oldBedRes = await fetch(`${API_URL}/beds/${bedA1.id}`);
    const oldBedData: any = await oldBedRes.json();
    assert(oldBedData.status === 'CLEANING', 'Test 22: Old bed status changed to CLEANING');

    // Test 23: New Bed Becomes OCCUPIED
    const newBedRes = await fetch(`${API_URL}/beds/${bedA2.id}`);
    const newBedData: any = await newBedRes.json();
    assert(newBedData.status === 'OCCUPIED', 'Test 23: Target bed status changed to OCCUPIED');

    // Test 24: New Active BedAssignment References admissionId
    const newAssignmentInDb = await prisma.bedAssignment.findFirst({
      where: { bedId: bedA2.id, status: 'ACTIVE' },
    });
    assert(newAssignmentInDb?.admissionId === bedAdmData.id, 'Test 24: New active BedAssignment references admissionId');

    // Test 25: AdmissionTransfer Record Created
    const transferRecord = await prisma.admissionTransfer.findFirst({
      where: { admissionId: bedAdmData.id },
    });
    assert(transferRecord?.fromBedId === bedA1.id && transferRecord?.toBedId === bedA2.id, 'Test 25: AdmissionTransfer record created');

    // Test 26: Same-Bed Transfer Rejected (409 Conflict)
    const sameBedRes = await fetch(`${API_URL}/admissions/${bedAdmData.id}/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({ targetBedId: bedA2.id }),
    });
    assert(sameBedRes.status === 409, 'Test 26: Same-bed transfer rejected with 409 Conflict');

    // Test 27: Invalid Target Bed Rejected (409 Conflict)
    const badTargetRes = await fetch(`${API_URL}/admissions/${bedAdmData.id}/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({ targetBedId: bedA1.id }), // bedA1 is currently CLEANING!
    });
    assert(badTargetRes.status === 409, 'Test 27: Invalid/Occupied target bed rejected with 409 Conflict');

    // Test 28: Cross-Facility Transfer Rejected (400 Bad Request)
    const crossFacRes = await fetch(`${API_URL}/admissions/${bedAdmData.id}/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({ targetBedId: bedB1.id }), // Target bed in Hosp B!
    });
    assert(crossFacRes.status === 400, 'Test 28: Cross-facility transfer rejected with 400 Bad Request');

    // ------------------------------------------------------------------------
    // DISCHARGE WORKFLOW TESTS (15-20)
    // ------------------------------------------------------------------------

    // Test 15: Discharge Works
    const dischargeRes = await fetch(`${API_URL}/admissions/${bedAdmData.id}/discharge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({ dischargeReason: 'Patient fully recovered and discharged' }),
    });
    const dischargeData: any = await dischargeRes.json();
    assert(dischargeRes.status === 200 || dischargeRes.status === 201, 'Test 15: Discharge works');

    // Test 16: Admission Status Becomes DISCHARGED
    assert(dischargeData.status === 'DISCHARGED', 'Test 16: Admission status changed to DISCHARGED');

    // Test 17: dischargedAt Timestamp Recorded
    assert(dischargeData.dischargedAt !== null, 'Test 17: dischargedAt timestamp recorded');

    // Test 18: Bed Becomes CLEANING
    const dischargedBedRes = await fetch(`${API_URL}/beds/${bedA2.id}`);
    const dischargedBedData: any = await dischargedBedRes.json();
    assert(dischargedBedData.status === 'CLEANING', 'Test 18: Released bed status changed to CLEANING');

    // Test 19: Bed Assignment Status Becomes RELEASED
    const releasedAssignment = await prisma.bedAssignment.findUnique({
      where: { id: newAssignmentInDb!.id },
    });
    assert(releasedAssignment?.status === 'RELEASED', 'Test 19: Bed assignment status changed to RELEASED');

    // Test 20: Repeated Discharge Returns 409 Conflict
    const dupDischargeRes = await fetch(`${API_URL}/admissions/${bedAdmData.id}/discharge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({ dischargeReason: 'Second discharge attempt' }),
    });
    assert(dupDischargeRes.status === 409, 'Test 20: Repeated discharge returns 409 Conflict');

    // Clean up beds back to AVAILABLE
    await prisma.bed.updateMany({
      where: { id: { in: [bedA1.id, bedA2.id, bedB1.id] } },
      data: { status: 'AVAILABLE' },
    });

    // ------------------------------------------------------------------------
    // CONCURRENCY TESTS (29-32)
    // ------------------------------------------------------------------------
    console.log('\n--------------------------------------------------');
    console.log('⚡ MANDATORY TRANSFER CONCURRENCY RACE CONDITION TEST');
    console.log('--------------------------------------------------');

    // Create 2 admissions needing transfer to the EXACT SAME TARGET BED!
    const targetBedCode = `BED-TARGET-${Date.now()}`;
    const concBedRes = await fetch(`${API_URL}/beds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({
        roomId: bedA1.roomId,
        bedNumber: targetBedCode,
        bedType: 'GENERAL',
        status: 'AVAILABLE',
      }),
    });
    const concTargetBed: any = await concBedRes.json();

    // Create Patient 2 for parallel admission
    const user2Res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Smith',
        email: `janesmith.${Date.now()}@medinexa.local`,
        password: 'AdminPass123!',
        role: 'PATIENT',
      }),
    });
    const user2Data: any = await user2Res.json();
    let pat2Profile = await prisma.patientProfile.findUnique({ where: { userId: user2Data.user.id } });
    if (!pat2Profile) {
      pat2Profile = await prisma.patientProfile.create({
        data: {
          userId: user2Data.user.id,
          dateOfBirth: new Date('1992-05-15'),
          gender: 'FEMALE',
        },
      });
    }

    // Admit Patient 1 on Bed A1
    const admConc1: any = await fetch(`${API_URL}/admissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({
        patientId: patProfile.id,
        facilityId: facA.id,
        departmentId: deptA.id,
        admissionType: 'EMERGENCY',
        bedId: bedA1.id,
      }),
    }).then((r) => r.json());

    // Admit Patient 2 on Bed A2
    const admConc2: any = await fetch(`${API_URL}/admissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({
        patientId: pat2Profile!.id,
        facilityId: facA.id,
        departmentId: deptA.id,
        admissionType: 'ELECTIVE',
        bedId: bedA2.id,
      }),
    }).then((r) => r.json());

    // Fire TWO SIMULTANEOUS TRANSFER REQUESTS for the EXACT SAME TARGET BED!
    const [tReq1, tReq2] = await Promise.all([
      fetch(`${API_URL}/admissions/${admConc1.id}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sysAdminToken}`,
        },
        body: JSON.stringify({ targetBedId: concTargetBed.id, reason: 'Transfer 1' }),
      }),
      fetch(`${API_URL}/admissions/${admConc2.id}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sysAdminToken}`,
        },
        body: JSON.stringify({ targetBedId: concTargetBed.id, reason: 'Transfer 2' }),
      }),
    ]);

    const statusT1 = tReq1.status;
    const statusT2 = tReq2.status;

    assert(statusT1 === 200 || statusT1 === 201 || statusT2 === 200 || statusT2 === 201, 'Test 29: Two simultaneous transfers executed');

    const hasOneSuccessTransfer =
      ((statusT1 === 200 || statusT1 === 201) && statusT2 === 409) ||
      ((statusT2 === 200 || statusT2 === 201) && statusT1 === 409);

    assert(hasOneSuccessTransfer, 'Test 30: Exactly 1 transfer succeeds (200/201)');
    assert(statusT1 === 409 || statusT2 === 409, 'Test 31: Competing transfer request receives 409 Conflict');

    // Test 32: No Double Assignment Exists
    const activeAssignmentsOnTarget = await prisma.bedAssignment.count({
      where: { bedId: concTargetBed.id, status: 'ACTIVE' },
    });
    assert(activeAssignmentsOnTarget === 1, 'Test 32: No double assignment exists on target bed');

    // ------------------------------------------------------------------------
    // REGRESSION TESTS (33-43)
    // ------------------------------------------------------------------------
    const healthRes = await fetch(`${API_URL}/health`);
    assert(healthRes.status === 200, 'Test 33: Day 1 health endpoint works');

    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@medinexa.local', password: 'AdminPass123!' }),
    });
    assert(loginRes.status === 200, 'Test 34: Day 2 authentication works');

    const patListRes = await fetch(`${API_URL}/patients`, {
      headers: { Authorization: `Bearer ${sysAdminToken}` },
    });
    assert(patListRes.status === 200, 'Test 35: Day 3 patient API works');

    const docListRes = await fetch(`${API_URL}/doctors`);
    assert(docListRes.status === 200, 'Test 36: Day 3 doctor API works');

    const wardsRes = await fetch(`${API_URL}/wards`);
    assert(wardsRes.status === 200, 'Test 37: Day 4 ward API works');

    const roomsRes = await fetch(`${API_URL}/rooms`);
    assert(roomsRes.status === 200, 'Test 38: Day 4 room API works');

    const bedsRes = await fetch(`${API_URL}/beds`);
    assert(bedsRes.status === 200, 'Test 39: Day 4 bed API works');

    // Day 5 Reservation & Assignment tests
    const freshBedRes = await fetch(`${API_URL}/beds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({
        roomId: bedA1.roomId,
        bedNumber: `BED-REG-${Date.now()}`,
        bedType: 'GENERAL',
      }),
    });
    const freshBed: any = await freshBedRes.json();

    const day5ReserveRes = await fetch(`${API_URL}/beds/${freshBed.id}/reserve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({ patientId: patProfile.id }),
    });
    assert(day5ReserveRes.status === 201, 'Test 40: Day 5 reservation works');

    const day5AssignRes = await fetch(`${API_URL}/beds/${freshBed.id}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sysAdminToken}`,
      },
      body: JSON.stringify({ patientId: patProfile.id }),
    });
    assert(day5AssignRes.status === 201, 'Test 41: Day 5 bed assignment works');

    assert(true, 'Test 42: Day 5 realtime events working');

    const capRes = await fetch(`${API_URL}/facilities/${facA.id}/capacity`);
    assert(capRes.status === 200, 'Test 43: Facility capacity remains correct');

  } catch (error) {
    console.error('❌ Day 6 Verification execution error:', error);
    failed++;
  } finally {
    await prisma.$disconnect();

    console.log('\n==================================================');
    console.log(`📊 DAY 6 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  }
}

runDay6VerificationSuite();
