import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BedGateway } from '../bed/events/bed.gateway';
import { NotificationService } from '../notification/notification.service';
import { EmailNotificationService } from '../notification/email.service';
import { CreateBedBookingDto } from './dto/create-bed-booking.dto';
import { UpdateBedBookingStatusDto } from './dto/update-bed-booking-status.dto';
import { AllocateBedDto } from './dto/allocate-bed.dto';
import { ConvertToAdmissionDto } from './dto/convert-to-admission.dto';
import { BedBookingStatus, BedStatus, AssignmentStatus, AdmissionStatus, AdmissionType, NotificationType } from '@medinexa/types';

@Injectable()
export class BedBookingService {
  private readonly logger = new Logger(BedBookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bedGateway: BedGateway,
    private readonly notificationService: NotificationService,
    private readonly emailService: EmailNotificationService,
  ) {}

  async createBooking(dto: CreateBedBookingDto, user?: any) {
    const facility = await this.prisma.facility.findUnique({
      where: { id: dto.facilityId },
    });

    if (!facility) {
      throw new NotFoundException(`Hospital facility with ID '${dto.facilityId}' not found`);
    }

    // Resolve patientId if not provided but user is a patient
    let resolvedPatientId = dto.patientId;
    if (!resolvedPatientId && user) {
      const patientProfile = await this.prisma.patientProfile.findFirst({
        where: {
          OR: [
            { userId: user.id },
            { phone: dto.patientPhone },
          ],
        },
      });
      if (patientProfile) {
        resolvedPatientId = patientProfile.id;
      }
    }

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const bookingNumber = `BKG-${year}-${randomSuffix}`;
    const expiresAt = dto.expectedDate
      ? new Date(new Date(dto.expectedDate).getTime() + 24 * 3600 * 1000)
      : new Date(Date.now() + 48 * 3600 * 1000);

    const booking = await this.prisma.bedBooking.create({
      data: {
        bookingNumber,
        facilityId: dto.facilityId,
        patientId: resolvedPatientId || null,
        patientName: dto.patientName,
        patientPhone: dto.patientPhone,
        patientEmail: dto.patientEmail,
        bedType: dto.bedType as any,
        priority: dto.priority || 'NORMAL',
        chiefComplaint: dto.chiefComplaint,
        medicalCondition: dto.medicalCondition,
        expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : null,
        expiresAt,
        notes: dto.notes,
        status: BedBookingStatus.PENDING as any,
      },
      include: {
        facility: {
          select: {
            id: true,
            name: true,
            code: true,
            city: true,
            phone: true,
            address: true,
          },
        },
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    // Notify patient
    try {
      if (booking.patient?.user?.id) {
        await this.notificationService.createNotification({
          userId: booking.patient.user.id,
          type: NotificationType.BED_RESERVED,
          title: `Bed Reservation Request Registered: #${booking.bookingNumber}`,
          message: `Your bed reservation request for ${dto.bedType} at ${facility.name} has been received and is pending triage review.`,
          entityType: 'BED_BOOKING',
          entityId: booking.id,
        });
      }
      if (dto.patientEmail) {
        await this.emailService.sendBedBookingNotification({
          recipientEmail: dto.patientEmail,
          recipientName: dto.patientName,
          bookingNumber: booking.bookingNumber,
          hospitalName: facility.name,
          bedType: dto.bedType,
          status: 'PENDING_REVIEW',
          expiresAt: expiresAt.toLocaleString(),
          message: 'Your bed reservation has been logged. Our triage team will review and allocate a bed shortly.',
        });
      }
    } catch (err: any) {
      this.logger.warn(`Failed to dispatch booking creation notification: ${err.message}`);
    }

    return booking;
  }

  async expireStaleBookings(facilityId?: string) {
    const now = new Date();
    try {
      const staleBookings = await this.prisma.bedBooking.findMany({
        where: {
          status: { in: [BedBookingStatus.PENDING as any, BedBookingStatus.APPROVED as any] },
          expiresAt: { lt: now },
          ...(facilityId ? { facilityId } : {}),
        },
        include: {
          facility: true,
          allocatedBed: true,
          patient: { include: { user: true } },
        },
      });

      if (staleBookings.length === 0) {
        return { expiredCount: 0, expiredIds: [] };
      }

      const expiredIds: string[] = [];

      for (const booking of staleBookings) {
        await this.prisma.$transaction(async (tx) => {
          if (booking.allocatedBedId) {
            await tx.bed.update({
              where: { id: booking.allocatedBedId },
              data: { status: BedStatus.AVAILABLE },
            });

            await tx.bedStatusHistory.create({
              data: {
                bedId: booking.allocatedBedId,
                previousStatus: BedStatus.RESERVED,
                newStatus: BedStatus.AVAILABLE,
                changedBy: 'SYSTEM_EXPIRY',
                reason: `Reservation expired automatically (#${booking.bookingNumber})`,
              },
            });
          }

          await tx.bedBooking.update({
            where: { id: booking.id },
            data: {
              status: BedBookingStatus.EXPIRED as any,
              notes: `${booking.notes ? booking.notes + ' | ' : ''}Reservation expired automatically on ${now.toISOString()}`,
            },
          });
        });

        if (booking.allocatedBedId) {
          this.bedGateway.emitBedStatusChanged({
            facilityId: booking.facilityId,
            bedId: booking.allocatedBedId,
            previousStatus: BedStatus.RESERVED,
            newStatus: BedStatus.AVAILABLE,
            timestamp: now.toISOString(),
          });
          this.bedGateway.emitBedOccupancyUpdated(booking.facilityId, {
            timestamp: now.toISOString(),
          });
        }

        try {
          if (booking.patient?.user?.id) {
            await this.notificationService.createNotification({
              userId: booking.patient.user.id,
              type: NotificationType.BED_BOOKING_EXPIRED as any,
              title: `Bed Reservation Expired: #${booking.bookingNumber}`,
              message: `Your reservation at ${booking.facility.name} has expired. Any reserved bed has been released back into the network.`,
              entityType: 'BED_BOOKING',
              entityId: booking.id,
            });
          }
          if (booking.patientEmail) {
            await this.emailService.sendBedBookingNotification({
              recipientEmail: booking.patientEmail,
              recipientName: booking.patientName,
              bookingNumber: booking.bookingNumber,
              hospitalName: booking.facility.name,
              bedType: booking.bedType,
              status: 'EXPIRED',
              message: 'Your bed reservation hold period has elapsed and the bed has been released.',
            });
          }
        } catch (e) {
          // ignore notification error
        }

        expiredIds.push(booking.id);
      }

      return { expiredCount: expiredIds.length, expiredIds };
    } catch (err: any) {
      this.logger.error(`Error in expireStaleBookings: ${err.message}`);
      return { expiredCount: 0, expiredIds: [] };
    }
  }

  async getBookings(
    query: {
      facilityId?: string;
      status?: BedBookingStatus;
      bedType?: string;
      priority?: string;
      search?: string;
    },
    user?: any,
  ) {
    // Automatically sweep expired reservations
    await this.expireStaleBookings(query.facilityId);

    const roleCode = user?.roleCode || user?.role?.code || user?.role;
    const userFacilityId = user?.facilityId || user?.doctorProfile?.facilityId;

    const where: any = {};

    if (roleCode && roleCode !== 'MEDINEXA_ADMIN' && userFacilityId) {
      where.facilityId = userFacilityId;
    } else if (query.facilityId) {
      where.facilityId = query.facilityId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.bedType) {
      where.bedType = query.bedType;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.search) {
      where.OR = [
        { bookingNumber: { contains: query.search, mode: 'insensitive' } },
        { patientName: { contains: query.search, mode: 'insensitive' } },
        { patientPhone: { contains: query.search, mode: 'insensitive' } },
        { chiefComplaint: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const bookings = await this.prisma.bedBooking.findMany({
      where,
      include: {
        facility: {
          select: {
            id: true,
            name: true,
            code: true,
            city: true,
            phone: true,
          },
        },
        allocatedBed: {
          include: {
            ward: { select: { id: true, name: true } },
            room: { select: { id: true, roomNumber: true } },
          },
        },
        admission: {
          select: {
            id: true,
            admissionNumber: true,
            status: true,
            admittedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings;
  }

  async getMyBookings(user: any) {
    // Automatically sweep expired reservations
    await this.expireStaleBookings();

    const patientProfile = await this.prisma.patientProfile.findUnique({
      where: { userId: user.id },
    });

    const where: any = {
      OR: [
        ...(patientProfile ? [{ patientId: patientProfile.id }] : []),
        ...(user.phone ? [{ patientPhone: user.phone }] : []),
        ...(user.email ? [{ patientEmail: user.email }] : []),
      ],
    };

    if (where.OR.length === 0) {
      return [];
    }

    return this.prisma.bedBooking.findMany({
      where,
      include: {
        facility: {
          select: {
            id: true,
            name: true,
            code: true,
            city: true,
            phone: true,
          },
        },
        allocatedBed: {
          select: {
            id: true,
            bedNumber: true,
            bedType: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBookingById(id: string) {
    const booking = await this.prisma.bedBooking.findUnique({
      where: { id },
      include: {
        facility: true,
        patient: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        allocatedBed: {
          include: {
            ward: true,
            room: true,
          },
        },
        admission: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Bed booking with ID '${id}' not found`);
    }

    return booking;
  }

  async updateStatus(id: string, dto: UpdateBedBookingStatusDto, user: any) {
    const booking = await this.getBookingById(id);

    const updated = await this.prisma.bedBooking.update({
      where: { id },
      data: {
        status: dto.status as any,
        notes: dto.notes !== undefined ? dto.notes : booking.notes,
        reviewedBy: user?.id || 'STAFF',
        reviewedAt: new Date(),
        ...(dto.allocatedBedId ? { allocatedBedId: dto.allocatedBedId } : {}),
      },
      include: {
        facility: true,
        allocatedBed: true,
      },
    });

    return updated;
  }

  async allocateBed(id: string, dto: AllocateBedDto, user: any) {
    const booking = await this.getBookingById(id);

    let targetBed: any = null;

    if (dto.bedId) {
      targetBed = await this.prisma.bed.findUnique({
        where: { id: dto.bedId },
        include: { ward: true, room: true },
      });
      if (!targetBed) {
        throw new NotFoundException(`Bed with ID '${dto.bedId}' not found`);
      }
      if (targetBed.facilityId !== booking.facilityId) {
        throw new BadRequestException('Selected bed belongs to a different hospital facility');
      }
      if (targetBed.status !== BedStatus.AVAILABLE) {
        throw new ConflictException(`Bed ${targetBed.bedNumber} is not available (Current status: ${targetBed.status})`);
      }
    } else {
      // Auto-allocation logic:
      // 1. Try exact requested bedType
      targetBed = await this.prisma.bed.findFirst({
        where: {
          facilityId: booking.facilityId,
          bedType: booking.bedType,
          status: BedStatus.AVAILABLE,
        },
        include: { ward: true, room: true },
        orderBy: { bedNumber: 'asc' },
      });

      // 2. Fallback to GENERAL bed if specialized type full
      if (!targetBed) {
        targetBed = await this.prisma.bed.findFirst({
          where: {
            facilityId: booking.facilityId,
            status: BedStatus.AVAILABLE,
          },
          include: { ward: true, room: true },
          orderBy: { bedNumber: 'asc' },
        });
      }

      if (!targetBed) {
        throw new ConflictException(`No available beds found at ${booking.facility.name} for requested type ${booking.bedType}`);
      }
    }

    const changedBy = user?.id || 'SYSTEM';

    await this.prisma.$transaction(async (tx) => {
      // Set bed to RESERVED
      await tx.bed.update({
        where: { id: targetBed.id },
        data: { status: BedStatus.RESERVED },
      });

      await tx.bedStatusHistory.create({
        data: {
          bedId: targetBed.id,
          previousStatus: BedStatus.AVAILABLE,
          newStatus: BedStatus.RESERVED,
          changedBy,
          reason: `Reserved for online Booking #${booking.bookingNumber} (${booking.patientName})`,
        },
      });

      const holdExpiry = new Date(Date.now() + 24 * 3600 * 1000);

      // Update booking
      await tx.bedBooking.update({
        where: { id: booking.id },
        data: {
          allocatedBedId: targetBed.id,
          status: BedBookingStatus.APPROVED as any,
          reviewedBy: changedBy,
          reviewedAt: new Date(),
          expiresAt: holdExpiry,
          notes: dto.notes || booking.notes,
        },
      });
    });

    this.bedGateway.emitBedStatusChanged({
      facilityId: targetBed.facilityId,
      bedId: targetBed.id,
      previousStatus: BedStatus.AVAILABLE,
      newStatus: BedStatus.RESERVED,
      timestamp: new Date().toISOString(),
    });

    // Notify patient
    try {
      if (booking.patient?.user?.id) {
        await this.notificationService.createNotification({
          userId: booking.patient.user.id,
          type: NotificationType.BED_BOOKING_APPROVED as any,
          title: `Bed Allocated: #${booking.bookingNumber}`,
          message: `Bed #${targetBed.bedNumber} has been reserved for you at ${booking.facility.name}. Hold expires in 24 hours.`,
          entityType: 'BED_BOOKING',
          entityId: booking.id,
        });
      }
      if (booking.patientEmail) {
        await this.emailService.sendBedBookingNotification({
          recipientEmail: booking.patientEmail,
          recipientName: booking.patientName,
          bookingNumber: booking.bookingNumber,
          hospitalName: booking.facility.name,
          bedType: booking.bedType,
          status: 'APPROVED & ALLOCATED',
          allocatedBedNumber: targetBed.bedNumber,
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toLocaleString(),
          message: `Bed #${targetBed.bedNumber} has been allocated. Please arrive before expiry to confirm admission.`,
        });
      }
    } catch (e: any) {
      this.logger.warn(`Failed to dispatch bed allocation notification: ${e.message}`);
    }

    return this.getBookingById(id);
  }

  async convertToAdmission(id: string, dto: ConvertToAdmissionDto, user: any) {
    const booking = await this.getBookingById(id);

    if (booking.status === BedBookingStatus.ADMITTED) {
      throw new BadRequestException('This booking has already been converted to an inpatient admission');
    }

    let bedId = dto.bedId || booking.allocatedBedId;
    if (!bedId) {
      // Try to auto-allocate a bed first
      const allocated = await this.allocateBed(id, {}, user);
      bedId = allocated.allocatedBedId;
    }

    if (!bedId) {
      throw new BadRequestException('Cannot admit patient without an assigned bed');
    }

    const bed = await this.prisma.bed.findUnique({
      where: { id: bedId },
      include: { ward: true },
    });

    if (!bed) {
      throw new NotFoundException(`Bed with ID '${bedId}' not found`);
    }

    // Resolve or create patient profile if guest
    let patientId = booking.patientId;
    if (!patientId) {
      const existingProfile = await this.prisma.patientProfile.findFirst({
        where: { phone: booking.patientPhone },
      });

      if (existingProfile) {
        patientId = existingProfile.id;
      } else {
        // Create user & profile for patient
        const parts = booking.patientName.trim().split(' ');
        const firstName = parts[0] || 'Patient';
        const lastName = parts.slice(1).join(' ') || 'User';

        const patientRole = await this.prisma.role.findUnique({
          where: { code: 'PATIENT' },
        });

        const createdUser = await this.prisma.user.create({
          data: {
            email: booking.patientEmail || `patient.${Date.now()}@medinexa.in`,
            passwordHash: '$2b$10$e7Z1h9F1G1H1I1J1K1L1M.PlaceholderFallbackHash',
            firstName,
            lastName,
            phone: booking.patientPhone,
            roleId: patientRole!.id,
            organizationId: booking.facility.organizationId,
            facilityId: booking.facilityId,
          },
        });

        const newProfile = await this.prisma.patientProfile.create({
          data: {
            userId: createdUser.id,
            gender: 'UNKNOWN',
            dateOfBirth: new Date('1990-01-01'),
            phone: booking.patientPhone,
          },
        });

        patientId = newProfile.id;
      }
    }

    // Resolve department
    let departmentId = dto.departmentId || bed.ward.departmentId;
    if (!departmentId) {
      const defaultDept = await this.prisma.department.findFirst({
        where: { facilityId: booking.facilityId },
      });
      if (!defaultDept) {
        throw new BadRequestException('Hospital facility has no registered clinical departments');
      }
      departmentId = defaultDept.id;
    }

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const admissionNumber = `ADM-${year}-${randomSuffix}`;
    const changedBy = user?.id || 'SYSTEM';

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create Admission
      const admission = await tx.admission.create({
        data: {
          admissionNumber,
          patientId: patientId!,
          facilityId: booking.facilityId,
          departmentId,
          admittedBy: changedBy,
          admissionType: AdmissionType.ELECTIVE,
          status: AdmissionStatus.ADMITTED,
          admittedAt: new Date(),
          reason: dto.reason || booking.chiefComplaint || 'Direct admission via online bed booking',
        },
      });

      // 2. Create BedAssignment
      await tx.bedAssignment.create({
        data: {
          bedId: bed.id,
          patientId: patientId!,
          admissionId: admission.id,
          assignedBy: changedBy,
          assignedAt: new Date(),
          status: AssignmentStatus.ACTIVE,
        },
      });

      // 3. Update Bed to OCCUPIED
      const prevStatus = bed.status;
      await tx.bed.update({
        where: { id: bed.id },
        data: { status: BedStatus.OCCUPIED },
      });

      await tx.bedStatusHistory.create({
        data: {
          bedId: bed.id,
          previousStatus: prevStatus,
          newStatus: BedStatus.OCCUPIED,
          changedBy,
          patientId,
          reason: `Admitted via Booking #${booking.bookingNumber}`,
        },
      });

      // 4. Update BedBooking to ADMITTED
      const updatedBooking = await tx.bedBooking.update({
        where: { id: booking.id },
        data: {
          patientId,
          allocatedBedId: bed.id,
          admissionId: admission.id,
          status: BedBookingStatus.ADMITTED as any,
          admittedAt: new Date(),
          reviewedBy: changedBy,
          reviewedAt: new Date(),
        },
        include: {
          facility: true,
          allocatedBed: true,
          admission: true,
        },
      });

      return {
        admission,
        booking: updatedBooking,
      };
    });

    this.bedGateway.emitBedStatusChanged({
      facilityId: bed.facilityId,
      bedId: bed.id,
      previousStatus: bed.status as any,
      newStatus: BedStatus.OCCUPIED,
      timestamp: new Date().toISOString(),
    });

    return result;
  }
}
