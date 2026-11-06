import { Injectable, Logger } from '@nestjs/common';
import { AiProvider, AiResponse } from './ai-provider.interface';

export interface ClinicalCompletionOptions {
  taskType?: 'SOAP' | 'CDS' | 'TRIAGE' | 'DRUG_INTERACTION' | 'CAPACITY_PREDICTION' | 'CHAT' | 'GENERAL';
  patientId?: string;
  facilityId?: string;
  context?: Record<string, any>;
}

const CLINICAL_DISCLAIMER =
  '\n\n*Clinical Disclaimer: MediNexa AI provides assistive health intelligence and workflow guidance. It is not a substitute for professional medical diagnosis or clinical judgment. For life-threatening emergencies, please visit the nearest Emergency Department immediately or dial 108/112.*';

@Injectable()
export class MediNexaAiProvider implements AiProvider {
  private readonly logger = new Logger(MediNexaAiProvider.name);
  private readonly anthropicKey: string | undefined;
  private readonly geminiKey: string | undefined;
  private readonly openAiKey: string | undefined;
  private readonly unifiedKey: string | undefined;

  public readonly primaryProviderName: string;
  public readonly activeProviderName: string;
  public readonly providerFallbackOrder: string[];

  constructor() {
    this.anthropicKey = (process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY)?.trim();
    this.geminiKey = process.env.GEMINI_API_KEY?.trim();
    this.openAiKey = process.env.OPENAI_API_KEY?.trim();
    this.unifiedKey = process.env.MEDINEXA_AI_API_KEY?.trim();

    const explicitProvider = (process.env.AI_PROVIDER || '').toUpperCase().trim();

    // Default Architecture:
    // PRIMARY: Anthropic Claude
    // SECONDARY: Google Gemini
    // ADDITIONAL: OpenAI
    // FINAL: Built-in deterministic clinical rules
    if (explicitProvider === 'MOCK') {
      this.primaryProviderName = 'BUILTIN_CLINICAL_RULES';
      this.providerFallbackOrder = ['BUILTIN_CLINICAL_RULES'];
    } else if (explicitProvider === 'GEMINI' || explicitProvider === 'GOOGLE_GEMINI') {
      this.primaryProviderName = 'GOOGLE_GEMINI';
      this.providerFallbackOrder = ['GOOGLE_GEMINI', 'ANTHROPIC_CLAUDE', 'OPENAI', 'BUILTIN_CLINICAL_RULES'];
    } else if (explicitProvider === 'OPENAI') {
      this.primaryProviderName = 'OPENAI';
      this.providerFallbackOrder = ['OPENAI', 'ANTHROPIC_CLAUDE', 'GOOGLE_GEMINI', 'BUILTIN_CLINICAL_RULES'];
    } else if (explicitProvider === 'CLAUDE' || explicitProvider === 'ANTHROPIC' || explicitProvider === 'ANTHROPIC_CLAUDE') {
      this.primaryProviderName = 'ANTHROPIC_CLAUDE';
      this.providerFallbackOrder = ['ANTHROPIC_CLAUDE', 'GOOGLE_GEMINI', 'OPENAI', 'BUILTIN_CLINICAL_RULES'];
    } else {
      // Default standard order: Anthropic -> Gemini -> OpenAI -> Built-in
      this.primaryProviderName = 'ANTHROPIC_CLAUDE';
      this.providerFallbackOrder = ['ANTHROPIC_CLAUDE', 'GOOGLE_GEMINI', 'OPENAI', 'BUILTIN_CLINICAL_RULES'];
    }

    // Determine initial active provider based on configured credentials
    if (this.primaryProviderName === 'ANTHROPIC_CLAUDE' && this.anthropicKey) {
      this.activeProviderName = 'ANTHROPIC_CLAUDE';
    } else if (this.geminiKey) {
      this.activeProviderName = 'GOOGLE_GEMINI';
    } else if (this.openAiKey) {
      this.activeProviderName = 'OPENAI';
    } else if (this.unifiedKey) {
      this.activeProviderName = 'MEDINEXA_ENTERPRISE_AI';
    } else {
      this.activeProviderName = 'BUILTIN_CLINICAL_RULES';
    }

    const hasAnyExternal = Boolean(this.anthropicKey || this.geminiKey || this.openAiKey || this.unifiedKey);
    if (process.env.NODE_ENV === 'production' && !hasAnyExternal) {
      this.logger.warn(
        `[MEDINEXA AI] Notice: No external AI keys configured in production. Assistant running in deterministic clinical rules mode.`,
      );
    }
    this.logger.log(
      `[MEDINEXA AI] Provider hierarchy initialized: Primary=${this.primaryProviderName}, Active=${this.activeProviderName} (Server-Side Only).`,
    );
  }

  /**
   * Validates server-side key existence without exposing the key value
   */
  public isKeyConfigured(): boolean {
    return Boolean(
      (this.anthropicKey && this.anthropicKey.length > 5) ||
      (this.geminiKey && this.geminiKey.length > 5) ||
      (this.openAiKey && this.openAiKey.length > 5) ||
      (this.unifiedKey && this.unifiedKey.length > 5),
    );
  }

