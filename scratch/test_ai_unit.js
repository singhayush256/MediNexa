require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { MediNexaAiProvider } = require('../apps/api/dist/ai/providers/medinexa-ai.provider');
const { AiService } = require('../apps/api/dist/ai/ai.service');

async function runUnitSuite() {
  console.log('================================================================');
  console.log('🤖 MEDINEXA SECURE AI CHAT & ENDPOINT VERIFICATION SUITE');
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

  const secretKey = 'AQ.Ab8RN6JIpR2TDNsPjW8vIY_Lj9mN1yf48b95yYK30wyp1Pfy3w';

  // --- 1. ENVIRONMENT KEY VERIFICATION ---
  console.log('\n--- 1. SERVER-SIDE ENVIRONMENT VARIABLE EXTRACTION ---');
  assert(
    process.env.MEDINEXA_AI_API_KEY === secretKey,
    'process.env.MEDINEXA_AI_API_KEY matches expected key on backend server'
  );
  assert(
    process.env.AI_PROVIDER === 'MEDINEXA_AI',
    'AI_PROVIDER environment variable is configured as MEDINEXA_AI'
  );

  // --- 2. FRONTEND BUNDLE & SOURCE SCAN ---
  console.log('\n--- 2. FRONTEND CLIENT BUNDLE & SOURCE SCAN ---');
  const webDir = path.join(__dirname, '..', 'apps', 'web');
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const fullPath = path.join(dir, f);
      if (f === 'node_modules' || f === '.next') continue;
      if (fs.statSync(fullPath).isDirectory()) {
        if (!scanDir(fullPath)) return false;
      } else if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.json')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(secretKey) || content.includes('MEDINEXA_AI_API_KEY')) {
          console.error(`Found leak in: ${fullPath}`);
          return false;
        }
      }
    }
    return true;
  }
  assert(scanDir(webDir), 'No frontend source file references MEDINEXA_AI_API_KEY or the raw key value');

  // --- 3. MEDINEXA AI PROVIDER INFERENCE ---
  console.log('\n--- 3. MEDINEXA AI PROVIDER INFERENCE & GREETINGS ---');
  const provider = new MediNexaAiProvider();
  assert(provider.isKeyConfigured() === true, 'MediNexaAiProvider confirms key is valid and configured');

  const status = provider.getStatus();
  assert(status.configured === true, 'Provider status reports configured = true');
  assert(status.serverSideOnly === true, 'Provider status reports serverSideOnly = true');
  assert(!JSON.stringify(status).includes(secretKey), 'Provider status does NOT leak the secret key');

  // Test Greeting
  const greetRes = await provider.generateResponse('hello');
  assert(greetRes.answer.includes('Hello from MediNexa AI'), 'AI Provider generates conversational greeting for "hello"');

  // Test CDS Triage
  const cdsRes = await provider.generateResponse('Triage assessment for acute chest pain and hypotension');
  assert(cdsRes.answer.includes('MEDINEXA CDS INTELLIGENCE'), 'AI Provider generates CDS triage guidance');

  // --- 4. SECURE CHAT ENDPOINT & SERVICE LAYER ---
  console.log('\n--- 4. CHAT SERVICE LAYER (POST /api/v1/ai/chat) ---');
  const auditEvents = [];
  const mockAuditService = {
    logPhiAccess: async (params) => {
      auditEvents.push(params);
      return { id: 'audit_' + Date.now(), ...params };
    },
  };

  const mockPrismaService = {
    facility: { findFirst: async () => ({ id: 'fac_1' }) },
  };

  const aiService = new AiService(mockPrismaService, mockAuditService, provider);

  // Test chat with "hello"
  const chatHello = await aiService.chat({ message: 'hello' }, { id: 'usr_test', roleCode: 'DOCTOR' }, '127.0.0.1');
  assert(chatHello.success === true, 'chat({ message: "hello" }) returns success: true');
  assert(chatHello.response.includes('Hello from MediNexa AI'), 'chat({ message: "hello" }) response contains "Hello from MediNexa AI"');
  assert(auditEvents.length === 1, 'Audit log recorded for AI chat message');
  assert(auditEvents[0].action === 'AI_CHAT_MESSAGE', 'Audit action recorded as AI_CHAT_MESSAGE');

  // Test queryAi endpoint
  const queryResult = await aiService.queryAi(
    { prompt: 'Assess severe sepsis risk for admitted patient', taskType: 'CDS_TRIAGE', patientId: 'pat_101', facilityId: 'fac_1' },
    { id: 'usr_doc_1', roleCode: 'DOCTOR', facilityId: 'fac_1' },
    '127.0.0.1'
  );
  assert(queryResult.status === 'SUCCESS', 'Doctor query processed successfully with status SUCCESS');

  // Test Health Status
  const health = await aiService.getHealthStatus({ id: 'usr_doc_1', roleCode: 'DOCTOR' });
  assert(health.status === 'OPERATIONAL', 'AI Service reports OPERATIONAL health status');

  console.log('\n================================================================');
  console.log(`📊 AI SUITE COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runUnitSuite().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
