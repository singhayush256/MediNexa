# MEDINEXA — COMPLETE WORKFLOW ARCHITECTURE & ENTERPRISE BLUEPRINT
## Connected Healthcare Enterprise HMS, Multi-Facility Operating System & Patient Zero-Data Architecture

---

## 1. Executive Architecture Summary

**MediNexa** is an enterprise-grade, cloud-native Hospital Management System (HMS) and Clinical Operating System designed for multi-facility healthcare conglomerates, government healthcare grids, and private hospital networks. MediNexa connects all 21 hospital roles and departments into a single coherent, real-time reactive ecosystem.

The system enforces strict medical governance, immutable audit logging, multi-tenant organizational isolation, role-based and attribute-based access control (RBAC/ABAC), and statutory healthcare standards aligned with:
- **ABDM (Ayushman Bharat Digital Mission)**: Health IDs (ABHA), M1/M2/M3 consent frameworks, and interoperable health data bundles.
- **HL7 FHIR R4 & ICD-10**: Standardized clinical terminology, clinical encounters, diagnostic coding, and observational telemetry.
- **NABH & JCI**: Rigorous hospital accreditation invariants, mandatory 4-point discharge clearances, patient safety alerts, and bed sanitization protocols.
- **DPDP Act & GDPR**: Patient data sovereignty, explicit consent management, and granular patient-reported data tagging.

```
+---------------------------------------------------------------------------------------------------+
|                                 MEDINEXA CENTRAL PLATFORM HIERARCHY                               |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                   +--------------v--------------+
                                   |     PLATFORM SUPER ADMIN    |
                                   |  (Master License & Approvals)|
                                   +--------------+--------------+
                                                  |
                   +------------------------------+------------------------------+
                   |                                                             |
    +--------------v--------------+                               +--------------v--------------+
    |  HOSPITAL FACILITY ALPHA    |                               |   HOSPITAL FACILITY BETA    |
    |   (Hospital Administrator)  |                               |    (Hospital Administrator) |
    +--------------+--------------+                               +--------------+--------------+
                   |                                                             |
    +--------------v--------------+                               +--------------v--------------+
    |   DEPARTMENTAL MANAGERS     |                               |    DEPARTMENTAL MANAGERS    |
    | (OPD, IPD, Lab, ER, Pharm)  |                               |  (OPD, IPD, Lab, ER, Pharm) |
    +--------------+--------------+                               +--------------+--------------+
                   |                                                             |
    +--------------v--------------+                               +--------------v--------------+
    |    CLINICAL & SUPPORT STAFF |                               |   CLINICAL & SUPPORT STAFF  |
    | (Doctors, Nurses, Techs)    |                               | (Doctors, Nurses, Techs)    |
    +-----------------------------+                               +-----------------------------+
                                                  ^
                                                  |
                                   +--------------+--------------+
                                   |   SOVEREIGN PATIENT PORTAL  |
                                   |  (UHID, Consent, Telehealth)|
                                   +-----------------------------+
```

---

## 2. Platform Role Hierarchy & Governance Model

MediNexa enforces a strict top-down administrative hierarchy preventing unauthorized organization creation or rogue employee self-registration.

