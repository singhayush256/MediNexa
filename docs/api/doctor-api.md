# MediNexa Doctor & Specialty API Specification

## Endpoints Summary

### 1. Medical Specialties List (`GET /api/v1/specialties`)
Public / Staff endpoint listing all registered medical specialties (e.g. Cardiology, Neurology, General Practice).

---

### 2. Clinical Doctor Directory (`GET /api/v1/doctors`)
Returns list of active doctor profiles.
- **Filter Query Parameters**:
  - `facilityId`: Filter by hospital/facility ID
  - `departmentId`: Filter by department ID
  - `specialtyId`: Filter by medical specialty ID

---

### 3. Authenticated Doctor Profile (`GET /api/v1/doctors/me`)
Requires `DOCTOR` JWT authentication. Returns doctor profile for current user.

---

### 4. Doctor Profile by ID (`GET /api/v1/doctors/:id`)
Returns doctor profile details including user, facility, department, and specialty relations.

---

### 5. Create Doctor Profile (`POST /api/v1/doctors`)
- **Restricted Access**: Administrative roles ONLY (`HOSPITAL_ADMIN`, `MEDINEXA_ADMIN`).
- **Security Rule**: Patients are prohibited from creating or self-assigning doctor profiles (`403 Forbidden`).

#### Request Payload:
```json
{
  "userId": "u0a1b2c3-d4e5-6789-0123-456789abcdef",
  "facilityId": "f1a2b3c4-d5e6-7890-1234-567890abcdef",
  "departmentId": "d1a2b3c4-d5e6-7890-1234-567890abcdef",
  "specialtyId": "s1a2b3c4-d5e6-7890-1234-567890abcdef",
  "licenseNumber": "MD-LICENSE-10001"
}
```

---

### 6. Update Doctor Profile (`PATCH /api/v1/doctors/:id`)
Updates permitted doctor profile fields (`specialtyId`, `licenseNumber`, `status`).
- **Security Rule**: Doctors cannot self-reassign to another facility or elevate user roles.
