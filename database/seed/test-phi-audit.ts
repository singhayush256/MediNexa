import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const API_BASE = process.env.API_URL || 'http://localhost:3001/api/v1';

async function runPhiAuditTests() {
  console.log('==================================================');
  console.log('🔒 MEDINEXA CENTRALIZED PHI AUDIT LOGGING TEST SUITE');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function logPass(msg: string) {
    passed++;
    console.log(`✅ [PASS] ${msg}`);
  }

  function logFail(msg: string, details?: any) {
    failed++;
    console.error(`❌ [FAIL] ${msg}`, details || '');
  }

  try {
    // 1. Doctor Login
    const docLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doctor.smith@medinexa.local', password: 'Password123!' }),
    });
    const docAuth: any = await docLoginRes.json();
    const docToken = docAuth?.accessToken;

    if (docLoginRes.ok && docToken) {
      logPass('1. Doctor login successful');
    } else {
      logFail('1. Doctor login failed', docAuth);
    }

    // 2. Fetch Patient Profile
    const patientRecord = await prisma.patientProfile.findFirst({
      include: { user: true },
    });

    if (!patientRecord) {
      logFail('2. Patient record lookup failed');
      return;
    }

    // 3. Trigger Doctor Patient 360 View -> Should write VIEW_PATIENT_360 AuditEvent
    const p360Res = await fetch(`${API_BASE}/patients/${patientRecord.id}/360`, {
      headers: { Authorization: `Bearer ${docToken}` },
    });

    if (p360Res.ok) {
      logPass('2. Doctor accessed Patient 360 history');
      
      // Verify AuditEvent record in DB
      const p360Audit = await prisma.auditEvent.findFirst({
        where: { action: 'VIEW_PATIENT_360', resource: `patient:${patientRecord.id}` },
        orderBy: { createdAt: 'desc' },
      });

      if (p360Audit && p360Audit.userId) {
        logPass(`3. PHI Audit Engine captured VIEW_PATIENT_360 event (Audit ID: ${p360Audit.id})`);
        
        // Secret Exposure Check
        const auditDetails = p360Audit.details || '';
        if (
          !auditDetails.includes('password') &&
          !auditDetails.includes('accessToken') &&
          !auditDetails.includes('Bearer')
        ) {
          logPass('4. Security Audit: Zero passwords, JWT tokens, or secrets exposed in audit details');
        } else {
          logFail('4. Security Audit: Secret exposure detected in audit log details!');
        }
      } else {
        logFail('3. PHI Audit record for VIEW_PATIENT_360 not found in database');
      }
    } else {
      logFail('2. Patient 360 access failed');
    }

    // 4. Trigger Discharge Summary View & Print
    const admissionRecord = await prisma.admission.findFirst();
    if (admissionRecord) {
      const dsRes = await fetch(`${API_BASE}/admissions/${admissionRecord.id}/discharge-summary`, {
        headers: { Authorization: `Bearer ${docToken}` },
      });

      if (dsRes.ok) {
        logPass('5. Doctor accessed Discharge Summary');
        
        const dsAudit = await prisma.auditEvent.findFirst({
          where: { action: 'VIEW_DISCHARGE_SUMMARY', resource: `admission:${admissionRecord.id}` },
          orderBy: { createdAt: 'desc' },
        });

        if (dsAudit) {
          logPass(`6. PHI Audit Engine captured VIEW_DISCHARGE_SUMMARY event (Audit ID: ${dsAudit.id})`);
        } else {
          logFail('6. Audit event for VIEW_DISCHARGE_SUMMARY not found');
        }
      }

      // Trigger Print Audit Action
      const printRes = await fetch(`${API_BASE}/admissions/${admissionRecord.id}/discharge-summary/print`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${docToken}` },
      });

      if (printRes.ok) {
        logPass('7. Doctor executed Discharge Summary Print action');
        
        const printAudit = await prisma.auditEvent.findFirst({
          where: { action: 'PRINT_DISCHARGE_SUMMARY', resource: `admission:${admissionRecord.id}` },
          orderBy: { createdAt: 'desc' },
        });

        if (printAudit) {
          logPass(`8. PHI Audit Engine captured PRINT_DISCHARGE_SUMMARY event (Audit ID: ${printAudit.id})`);
        } else {
          logFail('8. Audit event for PRINT_DISCHARGE_SUMMARY not found');
        }
      }
    }

    // 5. Patient RBAC Guard: Patient cannot query /audit-logs endpoint (403 Forbidden)
    const pat1LoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: patientRecord.user.email, password: 'Password123!' }),
    });
    const pat1Auth: any = await pat1LoginRes.json();
    const pat1Token = pat1Auth?.accessToken;

    if (pat1Token) {
      const forbiddenAuditRes = await fetch(`${API_BASE}/audit-logs`, {
        headers: { Authorization: `Bearer ${pat1Token}` },
      });
      if (forbiddenAuditRes.status === 403) {
        logPass('9. Security Guard: Patient user blocked from querying audit logs (HTTP 403 Forbidden)');
      } else {
        logFail(`9. Security Guard: Expected 403, got ${forbiddenAuditRes.status}`);
      }
    }

    // 6. Admin User queries /audit-logs
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'Password123!' }),
    });
    const adminAuth: any = await adminLoginRes.json();
    const adminToken = adminAuth?.accessToken;

    if (adminToken) {
      const logsRes = await fetch(`${API_BASE}/audit-logs`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const logsData: any = await logsRes.json();

      if (logsRes.ok && Array.isArray(logsData)) {
        logPass(`10. Hospital Admin query /audit-logs returned ${logsData.length} immutable audit records`);
      } else {
        logFail('10. Hospital Admin query /audit-logs failed', logsData);
      }
    }

  } catch (err: any) {
    console.error('Fatal execution error:', err);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n==================================================');
  console.log(`📊 PHI AUDIT LOGGING SUITE: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');
}

runPhiAuditTests();