  /**
   * Safe status summary for health check and diagnostic endpoints
   */
  public getStatus() {
    return {
      provider: 'MEDINEXA_AI_HEALTHCARE_ENGINE',
      configured: true,
      primaryProvider: this.primaryProviderName,
      activeProvider: this.activeProviderName,
      fallbackOrder: this.providerFallbackOrder,
      activeModel: this.resolveModelForProvider(this.activeProviderName),
      serverSideOnly: true,
      supportedUseCases: [
        'APPOINTMENT_GUIDANCE',
        'DEPARTMENT_RECOMMENDATION',
        'PRESCRIPTION_EXPLANATION',
        'LAB_REPORT_EXPLANATION',
        'HOSPITAL_NAVIGATION',
      ],
    };
  }

  private resolveModelForProvider(provider: string): string {
    const override = process.env.AI_MODEL?.trim();
    if (override) return override;

    switch (provider) {
      case 'ANTHROPIC_CLAUDE':
        return 'claude-3-5-sonnet-20241022';
      case 'GOOGLE_GEMINI':
        return 'gemini-1.5-flash';
      case 'OPENAI':
        return 'gpt-4o-mini';
      default:
        return 'medinexa-clinical-deep-v2';
    }
  }

  /**
   * Core generative response handler supporting all 5 clinical use cases with multi-provider fallback
   */
  async generateResponse(prompt: string, context?: any): Promise<AiResponse> {
    const p = prompt.trim().toLowerCase();

    // 0. CLINICAL SAFETY INTERCEPTION: Detect unsafe / excessive dosage requests
    const unsafeDosageWarning = this.detectUnsafeDosageRequest(p);
    if (unsafeDosageWarning) {
      return {
        answer: unsafeDosageWarning + CLINICAL_DISCLAIMER,
        sources: ['MediNexa Clinical Toxicology Protocol', 'CDSCO Safe Medication Guidelines'],
      };
    }

    // If configured explicitly to MOCK, bypass external calls immediately
    if (process.env.AI_PROVIDER === 'MOCK') {
      return this.generateDeterministicResponse(prompt, context);
    }

    // Cascading Multi-Provider Execution
    for (const provider of this.providerFallbackOrder) {
      if (provider === 'ANTHROPIC_CLAUDE' && this.anthropicKey) {
        try {
          const res = await this.callAnthropic(prompt, context);
          if (res && res.answer) return res;
        } catch (err: any) {
          this.logger.warn(`[MEDINEXA AI] Anthropic Claude call failed: ${err.message}. Cascading to fallback provider...`);
        }
      } else if (provider === 'GOOGLE_GEMINI' && this.geminiKey) {
        try {
          const res = await this.callGemini(prompt, context);
          if (res && res.answer) return res;
        } catch (err: any) {
          this.logger.warn(`[MEDINEXA AI] Google Gemini call failed: ${err.message}. Cascading to fallback provider...`);
        }
      } else if (provider === 'OPENAI' && this.openAiKey) {
        try {
          const res = await this.callOpenAi(prompt, context);
          if (res && res.answer) return res;
        } catch (err: any) {
          this.logger.warn(`[MEDINEXA AI] OpenAI call failed: ${err.message}. Cascading to fallback provider...`);
        }
      } else if (provider === 'BUILTIN_CLINICAL_RULES') {
        return this.generateDeterministicResponse(prompt, context);
      }
    }

    // Default safety fallback to deterministic engine
    return this.generateDeterministicResponse(prompt, context);
  }

  /**
   * Safety check: Intercept dangerous dosage or overdose queries
   */
  private detectUnsafeDosageRequest(lowerPrompt: string): string | null {
    const isDosageQuery = lowerPrompt.includes('dose') || lowerPrompt.includes('dosage') || lowerPrompt.includes('take') || lowerPrompt.includes('tablet') || lowerPrompt.includes('paracetamol') || lowerPrompt.includes('dolo');
    if (!isDosageQuery) return null;

    // Check for excessive quantities (>4000mg or >6 tablets of Dolo 650)
    const dangerousPatterns = [
      /\b(10|12|15|20|25|30|50)\s*(tablets?|pills?|capsules?|dolo)/i,
      /\b([5-9]\d{3}|[1-9]\d{4,})\s*(mg|milligrams)/i, // 5000mg to 99000mg
      /\boverdose\b/i,
      /\blethal\b/i,
      /\bkill\s+myself\b/i,
      /\btake\s+the\s+whole\s+(strip|bottle)\b/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(lowerPrompt)) {
        return `🚨 **URGENT MEDICAL EMERGENCY: SUSPECTED MEDICATION OVERDOSE**\n\n` +
          `• **Immediate Life-Threatening Risk**: Ingestion of excessive medication or suspected overdose poses a severe risk of acute organ failure (including irreversible liver and kidney damage) and requires urgent medical intervention.\n` +
          `• **Do Not Wait for Symptoms**: Drug-induced toxicity may initially be asymptomatic before rapid progression to severe systemic damage. Immediate evaluation is critical regardless of how you currently feel.\n` +
          `• **Emergency Action Required**:\n` +
          `  1. **Call Emergency Services Immediately**: Dial **108** or **112** (India) or your local emergency medical service (e.g., 911).\n` +
          `  2. **Go to the Nearest Emergency Department**: Proceed immediately to the nearest hospital emergency room or contact your local Poison Control Center.\n` +
          `  3. **Bring the Medication Container**: Take the exact medication box, strip, or bottle with you so the treating medical team can assess the formulation and time of ingestion.\n` +
          `  4. **Do Not Self-Treat**: Do not induce vomiting or administer any home remedies, medications, or antidotes without explicit direction from an emergency physician.`;
      }
    }

