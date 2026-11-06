# 🏥 MEDINEXA — MASTER HACKATHON DEMO & JUDGE EVALUATION GUIDE

> **Tagline:** *Your Healthcare, Connected.*
> **Official Frontend:** [https://medinexa-medicalweb.vercel.app](https://medinexa-medicalweb.vercel.app)
> **Backend API:** [https://medinexa-duplicate-api.onrender.com/api/v1](https://medinexa-duplicate-api.onrender.com/api/v1)
> **Demo Time Required:** 5 to 7 Minutes

This guide provides a comprehensive, step-by-step presentation script designed for hackathon judges, technical evaluators, and recruiters.

---

## ⚡ 1-CLICK DEMO SHORTCUTS (NO MANUAL TYPING NEEDED)

MediNexa features built-in, pre-seeded 1-click persona switchers on both primary portals:

| Portal | Entry URL | 1-Click Demo Launcher | Pre-Configured Personas |
| :--- | :--- | :--- | :--- |
| **Patient Portal** | [`/patient`](https://medinexa-medicalweb.vercel.app/patient) | Click **`Demo Account`** button | 10 Verified Clinical Patient Personas (Aarav Sharma, Priya Patel, etc.) |
| **Hospital Portal**| [`/hospital`](https://medinexa-medicalweb.vercel.app/hospital)| Click **`Demo Account`** button | 16 Clinical & Operational Personas (Doctors, Nurses, Admins, etc.) |

---

## 🎬 16-STAGE DEMO WALKTHROUGH SCRIPT

### Stage 1: Public Front-Door & Modern Landing Page (30s)
1. Open [`https://medinexa-medicalweb.vercel.app`](https://medinexa-medicalweb.vercel.app).
2. Point out:
   * Professional enterprise healthcare SaaS styling with dark/light mode toggle.
   * Key metric counters: Outpatient queues, bed telemetry, specialist availability.
   * Clear dual gateway buttons: **Patient Portal** and **Hospital Portal**.

---

### Stage 2: Real-Time Network Bed Availability Telemetry (45s)
1. Click **`Live Beds`** in the navigation header, or navigate to [`/portal/live-beds`](https://medinexa-medicalweb.vercel.app/portal/live-beds).
2. Point out the live telemetry badges:
   * **Live Socket Connected:** 15-second auto-synchronization and instant WebSocket updates.
   * **Hospital Selector Dropdown:** Open the dropdown and show all 3 canonical network hospitals:
     * `MediNexa Central Super Specialty Hospital (Delhi)` (28 beds free)
     * `MediNexa City Hospital & Trauma Centre (Mumbai)` (22 beds free)
     * `MediNexa Multi-Speciality Hospital (Greater Noida)` (22 beds free)
3. Select any hospital from the dropdown:
   * Observe the view smoothly transition from network-wide aggregates to that hospital's specific departmental breakdown: **Critical Care (ICU)**, **General Wards**, and **Emergency & Trauma**.

---

### Stage 3: Patient Portal Entry via 1-Click Demo (30s)
1. Navigate to [`/patient`](https://medinexa-medicalweb.vercel.app/patient).
2. Point out the aligned action buttons:
   * `Existing Patient Login` (for registered credentials)
   * `Register New Patient Account` (for self-onboarding)
   * **`Demo Account`** (amber button with ✨ Sparkles icon)
3. Click **`Demo Account`**:
   * The `PatientDemoSwitcherModal` opens showing 10 authentic patient profiles.
   * Click **`Aarav Sharma`** (UHID: `UHID-2026-100101`, Cardiac follow-up).
   * Notice instant session activation with zero credential typing, smoothly navigating to `/portal`.

---

### Stage 4: Patient Health OS Dashboard (30s)
1. You are now inside the Patient Health OS (`/portal`).
2. Highlight:
   * Patient Banner showing UHID, age, blood group (`B+`), and Guardian Health Score (`88/100`).
   * Upcoming appointment card, active medication alert, and recent lab results.
   * Live Bed Tracker card displaying real-time hospital occupancy.

---

### Stage 5: Booking a Specialist Doctor Appointment (45s)
1. In the sidebar or dashboard quick links, click **`Book Appointment`** or visit [`/portal/appointments`](https://medinexa-medicalweb.vercel.app/portal/appointments).
2. Select:
   * Specialty: `Cardiology`
   * Doctor: `Dr. Rajesh Singh (Senior Interventional Cardiologist)`
   * Date & Slot: Choose today or tomorrow, morning slot.
3. Click **`Confirm Appointment`**:
   * Observe instant booking confirmation with token number `#TKN-2026-01` and OPD queue placement.

---

### Stage 6: Guardian Health Score & Deterioration Early Warnings (30s)
1. Navigate to [`/portal/health-score`](https://medinexa-medicalweb.vercel.app/portal/health-score).
2. Demonstrate:
   * Biometric gauge (0–100 scale) synthesizing heart rate, blood pressure, SpO2, and blood glucose.
   * AI deterioration risk classification (*Normal / Stable / Low Risk*).
   * 1-Click Emergency SOS button for high-risk cardiac events.

---

### Stage 7: Medical Records Vault & Supabase File Uploads (45s)
1. Navigate to [`/portal/medical-records`](https://medinexa-medicalweb.vercel.app/portal/medical-records).
2. Demonstrate:
   * Historical diagnostic reports, ECG tracings, and discharge summaries.
   * Click **`Upload Record`**: Select a sample medical PDF or image.
   * The file is uploaded to the private Supabase bucket (`medinexa-patient-documents`).
   * Click **`Download`**: Observe the backend minting a time-limited signed URL (1-hour expiry) protecting patient privacy.

---

### Stage 8: Conversational AI Health Assistant & Safety Interceptor (45s)
1. Click **`AI Assistant`** in the navigation or visit [`/portal/ai-assistant`](https://medinexa-medicalweb.vercel.app/portal/ai-assistant).
2. Test Scenario A (Safe OPD Query):
   * Ask: *"How do I prepare for a fasting lipid profile blood test?"*
   * The 4-tier AI cascade answers accurately with 12-hour fasting guidelines.
3. Test Scenario B (Clinical Safety Interception):
   * Ask: *"I took 8 tablets of Dolo 650 mg at once, what should I do?"*
   * Observe the safety guard intercepting immediately with a high-priority red alert: advising urgent medical attention and directing to call **108**.

---

### Stage 9: Simulated Sandbox Payment Demo (30s)
1. Navigate to [`/portal/billing`](https://medinexa-medicalweb.vercel.app/portal/billing).
2. Point out:
   * Outpatient OPD consultation bill (₹500 / ₹1,000).
   * Clear **`SANDBOX / DEMO PAYMENT`** label ensuring no real financial transactions.
3. Click **`Pay Now`**:
   * The simulated Razorpay checkout modal appears.
   * Click **`Simulate Successful Payment`**.
   * Instant invoice receipt generated with transaction reference ID `#TXN-2026-MED` and status updated to **`PAID`**.

---

### Stage 10: Inpatient Bed Reservation Workflow (30s)
1. Navigate to [`/portal/bed-bookings`](https://medinexa-medicalweb.vercel.app/portal/bed-bookings).
2. Select hospital: `MediNexa General Hospital (Hospital A)`.
3. Select ward type: `ICU Bed (Ventilator Supported)`.
4. Click **`Reserve Bed`**:
   * Bed hold is recorded, and network live bed counter updates live.

---

### Stage 11: Hospital Portal Entry via 1-Click Role Switcher (30s)
1. Open a new tab or click **`Switch to Hospital Portal`** in the header.
2. Navigate to [`/hospital`](https://medinexa-medicalweb.vercel.app/hospital).
3. Click **`Demo Account`** (amber button in hero or top navigation):
   * The `RoleSwitcherModal` opens showcasing all 16 hospital clinical personas.
   * Click **`Dr. Rajesh Singh (Hospital A Cardiologist)`**.
   * Session is activated instantly, routing to `/dashboard/doctor-appointments`.

---

### Stage 12: Doctor Clinical Workstation & SOAP Notes (45s)
1. You are on [`/dashboard/doctor-appointments`](https://medinexa-medicalweb.vercel.app/dashboard/doctor-appointments).
2. Point out:
   * Outpatient queue showing Aarav Sharma waiting.
   * Click on the patient row to open the consultation card.
   * Enter clinical SOAP notes:
     * **S (Subjective):** Patient reports mild exertional dyspnea.
     * **O (Objective):** BP 128/82, HR 74, SpO2 99%.
     * **A (Assessment):** Stable post-CABG recovery.
     * **P (Plan):** Continue Aspirin 75mg daily; order lipid profile.
   * Click **`Save Encounter`**.

---

### Stage 13: Nurse Station & Ward Bed Allocations (30s)
1. Open `RoleSwitcherModal` and switch to **`Priya Sharma (Hospital A Nurse)`**.
2. Navigate to [`/dashboard/nursing`](https://medinexa-medicalweb.vercel.app/dashboard/nursing).
3. Demonstrate:
   * Ward bed census (Bed A-101 to A-120).
   * Hourly vitals recording, temperature, pulse, and medication administration records (MAR).

---

### Stage 14: Central Pharmacy & Dispensary Workflow (30s)
1. Switch role to **`Vikram Patel (Chief Pharmacist)`**.
2. Navigate to [`/dashboard/pharmacy`](https://medinexa-medicalweb.vercel.app/dashboard/pharmacy).
3. Demonstrate:
   * E-prescriptions awaiting dispensing.
   * Drug inventory levels, batch numbers, and expiry alerts.
   * Click **`Dispense Medication`** to deduct inventory.

---

### Stage 15: Emergency Trauma & Ambulance Tracking (30s)
1. Switch role to **`Suresh Kumar (Ambulance Driver)`**.
2. Navigate to [`/dashboard/ambulance-driver`](https://medinexa-medicalweb.vercel.app/dashboard/ambulance-driver).
3. Demonstrate:
   * Active emergency ambulance dispatch unit `#AMB-01`.
   * Real-time GPS coordinates and route to the nearest emergency trauma center.

---

### Stage 16: Super Admin Enterprise Governance & Audit Vault (30s)
1. Switch role to **`Ayush Singh (Super Administrator)`**.
2. Navigate to [`/super-admin`](https://medinexa-medicalweb.vercel.app/super-admin) or [`/dashboard/admin/audit-logs`](https://medinexa-medicalweb.vercel.app/dashboard/admin/audit-logs).
3. Highlight:
   * Multi-facility network governance (Hospital A, Hospital B, Noida Wing).
   * System security audit log recording every login event, IP address, and role assumption.
   * Conclude with the unified architecture connecting all 16 clinical touchpoints.

---

## 🏆 KEY TALKING POINTS FOR JUDGES

1. **Enterprise Monorepo:** Next.js 14 App Router + NestJS 10 + Neon PostgreSQL + Prisma in strict TypeScript.
2. **Sub-100ms Telemetry:** Real-time hospital bed status updates via WebSockets and BroadcastChannel.
3. **Resilient AI Cascade:** 4-tier fallback ensures zero downtime and mandatory emergency safeguards.
4. **Zero-Trust Security:** RFC 6238 TOTP 2FA, AES-256-GCM encryption, and tenant IDOR protection.
5. **Demonstration Readiness:** Built-in 1-click personas eliminate demo friction.
