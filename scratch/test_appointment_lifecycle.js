const http = require('http');

const API_HOST = 'localhost';
const API_PORT = 3001;

function apiRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request(
      {
        host: API_HOST,
        port: API_PORT,
        path: `/api/v1${path}`,
        method,
        headers,
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(responseBody);
          } catch (e) {
            parsed = responseBody;
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      },
    );

    req.on('error', (err) => reject(err));
    if (data) req.write(data);
    req.end();
  });
}

async function login(email, password = 'Password123!') {
  const res = await apiRequest('POST', '/auth/login', { email, password });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(res.data)}`);
  }
  return res.data.token || res.data.accessToken;
}

async function runTests() {
  console.log('=== STARTING MEDINEXA APPOINTMENT MODULE E2E TEST SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate Personas
    console.log('[1/10] Authenticating Personas...');
    const patientToken = await login('patient@medinexa.in');
    const doctorToken = await login('dr.deshmukh@medinexa.in');
    const receptionistToken = await login('receptionist.01@medinexa.in');
    assert(patientToken && doctorToken && receptionistToken, 'All 3 personas (Patient, Doctor, Receptionist) authenticated');

    // 2. Patient: Search Doctors & Filter by Specialty
    console.log('\n[2/10] Patient: Search Doctors & Filter Specialty...');
    const docsRes = await apiRequest('GET', '/doctors', null, patientToken);
    assert(docsRes.status === 200 && Array.isArray(docsRes.data) && docsRes.data.length >= 10, `Found ${docsRes.data?.length || 0} active Indian doctors`);

    const cardioDoc = docsRes.data.find((d) => d.specialty?.name === 'Cardiology' || d.department?.name === 'Cardiology') || docsRes.data[0];
    assert(cardioDoc, `Selected Doctor: Dr. ${cardioDoc.user?.firstName} ${cardioDoc.user?.lastName} (${cardioDoc.specialty?.name || cardioDoc.department?.name})`);

    // 3. Patient: View Available Slots
    console.log('\n[3/10] Patient: Query Available Time Slots...');
    const today = new Date();
    const dateStr = new Date(today.getTime() + 86400000 * 3).toISOString().split('T')[0]; // 3 days in future
    const slotsRes = await apiRequest('GET', `/doctors/${cardioDoc.id}/availability?date=${dateStr}`, null, patientToken);
    assert(
      slotsRes.status === 200 && (Array.isArray(slotsRes.data) || slotsRes.data.availableSlots),
      `Retrieved availability slots for date ${dateStr} (${Array.isArray(slotsRes.data) ? slotsRes.data.length : slotsRes.data.availableSlots?.length} slots)`,
    );

    // 4. Patient: Book Appointment
    console.log('\n[4/10] Patient: Book Appointment...');
    const bookRes = await apiRequest(
      'POST',
      '/appointments',
      {
        doctorId: cardioDoc.id,
        appointmentDate: dateStr,
        startTime: '10:00',
        endTime: '10:30',
        type: 'CONSULTATION',
        reason: 'Routine cardiac health review and blood pressure check',
      },
      patientToken,
    );
    assert((bookRes.status === 200 || bookRes.status === 201) && bookRes.data.id, `Appointment booked: #${bookRes.data.appointmentNumber} (Status: ${bookRes.data.status})`);
    const apptId1 = bookRes.data.id;

    // 5. Verify Notifications
    console.log('\n[5/10] Verify In-App Notifications...');
    const notifRes = await apiRequest('GET', '/notifications', null, patientToken);
    assert(notifRes.status === 200 && Array.isArray(notifRes.data), 'Notifications list retrieved');

    // 6. Doctor: Accept Appointment
    console.log('\n[6/10] Doctor: Accept Appointment...');
    const acceptRes = await apiRequest('POST', `/appointments/${apptId1}/accept`, {}, doctorToken);
    assert(acceptRes.status === 200 || acceptRes.status === 201, `Doctor accepted appointment. Status is now: ${acceptRes.data?.status}`);
    assert(acceptRes.data?.status === 'CONFIRMED', 'Appointment status is CONFIRMED');

    // 7. Patient: Reschedule Appointment
    console.log('\n[7/10] Patient: Reschedule Appointment...');
    const reschedRes = await apiRequest(
      'POST',
      `/appointments/${apptId1}/reschedule`,
      {
        appointmentDate: dateStr,
        startTime: '14:00',
        endTime: '14:30',
        reason: 'Work conference rescheduled',
      },
      patientToken,
    );
    assert(reschedRes.status === 200 || reschedRes.status === 201, `Appointment rescheduled. Status: ${reschedRes.data?.status}, New Time: ${reschedRes.data?.startTime}`);
    assert(reschedRes.data?.status === 'RESCHEDULED', 'Appointment status is RESCHEDULED');

    // 8. Receptionist: Modify Appointment
    console.log('\n[8/10] Receptionist: Modify Appointment...');
    const modRes = await apiRequest(
      'PATCH',
      `/appointments/${apptId1}`,
      {
        startTime: '15:00',
        endTime: '15:30',
        status: 'CONFIRMED',
        notes: 'Modified by Front Desk receptionist upon patient telephone call',
      },
      receptionistToken,
    );
    assert(modRes.status === 200, `Receptionist modified appointment. Status: ${modRes.data?.status}, Start Time: ${modRes.data?.startTime}`);

    // 9. Doctor: Complete Appointment
    console.log('\n[9/10] Doctor: Complete Appointment...');
    const compRes = await apiRequest('POST', `/appointments/${apptId1}/complete`, {}, doctorToken);
    assert(compRes.status === 200 || compRes.status === 201, `Doctor completed appointment. Status: ${compRes.data?.status}`);
    assert(compRes.data?.status === 'COMPLETED', 'Appointment status is COMPLETED');

    // 10. Patient: Book & Cancel, and Doctor Reject
    console.log('\n[10/10] Patient Cancel & Doctor Reject Workflows...');
    const dateStr2 = new Date(today.getTime() + 86400000 * 5).toISOString().split('T')[0];
    const bookRes2 = await apiRequest(
      'POST',
      '/appointments',
      {
        doctorId: cardioDoc.id,
        appointmentDate: dateStr2,
        startTime: '11:00',
        endTime: '11:30',
        type: 'CONSULTATION',
        reason: 'Pre-cancellation test',
      },
      patientToken,
    );
    const cancelRes = await apiRequest('POST', `/appointments/${bookRes2.data.id}/cancel`, { reason: 'Patient plans changed' }, patientToken);
    assert(cancelRes.status === 200 || cancelRes.status === 201, `Patient cancelled appointment. Status: ${cancelRes.data?.status}`);
    assert(cancelRes.data?.status === 'CANCELLED', 'Appointment cancelled successfully');

    // Doctor Reject
    const dateStr3 = new Date(today.getTime() + 86400000 * 6).toISOString().split('T')[0];
    const bookRes3 = await apiRequest(
      'POST',
      '/appointments',
      {
        doctorId: cardioDoc.id,
        appointmentDate: dateStr3,
        startTime: '16:00',
        endTime: '16:30',
        type: 'CONSULTATION',
        reason: 'Pre-rejection test',
      },
      patientToken,
    );
    const rejectRes = await apiRequest('POST', `/appointments/${bookRes3.data.id}/reject`, { reason: 'Attending surgeon in emergency OT' }, doctorToken);
    assert(rejectRes.status === 200 || rejectRes.status === 201, `Doctor rejected appointment. Status: ${rejectRes.data?.status}`);
    assert(rejectRes.data?.status === 'CANCELLED', 'Appointment status marked CANCELLED with doctor note');

    // History check
    const historyRes = await apiRequest('GET', '/patients/me/appointments', null, patientToken);
    assert(historyRes.status === 200 && Array.isArray(historyRes.data) && historyRes.data.length >= 3, `Patient appointment history contains ${historyRes.data.length} records`);

    console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