| Level | Role Identifier | Platform Scope | Administrative & Clinical Responsibilities |
| :--- | :--- | :--- | :--- |
| **0** | `SUPER_ADMIN` / `MEDINEXA_ADMIN` | Global Grid | Registers and approves new hospital facilities; provisions enterprise license keys; audits cross-facility transfers; enforces global security compliance. |
| **1** | `HOSPITAL_ADMIN` | Single Facility | Configures facility operational policies, OPD timings, bed tariffs, and department rosters; invites and manages Departmental Managers. |
| **2** | `MANAGER` / Department Head | Department Scope | Assigns daily shift rosters, manages departmental inventory, supervises junior staff, and handles clinical escalations. |
| **3** | `DOCTOR` | Clinical | Outpatient consultations, inpatient daily rounds, ICD-10 diagnosis, prescription authoring, diagnostic lab orders, and discharge summaries. |
| **4** | `NURSE` | Ward / Inpatient | Bedside vitals logging, medication administration records (MAR), nurse calls, inpatient care plans, and ward transfer requests. |
| **5** | `RECEPTIONIST` | Front Desk / Queues | Patient registration, UHID verification, walk-in token allocation, OPD appointment check-in, and visitor pass generation. |
| **6** | `PHARMACIST` | Central Pharmacy | Prescription validation, batch verification, drug expiry tracking, automated inventory stock depletion, and medicine dispensing. |
| **7** | `LAB_TECHNICIAN` / `PATHOLOGIST` | Laboratory | Diagnostic specimen accessioning, barcoded sample intake, clinical analysis, result capture, reference range check, and verification. |
| **8** | `RADIOLOGIST` | Diagnostic Imaging | X-Ray, CT Scan, MRI scan intake, PACS DICOM viewing, critical finding alerts, and verified diagnostic report dispatch. |
| **9** | `BILLING_OFFICER` | Revenue Cycle | Outpatient invoicing, inpatient running billing ledgers, TPA health insurance pre-authorization, copay tracking, and receipt generation. |
| **10** | `EMERGENCY_PHYSICIAN` / `EMT` | Emergency & Trauma | Manchester triage (Red/Yellow/Green), Code Blue resuscitation events, real-time ambulance dispatch telemetry, and ER inflow control. |
| **11** | `HOUSEKEEPING_SUPERVISOR` | Facility Operations | Terminal bed sanitization, bio-hazard waste management, room disinfection clearance, and bed release to `AVAILABLE` status. |
| **12** | `BLOOD_BANK_OFFICER` | Transfusion Medicine | Blood unit donations, ABO/Rh grouping, cross-matching against recipient samples, reserve holds, and emergency unit issuance. |
| **13** | `PATIENT` | Portal / Mobile | Self-service appointment scheduling, personal health settings customization, family proxy management, ABDM consent approvals, and bill payments. |

---

## 3. End-to-End Clinical Workflows

### 3.1 Outpatient (OPD) Workflow
```
[Patient / Portal] 
       | (Books Slot / Walk-in)
       v
[Reception Front Desk] ----> UHID Verification & Check-in ----> Digital OPD Token Issued
       |
       v
[Nursing Triage Station] ---> Logs Vitals (BP, HR, SpO2, Temp, BMI, Pain Score)
       |
       v
[Doctor Consultation Console]
       |---> Reviews Patient-Reported History (Tagged: PATIENT_REPORTED)
       |---> Conducts Clinical Assessment & Authors SOAP Note
       |---> Encodes ICD-10 Diagnoses
       |---> Generates e-Prescription (Validated with Drug Safety Rules)
       |---> Orders Diagnostic Labs / Radiology Scans
       |
       +-----------------------+-----------------------+
       |                                               |
       v                                               v
[Central Pharmacy]                             [Diagnostic Laboratory]
  - Verifies Prescription Batch                  - Specimen Accessioning
  - Checks Expiry & Interactions                 - Analyzes Sample
  - Dispenses Medications                        - Pathologist Verifies
  - Depletes Stock Ledger                        - Results Synced to Doctor & Patient
       |                                               |
       +-----------------------+-----------------------+
                               |
                               v
               [Billing & Revenue Management]
                 - Consolidates Consultation + Meds + Labs
                 - Applies Insurance / Copay / Cash Discount
                 - Issues Digital Invoice & Receipt
                               |
                               v
               [Patient Portal Notifications]
                 - Digital Prescription with localized instructions
                 - WhatsApp & SMS Token/Billing confirmation
```

### 3.2 Inpatient (IPD) & Bed Lifecycle State Machine
MediNexa implements a strict state machine to prevent hospital-acquired infections and concurrency race conditions.

