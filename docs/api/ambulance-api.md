# MediNexa Ambulance & Fleet REST API Documentation

## Endpoints Summary

### 1. List Ambulances
- **Method**: `GET`
- **URL**: `/api/v1/ambulances`
- **Auth**: Bearer JWT
- **Query Params**: `facilityId`

### 2. Create Ambulance
- **Method**: `POST`
- **URL**: `/api/v1/ambulances`
- **Auth**: Bearer JWT (`HOSPITAL_ADMIN`, `MEDINEXA_ADMIN`)
- **Body**:
  ```json
  {
    "vehicleNumber": "AMB-301",
    "registrationNumber": "NY-AMB-9901",
    "ambulanceType": "ADVANCED_LIFE_SUPPORT",
    "facilityId": "fac-uuid"
  }
  ```

### 3. Dispatch Ambulance
- **Method**: `POST`
- **URL**: `/api/v1/emergencies/:id/dispatch`
- **Auth**: Bearer JWT
- **Body**: `{ "ambulanceId": "amb-uuid", "driverId": "drv-uuid" }`
- **Concurrency**: Returns `409 Conflict` if ambulance or driver is unavailable.

### 4. Trip Lifecycle Actions
- `POST /api/v1/dispatches/:id/accept`
- `POST /api/v1/dispatches/:id/start`
- `POST /api/v1/dispatches/:id/arrive`
- `POST /api/v1/dispatches/:id/patient-onboard`
- `POST /api/v1/dispatches/:id/complete`

### 5. Telemetry & GPS Location
- **Method**: `POST`
- **URL**: `/api/v1/ambulances/:id/location`
- **Body**: `{ "latitude": 40.7128, "longitude": -74.0060 }`
- **Validation**: Lat -90 to 90, Lon -180 to 180. Returns `400 Bad Request` for invalid coordinates.
