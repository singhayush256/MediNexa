import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WardService } from '../ward/ward.service';
import { BedService } from '../bed/bed.service';
import { BedGateway } from '../bed/events/bed.gateway';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { DischargeAdmissionDto } from './dto/discharge-admission.dto';
import { TransferAdmissionDto } from './dto/transfer-admission.dto';
import { UpdateAdmissionStatusDto } from './dto/update-admission-status.dto';
import { AdmissionStatus, AdmissionType, AssignmentStatus, BedStatus } from '@medinexa/types';

@Injectable()
export class AdmissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wardService: WardService,
    private readonly bedService: BedService,
    private readonly bedGateway: BedGateway,
  ) {}

  async createAdmission(dto: CreateAdmissionDto, requestingUser: any) {
    // 1. Verify patient profile exists
    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: dto.patientId },
      include: { user: true },
    });
    if (!patient) {
      throw new NotFoundException(`Patient profile with ID '${dto.patientId}' not found`);
    }

    // 2. Multi-hospital security check
    await this.wardService.validateFacilityAccess(dto.facilityId, requestingUser);

    const facility = await this.prisma.facility.findUnique({
      where: { id: dto.facilityId },
    });
    if (!facility) {
      throw new NotFoundException(`Facility with ID '${dto.facilityId}' not found`);
    }

    // 3. Verify department belongs to facility
    const department = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });
    if (!department) {
      throw new NotFoundException(`Department with ID '${dto.departmentId}' not found`);
    }
    if (department.facilityId !== dto.facilityId) {
      throw new BadRequestException(
        `Department '${department.name}' does not belong to facility '${dto.facilityId}'`,
      );
    }

    // 4. Check active admission rule: Patient cannot have active admission at facility
    const existingActive = await this.prisma.admission.findFirst({
      where: {
        patientId: dto.patientId,
        facilityId: dto.facilityId,
        status: {
          in: [
            AdmissionStatus.PLANNED,
            AdmissionStatus.ADMITTED,
            AdmissionStatus.TRANSFERRED,
            AdmissionStatus.DISCHARGE_PENDING,
          ],
        },
      },
    });
    if (existingActive) {
      throw new ConflictException(
        `Patient '${patient.user.firstName} ${patient.user.lastName}' already has an active admission ('${existingActive.admissionNumber}') at this facility.`,
      );
    }

    // 5. Generate unique admission number
    const admissionNumber = `ADM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const initialStatus = dto.bedId ? AdmissionStatus.ADMITTED : AdmissionStatus.PLANNED;

    // 6. ATOMIC TRANSACTION: Admission creation + Bed Assignment
    const admission = await this.prisma.$transaction(async (tx) => {
      const newAdm = await tx.admission.create({
        data: {
          patientId: dto.patientId,
          facilityId: dto.facilityId,
          departmentId: dto.departmentId,
          admissionNumber,
          admissionType: dto.admissionType,
          status: initialStatus,
          admittedBy: requestingUser.id,
          expectedDischargeAt: dto.expectedDischargeAt ? new Date(dto.expectedDischargeAt) : null,
          reason: dto.reason || null,
        },
      });

      await tx.admissionStatusHistory.create({
        data: {
          admissionId: newAdm.id,
          previousStatus: AdmissionStatus.PLANNED,
          newStatus: initialStatus,
          changedBy: requestingUser.id,
          reason: dto.reason || 'Initial admission created',
        },
      });

      return newAdm;
    });

    // 7. Assign bed if specified (utilizing BedService for state locking and history)
    if (dto.bedId) {
      const assignment = await this.bedService.assignBed(
        dto.bedId,
        {
          patientId: dto.patientId,
          reason: `Admitted under ${admissionNumber}`,
        },
        requestingUser,
      );

      await this.prisma.bedAssignment.update({
        where: { id: assignment.id },
        data: { admissionId: admission.id },
      });
    }

    return this.getAdmissionById(admission.id);
  }

  async getAdmissions(filters: {
    facilityId?: string;
    departmentId?: string;
    status?: AdmissionStatus;
    admissionType?: AdmissionType;
    patientId?: string;
  }) {
    const where: any = {};
    if (filters.facilityId) where.facilityId = filters.facilityId;
    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.status) where.status = filters.status;
    if (filters.admissionType) where.admissionType = filters.admissionType;
    if (filters.patientId) where.patientId = filters.patientId;

    const admissions = await this.prisma.admission.findMany({
      where,
      include: {
        patient: { include: { user: true } },
        facility: { select: { id: true, name: true, code: true } },
        department: { select: { id: true, name: true, code: true } },
        admitter: { select: { id: true, firstName: true, lastName: true, email: true } },
        bedAssignments: {
          where: { status: AssignmentStatus.ACTIVE },
          include: {
            bed: {
              include: {
                room: true,
                ward: true,
              },
            },
          },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return admissions.map((adm) => ({
      ...adm,
      currentAssignment: adm.bedAssignments[0] || null,
    }));
  }

  async getAdmissionById(id: string) {
    const adm = await this.prisma.admission.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        facility: { select: { id: true, name: true, code: true } },
        department: { select: { id: true, name: true, code: true } },
        admitter: { select: { id: true, firstName: true, lastName: true, email: true } },
        bedAssignments: {
          include: {
            bed: {
              include: {
                room: true,
                ward: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        transfers: {
          include: {
            fromBed: { include: { room: true, ward: true } },
            toBed: { include: { room: true, ward: true } },
            transferrer: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: {
          include: {
            changer: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!adm) {
      throw new NotFoundException(`Admission with ID '${id}' not found`);
    }

    const activeAssignment = adm.bedAssignments.find((a) => a.status === AssignmentStatus.ACTIVE) || null;

    return {
      ...adm,
      currentAssignment: activeAssignment,
    };
  }

  async getAdmissionCurrentBed(id: string) {
    const adm = await this.getAdmissionById(id);
    return adm.currentAssignment ? adm.currentAssignment.bed : null;
  }

  async getPatientAdmissions(patientId: string) {
    return this.prisma.admission.findMany({
      where: { patientId },
      include: {
        facility: { select: { id: true, name: true, code: true } },
        department: { select: { id: true, name: true, code: true } },
        bedAssignments: {
          where: { status: AssignmentStatus.ACTIVE },
          include: {
            bed: { include: { room: true, ward: true } },
          },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFacilityAdmissions(facilityId: string) {
    return this.getAdmissions({ facilityId });
  }

  async updateAdmissionStatus(id: string, dto: UpdateAdmissionStatusDto, requestingUser: any) {
    const adm = await this.getAdmissionById(id);
    await this.wardService.validateFacilityAccess(adm.facilityId, requestingUser);

    if (adm.status === AdmissionStatus.DISCHARGED && dto.status === AdmissionStatus.ADMITTED) {
      throw new ConflictException(
        'Cannot transition DISCHARGED admission back to ADMITTED. Create a new admission instead.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.admission.update({
        where: { id },
        data: { status: dto.status },
      });

      await tx.admissionStatusHistory.create({
        data: {
          admissionId: id,
          previousStatus: adm.status as AdmissionStatus,
          newStatus: dto.status,
          changedBy: requestingUser.id,
          reason: dto.reason || 'Status updated',
        },
      });

      return updated;
    });
  }

  async dischargeAdmission(id: string, dto: DischargeAdmissionDto, requestingUser: any) {
    const adm = await this.getAdmissionById(id);
    await this.wardService.validateFacilityAccess(adm.facilityId, requestingUser);

    if (
      adm.status === AdmissionStatus.DISCHARGED ||
      adm.status === AdmissionStatus.CANCELLED
    ) {
      throw new ConflictException(
        `Admission '${adm.admissionNumber}' is already '${adm.status}' and cannot be discharged again.`,
      );
    }

    if (adm.status === AdmissionStatus.PLANNED) {
      throw new BadRequestException(
        `Planned admission '${adm.admissionNumber}' has not been admitted yet.`,
      );
    }

    // 1. Update Admission status to DISCHARGED
    const dischargedAdmission = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.admission.update({
        where: { id },
        data: {
          status: AdmissionStatus.DISCHARGED,
          dischargedAt: new Date(),
          dischargeReason: dto.dischargeReason,
        },
      });

      await tx.admissionStatusHistory.create({
        data: {
          admissionId: id,
          previousStatus: adm.status as AdmissionStatus,
          newStatus: AdmissionStatus.DISCHARGED,
          changedBy: requestingUser.id,
          reason: dto.dischargeReason,
        },
      });

      return updated;
    });

    // 2. Release active bed if present via BedService
    if (adm.currentAssignment) {
      await this.bedService.releaseBed(
        adm.currentAssignment.bedId,
        { reason: `Patient discharged: ${dto.dischargeReason}` },
        requestingUser,
      );
    }

    return this.getAdmissionById(id);
  }

  async transferAdmission(id: string, dto: TransferAdmissionDto, requestingUser: any) {
    const adm = await this.getAdmissionById(id);
    await this.wardService.validateFacilityAccess(adm.facilityId, requestingUser);

    if (
      adm.status !== AdmissionStatus.ADMITTED &&
      adm.status !== AdmissionStatus.TRANSFERRED
    ) {
      throw new ConflictException(
        `Admission '${adm.admissionNumber}' is in status '${adm.status}' and cannot be transferred.`,
      );
    }

    const currentAssignment = adm.currentAssignment;
    if (!currentAssignment) {
      throw new BadRequestException(
        `Admission '${adm.admissionNumber}' does not have an active bed assignment to transfer from.`,
      );
    }

    // 1. Verify target bed
    const targetBed = await this.bedService.getBedById(dto.targetBedId);

    // 2. Validate same-bed transfer
    if (targetBed.id === currentAssignment.bedId) {
      throw new ConflictException(
        `Target bed '${targetBed.bedNumber}' is identical to patient's current active bed.`,
      );
    }

    // 3. Validate cross-facility transfer (Day 6 rule: transfers must stay within same facility)
    if (targetBed.facilityId !== adm.facilityId) {
      throw new BadRequestException(
        `Cross-facility transfers are not permitted. Target bed belongs to facility '${targetBed.facilityId}'.`,
      );
    }

    // 4. ATOMIC TRANSACTION: Release old bed + Assign new bed + Create AdmissionTransfer log
    const transferResult = await this.prisma.$transaction(async (tx) => {
      // Step A: Release current bed using BedService logic
      await this.bedService.releaseBed(
        currentAssignment.bedId,
        { reason: `Patient transferred to Bed ${targetBed.bedNumber}` },
        requestingUser,
      );

      // Step B: Assign target bed using BedService logic
      const newAssignment = await this.bedService.assignBed(
        dto.targetBedId,
        {
          patientId: adm.patientId,
          reason: `Transferred from Bed ${currentAssignment.bed.bedNumber}`,
        },
        requestingUser,
      );

      // Link new assignment to admission
      await tx.bedAssignment.update({
        where: { id: newAssignment.id },
        data: { admissionId: id },
      });

      // Step C: Create AdmissionTransfer audit record
      const transferRecord = await tx.admissionTransfer.create({
        data: {
          admissionId: id,
          patientId: adm.patientId,
          fromBedId: currentAssignment.bedId,
          toBedId: dto.targetBedId,
          fromRoomId: currentAssignment.bed.roomId,
          toRoomId: targetBed.roomId,
          fromWardId: currentAssignment.bed.wardId,
          toWardId: targetBed.wardId,
          fromDepartmentId: adm.departmentId,
          toDepartmentId: targetBed.ward.departmentId,
          reason: dto.reason || 'Clinical bed transfer',
          transferredBy: requestingUser.id,
        },
      });

      // Step D: Update admission status and department if changed
      await tx.admission.update({
        where: { id },
        data: {
          status: AdmissionStatus.TRANSFERRED,
          departmentId: targetBed.ward.departmentId,
        },
      });

      await tx.admissionStatusHistory.create({
        data: {
          admissionId: id,
          previousStatus: adm.status as AdmissionStatus,
          newStatus: AdmissionStatus.TRANSFERRED,
          changedBy: requestingUser.id,
          reason: dto.reason || `Bed transfer to ${targetBed.bedNumber}`,
        },
      });

      return transferRecord;
    });

    return this.getAdmissionById(id);
  }
}
