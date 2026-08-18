# MediNexa Laboratory & Diagnostics API Documentation

## Endpoints Summary

### 1. Lab Test Catalog
- `GET /api/v1/lab/tests` — List master lab test catalog items.
- `POST /api/v1/lab/tests` — Create new lab test catalog item (`LAB_STAFF`, `HOSPITAL_ADMIN`, `MEDINEXA_ADMIN`).
- `PATCH /api/v1/lab/tests/:id` — Update lab test catalog item details.

### 2. Lab Orders
- `POST /api/v1/lab/orders` — Create lab order linked to a `ClinicalEncounter` (`DOCTOR`).
- `GET /api/v1/lab/orders` — Search lab orders by `facilityId`, `patientId`, or `status`.
- `GET /api/v1/lab/orders/:id` — Fetch complete lab order details with items and specimens.
- `GET /api/v1/encounters/:id/lab-orders` — Fetch lab orders for an encounter.

### 3. Specimen Lifecycle
- `POST /api/v1/lab/orders/:id/collect` — Mark specimen collected (`NURSE`, `LAB_STAFF`).
- `POST /api/v1/lab/orders/:id/receive` — Receive specimen at laboratory (`LAB_STAFF`).
- `POST /api/v1/lab/orders/:id/process` — Mark specimen in processing (`LAB_STAFF`).
- `POST /api/v1/lab/orders/:id/reject` — Reject specimen with reason (`LAB_STAFF`).

### 4. Lab Results & Verification
- `POST /api/v1/lab/items/:itemId/result` — Record preliminary lab result (`LAB_STAFF`).
- `POST /api/v1/lab/results/:id/verify` — Verify and finalize lab result (`LAB_STAFF`, `409 Conflict` on concurrent finalization).
- `POST /api/v1/lab/results/:id/amend` — Amend finalized lab result, saving prior version in `LabResultVersion`.
- `GET /api/v1/patients/:patientId/lab-results` — Fetch final lab results for a patient (Patient ownership enforced).