```
       +--------------------+
       |     AVAILABLE      |<----------------------------------------+
       +---------+----------+                                         |
                 |                                                    |
                 | (Reserved online / pre-admission hold)             |
                 v                                                    |
       +--------------------+                                         |
       |      RESERVED      |                                         |
       +---------+----------+                                         |
                 |                                                    |
                 | (Patient physically admitted)                      |
                 v                                                    |
       +--------------------+                                         |
       |      OCCUPIED      |                                         |
       +---------+----------+                                         |
                 |                                                    |
                 | (Discharge finalized with 4-point clearance)       |
                 v                                                    |
       +--------------------+                                         |
       |      CLEANING      |                                         |
       +---------+----------+                                         |
                 |                                                    |
                 | (Housekeeping completes disinfection & sign-off)   |
                 +----------------------------------------------------+
```

#### Mandatory 4-Point Discharge Clearance Protocol
Before a bed can transition from `OCCUPIED` to `CLEANING`, all four departmental clearances must be explicitly `APPROVED`:
1. **Pharmacy Clearance**: All prescribed take-home medications reconciled; unused ward stock returned.
2. **Laboratory Clearance**: All pending lab tests finalized; no open specimen orders.
3. **Nursing / Ward Clearance**: Patient IV lines removed, catheter care completed, discharge summary signed.
4. **Billing / TPA Clearance**: Ledger settled; insurance co-pay paid; zero outstanding patient balance.

Upon clearance approval, the bed automatically transitions to `CLEANING`. It **CANNOT** be allocated to new admissions while in `CLEANING`. Only a verified Housekeeping sign-off completes the transition back to `AVAILABLE`.

---

## 4. Patient-Reported vs Clinician-Authorized Data Architecture

To ensure strict clinical safety, MediNexa maintains a clear architectural partition between subjective patient-reported disclosures and certified clinician authorizations:

1. **Patient-Reported Data (`PATIENT_REPORTED`)**:
   - Entered via the Patient Portal (`/portal/settings` or `/portal/profile`).
   - Includes self-reported drug allergies, past surgical history, family medical background, over-the-counter vitamins, and emergency contact details.
   - Stored in dedicated patient profile metadata fields and rendered with a high-visibility amber badge: `PATIENT_REPORTED`.
   - **Safety Invariant**: Subjective disclosures can never overwrite, replace, or alter a doctor's confirmed medical diagnosis or signed prescription.

2. **Clinician-Authorized Data (`CLINICAL_VERIFIED`)**:
   - Authored exclusively by licensed medical professionals through authenticated EHR sessions (`/dashboard/doctor-appointments`, `/dashboard/nursing`).
   - Includes ICD-10 diagnoses, vital sign measurements, lab observation values, operative notes, and signed digital prescriptions.
   - Immutably stored with doctor credentials, timestamp, and facility identifier.

---

## 5. Security, Concurrency & Data Protection Invariants

1. **Row-Level Concurrency Locking (`pessimistic / transaction locking`)**:
   - All bed assignments, appointment bookings, and inventory stock deductions execute within atomic database transactions.
   - Dual-booking of beds or over-dispensing of medicine batches is physically prevented at the database lock level.

2. **Multi-Tenant Facility Boundary**:
   - Every database query strictly filters by `facilityId`.
   - Staff at Hospital Alpha cannot access medical records, staff rosters, or invoices from Hospital Beta unless an authorized inter-facility transfer has been formally dispatched.

3. **HMAC Audit Trail**:
   - Sensitive operations (role modifications, permission grants, hospital onboarding, patient record exports) append immutable records to `AuditEvent` with cryptographic hashes.

4. **Zero-Trust PHI Object Storage**:
   - Medical scans, laboratory PDFs, and insurance cards are stored in private Cloudflare R2 / Supabase buckets using cryptographically anonymized object keys.
   - Access is granted exclusively through short-lived (15-minute) signed download URLs generated server-side.

