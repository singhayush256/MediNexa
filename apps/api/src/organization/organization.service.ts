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

  // =========================================================================
  // PRODUCTION MODULE 2: NEARBY HOSPITAL FINDER WITH LIVE BED COUNTS
  // =========================================================================

  async findNearbyHospitals(params: {
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    bedType?: string;
    minAvailableBeds?: number;
    search?: string;
  }) {
    const userLat = params.latitude !== undefined && !isNaN(Number(params.latitude)) ? Number(params.latitude) : 28.5398;
    const userLon = params.longitude !== undefined && !isNaN(Number(params.longitude)) ? Number(params.longitude) : 77.2882;
    const maxRadius = params.radiusKm ? Number(params.radiusKm) : 50;

    const facilities = await this.prisma.facility.findMany({
      where: {
        status: 'ACTIVE',
        ...(params.search
          ? {
              OR: [
                { name: { contains: params.search, mode: 'insensitive' } },
                { city: { contains: params.search, mode: 'insensitive' } },
                { address: { contains: params.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        beds: {
          select: {
            id: true,
            bedType: true,
            status: true,
          },
        },
      },
    });

    const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371;
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Number((R * c).toFixed(1));
    };

    const results = facilities.map((f) => {
      const lat = f.latitude || 28.5398;
      const lon = f.longitude || 77.2882;
      const distanceKm = calculateDistanceKm(userLat, userLon, lat, lon);
      const estimatedDriveMinutes = Math.max(3, Math.round(distanceKm * 2.2));

      const totalBeds = f.beds.length;
      const availableBeds = f.beds.filter((b) => b.status === BedStatus.AVAILABLE).length;
      const availableIcuBeds = f.beds.filter((b) => b.bedType === 'ICU' && b.status === BedStatus.AVAILABLE).length;
      const availableEmergencyBeds = f.beds.filter((b) => b.bedType === 'EMERGENCY' && b.status === BedStatus.AVAILABLE).length;
      const availableOxygenBeds = f.beds.filter((b) => b.bedType === 'OXYGEN' && b.status === BedStatus.AVAILABLE).length;
      const availableVentilatorBeds = f.beds.filter((b) => b.bedType === 'VENTILATOR' && b.status === BedStatus.AVAILABLE).length;
      const availableGeneralBeds = f.beds.filter((b) => b.bedType === 'GENERAL' && b.status === BedStatus.AVAILABLE).length;

      const bedBreakdown: Record<string, { total: number; available: number }> = {};
      for (const b of f.beds) {
        if (!bedBreakdown[b.bedType]) {
          bedBreakdown[b.bedType] = { total: 0, available: 0 };
        }
        bedBreakdown[b.bedType].total++;
        if (b.status === BedStatus.AVAILABLE) {
          bedBreakdown[b.bedType].available++;
        }
      }

      return {
        id: f.id,
        name: f.name,
        code: f.code,
        address: f.address,
        city: f.city,
        state: f.state,
        phone: f.phone,
        email: f.email,
        facilityType: f.facilityType || 'SUPER_SPECIALITY',
        rating: f.rating || 4.7,
        latitude: lat,
        longitude: lon,
        distanceKm,
        estimatedDriveMinutes,
        totalBeds,
        availableBeds,
        availableIcuBeds,
        availableEmergencyBeds,
        availableOxygenBeds,
        availableVentilatorBeds,
        availableGeneralBeds,
        bedBreakdown,
        servicesOffered: f.servicesOffered.length > 0 ? f.servicesOffered : ['Emergency 24x7', 'ICU', 'Oxygen Support', 'Pharmacy'],
      };
    });

    let filtered = results;
    if (params.radiusKm) {
      filtered = filtered.filter((r) => r.distanceKm <= maxRadius);
    }
    if (params.bedType) {
      const typeUpper = params.bedType.toUpperCase();
      filtered = filtered.filter((r) => (r.bedBreakdown[typeUpper]?.available || 0) > 0);
    }
    if (params.minAvailableBeds) {
      filtered = filtered.filter((r) => r.availableBeds >= Number(params.minAvailableBeds));
    }

    filtered.sort((a, b) => a.distanceKm - b.distanceKm);

    return {
      userLocation: { latitude: userLat, longitude: userLon },
      radiusKm: maxRadius,
      count: filtered.length,
      hospitals: filtered,
    };
  }
}
