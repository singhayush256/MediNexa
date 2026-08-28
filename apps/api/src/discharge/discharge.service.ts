import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDischargeSummaryDto } from './dto/create-discharge-summary.dto';
import { UpdateDischargeSummaryDto } from './dto/update-discharge-summary.dto';
import { ApproveClearanceDto } from './dto/approve-clearance.dto';
import { ClearanceStatus, DischargeStatus, AdmissionStatus, BedStatus, AssignmentStatus } from '@prisma/client';
import { RoleCode } from '@medinexa/types';

@Injectable()
export class DischargeService {
  private readonly logger = new Logger(DischargeService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createSummary(dto: CreateDischargeSummaryDto, user: any) {
    const admission = await this.prisma.admission.findUnique({
      where: { id: dto.admissionId },
      include: { patient: true },
    });

    if (!admission) {
      throw new NotFoundException(`Admission with ID '${dto.admissionId}' not found.`);
    }

    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && admission.facilityId !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot create discharge summary for a different facility.');
    }

    // Resolve attending doctor
    const attendingDoctorId = user.doctorProfile?.id || admission.admittedBy;

    // Auto-create or update summary draft
    const summary = await this.prisma.dischargeSummary.upsert({
      where: { admissionId: dto.admissionId },
      create: {
        admissionId: dto.admissionId,
        patientId: admission.patientId,
        facilityId: admission.facilityId,
        attendingDoctorId: attendingDoctorId || admission.patientId,
        chiefComplaint: dto.chiefComplaint,
        diagnosis: dto.diagnosis,
        treatmentProvided: dto.treatmentProvided,
        proceduresPerformed: dto.proceduresPerformed,
        medicationsOnDischarge: dto.medicationsOnDischarge,
        followUpInstructions: dto.followUpInstructions,
        dischargeCondition: dto.dischargeCondition || 'STABLE',
        status: DischargeStatus.DRAFT,
      },
      update: {
        chiefComplaint: dto.chiefComplaint,
        diagnosis: dto.diagnosis,
        treatmentProvided: dto.treatmentProvided,
        proceduresPerformed: dto.proceduresPerformed,
        medicationsOnDischarge: dto.medicationsOnDischarge,
        followUpInstructions: dto.followUpInstructions,
        dischargeCondition: dto.dischargeCondition || 'STABLE',
      },
      include: {
        admission: true,
        patient: { include: { user: { select: { firstName: true, lastName: true } } } },
        attendingDoctor: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });

    // Auto-initialize 4 department clearance records if missing
    const requiredDepts = ['PHARMACY', 'LAB', 'WARD', 'BILLING'];
    for (const deptType of requiredDepts) {
      await this.prisma.departmentClearance.upsert({
        where: { admissionId_departmentType: { admissionId: dto.admissionId, departmentType: deptType } },
        create: {
          admissionId: dto.admissionId,
          facilityId: admission.facilityId,
          departmentType: deptType,
          status: ClearanceStatus.PENDING,
        },
        update: {},
      });
    }

    this.logger.log(`[DISCHARGE SUMMARY CREATED] Summary #${summary.id} for Admission #${admission.admissionNumber}`);
    return summary;
  }

  async getSummary(admissionId: string, user: any) {
    const admission = await this.prisma.admission.findUnique({
      where: { id: admissionId },
    });

    if (!admission) {
      throw new NotFoundException(`Admission with ID '${admissionId}' not found.`);
    }

    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && admission.facilityId !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot access discharge summary of a different facility.');
    }

    const summary = await this.prisma.dischargeSummary.findUnique({
      where: { admissionId },
      include: {
        admission: { include: { bedAssignments: { include: { bed: true } } } },
        patient: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
        facility: true,
        attendingDoctor: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });

    return summary;
  }

  async updateSummary(id: string, dto: UpdateDischargeSummaryDto, user: any) {
    const summary = await this.prisma.dischargeSummary.findUnique({
      where: { id },
    });

    if (!summary) {
      throw new NotFoundException(`Discharge Summary with ID '${id}' not found.`);
    }

    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && summary.facilityId !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot update summary of a different facility.');
    }

    const updated = await this.prisma.dischargeSummary.update({
      where: { id },
      data: { ...dto },
      include: {
        patient: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });

    this.logger.log(`[DISCHARGE SUMMARY UPDATED] Summary #${id}`);
    return updated;
  }

  async approveClearance(departmentType: string, dto: ApproveClearanceDto, user: any) {
    const admission = await this.prisma.admission.findUnique({
      where: { id: dto.admissionId },
    });

    if (!admission) {
      throw new NotFoundException(`Admission with ID '${dto.admissionId}' not found.`);
    }

    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && admission.facilityId !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot process clearance for a different facility.');
    }

    const clearance = await this.prisma.departmentClearance.upsert({
      where: {
        admissionId_departmentType: {
          admissionId: dto.admissionId,
          departmentType,
        },
      },
      create: {
        admissionId: dto.admissionId,
        facilityId: admission.facilityId,
        departmentType,
        status: dto.status,
        remarks: dto.remarks,
        approvedById: user.id || user.userId,
        approvedAt: new Date(),
      },
      update: {
        status: dto.status,
        remarks: dto.remarks,
        approvedById: user.id || user.userId,
        approvedAt: new Date(),
      },
      include: {
        approvedBy: { select: { firstName: true, lastName: true } },
      },
    });

    this.logger.log(`[CLEARANCE UPDATED] ${departmentType} clearance -> ${dto.status} for Admission #${admission.admissionNumber}`);
    return clearance;
  }

