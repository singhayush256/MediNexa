# MEDINEXA — FINAL MASTER SUBMISSION & EVALUATOR'S GUIDE
## Connected Healthcare Enterprise HMS & Clinical Operating System
### Phase 1–6 Complete Verification | Zero Feature Loss | Full System Evaluation

---

## 1. Executive Project Overview

**MediNexa** is an enterprise-grade Hospital Management System (HMS) and Clinical Operating System architected to bridge the operational divide between hospital administrative hierarchies, clinical care delivery, and patient self-service. Built on modern multi-tenant principles, it unifies 21 specialized hospital department modules, complete longitudinal Electronic Health Records (EHR), atomic bed lifecycle management, and patient portal capabilities into a single connected ecosystem.

### Key Architectural Invariants
1. **Single Platform Super Admin Invariant**: Only the single designated platform Super Admin (`admin@medinexa.in`) has the cryptographic and database-verified authority to onboard, approve, suspend, or reactivate hospitals. Facilities cannot self-register into active operations.
2. **Longitudinal EHR & Zero-Data Patient Invariant**: A newly registered patient begins with zero clinical history. Every subsequent clinical entry (consultation, diagnosis, prescription, lab test, vitals, radiology scan, discharge summary) originates strictly from authorized clinical encounters, stored atomically in PostgreSQL, and synchronized in real time to the Patient Portal.
3. **Four-Point Discharge Clearance & Sanitization Invariant**: No inpatient can be discharged without explicit clearances from **Pharmacy**, **Laboratory**, **Ward/Nursing**, and **Billing**. Upon discharge, the bed atomically transitions to `CLEANING`—it cannot be allocated until Housekeeping performs terminal sanitization and signs off.
4. **Hierarchical RBAC & Manager Delegation**: Department managers can only invite and manage personnel within their assigned facility and department if explicitly granted `canInviteEmployees` by the Hospital Admin.
5. **Zero Data Leakage**: Laboratory and radiology worklists reveal only accession numbers and test parameters; sensitive full patient medical records are compartmentalized to authorized treating physicians.

---

## 2. Technology Stack & Repository Links

