const BASE_URL = 'http://localhost:3001/api/v1';

async function runMedicalDeviceMonitoringE2ETest() {
  console.log('==================================================');
  console.log('📡 MEDINEXA MEDICAL DEVICE & REAL-TIME MONITORING E2E TEST');
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

    const adminAAuth = await login('admin.hospa@medinexa.local', 'Password123!');
    assert(!!adminAAuth.token, 'Hospital Admin A authenticated successfully');

    const adminBAuth = await login('admin.hospb@medinexa.local', 'Password123!');
    assert(!!adminBAuth.token, 'Hospital Admin B authenticated successfully');

    const docAuth = await login('doc.reminder@medinexa.local', 'Password123!');
    assert(!!docAuth.token, 'ICU Attending Physician authenticated successfully');

    let nurseAuth = await login('nurse@medinexa.local', 'Password123!');
    if (!nurseAuth.token) nurseAuth = await login('nurse.joy@medinexa.local', 'Password123!');
    assert(!!nurseAuth.token, 'ICU Charge Nurse authenticated successfully');

    const patientAuth = await login('patient.doe@medinexa.local', 'Password123!');
    assert(!!patientAuth.token, 'Patient authenticated successfully');

    // Resolve target patient
    const patientMeRes = await fetch(`${BASE_URL}/patients/me`, {
      headers: { Authorization: `Bearer ${patientAuth.token}` },
    });
    const targetPatient = await patientMeRes.json();
    assert(!!targetPatient?.id, `Target Patient identified (${targetPatient?.user?.firstName || 'Jane'} ${targetPatient?.user?.lastName || 'Doe'})`);
    const patientId = targetPatient.id;

    // --- Step 1: Strict RBAC Security Guards ---
    console.log('\n--- Step 1: Strict RBAC Security Guards ---');
    const patientDeviceRes = await fetch(`${BASE_URL}/monitoring/devices`, {
      headers: { Authorization: `Bearer ${patientAuth.token}` },
    });
    assert(patientDeviceRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from device fleet management');

    const patientStreamRes = await fetch(`${BASE_URL}/monitoring/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientAuth.token}` },
      body: JSON.stringify({ patientId, deviceId: 'test-id', heartRate: 75 }),
    });
    assert(patientStreamRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from vital stream injection');

    const patientAlertsRes = await fetch(`${BASE_URL}/monitoring/alerts`, {
      headers: { Authorization: `Bearer ${patientAuth.token}` },
    });
    assert(patientAlertsRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from clinical alarm dispatcher');

    // --- Step 2: Medical Device Fleet Registration ---
    console.log('\n--- Step 2: Medical Device Fleet Registration ---');
    const serialNumber = `SN-ICU-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const regDeviceRes = await fetch(`${BASE_URL}/monitoring/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAAuth.token}` },
      body: JSON.stringify({
        deviceName: 'ICU Bed 03 Multi-Parameter Monitor',
        serialNumber,
        deviceType: 'ICU_MONITOR',
        manufacturer: 'Philips Healthcare',
        modelNumber: 'IntelliVue MX800',
        assignedPatientId: patientId,
      }),
    });
    assert(regDeviceRes.status === 201 || regDeviceRes.status === 200, 'POST /monitoring/devices returned HTTP 201/200');
    const createdDevice = await regDeviceRes.json();
    assert(createdDevice.serialNumber === serialNumber, `Device serial number matched (${createdDevice.serialNumber})`);
    assert(createdDevice.status === 'ONLINE', 'Initial device status is ONLINE');
    const deviceId = createdDevice.id;

    // Duplicate Serial Rejection
    const dupDeviceRes = await fetch(`${BASE_URL}/monitoring/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAAuth.token}` },
      body: JSON.stringify({
        deviceName: 'Duplicate Device',
        serialNumber,
        deviceType: 'ECG_MONITOR',
      }),
    });
    assert(dupDeviceRes.status === 400, 'Fleet Guard: Duplicate serial number rejected with HTTP 400 Bad Request');

    // List devices
    const listDevicesRes = await fetch(`${BASE_URL}/monitoring/devices`, {
      headers: { Authorization: `Bearer ${docAuth.token}` },
    });
    assert(listDevicesRes.status === 200, 'Doctor role: GET /monitoring/devices returned HTTP 200 OK');
    const deviceList = await listDevicesRes.json();
    assert(Array.isArray(deviceList) && deviceList.some((d) => d.id === deviceId), 'Registered device present in fleet directory');

    // Update device status
    const updateStatusRes = await fetch(`${BASE_URL}/monitoring/devices/${deviceId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAAuth.token}` },
      body: JSON.stringify({ status: 'ONLINE', assignedPatientId: patientId }),
    });
    assert(updateStatusRes.status === 200, 'PATCH /monitoring/devices/:id/status returned HTTP 200 OK');

    // --- Step 3: Real-Time Normal Vitals Ingestion ---
    console.log('\n--- Step 3: Real-Time Normal Vitals Ingestion ---');
    const normalStreamRes = await fetch(`${BASE_URL}/monitoring/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAAuth.token}` },
      body: JSON.stringify({
        patientId,
        deviceId,
        heartRate: 74,
        spo2: 98,
        systolicBP: 120,
        diastolicBP: 80,
        respiratoryRate: 16,
        temperature: 36.7,
        bloodGlucose: 104,
      }),
    });
    assert(normalStreamRes.status === 201 || normalStreamRes.status === 200, 'POST /monitoring/vitals (Normal telemetry) returned HTTP 201/200');
    const normalStreamData = await normalStreamRes.json();
    assert(normalStreamData.alertCount === 0, 'Normative vital parameters generated 0 false alarms');

    // --- Step 4: Critical Automated Threshold Alarms ---
    console.log('\n--- Step 4: Critical Automated Threshold Alarms ---');

    // Test 4.1: Critical Bradycardia (< 40 bpm)
    const bradycardiaRes = await fetch(`${BASE_URL}/monitoring/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAAuth.token}` },
      body: JSON.stringify({ patientId, deviceId, heartRate: 34 }),
    });
    assert(bradycardiaRes.status === 201 || bradycardiaRes.status === 200, 'POST /monitoring/vitals (Bradycardia HR: 34 bpm) ingested');
    const bradyData = await bradycardiaRes.json();
    assert(bradyData.alerts.some((a) => a.alertType === 'CRITICAL_BRADYCARDIA' && a.severity === 'CRITICAL'), 'Alarm Engine: Critical Bradycardia alert generated instantly');

    // Test 4.2: Critical Tachycardia (> 140 bpm)
    const tachycardiaRes = await fetch(`${BASE_URL}/monitoring/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAAuth.token}` },
      body: JSON.stringify({ patientId, deviceId, heartRate: 162 }),
    });
    assert(tachycardiaRes.status === 201 || tachycardiaRes.status === 200, 'POST /monitoring/vitals (Tachycardia HR: 162 bpm) ingested');
    const tachyData = await tachycardiaRes.json();
    assert(tachyData.alerts.some((a) => a.alertType === 'CRITICAL_TACHYCARDIA'), 'Alarm Engine: Critical Tachycardia alert generated');

    // Test 4.3: Critical Hypoxemia (SpO2 < 90%)
    const hypoxemiaRes = await fetch(`${BASE_URL}/monitoring/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAAuth.token}` },
      body: JSON.stringify({ patientId, deviceId, spo2: 82 }),
    });
    assert(hypoxemiaRes.status === 201 || hypoxemiaRes.status === 200, 'POST /monitoring/vitals (Hypoxemia SpO2: 82%) ingested');
    const hypoData = await hypoxemiaRes.json();
    assert(hypoData.alerts.some((a) => a.alertType === 'CRITICAL_HYPOXEMIA' && a.severity === 'CRITICAL'), 'Alarm Engine: Critical Hypoxemia alert generated');

    // Test 4.4: High Fever / Hyperpyrexia (> 39.5°C)
    const feverRes = await fetch(`${BASE_URL}/monitoring/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAAuth.token}` },
      body: JSON.stringify({ patientId, deviceId, temperature: 40.3 }),
    });
    assert(feverRes.status === 201 || feverRes.status === 200, 'POST /monitoring/vitals (Hyperthermia Temp: 40.3°C) ingested');
    const feverData = await feverRes.json();
    assert(feverData.alerts.some((a) => a.alertType === 'HIGH_HYPERTHERMIA' && a.severity === 'HIGH'), 'Alarm Engine: High Hyperthermia alert generated');

    // Test 4.5: Critical Hypoglycemia (< 60 mg/dL)
    const hypoglycemiaRes = await fetch(`${BASE_URL}/monitoring/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAAuth.token}` },
      body: JSON.stringify({ patientId, deviceId, bloodGlucose: 45 }),
    });
    assert(hypoglycemiaRes.status === 201 || hypoglycemiaRes.status === 200, 'POST /monitoring/vitals (Hypoglycemia Glucose: 45 mg/dL) ingested');
    const hypoGluData = await hypoglycemiaRes.json();
    assert(hypoGluData.alerts.some((a) => a.alertType === 'CRITICAL_HYPOGLYCEMIA'), 'Alarm Engine: Critical Hypoglycemia alert generated');

    // Test 4.6: Bradypnea (< 8 rpm)
    const bradypneaRes = await fetch(`${BASE_URL}/monitoring/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAAuth.token}` },
      body: JSON.stringify({ patientId, deviceId, respiratoryRate: 5 }),
    });
    assert(bradypneaRes.status === 201 || bradypneaRes.status === 200, 'POST /monitoring/vitals (Bradypnea RR: 5 rpm) ingested');
    const bradypneaData = await bradypneaRes.json();
    assert(bradypneaData.alerts.some((a) => a.alertType === 'CRITICAL_BRADYPNEA'), 'Alarm Engine: Critical Bradypnea alert generated');

    // Test 4.7: Hypertensive Crisis (Systolic > 180 mmHg)
    const htnCrisisRes = await fetch(`${BASE_URL}/monitoring/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAAuth.token}` },
      body: JSON.stringify({ patientId, deviceId, systolicBP: 198, diastolicBP: 118 }),
    });
    assert(htnCrisisRes.status === 201 || htnCrisisRes.status === 200, 'POST /monitoring/vitals (Hypertensive Crisis SBP: 198 mmHg) ingested');
    const htnData = await htnCrisisRes.json();
    assert(htnData.alerts.some((a) => a.alertType === 'HYPERTENSIVE_CRISIS' && a.severity === 'CRITICAL'), 'Alarm Engine: Hypertensive Crisis alert generated');

    // --- Step 5: Alert Dispatcher & Acknowledgment Workflow ---
    console.log('\n--- Step 5: Alert Dispatcher & Acknowledgment Workflow ---');
    const listAlertsRes = await fetch(`${BASE_URL}/monitoring/alerts`, {
      headers: { Authorization: `Bearer ${nurseAuth.token}` },
    });
    assert(listAlertsRes.status === 200, 'Nurse role: GET /monitoring/alerts returned HTTP 200 OK');
    const alertList = await listAlertsRes.json();
    assert(Array.isArray(alertList) && alertList.length > 0, `Clinical alarm dispatcher retrieved ${alertList.length} alerts`);

    const unacknowledgedAlert = alertList.find((a) => !a.acknowledged);
    assert(!!unacknowledgedAlert, `Found pending unacknowledged alert (${unacknowledgedAlert?.alertType})`);

    const ackRes = await fetch(`${BASE_URL}/monitoring/alerts/${unacknowledgedAlert.id}/acknowledge`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${nurseAuth.token}` },
      body: JSON.stringify({ notes: 'Attended bedside immediately and titrated oxygen therapy' }),
    });
    assert(ackRes.status === 200, 'PATCH /monitoring/alerts/:id/acknowledge returned HTTP 200 OK');
    const ackedAlert = await ackRes.json();
    assert(ackedAlert.acknowledged === true, 'Alert status transitioned to acknowledged: true');
    assert(!!ackedAlert.acknowledgedAt, 'Alert acknowledgment timestamp recorded');

    // --- Step 6: Vital History & Trend Analytics ---
    console.log('\n--- Step 6: Vital History & Trend Analytics ---');
    const historyRes = await fetch(`${BASE_URL}/monitoring/patient/${patientId}/vitals?limit=20`, {
      headers: { Authorization: `Bearer ${docAuth.token}` },
    });
    assert(historyRes.status === 200, 'GET /monitoring/patient/:id/vitals returned HTTP 200 OK');
    const historyList = await historyRes.json();
    assert(Array.isArray(historyList) && historyList.length >= 8, `Patient vital stream history retrieved (${historyList.length} readings)`);

    const trendsRes = await fetch(`${BASE_URL}/monitoring/patient/${patientId}/trends`, {
      headers: { Authorization: `Bearer ${docAuth.token}` },
    });
    assert(trendsRes.status === 200, 'GET /monitoring/patient/:id/trends returned HTTP 200 OK');
    const trendsData = await trendsRes.json();
    assert(typeof trendsData.summary?.heartRate?.avg === 'number', `Heart Rate Analytics: Min ${trendsData.summary.heartRate.min}, Max ${trendsData.summary.heartRate.max}, Avg ${trendsData.summary.heartRate.avg} bpm`);
    assert(typeof trendsData.summary?.spo2?.avg === 'number', `SpO2 Analytics: Min ${trendsData.summary.spo2.min}%, Max ${trendsData.summary.spo2.max}%, Avg ${trendsData.summary.spo2.avg}%`);

    // --- Step 7: Monitoring Platform Analytics ---
    console.log('\n--- Step 7: Monitoring Platform Analytics ---');
    const analRes = await fetch(`${BASE_URL}/monitoring/analytics`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(analRes.status === 200, 'GET /monitoring/analytics returned HTTP 200 OK');
    const analytics = await analRes.json();
    assert(typeof analytics.devicesOnline === 'number', `Analytics: Devices Online: ${analytics.devicesOnline}`);
    assert(typeof analytics.criticalAlertsToday === 'number', `Analytics: Critical Alerts Today: ${analytics.criticalAlertsToday}`);
    assert(typeof analytics.vitalsRecordedToday === 'number', `Analytics: Vitals Recorded Today: ${analytics.vitalsRecordedToday}`);

    // --- Step 8: Multi-Hospital Isolation Guard ---
    console.log('\n--- Step 8: Multi-Hospital Isolation Guard ---');
    const crossHospitalRes = await fetch(`${BASE_URL}/monitoring/patient/${patientId}/vitals`, {
      headers: { Authorization: `Bearer ${adminBAuth.token}` },
    });
    const crossData = await crossHospitalRes.json();
    assert(Array.isArray(crossData) && crossData.length === 0, 'Multi-Hospital Isolation Guard: Hospital B cannot view Hospital A patient vital telemetry streams');

    console.log('\n==================================================');
    console.log(`📡 MEDICAL DEVICE MONITORING E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during Medical Device Monitoring E2E test:', err);
    process.exit(1);
  }
}

runMedicalDeviceMonitoringE2ETest();
