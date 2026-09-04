const http = require('http');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/medinexa?schema=public',
    },
  },
});

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function login(email, password = 'Medinexa@2026') {
  const res = await request(
    {
      hostname: 'localhost',
      port: 3001,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email, password }
  );
  if (res.status === 200 && res.body.accessToken) {
    return res.body.accessToken;
  }
  // Fallback to Password123!
  const retry = await request(
    {
      hostname: 'localhost',
      port: 3001,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email, password: 'Password123!' }
  );
  if (retry.status === 200 && retry.body.accessToken) {
    return retry.body.accessToken;
  }
  throw new Error(`Login failed for ${email}: ${JSON.stringify(res.body)}`);
}

async function runAudit() {
  console.log('====================================================');
  console.log('MEDINEXA FINAL DEMO UPGRADE AUDIT SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Database Counts Audit
    console.log('--- 1. DATABASE METRICS AUDIT ---');
    const patientCount = await prisma.patientProfile.count();
    assert(patientCount >= 500, `Patient count >= 500 (Found: ${patientCount})`);

    const doctorCount = await prisma.doctorProfile.count();
    assert(doctorCount >= 50, `Doctor count >= 50 (Found: ${doctorCount})`);

    const appointmentCount = await prisma.appointment.count();
    assert(appointmentCount >= 1000, `Appointment count >= 1000 (Found: ${appointmentCount})`);

    const prescriptionCount = await prisma.prescription.count();
    assert(prescriptionCount >= 200, `Prescription count >= 200 (Found: ${prescriptionCount})`);

    const admissionCount = await prisma.admission.count();
    assert(admissionCount >= 100, `Admission count >= 100 (Found: ${admissionCount})`);

    const labCount = await prisma.labOrder.count();
    assert(labCount >= 100, `Lab reports/orders count >= 100 (Found: ${labCount})`);

    const pharmacyCount = await prisma.pharmacyDispenseRecord.count();
    assert(pharmacyCount >= 100, `Pharmacy transactions count >= 100 (Found: ${pharmacyCount})`);

    const claimCount = await prisma.insuranceClaim.count();
    assert(claimCount >= 50, `Insurance claims count >= 50 (Found: ${claimCount})`);

    const invoiceCount = await prisma.billingInvoice.count();
    assert(invoiceCount >= 50, `Invoice records count >= 50 (Found: ${invoiceCount})`);

    // 2. Dummy Name Purge Check
    console.log('\n--- 2. DUMMY NAME PURGE AUDIT ---');
    const westernDummies = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { in: ['Jane', 'John', 'Sarah', 'Michael', 'Demo', 'Test'] } },
          { lastName: { in: ['Doe', 'Smith', 'Chen', 'User'] } },
        ],
      },
    });
    assert(westernDummies.length === 0, `Purged Western dummy names (Found: ${westernDummies.length})`);

    // 3. Authenticate as Admin
    console.log('\n--- 3. AUTHENTICATION & TOKENS ---');
    const adminToken = await login('admin@medinexa.in', 'Medinexa@2026');
    assert(!!adminToken, 'Admin authentication successful');

    // 4. ABHA Integration Module Audit
    console.log('\n--- 4. ABHA INTEGRATION MODULE AUDIT ---');
    const firstPatient = await prisma.patientProfile.findFirst({
      include: { abhaProfile: true, user: true },
    });
    assert(!!firstPatient, `Found patient ${firstPatient?.id}`);

    const abhaRes = await request({
      hostname: 'localhost',
      port: 3001,
      path: `/api/v1/abdm/abha/${firstPatient.id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      abhaRes.status === 200 && (abhaRes.body.linked || abhaRes.body.abhaNumber),
      `ABHA Profile Endpoint responded HTTP 200 with ABHA: ${abhaRes.body.abhaNumber}`
    );

    // Test ABHA Link
    const linkRes = await request(
      {
        hostname: 'localhost',
        port: 3001,
        path: `/api/v1/abdm/abha/link`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      },
      {
        patientId: firstPatient.id,
        abhaNumber: '91-8822-4411-9988',
        abhaAddress: 'tushar.demo@abdm',
        otp: '123456',
      }
    );
    assert(linkRes.status === 200 || linkRes.status === 201, `ABHA Link/Verify endpoint responded HTTP ${linkRes.status}`);

    // 5. ABDM Consent & Audit Logs Module Audit
    console.log('\n--- 5. ABDM COMPLIANCE & AUDIT LOGS AUDIT ---');
    const createConsentRes = await request(
      {
        hostname: 'localhost',
        port: 3001,
        path: `/api/v1/abdm/consent/request`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      },
      {
        patientId: firstPatient.id,
        purpose: 'EHR Consultation and Second Opinion',
      }
    );
    assert(
      createConsentRes.status === 200 || createConsentRes.status === 201,
      `ABDM Consent Request created (HTTP ${createConsentRes.status}, ID: ${createConsentRes.body?.id})`
    );

    const consentsRes = await request({
      hostname: 'localhost',
      port: 3001,
      path: `/api/v1/abdm/consents`,
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(consentsRes.status === 200 && Array.isArray(consentsRes.body), `ABDM Consents list fetched: ${consentsRes.body.length} records`);

    const auditLogsRes = await request({
      hostname: 'localhost',
      port: 3001,
      path: `/api/v1/abdm/audit-logs`,
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(auditLogsRes.status === 200 && Array.isArray(auditLogsRes.body), `ABDM SHA-256 Audit logs fetched: ${auditLogsRes.body.length} records`);

    // Test Reject Consent
    const targetConsent = createConsentRes.body?.id ? createConsentRes.body : consentsRes.body[0];
    if (targetConsent) {
      const rejectRes = await request(
        {
          hostname: 'localhost',
          port: 3001,
          path: `/api/v1/abdm/consent/reject`,
          method: 'POST',
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        },
        {
          consentId: targetConsent.id,
          reason: 'Automated verification test rejection',
        }
      );
      assert(rejectRes.status === 200 || rejectRes.status === 201, `ABDM Consent Reject workflow succeeded (HTTP ${rejectRes.status})`);
    }

    // 6. EHR Import Module Audit
    console.log('\n--- 6. EHR IMPORT MODULE AUDIT ---');
    const ehrHistoryRes = await request({
      hostname: 'localhost',
      port: 3001,
      path: `/api/v1/ehr/import/history`,
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(ehrHistoryRes.status === 200 && Array.isArray(ehrHistoryRes.body), `EHR Import History endpoint responded HTTP 200 (${ehrHistoryRes.body.length} jobs)`);

    const ehrRecordsRes = await request({
      hostname: 'localhost',
      port: 3001,
      path: `/api/v1/ehr/import/records`,
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(ehrRecordsRes.status === 200 && Array.isArray(ehrRecordsRes.body), `EHR Imported Records list responded HTTP 200 (${ehrRecordsRes.body.length} records)`);

    const ehrTemplateRes = await request({
      hostname: 'localhost',
      port: 3001,
      path: `/api/v1/ehr/import/template/csv`,
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(ehrTemplateRes.status === 200, `EHR CSV Template download responded HTTP 200`);

    // 7. SMS Gateway Module Audit
    console.log('\n--- 7. SMS GATEWAY MODULE AUDIT ---');
    const smsConfigRes = await request({
      hostname: 'localhost',
      port: 3001,
      path: `/api/v1/notification/sms/config`,
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(smsConfigRes.status === 200 && smsConfigRes.body.senderId === 'MDNEXA', `SMS Gateway DLT Sender ID configured as MDNEXA`);

    const smsTemplatesRes = await request({
      hostname: 'localhost',
      port: 3001,
      path: `/api/v1/notification/sms/templates`,
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      smsTemplatesRes.status === 200 && Array.isArray(smsTemplatesRes.body) && smsTemplatesRes.body.length >= 7,
      `SMS Gateway 7 TRAI DLT templates active (${smsTemplatesRes.body?.length} templates)`
    );

    const smsSendTestRes = await request(
      {
        hostname: 'localhost',
        port: 3001,
        path: `/api/v1/notification/sms/send-test`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      },
      {
        recipientPhone: '+919876543210',
        eventType: 'APPOINTMENT_BOOKED',
        templateVars: {
          patientName: 'Aarav Sharma',
          doctorName: 'Dr. Rajesh Sharma',
          date: '2026-09-05',
          time: '10:30 AM',
        },
      }
    );
    assert(
      (smsSendTestRes.status === 200 || smsSendTestRes.status === 201) && (smsSendTestRes.body.success || smsSendTestRes.body.log?.id),
      `SMS Gateway live test dispatch succeeded (ID: ${smsSendTestRes.body.log?.id})`
    );

    // 8. AI Inventory Forecasting Audit
    console.log('\n--- 8. AI INVENTORY FORECASTING AUDIT ---');
    const forecastRes = await request({
      hostname: 'localhost',
      port: 3001,
      path: `/api/v1/pharmacy/forecasting`,
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(forecastRes.status === 200 && typeof forecastRes.body.healthScore === 'number', `Inventory health score calculated: ${forecastRes.body.healthScore}/100`);
    assert(Array.isArray(forecastRes.body.timeline), `30-day demand forecast timeline generated (${forecastRes.body.timeline?.length} days)`);
    assert(Array.isArray(forecastRes.body.fastMoving), `Fast-moving medicines identified (${forecastRes.body.fastMoving?.length} SKUs)`);

    // 9. Smart AI Appointment Scheduler Audit
    console.log('\n--- 9. SMART AI APPOINTMENT SCHEDULER AUDIT ---');
    const smartRecommendRes = await request(
      {
        hostname: 'localhost',
        port: 3001,
        path: `/api/v1/appointments/smart-recommend`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      },
      {
        symptoms: 'severe chest tightness and palpitations when walking uphill',
      }
    );
    assert(smartRecommendRes.status === 201 && smartRecommendRes.body.symptomAnalysis, `Smart NLP symptom analysis responded HTTP 201`);
    assert(
      smartRecommendRes.body.symptomAnalysis?.matchedSpecialty === 'Cardiology',
      `Correctly diagnosed specialty as Cardiology (Severity: ${smartRecommendRes.body.symptomAnalysis?.urgencyLevel}, Confidence: ${smartRecommendRes.body.symptomAnalysis?.confidence}%)`
    );
    assert(
      smartRecommendRes.body.recommendedDoctors?.length > 0,
      `Recommended doctors found (${smartRecommendRes.body.recommendedDoctors?.length} doctors)`
    );

    // Test Express Booking
    if (smartRecommendRes.body.recommendedDoctors?.length > 0) {
      const topDoc = smartRecommendRes.body.recommendedDoctors[0];
      const expressBookRes = await request(
        {
          hostname: 'localhost',
          port: 3001,
          path: `/api/v1/appointments/express-book`,
          method: 'POST',
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        },
        {
          patientId: firstPatient.id,
          doctorId: topDoc.doctorId || topDoc.id,
          appointmentDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          timeSlot: '11:00 AM',
          chiefComplaint: 'Smart Express Booking Test: Chest tightness',
        }
      );
      assert(
        (expressBookRes.status === 200 || expressBookRes.status === 201) && expressBookRes.body.appointment,
        `Smart Express booking created appointment (HTTP ${expressBookRes.status}, ID: ${expressBookRes.body.appointment?.id})`
      );
    }

    console.log('\n====================================================');
    console.log(`AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Audit crashed with error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAudit();
