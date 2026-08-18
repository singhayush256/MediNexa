import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReminderStatus, RoleCode, NotificationType } from '@medinexa/types';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ReminderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async createReminder(dto: { prescriptionItemId: string; scheduledTime: string; frequency?: string }, requestingUser: any) {
    const rxItem = await this.prisma.prescriptionItem.findUnique({
      where: { id: dto.prescriptionItemId },
      include: { prescription: true, medication: true },
    });
    if (!rxItem) throw new NotFoundException('Prescription item not found');

    if (requestingUser.role === RoleCode.PATIENT) {
      if (requestingUser.patientProfile?.id !== rxItem.prescription.patientId) {
        throw new ForbiddenException('Patients can only create reminders for their own prescriptions');
      }
    }

    // Check if reminder already exists for this prescription item
    const existing = await this.prisma.medicationReminder.findFirst({
      where: {
        patientId: rxItem.prescription.patientId,
        prescriptionItemId: rxItem.id,
        scheduledTime: dto.scheduledTime,
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.medicationReminder.create({
      data: {
        patientId: rxItem.prescription.patientId,
        prescriptionItemId: rxItem.id,
        scheduledTime: dto.scheduledTime,
        frequency: dto.frequency || rxItem.frequency || 'DAILY',
        status: ReminderStatus.ACTIVE,
      },
      include: {
        prescriptionItem: {
          include: {
            medication: true,
            prescription: { include: { doctor: { include: { user: true } } } },
          },
        },
      },
    });
  }

  async getPatientReminders(patientId: string, requestingUser: any) {
    let targetPatientId = patientId;
    if (patientId === 'me') {
      if (!requestingUser.patientProfile) {
        throw new ForbiddenException('User is not a registered patient');
      }
      targetPatientId = requestingUser.patientProfile.id;
    }

    if (requestingUser.role === RoleCode.PATIENT && requestingUser.patientProfile?.id !== targetPatientId) {
      throw new ForbiddenException('Patients can only view their own medication reminders');
    }

    return this.prisma.medicationReminder.findMany({
      where: { patientId: targetPatientId },
      include: {
        prescriptionItem: {
          include: {
            medication: true,
            prescription: { include: { doctor: { include: { user: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTodayReminders(requestingUser: any) {
    if (!requestingUser.patientProfile) {
      throw new ForbiddenException('User is not a registered patient');
    }

    const reminders = await this.getPatientReminders(requestingUser.patientProfile.id, requestingUser);
    return reminders.filter((r) => r.status === ReminderStatus.ACTIVE);
  }

  async getUpcomingReminders(requestingUser: any) {
    return this.getTodayReminders(requestingUser);
  }

  async markDoseTaken(id: string, requestingUser: any) {
    const reminder = await this.prisma.medicationReminder.findUnique({ where: { id } });
    if (!reminder) throw new NotFoundException('Medication reminder not found');

    if (requestingUser.role === RoleCode.PATIENT && requestingUser.patientProfile?.id !== reminder.patientId) {
      throw new ForbiddenException('Patients can only update their own medication reminders');
    }

    return this.prisma.medicationReminder.update({
      where: { id },
      data: { lastTakenAt: new Date() },
      include: {
        prescriptionItem: { include: { medication: true } },
      },
    });
  }

  async markDoseSkipped(id: string, requestingUser: any) {
    const reminder = await this.prisma.medicationReminder.findUnique({ where: { id } });
    if (!reminder) throw new NotFoundException('Medication reminder not found');

    if (requestingUser.role === RoleCode.PATIENT && requestingUser.patientProfile?.id !== reminder.patientId) {
      throw new ForbiddenException('Patients can only update their own medication reminders');
    }

    return this.prisma.medicationReminder.update({
      where: { id },
      data: { skippedAt: new Date() },
      include: {
        prescriptionItem: { include: { medication: true } },
      },
    });
  }

  async updateReminderStatus(id: string, status: ReminderStatus, requestingUser: any) {
    const reminder = await this.prisma.medicationReminder.findUnique({ where: { id } });
    if (!reminder) throw new NotFoundException('Medication reminder not found');

    if (requestingUser.role === RoleCode.PATIENT && requestingUser.patientProfile?.id !== reminder.patientId) {
      throw new ForbiddenException('Patients can only update their own medication reminders');
    }

    return this.prisma.medicationReminder.update({
      where: { id },
      data: { status },
      include: {
        prescriptionItem: { include: { medication: true } },
      },
    });
  }

  // =========================================================================
  // SCHEDULER & DEDUPLICATED NOTIFICATION ENGINE
  // =========================================================================
  async triggerScheduledReminders() {
    const activeReminders = await this.prisma.medicationReminder.findMany({
      where: { status: ReminderStatus.ACTIVE },
      include: {
        patient: { include: { user: true } },
        prescriptionItem: { include: { medication: true } },
      },
    });

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    let triggeredCount = 0;

    for (const rem of activeReminders) {
      if (!rem.patient?.user?.id) continue;

      // Deduplication check: Has a notification already been issued for this reminder today?
      const existingNotification = await this.prisma.notification.findFirst({
        where: {
          userId: rem.patient.user.id,
          type: NotificationType.MEDICATION_REMINDER as any,
          entityId: rem.id,
          createdAt: { gte: todayStart },
        },
      });

      if (existingNotification) {
        continue; // Skip duplicate notification creation
      }

      // Create Notification
      const medName = rem.prescriptionItem?.medication?.brandName || rem.prescriptionItem?.medication?.genericName || 'Medication';
      const dosage = rem.prescriptionItem?.dosage || '';

      await this.notificationService.createNotification({
        userId: rem.patient.user.id,
        type: NotificationType.MEDICATION_REMINDER,
        title: 'Medication Reminder',
        message: `It's time to take ${medName} ${dosage}. Scheduled for ${rem.scheduledTime}.`,
        entityType: 'MEDICATION_REMINDER',
        entityId: rem.id,
      });

      await this.prisma.medicationReminder.update({
        where: { id: rem.id },
        data: { lastNotifiedAt: now },
      });

      triggeredCount++;
    }

    return { triggeredCount };
  }
}
