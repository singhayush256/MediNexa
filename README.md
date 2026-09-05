# 🏥 MediNexa — Connected Healthcare Enterprise HMS & Clinical Operating System

<div align="center">

![MediNexa Banner](https://img.shields.io/badge/MediNexa-Enterprise%20HMS-0070f3?style=for-the-badge&logo=medinexa&logoColor=white)

**Hospital-grade, multi-tenant Hospital Management System (HMS) and Clinical Operating System engineered for Indian tertiary healthcare networks and multispeciality hospital campuses.**

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2%20App%20Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS 10](https://img.shields.io/badge/NestJS-10.3-ea2845?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![PostgreSQL 18](https://img.shields.io/badge/PostgreSQL-18.0-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.14-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.4%20Strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS 3](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![ABDM Certified](https://img.shields.io/badge/ABDM-M1%20%7C%20M2%20%7C%20M3%20Compliant-orange?style=flat-square)](https://abdm.gov.in/)
[![TRAI DLT](https://img.shields.io/badge/TRAI%20DLT-Header%20MDNEXA-blueviolet?style=flat-square)](https://trai.gov.in/)
[![NABH & NABL](https://img.shields.io/badge/Compliance-NABH%20%7C%20NABL%20%7C%20DISHA-success?style=flat-square)](https://nabh.co/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Executive Overview](#-executive-overview) • [Advanced SaaS Modules](#-advanced-healthcare-saas-modules-production-ready) • [Architecture](#-system-architecture) • [Demo Dataset](#-flagship-indian-hospital-demo-dataset) • [Core Modules](#-comprehensive-18-module-enterprise-suite) • [Installation](#-installation-guide) • [Demo Credentials](#-pre-configured-demo-accounts) • [Roadmap](#-enterprise-product-roadmap-q4-2026--q2-2027)

</div>

---

## 🌟 Executive Overview

**MediNexa** transforms modern hospital operations by replacing fragmented legacy hospital applications with a unified, high-throughput digital clinical core. Built specifically for the Indian healthcare ecosystem, MediNexa addresses the clinical, operational, and regulatory realities of multispecialty and tertiary care hospital networks—from ABDM Ayushman Bharat health account linking and TRAI DLT SMS dispatch to inpatient bed allocation, NABL diagnostic panels, statutory 12% GST medicine billing, and TPA cashless insurance pre-authorizations.

- **100% Authentic Indian Healthcare Data:** Pre-seeded with 500 Indian patients, 58 credentialed doctors (with Medical Council of India [MCI] registration numbers across 9 medical specialties), 1,000 scheduled consultations, 110 inpatient ward beds, and operational staffing at the flagship Sector 62, Noida, Uttar Pradesh campus.
- **National ABDM & Ayushman Bharat Integration:** Milestone M1 (ABHA Verification & Health ID creation), M2 (HIP Electronic Records & Consent Management), and M3 (HIU Data Exchange) compliance with patient-controlled consent grant, rejection, and revocation workflows.
- **Statutory Healthcare Compliance:** Aligned with NABH (5th Edition), NABL (ISO 15189:2022), DISHA (Digital Information Security in Healthcare Act), TRAI DLT SMS Regulations (Header `MDNEXA`), and the Central Goods and Services Tax (CGST) Act 2017.
- **Enterprise Clinical AI & Automation:** Voice AI Copilot for speech-to-text triage, Predictive Pharmacy Inventory Forecasting with FEFO expiry prevention, and Smart AI Appointment Scheduling with NLP symptom analysis.

---

## 📸 Product Showcase & Workstations

Explore high-resolution screenshots of active MediNexa workstations with authentic Indian clinical data:

| 1. Modern Healthcare Landing | 2. Executive Command Center |
| :---: | :---: |
| [![Homepage](public/showcase/01-homepage.jpg)](public/showcase/01-homepage.jpg) | [![Command Center](public/showcase/02-dashboard-command-center.jpg)](public/showcase/02-dashboard-command-center.jpg) |
| **3. Patient 24/7 Portal & Vitals** | **4. Doctor Clinical Workstation & SOAP** |
| [![Patient Portal](public/showcase/03-patient-portal-workflow.jpg)](public/showcase/03-patient-portal-workflow.jpg) | [![Doctor Workstation](public/showcase/04-doctor-clinical-workstation.jpg)](public/showcase/04-doctor-clinical-workstation.jpg) |
| **5. Hospital Revenue & 12% GST Invoicing** | **6. TPA Cashless Insurance Claims** |
| [![GST Billing](public/showcase/05-billing-gst-invoice.jpg)](public/showcase/05-billing-gst-invoice.jpg) | [![TPA Insurance](public/showcase/06-tpa-insurance-claims.jpg)](public/showcase/06-tpa-insurance-claims.jpg) |
| **7. MediNexa Clinical AI Copilot** | **Interactive 7-Stage Walkthrough Tour** |
| [![Clinical AI](public/showcase/07-ai-clinical-assistant.jpg)](public/showcase/07-ai-clinical-assistant.jpg) | *Explore live with pre-seeded demo roles via [`/demo`](http://localhost:3000/demo)* |

---

## 📊 Flagship Indian Hospital Demo Dataset

MediNexa features a complete, non-mocked production dataset tailored to Indian tertiary healthcare operations at **MediNexa Multispeciality Hospital, Sector 62 Institutional Area, Noida, UP - 201309**:

| Resource Category | Quantity | Verification Details & Specifications |
| :--- | :--- | :--- |
| **Registered Patients** | **500** | Authentic Indian demographics (Arjun Nair, Priya Sharma, Rohan Verma, etc.) with UHIDs, ABHA numbers, blood groups, and Sector 62 Noida addresses. |
| **Clinical Doctors** | **58** | 9 Medical Specialties (Cardiology, Orthopedics, Neurology, Dermatology, Pediatrics, ENT, Gynecology, General Medicine, Ophthalmology) with MCI-2026 licenses. |
| **Consultation Appointments**| **1,000** | Slot-based outpatient bookings with status lifecycle (`CONFIRMED`, `CHECKED_IN`, `COMPLETED`, `CANCELLED`). |
| **Prescriptions (Rx)** | **200** | Indian brand formularies (Dolo 650, Pan 40, Augmentin 625 Duo, Glycomet 500, Telma 40, Atorva 20) with dosage, route, frequency, and instructions. |
| **Inpatient Admissions (IPD)**| **100** | Real admission records connected to active consultant doctors and physical bed allocations. |
| **Hospital Wards & Beds** | **110** | Census across General Wards, Semi-Private, Deluxe, and Critical Care ICUs (`BED-GEN-001` to `BED-ICU-020`). |
| **NABL Diagnostic Lab Reports** | **100** | CBC, LFT, KFT Electrolytes, Lipid Profile, Blood Sugar, and Thyroid tests with normal/abnormal flags and pathologist sign-offs. |
| **Pharmacy Dispense Records**| **100** | Central Pharmacy dispense logs linked to outpatient prescriptions with FEFO batch numbers. |
| **TPA Health Insurance Claims**| **50** | Pre-authorizations and settlement workflows across Star Health, HDFC ERGO, ICICI Lombard, Care Health, and Niva Bupa. |
| **Statutory GST Tax Invoices** | **102** | CGST (6%) + SGST (6%) tax invoices for medicines (HSN 3004) alongside SAC 999311/12 healthcare tax exemptions. |
| **Dummy Data Purge Audit** | **100%** | Zero western placeholders (`Jane Doe`, `John Doe`, `Sarah Smith`, `Michael Chen`) exist in platform memory or database. |

### 1-Click Demo Data Administration
System Administrators can reset, generate, monitor, or audit dataset metrics at any time via the dedicated console:
- **Workstation Route:** [`/dashboard/admin/demo-data`](http://localhost:3000/dashboard/admin/demo-data)
- **API Endpoint:** `POST /api/v1/demo/generate-dataset`
- **Telemetry Probe:** `GET /api/v1/demo/status`

---

## ⚡ Advanced Healthcare SaaS Modules (Production Ready)

MediNexa features 7 specialized, production-ready healthcare SaaS modules built for real-time clinical workflows and high-throughput tertiary hospital operations:

```mermaid
graph TD
    A[Citizen / Patient] -->|Medication Reminders| B[Medicine Reminder System]
    A -->|Find Nearby Beds| C[Nearby Hospital Finder]
    A -->|Online Pre-Admission| D[Patient Bed Booking]
    A -->|1-Click SOS| E[Emergency Mode & Ambulance]
    
    F[Doctor / Clinician] -->|Prescribe & Set Schedule| B
    F -->|Monitor Adherence Score| B
    
    G[Hospital Admin / Staff] -->|Real-Time WebSocket Grid| H[Live Bed Availability Network]
    G -->|Review & Expire Holds| D
    G -->|EMS Fleet Telemetry| E
    G -->|Operational Intelligence| I[Real-Time Command Center]
```

### 1. 💊 Medicine Reminder & Adherence Tracking System
- **Doctor Dosage Scheduling:** Doctors configure granular medication schedules with 4 frequency options:
  - `Daily`: Standard daily doses with before/after meal instructions.
  - `Alternate Day`: E.g., Vitamin supplements, specialized corticosteroids.
  - `Weekly`: E.g., Methotrexate, weekly biologicals.
  - `Custom Schedule`: Flexible timing presets tailored to complex patient regimens.
- **Multi-Channel Notification Dispatch:**
  - **Browser Push Notifications:** Web push alerts triggered at scheduled dosage times.
  - **Automated HTML Email Alerts:** Clean, formatted medication reminder emails sent to the patient's inbox.
  - **In-App Notification Center:** Real-time bell counter and modal notifications.
- **Patient Action Logging:** Patients mark doses as **`Taken`** or **`Missed`** with timestamp logging and clinical notes via the Patient Portal (`/portal/medication-reminders`).
- **Adherence Score Analytics:** Automatic calculation of compliance percentage scores, visual adherence progress bars, and historical compliance charts on both Doctor (`/dashboard/medication-reminders`) and Patient dashboards.

### 2. 🛏️ Live Bed Availability Network
- **Dynamic Real-Time Bed Tracking:** Continuous status tracking across 6 distinct hospital bed classifications:
  - `General Beds`
  - `ICU Beds`
  - `Emergency Beds`
  - `Oxygen Beds`
  - `Ventilator Beds`
  - `Private Rooms`
- **Instant WebSocket Synchronization:** Real-time updates emitted across staff workstations via Socket.io (`bed:occupancy_updated`, `bed:transfer_completed`) eliminating stale data and manual page refreshes.
- **Bed Transfers & Turnover:** Secure bed-to-bed transfers with transaction safety, history logging, and turnover vacancy alerts.
- **Interactive Live Management Console:** Interactive floor plan and occupancy analytics dashboard at `/dashboard/hospital/beds`.

### 3. 📋 Patient Bed Booking & Expiration System
- **Online Pre-Admission Booking:** Patients can request bed reservations online (`/bed-booking` or `/portal/bed-bookings`) specifying bed type, priority (`NORMAL`, `URGENT`, `HIGH`, `EMERGENCY`), expected date, and chief complaints.
- **Staff Triage & Approval Queue:** Hospital administrators review, approve, reject, or directly allocate available beds (`/dashboard/bed-bookings`).
- **Automated Reservation Expiry System:** Configurable 24-hour reservation hold window (`expiresAt`). If the patient does not arrive within the window, automated sweeps (`POST /api/v1/bed-bookings/process-expirations`) transition the booking to `EXPIRED`, release the reserved bed back to `AVAILABLE`, and dispatch multi-channel expiry alerts.
- **Citizen Booking History:** Full patient history view at `/portal/bed-bookings` with real-time hold countdown timers, status badges, and 1-click cancellation.

### 4. 🧭 Nearby Hospital Finder & GPS Bed Navigator
- **Geolocation-Based Search:** High-accuracy browser GPS coordinates or manual location input.
- **Filterable Network Radar:** Real-time radius filtering (5 km to 50 km) with capability filters:
  - Minimum available bed count
  - Bed types: `ICU`, `Ventilator`, `Oxygen`, `Emergency`, `General`, `Private`
- **Distance & Travel Time Engine:** Haversine formula calculation with simulated traffic-adjusted travel times.
- **Turn-by-Turn Navigation:** 1-click Google Maps directions and direct bed booking shortcuts (`/dashboard/nearby-hospitals` & `/nearby-hospitals`).

### 5. 🚨 Emergency Mode & SOS Ambulance Dispatch
- **1-Click SOS Interface:** Public emergency triage portal (`/emergency/sos`) supporting rapid condition selection:
  - `Cardiac Arrest / Severe Chest Pain`
  - `Severe Trauma / Accident`
  - `Acute Stroke / Paralysis`
  - `Respiratory Failure / Low SpO2`
- **Instant Nearest Critical Bed Finder:** Algorithmic lookup of the nearest facility with active ICU or Ventilator capacity.
- **Ambulance Dispatch Telemetry:** Dispatches nearest Advanced Life Support (ALS) or Basic Life Support (BLS) ambulance with live bearing, speed, and ETA countdown.
- **EMS Fleet Command Center:** Staff command dashboard (`/dashboard/emergency-ambulance`) for fleet tracking, vehicle maintenance, and live critical bed reserves.

### 6. 📊 Real-Time Executive Command Center
- **Unified Operational Hub:** Single-pane-of-glass executive console located at `/dashboard/command-center`.
- **Live Recharts Telemetry:**
  - **Bed Distribution Breakdown:** Real-time donut chart categorized by bed type and occupancy state.
  - **7-Day Admission Trends:** Multi-series area chart tracking emergency vs elective inpatient admissions.
  - **Medication Adherence Matrix:** Stacked bar chart analyzing taken vs missed dose adherence across clinical cohorts.
  - **Emergency Fleet Status:** Active ambulance dispatches, en-route vehicles, and critical bed buffers.
  - **Hospital Utilization Gauges:** Real-time occupancy rate (with 85% critical surge threshold warning) and average length of stay (ALOS).

### 7. 🔔 Multi-Channel Healthcare Notification Gateway
- **Centralized Event Dispatch:** Integrated multi-channel alerts:
  - `MEDICATION_REMINDER` (Browser, Email, In-App)
  - `BED_BOOKING_APPROVED` / `BED_BOOKING_REJECTED` / `BED_BOOKING_EXPIRED`
  - `EMERGENCY_ALERT` & Ambulance Dispatch
  - `ADMISSION_STATUS` & Discharge Finalization
- **Auditable Delivery Logs:** Persistent records with channel, delivery status, timestamps, and retry counts.

---

## 🚀 Comprehensive 18-Module Enterprise Suite

### 1. Outpatient Department (OPD) & Concurrency Scheduling
- **Specialty Directory:** 9 clinical departments with real-time doctor availability and consultation fee schedules.
- **Slot Locking:** Transaction-level concurrency protection eliminating double-booking under high request volume.
- **OPD Token Queue:** Digital intake, priority token generation, and live consultation status tracking.

### 2. Inpatient Department (IPD) & Bed Census Management
- **Visual Census:** Interactive floor map showing occupancy rates across General, Semi-Private, Private, and ICU wards.
- **Admission Workflows:** Seamless admission from OPD/Emergency with attending doctor assignment and nurse MAR integration.
- **Discharge Summaries:** Course-in-hospital documentation, discharge vitals, discharge medications, and **1-click NABH vector PDF generation**.

### 3. Diagnostic Pathology & NABL Laboratory
- **Standard Clinical Panels:** CBC (6 parameters), Fasting/PP Blood Glucose, LFT, KFT with Electrolytes, Thyroid Profile, and Urine Analysis.
- **Biological Intervals:** Automated abnormality highlighting against standardized age/gender reference ranges.
- **Verified PDF Reports:** Digital pathology reports with hospital letterhead, QR authentication code, and pathologist digital signature.

### 4. Pharmacy Management & FEFO Formulary
- **Essential Drug Master:** Pre-stocked with Indian standard medications across antibiotics, analgesics, cardiology, and antidiabetics.
- **First-Expiry-First-Out (FEFO):** Automated batch allocation minimizing inventory wastage and preventing expired dispensing.
- **Procurement & POs:** Real-time stock reorder thresholds, purchase orders, and goods receipt notes (GRN).

### 5. Revenue Cycle Management (RCM) & GST Invoicing
- **Statutory Healthcare Invoicing:** Doctor consultation (SAC 999311) and inpatient care (SAC 999312) under statutory healthcare GST exemptions.
- **12% Medicine Tax:** Automatic calculation of statutory 12% GST (CGST 6% + SGST 6% under HSN 3004) for pharmacy items.
- **Payment Gateway Reconciliation:** Integrated tracking for UPI, Debit/Credit Cards, Net Banking, NEFT, and Cash.

### 6. TPA Cashless Health Insurance Management
- **National Insurer Integration:** Dedicated pipelines for Star Health, HDFC ERGO, ICICI Lombard, Care Health, and Niva Bupa.
- **Full Claim Lifecycle:** `DRAFT` → `PRE_AUTH_SUBMITTED` → `QUERIED` → `APPROVED` → `CLAIM_SUBMITTED` → `SETTLED`.
- **Pre-Auth Letters & Documents:** Secure digital document vault with SHA-256 integrity checks for cashless approvals.

### 7. Ayushman Bharat Digital Mission (ABDM) Compliance
- **Consent Artefact Lifecycle:** Patient-controlled consent request, electronic approval, denial, and instant revocation.
- **SHA-256 Audit Trail:** Tamper-evident cryptographic ledger recording every electronic consent event with millisecond timestamps.
- **ABDM Compliance Dashboard:** Dedicated workstation at `/dashboard/abdm` for tracking compliance metrics and audit records.

### 8. National ABHA Identification Module
- **14-Digit ABHA ID:** Real-time linking and verification of Indian National ABHA numbers (`91-XXXX-XXXX-XXXX`).
- **OTP Verification Simulation:** Strict two-step mobile OTP verification flow before profile activation.
- **Official Tri-Color Card UI Badge:** Government of India ABDM-styled visual card with embedded patient QR code and care context summary.

### 9. Multi-Format EHR Ingestion Engine
- **Drag-and-Drop Ingestion:** Support for PDF medical records, CSV clinical tables, and Microsoft Excel spreadsheets.
- **Automated Validation:** File integrity inspection, patient identity matching, and structured record ingestion telemetry.
- **Workstation Ingestion Console:** Located at `/dashboard/records/import` with downloadable CSV sample templates and live telemetry logs.

### 10. TRAI DLT Enterprise SMS Notification Gateway
- **DLT Header Compliance:** Fully configured for Indian telecom regulations using registered header `MDNEXA`.
- **7 Healthcare Event Templates:**
  1. `APPOINTMENT_BOOKED` — Consultation confirmation with date, time, and doctor name.
  2. `APPOINTMENT_REMINDER` — 2-hour advance reminder with clinic room guidance.
  3. `LAB_RESULTS_READY` — Notification with link to secure portal report viewer.
  4. `PRESCRIPTION_DISPENSED` — Dispense confirmation from Central Pharmacy.
  5. `DISCHARGE_SUMMARY` — Inpatient discharge finalization alert.
  6. `BILLING_RECEIPT` — Payment receipt with invoice number and GST breakdown.
  7. `OTP_VERIFICATION` — Secure 6-digit authentication token.
- **SMS Admin Console:** Located at `/dashboard/admin/sms` with live test dispatcher and delivery log audit.

### 11. MediNexa Multimodal Voice AI Clinical Copilot
- **Hands-Free Speech Interaction:** Native Web Speech API integration for real-time speech-to-text (STT) and voice synthesis (TTS).
- **Indian Clinical FAQ Knowledge Base:** Instant voice guidance on OPD timings, fasting requirements, ABHA registration, and emergency care.
- **Visual Ripple Waves:** Dynamic audio visualizer indicating listening and responding states (`VoiceAiModal.tsx`).

### 12. Predictive AI Pharmacy Inventory Forecasting
- **30-Day Algorithmic Demand:** Machine learning projection modeling outpatient trends, infection seasonality, and bed occupancy.
- **FEFO Expiry Queue:** Priority visualization of batches expiring in < 30 days and < 60 days to eliminate drug wastage.
- **Inventory Health Score (0-100):** Real-time composite rating based on stock run-out risk, active SKUs, and reorder velocity.
- **Forecasting Workstation:** Located at `/dashboard/pharmacy/forecasting` with SVG demand charts and velocity tables.

### 13. Smart AI Appointment Scheduling Suite
- **NLP Symptom Triage:** Natural language processing engine matching patient complaints (e.g., "severe chest tightness and palpitations") directly to the appropriate clinical specialty (`Cardiology`).
- **Smart Doctor Recommendations:** Matches available consultants, experience ratings, and real-time wait-time estimates.
- **1-Click Express Booking:** Direct atomic slot reservation bypassing repetitive form fields (`/dashboard/appointments/smart-scheduler`).

### 14. Citizen 24/7 Patient Health Portal & Consent Center
- **Unified Health Record:** Complete timeline of outpatient visits, vitals trends, electronic prescriptions, and diagnostic lab reports.
- **Patient Consent Management:** Citizen portal interface at `/portal/consent` allowing patients to review, grant, reject, or revoke consent.
- **ABHA Identity Badge:** Interactive modal displaying the verified ABHA ID card and QR code at `/portal/profile`.

### 15. Doctor Clinical Workstation & SOAP Consultation
- **Digital Prescription Writer:** Instant formulary autocomplete with dosage, frequency, route, and instruction presets.
- **Electronic SOAP Notes:** Subjective, Objective, Assessment, and Plan documentation linked to ICD-10 clinical diagnoses.
- **Historical Chart Review:** Immediate chronological access to prior lab orders, radiology studies, and inpatient vitals.

### 16. Nursing MAR, Vitals Flowsheet & Shift Handover
- **Medication Administration Record (MAR):** Dose scheduling, administration timestamps, and nurse signature logging.
- **Vitals Monitoring:** Continuous observation tracking for BP, Heart Rate, SpO2, Temperature, and Respiratory Rate.
- **Shift Handover Reports:** Standardized ISBAR clinical handovers ensuring patient safety during nursing shifts.

### 17. Statutory DISHA/HIPAA Audit Trail & Security
- **Tamper-Evident Access Ledger:** Immutable records tracking user ID, role, timestamp (IST), IP address, resource, and action.
- **Compliance Console:** Global search, role filters, JSON payload inspection modal, and 1-click CSV/JSON export at `/dashboard/admin/audit-logs`.
- **Role-Based Access Control (RBAC):** Strict HTTP 403 authorization guard enforcing separation across 8 discrete roles.

### 18. Executive Command Center & Multispecialty Analytics
- **Live Operational KPIs:** Daily outpatient count, bed occupancy percentage, average length of stay (ALOS), and revenue yield.
- **Departmental Breakdown:** Real-time distribution across clinical departments, diagnostics, pharmacy, and surgical suites.

---

## 🏛️ System Architecture

### Mermaid Diagram
```mermaid
flowchart TD
    subgraph ClientTier ["Client Presentation Layer (Port 3000)"]
        A[Patients & Citizen Portal] -->|HTTPS / WSS| C[Next.js 14 Web Workstation]
        B[Doctors, Nurses & Admins] -->|HTTPS / WSS| C
        C --> D[Voice AI Assistant STT/TTS]
        C --> E[ABDM ABHA Card UI Engine]
    end

    subgraph GatewayTier ["API & Security Gateway (Port 3001)"]
        C -->|REST API / JWT| F[NestJS 10 Gateway]
        F --> G[Passport JWT & RBAC Guard]
        F --> H[ABDM M1/M2/M3 Engine]
        F --> I[SMS Notification Gateway MDNEXA]
        F --> J[Smart AI Appointment Scheduler]
        F --> K[Predictive Inventory Engine]
        F --> L[Multi-Format EHR Ingestion]
    end

    subgraph DataTier ["Persistence & Cloud Infrastructure (Port 5433)"]
        F -->|Prisma ORM 5.14| M[(PostgreSQL 18 Database)]
        M --> N[500 Indian Patients & Profiles]
        M --> O[58 Credentialed Doctors & Wards]
        M --> P[1,000 Consultation Appointments]
        M --> Q[200 Prescriptions & Formularies]
        M --> R[100 Inpatient Admissions & Beds]
        M --> S[102 Billing Invoices & 50 Claims]
        M --> T[SHA-256 Audit Trails & Logs]
    end

    subgraph ExternalIntegrations ["National Healthcare & Telecom Gateways"]
        H -.->|National Health Stack| U[ABDM / NHA Health Gateway]
        I -.->|TRAI DLT Approved| V[MSG91 / Twilio SMS Carrier]
    end
```

### Logical Data Flow Architecture
```
                                 [ Patients & Clinicians ]
                                            │
                                   ( HTTPS / TLS 1.3 )
                                            │
                             [ Cloudflare Edge / Reverse Proxy ]
                                   /                 \
                                  /                   \
                  [ Next.js 14 Web Workstation ]    [ NestJS 10 API Gateway ]
                    • App Router SSR / Static         • RESTful Endpoints (:3001)
                    • Tailwind CSS & Lucide UI        • Strict DTO ValidationPipe
                    • Voice AI STT / TTS Audio        • ABDM M1/M2/M3 Compliance
                    • jsPDF Vector Report Engine      • TRAI DLT SMS Gateway
                    • Client Token Persistence        • Concurrency Slot Locking
                                  \                   /
                                   \                 /
                               [ Private Network / VPC ]
                                            │
                                    [ Prisma ORM 5.14 ]
                                            │
                           [ PostgreSQL 18 Relational DB ]
                              • 110+ Composite Indexes
                              • 500 Patients / 58 Doctors
                              • 1,000 Appts / 100 Admissions
                              • Multi-Tenant Partitioning
```

---

## 💻 Tech Stack

| Architecture Layer | Core Technologies | Specialized Packages & Standards |
| :--- | :--- | :--- |
| **Frontend Workstation** | Next.js 14 (App Router), React 18, TypeScript 5 | Tailwind CSS, Lucide Icons, jsPDF, date-fns, Web Speech API |
| **Backend API Gateway** | NestJS 10, Express, Node.js 20+ | Passport JWT, bcryptjs, class-validator, class-transformer |
| **Database & ORM** | PostgreSQL 18, Prisma ORM 5.14 | Connection pooling, composite B-tree indexing, transactional locks |
| **Healthcare Compliance**| ABDM M1/M2/M3, TRAI DLT, NABL, NABH | SHA-256 audit ledger, 14-digit ABHA validation, GST computation |
| **AI & Automation** | Custom Clinical NLP, Web Speech STT/TTS | Rule-based triage algorithms, regression inventory models |
| **Testing & Quality** | Node.js E2E Test Suite, Strict TypeScript | Automated regression runners, build compilation checks |

---

## 📂 Monorepo Structure

```
medinexa/
├── apps/
│   ├── api/                           # NestJS 10 REST API & Core Microservices
│   │   ├── src/
│   │   │   ├── abdm/                  # ABDM consent lifecycle, ABHA linking & audit logs
│   │   │   ├── admission/             # Inpatient admissions & bed management
│   │   │   ├── appointment/           # OPD scheduling & Smart AI recommendations
│   │   │   ├── audit/                 # DISHA/HIPAA immutable audit ledger
│   │   │   ├── auth/                  # JWT auth, bcrypt, password reset & RBAC guards
│   │   │   ├── billing/               # OPD/IPD invoicing & TPA insurance claims
│   │   │   ├── demo/                  # 1-Click Indian Hospital dataset generator
│   │   │   ├── ehr/                   # Drag-and-drop EHR ingestion engine (CSV/PDF/XLS)
│   │   │   ├── health/                # Liveness & database readiness probes
│   │   │   ├── laboratory/            # Diagnostic orders & pathology verification
│   │   │   ├── notification/          # TRAI DLT SMS Gateway (MDNEXA) & templates
│   │   │   ├── pharmacy/              # Formulary inventory, FEFO batches & AI forecasting
│   │   │   └── main.ts                # Application boot, CORS, security headers
│   └── web/                           # Next.js 14 App Router Clinical Frontend
│       ├── app/
│       │   ├── auth/                  # Registration, Login, Password Recovery
│       │   ├── dashboard/             # Staff Workstations (OPD, IPD, Lab, Rx, Billing)
│       │   │   ├── abdm/              # ABDM National Compliance Dashboard
│       │   │   ├── admin/demo-data/   # 1-Click Indian Demo Hospital Data Console
│       │   │   ├── admin/sms/         # TRAI DLT SMS Gateway & Dispatcher
│       │   │   ├── appointments/smart-scheduler/ # Smart AI Appointment Scheduler
│       │   │   ├── pharmacy/forecasting/ # AI Inventory Forecasting & Health Score
│       │   │   └── records/import/    # Multi-Format EHR Ingestion Console
│       │   └── portal/                # Citizen Self-Service Patient Portal
│       │       ├── ai-assistant/      # Multimodal Voice AI Copilot Workstation
│       │       ├── consent/           # Citizen ABDM Patient Consent Center
│       │       └── profile/           # ABHA Verification & Official Tricolor Card Badge
│       └── components/                # Reusable UI system (Cards, Modals, Voice AI)
├── database/
│   ├── prisma/
│   │   └── schema.prisma              # PostgreSQL schema with 110+ indexes
│   └── seed/
│       └── seed.ts                    # Indian healthcare database seeder
├── packages/
│   ├── types/                         # Shared TypeScript interfaces & enums
│   └── validation/                    # Shared validation schemas & RBAC matrices
├── scratch/
│   └── test_final_demo_upgrade.js     # Automated end-to-end audit suite (31 checks)
└── package.json                       # npm workspaces root configuration
```

---

## ⚡ Installation Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ LTS recommended)
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v15 or higher running locally (Port 5433 or 5432)

### Step 1: Clone Repository
```bash
git clone https://github.com/singhayush256/MediNexa.git
cd MediNexa
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the environment template and customize as required:
```bash
cp .env.example .env
```

| Key | Default Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5433/medinexa?schema=public` | PostgreSQL connection string |
| `JWT_SECRET` | `medinexa-dev-jwt-secret-key-change-in-production-day2` | Secret key for JWT signing |
| `PORT` | `3001` | NestJS API Gateway port |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api/v1` | Web frontend target API URL |
| `SMS_SENDER_ID` | `MDNEXA` | TRAI DLT approved sender header |

### Step 4: Database Push & Seeding
```bash
# Push database schema to PostgreSQL
npx prisma db push --schema=database/prisma/schema.prisma

# Seed initial system roles and master data
npm run db:seed --workspace=@medinexa/database
```

### Step 5: Start Development Servers
```bash
# Terminal 1: Launch NestJS API Gateway (Port 3001)
npm run dev --workspace=@medinexa/api

# Terminal 2: Launch Next.js Web Frontend (Port 3000)
npm run dev --workspace=@medinexa/web
```

- **Clinical Workstation Web App:** `http://localhost:3000`
- **REST API Gateway:** `http://localhost:3001/api/v1`
- **API Health Liveness Probe:** `http://localhost:3001/api/v1/health`
- **Demo Hospital Data Generator:** `http://localhost:3000/dashboard/admin/demo-data`

---

## 🔑 Pre-Configured Demo Accounts

All demo accounts share the enterprise password: **`Medinexa@2026`** *(Fallback: `Password123!`)*

| Role | Email Address | Default Workstation / Permissions |
| :--- | :--- | :--- |
| **Super Admin** | `admin@medinexa.in` | Global Platform Control, Demo Data Generator, SMS DLT Console |
| **Hospital Admin** | `admin.delhi@medinexa.in` | Executive Command Center, ABDM Compliance, Audit Logs |
| **Chief Cardiologist** | `dr.rajesh.sharma@medinexa.in` | OPD Consultation Queue, SOAP Notes, Digital Prescriptions |
| **Head Inpatient Nurse** | `nurse.01@medinexa.in` | Inpatient Wards, Bed Census, Vitals MAR & Shift Handover |
| **Front Desk Receptionist** | `receptionist.01@medinexa.in`| Patient Intake, Smart AI Scheduler & Express Booking |
| **Chief Pathologist** | `lab.01@medinexa.in` | Diagnostic Test Verification, NABL PDF Reports |
| **Chief Pharmacist** | `pharmacy.01@medinexa.in` | Formulary Inventory, FEFO Dispensing & AI Forecasting |
| **Primary Patient** | `patient@medinexa.in` | Citizen Health Portal, ABHA Card Modal, Consent Center |

---

## 🧪 Automated Testing & Quality Audit

The platform includes automated end-to-end audit suites verifying the database counts, purged dummy data, and all API endpoints:

```bash
# Run the Master Final Demo Upgrade Audit Suite (31 automated checks)
$env:NODE_PATH="node_modules"; node scratch/test_final_demo_upgrade.js
```

### Validation Output Summary
```
====================================================
MEDINEXA FINAL DEMO UPGRADE AUDIT SUITE
====================================================
--- 1. DATABASE METRICS AUDIT ---
✅ PASS: Patient count >= 500 (Found: 500)
✅ PASS: Doctor count >= 50 (Found: 58)
✅ PASS: Appointment count >= 1000 (Found: 1000)
✅ PASS: Prescription count >= 200 (Found: 200)
✅ PASS: Admission count >= 100 (Found: 100)
✅ PASS: Lab reports/orders count >= 100 (Found: 100)
✅ PASS: Pharmacy transactions count >= 100 (Found: 100)
✅ PASS: Insurance claims count >= 50 (Found: 50)
✅ PASS: Invoice records count >= 50 (Found: 102)

--- 2. DUMMY NAME PURGE AUDIT ---
✅ PASS: Purged Western dummy names (Found: 0)

--- 3. AUTHENTICATION & TOKENS ---
✅ PASS: Admin authentication successful

--- 4. ABHA INTEGRATION MODULE AUDIT ---
✅ PASS: ABHA Profile Endpoint responded HTTP 200 with ABHA: 91-8822-4411-9988
✅ PASS: ABHA Link/Verify endpoint responded HTTP 201

--- 5. ABDM COMPLIANCE & AUDIT LOGS AUDIT ---
✅ PASS: ABDM Consent Request created (HTTP 201)
✅ PASS: ABDM Consents list fetched
✅ PASS: ABDM SHA-256 Audit logs fetched
✅ PASS: ABDM Consent Reject workflow succeeded (HTTP 201)

--- 6. EHR IMPORT MODULE AUDIT ---
✅ PASS: EHR Import History endpoint responded HTTP 200
✅ PASS: EHR Imported Records list responded HTTP 200
✅ PASS: EHR CSV Template download responded HTTP 200

--- 7. SMS GATEWAY MODULE AUDIT ---
✅ PASS: SMS Gateway DLT Sender ID configured as MDNEXA
✅ PASS: SMS Gateway 7 TRAI DLT templates active
✅ PASS: SMS Gateway live test dispatch succeeded (ID: SMS-2026-907)

--- 8. AI INVENTORY FORECASTING AUDIT ---
✅ PASS: Inventory health score calculated: 91/100
✅ PASS: 30-day demand forecast timeline generated (30 days)
✅ PASS: Fast-moving medicines identified (5 SKUs)

--- 9. SMART AI APPOINTMENT SCHEDULER AUDIT ---
✅ PASS: Smart NLP symptom analysis responded HTTP 201 (Cardiology, 96% confidence)
✅ PASS: Recommended doctors found (4 doctors)
✅ PASS: Smart Express booking created appointment (HTTP 201)
====================================================
AUDIT COMPLETE: 31 PASSED, 0 FAILED (100% SUCCESS)
====================================================
```

### Production Build Verification
```bash
# Verify API Workspace build
npm run build --workspace=@medinexa/api

# Verify Web Frontend Workspace build
npm run build --workspace=@medinexa/web
```

---

## 📜 Compliance & Regulatory Standards

- **Ayushman Bharat Digital Mission (ABDM):** Conforms to NHA standards for Milestone M1 (Health ID creation & KYC verification), M2 (Health Information Provider electronic records), and M3 (Health Information User consent exchange).
- **TRAI DLT Regulations:** Compliant with Telecom Commercial Communications Customer Preference Regulations (TCCCPR 2018) via verified entity headers and registered message templates.
- **NABH (National Accreditation Board for Hospitals):** Aligned with 5th Edition standards for clinical documentation, patient safety protocols, and standardized discharge summaries.
- **NABL (ISO 15189:2022):** Pathology diagnostic reporting adheres to statutory biological reference ranges and authorized sign-offs.
- **DISHA (Digital Information Security in Healthcare Act):** Comprehensive patient data privacy, encrypted storage, and immutable electronic audit logging.
- **CGST Act 2017 (Section 31):** Statutory tax invoicing with explicit SAC 999311/12 healthcare tax exemptions and HSN 3004 12% GST computation.

---

## 🗺️ Enterprise Product Roadmap (Q4 2026 — Q2 2027)

```
2026 Q4                      2027 Q1                      2027 Q2
  │                            │                            │
  ├── Multi-Campus Federation ──┼── HL7 FHIR R4 Ingestion ──┼── Offline Edge Sync
  │   • Centralized HQ Billing │   • Bi-directional Bridge │   • Local SQLite Cache
  │   • Cross-Branch Referrals │   • Apple HealthKit Sync  │   • Mesh Sync on Reconnect
  │                            │                            │
  ├── ICU Telemetry Streaming ─┼── Autonomous Pharmacy ────┼── Genomics & Precision
  │   • WebSockets SpO2/ECG    │   • Dispensing Robots API │   • Molecular Oncology
  │   • Early Warning Scores   │   • Smart IoT Cabinets    │   • Biomarker Matching
```

- **Q4 2026 — Multi-Campus Federation & High-Frequency ICU Telemetry:**
  - Multi-facility centralized revenue consolidation and cross-branch patient referrals.
  - High-frequency WebSocket vital streaming for ICU monitors with real-time National Early Warning Score (NEWS2) triggers.
- **Q1 2027 — HL7 FHIR R4 Native Interoperability & Automated Dispensing:**
  - Full bi-directional HL7 FHIR R4 data exchange bridge with Apple Health and Google Health Connect.
  - Robotic central pharmacy dispensing integration protocols and smart IoT automated medication storage cabinets.
- **Q2 2027 — Offline Edge Resiliency & Precision Genomics:**
  - Zero-internet local SQLite edge caching with auto-reconciling mesh synchronization for rural clinic outposts.
  - Clinical genomics panel tracking for personalized chemotherapy dosage and oncology biomarker matching.

---

## 📄 License & Intellectual Property

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for complete details.

---

<div align="center">
  <sub>Built for Indian Hospitals • Engineered for Enterprise Healthcare • Powered by Modern Web Technologies</sub>
</div>
