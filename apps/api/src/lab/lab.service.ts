import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WardService } from '../ward/ward.service';
import { CreateLabTestDto } from './dto/create-lab-test.dto';
import { CreateLabOrderDto } from './dto/create-lab-order.dto';
import { RecordLabResultDto } from './dto/record-lab-result.dto';
import {
  LabOrderStatus,
  SpecimenStatus,
  LabResultStatus,
  RoleCode,
  LabOrderPriority,
} from '@medinexa/types';

@Injectable()
export class LabService {
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
  // 1. LAB TEST CATALOG
  // =========================================================================

  async getLabTests() {
    return this.prisma.labTest.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });
  }

  async createLabTest(dto: CreateLabTestDto) {
    const existing = await this.prisma.labTest.findUnique({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException(`Lab test with code '${dto.code}' already exists`);
    }

    return this.prisma.labTest.create({
      data: dto as any,
    });
  }

  async updateLabTest(id: string, dto: Partial<CreateLabTestDto>) {
    const test = await this.prisma.labTest.findUnique({ where: { id } });
    if (!test) throw new NotFoundException(`Lab test with ID '${id}' not found`);

    return this.prisma.labTest.update({
      where: { id },
      data: dto as any,
    });
  }

  // =========================================================================
  // 2. LAB ORDERS & TRANSACTIONAL CREATION
  // =========================================================================

  async createLabOrder(dto: CreateLabOrderDto, requestingUser: any) {
    // 1. Verify Encounter
    const encounter = await this.prisma.clinicalEncounter.findUnique({
      where: { id: dto.encounterId },
      include: { patient: true, doctor: true, facility: true },
    });
    if (!encounter) {
      throw new NotFoundException(`Clinical Encounter with ID '${dto.encounterId}' not found`);
    }

    // 2. Multi-hospital security check
    await this.wardService.validateFacilityAccess(encounter.facilityId, requestingUser);

    // 3. Verify Lab Tests exist
    const labTests = await this.prisma.labTest.findMany({
      where: { id: { in: dto.testIds } },
    });
    if (labTests.length !== dto.testIds.length) {
      throw new BadRequestException('One or more selected lab test IDs are invalid');
    }

    const orderNumber = `LAB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const specimenNumber = `SPEC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.prisma.$transaction(async (tx) => {
      // Create LabOrder
      const order = await tx.labOrder.create({
        data: {
          orderNumber,
          encounterId: dto.encounterId,
          patientId: encounter.patientId,
          doctorId: encounter.doctorId,
          facilityId: encounter.facilityId,
          priority: dto.priority || LabOrderPriority.ROUTINE,
          status: LabOrderStatus.ORDERED,
          clinicalNotes: dto.clinicalNotes || null,
          orderedAt: new Date(),
        },
      });

      // Create Order Items
      for (const test of labTests) {
        await tx.labOrderItem.create({
          data: {
            labOrderId: order.id,
            labTestId: test.id,
            status: 'PENDING',
          },
        });
      }

      // Create Specimen
      const primarySpecimenType = labTests[0].specimenType || 'Blood';
      await tx.specimen.create({
        data: {
          specimenNumber,
          labOrderId: order.id,
          patientId: encounter.patientId,
          specimenType: primarySpecimenType,
          status: SpecimenStatus.PENDING,
        },
      });

      return tx.labOrder.findUnique({
        where: { id: order.id },
        include: {
          items: { include: { labTest: true } },
          specimens: true,
          patient: { include: { user: true } },
          doctor: { include: { user: true } },
          facility: { select: { name: true, code: true } },
        },
      });
    });
  }

  async getLabOrders(filters: { facilityId?: string; patientId?: string; status?: LabOrderStatus }) {
    const where: any = {};
    if (filters.facilityId) where.facilityId = filters.facilityId;
    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.status) where.status = filters.status;

    return this.prisma.labOrder.findMany({
      where,
      include: {
        items: { include: { labTest: true, results: true } },
        specimens: true,
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        facility: { select: { name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLabOrderById(id: string, requestingUser?: any) {
    const order = await this.prisma.labOrder.findUnique({
      where: { id },
      include: {
        items: { include: { labTest: true, results: { include: { versions: true } } } },
        specimens: true,
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        facility: { select: { name: true, code: true } },
        encounter: true,
      },
    });
    if (!order) throw new NotFoundException(`Lab Order with ID '${id}' not found`);

    if (requestingUser) {
      await this.wardService.validateFacilityAccess(order.facilityId, requestingUser);
    }

    return order;
  }

  async getEncounterLabOrders(encounterId: string) {
    return this.prisma.labOrder.findMany({
      where: { encounterId },
      include: {
        items: { include: { labTest: true, results: true } },
        specimens: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // =========================================================================
  // 3. SPECIMEN LIFECYCLE ENGINE
  // =========================================================================

  async collectSpecimen(orderId: string, requestingUser: any) {
    const order = await this.getLabOrderById(orderId);
    await this.wardService.validateFacilityAccess(order.facilityId, requestingUser);

    const now = new Date();
    await this.prisma.specimen.updateMany({
      where: { labOrderId: orderId },
      data: {
        status: SpecimenStatus.COLLECTED,
        collectedBy: requestingUser.id,
        collectedAt: now,
      },
    });

    return this.prisma.labOrder.update({
      where: { id: orderId },
      data: {
        status: LabOrderStatus.COLLECTED,
        collectedAt: now,
      },
      include: { specimens: true, items: { include: { labTest: true } } },
    });
  }

  async receiveSpecimen(orderId: string, requestingUser: any) {
    const order = await this.getLabOrderById(orderId);
    await this.wardService.validateFacilityAccess(order.facilityId, requestingUser);

    await this.prisma.specimen.updateMany({
      where: { labOrderId: orderId },
      data: {
        status: SpecimenStatus.RECEIVED,
        receivedAt: new Date(),
      },
    });

    return this.prisma.labOrder.update({
      where: { id: orderId },
      data: { status: LabOrderStatus.PROCESSING },
      include: { specimens: true, items: { include: { labTest: true } } },
    });
  }

  async processSpecimen(orderId: string, requestingUser: any) {
    const order = await this.getLabOrderById(orderId);
    await this.wardService.validateFacilityAccess(order.facilityId, requestingUser);

    await this.prisma.specimen.updateMany({
      where: { labOrderId: orderId },
      data: { status: SpecimenStatus.PROCESSING },
    });

    return this.prisma.labOrder.update({
      where: { id: orderId },
      data: { status: LabOrderStatus.PROCESSING },
      include: { specimens: true },
    });
  }

  async rejectSpecimen(orderId: string, reason: string, requestingUser: any) {
    const order = await this.getLabOrderById(orderId);
    await this.wardService.validateFacilityAccess(order.facilityId, requestingUser);

    await this.prisma.specimen.updateMany({
      where: { labOrderId: orderId },
      data: {
        status: SpecimenStatus.REJECTED,
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
    });

    return this.prisma.labOrder.update({
      where: { id: orderId },
      data: { status: LabOrderStatus.CANCELLED },
      include: { specimens: true },
    });
  }

  // =========================================================================
  // 4. LAB RESULT ENTRY, VERIFICATION, CONCURRENCY, & AMENDMENTS
  // =========================================================================

  async recordLabResult(labOrderItemId: string, dto: RecordLabResultDto, requestingUser: any) {
    const item = await this.prisma.labOrderItem.findUnique({
      where: { id: labOrderItemId },
      include: { labOrder: true },
    });
    if (!item) throw new NotFoundException('Lab order item not found');

    await this.wardService.validateFacilityAccess(item.labOrder.facilityId, requestingUser);

    const userRole = this.getUserRole(requestingUser);
    if (userRole === RoleCode.PATIENT) {
      throw new ForbiddenException('Patients cannot record lab results');
    }

    const existingResult = await this.prisma.labResult.findFirst({
      where: { labOrderItemId },
    });

    if (existingResult && existingResult.resultStatus === LabResultStatus.FINAL) {
      throw new ConflictException(
        'Lab result has been finalized. Use amendment workflow to alter finalized results.',
      );
    }

    if (existingResult) {
      return this.prisma.labResult.update({
        where: { id: existingResult.id },
        data: {
          resultValue: dto.resultValue,
          numericValue: dto.numericValue || null,
          unit: dto.unit || null,
          referenceRange: dto.referenceRange || null,
          abnormalFlag: dto.abnormalFlag || 'NORMAL',
          interpretation: dto.interpretation || null,
        },
      });
    }

    return this.prisma.labResult.create({
      data: {
        labOrderItemId,
        patientId: item.labOrder.patientId,
        resultValue: dto.resultValue,
        numericValue: dto.numericValue || null,
        unit: dto.unit || null,
        referenceRange: dto.referenceRange || null,
        abnormalFlag: dto.abnormalFlag || 'NORMAL',
        resultStatus: LabResultStatus.PRELIMINARY,
        interpretation: dto.interpretation || null,
        enteredBy: requestingUser.id,
      },
    });
  }

  async verifyLabResult(resultId: string, requestingUser: any) {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.labResult.findUnique({
        where: { id: resultId },
        include: { labOrderItem: { include: { labOrder: true } } },
      });
      if (!result) throw new NotFoundException('Lab result not found');

      await this.wardService.validateFacilityAccess(result.labOrderItem.labOrder.facilityId, requestingUser);

      const userRole = this.getUserRole(requestingUser);
      if (userRole === RoleCode.PATIENT) {
        throw new ForbiddenException('Patients cannot verify lab results');
      }

      // Concurrency Lock Check: Ensure status is PRELIMINARY
      if (result.resultStatus === LabResultStatus.FINAL) {
        throw new ConflictException('Lab result has already been verified and finalized');
      }

      const updatedResult = await tx.labResult.update({
        where: { id: resultId },
        data: {
          resultStatus: LabResultStatus.FINAL,
          verifiedBy: requestingUser.id,
          verifiedAt: new Date(),
        },
      });

      // Update parent order status to COMPLETED if all items verified
      const orderId = result.labOrderItem.labOrderId;
      const allItems = await tx.labOrderItem.findMany({
        where: { labOrderId: orderId },
        include: { results: true },
      });

      const allVerified = allItems.every((it) =>
        it.results.some((r) => r.resultStatus === LabResultStatus.FINAL || r.resultStatus === LabResultStatus.AMENDED),
      );

      if (allVerified) {
        await tx.labOrder.update({
          where: { id: orderId },
          data: {
            status: LabOrderStatus.COMPLETED,
            completedAt: new Date(),
            verifiedAt: new Date(),
            verifiedBy: requestingUser.id,
          },
        });
      }

      return updatedResult;
    });
  }

  async amendLabResult(resultId: string, dto: RecordLabResultDto & { reason: string }, requestingUser: any) {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.labResult.findUnique({
        where: { id: resultId },
        include: { versions: true, labOrderItem: { include: { labOrder: true } } },
      });
      if (!result) throw new NotFoundException('Lab result not found');

      if (result.resultStatus !== LabResultStatus.FINAL && result.resultStatus !== LabResultStatus.AMENDED) {
        throw new BadRequestException('Only finalized results require formal amendments');
      }

      const nextVersion = result.versions.length + 1;

      // 1. Save version history
      await tx.labResultVersion.create({
        data: {
          resultId,
          versionNumber: nextVersion,
          resultValue: result.resultValue,
          numericValue: result.numericValue,
          abnormalFlag: result.abnormalFlag,
          reason: dto.reason,
          createdBy: requestingUser.id,
        },
      });

      // 2. Update result content and mark AMENDED
      return tx.labResult.update({
        where: { id: resultId },
        data: {
          resultValue: dto.resultValue,
          numericValue: dto.numericValue || null,
          abnormalFlag: dto.abnormalFlag || result.abnormalFlag,
          resultStatus: LabResultStatus.AMENDED,
        },
        include: { versions: true },
      });
    });
  }

  async getPatientLabResults(patientId: string, requestingUser: any) {
    const userRole = this.getUserRole(requestingUser);
    if (userRole === RoleCode.PATIENT) {
      if (!requestingUser.patientProfile || requestingUser.patientProfile.id !== patientId) {
        throw new ForbiddenException('Patients can only view their own lab results');
      }
    }

    return this.prisma.labResult.findMany({
      where: {
        patientId,
        resultStatus: { in: [LabResultStatus.FINAL, LabResultStatus.AMENDED] },
      },
      include: {
        labOrderItem: { include: { labTest: true, labOrder: true } },
        verifier: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
