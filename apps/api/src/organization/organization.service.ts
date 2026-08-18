import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { BedStatus } from '@medinexa/types';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrganizations() {
    return this.prisma.organization.findMany({
      include: {
        facilities: {
          include: {
            departments: true,
          },
        },
      },
    });
  }

  async getFacilities() {
    return this.prisma.facility.findMany({
      include: {
        organization: true,
        departments: true,
        _count: {
          select: {
            wards: true,
            beds: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getFacilityById(id: string) {
    const facility = await this.prisma.facility.findUnique({
      where: { id },
      include: {
        organization: true,
        departments: true,
        wards: {
          include: {
            rooms: true,
            _count: { select: { beds: true } },
          },
        },
        _count: { select: { beds: true } },
      },
    });

    if (!facility) {
      throw new NotFoundException(`Facility with ID '${id}' not found`);
    }

    return facility;
  }

  async getFacilityCapacity(facilityId: string) {
    const facility = await this.getFacilityById(facilityId);

    const beds = await this.prisma.bed.findMany({
      where: { facilityId },
    });

    const roomsCount = await this.prisma.room.count({
      where: { ward: { facilityId } },
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
      facilityId: facility.id,
      facilityName: facility.name,
      totalBeds: beds.length,
      totalWards: facility.wards.length,
      totalRooms: roomsCount,
      availableBeds: statusCounts.AVAILABLE,
      reservedBeds: statusCounts.RESERVED,
      occupiedBeds: statusCounts.OCCUPIED,
      cleaningBeds: statusCounts.CLEANING,
      maintenanceBeds: statusCounts.MAINTENANCE,
      outOfServiceBeds: statusCounts.OUT_OF_SERVICE,
      statusCounts,
    };
  }

  async createFacility(dto: CreateFacilityDto) {
    let orgId = dto.organizationId;
    if (!orgId) {
      const defaultOrg = await this.prisma.organization.findFirst();
      if (!defaultOrg) {
        throw new BadRequestException('No default organization exists');
      }
      orgId = defaultOrg.id;
    } else {
      const existingOrg = await this.prisma.organization.findUnique({ where: { id: orgId } });
      if (!existingOrg) {
        throw new BadRequestException(`Organization with ID '${orgId}' does not exist`);
      }
    }

    const existingFacility = await this.prisma.facility.findUnique({ where: { code: dto.code } });
    if (existingFacility) {
      throw new BadRequestException(`Facility with code '${dto.code}' already exists`);
    }

    return this.prisma.facility.create({
      data: {
        organizationId: orgId,
        name: dto.name,
        code: dto.code,
        address: dto.address || null,
        city: dto.city || null,
        state: dto.state || null,
        postalCode: dto.postalCode || null,
        phone: dto.phone || null,
        email: dto.email || null,
        status: 'ACTIVE',
      },
      include: {
        organization: true,
      },
    });
  }

  async getDepartmentsByFacility(facilityId: string) {
    await this.getFacilityById(facilityId);

    return this.prisma.department.findMany({
      where: { facilityId },
      orderBy: { name: 'asc' },
    });
  }

  async createDepartment(dto: CreateDepartmentDto) {
    await this.getFacilityById(dto.facilityId);

    const existingDept = await this.prisma.department.findUnique({
      where: {
        facilityId_code: {
          facilityId: dto.facilityId,
          code: dto.code,
        },
      },
    });

    if (existingDept) {
      throw new BadRequestException(
        `Department code '${dto.code}' already exists under facility '${dto.facilityId}'`,
      );
    }

    return this.prisma.department.create({
      data: {
        facilityId: dto.facilityId,
        name: dto.name,
        code: dto.code,
        status: 'ACTIVE',
      },
      include: {
        facility: true,
      },
    });
  }
}