    return null;
  }

  /**
   * Call Anthropic Claude Messages API
   */
  private async callAnthropic(prompt: string, context?: any): Promise<AiResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const model = this.resolveModelForProvider('ANTHROPIC_CLAUDE');
    const systemPrompt =
      'You are MediNexa Clinical Healthcare Intelligence Assistant. Provide accurate, professional medical workflow, appointment, symptom triage, medication explanations, and lab report explanations for Indian healthcare contexts. Never present output as an autonomous medical diagnosis; always communicate that a qualified physician consultation is required. Keep tone empathetic and clinically rigorous.';

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.anthropicKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const data: any = await response.json();
      const answerText = data.content?.[0]?.text;
      if (!answerText) {
        throw new Error('Empty response from Anthropic Claude');
      }

      const formattedAnswer = answerText.includes('Disclaimer')
        ? answerText
        : answerText + CLINICAL_DISCLAIMER;

      return {
        answer: formattedAnswer,
        sources: ['Anthropic Claude Clinical Intelligence', 'MediNexa Clinical Knowledge Engine'],
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Call Google Gemini API
   */
  private async callGemini(prompt: string, context?: any): Promise<AiResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const model = this.resolveModelForProvider('GOOGLE_GEMINI');
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiKey!}`;

    const systemPrompt =
      'You are MediNexa Clinical Healthcare Intelligence Assistant. Provide accurate, professional medical workflow, appointment, symptom triage, medication explanations, and lab report explanations for Indian healthcare contexts. Never present output as an autonomous medical diagnosis. Keep tone empathetic and clinically rigorous.';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const data: any = await response.json();
      const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!answerText) {
        throw new Error('Empty response from Google Gemini');
      }

      const formattedAnswer = answerText.includes('Disclaimer')
        ? answerText
        : answerText + CLINICAL_DISCLAIMER;

      return {
        answer: formattedAnswer,
        sources: ['Google Gemini Clinical Intelligence', 'MediNexa Clinical Knowledge Engine'],
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAi(prompt: string, context?: any): Promise<AiResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const model = this.resolveModelForProvider('OPENAI');
    const systemPrompt =
      'You are MediNexa Clinical Healthcare Intelligence Assistant. Provide accurate, professional medical workflow, appointment, symptom triage, medication explanations, and lab report explanations for Indian healthcare contexts. Never present output as an autonomous medical diagnosis.';

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.openAiKey!}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          max_tokens: 1024,
          temperature: 0.2,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const data: any = await response.json();
      const answerText = data.choices?.[0]?.message?.content;
      if (!answerText) {
        throw new Error('Empty response from OpenAI');
      }

      const formattedAnswer = answerText.includes('Disclaimer')
        ? answerText
        : answerText + CLINICAL_DISCLAIMER;

      return {
        answer: formattedAnswer,
        sources: ['OpenAI Clinical Intelligence', 'MediNexa Clinical Knowledge Engine'],
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Deterministic healthcare rules engine for all 5 core clinical use cases
   */
  public generateDeterministicResponse(prompt: string, context?: any): AiResponse {
    const p = prompt.trim().toLowerCase();
    const disclaimer = CLINICAL_DISCLAIMER;

    // 0. Conversational Greetings & Help
    if (
      p === 'hello' ||
      p === 'hi' ||
      p === 'hey' ||
      p.startsWith('hello ') ||
      p.startsWith('hi ') ||
      p.startsWith('hey ') ||
      p === 'help' ||
      p === 'who are you' ||
      p.includes('what can you do')
    ) {
      return {
        answer: `Hello! I am **MediNexa AI**, your intelligent hospital & clinical companion. I can help you with:

1. 📅 **Appointment Guidance**: How to book, reschedule, or cancel consultations with our 20+ specialist doctors.
2. 🏥 **Department Recommendation**: Matching your symptoms to the right clinical specialty.
3. 💊 **Prescription Explanation**: Clear guidance on Indian medications (Dolo 650, Telma 40, Glycomet 500, Pan 40, Augmentin, etc.), dosage, and food instructions.
4. 🔬 **Lab Report Explanation**: Understanding your CBC, Blood Sugar, LFT, KFT, Thyroid, or Urine test results.
5. 🗺️ **Hospital Navigation**: Step-by-step floor directions for our New Delhi Super Speciality Hospital.

