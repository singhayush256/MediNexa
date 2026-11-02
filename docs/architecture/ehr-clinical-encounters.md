# MediNexa Day 7 Architecture: EHR & Clinical Encounter Foundation

## 1. Core EHR Relational Model

```
PatientProfile (1) ───< ClinicalEncounter (N) ───> Admission (Optional 1)
                            │
                            ├───< ClinicalNote (N) ───< ClinicalNoteVersion (N)
                            │
                            ├───< VitalSign (N)
                            │
                            └───< Diagnosis (N)
```

- **`ClinicalEncounter`**: Primary encounter entity (`INPATIENT`, `OUTPATIENT`, `EMERGENCY`, `CONSULTATION`, `FOLLOW_UP`), linked to `PatientProfile`, `DoctorProfile`, `Facility`, `Department`, and optionally `Admission`.
- **`ClinicalNote`**: Immutable clinical documentation with signing and amendment history.
- **`VitalSign`**: Discrete physiological measurements logged over time (temperature, heart rate, BP, SpO2, weight, height).
- **`Diagnosis`**: Clinical conditions recorded with type (`PRIMARY`, `SECONDARY`, `WORKING`, `DIFFERENTIAL`) and status (`ACTIVE`, `RESOLVED`, `CANCELLED`).

---

## 2. Note Immutability & Amendment Strategy

1. **Draft Notes**: Notes begin in `DRAFT` status and can be edited directly by the author.
2. **Signing**: Invoking `POST /notes/:id/sign` sets `status = SIGNED` and locks content. Direct modifications to signed notes return `409 Conflict`.
3. **Amendments**: Invoking `POST /notes/:id/amend` creates a `ClinicalNoteVersion` record preserving the prior content, sets `status = AMENDED`, and updates note content with the amendment reason.

---

## 3. Patient Ownership & Facility Isolation

- **Patient Ownership**: `PATIENT` role users can only access their own clinical records (`/patients/me/clinical-timeline`). Attempts to query another patient's timeline return `403 Forbidden`.
- **Facility Isolation**: Providers at Hospital A cannot query or modify clinical records belonging to Hospital B without explicit authorization (`403 Forbidden`).
