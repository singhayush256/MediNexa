const API_BASE = 'http://localhost:3001/api/v1';

async function runPublicDoctorDirectoryE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA PUBLIC DOCTOR DIRECTORY E2E TEST');
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
    // Test 1: Fetch public doctors list (no authentication header)
    const listRes = await fetch(`${API_BASE}/public/doctors`);
    assert(listRes.status === 200, 'GET /public/doctors returns HTTP 200 without authentication');

    const doctors = await listRes.json();
    assert(Array.isArray(doctors) && doctors.length > 0, `Public doctor directory returned ${doctors.length} active doctors`);

    // Test 2: Sanitization audit (verify sensitive properties are NOT exposed)
    const doc = doctors[0];
    assert(doc.id && doc.name && doc.specialty && doc.facilityName, 'Public doctor record contains safe public fields (id, name, specialty, facilityName)');
    assert(doc.email === undefined, 'Security Guard: Private user email is NOT exposed');
    assert(doc.passwordHash === undefined, 'Security Guard: Password hash is NOT exposed');
    assert(doc.roleId === undefined, 'Security Guard: Internal role ID is NOT exposed');

    // Test 3: Public doctor detail lookup with availability generator
    const detailRes = await fetch(`${API_BASE}/public/doctors/${doc.id}`);
    assert(detailRes.status === 200, `GET /public/doctors/${doc.id} returns HTTP 200 OK`);

    const detail = await detailRes.json();
    assert(detail.id === doc.id, 'Doctor detail profile matches target ID');
    assert(Array.isArray(detail.availableSlots), `Availability generator returned ${detail.availableSlots.length} slots for doctor`);

    console.log('\n==================================================');
    console.log(`📊 PUBLIC DOCTOR DIRECTORY RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during public doctor directory E2E test:', err);
    process.exit(1);
  }
}

runPublicDoctorDirectoryE2ETest();
