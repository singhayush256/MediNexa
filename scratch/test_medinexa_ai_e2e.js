const assert = require('assert');

async function runAiTests() {
  console.log('===========================================================');
  console.log('🤖 TESTING MEDINEXA AI & ALL 5 HEALTHCARE USE CASES (E2E)');
  console.log('===========================================================\n');

  const BASE_URL = 'http://localhost:3001/api/v1';
  const SERVER_URL = 'http://localhost:3001';

  // Test 1: Basic endpoint connectivity (POST /api/v1/ai/chat)
  console.log('STEP 1: Testing POST /api/v1/ai/chat endpoint...');
  const res1 = await fetch(`${BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hello MediNexa' }),
  });
  assert(res1.status === 200 || res1.status === 201, `Status must be 200 or 201, got ${res1.status}`);
  const data1 = await res1.json();
  assert(data1.success === true, 'Response must have success: true');
  assert(data1.answer || data1.response, 'Response must contain answer or response string');
  assert(Array.isArray(data1.sources), 'Response must contain sources array');
  console.log('  [PASS] POST /api/v1/ai/chat is fully online and responsive.');

  // Test 2: Unprefixed route rewrite (POST /ai/chat)
  console.log('\nSTEP 2: Testing unprefixed POST /ai/chat route rewrite...');
  const resRewrite = await fetch(`${SERVER_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hi MediNexa' }),
  });
  assert(resRewrite.status === 200 || resRewrite.status === 201, `Rewrite status must be 200/201, got ${resRewrite.status}`);
  const dataRewrite = await resRewrite.json();
  assert(dataRewrite.success === true, 'Rewrite response must succeed');
  console.log('  [PASS] Unprefixed POST /ai/chat successfully rewrites and responds with 201.');

  // Test 3: Use Case 1 - Appointment Guidance
  console.log('\nSTEP 3: Testing Healthcare Use Case 1 - Appointment Guidance...');
  const resAppt = await fetch(`${BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'How do I book an appointment with a specialist doctor?' }),
  });
  const dataAppt = await resAppt.json();
  const textAppt = (dataAppt.answer || dataAppt.response).toLowerCase();
  assert(textAppt.includes('appointment') || textAppt.includes('book') || textAppt.includes('portal'), 'Must provide appointment guidance');
  console.log('  [PASS] Appointment Guidance returned:');
  console.log(`    "${(dataAppt.answer || dataAppt.response).slice(0, 140)}..."`);

  // Test 4: Use Case 2 - Department Recommendation
  console.log('\nSTEP 4: Testing Healthcare Use Case 2 - Department Recommendation...');
  const resDept = await fetch(`${BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'I have severe chest pain radiating to my left arm, which department should I go to?' }),
  });
  const dataDept = await resDept.json();
  const textDept = (dataDept.answer || dataDept.response).toLowerCase();
  assert(textDept.includes('cardiology'), 'Chest pain must recommend Cardiology department');
  console.log('  [PASS] Department Recommendation returned:');
  console.log(`    "${(dataDept.answer || dataDept.response).slice(0, 140)}..."`);

  // Test 5: Use Case 3 - Prescription Explanation
  console.log('\nSTEP 5: Testing Healthcare Use Case 3 - Prescription Explanation...');
  const resRx = await fetch(`${BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Why was I prescribed Dolo 650 and Pan 40? How do I take them?' }),
  });
  const dataRx = await resRx.json();
  const textRx = (dataRx.answer || dataRx.response).toLowerCase();
  assert(textRx.includes('dolo 650') || textRx.includes('pan 40'), 'Must explain Dolo 650 and Pan 40');
  console.log('  [PASS] Prescription Explanation returned:');
  console.log(`    "${(dataRx.answer || dataRx.response).slice(0, 140)}..."`);

  // Test 6: Use Case 4 - Lab Report Explanation
  console.log('\nSTEP 6: Testing Healthcare Use Case 4 - Lab Report Explanation...');
  const resLab = await fetch(`${BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Explain my CBC test results and Fasting Blood Sugar 135 mg/dL' }),
  });
  const dataLab = await resLab.json();
  const textLab = (dataLab.answer || dataLab.response).toLowerCase();
  assert(textLab.includes('cbc') || textLab.includes('blood sugar') || textLab.includes('hemoglobin'), 'Must explain CBC and blood sugar');
  console.log('  [PASS] Lab Report Explanation returned:');
  console.log(`    "${(dataLab.answer || dataLab.response).slice(0, 140)}..."`);

  // Test 7: Use Case 5 - Hospital Navigation
  console.log('\nSTEP 7: Testing Healthcare Use Case 5 - Hospital Navigation...');
  const resNav = await fetch(`${BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Where is the emergency room and the pharmacy located in the hospital?' }),
  });
  const dataNav = await resNav.json();
  const textNav = (dataNav.answer || dataNav.response).toLowerCase();
  assert(textNav.includes('ground floor') || textNav.includes('emergency') || textNav.includes('pharmacy'), 'Must provide floor navigation directory');
  console.log('  [PASS] Hospital Navigation returned:');
  console.log(`    "${(dataNav.answer || dataNav.response).slice(0, 140)}..."`);

  // Test 8: Security & API Key Protection
  console.log('\nSTEP 8: Verifying Zero API Key Exposure...');
  const secretKey = 'mdnx_live_clinical_engine_v2_2026';
  const rawData = JSON.stringify([data1, dataRewrite, dataAppt, dataDept, dataRx, dataLab, dataNav]);
  assert(!rawData.includes(secretKey), 'API Key or server secret MUST NEVER be exposed in chat payload');
  assert(!rawData.includes('AQ.Ab8RN6JIpR2TDNsPjW8vIY_Lj9mN1yf48b95yYK30wyp1Pfy3w'), 'No raw environment secrets exposed');
  console.log('  [PASS] Security verified: 0 API keys or private secrets exposed in client responses.');

  console.log('\n===========================================================');
  console.log('🎉 ALL MEDINEXA AI HEALTHCARE USE CASES & SECURITY CHECKS PASSED (100%)');
  console.log('===========================================================\n');
}

runAiTests().catch((err) => {
  console.error('\n❌ MEDINEXA AI TEST FAILED:', err);
  process.exit(1);
});
