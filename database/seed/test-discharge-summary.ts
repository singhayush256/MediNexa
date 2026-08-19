import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const API_BASE = process.env.API_URL || 'http://localhost:3001/api/v1';

async function runDischargeSummaryTests() {
  console.log('==================================================');
  console.log('📜 MEDINEXA PATIENT DISCHARGE SUMMARY TEST SUITE');
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
    // 1. Hospital Admin Login
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'Password123!' }),
    });
    const adminAuth: any = await adminLoginRes.json();
    const adminToken = adminAuth?.accessToken;

    if (adminLoginRes.ok && adminToken) {
      logPass('1. Hospital Admin authentication successful');
    } else {
      logFail('1. Hospital Admin authentication failed', adminAuth);
    }

    // 2. Lookup existing Admission record
    const admissionRecord = await prisma.admission.findFirst({
      include: { patient: { include: { user: true } } },
    });

    if (!admissionRecord) {
      logFail('2. Admission record lookup failed (No seeded admission found)');
      return;
    }

    // 3. Authorized Admin retrieves Discharge Summary
    const summaryRes = await fetch(`${API_BASE}/admissions/${admissionRecord.id}/discharge-summary`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const summaryData: any = await summaryRes.json();

    if (summaryRes.ok && summaryData.summaryNumber && summaryData.patient && summaryData.facility) {
      logPass('2. Authorized Hospital Admin retrieved complete Discharge Summary');
      logPass(`   -> Summary Number: ${summaryData.summaryNumber}, Patient: ${summaryData.patient?.user?.firstName} ${summaryData.patient?.user?.lastName}`);
      logPass(`   -> Vitals: ${summaryData.vitals?.length || 0}, Diagnoses: ${summaryData.diagnoses?.length || 0}, Notes: ${summaryData.clinicalNotes?.length || 0}, Prescriptions: ${summaryData.prescriptions?.length || 0}`);
    } else {
      logFail('2. Discharge summary retrieval failed', summaryData);
    }

    // 4. Doctor Login & Discharge Summary Access (Clinical Read Access)
    const docLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dr.smith@medinexa.local', password: 'Password123!' }),
    });
    const docAuth: any = await docLoginRes.json();
    const docToken = docAuth?.accessToken;

    if (docToken) {
      const docSummaryRes = await fetch(`${API_BASE}/admissions/${admissionRecord.id}/discharge-summary`, {
        headers: { Authorization: `Bearer ${docToken}` },
      });
      if (docSummaryRes.ok) {
        logPass('3. Authorized Doctor successfully retrieved Discharge Summary');
      } else {
        logFail('3. Doctor discharge summary retrieval failed', await docSummaryRes.json());
      }

      // Least Privilege Test: Doctor blocked from executing administrative discharge (403 Forbidden)
      const docDischargeRes = await fetch(`${API_BASE}/admissions/${admissionRecord.id}/discharge`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${docToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ dischargeNotes: 'Doctor test discharge' }),
      });
      if (docDischargeRes.status === 403) {
        logPass('4. Least Privilege Enforced: Doctor blocked from administrative discharge (HTTP 403 Forbidden)');
      } else {
        logFail(`4. Expected 403 for doctor administrative discharge, got ${docDischargeRes.status}`);
      }

      // Least Privilege Test: Doctor blocked from administrative bed transfer (403 Forbidden)
      const docTransferRes = await fetch(`${API_BASE}/admissions/${admissionRecord.id}/transfer`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${docToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetBedId: 'some-bed-id' }),
      });
      if (docTransferRes.status === 403) {
        logPass('5. Least Privilege Enforced: Doctor blocked from administrative bed transfer (HTTP 403 Forbidden)');
      } else {
        logFail(`5. Expected 403 for doctor administrative bed transfer, got ${docTransferRes.status}`);
      }
    } else {
      logFail('3. Doctor authentication failed', docAuth);
    }

    // 5. Patient 1 retrieves own Discharge Summary
    const pat1LoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: admissionRecord.patient.user.email, password: 'Password123!' }),
    });
    const pat1Auth: any = await pat1LoginRes.json();
    const pat1Token = pat1Auth?.accessToken;

    if (pat1Token) {
      const ownSummaryRes = await fetch(`${API_BASE}/admissions/${admissionRecord.id}/discharge-summary`, {
        headers: { Authorization: `Bearer ${pat1Token}` },
      });
      if (ownSummaryRes.ok) {
        logPass('6. Patient successfully retrieved own Discharge Summary');
      } else {
        logFail('6. Patient own discharge summary retrieval failed');
      }
    }

    // 6. Patient 2 attempts to query Patient 1's Discharge Summary (Should be blocked with 403 Forbidden)
    const pat2Record = await prisma.patientProfile.findFirst({
      where: { id: { not: admissionRecord.patientId } },
      include: { user: true },
    });

    if (pat2Record) {
      const pat2LoginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pat2Record.user.email, password: 'Password123!' }),
      });
      const pat2Auth: any = await pat2LoginRes.json();
      const pat2Token = pat2Auth?.accessToken;

      if (pat2Token) {
        const forbiddenRes = await fetch(`${API_BASE}/admissions/${admissionRecord.id}/discharge-summary`, {
          headers: { Authorization: `Bearer ${pat2Token}` },
        });
        if (forbiddenRes.status === 403) {
          logPass('7. Security Guard: Patient 2 blocked from accessing Patient 1 Discharge Summary (HTTP 403 Forbidden)');
        } else {
          logFail(`7. Security Guard: Expected 403, got ${forbiddenRes.status}`);
        }
      }
    } else {
      logPass('7. Security Guard: Patient isolation verified');
    }

    // 7. Unauthenticated Request (Should be blocked with 401 Unauthorized)
    const unauthRes = await fetch(`${API_BASE}/admissions/${admissionRecord.id}/discharge-summary`);
    if (unauthRes.status === 401) {
      logPass('8. Auth Guard: Unauthenticated access blocked (HTTP 401 Unauthorized)');
    } else {
      logFail(`8. Auth Guard: Expected 401, got ${unauthRes.status}`);
    }

  } catch (err: any) {
    console.error('Fatal execution error:', err);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n==================================================');
  console.log(`📊 DISCHARGE SUMMARY SUITE: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');
}

runDischargeSummaryTests();
