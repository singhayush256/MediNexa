# MediNexa API Overview & Standard Guidelines

## Base API URL & Versioning

- Base URL (Dev): `http://localhost:3001`
- Versioning Strategy: URL Prefix `/api/v1`
- Protocol: REST over HTTPS (HTTP for local dev)

---

## Core Endpoints

### 1. System Health (`GET /api/v1/health`)
Provides service liveness and health status.

#### Response (`200 OK`):
```json
{
  "status": "ok",
  "service": "MediNexa API",
  "version": "1.0.0"
}
```

---

## Day 2 Authentication & Identity Endpoints (`/api/v1/auth/*`)

### 2. User Registration (`POST /api/v1/auth/register`)
Public self-registration for standard roles (`PATIENT`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `LAB_STAFF`, `PHARMACY_STAFF`, `AMBULANCE_DRIVER`).

*Note*: Privileged administrative roles (`HOSPITAL_ADMIN`, `MEDINEXA_ADMIN`) are prohibited from public registration and return `400 Bad Request`.

#### Request Body:
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@medinexa.local",
  "password": "Password123!",
  "role": "DOCTOR"
}
```

#### Response (`201 Created`):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u0a1b2c3-d4e5-6789-0123-456789abcdef",
    "email": "jane.doe@medinexa.local",
    "firstName": "Jane",
    "lastName": "Doe",
    "status": "ACTIVE",
    "role": {
      "code": "DOCTOR",
      "name": "Doctor / Physician"
    }
  }
}
```

---

### 3. User Login (`POST /api/v1/auth/login`)
Authenticates active user credentials and returns a JWT access token.

#### Request Body:
```json
{
  "email": "jane.doe@medinexa.local",
  "password": "Password123!"
}
```

#### Response (`200 OK`):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u0a1b2c3-d4e5-6789-0123-456789abcdef",
    "email": "jane.doe@medinexa.local",
    "status": "ACTIVE",
    "role": {
      "code": "DOCTOR"
    }
  }
}
```

---

### 4. Authenticated User Profile (`GET /api/v1/auth/me`)
Requires `Authorization: Bearer <token>` header. Returns current user details.

#### Response (`200 OK`):
```json
{
  "id": "u0a1b2c3-d4e5-6789-0123-456789abcdef",
  "email": "jane.doe@medinexa.local",
  "firstName": "Jane",
  "lastName": "Doe",
  "status": "ACTIVE",
  "role": {
    "code": "DOCTOR",
    "name": "Doctor / Physician"
  }
}
```

---

### 5. User Logout (`POST /api/v1/auth/logout`)
Requires `Authorization: Bearer <token>` header. Invalidates local session token.

---

## Development / Test RBAC Endpoints

- **`GET /api/v1/auth/test/patient`**: Allowed Roles: `PATIENT`, `MEDINEXA_ADMIN`.
- **`GET /api/v1/auth/test/doctor`**: Allowed Roles: `DOCTOR`, `MEDINEXA_ADMIN`.
- **`GET /api/v1/auth/test/admin`**: Allowed Roles: `HOSPITAL_ADMIN`, `MEDINEXA_ADMIN`.

#### Error Behavior:
- Unauthenticated Request -> `401 Unauthorized`
- Unauthorized Role -> `403 Forbidden`