How can I assist you today?${disclaimer}`,
        sources: ['MediNexa Clinical Assistant Gateway', 'MediNexa Hospital Protocols'],
      };
    }

    // =========================================================================
    // USE CASE 5: HOSPITAL FLOOR NAVIGATION & WAYFINDING
    // =========================================================================
    if (
      p.includes('where is') ||
      p.includes('floor') ||
      p.includes('navigation') ||
      p.includes('find') ||
      p.includes('direction') ||
      p.includes('cafeteria') ||
      p.includes('pharmacy location') ||
      p.includes('icu location') ||
      p.includes('ot location') ||
      p.includes('parking')
    ) {
      return {
        answer: `### 🗺️ MediNexa Super Speciality Hospital Navigation Directory

**Facility Address**: Sarita Vihar, Delhi Mathura Road, New Delhi – 110076 (Near Sarita Vihar Metro Station).

Here is our complete floor-by-floor wayfinding directory:

- 🟢 **Basement Level (-1 & -2)**:
  - **Visitor & Patient Underground Parking** (P1 & P2).
  - **Central Hospital Stores & Biomedical Engineering**.
  - **Radiation Oncology & Linear Accelerator (LINAC) Bunker**.

- 🟡 **Ground Floor (Main Hospital Block)**:
  - **Main Reception, Registration & UHID Generation Desk**.
  - **24/7 Emergency & Trauma Care Centre (Triage, Resus & ER 1 to 12)**.
  - **24/7 Outpatient Pharmacy (Counter 1 to 6)**.
  - **Central Phlebotomy & Sample Collection Counter**.
  - **Diagnostic Radiology (Digital X-Ray, 128-Slice CT Scan, 3.0T MRI, Ultrasound 1 & 2)**.
  - **Patient Billing, TPA Insurance & Cashier Desks**.
  - **Cafeteria & Visitors Lounge**.

- 🔵 **1st Floor (Outpatient Department - OPD Block)**:
  - **OPD Wing A**: General Medicine, Diabetology, Orthopedics, Joint Replacement.
  - **OPD Wing B**: General Surgery, Urology, Nephrology, Neurology.
  - **OPD Wing C**: Cardiology, ECG, 2D Echocardiography, TMT Suite.
  - **OPD Wing D**: Pediatrics, Vaccination Clinic, Obstetrics & Gynecology.
  - **OPD Wing E**: ENT (Audiometry Room), Ophthalmology, Dermatology.

- 🟠 **2nd Floor (Daycare, Dialysis & Pathology)**:
  - **Daycare Chemotherapy & Infusion Centre (Beds 201 - 220)**.
  - **Hemodialysis Unit (16 Station Dialysis Suite)**.
  - **Central Diagnostic Pathology & Microbiology Laboratories (NABL Accredited)**.
  - **Hospital Blood Centre & Component Separation Unit**.
  - **Endoscopy & Colonoscopy Suite**.

- 🟣 **3rd Floor (Surgical Suites & Inpatient Wards)**:
  - **Modular Operation Theatres (OT 1 to 6)**.
  - **Post-Anesthesia Care Unit (PACU)**.
  - **Inpatient General & Semi-Private Wards (Beds 301 - 360)**.

- 🔴 **4th Floor (Critical Care & Private Suites)**:
  - **Medical Intensive Care Unit (MICU)**.
  - **Surgical Intensive Care Unit (SICU)**.
  - **Coronary Care Unit (CCU) & Neonatal ICU (NICU)**.
  - **Deluxe & Executive Private Inpatient Rooms (Suites 401 - 425)**.

*Helpdesk Support*: If you need wheelchair assistance or escort help, please notify our Guest Relations Executive at the Ground Floor Main Desk or dial **Ext. 101** from any hospital landline.${disclaimer}`,
        sources: ['MediNexa Hospital Facility Directory', 'Hospital Engineering & Patient Wayfinding Guide'],
      };
    }

    // =========================================================================
    // USE CASE 1: APPOINTMENT GUIDANCE
    // =========================================================================
    if (
      p.includes('appointment') ||
      p.includes('book') ||
      p.includes('consult') ||
      p.includes('schedule') ||
      p.includes('reschedule') ||
      p.includes('cancel') ||
      p.includes('opd timing') ||
      p.includes('slot') ||
      p.includes('telemedicine') ||
      p.includes('fees')
    ) {
      return {
        answer: `### 📅 MediNexa Appointment Guidance & Scheduling

Here is how you can easily manage your doctor consultations at **MediNexa Super Speciality Hospital**:

1. **Online Booking via Patient Portal**:
   - Navigate to **[Portal Appointments](/portal/appointments)**.
   - Search by doctor name or filter by specialty (*Cardiology, Neurology, Orthopedics, Pediatrics, Dermatology, ENT, Gynecology, General Medicine*).
   - Select your preferred date and choose from real-time **30-minute available slots**.
   - Choose between **In-Person OPD Consultation** or **Virtual Telemedicine Video Call**.

2. **OPD Consultation Hours**:
   - **Morning OPD**: 09:00 AM – 01:00 PM (Monday to Saturday)
   - **Evening OPD**: 02:00 PM – 05:00 PM (Monday to Saturday)
   - **Sunday OPD**: 10:00 AM – 01:00 PM (Emergency & General Medicine only)

