import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WardService } from '../ward/ward.service';
import { CreateAmbulanceDto } from './dto/create-ambulance.dto';
import { CreateDriverDto } from './dto/create-driver.dto';
import { DispatchAmbulanceDto } from './dto/dispatch-ambulance.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import {
  AmbulanceStatus,
  DriverStatus,
  DispatchStatus,
  EmergencyStatus,
  RoleCode,
} from '@medinexa/types';

@Injectable()
export class AmbulanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wardService: WardService,
  ) {}

  private getUserRole(user: any): string {
    if (!user) return '';
    if (user.roleCode) return user.roleCode;
    if (typeof user.role === 'string') return user.role;
    if (user.role && user.role.code) return user.role.code;
    return '';
  }

  // =========================================================================
  // 1. FLEET & DRIVERS MANAGEMENT
  // =========================================================================

  async getAmbulances(facilityId?: string) {
    const where: any = {};
    if (facilityId) where.facilityId = facilityId;

    return this.prisma.ambulance.findMany({
      where,
      include: { facility: { select: { name: true, code: true } } },
      orderBy: { vehicleNumber: 'asc' },
    });
  }

  async createAmbulance(dto: CreateAmbulanceDto, requestingUser: any) {
    await this.wardService.validateFacilityAccess(dto.facilityId, requestingUser);

    const existingVeh = await this.prisma.ambulance.findUnique({ where: { vehicleNumber: dto.vehicleNumber } });
    if (existingVeh) {
      throw new ConflictException(`Ambulance with vehicle number '${dto.vehicleNumber}' already exists`);
    }

    const existingReg = await this.prisma.ambulance.findUnique({ where: { registrationNumber: dto.registrationNumber } });
    if (existingReg) {
      throw new ConflictException(`Ambulance with registration '${dto.registrationNumber}' already exists`);
    }

    return this.prisma.ambulance.create({
      data: {
        vehicleNumber: dto.vehicleNumber,
        registrationNumber: dto.registrationNumber,
        ambulanceType: dto.ambulanceType,
        status: AmbulanceStatus.AVAILABLE,
        facilityId: dto.facilityId,
        equipmentSummary: dto.equipmentSummary || null,
      },
    });
  }

  async updateAmbulance(id: string, dto: Partial<CreateAmbulanceDto & { status: AmbulanceStatus }>, requestingUser: any) {
    const amb = await this.prisma.ambulance.findUnique({ where: { id } });
    if (!amb) throw new NotFoundException('Ambulance not found');

    await this.wardService.validateFacilityAccess(amb.facilityId, requestingUser);

    return this.prisma.ambulance.update({
      where: { id },
      data: dto as any,
    });
  }

  async getDrivers(facilityId?: string) {
    const where: any = {};
    if (facilityId) where.facilityId = facilityId;

    return this.prisma.ambulanceDriverProfile.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        facility: { select: { name: true, code: true } },
      },
    });
  }

  async createDriverProfile(dto: CreateDriverDto, requestingUser: any) {
    await this.wardService.validateFacilityAccess(dto.facilityId, requestingUser);

    const existingUser = await this.prisma.ambulanceDriverProfile.findUnique({ where: { userId: dto.userId } });
    if (existingUser) {
      throw new ConflictException('User is already configured as an ambulance driver');
    }

    return this.prisma.ambulanceDriverProfile.create({
      data: {
        userId: dto.userId,
        facilityId: dto.facilityId,
        licenseNumber: dto.licenseNumber,
        licenseExpiry: new Date(dto.licenseExpiry),
        status: DriverStatus.AVAILABLE,
      },
      include: { user: true },
    });
  }

  // =========================================================================
  // 2. CONCURRENCY-PROTECTED AMBULANCE DISPATCH ENGINE
  // =========================================================================

  async dispatchAmbulance(dto: DispatchAmbulanceDto, requestingUser: any) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Check Emergency
      const emg = await tx.emergencyRequest.findUnique({ where: { id: dto.emergencyRequestId } });
      if (!emg) throw new NotFoundException('Emergency request not found');

      // 2. Check Ambulance & Atomic Concurrency Lock
      const amb = await tx.ambulance.findUnique({ where: { id: dto.ambulanceId } });
      if (!amb) throw new NotFoundException('Ambulance not found');

      const updatedAmb = await tx.ambulance.updateMany({
        where: {
          id: dto.ambulanceId,
          status: AmbulanceStatus.AVAILABLE,
        },
        data: {
          status: AmbulanceStatus.DISPATCHED,
        },
      });

      if (updatedAmb.count === 0) {
        throw new ConflictException(`Ambulance '${amb.vehicleNumber}' is unavailable or has already been dispatched.`);
      }

      // 3. Check Driver & Atomic Concurrency Lock
      const driver = await tx.ambulanceDriverProfile.findUnique({ where: { id: dto.driverId } });
      if (!driver) throw new NotFoundException('Ambulance driver not found');

      const updatedDriver = await tx.ambulanceDriverProfile.updateMany({
        where: {
          id: dto.driverId,
          status: { in: [DriverStatus.AVAILABLE, DriverStatus.ON_DUTY] },
        },
        data: {
          status: DriverStatus.ASSIGNED,
        },
      });

      if (updatedDriver.count === 0) {
        throw new ConflictException(`Driver is unavailable or assigned to another active dispatch.`);
      }

      // 4. Create Dispatch & Update States
      const dispatchNumber = `DSP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const dispatch = await tx.ambulanceDispatch.create({
        data: {
          dispatchNumber,
          emergencyRequestId: dto.emergencyRequestId,
          ambulanceId: dto.ambulanceId,
          driverId: dto.driverId,
          dispatchedBy: requestingUser.id,
          status: DispatchStatus.ASSIGNED,
          assignedAt: new Date(),
        },
      });

      await tx.emergencyRequest.update({
        where: { id: dto.emergencyRequestId },
        data: {
          status: EmergencyStatus.AMBULANCE_ASSIGNED,
          dispatchedAt: new Date(),
        },
      });

      return tx.ambulanceDispatch.findUnique({
        where: { id: dispatch.id },
        include: {
          emergencyRequest: true,
          ambulance: true,
          driver: { include: { user: true } },
          dispatcher: { select: { firstName: true, lastName: true } },
        },
      });
    });
  }

  // =========================================================================
  // 3. DISPATCH WORKFLOW LIFECYCLE
  // =========================================================================

  async acceptDispatch(dispatchId: string, requestingUser: any) {
    const dispatch = await this.prisma.ambulanceDispatch.findUnique({
      where: { id: dispatchId },
      include: { driver: true },
    });
    if (!dispatch) throw new NotFoundException('Dispatch not found');

    const roleCode = this.getUserRole(requestingUser);
    if (roleCode === RoleCode.AMBULANCE_DRIVER && dispatch.driver.userId !== requestingUser.id) {
      throw new ForbiddenException('Drivers may only accept dispatches assigned to themselves');
    }

    const now = new Date();
    await this.prisma.ambulanceDispatch.update({
      where: { id: dispatchId },
      data: { status: DispatchStatus.ACCEPTED, acceptedAt: now },
    });

    await this.prisma.ambulance.update({
      where: { id: dispatch.ambulanceId },
      data: { status: AmbulanceStatus.EN_ROUTE },
    });

    await this.prisma.emergencyRequest.update({
      where: { id: dispatch.emergencyRequestId },
      data: { status: EmergencyStatus.EN_ROUTE_TO_PICKUP },
    });

    return this.prisma.ambulanceDispatch.findUnique({
      where: { id: dispatchId },
      include: { ambulance: true, emergencyRequest: true },
    });
  }

  async startDispatch(dispatchId: string, requestingUser: any) {
    return this.acceptDispatch(dispatchId, requestingUser);
  }

  async arriveAtPickup(dispatchId: string, requestingUser: any) {
    const dispatch = await this.prisma.ambulanceDispatch.findUnique({ where: { id: dispatchId } });
    if (!dispatch) throw new NotFoundException('Dispatch not found');

    await this.prisma.ambulanceDispatch.update({
      where: { id: dispatchId },
      data: { status: DispatchStatus.AT_PICKUP },
    });

    await this.prisma.ambulance.update({
      where: { id: dispatch.ambulanceId },
      data: { status: AmbulanceStatus.AT_SCENE },
    });

    await this.prisma.emergencyRequest.update({
      where: { id: dispatch.emergencyRequestId },
      data: { status: EmergencyStatus.AT_PICKUP },
    });

    return this.prisma.ambulanceDispatch.findUnique({
      where: { id: dispatchId },
      include: { ambulance: true, emergencyRequest: true },
    });
  }

  async patientOnboard(dispatchId: string, requestingUser: any) {
    const dispatch = await this.prisma.ambulanceDispatch.findUnique({ where: { id: dispatchId } });
    if (!dispatch) throw new NotFoundException('Dispatch not found');

    await this.prisma.ambulanceDispatch.update({
      where: { id: dispatchId },
      data: { status: DispatchStatus.PATIENT_ONBOARD },
    });

    await this.prisma.ambulance.update({
      where: { id: dispatch.ambulanceId },
      data: { status: AmbulanceStatus.PATIENT_ONBOARD },
    });

    await this.prisma.emergencyRequest.update({
      where: { id: dispatch.emergencyRequestId },
      data: { status: EmergencyStatus.PATIENT_ONBOARD },
    });

    return this.prisma.ambulanceDispatch.findUnique({
      where: { id: dispatchId },
      include: { ambulance: true, emergencyRequest: true },
    });
  }

  async completeDispatch(dispatchId: string, requestingUser: any) {
    return this.prisma.$transaction(async (tx) => {
      const dispatch = await tx.ambulanceDispatch.findUnique({ where: { id: dispatchId } });
      if (!dispatch) throw new NotFoundException('Dispatch not found');

      const now = new Date();
      await tx.ambulanceDispatch.update({
        where: { id: dispatchId },
        data: { status: DispatchStatus.COMPLETED, completedAt: now },
      });

      await tx.ambulance.update({
        where: { id: dispatch.ambulanceId },
        data: { status: AmbulanceStatus.AVAILABLE },
      });

      await tx.ambulanceDriverProfile.update({
        where: { id: dispatch.driverId },
        data: { status: DriverStatus.AVAILABLE },
      });

      await tx.emergencyRequest.update({
        where: { id: dispatch.emergencyRequestId },
        data: { status: EmergencyStatus.ARRIVED_AT_FACILITY },
      });

      return tx.ambulanceDispatch.findUnique({
        where: { id: dispatchId },
        include: { ambulance: true, emergencyRequest: true },
      });
    });
  }

  // =========================================================================
  // 4. GPS LOCATION TELEMETRY
  // =========================================================================

  async updateAmbulanceLocation(ambulanceId: string, dto: UpdateLocationDto, requestingUser: any) {
    const amb = await this.prisma.ambulance.findUnique({ where: { id: ambulanceId } });
    if (!amb) throw new NotFoundException('Ambulance not found');

    const roleCode = this.getUserRole(requestingUser);
    if (roleCode === RoleCode.AMBULANCE_DRIVER) {
      const driver = await this.prisma.ambulanceDriverProfile.findUnique({
        where: { userId: requestingUser.id },
      });
      if (!driver) throw new ForbiddenException('User is not an active ambulance driver');

      const activeDispatch = await this.prisma.ambulanceDispatch.findFirst({
        where: { driverId: driver.id, ambulanceId, status: { in: [DispatchStatus.ASSIGNED, DispatchStatus.ACCEPTED, DispatchStatus.EN_ROUTE, DispatchStatus.AT_PICKUP, DispatchStatus.PATIENT_ONBOARD] } },
      });
      if (!activeDispatch) {
        throw new ForbiddenException('Drivers can only update location for their assigned active ambulance');
      }
    }

    const now = new Date();
    const loc = await this.prisma.ambulanceLocation.create({
      data: {
        ambulanceId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        source: dto.source || 'GPS_SIMULATED',
        recordedAt: now,
      },
    });

    await this.prisma.ambulance.update({
      where: { id: ambulanceId },
      data: {
        currentLatitude: dto.latitude,
        currentLongitude: dto.longitude,
        lastLocationAt: now,
      },
    });

    return loc;
  }

  async getAmbulanceLocation(ambulanceId: string) {
    const amb = await this.prisma.ambulance.findUnique({
      where: { id: ambulanceId },
      select: {
        id: true,
        vehicleNumber: true,
        currentLatitude: true,
        currentLongitude: true,
        lastLocationAt: true,
        status: true,
      },
    });
    if (!amb) throw new NotFoundException('Ambulance not found');
    return amb;
  }

  async getAmbulanceLocationHistory(ambulanceId: string) {
    return this.prisma.ambulanceLocation.findMany({
      where: { ambulanceId },
      orderBy: { recordedAt: 'desc' },
      take: 50,
    });
  }
}
