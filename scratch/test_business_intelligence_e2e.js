const BASE_URL = 'http://localhost:3001/api/v1';

async function runBusinessIntelligenceE2ETest() {
  console.log('==================================================');
  console.log('📊 MEDINEXA HEALTHCARE BI & EXECUTIVE COMMAND CENTER E2E TEST');
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
    assert(!!adminAAuth.token, 'Hospital Admin A (Chief Executive Officer) authenticated successfully');

    const adminBAuth = await login('admin.hospb@medinexa.local', 'Password123!');
    assert(!!adminBAuth.token, 'Hospital Admin B authenticated successfully');

    const docAuth = await login('doc.reminder@medinexa.local', 'Password123!');
    assert(!!docAuth.token, 'Clinician authenticated successfully');

    let nurseAuth = await login('nurse@medinexa.local', 'Password123!');
    if (!nurseAuth.token) nurseAuth = await login('nurse.joy@medinexa.local', 'Password123!');
    assert(!!nurseAuth.token, 'Ward Nurse authenticated successfully');

    const patientAuth = await login('patient.doe@medinexa.local', 'Password123!');
    assert(!!patientAuth.token, 'Patient authenticated successfully');

    // --- Step 1: Strict RBAC Security Controls ---
    console.log('\n--- Step 1: Strict RBAC Security Controls ---');
    const docBiRes = await fetch(`${BASE_URL}/bi/executive-dashboard`, {
      headers: { Authorization: `Bearer ${docAuth.token}` },
    });
    assert(docBiRes.status === 403, 'RBAC Guard: Doctor role blocked with HTTP 403 Forbidden from C-suite BI dashboard');

    const nurseBiRes = await fetch(`${BASE_URL}/bi/executive-dashboard`, {
      headers: { Authorization: `Bearer ${nurseAuth.token}` },
    });
    assert(nurseBiRes.status === 403, 'RBAC Guard: Nurse role blocked with HTTP 403 Forbidden from C-suite BI dashboard');

    const patientBiRes = await fetch(`${BASE_URL}/bi/executive-dashboard`, {
      headers: { Authorization: `Bearer ${patientAuth.token}` },
    });
    assert(patientBiRes.status === 403, 'RBAC Guard: Patient role blocked with HTTP 403 Forbidden from C-suite BI dashboard');

    // --- Step 2: Executive Command Center Dashboard ---
    console.log('\n--- Step 2: Executive Command Center Dashboard ---');
    const getDashRes = await fetch(`${BASE_URL}/bi/executive-dashboard`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(getDashRes.status === 200, 'GET /bi/executive-dashboard returned HTTP 200 OK');
    const dashboard = await getDashRes.json();
    assert(typeof dashboard.revenueToday === 'number', `KPI: Revenue Today recognized ($${dashboard.revenueToday.toLocaleString()})`);
    assert(typeof dashboard.revenueMonth === 'number', `KPI: Revenue MTD recognized ($${dashboard.revenueMonth.toLocaleString()})`);
    assert(typeof dashboard.opdVisitsToday === 'number', `KPI: OPD Visits Today: ${dashboard.opdVisitsToday}`);
    assert(typeof dashboard.telemedicineToday === 'number', `KPI: Telemedicine Sessions: ${dashboard.telemedicineToday}`);
    assert(typeof dashboard.admissionsToday === 'number', `KPI: Inpatient Admissions Today: ${dashboard.admissionsToday}`);
    assert(typeof dashboard.dischargesToday === 'number', `KPI: Discharges Today: ${dashboard.dischargesToday}`);
    assert(typeof dashboard.bedOccupancyRate === 'number', `KPI: Bed Occupancy Rate: ${dashboard.bedOccupancyRate}%`);
    assert(typeof dashboard.emergencyPatientsToday === 'number', `KPI: Emergency Patients: ${dashboard.emergencyPatientsToday}`);
    assert(typeof dashboard.avgLengthOfStay === 'number', `KPI: Average Length of Stay (ALOS): ${dashboard.avgLengthOfStay} days`);
    assert(typeof dashboard.patientSatisfaction === 'number', `KPI: Patient Satisfaction (CSAT): ${dashboard.patientSatisfaction}%`);

    // --- Step 3: Revenue Trends & Historical Series ---
    console.log('\n--- Step 3: Revenue Trends & Historical Series ---');
    const getRevRes = await fetch(`${BASE_URL}/bi/revenue-trends`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(getRevRes.status === 200, 'GET /bi/revenue-trends returned HTTP 200 OK');
    const revTrends = await getRevRes.json();
    assert(Array.isArray(revTrends.daily) && revTrends.daily.length === 7, 'Daily revenue & collection series (7-day window) available');
    assert(Array.isArray(revTrends.weekly) && revTrends.weekly.length === 4, 'Weekly revenue series (4-week window) available');
    assert(Array.isArray(revTrends.monthly) && revTrends.monthly.length === 4, 'Monthly revenue series (4-month window) available');

    // --- Step 4: Bed Capacity & Ward Occupancy Telemetry ---
    console.log('\n--- Step 4: Bed Capacity & Ward Occupancy Telemetry ---');
    const getBedRes = await fetch(`${BASE_URL}/bi/bed-analytics`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(getBedRes.status === 200, 'GET /bi/bed-analytics returned HTTP 200 OK');
    const bedData = await getBedRes.json();
    assert(typeof bedData.totalBeds === 'number', `Bed Analytics: Total Bed Capacity: ${bedData.totalBeds}`);
    assert(typeof bedData.occupiedBeds === 'number', `Bed Analytics: Occupied Beds: ${bedData.occupiedBeds}`);
    assert(typeof bedData.icuOccupancy === 'number', `Bed Analytics: ICU Occupancy Rate: ${bedData.icuOccupancy}%`);
    assert(Array.isArray(bedData.breakdownByWard) && bedData.breakdownByWard.length > 0, `Ward-level census breakdown available (${bedData.breakdownByWard.length} wards)`);

    // --- Step 5: Doctor Productivity Leaderboard ---
    console.log('\n--- Step 5: Doctor Productivity Leaderboard ---');
    const getDocRes = await fetch(`${BASE_URL}/bi/doctor-productivity`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(getDocRes.status === 200, 'GET /bi/doctor-productivity returned HTTP 200 OK');
    const doctorList = await getDocRes.json();
    assert(Array.isArray(doctorList) && doctorList.length > 0, `Doctor Productivity Leaderboard loaded (${doctorList.length} physicians)`);
    assert(typeof doctorList[0].patientsSeen === 'number', `Top Doctor: ${doctorList[0].doctorName} (${doctorList[0].patientsSeen} patients seen)`);

    // --- Step 6: Patient Flow Conversion Funnel ---
    console.log('\n--- Step 6: Patient Flow Conversion Funnel ---');
    const getFlowRes = await fetch(`${BASE_URL}/bi/patient-flow`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(getFlowRes.status === 200, 'GET /bi/patient-flow returned HTTP 200 OK');
    const flowData = await getFlowRes.json();
    assert(typeof flowData.opdCount === 'number', `Patient Flow: OPD Volume: ${flowData.opdCount}`);
    assert(typeof flowData.conversionRateOpdToIpd === 'number', `Patient Flow: OPD to Inpatient Conversion Rate: ${flowData.conversionRateOpdToIpd}%`);
    assert(Array.isArray(flowData.funnel) && flowData.funnel.length === 4, '4-Stage Patient Flow Funnel successfully mapped');

    // --- Step 7: Financial Summary & Departmental Revenue ---
    console.log('\n--- Step 7: Financial Summary & Departmental Revenue ---');
    const getFinRes = await fetch(`${BASE_URL}/bi/financial-summary`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(getFinRes.status === 200, 'GET /bi/financial-summary returned HTTP 200 OK');
    const finSummary = await getFinRes.json();
    assert(typeof finSummary.revenue === 'number', `Financial Summary: Total Net Revenue: $${finSummary.revenue.toLocaleString()}`);
    assert(typeof finSummary.collections === 'number', `Financial Summary: Total Realized Collections: $${finSummary.collections.toLocaleString()}`);
    assert(typeof finSummary.departmentRevenue?.OPD === 'number', 'Departmental Revenue Breakdown (OPD, IPD, Pharmacy, Lab, Telehealth) computed');

    // --- Step 8: Aggregated KPI Snapshot Analytics ---
    console.log('\n--- Step 8: Aggregated KPI Snapshot Analytics ---');
    const getAnalRes = await fetch(`${BASE_URL}/bi/analytics`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(getAnalRes.status === 200, 'GET /bi/analytics returned HTTP 200 OK');
    const analData = await getAnalRes.json();
    assert(typeof analData.hospitalPerformanceScore === 'number', `Hospital Performance Score Index: ${analData.hospitalPerformanceScore}/100`);
    assert(Array.isArray(analData.activeAlerts) && analData.activeAlerts.length > 0, `Operational EMR Alerts active (${analData.activeAlerts.length} alerts)`);

    // --- Step 9: Multi-Hospital Isolation Guards ---
    console.log('\n--- Step 9: Multi-Hospital Isolation Guards ---');
    const crossBiRes = await fetch(`${BASE_URL}/bi/executive-dashboard?facilityId=95001a7a-3a65-4fb4-85ad-c0cf7e7d2fa8`, {
      headers: { Authorization: `Bearer ${adminBAuth.token}` },
    });
    assert(crossBiRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from Hospital A BI telemetry');

    console.log('\n==================================================');
    console.log(`📊 BUSINESS INTELLIGENCE E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during Business Intelligence E2E test:', err);
    process.exit(1);
  }
}

runBusinessIntelligenceE2ETest();
