# MEDINEXA — MASTER SUBMISSION & INTERACTIVE DEMO GUIDE
## Comprehensive Evaluator's Manual: 10 Clinical Journeys, Architecture Walkthroughs & Credentials

---

## 1. Quick Access Information

- **Production Frontend**: [https://medinexa-medicalweb.vercel.app](https://medinexa-medicalweb.vercel.app)
- **Production API Backend**: [https://medinexa-duplicate-api.onrender.com](https://medinexa-duplicate-api.onrender.com)
- **API Prefix**: `/api/v1`
- **GitHub Repository**: [https://github.com/singhayush256/MediNexa-Duplicate](https://github.com/singhayush256/MediNexa-Duplicate)
- **Branch**: `main`

---

## 2. Interactive Role Personas & Test Credentials

MediNexa provides one-click demo personas across all core roles. For direct credential login:

| Role Persona | Identifier / Email | Password | Primary Portal / Dashboard Route |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@medinexa.health` | `SuperAdmin@2026!` | `/dashboard/super-admin` |
| **Hospital Admin** | `admin.delhi@medinexa.health` | `AdminDelhi@2026!` | `/dashboard/admin` |
| **Cardiology Manager** | `manager.cardio@medinexa.health` | `ManagerCardio@2026!` | `/dashboard/manager` |
| **Consulting Physician**| `dr.priya@medinexa.health` | `DoctorPriya@2026!` | `/dashboard/doctor-appointments` |
| **Triage Nurse** | `nurse.anita@medinexa.health` | `NurseAnita@2026!` | `/dashboard/nursing/vitals` |
| **Front Desk Reception**| `reception.delhi@medinexa.health` | `Reception@2026!` | `/dashboard/reception` |
| **Chief Pharmacist** | `pharmacy.delhi@medinexa.health` | `Pharmacy@2026!` | `/dashboard/pharmacy` |
| **Pathologist** | `pathology.delhi@medinexa.health` | `Pathology@2026!` | `/dashboard/lab` |
| **Emergency Physician**| `er.lead@medinexa.health` | `Emergency@2026!` | `/dashboard/emergency` |
| **Primary Patient** | `aarav.sharma@example.com` | `PatientAarav@2026!` | `/portal` |

*(Note: The Patient Portal also features an instant 10-Patient Demo Account Switcher modal in the sidebar footer allowing seamless evaluation of multi-patient clinical histories without re-authenticating).*

---

## 3. Ten Master Interactive Demonstration Journeys

### Journey 1: Centralized Hospital Onboarding & Super Admin Approval
1. **Navigate to**: `/dashboard/super-admin`.
2. **Action**: View pending facility registration requests under **Hospital Approvals**.
3. **Observation**: Notice how hospital facilities cannot self-register into active operations; the Super Admin verifies the statutory accreditation, assigns a permanent immutable facility code (`APEX-DEL-01`), and provisions the initial Hospital Admin.
4. **Security Verification**: Try creating an organization from unauthorized routes; verify the system enforces strict platform hierarchy.

---

### Journey 2: Hospital Admin Operational Configuration & Settings
1. **Navigate to**: `/dashboard/admin/settings`.
2. **Action**: Explore the **6-tab operational management suite**:
   - **Hospital Profile**: Review NABH license, emergency hotline, and live network metrics.
   - **Departments & Hours**: Inspect departmental shifts and daily OPD token capacities.
   - **OPD & Appointment Rules**: Change default consultation slot duration from `15 min` to `20 min`.
   - **Bed Policies**: Verify the `MANDATORY_HOUSEKEEPING_SIGNOFF` sanitization policy.
   - **Service Catalogues**: Inspect OPD base fees and daily room tariffs.
   - **Preferences**: Adjust currency and timezone.
3. **Action**: Click **Save OPD Rules**; notice instant feedback and persistence.

---

### Journey 3: Patient Portal Self-Service & Personal Settings Customization
1. **Navigate to**: `/portal/settings`.
2. **Action**: Walk through the **5-tab patient self-service suite**:
   - **Account & Credentials**: Inspect verified UHID (`UHID-2026-DEL-001`) and test the password change form with security validation.
   - **Personal Preferences**: Toggle language to *हिन्दी (Hindi)* and switch theme between *Light Mode* and *Dark Mode*.
   - **Notification Settings**: Toggle WhatsApp and Email alerts for lab results and medicine reminders.
   - **Privacy & Consent**: Toggle cross-facility doctor access consent and click **Download Archive (.JSON)** to inspect your complete ABDM health record snapshot.
   - **Emergency Responders**: Enter primary emergency contact (`Sunita Sharma`) and blood group (`B+`).
3. **Action**: Click **Save Preferences**; settings sync with MediNexa Cloud.

---

### Journey 4: Complete Outpatient (OPD) Consultation Workflow
1. **Patient Booking**: From `/portal/appointments`, book a morning consultation with Dr. Priya (Cardiology).
2. **Front Desk Check-in**: Go to `/dashboard/reception` or `/dashboard/queue`. Check in the patient and generate a digital OPD token.
3. **Nursing Vitals**: Switch to `/dashboard/nursing/vitals`. Record Blood Pressure (128/82 mmHg), Heart Rate (76 bpm), and SpO2 (99%).
4. **Doctor Workstation**: Go to `/dashboard/doctor-appointments`.
   - Click the arriving patient in the queue.
   - Review vitals and notice patient-reported allergies tagged with amber badge: `PATIENT_REPORTED`.
   - Author clinical assessment in SOAP notes.
   - Add ICD-10 Diagnosis: `I10 - Essential (primary) hypertension`.
   - Prescribe medications: `Amlokind 5` and `Ecosprin 75`.
   - Order Diagnostic Test: `Lipid Profile Panel`.
   - Finalize consultation.
5. **Laboratory Processing**: Go to `/dashboard/lab`. Notice the ordered Lipid Profile is waiting for accessioning without exposing private medical history.
6. **Pharmacy Dispensing**: Go to `/dashboard/pharmacy`. The prescription appears in real-time; pharmacist verifies batch and dispenses medicines, atomically depleting stock.
7. **Billing & Receipts**: Go to `/dashboard/billing`. The unified invoice itemizes consultation + medicines + lab tests. View the generated receipt in `/portal/medical-records`.

---

### Journey 5: Inpatient (IPD) Bed Allocation, 4-Point Clearance & Housekeeping Sanitization
1. **Bed Allocation**: Go to `/dashboard/admissions`. Admit patient into General Ward bed `GW-B12`. The bed transitions from `AVAILABLE` to `OCCUPIED`.
2. **Care & Rounds**: Go to `/dashboard/ward`. Review bedside vital trends and nurse notes.
3. **Discharge Initiation**: Go to `/dashboard/discharge`.
   - Notice the **4-Point Clearance Checklist**: Pharmacy, Laboratory, Ward/Nursing, Billing.
   - Attempting to discharge with a pending clearance triggers a safety block.
   - Approve all 4 clearances and click **Finalize Discharge**.
4. **Sanitization Invariant**:
   - Check bed `GW-B12` status; it transitions to `CLEANING` (not `AVAILABLE`).
   - Try to allocate `GW-B12` to a new patient; notice the system rejects the allocation with an error that the bed is undergoing sanitization.
5. **Housekeeping Sign-off**: Go to `/dashboard/housekeeping`. Mark terminal cleaning complete for `GW-B12`. The bed is released safely back to `AVAILABLE`.

---

### Journey 6: Emergency SOS, Ambulance Dispatch & Critical Triage
1. **SOS Trigger**: Navigate to `/emergency/sos`. Trigger a test SOS alert with GPS coordinates.
2. **Emergency Room Inflow**: Go to `/dashboard/emergency`. The incoming emergency ticket rings with high audio-visual priority.
3. **Ambulance Telemetry**: Go to `/dashboard/ambulance`. Dispatch Ambulance `AMB-04` with live GPS tracking.
4. **Manchester Triage**: Assign Red Triage (Immediate Resuscitation) and reserve Trauma Bay 1.

---

### Journey 7: Operation Theatre (OT) Scheduling & PACU Care
1. **Navigate to**: `/dashboard/ot`.
2. **Action**: Schedule a Coronary Angioplasty in OT-1.
3. **Protocol**: Complete the WHO Surgical Safety Checklist (Sign-in, Time-out, Sign-out).
4. **Post-Op**: Transfer patient to Post-Anesthesia Care Unit (PACU).

---

### Journey 8: Blood Bank Cross-Match & Emergency Unit Issuance
1. **Navigate to**: `/dashboard/blood-bank`.
2. **Inventory Overview**: Inspect live stock across all 8 blood groups (Packed Red Blood Cells, Platelets, Fresh Frozen Plasma).
3. **Cross-Match Record**: Enter recipient sample and perform compatibility testing against donor unit `PRBC-B-POS-942`.
4. **Issue**: Issue verified cross-matched unit for emergency surgery.

---

### Journey 9: Central Pharmacy Batch Management & Inventory Ledger
1. **Navigate to**: `/dashboard/pharmacy/inventory`.
2. **Batch Audit**: Inspect batch expiry dates, drug classifications, and storage requirements (2-8°C cold chain for insulin).
3. **Dispensing Consumption**: View real-time stock consumption graphs and automatic re-order alerts when stock drops below threshold.

---

### Journey 10: Multi-Channel Patient Engagement & Telemetry
1. **Navigate to**: `/portal/notifications`.
2. **Review Alerts**: Inspect real-time push notices for appointment tokens, dispensed medications, verified diagnostic scan uploads, and billing receipts.
3. **Patient Demo Switcher**: Click **Switch Patient (10 Demos)** in the bottom sidebar. Seamlessly transition between 10 clinical profiles with unique chronic histories and vitals trends.

