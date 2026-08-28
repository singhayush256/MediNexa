import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAppointmentDto,
  CreateDoctorScheduleDto,
  RescheduleAppointmentDto,
  AppointmentType,
  AppointmentStatus,
  ScheduleStatus,
  RoleCode,
  NotificationType,
  EncounterType,
  EncounterStatus,
} from '@medinexa/types';
import { NotificationService } from '../notification/notification.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly auditService: AuditService,
  ) {}

  // =========================================================================
  // 1. DOCTOR SCHEDULE & AVAILABILITY
  // =========================================================================

  async createSchedule(dto: any, requestingUser: any) {
    const doctorId = dto.doctorId || dto.doctor_id;
    const facilityId = dto.facilityId || dto.facility_id;
    const departmentId = dto.departmentId || dto.department_id;
    const dayOfWeek = dto.dayOfWeek !== undefined ? Number(dto.dayOfWeek) : Number(dto.day_of_week ?? 0);
    const startTime = dto.startTime || dto.start_time || '09:00';
    const endTime = dto.endTime || dto.end_time || '17:00';
    const slotDurationMinutes = Number(dto.slotDurationMinutes || dto.slot_duration_minutes || 30);
    const status = dto.status || ScheduleStatus.ACTIVE;

    // RBAC: HOSPITAL_ADMIN, MEDINEXA_ADMIN, or DOCTOR configuring own schedule
    if (
      requestingUser.role !== RoleCode.HOSPITAL_ADMIN &&
      requestingUser.role !== RoleCode.MEDINEXA_ADMIN
    ) {
      if (requestingUser.role === RoleCode.DOCTOR) {
        if (requestingUser.doctorProfile?.id !== doctorId) {
          throw new ForbiddenException('Doctors can only configure their own schedule');
        }
      } else {
        throw new ForbiddenException('Insufficient permissions to configure doctor schedules');
      }
    }

    return this.prisma.doctorSchedule.create({
      data: {
        doctorId,
        facilityId,
        departmentId,
        dayOfWeek,
        startTime,
        endTime,
        slotDurationMinutes,
        status,
      },
      include: {
        doctor: { include: { user: true } },
        facility: true,
        department: true,
      },
    });
  }

  async getDoctorSchedules(doctorId: string, facilityId?: string) {
    const where: any = { doctorId, status: ScheduleStatus.ACTIVE };
    if (facilityId) where.facilityId = facilityId;

    return this.prisma.doctorSchedule.findMany({
      where,
      include: { facility: true, department: true },
    });
  }

  async getDoctorAvailability(doctorId: string, dateStr: string, facilityId?: string) {
    const parts = dateStr.split('-').map(Number);
    if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }
    // Use UTC date to ensure dayOfWeek and range queries match UTC appointmentDate persistence
    const utcDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    const dayOfWeek = utcDate.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    const whereSchedule: any = { doctorId, dayOfWeek, status: ScheduleStatus.ACTIVE };
    if (facilityId) whereSchedule.facilityId = facilityId;

    const schedules = await this.prisma.doctorSchedule.findMany({
      where: whereSchedule,
    });

    // Query existing confirmed/requested appointments on that UTC date
    const startOfDay = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999));

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: { gte: startOfDay, lte: endOfDay },
        status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
      },
    });

    const bookedSlots = new Set(existingAppointments.map((a) => a.startTime));
    const slots: { date: string; startTime: string; endTime: string; available: boolean }[] = [];

    for (const sched of schedules) {
      const [startHour, startMin] = sched.startTime.split(':').map(Number);
      const [endHour, endMin] = sched.endTime.split(':').map(Number);

      let currentMins = startHour * 60 + startMin;
      const endMins = endHour * 60 + endMin;
      const step = sched.slotDurationMinutes || 30;

      while (currentMins + step <= endMins) {
        const slotStartH = Math.floor(currentMins / 60)
          .toString()
          .padStart(2, '0');
        const slotStartM = (currentMins % 60).toString().padStart(2, '0');
        const startTimeStr = `${slotStartH}:${slotStartM}`;

        const slotEndMins = currentMins + step;
        const slotEndH = Math.floor(slotEndMins / 60)
          .toString()
          .padStart(2, '0');
        const slotEndM = (slotEndMins % 60).toString().padStart(2, '0');
        const endTimeStr = `${slotEndH}:${slotEndM}`;

        const available = !bookedSlots.has(startTimeStr);
        slots.push({ date: dateStr, startTime: startTimeStr, endTime: endTimeStr, available });

        currentMins += step;
      }
    }

    return slots;
  }

  // =========================================================================
  // 2. APPOINTMENT BOOKING & CONCURRENCY PROTECTION
  // =========================================================================

  async bookAppointment(dto: CreateAppointmentDto, requestingUser: any) {
    // Patient security validation
    if (requestingUser.role === RoleCode.PATIENT) {
      if (requestingUser.patientProfile?.id !== dto.patientId) {
        throw new ForbiddenException('Patients can only book appointments for themselves');
      }
    }

    const parts = dto.appointmentDate.split('-').map(Number);
    const apptDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Check existing booking for same doctor, date & start time inside transaction
        const existing = await tx.appointment.findFirst({
          where: {
            doctorId: dto.doctorId,
            appointmentDate: apptDate,
            startTime: dto.startTime,
            status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
          },
        });

        if (existing) {
          throw new ConflictException(
            `Doctor slot for date '${dto.appointmentDate}' at '${dto.startTime}' is already booked.`,
          );
        }

        const dateCode = dto.appointmentDate.replace(/-/g, '');
        const appointmentNumber = `APT-${dateCode}-${Math.floor(1000 + Math.random() * 9000)}`;

        const appt = await tx.appointment.create({
          data: {
            appointmentNumber,
            patientId: dto.patientId,
            doctorId: dto.doctorId,
            facilityId: dto.facilityId,
            departmentId: dto.departmentId,
            specialtyId: dto.specialtyId,
            appointmentDate: apptDate,
            startTime: dto.startTime,
            endTime: dto.endTime,
            type: dto.type || AppointmentType.CONSULTATION,
            status: AppointmentStatus.REQUESTED,
            reason: dto.reason,
            notes: dto.notes,
          },
          include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } },
            facility: true,
            department: true,
          },
        });

        // Send notification to patient & doctor
        if (appt.patient?.user?.id) {
          await this.notificationService.createNotification({
            userId: appt.patient.user.id,
            type: NotificationType.APPOINTMENT_BOOKED,
            title: 'Appointment Booked',
            message: `Your appointment ${appt.appointmentNumber} has been booked for ${dto.appointmentDate} at ${dto.startTime}.`,
            entityType: 'Appointment',
            entityId: appt.id,
          });
        }

        if (appt.doctor?.user?.id) {
          await this.notificationService.createNotification({
            userId: appt.doctor.user.id,
            type: NotificationType.APPOINTMENT_BOOKED,
            title: 'New Appointment Request',
            message: `New appointment ${appt.appointmentNumber} requested for ${dto.appointmentDate} at ${dto.startTime}.`,
            entityType: 'Appointment',
            entityId: appt.id,
          });
        }

        return appt;
      });
    } catch (err: any) {
      if (err.code === 'P2002' || err.message?.includes('Unique constraint failed')) {
        throw new ConflictException(`Doctor slot for date '${dto.appointmentDate}' at '${dto.startTime}' is already booked.`);
      }
      throw err;
    }
  }

  // =========================================================================
  // 3. APPOINTMENT LIFECYCLE TRANSITIONS
  // =========================================================================

  async confirmAppointment(id: string, requestingUser: any) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: { include: { user: true } } },
    });
    if (!appt) throw new NotFoundException('Appointment not found');

    if (appt.status !== AppointmentStatus.REQUESTED) {
      throw new BadRequestException(`Cannot confirm appointment in status '${appt.status}'`);
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CONFIRMED },
      include: { patient: { include: { user: true } }, doctor: { include: { user: true } } },
    });

    if (updated.patient?.user?.id) {
      await this.notificationService.createNotification({
        userId: updated.patient.user.id,
        type: NotificationType.APPOINTMENT_CONFIRMED,
        title: 'Appointment Confirmed',
        message: `Your appointment ${updated.appointmentNumber} has been confirmed.`,
        entityType: 'Appointment',
        entityId: updated.id,
      });
    }

    return updated;
  }

  async checkInAppointment(id: string, requestingUser: any) {
    const appt = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appt) throw new NotFoundException('Appointment not found');

    if (
      appt.status !== AppointmentStatus.CONFIRMED &&
      appt.status !== AppointmentStatus.REQUESTED
    ) {
      throw new BadRequestException(`Cannot check-in appointment in status '${appt.status}'`);
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CHECKED_IN,
        checkedInAt: new Date(),
      },
      include: { patient: { include: { user: true } }, doctor: { include: { user: true } } },
    });
  }

  async startAppointment(id: string, requestingUser: any) {
    return this.prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.findUnique({
        where: { id },
        include: { patient: true, doctor: true },
      });
      if (!appt) throw new NotFoundException('Appointment not found');

      if (
        appt.status !== AppointmentStatus.CHECKED_IN &&
        appt.status !== AppointmentStatus.CONFIRMED
      ) {
        throw new BadRequestException(`Cannot start appointment in status '${appt.status}'`);
      }

      // Create or link ClinicalEncounter (Day 7 EHR integration)
      const encounterNumber = `ENC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const encounter = await tx.clinicalEncounter.create({
        data: {
          encounterNumber,
          patientId: appt.patientId,
          doctorId: appt.doctorId,
          facilityId: appt.facilityId,
          departmentId: appt.departmentId,
          encounterType: EncounterType.CONSULTATION,
          status: EncounterStatus.IN_PROGRESS,
          reasonForVisit: appt.reason,
          startedAt: new Date(),
        },
      });

      const updated = await tx.appointment.update({
        where: { id },
        data: {
          status: AppointmentStatus.IN_PROGRESS,
          encounterId: encounter.id,
        },
        include: {
          patient: { include: { user: true } },
          doctor: { include: { user: true } },
          encounter: true,
        },
      });

      return updated;
    });
  }

  async completeAppointment(id: string, requestingUser: any) {
    return this.prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.findUnique({ where: { id } });
      if (!appt) throw new NotFoundException('Appointment not found');

      if (appt.status !== AppointmentStatus.IN_PROGRESS) {
        throw new BadRequestException(`Cannot complete appointment in status '${appt.status}'`);
      }

      // Close linked encounter if open
      if (appt.encounterId) {
        await tx.clinicalEncounter.updateMany({
          where: { id: appt.encounterId, status: EncounterStatus.IN_PROGRESS },
          data: {
            status: EncounterStatus.COMPLETED,
            endedAt: new Date(),
          },
        });
      }

      return tx.appointment.update({
        where: { id },
        data: {
          status: AppointmentStatus.COMPLETED,
          completedAt: new Date(),
        },
        include: { patient: { include: { user: true } }, doctor: { include: { user: true } } },
      });
    });
  }

  async cancelAppointment(id: string, reason: string, requestingUser: any) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: { include: { user: true } }, doctor: { include: { user: true } } },
    });
    if (!appt) throw new NotFoundException('Appointment not found');

    if (
      appt.status === AppointmentStatus.COMPLETED ||
      appt.status === AppointmentStatus.CANCELLED
    ) {
      throw new BadRequestException(`Cannot cancel appointment in status '${appt.status}'`);
    }

    // Patient security check
    const userRole = requestingUser.roleCode || (requestingUser.role && requestingUser.role.code) || requestingUser.role;
    if (
      userRole === RoleCode.PATIENT &&
      (!requestingUser.patientProfile || requestingUser.patientProfile.id !== appt.patientId)
    ) {
      throw new ForbiddenException('Patients can only cancel their own appointments');
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancellationReason: reason || 'Cancelled by user',
        cancelledAt: new Date(),
      },
      include: { patient: { include: { user: true } }, doctor: { include: { user: true } } },
    });

    if (updated.patient?.user?.id) {
      await this.notificationService.createNotification({
        userId: updated.patient.user.id,
        type: NotificationType.APPOINTMENT_CANCELLED,
        title: 'Appointment Cancelled',
        message: `Appointment ${updated.appointmentNumber} was cancelled.`,
        entityType: 'Appointment',
        entityId: updated.id,
      });
    }

    await this.auditService.logPhiAccess({
      userId: requestingUser.id,
      role: userRole,
      facilityId: appt.facilityId,
      action: 'CANCEL_APPOINTMENT',
      resource: `appointment:${id}`,
      details: { appointmentId: id, reason: reason || 'Cancelled by user' },
    });

    return updated;
  }

  async rescheduleAppointment(id: string, dto: RescheduleAppointmentDto, requestingUser: any) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: { include: { user: true } } },
    });
    if (!appt) throw new NotFoundException('Appointment not found');

    if (
      appt.status === AppointmentStatus.COMPLETED ||
      appt.status === AppointmentStatus.CANCELLED
    ) {
      throw new BadRequestException(`Cannot reschedule appointment in status '${appt.status}'`);
    }

    // Patient security check
    const userRole = requestingUser.roleCode || (requestingUser.role && requestingUser.role.code) || requestingUser.role;
    if (
      userRole === RoleCode.PATIENT &&
      (!requestingUser.patientProfile || requestingUser.patientProfile.id !== appt.patientId)
    ) {
      throw new ForbiddenException('Patients can only reschedule their own appointments');
    }

    const newDate = new Date(dto.appointmentDate);
    newDate.setHours(0, 0, 0, 0);

    const updated = await this.prisma.$transaction(async (tx) => {
      // Check concurrency conflict for new slot
      const existing = await tx.appointment.findFirst({
        where: {
          id: { not: id },
          doctorId: appt.doctorId,
          appointmentDate: newDate,
          startTime: dto.startTime,
          status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Target slot for date '${dto.appointmentDate}' at '${dto.startTime}' is already booked.`,
        );
      }

      return tx.appointment.update({
        where: { id },
        data: {
          appointmentDate: newDate,
          startTime: dto.startTime,
          endTime: dto.endTime,
          status: AppointmentStatus.RESCHEDULED,
          notes: dto.reason ? `Rescheduled: ${dto.reason}` : appt.notes,
        },
        include: { patient: { include: { user: true } }, doctor: { include: { user: true } } },
      });
    });

    if (updated.patient?.user?.id) {
      await this.notificationService.createNotification({
        userId: updated.patient.user.id,
        type: NotificationType.APPOINTMENT_BOOKED,
        title: 'Appointment Rescheduled',
        message: `Your appointment ${updated.appointmentNumber} has been rescheduled to ${dto.appointmentDate} at ${dto.startTime}.`,
        entityType: 'Appointment',
        entityId: updated.id,
      });
    }

    await this.auditService.logPhiAccess({
      userId: requestingUser.id,
      role: userRole,
      facilityId: appt.facilityId,
      action: 'RESCHEDULE_APPOINTMENT',
      resource: `appointment:${id}`,
      details: { appointmentId: id, newDate: dto.appointmentDate, newStartTime: dto.startTime },
    });

    return updated;
  }

  // =========================================================================
  // 4. QUERIES & DIRECTORY
  // =========================================================================

  async getAppointments(filters: any, requestingUser: any) {
    const where: any = {};

    if (requestingUser.role === RoleCode.PATIENT) {
      if (!requestingUser.patientProfile) return [];
      where.patientId = requestingUser.patientProfile.id;
    } else if (requestingUser.role === RoleCode.DOCTOR) {
      if (!requestingUser.doctorProfile) return [];
      where.doctorId = requestingUser.doctorProfile.id;
    } else if (requestingUser.role === RoleCode.HOSPITAL_ADMIN) {
      where.facilityId = requestingUser.facilityId;
    }

    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.doctorId) where.doctorId = filters.doctorId;
    if (filters.facilityId) where.facilityId = filters.facilityId;
    if (filters.status) where.status = filters.status;

    return this.prisma.appointment.findMany({
      where,
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        facility: true,
        department: true,
        specialty: true,
        encounter: true,
      },
      orderBy: [{ appointmentDate: 'desc' }, { startTime: 'asc' }],
    });
  }

  async getAppointmentById(id: string, requestingUser: any) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        facility: true,
        department: true,
        specialty: true,
        encounter: true,
      },
    });

    if (!appt) throw new NotFoundException('Appointment not found');

    if (requestingUser.role === RoleCode.PATIENT && requestingUser.patientProfile?.id !== appt.patientId) {
      throw new ForbiddenException('Patients can only view their own appointments');
    }

    return appt;
  }
}
