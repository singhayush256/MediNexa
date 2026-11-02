# MediNexa AI Assistant REST API Documentation

## Endpoint

- `POST /api/v1/ai/chat`
- Body:
  ```json
  {
    "message": "Show my upcoming appointments",
    "contextType": "Patient",
    "contextId": "patient-uuid"
  }
  ```
- **Safety Boundary**: The AI provides informational and administrative responses. It MUST NOT perform autonomous clinical diagnosis, prescribing, or treatment decisions.