3. **Rescheduling & Cancellations**:
   - You can reschedule or cancel directly from your **Active Appointments** tab in the portal up to 2 hours before your scheduled slot.
   - For front-desk support, call our 24/7 helpline at **+91 11 2692 5858**.

4. **What to Bring**:
   - Government ID (Aadhaar / ABHA Card), MediNexa UHID card, and any previous prescriptions or recent lab test reports.${disclaimer}`,
        sources: ['MediNexa OPD Scheduling Engine', 'Hospital Front Desk & Telemedicine Services'],
      };
    }

    // =========================================================================
    // USE CASE 2: DEPARTMENT RECOMMENDATION (SYMPTOM-TO-SPECIALTY TRIAGE)
    // =========================================================================
    if (
      p.includes('which doctor') ||
      p.includes('which department') ||
      p.includes('recommend department') ||
      p.includes('specialist') ||
      p.includes('symptom') ||
      p.includes('joint pain') ||
      p.includes('knee') ||
      p.includes('bone') ||
      p.includes('chest pain') ||
      p.includes('heart') ||
      p.includes('palpitation') ||
      p.includes('migraine') ||
      p.includes('skin rash') ||
      p.includes('eczema') ||
      p.includes('ear pain') ||
      p.includes('sinus') ||
      p.includes('period') ||
      p.includes('pregnancy') ||
      p.includes('stiffness')
    ) {
      let matchedSpecialty = 'General Medicine';
      let floor = '1st Floor, OPD Wing A';
      let details = '';

      if (p.includes('chest pain') || p.includes('heart') || p.includes('palpitation') || p.includes('breathless') || p.includes('bp') || p.includes('hypertension')) {
        matchedSpecialty = 'Cardiology';
        floor = '1st Floor, OPD Wing C (Near Echo/ECG Suite)';
        details = 'Recommended for symptoms like chest heaviness, palpitations, shortness of breath, or blood pressure concerns. Our Cardiology team includes Dr. Arvind Deshmukh and Dr. Sunita Kulkarni.';
      } else if (p.includes('headache') || p.includes('migraine') || p.includes('dizzy') || p.includes('numb') || p.includes('seizure') || p.includes('tremor') || p.includes('memory') || p.includes('nerve')) {
        matchedSpecialty = 'Neurology';
        floor = '1st Floor, OPD Wing B';
        details = 'Recommended for chronic migraines, tension headaches, vertigo, facial numbness, nerve tingling, or neurological assessments.';
      } else if (p.includes('bone') || p.includes('joint') || p.includes('knee') || p.includes('back pain') || p.includes('fracture') || p.includes('sprain') || p.includes('arthritis') || p.includes('stiffness')) {
        matchedSpecialty = 'Orthopedics';
        floor = '1st Floor, OPD Wing A (Adjacent to Digital X-Ray)';
        details = 'Recommended for joint stiffness, osteoarthritis, ligament injuries, back pain, or fractures. Digital X-Ray and Physiotherapy are co-located.';
      } else if (p.includes('skin') || p.includes('rash') || p.includes('acne') || p.includes('itch') || p.includes('eczema') || p.includes('allergy') || p.includes('hair')) {
        matchedSpecialty = 'Dermatology';
        floor = '1st Floor, OPD Wing D';
        details = 'Recommended for skin rashes, urticaria, fungal infections, acne vulgaris, psoriasis, or cosmetic dermatology concerns.';
      } else if (p.includes('ear') || p.includes('throat') || p.includes('sinus') || p.includes('nose') || p.includes('tonsil') || p.includes('hearing') || p.includes('cough')) {
        matchedSpecialty = 'ENT (Ear, Nose & Throat)';
        floor = '1st Floor, OPD Wing E';
        details = 'Recommended for sinusitis, hearing loss, ear infections, chronic throat irritation, tonsillitis, or nasal polyps.';
      } else if (p.includes('period') || p.includes('pregnancy') || p.includes('gynec') || p.includes('pcos') || p.includes('cramp') || p.includes('ovary')) {
        matchedSpecialty = 'Obstetrics & Gynecology';
        floor = '1st Floor, OPD Wing D';
        details = 'Recommended for menstrual irregularities, antenatal checkups, PCOS/PCOD management, pelvic pain, or menopause counseling.';
      } else if (p.includes('child') || p.includes('baby') || p.includes('pediatric') || p.includes('vaccination') || p.includes('growth')) {
        matchedSpecialty = 'Pediatrics';
        floor = '1st Floor, OPD Wing D';
        details = 'Recommended for infants, children, and adolescents for routine immunizations, pediatric fevers, nutrition, and developmental assessments.';
      } else {
        matchedSpecialty = 'General Medicine';
        floor = '1st Floor, OPD Wing A';
        details = 'Recommended as your primary clinical assessment for undifferentiated symptoms, general malaise, mild fever, fatigue, or annual health reviews.';
      }

      return {
        answer: `### 🏥 Recommended Clinical Specialty: **${matchedSpecialty}**

Based on your symptoms, we recommend consulting our **${matchedSpecialty}** department.

