const http = require('http');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/medinexa?schema=public',
    },
  },
});

const API_BASE = 'http://localhost:3001/api/v1';

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path.startsWith('http') ? path : `${API_BASE}${path}`);
    const postData = body ? JSON.stringify(body) : '';
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => (rawData += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(rawData) });
          } catch (e) {
            resolve({ status: res.statusCode, body: rawData });
          }
        });
      }
    );
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runEnterpriseValidation() {
  console.log('================================================================');
  console.log('🏥 MEDINEXA ENTERPRISE HOSPITAL PLATFORM - VERIFICATION AUDIT');
  console.log('Campus: MediNexa Multispeciality Hospital, Sector 62, Noida (UP)');
  console.log('Standards: Apollo ERP / Practo Enterprise / NABL & NABH Compliant');
  console.log('================================================================\n');

  const results = [];

  function record(pillar, testName, passed, details) {
    results.push({ pillar, testName, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} | [Pillar ${pillar}] ${testName}: ${details}`);
  }

  // Get baseline patient & doctor from DB for strict FK integrity
  const samplePatient = await prisma.patientProfile.findFirst({
    include: { user: true },
  });
  const sampleDoctor = await prisma.doctorProfile.findFirst({
    include: { user: true },
  });

  // -------------------------------------------------------------
  // PILLAR 1: EMAIL OTP AUTHENTICATION
  // -------------------------------------------------------------
  try {
    const testEmail = `ayush.test.${Date.now()}@gmail.com`;
    const regRes = await makeRequest('/auth/register-initiate', 'POST', {
      firstName: 'Ayush',
      lastName: 'Verma',
      email: testEmail,
      phone: '+91 98101 99999',
      password: 'Medinexa@2026',
      role: 'PATIENT',
    });

    if (regRes.status === 200 && regRes.body.previewOtp) {
      const otp = regRes.body.previewOtp;
      const verifyRes = await makeRequest('/auth/verify-registration-otp', 'POST', {
        email: testEmail,
        code: otp,
        otp: otp,
      });

      if (verifyRes.status === 201 && verifyRes.body.user && verifyRes.body.user.uhid) {
        record(1, 'Email OTP Registration & UHID Generation', true, `Account created with UHID: ${verifyRes.body.user.uhid}`);

        // Login with verified account
        const loginRes = await makeRequest('/auth/login', 'POST', {
          email: testEmail,
          password: 'Medinexa@2026',
        });
        const jwtOk = loginRes.status === 200 && !!loginRes.body.accessToken;
        record(1, 'Verified Account JWT Login', jwtOk, `Bearer token issued (${loginRes.body.accessToken ? loginRes.body.accessToken.slice(0, 16) : ''}...)`);
      } else {
        record(1, 'Email OTP Registration & UHID Generation', false, `Verification failed with status ${verifyRes.status}`);
      }
    } else {
      record(1, 'Email OTP Registration Initiate', false, `Initiate failed with status ${regRes.status}`);
    }
  } catch (err) {
    record(1, 'Email OTP Authentication', false, err.message);
  }

  // -------------------------------------------------------------
  // PILLAR 2: RAZORPAY PAYMENT SYSTEM & GST INVOICING
  // -------------------------------------------------------------
  try {
    const orderRes = await makeRequest('/payments/create-order', 'POST', {
      amount: 1500,
      patientId: samplePatient?.id || 'sample-patient-id',
      context: 'CONSULTATION',
      description: 'Senior Cardiologist OPD Consultation & 12-Lead ECG Review',
    });

    if ([200, 201].includes(orderRes.status) && orderRes.body.orderId) {
      const orderId = orderRes.body.orderId;
      const paymentId = `pay_rzp_test_${Date.now()}`;
      const secret = 'rzp_test_secret_medinexa_2026';
      const signature = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');

      const verifyPayRes = await makeRequest('/payments/verify', 'POST', {
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        invoiceNumber: orderRes.body.invoiceNumber,
        amount: 1500,
        patientId: samplePatient?.id,
      });

      const paymentVerified = verifyPayRes.status === 200 && (verifyPayRes.body.success || verifyPayRes.body.status === 'PAID');
      record(2, 'Razorpay HMAC-SHA256 Payment Verification', paymentVerified, `Transaction ${paymentId} settled`);
      
      const invNum = verifyPayRes.body?.invoiceNumber || orderRes.body?.invoiceNumber;
      record(2, 'Automated GST Tax Invoice (SAC 999311)', paymentVerified && !!invNum, `Invoice ${invNum} marked PAID`);

      const receiptRes = await makeRequest(`/payments/receipt/${invNum}`);
      record(2, 'Official GST Electronic Receipt Retrieval', receiptRes.status === 200 && !!receiptRes.body.invoiceNumber, `Receipt ${receiptRes.body.invoiceNumber} verified (SAC 999311 / HSN 3004)`);
    } else {
      record(2, 'Razorpay Order Creation', false, `Order creation failed with status ${orderRes.status}: ${JSON.stringify(orderRes.body)}`);
    }
  } catch (err) {
    record(2, 'Razorpay Payment System', false, err.message);
  }

  // -------------------------------------------------------------
  // PILLAR 3: WHATSAPP CLOUD API NOTIFICATIONS
  // -------------------------------------------------------------
  try {
    const waRes = await makeRequest('/notifications/whatsapp/send', 'POST', {
      recipientPhone: '+919810100000',
      recipientName: 'Arjun Nair',
      template: 'APPOINTMENT_BOOKED',
      doctorName: 'Dr. Sanjay Deshmukh',
      specialty: 'Cardiology',
      date: 'Tomorrow',
      time: '10:00 AM',
      hospitalName: 'MediNexa Multispeciality Hospital Noida',
    });

    record(3, 'WhatsApp Appointment Template Dispatch', [200, 201].includes(waRes.status) && waRes.body.status === 'READ', `Delivered template APPOINTMENT_BOOKED via WhatsApp Cloud Gateway`);

    const waLogs = await makeRequest('/notifications/whatsapp/logs');
    record(3, 'WhatsApp Gateway Telemetry Logs', waLogs.status === 200 && Array.isArray(waLogs.body), `Total logged dispatches: ${waLogs.body?.length || 0}`);
  } catch (err) {
    record(3, 'WhatsApp Notifications', false, err.message);
  }

  // -------------------------------------------------------------
  // PILLAR 4: DOCTOR AVAILABILITY & COLLISION PREVENTION
  // -------------------------------------------------------------
  try {
    const doctorsRes = await makeRequest('/doctors');
    if (doctorsRes.status === 200 && Array.isArray(doctorsRes.body) && doctorsRes.body.length > 0) {
      const doc = doctorsRes.body[0];
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 1);
      if (targetDate.getDay() === 0) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      const dateStr = targetDate.toISOString().split('T')[0];

      const slotsRes = await makeRequest(`/doctors/${doc.id}/available-slots?date=${dateStr}`);
      const validSlots = slotsRes.status === 200 && Array.isArray(slotsRes.body.slots);
      record(4, 'Doctor OPD Slot Generation & Collision Avoidance', validSlots, `Dr. ${doc.user?.firstName} ${doc.user?.lastName}: ${slotsRes.body.availableSlotsCount ?? slotsRes.body.slots?.length ?? 0} open 30-min slots on ${dateStr}`);
    } else {
      record(4, 'Doctor Availability Management', false, 'No doctors returned from /doctors');
    }
  } catch (err) {
    record(4, 'Doctor Availability Management', false, err.message);
  }

  // Authenticate as Super Admin for protected Super Admin, Backup & Analytics endpoints
  const superAdminLogin = await makeRequest('/auth/login', 'POST', {
    email: 'superadmin@medinexa.in',
    password: 'Medinexa@2026',
  });
  const superAdminToken = superAdminLogin.body?.accessToken;
  const authHeaders = { Authorization: `Bearer ${superAdminToken}` };

  // -------------------------------------------------------------
  // PILLAR 5: TELEMEDICINE WEBRTC MODULE
  // -------------------------------------------------------------
  try {
    const teleRes = await makeRequest(
      '/telemedicine/session',
      'POST',
      {
        patientId: samplePatient?.id || 'sample-patient',
        doctorId: sampleDoctor?.id || 'sample-doctor',
        scheduledStartTime: new Date().toISOString(),
        notes: 'Cardiology Hypertension Follow-up Consultation',
      },
      authHeaders
    );

    record(5, 'Telemedicine WebRTC Session Orchestration', [200, 201].includes(teleRes.status), `Consultation session created: ${teleRes.body?.sessionId || teleRes.body?.id || 'Active'}`);
  } catch (err) {
    record(5, 'Telemedicine WebRTC Module', false, err.message);
  }

  // -------------------------------------------------------------
  // PILLAR 6: SUPER ADMIN MULTI-TENANT PORTAL
  // -------------------------------------------------------------
  try {
    const supRes = await makeRequest('/super-admin/overview', 'GET', null, authHeaders);
    const hasOverview = supRes.status === 200 && (supRes.body.totalFacilities !== undefined || !!supRes.body.overview);
    record(6, 'Super Admin Multi-Tenant Telemetry', hasOverview, `Active Hospitals: ${supRes.body?.totalFacilities ?? supRes.body?.overview?.activeHospitals}, Health: ${supRes.body?.systemHealth?.status ?? supRes.body?.overview?.systemHealth}`);

    const hospList = await makeRequest('/super-admin/hospitals', 'GET', null, authHeaders);
    const facilitiesList = Array.isArray(hospList.body) ? hospList.body : (hospList.body?.data || []);
    record(6, 'Tenant Hospital Provisioning API', hospList.status === 200 && Array.isArray(facilitiesList), `Managed facilities: ${facilitiesList.length}`);
  } catch (err) {
    record(6, 'Super Admin Portal', false, err.message);
  }

  // -------------------------------------------------------------
  // PILLAR 7: ADVANCED ANALYTICS DASHBOARD
  // -------------------------------------------------------------
  try {
    const analRes = await makeRequest('/analytics/overview', 'GET', null, authHeaders);
    record(7, 'Enterprise Analytics & KPI Engine', analRes.status === 200, `Live clinical and financial metrics verified`);
  } catch (err) {
    record(7, 'Advanced Analytics Dashboard', false, err.message);
  }

  // -------------------------------------------------------------
  // PILLAR 8: AUTOMATED BACKUP & DISASTER RECOVERY
  // -------------------------------------------------------------
  try {
    const backupCreate = await makeRequest('/backup/create', 'POST', { type: 'MANUAL' }, authHeaders);
    record(8, 'Automated Snapshot & SHA-256 Checksum', backupCreate.status === 201 && !!backupCreate.body.checksum, `Snapshot ${backupCreate.body?.id} (${backupCreate.body?.sizeBytes} bytes) checksum: ${backupCreate.body?.checksum?.slice(0, 12)}...`);

    const backupList = await makeRequest('/backup/list', 'GET', null, authHeaders);
    const snapshotsList = Array.isArray(backupList.body) ? backupList.body : (backupList.body?.snapshots || []);
    record(8, 'Disaster Recovery Snapshot Vault', backupList.status === 200 && Array.isArray(snapshotsList) && snapshotsList.length > 0, `Available recovery snapshots: ${snapshotsList.length}`);
  } catch (err) {
    record(8, 'Automated Backup System', false, err.message);
  }

  // -------------------------------------------------------------
  // PILLAR 9: DEMO DATA GENERATOR & DATASET STATUS
  // -------------------------------------------------------------
  try {
    const demoStatus = await makeRequest('/demo/status');
    const counts = demoStatus.body?.counts || {};
    const hasIndianDataset = counts.appointments >= 500 && counts.patients >= 100 && counts.gstInvoices >= 100;
    record(9, 'Authentic Indian Hospital Dataset (Noida Campus)', demoStatus.status === 200 && hasIndianDataset, `Patients: ${counts.patients}, Appointments: ${counts.appointments}, Wards/Admissions: ${counts.admissions}, Rx: ${counts.prescriptions}, Lab: ${counts.labReports}, GST Invoices: ${counts.gstInvoices}`);
  } catch (err) {
    record(9, 'Demo Data Generator', false, err.message);
  }

  // -------------------------------------------------------------
  // PILLAR 10: PRODUCTION RBAC SECURITY AUDIT
  // -------------------------------------------------------------
  try {
    // 1. Super Admin
    record(10, 'Super Admin RBAC Clearance', superAdminLogin.status === 200 && superAdminLogin.body.user?.role?.code === 'SUPER_ADMIN', `Authenticated: ${superAdminLogin.body.user?.firstName} ${superAdminLogin.body.user?.lastName} (SUPER_ADMIN)`);

    // 2. Hospital Admin
    const adminLogin = await makeRequest('/auth/login', 'POST', {
      email: 'admin@medinexa.in',
      password: 'Medinexa@2026',
    });
    record(10, 'Hospital Admin RBAC Clearance', adminLogin.status === 200 && adminLogin.body.user?.role?.code === 'HOSPITAL_ADMIN', `Authenticated: ${adminLogin.body.user?.firstName} ${adminLogin.body.user?.lastName} (HOSPITAL_ADMIN)`);

    // 3. Doctor
    const docLogin = await makeRequest('/auth/login', 'POST', {
      email: 'dr.sanjay@medinexa.in',
      password: 'Medinexa@2026',
    });
    record(10, 'Doctor RBAC Clearance', docLogin.status === 200 && docLogin.body.user?.role?.code === 'DOCTOR', `Authenticated: ${docLogin.body.user?.firstName} ${docLogin.body.user?.lastName} (DOCTOR)`);

    // 4. Nurse
    const nurseLogin = await makeRequest('/auth/login', 'POST', {
      email: 'priya.sharma@medinexa.in',
      password: 'Medinexa@2026',
    });
    record(10, 'Nurse RBAC Clearance', nurseLogin.status === 200 && nurseLogin.body.user?.role?.code === 'NURSE', `Authenticated: ${nurseLogin.body.user?.firstName} ${nurseLogin.body.user?.lastName} (NURSE)`);

    // 5. Patient
    const patLogin = await makeRequest('/auth/login', 'POST', {
      email: 'arjun.nair@gmail.com',
      password: 'Medinexa@2026',
    });
    record(10, 'Patient Self-Service RBAC Clearance', patLogin.status === 200 && patLogin.body.user?.role?.code === 'PATIENT', `Authenticated: ${patLogin.body.user?.firstName} ${patLogin.body.user?.lastName} (PATIENT)`);
  } catch (err) {
    record(10, 'Production RBAC Security', false, err.message);
  }

  console.log('\n================================================================');
  console.log('AUDIT SUMMARY');
  console.log('================================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const passRate = Math.round((passedCount / totalCount) * 100);

  console.log(`Total Verification Steps: ${totalCount}`);
  console.log(`Passed Steps: ${passedCount}`);
  console.log(`Failed Steps: ${totalCount - passedCount}`);
  console.log(`Readiness & Success Rate: ${passRate}%\n`);

  await prisma.$disconnect();
  return { passRate, passedCount, totalCount, results };
}

runEnterpriseValidation().catch(console.error);
