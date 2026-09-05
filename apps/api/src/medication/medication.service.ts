import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { LogMedicationDoseDto } from './dto/log-medication-dose.dto';

@Injectable()
export class MedicationService {
  private readonly logger = new Logger(MedicationService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async resolvePatientIds(user: any): Promise<{ patientProfileId?: string; userId: string }> {
    const profile = await this.prisma.patientProfile.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    return {
      patientProfileId: profile?.id,
      userId: user.id,
    };
  }

  private buildPatientFilter(ids: { patientProfileId?: string; userId: string }) {
    if (ids.patientProfileId) {
      return {
        OR: [
          { patientId: ids.patientProfileId },
          { patientId: ids.userId },
        ],
      };
    }
    return { patientId: ids.userId };
  }

  async create(user: any, dto: CreateMedicationDto) {
    const ids = await this.resolvePatientIds(user);
    const targetPatientId = dto.patientId || ids.patientProfileId || ids.userId;

    const timing = Array.isArray(dto.timing) && dto.timing.length > 0
      ? dto.timing
      : ['08:00 AM', '08:00 PM'];

    return this.prisma.medication.create({
      data: {
        patientId: targetPatientId,
        medicineName: dto.medicineName,
        dosage: dto.dosage,
        frequency: dto.frequency || 'Twice Daily',
        timing,
        beforeMeal: Boolean(dto.beforeMeal),
        startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        prescribedBy: dto.prescribedBy || 'Attending Physician',
        status: dto.status || 'active',
      },
      include: {
        logs: true,
      },
    });
  }

  async findAll(user: any, status?: string) {
    const ids = await this.resolvePatientIds(user);
    const patientFilter = this.buildPatientFilter(ids);

    const where: any = {
      ...patientFilter,
    };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    return this.prisma.medication.findMany({
      where,
      include: {
        logs: {
          orderBy: { scheduledFor: 'desc' },
          take: 15,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: any) {
    const med = await this.prisma.medication.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { scheduledFor: 'desc' },
        },
      },
    });

    if (!med) throw new NotFoundException(`Medication with id ${id} not found`);

    const ids = await this.resolvePatientIds(user);
    const isOwner = med.patientId === ids.patientProfileId || med.patientId === ids.userId;
    if (!isOwner && user.role !== 'MEDINEXA_ADMIN' && user.role !== 'DOCTOR' && user.role !== 'NURSE') {
      throw new ForbiddenException('Access denied to this medication record');
    }

    return med;
  }

  async update(id: string, dto: UpdateMedicationDto, user: any) {
    await this.findOne(id, user);

    const updateData: any = {};
    if (dto.medicineName !== undefined) updateData.medicineName = dto.medicineName;
    if (dto.dosage !== undefined) updateData.dosage = dto.dosage;
    if (dto.frequency !== undefined) updateData.frequency = dto.frequency;
    if (dto.timing !== undefined) updateData.timing = dto.timing;
    if (dto.beforeMeal !== undefined) updateData.beforeMeal = dto.beforeMeal;
    if (dto.startDate !== undefined) updateData.startDate = dto.startDate ? new Date(dto.startDate) : null;
    if (dto.endDate !== undefined) updateData.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.prescribedBy !== undefined) updateData.prescribedBy = dto.prescribedBy;
    if (dto.status !== undefined) updateData.status = dto.status;

    return this.prisma.medication.update({
      where: { id },
      data: updateData,
      include: { logs: true },
    });
  }

  async delete(id: string, user: any) {
    await this.findOne(id, user);

    return this.prisma.medication.delete({
      where: { id },
    });
  }