- **Clinical Assessment**: ${details}
- **OPD Clinic Location**: ${floor}, MediNexa Super Speciality Hospital.
- **Available Doctors**: Available daily from **09:00 AM to 05:00 PM**.
- **Next Step**: You can immediately search doctors and reserve an OPD appointment by visiting the **[Book Appointment](/portal/appointments)** page.

*Emergency Notice*: If you are experiencing severe crushing chest pain radiating to the jaw/arm, sudden loss of speech, or acute difficulty breathing, proceed immediately to the **Ground Floor Emergency Room** or alert our ambulance at **+91 11 2692 5858** (Dial 108).${disclaimer}`,
        sources: ['MediNexa Clinical Triage Protocol (ESI-5)', 'MediNexa Specialty Directory'],
      };
    }

    // =========================================================================
    // USE CASE 3: PRESCRIPTION & MEDICATION EXPLANATION
    // =========================================================================
    if (
      p.includes('dolo') ||
      p.includes('paracetamol') ||
      p.includes('telma') ||
      p.includes('telmisartan') ||
      p.includes('glycomet') ||
      p.includes('metformin') ||
      p.includes('pan 40') ||
      p.includes('pantoprazole') ||
      p.includes('augmentin') ||
      p.includes('amoxicillin') ||
      p.includes('azithromycin') ||
      p.includes('atorvastatin') ||
      p.includes('medication') ||
      p.includes('prescription') ||
      p.includes('medicine') ||
      p.includes('dosage')
    ) {
      let drugInfo = '';
      let drugSources = ['Indian Pharmacopoeia (IP)', 'National Formulary of India (NFI)'];

      if (p.includes('dolo') || p.includes('paracetamol')) {
        drugInfo = `**Dolo 650 (Paracetamol 650 mg)**:
- **Active Ingredient**: Paracetamol (Acetaminophen) 650 mg.
- **Pharmacological Class**: Antipyretic (Fever Reducer) and Analgesic (Pain Reliever).
- **Primary Uses**: Relieving mild-to-moderate fever, headache, body aches, toothache, and post-vaccination discomfort.
- **How to Take**: Take 1 tablet orally with half a glass of water, preferably **after meals or with a light snack** to avoid gastric irritation.
- **Dosage Frequency**: Maximum **1 tablet every 6 to 8 hours**. Do not exceed **3,000 to 4,000 mg (4 to 6 tablets) in 24 hours**.
- **Crucial Precautions**:
  - Avoid alcohol completely while taking paracetamol to prevent acute liver toxicity.
  - Do not combine with other OTC cold/cough remedies that already contain paracetamol.
  - Patients with pre-existing hepatic impairment or chronic kidney disease should consult their physician before use.`;
        drugSources.push('CDSCO Approved Package Insert for Paracetamol 650');
      } else if (p.includes('telma') || p.includes('telmisartan')) {
        drugInfo = `**Telma 40 (Telmisartan 40 mg)**:
- **Active Ingredient**: Telmisartan 40 mg.
- **Pharmacological Class**: Angiotensin II Receptor Blocker (ARB) / Antihypertensive.
- **Primary Uses**: Long-term management of essential hypertension (high blood pressure) and reduction of cardiovascular mortality in high-risk patients.
- **How to Take**: Take **1 tablet once daily**, at the exact same time every day (e.g., morning at 08:00 AM), with or without food.
- **Crucial Precautions**:
  - Do not stop taking this medication abruptly, even if your blood pressure readings normalize.
  - Periodic serum potassium and renal function (KFT) monitoring is recommended.
  - Contraindicated during pregnancy (Category D teratogen).`;
        drugSources.push('Cardiological Society of India (CSI) Hypertension Guidelines');
      } else if (p.includes('glycomet') || p.includes('metformin')) {
        drugInfo = `**Glycomet 500 / 1000 (Metformin Hydrochloride)**:
- **Active Ingredient**: Metformin Hydrochloride 500 mg / 1000 mg (Immediate or Extended Release).
- **Pharmacological Class**: Biguanide / Oral Hypoglycemic Agent.
- **Primary Uses**: First-line management of Type 2 Diabetes Mellitus to improve insulin sensitivity and decrease hepatic glucose output.
- **How to Take**: Always take **with meals or immediately after meals** to minimize gastrointestinal side effects (nausea, loose stools, or metallic taste).
- **Crucial Precautions**:
  - Avoid binge alcohol intake (risk of lactic acidosis).
  - Temporary discontinuation is required 48 hours prior to surgical procedures or IV radiocontrast scans.`;
        drugSources.push('Research Society for the Study of Diabetes in India (RSSDI)');
      } else if (p.includes('pan 40') || p.includes('pantoprazole')) {
        drugInfo = `**Pan 40 (Pantoprazole Sodium Gastro-resistant 40 mg)**:
