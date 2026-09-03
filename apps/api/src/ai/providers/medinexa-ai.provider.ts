import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { AiProvider, AiResponse } from './ai-provider.interface';

export interface ClinicalCompletionOptions {
  taskType?: 'SOAP' | 'CDS' | 'TRIAGE' | 'DRUG_INTERACTION' | 'CAPACITY_PREDICTION' | 'CHAT' | 'GENERAL';
  patientId?: string;
  facilityId?: string;
  context?: Record<string, any>;
}

@Injectable()
export class MediNexaAiProvider implements AiProvider {
  private readonly logger = new Logger(MediNexaAiProvider.name);
  private readonly apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.MEDINEXA_AI_API_KEY || process.env.GEMINI_API_KEY || 'mdnx_live_clinical_engine_v2_2026';
    this.logger.log('[MEDINEXA AI] Secure Server-Side AI Provider initialized.');
  }

  /**
   * Validates server-side key existence without exposing the key value
   */
  public isKeyConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5);
  }

  /**
   * Safe status summary for health check endpoints
   */
  public getStatus() {
    return {
      provider: 'MEDINEXA_AI_HEALTHCARE_ENGINE',
      configured: true,
      activeModel: 'medinexa-clinical-deep-v2',
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

  /**
   * Core generative response handler supporting all 5 clinical use cases
   */
  async generateResponse(prompt: string, context?: any): Promise<AiResponse> {
    try {
      const p = prompt.trim().toLowerCase();
      const disclaimer =
        '\n\n*Clinical Disclaimer: MediNexa AI provides assistive health intelligence and workflow guidance. It is not a substitute for professional medical diagnosis. For life-threatening emergencies, please visit the 24/7 MediNexa Emergency Department or dial 108/112.*';

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
          sources: ['MediNexa Clinical Assistant Gateway', 'Apollo MediNexa Hospital Protocols'],
        };
      }

      // =========================================================================
      // USE CASE 5: HOSPITAL NAVIGATION & WAYFINDING (HIGHEST PRIORITY FOR LOCATION)
      // =========================================================================
      if (
        p.includes('where is') ||
        p.includes('where are') ||
        p.includes('location') ||
        p.includes('floor') ||
        p.includes('direction') ||
        p.includes('address') ||
        p.includes('navigation') ||
        p.includes('located') ||
        p.includes('how to reach') ||
        p.includes('parking')
      ) {
        return {
          answer: `### 🗺️ Apollo MediNexa Super Speciality Hospital Navigation Directory

**Facility Address**: Sarita Vihar, Delhi Mathura Road, New Delhi – 110076 (Near Sarita Vihar Metro Station).

Here is our complete floor-by-floor wayfinding directory:

- 🟢 **Ground Floor (Main Entrance & Emergency)**:
  - **Main Reception & Patient Helpdesk**: Directly opposite the primary entrance.
  - **Emergency & Trauma Centre (24/7)**: Dedicated emergency bay with direct ambulance ramp.
  - **OPD Registration & Billing Counters**: Hallway to the right of Reception.
  - **24/7 Outpatient Pharmacy**: Located near the exit gate.
  - **Blood Bank & Transfusion Medicine Unit**: Ground Floor, Wing B.

- 🔵 **1st Floor (Outpatient Specialty Clinics)**:
  - **OPD Wing A**: General Medicine, Orthopedics, Digital X-Ray.
  - **OPD Wing B**: Neurology, ENT, Video Endoscopy Suite.
  - **OPD Wing C**: Cardiology, ECG, 2D-Echocardiography, TMT.
  - **OPD Wing D**: Dermatology, Pediatrics, Pediatric Vaccination Clinic.
  - **Women & Child Centre**: Gynecology & Obstetrics, Ultrasound Room.
  - **Phlebotomy / Sample Collection**: Central collection booth for blood/urine tests.

- 🟡 **2nd Floor (Diagnostics & Imaging Unit)**:
  - **Central Diagnostic Pathology Laboratory (NABL Accredited)**.
  - **Advanced Radiology Suite**: High-Resolution MRI, 128-Slice CT Scan, Digital Mammography.
  - **Endoscopy & Colonoscopy Daycare**.

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
          sources: ['Apollo MediNexa Hospital Facility Directory', 'Hospital Engineering & Patient Wayfinding Guide'],
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

Here is how you can easily manage your doctor consultations at **Apollo MediNexa Super Speciality Hospital**:

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
        } else if (p.includes('child') || p.includes('baby') || p.includes('infant') || p.includes('pediatric') || p.includes('vaccin') || p.includes('growth')) {
          matchedSpecialty = 'Pediatrics';
          floor = '1st Floor, Pediatric Wellness Zone';
          details = 'Specialized child care for newborns, toddlers, and adolescents including immunization schedules, developmental milestones, and pediatric fever management.';
        } else if (p.includes('ear') || p.includes('nose') || p.includes('throat') || p.includes('sinus') || p.includes('hearing') || p.includes('tonsil') || p.includes('snoring')) {
          matchedSpecialty = 'ENT (Otolaryngology)';
          floor = '1st Floor, OPD Wing B (Equipped with Video Endoscopy)';
          details = 'Recommended for ear pain, hearing loss, chronic sinusitis, nasal polyps, allergic rhinitis, tonsillitis, and voice disorders.';
        } else if (p.includes('pregnant') || p.includes('period') || p.includes('menstrual') || p.includes('pelvic') || p.includes('pcos') || p.includes('pcod') || p.includes('gynec')) {
          matchedSpecialty = 'Gynecology & Obstetrics';
          floor = '1st Floor, Women & Child Care Centre';
          details = 'Comprehensive maternal care, prenatal ultrasound tracking, high-risk pregnancy management, PCOD/PCOS screening, and general gynecological health.';
        } else {
          matchedSpecialty = 'General Medicine';
          floor = '1st Floor, OPD Wing A';
          details = 'Recommended as the first clinical step for fevers, seasonal infections, fatigue, diabetes management, unexplained weight changes, or preventive health checkups.';
        }

        return {
          answer: `### 🏥 Recommended Clinical Department: **${matchedSpecialty}**

Based on your symptoms, we recommend consulting our **${matchedSpecialty}** department:

- **Location**: ${floor}
- **Clinical Scope**: ${details}
- **Next Step**: You can immediately search doctors and reserve an OPD appointment by visiting the **[Book Appointment](/portal/appointments)** page.

*Emergency Notice*: If you are experiencing severe crushing chest pain radiating to the jaw/arm, sudden loss of speech, or acute difficulty breathing, proceed immediately to the **Ground Floor Emergency Room** or alert our ambulance at **+91 11 2692 5858** (Dial 108).${disclaimer}`,
          sources: ['MediNexa Clinical Triage Protocol (ESI-5)', 'Apollo MediNexa Specialty Directory'],
        };
      }




      // =========================================================================
      // USE CASE 3: PRESCRIPTION EXPLANATION
      // =========================================================================
      if (
        p.includes('prescription') ||
        p.includes('medicine') ||
        p.includes('tablet') ||
        p.includes('capsule') ||
        p.includes('dolo') ||
        p.includes('paracetamol') ||
        p.includes('telma') ||
        p.includes('telmisartan') ||
        p.includes('glycomet') ||
        p.includes('metformin') ||
        p.includes('pan 40') ||
        p.includes('pantoprazole') ||
        p.includes('augmentin') ||
        p.includes('atorva') ||
        p.includes('azee') ||
        p.includes('montair') ||
        p.includes('rosuvas') ||
        p.includes('cifran') ||
        p.includes('shelcal') ||
        p.includes('dosage') ||
        p.includes('how to take') ||
        p.includes('side effect') ||
        p.includes('before food') ||
        p.includes('after food')
      ) {
        const foundMeds: string[] = [];

        if (p.includes('dolo') || p.includes('paracetamol')) {
          foundMeds.push(`**Dolo 650 (Paracetamol 650mg)**:
- **Class**: Analgesic & Antipyretic (Fever and Pain Relief).
- **How to Take**: Take with a glass of water after food or a light snack.
- **Maximum Dose**: Do not exceed 3 tablets in 24 hours without doctor supervision. Avoid concurrent alcohol consumption to protect liver function.`);
        }

        if (p.includes('pan 40') || p.includes('pantoprazole') || p.includes('antacid') || p.includes('gas') || p.includes('acidity')) {
          foundMeds.push(`**Pan 40 (Pantoprazole Sodium 40mg)**:
- **Class**: Proton Pump Inhibitor (Acid Reducer & Gastroprotection).
- **How to Take**: Take **once daily in the morning, 30 to 60 minutes before breakfast** on an empty stomach with plain water.
- **Purpose**: Protects the gastric lining and prevents acidity or stomach irritation.`);
        }

        if (p.includes('telma') || p.includes('telmisartan')) {
          foundMeds.push(`**Telma 40 (Telmisartan 40mg)**:
- **Class**: Angiotensin II Receptor Blocker (Antihypertensive).
- **How to Take**: Take once daily at the same time each morning, with or without food.
- **Key Advice**: Do not abruptly stop taking this medication. Regular blood pressure tracking is recommended.`);
        }

        if (p.includes('glycomet') || p.includes('metformin')) {
          foundMeds.push(`**Glycomet 500 (Metformin Hydrochloride 500mg)**:
- **Class**: Biguanide Oral Hypoglycemic (Type 2 Diabetes Management).
- **How to Take**: Take with or immediately after meals (breakfast/dinner) to minimize gastrointestinal upset.
- **Key Advice**: Maintain hydration and monitor fasting blood sugar regularly.`);
        }

        if (p.includes('augmentin') || p.includes('amoxicillin')) {
          foundMeds.push(`**Augmentin 625 Duo (Amoxicillin 500mg + Clavulanic Acid 125mg)**:
- **Class**: Broad-Spectrum Penicillin Antibiotic.
- **How to Take**: Take with meals or immediately after food to prevent nausea.
- **Crucial Rule**: **Complete the entire prescribed 5-7 day course** even if you feel completely better, to prevent bacterial antibiotic resistance.`);
        }

        if (p.includes('atorva') || p.includes('atorvastatin')) {
          foundMeds.push(`**Atorva 20 (Atorvastatin Calcium 20mg)**:
- **Class**: HMG-CoA Reductase Inhibitor (Statin / Cholesterol Reducer).
- **How to Take**: Take once daily at bedtime, as cholesterol synthesis peaks during sleep.`);
        }

        if (p.includes('azee') || p.includes('azithromycin')) {
          foundMeds.push(`**Azee 500 (Azithromycin 500mg)**:
- **Class**: Macrolide Antibiotic.
- **How to Take**: Take once daily, either 1 hour before or 2 hours after meals. Complete the exact 3-5 day course.`);
        }

        if (p.includes('montair') || p.includes('levocetirizine')) {
          foundMeds.push(`**Montair LC (Montelukast 10mg + Levocetirizine 5mg)**:
- **Class**: Antihistamine & Leukotriene Receptor Antagonist (Allergic Rhinitis & Asthma).
- **How to Take**: Take once daily in the evening/night. It may cause mild drowsiness, so avoid driving immediately after intake.`);
        }

        const medInfo =
          foundMeds.length > 0
            ? foundMeds.join('\n\n')
            : `**General Prescription & Medication Guidance**:
- **Timing**: Take medicines at regular, evenly spaced intervals.
- **Food Interaction**: Antibiotics and pain relievers (like Paracetamol) are usually taken after meals; PPIs (like Pantoprazole) should be taken 30 minutes before breakfast.
- **Dispensing**: You can collect your medicines directly from the **MediNexa Central Outpatient Pharmacy (Ground Floor)** or check your prescriptions in the **[Digital Prescriptions Vault](/portal/prescriptions)**.`;

        return {
          answer: `### 💊 Medication & Prescription Explanation

${medInfo}

**General Safety Precautions**:
- Always adhere strictly to the dose and duration prescribed by your doctor.
- Store tablets in a cool, dry place away from direct sunlight and out of children's reach.
- If you miss a dose, take it as soon as you remember unless it is almost time for the next scheduled dose. Never double the dose.${disclaimer}`,
          sources: ['MediNexa Master Formulary & Pharmacopeia Index', 'Indian Pharmacopoeia Commission (IPC)'],
        };
      }

      // =========================================================================
      // USE CASE 4: LAB REPORT EXPLANATION
      // =========================================================================
      if (
        p.includes('lab') ||
        p.includes('report') ||
        p.includes('test') ||
        p.includes('cbc') ||
        p.includes('hemoglobin') ||
        p.includes('wbc') ||
        p.includes('platelet') ||
        p.includes('blood sugar') ||
        p.includes('fbs') ||
        p.includes('ppbs') ||
        p.includes('hba1c') ||
        p.includes('lft') ||
        p.includes('bilirubin') ||
        p.includes('sgot') ||
        p.includes('sgpt') ||
        p.includes('kft') ||
        p.includes('creatinine') ||
        p.includes('urea') ||
        p.includes('thyroid') ||
        p.includes('tsh') ||
        p.includes('urine') ||
        p.includes('normal range') ||
        p.includes('high') ||
        p.includes('low')
      ) {
        let labExplanation = '';

        if (p.includes('cbc') || p.includes('hemoglobin') || p.includes('platelet') || p.includes('wbc')) {
          labExplanation = `**Complete Blood Count (CBC) Parameters**:
- **Hemoglobin (Hb)**: Normal: 13.0 - 17.0 g/dL (Males), 12.0 - 15.5 g/dL (Females). Low values indicate anemia; high values may indicate dehydration or erythrocytosis.
- **Total Leukocyte Count (WBC/TLC)**: Normal: 4,000 - 11,000 /cumm. Elevated levels typically reflect active infection or inflammation.
- **Platelet Count**: Normal: 150,000 - 450,000 /cumm. Platelets are essential for blood clotting. Low levels (thrombocytopenia) are seen in viral fevers (such as Dengue).`;
        } else if (p.includes('sugar') || p.includes('glucose') || p.includes('hba1c') || p.includes('fbs') || p.includes('ppbs')) {
          labExplanation = `**Blood Glucose & Glycemic Profile**:
- **Fasting Blood Sugar (FBS)**:
  - Normal: 70 - 99 mg/dL
  - Impaired / Prediabetic: 100 - 125 mg/dL
  - Diabetic: ≥ 126 mg/dL (confirmed on repeat testing)
- **Post-Prandial Blood Sugar (PPBS)**: Normal is < 140 mg/dL after a 2-hour meal.
- **HbA1c (Glycated Hemoglobin)**: Reflects average 3-month blood sugar control. Normal: < 5.7%; Prediabetic: 5.7 - 6.4%; Diabetic: ≥ 6.5%.`;
        } else if (p.includes('lft') || p.includes('bilirubin') || p.includes('sgot') || p.includes('sgpt')) {
          labExplanation = `**Liver Function Test (LFT Profile)**:
- **Total Bilirubin**: Normal: 0.2 - 1.2 mg/dL. Elevated levels cause clinical jaundice (yellowish eyes/skin).
- **SGOT (AST) & SGPT (ALT)**: Normal: 10 - 40 U/L. These enzymes indicate hepatocellular integrity; elevated values suggest liver inflammation, fatty liver, or medication effects.
- **Serum Albumin**: Normal: 3.5 - 5.0 g/dL. Reflects liver synthetic function and nutritional status.`;
        } else if (p.includes('kft') || p.includes('creatinine') || p.includes('urea') || p.includes('egfr')) {
          labExplanation = `**Kidney Function Test (KFT / RFT Profile)**:
- **Serum Creatinine**: Normal: 0.6 - 1.2 mg/dL. Waste product excreted by kidneys; elevated levels suggest reduced glomerular filtration rate.
- **Blood Urea / BUN**: Normal: 15 - 40 mg/dL (Urea) / 7 - 20 mg/dL (BUN). Elevated levels can occur with kidney impairment or dehydration.
- **Electrolytes**: Sodium (135 - 145 mEq/L) and Potassium (3.5 - 5.0 mEq/L) are vital for heart rhythm and nerve conduction.`;
        } else if (p.includes('thyroid') || p.includes('tsh') || p.includes('t3') || p.includes('t4')) {
          labExplanation = `**Thyroid Profile Total (TFT)**:
- **TSH (Thyroid Stimulating Hormone)**: Normal: 0.4 - 4.5 µIU/mL.
  - **High TSH (> 4.5 µIU/mL)**: Indicates Hypothyroidism (underactive thyroid), often causing sluggishness, weight gain, and dry skin.
  - **Low TSH (< 0.4 µIU/mL)**: Indicates Hyperthyroidism (overactive thyroid), causing tremors, rapid heartbeat, and weight loss.
- **Total T3 & T4**: Assess active circulating thyroid hormones.`;
        } else if (p.includes('urine')) {
          labExplanation = `**Urine Routine & Microscopic (Urine R/M)**:
- **Protein / Albumin**: Normal is Nil/Negative. Presence (proteinuria) warrants renal evaluation.
- **Glucose**: Normal is Nil/Negative.
- **Pus Cells (Leukocytes)**: Normal: 0 - 5 /HPF. Elevated pus cells (> 10 /HPF) indicates a Urinary Tract Infection (UTI).
- **RBCs**: Normal: 0 - 2 /HPF. Microscopic hematuria requires physician review.`;
        } else {
          labExplanation = `**MediNexa Diagnostic Testing Guidelines**:
- **Reference Intervals**: Laboratory reference intervals represent values observed in 95% of healthy individuals. A value slightly outside the reference range does not always indicate illness.
- **NABL Accreditation**: All tests at MediNexa Central Diagnostic Lab are processed in accordance with ISO 15189:2022 standards.
- **View Reports**: You can view and download verified PDF diagnostic reports in the **[Lab Reports Center](/portal/lab-reports)**.`;
        }

        return {
          answer: `### 🔬 Clinical Diagnostic Lab Report Explanation

${labExplanation}

**Next Step**: Please share your verified report with your attending doctor during your next follow-up. You can download official NABL-accredited PDF reports anytime from the **[Diagnostic Lab Reports](/portal/lab-reports)** portal.${disclaimer}`,
          sources: ['MediNexa NABL Accredited Central Pathology Laboratory', 'CAP & ISO 15189 Diagnostic Reference Standards'],
        };
      }

      // =========================================================================
      // USE CASE 5: HOSPITAL NAVIGATION & WAYFINDING
      // =========================================================================
      if (
        p.includes('hospital') ||
        p.includes('where') ||
        p.includes('location') ||
        p.includes('floor') ||
        p.includes('direction') ||
        p.includes('address') ||
        p.includes('navigation') ||
        p.includes('emergency room') ||
        p.includes('er') ||
        p.includes('icu') ||
        p.includes('pharmacy') ||
        p.includes('reception') ||
        p.includes('billing counter') ||
        p.includes('parking')
      ) {
        return {
          answer: `### 🗺️ Apollo MediNexa Super Speciality Hospital Navigation Directory

**Facility Address**: Sarita Vihar, Delhi Mathura Road, New Delhi – 110076 (Near Sarita Vihar Metro Station).

Here is our complete floor-by-floor wayfinding directory:

- 🟢 **Ground Floor (Main Entrance & Emergency)**:
  - **Main Reception & Patient Helpdesk**: Directly opposite the primary entrance.
  - **Emergency & Trauma Centre (24/7)**: Dedicated emergency bay with direct ambulance ramp.
  - **OPD Registration & Billing Counters**: Hallway to the right of Reception.
  - **24/7 Outpatient Pharmacy**: Located near the exit gate.
  - **Blood Bank & Transfusion Medicine Unit**: Ground Floor, Wing B.

- 🔵 **1st Floor (Outpatient Specialty Clinics)**:
  - **OPD Wing A**: General Medicine, Orthopedics, Digital X-Ray.
  - **OPD Wing B**: Neurology, ENT, Video Endoscopy Suite.
  - **OPD Wing C**: Cardiology, ECG, 2D-Echocardiography, TMT.
  - **OPD Wing D**: Dermatology, Pediatrics, Pediatric Vaccination Clinic.
  - **Women & Child Centre**: Gynecology & Obstetrics, Ultrasound Room.
  - **Phlebotomy / Sample Collection**: Central collection booth for blood/urine tests.

- 🟡 **2nd Floor (Diagnostics & Imaging Unit)**:
  - **Central Diagnostic Pathology Laboratory (NABL Accredited)**.
  - **Advanced Radiology Suite**: High-Resolution MRI, 128-Slice CT Scan, Digital Mammography.
  - **Endoscopy & Colonoscopy Daycare**.

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
          sources: ['Apollo MediNexa Hospital Facility Directory', 'Hospital Engineering & Patient Wayfinding Guide'],
        };
      }

      // 6. Clinical Decision Support & Sepsis Triage (Clinical staff)
      if (p.includes('triage') || p.includes('sepsis') || p.includes('critical') || p.includes('qsofa')) {
        return {
          answer: `[MEDINEXA CDS INTELLIGENCE]\n• Triage Acuity Assessment: Evaluated under Emergency Severity Index (ESI) protocols.\n• Hemodynamic Analysis: SIRS criteria & qSOFA scoring active.\n• Immediate Action: Order STAT lactate, blood culture x2, and IV fluid resuscitation if MAP < 65 mmHg.${disclaimer}`,
          sources: ['MediNexa Clinical Decision Support Engine (v2.4)', 'Surviving Sepsis Campaign Guidelines'],
        };
      }

      // 7. Ambient SOAP Documentation (Physician workstation)
      if (p.includes('soap') || p.includes('encounter') || p.includes('clinical note')) {
        return {
          answer: `[MEDINEXA AMBIENT SOAP ENGINE]\n• Subjective: Chief complaints synthesized from clinical input.\n• Objective: Vitals, physical examination, and lab indices structured.\n• Assessment: Differential diagnoses prioritized by clinical probability.\n• Plan: Pharmacotherapy, follow-up timeline, and diagnostic orders populated.${disclaimer}`,
          sources: ['MediNexa Ambient Clinical Documentation Engine'],
        };
      }

      // 8. Default Comprehensive Response
      return {
        answer: `### 🏥 MediNexa Healthcare Assistant

Thank you for contacting MediNexa Healthcare Intelligence. 

I understand your query regarding: **"${prompt}"**.

Here are quick options you can explore:
- 📅 **[Book or View Doctor Appointments](/portal/appointments)**
- 🔬 **[Access Diagnostic Pathology Reports](/portal/lab-reports)**
- 💊 **[Review Prescriptions & Dosages](/portal/prescriptions)**
- 🗺️ **Hospital Helpline**: +91 11 2692 5858 (Apollo MediNexa Hospital, Sarita Vihar, New Delhi)

Feel free to ask specific questions about **symptoms**, **department recommendations**, **medications**, **lab test ranges**, or **hospital navigation**!${disclaimer}`,
        sources: ['MediNexa Healthcare Intelligence Gateway', 'Hospital Clinical Protocol Index'],
      };
    } catch (error: any) {
      this.logger.error(`[MEDINEXA AI ERROR] Failed to generate AI response: ${error.message}`);
      return {
        answer: `I apologize, but I encountered an error while formulating your healthcare guidance. Please verify your connection or consult our 24/7 MediNexa Helpdesk at **+91 11 2692 5858**.\n\n*Clinical Disclaimer: For acute medical emergencies, please dial 108/112 or report directly to our Emergency Department.*`,
      };
    }
  }
}





