# MediNexa Clinical Encounter & Timeline API Specification

## Endpoints

| Endpoint | Method | Role Guard | HTTP Statuses | Description |
| :--- | :---: | :---: | :---: | :--- |
| `/api/v1/encounters` | `POST` | Provider, Admin, Receptionist | `201`, `400`, `401`, `403`, `404` | Starts new clinical encounter |
| `/api/v1/encounters` | `GET` | Staff | `200` | Lists encounters filtered by `facilityId`, `departmentId`, `doctorId`, `patientId`, `status` |
| `/api/v1/encounters/:id` | `GET` | Staff, Patient (own) | `200`, `403`, `404` | Returns complete encounter with notes, vitals, and diagnoses |
| `/api/v1/encounters/:id/status` | `PATCH` | Staff | `200`, `400`, `403`, `404` | Updates encounter status (`SCHEDULED` -> `IN_PROGRESS` -> `COMPLETED`) |
| `/api/v1/patients/:patientId/clinical-timeline` | `GET` | Staff, Patient (own) | `200`, `403`, `404` | Aggregates chronological encounters, notes, vitals, and diagnoses |
| `/api/v1/patients/me/clinical-timeline` | `GET` | Patient | `200`, `403` | Patient self-service timeline endpoint |
