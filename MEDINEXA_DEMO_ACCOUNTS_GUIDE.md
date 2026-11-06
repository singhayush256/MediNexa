# MEDINEXA — HACKATHON DEMO PERSONAS & ACCOUNTS DIRECTORY

**Purpose:** Comprehensive guide for evaluators, judges, and developers to access and demonstrate all 11 role-based portals in the MediNexa Connected Healthcare Ecosystem.  
**Standard Demo Password for All Accounts:** `Password123!`  
**Platform Base URL:** https://medinexa-duplicate.vercel.app  
**Backend Gateway:** https://medinexa-duplicate-api.onrender.com  

---

## 1. COMPLETE ROLE-BASED DEMO ACCOUNTS DIRECTORY

| # | Role Persona | Email Address | Password | Role Code | Facility Scope | Primary Portal URL | Key Capabilities to Test |
| :-: | :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **1** | **Super Admin** | `admin@medinexa.in` | `Password123!` | `MEDINEXA_ADMIN` | Global Network | `/dashboard/super-admin` | Platform metrics, hospital tenant toggle status (`ACTIVE`/`SUSPENDED`), soft-decommissioning, compliance audit logs. |
| **2** | **Hospital Admin (Delhi)** | `admin.delhi@medinexa.in` | `Password123!` | `HOSPITAL_ADMIN` | Delhi Super Speciality | `/dashboard/admin` | Facility departments, doctor rosters, staff invitations, ward management, hospital revenue overview. |
| **3** | **Hospital Admin (Mumbai)**| `admin.mumbai@medinexa.in` | `Password123!` | `HOSPITAL_ADMIN` | Mumbai Multi-Care | `/dashboard/admin` | Cross-tenant isolation verification (cannot view Delhi patient data). |
| **4** | **Hospital Admin (BLR)** | `admin.blr@medinexa.in` | `Password123!` | `HOSPITAL_ADMIN` | Bengaluru Tech-Health | `/dashboard/admin` | Multi-branch facility operations and regional analytics. |
| **5** | **Attending Doctor** | `dr.deshmukh@medinexa.in` | `Password123!` | `DOCTOR` | Delhi - Cardiology | `/dashboard/clinical` | OPD appointment queue, patient vitals review, ICD-10 diagnosis, e-prescription generation, lab test ordering. |
| **6** | **Senior Nurse** | `nurse.01@medinexa.in` | `Password123!` | `NURSE` | Delhi - Inpatient | `/dashboard/nursing` | Inpatient bed overview, vitals chart recording, scheduled medication administration, nurse round notes. |
| **7** | **Ward Manager** | `receptionist.01@medinexa.in` | `Password123!` | `RECEPTIONIST` | Delhi - Front Desk | `/dashboard/hospital/beds` | Bed availability tracking, patient check-ins, admission requests, bed cleaning status restoration. |
| **8** | **Chief Pharmacist** | `pharmacy.01@medinexa.in` | `Password123!` | `PHARMACY_STAFF` | Delhi - Central Pharmacy | `/dashboard/pharmacy` | Drug formulary (`/medications`), FIFO batch management, e-prescription dispensing, stock reorder alerts. |
| **9** | **Pathologist / Lab Tech** | `lab.01@medinexa.in` | `Password123!` | `LAB_STAFF` | Delhi - Pathology Lab | `/dashboard/laboratory` | Diagnostic test queue, specimen barcode scanning, result input (CBC/LFT/KFT), pathologist verification. |
| **10**| **Ambulance Driver** | `receptionist.02@medinexa.in` | `Password123!` | `AMBULANCE_DRIVER` | Delhi - Trauma Bay | `/dashboard/emergency-ambulance` | Emergency SOS triage, ambulance vehicle dispatch, driver route navigation, ER trauma handover. |
| **11**| **Primary Patient** | `patient@medinexa.in` | `Password123!` | `PATIENT` | Self / UHID | `/portal` | Universal Health ID (UHID), appointment booking, e-prescriptions, lab reports, simulated co-pay billing. |

---

## 2. SECONDARY PATIENT PERSONAS (FOR MULTI-PATIENT SCENARIOS)

| Patient Name | Email Address | UHID | Clinical Context |
| :--- | :--- | :---: | :--- |
| **Arjun Nair** | `patient@medinexa.in` | `MDNX-2026-9041` | Primary OPD Cardiology Consultation, Hypertension, Telma 40 e-prescription. |
| **Priya Patel** | `patient.02@medinexa.in` | `MDNX-2026-9042` | Diagnostic Lab Investigation (Lipid Panel, HbA1c). |
| **Rajesh Verma** | `patient.03@medinexa.in` | `MDNX-2026-9043` | Inpatient Ward Bed Admission (DEL-ICU-01). |
| **Sneha Kulkarni** | `patient.04@medinexa.in` | `MDNX-2026-9044` | Outpatient Pharmacy Formulary Dispense (Dolo 650, Augmentin). |
| **Ananya Iyer** | `patient.05@medinexa.in` | `MDNX-2026-9045` | Emergency Trauma Care & SOS Ambulance Dispatch. |

---

## 3. SECURITY & PRIVACY CONTROLS IN DEMO ACCOUNTS

1. **Zero Real Personal Identifiable Information (PII):**  
   All phone numbers (`+91 98...`), addresses, and names are synthetically generated for demonstration compliance with HIPAA, GDPR, and Indian Digital Personal Data Protection (DPDP) Act standards.
2. **Deterministic Cryptographic Hashing:**  
   Every demo account password is pre-hashed using standard **bcrypt** (`10` salt rounds).
3. **Anti-IDOR Enforcement across Demo Personas:**  
   - If `patient@medinexa.in` attempts to fetch records belonging to `patient.02@medinexa.in`, the backend strictly returns `403 Forbidden`.
   - If `admin.mumbai@medinexa.in` attempts to inspect Delhi hospital wards or beds, `HospitalTenantGuard` blocks the request.
4. **Token Isolation:**  
   Each persona session receives a cryptographically signed JWT token specifying `userId`, `role`, and `facilityId`. Roles cannot be forged on the client.

