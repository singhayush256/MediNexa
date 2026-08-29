const BASE_URL = 'http://localhost:3001/api/v1';

async function runPatientPortalE2ETest() {
  console.log('==================================================');
  console.log('📱 MEDINEXA PATIENT MOBILE APP & SELF-SERVICE PORTAL E2E TEST');
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

    const patient1Auth = await login('patient.doe@medinexa.local', 'Password123!');
    assert(!!patient1Auth.token, 'Patient 1 (Jane Doe) authenticated successfully');

    const patient2Auth = await login('john.doe@medinexa.local', 'Password123!');
    assert(!!patient2Auth.token, 'Patient 2 (John Doe) authenticated successfully');

    const docAuth = await login('doc.reminder@medinexa.local', 'Password123!');
    assert(!!docAuth.token, 'Attending Doctor authenticated successfully');

    const adminAAuth = await login('admin.hospa@medinexa.local', 'Password123!');
    assert(!!adminAAuth.token, 'Hospital Admin A authenticated successfully');

    const adminBAuth = await login('admin.hospb@medinexa.local', 'Password123!');
    assert(!!adminBAuth.token, 'Hospital Admin B authenticated successfully');

    // --- Step 1: Patient Profile Demographics Management ---
    console.log('\n--- Step 1: Patient Profile Demographics Management ---');
    const getProfRes = await fetch(`${BASE_URL}/patient-portal/profile`, {
      headers: { Authorization: `Bearer ${patient1Auth.token}` },
    });
    assert(getProfRes.status === 200, 'GET /patient-portal/profile returned HTTP 200 OK');
    const profile = await getProfRes.json();
    assert(!!profile.id && !!profile.user, `Patient Profile loaded for ${profile.user?.firstName} ${profile.user?.lastName}`);

    const updateProfRes = await fetch(`${BASE_URL}/patient-portal/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patient1Auth.token}`,
      },
      body: JSON.stringify({
        phone: '+1-800-555-0199',
        address: '742 Evergreen Terrace, Suite 400',
        bloodGroup: 'O_POSITIVE',
        allergies: 'Penicillin, Dust Mites',
        emergencyContactName: 'John Doe Sr.',
        emergencyContactPhone: '+1-800-555-9999',
        emergencyContactRelation: 'Spouse',
      }),
    });
    assert(updateProfRes.status === 200, 'PATCH /patient-portal/profile returned HTTP 200 OK');
    const updatedProf = await updateProfRes.json();
    assert(updatedProf.bloodGroup === 'O_POSITIVE', 'Patient blood group and emergency contact updated successfully');

    // --- Step 2: Appointment Timeline & Booking History ---
    console.log('\n--- Step 2: Appointment Timeline & Booking History ---');
    const getAptsRes = await fetch(`${BASE_URL}/patient-portal/appointments`, {
      headers: { Authorization: `Bearer ${patient1Auth.token}` },
    });
    assert(getAptsRes.status === 200, 'GET /patient-portal/appointments returned HTTP 200 OK');
    const appointments = await getAptsRes.json();
    assert(Array.isArray(appointments), `Patient appointment timeline loaded (${appointments.length} consultations)`);

    // --- Step 3: Digital Prescriptions Vault ---
    console.log('\n--- Step 3: Digital Prescriptions Vault ---');
    const getRxRes = await fetch(`${BASE_URL}/patient-portal/prescriptions`, {
      headers: { Authorization: `Bearer ${patient1Auth.token}` },
    });
    assert(getRxRes.status === 200, 'GET /patient-portal/prescriptions returned HTTP 200 OK');
    const prescriptions = await getRxRes.json();
    assert(Array.isArray(prescriptions), `Digital prescription vault loaded (${prescriptions.length} active prescriptions)`);

    // --- Step 4: Diagnostic Lab Reports Download Center ---
    console.log('\n--- Step 4: Diagnostic Lab Reports Download Center ---');
    const getLabsRes = await fetch(`${BASE_URL}/patient-portal/lab-reports`, {
      headers: { Authorization: `Bearer ${patient1Auth.token}` },
    });
    assert(getLabsRes.status === 200, 'GET /patient-portal/lab-reports returned HTTP 200 OK');
    const labReports = await getLabsRes.json();
    assert(Array.isArray(labReports), `Diagnostic lab reports repository loaded (${labReports.length} test orders)`);

    // --- Step 5: Billing & Payment Receipts History ---
    console.log('\n--- Step 5: Billing & Payment Receipts History ---');
    const getBillsRes = await fetch(`${BASE_URL}/patient-portal/bills`, {
      headers: { Authorization: `Bearer ${patient1Auth.token}` },
    });
    assert(getBillsRes.status === 200, 'GET /patient-portal/bills returned HTTP 200 OK');
    const bills = await getBillsRes.json();
    assert(Array.isArray(bills), `Billing invoices & payment history loaded (${bills.length} statements)`);

    // --- Step 6: Inpatient Admission History & Timeline ---
    console.log('\n--- Step 6: Inpatient Admission History & Timeline ---');
    const getAdmRes = await fetch(`${BASE_URL}/patient-portal/admissions`, {
      headers: { Authorization: `Bearer ${patient1Auth.token}` },
    });
    assert(getAdmRes.status === 200, 'GET /patient-portal/admissions returned HTTP 200 OK');
    const admissions = await getAdmRes.json();
    assert(Array.isArray(admissions), `Inpatient admission stays loaded (${admissions.length} admissions)`);

    // --- Step 7: Official Discharge Summaries Viewer ---
    console.log('\n--- Step 7: Official Discharge Summaries Viewer ---');
    const getDischargeRes = await fetch(`${BASE_URL}/patient-portal/discharge-summaries`, {
      headers: { Authorization: `Bearer ${patient1Auth.token}` },
    });
    assert(getDischargeRes.status === 200, 'GET /patient-portal/discharge-summaries returned HTTP 200 OK');
    const dischargeSummaries = await getDischargeRes.json();
    assert(Array.isArray(dischargeSummaries), `Discharge summaries repository loaded (${dischargeSummaries.length} summaries)`);

    // --- Step 8: Virtual Telemedicine Consultations ---
    console.log('\n--- Step 8: Virtual Telemedicine Consultations ---');
    const getTelemedRes = await fetch(`${BASE_URL}/patient-portal/telemedicine`, {
      headers: { Authorization: `Bearer ${patient1Auth.token}` },
    });
    assert(getTelemedRes.status === 200, 'GET /patient-portal/telemedicine returned HTTP 200 OK');
    const telemedSessions = await getTelemedRes.json();
    assert(Array.isArray(telemedSessions), `Virtual telemedicine sessions loaded (${telemedSessions.length} consultations)`);

    // --- Step 9: In-App Notifications Center ---
    console.log('\n--- Step 9: In-App Notifications Center ---');
    const getNotifsRes = await fetch(`${BASE_URL}/patient-portal/notifications`, {
      headers: { Authorization: `Bearer ${patient1Auth.token}` },
    });
    assert(getNotifsRes.status === 200, 'GET /patient-portal/notifications returned HTTP 200 OK');
    const notifications = await getNotifsRes.json();
    assert(Array.isArray(notifications) && notifications.length > 0, `Push notification center loaded (${notifications.length} alerts)`);

    const targetNotif = notifications[0];
    const markReadRes = await fetch(`${BASE_URL}/patient-portal/notifications/${targetNotif.id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${patient1Auth.token}` },
    });
    assert(markReadRes.status === 200, 'PATCH /patient-portal/notifications/:id/read returned HTTP 200 OK');
    const readNotif = await markReadRes.json();
    assert(readNotif.isRead === true, 'Notification marked as READ successfully');

    // --- Step 10: Doctor Feedback & Rating System ---
    console.log('\n--- Step 10: Doctor Feedback & Rating System ---');
    const fbRes = await fetch(`${BASE_URL}/patient-portal/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patient1Auth.token}`,
      },
      body: JSON.stringify({
        rating: 5,
        comments: 'Outstanding clinical consultation. Doctor explained medication schedule very clearly.',
      }),
    });
    assert(fbRes.status === 201 || fbRes.status === 200, 'POST /patient-portal/feedback returned HTTP 201/200');
    const fbData = await fbRes.json();
    assert(fbData.rating === 5, 'Doctor feedback & 5-star rating recorded successfully');

    // --- Step 11: Family Access Management ---
    console.log('\n--- Step 11: Family Access Management ---');
    const addFamRes = await fetch(`${BASE_URL}/patient-portal/family`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patient1Auth.token}`,
      },
      body: JSON.stringify({
        name: 'Little Timmy Doe',
        relation: 'Child',
        dob: '2020-04-12T00:00:00.000Z',
        phone: '+1-800-555-0199',
        accessLevel: 'FULL',
      }),
    });
    assert(addFamRes.status === 201 || addFamRes.status === 200, 'POST /patient-portal/family returned HTTP 201/200');
    const famData = await addFamRes.json();
    assert(famData.name === 'Little Timmy Doe', 'Family dependent linked to patient profile');

    const getFamRes = await fetch(`${BASE_URL}/patient-portal/family`, {
      headers: { Authorization: `Bearer ${patient1Auth.token}` },
    });
    assert(getFamRes.status === 200, 'GET /patient-portal/family returned HTTP 200 OK');
    const famList = await getFamRes.json();
    assert(Array.isArray(famList) && famList.length > 0, `Family care network loaded (${famList.length} members)`);

    // --- Step 12: Health Goals Tracker ---
    console.log('\n--- Step 12: Health Goals Tracker ---');
    const addGoalRes = await fetch(`${BASE_URL}/patient-portal/health-goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patient1Auth.token}`,
      },
      body: JSON.stringify({
        title: 'Daily Water Intake',
        targetValue: 3.5,
        currentValue: 2.8,
        unit: 'litres',
      }),
    });
    assert(addGoalRes.status === 201 || addGoalRes.status === 200, 'POST /patient-portal/health-goals returned HTTP 201/200');
    const goalData = await addGoalRes.json();
    assert(goalData.title === 'Daily Water Intake', 'Health goal created & tracked');

    const getGoalsRes = await fetch(`${BASE_URL}/patient-portal/health-goals`, {
      headers: { Authorization: `Bearer ${patient1Auth.token}` },
    });
    assert(getGoalsRes.status === 200, 'GET /patient-portal/health-goals returned HTTP 200 OK');
    const goalsList = await getGoalsRes.json();
    assert(Array.isArray(goalsList) && goalsList.length > 0, `Personal health goals loaded (${goalsList.length} goals)`);

    // --- Step 13: Patient Engagement Analytics ---
    console.log('\n--- Step 13: Patient Engagement Analytics ---');
    const getAnalRes = await fetch(`${BASE_URL}/patient-portal/analytics`, {
      headers: { Authorization: `Bearer ${patient1Auth.token}` },
    });
    assert(getAnalRes.status === 200, 'GET /patient-portal/analytics returned HTTP 200 OK');
    const analytics = await getAnalRes.json();
    assert(typeof analytics.appointmentsCount === 'number', `Analytics: Appointments Count: ${analytics.appointmentsCount}`);
    assert(typeof analytics.labReportsCount === 'number', `Analytics: Lab Reports Count: ${analytics.labReportsCount}`);
    assert(typeof analytics.medicationAdherence === 'number', `Analytics: Medication Adherence: ${analytics.medicationAdherence}%`);
    assert(typeof analytics.healthGoalProgress === 'number', `Analytics: Health Goal Progress: ${analytics.healthGoalProgress}%`);

    // --- Step 14: Cross-Patient Security & Isolation Guards ---
    console.log('\n--- Step 14: Cross-Patient Security & Isolation Guards ---');
    const crossNotifRes = await fetch(`${BASE_URL}/patient-portal/notifications/${targetNotif.id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${patient2Auth.token}` },
    });
    assert(crossNotifRes.status === 403 || crossNotifRes.status === 404, 'Security Guard: Patient 2 blocked with HTTP 403/404 from modifying Patient 1 notification');

    console.log('\n==================================================');
    console.log(`📊 PATIENT PORTAL RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during Patient Portal E2E test:', err);
    process.exit(1);
  }
}

runPatientPortalE2ETest();
