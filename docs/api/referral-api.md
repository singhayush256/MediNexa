# MediNexa Hospital Referral & Network REST API Documentation

## Endpoints Summary

### 1. Query Network Capacity
- **Method**: `GET`
- **URL**: `/api/v1/network/facilities/capacity`
- **Auth**: Bearer JWT

### 2. Create Referral
- **Method**: `POST`
- **URL**: `/api/v1/referrals`
- **Auth**: Bearer JWT (`DOCTOR`, `HOSPITAL_ADMIN`, `MEDINEXA_ADMIN`)
- **Body**:
  ```json
  {
    "patientId": "patient-uuid",
    "sourceFacilityId": "hosp-a-uuid",
    "destinationFacilityId": "hosp-b-uuid",
    "reason": "ICU Support",
    "clinicalSummary": "Patient requires mechanical ventilation",
    "urgency": "EMERGENCY"
  }
  ```

### 3. Accept Referral & Reserve Destination Bed
- **Method**: `POST`
- **URL**: `/api/v1/referrals/:id/accept`
- **Body**: `{ "destinationBedId": "bed-uuid" }`
- **Concurrency**: Returns `409 Conflict` if destination bed is not available.

### 4. Cross-Facility Patient Transfer
- `POST /api/v1/referrals/:id/start-transfer` -> Status `IN_TRANSIT`.
- `POST /api/v1/transfers/:id/complete` -> Creates destination admission, assigns destination bed (`OCCUPIED`), preserves source historical admission.

### 5. Medical Record Transfer Authorization
- `POST /api/v1/referrals/:id/record-access-request`
- `POST /api/v1/referrals/:id/record-access-authorize`
- `POST /api/v1/referrals/:id/record-access-revoke`
- `GET /api/v1/referrals/:id/transferable-records` -> Returns authorized categories. Returns `403 Forbidden` if unauthorized.
