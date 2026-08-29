const BASE_URL = process.env.API_URL || 'http://localhost:3001/api/v1';

let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ [PASS] ${passedAssertions + 1}. ${message}`);
    passedAssertions++;
  } else {
    console.error(`❌ [FAIL] ${passedAssertions + failedAssertions + 1}. ${message}`);
    failedAssertions++;
  }
}

async function runIcuCriticalCareE2ETests() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA ICU & CRITICAL CARE MANAGEMENT PLATFORM E2E TEST');
  console.log('==================================================\n');

  try {
    const login = async (email, password) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      return { token: data.accessToken || data.token, user: data.user };
    };

    // 1. Authenticate Hospital Admin A
    const adminAAuth = await login('admin.hospa@medinexa.local', 'Password123!');
    assert(!!adminAAuth.token, 'Hospital Admin A authenticated successfully');
    const adminAToken = adminAAuth.token;

    // 2. Authenticate Hospital Admin B
    const adminBAuth = await login('admin.hospb@medinexa.local', 'Password123!');
    assert(!!adminBAuth.token, 'Hospital Admin B authenticated successfully');
    const adminBToken = adminBAuth.token;

    // 3. Authenticate Doctor / Intensivist
    const docAuth = await login('doc.reminder@medinexa.local', 'Password123!');
    assert(!!docAuth.token, 'Intensivist / ICU Physician authenticated successfully');
    const docToken = docAuth.token;

    // 4. Authenticate Patient
    const patientAuth = await login('patient.doe@medinexa.local', 'Password123!');
    assert(!!patientAuth.token, 'Patient authenticated successfully');
    const patientToken = patientAuth.token;

    // 5. Authenticate Receptionist
    const recepAuth = await login('receptionist@medinexa.local', 'Password123!');
    assert(!!recepAuth.token, 'Receptionist authenticated successfully');
    const recepToken = recepAuth.token;

    // 6. Resolve Target Patient
    const patientMeRes = await fetch(`${BASE_URL}/patients/me`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const targetPatient = await patientMeRes.json();
    assert(!!targetPatient?.id, `Target Patient identified (${targetPatient?.user?.firstName || 'Jane'} ${targetPatient?.user?.lastName || 'Doe'})`);
    const patientId = targetPatient.id;

    console.log('\n--- Step 1: Strict RBAC Security Guards ---');
    // 7. Patient blocked from creating ICU admissions
    const patAdmitRes = await fetch(`${BASE_URL}/icu/admissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({ patientId, status: 'ADMITTED' }),
    });
    assert(patAdmitRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from ICU admissions');

    // 8. Receptionist blocked from ICU admissions
    const recepAdmitRes = await fetch(`${BASE_URL}/icu/admissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${recepToken}` },
      body: JSON.stringify({ patientId, status: 'ADMITTED' }),
    });
    assert(recepAdmitRes.status === 403, 'RBAC Guard: Receptionist blocked with HTTP 403 Forbidden from ICU admissions');

    // 9. Patient blocked from recording vitals
    const patVitalsRes = await fetch(`${BASE_URL}/icu/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({ patientId, heartRate: 80, respiratoryRate: 16, oxygenSaturation: 98, systolicBP: 120, diastolicBP: 80, temperature: 37 }),
    });
    assert(patVitalsRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from recording ICU vitals');

    // 10. Non-doctor blocked from ICU rounds
    const recepRoundRes = await fetch(`${BASE_URL}/icu/rounds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${recepToken}` },
      body: JSON.stringify({ patientId, diagnosis: 'Test', assessment: 'Test', treatmentPlan: 'Test' }),
    });
    assert(recepRoundRes.status === 403, 'RBAC Guard: Non-Doctor role blocked with HTTP 403 Forbidden from ICU rounds');

    // 11. Patient blocked from ICU analytics
    const patAnalRes = await fetch(`${BASE_URL}/icu/analytics`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    assert(patAnalRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from ICU Analytics');

    // 12. Receptionist blocked from ICU analytics
    const recepAnalRes = await fetch(`${BASE_URL}/icu/analytics`, {
      headers: { Authorization: `Bearer ${recepToken}` },
    });
    assert(recepAnalRes.status === 403, 'RBAC Guard: Receptionist blocked with HTTP 403 Forbidden from ICU Analytics');

    console.log('\n--- Step 2: ICU Admission & Acuity Baseline ---');
    // 13. Create ICU Admission
    const admitRes = await fetch(`${BASE_URL}/icu/admissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docToken}` },
      body: JSON.stringify({
        patientId,
        status: 'ADMITTED',
        apacheScore: 16,
        sofaScore: 5,
      }),
    });
    const admissionData = await admitRes.json();
    assert(admitRes.status === 201 || admitRes.status === 200, 'POST /icu/admissions returned HTTP 201/200');
    assert(admissionData.id && admissionData.status === 'ADMITTED', 'Patient successfully admitted to ICU Pod');
    assert(admissionData.apacheScore === 16, 'Baseline APACHE II score recorded as 16');
    assert(admissionData.sofaScore === 5, 'Baseline SOFA score recorded as 5');
    const icuAdmissionId = admissionData.id;

    // 14. Fetch ICU Admission by ID
    const getAdmissionRes = await fetch(`${BASE_URL}/icu/admissions/${icuAdmissionId}`, {
      headers: { Authorization: `Bearer ${docToken}` },
    });
    const fetchedAdmission = await getAdmissionRes.json();
    assert(getAdmissionRes.status === 200, 'GET /icu/admissions/:id returned HTTP 200 OK');
    assert(fetchedAdmission.id === icuAdmissionId, 'Admission dossier ID matches');

    // 15. List ICU Admissions
    const listAdmRes = await fetch(`${BASE_URL}/icu/admissions`, {
      headers: { Authorization: `Bearer ${docToken}` },
    });
    const admList = await listAdmRes.json();
    assert(listAdmRes.status === 200, 'GET /icu/admissions returned HTTP 200 OK');
    assert(Array.isArray(admList) && admList.some((a) => a.id === icuAdmissionId), 'Active patient listed in ICU census');

    // 16. Update Admission Status to CRITICAL
    const updateAdmRes = await fetch(`${BASE_URL}/icu/admissions/${icuAdmissionId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docToken}` },
      body: JSON.stringify({
        status: 'CRITICAL',
        apacheScore: 24,
        sofaScore: 9,
      }),
    });
    const updatedAdm = await updateAdmRes.json();
    assert(updateAdmRes.status === 200, 'PATCH /icu/admissions/:id/status returned HTTP 200 OK');
    assert(updatedAdm.status === 'CRITICAL', 'Acuity transitioned to CRITICAL');
    assert(updatedAdm.apacheScore === 24, 'Updated APACHE II score to 24');
    assert(updatedAdm.sofaScore === 9, 'Updated SOFA score to 9');

    console.log('\n--- Step 3: Continuous Vitals & Early Warning System (EWS) ---');
    // 17. Record Normal Vitals
    const normalVitalsRes = await fetch(`${BASE_URL}/icu/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docToken}` },
      body: JSON.stringify({
        patientId,
        icuAdmissionId,
        heartRate: 82,
        respiratoryRate: 16,
        oxygenSaturation: 99,
        systolicBP: 124,
        diastolicBP: 78,
        temperature: 37.0,
        urineOutput: 50,
      }),
    });
    assert(normalVitalsRes.status === 201 || normalVitalsRes.status === 200, 'POST /icu/vitals (Normal Observation) returned HTTP 201/200');

    // 18. Record Severe Deteriorating Vitals (EWS Breach)
    const severeVitalsRes = await fetch(`${BASE_URL}/icu/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docToken}` },
      body: JSON.stringify({
        patientId,
        icuAdmissionId,
        heartRate: 162, // > 140
        respiratoryRate: 42, // > 35
        oxygenSaturation: 82, // < 90
        systolicBP: 74, // < 90
        diastolicBP: 42,
        temperature: 40.8, // > 40
        urineOutput: 8, // < 20
      }),
    });
    const severeData = await severeVitalsRes.json();
    assert(severeVitalsRes.status === 201 || severeVitalsRes.status === 200, 'POST /icu/vitals (Critical Deterioration) returned HTTP 201/200');
    assert(severeData.heartRate === 162, 'Severe tachycardia vital recorded');
    assert(severeData.oxygenSaturation === 82, 'Severe hypoxemia vital recorded');
    assert(severeData.systolicBP === 74, 'Severe hypotension vital recorded');

    // 19. Query Vitals History Flowsheet
    const vitalsFlowRes = await fetch(`${BASE_URL}/icu/vitals/${patientId}`, {
      headers: { Authorization: `Bearer ${docToken}` },
    });
    const vitalsFlow = await vitalsFlowRes.json();
    assert(vitalsFlowRes.status === 200, 'GET /icu/vitals/:patientId returned HTTP 200 OK');
    assert(Array.isArray(vitalsFlow) && vitalsFlow.length >= 2, 'ICU vitals flowsheet contains multi-point time series');

    console.log('\n--- Step 4: Early Warning System Alerts & Clinician Acknowledgment ---');
    // 20. Verify Automatic Critical Care Alert Generated
    const alertsRes = await fetch(`${BASE_URL}/icu/alerts`, {
      headers: { Authorization: `Bearer ${docToken}` },
    });
    const alertsList = await alertsRes.json();
    assert(alertsRes.status === 200, 'GET /icu/alerts returned HTTP 200 OK');
    assert(Array.isArray(alertsList) && alertsList.length > 0, 'Active Early Warning Alerts queue populated');
    const targetAlert = alertsList.find((a) => a.patientId === patientId) || alertsList[0];
    assert(!!targetAlert, 'Critical Care Alert generated for hemodynamic deterioration');
    assert(targetAlert.severity === 'CRITICAL', 'Alert severity flagged as CRITICAL');
    const alertId = targetAlert.id;

    // 21. Query Unacknowledged Alerts Only
    const unackAlertsRes = await fetch(`${BASE_URL}/icu/alerts?unacknowledgedOnly=true`, {
      headers: { Authorization: `Bearer ${docToken}` },
    });
    const unackAlerts = await unackAlertsRes.json();
    assert(unackAlertsRes.status === 200, 'GET /icu/alerts?unacknowledgedOnly=true returned HTTP 200 OK');
    assert(Array.isArray(unackAlerts) && unackAlerts.some((a) => a.id === alertId), 'Alert present in unacknowledged roster');

    // 22. Acknowledge Critical Care Alert
    const ackRes = await fetch(`${BASE_URL}/icu/alerts/${alertId}/acknowledge`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${docToken}` },
    });
    const ackData = await ackRes.json();
    assert(ackRes.status === 200, 'PATCH /icu/alerts/:id/acknowledge returned HTTP 200 OK');
    assert(ackData.acknowledged === true, 'Critical Alert marked as acknowledged');
    assert(!!ackData.acknowledgedAt, 'Acknowledgment timestamp recorded');

    console.log('\n--- Step 5: Intensivist Bedside Rounds ---');
    // 23. Document ICU Daily Round
    const roundRes = await fetch(`${BASE_URL}/icu/rounds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docToken}` },
      body: JSON.stringify({
        patientId,
        diagnosis: 'Septic Shock with Acute Respiratory Distress Syndrome (ARDS)',
        assessment: 'Patient intubated, PaO2/FiO2 ratio 140, refractory hypotension responding to double vasopressors.',
        treatmentPlan: 'Lung-protective mechanical ventilation 6 mL/kg, initiate prone positioning, continuous renal replacement therapy (CRRT) consult.',
        notes: 'Strict fluid restriction, reassess blood gas and lactate in 2 hours.',
      }),
    });
    const roundData = await roundRes.json();
    assert(roundRes.status === 201 || roundRes.status === 200, 'POST /icu/rounds returned HTTP 201/200');
    assert(roundData.diagnosis.includes('Septic Shock'), 'Diagnosis recorded in intensivist round');
    assert(roundData.treatmentPlan.includes('Lung-protective'), 'Treatment plan documented');

    // 24. Query Rounds History
    const roundsListRes = await fetch(`${BASE_URL}/icu/rounds/${patientId}`, {
      headers: { Authorization: `Bearer ${docToken}` },
    });
    const roundsList = await roundsListRes.json();
    assert(roundsListRes.status === 200, 'GET /icu/rounds/:patientId returned HTTP 200 OK');
    assert(Array.isArray(roundsList) && roundsList.length >= 1, 'Patient round history retrieved');

    console.log('\n--- Step 6: Mechanical Ventilator Fleet Management ---');
    // 25. Register Mechanical Ventilator
    const ventNum = `VENT-TEST-${Date.now().toString().slice(-4)}`;
    const createVentRes = await fetch(`${BASE_URL}/icu/ventilators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        ventilatorNumber: ventNum,
        manufacturer: 'Hamilton Medical',
        model: 'Hamilton-G5 Intensive Care Ventilator',
      }),
    });
    const ventData = await createVentRes.json();
    assert(createVentRes.status === 201 || createVentRes.status === 200, 'POST /icu/ventilators returned HTTP 201/200');
    assert(ventData.ventilatorNumber === ventNum, `Ventilator #${ventNum} registered`);
    assert(ventData.status === 'AVAILABLE', 'Initial ventilator status is AVAILABLE');
    const ventilatorId = ventData.id;

    // 26. List Ventilators
    const listVentRes = await fetch(`${BASE_URL}/icu/ventilators`, {
      headers: { Authorization: `Bearer ${docToken}` },
    });
    const ventList = await listVentRes.json();
    assert(listVentRes.status === 200, 'GET /icu/ventilators returned HTTP 200 OK');
    assert(Array.isArray(ventList) && ventList.some((v) => v.id === ventilatorId), 'Ventilator present in facility inventory');

    // 27. Assign Ventilator to Patient
    const assignVentRes = await fetch(`${BASE_URL}/icu/ventilators/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docToken}` },
      body: JSON.stringify({
        ventilatorId,
        patientId,
      }),
    });
    const assignData = await assignVentRes.json();
    assert(assignVentRes.status === 201 || assignVentRes.status === 200, 'POST /icu/ventilators/assign returned HTTP 201/200');
    assert(assignData.ventilatorId === ventilatorId && assignData.patientId === patientId, 'Ventilator assigned to patient');

    // 28. Verify Ventilator Status Updated to IN_USE
    const ventAfterAssign = (await (await fetch(`${BASE_URL}/icu/ventilators`, { headers: { Authorization: `Bearer ${docToken}` } })).json()).find((v) => v.id === ventilatorId);
    assert(ventAfterAssign?.status === 'IN_USE', 'Ventilator status transitioned to IN_USE');

    // 29. Remove Ventilator Assignment
    const removeVentRes = await fetch(`${BASE_URL}/icu/ventilators/${ventilatorId}/remove`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${docToken}` },
    });
    const removedVentData = await removeVentRes.json();
    assert(removeVentRes.status === 200, 'PATCH /icu/ventilators/:id/remove returned HTTP 200 OK');
    assert(removedVentData.status === 'AVAILABLE', 'Ventilator returned to AVAILABLE status');

    console.log('\n--- Step 7: Rapid Response & Code Blue Management ---');
    // 30. Trigger Code Blue Activation
    const codeBlueRes = await fetch(`${BASE_URL}/icu/code-blue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docToken}` },
      body: JSON.stringify({
        patientId,
        eventLocation: 'ICU Pod A - Bed 03',
        eventSummary: 'Sudden cardiac arrest, Pulseless Electrical Activity (PEA). ACLS protocol initiated.',
      }),
    });
    const codeBlueData = await codeBlueRes.json();
    assert(codeBlueRes.status === 201 || codeBlueRes.status === 200, 'POST /icu/code-blue returned HTTP 201/200');
    assert(codeBlueData.id && codeBlueData.eventLocation === 'ICU Pod A - Bed 03', 'Code Blue event activated and broadcasted');
    assert(codeBlueData.outcome === 'IN_PROGRESS', 'Code Blue event state is IN_PROGRESS');
    const codeBlueId = codeBlueData.id;

    // 31. Query Code Blue Events
    const listCbRes = await fetch(`${BASE_URL}/icu/code-blue`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const cbList = await listCbRes.json();
    assert(listCbRes.status === 200, 'GET /icu/code-blue returned HTTP 200 OK');
    assert(Array.isArray(cbList) && cbList.some((cb) => cb.id === codeBlueId), 'Active Code Blue listed in hospital emergency board');

    // 32. Complete Code Blue Resuscitation
    const completeCbRes = await fetch(`${BASE_URL}/icu/code-blue/${codeBlueId}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docToken}` },
      body: JSON.stringify({
        outcome: 'ROSC_ACHIEVED (Return of Spontaneous Circulation, Sinus Tachycardia, MAP 72 mmHg)',
      }),
    });
    const completedCbData = await completeCbRes.json();
    assert(completeCbRes.status === 200, 'PATCH /icu/code-blue/:id/complete returned HTTP 200 OK');
    assert(completedCbData.outcome.includes('ROSC_ACHIEVED'), 'Code Blue resuscitation outcome recorded');
    assert(!!completedCbData.completedAt, 'Code Blue completion timestamp recorded');

    console.log('\n--- Step 8: ICU Acuity & Mortality Analytics ---');
    // 33. Query ICU Analytics
    const analyticsRes = await fetch(`${BASE_URL}/icu/analytics`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const analyticsData = await analyticsRes.json();
    assert(analyticsRes.status === 200, 'GET /icu/analytics returned HTTP 200 OK');
    assert(analyticsData.icuOccupancyRate !== undefined, `Analytics: ICU Occupancy Rate: ${analyticsData.icuOccupancyRate}%`);
    assert(analyticsData.totalActiveIcuPatients !== undefined, `Analytics: Active ICU Patients: ${analyticsData.totalActiveIcuPatients}`);
    assert(analyticsData.ventilatorsInUse !== undefined, `Analytics: Ventilators In Use: ${analyticsData.ventilatorsInUse}`);
    assert(analyticsData.codeBlueEventsToday !== undefined, `Analytics: Code Blue Events Today: ${analyticsData.codeBlueEventsToday}`);
    assert(analyticsData.averageLosDays !== undefined, `Analytics: Average LOS: ${analyticsData.averageLosDays} days`);
    assert(analyticsData.mortalityRate !== undefined, `Analytics: ICU Mortality Rate: ${analyticsData.mortalityRate}%`);
    assert(analyticsData.apacheDistribution && typeof analyticsData.apacheDistribution === 'object', 'Analytics: APACHE II distribution matrix populated');
    assert(analyticsData.sofaDistribution && typeof analyticsData.sofaDistribution === 'object', 'Analytics: SOFA organ dysfunction matrix populated');

    console.log('\n--- Step 9: Multi-Hospital Isolation Guard ---');
    // 41. Hospital B Admin blocked from accessing Hospital A ICU admission
    const crossAdmRes = await fetch(`${BASE_URL}/icu/admissions/${icuAdmissionId}`, {
      headers: { Authorization: `Bearer ${adminBToken}` },
    });
    assert(crossAdmRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from accessing Hospital A ICU admission');

    // 42. Hospital B Admin blocked from accessing Hospital A Code Blue events
    const crossCbRes = await fetch(`${BASE_URL}/icu/code-blue?facilityId=95001a7a-3a65-4fb4-85ad-c0cf7e7d2fa8`, {
      headers: { Authorization: `Bearer ${adminBToken}` },
    });
    assert(crossCbRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from requesting Hospital A Code Blue list');

    console.log('\n==================================================');
    console.log(`🏥 ICU & CRITICAL CARE E2E RESULT: ${passedAssertions} PASSED, ${failedAssertions} FAILED`);
    console.log('==================================================\n');

    if (failedAssertions > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal execution error during ICU & Critical Care E2E test:', err);
    process.exit(1);
  }
}

runIcuCriticalCareE2ETests();
