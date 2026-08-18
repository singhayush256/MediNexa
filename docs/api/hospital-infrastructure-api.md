# MediNexa Hospital Infrastructure API Specification

## 1. Ward Endpoints (`/api/v1/wards`)

### List Wards (`GET /api/v1/wards`)
- **Query Parameters**:
  - `facilityId`: Filter by facility ID
  - `departmentId`: Filter by department ID
  - `status`: Filter by status (`ACTIVE`, `INACTIVE`, `MAINTENANCE`)

### Ward Capacity Summary (`GET /api/v1/wards/:id/capacity`)
Returns total beds, total rooms, and bed status counts (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`, etc.).

### Create Ward (`POST /api/v1/wards`)
- **Restricted Access**: `@Roles('HOSPITAL_ADMIN', 'MEDINEXA_ADMIN')`
- **Relationship Validation**: `departmentId` must belong to the specified `facilityId`.
- **Payload**:
```json
{
  "facilityId": "fac-a-uuid",
  "departmentId": "dept-icu-uuid",
  "name": "ICU Ward 1",
  "code": "WARD-ICU-1",
  "wardType": "ICU",
  "floor": "Floor 3"
}
```

---

## 2. Room Endpoints (`/api/v1/rooms`)

### List Rooms (`GET /api/v1/rooms`)
- **Query Parameters**: `wardId`, `facilityId`, `status`

### Create Room (`POST /api/v1/rooms`)
- **Restricted Access**: `@Roles('HOSPITAL_ADMIN', 'MEDINEXA_ADMIN')`
- **Uniqueness Rule**: Room number must be unique within the specified ward.
- **Payload**:
```json
{
  "wardId": "ward-icu-uuid",
  "roomNumber": "ICU-101",
  "roomType": "ICU",
  "capacity": 2
}
```

---

## 3. Bed Endpoints (`/api/v1/beds`)

### List Beds (`GET /api/v1/beds`)
- **Query Parameters**: `facilityId`, `wardId`, `roomId`, `bedType`, `status`

### Create Bed (`POST /api/v1/beds`)
- **Restricted Access**: `@Roles('HOSPITAL_ADMIN', 'MEDINEXA_ADMIN')`
- **Default Status**: Operational beds default to `AVAILABLE`.
- **Uniqueness Rule**: Bed number must be unique within the specified room.
- **Payload**:
```json
{
  "roomId": "room-icu-101-uuid",
  "bedNumber": "BED-01",
  "bedType": "ICU",
  "status": "AVAILABLE"
}
```

---

## 4. Facility Infrastructure Capacity (`GET /api/v1/facilities/:id/capacity`)

Returns comprehensive facility infrastructure metrics.

### Sample Response (`200 OK`):
```json
{
  "facilityId": "fac-a-uuid",
  "facilityName": "MediNexa General Hospital (Hospital A)",
  "totalBeds": 50,
  "totalWards": 5,
  "totalRooms": 25,
  "statusCounts": {
    "AVAILABLE": 30,
    "OCCUPIED": 12,
    "RESERVED": 3,
    "CLEANING": 2,
    "MAINTENANCE": 2,
    "OUT_OF_SERVICE": 1
  }
}
```
