# MediNexa Hospital Administrator Operations Guide

**Role:** Hospital Administrator / Medical Superintendent  
**Access Portal:** MediNexa Hospital Workspace Console  
**Target Audience:** Healthcare facility executives, IT administrators, and operations heads.

---

## 1. Introduction & Administrative Responsibilities

As a MediNexa Hospital Administrator, you are responsible for the digital governance of your healthcare facility. Your role encompasses organization settings, branch physical infrastructure, medical and administrative staff provisioning, billing rules, and support escalation.

> [!NOTE]
> **Privacy Guardrail:** In compliance with Indian DPDP Act 2023 and medical confidentiality ethics, Hospital Administrator accounts have full control over organizational infrastructure and business operations, but are **restricted from reading private psychiatric, clinical, or diagnostic notes** entered by physicians during patient consultations.

---

## 2. Organization Profile & Facility Settings

Navigate to **Hospital Settings** (`/settings` or `/organization/settings`):

1. **Hospital Legal Identity:**
   - **Legal Name:** Official registered business name (e.g., `City Life Superspeciality Hospital Pvt. Ltd.`).
   - **Trade Name / Brand Name:** Display name shown on patient receipts and portal.
   - **Establishment License:** Record state health department registration number.
2. **Financial & Tax Configuration:**
   - **GSTIN:** Official Goods and Services Tax Identification Number (15 digits).
   - **Invoice Prefix:** 3 to 6 character financial prefix for all receipts (e.g., `CLH-2026-`).
   - **Currency & Timezone:** Default to `INR (₹)` and `Asia/Kolkata (IST)`.
3. **Clinical Operational Defaults:**
   - **Default Consultation Fee:** Standard general OPD fee (e.g., `₹500`).
   - **Follow-up Validity Period:** Free or discounted revisit window (e.g., `7 days`).

---

## 3. Branch & Infrastructure Management

Configure your physical hospital layout before onboarding clinical staff:

### Departments
Navigate to **Departments** to add clinical and non-clinical specialties:
- General Medicine, Cardiology, Orthopedics, Pediatrics, Obstetrics & Gynecology, General Surgery, Emergency, ENT, Dermatology, Psychiatry.

### Inpatient Wards & Beds
Navigate to **Beds & Wards** to configure inpatient inventory:
- **Ward Types:** General Ward (Male / Female), Semi-Private, Private Deluxe, Intensive Care Unit (ICU), Post-Operative Recovery.
- **Bed Numbering:** Assign unique identifiers (e.g., `GEN-W-01` to `GEN-W-30`, `ICU-01` to `ICU-10`).
- **Bed Amenities & Tariffs:** Associate daily room charges and oxygen/ventilator capabilities.

---

## 4. Staff Invitations & Role Provisioning

Never create generic shared accounts (e.g., `reception@hospital.com`). Every hospital employee must possess a personalized account.

### How to Invite Staff Members
1. Go to **Staff Directory** → Click **Invite Staff Member** (`POST /api/v1/organization/invitations`).
2. Enter the employee's details:
   - Full Name
   - Professional Email Address
   - Mobile Phone Number
   - Department Assignment
   - System Role (select from dropdown):
     - **Doctor:** Clinical consultations, prescriptions, lab orders.
     - **Nurse:** Inpatient admissions, vitals, doctor rounds.
     - **Receptionist:** Front-desk registration, appointment booking, queue token issuance.
     - **Pharmacist:** Prescription verification, dispensary, drug inventory.
     - **Laboratory Technician:** Specimen collection, barcode scanning, test result entry.
     - **Billing Executive:** Invoicing, insurance desk, discharge billing.
3. Click **Send Secure Invitation**.
4. The system generates a single-use, 64-character CSPRNG security token valid for 7 days.
5. The employee clicks the invitation link, creates a password meeting enterprise complexity requirements, and activates their profile.

---

## 5. Pilot Readiness Score & Health Check

Navigate to the **Pilot Readiness Dashboard** (`/organization/pilot-readiness`):

MediNexa evaluates your facility across 6 core operational parameters to calculate your readiness score:
- **Organization Identity Complete (20 pts):** Verified GSTIN, address, and license.
- **Physical Infrastructure Ready (20 pts):** At least 2 departments and 5 active beds configured.
- **Core Clinical Staff Onboarded (20 pts):** At least 1 active Doctor and 1 active Nurse.
- **Operational Support Staff Ready (15 pts):** At least 1 Receptionist and 1 Pharmacist.
- **Tariff & Billing Configured (15 pts):** Active invoice prefix and consultation fees.
- **Emergency Contact Roster (10 pts):** 24x7 phone number and escalation contact defined.

> [!IMPORTANT]
> A minimum score of **80%** is required before the platform permits live clinical patient check-ins.

---

## 6. Technical Support & Issue Escalation

When encountering hardware issues, software bugs, or billing inquiries:

1. Click **Support & Help** in the left navigation menu.
2. Select **Create Support Ticket** (`POST /api/v1/support/tickets`).
3. Choose the appropriate Category:
   - `TECHNICAL_BUG`: Software errors, page crashes, or data sync issues.
   - `CLINICAL_WORKFLOW`: OPD queue or prescription formatting questions.
   - `BILLING_FINANCE`: Invoice reconciliation, GST calculation discrepancies.
   - `HARDWARE_INTEGRATION`: Barcode scanner, thermal receipt printer issues.
   - `ONBOARDING_TRAINING`: Staff onboarding assistance.
4. Set Priority: `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL_EMERGENCY`.
5. MediNexa's central engineering team investigates using the ticket conversation thread.
