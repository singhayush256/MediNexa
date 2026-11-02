# MediNexa Cloudflare R2 Object Storage Integration & Security Report

**Service:** Cloudflare R2 Object Storage (S3-Compatible API)  
**Provider:** [`CloudflareR2Provider`](file:///c:/Users/Tushar/OneDrive/Desktop/MediNexa/apps/api/src/storage/providers/r2-storage.provider.ts)  
**SDK:** `@aws-sdk/client-s3` & `@aws-sdk/s3-request-presigner`  
**Test Suite:** `apps/api/test/storage-r2.spec.ts` & `apps/api/test/staging-infrastructure-integration.spec.ts`  
**Status:** **All Storage Security & IDOR Tests Passed (0 Errors)**

---

## 1. Storage Architecture & Privacy Boundaries

MediNexa stores clinical attachments (diagnostic lab reports, radiology images, patient ID proofs, discharge summaries) in private Cloudflare R2 buckets:

```mermaid
graph TD
    Client[Client Browser / Mobile Web] -->|1. Request Download URL| API[MediNexa API Gateway]
    API -->|2. Verify Facility & Patient RBAC| AuthCheck{Authorized?}
    AuthCheck -->|No| Reject[403 Forbidden / 404 Not Found]
    AuthCheck -->|Yes| S3Presigner[AWS S3 Presigner SDK]
    S3Presigner -->|3. Generate Signed URL (Max 15m TTL)| API
    API -->|4. Return Signed URL| Client
    Client -->|5. Direct HTTPS Download| R2Bucket[(Private Cloudflare R2 Bucket<br>ZERO Public Access)]
```

### Core Security Principles
1. **Zero Public Bucket Access:** Bucket ACL is strictly private. Direct unauthenticated access returns HTTP 403.
2. **Key Anonymization & PHI Protection:** Storage keys never contain patient names, diagnoses, or raw uploaded filenames:
   `facilities/:facilityId/patients/:patientId/:uuid.:ext`
3. **Fail-Closed Production Policy:** In `NODE_ENV=production`, if R2 credentials are missing, the server crashes immediately. Silent fallback to local disk on ephemeral cloud containers is strictly prohibited.

---

## 2. Storage Security & Protection Test Results

| Test Scenario | Security Requirement | Technical Implementation | Result |
| :--- | :--- | :--- | :---: |
| **Path Traversal Rejection** | Prevent directory traversal attacks (`../../etc/passwd`). | Regex sanitization removes relative path sequences before key construction. | **PASSED** |
| **Signed URL TTL Clamping** | Prevent long-lived signed URL leaks. | Presigner strictly clamps requested TTLs to maximum 900 seconds (15 minutes). | **PASSED** |
| **Dangerous Extension Rejection** | Prevent storage and execution of malware. | Files ending in `.exe`, `.sh`, `.bat`, `.cmd`, `.js`, `.jar`, `.scr` are rejected. | **PASSED** |
| **Upload Size Ceiling** | Prevent storage exhaustion and denial of service. | Enforces strict maximum 25 MB file size limit per upload. | **PASSED** |
| **Patient-to-Patient IDOR** | Prevent cross-patient record access. | Patient A cannot retrieve download URLs for documents belonging to Patient B. | **PASSED** |
| **Cross-Facility IDOR** | Prevent cross-hospital document leakage. | Hospital A staff cannot generate or access documents stored by Hospital B. | **PASSED** |
| **Production Fail-Closed** | Block unauthenticated production deployments. | Gateway throws fatal error on boot if R2 credentials missing in production. | **PASSED** |

---

## 3. Retention & Compliance Policy

- **Minimum Retention:** Under the Indian Medical Council (Professional Conduct, Etiquette and Ethics) Regulations, medical records must be preserved for a minimum of **3 years** from the commencement of treatment.
- **Object Lock:** Staging and production R2 buckets are configured with Object Lock (WORM - Write Once, Read Many) retention to prevent premature deletion or ransomware tampering.
