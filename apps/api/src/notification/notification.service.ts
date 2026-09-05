import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { EmailNotificationService } from './email.service';
import { WhatsAppNotificationService } from './whatsapp.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailNotificationService,
    private readonly whatsAppService: WhatsAppNotificationService,
  ) {}

  async createNotification(dto: CreateNotificationDto) {
    // 1. Create In-App Notification
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type as any,
        title: dto.title,
        message: dto.message,
        entityType: dto.entityType,
        entityId: dto.entityId,
        isRead: false,
      },
    });

    // 2. Fetch user preferences & user profile to decide external channel dispatches
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId },
        include: { notificationPreference: true },
      });

      if (user) {
        const pref = user.notificationPreference || {
          emailEnabled: true,
          whatsappEnabled: true,
          appointmentReminders: true,
          medicationReminders: true,
          labReportAlerts: true,
        };

        const isMedReminder = dto.type === 'MEDICATION_REMINDER';
        const isApptReminder = dto.type === 'APPOINTMENT_REMINDER' || dto.type === 'APPOINTMENT_CONFIRMED';
        const isLabAlert = dto.type === 'LAB_REPORT_AVAILABLE' || dto.type === 'LAB_RESULT_READY';

        const shouldSendEmail = pref.emailEnabled && (
          (isMedReminder && pref.medicationReminders) ||
          (isApptReminder && pref.appointmentReminders) ||
          (isLabAlert && pref.labReportAlerts) ||
          (!isMedReminder && !isApptReminder && !isLabAlert)
        );

        const shouldSendWhatsApp = pref.whatsappEnabled && user.phone && (
          (isMedReminder && pref.medicationReminders) ||
          (isApptReminder && pref.appointmentReminders) ||
          (isLabAlert && pref.labReportAlerts) ||
          (!isMedReminder && !isApptReminder && !isLabAlert)
        );

        // Send Email if allowed
        if (shouldSendEmail && user.email) {
          if (isMedReminder) {
            await this.emailService.sendMedicationReminder({
              recipientEmail: user.email,
              recipientName: `${user.firstName} ${user.lastName}`,
              medicineName: dto.title.replace('Medication Reminder: ', ''),
              dosage: 'As prescribed',
              doseTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          } else if (isApptReminder) {
            await this.emailService.sendAppointmentReminder2h({
              recipientEmail: user.email,
              recipientName: `${user.firstName} ${user.lastName}`,
              doctorName: 'Attending Physician',
              appointmentTime: 'Upcoming today',
            });
          } else if (isLabAlert) {
            await this.emailService.sendLabReportReady({
              recipientEmail: user.email,
              recipientName: `${user.firstName} ${user.lastName}`,
              testName: dto.title,
              reportNumber: dto.entityId || 'LAB-001',
            });
          }
        }

        // Send WhatsApp if allowed
        if (shouldSendWhatsApp && user.phone) {
          if (isMedReminder) {
            await this.whatsAppService.sendMedicationReminder({
              recipientPhone: user.phone,
              patientName: `${user.firstName} ${user.lastName}`,
              medicine: dto.title.replace('Medication Reminder: ', ''),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          } else if (isApptReminder) {
            await this.whatsAppService.sendAppointmentReminder({
              recipientPhone: user.phone,
              recipientName: `${user.firstName} ${user.lastName}`,
              doctorName: 'Attending Physician',
              time: 'Today',
            });
          } else if (isLabAlert) {
            await this.whatsAppService.sendLabReportReady({
              recipientPhone: user.phone,
              recipientName: `${user.firstName} ${user.lastName}`,
              testName: dto.title,
              reportNumber: dto.entityId || 'LAB-001',
              downloadUrl: 'http://localhost:3000/portal/reports',
            });
          }
        }
      }
    } catch (deliveryErr: any) {
      this.logger.warn(`External notification dispatch warning: ${deliveryErr.message}`);
    }

    return notification;
  }

  async getUserNotifications(userId: string, requestingUser: any) {
    if (requestingUser.id !== userId && requestingUser.role !== 'MEDINEXA_ADMIN') {
      throw new ForbiddenException('Users can only access their own notifications');
    }

    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string, requestingUser: any) {
    if (requestingUser.id !== userId && requestingUser.role !== 'MEDINEXA_ADMIN') {
      throw new ForbiddenException('Users can only access their own unread count');
    }

    const count = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });

    return { count };
  }

  async markAsRead(id: string, requestingUser: any) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) throw new NotFoundException('Notification not found');

    if (notif.userId !== requestingUser.id && requestingUser.role !== 'MEDINEXA_ADMIN') {
      throw new ForbiddenException('Users can only manage their own notifications');
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        readAt: new Date(),
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId: string, requestingUser: any) {
    if (requestingUser.id !== userId && requestingUser.role !== 'MEDINEXA_ADMIN') {
      throw new ForbiddenException('Users can only manage their own notifications');
    }

    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: {
        readAt: new Date(),
        isRead: true,
      },
    });

    return { success: true };
  }

  async getNotificationById(id: string, requestingUser: any) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) throw new NotFoundException('Notification not found');

    if (notif.userId !== requestingUser.id && requestingUser.role !== 'MEDINEXA_ADMIN') {
      throw new ForbiddenException('Users can only access their own notifications');
    }

    return notif;
  }

  async deleteNotification(id: string, requestingUser: any) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) throw new NotFoundException('Notification not found');

    if (notif.userId !== requestingUser.id && requestingUser.role !== 'MEDINEXA_ADMIN') {
      throw new ForbiddenException('Users can only delete their own notifications');
    }

    await this.prisma.notification.delete({ where: { id } });
    return { success: true };
  }

  // Preferences Management
  async getPreferences(userId: string) {
    let pref = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!pref) {
      pref = await this.prisma.notificationPreference.create({
        data: {
          userId,
          emailEnabled: true,
          whatsappEnabled: true,
          appointmentReminders: true,
          medicationReminders: true,
          labReportAlerts: true,
        },
      });
    }

    return pref;
  }

  async updatePreferences(userId: string, data: {
    emailEnabled?: boolean;
    whatsappEnabled?: boolean;
    appointmentReminders?: boolean;
    medicationReminders?: boolean;
    labReportAlerts?: boolean;
  }) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        emailEnabled: data.emailEnabled ?? true,
        whatsappEnabled: data.whatsappEnabled ?? true,
        appointmentReminders: data.appointmentReminders ?? true,
        medicationReminders: data.medicationReminders ?? true,
        labReportAlerts: data.labReportAlerts ?? true,
      },
    });
  }

  // Admin Panel: Delivery Logs, Retries & Adherence Reporting
  async getAdminDeliveryLogs(query: {
    channel?: string;
    status?: string;
    search?: string;
    limit?: number;
    page?: number;
  }) {
    const where: any = {};
    if (query.channel && query.channel !== 'ALL') {
      where.channel = query.channel;
    }
    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }
    if (query.search) {
      where.OR = [
        { recipient: { contains: query.search, mode: 'insensitive' } },
        { title: { contains: query.search, mode: 'insensitive' } },
        { message: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const take = query.limit ? Number(query.limit) : 50;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * take;

    const [logs, total] = await Promise.all([
      this.prisma.notificationDeliveryLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.notificationDeliveryLog.count({ where }),
    ]);

    const sentCount = await this.prisma.notificationDeliveryLog.count({ where: { status: 'SENT' } });
    const failedCount = await this.prisma.notificationDeliveryLog.count({ where: { status: 'FAILED' } });

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / take) || 1,
      stats: {
        total,
        sent: sentCount,
        failed: failedCount,
        successRate: total > 0 ? Math.round((sentCount / total) * 100) : 100,
      },
    };
  }

  async retryFailedNotification(id: string) {
    const log = await this.prisma.notificationDeliveryLog.findUnique({ where: { id } });
    if (!log) throw new NotFoundException('Delivery log not found');

    let retrySuccess = false;
    let failureReason: string | undefined;

    if (log.channel === 'EMAIL') {
      const res = await this.emailService.sendMedicationReminder({
        recipientEmail: log.recipient,
        recipientName: 'Patient',
        medicineName: log.title,
        dosage: 'Retried dose',
        doseTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      retrySuccess = res.success;
      failureReason = res.error;
    } else if (log.channel === 'WHATSAPP') {
      const res = await this.whatsAppService.sendMedicationReminder({
        recipientPhone: log.recipient,
        patientName: 'Patient',
        medicine: log.title,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      retrySuccess = res.status !== 'FAILED';
    }

    const updated = await this.prisma.notificationDeliveryLog.update({
      where: { id },
      data: {
        status: retrySuccess ? 'SENT' : 'FAILED',
        failureReason: retrySuccess ? null : failureReason || 'Retry attempted but failed',
        sentAt: retrySuccess ? new Date() : log.sentAt,
      },
    });

    return { success: retrySuccess, log: updated };
  }

  async getAdherenceReport() {
    // Calculate global patient medication adherence across active medications and logs
    const activeMeds = await this.prisma.medication.findMany({
      where: { status: 'active', patientId: { not: null } },
      include: { logs: true },
    });

    const totalDosesScheduled = activeMeds.reduce((acc, med) => acc + (med.timing?.length || 1) * 7, 0); // 7-day projection
    const allLogs = await this.prisma.medicationLog.findMany({
      orderBy: { scheduledFor: 'desc' },
      take: 200,
    });

    const takenCount = allLogs.filter((l) => l.status === 'taken').length;
    const missedCount = allLogs.filter((l) => l.status === 'missed').length;
    const pendingCount = allLogs.filter((l) => l.status === 'pending').length;
    const totalRecorded = takenCount + missedCount + pendingCount;
    const overallAdherence = totalRecorded > 0 ? Math.round((takenCount / totalRecorded) * 100) : 85;

    // Patient breakdown
    const patientMap = new Map<string, { total: number; taken: number; missed: number }>();
    for (const log of allLogs) {
      const curr = patientMap.get(log.patientId) || { total: 0, taken: 0, missed: 0 };
      curr.total++;
      if (log.status === 'taken') curr.taken++;
      if (log.status === 'missed') curr.missed++;
      patientMap.set(log.patientId, curr);
    }

    const patientBreakdown = Array.from(patientMap.entries()).map(([patientId, stats]) => ({
      patientId,
      adherenceRate: stats.total > 0 ? Math.round((stats.taken / stats.total) * 100) : 0,
      takenDoses: stats.taken,
      missedDoses: stats.missed,
      totalDoses: stats.total,
    }));

    return {
      overallAdherence,
      activeMedicationsCount: activeMeds.length,
      takenDosesCount: takenCount,
      missedDosesCount: missedCount,
      pendingDosesCount: pendingCount,
      recentLogs: allLogs.slice(0, 50),
      patientBreakdown,
    };
  }

  async getAdherenceReportCsv(): Promise<string> {
    const report = await this.getAdherenceReport();
    const rows = [
      ['Log ID', 'Medication ID', 'Patient ID', 'Dose Time', 'Status', 'Scheduled For', 'Taken At', 'Notes'],
    ];

    for (const log of report.recentLogs) {
      rows.push([
        log.id,
        log.medicationId,
        log.patientId,
        log.doseTime,
        log.status,
        log.scheduledFor.toISOString(),
        log.takenAt ? log.takenAt.toISOString() : '',
        log.notes ? `"${log.notes.replace(/"/g, '""')}"` : '',
      ]);
    }

    return rows.map((r) => r.join(',')).join('\n');
  }
}
