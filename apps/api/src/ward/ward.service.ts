import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWardDto } from './dto/create-ward.dto';
import { UpdateWardDto } from './dto/update-ward.dto';
import { RoleCode, WardStatus, BedStatus } from '@medinexa/types';

@Injectable()
export class WardService {
  constructor(private readonly prisma: PrismaService) {}

  async validateFacilityAccess(facilityId: string, requestingUser: any) {
    const roleCode = requestingUser?.roleCode || requestingUser?.role?.code || (typeof requestingUser?.role === 'string' ? requestingUser.role : '');

    if (roleCode === RoleCode.MEDINEXA_ADMIN) {
      return; // Full platform system admin access across all facilities
    }

    const facility = await this.prisma.facility.findUnique({ where: { id: facilityId } });
    if (!facility) {
      throw new NotFoundException(`Facility with ID '${facilityId}' not found`);
    }

    if (requestingUser.organizationId && facility.organizationId !== requestingUser.organizationId) {
      throw new ForbiddenException("Access denied. Resource belongs to another organization.");
    }

    const userFacilityId = requestingUser?.facilityId || requestingUser?.doctorProfile?.facilityId;
    if (userFacilityId && userFacilityId !== facilityId && roleCode === RoleCode.HOSPITAL_ADMIN) {
      throw new ForbiddenException("Access denied. Resource belongs to another hospital facility.");
    }
  }

  async getWards(
    filters: { facilityId?: string; departmentId?: string; status?: WardStatus },
    requestingUser?: any,
  ) {
    const roleCode = requestingUser?.roleCode || requestingUser?.role?.code || requestingUser?.role;
    const userFacilityId = requestingUser?.facilityId || requestingUser?.doctorProfile?.facilityId;

    const where: any = {};

    if (roleCode && roleCode !== RoleCode.MEDINEXA_ADMIN && userFacilityId) {
      if (filters.facilityId && filters.facilityId !== userFacilityId) {
        throw new ForbiddenException('Access denied. Resource belongs to another hospital facility.');
      }
      where.facilityId = userFacilityId;
    } else if (filters.facilityId) {
      where.facilityId = filters.facilityId;
    }

    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.status) where.status = filters.status;

    const wards = await this.prisma.ward.findMany({
      where,
      include: {
        facility: { select: { id: true, name: true, code: true } },
        department: { select: { id: true, name: true, code: true } },
        rooms: { select: { id: true, roomNumber: true } },
        _count: { select: { beds: true } },
      },
      orderBy: { name: 'asc' },
    });

    return wards.map((w) => ({
      ...w,
      totalBeds: w._count.beds,
    }));
  }

  async getWardById(id: string) {
    const ward = await this.prisma.ward.findUnique({
      where: { id },
      include: {
        facility: true,
        department: true,
        rooms: { include: { beds: true } },
        _count: { select: { beds: true } },
      },
    });

    if (!ward) {
      throw new NotFoundException(`Ward with ID '${id}' not found`);
    }

    return {
      ...ward,
      totalBeds: ward._count.beds,
    };
  }

  async createWard(dto: CreateWardDto, requestingUser: any) {
    // 1. Multi-hospital security validation
    await this.validateFacilityAccess(dto.facilityId, requestingUser);

    // 2. Relationship integrity validation: department must belong to specified facility
    const dept = await this.prisma.department.findUnique({ where: { id: dto.departmentId } });
    if (!dept) {
      throw new BadRequestException(`Department with ID '${dto.departmentId}' not found`);
    }
    if (dept.facilityId !== dto.facilityId) {
      throw new BadRequestException(
        `Department '${dept.name}' does not belong to facility '${dto.facilityId}'`,
      );
    }

    // 3. Unique code per facility check
    const existingWard = await this.prisma.ward.findUnique({
      where: {
        facilityId_code: {
          facilityId: dto.facilityId,
          code: dto.code,
        },
      },
    });
    if (existingWard) {
      throw new BadRequestException(`Ward code '${dto.code}' already exists in this facility`);
    }

    return this.prisma.ward.create({
      data: {
        facilityId: dto.facilityId,
        departmentId: dto.departmentId,
        name: dto.name,
        code: dto.code,
        wardType: dto.wardType,
        genderPolicy: dto.genderPolicy || null,
        floor: dto.floor || null,
        status: WardStatus.ACTIVE,
      },
      include: {
        facility: true,
        department: true,
      },
    });
  }

  async updateWard(id: string, dto: UpdateWardDto, requestingUser: any) {
    const ward = await this.getWardById(id);

    // Multi-hospital security validation
    await this.validateFacilityAccess(ward.facilityId, requestingUser);

    return this.prisma.ward.update({
      where: { id },
      data: {
        name: dto.name,
        wardType: dto.wardType,
        genderPolicy: dto.genderPolicy,
        floor: dto.floor,
        status: dto.status,
      },
      include: {
        facility: true,
        department: true,
      },
    });
  }

  async getWardCapacity(wardId: string) {
    const ward = await this.getWardById(wardId);

    const beds = await this.prisma.bed.findMany({
      where: { wardId },
    });

    const statusCounts: Record<BedStatus, number> = {
      AVAILABLE: 0,
      OCCUPIED: 0,
      RESERVED: 0,
      CLEANING: 0,
      MAINTENANCE: 0,
      OUT_OF_SERVICE: 0,
    };

    beds.forEach((b) => {
      if (statusCounts[b.status as BedStatus] !== undefined) {
        statusCounts[b.status as BedStatus]++;
      }
    });

    return {
      wardId: ward.id,
      wardName: ward.name,
      totalBeds: beds.length,
      totalRooms: ward.rooms.length,
      statusCounts,
    };
  }
}
