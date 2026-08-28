const API_BASE = 'http://localhost:3001/api/v1';

async function runGuestBookingE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA GUEST APPOINTMENT BOOKING & OTP E2E TEST');
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
    // 1. Fetch public doctor to book
    const listRes = await fetch(`${API_BASE}/public/doctors`);
    const doctors = await listRes.json();
    const targetDoc = doctors[0];

    const detailRes = await fetch(`${API_BASE}/public/doctors/${targetDoc.id}`);
    const detail = await detailRes.json();
    const availableSlot = detail.availableSlots.find((s) => s.available) || { startTime: '14:00', endTime: '14:30' };

    const testPhone = `+1-800-${Math.floor(1000000 + Math.random() * 9000000)}`;

    // Test 1: Send OTP
    console.log('--- Step 1: Request SMS OTP ---');
    const sendOtpRes = await fetch(`${API_BASE}/public/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone }),
    });
    assert(sendOtpRes.status === 201 || sendOtpRes.status === 200, 'POST /public/otp/send returned HTTP 201/200');

    const sendOtpData = await sendOtpRes.json();
    assert(sendOtpData.success === true, 'OTP dispatched successfully via SMS Provider');
    const otpCode = sendOtpData.otp || '123456';

    // Test 2: Verify OTP
    console.log('\n--- Step 2: Verify 6-Digit OTP ---');
    const verifyOtpRes = await fetch(`${API_BASE}/public/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone, otp: otpCode }),
    });
    assert(verifyOtpRes.status === 201 || verifyOtpRes.status === 200, 'POST /public/otp/verify returned HTTP 201/200');

    const verifyData = await verifyOtpRes.json();
    assert(verifyData.verified === true && verifyData.verificationToken, 'OTP verified and token generated');

    // Test 3: Book Guest Appointment
    console.log('\n--- Step 3: Complete Guest Appointment Booking ---');
    const bookingPayload = {
      name: 'Morgan Stanley Guest',
      phone: testPhone,
      email: 'morgan.guest@example.com',
      age: 35,
      gender: 'MALE',
      doctorId: targetDoc.id,
      facilityId: targetDoc.facilityId,
      appointmentDate: '2026-09-05',
      startTime: availableSlot.startTime,
      endTime: availableSlot.endTime,
      reason: 'Preventive health checkup and consultation',
      verificationToken: verifyData.verificationToken,
    };

    const bookRes = await fetch(`${API_BASE}/public/appointments/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload),
    });
    const booking = await bookRes.json();
    if (!bookRes.ok) {
      console.log('Book Error Status:', bookRes.status, booking);
    }
    assert(bookRes.status === 201 || bookRes.status === 200, 'POST /public/appointments/book returned HTTP 201/200');
    assert(booking.bookingNumber && booking.bookingNumber.startsWith('GBK-'), `Guest Booking created with bookingNumber #${booking.bookingNumber}`);
    assert(booking.patientName === 'Morgan Stanley Guest', 'Guest patient demographics saved');

    // Test 4: Slot Double-Booking Protection Guard
    console.log('\n--- Step 4: Slot Double-Booking Protection Guard ---');
    const doubleBookRes = await fetch(`${API_BASE}/public/appointments/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload),
    });
    assert(doubleBookRes.status === 409, 'Double-booking rejected with HTTP 409 Conflict');

    console.log('\n==================================================');
    console.log(`📊 GUEST BOOKING & OTP RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during guest booking E2E test:', err);
    process.exit(1);
  }
}

runGuestBookingE2ETest();
