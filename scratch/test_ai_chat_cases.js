async function testCases() {
  const BASE_URL = 'http://localhost:3001/api/v1';

  const queries = [
    { name: '1. Appointment Guidance', prompt: 'How do I book an appointment with a cardiologist?' },
    { name: '2. Department Recommendation', prompt: 'I have severe joint pain and knee stiffness, which doctor should I see?' },
    { name: '3. Prescription Explanation', prompt: 'Why was I prescribed Dolo 650 and Pan 40? How should I take them?' },
    { name: '4. Lab Report Explanation', prompt: 'My blood report shows Hemoglobin 10.5 g/dL and Fasting Blood Sugar 145 mg/dL. What does this mean?' },
    { name: '5. Hospital Navigation', prompt: 'Where is the pathology lab and the emergency room located in the hospital?' },
  ];

  for (const q of queries) {
    console.log(`\n==============================================`);
    console.log(`TESTING: ${q.name}`);
    console.log(`Prompt: "${q.prompt}"`);

    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: q.prompt }),
    });

    console.log(`HTTP Status: ${res.status}`);
    const data = await res.json();
    console.log(`Success: ${data.success}`);
    console.log(`Sources: ${JSON.stringify(data.sources)}`);
    console.log(`Answer Preview:\n${data.answer.substring(0, 300)}...`);
  }

  // Test Health
  console.log(`\n==============================================`);
  console.log(`TESTING: Health Endpoint`);
  const healthRes = await fetch(`${BASE_URL}/ai/health`);
  console.log(`Health Status: ${healthRes.status}`);
  const healthData = await healthRes.json();
  console.log(`Health Data:`, healthData);
}

testCases().catch(console.error);
