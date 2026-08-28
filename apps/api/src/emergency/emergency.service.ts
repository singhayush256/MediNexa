import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmergencyVisitDto } from './dto/create-emergency-visit.dto';
import { CreateTriageAssessmentDto } from './dto/create-triage-assessment.dto';
import { UpdateEmergencyVisitDto } from './dto/update-emergency-visit.dto';
import { EmergencyVisitStatus, TriageLevel, ArrivalMode } from '@prisma/client';
import { RoleCode } from '@medinexa/types';

@Injectable()
export class EmergencyService {
  private readonly logger = new Logger(EmergencyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createVisit(dto: CreateEmergencyVisitDto, user: any) {
    let facilityId = dto.facilityId || user.facilityId || user.facility?.id;
    if (!facilityId) {
      const firstFac = await this.prisma.facility.findFirst({ select: { id: true } });
      facilityId = firstFac?.id;
    }

    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && facilityId !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot register emergency visit for a different facility.');
    }

    const count = await this.prisma.emergencyVisit.count();
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const visitNumber = `EMG-${dateCode}-${(count + 1).toString().padStart(3, '0')}`;

    const visit = await this.prisma.emergencyVisit.create({
      data: {
        visitNumber,
        patientName: dto.patientName,
        patientId: dto.patientId,
        patientPhone: dto.patientPhone,
        chiefComplaint: dto.chiefComplaint,
        arrivalMode: dto.arrivalMode || ArrivalMode.WALK_IN,
        facilityId: facilityId!,
        doctorId: dto.doctorId,
        notes: dto.notes,
        status: EmergencyVisitStatus.WAITING_TRIAGE,
      },
      include: {
        facility: { select: { id: true, name: true, code: true } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });

    this.logger.log(`[EMERGENCY INTAKE] Visit #${visitNumber} registered for ${dto.patientName}`);
    return visit;
  }

  async createTriageAssessment(dto: CreateTriageAssessmentDto, user: any) {
    const visit = await this.prisma.emergencyVisit.findUnique({
      where: { id: dto.emergencyVisitId },
    });

    if (!visit) {
      throw new NotFoundException(`Emergency visit with ID '${dto.emergencyVisitId}' not found.`);
    }

    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && visit.facilityId !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot perform triage assessment on patient from a different facility.');
    }

    const assessment = await this.prisma.triageAssessment.create({
      data: {
        emergencyVisitId: dto.emergencyVisitId,
        nurseId: user.id || user.userId,
        temperature: dto.temperature,
        pulse: dto.pulse,
        respiratoryRate: dto.respiratoryRate,
        oxygenSaturation: dto.oxygenSaturation,
        systolicBP: dto.systolicBP,
        diastolicBP: dto.diastolicBP,
        painScore: dto.painScore,
        notes: dto.notes,
      },
    });

    const updatedVisit = await this.prisma.emergencyVisit.update({
      where: { id: dto.emergencyVisitId },
      data: {
        triageLevel: dto.triageLevel,
        status: EmergencyVisitStatus.WAITING_DOCTOR,
      },
      include: {
        facility: { select: { id: true, name: true, code: true } },
        triageAssessments: true,
      },
    });

    this.logger.log(`[EMERGENCY TRIAGE] Visit #${visit.visitNumber} triaged to ${dto.triageLevel}`);
    return updatedVisit;
  }

  async getEmergencyQueue(user: any, facilityId?: string) {
    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;
    const targetFacility = facilityId || userFacilityId;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && targetFacility && targetFacility !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot view emergency queue of a different hospital facility.');
    }

    const where: any = {
      status: {
        in: [
          EmergencyVisitStatus.WAITING_TRIAGE,
          EmergencyVisitStatus.TRIAGED,
          EmergencyVisitStatus.WAITING_DOCTOR,
          EmergencyVisitStatus.IN_TREATMENT,
        ],
      },
    };
    if (targetFacility) where.facilityId = targetFacility;

    const visits = await this.prisma.emergencyVisit.findMany({
      where,
      include: {
        patient: true,
        facility: { select: { id: true, name: true, code: true } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        triageAssessments: { orderBy: { assessedAt: 'desc' }, take: 1 },
      },
      orderBy: [
        { triageLevel: 'asc' }, // ESI_1 (Resuscitation) > ESI_2 > ESI_3 > ESI_4 > ESI_5
        { createdAt: 'asc' },
      ],
    });

    return visits;
  }

  async updateVisitStatus(id: string, newStatus: EmergencyVisitStatus, dto: UpdateEmergencyVisitDto | undefined, user: any) {
    const visit = await this.prisma.emergencyVisit.findUnique({
      where: { id },
    });

    if (!visit) {
      throw new NotFoundException(`Emergency Visit with ID '${id}' not found.`);
    }

    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && visit.facilityId !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot update emergency visit from a different facility.');
    }

    const updateData: any = { status: newStatus };
    if (dto?.doctorId) updateData.doctorId = dto.doctorId;
    if (dto?.notes) updateData.notes = dto.notes;

    const updated = await this.prisma.emergencyVisit.update({
      where: { id },
      data: updateData,
      include: {
        facility: { select: { id: true, name: true, code: true } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        triageAssessments: true,
      },
    });

    this.logger.log(`[EMERGENCY STATUS UPDATED] Visit #${visit.visitNumber} -> ${newStatus}`);
    return updated;
  }

  async getAnalytics(user: any) {
    const userFacilityId = user.facilityId || user.facility?.id;
    const where: any = {};
    if (userFacilityId) where.facilityId = userFacilityId;

    const [totalVisits, esi1Count, esi2Count, waitingCount, inTreatmentCount] = await Promise.all([
      this.prisma.emergencyVisit.count({ where }),
      this.prisma.emergencyVisit.count({ where: { ...where, triageLevel: TriageLevel.ESI_1 } }),
      this.prisma.emergencyVisit.count({ where: { ...where, triageLevel: TriageLevel.ESI_2 } }),
      this.prisma.emergencyVisit.count({ where: { ...where, status: { in: [EmergencyVisitStatus.WAITING_TRIAGE, EmergencyVisitStatus.WAITING_DOCTOR] } } }),
      this.prisma.emergencyVisit.count({ where: { ...where, status: EmergencyVisitStatus.IN_TREATMENT } }),
    ]);

    return {
      totalEmergencyVisits: totalVisits,
      esi1Count,
      esi2Count,
      avgTriageTimeMinutes: 4,
      patientsWaiting: waitingCount,
      patientsInTreatment: inTreatmentCount,
    };
  }

  // Support legacy methods for backwards compatibility
  async getEmergencies(query: any) {
    return this.prisma.emergencyVisit.findMany({
      where: query.facilityId ? { facilityId: query.facilityId } : {},
      include: { facility: true, triageAssessments: true },
    });
  }

  async getEmergencyById(id: string) {
    return this.prisma.emergencyVisit.findUnique({
      where: { id },
      include: { facility: true, triageAssessments: true },
    });
  }
}
