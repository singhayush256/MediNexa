import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const API_BASE = process.env.API_URL || 'http://localhost:3001/api/v1';

async function runAppointmentSelfServiceTests() {
  console.log('==================================================');
  console.log('📅 MEDINEXA APPOINTMENT SELF-SERVICE & CONCURRENCY SUITE');
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
    // 1. Fetch Patients & Doctor
    const patient1 = await prisma.patientProfile.findFirst({ include: { user: true } });
    const patient2 = await prisma.patientProfile.findFirst({
      where: { id: { not: patient1?.id } },
      include: { user: true },
    });
    const doctor = await prisma.doctorProfile.findFirst({ include: { user: true } });
    const facility = await prisma.facility.findFirst();

    if (!patient1 || !patient2 || !doctor || !facility) {
      logFail('1. Setup failed: Missing seeded test data');
      return;
    }

    // Login Patient 1
    const p1LoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: patient1.user.email, password: 'Password123!' }),
    });
    const p1Auth: any = await p1LoginRes.json();
    const p1Token = p1Auth?.accessToken;

    // Login Patient 2
    const p2LoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: patient2.user.email, password: 'Password123!' }),
    });
    const p2Auth: any = await p2LoginRes.json();
    const p2Token = p2Auth?.accessToken;

    if (p1Token && p2Token) {
      logPass('1. Patient 1 & Patient 2 authenticated successfully');
    } else {
      logFail('1. Patient authentication failed', { p1Auth, p2Auth });
    }

    // Create doctor schedule slot if needed
    const testDate = '2026-10-15';
    await prisma.doctorSchedule.create({
      data: {
        doctorId: doctor.id,
        facilityId: facility.id,
        departmentId: doctor.departmentId,
        dayOfWeek: 4,
        startTime: '10:00',
        endTime: '12:00',
        slotDurationMinutes: 30,
      },
    }).catch(() => {}); // ignore duplicate schedule

    // 2. Book Appointment for Patient 1
    const bookRes = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p1Token}`,
      },
      body: JSON.stringify({
        patientId: patient1.id,
        doctorId: doctor.id,
        facilityId: facility.id,
        departmentId: doctor.departmentId,
        appointmentDate: testDate,
        startTime: '10:00',
        endTime: '10:30',
        type: 'CONSULTATION',
        reason: 'Regular Checkup',
      }),
    });
    const appt1: any = await bookRes.json();

    if (bookRes.ok && appt1.id) {
      logPass(`2. Patient 1 booked appointment (${appt1.appointmentNumber})`);
    } else {
      logFail('2. Patient 1 booking failed', appt1);
      return;
    }

    // 3. Security Guard: Patient 2 CANNOT cancel Patient 1's appointment (403 Forbidden)
    const p2CancelRes = await fetch(`${API_BASE}/appointments/${appt1.id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p2Token}`,
      },
      body: JSON.stringify({ reason: 'Malicious cancellation' }),
    });

    if (p2CancelRes.status === 403) {
      logPass('3. Security Guard: Patient 2 blocked from cancelling Patient 1 appointment (HTTP 403 Forbidden)');
    } else {
      logFail(`3. Security Guard: Expected 403, got ${p2CancelRes.status}`);
    }

    // 4. Security Guard: Patient 2 CANNOT reschedule Patient 1's appointment (403 Forbidden)
    const p2RescheduleRes = await fetch(`${API_BASE}/appointments/${appt1.id}/reschedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p2Token}`,
      },
      body: JSON.stringify({
        appointmentDate: testDate,
        startTime: '11:00',
        endTime: '11:30',
        reason: 'Malicious reschedule',
      }),
    });

    if (p2RescheduleRes.status === 403) {
      logPass('4. Security Guard: Patient 2 blocked from rescheduling Patient 1 appointment (HTTP 403 Forbidden)');
    } else {
      logFail(`4. Security Guard: Expected 403, got ${p2RescheduleRes.status}`);
    }

    // 5. Patient 1 Reschedules Own Appointment to 11:00
    const p1RescheduleRes = await fetch(`${API_BASE}/appointments/${appt1.id}/reschedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p1Token}`,
      },
      body: JSON.stringify({
        appointmentDate: testDate,
        startTime: '11:00',
        endTime: '11:30',
        reason: 'Shift clash',
      }),
    });
    const rescheduledData: any = await p1RescheduleRes.json();

    if (p1RescheduleRes.ok && rescheduledData.status === 'RESCHEDULED') {
      logPass(`5. Patient 1 rescheduled appointment to 11:00 (Status: RESCHEDULED)`);

      // Verify notification created
      const notification = await prisma.notification.findFirst({
        where: { userId: patient1.user.id, title: 'Appointment Rescheduled' },
        orderBy: { createdAt: 'desc' },
      });
      if (notification) {
        logPass(`6. Reschedule Notification created (Notification ID: ${notification.id})`);
      } else {
        logFail('6. Reschedule Notification not found');
      }

      // Verify PHI Audit event
      const audit = await prisma.auditEvent.findFirst({
        where: { action: 'RESCHEDULE_APPOINTMENT', resource: `appointment:${appt1.id}` },
        orderBy: { createdAt: 'desc' },
      });
      if (audit) {
        logPass(`7. PHI Audit Engine captured RESCHEDULE_APPOINTMENT event (Audit ID: ${audit.id})`);
      } else {
        logFail('7. Audit record for RESCHEDULE_APPOINTMENT not found');
      }
    } else {
      logFail('5. Patient 1 rescheduling failed', rescheduledData);
    }

    // 6. Patient 1 Cancels Own Appointment
    const p1CancelRes = await fetch(`${API_BASE}/appointments/${appt1.id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p1Token}`,
      },
      body: JSON.stringify({ reason: 'Feeling better' }),
    });
    const cancelledData: any = await p1CancelRes.json();

    if (p1CancelRes.ok && cancelledData.status === 'CANCELLED') {
      logPass(`8. Patient 1 cancelled own appointment (Status: CANCELLED, Reason: ${cancelledData.cancellationReason})`);

      // Verify notification created
      const cancelNotification = await prisma.notification.findFirst({
        where: { userId: patient1.user.id, type: 'APPOINTMENT_CANCELLED' },
        orderBy: { createdAt: 'desc' },
      });
      if (cancelNotification) {
        logPass(`9. Cancellation Notification created (Notification ID: ${cancelNotification.id})`);
      } else {
        logFail('9. Cancellation Notification not found');
      }

      // Verify PHI Audit event
      const cancelAudit = await prisma.auditEvent.findFirst({
        where: { action: 'CANCEL_APPOINTMENT', resource: `appointment:${appt1.id}` },
        orderBy: { createdAt: 'desc' },
      });
      if (cancelAudit) {
        logPass(`10. PHI Audit Engine captured CANCEL_APPOINTMENT event (Audit ID: ${cancelAudit.id})`);
      } else {
        logFail('10. Audit record for CANCEL_APPOINTMENT not found');
      }
    } else {
      logFail('8. Patient 1 cancellation failed', cancelledData);
    }

    // 7. Test Invalid Status Transition: Cannot cancel an already CANCELLED appointment (HTTP 400)
    const repeatCancelRes = await fetch(`${API_BASE}/appointments/${appt1.id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p1Token}`,
      },
      body: JSON.stringify({ reason: 'Repeat cancel' }),
    });
    if (repeatCancelRes.status === 400) {
      logPass('11. Status Transition Guard: Repeater cancellation rejected (HTTP 400 Bad Request)');
    } else {
      logFail(`11. Expected 400 for repeat cancellation, got ${repeatCancelRes.status}`);
    }

    // 8. Test Concurrent Booking on the Same Slot (Double-Booking Protection)
    const targetSlotDate = '2026-10-16';
    const targetSlotTime = '11:30';

    const [resA, resB] = await Promise.all([
      fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${p1Token}` },
        body: JSON.stringify({
          patientId: patient1.id,
          doctorId: doctor.id,
          facilityId: facility.id,
          departmentId: doctor.departmentId,
          appointmentDate: targetSlotDate,
          startTime: targetSlotTime,
          endTime: '12:00',
          type: 'CONSULTATION',
          reason: 'Concurrent booking test A',
        }),
      }),
      fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${p2Token}` },
        body: JSON.stringify({
          patientId: patient2.id,
          doctorId: doctor.id,
          facilityId: facility.id,
          departmentId: doctor.departmentId,
          appointmentDate: targetSlotDate,
          startTime: targetSlotTime,
          endTime: '12:00',
          type: 'CONSULTATION',
          reason: 'Concurrent booking test B',
        }),
      }),
    ]);

    const statuses = [resA.status, resB.status].sort();
    if (statuses.includes(201) && (statuses.includes(409) || statuses.includes(400))) {
      logPass(`12. Concurrent Double-Booking Protection: Exactly 1 Winner (HTTP ${statuses[1]}) and 1 Rejected (HTTP ${statuses[0]})`);
    } else {
      logFail(`12. Concurrent double-booking test unexpected status codes: [${resA.status}, ${resB.status}]`);
    }

  } catch (err: any) {
    console.error('Fatal execution error:', err);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n==================================================');
  console.log(`📊 APPOINTMENT SELF-SERVICE SUITE: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');
}

runAppointmentSelfServiceTests();
