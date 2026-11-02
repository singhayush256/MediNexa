# MediNexa Dashboard Analytics REST API Documentation

## Endpoints

- `GET /api/v1/analytics/overview`: Role-specific overview metrics
- `GET /api/v1/analytics/facility/:facilityId`: Facility-scoped operational metrics (`HOSPITAL_ADMIN`, `MEDINEXA_ADMIN`)
- `GET /api/v1/analytics/appointments`: Appointment volume & status breakdown
- `GET /api/v1/analytics/beds`: Live bed capacity & status breakdown
