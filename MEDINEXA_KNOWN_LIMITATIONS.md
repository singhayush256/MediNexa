# ⚠️ MEDINEXA — HONEST SYSTEM LIMITATIONS & ARCHITECTURAL TRADEOFFS

In compliance with professional engineering standards and honest hackathon disclosure, this document transparently documents the genuine remaining technical limitations, hosting constraints, and architectural boundaries of **MediNexa**.

---

## 1. HOSTING & CLOUD INFRASTRUCTURE CONSTRAINTS

### A. Render Free-Tier Instance Sleep (Cold-Start Delay)
* **Limitation:** The backend API (`https://medinexa-duplicate-api.onrender.com`) is hosted on Render's managed tier. When inactive for >15 minutes, the instance spins down to zero.
* **Impact:** The very first HTTP request or WebSocket handshake after inactivity takes **45 to 55 seconds** to complete while the container boots and connects to the database.
* **Mitigation:** A health check ping or scheduled cron job can keep the instance warm during live judge evaluation. Subsequent requests execute with sub-100ms latency.

### B. Upstash Redis Fallback Mode
* **Limitation:** When `REDIS_URL` is omitted or temporarily unreachable, MediNexa does not crash. Instead, it transitions to an in-memory token bucket rate limiter.
* **Impact:** In multi-instance autoscaling scenarios, rate-limiting counters would be local to each container rather than globally shared.
* **Mitigation:** The application includes a production-tested Redis resilience adapter that seamlessly switches to distributed Redis as soon as valid credentials are provided.

---

## 2. EXTERNAL INTEGRATIONS & COMPLIANCE BOUNDARIES

### C. Signed URL 1-Hour Time Limit
* **Limitation:** Supabase Storage download URLs generated for patient lab reports and medical records expire after 3,600 seconds (1 hour).
* **Impact:** If a patient or evaluator leaves a download link open in a browser tab for over 60 minutes, reloading the link will yield an expired signature error.
* **Mitigation:** Re-clicking the "Download" or "View" button in the patient portal immediately mints a fresh signed URL with a new 1-hour window.

### D. TRAI DLT Registered SMS Gateway
* **Limitation:** Live Indian telecom SMS delivery requires an enterprise DLT registration, approved entity ID, and registered DLT template headers (e.g., `MDNEXA`).
* **Impact:** In public evaluation environments without active telecom provider credentials, outbound SMS messages are safely captured and logged to the backend console rather than sent over cellular networks.

### E. Sandbox Payment Mode
* **Limitation:** The payment workflow operates strictly in `DEMO / SANDBOX` simulation mode.
* **Impact:** Real Indian Rupee transactions, UPI collect requests, and physical credit card authorizations cannot be executed.
* **Mitigation:** This is an intentional security design choice for hackathon safety, preventing accidental charges or compliance liabilities.

---

## 3. CLINICAL & MEDICAL SCOPE

### F. Clinical AI Disclaimer
* **Limitation:** MediNexa's conversational AI assistant uses large language models (Claude 3.5 Sonnet, Gemini 1.5 Pro, GPT-4o) alongside deterministic clinical rules.
* **Impact:** It is an informational patient navigation and symptom triage tool, not a certified Class II/III medical diagnostic device.
* **Mitigation:** The system strictly intercepts high-risk scenarios (such as excessive drug dosages or acute chest pain), refusing treatment recommendations and directing users immediately to emergency emergency medical services (108).
