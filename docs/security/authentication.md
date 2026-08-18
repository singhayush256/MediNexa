# MediNexa Authentication & RBAC Security Overview

## 1. Password Security Strategy

- **Algorithm**: `bcrypt` (Salt Rounds = 10)
- **Plaintext Protection**: Passwords are NEVER stored in plaintext under any circumstances.
- **API Exclusions**: `passwordHash` is excluded from all user DTOs and API responses (`toUserDto`).
- **Logging Policy**: Credentials, tokens, and password hashes are strictly prohibited from log outputs.

---

## 2. Token-Based Authentication Architecture

- **Token Type**: JSON Web Token (JWT)
- **Signing Algorithm**: HMAC SHA-256 (`HS256`)
- **Token Claims Payload**:
  - `sub`: User ID (UUID)
  - `email`: User Email
  - `role`: Assigned Role Code (e.g. `DOCTOR`, `PATIENT`, `MEDINEXA_ADMIN`)
  - `status`: User Account Status (`ACTIVE`, `SUSPENDED`, `DISABLED`)
  - `organizationId`: Associated Facility ID
- **Token Storage**:
  - Web Client: `localStorage` and `SameSite=Lax` cookie.
  - Request Transport: `Authorization: Bearer <token>` header.

---

## 3. Account Status Enforcement

All user accounts have a status field:
- `ACTIVE` — Authorized for login.
- `SUSPENDED` — Temporarily locked out (returns `401 Unauthorized`).
- `DISABLED` — Permanently deactivated (returns `401 Unauthorized`).

---

## 4. Role-Based Access Control (RBAC) Architecture

MediNexa utilizes database-backed roles rather than hardcoded string logic in domain controllers.

### Application Roles Matrix
1. `PATIENT` — Patient access portal
2. `DOCTOR` — Physician & clinical provider access
3. `NURSE` — Nursing & clinical staff access
4. `RECEPTIONIST` — Front desk registration & intake
5. `LAB_STAFF` — Pathology & laboratory staff
6. `PHARMACY_STAFF` — Pharmacy management staff
7. `AMBULANCE_DRIVER` — Emergency response & dispatch
8. `HOSPITAL_ADMIN` — Facility administrator (Privileged)
9. `MEDINEXA_ADMIN` — System administrator (Privileged)

### NestJS RBAC Guard Implementation
Endpoints utilize NestJS decorators and guards:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleCode.DOCTOR, RoleCode.MEDINEXA_ADMIN)
@Get('clinical-record')
```

---

## 5. HTTP Error Code Distinctions

- **`401 Unauthorized`**: Returned when request lacks valid authentication credentials (e.g. missing/invalid JWT token, expired session, incorrect login credentials, or non-ACTIVE account status).
- **`403 Forbidden`**: Returned when an authenticated user attempts to access an endpoint for which their assigned role lacks permission.
- **`400 Bad Request`**: Returned for invalid input parameters (e.g., malformed email, short password, or prohibited self-registration for administrative roles).

---

## 6. Privileged Role Registration Control

Self-registration (`POST /api/v1/auth/register`) is permitted for public roles (`PATIENT`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `LAB_STAFF`, `PHARMACY_STAFF`, `AMBULANCE_DRIVER`).

Public self-registration for privileged administrative roles (`HOSPITAL_ADMIN` and `MEDINEXA_ADMIN`) is **prohibited** and yields an immediate `400 Bad Request` error. Privileged roles require controlled administrative assignment.
