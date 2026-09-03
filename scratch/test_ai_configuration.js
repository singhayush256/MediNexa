const http = require('http');
const fs = require('fs');
const path = require('path');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('🤖 MEDINEXA SECURE AI INTEGRATION VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, desc) {
    if (condition) {
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${desc}`);
      failed++;
    }
  }

  // 1. Static Security & Frontend Isolation Check
  console.log('\n--- 1. STATIC CODE & CLIENT BUNDLE SECURITY SCAN ---');
  const secretKey = 'AQ.Ab8RN6JIpR2TDNsPjW8vIY_Lj9mN1yf48b95yYK30wyp1Pfy3w';

  // Check if .env is gitignored
  const gitignore = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8');
  assert(gitignore.includes('.env'), '.gitignore properly excludes .env files from git commits');

  // Check if frontend directory contains the secret key
  const webDir = path.join(__dirname, '..', 'apps', 'web', 'app');
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const fullPath = path.join(dir, f);
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath);
      } else if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.json')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(secretKey)) {
          return false;
        }
      }
    }
    return true;
  }
  assert(scanDir(webDir), 'Zero frontend source files contain the secret AI API key');

  // 2. Authentication Tokens
  console.log('\n--- 2. AUTHENTICATION & ROLE TOKENS ---');
  const adminLogin = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'admin.hospa@medinexa.local', password: 'Password123!' });

  assert(adminLogin.status === 200 || adminLogin.status === 201, 'Hospital Admin authenticated successfully');
  const adminToken = adminLogin.data.accessToken || adminLogin.data.token;

  const docLogin = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'doc.reminder@medinexa.local', password: 'Password123!' });

  assert(docLogin.status === 200 || docLogin.status === 201, 'Doctor authenticated successfully');
  const docToken = docLogin.data.accessToken || docLogin.data.token;

  const patientLogin = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'patient.doe@medinexa.local', password: 'Password123!' });

  assert(patientLogin.status === 200 || patientLogin.status === 201, 'Patient authenticated successfully');
  const patientToken = patientLogin.data.accessToken || patientLogin.data.token;

  // 3. AI Service Health & Configuration Status
  console.log('\n--- 3. SERVER-SIDE AI HEALTH & CONFIGURATION ---');
  const healthRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/ai/health',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  assert(healthRes.status === 200, 'GET /api/v1/ai/health returns 200 OK');
  assert(healthRes.data.status === 'OPERATIONAL', 'AI Service reports OPERATIONAL status');
  assert(healthRes.data.aiEngine.configured === true, 'Server confirms AI API Key is configured in environment');
  assert(healthRes.data.aiEngine.serverSideOnly === true, 'AI Engine declares serverSideOnly = true');
  assert(!JSON.stringify(healthRes.data).includes(secretKey), 'AI Health endpoint NEVER leaks the raw API key');

  // 4. Secure AI Inference Queries
  console.log('\n--- 4. CLINICAL AI INFERENCE QUERIES ---');
  const queryRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/ai/query',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${docToken}`,
    },
  }, {
    prompt: 'Evaluate emergency triage protocols for acute chest pain and abnormal vitals',
    taskType: 'CDS_TRIAGE',
  });

  assert(queryRes.status === 201 || queryRes.status === 200, 'POST /api/v1/ai/query processed successfully');
  assert(queryRes.data.status === 'SUCCESS', 'AI query returned SUCCESS status');
  assert(queryRes.data.answer && queryRes.data.answer.includes('MEDINEXA CDS INTELLIGENCE'), 'AI response contains synthesized clinical decision intelligence');
  assert(!JSON.stringify(queryRes.data).includes(secretKey), 'AI Query response NEVER leaks the secret API key');

  // 5. Clinical Copilot SOAP Note Generation
  console.log('\n--- 5. CLINICAL COPILOT & SOAP SYNTHESIS ---');
  const soapRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/copilot/generate-note',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${docToken}`,
    },
  }, {
    patientId: 'patient_doe_profile_id',
    chiefComplaint: 'Post-operative abdominal incision discomfort and low grade fever',
    symptoms: 'Fever 100.8 F, mild erythema at surgical site',
    observations: 'Incision intact, mild tenderness, no purulent drainage',
    medications: 'Cefazolin 1g IV Q8H, Acetaminophen 650mg PO Q6H',
    diagnosis: 'Post-operative monitoring, superficial surgical site erythema',
  });

  assert(soapRes.status === 201 || soapRes.status === 200, 'POST /api/v1/copilot/generate-note processed successfully');
  assert(soapRes.data.type === 'SOAP_NOTE', 'AI Copilot generated SOAP_NOTE record');
  assert(soapRes.data.timeSavedMinutes > 0, 'AI Copilot accurately logged time savings');

  // 6. Security & RBAC Protection
  console.log('\n--- 6. SECURITY & RBAC ACCESS GUARDS ---');
  const unauthRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/ai/query',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { prompt: 'Test unauthorized query' });

  assert(unauthRes.status === 401, 'Unauthenticated query rejected with 401 Unauthorized');

  const patientDeniedRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/ai/query',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${patientToken}`,
    },
  }, { prompt: 'Patient trying to access clinical AI decision engine' });

  assert(patientDeniedRes.status === 403, 'Patient role blocked with 403 Forbidden from accessing clinical AI engine');

  // 7. Audit Logging Verification
  console.log('\n--- 7. AUDIT LOGGING OF AI OPERATIONS ---');
  const auditRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/audit/logs?action=AI_QUERY_REQUEST',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  assert(auditRes.status === 200, 'Admin can retrieve PHI audit logs for AI operations');
  assert(Array.isArray(auditRes.data) && auditRes.data.length > 0, 'Audit event successfully recorded in database for AI query');
  const latestLog = auditRes.data[0];
  assert(latestLog.action === 'AI_QUERY_REQUEST', 'Audit event action correctly logged as AI_QUERY_REQUEST');
  assert(!JSON.stringify(latestLog).includes(secretKey), 'Audit logs do not contain raw secret API keys');

  console.log('\n================================================================');
  console.log(`📊 AI INTEGRATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
