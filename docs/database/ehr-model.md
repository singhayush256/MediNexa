# MediNexa Day 7 Database EHR Model Documentation

## Relational Schema

```
PatientProfile (1) ───< ClinicalEncounter (N) ───> Admission (Optional 1)
                            │
                            ├───< ClinicalNote (N) ───< ClinicalNoteVersion (N)
                            │
                            ├───< VitalSign (N)
                            │
                            └───< Diagnosis (N)
```

---

## Field Specifications

### 1. `ClinicalEncounter`
- `id`: UUID (PK)
- `patient_id`: FK to `PatientProfile` (`onDelete: Restrict`)
- `doctor_id`: FK to `DoctorProfile` (`onDelete: Restrict`)
- `facility_id`: FK to `Facility` (`onDelete: Restrict`)
- `department_id`: FK to `Department` (`onDelete: Restrict`)
- `admission_id`: FK to `Admission` (Optional, `onDelete: SetNull`)
- `encounter_number`: String (Unique, e.g. `ENC-1723829103-912`)
- `encounter_type`: Enum `EncounterType` (`INPATIENT`, `OUTPATIENT`, `EMERGENCY`, `CONSULTATION`, `FOLLOW_UP`)
- `status`: Enum `EncounterStatus` (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`)
- `reason_for_visit`: String (Optional)
- `started_at`: DateTime (@default(now()))
- `ended_at`: DateTime (Optional)

### 2. `ClinicalNote` & `ClinicalNoteVersion`
- `ClinicalNote`: `id`, `encounter_id`, `author_id`, `note_type`, `content`, `status` (`DRAFT`, `SIGNED`, `AMENDED`), `signed_at`, `signed_by`.
- `ClinicalNoteVersion`: `id`, `note_id`, `version_number`, `content`, `reason`, `created_by`, `created_at`.

### 3. `VitalSign`
- `id`, `encounter_id`, `patient_id`, `recorded_by`, `recorded_at`, `temperature`, `heart_rate`, `respiratory_rate`, `systolic_bp`, `diastolic_bp`, `oxygen_saturation`, `weight`, `height`, `notes`.

### 4. `Diagnosis`
- `id`, `encounter_id`, `patient_id`, `recorded_by`, `diagnosis_code`, `diagnosis_name`, `description`, `diagnosis_type` (`PRIMARY`, `SECONDARY`, `WORKING`, `DIFFERENTIAL`), `status` (`ACTIVE`, `RESOLVED`, `CANCELLED`), `diagnosed_at`.
