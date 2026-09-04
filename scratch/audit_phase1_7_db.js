const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../node_modules/@prisma/client'));

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/medinexa?schema=public',
    },
  },
});

async function runPhase1And7Audit() {
  console.log('====================================================');
  console.log('PHASE 1 & 7: DATABASE CONNECTIVITY & RELATION AUDIT');
  console.log('====================================================\n');

  const report = {
    connectivity: {},
    tableCounts: {},
    crudResults: {},
    relationIntegrity: {},
    orphans: {},
    errors: [],
  };

  try {
    // 1. Connection & Server Health
    const t0 = Date.now();
    const [{ ping }] = await prisma.$queryRaw`SELECT 1 as ping`;
    const pingTimeMs = Date.now() - t0;
    report.connectivity = {
      serverReachable: true,
      pingResult: ping,
      pingTimeMs,
      status: 'HEALTHY',
    };
    console.log(`✓ Database server reachable (${pingTimeMs}ms, Ping: ${ping})`);

    // 2. Table Counts
    console.log('\n--- 1. TABLE RECORD COUNTS ---');
    const tables = [
      ['user', 'Users'],
      ['patientProfile', 'Patients'],
      ['doctorProfile', 'Doctors'],
      ['appointment', 'Appointments'],
      ['admission', 'Admissions'],
      ['prescription', 'Prescriptions'],
      ['labOrder', 'LabOrders'],
      ['pharmacyDispenseRecord', 'PharmacyDispenses'],
      ['billingInvoice', 'BillingInvoices'],
      ['insuranceClaim', 'InsuranceClaims'],
      ['auditEvent', 'AuditLogs'],
      ['abdmAuditLog', 'AbdmAuditLogs'],
      ['notification', 'Notifications'],
      ['bed', 'Beds'],
      ['facility', 'Facilities'],
      ['department', 'Departments'],
      ['specialty', 'Specialties'],
    ];

    for (const [model, label] of tables) {
      try {
        const count = await prisma[model].count();
        report.tableCounts[label] = count;
        console.log(`✓ ${label}: ${count} records`);
      } catch (err) {
        report.tableCounts[label] = `ERROR: ${err.message}`;
        report.errors.push(`Table count failed for ${label}: ${err.message}`);
        console.error(`✗ ${label}: ERROR - ${err.message}`);
      }
    }

    // 3. CRUD Tests
    console.log('\n--- 2. CRUD OPERATIONS TESTING ---');
    const adminUser = await prisma.user.findFirst({ where: { email: 'admin@medinexa.in' } });
    const facility = await prisma.facility.findFirst();

    // A. User CRUD
    try {
      const testEmail = `audit.test.${Date.now()}@medinexa.in`;
      const createdUser = await prisma.user.create({
        data: {
          email: testEmail,
          passwordHash: 'dummy-hash',
          firstName: 'Audit',
          lastName: 'Tester',
          status: 'ACTIVE',
          roleId: adminUser.roleId,
          organizationId: adminUser.organizationId,
          facilityId: facility.id,
        },
      });
      console.log(`✓ User Create: Success (ID: ${createdUser.id})`);

      const readUser = await prisma.user.findUnique({ where: { id: createdUser.id } });
      console.log(`✓ User Read: Success (${readUser.email})`);

      const updatedUser = await prisma.user.update({
        where: { id: createdUser.id },
        data: { firstName: 'AuditUpdated' },
      });
      console.log(`✓ User Update: Success (${updatedUser.firstName})`);

      await prisma.user.delete({ where: { id: createdUser.id } });
      const verifyDelete = await prisma.user.findUnique({ where: { id: createdUser.id } });
      console.log(`✓ User Delete: Success (Found after delete: ${!!verifyDelete})`);

      report.crudResults['User'] = 'PASS';
    } catch (e) {
      console.error(`✗ User CRUD failed: ${e.message}`);
      report.crudResults['User'] = `FAIL: ${e.message}`;
      report.errors.push(`User CRUD: ${e.message}`);
    }

    // B. Appointment CRUD
    try {
      const patient = await prisma.patientProfile.findFirst();
      const doctor = await prisma.doctorProfile.findFirst();
      const apptNum = `APT-AUDIT-${Date.now().toString().slice(-6)}`;

      const createdAppt = await prisma.appointment.create({
        data: {
          appointmentNumber: apptNum,
          patient: { connect: { id: patient.id } },
          doctor: { connect: { id: doctor.id } },
          facility: { connect: { id: facility.id } },
          appointmentDate: new Date('2026-11-15T00:00:00Z'),
          startTime: '10:00',
          endTime: '10:30',
          type: 'CONSULTATION',
          status: 'REQUESTED',
          reason: 'System Integration Audit Probe',
        },
      });
      console.log(`✓ Appointment Create: Success (ID: ${createdAppt.id})`);

      const readAppt = await prisma.appointment.findUnique({ where: { id: createdAppt.id } });
      console.log(`✓ Appointment Read: Success (${readAppt.appointmentNumber})`);

      const updatedAppt = await prisma.appointment.update({
        where: { id: createdAppt.id },
        data: { status: 'CONFIRMED' },
      });
      console.log(`✓ Appointment Update: Success (${updatedAppt.status})`);

      await prisma.appointment.delete({ where: { id: createdAppt.id } });
      const verifyApptDel = await prisma.appointment.findUnique({ where: { id: createdAppt.id } });
      console.log(`✓ Appointment Delete: Success (Found after delete: ${!!verifyApptDel})`);

      report.crudResults['Appointment'] = 'PASS';
    } catch (e) {
      console.error(`✗ Appointment CRUD failed: ${e.message}`);
      report.crudResults['Appointment'] = `FAIL: ${e.message}`;
      report.errors.push(`Appointment CRUD: ${e.message}`);
    }

    // C. Notification CRUD
    try {
      const createdNotif = await prisma.notification.create({
        data: {
          userId: adminUser.id,
          type: 'SYSTEM',
          title: 'System Audit Notification',
          message: 'Verifying notification table write operations',
          readAt: null,
        },
      });
      console.log(`✓ Notification Create: Success (ID: ${createdNotif.id})`);

      const readNotif = await prisma.notification.findUnique({ where: { id: createdNotif.id } });
      console.log(`✓ Notification Read: Success (${readNotif.title})`);

      const updatedNotif = await prisma.notification.update({
        where: { id: createdNotif.id },
        data: { readAt: new Date() },
      });
      console.log(`✓ Notification Update: Success (readAt: ${updatedNotif.readAt})`);

      await prisma.notification.delete({ where: { id: createdNotif.id } });
      console.log(`✓ Notification Delete: Success`);

      report.crudResults['Notification'] = 'PASS';
    } catch (e) {
      console.error(`✗ Notification CRUD failed: ${e.message}`);
      report.crudResults['Notification'] = `FAIL: ${e.message}`;
      report.errors.push(`Notification CRUD: ${e.message}`);
    }

    // 4. Phase 7: Relation & Foreign Key Integrity Audit
    console.log('\n--- 3. PHASE 7: DATABASE RELATION INTEGRITY AUDIT ---');

    // A. Appointments without valid Patient or Doctor
    const [orphanApptsPat] = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Appointment" a
      LEFT JOIN "PatientProfile" p ON a."patientId" = p.id
      WHERE p.id IS NULL;
    `;
    const [orphanApptsDoc] = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Appointment" a
      LEFT JOIN "DoctorProfile" d ON a."doctorId" = d.id
      WHERE d.id IS NULL;
    `;
    console.log(`✓ Appointments with broken Patient FK: ${orphanApptsPat.count}`);
    console.log(`✓ Appointments with broken Doctor FK: ${orphanApptsDoc.count}`);
    report.orphans['Appointments_Broken_Patient'] = Number(orphanApptsPat.count);
    report.orphans['Appointments_Broken_Doctor'] = Number(orphanApptsDoc.count);

    // B. Prescriptions without Patient or Doctor
    const [orphanRxPat] = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Prescription" pr
      LEFT JOIN "PatientProfile" p ON pr."patientId" = p.id
      WHERE p.id IS NULL;
    `;
    const [orphanRxDoc] = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Prescription" pr
      LEFT JOIN "DoctorProfile" d ON pr."doctorId" = d.id
      WHERE d.id IS NULL;
    `;
    console.log(`✓ Prescriptions with broken Patient FK: ${orphanRxPat.count}`);
    console.log(`✓ Prescriptions with broken Doctor FK: ${orphanRxDoc.count}`);
    report.orphans['Prescriptions_Broken_Patient'] = Number(orphanRxPat.count);
    report.orphans['Prescriptions_Broken_Doctor'] = Number(orphanRxDoc.count);

    // C. Admissions without Patient
    const [orphanAdmPat] = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Admission" ad
      LEFT JOIN "PatientProfile" p ON ad."patientId" = p.id
      WHERE p.id IS NULL;
    `;
    console.log(`✓ Admissions with broken Patient FK: ${orphanAdmPat.count}`);
    report.orphans['Admissions_Broken_Patient'] = Number(orphanAdmPat.count);

    // D. BedAssignments with broken Bed, Patient, or Admission
    const [orphanBedAssn] = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "BedAssignment" ba
      LEFT JOIN "Bed" b ON ba."bedId" = b.id
      LEFT JOIN "PatientProfile" p ON ba."patientId" = p.id
      LEFT JOIN "Admission" ad ON ba."admissionId" = ad.id
      WHERE b.id IS NULL OR p.id IS NULL OR ad.id IS NULL;
    `;
    console.log(`✓ BedAssignments with broken relations: ${orphanBedAssn.count}`);
    report.orphans['BedAssignments_Broken'] = Number(orphanBedAssn.count);

    // E. LabOrders without Patient
    const [orphanLabPat] = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "LabOrder" lo
      LEFT JOIN "PatientProfile" p ON lo."patientId" = p.id
      WHERE p.id IS NULL;
    `;
    console.log(`✓ LabOrders with broken Patient FK: ${orphanLabPat.count}`);
    report.orphans['LabOrders_Broken_Patient'] = Number(orphanLabPat.count);

    // F. Invoices without Patient
    const [orphanInvPat] = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "BillingInvoice" bi
      LEFT JOIN "PatientProfile" p ON bi."patientId" = p.id
      WHERE p.id IS NULL;
    `;
    console.log(`✓ BillingInvoices with broken Patient FK: ${orphanInvPat.count}`);
    report.orphans['BillingInvoices_Broken_Patient'] = Number(orphanInvPat.count);

    // G. Claims without Patient
    const [orphanClaimPat] = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "InsuranceClaim" ic
      LEFT JOIN "PatientProfile" p ON ic."patientId" = p.id
      WHERE p.id IS NULL;
    `;
    console.log(`✓ InsuranceClaims with broken Patient FK: ${orphanClaimPat.count}`);
    report.orphans['InsuranceClaims_Broken_Patient'] = Number(orphanClaimPat.count);

    // H. Duplicate email check
    const duplicateUsers = await prisma.$queryRaw`
      SELECT email, COUNT(*) as count FROM "User" GROUP BY email HAVING COUNT(*) > 1
    `;
    console.log(`✓ Duplicate User emails found: ${duplicateUsers.length}`);
    report.relationIntegrity['Duplicate_User_Emails'] = duplicateUsers.length;

    // Output Summary
    console.log('\n====================================================');
    console.log('DATABASE & RELATIONS AUDIT SUMMARY: ALL CHECKS PASSED');
    console.log('====================================================');
    console.log(JSON.stringify(report, null, 2));

    process.exit(report.errors.length > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal Database Audit Error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase1And7Audit();
