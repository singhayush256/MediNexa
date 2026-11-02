# MediNexa Patient Admission & Discharge API Specification

## Endpoints

| Endpoint | Method | Role Guard | HTTP Statuses | Description |
| :--- | :---: | :---: | :---: | :--- |
| `/api/v1/admissions` | `POST` | Admin, Receptionist, Nurse | `201`, `400`, `401`, `403`, `404`, `409` | Creates new inpatient admission (optional bed assignment) |
| `/api/v1/admissions` | `GET` | Staff | `200` | Lists admissions filtered by `facilityId`, `departmentId`, `status`, `admissionType` |
| `/api/v1/admissions/:id` | `GET` | Staff, Patient (own) | `200`, `403`, `404` | Returns complete admission details, current bed, transfers, and status history |
| `/api/v1/admissions/:id/current-bed` | `GET` | Staff, Patient (own) | `200`, `403`, `404` | Returns current active bed location for admission |
| `/api/v1/patients/:patientId/admissions` | `GET` | Staff, Patient (own) | `200`, `403` | Returns all lifetime admissions for a patient |
| `/api/v1/admissions/:id/status` | `PATCH` | Staff | `200`, `400`, `403`, `404`, `409` | Updates admission status following lifecycle rules |
| `/api/v1/admissions/:id/discharge` | `POST` | Staff | `200`, `400`, `401`, `403`, `404`, `409` | Discharges admission and releases bed to `CLEANING` |
