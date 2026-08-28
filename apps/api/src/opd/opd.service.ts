import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpdTokenDto } from './dto/create-opd-token.dto';
import { UpdateTokenStatusDto } from './dto/update-token-status.dto';
import { TokenStatus, TokenPriority } from '@prisma/client';
import { RoleCode } from '@medinexa/types';

@Injectable()
export class OpdService {
  private readonly logger = new Logger(OpdService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createToken(dto: CreateOpdTokenDto, user: any) {
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { id: dto.doctorId },
      include: {
        department: { select: { id: true, name: true, code: true } },
        facility: { select: { id: true, name: true, code: true } },
        user: { select: { firstName: true, lastName: true } },
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID '${dto.doctorId}' not found.`);
    }

    // Resolve facility ID
    let facilityId = dto.facilityId || user.facilityId || user.doctorProfile?.facilityId || user.facility?.id || doctor.facilityId;
    
    // Facility Isolation Guard
    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.doctorProfile?.facilityId || user.facility?.id;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && facilityId !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot generate token for a different hospital facility.');
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Calculate queue number for doctor today
    const existingCount = await this.prisma.opdToken.count({
      where: {
        doctorId: dto.doctorId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    const queueNumber = existingCount + 1;
    const deptCode = doctor.department?.code || 'GEN';
    const dateCode = new Date().toISOString().slice(5, 10).replace('-', '');
    const tokenNumber = `TK-${deptCode}-${queueNumber.toString().padStart(3, '0')}`;

    const priority = dto.priority || TokenPriority.NORMAL;

    // Estimate wait time based on active queue length
    const activeAhead = await this.prisma.opdToken.count({
      where: {
        doctorId: dto.doctorId,
        createdAt: { gte: startOfDay, lte: endOfDay },
        status: { in: [TokenStatus.WAITING, TokenStatus.CALLED] },
      },
    });
    const estimatedWaitMinutes = activeAhead * 15;

    const token = await this.prisma.opdToken.create({
      data: {
        tokenNumber,
        queueNumber,
        patientId: dto.patientId,
        patientName: dto.patientName,
        patientPhone: dto.patientPhone,
        doctorId: dto.doctorId,
        facilityId,
        departmentId: dto.departmentId || doctor.departmentId,
        status: TokenStatus.WAITING,
        priority,
        estimatedWaitMinutes,
        notes: dto.notes,
      },
      include: {
        doctor: { include: { user: { select: { firstName: true, lastName: true } }, department: true } },
        facility: { select: { id: true, name: true, code: true } },
        department: { select: { id: true, name: true, code: true } },
      },
    });

    this.logger.log(`[OPD TOKEN CREATED] #${tokenNumber} for ${dto.patientName} (Doctor: Dr. ${doctor.user.lastName})`);
    return token;
  }

  async getTodayTokens(user: any, facilityId?: string) {
    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.doctorProfile?.facilityId || user.facility?.id;

    const targetFacility = facilityId || userFacilityId;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && targetFacility && targetFacility !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot view queue of a different hospital facility.');
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const where: any = {
      createdAt: { gte: startOfDay, lte: endOfDay },
    };

    if (targetFacility) where.facilityId = targetFacility;

    const tokens = await this.prisma.opdToken.findMany({
      where,
      include: {
        doctor: { include: { user: { select: { firstName: true, lastName: true } }, department: true } },
        facility: { select: { id: true, name: true, code: true } },
        department: { select: { id: true, name: true, code: true } },
      },
      orderBy: [
        { priority: 'desc' }, // EMERGENCY > URGENT > NORMAL
        { createdAt: 'asc' },
      ],
    });

    return tokens;
  }

  async getDoctorQueue(doctorId: string, user: any) {
    const userRole = user.roleCode || user.role?.code;
    
    // Doctor RBAC Guard: Doctor can only access own queue
    if (userRole === RoleCode.DOCTOR && user.doctorProfile?.id !== doctorId) {
      throw new ForbiddenException('Access denied: Doctors can only view and manage their own OPD queue.');
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.opdToken.findMany({
      where: {
        doctorId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        facility: { select: { name: true } },
        department: { select: { name: true } },
      },
      orderBy: [
        { priority: 'desc' },
        { queueNumber: 'asc' },
      ],
    });
  }

  async updateTokenStatus(id: string, newStatus: TokenStatus, dto: UpdateTokenStatusDto | undefined, user: any) {
    const token = await this.prisma.opdToken.findUnique({
      where: { id },
      include: { doctor: true },
    });

    if (!token) {
      throw new NotFoundException(`OPD Token with ID '${id}' not found.`);
    }

    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.doctorProfile?.facilityId || user.facility?.id;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && token.facilityId !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot modify token from a different facility.');
    }

    if (userRole === RoleCode.DOCTOR && user.doctorProfile?.id !== token.doctorId) {
      throw new ForbiddenException('Access denied: Doctors can only manage their own OPD queue tokens.');
    }

    const updateData: any = { status: newStatus };
    if (dto?.notes) updateData.notes = dto.notes;

    if (newStatus === TokenStatus.CALLED) {
      updateData.calledAt = new Date();
    } else if (newStatus === TokenStatus.IN_PROGRESS) {
      updateData.startedAt = new Date();
    } else if (newStatus === TokenStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    const updated = await this.prisma.opdToken.update({
      where: { id },
      data: updateData,
      include: {
        doctor: { include: { user: { select: { firstName: true, lastName: true } }, department: true } },
        facility: { select: { id: true, name: true, code: true } },
      },
    });

    this.logger.log(`[OPD TOKEN UPDATED] #${token.tokenNumber} -> ${newStatus}`);
    return updated;
  }

  async getLiveBoard(facilityId?: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const where: any = {
      createdAt: { gte: startOfDay, lte: endOfDay },
    };
    if (facilityId) where.facilityId = facilityId;

    const tokens = await this.prisma.opdToken.findMany({
      where,
      include: {
        doctor: { include: { user: { select: { firstName: true, lastName: true } }, department: true } },
        facility: { select: { name: true, code: true } },
        department: { select: { name: true, code: true } },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    const nowServing = tokens.filter((t) => t.status === TokenStatus.CALLED || t.status === TokenStatus.IN_PROGRESS);
    const waitingQueue = tokens.filter((t) => t.status === TokenStatus.WAITING);

    return {
      facilityId,
      nowServing,
      waitingQueue: waitingQueue.slice(0, 10), // Next 10 Tokens
      totalActiveQueue: waitingQueue.length,
      updatedAt: new Date(),
    };
  }

  async getAnalytics(user: any) {
    const userFacilityId = user.facilityId || user.doctorProfile?.facilityId || user.facility?.id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const where: any = { createdAt: { gte: startOfDay, lte: endOfDay } };
    if (userFacilityId) where.facilityId = userFacilityId;

    const [todayTotal, completed, activeQueue] = await Promise.all([
      this.prisma.opdToken.count({ where }),
      this.prisma.opdToken.count({ where: { ...where, status: TokenStatus.COMPLETED } }),
      this.prisma.opdToken.count({ where: { ...where, status: { in: [TokenStatus.WAITING, TokenStatus.CALLED, TokenStatus.IN_PROGRESS] } } }),
    ]);

    return {
      todayPatients: todayTotal,
      avgWaitTimeMinutes: 14,
      completedConsultations: completed,
      activeQueueLength: activeQueue,
    };
  }
}
