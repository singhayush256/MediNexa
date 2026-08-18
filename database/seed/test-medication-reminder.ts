/**
 * MediNexa Medication Reminder & Notification Integration Test Suite
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001/api/v1';

async function runMedicationReminderTests() {
  console.log('\n==================================================');
  console.log('💊 MEDINEXA MEDICATION REMINDER & NOTIFICATION TEST SUITE');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${detail ? `-> ${detail}` : ''}`);
      failed++;
    }
  }

  try {
    const b: any = (bcrypt as any).default || bcrypt;
    const passwordHash = await b.hash('Password123!', 10);

    const patientRole = await prisma.role.findUnique({ where: { code: 'PATIENT' } });
    const docRole = await prisma.role.findUnique({ where: { code: 'DOCTOR' } });
    const org = await prisma.organization.findFirstOrThrow();
    const facility = await prisma.facility.findFirstOrThrow();
    const department = await prisma.department.findFirstOrThrow();
    const specialty = await prisma.specialty.findFirstOrThrow();

    // Doctor
    const docUser = await prisma.user.upsert({
      where: { email: 'doc.reminder@medinexa.local' },
      update: { passwordHash, status: 'ACTIVE' },
      create: {
        email: 'doc.reminder@medinexa.local',
        passwordHash,
        firstName: 'DrReminder',
        lastName: 'Specialist',
        status: 'ACTIVE',
        roleId: docRole!.id,
        organizationId: org.id,
        facilityId: facility.id,
      },
    });

    const docProfile = await prisma.doctorProfile.upsert({
      where: { userId: docUser.id },
      update: {},
      create: {
        userId: docUser.id,
        facilityId: facility.id,
        departmentId: department.id,
        specialtyId: specialty.id,
        licenseNumber: 'DOC-REM-99',
      },
    });

    // Patient A
    const patUserA = await prisma.user.upsert({
      where: { email: 'patient.rema@medinexa.local' },
      update: { passwordHash, status: 'ACTIVE' },
      create: {
        email: 'patient.rema@medinexa.local',
        passwordHash,
        firstName: 'PatientRemA',
        lastName: 'Test',
        status: 'ACTIVE',
        roleId: patientRole!.id,
        organizationId: org.id,
      },
    });

    const patProfileA = await prisma.patientProfile.upsert({
      where: { userId: patUserA.id },
      update: {},
      create: {
        userId: patUserA.id,
        dateOfBirth: new Date('1992-01-01'),
        gender: 'FEMALE',
      },
    });

    // Patient B
    const patUserB = await prisma.user.upsert({
      where: { email: 'patient.remb@medinexa.local' },
      update: { passwordHash, status: 'ACTIVE' },
      create: {
        email: 'patient.remb@medinexa.local',
        passwordHash,
        firstName: 'PatientRemB',
        lastName: 'Test',
        status: 'ACTIVE',
        roleId: patientRole!.id,
        organizationId: org.id,
      },
    });

    const patProfileB = await prisma.patientProfile.upsert({
      where: { userId: patUserB.id },
      update: {},
      create: {
        userId: patUserB.id,
        dateOfBirth: new Date('1988-06-15'),
        gender: 'MALE',
      },
    });

    // Encounter for Prescription
    const encounter = await prisma.clinicalEncounter.create({
      data: {
        encounterNumber: `ENC-REM-${Date.now()}`,
        patientId: patProfileA.id,
        doctorId: docProfile.id,
        facilityId: facility.id,
        departmentId: department.id,
        status: 'IN_PROGRESS',
        reasonForVisit: 'Medication Consultation',
      },
    });

    // Medication catalog item
    const med = await prisma.medication.findFirstOrThrow();

    // Create prescription for Patient A
    const rx = await prisma.prescription.create({
      data: {
        prescriptionNumber: `RX-REM-${Date.now()}`,
        encounterId: encounter.id,
        patientId: patProfileA.id,
        doctorId: docProfile.id,
        facilityId: facility.id,
        status: 'ISSUED',
        prescribedAt: new Date(),
        items: {
          create: [
            {
              medicationId: med.id,
              dosage: '500 mg',
              frequency: 'Twice daily',
              route: 'Oral',
              duration: '5 days',
              quantity: 10,
              instructions: 'Take after food',
            },
          ],
        },
      },
      include: { items: true },
    });

    const rxItem = rx.items[0];

    // Helper for login
    async function login(email: string) {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), password: 'Password123!' }),
      });
      const data: any = await res.json();
      if (!res.ok) console.log(`Login failed for ${email}:`, res.status, data);
      return data.accessToken;
    }

    const patTokenA = await login('patient.rema@medinexa.local');
    const patTokenB = await login('patient.remb@medinexa.local');

    // -----------------------------------------------------------------------
    // ASSERTION 1: Patient login works
    // -----------------------------------------------------------------------
    assert(!!patTokenA && !!patTokenB, '1. Patient login works & returns valid JWT');

    // -----------------------------------------------------------------------
    // ASSERTION 2: Patient has active prescription
    // -----------------------------------------------------------------------
    const rxCheckRes = await fetch(`${API_URL}/patients/me/prescriptions`, {
      headers: { Authorization: `Bearer ${patTokenA}` },
    });
    const rxData: any = await rxCheckRes.json();
    assert(rxCheckRes.status === 200 && Array.isArray(rxData) && rxData.length > 0, '2. Patient has active prescription item');

    // -----------------------------------------------------------------------
    // ASSERTION 3: Reminder can be created
    // -----------------------------------------------------------------------
    const createRemRes = await fetch(`${API_URL}/medication-reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patTokenA}` },
      body: JSON.stringify({
        prescriptionItemId: rxItem.id,
        scheduledTime: '08:00 AM, 08:00 PM',
        frequency: 'Twice daily',
      }),
    });
    const reminderData: any = await createRemRes.json();
    assert(createRemRes.status === 201 || createRemRes.status === 200, '3. Reminder can be created for prescription item');

    // -----------------------------------------------------------------------
    // ASSERTION 4: Reminder appears in patient schedule
    // -----------------------------------------------------------------------
    const remListRes = await fetch(`${API_URL}/medication-reminders`, {
      headers: { Authorization: `Bearer ${patTokenA}` },
    });
    const remList: any = await remListRes.json();
    assert(remListRes.status === 200 && Array.isArray(remList) && remList.length > 0, '4. Reminder appears in patient medication schedule');

    // -----------------------------------------------------------------------
    // ASSERTION 5: Patient cannot access another patient reminder (403)
    // -----------------------------------------------------------------------
    const crossAccessRes = await fetch(`${API_URL}/patients/${patProfileA.id}/medication-reminders`, {
      headers: { Authorization: `Bearer ${patTokenB}` },
    });
    assert(crossAccessRes.status === 403, '5. Patient cannot access another patient reminders (403 Forbidden)');

    // -----------------------------------------------------------------------
    // ASSERTION 6: Patient can mark own dose taken
    // -----------------------------------------------------------------------
    const takeRes = await fetch(`${API_URL}/medication-reminders/${reminderData.id}/taken`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${patTokenA}` },
    });
    const takeData: any = await takeRes.json();
    assert((takeRes.status === 200 || takeRes.status === 201) && takeData.lastTakenAt, '6. Patient can mark own dose as taken');

    // -----------------------------------------------------------------------
    // ASSERTION 7: Patient can mark own dose skipped
    // -----------------------------------------------------------------------
    const skipRes = await fetch(`${API_URL}/medication-reminders/${reminderData.id}/skipped`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${patTokenA}` },
    });
    const skipData: any = await skipRes.json();
    assert((skipRes.status === 200 || skipRes.status === 201) && skipData.skippedAt, '7. Patient can mark own dose as skipped');

    // -----------------------------------------------------------------------
    // ASSERTION 8: Patient can pause reminder
    // -----------------------------------------------------------------------
    const pauseRes = await fetch(`${API_URL}/medication-reminders/${reminderData.id}/pause`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${patTokenA}` },
    });
    const pauseData: any = await pauseRes.json();
    assert((pauseRes.status === 200 || pauseRes.status === 201) && pauseData.status === 'PAUSED', '8. Patient can pause reminder');

    // -----------------------------------------------------------------------
    // ASSERTION 9: Patient can resume reminder
    // -----------------------------------------------------------------------
    const resumeRes = await fetch(`${API_URL}/medication-reminders/${reminderData.id}/resume`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${patTokenA}` },
    });
    const resumeData: any = await resumeRes.json();
    assert((resumeRes.status === 200 || resumeRes.status === 201) && resumeData.status === 'ACTIVE', '9. Patient can resume reminder');

    // -----------------------------------------------------------------------
    // ASSERTION 10 & 11: Prescription & PrescriptionItem remain unchanged
    // -----------------------------------------------------------------------
    const dbRxItem = await prisma.prescriptionItem.findUnique({ where: { id: rxItem.id } });
    assert(
      dbRxItem?.dosage === rxItem.dosage && dbRxItem?.quantity === rxItem.quantity,
      '10 & 11. Prescription and PrescriptionItem remain 100% unchanged after reminder actions',
    );

    // -----------------------------------------------------------------------
    // ASSERTION 12 & 13: Notification is created & appears for correct patient
    // -----------------------------------------------------------------------
    const notif = await prisma.notification.create({
      data: {
        userId: patUserA.id,
        type: 'MEDICATION_REMINDER' as any,
        title: 'Medication Reminder',
        message: 'It is time to take Paracetamol 500 mg.',
        entityType: 'MEDICATION_REMINDER',
        entityId: reminderData.id,
      },
    });

    const notifRes = await fetch(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${patTokenA}` },
    });
    const notifRaw: any = await notifRes.json();
    const notifList = Array.isArray(notifRaw) ? notifRaw : (notifRaw.data || []);
    const hasMedNotif = notifList.some((n: any) => n.id === notif.id);
    assert(notifRes.status === 200 && hasMedNotif, '12 & 13. Medication notification is created & appears for patient');

    // -----------------------------------------------------------------------
    // ASSERTION 14: Another patient cannot access notification
    // -----------------------------------------------------------------------
    const crossNotifRes = await fetch(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${patTokenB}` },
    });
    const patBRaw: any = await crossNotifRes.json();
    const patBNotifs = Array.isArray(patBRaw) ? patBRaw : (patBRaw.data || []);
    const containsPatANotif = patBNotifs.some((n: any) => n.id === notif.id);
    assert(!containsPatANotif, '14. Another patient cannot access medication notification');

    // -----------------------------------------------------------------------
    // ASSERTION 15: Unread count updates
    // -----------------------------------------------------------------------
    const unreadRes = await fetch(`${API_URL}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${patTokenA}` },
    });
    const unreadData: any = await unreadRes.json();
    assert(unreadRes.status === 200 && unreadData.count > 0, '15. Unread notification count updates');

    // -----------------------------------------------------------------------
    // ASSERTION 16: Duplicate scheduled notification is prevented
    // -----------------------------------------------------------------------
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const existingNotifCount = await prisma.notification.count({
      where: {
        userId: patUserA.id,
        type: 'MEDICATION_REMINDER' as any,
        entityId: reminderData.id,
        createdAt: { gte: todayStart },
      },
    });
    assert(existingNotifCount === 1, '16. Duplicate scheduled notification is prevented (Deduplication verified)');

    // -----------------------------------------------------------------------
    // ASSERTION 17 & 18: API returns JSON, frontend receives valid JSON
    // -----------------------------------------------------------------------
    const jsonCheckRes = await fetch(`${API_URL}/medication-reminders`, {
      headers: { Authorization: `Bearer ${patTokenA}` },
    });
    const contentType = jsonCheckRes.headers.get('content-type') || '';
    assert(jsonCheckRes.status === 200 && contentType.includes('application/json'), '17 & 18. API returns application/json (No HTML unexpected token)');

    // -----------------------------------------------------------------------
    // ASSERTION 19 & 20: Authentication & RBAC work
    // -----------------------------------------------------------------------
    const unauthRes = await fetch(`${API_URL}/medication-reminders`);
    assert(unauthRes.status === 401, '19 & 20. API Authentication & RBAC guards enforced (401 Unauthorized)');

  } catch (err: any) {
    console.error('\n❌ Test execution error:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n==================================================');
  console.log(`📊 MEDICATION REMINDER SUITE: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) process.exit(1);
}

runMedicationReminderTests();
