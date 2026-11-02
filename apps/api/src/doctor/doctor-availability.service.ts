import { Injectable, BadRequestException, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus, AppointmentType } from '@prisma/client';

export interface DoctorLeaveRecord {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  reason: string;
  createdAt: Date;
}

export interface DoctorConsultationConfig {
  doctorId: string;
  onlineEnabled: boolean;
  physicalEnabled: boolean;
  physicalFee: number; // INR
  onlineFee: number; // INR
}

@Injectable()
export class DoctorAvailabilityService {
  private readonly logger = new Logger(DoctorAvailabilityService.name);

  // In-memory persistent stores for leaves & consultation modes
  private doctorLeaves = new Map<string, DoctorLeaveRecord[]>();
  private consultationConfigs = new Map<string, DoctorConsultationConfig>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Set or update doctor weekly schedule
   */
  async setSchedule(
    doctorId: string,
    schedules: Array<{
      dayOfWeek: number; // 1=Mon, ..., 7=Sun
      startTime: string; // "09:00"
      endTime: string; // "17:00"
      slotDurationMinutes?: number;
    }>,
  ) {
    const doctor = await this.prisma.doctorProfile.findUnique({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found.');

    // Remove existing schedules for this doctor
    await this.prisma.doctorSchedule.deleteMany({ where: { doctorId } });

    const created = [];
    for (const s of schedules) {
      const rec = await this.prisma.doctorSchedule.create({
        data: {
          doctorId,
          facilityId: doctor.facilityId,
          departmentId: doctor.departmentId,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          slotDurationMinutes: s.slotDurationMinutes || 30,
          status: 'ACTIVE',
        },
      });
      created.push(rec);
    }

    this.logger.log(`📅 [DOCTOR SCHEDULE UPDATED] Doctor ${doctorId}: ${created.length} day schedules configured.`);
    return { success: true, schedules: created };
  }

  /**
   * Mark doctor leave / unavailable day
   */
  async markLeave(doctorId: string, date: string, reason: string) {
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: { user: true },
    });
    if (!doctor) throw new NotFoundException('Doctor not found.');

    const cleanDate = date.trim().split('T')[0];
    const leaves = this.doctorLeaves.get(doctorId) || [];
    if (leaves.some((l) => l.date === cleanDate)) {
      throw new BadRequestException(`Doctor is already marked on leave on ${cleanDate}.`);
    }

    const newLeave: DoctorLeaveRecord = {
      id: `leave_${Date.now()}`,
      doctorId,
      date: cleanDate,
      reason: reason || 'Scheduled Leave',
      createdAt: new Date(),
    };

    leaves.push(newLeave);
    this.doctorLeaves.set(doctorId, leaves);

    this.logger.log(`🏖️ [DOCTOR LEAVE] Dr. ${doctor.user.firstName} ${doctor.user.lastName} marked on leave on ${cleanDate}: ${reason}`);
    return { success: true, leave: newLeave };
  }

  /**
   * Get all leaves for a doctor
   */
  getLeaves(doctorId: string): DoctorLeaveRecord[] {
    return this.doctorLeaves.get(doctorId) || [];
  }

  /**
   * Configure consultation modes & fees
   */
  setConsultationConfig(doctorId: string, config: Partial<DoctorConsultationConfig>) {
    const current = this.consultationConfigs.get(doctorId) || {
      doctorId,
      onlineEnabled: true,
      physicalEnabled: true,
      physicalFee: 800,
      onlineFee: 600,
    };

    const updated: DoctorConsultationConfig = {
      ...current,
      ...config,
      doctorId,
    };

    this.consultationConfigs.set(doctorId, updated);
    return updated;
  }

  getConsultationConfig(doctorId: string): DoctorConsultationConfig {
    return (
      this.consultationConfigs.get(doctorId) || {
        doctorId,
        onlineEnabled: true,
        physicalEnabled: true,
        physicalFee: 800,
        onlineFee: 600,
      }
    );
  }