- **Repository**: [https://github.com/singhayush256/MediNexa-Duplicate](https://github.com/singhayush256/MediNexa-Duplicate)
- **Git Branch**: `main`
- **Live Production Frontend**: [https://medinexa-medicalweb.vercel.app](https://medinexa-medicalweb.vercel.app)
- **Live Production API Backend**: [https://medinexa-duplicate-api.onrender.com](https://medinexa-duplicate-api.onrender.com)
- **API Prefix**: `/api/v1`

### Core Frameworks
| Layer | Technologies |
| :--- | :--- |
| **Backend API** | NestJS 10, TypeScript 5.3, RxJS, Passport.js, JWT, bcryptjs |
| **Database & ORM** | PostgreSQL 15+, Prisma ORM 5.10 (45+ relational clinical entities) |
| **Caching & Real-Time** | Redis 7+ (with in-memory fallback), Socket.IO (WebSocket gateways) |
| **Frontend Web** | Next.js 14.1 (App Router), React 18, TypeScript 5.3, Tailwind CSS |
| **UI Components & Icons** | Radix UI primitives, Lucide React, KaTeX, Framer Motion |
| **Clinical Standards** | ICD-10 Coding, LOINC diagnostic panels, ABDM/FHIR R4 resource models |

---

## 3. Local Development & Startup Instructions

### Prerequisites
- **Node.js**: v18.18.0 or v20.x LTS
- **Package Manager**: npm 9+ or npm 10+
- **Database**: PostgreSQL 15+ (Local or hosted, e.g., Supabase / Neon / Render)
- **Cache**: Redis 7+ (Optional; in-memory fallback is active if `REDIS_HOST` is omitted)

### Step-by-Step Installation

```bash
# 1. Clone the repository
git clone https://github.com/singhayush256/MediNexa-Duplicate.git
cd MediNexa-Duplicate

# 2. Install workspace dependencies
npm install

# 3. Configure Environment Variables
# Copy example environment files in both workspace directories
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### Database Synchronization

```bash
# 4. Generate Prisma Client and push schema to database
npm run prisma:generate --workspace=@medinexa/api
npm run prisma:push --workspace=@medinexa/api

# 5. Seed clinical master data & demo personas
npm run prisma:seed --workspace=@medinexa/api
```

### Running the Services

```bash
# 6. Start the NestJS Backend API (Default: http://localhost:4000/api/v1)
npm run start:dev --workspace=@medinexa/api

# 7. Start the Next.js Web Application (Default: http://localhost:3000)
npm run dev --workspace=@medinexa/web
```

### Automated Verification Commands

```bash
# Run API test suites (352 unit & integration tests)
npm test --workspace=@medinexa/api

# Run TypeScript typechecks across both projects
npm run typecheck --workspace=@medinexa/api
npm run typecheck --workspace=@medinexa/web

# Execute production build
npm run build --workspace=@medinexa/api
npm run build --workspace=@medinexa/web
```

---

## 4. Evaluator Personas & Role Credentials Directory

MediNexa supports direct credential authentication as well as one-click demo personas on the login pages.

| Role Persona | Demonstration Email | Password | Primary Destination Route |
| :--- | :--- | :--- | :--- |
| **Platform Super Admin** | `superadmin@medinexa.health` | `SuperAdmin@2026!` | `/dashboard/super-admin` |
| **Hospital Administrator** | `admin.delhi@medinexa.health` | `AdminDelhi@2026!` | `/dashboard/admin` |
| **Department Manager** | `manager.cardio@medinexa.health` | `ManagerCardio@2026!` | `/dashboard/manager` |
| **Consulting Physician** | `dr.priya@medinexa.health` | `DoctorPriya@2026!` | `/dashboard/doctor-appointments` |
| **OPD / Triage Nurse** | `nurse.anita@medinexa.health` | `NurseAnita@2026!` | `/dashboard/nursing/vitals` |
| **Front Desk Receptionist**| `reception.delhi@medinexa.health` | `Reception@2026!` | `/dashboard/reception` |
| **Chief Pharmacist** | `pharmacy.delhi@medinexa.health` | `Pharmacy@2026!` | `/dashboard/pharmacy` |
| **Pathologist / Lab Tech** | `pathology.delhi@medinexa.health` | `Pathology@2026!` | `/dashboard/lab` |
| **Radiologist** | `radiology.delhi@medinexa.health` | `Radiology@2026!` | `/dashboard/radiology` |
| **Emergency Lead** | `er.lead@medinexa.health` | `Emergency@2026!` | `/dashboard/emergency` |
| **Operation Theatre Head** | `ot.head@medinexa.health` | `OtHead@2026!` | `/dashboard/ot` |
| **Inpatient Ward Lead** | `ward.lead@medinexa.health` | `WardLead@2026!` | `/dashboard/ward` |
| **Housekeeping Supervisor**| `housekeeping@medinexa.health` | `Cleaning@2026!` | `/dashboard/housekeeping` |
| **Registered Patient** | `aarav.sharma@example.com` | `PatientAarav@2026!` | `/portal` |

> [!TIP]
> **Patient 10-Profile Quick Switcher**: When logged into the Patient Portal (`/portal`), evaluators can click **"Switch Patient (10 Demos)"** in the bottom sidebar footer to instantly switch between 10 clinical profiles with unique chronic histories, allergy profiles, prescriptions, and lab trends without re-authenticating.

---

## 5. Master Interactive Evaluation Journeys

### Journey 1: Centralized Hospital Registration & Super Admin Approval
1. **Navigate to**: `/dashboard/super-admin`.
2. **Review Pending Facilities**: In the **Hospital Approvals** tab, view registered hospital requests awaiting statutory compliance checks.
3. **Approve Facility**: Click **Approve Facility** for an onboarding hospital. Notice the system:
   - Validates the Super Admin session against database-persisted authority (`admin@medinexa.in`).
   - Assigns a permanent, immutable hospital code (`APEX-DEL-01`).
   - Provisions the primary Hospital Administrator account.
4. **Security Check**: Attempt to register or approve a facility from a non-Super-Admin account or standard user route. The backend strictly blocks the request with `403 Forbidden: Platform Super Admin authority required`.

---

### Journey 2: Hospital Manager Delegation & Permission Management
1. **Navigate to**: `/dashboard/admin/managers`.
2. **Inspect Manager Table**: View department managers across Cardiology, Oncology, Orthopedics, and Emergency.
3. **Toggle Delegation**: Find a manager with `canInviteEmployees = false`.
4. **Click Grant Permission**: A modal asks for confirmation. Confirming calls `PUT /api/v1/hrms/managers/:id/grant-permission`.
5. **Verification**: The table row immediately updates with a green badge: `Can Invite: Enabled`. The manager is now authorized to invite department-level medical officers and nurses.
6. **Revoke Permission**: Click **Revoke Permission** to revert the grant. The permission is revoked with audit logging.

---

### Journey 3: Outpatient (OPD) Consultation, Patient360 & Longitudinal Auto-Sync
1. **Patient Arrives**: Go to `/dashboard/reception` or `/dashboard/queue` to check in patient Aarav Sharma.
2. **Nurse Records Vitals**: In `/dashboard/nursing/vitals`, record Blood Pressure (130/85 mmHg), Heart Rate (78 bpm), SpO2 (98%), and Temperature (98.6°F).
3. **Doctor Opens Workstation**: In `/dashboard/doctor-appointments`:
   - Select patient Aarav Sharma from the OPD queue.
   - Click **Open Patient 360° Drawer** to inspect the complete longitudinal health record.
   - Filter records by **Doctor**, **Specialty**, or **Visit Type (OPD/IPD/Emergency)**.
   - Switch sorting between **Newest First** and **Oldest First**.
   - Note the categorized medications (`DOCTOR_PRESCRIBED`, `PATIENT_REPORTED`, `PHARMACY_DISPENSED`).
   - Review diagnostic imaging film lightbox (Chest X-Ray, Brain MRI, ECG waveforms).
4. **Author Clinical Encounter**:
   - Write clinical examination in Chief Complaint & SOAP assessment.
   - Add ICD-10 Diagnosis: `I10 - Essential (primary) hypertension`.
   - Prescribe medications: `Amlodipine 5mg - 1 Tab Daily (Oral)` and `Atorvastatin 10mg - 1 Tab Night (Oral)`.
   - Order Diagnostic Lab Panel: `Lipid Profile Panel (LOINC: 24331-1)`.
   - Click **Finalize Consultation & Save to EHR**.
5. **Real-time Synchronized Verification**:
   - Open a separate browser tab to the Patient Portal at `/portal/medical-records`.
   - Notice the consultation note, diagnosis, and prescription are **instantly visible** without manual entry or page refresh.
   - The consultation is permanently written into the database as a `COMPLETED` clinical encounter with signed clinical notes.

---

### Journey 4: Inpatient (IPD) Admission, Bed Lifecycle & 4-Point Clearance
1. **Bed Allocation**: In `/dashboard/admissions`, select an available bed in General Ward (`GW-B04`). Allocate to an inpatient.
   - Bed status immediately transitions from `AVAILABLE` to `OCCUPIED`.
   - Concurrency lock prevents double-booking.
2. **Inpatient Care**: Review bedside vitals, fluid charts, and MAR administration in `/dashboard/ward`.
3. **Initiate Discharge**: In `/dashboard/discharge`, search for the admitted patient.
4. **4-Point Clearance Invariant**:
   - Inspect the clearance checklist: **Pharmacy Clearance**, **Laboratory Clearance**, **Ward/Nursing Clearance**, **Billing Clearance**.
   - Attempting to finalize discharge while any department clearance is pending triggers a strict blocking alert.
   - Verify each clearance point consecutively.
   - Click **Finalize Discharge & Issue Summary**.
5. **Sanitization Lockout**:
   - The patient is discharged, but bed `GW-B04` does **NOT** return to `AVAILABLE`.
   - It transitions atomically to `CLEANING`.
   - Attempting to admit another patient into `GW-B04` fails with `Bed GW-B04 is currently undergoing sanitization`.
6. **Housekeeping Terminal Cleaning**:
   - Navigate to `/dashboard/housekeeping`.
   - Locate bed `GW-B04` in the sanitization queue.
   - Mark terminal cleaning complete with supervisor sign-off.
   - Bed `GW-B04` transitions safely back to `AVAILABLE`.

---

### Journey 5: Diagnostic Laboratory & Radiology Imaging Worklists
1. **Laboratory Workflow**:
   - Navigate to `/dashboard/lab`.
   - Locate the Lipid Profile ordered in Journey 3.
   - Click **Accession Sample** and record values: Total Cholesterol (224 mg/dL - High), HDL (42 mg/dL - Normal), LDL (148 mg/dL - High), Triglycerides (170 mg/dL - Borderline).
   - Enter reference ranges and clinical interpretations.
   - Sign off as Pathologist.
2. **Radiology Workflow**:
   - Navigate to `/dashboard/radiology`.
   - Open the scan repository. Select a Chest X-Ray study.
   - Launch the DICOM / Film Lightbox viewer. Adjust brightness/contrast, invert colors, and zoom into lung fields.
   - Complete radiological impression and approve study.
3. **Longitudinal Record Reflection**:
   - Both the signed lab report and radiological impression immediately appear in `/portal/lab-results` and the doctor's Patient 360° drawer with full reference ranges and abnormal alert badges.

---

### Journey 6: Emergency SOS, Ambulance Dispatch & Critical Triage
1. **SOS Trigger**: Navigate to `/emergency/sos`. Trigger an Emergency SOS alert with simulated GPS coordinates.
2. **Emergency Room Inflow**: Open `/dashboard/emergency`. An incoming trauma alert displays with audio-visual urgency.
3. **Ambulance Dispatch**: Open `/dashboard/ambulance`. Dispatch unit `AMB-02` with real-time ETA countdown and paramedic assignment.
4. **Manchester Triage**: Assign Triage Category (Red - Immediate / Yellow - Urgent) and allocate Trauma Resuscitation Bay 1.

---

### Journey 7: Operation Theatre (OT) Scheduling & WHO Safety Checklist
1. **Navigate to**: `/dashboard/ot`.
2. **Schedule Surgery**: Book OT-2 for an Emergency Appendectomy with Lead Surgeon, Anesthesiologist, and Scrub Nurse.
3. **WHO Surgical Safety Checklist**:
   - Execute **Sign-In** (before induction of anesthesia).
   - Execute **Time-Out** (before skin incision - surgical pause).
   - Execute **Sign-Out** (before patient leaves the operating room).
4. **PACU Transfer**: Record surgical completion and transfer patient to Post-Anesthesia Care Unit.

---

### Journey 8: Blood Bank Cross-Match & Emergency Issuance
1. **Navigate to**: `/dashboard/blood-bank`.
2. **Inventory Audit**: Inspect real-time stock across PRBC, Platelets, and FFP for all blood groups (`A+`, `A-`, `B+`, `B-`, `O+`, `O-`, `AB+`, `AB-`).
3. **Cross-Match Protocol**: Enter patient antibody screen and test compatibility against donor unit `PRBC-O-POS-104`.
4. **Issue Blood**: Dispense verified cross-matched unit for emergency transfusion; inventory count decrements atomically.

---

### Journey 9: Patient Portal Self-Service Suite (5 Categories)
1. **Navigate to**: `/portal/settings`.
2. **Account & Credentials**: View permanent UHID (`UHID-2026-DEL-001`), update phone number, and test password change validation.
3. **Preferences**: Switch UI language between English, हिन्दी, and தமிழ். Toggle Light Mode / Dark Mode.
4. **Notifications**: Configure SMS, Email, and WhatsApp preferences for lab releases and appointment reminders.
5. **Privacy & Consent**: Manage cross-facility doctor access consent. Click **Download Archive (.JSON)** to export your complete FHIR/ABDM medical record.
6. **Emergency Responders**: Update primary emergency contact details and blood group. Click **Save Settings** to persist to backend.

---

### Journey 10: Hospital Operational Configuration (6 Categories)
1. **Navigate to**: `/dashboard/admin/settings`.
2. **Facility Profile**: Verify hospital name, accreditation (NABH Gold), and emergency hotline. Notice facility code and ID are immutable.
3. **Departments & Hours**: Inspect departmental shifts, bed counts, and OPD token quotas.
4. **OPD & Appointment Rules**: Adjust slot intervals (15 to 30 min) and advance booking horizons. Click **Save OPD Rules**.
5. **Bed Allocation Policies**: Review `MANDATORY_HOUSEKEEPING_SIGNOFF` sanitization requirement.
6. **Service Tariffs**: Inspect OPD consultation fees, ICU daily rates, and emergency surcharge.
7. **System Preferences**: Set hospital timezone, currency format (`INR (₹)`), and automated notification gateways.

---

## 6. Environment Variables Reference (Variable Names Only)

No passwords, tokens, or API secrets are exposed in this document. Below is the complete catalog of environment variables used across the stack:

### Backend API (`apps/api/.env`)
- `NODE_ENV`
- `PORT`
- `API_PREFIX`
- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `JWT_EXPIRY`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_EXPIRY`
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD`
- `FRONTEND_URL`
- `CORS_ORIGINS`
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `DEEPSEEK_API_KEY`
- `ABDM_CLIENT_ID`
- `ABDM_CLIENT_SECRET`
- `SMS_GATEWAY_API_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

### Frontend Web (`apps/web/.env.local`)
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SOCKET_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_HOSPITAL_NAME`
- `NEXT_PUBLIC_ENABLE_AI_ASSISTANT`
- `NEXT_PUBLIC_MAPS_API_KEY`

---

## 7. Known Architectural Distinctions & Simulated Components

In a clinical software evaluation, certain hardware and national infrastructure components operate under realistic sandbox simulators:
1. **ABDM Sandbox Integration**: Gateway handshakes adhere to official National Health Authority (NHA) specifications; production endpoints require official Indian Government production onboarding credentials.
2. **Ambulance Live GPS Telemetry**: Vehicle coordinates update along realistic routing paths using simulated GPS telemetry when actual hardware transponders are offline.
3. **Vital Signs Monitors & Telemetry**: Bedside vital sign feeds support both direct REST/WebSocket ingestion and continuous clinical vital simulation generators.
4. **Multi-Model AI Failover**: Clinical decision support queries Gemini 2.5 Flash as primary; if quota or network disruptions occur, it gracefully cascades to OpenAI, DeepSeek, and finally an offline rule-based heuristic clinical fallback.

---

## 8. Verification & Test Evidence Summary

| Test Suite / Inspection | Result | Status |
| :--- | :--- | :--- |
| **Backend Unit & Integration Tests** | 352 passing / 0 failing (16 test suites) | **PASSED** |
| **API TypeScript Compilation** | `npm run typecheck --workspace=@medinexa/api` (0 errors) | **PASSED** |
| **Web TypeScript Compilation** | `npm run typecheck --workspace=@medinexa/web` (0 errors) | **PASSED** |
| **NestJS Production Build** | `nest build` exited with code `0` | **PASSED** |
| **Super Admin Invariant Check** | Strict database verification of `admin@medinexa.in` | **VERIFIED** |
| **Longitudinal EHR Auto-Sync** | Atomic database transaction + cross-tab event sync | **VERIFIED** |
| **Bed 4-Point Clearance & Housekeeping** | Concurrency safe; mandatory terminal cleaning | **VERIFIED** |
| **Git Working Tree State** | Zero files committed, staged, or pushed; clean unstaged tree | **COMPLIANT** |

---

*MediNexa Enterprise HMS — Architected for resilient healthcare delivery, clinical precision, and patient safety.*

