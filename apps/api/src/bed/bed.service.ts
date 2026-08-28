import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WardService } from '../ward/ward.service';
import { BedGateway } from './events/bed.gateway';
import { CreateBedDto } from './dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto';
import { ReserveBedDto } from './dto/reserve-bed.dto';
import { AssignBedDto } from './dto/assign-bed.dto';
import { ReleaseBedDto } from './dto/release-bed.dto';
import { CleanBedDto } from './dto/clean-bed.dto';
import { MaintenanceBedDto } from './dto/maintenance-bed.dto';
import { BedStatus, BedType, ReservationStatus, AssignmentStatus } from '@medinexa/types';

@Injectable()
export class BedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wardService: WardService,
    private readonly bedGateway: BedGateway,
  ) {}

  async getBeds(
    filters: {
      facilityId?: string;
      wardId?: string;
      roomId?: string;
      bedType?: BedType;
      status?: BedStatus;
    },
    requestingUser?: any,
  ) {
    const roleCode = requestingUser?.roleCode || requestingUser?.role?.code || requestingUser?.role;
    const userFacilityId = requestingUser?.facilityId || requestingUser?.doctorProfile?.facilityId;

    const where: any = {};

    if (roleCode && roleCode !== 'MEDINEXA_ADMIN' && userFacilityId) {
      if (filters.facilityId && filters.facilityId !== userFacilityId) {
        throw new ForbiddenException('Access denied. Resource belongs to another hospital facility.');
      }
      where.facilityId = userFacilityId;
    } else if (filters.facilityId) {
      where.facilityId = filters.facilityId;
    }

    if (filters.wardId) where.wardId = filters.wardId;
    if (filters.roomId) where.roomId = filters.roomId;
    if (filters.bedType) where.bedType = filters.bedType;
    if (filters.status) where.status = filters.status;

    const beds = await this.prisma.bed.findMany({
      where,
      include: {
        room: { select: { id: true, roomNumber: true, roomType: true } },
        ward: { select: { id: true, name: true, code: true, wardType: true } },
        facility: { select: { id: true, name: true, code: true } },
        reservations: {
          where: { status: ReservationStatus.ACTIVE },
          include: { patient: { include: { user: true } } },
          take: 1,
        },
        assignments: {
          where: { status: AssignmentStatus.ACTIVE },
          include: { patient: { include: { user: true } } },
          take: 1,
        },
      },
      orderBy: { bedNumber: 'asc' },
    });

    return beds.map((b) => ({
      ...b,
      activeReservation: b.reservations[0] || null,
      activeAssignment: b.assignments[0] || null,
    }));
  }

  async getAvailableBeds(
    filters: {
      facilityId?: string;
      departmentId?: string;
      wardId?: string;
      roomId?: string;
      bedType?: BedType;
      genderPolicy?: string;
    },
    requestingUser?: any,
  ) {
    const roleCode = requestingUser?.roleCode || requestingUser?.role?.code || requestingUser?.role;
    const userFacilityId = requestingUser?.facilityId || requestingUser?.doctorProfile?.facilityId;

    const where: any = {
      status: BedStatus.AVAILABLE,
      isActive: true,
    };

    if (roleCode && roleCode !== 'MEDINEXA_ADMIN' && userFacilityId) {
      if (filters.facilityId && filters.facilityId !== userFacilityId) {
        throw new ForbiddenException('Access denied. Resource belongs to another hospital facility.');
      }
      where.facilityId = userFacilityId;
    } else if (filters.facilityId) {
      where.facilityId = filters.facilityId;
    }
    if (filters.wardId) where.wardId = filters.wardId;
    if (filters.roomId) where.roomId = filters.roomId;
    if (filters.bedType) where.bedType = filters.bedType;
    if (filters.genderPolicy) where.genderPolicy = filters.genderPolicy;

    if (filters.departmentId) {
      where.ward = { departmentId: filters.departmentId };
    }

    return this.prisma.bed.findMany({
      where,
      include: {
        room: true,
        ward: { include: { department: true } },
        facility: true,
      },
      orderBy: { bedNumber: 'asc' },
    });
  }

  async getBedById(id: string) {
    const bed = await this.prisma.bed.findUnique({
      where: { id },
      include: {
        room: true,
        ward: { include: { department: true } },
        facility: true,
        reservations: {
          where: { status: ReservationStatus.ACTIVE },
          include: { patient: { include: { user: true } } },
          take: 1,
        },
        assignments: {
          where: { status: AssignmentStatus.ACTIVE },
          include: { patient: { include: { user: true } } },
          take: 1,
        },
      },
    });

    if (!bed) {
      throw new NotFoundException(`Bed with ID '${id}' not found`);
    }

    return {
      ...bed,
      activeReservation: bed.reservations[0] || null,
      activeAssignment: bed.assignments[0] || null,
    };
  }

  async createBed(dto: CreateBedDto, requestingUser: any) {
    const room = await this.prisma.room.findUnique({
      where: { id: dto.roomId },
      include: { ward: true },
    });

    if (!room) {
      throw new BadRequestException(`Room with ID '${dto.roomId}' not found`);
    }

    await this.wardService.validateFacilityAccess(room.ward.facilityId, requestingUser);

    const existingBed = await this.prisma.bed.findUnique({
      where: {
        roomId_bedNumber: {
          roomId: dto.roomId,
          bedNumber: dto.bedNumber,
        },
      },
    });

    if (existingBed) {
      throw new BadRequestException(
        `Bed number '${dto.bedNumber}' already exists in room '${room.roomNumber}'`,
      );
    }

    const bed = await this.prisma.bed.create({
      data: {
        roomId: dto.roomId,
        wardId: room.wardId,
        facilityId: room.ward.facilityId,
        bedNumber: dto.bedNumber,
        bedType: dto.bedType,
        status: dto.status || BedStatus.AVAILABLE,
        genderPolicy: dto.genderPolicy || null,
        isActive: true,
      },
      include: {
        room: true,
        ward: true,
        facility: true,
      },
    });

    return bed;
  }

  async updateBed(id: string, dto: UpdateBedDto, requestingUser: any) {
    const bed = await this.getBedById(id);
    await this.wardService.validateFacilityAccess(bed.facilityId, requestingUser);

    return this.prisma.bed.update({
      where: { id },
      data: {
        bedType: dto.bedType,
        genderPolicy: dto.genderPolicy,
        isActive: dto.isActive,
      },
      include: {
        room: true,
        ward: true,
        facility: true,
      },
    });
  }

  // =========================================================================
  // DAY 5 OPERATIONAL STATE ENGINE WITH ATOMIC TRANSACTIONS & CONCURRENCY
  // =========================================================================

  async reserveBed(bedId: string, dto: ReserveBedDto, requestingUser: any) {
    const bed = await this.getBedById(bedId);
    await this.wardService.validateFacilityAccess(bed.facilityId, requestingUser);

    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient) {
      throw new NotFoundException(`Patient profile with ID '${dto.patientId}' not found`);
    }

    const expiresInMinutes = dto.expiresInMinutes || 30;
    const expiresAt = dto.expiresAt
      ? new Date(dto.expiresAt)
      : new Date(Date.now() + expiresInMinutes * 60 * 1000);

    // ATOMIC TRANSACTION WITH CONCURRENCY LOCK CHECK
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Atomic status update
      const updated = await tx.bed.updateMany({
        where: {
          id: bedId,
          status: BedStatus.AVAILABLE,
        },
        data: {
          status: BedStatus.RESERVED,
        },
      });

      if (updated.count === 0) {
        throw new ConflictException(
          `Bed '${bed.bedNumber}' is not available for reservation or has been locked by another request.`,
        );
      }

      // 2. Create BedReservation
      const reservation = await tx.bedReservation.create({
        data: {
          bedId,
          patientId: dto.patientId,
          reservedBy: requestingUser.id,
          expiresAt,
          status: ReservationStatus.ACTIVE,
          reason: dto.reason || null,
        },
      });

      // 3. Create BedStatusHistory
      await tx.bedStatusHistory.create({
        data: {
          bedId,
          previousStatus: BedStatus.AVAILABLE,
          newStatus: BedStatus.RESERVED,
          changedBy: requestingUser.id,
          patientId: dto.patientId,
          reason: dto.reason || 'Bed reservation hold placed',
        },
      });

      return reservation;
    });

    // Broadcast WebSocket event
    this.bedGateway.emitBedStatusChanged({
      facilityId: bed.facilityId,
      bedId,
      previousStatus: BedStatus.AVAILABLE,
      newStatus: BedStatus.RESERVED,
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  async cancelReservation(bedId: string, reason: string | undefined, requestingUser: any) {
    const bed = await this.getBedById(bedId);
    await this.wardService.validateFacilityAccess(bed.facilityId, requestingUser);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.bed.updateMany({
        where: {
          id: bedId,
          status: BedStatus.RESERVED,
        },
        data: {
          status: BedStatus.AVAILABLE,
        },
      });

      if (updated.count === 0) {
        throw new ConflictException(`Bed '${bed.bedNumber}' is not in RESERVED status.`);
      }

      await tx.bedReservation.updateMany({
        where: {
          bedId,
          status: ReservationStatus.ACTIVE,
        },
        data: {
          status: ReservationStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });

      await tx.bedStatusHistory.create({
        data: {
          bedId,
          previousStatus: BedStatus.RESERVED,
          newStatus: BedStatus.AVAILABLE,
          changedBy: requestingUser.id,
          reason: reason || 'Reservation cancelled by administrator',
        },
      });

      this.bedGateway.emitBedStatusChanged({
        facilityId: bed.facilityId,
        bedId,
        previousStatus: BedStatus.RESERVED,
        newStatus: BedStatus.AVAILABLE,
        timestamp: new Date().toISOString(),
      });

      return { success: true, message: 'Reservation cancelled successfully' };
    });
  }

  async assignBed(bedId: string, dto: AssignBedDto, requestingUser: any) {
    const bed = await this.getBedById(bedId);
    await this.wardService.validateFacilityAccess(bed.facilityId, requestingUser);

    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient) {
      throw new NotFoundException(`Patient profile with ID '${dto.patientId}' not found`);
    }

    // ATOMIC TRANSACTION WITH CONCURRENCY LOCK CHECK
    const result = await this.prisma.$transaction(async (tx) => {
      const currentBed = await tx.bed.findUnique({ where: { id: bedId } });
      if (!currentBed) {
        throw new NotFoundException(`Bed with ID '${bedId}' not found`);
      }

      if (
        currentBed.status !== BedStatus.AVAILABLE &&
        currentBed.status !== BedStatus.RESERVED
      ) {
        throw new ConflictException(
          `Bed '${bed.bedNumber}' is in status '${currentBed.status}' and cannot be assigned.`,
        );
      }

      const prevStatus = currentBed.status;

      // 1. Atomic update
      const updated = await tx.bed.updateMany({
        where: {
          id: bedId,
          status: prevStatus,
        },
        data: {
          status: BedStatus.OCCUPIED,
        },
      });

      if (updated.count === 0) {
        throw new ConflictException(
          `Bed '${bed.bedNumber}' status was modified concurrently by another request.`,
        );
      }

      // 2. Convert active reservation if exists
      if (prevStatus === BedStatus.RESERVED || dto.reservationId) {
        await tx.bedReservation.updateMany({
          where: {
            bedId,
            status: ReservationStatus.ACTIVE,
          },
          data: {
            status: ReservationStatus.CONVERTED,
            convertedAt: new Date(),
          },
        });
      }

      // 3. Create active BedAssignment
      const assignment = await tx.bedAssignment.create({
        data: {
          bedId,
          patientId: dto.patientId,
          assignedBy: requestingUser.id,
          reservationId: dto.reservationId || null,
          status: AssignmentStatus.ACTIVE,
          reason: dto.reason || null,
        },
      });

      // 4. Create BedStatusHistory
      await tx.bedStatusHistory.create({
        data: {
          bedId,
          previousStatus: prevStatus,
          newStatus: BedStatus.OCCUPIED,
          changedBy: requestingUser.id,
          patientId: dto.patientId,
          reason: dto.reason || 'Patient assigned to bed',
        },
      });

      return assignment;
    });

    this.bedGateway.emitBedStatusChanged({
      facilityId: bed.facilityId,
      bedId,
      previousStatus: bed.status as BedStatus,
      newStatus: BedStatus.OCCUPIED,
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  async releaseBed(bedId: string, dto: ReleaseBedDto, requestingUser: any) {
    const bed = await this.getBedById(bedId);
    await this.wardService.validateFacilityAccess(bed.facilityId, requestingUser);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.bed.updateMany({
        where: {
          id: bedId,
          status: BedStatus.OCCUPIED,
        },
        data: {
          status: BedStatus.CLEANING,
        },
      });

      if (updated.count === 0) {
        throw new ConflictException(`Bed '${bed.bedNumber}' is not in OCCUPIED status.`);
      }

      // Release active assignment
      const activeAssignment = await tx.bedAssignment.findFirst({
        where: { bedId, status: AssignmentStatus.ACTIVE },
      });

      if (activeAssignment) {
        await tx.bedAssignment.update({
          where: { id: activeAssignment.id },
          data: {
            status: AssignmentStatus.RELEASED,
            releasedAt: new Date(),
          },
        });
      }

      await tx.bedStatusHistory.create({
        data: {
          bedId,
          previousStatus: BedStatus.OCCUPIED,
          newStatus: BedStatus.CLEANING,
          changedBy: requestingUser.id,
          patientId: activeAssignment?.patientId || null,
          reason: dto.reason || 'Patient discharged/released from bed',
        },
      });

      this.bedGateway.emitBedStatusChanged({
        facilityId: bed.facilityId,
        bedId,
        previousStatus: BedStatus.OCCUPIED,
        newStatus: BedStatus.CLEANING,
        timestamp: new Date().toISOString(),
      });

      return { success: true, message: 'Bed released and set to CLEANING status' };
    });
  }

  async cleanBed(bedId: string, dto: CleanBedDto, requestingUser: any) {
    const bed = await this.getBedById(bedId);
    await this.wardService.validateFacilityAccess(bed.facilityId, requestingUser);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.bed.updateMany({
        where: {
          id: bedId,
          status: BedStatus.CLEANING,
        },
        data: {
          status: BedStatus.AVAILABLE,
        },
      });

      if (updated.count === 0) {
        throw new BadRequestException(`Bed '${bed.bedNumber}' is not in CLEANING status.`);
      }

      await tx.bedStatusHistory.create({
        data: {
          bedId,
          previousStatus: BedStatus.CLEANING,
          newStatus: BedStatus.AVAILABLE,
          changedBy: requestingUser.id,
          reason: dto.reason || 'Sanitization and cleaning completed',
        },
      });

      this.bedGateway.emitBedStatusChanged({
        facilityId: bed.facilityId,
        bedId,
        previousStatus: BedStatus.CLEANING,
        newStatus: BedStatus.AVAILABLE,
        timestamp: new Date().toISOString(),
      });

      return { success: true, message: 'Bed cleaned and returned to AVAILABLE status' };
    });
  }

  async setMaintenance(bedId: string, dto: MaintenanceBedDto, requestingUser: any) {
    const bed = await this.getBedById(bedId);
    await this.wardService.validateFacilityAccess(bed.facilityId, requestingUser);

    const targetStatus = dto.outOfService ? BedStatus.OUT_OF_SERVICE : BedStatus.MAINTENANCE;

    return this.prisma.$transaction(async (tx) => {
      const currentBed = await tx.bed.findUnique({ where: { id: bedId } });
      if (!currentBed) throw new NotFoundException('Bed not found');

      if (currentBed.status === BedStatus.OCCUPIED) {
        throw new ConflictException(
          'Cannot place OCCUPIED bed into maintenance. Release or transfer patient first.',
        );
      }

      const updated = await tx.bed.updateMany({
        where: {
          id: bedId,
          status: currentBed.status,
        },
        data: {
          status: targetStatus,
        },
      });

      if (updated.count === 0) {
        throw new ConflictException('Bed status changed concurrently.');
      }

      await tx.bedStatusHistory.create({
        data: {
          bedId,
          previousStatus: currentBed.status,
          newStatus: targetStatus,
          changedBy: requestingUser.id,
          reason: dto.reason || 'Maintenance requested',
        },
      });

      this.bedGateway.emitBedStatusChanged({
        facilityId: bed.facilityId,
        bedId,
        previousStatus: currentBed.status as BedStatus,
        newStatus: targetStatus as BedStatus,
        timestamp: new Date().toISOString(),
      });

      return { success: true, message: `Bed placed in ${targetStatus} status` };
    });
  }

  async completeMaintenance(bedId: string, reason: string | undefined, requestingUser: any) {
    const bed = await this.getBedById(bedId);
    await this.wardService.validateFacilityAccess(bed.facilityId, requestingUser);

    return this.prisma.$transaction(async (tx) => {
      const currentBed = await tx.bed.findUnique({ where: { id: bedId } });
      if (!currentBed) throw new NotFoundException('Bed not found');

      if (
        currentBed.status !== BedStatus.MAINTENANCE &&
        currentBed.status !== BedStatus.OUT_OF_SERVICE
      ) {
        throw new BadRequestException('Bed is not in MAINTENANCE or OUT_OF_SERVICE status.');
      }

      const updated = await tx.bed.updateMany({
        where: {
          id: bedId,
          status: currentBed.status,
        },
        data: {
          status: BedStatus.AVAILABLE,
        },
      });

      if (updated.count === 0) {
        throw new ConflictException('Bed status changed concurrently.');
      }

      await tx.bedStatusHistory.create({
        data: {
          bedId,
          previousStatus: currentBed.status,
          newStatus: BedStatus.AVAILABLE,
          changedBy: requestingUser.id,
          reason: reason || 'Maintenance repair completed',
        },
      });

      this.bedGateway.emitBedStatusChanged({
        facilityId: bed.facilityId,
        bedId,
        previousStatus: currentBed.status as BedStatus,
        newStatus: BedStatus.AVAILABLE,
        timestamp: new Date().toISOString(),
      });

      return { success: true, message: 'Maintenance completed. Bed restored to AVAILABLE status' };
    });
  }

  async getBedHistory(bedId: string) {
    await this.getBedById(bedId);

    return this.prisma.bedStatusHistory.findMany({
      where: { bedId },
      include: {
        changingUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        patient: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async processExpiredReservations() {
    const now = new Date();
    const expiredReservations = await this.prisma.bedReservation.findMany({
      where: {
        status: ReservationStatus.ACTIVE,
        expiresAt: { lt: now },
      },
      include: { bed: true },
    });

    let count = 0;
    for (const res of expiredReservations) {
      await this.prisma.$transaction(async (tx) => {
        await tx.bedReservation.update({
          where: { id: res.id },
          data: { status: ReservationStatus.EXPIRED },
        });

        await tx.bed.updateMany({
          where: { id: res.bedId, status: BedStatus.RESERVED },
          data: { status: BedStatus.AVAILABLE },
        });

        await tx.bedStatusHistory.create({
          data: {
            bedId: res.bedId,
            previousStatus: BedStatus.RESERVED,
            newStatus: BedStatus.AVAILABLE,
            changedBy: res.reservedBy,
            patientId: res.patientId,
            reason: 'Reservation expired automatically',
          },
        });
      });

      this.bedGateway.emitBedStatusChanged({
        facilityId: res.bed.facilityId,
        bedId: res.bedId,
        previousStatus: BedStatus.RESERVED,
        newStatus: BedStatus.AVAILABLE,
        timestamp: new Date().toISOString(),
      });

      count++;
    }

    return { processed: count };
  }
}
