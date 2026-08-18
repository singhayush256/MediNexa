# MediNexa Database Backup & Disaster Recovery Strategy

## Executive Overview
This document specifies the PostgreSQL backup, restoration, automated schedule, encryption, and disaster recovery procedures for MediNexa staging and production databases.

---

## 1. PostgreSQL Backup Strategy

### Backup Utility
MediNexa databases use PostgreSQL's native `pg_dump` utility in custom compressed format (`.dump` / `.tar`).

### Daily Automated Backup Script (`backup-db.sh`)
```bash
#!/bin/bash
# MediNexa Database Automated Backup Script

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/medinexa"
BACKUP_FILE="${BACKUP_DIR}/medinexa_backup_${TIMESTAMP}.dump"

mkdir -p ${BACKUP_DIR}

# Execute pg_dump using DATABASE_URL environment variable
pg_dump -d "${DATABASE_URL}" -F c -b -v -f "${BACKUP_FILE}"

# Retention: Delete local backups older than 30 days
find ${BACKUP_DIR} -type f -name "*.dump" -mtime +30 -exec rm {} \;

echo "✅ Backup created successfully: ${BACKUP_FILE}"
```

---

## 2. Recovery & Restoration Protocol

### Disaster Recovery Procedure (`restore-db.sh`)
To restore a MediNexa PostgreSQL backup into a fresh or recovered database instance:

```bash
#!/bin/bash
# MediNexa Database Restoration Script

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./restore-db.sh /path/to/backup.dump"
  exit 1
fi

echo "⚠️ Restoring database from ${BACKUP_FILE}..."

# Drop existing connections and restore schema & data
pg_restore -d "${DATABASE_URL}" --clean --if-exists --no-owner --no-acl -v "${BACKUP_FILE}"

echo "✅ Database restoration complete."
```

---

## 3. Recommended Backup Frequencies

| Environment | Frequency | Retention Period | Storage Location |
| :--- | :--- | :--- | :--- |
| **Staging** | Daily snapshot | 7 Days | Encrypted Local / Object Storage Bucket |
| **Production** | Hourly WAL archiving + Daily Full | 30 Days + Monthly Archive | Multi-region Encrypted Object Storage (AES-256) |

---

## 4. Git Non-Commit Security Rules

> [!CAUTION]
> **CRITICAL SECURITY REQUIREMENT**:
> 1. Database dumps (`.sql`, `.dump`, `.tar`, `.bak`) must **NEVER** be committed to GitHub repositories or stored in public directories.
> 2. Database credentials (`DATABASE_URL`, passwords) must **NEVER** be logged in plain text during backup execution.
> 3. `.gitignore` explicitly includes `*.dump`, `*.sql`, `*.tar`, `*.bak`, and local backup directories.
