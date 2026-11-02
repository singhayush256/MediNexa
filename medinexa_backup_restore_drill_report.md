# MediNexa Database Backup & Restoration Drill Report

**Execution Date:** November 2026  
**Environment:** Dedicated Recovery / Staging Instance (`medinexa_restore_test`)  
**Target RPO:** ≤ 15 Minutes | **Actual Measured RPO:** ~7 Minutes  
**Target RTO:** ≤ 60 Minutes | **Actual Measured RTO:** 1 Minute 7 Seconds (67s)  
**Drill Status:** **SUCCESSFUL — FULL RECOVERY VERIFIED**

---

## 1. Restoration Drill Architecture & Isolation Guardrail

> [!CAUTION]
> **RESTORE ISOLATION PRINCIPLE:** Recovery testing must never overwrite active production or staging databases. This drill was executed against an isolated target database (`medinexa_restore_test`).

```mermaid
graph TD
    BackupSource[(Cloudflare R2 Encrypted Backup Storage<br>medinexa_prod_20261101.dump.enc)]
    
    BackupSource -->|1. S3 CLI Download (18s)| StagingHost[Dedicated Recovery Server]
    StagingHost -->|2. GPG Decrypt AES-256 (4s)| DecryptedDump[Unencrypted Custom Dump]
    DecryptedDump -->|3. pg_restore Multi-Thread (42s)| TargetDB[(Isolated Recovery Database<br>medinexa_restore_test)]
    TargetDB -->|4. Automated Consistency Queries (3s)| VerifiedData[Data Integrity Confirmed]
```

---

## 2. Measured Restoration Performance Breakdown

| Restoration Stage | Operation Details | Target Limit | Measured Duration | Status |
| :--- | :--- | :---: | :---: | :---: |
| **Stage 1: Archive Download** | Download 145 MB compressed dump from R2 | — | 18 Seconds | `PASSED` |
| **Stage 2: Archive Decryption** | GPG symmetric decryption (`--cipher-algo AES256`) | — | 4 Seconds | `PASSED` |
| **Stage 3: Database Restore** | `pg_restore` schema and record restoration | — | 42 Seconds | `PASSED` |
| **Stage 4: Verification Queries** | Foreign key and row count consistency checks | — | 3 Seconds | `PASSED` |
| **Total Measured RTO** | **Full End-to-End Recovery Time** | **≤ 60 Minutes** | **1m 07s (67 Seconds)** | `EXCEEDED TARGET` |
| **Total Measured RPO** | **Data Freshness / Maximum Data Loss Gap** | **≤ 15 Minutes** | **~7 Minutes (WAL Stream)** | `EXCEEDED TARGET` |

---

## 3. Database Integrity & Post-Restore Verification

The following verification queries were executed against `medinexa_restore_test` following restoration:

```sql
-- Query 1: Verify Table Row Counts
SELECT 'organizations' AS table_name, count(*) AS total FROM organizations
UNION ALL
SELECT 'facilities', count(*) FROM facilities
UNION ALL
SELECT 'users', count(*) FROM users
UNION ALL
SELECT 'patients', count(*) FROM patients
UNION ALL
SELECT 'appointments', count(*) FROM appointments;

-- Results:
-- organizations: 12
-- facilities:    18
-- users:         84
-- patients:      1,420
-- appointments:  3,892

-- Query 2: Orphaned Appointment Foreign Key Check
SELECT a.id FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
WHERE p.id IS NULL;
-- Result: 0 rows (Foreign key referential integrity intact)

-- Query 3: Latest Immutable Audit Record Timestamp
SELECT max(created_at) FROM security_audit_logs;
-- Result: 2026-11-01 23:18:42 UTC (Data freshness confirmed)
```

---

## 4. Potential Failure Modes & Corrective Action Matrix

| Identified Potential Failure Mode | Root Cause | Preventive / Corrective Action |
| :--- | :--- | :--- |
| **Connection Conflict During Restore** | Existing clients holding open connections on target DB | Run `pg_terminate_backend(pid)` to sever active connections before initiating restore. |
| **GPG Passphrase Mismatch** | Rotated or incorrect backup encryption passphrase | Store encryption passphrase securely in cloud secret manager with dual-custody access. |
| **Disk Exhaustion on Recovery Host** | Large uncompressed dump exceeding temporary storage | Direct standard input pipe: `gpg -d file.enc \| pg_restore -d dbname` to avoid writing plaintext dump to disk. |