  async markAsTaken(id: string, dto: LogMedicationDoseDto, user: any) {
    const med = await this.findOne(id, user);
    const ids = await this.resolvePatientIds(user);
    const patientId = med.patientId || ids.patientProfileId || ids.userId;

    const scheduledDate = dto.scheduledFor ? new Date(dto.scheduledFor) : new Date();
    const startOfDay = new Date(scheduledDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(scheduledDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Look for existing log today for this medication and doseTime
    const existingLog = await this.prisma.medicationLog.findFirst({
      where: {
        medicationId: id,
        doseTime: dto.doseTime,
        scheduledFor: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingLog) {
      return this.prisma.medicationLog.update({
        where: { id: existingLog.id },
        data: {
          status: 'taken',
          takenAt: new Date(),
          notes: dto.notes ?? existingLog.notes,
        },
      });
    }

    return this.prisma.medicationLog.create({
      data: {
        medicationId: id,
        patientId,
        doseTime: dto.doseTime,
        status: 'taken',
        scheduledFor: scheduledDate,
        takenAt: new Date(),
        notes: dto.notes,
      },
    });
  }

  async markAsMissed(id: string, dto: LogMedicationDoseDto, user: any) {
    const med = await this.findOne(id, user);
    const ids = await this.resolvePatientIds(user);
    const patientId = med.patientId || ids.patientProfileId || ids.userId;

    const scheduledDate = dto.scheduledFor ? new Date(dto.scheduledFor) : new Date();
    const startOfDay = new Date(scheduledDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(scheduledDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingLog = await this.prisma.medicationLog.findFirst({
      where: {
        medicationId: id,
        doseTime: dto.doseTime,
        scheduledFor: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingLog) {
      return this.prisma.medicationLog.update({
        where: { id: existingLog.id },
        data: {
          status: 'missed',
          notes: dto.notes ?? existingLog.notes,
        },
      });
    }

    return this.prisma.medicationLog.create({
      data: {
        medicationId: id,
        patientId,
        doseTime: dto.doseTime,
        status: 'missed',
        scheduledFor: scheduledDate,
        notes: dto.notes,
      },
    });
  }

  async getTodaySchedule(user: any) {
    const ids = await this.resolvePatientIds(user);
    const patientFilter = this.buildPatientFilter(ids);

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const activeMeds = await this.prisma.medication.findMany({
      where: {
        ...patientFilter,
        status: 'active',
      },
      include: {
        logs: {
          where: {
            scheduledFor: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        },
      },
    });

    const items: Array<{
      id: string;
      medicationId: string;
      medicineName: string;
      dosage: string;
      doseTime: string;
      formattedTime: string;
      beforeMeal: boolean;
      status: 'Due' | 'Taken' | 'Missed';
      takenAt?: Date | null;
      frequency: string;
      prescribedBy?: string | null;
    }> = [];

    for (const med of activeMeds) {
      const timings = med.timing && med.timing.length > 0
        ? med.timing
        : ['08:00 AM', '08:00 PM'];

      for (const timeStr of timings) {
        const log = med.logs.find((l) => l.doseTime === timeStr);
        let doseStatus: 'Due' | 'Taken' | 'Missed' = 'Due';

        if (log?.status === 'taken') {
          doseStatus = 'Taken';
        } else if (log?.status === 'missed') {
          doseStatus = 'Missed';
        } else {
          // Check if dose was scheduled in the past by > 2 hours
          const parsed = this.parseTimeStringToDate(timeStr, now);
          if (parsed && (now.getTime() - parsed.getTime()) > 2 * 60 * 60 * 1000) {
            doseStatus = 'Missed';
          }
        }

        items.push({
          id: log?.id || `${med.id}_${timeStr.replace(/\s+/g, '')}`,
          medicationId: med.id,
          medicineName: med.medicineName || med.brandName || med.genericName || 'Prescribed Medicine',
          dosage: med.dosage || med.strength || '1 tablet',
          doseTime: timeStr,
          formattedTime: timeStr,
          beforeMeal: med.beforeMeal,
          status: doseStatus,
          takenAt: log?.takenAt,
          frequency: med.frequency || 'Daily',
          prescribedBy: med.prescribedBy,
        });
      }
    }

    // Sort items chronologically
    items.sort((a, b) => {
      const timeA = this.parseTimeStringToDate(a.doseTime, now)?.getTime() || 0;
      const timeB = this.parseTimeStringToDate(b.doseTime, now)?.getTime() || 0;
      return timeA - timeB;
    });

    const total = items.length;
    const taken = items.filter((i) => i.status === 'Taken').length;
    const missed = items.filter((i) => i.status === 'Missed').length;
    const due = items.filter((i) => i.status === 'Due').length;
    const progressPercent = total > 0 ? Math.round((taken / total) * 100) : 0;
    const progressLabel = `${taken}/${total} medicines completed today`;

    return {
      items,
      summary: {
        total,
        taken,
        missed,
        due,
        progressPercent,
        progressLabel,
      },
    };
  }

  async getHistory(user: any) {
    const ids = await this.resolvePatientIds(user);
    const patientFilter = this.buildPatientFilter(ids);

    const meds = await this.prisma.medication.findMany({
      where: patientFilter,
      select: { id: true, medicineName: true, dosage: true, beforeMeal: true, frequency: true },
    });

    const medMap = new Map(meds.map((m) => [m.id, m]));

    const logs = await this.prisma.medicationLog.findMany({
      where: {
        OR: [
          ...(ids.patientProfileId ? [{ patientId: ids.patientProfileId }] : []),
          { patientId: ids.userId },
          { medicationId: { in: meds.map((m) => m.id) } },
        ],
      },
      orderBy: { scheduledFor: 'desc' },
      take: 100,
    });

    return logs.map((log) => ({
      ...log,
      medication: medMap.get(log.medicationId) || null,
    }));
  }

  async getAdherenceStats(user: any) {
    const history = await this.getHistory(user);
    const taken = history.filter((h) => h.status === 'taken').length;
    const missed = history.filter((h) => h.status === 'missed').length;
    const total = taken + missed;
    const percentage = total > 0 ? Math.round((taken / total) * 100) : 100;

    return {
      adherencePercentage: percentage,
      takenDoses: taken,
      missedDoses: missed,
      totalTracked: total,
    };
  }

  private parseTimeStringToDate(timeStr: string, baseDate: Date): Date | null {
    try {
      // Handles formats like "8:00 AM", "08:00 PM", "14:00", "20:00"
      const cleaned = timeStr.trim().toUpperCase();
      const isPm = cleaned.includes('PM');
      const isAm = cleaned.includes('AM');
      const parts = cleaned.replace(/[APM]/g, '').trim().split(':');

      if (parts.length >= 1) {
        let hours = parseInt(parts[0], 10);
        const minutes = parts.length > 1 ? parseInt(parts[1], 10) : 0;

        if (isPm && hours < 12) hours += 12;
        if (isAm && hours === 12) hours = 0;

        const d = new Date(baseDate);
        d.setHours(hours, minutes, 0, 0);
        return d;
      }
    } catch {
      return null;
    }
    return null;
  }
}
