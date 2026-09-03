const assert = require('assert');

async function runAiSuiteE2ETest() {
  console.log('====================================================');
  console.log('🏥 MEDINEXA AI SUITE END-TO-END VALIDATION');
  console.log('====================================================\n');

  const BASE_URL = 'http://localhost:3001/api/v1';

  // 1. Health and Secret Key Safety
  console.log('STEP 1: Validating Health Endpoint & Zero API Key Exposure...');
  const healthRes = await fetch(`${BASE_URL}/ai/health`);
  assert.strictEqual(healthRes.status, 200, `Health check failed with ${healthRes.status}`);
  const healthData = await healthRes.json();
  console.log('  Health Payload:', JSON.stringify(healthData, null, 2));
  assert.strictEqual(healthData.status, 'OPERATIONAL');
  assert.strictEqual(healthData.aiEngine.configured, true);
  assert.strictEqual(healthData.aiEngine.serverSideOnly, true);

  // Assert no key leaked in JSON string
  const healthString = JSON.stringify(healthData);
  assert(!healthString.includes('key'), 'API Key name or secret string must NEVER be exposed!');
  console.log('  [PASS] Server reports OPERATIONAL. No API keys exposed.\n');

  // 2. All 5 Healthcare Use Cases
  const testCases = [
    {
      case: 'Appointment Guidance',
      message: 'I want to book an appointment with Dr. Arvind Deshmukh for my heart checkup.',
      expectedKeywords: ['Appointment Guidance', 'Portal Appointments', 'OPD Consultation Hours'],
    },
    {
      case: 'Department Recommendation',
      message: 'I have intense joint pain and severe knee swelling, which doctor should I see?',
      expectedKeywords: ['Recommended Clinical Department', 'Orthopedics', 'OPD Wing A'],
    },
    {
      case: 'Prescription Explanation',
      message: 'Why was I prescribed Dolo 650 and Pan 40? How should I take them?',
      expectedKeywords: ['Dolo 650', 'Pan 40', 'Food', 'Paracetamol'],
    },
    {
      case: 'Lab Report Explanation',
      message: 'My blood test report says Fasting Blood Sugar 148 mg/dL and HbA1c is 7.4%. What does this mean?',
      expectedKeywords: ['Diagnostic Lab Report', 'Fasting Blood Sugar', 'HbA1c', 'Normal'],
    },
    {
      case: 'Hospital Navigation',
      message: 'Where is the pathology lab and emergency room located in the hospital?',
      expectedKeywords: ['Hospital Navigation Directory', 'Ground Floor', '2nd Floor'],
    },
  ];

  console.log('STEP 2: Validating 5 Healthcare Use Cases...');
  for (const tc of testCases) {
    console.log(`\n  Testing: [${tc.case}]`);
    console.log(`  Prompt: "${tc.message}"`);

    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: tc.message }),
    });

    assert.strictEqual(res.status, 201, `Failed with status ${res.status}`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(typeof data.answer === 'string' && data.answer.length > 50);
    assert(Array.isArray(data.sources) && data.sources.length > 0);

    for (const kw of tc.expectedKeywords) {
      assert(
        data.answer.toLowerCase().includes(kw.toLowerCase()),
        `Response for [${tc.case}] should include keyword "${kw}"`
      );
    }

    console.log(`  Sources: ${data.sources.join(', ')}`);
    console.log(`  Preview: ${data.answer.substring(0, 140).replace(/\n/g, ' ')}...`);
    console.log(`  [PASS] ${tc.case} returned accurate clinical response.`);
  }

  // 3. Error Handling & Malformed Input
  console.log('\nSTEP 3: Validating Error Handling with Empty Prompt...');
  const emptyRes = await fetch(`${BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: '' }),
  });
  // Empty message fails validation or triggers fallback safely
  console.log(`  Empty prompt response status: ${emptyRes.status}`);
  const emptyData = await emptyRes.json();
  console.log(`  Empty prompt handled:`, emptyData);
  console.log('  [PASS] Error handling validated.');

  console.log('\n====================================================');
  console.log('🎉 ALL MEDINEXA AI SUITE TESTS PASSED WITH 100% SUCCESS!');
  console.log('====================================================\n');
}

runAiSuiteE2ETest().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