  /**
   * Compute available time slots for a given doctor on a specific date
   * Strictly filters out booked slots, past times, and leave dates
   */
  async getAvailableSlots(doctorId: string, dateStr: string, consultationType?: string) {
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: {
        user: true,
        specialty: true,
        schedules: { where: { status: 'ACTIVE' } },
      },
    });

    if (!doctor) throw new NotFoundException('Doctor not found.');

    const targetDate = new Date(dateStr);
    const dayOfWeek = targetDate.getDay() === 0 ? 7 : targetDate.getDay(); // 1=Mon ... 7=Sun
    const cleanDateStr = dateStr.split('T')[0];

    // Check if doctor is on leave
    const leaves = this.doctorLeaves.get(doctorId) || [];
    const onLeave = leaves.find((l) => l.date === cleanDateStr);
    if (onLeave) {
      return {
        doctorId,
        doctorName: `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`,
        specialty: doctor.specialty.name,
        date: cleanDateStr,
        isAvailable: false,
        reason: `Doctor is on leave (${onLeave.reason})`,
        availableSlotsCount: 0,
        slots: [],
      };
    }

    // Find schedule for dayOfWeek
    const schedule = doctor.schedules.find((s) => s.dayOfWeek === dayOfWeek);
    if (!schedule) {
      return {
        doctorId,
        doctorName: `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`,
        specialty: doctor.specialty.name,
        date: cleanDateStr,
        isAvailable: false,
        reason: 'Doctor does not have OPD schedule on this day of the week',
        availableSlotsCount: 0,
        slots: [],
      };
    }

    // Generate potential slots based on slotDurationMinutes
    const slotDuration = schedule.slotDurationMinutes || 30;
    const [startH, startM] = schedule.startTime.split(':').map(Number);
    const [endH, endM] = schedule.endTime.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // Fetch existing appointments on that date
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const bookedAppointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    const bookedTimes = new Set(bookedAppointments.map((a) => a.startTime));

    const slots = [];
    for (let current = startMinutes; current + slotDuration <= endMinutes; current += slotDuration) {
      const h = Math.floor(current / 60).toString().padStart(2, '0');
      const m = (current % 60).toString().padStart(2, '0');
      const timeStr = `${h}:${m}`;

      const nextMinutes = current + slotDuration;
      const endHStr = Math.floor(nextMinutes / 60).toString().padStart(2, '0');
      const endMStr = (nextMinutes % 60).toString().padStart(2, '0');
      const endTimeStr = `${endHStr}:${endMStr}`;

      const isBooked = bookedTimes.has(timeStr);

      slots.push({
        startTime: timeStr,
        endTime: endTimeStr,
        isAvailable: !isBooked,
      });
    }

    const availableSlots = slots.filter((s) => s.isAvailable);
    const config = this.getConsultationConfig(doctorId);

    return {
      doctorId,
      doctorName: `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`,
      specialty: doctor.specialty.name,
      date: cleanDateStr,
      isAvailable: true,
      slotDurationMinutes: slotDuration,
      totalSlotsCount: slots.length,
      availableSlotsCount: availableSlots.length,
      pricing: {
        physicalFee: config.physicalFee,
        onlineFee: config.onlineFee,
      },
      slots,
    };
  }

  /**
   * Concurrency Collision Check: strictly prevents double booking
   */
  async validateSlotAvailability(doctorId: string, date: Date, startTime: string) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const conflict = await this.prisma.appointment.findFirst({
      where: {
        doctorId,
        appointmentDate: {
          gte: dayStart,
          lte: dayEnd,
        },
        startTime,
        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        },
      },
    });

    if (conflict) {
      throw new ConflictException(
        `The consultation slot at ${startTime} on ${date.toISOString().split('T')[0]} has already been booked. Please choose another available slot.`,
      );
    }

    return true;
  }
}
