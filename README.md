# MediNexa
### Your Healthcare, Connected.

A connected healthcare management platform bringing patient services, clinical workflows, hospital operations, and healthcare intelligence into one unified ecosystem.

<div align="center">

[![Official Production Platform](https://img.shields.io/badge/MediNexa-Production%20Clinical%20OS-2563EB?style=flat-square&logoColor=white)](https://medinexa-medicalweb.vercel.app)
[![Live Frontend](https://img.shields.io/badge/Live%20Frontend-medinexa--medicalweb.vercel.app-16A34A?style=flat-square&logo=vercel)](https://medinexa-medicalweb.vercel.app)
[![API Gateway](https://img.shields.io/badge/API%20Gateway-onrender.com%2Fapi%2Fv1-2563EB?style=flat-square&logo=render)](https://medinexa-duplicate-api.onrender.com/api/v1)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2%20App%20Router-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS 10](https://img.shields.io/badge/NestJS-10.3-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![Neon PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20Serverless-336791?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.14-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.4%20Strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8%20Realtime-010101?style=flat-square&logo=socketdotio)](https://socket.io/)
[![Supabase Storage](https://img.shields.io/badge/Storage-Supabase%20Private%20Vault-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Backend Tests](https://img.shields.io/badge/Tests-300%2F300%20Passing%20(100%25)-16A34A?style=flat-square)](#32-testing)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B.svg?style=flat-square)](LICENSE)

[Live Application](https://medinexa-medicalweb.vercel.app) • [Patient Portal](https://medinexa-medicalweb.vercel.app/patient) • [Hospital Portal](https://medinexa-medicalweb.vercel.app/hospital) • [Live Bed Availability](https://medinexa-medicalweb.vercel.app/portal/live-beds) • [API Health](https://medinexa-duplicate-api.onrender.com/api/v1/health) • [Judge Walkthrough](#37-judge-demonstration-guide) • [Architecture](#14-system-architecture)

</div>

---

## Table of Contents

### Section A — Project Overview
1. [Introduction](#1-introduction)
2. [Tagline](#2-tagline)
3. [Project Overview](#3-project-overview)
4. [Problem Statement](#4-problem-statement)
5. [Proposed Solution](#5-proposed-solution)
6. [Vision and Objectives](#6-vision-and-objectives)
7. [Key Features](#7-key-features)

### Section B — Product and Portals
8. [Patient Portal](#8-patient-portal)
9. [Doctor Portal](#9-doctor-portal)
10. [Hospital Admin and Staff Portal](#10-hospital-admin-and-staff-portal)
11. [Super Admin Portal](#11-super-admin-portal)
12. [User Roles and Permissions](#12-user-roles-and-permissions)
13. [End-to-End Application Workflow](#13-end-to-end-application-workflow)

### Section C — Technical Architecture
14. [System Architecture](#14-system-architecture)
15. [Technology Stack](#15-technology-stack)
16. [Frontend Architecture](#16-frontend-architecture)
17. [Backend Architecture](#17-backend-architecture)
18. [Database Architecture](#18-database-architecture)
19. [API Architecture](#19-api-architecture)
20. [Real-Time Communication](#20-real-time-communication)
21. [AI Architecture](#21-ai-architecture)
22. [Storage Architecture](#22-storage-architecture)
23. [Payment Architecture](#23-payment-architecture)

### Section D — Development
24. [Repository Structure](#24-repository-structure)
25. [Prerequisites](#25-prerequisites)
26. [Local Installation](#26-local-installation)
27. [Environment Configuration](#27-environment-configuration)
28. [Database and Prisma Commands](#28-database-and-prisma-commands)
29. [Frontend Development](#29-frontend-development)
30. [Backend Development](#30-backend-development)
31. [ML Service Setup](#31-ml-service-setup)
32. [Testing](#32-testing)

### Section E — Deployment and Security
33. [Deployment Architecture](#33-deployment-architecture)
34. [Official Production URLs](#34-official-production-urls)
35. [Security and Data Isolation](#35-security-and-data-isolation)
36. [Known Limitations](#36-known-limitations)

### Section F — Hackathon
37. [Judge Demonstration Guide](#37-judge-demonstration-guide)
38. [Future Scope](#38-future-scope)
39. [Contribution Guidelines](#39-contribution-guidelines)
40. [License](#40-license)

---

# Section A — Project Overview

## 1. Introduction

**MediNexa** is an enterprise-scale, production-deployed Hospital Management System (HMS) and Clinical Operating System engineered to unify patients, clinicians, nurses, pharmacists, laboratory technicians, and hospital administrators into a single, high-throughput digital clinical core.

Built upon a full-stack TypeScript monorepo architecture (**Next.js 14 App Router** frontend and **NestJS 10** modular REST/WebSocket backend), MediNexa connects patient self-service with real-time ward telemetry, electronic health records (EHR), multi-tenant hospital administration, and statutory national compliance (ABDM M1–M3, TRAI DLT, GST/SAC 999311).

MediNexa bridges hospital siloes by orchestrating outpatient scheduling, clinical SOAP encounters, inpatient bed occupancy, laboratory specimen tracking, pharmacy dispensary, and emergency trauma triage within one connected ecosystem.

---

## 2. Tagline

> **Your Healthcare, Connected.**

---

## 3. Project Overview

Healthcare systems globally struggle with severe software fragmentation. A typical regional hospital operates on disconnected platforms: one software for outpatient registration, an isolated portal for billing, paper charts or static spreadsheets for inpatient bed occupancy, third-party laboratory portals, and uncoordinated emergency queues.

MediNexa unifies these operations into a single cohesive platform structured around four operational pillars:
1. **Patient Health OS:** Universal patient portal providing 24/7 specialist booking, transparent network bed availability, longitudinal diagnostic vaults, and Guardian Health biometrics.
2. **Clinical Workstations:** Role-specific interfaces for Doctors, Head Nurses, Pharmacists, Radiologists, Receptionists, and Billing Specialists across multi-campus healthcare facilities.
3. **Hospital Operations & Governance:** Facility-level administration, bed census management, staff rostering, ward allocation, and procurement.
4. **Real-Time Clinical Telemetry:** Instant WebSocket synchronization across network facilities for bed occupancy changes, emergency ambulance dispatches, and trauma triage.

---

## 4. Problem Statement

Healthcare institutions and patient communities face systemic structural hurdles:

1. **Fragmented Patient Journey:** Patients navigate disconnected portals or carry physical paper dossiers for appointments, lab tests, prescriptions, and insurance pre-authorizations.
2. **Emergency Bed Blindness:** During medical trauma or acute respiratory distress, families and emergency dispatchers call facilities blindly without verified data on ICU, ventilator, or oxygen bed availability.
3. **Outpatient Queue Bottlenecks:** Manual token systems and uncoordinated scheduling cause crowded waiting rooms, specialist burnout, and missed appointments.
4. **Data Silos & IDOR Security Vulnerabilities:** Medical records frequently lack strict multi-tenant boundaries, creating risks of Insecure Direct Object References (IDOR) and making cross-facility referrals cumbersome.
5. **Lack of Resilient AI Clinical Triage:** Healthcare chatbots frequently hallucinate medical treatments or crash when third-party AI APIs experience outages, lacking failover protections and medical emergency guardrails.

---

## 5. Proposed Solution

MediNexa resolves these challenges through a modern, cloud-native architecture:

1. **Unified Multi-Portal Monorepo:** Clean separation of concerns between patient self-service, clinical operations, and enterprise administration while sharing TypeScript types and validation schemas.
2. **Live Network Bed Telemetry:** Sub-100ms multi-facility bed tracking with automatic synchronization across browsers, devices, and hospital wards.
3. **Fail-Safe 4-Tier AI Cascade:** Hierarchical intelligence fallback (*Anthropic Claude → Google Gemini → OpenAI → Built-in Clinical Rules*) ensuring continuous guidance with mandatory emergency triage interceptors.
4. **Private Document Storage:** Medical records stored in private Supabase buckets (`medinexa-vault`) with time-limited signed download URLs and strict tenant IDOR checks.
5. **Interactive Demo Personas:** Integrated 1-click persona switchers for 10 verified patient personas and 16 hospital clinical personas, enabling instant, credential-free demonstration for evaluators.

---

## 6. Vision and Objectives

* **Universal Healthcare Accessibility:** Democratize access to verified specialist schedules, digital token queues, and transparent bed availability.
* **Rapid Clinical Intake:** Reduce inpatient intake and bed allocation turnaround time from 45 minutes of manual paperwork to under 60 seconds.
* **Zero-Trust Security Core:** Defense-in-depth architecture featuring RFC 6238 TOTP two-factor authentication, AES-256-GCM encryption, and tenant data isolation.
* **National Standards Compliance:** Native architectural alignment with Ayushman Bharat Digital Mission (ABDM M1, M2, M3) and statutory healthcare taxation (GST/SAC 999311).

---

## 7. Key Features

| Category | Feature | Description | Implementation Status |
| :--- | :--- | :--- | :--- |
| 🏥 **Bed Telemetry** | **Live Network Bed Tracker** | Real-time occupancy tracking for ICU, General, and Emergency wards across network facilities. | **Implemented & Deployed** |
| 👨‍⚕️ **Clinical Care** | **Specialist Consultation Engine** | Outpatient scheduling, OPD token generation, and slot locking to prevent race conditions. | **Implemented & Deployed** |
| 📊 **Biometrics** | **Guardian Health Score** | Continuous biometric analysis (0–100 scale) with early deterioration detection and trend tracking. | **Implemented & Deployed** |
| 🔒 **Security** | **Private Document Vault** | Supabase private bucket storage (`medinexa-vault`) with 1-hour auto-expiring signed URLs. | **Implemented & Deployed** |
| 🤖 **Intelligence** | **4-Tier Resilient AI Assistant** | Clinical symptom guidance with automatic failover across Claude, Gemini, OpenAI, and rule engines. | **Implemented & Deployed** |
| 💳 **Billing** | **Sandbox Payment Demo** | Realistic Razorpay/UPI checkout demonstration for hospital consultation and OPD booking fees. | **Implemented & Deployed** |
| 🚑 **Emergency** | **1-Click Emergency SOS** | Geolocation-assisted emergency dispatch and priority hospital trauma triage hotline. | **Implemented & Deployed** |
| 🛡️ **Access Control** | **Zero-Trust Multi-Tenant RBAC** | Strict permission boundaries across 8 system roles with RFC 6238 TOTP Google Authenticator 2FA. | **Implemented & Deployed** |

---

# Section B — Product and Portals

## 8. Patient Portal

The **Patient Health OS** (`/patient`, `/portal`) is engineered for patient self-service, transparency, and longitudinal health tracking:

* **Live Bed Availability (`/portal/live-beds`):** Real-time bed occupancy across network hospitals (Hospital A Delhi, Hospital B Mumbai, Greater Noida Super-Speciality). Features hospital-specific filtering and real-time bed count indicators.
* **Doctor Appointments (`/portal/appointments`):** Search specialists by medical specialty, select preferred consultation slots, and generate instant OPD queue confirmation tokens.
* **Medical Records Vault (`/portal/medical-records`):** Secure private upload of lab PDFs, discharge summaries, and radiology imaging with zero public URL exposure.
* **Prescription Tracker (`/portal/prescriptions`):** Active medications, dosage instructions, and refill schedules prescribed by attending physicians with food timing directions.
* **Lab Reports (`/portal/lab-reports`):** Diagnostic test results with reference ranges, abnormal flag indicators, and pathologist verification notes.
* **Guardian Health Score (`/portal/health-score`):** Dynamic 0–100 wellness metric tracking vitals, risk factors, and biometric history.
* **Telemedicine (`/portal/telemedicine`):** Virtual video consultations with integrated chat and document sharing.
* **Family Health Management (`/portal/family`):** Linked dependent profiles for pediatric and geriatric family care coordination.
* **Insurance & Pre-Auth (`/portal/insurance`):** Digital policy storage, cashless pre-authorization tracking, and claim history.
* **Demo Patient Switcher:** 1-click modal to authenticate as one of 10 diverse patient personas (Diabetic Chronic Care, Pediatric, Maternity, Cardiac, etc.).

---

## 9. Doctor Portal

The **Doctor Clinical Workstation** (`/dashboard/doctor-appointments`, `/dashboard/clinical`) streamlines outpatient consultations and clinical encounters:

* **Outpatient Queue Workstation:** Real-time patient token queue displaying waiting, in-consultation, and completed statuses with token call controls.
* **SOAP Notes Engine:** Structured Subjective, Objective, Assessment, and Plan clinical documentation with standardized ICD-10 diagnostic coding.
* **E-Prescription Generator:** Structured drug dosage, frequency, duration, route, and food timing directions with allergy checking.
* **Diagnostic Order Dispatch:** Direct electronic order entry to Central Pathology (CBC, Lipid, HbA1c) and Radiology PACS imaging (X-Ray, MRI, CT).
* **Clinical History & Vitals Timeline:** Longitudinal patient chart displaying historical vitals, previous clinical encounters, and past discharge summaries.
* **Physician Schedule Management:** Roster configuration, OPD consultation slot generation, and emergency availability toggles.

---

## 10. Hospital Admin and Staff Portal

The **Hospital Operations & Staff Workstations** (`/hospital`, `/dashboard/*`) manage single-facility clinical workflows and administrative operations:

* **Executive Command Center (`/dashboard`):** Real-time occupancy heatmaps, daily admission statistics, bed turnover velocity, and clinical KPI snapshots.
* **Inpatient Ward Admissions (`/dashboard/admissions`):** Inpatient bed assignment, ward transfers, clinical notes, and multi-department discharge clearance.
* **Nurse Workstation (`/dashboard/nursing`):** Ward census charts, vitals flowsheet recording, Medication Administration Records (MAR), and nurse shift handovers.
* **Central Pharmacy (`/dashboard/pharmacy`):** Drug formulary management, batch-level inventory tracking, expiry alerts, and electronic prescription fulfillment.
* **Central Pathology (`/dashboard/lab`):** Specimen barcoding, automated analyzer result entry, panic value alerts, and pathologist digital sign-off.
* **Emergency & Trauma (`/dashboard/emergency`):** Red/Yellow/Green triage scoring, crash-cart assignment, trauma bay intake, and emergency ambulance dispatch.
* **Billing & Finance (`/dashboard/billing`):** Inpatient invoices with SAC 999311 healthcare tax exemption and statutory medicine GST calculation.
* **Demo Staff Switcher:** 1-click authentication into 16 distinct hospital personas across Hospital A, Hospital B, and Enterprise Administration.

---

## 11. Super Admin Portal

The **Enterprise Governance Portal** (`/super-admin`, `/dashboard/super-admin`) provides cross-facility administration and platform security:

* **Multi-Hospital Registry:** Facility onboarding, operational licensing, specialty department mapping, and bed capacity allocation.
* **Enterprise Audit Vault:** Immutable audit trail recording every user authentication, medical record access, clinical encounter edit, and role change.
* **Global Access & Security:** Enterprise-wide session termination, mandatory 2FA enforcement, and rate-limiting policy management.
* **Platform Analytics:** Cross-facility bed utilization rates, network revenue cycle tracking, and clinical volume trends.

---

## 12. User Roles and Permissions

MediNexa enforces strict Role-Based Access Control (RBAC) across 8 core system roles:

| Role Code | Role Name | System Access Scope | Default Landing Workspace |
| :--- | :--- | :--- | :--- |
| `PATIENT` | Empanelled Patient | Personal appointments, bed reservations, prescriptions, lab results | `/portal` |
| `DOCTOR` | Attending Physician | Assigned outpatient queue, SOAP consultation notes, diagnostic orders | `/dashboard/doctor-appointments` |
| `NURSE` | Inpatient Ward Nurse | Ward bed chart, vitals recording, medication administration (MAR) | `/dashboard/nursing` |
| `RECEPTIONIST` | Front Desk Intake | Patient intake, new UHID registration, OPD appointment queue tokens | `/dashboard/appointments` |
| `PHARMACIST` | Pharmacy Staff | Drug dispensary, stock inventory, batch tracking, refill approvals | `/dashboard/pharmacy` |
| `LAB_STAFF` | Laboratory Technician | Sample management, diagnostic test entry, panic value alerts | `/dashboard/lab` |
| `HOSPITAL_ADMIN` | Hospital Administrator | Single-facility operations, staff roster, ward census, revenue billing | `/dashboard` |
| `MEDINEXA_ADMIN` | Super Administrator | Cross-facility governance, hospital licensing, global security audits | `/dashboard/super-admin` |

---

## 13. End-to-End Application Workflow

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#EFF6FF', 'primaryTextColor': '#172554', 'primaryBorderColor': '#2563EB', 'lineColor': '#2563EB', 'secondaryColor': '#F8FAFC', 'tertiaryColor': '#FFFFFF', 'edgeLabelBackground':'#FFFFFF', 'clusterBkg': '#F8FAFC', 'clusterBorder': '#CBD5E1'}}}%%
sequenceDiagram
    autonumber
    actor Patient as Empanelled Patient
    actor Doctor as Attending Doctor
    actor Staff as Inpatient Staff
    participant Web as Web Client (Next.js 14)
    participant API as API Gateway (NestJS 10)
    participant DB as Neon PostgreSQL (Prisma)
    participant Vault as Supabase Vault (medinexa-vault)

    Patient->>Web: 1. Search Specialty & Select OPD Slot
    Web->>API: POST /api/v1/appointments (Slot Lock)
    API->>DB: Atomic Transaction: Create Appointment & Token
    DB-->>API: Confirmed (#TKN-2026-01)
    API-->>Web: Appointment Confirmation & Token Receipt

    Doctor->>Web: 2. Open Doctor OPD Queue
    Web->>API: GET /api/v1/doctor/appointments/today
    API-->>Web: Active Patient Queue List
    Doctor->>Web: Record SOAP Notes & Prescribe Medications
    Web->>API: POST /api/v1/ehr/encounters (SOAP Data)
    API->>DB: Persist Encounter & Prescription Records

    Patient->>Web: 3. Upload Diagnostic Lab PDF
    Web->>API: POST /api/v1/attachments/upload (Multipart)
    API->>Vault: Encrypted Upload to Private Bucket (medinexa-vault)
    Vault-->>API: Return Storage Key (patient-id/doc-uuid.pdf)
    API->>DB: Store Attachment Metadata & Ownership
    API-->>Web: Upload Complete (Private Key Registered)

    Staff->>Web: 4. Admit Inpatient to Dedicated Ward Bed
    Web->>API: POST /api/v1/admissions (Ward Bed Assignment)
    API->>DB: Update Bed Occupancy (OCCUPIED) & Create Admission Record
    API--)Web: WebSocket Broadcast 'bed.occupancy.updated'
    Web-->>Patient: Real-Time Bed Availability Decrements Instantly
```

---

# Section C — Technical Architecture

## 14. System Architecture

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#EFF6FF', 'primaryTextColor': '#172554', 'primaryBorderColor': '#2563EB', 'lineColor': '#2563EB', 'secondaryColor': '#F8FAFC', 'tertiaryColor': '#FFFFFF', 'edgeLabelBackground':'#FFFFFF', 'clusterBkg': '#F8FAFC', 'clusterBorder': '#CBD5E1'}}}%%
flowchart TD
    subgraph UserLayer ["User & Client Layer"]
        U1["Patient & Public"]
        U2["Attending Doctor"]
        U3["Inpatient Nurse & Ward Staff"]
        U4["Pharmacist & Lab Tech"]
        U5["Hospital Administrator"]
        U6["Super Administrator"]
    end

    subgraph FrontendLayer ["Frontend Application (Next.js 14 App Router — Vercel)"]
        PUB["Public Landing & Gateways"]
        PORT["Patient Health OS (/portal)"]
        DOC["Doctor Workstations (/dashboard)"]
        HOSP["Hospital Operations (/dashboard)"]
        SADM["Super Admin Platform"]
        CLIENT["API Client & Socket.IO Client"]

        U1 --> PUB & PORT
        U2 --> DOC
        U3 & U4 & U5 --> HOSP
        U6 --> SADM

        PUB & PORT & DOC & HOSP & SADM --> CLIENT
    end

    subgraph GatewayLayer ["API Gateway & Security Core (NestJS 10 — Render)"]
        GATEWAY["API Gateway (/api/v1)"]
        WS_GATEWAY["WebSocket Gateway (/events)"]
        AUTH_GUARD["Passport JWT & TOTP 2FA Guard"]
        RBAC_GUARD["8-Role RBAC & Multi-Tenant Guard"]
        RATE_GUARD["Token-Bucket Rate Limiting Guard"]

        CLIENT -->|HTTPS REST| GATEWAY
        CLIENT <-->|WSS Telemetry| WS_GATEWAY

        GATEWAY --> AUTH_GUARD --> RBAC_GUARD --> RATE_GUARD
    end

    subgraph ModuleLayer ["Modular Domain Services (NestJS 62 Modules)"]
        BED_SVC["Bed Telemetry Service"]
        APPT_SVC["Appointment & OPD Service"]
        CLIN_SVC["EHR & Clinical Encounter Service"]
        STORAGE_SVC["Storage Module (Factory)"]
        AI_SVC["Resilient AI Provider"]
        BILL_SVC["Billing & Invoicing Service"]
        PHARM_SVC["Pharmacy & Inventory Service"]
        LAB_SVC["Laboratory & Diagnostics Service"]

        RATE_GUARD --> BED_SVC & APPT_SVC & CLIN_SVC & STORAGE_SVC & AI_SVC & BILL_SVC & PHARM_SVC & LAB_SVC
    end

    subgraph PersistenceLayer ["Cloud Infrastructure & Managed Services"]
        PRISMA_ORM["Prisma 5.14 ORM Client"]
        NEON_DB[("Neon PostgreSQL Serverless")]
        REDIS_CACHE[("Upstash Redis Cache & Rate Limiting")]
        SUPABASE_VAULT[("Supabase Private Vault: medinexa-vault")]
        AI_PROVIDERS["AI Cascade: Claude -> Gemini -> OpenAI -> Rules"]
        ML_SERVICE["Python ML Forecaster (Local Microservice)"]

        BED_SVC & APPT_SVC & CLIN_SVC & BILL_SVC & PHARM_SVC & LAB_SVC --> PRISMA_ORM
        PRISMA_ORM --> NEON_DB
        AUTH_GUARD & RATE_GUARD --> REDIS_CACHE
        STORAGE_SVC --> SUPABASE_VAULT
        AI_SVC --> AI_PROVIDERS
        BED_SVC -.->|Optional ML Telemetry| ML_SERVICE
    end
```

---

## 15. Technology Stack

| Layer | Component | Version | Verification / Source | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | `14.2.35` | `apps/web/package.json` | React Server Components, client pages, static route prerendering |
| **UI Library** | React | `18.3.1` | `apps/web/package.json` | Component runtime and state management |
| **Styling & Icons** | Tailwind CSS & Lucide React | `3.4.3` / `0.378.0` | `apps/web/package.json` | Accessible, light-mode healthcare UI and iconography |
| **Data Visualization** | Recharts | `3.10.1` | `apps/web/package.json` | Bed occupancy trends, vital sign charts, revenue graphs |
| **Backend Framework** | NestJS | `10.3.8` | `apps/api/package.json` | Modular DDD backend architecture, dependency injection |
| **HTTP Engine** | Express | `4.17.21` | `apps/api/package.json` | High-throughput HTTP request processing |
| **Real-Time Telemetry** | Socket.IO | `4.8.3` | `apps/api/package.json` | Sub-100ms multi-tab and multi-device bed occupancy broadcasts |
| **Database Engine** | Neon PostgreSQL Serverless | PostgreSQL 16+ | `apps/api/.env.example` | Scalable cloud relational database with connection pooling |
| **ORM Client** | Prisma Client | `5.14.0` | `database/package.json` | Type-safe database queries, migrations, and relational integrity |
| **Distributed Caching** | Upstash Redis (ioredis) | `6.0.0` | `apps/api/package.json` | Shared rate limiting and session storage (with memory fallback) |
| **Object Storage** | Supabase Storage SDK | `2.119.0` | `apps/api/package.json` | Private bucket document vault (`medinexa-vault`) with signed URLs |
| **Authentication** | Passport JWT & otplib | `4.0.1` / `13.5.0` | `apps/api/package.json` | Access/refresh tokens, RFC 6238 TOTP two-factor authentication |
| **ML Microservice** | Python FastAPI & Scikit-Learn | `0.110.0` / `1.4.0` | `services/ml-forecasting` | 7-day inpatient bed surge and occupancy forecasting |
| **Language & Monorepo** | TypeScript & npm Workspaces | `5.4.5` / Node.js 20+ | `package.json` | Monorepo type safety, shared validation, and build tooling |

---

## 16. Frontend Architecture

The frontend application (`apps/web`) is structured using Next.js 14 App Router, featuring 222 statically and dynamically prerendered routes:

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#EFF6FF', 'primaryTextColor': '#172554', 'primaryBorderColor': '#2563EB', 'lineColor': '#2563EB', 'secondaryColor': '#F8FAFC', 'tertiaryColor': '#FFFFFF', 'edgeLabelBackground':'#FFFFFF', 'clusterBkg': '#F8FAFC', 'clusterBorder': '#CBD5E1'}}}%%
flowchart TD
    subgraph RouteStructure ["Next.js 14 App Router (apps/web/app)"]
        PUBLIC["Public Pages: /, /pricing, /terms, /privacy, /nearby-hospitals"]
        AUTH_ROUTES["Auth Routes: /auth/login, /auth/register, /auth/verify-authenticator"]
        PATIENT_ROUTES["Patient Gateway (/patient) & Health OS (/portal/*)"]
        HOSPITAL_ROUTES["Hospital Gateway (/hospital) & Workstations (/dashboard/*)"]
        SUPER_ROUTES["Super Admin Routes (/super-admin, /dashboard/super-admin)"]
    end

    subgraph ComponentLayer ["Reusable Component System (apps/web/components)"]
        UI_ATOMS["Atomic UI: Button, Card, Modal, Input, Badge, ThemeToggle"]
        DOMAIN_COMPS["Domain Components: AppointmentCard, BedStatusGrid, VitalsChart"]
        PERSONA_MODALS["Persona Switchers: PatientDemoSwitcherModal, PortalDemoAccountsHub"]
    end

    subgraph ClientLibrary ["Client Core Libraries (apps/web/lib)"]
        API_CFG["api-config.ts: Centralized API base URL & fetch wrapper"]
        DOM_CFG["domain-config.ts: Single official domain constants"]
        TELEMETRY["realtime-telemetry.ts: Socket.IO & BroadcastChannel sync"]
        DEMO_PORTALS["demo-portals.ts: 10 Patient & 16 Hospital Personas"]
    end

    PUBLIC & AUTH_ROUTES & PATIENT_ROUTES & HOSPITAL_ROUTES & SUPER_ROUTES --> ComponentLayer
    ComponentLayer --> ClientLibrary
```

* **Domain Organization:**
  * `app/patient/page.tsx`: Patient gateway featuring direct login, new patient registration, and 1-click demo patient access.
  * `app/portal/*`: Inpatient and outpatient health OS routes (appointments, live beds, medical records, prescriptions, lab results, billing, telemedicine).
  * `app/hospital/page.tsx`: Hospital gateway with department navigation and 1-click clinical persona switchers.
  * `app/dashboard/*`: Clinical workstations for doctor encounters, ward nursing, pharmacy dispensing, pathology testing, and facility operations.
* **Theme System:** Default **Light Mode** enforced via initial HTML script in `layout.tsx` and `ThemeToggle.tsx` with user preference preservation in `localStorage`.

---

## 17. Backend Architecture

The backend application (`apps/api`) is engineered with NestJS 10 adhering to Domain-Driven Design (DDD):

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#EFF6FF', 'primaryTextColor': '#172554', 'primaryBorderColor': '#2563EB', 'lineColor': '#2563EB', 'secondaryColor': '#F8FAFC', 'tertiaryColor': '#FFFFFF', 'edgeLabelBackground':'#FFFFFF', 'clusterBkg': '#F8FAFC', 'clusterBorder': '#CBD5E1'}}}%%
flowchart TD
    REQ["Inbound HTTP / WebSocket Request"] --> CORS["CORS Origin Validation (cors-origin.util.ts)"]
    CORS --> PREFIX["Global Route Prefix (/api/v1)"]
    PREFIX --> GUARDS["Security Guards (JWT Auth -> RBAC Role -> Rate Limit)"]
    GUARDS --> INTERCEPT["Audit & Exception Interceptors"]
    INTERCEPT --> CONTROLLERS["NestJS Domain Controllers (65+ Controllers)"]
    CONTROLLERS --> SERVICES["Modular Domain Services (62 Domain Services)"]
    SERVICES --> STORAGE_PROVIDER["Storage Factory (Supabase / R2 / Fail-Closed)"]
    SERVICES --> PRISMA_SERVICE["Prisma Database Service (Neon PostgreSQL)"]
    SERVICES --> WS_SERVICE["Events Gateway (Socket.IO Broadcasts)"]
```

* **CORS Security (`cors-origin.util.ts`):** Strictly permits the official frontend domain (`https://medinexa-medicalweb.vercel.app`) and local development origins, rejecting unauthorized cross-site requests.
* **Storage Factory (`storage.module.ts`):** Dynamically provisions `SupabaseStorageProvider` or `CloudflareR2Provider`. In production, if required credentials are missing, it selects `DisabledStorageProvider` to fail closed and return HTTP 503 rather than writing sensitive medical records to unauthenticated local disk.
* **Data Isolation:** All database read/write queries are strictly filtered by tenant parameters (`patientId` or `facilityId`), eliminating IDOR risks.

---

## 18. Database Architecture

The persistence layer uses **Neon PostgreSQL Serverless** managed through **Prisma ORM 5.14** with 5,900+ lines of declarative schema definitions in `database/prisma/schema.prisma`.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#EFF6FF', 'primaryTextColor': '#172554', 'primaryBorderColor': '#2563EB', 'lineColor': '#2563EB', 'secondaryColor': '#F8FAFC', 'tertiaryColor': '#FFFFFF', 'edgeLabelBackground':'#FFFFFF', 'clusterBkg': '#F8FAFC', 'clusterBorder': '#CBD5E1'}}}%%
flowchart LR
    subgraph IdentityDomain ["Identity & Governance"]
        User["User"]
        Role["Role"]
        AuditEvent["AuditEvent"]
        StaffInvitation["StaffInvitation"]
    end

    subgraph FacilityDomain ["Facilities & Infrastructure"]
        Organization["Organization"]
        Facility["Facility"]
        Department["Department"]
        Ward["Ward"]
        Room["Room"]
        Bed["Bed"]
    end

    subgraph PatientDomain ["Patients & Biometrics"]
        PatientProfile["PatientProfile"]
        EmergencyContact["EmergencyContact"]
        FamilyMember["FamilyMember"]
        HealthScore["HealthScore"]
        AbhaProfile["AbhaProfile"]
    end

    subgraph ClinicalDomain ["Clinical Care & Encounters"]
        DoctorProfile["DoctorProfile"]
        Appointment["Appointment"]
        OpdToken["OpdToken"]
        ClinicalEncounter["ClinicalEncounter"]
        ClinicalNote["ClinicalNote"]
        Diagnosis["Diagnosis"]
    end

    subgraph InpatientDomain ["Inpatient & Wards"]
        BedReservation["BedReservation"]
        BedAssignment["BedAssignment"]
        Admission["Admission"]
        DischargeSummary["DischargeSummary"]
        VitalsFlowsheet["VitalsFlowsheet"]
    end

    subgraph DiagnosticsDomain ["Pharmacy & Laboratory"]
        Medication["Medication"]
        Prescription["Prescription"]
        PharmacyInventory["PharmacyInventory"]
        LabOrder["LabOrder"]
        LabTest["LabTest"]
        LabResult["LabResult"]
    end

    subgraph FinancialDomain ["Billing & Insurance"]
        BillingInvoice["BillingInvoice"]
        BillingLineItem["BillingLineItem"]
        PaymentTransaction["PaymentTransaction"]
        InsuranceClaim["InsuranceClaim"]
    end

    subgraph StorageDomain ["Secure Storage"]
        FileAttachment["FileAttachment"]
        AttachmentAudit["AttachmentAudit"]
    end

    User --> PatientProfile & DoctorProfile
    Facility --> Department --> Ward --> Room --> Bed
    PatientProfile --> Appointment & ClinicalEncounter & Admission & HealthScore
    DoctorProfile --> Appointment & ClinicalEncounter
    Admission --> BedAssignment
    ClinicalEncounter --> Prescription & LabOrder
    Prescription --> PharmacyInventory
    LabOrder --> LabResult
    Admission & Appointment --> BillingInvoice --> PaymentTransaction
    PatientProfile --> FileAttachment --> AttachmentAudit
```

### Prisma Dual-Connection Strategy:
* `DATABASE_URL`: Pooled connection string utilizing PgBouncer for high-concurrency runtime queries with transaction-level pooling.
* `DIRECT_URL`: Direct TCP connection string used exclusively by Prisma CLI for executing schema migrations and DDL statements.

---

## 19. API Architecture

All backend endpoints are prefixed with `/api/v1`. Core verified routes:

| HTTP Method | Route | Module / Controller | Required Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | `AuthModule` | Public | Staff and patient credential authentication |
| `POST` | `/api/v1/auth/register` | `AuthModule` | Public | Patient self-registration with bcrypt password hashing |
| `POST` | `/api/v1/auth/refresh` | `AuthModule` | Authenticated | Refresh expired JWT access token |
| `POST` | `/api/v1/auth/2fa/verify` | `AuthModule` | Authenticated | Verify RFC 6238 6-digit TOTP code |
| `GET` | `/api/v1/bed-availability/live` | `BedModule` | Public / Token | Real-time bed occupancy across all network facilities |
| `GET` | `/api/v1/beds` | `BedModule` | Staff | Detailed physical bed inventory and ward allocation |
| `POST` | `/api/v1/bed-bookings` | `BedBookingModule` | Patient / Staff | Reserve emergency or elective inpatient bed |
| `GET` | `/api/v1/appointments` | `AppointmentModule` | Authenticated | List appointments filtered by date, role, or patient |
| `POST` | `/api/v1/appointments` | `AppointmentModule` | Patient / Staff | Book specialist consultation and generate OPD queue token |
| `POST` | `/api/v1/ehr/encounters` | `EhrModule` | Doctor | Create clinical encounter with SOAP documentation |
| `POST` | `/api/v1/attachments/upload` | `AttachmentModule` | Authenticated | Upload medical document to private Supabase storage |
| `GET` | `/api/v1/attachments/:id/download-url` | `AttachmentModule` | Authorized Tenant | Mint time-limited signed URL for private medical document |
| `POST` | `/api/v1/ai/chat` | `AiModule` | Authenticated | 4-tier resilient clinical assistant with safety guards |
| `GET` | `/api/v1/billing/invoices` | `BillingModule` | Patient / Admin | Retrieve patient or facility billing invoices |
| `GET` | `/api/v1/health` | `HealthModule` | Public | System status, database connectivity, and uptime telemetry |

---

## 20. Real-Time Communication

MediNexa implements a dual-layer real-time telemetry architecture:

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#EFF6FF', 'primaryTextColor': '#172554', 'primaryBorderColor': '#2563EB', 'lineColor': '#2563EB', 'secondaryColor': '#F8FAFC', 'tertiaryColor': '#FFFFFF', 'edgeLabelBackground':'#FFFFFF', 'clusterBkg': '#F8FAFC', 'clusterBorder': '#CBD5E1'}}}%%
flowchart TD
    EVENT["Bed Status Changed (Admission / Discharge / Ward Transfer)"] --> BACKEND["NestJS Bed Service"]
    BACKEND --> WS["Socket.IO Server Gateway (/events)"]
    WS -->|WebSocket Event: bed.status.changed| BROWSER_TAB1["Browser Tab 1 (Patient Portal / Live Beds)"]
    WS -->|WebSocket Event: bed.occupancy.updated| BROWSER_TAB2["Browser Tab 2 (Hospital Command Center)"]

    BROWSER_TAB1 <-->|Client BroadcastChannel: medinexa_telemetry| BROWSER_TAB2
```

* **WebSocket Engine:** Sub-100ms multi-facility broadcasts powered by Socket.IO 4.8.
* **Dual Multi-Tab Synchronization:** Combines server-side WebSockets with client-side browser `BroadcastChannel` and `window` telemetry events for instant 0ms cross-tab updates without server roundtrips.
* **Resilient In-Memory Fallback:** When Upstash Redis is not connected, the WebSocket gateway operates seamlessly in single-node in-memory mode without crashing.

---

## 21. AI Architecture

MediNexa implements a 4-tier resilience hierarchy for clinical healthcare intelligence:

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#EFF6FF', 'primaryTextColor': '#172554', 'primaryBorderColor': '#2563EB', 'lineColor': '#2563EB', 'secondaryColor': '#F8FAFC', 'tertiaryColor': '#FFFFFF', 'edgeLabelBackground':'#FFFFFF', 'clusterBkg': '#F8FAFC', 'clusterBorder': '#CBD5E1'}}}%%
flowchart TD
    QUERY["User Healthcare or Symptom Query"] --> OVERDOSE{"Safety Guard: Dangerous Dosage Interceptor"}
    OVERDOSE -->|Detected: Paracetamol > 4,000mg| RED_ALERT["Emergency Redirection: Urgent Medical Assessment / Call 108"]
    OVERDOSE -->|Safe Query| TIER1{"Tier 1: Anthropic Claude (Claude 3.5 Sonnet)"}

    TIER1 -->|Key Configured & Healthy| RESP1["Claude Clinical Guidance"]
    TIER1 -->|Missing Key or API Error| TIER2{"Tier 2: Google Gemini (Gemini 1.5 Pro)"}

    TIER2 -->|Key Configured & Healthy| RESP2["Gemini Clinical Guidance"]
    TIER2 -->|Missing Key or API Error| TIER3{"Tier 3: OpenAI (GPT-4o)"}

    TIER3 -->|Key Configured & Healthy| RESP3["OpenAI Clinical Guidance"]
    TIER3 -->|Missing Key or API Error| TIER4["Tier 4: Built-in Clinical Rules Engine"]

    RESP1 & RESP2 & RESP3 & TIER4 --> DISCLAIMER["Attach Mandatory Clinical Safety Disclaimer"]
    RED_ALERT & DISCLAIMER --> FINAL_OUT["Deliver Formatted Response to User"]
```

### Safety Rules & Disclaimers:
* **Overdose Interception:** Queries regarding dangerous dosages (e.g. Paracetamol > 4,000 mg) trigger immediate red emergency flags directing users to seek urgent professional medical assessment or contact emergency services (108).
* **Clinical Scope:** All AI outputs carry mandatory disclaimers: *"Informational healthcare guidance only. Does not replace professional medical judgment."*
* **Provider Resiliency:** Verified across unit and integration test suites (`ai-provider-resilience.spec.ts`) demonstrating seamless failover when external provider API keys are absent or encounter network timeouts.

---

## 22. Storage Architecture

Medical documents are secured using private object storage with strict tenant authorization:

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#EFF6FF', 'primaryTextColor': '#172554', 'primaryBorderColor': '#2563EB', 'lineColor': '#2563EB', 'secondaryColor': '#F8FAFC', 'tertiaryColor': '#FFFFFF', 'edgeLabelBackground':'#FFFFFF', 'clusterBkg': '#F8FAFC', 'clusterBorder': '#CBD5E1'}}}%%
flowchart LR
    PATIENT["Patient / Clinical Staff"] -->|1. Upload Request (Multipart)| API["NestJS Storage Controller"]
    API --> AUTH{"2. Authorize Tenant & Sanitize Key"}
    AUTH -->|Key Sanitized: No ../ Traversal| VAULT[("Supabase Private Bucket: medinexa-vault")]
    AUTH -->|IDOR or Invalid Key| REJECT["HTTP 403 Forbidden"]
    VAULT -->> API: "3. Storage Key: patient-id/doc-uuid.pdf"
    API --> DB[("Prisma: Store Metadata")]
    API -->> PATIENT: "4. Upload Success (Metadata Stored)"

    PATIENT -->|5. Request Document Download| API
    API --> CHECK{"6. Verify Patient / Facility Ownership"}
    CHECK -->|Authorized| SIGN["7. Mint Short-Lived Signed URL (1-Hour Expiry)"]
    CHECK -->|Unauthorized (IDOR)| FORBIDDEN["HTTP 403 Forbidden"]
    SIGN -->> PATIENT: "8. Return Signed Download URL"
```

* **Canonical Bucket Name:** **`medinexa-vault`** (configured via `SUPABASE_STORAGE_BUCKET` in Render and application code).
* **Zero Public URLs:** Files are stored in private buckets. Access is granted exclusively through short-lived (1-hour auto-expiring) signed URLs generated on demand after verifying caller tenant ownership.
* **Path Traversal Protection:** All storage keys are strictly validated against `^[a-zA-Z0-9_\-\.\/]+$`, rejecting `../` traversal sequences.
* **Fail-Closed Production Safety:** If production storage credentials (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) are omitted, the module selects `DisabledStorageProvider`, failing closed with HTTP 503 to prevent unauthenticated file storage.

---

## 23. Payment Architecture

MediNexa provides a simulated healthcare billing and checkout workflow:

* **Sandbox Safety:** Every payment modal and receipt displays prominent **`SANDBOX / DEMO PAYMENT`** indicators.
* **Razorpay Simulation:** Simulates Razorpay order creation, mock UPI / Net Banking verification, payment signature generation, and invoice receipt issuance.
* **Zero Real Money:** Never prompts for, accepts, or transmits real credit card numbers, UPI PINs, or banking credentials.

---

# Section D — Development

## 24. Repository Structure

```text
MediNexa-Duplicate/
├── apps/
│   ├── web/                           # Next.js 14 App Router Frontend (Port 3000)
│   │   ├── app/                       # 222 Static & Dynamic Prerendered Routes
│   │   │   ├── (auth)/                # Login, Register, 2FA TOTP Verification
│   │   │   ├── patient/               # Patient Gateway Page
│   │   │   ├── portal/                # Patient Health OS (Appointments, Beds, Records)
│   │   │   ├── hospital/              # Hospital Gateway Page
│   │   │   ├── dashboard/             # Clinical Workstations (Doctor, Nurse, Admin)
│   │   │   └── super-admin/           # Enterprise Multi-Hospital Governance
│   │   ├── components/                # Modular UI & Domain Components
│   │   │   ├── ui/                    # Button, Card, Modal, ThemeToggle
│   │   │   ├── portal/                # PatientDemoSwitcherModal
│   │   │   └── hospital/              # PortalDemoAccountsHub
│   │   └── lib/                       # API clients, domain config, realtime telemetry
│   └── api/                           # NestJS 10 REST & WebSocket Backend (Port 3001)
│       ├── src/                       # 62 Modular Domain Services
│       │   ├── auth/                  # JWT, Passport, TOTP 2FA Verification
│       │   ├── bed/                   # Real-time Bed Census & Telemetry
│       │   ├── appointment/           # Outpatient Scheduling & Token Generation
│       │   ├── storage/               # Supabase & Cloudflare R2 Providers
│       │   ├── ai/                    # 4-Tier Resilient AI Provider & Safety Guards
│       │   └── common/                # CORS, Domain Config, Guards, Interceptors
│       └── test/                      # 300 Automated Unit & Integration Tests
├── database/
│   └── prisma/
│       ├── schema.prisma              # 5,900+ LOC Enterprise Relational Schema
│       ├── migrations/                # Version-controlled Prisma Migration History
│       └── seed/                      # Database Seed Scripts (Beds, Hospitals, Staff)
├── packages/
│   ├── types/                         # Shared TypeScript Interfaces & DTOs
│   ├── validation/                    # Shared Validation Schemas
│   └── config/                        # Shared ESLint and TypeScript Configurations
├── services/
│   └── ml-forecasting/                # Python FastAPI Occupancy Forecaster (Port 8000)
├── render.yaml                        # Render Cloud Infrastructure Blueprint
└── README.md                          # Master Technical Documentation
```

---

## 25. Prerequisites

Before installing MediNexa, ensure the following tooling is installed:

* **Node.js:** `v18.18.0` or higher (`v20.x LTS` recommended).
* **npm:** `v9.x` or higher (supports npm workspaces).
* **PostgreSQL:** Neon PostgreSQL connection string (or local PostgreSQL 15+).
* **Python (Optional for ML):** Python 3.10+ (for `services/ml-forecasting`).
* **Git:** Installed and configured.

---

## 26. Local Installation

```bash
# 1. Clone the repository
git clone https://github.com/singhayush256/MediNexa-Duplicate.git
cd MediNexa-Duplicate

# 2. Install root monorepo dependencies
npm install

# 3. Build shared packages (types and validation)
npm run build --workspace=@medinexa/types
npm run build --workspace=@medinexa/validation
```

---

## 27. Environment Configuration

### Backend Environment (`apps/api/.env`)
Copy `apps/api/.env.example` to `apps/api/.env` and update the values:

```env
NODE_ENV=development
PORT=3001
API_PREFIX=/api/v1
CORS_ORIGIN=http://localhost:3000,https://medinexa-medicalweb.vercel.app
FRONTEND_URL=http://localhost:3000

# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/medinexa?sslmode=prefer"
DIRECT_URL="postgresql://user:password@localhost:5432/medinexa?sslmode=prefer"

# Authentication Secrets
JWT_SECRET=super_secret_jwt_dev_key_at_least_32_characters_long
JWT_EXPIRES_IN=8h
JWT_REFRESH_SECRET=super_secret_jwt_refresh_dev_key_32_chars
TOTP_ENCRYPTION_KEY=super_secret_totp_dev_key_at_least_32_chars

# Storage (Supabase Private Bucket: medinexa-vault)
STORAGE_PROVIDER=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=medinexa-vault

# AI Providers (Optional - falls back to Built-in Clinical Rules)
ANTHROPIC_API_KEY=your_anthropic_api_key
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Redis (Optional - falls back to in-memory rate limiting)
REDIS_URL=redis://localhost:6379
```

### Frontend Environment (`apps/web/.env.local`)
Copy `apps/web/.env.example` to `apps/web/.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_placeholder_key_id
```

---

## 28. Database and Prisma Commands

```bash
# Generate Prisma Client
npm run db:generate --workspace=@medinexa/database

# Run Prisma migrations
npm run db:migrate --workspace=@medinexa/database

# Validate Prisma schema syntax
npx prisma validate --schema=database/prisma/schema.prisma

# (Optional) Open Prisma Studio GUI
npm run db:studio --workspace=@medinexa/database
```

---

## 29. Frontend Development

```bash
# Start Next.js development server on http://localhost:3000
npm run dev:web
```

---

## 30. Backend Development

```bash
# Start NestJS backend with watch mode on http://localhost:3001
npm run dev:api
```

---

## 31. ML Service Setup

The ML occupancy forecaster is a local Python microservice located in `services/ml-forecasting`:

```bash
cd services/ml-forecasting

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI service on port 8000
uvicorn main:app --port 8000 --reload
```

---

## 32. Testing

MediNexa maintains strict test coverage across security, storage, AI resilience, and clinical workflows:

```bash
# 1. Run all 300 backend unit & integration tests
npm test --workspace=@medinexa/api

# 2. Run backend TypeScript typecheck
npm run typecheck --workspace=@medinexa/api

# 3. Run frontend TypeScript typecheck
npm run typecheck --workspace=@medinexa/web

# 4. Run frontend production build (prerenders all 222 routes)
npm run build:web

# 5. Run backend NestJS production build
npm run build --workspace=@medinexa/api
```

---

# Section E — Deployment and Security

## 33. Deployment Architecture

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#EFF6FF', 'primaryTextColor': '#172554', 'primaryBorderColor': '#2563EB', 'lineColor': '#2563EB', 'secondaryColor': '#F8FAFC', 'tertiaryColor': '#FFFFFF', 'edgeLabelBackground':'#FFFFFF', 'clusterBkg': '#F8FAFC', 'clusterBorder': '#CBD5E1'}}}%%
flowchart LR
    subgraph EdgeTier ["Vercel Edge Platform"]
        V[medinexa-medicalweb.vercel.app]
        V --> NextSSR[Next.js 14 SSR & Edge CDN]
    end

    subgraph ComputeTier ["Render Cloud Platform"]
        R[medinexa-duplicate-api.onrender.com]
        R --> NestAPI[NestJS REST Engine /api/v1]
        R --> NestWS[WebSocket Server /events]
    end

    subgraph DataTier ["Cloud Data & Persistence"]
        Neon[(Neon PostgreSQL Serverless)]
        Upstash[(Upstash Redis Cache)]
        SupaVault[(Supabase Vault: medinexa-vault)]
    end

    subgraph ExternalTier ["AI & Microservices"]
        AI_APIS["AI APIs: Claude / Gemini / OpenAI"]
        ML_LOCAL["ML Forecaster (Local / Config-Dependent)"]
    end

    V -->|HTTPS REST| R
    V <-->|WSS Telemetry| R
    R --> Neon
    R --> Upstash
    R --> SupaVault
    R -.-> AI_APIS
    R -.-> ML_LOCAL
```

---

## 34. Official Production URLs

* **Official Public Frontend URL:** **`https://medinexa-medicalweb.vercel.app`**
* **Patient Gateway:** `https://medinexa-medicalweb.vercel.app/patient`
* **Hospital Gateway:** `https://medinexa-medicalweb.vercel.app/hospital`
* **Live Beds Telemetry:** `https://medinexa-medicalweb.vercel.app/portal/live-beds`
* **Backend API Base URL:** **`https://medinexa-duplicate-api.onrender.com/api/v1`**
* **Backend Health Check:** `https://medinexa-duplicate-api.onrender.com/api/v1/health`
* **GitHub Repository:** `https://github.com/singhayush256/MediNexa-Duplicate` (Branch: `main`)

---

## 35. Security and Data Isolation

1. **Multi-Tenant Scoping:** All database queries are explicitly filtered by `facilityId` or `patientId`. Cross-tenant record leakage is prevented at the ORM layer.
2. **RFC 6238 TOTP 2FA:** Two-factor authentication supported using standard authenticator apps (Google Authenticator, Microsoft Authenticator) with AES-256-GCM encrypted seeds.
3. **No Private Secrets in Frontend:** No database passwords, JWT private keys, or cloud credentials are exposed to client-side bundles (`NEXT_PUBLIC_*`).
4. **Fail-Closed Storage Security:** In production, missing storage credentials trigger `DisabledStorageProvider` rejecting uploads with HTTP 503 rather than saving unauthenticated files to local container storage.
5. **Path Traversal & MIME Validation:** Uploaded attachments are strictly validated against whitelisted MIME types and sanitized keys (`^[a-zA-Z0-9_\-\.\/]+$`), rejecting `../` traversal sequences.

---

## 36. Known Limitations

1. **Render Free Tier Cold-Start:** Render free tier instances spin down after periods of inactivity. Initial API requests may experience a ~45–50 second cold-start delay while the instance boots.
2. **Upstash Redis Fallback:** When `REDIS_URL` is omitted, the backend gracefully falls back to an in-memory token-bucket rate limiter.
3. **Sandbox Payment Simulator:** The payment gateway operates strictly in simulated test mode to prevent real financial transactions during evaluation.
4. **TRAI DLT SMS Sandbox Mode:** Live SMS dispatch requires registered Indian telecom sender IDs; sandbox fallbacks log notifications cleanly to the backend server console.
5. **ML Service Deployment:** The Python ML forecasting service is a standalone microservice designed for local or dedicated container deployment.

---

# Section F — Hackathon

## 37. Judge Demonstration Guide

Follow this 5-minute structured demonstration flow to evaluate the core capabilities of MediNexa:

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#EFF6FF', 'primaryTextColor': '#172554', 'primaryBorderColor': '#2563EB', 'lineColor': '#2563EB', 'secondaryColor': '#F8FAFC', 'tertiaryColor': '#FFFFFF', 'edgeLabelBackground':'#FFFFFF', 'clusterBkg': '#F8FAFC', 'clusterBorder': '#CBD5E1'}}}%%
flowchart LR
    S1["1. Landing Page"] --> S2["2. Live Beds"]
    S2 --> S3["3. Patient Demo"]
    S3 --> S4["4. OPD Booking"]
    S4 --> S5["5. Doctor Portal"]
    S5 --> S6["6. Hospital Admin"]
    S6 --> S7["7. Super Admin"]
```

### Step-by-Step Evaluator Walkthrough:

1. **Explore Landing Page:** Visit [`https://medinexa-medicalweb.vercel.app`](https://medinexa-medicalweb.vercel.app) to review the platform overview, key statistics, and feature highlights in clean Light Mode.
2. **Inspect Live Bed Availability:** Navigate to **Live Beds** in the header or visit `/portal/live-beds`. Observe real-time occupancy across Hospital A (Delhi), Hospital B (Mumbai), and Greater Noida Super-Speciality. Select individual hospitals from the dropdown to view ward-level breakdowns (ICU, Emergency, General).
3. **Launch Patient Portal:** Navigate to `/patient` and click **Demo Account**. Select `Aarav Sharma (Diabetic Chronic Care)` to instantly enter the Patient Health OS without typing credentials.
4. **Book Doctor Consultation:** Navigate to `/portal/appointments`, select a specialist (e.g., Cardiology), pick an available time slot, and confirm. Notice the generated OPD queue confirmation token.
5. **Inspect Guardian Health Score:** Navigate to `/portal/health-score` to view the 0–100 biometric wellness rating and trend graphs.
6. **Review Medical Records Vault:** Navigate to `/portal/medical-records` to inspect private document storage and signed download URL behavior.
7. **Simulate Sandbox Payment:** Navigate to `/portal/billing` and execute a 1-click simulated payment checkout. Observe that the transaction is cleanly labeled as Sandbox Mode.
8. **Launch Hospital Portal:** Visit `/hospital` and click **Demo Account**. Select `Dr. Rajesh Singh (Hospital A - Cardiologist)` to enter the Doctor Clinical Workstation.
9. **Examine Outpatient Queue:** Review the live OPD queue, open patient records, and inspect SOAP clinical encounter note documentation.
10. **Explore Inpatient Admissions:** Switch to `Sunita Singh (Hospital Admin)` via the demo accounts switcher to inspect the Executive Command Center, Ward Admissions, and Bed Allocation dashboards.
11. **Test AI Clinical Assistant:** Open `/portal/ai-assistant` and enter a medical query (e.g., *"What should I do for chest pain?"*). Notice the cardiology triage recommendation and mandatory medical safety disclaimer.
12. **Review Super Admin Governance:** Visit `/super-admin` to view multi-hospital registry oversight, facility licensing, and enterprise audit logging.

---

## 38. Future Scope

* **ABDM Milestones M4 & M5:** Direct integration with national Health Information Exchange & Consent Manager (HIE-CM).
* **Edge AI Offline Triage:** WebAssembly-based client-side ML models for offline rural clinic triage when internet connectivity is intermittent.
* **Smart Ambulance V2X Integration:** Automated traffic signal preemption protocols for emergency trauma vehicles in transit.
* **FHIR R4 Interoperability:** Native HL7 FHIR R4 schema export for seamless cross-border electronic health record exchange.

---

## 39. Contribution Guidelines

Contributions are welcome! Please follow these standards:

1. Fork the repository and create a feature branch (`git checkout -b feature/amazing-feature`).
2. Run automated test suites and typechecks before committing:
   ```bash
   npm test --workspace=@medinexa/api
   npm run typecheck --workspace=@medinexa/web
   ```
3. Commit cleanly using Conventional Commits (`git commit -m 'feat: add feature description'`).
4. Push to your branch and open a Pull Request.

---

## 40. License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
