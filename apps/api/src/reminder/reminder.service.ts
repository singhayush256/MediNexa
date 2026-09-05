import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ReminderStatus,
  RoleCode,
  NotificationType,
  PrescriptionStatus,
  FoodTiming,
  ReminderAction,
  ReminderNotificationChannel,
  ReminderNotificationStatus,
} from '@medinexa/types';
import { NotificationService } from '../notification/notification.service';
import { WhatsAppNotificationService } from '../notification/whatsapp.service';
import { SmsGatewayService } from '../notification/sms-gateway.service';
import { EmailNotificationService } from '../notification/email.service';
import {
  CreateReminderDto,
  UpdateReminderDto,
  RecordDoseActionDto,
  TestDispatchDto,
} from './dto/reminder.dto';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly whatsAppService: WhatsAppNotificationService,
    private readonly smsGatewayService: SmsGatewayService,
    private readonly emailService: EmailNotificationService,
  ) {}

  /**
   * Helper to determine time slot based on HH:mm string (or standard text)
   */
  private getTimeSlot(timeStr: string): 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' {
    const clean = timeStr.trim().toLowerCase();
    if (clean.includes('am')) {
      const parts = clean.replace('am', '').trim().split(':');
      const h = parseInt(parts[0], 10);
      if (h === 12 || h < 5) return 'NIGHT';
      return 'MORNING';
    }
    if (clean.includes('pm')) {
      const parts = clean.replace('pm', '').trim().split(':');
      const h = parseInt(parts[0], 10);
      if (h === 12 || h < 5) return 'AFTERNOON';
      if (h < 9) return 'EVENING';
      return 'NIGHT';
    }
    // 24-hour format "HH:MM"
    const match = clean.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      const h = parseInt(match[1], 10);
      if (h >= 5 && h < 12) return 'MORNING';
      if (h >= 12 && h < 17) return 'AFTERNOON';
      if (h >= 17 && h < 21) return 'EVENING';
      return 'NIGHT';
    }
    return 'MORNING';
  }

  /**
   * Create a medication reminder.
   * Can be created by a patient for themselves, or by a doctor/staff for a patient.
   */
  async createReminder(dto: CreateReminderDto, requestingUser: any) {
    let targetPatientId = dto.patientId;

    if (requestingUser.role === RoleCode.PATIENT) {
      if (!requestingUser.patientProfile) {
        throw new ForbiddenException('User is not a registered patient profile');
      }
      targetPatientId = requestingUser.patientProfile.id;
    } else {
      if (!targetPatientId) {
        throw new BadRequestException('patientId is required when creating a schedule as clinical staff');
      }
    }

    if (!targetPatientId) {
      throw new BadRequestException('A valid patientId must be provided');
    }
    const resolvedPatientId: string = targetPatientId;

    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: resolvedPatientId },
      include: { user: true },
    });
    if (!patient) {
      throw new NotFoundException(`Patient not found with ID ${targetPatientId}`);
    }

    let doctorId: string | null = null;
    if (requestingUser.doctorProfile) {
      doctorId = requestingUser.doctorProfile.id;
    }

    let rxItem: any = null;
    let medicineName = dto.medicineName || '';
    let dosage = dto.dosage || '';
    let frequency = dto.frequency || 'DAILY';
    let instructions = dto.instructions || null;

    if (dto.prescriptionItemId) {
      rxItem = await this.prisma.prescriptionItem.findUnique({
        where: { id: dto.prescriptionItemId },
        include: {
          prescription: { include: { doctor: { include: { user: true } } } },
          medication: true,
        },
      });
      if (!rxItem) throw new NotFoundException('Prescription item not found');
      if (requestingUser.role === RoleCode.PATIENT && requestingUser.patientProfile?.id !== rxItem.prescription.patientId) {
        throw new ForbiddenException('Patients can only link reminders to their own prescriptions');
      }
      medicineName = rxItem.medication?.brandName || rxItem.medication?.genericName || medicineName;
      dosage = rxItem.dosage || dosage;
      frequency = rxItem.frequency || frequency;
      instructions = rxItem.instructions || instructions;
      if (!doctorId && rxItem.prescription?.doctorId) {
        doctorId = rxItem.prescription.doctorId;
      }
    } else if (dto.medicationId) {
      const med = await this.prisma.medication.findUnique({ where: { id: dto.medicationId } });
      if (med) {
        medicineName = med.brandName || med.genericName || '';
      }
    }

    if (!medicineName) {
      throw new BadRequestException('medicineName is required if no prescription item or medication is linked');
    }

    const scheduledTime = dto.reminderTime || dto.scheduledTime || (dto.times && dto.times[0]) || '08:00 AM';
    const foodTiming = dto.foodTiming || FoodTiming.NO_RESTRICTION;
    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    const endDate = dto.endDate ? new Date(dto.endDate) : null;

    // Check if multiple times provided (e.g. ['08:00 AM', '08:00 PM'])
    const timesToCreate = dto.times && dto.times.length > 0 ? dto.times : [scheduledTime];
    const createdReminders = [];

    for (const time of timesToCreate) {
      const reminder = await this.prisma.medicationReminder.create({
        data: {
          patientId: resolvedPatientId,
          prescriptionItemId: rxItem?.id || null,
          doctorId: doctorId,
          medicineName,
          dosage,
          frequency,
          foodTiming,
          startDate,
          endDate,
          reminderTime: time,
          scheduledTime: time,
          instructions,
          status: ReminderStatus.ACTIVE,
        },
        include: {
          patient: { include: { user: true } },
          doctor: { include: { user: true, specialty: true } },
          prescriptionItem: { include: { medication: true } },
        },
      });

      // Issue initial IN_APP notification
      if (patient.user?.id) {
        await this.prisma.reminderNotification.create({
          data: {
            reminderId: reminder.id,
            patientId: resolvedPatientId,
            channel: ReminderNotificationChannel.IN_APP,
            status: ReminderNotificationStatus.SENT,
            title: `Medication Schedule Created: ${medicineName}`,
            message: `Scheduled for ${time} (${foodTiming.replace('_', ' ')}). Follow instructions carefully.`,
            sentAt: new Date(),
            scheduledTime: time,
          },
        });
      }

      createdReminders.push(reminder);
    }

    return createdReminders.length === 1 ? createdReminders[0] : createdReminders;
  }

  /**
   * Update an existing reminder
   */
  async updateReminder(id: string, dto: UpdateReminderDto, requestingUser: any) {
    const existing = await this.prisma.medicationReminder.findUnique({
      where: { id },
      include: { patient: true },
    });
    if (!existing) throw new NotFoundException(`Medication reminder not found with ID ${id}`);

    if (requestingUser.role === RoleCode.PATIENT && requestingUser.patientProfile?.id !== existing.patientId) {
      throw new ForbiddenException('Patients can only modify their own medication reminders');
    }

    return this.prisma.medicationReminder.update({
      where: { id },
      data: {
        medicineName: dto.medicineName !== undefined ? dto.medicineName : existing.medicineName,
        dosage: dto.dosage !== undefined ? dto.dosage : existing.dosage,
        frequency: dto.frequency !== undefined ? dto.frequency : existing.frequency,
        foodTiming: dto.foodTiming !== undefined ? dto.foodTiming : existing.foodTiming,
        startDate: dto.startDate ? new Date(dto.startDate) : existing.startDate,
        endDate: dto.endDate !== undefined ? (dto.endDate ? new Date(dto.endDate) : null) : existing.endDate,
        reminderTime: dto.reminderTime !== undefined ? dto.reminderTime : existing.reminderTime,
        scheduledTime: dto.scheduledTime || dto.reminderTime || existing.scheduledTime,
        instructions: dto.instructions !== undefined ? dto.instructions : existing.instructions,
        status: dto.status !== undefined ? dto.status : existing.status,
      },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        prescriptionItem: { include: { medication: true } },
      },
    });
  }

  /**
   * Delete or Cancel a medication reminder
   */
  async deleteReminder(id: string, requestingUser: any) {
    const existing = await this.prisma.medicationReminder.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Medication reminder not found with ID ${id}`);

    if (requestingUser.role === RoleCode.PATIENT && requestingUser.patientProfile?.id !== existing.patientId) {
      throw new ForbiddenException('Patients can only delete their own medication reminders');
    }

    // Soft delete / cancel to keep audit trail
    return this.prisma.medicationReminder.update({
      where: { id },
      data: { status: ReminderStatus.CANCELLED },
    });
  }

  /**
   * Fetch all reminders for a target patient
   */
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
        doctor: { include: { user: true, specialty: true } },
        prescriptionItem: {
          include: {
            medication: true,
            prescription: { include: { doctor: { include: { user: true } } } },
          },
        },
        histories: {
          orderBy: { scheduledFor: 'desc' },
          take: 5,
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get single reminder by ID
   */
  async getReminderById(id: string, requestingUser: any) {
    const reminder = await this.prisma.medicationReminder.findUnique({
      where: { id },
      include: {
        doctor: { include: { user: true, specialty: true } },
        prescriptionItem: {
          include: {
            medication: true,
            prescription: { include: { doctor: { include: { user: true } } } },
          },
        },
        histories: {
          orderBy: { scheduledFor: 'desc' },
          take: 10,
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        schedules: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!reminder) {
      throw new NotFoundException(`Medication reminder not found with ID ${id}`);
    }

    if (requestingUser.role === RoleCode.PATIENT && requestingUser.patientProfile?.id !== reminder.patientId) {
      throw new ForbiddenException('Patients can only access their own medication reminders');
    }

    return reminder;
  }

  /**
   * Get Today's Schedule for patient, with slot categorization (Morning, Afternoon, Evening, Night)
   * and action status (PENDING, TAKEN, SKIPPED, MISSED).
   */
  async getTodaySchedule(patientId: string, requestingUser: any) {
    let targetPatientId = patientId;
    if (patientId === 'me') {
      if (!requestingUser.patientProfile) {
        throw new ForbiddenException('User is not a registered patient');
      }
      targetPatientId = requestingUser.patientProfile.id;
    }

    if (requestingUser.role === RoleCode.PATIENT && requestingUser.patientProfile?.id !== targetPatientId) {
      throw new ForbiddenException('Patients can only access their own medication schedule');
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Find all active reminders valid for today
    const reminders = await this.prisma.medicationReminder.findMany({
      where: {
        patientId: targetPatientId,
        status: ReminderStatus.ACTIVE,
        startDate: { lte: todayEnd },
        OR: [
          { endDate: null },
          { endDate: { gte: todayStart } },
        ],
      },
      include: {
        doctor: { include: { user: true, specialty: true } },
        prescriptionItem: { include: { medication: true } },
        histories: {
          where: {
            scheduledFor: {
              gte: todayStart,
              lte: todayEnd,
            },
          },
        },
      },
      orderBy: { scheduledTime: 'asc' },
    });

    const groups: {
      morning: any[];
      afternoon: any[];
      evening: any[];
      night: any[];
      totalDoses: number;
      takenDoses: number;
      skippedDoses: number;
      missedDoses: number;
      pendingDoses: number;
    } = {
      morning: [],
      afternoon: [],
      evening: [],
      night: [],
      totalDoses: reminders.length,
      takenDoses: 0,
      skippedDoses: 0,
      missedDoses: 0,
      pendingDoses: 0,
    };

    for (const rem of reminders) {
      const todayHistory = rem.histories[0];
      let doseStatus: 'PENDING' | 'TAKEN' | 'SKIPPED' | 'MISSED' = 'PENDING';
      let actionTime: Date | null = null;
      let historyId: string | null = null;

      if (todayHistory) {
        historyId = todayHistory.id;
        actionTime = todayHistory.actionTime;
        if (todayHistory.action === ReminderAction.TAKEN) doseStatus = 'TAKEN';
        else if (todayHistory.action === ReminderAction.SKIPPED) doseStatus = 'SKIPPED';
        else if (todayHistory.action === ReminderAction.MISSED) doseStatus = 'MISSED';
      } else {
        // Evaluate if dose is overdue by > 2 hours
        const timeSlot = this.getTimeSlot(rem.scheduledTime || rem.reminderTime || '08:00 AM');
        const currentHour = now.getHours();
        const isOverdue =
          (timeSlot === 'MORNING' && currentHour >= 14) ||
          (timeSlot === 'AFTERNOON' && currentHour >= 19) ||
          (timeSlot === 'EVENING' && currentHour >= 23);

        if (isOverdue) {
          doseStatus = 'MISSED';
        }
      }

      if (doseStatus === 'TAKEN') groups.takenDoses++;
      else if (doseStatus === 'SKIPPED') groups.skippedDoses++;
      else if (doseStatus === 'MISSED') groups.missedDoses++;
      else groups.pendingDoses++;

      const slot = this.getTimeSlot(rem.scheduledTime || rem.reminderTime || '08:00 AM');
      const item = {
        reminderId: rem.id,
        medicineName: rem.medicineName || rem.prescriptionItem?.medication?.brandName || 'Medication',
        dosage: rem.dosage || rem.prescriptionItem?.dosage || '1 dose',
        frequency: rem.frequency,
        foodTiming: rem.foodTiming,
        scheduledTime: rem.scheduledTime || rem.reminderTime || '08:00 AM',
        timeSlot: slot,
        instructions: rem.instructions,
        status: doseStatus,
        actionTime: actionTime ? actionTime.toISOString() : null,
        historyId,
        reminder: rem,
      };

      if (slot === 'MORNING') groups.morning.push(item);
      else if (slot === 'AFTERNOON') groups.afternoon.push(item);
      else if (slot === 'EVENING') groups.evening.push(item);
      else groups.night.push(item);
    }

    return groups;
  }

  /**
   * Get Missed Medicines
   */
  async getMissedReminders(patientId: string, requestingUser: any) {
    let targetPatientId = patientId;
    if (patientId === 'me') {
      if (!requestingUser.patientProfile) {
        throw new ForbiddenException('User is not a registered patient');
      }
      targetPatientId = requestingUser.patientProfile.id;
    }

    if (requestingUser.role === RoleCode.PATIENT && requestingUser.patientProfile?.id !== targetPatientId) {
      throw new ForbiddenException('Patients can only view their own missed medicines');
    }

    const today = await this.getTodaySchedule(targetPatientId, requestingUser);
    const allToday = [
      ...today.morning,
      ...today.afternoon,
      ...today.evening,
      ...today.night,
    ];

    const todayMissed = allToday.filter((item) => item.status === 'MISSED');

    // Also fetch missed histories from past 7 days
    const past7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const pastMissedHistories = await this.prisma.reminderHistory.findMany({
      where: {
        patientId: targetPatientId,
        action: ReminderAction.MISSED,
        scheduledFor: { gte: past7Days },
      },
      include: {
        reminder: {
          include: {
            doctor: { include: { user: true } },
            prescriptionItem: { include: { medication: true } },
          },
        },
      },
      orderBy: { scheduledFor: 'desc' },
    });

    return {
      todayMissed,
      pastMissed: pastMissedHistories,
      totalMissedCount: todayMissed.length + pastMissedHistories.length,
    };
  }

  /**
   * Get Upcoming Medicines (doses pending today, and active schedules for tomorrow onwards)
   */
  async getUpcomingReminders(patientId: string, requestingUser: any) {
    let targetPatientId = patientId;
    if (patientId === 'me') {
      if (!requestingUser.patientProfile) {
        throw new ForbiddenException('User is not a registered patient');
      }
      targetPatientId = requestingUser.patientProfile.id;
    }

    if (requestingUser.role === RoleCode.PATIENT && requestingUser.patientProfile?.id !== targetPatientId) {
      throw new ForbiddenException('Patients can only view their own upcoming medicines');
    }

    const todaySchedule = await this.getTodaySchedule(targetPatientId, requestingUser);
    const allToday = [
      ...todaySchedule.morning,
      ...todaySchedule.afternoon,
      ...todaySchedule.evening,
      ...todaySchedule.night,
    ];

    const pendingToday = allToday.filter((i) => i.status === 'PENDING');

    const activeReminders = await this.prisma.medicationReminder.findMany({
      where: {
        patientId: targetPatientId,
        status: ReminderStatus.ACTIVE,
      },
      include: {
        doctor: { include: { user: true, specialty: true } },
        prescriptionItem: { include: { medication: true } },
      },
      orderBy: { scheduledTime: 'asc' },
    });

    return {
      pendingToday,
      activeReminders,
    };
  }

  /**
   * Record a dose action (TAKEN, SKIPPED, MISSED) and create a ReminderHistory row
   */
  async recordDoseAction(
    reminderId: string,
    action: ReminderAction,
    scheduledForDate: Date = new Date(),
    notes?: string,
    requestingUser?: any,
  ) {
    const reminder = await this.prisma.medicationReminder.findUnique({
      where: { id: reminderId },
      include: { patient: { include: { user: true } } },
    });
    if (!reminder) throw new NotFoundException(`Reminder not found with ID ${reminderId}`);

    if (
      requestingUser &&
      requestingUser.role === RoleCode.PATIENT &&
      requestingUser.patientProfile?.id !== reminder.patientId
    ) {
      throw new ForbiddenException('Patients can only log doses for their own reminders');
    }

    const now = new Date();
    const scheduledStart = new Date(
      scheduledForDate.getFullYear(),
      scheduledForDate.getMonth(),
      scheduledForDate.getDate(),
      0,
      0,
      0,
      0,
    );
    const scheduledEnd = new Date(
      scheduledForDate.getFullYear(),
      scheduledForDate.getMonth(),
      scheduledForDate.getDate(),
      23,
      59,
      59,
      999,
    );

    // Upsert or create history entry for this day
    const existingHistory = await this.prisma.reminderHistory.findFirst({
      where: {
        reminderId,
        patientId: reminder.patientId,
        scheduledFor: {
          gte: scheduledStart,
          lte: scheduledEnd,
        },
      },
    });

    let history;
    if (existingHistory) {
      history = await this.prisma.reminderHistory.update({
        where: { id: existingHistory.id },
        data: {
          action,
          actionTime: now,
          notes: notes !== undefined ? notes : existingHistory.notes,
        },
      });
    } else {
      history = await this.prisma.reminderHistory.create({
        data: {
          reminderId,
          patientId: reminder.patientId,
          scheduledFor: scheduledForDate,
          action,
          actionTime: now,
          notes: notes || null,
        },
      });
    }

    // Update reminder timestamp
    const updateData: any = {};
    if (action === ReminderAction.TAKEN) updateData.lastTakenAt = now;
    if (action === ReminderAction.SKIPPED) updateData.skippedAt = now;

    const updatedReminder = await this.prisma.medicationReminder.update({
      where: { id: reminderId },
      data: updateData,
      include: {
        prescriptionItem: { include: { medication: true } },
        doctor: { include: { user: true } },
      },
    });

    return { history, reminder: updatedReminder };
  }

  async markDoseTaken(id: string, requestingUser: any, notes?: string) {
    return this.recordDoseAction(id, ReminderAction.TAKEN, new Date(), notes, requestingUser);
  }

  async markDoseSkipped(id: string, requestingUser: any, notes?: string) {
    return this.recordDoseAction(id, ReminderAction.SKIPPED, new Date(), notes, requestingUser);
  }

  async markDoseMissed(id: string, requestingUser: any, notes?: string) {
    return this.recordDoseAction(id, ReminderAction.MISSED, new Date(), notes, requestingUser);
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
        doctor: { include: { user: true } },
      },
    });
  }

  /**
   * Medication Adherence Analytics
   * Calculates 7-day adherence %, 30-day adherence %, Medicine Compliance Score (0-100), streak days,
   * and day-by-day history.
   */
  async getAdherenceAnalytics(patientId: string, requestingUser: any) {
    let targetPatientId = patientId;
    if (patientId === 'me') {
      if (!requestingUser.patientProfile) {
        throw new ForbiddenException('User is not a registered patient');
      }
      targetPatientId = requestingUser.patientProfile.id;
    }

    if (requestingUser.role === RoleCode.PATIENT && requestingUser.patientProfile?.id !== targetPatientId) {
      throw new ForbiddenException('Patients can only view their own adherence analytics');
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch all active reminders
    const activeReminders = await this.prisma.medicationReminder.findMany({
      where: { patientId: targetPatientId, status: ReminderStatus.ACTIVE },
    });
    const dailyDosesExpected = activeReminders.length || 1;

    // Fetch histories over last 30 days
    const histories = await this.prisma.reminderHistory.findMany({
      where: {
        patientId: targetPatientId,
        scheduledFor: { gte: thirtyDaysAgo },
      },
      orderBy: { scheduledFor: 'asc' },
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // 7-day breakdown calculation
    const dailyBreakdown: {
      date: string;
      dayName: string;
      taken: number;
      missed: number;
      skipped: number;
      total: number;
      adherenceRate: number;
    }[] = [];

    let sevenDayTaken = 0;
    let sevenDayTotal = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const dayHistories = histories.filter(
        (h) => new Date(h.scheduledFor) >= dayStart && new Date(h.scheduledFor) <= dayEnd,
      );

      const taken = dayHistories.filter((h) => h.action === ReminderAction.TAKEN).length;
      const missed = dayHistories.filter((h) => h.action === ReminderAction.MISSED).length;
      const skipped = dayHistories.filter((h) => h.action === ReminderAction.SKIPPED).length;
      const total = Math.max(dayHistories.length, dailyDosesExpected);
      const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 100;

      sevenDayTaken += taken;
      sevenDayTotal += total;

      dailyBreakdown.push({
        date: dStr,
        dayName: dayNames[d.getDay()],
        taken,
        missed,
        skipped,
        total,
        adherenceRate,
      });
    }

    // 30-day stats
    const thirtyDayTaken = histories.filter((h) => h.action === ReminderAction.TAKEN).length;
    const thirtyDayTotal = Math.max(histories.length, dailyDosesExpected * 30);
    const monthlyAdherencePercentage = Math.round((thirtyDayTaken / thirtyDayTotal) * 100);
    const weeklyAdherencePercentage = sevenDayTotal > 0 ? Math.round((sevenDayTaken / sevenDayTotal) * 100) : 100;

    // Calculate Streak Days (consecutive days looking backwards with >= 80% adherence or taken > 0)
    let streakDays = 0;
    for (let i = dailyBreakdown.length - 1; i >= 0; i--) {
      if (dailyBreakdown[i].adherenceRate >= 80 || dailyBreakdown[i].taken > 0) {
        streakDays++;
      } else {
        break;
      }
    }

    // Medicine Compliance Score (0 to 100)
    // Formula: 70% weekly adherence + 20% monthly adherence + 10% streak bonus
    const complianceScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(weeklyAdherencePercentage * 0.7 + monthlyAdherencePercentage * 0.2 + Math.min(streakDays * 2, 10)),
      ),
    );

    return {
      patientId: targetPatientId,
      weeklyAdherencePercentage,
      monthlyAdherencePercentage,
      complianceScore,
      streakDays,
      totalScheduledDoses: sevenDayTotal,
      takenCount: sevenDayTaken,
      skippedCount: histories.filter((h) => h.action === ReminderAction.SKIPPED).length,
      missedCount: histories.filter((h) => h.action === ReminderAction.MISSED).length,
      dailyBreakdown,
    };
  }

  /**
   * Get all prescribed medicines for patient, indicating whether reminders already exist.
   * Useful for 1-click schedule creation.
   */
  async getPrescribedMedicinesForPatient(patientId: string, requestingUser: any) {
    let targetPatientId = patientId;
    if (patientId === 'me') {
      if (!requestingUser.patientProfile) {
        throw new ForbiddenException('User is not a registered patient');
      }
      targetPatientId = requestingUser.patientProfile.id;
    }

    if (requestingUser.role === RoleCode.PATIENT && requestingUser.patientProfile?.id !== targetPatientId) {
      throw new ForbiddenException('Patients can only view their own prescribed medicines');
    }

    const prescriptions = await this.prisma.prescription.findMany({
      where: {
        patientId: targetPatientId,
        status: { in: [PrescriptionStatus.ISSUED, PrescriptionStatus.PARTIALLY_DISPENSED, PrescriptionStatus.DISPENSED] },
      },
      include: {
        doctor: { include: { user: true, specialty: true } },
        items: {
          include: {
            medication: true,
            reminders: { where: { status: { not: ReminderStatus.CANCELLED } } },
          },
        },
      },
      orderBy: { prescribedAt: 'desc' },
    });

    const prescribedMedicines: any[] = [];
    for (const rx of prescriptions) {
      for (const item of rx.items) {
        prescribedMedicines.push({
          prescriptionItemId: item.id,
          prescriptionId: rx.id,
          prescriptionNumber: rx.prescriptionNumber,
          prescribedAt: rx.prescribedAt,
          doctorName: rx.doctor?.user ? `${rx.doctor.user.firstName} ${rx.doctor.user.lastName}` : 'Treating Physician',
          specialty: rx.doctor?.specialty?.name || 'General Medicine',
          medicationId: item.medicationId,
          medicineName: item.medication?.brandName || item.medication?.genericName || 'Prescribed Medicine',
          genericName: item.medication?.genericName,
          dosage: item.dosage,
          frequency: item.frequency,
          route: item.route,
          duration: item.duration,
          instructions: item.instructions,
          hasActiveReminder: item.reminders.length > 0,
          existingReminderId: item.reminders[0]?.id || null,
        });
      }
    }

    return prescribedMedicines;
  }

  /**
   * Dispatch a notification for a reminder across requested channels:
   * BROWSER_PUSH, IN_APP, WHATSAPP, or SMS.
   */
  async dispatchReminderNotification(
    reminderId: string,
    channel: ReminderNotificationChannel,
    customMessage?: string,
  ) {
    const reminder = await this.prisma.medicationReminder.findUnique({
      where: { id: reminderId },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        prescriptionItem: { include: { medication: true } },
      },
    });
    if (!reminder) throw new NotFoundException(`Reminder not found with ID ${reminderId}`);

    const patientName = reminder.patient.user ? `${reminder.patient.user.firstName} ${reminder.patient.user.lastName}` : 'Valued Patient';
    const patientPhone = reminder.patient.phone || reminder.patient.user?.phone || '+91 98101 23456';
    const medName = reminder.medicineName || reminder.prescriptionItem?.medication?.brandName || 'Prescribed Medicine';
    const dosage = reminder.dosage || reminder.prescriptionItem?.dosage || '1 dose';
    const timing = reminder.scheduledTime || reminder.reminderTime || 'Now';
    const foodTimingStr = reminder.foodTiming || 'NO_RESTRICTION';

    const defaultTitle = `Medication Reminder: ${medName}`;
    const defaultBody = customMessage || `Time to take ${medName} (${dosage}) scheduled for ${timing}. ${reminder.foodTiming !== 'NO_RESTRICTION' ? `Timing: ${reminder.foodTiming.replace('_', ' ')}.` : ''}`;

    let status: ReminderNotificationStatus = ReminderNotificationStatus.SENT;

    if (channel === ReminderNotificationChannel.IN_APP) {
      if (reminder.patient.user?.id) {
        await this.notificationService.createNotification({
          userId: reminder.patient.user.id,
          type: NotificationType.MEDICATION_REMINDER,
          title: defaultTitle,
          message: defaultBody,
          entityType: 'MEDICATION_REMINDER',
          entityId: reminder.id,
        });
      }
    } else if (channel === ReminderNotificationChannel.WHATSAPP) {
      try {
        await this.whatsAppService.sendMedicationReminderWhatsApp({
          recipientPhone: patientPhone,
          recipientName: patientName,
          medicineName: medName,
          dosage,
          timing,
          foodTiming: foodTimingStr,
          instructions: reminder.instructions || undefined,
        });
        status = ReminderNotificationStatus.DELIVERED;
      } catch (err) {
        this.logger.error(`Failed to dispatch WhatsApp reminder:`, err);
        status = ReminderNotificationStatus.FAILED;
      }
    } else if (channel === ReminderNotificationChannel.SMS) {
      try {
        await this.smsGatewayService.sendSms({
          recipientPhone: patientPhone,
          eventType: 'MEDICATION_REMINDER',
          message: `MediNexa Alert: Dear ${patientName}, please take your medicine ${medName} (${dosage}) at ${timing}. Follow your doctor instructions.`,
        });
        status = ReminderNotificationStatus.DELIVERED;
      } catch (err) {
        this.logger.error(`Failed to dispatch SMS reminder:`, err);
        status = ReminderNotificationStatus.FAILED;
      }
    } else if (channel === ReminderNotificationChannel.BROWSER_PUSH) {
      // Record simulated browser web push payload
      status = ReminderNotificationStatus.SENT;
    } else if (channel === ReminderNotificationChannel.EMAIL) {
      if (reminder.patient.user?.email) {
        try {
          await this.emailService.sendMedicationReminder({
            recipientEmail: reminder.patient.user.email,
            recipientName: patientName,
            medicineName: medName,
            dosage,
            doseTime: timing,
            beforeMeal: foodTimingStr === 'BEFORE_FOOD',
            instructions: reminder.instructions || undefined,
          });
          status = ReminderNotificationStatus.DELIVERED;
        } catch (err) {
          this.logger.error(`Failed to dispatch Email reminder:`, err);
          status = ReminderNotificationStatus.FAILED;
        }
      }
    }

    const notificationRecord = await this.prisma.reminderNotification.create({
      data: {
        reminderId: reminder.id,
        patientId: reminder.patientId,
        channel,
        status,
        title: defaultTitle,
        message: defaultBody,
        sentAt: new Date(),
        scheduledTime: timing,
        metadata: {
          recipientPhone: patientPhone,
          recipientName: patientName,
          dosage,
          foodTiming: foodTimingStr,
        },
      },
    });

    await this.prisma.medicationReminder.update({
      where: { id: reminder.id },
      data: { lastNotifiedAt: new Date() },
    });

    return notificationRecord;
  }

  /**
   * Fetch recent notification delivery logs for patient or reminder
   */
  async getReminderNotifications(patientId: string, reminderId?: string) {
    return this.prisma.reminderNotification.findMany({
      where: {
        patientId,
        ...(reminderId ? { reminderId } : {}),
      },
      include: {
        reminder: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Background runner called by ReminderSchedulerService
   * Scans due reminders, sends notifications, and flags overdue reminders as MISSED
   */
  async triggerScheduledReminders() {
    const activeReminders = await this.prisma.medicationReminder.findMany({
      where: { status: ReminderStatus.ACTIVE },
      include: {
        patient: { include: { user: true } },
        prescriptionItem: { include: { medication: true } },
      },
    });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    let triggeredCount = 0;

    for (const rem of activeReminders) {
      if (!rem.patient?.user?.id) continue;

      // Check if already notified or taken today
      const alreadyNotified = await this.prisma.reminderNotification.findFirst({
        where: {
          reminderId: rem.id,
          createdAt: { gte: todayStart, lte: todayEnd },
        },
      });

      if (!alreadyNotified) {
        // Dispatch In-App & Browser Push
        await this.dispatchReminderNotification(rem.id, ReminderNotificationChannel.IN_APP);
        await this.dispatchReminderNotification(rem.id, ReminderNotificationChannel.BROWSER_PUSH);
        triggeredCount++;
      }

      // Check if past scheduled time and not logged in history -> auto flag MISSED if > 4 hours late
      const existingHistory = await this.prisma.reminderHistory.findFirst({
        where: {
          reminderId: rem.id,
          scheduledFor: { gte: todayStart, lte: todayEnd },
        },
      });

      if (!existingHistory) {
        const slot = this.getTimeSlot(rem.scheduledTime || rem.reminderTime || '08:00 AM');
        const currentHour = now.getHours();
        const isVeryLate =
          (slot === 'MORNING' && currentHour >= 15) ||
          (slot === 'AFTERNOON' && currentHour >= 20) ||
          (slot === 'EVENING' && currentHour >= 23);

        if (isVeryLate) {
          await this.prisma.reminderHistory.create({
            data: {
              reminderId: rem.id,
              patientId: rem.patientId,
              scheduledFor: now,
              action: ReminderAction.MISSED,
              actionTime: now,
              notes: 'Automatically flagged as missed by background scheduler',
            },
          });
        }
      }
    }

    return { triggeredCount };
  }
}
