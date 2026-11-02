# MediNexa Pharmacy & Digital Prescription API Documentation

## Endpoints Summary

### 1. Medication Master Catalog
- `GET /api/v1/medications` — List active master drug catalog items.
- `POST /api/v1/medications` — Create new medication catalog item (`PHARMACY_STAFF`, `HOSPITAL_ADMIN`, `MEDINEXA_ADMIN`).
- `PATCH /api/v1/medications/:id` — Update medication details.

### 2. Digital Prescriptions
- `POST /api/v1/prescriptions` — Create digital prescription linked to `ClinicalEncounter` (`DOCTOR`).
- `POST /api/v1/prescriptions/:id/issue` — Issue prescription (`DOCTOR`), locking items (`ISSUED`). Editing an issued prescription returns `409 Conflict`.
- `POST /api/v1/prescriptions/:id/cancel` — Cancel prescription (`DOCTOR`, `HOSPITAL_ADMIN`).
- `GET /api/v1/prescriptions` — Search prescriptions by `facilityId`, `patientId`, or `status`.
- `GET /api/v1/prescriptions/:id` — Fetch prescription details with items and dispense logs.
- `GET /api/v1/encounters/:id/prescriptions` — Fetch prescriptions for an encounter.

### 3. Pharmacy Dispensing Engine
- `POST /api/v1/pharmacy/prescriptions/:id/dispense` — Dispense medication units (`PHARMACY_STAFF`).
  - **Concurrency & Over-dispense Protection**: Atomic validation ensures `alreadyDispensed + requestedQty <= prescribedQty`. Returns `409 Conflict` if limit exceeded. Updates status to `PARTIALLY_DISPENSED` or `DISPENSED`.

### 4. Patient Prescriptions
- `GET /api/v1/patients/:patientId/prescriptions` — Fetch prescriptions for patient (Patient ownership enforced).
- `GET /api/v1/patients/me/prescriptions` — Patient self-service active prescriptions view.
