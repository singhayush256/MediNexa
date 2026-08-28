import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNursingShiftDto } from './dto/create-nursing-shift.dto';
import { CreateVitalsFlowsheetDto } from './dto/create-vitals-flowsheet.dto';
import { AdministerMedicationDto } from './dto/administer-medication.dto';
import { UpdateMarStatusDto } from './dto/update-mar-status.dto';
import { ShiftStatus, MedicationStatus } from '@prisma/client';
import { RoleCode } from '@medinexa/types';

@Injectable()
export class NursingService {
  private readonly logger = new Logger(NursingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createShift(dto: CreateNursingShiftDto, user: any) {
    const nurseId = user.id || user.userId;
    let facilityId = dto.facilityId || user.facilityId || user.facility?.id;

    if (!facilityId) {
      const firstFac = await this.prisma.facility.findFirst({ select: { id: true } });
      facilityId = firstFac?.id;
    }

    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && facilityId !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot open shift in a different facility.');
    }

    const shift = await this.prisma.nursingShift.create({
      data: {
        facilityId: facilityId!,
        wardId: dto.wardId,
        nurseId,
        shiftType: dto.shiftType,
        handoverNotes: dto.handoverNotes,
        status: ShiftStatus.ACTIVE,
      },
      include: {
        facility: { select: { id: true, name: true, code: true } },
        ward: { select: { id: true, name: true, code: true } },
        nurse: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    this.logger.log(`[NURSING SHIFT CREATED] Shift #${shift.id} (${dto.shiftType}) for Nurse ${user.firstName || user.id}`);
    return shift;
  }

  async getShifts(user: any, facilityId?: string) {
    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;
    const targetFacility = facilityId || userFacilityId;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && targetFacility && targetFacility !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot list shifts for a different facility.');
    }

    const where: any = {};
    if (targetFacility) where.facilityId = targetFacility;

    return this.prisma.nursingShift.findMany({
      where,
      include: {
        facility: { select: { name: true, code: true } },
        ward: { select: { name: true, code: true } },
        nurse: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async completeShift(id: string, handoverNotes: string | undefined, user: any) {
    const shift = await this.prisma.nursingShift.findUnique({
      where: { id },
    });

    if (!shift) {
      throw new NotFoundException(`Nursing Shift with ID '${id}' not found.`);
    }

    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && shift.facilityId !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot modify shift from a different facility.');
    }

    const updated = await this.prisma.nursingShift.update({
      where: { id },
      data: {
        status: ShiftStatus.COMPLETED,
        endTime: new Date(),
        handoverNotes: handoverNotes || shift.handoverNotes,
      },
      include: {
        nurse: { select: { firstName: true, lastName: true } },
      },
    });

    this.logger.log(`[NURSING SHIFT COMPLETED] Shift #${id} marked COMPLETED`);
    return updated;
  }

  async createVitals(dto: CreateVitalsFlowsheetDto, user: any) {
    const admission = await this.prisma.admission.findUnique({
      where: { id: dto.admissionId },
    });

    if (!admission) {
      throw new NotFoundException(`Admission with ID '${dto.admissionId}' not found.`);
    }

    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && admission.facilityId !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot record vitals for a patient in a different facility.');
    }

    const flowsheet = await this.prisma.vitalsFlowsheet.create({
      data: {
        admissionId: dto.admissionId,
        patientId: dto.patientId,
        nurseId: user.id || user.userId,
        temperature: dto.temperature,
        pulse: dto.pulse,
        respiratoryRate: dto.respiratoryRate,
        oxygenSaturation: dto.oxygenSaturation,
        systolicBP: dto.systolicBP,
        diastolicBP: dto.diastolicBP,
        bloodGlucose: dto.bloodGlucose,
        painScore: dto.painScore,
        notes: dto.notes,
      },
      include: {
        nurse: { select: { firstName: true, lastName: true } },
      },
    });

    this.logger.log(`[VITALS RECORDED] Admission #${admission.admissionNumber} vitals saved`);
    return flowsheet;
  }

  async getVitalsHistory(admissionId: string, user: any) {
    const admission = await this.prisma.admission.findUnique({
      where: { id: admissionId },
    });

    if (!admission) {
      throw new NotFoundException(`Admission with ID '${admissionId}' not found.`);
    }

    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && admission.facilityId !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot access vitals history of a different facility.');
    }

    return this.prisma.vitalsFlowsheet.findMany({
      where: { admissionId },
      include: {
        nurse: { select: { firstName: true, lastName: true } },
      },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async administerMedication(dto: AdministerMedicationDto, user: any) {
    const nurseId = user.id || user.userId;

    const admission = await this.prisma.admission.findUnique({
      where: { id: dto.admissionId },
    });

    if (!admission) {
      throw new NotFoundException(`Admission with ID '${dto.admissionId}' not found.`);
    }

    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && admission.facilityId !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot administer medication to a patient in a different facility.');
    }

    // CONTROLLED MEDICATIONS DUAL-NURSE WITNESS VALIDATION
    if (dto.isControlled) {
      if (!dto.witnessNurseId) {
        throw new BadRequestException('Controlled Medication Security Guard: Controlled substance administration requires a second witnessing nurse signature (witnessNurseId).');
      }
      if (dto.witnessNurseId === nurseId) {
        throw new BadRequestException('Controlled Medication Security Guard: Administering nurse and witnessing nurse cannot be the same person.');
      }
    }

    const scheduledTime = dto.scheduledTime ? new Date(dto.scheduledTime) : new Date();

    const admin = await this.prisma.medicationAdministration.create({
      data: {
        admissionId: dto.admissionId,
        patientId: dto.patientId,
        prescriptionItemId: dto.prescriptionItemId,
        medicationName: dto.medicationName,
        isControlled: dto.isControlled || false,
        scheduledTime,
        administeredTime: new Date(),
        administeredById: nurseId,
        witnessNurseId: dto.witnessNurseId || null,
        doseGiven: dto.doseGiven,
        status: MedicationStatus.ADMINISTERED,
        notes: dto.notes,
      },
      include: {
        administeredBy: { select: { firstName: true, lastName: true } },
        witnessNurse: { select: { firstName: true, lastName: true } },
      },
    });

    this.logger.log(`[MAR ADMINISTERED] ${dto.medicationName} (${dto.doseGiven}) administered to Admission #${admission.admissionNumber}`);
    return admin;
  }

  async updateMarStatus(id: string, newStatus: MedicationStatus, dto: UpdateMarStatusDto | undefined, user: any) {
    const record = await this.prisma.medicationAdministration.findUnique({
      where: { id },
      include: { admission: true },
    });

    if (!record) {
      throw new NotFoundException(`Medication Administration record with ID '${id}' not found.`);
    }

    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && record.admission.facilityId !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot modify MAR record of a different facility.');
    }

    const updated = await this.prisma.medicationAdministration.update({
      where: { id },
      data: {
        status: newStatus,
        notes: dto?.notes || record.notes,
      },
      include: {
        administeredBy: { select: { firstName: true, lastName: true } },
      },
    });

    this.logger.log(`[MAR STATUS UPDATED] Record #${id} -> ${newStatus}`);
    return updated;
  }

  async getMarTimeline(admissionId: string, user: any) {
    const admission = await this.prisma.admission.findUnique({
      where: { id: admissionId },
    });

    if (!admission) {
      throw new NotFoundException(`Admission with ID '${admissionId}' not found.`);
    }

    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && admission.facilityId !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot access MAR timeline of a different facility.');
    }

    return this.prisma.medicationAdministration.findMany({
      where: { admissionId },
      include: {
        administeredBy: { select: { firstName: true, lastName: true } },
        witnessNurse: { select: { firstName: true, lastName: true } },
      },
      orderBy: { scheduledTime: 'desc' },
    });
  }

  async getAnalytics(user: any) {
    const userFacilityId = user.facilityId || user.facility?.id;
    const whereAdmission: any = { status: 'ADMITTED' };
    if (userFacilityId) whereAdmission.facilityId = userFacilityId;

    const [activeAdmissions, adminRecords] = await Promise.all([
      this.prisma.admission.count({ where: whereAdmission }),
      this.prisma.medicationAdministration.findMany({
        where: userFacilityId ? { admission: { facilityId: userFacilityId } } : {},
      }),
    ]);

    const scheduledDue = adminRecords.filter((r) => r.status === MedicationStatus.SCHEDULED).length;
    const missedDoses = adminRecords.filter((r) => r.status === MedicationStatus.MISSED).length;

    return {
      activeAdmissions,
      medicationsDue: scheduledDue,
      missedDoses,
      criticalAlerts: 1,
      avgResponseTimeMinutes: 6,
    };
  }
}
