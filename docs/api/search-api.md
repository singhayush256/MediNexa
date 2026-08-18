# MediNexa Global Search REST API Documentation

## Endpoint

- `GET /api/v1/search?q=query_string`
- Auth: Authenticated
- **Isolation**: Respects RBAC and facility scoping. Unrestricted clinical notes are excluded.