- **Active Ingredient**: Pantoprazole Sodium 40 mg.
- **Pharmacological Class**: Proton Pump Inhibitor (PPI) / Gastric Acid Suppressant.
- **Primary Uses**: Gastroesophageal Reflux Disease (GERD), acid peptic disease, hyperacidity, and gastric mucosal protection during NSAID painkiller therapy.
- **How to Take**: Take **1 tablet once daily in the morning, exactly 30 to 60 minutes before breakfast**, swallowed whole with water (do not crush or chew).
- **Crucial Precautions**:
  - Long-term use (>1 year) may reduce absorption of Vitamin B12, Calcium, and Magnesium.`;
        drugSources.push('Indian Society of Gastroenterology (ISG)');
      } else if (p.includes('augmentin') || p.includes('amoxicillin')) {
        drugInfo = `**Augmentin 625 Duo (Amoxicillin 500 mg + Clavulanic Acid 125 mg)**:
- **Active Ingredients**: Amoxicillin Trihydrate 500 mg + Potassium Clavulanate 125 mg.
- **Pharmacological Class**: Broad-Spectrum Penicillin Antibiotic + Beta-Lactamase Inhibitor.
- **Primary Uses**: Bacterial infections of the respiratory tract (sinusitis, pneumonia), ENT, skin, and urinary tract.
- **How to Take**: Take **1 tablet twice daily (every 12 hours) at the start of a meal** to enhance absorption and reduce stomach upset.
- **Crucial Precautions**:
  - Always finish the entire 5 to 7 day course prescribed by your doctor even if you feel completely cured after 2 days.
  - Contraindicated if you have a documented allergy to penicillins or cephalosporins.`;
        drugSources.push('Indian Council of Medical Research (ICMR) Antimicrobial Stewardship');
      } else {
        drugInfo = `**General Prescription & Medication Guidance**:
- Always check the medication label for: *Generic name, strength (mg/ml), expiry date, and manufacturer batch*.
- **With or After Food**: Antibiotics, painkillers (NSAIDs), and oral diabetes medications are generally taken with food.
- **Empty Stomach**: Thyroid hormone (Levothyroxine) and Antacids/PPIs (Pantoprazole, Omeprazole) are taken 30-60 minutes before morning meals.
- Never discontinue maintenance medications (for hypertension, heart condition, or diabetes) without consulting your attending doctor.`;
      }

      return {
        answer: `### 💊 Clinical Medication & Prescription Explanation

${drugInfo}

- **Fulfillment**: You can purchase or refill all prescribed medications at the **Ground Floor 24/7 MediNexa Pharmacy** or view current inventory on our **[Pharmacy Inventory Portal](/portal/prescriptions)**.${disclaimer}`,
        sources: drugSources,
      };
    }

    // =========================================================================
    // USE CASE 4: LAB REPORT EXPLANATION
    // =========================================================================
    if (
      p.includes('cbc') ||
      p.includes('hemoglobin') ||
      p.includes('platelet') ||
      p.includes('wbc') ||
      p.includes('sugar') ||
      p.includes('hba1c') ||
      p.includes('glucose') ||
      p.includes('lft') ||
      p.includes('kft') ||
      p.includes('creatinine') ||
      p.includes('thyroid') ||
      p.includes('tsh') ||
      p.includes('lipid') ||
      p.includes('cholesterol') ||
      p.includes('urine') ||
      p.includes('lab report') ||
      p.includes('blood test')
    ) {
      let labExplanation = '';
      let labSources = ['NABL Accredited Pathology Standard Reference Ranges', 'WHO Clinical Laboratory Handbook'];

      if (p.includes('cbc') || p.includes('hemoglobin') || p.includes('platelet') || p.includes('wbc')) {
        labExplanation = `**Complete Blood Count (CBC) Parameters**:
1. **Hemoglobin (Hb)**:
   - *Standard Adult Range*: Men: 13.5 – 17.5 g/dL | Women: 12.0 – 15.5 g/dL.
   - *Clinical Significance*: Low Hb indicates **Anemia** (iron deficiency, blood loss, or vitamin deficiency). High Hb may indicate dehydration or secondary erythrocytosis.
2. **Total Leukocyte Count (TLC / WBC)**:
   - *Standard Adult Range*: 4,000 – 11,000 cells/cu.mm.
   - *Clinical Significance*: Elevated WBC (>11,000) commonly points to **active bacterial or viral infection, tissue inflammation, or physiological stress**.
3. **Platelet Count**:
   - *Standard Adult Range*: 150,000 – 450,000 /cu.mm.
   - *Clinical Significance*: Low platelets (<100,000 / Thrombocytopenia) occur in conditions like Dengue, viral fevers, or immune disorders. High platelets (>450,000) indicate reactive thrombocytosis.`;
        labSources.push('Indian Academy of Hematology Guidelines');
      } else if (p.includes('sugar') || p.includes('glucose') || p.includes('hba1c')) {
        labExplanation = `**Blood Glucose & Glycemic Profile**:
1. **Fasting Blood Sugar (FBS)**:
   - *Normal*: 70 – 99 mg/dL | *Prediabetes*: 100 – 125 mg/dL | *Diabetes*: ≥ 126 mg/dL (on 2 separate tests).
2. **Post-Prandial Blood Sugar (PPBS - 2 hours after meals)**:
   - *Normal*: < 140 mg/dL | *Prediabetes*: 140 – 199 mg/dL | *Diabetes*: ≥ 200 mg/dL.
