import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const API_BASE = process.env.API_URL || 'http://localhost:3001/api/v1';

async function runPharmacyBatchTests() {
  console.log('==================================================');
  console.log('💊 MEDINEXA PHARMACY BATCH & EXPIRY TRACKING SUITE');
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
    // 1. Pharmacy Staff Login
    const pharmLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'Password123!' }),
    });
    const pharmAuth: any = await pharmLoginRes.json();
    const pharmToken = pharmAuth?.accessToken;

    if (pharmLoginRes.ok && pharmToken) {
      logPass('1. Pharmacy Staff authentication successful');
    } else {
      logFail('1. Pharmacy Staff authentication failed', pharmAuth);
    }

    // 2. Fetch Issued Prescription Item
    const rxRecord = await prisma.prescription.findFirst({
      where: { status: { in: ['ISSUED', 'DRAFT', 'PARTIALLY_DISPENSED'] } },
      include: { items: true },
    });

    if (!rxRecord || rxRecord.items.length === 0) {
      logFail('2. Prescription item lookup failed (No seeded prescription found)');
      return;
    }
    const item = rxRecord.items[0];

    // Ensure prescription is ISSUED for testing
    await prisma.prescription.update({
      where: { id: rxRecord.id },
      data: { status: 'ISSUED' },
    });

    // 3. Test Dispensing Expired Batch -> Should be rejected (400 Bad Request)
    const expiredRes = await fetch(`${API_BASE}/pharmacy/prescriptions/${rxRecord.id}/dispense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmToken}`,
      },
      body: JSON.stringify({
        prescriptionItemId: item.id,
        quantity: 1,
        batchNumber: 'EXPIRED-BATCH-99',
        expirationDate: '2020-01-01',
      }),
    });
    const expiredData: any = await expiredRes.json();

    if (expiredRes.status === 400 && expiredData.message?.includes('expired batch')) {
      logPass('2. Pharmacy Engine Guard: Dispensing expired batch rejected (HTTP 400 Bad Request)');
    } else {
      logFail(`2. Pharmacy Engine Guard: Expected 400 for expired batch, got ${expiredRes.status}`, expiredData);
    }

    // 4. Test Dispensing Valid Non-Expired Batch
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);
    const validExpiryStr = futureDate.toISOString().slice(0, 10);
    const validBatchNumber = `BATCH-${Date.now()}`;

    const validDispenseRes = await fetch(`${API_BASE}/pharmacy/prescriptions/${rxRecord.id}/dispense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmToken}`,
      },
      body: JSON.stringify({
        prescriptionItemId: item.id,
        quantity: 1,
        batchNumber: validBatchNumber,
        expirationDate: validExpiryStr,
        notes: 'Dispensed from main pharmacy store',
      }),
    });
    const validDispenseData: any = await validDispenseRes.json();

    if (validDispenseRes.ok && validDispenseData.id) {
      logPass(`3. Valid non-expired batch dispensed successfully (Dispense #${validDispenseData.dispenseNumber})`);

      // Verify batchNumber and expirationDate in database
      const dispenseRecord = await prisma.prescriptionDispense.findUnique({
        where: { id: validDispenseData.id },
      });

      if (dispenseRecord && dispenseRecord.batchNumber === validBatchNumber && dispenseRecord.expirationDate) {
        logPass(`4. PrescriptionDispense database record verified (Batch: ${dispenseRecord.batchNumber}, Expiry: ${dispenseRecord.expirationDate.toISOString().slice(0, 10)})`);
      } else {
        logFail('4. PrescriptionDispense database record batch details missing', dispenseRecord);
      }

      // Verify PHI Audit record
      const auditRecord = await prisma.auditEvent.findFirst({
        where: { action: 'DISPENSE_MEDICATION', resource: `prescription:${rxRecord.id}` },
        orderBy: { createdAt: 'desc' },
      });

      if (auditRecord) {
        logPass(`5. PHI Audit Engine logged DISPENSE_MEDICATION event (Audit ID: ${auditRecord.id})`);
      } else {
        logFail('5. PHI Audit record for DISPENSE_MEDICATION not found');
      }
    } else {
      logFail('3. Valid batch dispensing failed', validDispenseData);
    }

    // 5. Security Guard: Patient cannot dispense medication (403 Forbidden)
    const patRecord = await prisma.patientProfile.findFirst({ include: { user: true } });
    if (patRecord) {
      const patLoginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: patRecord.user.email, password: 'Password123!' }),
      });
      const patAuth: any = await patLoginRes.json();
      if (patAuth.accessToken) {
        const patientDispenseRes = await fetch(`${API_BASE}/pharmacy/prescriptions/${rxRecord.id}/dispense`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${patAuth.accessToken}`,
          },
          body: JSON.stringify({
            prescriptionItemId: item.id,
            quantity: 1,
            batchNumber: 'UNAUTH-BATCH',
            expirationDate: validExpiryStr,
          }),
        });
        if (patientDispenseRes.status === 403) {
          logPass('6. Security Guard: Patient user blocked from dispensing medication (HTTP 403 Forbidden)');
        } else {
          logFail(`6. Security Guard: Expected 403, got ${patientDispenseRes.status}`);
        }
      }
    }

  } catch (err: any) {
    console.error('Fatal execution error:', err);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n==================================================');
  console.log(`📊 PHARMACY BATCH SUITE: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');
}

runPharmacyBatchTests();
