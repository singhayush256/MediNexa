const API_BASE = 'http://localhost:3001/api/v1';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAdmissionEngine() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA ADMISSION & BED ENGINE E2E VERIFICATION');
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
    // 1. Authenticate Hospital Admin & Doctor
    const adminLogin = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(adminLogin.accessToken, 'Hospital Admin authenticated successfully');

    const patientProfile = await prisma.patientProfile.findFirst({
      where: { user: { email: 'patient.doe@medinexa.local' } },
    });
    const facility = await prisma.facility.findFirst();
    const department = await prisma.department.findFirst({ where: { facilityId: facility.id } });

    // Clean any prior active admission for patient at facility to avoid conflict
    await prisma.admission.updateMany({
      where: {
        patientId: patientProfile.id,
        facilityId: facility.id,
        status: { in: ['PLANNED', 'ADMITTED', 'TRANSFERRED', 'DISCHARGE_PENDING'] },
      },
      data: { status: 'DISCHARGED', dischargedAt: new Date() },
    });

    // TEST 1: Create Admission without specifying bedId -> Auto Bed Allocation
    const createRes = await fetch(API_BASE + '/admissions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + adminLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId: patientProfile.id,
        facilityId: facility.id,
        departmentId: department.id,
        admissionType: 'EMERGENCY',
        reason: 'Acute cardiac monitoring required',
      }),
    });
    const createData = await createRes.json();
    if (createRes.status !== 201) {
      console.log('Create Admission Error:', createRes.status, JSON.stringify(createData, null, 2));
    }
    assert(createRes.status === 201, `Test 1: Admission #${createData.admissionNumber} created successfully (HTTP 201)`);
    assert(createData.status === 'ADMITTED', 'Test 1: Admission status automatically set to ADMITTED');
    assert(createData.currentAssignment && createData.currentAssignment.bed, 'Test 1: Automatic bed assignment succeeded (currentAssignment populated)');
    const bed1Id = createData.currentAssignment.bedId;
    console.log(`   -> Allocated Bed #${createData.currentAssignment.bed.bedNumber} (Room ${createData.currentAssignment.bed.room?.roomNumber})`);

    // TEST 2: Verify Bed Status is OCCUPIED
    const bed1Record = await prisma.bed.findUnique({ where: { id: bed1Id } });
    assert(bed1Record.status === 'OCCUPIED', 'Test 2: Assigned bed status updated to OCCUPIED in database');

    // TEST 3: Bed Transfer
    const availableBeds = await prisma.bed.findMany({
      where: { facilityId: facility.id, status: 'AVAILABLE', isActive: true, id: { not: bed1Id } },
    });
    assert(availableBeds.length > 0, 'Found available target bed for transfer test');
    const bed2 = availableBeds[0];

    const transferRes = await fetch(API_BASE + `/admissions/${createData.id}/transfer`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + adminLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetBedId: bed2.id,
        reason: 'Patient transferred to ICU specialty bed',
      }),
    });
    const transferData = await transferRes.json();
    const currentAss = transferData.currentAssignment || (Array.isArray(transferData.bedAssignments) ? transferData.bedAssignments.find(a => a.status === 'ACTIVE') : null);
    assert(transferData && currentAss && currentAss.bedId === bed2.id, `Test 3: currentAssignment updated to Bed #${currentAss?.bed?.bedNumber || bed2.bedNumber}`);

    // Verify old bed released & new bed occupied
    const oldBedPostTransfer = await prisma.bed.findUnique({ where: { id: bed1Id } });
    const newBedPostTransfer = await prisma.bed.findUnique({ where: { id: bed2.id } });
    assert(oldBedPostTransfer.status === 'AVAILABLE' || oldBedPostTransfer.status === 'CLEANING', 'Test 3: Old bed status released (AVAILABLE/CLEANING)');
    assert(newBedPostTransfer.status === 'OCCUPIED', 'Test 3: Target bed status set to OCCUPIED');

    // TEST 4: Patient Discharge
    const dischargeRes = await fetch(API_BASE + `/admissions/${createData.id}/discharge`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + adminLogin.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dischargeReason: 'Patient fully recovered and stable for outpatient discharge',
      }),
    });
    const dischargeData = await dischargeRes.json();
    assert(dischargeRes.status === 200 || dischargeRes.status === 201, 'Test 4: Patient discharged successfully');
    assert(dischargeData.status === 'DISCHARGED', 'Test 4: Admission status updated to DISCHARGED');
    assert(dischargeData.currentAssignment === null, 'Test 4: Active currentAssignment cleared upon discharge');

    const bed2PostDischarge = await prisma.bed.findUnique({ where: { id: bed2.id } });
    assert(bed2PostDischarge.status === 'AVAILABLE' || bed2PostDischarge.status === 'CLEANING', 'Test 4: Discharged bed freed (status: AVAILABLE/CLEANING)');

    console.log('\n==================================================');
    console.log(`📊 ADMISSION & BED ENGINE RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal execution error during admission E2E test:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdmissionEngine();
