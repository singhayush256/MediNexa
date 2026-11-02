# MediNexa Emergency REST API Documentation

## Endpoints Summary

### 1. Create Emergency Request
- **Method**: `POST`
- **URL**: `/api/v1/emergencies`
- **Auth**: Public or Authenticated
- **Body**:
  ```json
  {
    "callerName": "Jane Smith",
    "callerPhone": "+1-800-555-9111",
    "pickupAddress": "123 Main St, New York, NY",
    "emergencyType": "MEDICAL",
    "severity": "CRITICAL"
  }
  ```
- **Response**: `201 Created` with `EmergencyRequestDto`.

### 2. List Emergencies
- **Method**: `GET`
- **URL**: `/api/v1/emergencies`
- **Auth**: Bearer JWT (`DOCTOR`, `NURSE`, `RECEPTIONIST`, `AMBULANCE_DRIVER`, `HOSPITAL_ADMIN`, `MEDINEXA_ADMIN`)
- **Query Params**: `facilityId`, `status`
- **Response**: `200 OK` array of `EmergencyRequestDto`.

### 3. Triage Emergency
- **Method**: `POST`
- **URL**: `/api/v1/emergencies/:id/triage`
- **Auth**: Bearer JWT (`DOCTOR`, `NURSE`, `RECEPTIONIST`, `HOSPITAL_ADMIN`, `MEDINEXA_ADMIN`)
- **Body**: `{ "severity": "CRITICAL" }`
- **Response**: `200 OK`.

### 4. Update Emergency Status
- **Method**: `PATCH`
- **URL**: `/api/v1/emergencies/:id/status`
- **Auth**: Bearer JWT
- **Body**: `{ "status": "AMBULANCE_ASSIGNED" }`
- **Response**: `200 OK`. Invalid transitions return `400 Bad Request`.

### 5. Cancel Emergency
- **Method**: `POST`
- **URL**: `/api/v1/emergencies/:id/cancel`
- **Response**: `200 OK`.
