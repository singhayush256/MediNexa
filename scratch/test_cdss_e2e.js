const BASE_URL = 'http://localhost:3001/api/v1';

async function runCdssE2ETest() {
  console.log('==================================================');
  console.log('🛡️ MEDINEXA CDSS (CLINICAL DECISION SUPPORT SYSTEM) E2E TEST');
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
    assert(!!docAuth.token, 'Attending Physician authenticated successfully');

    let nurseAuth = await login('nurse@medinexa.local', 'Password123!');
    if (!nurseAuth.token) nurseAuth = await login('nurse.joy@medinexa.local', 'Password123!');
    assert(!!nurseAuth.token, 'Clinical Nurse authenticated successfully');

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
    const patientCheckRes = await fetch(`${BASE_URL}/cdss/check-medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientAuth.token}` },
      body: JSON.stringify({ patientId, medications: [{ drugName: 'Aspirin' }] }),
    });
    assert(patientCheckRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from CDSS evaluation engine');

    const patientAllergyRes = await fetch(`${BASE_URL}/cdss/allergies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientAuth.token}` },
      body: JSON.stringify({ patientId, allergen: 'Penicillin', reaction: 'Rash' }),
    });
    assert(patientAllergyRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from recording clinical allergies');

    const nurseOverrideRes = await fetch(`${BASE_URL}/cdss/alerts/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${nurseAuth.token}` },
      body: JSON.stringify({ patientId, overrideReason: 'Nurse attempt to override alert' }),
    });
    assert(nurseOverrideRes.status === 403, 'RBAC Guard: Nurse role blocked with HTTP 403 Forbidden from clinical safety overrides');

    // --- Step 2: Patient Allergy Management ---
    console.log('\n--- Step 2: Patient Allergy Management ---');
    const createAllergyRes = await fetch(`${BASE_URL}/cdss/allergies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docAuth.token}` },
      body: JSON.stringify({
        patientId,
        allergen: 'Penicillin',
        reaction: 'Severe Anaphylaxis and Angioedema',
        severity: 'CRITICAL',
      }),
    });
    assert(createAllergyRes.status === 201 || createAllergyRes.status === 200, 'POST /cdss/allergies returned HTTP 201/200');
    const createdAllergy = await createAllergyRes.json();
    assert(createdAllergy.allergen === 'Penicillin', 'Allergy substance recorded as Penicillin');

    const listAllergiesRes = await fetch(`${BASE_URL}/cdss/allergies/${patientId}`, {
      headers: { Authorization: `Bearer ${docAuth.token}` },
    });
    assert(listAllergiesRes.status === 200, 'GET /cdss/allergies/:patientId returned HTTP 200 OK');
    const allergyList = await listAllergiesRes.json();
    assert(Array.isArray(allergyList) && allergyList.length > 0, `Patient allergy registry retrieved (${allergyList.length} allergies)`);

    // --- Step 3: Drug-Allergy Conflict Detection ---
    console.log('\n--- Step 3: Drug-Allergy Conflict Detection ---');
    const amoxicillinCheckRes = await fetch(`${BASE_URL}/cdss/check-medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docAuth.token}` },
      body: JSON.stringify({
        patientId,
        medications: [{ drugName: 'Amoxicillin', doseValue: 500 }],
      }),
    });
    assert(amoxicillinCheckRes.status === 201 || amoxicillinCheckRes.status === 200, 'POST /cdss/check-medications (Amoxicillin for Penicillin-allergic patient) returned HTTP 201/200');
    const amoxData = await amoxicillinCheckRes.json();
    assert(amoxData.isSafe === false, 'Safety Engine correctly flagged unsafe prescription');
    assert(amoxData.alerts.some((a) => a.ruleType === 'DRUG_ALLERGY' && a.severity === 'CRITICAL'), 'CDSS generated CRITICAL allergy cross-reactivity alert for Amoxicillin');

    // --- Step 4: Pairwise Drug-Drug Interaction Checks ---
    console.log('\n--- Step 4: Pairwise Drug-Drug Interaction Checks ---');
    const ddiCheckRes = await fetch(`${BASE_URL}/cdss/check-medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docAuth.token}` },
      body: JSON.stringify({
        patientId,
        medications: [
          { drugName: 'Warfarin', doseValue: 5 },
          { drugName: 'Aspirin', doseValue: 100 },
        ],
      }),
    });
    assert(ddiCheckRes.status === 201 || ddiCheckRes.status === 200, 'POST /cdss/check-medications (Warfarin + Aspirin) returned HTTP 201/200');
    const ddiData = await ddiCheckRes.json();
    assert(ddiData.alerts.some((a) => a.ruleType === 'DRUG_INTERACTION' && a.severity === 'HIGH'), 'CDSS generated HIGH severity Bleeding Risk alert for Warfarin + Aspirin');

    const mtxCheckRes = await fetch(`${BASE_URL}/cdss/check-medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docAuth.token}` },
      body: JSON.stringify({
        patientId,
        medications: [
          { drugName: 'Methotrexate', doseValue: 15 },
          { drugName: 'Ibuprofen', doseValue: 400 },
        ],
      }),
    });
    const mtxData = await mtxCheckRes.json();
    assert(mtxData.alerts.some((a) => a.ruleType === 'DRUG_INTERACTION' && a.severity === 'CRITICAL'), 'CDSS generated CRITICAL severity Methotrexate Toxicity alert for Methotrexate + NSAID');

    // --- Step 5: Duplicate Therapy Detection ---
    console.log('\n--- Step 5: Duplicate Therapy Detection ---');
    const dupCheckRes = await fetch(`${BASE_URL}/cdss/check-medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docAuth.token}` },
      body: JSON.stringify({
        patientId,
        medications: [
          { drugName: 'Ibuprofen', doseValue: 400 },
          { drugName: 'Naproxen', doseValue: 500 },
        ],
      }),
    });
    const dupData = await dupCheckRes.json();
    assert(dupData.alerts.some((a) => a.ruleType === 'DUPLICATE_THERAPY' && a.severity === 'MEDIUM'), 'CDSS generated MEDIUM severity Duplicate Therapy alert for dual NSAIDs');

    // --- Step 6: Age Restriction & Pediatric Checks ---
    console.log('\n--- Step 6: Age Restriction & Pediatric Checks ---');
    const pedCheckRes = await fetch(`${BASE_URL}/cdss/check-medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docAuth.token}` },
      body: JSON.stringify({
        patientId,
        patientAge: 11,
        medications: [{ drugName: 'Aspirin', doseValue: 300 }],
      }),
    });
    const pedData = await pedCheckRes.json();
    assert(pedData.alerts.some((a) => a.ruleType === 'AGE_RESTRICTION' && a.severity === 'HIGH'), "CDSS generated HIGH severity Pediatric Reye's Syndrome contraindication for Aspirin in child");

    // --- Step 7: Pregnancy Warnings & Fetotoxicity ---
    console.log('\n--- Step 7: Pregnancy Warnings & Fetotoxicity ---');
    const pregCheckRes = await fetch(`${BASE_URL}/cdss/check-medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docAuth.token}` },
      body: JSON.stringify({
        patientId,
        isPregnant: true,
        medications: [{ drugName: 'Warfarin', doseValue: 5 }],
      }),
    });
    const pregData = await pregCheckRes.json();
    assert(pregData.alerts.some((a) => a.ruleType === 'PREGNANCY_WARNING' && a.severity === 'CRITICAL'), 'CDSS generated CRITICAL FDA Category X Pregnancy Teratogenicity alert for Warfarin');

    // --- Step 8: Renal Dose Adjustments ---
    console.log('\n--- Step 8: Renal Dose Adjustments ---');
    const renalCheckRes = await fetch(`${BASE_URL}/cdss/check-medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docAuth.token}` },
      body: JSON.stringify({
        patientId,
        eGfr: 22,
        medications: [{ drugName: 'Metformin', doseValue: 1000 }],
      }),
    });
    const renalData = await renalCheckRes.json();
    assert(renalData.alerts.some((a) => a.ruleType === 'RENAL_ADJUSTMENT' && a.severity === 'CRITICAL'), 'CDSS generated CRITICAL Renal Contraindication alert for Metformin in severe renal impairment');

    // --- Step 9: Dosing Validation & Threshold Ceilings ---
    console.log('\n--- Step 9: Dosing Validation & Threshold Ceilings ---');
    const doseCheckRes = await fetch(`${BASE_URL}/cdss/check-medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docAuth.token}` },
      body: JSON.stringify({
        patientId,
        medications: [{ drugName: 'Paracetamol', doseValue: 2000 }],
      }),
    });
    const doseData = await doseCheckRes.json();
    assert(doseData.alerts.some((a) => a.ruleType === 'DOSING_WARNING' && a.severity === 'HIGH'), 'CDSS generated HIGH severity Dosing Violation alert for Paracetamol > 1,000 mg single dose');

    // --- Step 10: Alert Dashboard & Acknowledgment Workflow ---
    console.log('\n--- Step 10: Alert Dashboard & Acknowledgment Workflow ---');
    const listAlertsRes = await fetch(`${BASE_URL}/cdss/alerts`, {
      headers: { Authorization: `Bearer ${docAuth.token}` },
    });
    assert(listAlertsRes.status === 200, 'GET /cdss/alerts returned HTTP 200 OK');
    const alertList = await listAlertsRes.json();
    assert(Array.isArray(alertList) && alertList.length > 0, `Active CDSS clinical alarms loaded (${alertList.length} alerts)`);

    const unacked = alertList.find((a) => !a.acknowledged);
    assert(!!unacked, `Found unacknowledged clinical alert (${unacked?.title})`);

    const ackRes = await fetch(`${BASE_URL}/cdss/alerts/${unacked.id}/acknowledge`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docAuth.token}` },
      body: JSON.stringify({ notes: 'Physician reviewed clinical safety intercept' }),
    });
    assert(ackRes.status === 200, 'PATCH /cdss/alerts/:id/acknowledge returned HTTP 200 OK');
    const acked = await ackRes.json();
    assert(acked.acknowledged === true, 'Alert successfully marked acknowledged: true');

    // --- Step 11: Doctor Safety Override with Mandatory Reason ---
    console.log('\n--- Step 11: Doctor Safety Override with Mandatory Reason ---');
    const overrideRes = await fetch(`${BASE_URL}/cdss/alerts/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docAuth.token}` },
      body: JSON.stringify({
        patientId,
        overrideReason: 'Clinical benefit outweighs bleeding risk; patient is on PPI gastroprotection and daily INR monitoring.',
        alertCount: 2,
      }),
    });
    assert(overrideRes.status === 201 || overrideRes.status === 200, 'POST /cdss/alerts/override returned HTTP 201/200');
    const auditRecord = await overrideRes.json();
    assert(auditRecord.overrideReason.includes('PPI gastroprotection'), 'Override justification recorded in MedicationSafetyAudit registry');

    // --- Step 12: Patient Safety Profile & Analytics ---
    console.log('\n--- Step 12: Patient Safety Profile & Analytics ---');
    const profileRes = await fetch(`${BASE_URL}/cdss/patient/${patientId}/safety-profile`, {
      headers: { Authorization: `Bearer ${docAuth.token}` },
    });
    assert(profileRes.status === 200, 'GET /cdss/patient/:patientId/safety-profile returned HTTP 200 OK');
    const profile = await profileRes.json();
    assert(profile.allergyCount >= 1, `Safety profile contains verified allergies (${profile.allergyCount})`);
    assert(profile.overrideCount >= 1, `Safety profile tracks past clinical overrides (${profile.overrideCount})`);

    const analRes = await fetch(`${BASE_URL}/cdss/analytics`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(analRes.status === 200, 'GET /cdss/analytics returned HTTP 200 OK');
    const analytics = await analRes.json();
    assert(typeof analytics.alertsToday === 'number', `Analytics: Alerts Today: ${analytics.alertsToday}`);
    assert(typeof analytics.preventedMedicationErrors === 'number', `Analytics: Prevented Medication Errors: ${analytics.preventedMedicationErrors}%`);

    // --- Step 13: Multi-Hospital Isolation Guard ---
    console.log('\n--- Step 13: Multi-Hospital Isolation Guard ---');
    const crossHospitalRes = await fetch(`${BASE_URL}/cdss/patient/${patientId}/safety-profile`, {
      headers: { Authorization: `Bearer ${adminBAuth.token}` },
    });
    assert(crossHospitalRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from accessing Hospital A patient safety profile');

    console.log('\n==================================================');
    console.log(`🛡️ CDSS E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during CDSS E2E test:', err);
    process.exit(1);
  }
}

runCdssE2ETest();
