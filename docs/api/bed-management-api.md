# MediNexa Bed Management & Live Engine API Specification

## 1. Operational Endpoints

| Endpoint | Method | Role Guard | HTTP Statuses | Description |
| :--- | :---: | :---: | :---: | :--- |
| `/api/v1/beds/available` | `GET` | Public / Staff | `200` | Lists only beds with status `AVAILABLE` and `isActive: true` |
| `/api/v1/beds/:id/reserve` | `POST` | Admin, Receptionist, Nurse, Doctor | `201`, `400`, `401`, `403`, `404`, `409` | Reserves an available bed for a patient hold |
| `/api/v1/beds/:id/cancel-reservation` | `POST` | Admin, Receptionist, Nurse | `200`, `401`, `403`, `404`, `409` | Cancels active reservation and returns bed to `AVAILABLE` |
| `/api/v1/beds/:id/assign` | `POST` | Admin, Receptionist, Nurse | `201`, `400`, `401`, `403`, `404`, `409` | Assigns patient to bed, sets status `OCCUPIED` |
| `/api/v1/beds/:id/release` | `POST` | Admin, Receptionist, Nurse | `200`, `401`, `403`, `404`, `409` | Releases occupied bed, sets status `CLEANING` |
| `/api/v1/beds/:id/clean` | `POST` | Admin, Receptionist, Nurse | `200`, `400`, `401`, `403`, `404` | Marks bed cleaned, sets status `AVAILABLE` |
| `/api/v1/beds/:id/maintenance` | `POST` | Hospital Admin, MediNexa Admin | `200`, `401`, `403`, `404`, `409` | Places bed in `MAINTENANCE` or `OUT_OF_SERVICE` |
| `/api/v1/beds/:id/maintenance/complete` | `POST` | Hospital Admin, MediNexa Admin | `200`, `400`, `401`, `403`, `404` | Restores bed to `AVAILABLE` status |
| `/api/v1/beds/:id/history` | `GET` | Staff | `200`, `404` | Returns complete audit trail of state transitions |

---

## 2. HTTP Conflict Response (`409 Conflict`)

When a race condition occurs (e.g. competing reservation or assignment for the same bed):

```json
{
  "statusCode": 409,
  "message": "Bed 'BED-ICU-01' is not available for reservation or has been locked by another request.",
  "error": "Conflict"
}
```
