import { describe, it, beforeEach, afterEach } from 'node:test';
import * as assert from 'node:assert';
import { MediNexaAiProvider } from '../dist/ai/providers/medinexa-ai.provider.js';

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalEnv = { ...process.env };
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('MediNexa AI Healthcare Intelligence Provider & Resilience Suite', () => {
  describe('1. Provider Hierarchy & Priority Selection', () => {
    it('selects Anthropic Claude as primary provider when ANTHROPIC_API_KEY is configured', () => {
      delete process.env.AI_PROVIDER;
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key-mock-12345';
      process.env.GEMINI_API_KEY = 'AIzaSy-test-gemini-key';
      process.env.OPENAI_API_KEY = 'sk-proj-test-openai-key';

      const provider = new MediNexaAiProvider();
      const status = provider.getStatus();

      assert.strictEqual(status.primaryProvider, 'ANTHROPIC_CLAUDE', 'Primary must be Anthropic Claude');
      assert.strictEqual(status.activeProvider, 'ANTHROPIC_CLAUDE');
      assert.deepStrictEqual(status.fallbackOrder, [
        'ANTHROPIC_CLAUDE',
        'GOOGLE_GEMINI',
        'OPENAI',
        'BUILTIN_CLINICAL_RULES',
      ]);
    });

    it('falls back to Google Gemini as secondary when Anthropic key is missing', () => {
      delete process.env.AI_PROVIDER;
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.CLAUDE_API_KEY;
      process.env.GEMINI_API_KEY = 'AIzaSy-test-gemini-key';
      process.env.OPENAI_API_KEY = 'sk-proj-test-openai-key';

      const provider = new MediNexaAiProvider();
      const status = provider.getStatus();

      assert.strictEqual(status.primaryProvider, 'ANTHROPIC_CLAUDE');
      assert.strictEqual(status.activeProvider, 'GOOGLE_GEMINI', 'Active provider should cascade to Gemini');
    });

    it('falls back to OpenAI as tertiary when Anthropic and Gemini are missing', () => {
      delete process.env.AI_PROVIDER;
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.CLAUDE_API_KEY;
      delete process.env.GEMINI_API_KEY;
      process.env.OPENAI_API_KEY = 'sk-proj-test-openai-key';

      const provider = new MediNexaAiProvider();
      const status = provider.getStatus();

      assert.strictEqual(status.activeProvider, 'OPENAI');
    });

    it('falls back to BUILTIN_CLINICAL_RULES when all external keys are missing', () => {
      delete process.env.AI_PROVIDER;
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.CLAUDE_API_KEY;
      delete process.env.GEMINI_API_KEY;
      delete process.env.OPENAI_API_KEY;
      delete process.env.MEDINEXA_AI_API_KEY;

      const provider = new MediNexaAiProvider();
      const status = provider.getStatus();

      assert.strictEqual(status.activeProvider, 'BUILTIN_CLINICAL_RULES');
    });

    it('respects explicit AI_PROVIDER=MOCK override and routes directly to clinical rules', () => {
      process.env.AI_PROVIDER = 'MOCK';
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key-mock-12345';

      const provider = new MediNexaAiProvider();
      const status = provider.getStatus();

      assert.strictEqual(status.primaryProvider, 'BUILTIN_CLINICAL_RULES');
    });

    it('respects explicit AI_PROVIDER=GEMINI and elevates Google Gemini to primary', () => {
      process.env.AI_PROVIDER = 'GEMINI';
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key-mock-12345';
      process.env.GEMINI_API_KEY = 'AIzaSy-test-gemini-key';

      const provider = new MediNexaAiProvider();
      const status = provider.getStatus();

      assert.strictEqual(status.primaryProvider, 'GOOGLE_GEMINI');
      assert.strictEqual(status.fallbackOrder[0], 'GOOGLE_GEMINI');
      assert.strictEqual(status.fallbackOrder[1], 'ANTHROPIC_CLAUDE');
    });
  });

  describe('2. Clinical Safety Interceptions & Disclaimers', () => {
    it('intercepts dangerous excessive dosage queries with high-priority emergency redirection', async () => {
      process.env.AI_PROVIDER = 'MOCK';
      const provider = new MediNexaAiProvider();

      const response = await provider.generateResponse('Can I take 20 tablets of Dolo 650 for my fever?');

      assert.ok(response.answer.includes('URGENT MEDICAL EMERGENCY: SUSPECTED MEDICATION OVERDOSE'));
      assert.ok(response.answer.includes('Call Emergency Services Immediately'));
      assert.ok(response.answer.includes('Go to the Nearest Emergency Department'));
      assert.ok(response.answer.includes('Do Not Self-Treat'));
      // Verify unsafe specific dosing numbers and pharmacological antidotes (like NAC) are NOT provided to users
      assert.strictEqual(response.answer.includes('N-acetylcysteine'), false, 'Must not prescribe pharmacological antidote (NAC)');
    });

    it('attaches mandatory clinical safety disclaimer to all generated responses', async () => {
      process.env.AI_PROVIDER = 'MOCK';
      const provider = new MediNexaAiProvider();

      const response = await provider.generateResponse('What is the dosage for Telma 40?');

      assert.ok(response.answer.includes('Clinical Disclaimer: MediNexa AI provides assistive health intelligence'));
      assert.ok(response.sources?.some((s) => s.includes('Pharmacopoeia') || s.includes('Cardiological')));
    });

    it('answers OPD appointment guidance inquiries accurately', async () => {
      process.env.AI_PROVIDER = 'MOCK';
      const provider = new MediNexaAiProvider();

      const response = await provider.generateResponse('How can I book an appointment with a cardiologist?');

      assert.ok(response.answer.includes('MediNexa Appointment Guidance'));
      assert.ok(response.answer.includes('OPD Consultation Hours'));
      assert.ok(response.answer.includes('Online Booking via Patient Portal'));
    });

    it('triages chest pain symptoms to Cardiology department with ER notice', async () => {
      process.env.AI_PROVIDER = 'MOCK';
      const provider = new MediNexaAiProvider();

      const response = await provider.generateResponse('I am having severe chest pain and palpitations, which doctor should I see?');

      assert.ok(response.answer.includes('Cardiology'));
      assert.ok(response.answer.includes('OPD Wing C'));
      assert.ok(response.answer.includes('Emergency Notice'));
    });

    it('explains complete blood count lab test report accurately', async () => {
      process.env.AI_PROVIDER = 'MOCK';
      const provider = new MediNexaAiProvider();

      const response = await provider.generateResponse('Can you explain my CBC report? My hemoglobin is 11 g/dL.');

      assert.ok(response.answer.includes('Complete Blood Count (CBC)'));
      assert.ok(response.answer.includes('Hemoglobin'));
      assert.ok(response.answer.includes('Anemia'));
    });

    it('provides floor-by-floor navigation directory for the Delhi facility', async () => {
      process.env.AI_PROVIDER = 'MOCK';
      const provider = new MediNexaAiProvider();

      const response = await provider.generateResponse('Where is the ICU located in the hospital?');

      assert.ok(response.answer.includes('Navigation Directory'));
      assert.ok(response.answer.includes('4th Floor'));
      assert.ok(response.answer.includes('MICU') || response.answer.includes('SICU'));
    });
  });
});