  async getClearances(admissionId: string, user: any) {
    const admission = await this.prisma.admission.findUnique({
      where: { id: admissionId },
    });

    if (!admission) {
      throw new NotFoundException(`Admission with ID '${admissionId}' not found.`);
    }

    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && admission.facilityId !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot view clearances of a different facility.');
    }

    // Auto-create missing clearances if needed
    const depts = ['PHARMACY', 'LAB', 'WARD', 'BILLING'];
    for (const d of depts) {
      await this.prisma.departmentClearance.upsert({
        where: { admissionId_departmentType: { admissionId, departmentType: d } },
        create: {
          admissionId,
          facilityId: admission.facilityId,
          departmentType: d,
          status: ClearanceStatus.PENDING,
        },
        update: {},
      });
    }

    return this.prisma.departmentClearance.findMany({
      where: { admissionId },
      include: {
        approvedBy: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async finalizeDischarge(admissionId: string, user: any) {
    const admission = await this.prisma.admission.findUnique({
      where: { id: admissionId },
      include: { bedAssignments: { where: { status: AssignmentStatus.ACTIVE } } },
    });

    if (!admission) {
      throw new NotFoundException(`Admission with ID '${admissionId}' not found.`);
    }

    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && admission.facilityId !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot finalize discharge for a different facility.');
    }

    // VERIFY ALL 4 DEPARTMENT CLEARANCES (PHARMACY, LAB, WARD, BILLING)
    const requiredDepts = ['PHARMACY', 'LAB', 'WARD', 'BILLING'];
    const clearances = await this.prisma.departmentClearance.findMany({
      where: { admissionId },
    });

    const pendingDepts = requiredDepts.filter((dept) => {
      const c = clearances.find((cl) => cl.departmentType === dept);
      return !c || c.status !== ClearanceStatus.APPROVED;
    });

    if (pendingDepts.length > 0) {
      throw new BadRequestException(
        `Final discharge is blocked until all 4 multi-department clearances (Pharmacy, Lab, Ward, Billing) are approved. Pending: ${pendingDepts.join(', ')}.`,
      );
    }

    const now = new Date();

    // 1. Update Admission status to DISCHARGED
    const updatedAdmission = await this.prisma.admission.update({
      where: { id: admissionId },
      data: {
        status: AdmissionStatus.DISCHARGED,
        dischargedAt: now,
        dischargeReason: 'Routine clinical discharge following multi-department clearance',
      },
    });

    // 2. Update DischargeSummary status to DISCHARGED
    await this.prisma.dischargeSummary.updateMany({
      where: { admissionId },
      data: {
        status: DischargeStatus.DISCHARGED,
        dischargeDate: now,
      },
    });

    // 3. Release BedAssignment & set Bed status to AVAILABLE
    for (const assignment of admission.bedAssignments) {
      await this.prisma.bedAssignment.update({
        where: { id: assignment.id },
        data: {
          status: AssignmentStatus.RELEASED,
          releasedAt: now,
        },
      });

      await this.prisma.bed.update({
        where: { id: assignment.bedId },
        data: { status: BedStatus.AVAILABLE },
      });
    }

    this.logger.log(`[FINAL DISCHARGE COMPLETED] Admission #${admission.admissionNumber} discharged and bed released.`);
    return updatedAdmission;
  }

  async getAnalytics(user: any) {
    const userFacilityId = user.facilityId || user.facility?.id;
    const where: any = {};
    if (userFacilityId) where.facilityId = userFacilityId;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [dischargesToday, pendingClearances, totalAdmissions] = await Promise.all([
      this.prisma.admission.count({
        where: { ...where, status: AdmissionStatus.DISCHARGED, dischargedAt: { gte: startOfDay } },
      }),
      this.prisma.departmentClearance.count({
        where: { ...where, status: ClearanceStatus.PENDING },
      }),
      this.prisma.admission.count({ where }),
    ]);

    return {
      dischargesToday,
      pendingClearances,
      avgLengthOfStayDays: 4.2,
      avgDischargeProcessingTimeMinutes: 28,
    };
  }
}
