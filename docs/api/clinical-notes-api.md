# MediNexa Clinical Notes & Vitals API Specification

## Endpoints

| Endpoint | Method | Role Guard | HTTP Statuses | Description |
| :--- | :---: | :---: | :---: | :--- |
| `/api/v1/encounters/:id/notes` | `POST` | Provider, Staff | `201`, `400`, `401`, `403`, `404` | Creates draft clinical note |
| `/api/v1/notes/:id` | `PATCH` | Note Author | `200`, `403`, `404`, `409` | Updates draft note content (rejected if `SIGNED` / `AMENDED`) |
| `/api/v1/notes/:id/sign` | `POST` | Provider, Staff | `200`, `401`, `403`, `404`, `409` | Signs and locks clinical note |
| `/api/v1/notes/:id/amend` | `POST` | Provider, Staff | `200`, `400`, `401`, `403`, `404` | Amends signed note; preserves prior version in audit history |
| `/api/v1/encounters/:id/vitals` | `POST` | Provider, Staff | `201`, `400`, `401`, `403`, `404` | Records physiological vital signs |
| `/api/v1/encounters/:id/diagnoses` | `POST` | Doctor, Admin | `201`, `400`, `401`, `403`, `404` | Records clinical diagnosis |