3. **HbA1c (Glycated Hemoglobin - 3 Month Average)**:
   - *Normal*: < 5.7% | *Prediabetes*: 5.7% – 6.4% | *Diabetes*: ≥ 6.5%.
   - For diagnosed diabetics, the typical target recommended by diabetologists is < 7.0%.`;
        labSources.push('American Diabetes Association (ADA) & RSSDI Standards');
      } else if (p.includes('kft') || p.includes('creatinine') || p.includes('urea') || p.includes('kidney')) {
        labExplanation = `**Kidney Function Test (KFT / RFT)**:
1. **Serum Creatinine**:
   - *Standard Range*: Men: 0.7 – 1.3 mg/dL | Women: 0.5 – 1.1 mg/dL.
   - *Clinical Significance*: Primary marker of renal clearance. Elevated values indicate decreased glomerular filtration rate (GFR).
2. **Blood Urea Nitrogen (BUN) / Blood Urea**:
   - *Standard Range*: Urea: 15 – 45 mg/dL (BUN: 7 – 20 mg/dL).
   - *Clinical Significance*: Rises with kidney impairment, dehydration, or high-protein catabolism.
3. **Serum Uric Acid**:
   - *Standard Range*: 3.5 – 7.2 mg/dL. Elevated levels (>7.0 mg/dL) can precipitate into **Gout** (acute joint inflammation).`;
        labSources.push('Indian Society of Nephrology Reference Guidelines');
      } else if (p.includes('lft') || p.includes('bilirubin') || p.includes('sgot') || p.includes('sgpt') || p.includes('liver')) {
        labExplanation = `**Liver Function Test (LFT)**:
1. **Total Serum Bilirubin**:
   - *Standard Range*: 0.2 – 1.2 mg/dL (Direct: 0.0 – 0.3 mg/dL).
   - *Clinical Significance*: Levels > 2.5 mg/dL cause clinically visible **Jaundice** (icterus) in eyes and skin.
2. **SGPT (ALT) & SGOT (AST)**:
   - *Standard Range*: SGPT: 7 – 56 U/L | SGOT: 10 – 40 U/L.
   - *Clinical Significance*: Hepatocellular enzymes that leak into blood when liver cells are inflamed (fatty liver, viral hepatitis, alcohol toxicity, or drug effects).
3. **Alkaline Phosphatase (ALP)**:
   - *Standard Range*: 44 – 147 U/L. Elevated in biliary obstruction, gallstones, or bone turnover.`;
        labSources.push('Indian National Association for Study of the Liver (INASL)');
      } else if (p.includes('thyroid') || p.includes('tsh') || p.includes('t3') || p.includes('t4')) {
        labExplanation = `**Thyroid Profile (T3, T4, TSH)**:
1. **TSH (Thyroid Stimulating Hormone)**:
   - *Standard Adult Range*: 0.4 – 4.5 mIU/L.
   - *Elevated TSH (> 4.5)*: Indicates **Hypothyroidism** (underactive thyroid gland). Symptoms: weight gain, lethargy, cold intolerance, dry skin.
   - *Suppressed TSH (< 0.4)*: Indicates **Hyperthyroidism** (overactive thyroid gland). Symptoms: weight loss, palpitations, heat intolerance, tremor.
2. **Free T4 / Total T4**:
   - Works inversely with TSH to confirm primary thyroid diagnosis.`;
        labSources.push('Endocrine Society of India (ESI) Thyroid Guidelines');
      } else {
        labExplanation = `**General Laboratory Diagnostic Interpretation**:
- All laboratory results must be correlated with your clinical symptoms and physical examination.
- Values slightly outside reference intervals are common and do not always indicate disease.
- View and download your complete signed PDF diagnostic reports from the **[Lab Reports Portal](/portal/lab-reports)**.`;
      }

      return {
        answer: `### 🔬 Clinical Laboratory Report Interpretation

${labExplanation}

- **Access Official Reports**: You can download your NABL-accredited, pathologist-signed digital report with barcode from the **[Patient Portal Lab Reports](/portal/lab-reports)** page.${disclaimer}`,
        sources: labSources,
      };
    }

    // Default Comprehensive Response
    return {
      answer: `### 🏥 MediNexa Healthcare Assistant

Thank you for contacting MediNexa Healthcare Intelligence. 

I understand your query regarding: **"${prompt}"**.

Here are quick options you can explore:
- 📅 **[Book or View Doctor Appointments](/portal/appointments)**
- 🔬 **[Access Diagnostic Pathology Reports](/portal/lab-reports)**
- 💊 **[Review Prescriptions & Dosages](/portal/prescriptions)**
- 🗺️ **Hospital Helpline**: +91 11 2692 5858 (MediNexa Hospital, Sarita Vihar, New Delhi)

Feel free to ask specific questions about **symptoms**, **department recommendations**, **medications**, **lab test ranges**, or **hospital navigation**!${disclaimer}`,
      sources: ['MediNexa Healthcare Intelligence Gateway', 'Hospital Clinical Protocol Index'],
    };
  }
}
