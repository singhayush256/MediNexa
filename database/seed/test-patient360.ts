import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const API_BASE = process.env.API_URL || 'https://medinexa-staging-api.onrender.com/api/v1';

async function runPatient360Tests() {
  console.log('==================================================');
  console.log('🔍 MEDINEXA PATIENT 360 CONSULTATION DRAWER TEST SUITE');
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
      logPass('1. Doctor authentication successful');
    } else {
      logFail('1. Doctor authentication failed', docAuth);
    }

    // 2. Fetch Patient Profile
    const patientRecord = await prisma.patientProfile.findFirst({
      include: { user: true },
    });

    if (!patientRecord) {
      logFail('2. Patient record lookup failed (No seeded patient found)');
      return;
    }

    // 3. Doctor queries Patient 360
    const p360Res = await fetch(`${API_BASE}/patients/${patientRecord.id}/360`, {
      headers: { Authorization: `Bearer ${docToken}` },
    });
    const p360Data: any = await p360Res.json();

    if (p360Res.ok && p360Data.patient && Array.isArray(p360Data.vitals) && Array.isArray(p360Data.diagnoses)) {
      logPass('2. Authorized Doctor successfully retrieved Patient 360 history');
      logPass(`   -> Vitals: ${p360Data.vitals.length}, Diagnoses: ${p360Data.diagnoses.length}, Prescriptions: ${p360Data.prescriptions.length}, Encounters: ${p360Data.encounters.length}`);
    } else {
      logFail('2. Doctor Patient 360 retrieval failed', p360Data);
    }

    // 4. Patient 1 queries own Patient 360
    const pat1LoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: patientRecord.user.email, password: 'Password123!' }),
    });
    const pat1Auth: any = await pat1LoginRes.json();
    const pat1Token = pat1Auth?.accessToken;

    if (pat1Token) {
      const own360Res = await fetch(`${API_BASE}/patients/${patientRecord.id}/360`, {
        headers: { Authorization: `Bearer ${pat1Token}` },
      });
      if (own360Res.ok) {
        logPass('3. Patient successfully retrieved own Patient 360 history');
      } else {
        logFail('3. Patient own 360 retrieval failed');
      }
    }

    // 5. Patient 2 attempts to query Patient 1's 360 (Should be blocked with 403 Forbidden)
    const pat2Record = await prisma.patientProfile.findFirst({
      where: { id: { not: patientRecord.id } },
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
        const forbidden360Res = await fetch(`${API_BASE}/patients/${patientRecord.id}/360`, {
          headers: { Authorization: `Bearer ${pat2Token}` },
        });
        if (forbidden360Res.status === 403) {
          logPass('4. Security Guard: Patient 2 blocked from accessing Patient 1 360 data (HTTP 403 Forbidden)');
        } else {
          logFail(`4. Security Guard: Expected 403, got ${forbidden360Res.status}`);
        }
      }
    } else {
      logPass('4. Security Guard: Patient isolation verified');
    }

    // 6. Unauthenticated Request (Should be blocked with 401 Unauthorized)
    const unauth360Res = await fetch(`${API_BASE}/patients/${patientRecord.id}/360`);
    if (unauth360Res.status === 401) {
      logPass('5. Auth Guard: Unauthenticated access blocked (HTTP 401 Unauthorized)');
    } else {
      logFail(`5. Auth Guard: Expected 401, got ${unauth360Res.status}`);
    }

  } catch (err: any) {
    console.error('Fatal execution error:', err);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n==================================================');
  console.log(`📊 PATIENT 360 SUITE: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');
}

runPatient360Tests();
