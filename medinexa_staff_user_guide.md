# MediNexa Hospital Staff Operations Manual: Role-Specific Clinical & Operational Guides

**Audience:** Hospital Front-Desk Staff, Clinicians, Nursing Personnel, Pharmacists, Laboratory Technicians, Billing Executives, and Emergency Teams  
**Platform Version:** 1.0.0 (Phase 4 Enterprise Pilot)

---

## Guide 1: Receptionist / Front Desk Operations

### Objective
Manage patient arrivals, assign permanent unique health IDs (UHID), book appointments, and issue queue tokens.

### Step-by-Step OPD Registration Workflow
1. **Search Existing Patient:**
   - Ask for patient Mobile Number or existing UHID (e.g., `AYU-4826-KM`).
   - Search in the top search bar. If found, click **Book Appointment**.
2. **Register New Patient:**
   - If not found, click **Register New Patient**.
   - Input Full Name, Gender, Date of Birth / Age, Mobile Number, and City.
   - Click **Save & Generate UHID**. The system assigns a permanent, tamper-proof UHID.
3. **Book Doctor Consultation:**
   - Select Department (e.g., *Cardiology*) and Doctor (e.g., *Dr. Sharma*).
   - Select Time Slot (e.g., *09:30 AM*).
   - Click **Confirm Booking**. The system enforces concurrency protection (no double-booking).
4. **Issue Queue Token:**
   - Click **Check-In Patient** when the patient arrives at the waiting hall.
   - The system generates an OPD Queue Token (e.g., `CARD-T014`).
   - Print or hand the thermal token slip to the patient.

---

## Guide 2: Doctor / Clinician Consultation Operations

### Objective
Conduct OPD consultations, review electronic health records, record clinical impressions, write digital prescriptions, and order diagnostic tests.

### Step-by-Step Clinical Consultation Workflow
1. **View Live OPD Queue:**
   - Log into **Doctor Workspace** (`/doctor/dashboard`).
   - Review your live patient queue showing Waiting, In-Consultation, and Completed tokens.
2. **Call Next Patient:**
   - Click **Call Patient** on the top queue entry.
   - The token status updates to `IN_CONSULTATION` in real time on the hospital waiting hall display.
3. **Review Medical History:**
   - Review previous hospital visits, chronic conditions, and past lab reports in the timeline view.
4. **Record Clinical Notes & Diagnosis:**
   - Record Chief Complaints, Physical Examination findings, and Provisional / Final Diagnosis (with ICD-10 search).
5. **Issue Digital Prescription (Rx):**
   - Click **Add Medication**.
   - Search by brand or generic drug name. Select dose, route (Oral, IV), frequency (1-0-1), and food timing (Before Food, After Food).
6. **Order Laboratory Investigations:**
   - Select required investigations (e.g., *Complete Blood Count (CBC)*, *Serum Creatinine*).
7. **Complete Consultation:**
   - Click **Complete Consultation**.
   - A digitally signed prescription is generated and transmitted simultaneously to the hospital Pharmacy and the patient's portal.

---

## Guide 3: Nurse / Inpatient Ward Operations

### Objective
Manage inpatient admissions, bed occupancy, vital signs recording, medication administration records (MAR), and doctor rounds.

### Step-by-Step Ward Workflow
1. **Inpatient Admission & Bed Allocation:**
   - When an admission order arrives from OPD/Emergency, open **IPD Admissions**.
   - Select the target ward and click an **Available Bed** (e.g., `GEN-W-04`).
   - Click **Allocate Bed**. The system atomically locks the bed to prevent double-occupancy.
2. **Record Patient Vitals:**
   - Click **Record Vitals** on the patient's bed card.
   - Record Blood Pressure (mmHg), Pulse (bpm), SpO2 (%), Temperature (°F), and Respiratory Rate.
   - Abnormal readings automatically highlight in amber/red alert banners.
3. **Medication Administration Record (MAR):**
   - Review scheduled doctor doses for the shift.
   - Administer medication and click **Mark Administered** with the exact timestamp.
4. **Execute Doctor Rounds:**
   - Accompany the physician during daily rounds.
   - Input doctor round notes and any updated treatment instructions.
5. **Discharge & Bed Sanitization:**
   - Following physician discharge order, click **Mark Discharged**.
   - Bed status shifts to `MAINTENANCE / CLEANING REQUIRED`.
   - Once housekeeping completes disinfection, click **Mark Clean & Available**.

