import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmergencyRequestDto } from './dto/create-emergency.dto';
import { EmergencyStatus, EmergencySeverity, RoleCode } from '@medinexa/types';

@Injectable()
export class EmergencyService {
  constructor(private readonly prisma: PrismaService) {}

  private getUserRole(user: any): string {
    if (!user) return '';
    if (user.roleCode) return user.roleCode;
    if (typeof user.role === 'string') return user.role;
    if (user.role && user.role.code) return user.role.code;
    return '';
  }

  async createEmergency(dto: CreateEmergencyRequestDto, requestingUser?: any) {
    const emergencyNumber = `EMG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.prisma.emergencyRequest.create({
      data: {
        emergencyNumber,
        patientId: dto.patientId || null,
        callerName: dto.callerName,
        callerPhone: dto.callerPhone,
        pickupAddress: dto.pickupAddress,
        pickupLatitude: dto.pickupLatitude || null,
        pickupLongitude: dto.pickupLongitude || null,
        emergencyType: dto.emergencyType,
        severity: dto.severity || EmergencySeverity.MODERATE,
        status: EmergencyStatus.REPORTED,
        sourceFacilityId: dto.sourceFacilityId || null,
        destinationFacilityId: dto.destinationFacilityId || null,
        requestedAt: new Date(),
      },
      include: {
        patient: { include: { user: true } },
        sourceFacility: { select: { name: true, code: true } },
        destinationFacility: { select: { name: true, code: true } },
        dispatches: { include: { ambulance: true, driver: { include: { user: true } } } },
      },
    });
  }

  async getEmergencies(filters: { facilityId?: string; status?: EmergencyStatus }) {
    const where: any = {};
    if (filters.facilityId) {
      where.OR = [
        { sourceFacilityId: filters.facilityId },
        { destinationFacilityId: filters.facilityId },
      ];
    }
    if (filters.status) where.status = filters.status;

    return this.prisma.emergencyRequest.findMany({
      where,
      include: {
        patient: { include: { user: true } },
        sourceFacility: { select: { name: true, code: true } },
        destinationFacility: { select: { name: true, code: true } },
        dispatches: { include: { ambulance: true, driver: { include: { user: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEmergencyById(id: string) {
    const emg = await this.prisma.emergencyRequest.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        sourceFacility: { select: { name: true, code: true } },
        destinationFacility: { select: { name: true, code: true } },
        dispatches: { include: { ambulance: true, driver: { include: { user: true } } } },
        referrals: true,
      },
    });
    if (!emg) throw new NotFoundException(`Emergency request '${id}' not found`);
    return emg;
  }

  async triageEmergency(id: string, severity: EmergencySeverity, requestingUser: any) {
    const emg = await this.getEmergencyById(id);
    if (emg.status === EmergencyStatus.CLOSED || emg.status === EmergencyStatus.CANCELLED) {
      throw new BadRequestException(`Cannot triage an emergency in state '${emg.status}'`);
    }

    return this.prisma.emergencyRequest.update({
      where: { id },
      data: {
        severity,
        status: EmergencyStatus.TRIAGED,
      },
      include: { patient: { include: { user: true } } },
    });
  }

  async updateEmergencyStatus(id: string, nextStatus: EmergencyStatus, requestingUser: any) {
    const emg = await this.getEmergencyById(id);

    const validTransitions: Record<EmergencyStatus, EmergencyStatus[]> = {
      [EmergencyStatus.REPORTED]: [EmergencyStatus.TRIAGED, EmergencyStatus.DISPATCH_REQUESTED, EmergencyStatus.CANCELLED],
      [EmergencyStatus.TRIAGED]: [EmergencyStatus.DISPATCH_REQUESTED, EmergencyStatus.AMBULANCE_ASSIGNED, EmergencyStatus.CANCELLED],
      [EmergencyStatus.DISPATCH_REQUESTED]: [EmergencyStatus.AMBULANCE_ASSIGNED, EmergencyStatus.CANCELLED],
      [EmergencyStatus.AMBULANCE_ASSIGNED]: [EmergencyStatus.EN_ROUTE_TO_PICKUP, EmergencyStatus.CANCELLED],
      [EmergencyStatus.EN_ROUTE_TO_PICKUP]: [EmergencyStatus.AT_PICKUP, EmergencyStatus.CANCELLED],
      [EmergencyStatus.AT_PICKUP]: [EmergencyStatus.PATIENT_ONBOARD, EmergencyStatus.CANCELLED],
      [EmergencyStatus.PATIENT_ONBOARD]: [EmergencyStatus.ARRIVED_AT_FACILITY, EmergencyStatus.CANCELLED],
      [EmergencyStatus.ARRIVED_AT_FACILITY]: [EmergencyStatus.CLOSED],
      [EmergencyStatus.CANCELLED]: [],
      [EmergencyStatus.CLOSED]: [],
    };

    const allowed = validTransitions[emg.status as EmergencyStatus] || [];
    if (!allowed.includes(nextStatus)) {
      throw new BadRequestException(
        `Invalid emergency status transition from '${emg.status}' to '${nextStatus}'.`,
      );
    }

    const updateData: any = { status: nextStatus };
    if (nextStatus === EmergencyStatus.CLOSED || nextStatus === EmergencyStatus.CANCELLED) {
      updateData.resolvedAt = new Date();
    }

    return this.prisma.emergencyRequest.update({
      where: { id },
      data: updateData,
      include: {
        patient: { include: { user: true } },
        dispatches: { include: { ambulance: true } },
      },
    });
  }

  async cancelEmergency(id: string, requestingUser: any) {
    return this.updateEmergencyStatus(id, EmergencyStatus.CANCELLED, requestingUser);
  }

  async getPatientEmergencies(patientId: string, requestingUser: any) {
    const roleCode = this.getUserRole(requestingUser);
    if (roleCode === RoleCode.PATIENT) {
      if (!requestingUser.patientProfile || requestingUser.patientProfile.id !== patientId) {
        throw new ForbiddenException('Patients can only view their own emergency records');
      }
    }

    return this.prisma.emergencyRequest.findMany({
      where: { patientId },
      include: {
        dispatches: { include: { ambulance: true } },
        destinationFacility: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
