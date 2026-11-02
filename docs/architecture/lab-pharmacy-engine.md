# MediNexa Day 8 Architecture — Laboratory & Pharmacy Subsystem Engine

## 1. Overview

The **MediNexa Laboratory, Pharmacy, and Digital Prescription Engine** extends the Day 7 Clinical Encounter foundation by introducing multi-hospital lab orders, specimen tracking, result verification, medication catalog management, digital prescriptions, and pharmacy dispensing with strict concurrency protection.

```
Patient
  ↓
ClinicalEncounter
  ├────────────── LabOrder
  │                  ↓
  │              Specimen
  │                  ↓
  │              LabResult ──> LabResultVersion
  │
  └────────────── Prescription
                     ↓
                PrescriptionItem ──> Medication
                     ↓
                 Dispense
```

---

## 2. Laboratory Subsystem Architecture

### Specimen Lifecycle State Machine
```
ORDERED ──> COLLECTION_PENDING ──> COLLECTED ──> RECEIVED ──> PROCESSING ──> COMPLETED
ORDERED ───────────────────────────────────────────────────────────────────> CANCELLED
                                                 RECEIVED ──> REJECTED (Reason logged)
```

### Lab Result Verification & Versioning
1. **Preliminary Result Entry**: Lab staff log quantitative or qualitative results (`PRELIMINARY`).
2. **Verification**: Authorized lab personnel verify the result (`POST /api/v1/lab/results/:id/verify`), setting status to `FINAL`.
3. **Immutability & Amendments**: Once `FINAL`, direct edits return `409 Conflict`. Amendments (`POST /api/v1/lab/results/:id/amend`) save prior result values in `LabResultVersion` and set status to `AMENDED`.
4. **Concurrency Protection**: Competing finalizations lock on `resultStatus: PRELIMINARY`. Second request returns `409 Conflict`.

---

## 3. Pharmacy & Digital Prescription Architecture

### Prescription Lifecycle State Machine
```
DRAFT ──> ISSUED ──> PARTIALLY_DISPENSED ──> DISPENSED
ISSUED ──> CANCELLED
ISSUED ──> EXPIRED
```

### Mandatory Dispensing Concurrency Protection
- When dispensing (`POST /api/v1/pharmacy/prescriptions/:id/dispense`), the sum of previous `quantityDispensed` + new `quantity` is atomically checked against prescribed `quantity`.
- If `totalAttempted > prescribedQuantity`, the transaction aborts and returns `409 Conflict`. Total dispensed quantity can NEVER exceed prescribed quantity under concurrent load.

---

## 4. Facility Isolation & Security

- **Hospital Isolation**: Staff at Hospital A cannot modify Hospital B lab orders or dispense Hospital B prescriptions without explicit cross-facility authorization (`403 Forbidden`).
- **Patient Ownership**: Patients can view their own final lab results and issued prescriptions via `/patients/me/*` endpoints. Attempts to query another patient return `403 Forbidden`.
