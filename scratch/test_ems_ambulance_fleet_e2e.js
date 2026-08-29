const BASE_URL = 'http://localhost:3001/api/v1';

async function runEmsFleetE2ETest() {
  console.log('==================================================');
  console.log('🚑 MEDINEXA AMBULANCE FLEET & EMS DISPATCH E2E TEST');
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

    const docAuth = await login('doc.reminder@medinexa.local', 'Password123!');
    assert(!!docAuth.token, 'Attending Emergency Doctor authenticated successfully');

    const adminAAuth = await login('admin.hospa@medinexa.local', 'Password123!');
    assert(!!adminAAuth.token, 'Hospital Admin A (EMS Dispatcher) authenticated successfully');

    const adminBAuth = await login('admin.hospb@medinexa.local', 'Password123!');
    assert(!!adminBAuth.token, 'Hospital Admin B authenticated successfully');

    const driverAuth = await login('nurse.joy@medinexa.local', 'Password123!');
    assert(!!driverAuth.token, 'EMS Paramedic / Nurse authenticated successfully');

    const patientAuth = await login('patient.doe@medinexa.local', 'Password123!');
    assert(!!patientAuth.token, 'Patient authenticated successfully');

    const facARes = await fetch(`${BASE_URL}/facilities`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    const facilities = await facARes.json();
    const facilityA = Array.isArray(facilities) && facilities.length > 0 ? facilities[0] : { id: adminAAuth.user?.facilityId };
    assert(!!facilityA.id, 'Facility A identified');

    // --- Step 1: RBAC Security Guards ---
    console.log('\n--- Step 1: RBAC Security Guards ---');
    const rbacRes = await fetch(`${BASE_URL}/ems/calls`, {
      headers: { Authorization: `Bearer ${patientAuth.token}` },
    });
    assert(rbacRes.status === 403, 'RBAC Guard: Patient role blocked with HTTP 403 Forbidden from EMS endpoints');

    // --- Step 2: Emergency Call Intake ---
    console.log('\n--- Step 2: Emergency Call Intake Center ---');
    const callRes = await fetch(`${BASE_URL}/ems/calls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        callerName: 'Sarah Jenkins',
        callerPhone: '+1-555-911-0022',
        emergencyType: 'Pediatric Cardiac Distress',
        incidentLocation: '450 Lexington Ave, Suite 12B, New York',
        priority: 'CRITICAL',
        notes: 'Caller reports 6-year-old child unresponsive, breathing shallow.',
        facilityId: facilityA.id,
      }),
    });
    assert(callRes.status === 201 || callRes.status === 200, 'POST /ems/calls returned HTTP 201/200');
    const callData = await callRes.json();
    assert(!!callData.id && callData.status === 'RECEIVED', `Emergency Call #${callData.callNumber} logged with status RECEIVED`);

    const listCallsRes = await fetch(`${BASE_URL}/ems/calls?facilityId=${facilityA.id}`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(listCallsRes.status === 200, 'GET /ems/calls returned HTTP 200 OK');
    const callsList = await listCallsRes.json();
    assert(Array.isArray(callsList) && callsList.length > 0, `Emergency calls roster retrieved (${callsList.length} calls)`);

    // --- Step 3: Ambulance Fleet Registration ---
    console.log('\n--- Step 3: Ambulance Fleet Registration ---');
    const ambCode = `AMB-ALS-${Date.now().toString().slice(-4)}`;
    const regCode = `REG-NY-${Date.now().toString().slice(-4)}`;
    const ambRes = await fetch(`${BASE_URL}/ems/ambulances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        vehicleNumber: ambCode,
        registrationNumber: regCode,
        ambulanceType: 'ADVANCED_LIFE_SUPPORT',
        equipmentSummary: 'Mindray Defibrillator, Hamilton T1 Transport Ventilator, Infusion Pumps',
        assignedCrew: 'Paramedic Jack Ryan, EMT James Bond',
        currentLatitude: 40.7580,
        currentLongitude: -73.9855,
        facilityId: facilityA.id,
      }),
    });
    assert(ambRes.status === 201 || ambRes.status === 200, 'POST /ems/ambulances returned HTTP 201/200');
    const ambData = await ambRes.json();
    assert(!!ambData.id && ambData.status === 'AVAILABLE', `ALS Ambulance #${ambData.vehicleNumber} registered into active fleet`);

    const listAmbRes = await fetch(`${BASE_URL}/ems/ambulances?facilityId=${facilityA.id}`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(listAmbRes.status === 200, 'GET /ems/ambulances returned HTTP 200 OK');
    const ambList = await listAmbRes.json();
    assert(Array.isArray(ambList) && ambList.length > 0, 'Ambulance fleet roster retrieved');

    // --- Step 4: Emergency Dispatch (CAD Allocation) ---
    console.log('\n--- Step 4: Emergency Dispatch (CAD Computer-Aided Dispatch) ---');
    const dspRes = await fetch(`${BASE_URL}/ems/dispatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        patientName: 'Alex Rivera',
        patientPhone: '+1-555-888-9999',
        emergencyType: 'Severe Road Traffic Accident (Polytrauma)',
        pickupAddress: 'Intersection 5th Ave & 42nd St, New York',
        pickupLatitude: 40.7535,
        pickupLongitude: -73.9812,
        priority: 'CRITICAL',
        ambulanceId: ambData.id,
        facilityId: facilityA.id,
      }),
    });
    assert(dspRes.status === 201 || dspRes.status === 200, 'POST /ems/dispatch returned HTTP 201/200');
    const dspData = await dspRes.json();
    assert(!!dspData.id && dspData.status === 'ASSIGNED', `Emergency Dispatch #${dspData.dispatchNumber} assigned to Unit #${ambData.vehicleNumber}`);

    const listDspRes = await fetch(`${BASE_URL}/ems/dispatch?facilityId=${facilityA.id}`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(listDspRes.status === 200, 'GET /ems/dispatch returned HTTP 200 OK');
    const dspList = await listDspRes.json();
    assert(Array.isArray(dspList) && dspList.length > 0, 'Emergency dispatches roster listed');

    // --- Step 5: Dispatch State Machine & Transit Telematics ---
    console.log('\n--- Step 5: Dispatch State Machine Lifecycle ---');
    // 5.1 En-Route
    const enRouteRes = await fetch(`${BASE_URL}/ems/dispatch/${dspData.id}/en-route`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(enRouteRes.status === 200, 'PATCH /ems/dispatch/:id/en-route returned HTTP 200 OK');
    const enRouteData = await enRouteRes.json();
    assert(enRouteData.status === 'EN_ROUTE', 'Dispatch status transitioned: ASSIGNED -> EN_ROUTE');

    // 5.2 Arrived at Scene
    const arrivedRes = await fetch(`${BASE_URL}/ems/dispatch/${dspData.id}/arrived-scene`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(arrivedRes.status === 200, 'PATCH /ems/dispatch/:id/arrived-scene returned HTTP 200 OK');
    const arrivedData = await arrivedRes.json();
    assert(arrivedData.status === 'AT_SCENE', 'Dispatch status transitioned: EN_ROUTE -> AT_SCENE');

    // 5.3 Transporting
    const transportRes = await fetch(`${BASE_URL}/ems/dispatch/${dspData.id}/transporting`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(transportRes.status === 200, 'PATCH /ems/dispatch/:id/transporting returned HTTP 200 OK');
    const transportData = await transportRes.json();
    assert(transportData.status === 'TRANSPORTING', 'Dispatch status transitioned: AT_SCENE -> TRANSPORTING');

    // 5.4 Arrived at Hospital & Complete
    const completeRes = await fetch(`${BASE_URL}/ems/dispatch/${dspData.id}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(completeRes.status === 200, 'PATCH /ems/dispatch/:id/complete returned HTTP 200 OK');
    const completeData = await completeRes.json();
    assert(completeData.status === 'COMPLETED', 'Dispatch status transitioned: TRANSPORTING -> COMPLETED');

    // Verify Ambulance is freed back to AVAILABLE
    const checkAmbRes = await fetch(`${BASE_URL}/ems/ambulances?facilityId=${facilityA.id}`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    const refreshedAmbs = await checkAmbRes.json();
    const targetAmb = Array.isArray(refreshedAmbs) ? refreshedAmbs.find((a) => a.id === ambData.id) : null;
    assert(targetAmb && targetAmb.status === 'AVAILABLE', 'Ambulance vehicle status automatically reset to AVAILABLE');

    // --- Step 6: GPS Coordinate Telemetry Tracking ---
    console.log('\n--- Step 6: GPS Coordinate Telemetry Tracking ---');
    const gpsRes = await fetch(`${BASE_URL}/ems/ambulances/${ambData.id}/location`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        latitude: 40.7614,
        longitude: -73.9776,
        source: 'GPS_LIVE_TELEMETRY',
      }),
    });
    assert(gpsRes.status === 200, 'PATCH /ems/ambulances/:id/location returned HTTP 200 OK');
    const gpsData = await gpsRes.json();
    assert(gpsData.currentLatitude === 40.7614 && gpsData.currentLongitude === -73.9776, 'Real-time GPS coordinates updated successfully');

    // --- Step 7: EMS Analytics & SLA Metrics ---
    console.log('\n--- Step 7: EMS Analytics & SLA Metrics ---');
    const analyticsRes = await fetch(`${BASE_URL}/ems/analytics?facilityId=${facilityA.id}`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(analyticsRes.status === 200, 'GET /ems/analytics returned HTTP 200 OK');
    const analytics = await analyticsRes.json();
    assert(typeof analytics.dispatchResponseTimeMinutes === 'number', `Average Dispatch Response Time: ${analytics.dispatchResponseTimeMinutes} mins`);
    assert(typeof analytics.fleetAvailabilityPercentage === 'number', `Fleet Availability: ${analytics.fleetAvailabilityPercentage}%`);
    assert(typeof analytics.responseSlaCompliancePercentage === 'number', `SLA Compliance: ${analytics.responseSlaCompliancePercentage}%`);

    // --- Step 8: Multi-Hospital Isolation Security Guards ---
    console.log('\n--- Step 8: Multi-Hospital Isolation Guards ---');
    const crossFacRes = await fetch(`${BASE_URL}/ems/ambulances/${ambData.id}/location`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminBAuth.token}`,
      },
      body: JSON.stringify({
        latitude: 40.7100,
        longitude: -74.0100,
      }),
    });
    assert(crossFacRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from modifying Hospital A ambulance');

    console.log('\n==================================================');
    console.log(`📊 EMS & AMBULANCE FLEET RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during EMS & Ambulance Fleet E2E test:', err);
    process.exit(1);
  }
}

runEmsFleetE2ETest();
