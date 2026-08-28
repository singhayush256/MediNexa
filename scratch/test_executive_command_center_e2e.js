const API_BASE = 'http://localhost:3001/api/v1';

async function runExecutiveCommandCenterE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA EXECUTIVE BI & COMMAND CENTER E2E TEST');
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
    // 1. Authenticate Doctor
    const docRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doc.reminder@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenDoc } = await docRes.json();
    assert(tokenDoc, '1. Attending Doctor (Clinical Director) authenticated successfully');

    // 2. Authenticate Hospital Admin A
    const adminARes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenA } = await adminARes.json();
    assert(tokenA, '2. Hospital Admin A (CEO / COO) authenticated successfully');

    // 3. Authenticate Hospital Admin B
    const adminBRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospb@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenB } = await adminBRes.json();
    assert(tokenB, '3. Hospital Admin B authenticated successfully');

    // 4. Authenticate Nurse
    const nurseRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nurse.joy@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenNurse } = await nurseRes.json();
    assert(tokenNurse, '4. Nursing Supervisor authenticated successfully');

    // 5. Authenticate Receptionist
    const recepRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'reception.a@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenRecep } = await recepRes.json();
    assert(tokenRecep, '5. Receptionist authenticated successfully');

    // 6. Authenticate Patient
    const patRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient.doe@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenPatient } = await patRes.json();
    assert(tokenPatient, '6. Patient authenticated successfully');

    // --- Step 1: RBAC Security Guards ---
    console.log('\n--- Step 1: RBAC Security Guards ---');
    const rbacRecepRes = await fetch(`${API_BASE}/command-center/dashboard`, {
      headers: { Authorization: `Bearer ${tokenRecep}` },
    });
    assert(rbacRecepRes.status === 403, '7. RBAC Guard: Receptionist role blocked with HTTP 403 Forbidden from Command Center');

    const rbacPatRes = await fetch(`${API_BASE}/command-center/dashboard`, {
      headers: { Authorization: `Bearer ${tokenPatient}` },
    });
    assert(rbacPatRes.status === 403, '8. RBAC Guard: Patient role blocked with HTTP 403 Forbidden from Command Center');

    // --- Step 2: C-Suite Command Center Dashboard & Live KPIs ---
    console.log('\n--- Step 2: C-Suite Command Center Dashboard & Live KPIs ---');
    const dashRes = await fetch(`${API_BASE}/command-center/dashboard`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(dashRes.status === 200, '9. GET /command-center/dashboard returned HTTP 200 OK');
    const dashboard = await dashRes.json();
    assert(dashboard.kpis && dashboard.kpis.revenueToday > 0, `10. Live Revenue Today aggregated: $${dashboard.kpis.revenueToday}`);
    assert(dashboard.kpis.occupancyRate > 0, `11. Bed Occupancy Rate aggregated: ${dashboard.kpis.occupancyRate}%`);
    assert(dashboard.kpis.patientSatisfactionScore > 90, `12. Patient Satisfaction KPI: ${dashboard.kpis.patientSatisfactionScore}%`);

    // --- Step 3: Financial & Revenue Intelligence ---
    console.log('\n--- Step 3: Financial & Revenue Intelligence ---');
    const revRes = await fetch(`${API_BASE}/command-center/revenue`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(revRes.status === 200, '13. GET /command-center/revenue returned HTTP 200 OK');
    const revenue = await revRes.json();
    assert(revenue.totalBilled > 0 && revenue.totalCollected > 0, `14. Total Billed: $${revenue.totalBilled}, Collected: $${revenue.totalCollected}`);
    assert(Array.isArray(revenue.departmentalRevenue) && revenue.departmentalRevenue.length >= 4, '15. Departmental revenue breakdown calculated');

    // --- Step 4: Hospital Bed Occupancy & Ward Heatmap ---
    console.log('\n--- Step 4: Hospital Bed Occupancy & Ward Heatmap ---');
    const occRes = await fetch(`${API_BASE}/command-center/occupancy`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(occRes.status === 200, '16. GET /command-center/occupancy returned HTTP 200 OK');
    const occupancy = await occRes.json();
    assert(occupancy.totalBeds > 0 && occupancy.wardBreakdown.length > 0, `17. Occupancy Telemetry: ${occupancy.totalBeds} total beds across ${occupancy.wardBreakdown.length} wards`);

    // --- Step 5: Patient Flow & Throughput ---
    console.log('\n--- Step 5: Patient Flow & Throughput ---');
    const flowRes = await fetch(`${API_BASE}/command-center/patient-flow`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(flowRes.status === 200, '18. GET /command-center/patient-flow returned HTTP 200 OK');
    const flow = await flowRes.json();
    assert(flow.averageDischargeTurnaroundMinutes > 0, `19. Average Discharge Turnaround: ${flow.averageDischargeTurnaroundMinutes} mins`);

    // --- Step 6: Departmental & Clinical Performance ---
    console.log('\n--- Step 6: Departmental & Clinical Performance ---');
    const docPerfRes = await fetch(`${API_BASE}/command-center/doctor-performance`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(docPerfRes.status === 200, '20. GET /command-center/doctor-performance returned HTTP 200 OK');
    const docPerf = await docPerfRes.json();
    assert(docPerf.doctorUtilizationScore > 0, `21. Doctor Productivity: ${docPerf.doctorUtilizationScore}%`);

    const labPerfRes = await fetch(`${API_BASE}/command-center/lab-performance`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(labPerfRes.status === 200, '22. GET /command-center/lab-performance returned HTTP 200 OK');
    const labPerf = await labPerfRes.json();
    assert(labPerf.qualityControlComplianceRate > 90, `23. Laboratory QC Compliance: ${labPerf.qualityControlComplianceRate}%`);

    const pharPerfRes = await fetch(`${API_BASE}/command-center/pharmacy-performance`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(pharPerfRes.status === 200, '24. GET /command-center/pharmacy-performance returned HTTP 200 OK');
    const pharPerf = await pharPerfRes.json();
    assert(pharPerf.controlledDrugsDualNurseSignoffRate === 100.0, '25. Pharmacy Controlled Drug Dual-Signoff Compliance: 100.0%');

    const emgPerfRes = await fetch(`${API_BASE}/command-center/emergency-performance`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(emgPerfRes.status === 200, '26. GET /command-center/emergency-performance returned HTTP 200 OK');
    const emgPerf = await emgPerfRes.json();
    assert(emgPerf.averageDoorToDoctorMinutes > 0, `27. ED Door-to-Doctor Time: ${emgPerf.averageDoorToDoctorMinutes} mins`);

    const telemedPerfRes = await fetch(`${API_BASE}/command-center/telemedicine-performance`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(telemedPerfRes.status === 200, '28. GET /command-center/telemedicine-performance returned HTTP 200 OK');
    const telemedPerf = await telemedPerfRes.json();
    assert(telemedPerf.patientSatisfactionRating >= 4.0, `29. Telemedicine Satisfaction Rating: ${telemedPerf.patientSatisfactionRating} / 5.0`);

    // --- Step 7: Executive Alert Center & Board Resolution ---
    console.log('\n--- Step 7: Executive Alert Center & Board Resolution ---');
    const createAlertRes = await fetch(`${API_BASE}/command-center/alerts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `STAT Emergency Surge Warning ${Date.now()}`,
        description: 'Level 1 Trauma cases exceed simultaneous operating room capacity.',
        severity: 'CRITICAL',
        category: 'OPERATIONAL',
      }),
    });
    assert(createAlertRes.status === 201 || createAlertRes.status === 200, '30. POST /command-center/alerts returned HTTP 201/200');
    const alert = await createAlertRes.json();
    assert(alert.id && alert.status === 'OPEN', `31. Executive Alert created: '${alert.title}'`);

    // Acknowledge Alert
    const ackRes = await fetch(`${API_BASE}/command-center/alerts/${alert.id}/acknowledge`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(ackRes.status === 201 || ackRes.status === 200, '32. POST /command-center/alerts/:id/acknowledge returned HTTP 201/200');
    const ackedAlert = await ackRes.json();
    assert(ackedAlert.status === 'ACKNOWLEDGED', '33. Executive Alert status updated to ACKNOWLEDGED');

    // Resolve Alert
    const resolveRes = await fetch(`${API_BASE}/command-center/alerts/${alert.id}/resolve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(resolveRes.status === 201 || resolveRes.status === 200, '34. POST /command-center/alerts/:id/resolve returned HTTP 201/200');
    const resolvedAlert = await resolveRes.json();
    assert(resolvedAlert.status === 'RESOLVED', '35. Executive Alert status updated to RESOLVED');

    // --- Step 8: Multi-Hospital Isolation Guards ---
    console.log('\n--- Step 8: Multi-Hospital Isolation Guards ---');
    const loadedDoc = doctorsRes[0];
    const isoRes = await fetch(`${API_BASE}/command-center/dashboard?facilityId=${loadedDoc.facilityId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(isoRes.status === 403, '36. Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from Hospital A Command Center');

    console.log('\n==================================================');
    console.log(`📊 EXECUTIVE BI & COMMAND CENTER RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during Executive Command Center E2E test:', err);
    process.exit(1);
  }
}

runExecutiveCommandCenterE2ETest();
