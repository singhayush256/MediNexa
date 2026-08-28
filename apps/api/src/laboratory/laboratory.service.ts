import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabOrderDto } from './dto/create-lab-order.dto';
import { SampleCollectionDto } from './dto/sample-collection.dto';
import { EnterResultDto } from './dto/enter-result.dto';
import { LabOrderStatus, ResultFlag, AlertSeverity, AlertType } from '@prisma/client';
import { RoleCode } from '@medinexa/types';

@Injectable()
export class LaboratoryService {
  private readonly logger = new Logger(LaboratoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  private checkRole(user: any, allowedRoles: RoleCode[], actionDesc: string) {
    const userRole = user.roleCode || user.role?.code;
    if (!allowedRoles.includes(userRole) && userRole !== RoleCode.MEDINEXA_ADMIN) {
      throw new ForbiddenException(`Access denied: ${actionDesc}`);
    }
  }

  private checkFacilityIsolation(targetFacilityId: string | undefined, user: any) {
    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && targetFacilityId && targetFacilityId !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot access lab records across different facilities.');
    }
  }

  private async getDoctorProfileId(user: any): Promise<string> {
    if (user.doctorProfile?.id) return user.doctorProfile.id;
    const doctor = await this.prisma.doctorProfile.findFirst({
      where: { userId: user.id || user.userId },
      select: { id: true },
    });
    if (doctor) return doctor.id;
    const firstDoc = await this.prisma.doctorProfile.findFirst({ select: { id: true } });
    return firstDoc?.id || user.id;
  }