---

## Guide 4: Pharmacist & Dispensary Operations

### Objective
Verify digital prescriptions, check drug availability, validate batch numbers and expiries, deduct stock, and dispense medicines.

### Step-by-Step Pharmacy Workflow
1. **Receive Prescription Order:**
   - Open **Pharmacy Dispensation Queue** (`/pharmacy/dashboard`).
   - Select incoming prescription by Patient UHID or Token Number.
2. **Verify Drug Availability & Batch Selection:**
   - Review prescribed medications.
   - The system automatically selects the earliest-expiry batch (FIFO rule).
   - Verify that the physical medicine strip matches the selected batch number and has not expired.
3. **Inventory Deduction:**
   - Click **Dispense Medication**.
   - The system executes an atomic stock ledger deduction. If stock drops below threshold, an automatic reorder alert is logged.
4. **Print Dispensation Label:**
   - Provide dosage instructions to the patient and issue the dispensation receipt.

---

## Guide 5: Laboratory Technician Operations

### Objective
Register ordered lab tests, collect specimens, generate barcoded sample vials, record test results, and release verified pathology reports.

### Step-by-Step Laboratory Workflow
1. **Specimen Registration & Barcode Generation:**
   - Open **Laboratory Worklist** (`/lab/dashboard`).
   - Search patient UHID. Click **Register Specimen** (e.g., Blood, Urine, Sputum).
   - The system generates a unique 12-digit specimen barcode (e.g., `LAB-2026-9042`).
   - Print barcode label and affix to collection tube.
2. **Sample Collection & Transit:**
   - Click **Mark Collected**. Tube moves to analyzer processing.
3. **Result Entry:**
   - Following analyzer output, enter numeric or qualitative values for each test parameter.
   - Values outside reference intervals are highlighted automatically.
4. **Pathologist Verification & Report Release:**
   - The duty pathologist reviews findings and clicks **Verify & Sign Report**.
   - PDF report is generated and uploaded to private Cloudflare R2 object storage.
   - Patient receives SMS notification to view report in portal.

---

## Guide 6: Billing & Accounts Executive Operations

### Objective
Generate transparent healthcare invoices, process insurance pre-authorizations, apply taxes, and reconcile payments.

### Step-by-Step Billing Workflow
1. **Generate OPD / Pharmacy Invoice:**
   - Open **Billing Console** (`/billing/dashboard`).
   - Click **New Invoice** → Select Patient UHID.
   - System automatically pulls unbilled doctor consultation fees, pharmacy dispensations, and lab tests.
2. **Apply Discounts & Insurance Copay:**
   - Input approved insurance TPA pre-authorization amount or corporate discount if applicable.
3. **Collect Payment & Reconcile:**
   - Select Payment Method: `CASH`, `UPI / QR CODE`, `CREDIT_CARD`, or `INSURANCE`.
   - Input transaction reference ID (for UPI/Card).
   - Click **Record Payment & Generate Tax Invoice**.
4. **Issue Discharge Financial Clearance:**
   - For IPD patients, verify that all daily bed charges, medications, and procedure fees are fully cleared.
   - Click **Issue Financial Clearance Certificate** to enable final physical discharge.

---

## Guide 7: Ambulance & Emergency Operations

### Objective
Manage emergency patient intake, rapid triage scoring, and ambulance dispatch monitoring.

### Step-by-Step Emergency Workflow
1. **Emergency Intake & Triage:**
   - Open **Emergency Dashboard** (`/emergency/dashboard`).
   - Register incoming patient as `EMERGENCY_WALKIN` or `AMBULANCE_ARRIVAL`.
   - Assign Emergency Triage Level:
     - **RED (Resuscitation / Immediate):** Cardiac arrest, severe trauma, massive hemorrhage.
     - **YELLOW (Emergent / Rapid):** Moderate respiratory distress, severe fractures.
     - **GREEN (Non-Urgent):** Minor injuries, stable vitals.
2. **Bed & Trauma Bay Allocation:**
   - Assign patient immediately to Emergency Trauma Bay.
   - Alert on-call Emergency Physician and Intensive Care team.
3. **Ambulance Tracking & Telemetry:**
   - Open **Ambulance Telemetry Console** (`/ambulance/tracking`).
   - Review dispatched vehicle status, driver contact, and real-time transit telemetry.
   - Receive pre-hospital vitals streamed by paramedics before patient arrival.
