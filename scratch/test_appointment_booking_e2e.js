const API_BASE = 'http://localhost:3001/api/v1';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAppointmentBookingE2E() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA APPOINTMENT BOOKING E2E VERIFICATION');
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
    // 1. Authenticate Patient (Jane Doe)
    const patientLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient.doe@medinexa.local', password: 'Password123!' }),
    }).then((r) => r.json());
    assert(patientLogin.accessToken, 'Patient (Jane Doe) authenticated successfully');

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${patientLogin.accessToken}`,
    };

    // 2. Fetch doctors & facility
    const doc = await prisma.doctorProfile.findFirst({
      include: { user: true, facility: true, department: true },
    });
    assert(doc, `Found target doctor: Dr. ${doc.user.firstName} ${doc.user.lastName}`);

    // 3. Fetch availability for 2026-08-31
    const targetDate = '2026-08-31';
    const availRes = await fetch(`${API_BASE}/doctors/${doc.id}/availability?date=${targetDate}`);
    const slots = await availRes.json();
    assert(Array.isArray(slots) && slots.length > 0, `Availability generator returned ${slots?.length} slots for ${targetDate}`);

    const freeSlot = slots.find((s) => s.available) || slots[0];
    assert(freeSlot, `Selected available slot: ${freeSlot.startTime} - ${freeSlot.endTime}`);

    // 4. Submit appointment booking payload (simulating frontend payload)
    const bookingPayload = {
      patientId: undefined, // Simulating frontend omitting patientId
      doctorId: doc.id,
      facilityId: doc.facilityId,
      departmentId: undefined, // Simulating frontend omitting departmentId
      appointmentDate: targetDate,
      startTime: freeSlot.startTime,
      endTime: freeSlot.endTime,
      type: 'CONSULTATION',
      reason: 'Routine cardiology evaluation and follow-up',
    };

    console.log('\n--- Request Payload ---');
    console.log(JSON.stringify(bookingPayload, null, 2));

    const bookRes = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(bookingPayload),
    });

    console.log(`\nHTTP Response Status: ${bookRes.status}`);
    const bookData = await bookRes.json();
    console.log('--- Response Payload ---');
    console.log(JSON.stringify(bookData, null, 2));

    assert(bookRes.status === 201, 'Test 1: POST /appointments returned HTTP 201 Created');
    assert(bookData.id && bookData.appointmentNumber, `Test 2: Appointment ${bookData.appointmentNumber} created successfully`);
    assert(bookData.patient?.id, 'Test 3: Patient profile correctly linked to appointment');
    assert(bookData.department?.id, 'Test 4: Department ID automatically resolved and populated');

    // 5. Verify patient's my-appointments endpoint
    const myApptsRes = await fetch(`${API_BASE}/patients/me/appointments`, { headers });
    const myAppts = await myApptsRes.json();
    assert(
      Array.isArray(myAppts) && myAppts.some((a) => a.id === bookData.id),
      'Test 5: Booked appointment appears in patient GET /patients/me/appointments',
    );

    console.log('\n==================================================');
    console.log(`📊 APPOINTMENT BOOKING VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal execution error during appointment booking E2E test:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAppointmentBookingE2E();