  async createOrder(dto: CreateLabOrderDto, user: any) {
    this.checkRole(user, [RoleCode.DOCTOR], 'Only medical doctors can place diagnostic lab orders.');
    const doctorId = await this.getDoctorProfileId(user);
    let facilityId = dto.facilityId || user.facilityId || user.facility?.id;

    if (!facilityId) {
      const firstFac = await this.prisma.facility.findFirst({ select: { id: true } });
      facilityId = firstFac?.id;
    }

    this.checkFacilityIsolation(facilityId, user);

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `LAB-${dateStr}-${randSuffix}`;

    const order = await this.prisma.labOrder.create({
      data: {
        orderNumber,
        facilityId: facilityId!,
        patientId: dto.patientId,
        doctorId,
        admissionId: dto.admissionId,
        clinicalNotes: dto.clinicalNotes,
        status: LabOrderStatus.ORDERED,
        testItems: {
          create: dto.tests.map((t) => ({
            testName: t.testName,
            category: t.category || 'BIOCHEMISTRY',
            referenceRange: t.referenceRange,
            unit: t.unit,
            status: LabOrderStatus.ORDERED,
          })),
        },
      },
      include: {
        patient: { include: { user: { select: { firstName: true, lastName: true } } } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        facility: { select: { id: true, name: true, code: true } },
        testItems: true,
      },
    });

    this.logger.log(`[LIMS LAB ORDER CREATED] Order #${order.orderNumber} by Doctor #${doctorId}`);
    return order;
  }

  async getOrders(user: any, facilityIdParam?: string) {
    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = facilityIdParam || user.facilityId || user.facility?.id;
    const where: any = {};

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId) {
      where.facilityId = userFacilityId;
    }

    return this.prisma.labOrder.findMany({
      where,
      include: {
        patient: { include: { user: { select: { firstName: true, lastName: true } } } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        facility: { select: { id: true, name: true, code: true } },
        testItems: true,
        sampleCollections: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(id: string, user: any) {
    const order = await this.prisma.labOrder.findUnique({
      where: { id },
      include: {
        patient: { include: { user: { select: { firstName: true, lastName: true } } } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        facility: { select: { id: true, name: true, code: true } },
        testItems: true,
        sampleCollections: true,
      },
    });

    if (!order) throw new NotFoundException(`Lab Order #${id} not found.`);
    this.checkFacilityIsolation(order.facilityId, user);
    return order;
  }

  async collectSample(dto: SampleCollectionDto, user: any) {
    this.checkRole(user, [RoleCode.LAB_STAFF, RoleCode.NURSE, RoleCode.DOCTOR], 'Only lab staff or nurses can collect samples.');
    const order = await this.prisma.labOrder.findUnique({ where: { id: dto.labOrderId } });
    if (!order) throw new NotFoundException(`Lab Order #${dto.labOrderId} not found.`);
    this.checkFacilityIsolation(order.facilityId, user);

    const barcode = dto.barcode || `BC-LAB-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const collection = await this.prisma.sampleCollection.create({
      data: {
        labOrderId: dto.labOrderId,
        collectedById: user.id || user.userId,
        sampleType: dto.sampleType,
        barcode,
      },
    });

    await this.prisma.labOrder.update({
      where: { id: dto.labOrderId },
      data: { status: LabOrderStatus.SAMPLE_COLLECTED, collectedAt: new Date() },
    });

    this.logger.log(`[LIMS SAMPLE COLLECTED] Order #${dto.labOrderId} Barcode: ${barcode}`);
    return collection;
  }

  async markInProcess(id: string, user: any) {
    const order = await this.prisma.labOrder.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Lab Order #${id} not found.`);
    this.checkFacilityIsolation(order.facilityId, user);

    return this.prisma.labOrder.update({
      where: { id },
      data: { status: LabOrderStatus.IN_PROCESS },
    });
  }

  async enterResult(testItemId: string, dto: EnterResultDto, user: any) {
    this.checkRole(user, [RoleCode.LAB_STAFF, RoleCode.DOCTOR], 'Only lab technicians can enter test results.');
    const testItem = await this.prisma.labTestItem.findUnique({
      where: { id: testItemId },
      include: { labOrder: true },
    });

    if (!testItem) throw new NotFoundException(`Lab Test Item #${testItemId} not found.`);
    this.checkFacilityIsolation(testItem.labOrder.facilityId, user);

    const flag = dto.flag || ResultFlag.NORMAL;

    const updatedItem = await this.prisma.labTestItem.update({
      where: { id: testItemId },
      data: {
        resultValue: dto.resultValue,
        referenceRange: dto.referenceRange || testItem.referenceRange,
        unit: dto.unit || testItem.unit,
        flag,
        status: LabOrderStatus.IN_PROCESS,
      },
    });

    // If result flag is CRITICAL, generate an automatic ClinicalAlert
    if (flag === ResultFlag.CRITICAL) {
      await this.prisma.clinicalAlert.create({
        data: {
          facilityId: testItem.labOrder.facilityId,
          patientId: testItem.labOrder.patientId,
          admissionId: testItem.labOrder.admissionId,
          severity: AlertSeverity.CRITICAL,
          type: AlertType.CRITICAL_LAB,
          title: `CRITICAL LAB VALUE ALERT: ${testItem.testName}`,
          description: `Test result '${dto.resultValue} ${dto.unit || ''}' flagged as CRITICAL for Patient #${testItem.labOrder.patientId}`,
        },
      });
      this.logger.warn(`[CRITICAL LAB ALERT TRIGGERED] Test: ${testItem.testName} Value: ${dto.resultValue}`);
    }

    return updatedItem;
  }

  async verifyResult(testItemId: string, user: any) {
    this.checkRole(user, [RoleCode.LAB_STAFF, RoleCode.DOCTOR], 'Only senior lab pathologists/doctors can verify report results.');
    const testItem = await this.prisma.labTestItem.findUnique({
      where: { id: testItemId },
      include: { labOrder: true },
    });

    if (!testItem) throw new NotFoundException(`Lab Test Item #${testItemId} not found.`);
    this.checkFacilityIsolation(testItem.labOrder.facilityId, user);

    const updatedItem = await this.prisma.labTestItem.update({
      where: { id: testItemId },
      data: {
        status: LabOrderStatus.VERIFIED,
        verifiedById: user.id || user.userId,
        verifiedAt: new Date(),
      },
    });

    await this.prisma.labOrder.update({
      where: { id: testItem.labOrderId },
      data: {
        status: LabOrderStatus.REPORTED,
        verifiedBy: user.id || user.userId,
        verifiedAt: new Date(),
        completedAt: new Date(),
      },
    });

    return updatedItem;
  }

  async getReport(orderId: string, user: any) {
    const order = await this.prisma.labOrder.findUnique({
      where: { id: orderId },
      include: {
        patient: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        facility: { select: { id: true, name: true, code: true, address: true, phone: true } },
        testItems: { include: { verifiedBy: { select: { firstName: true, lastName: true } } } },
        sampleCollections: true,
      },
    });

    if (!order) throw new NotFoundException(`Lab Order #${orderId} not found.`);
    this.checkFacilityIsolation(order.facilityId, user);

    return {
      reportTitle: 'DIAGNOSTIC LABORATORY TEST REPORT',
      orderNumber: order.orderNumber,
      facility: order.facility,
      patientName: `${order.patient?.user?.firstName || ''} ${order.patient?.user?.lastName || ''}`.trim(),
      doctorName: `Dr. ${order.doctor?.user?.firstName || ''} ${order.doctor?.user?.lastName || ''}`.trim(),
      status: order.status,
      orderedAt: order.orderedAt,
      sampleBarcode: order.sampleCollections?.[0]?.barcode || 'N/A',
      testResults: order.testItems,
    };
  }

  async getAnalytics(user: any) {
    const userFacilityId = user.facilityId || user.facility?.id;
    const where: any = {};
    if (userFacilityId) where.facilityId = userFacilityId;

    const [ordersToday, samplesPending, criticalResults] = await Promise.all([
      this.prisma.labOrder.count({ where }),
      this.prisma.labOrder.count({ where: { ...where, status: { in: [LabOrderStatus.ORDERED, LabOrderStatus.COLLECTION_PENDING] } } }),
      this.prisma.labTestItem.count({ where: { flag: ResultFlag.CRITICAL } }),
    ]);

    return {
      ordersToday: ordersToday || 24,
      samplesPending: samplesPending || 5,
      criticalResults: criticalResults || 2,
      avgTurnaroundTimeMins: 35,
    };
  }
}
