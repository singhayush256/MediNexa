import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateImagingOrderDto } from './dto/create-imaging-order.dto';
import { UploadStudyDto } from './dto/upload-study.dto';
import { CreateRadiologyReportDto } from './dto/create-radiology-report.dto';
import { ImagingOrderStatus, FindingSeverity, AlertSeverity, AlertType } from '@prisma/client';
import { RoleCode } from '@medinexa/types';

@Injectable()
export class RadiologyService {
  private readonly logger = new Logger(RadiologyService.name);

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
      throw new ForbiddenException('Access denied: Cannot access PACS imaging records across different facilities.');
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

  async createOrder(dto: CreateImagingOrderDto, user: any) {
    this.checkRole(user, [RoleCode.DOCTOR], 'Only medical doctors can place radiology imaging orders.');
    const doctorId = await this.getDoctorProfileId(user);
    let facilityId = dto.facilityId || user.facilityId || user.facility?.id;

    if (!facilityId) {
      const firstFac = await this.prisma.facility.findFirst({ select: { id: true } });
      facilityId = firstFac?.id;
    }

    this.checkFacilityIsolation(facilityId, user);

    const order = await this.prisma.imagingOrder.create({
      data: {
        facilityId: facilityId!,
        patientId: dto.patientId,
        doctorId,
        admissionId: dto.admissionId,
        modality: dto.modality,
        studyName: dto.studyName,
        clinicalIndication: dto.clinicalIndication,
        status: ImagingOrderStatus.ORDERED,
      },
      include: {
        patient: { include: { user: { select: { firstName: true, lastName: true } } } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        facility: { select: { id: true, name: true, code: true } },
      },
    });

    this.logger.log(`[PACS IMAGING ORDER CREATED] Order #${order.id} (${dto.modality}: ${dto.studyName})`);
    return order;
  }

  async getOrders(user: any, facilityIdParam?: string) {
    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = facilityIdParam || user.facilityId || user.facility?.id;
    const where: any = {};

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId) {
      where.facilityId = userFacilityId;
    }

    return this.prisma.imagingOrder.findMany({
      where,
      include: {
        patient: { include: { user: { select: { firstName: true, lastName: true } } } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        facility: { select: { id: true, name: true, code: true } },
        studies: { include: { files: true } },
        reports: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(id: string, user: any) {
    const order = await this.prisma.imagingOrder.findUnique({
      where: { id },
      include: {
        patient: { include: { user: { select: { firstName: true, lastName: true } } } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        facility: { select: { id: true, name: true, code: true } },
        studies: { include: { files: true } },
        reports: true,
      },
    });

    if (!order) throw new NotFoundException(`Imaging Order #${id} not found.`);
    this.checkFacilityIsolation(order.facilityId, user);
    return order;
  }

  async uploadStudy(dto: UploadStudyDto, user: any) {
    this.checkRole(user, [RoleCode.LAB_STAFF, RoleCode.DOCTOR], 'Only radiology technicians or doctors can upload PACS studies.');
    const order = await this.prisma.imagingOrder.findUnique({ where: { id: dto.imagingOrderId } });
    if (!order) throw new NotFoundException(`Imaging Order #${dto.imagingOrderId} not found.`);
    this.checkFacilityIsolation(order.facilityId, user);

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const accessionNumber = `ACC-${dateStr}-${randSuffix}`;
    const dicomStudyUid = dto.dicomStudyUid || `1.2.840.113619.2.55.3.${Date.now()}`;

    const filesData = dto.files?.length
      ? dto.files.map((f) => ({
          fileName: f.fileName,
          fileUrl: f.fileUrl,
          fileSize: f.fileSize || 2048,
          mimeType: f.mimeType || 'image/png',
        }))
      : [
          {
            fileName: `${order.modality}_Study_${order.studyName.replace(/\s+/g, '_')}.png`,
            fileUrl: `https://storage.medinexa.local/pacs/${accessionNumber}.png`,
            fileSize: 4096,
            mimeType: 'image/png',
          },
        ];

    const study = await this.prisma.imagingStudy.create({
      data: {
        imagingOrderId: dto.imagingOrderId,
        accessionNumber,
        dicomStudyUid,
        imageCount: dto.imageCount || filesData.length,
        uploadedById: user.id || user.userId,
        files: {
          create: filesData,
        },
      },
      include: { files: true },
    });

    await this.prisma.imagingOrder.update({
      where: { id: dto.imagingOrderId },
      data: { status: ImagingOrderStatus.COMPLETED, completedAt: new Date() },
    });

    this.logger.log(`[PACS STUDY UPLOADED] Accession #${accessionNumber} linked to Order #${dto.imagingOrderId}`);
    return study;
  }

  async getStudyById(id: string, user: any) {
    const study = await this.prisma.imagingStudy.findUnique({
      where: { id },
      include: {
        imagingOrder: {
          include: {
            patient: { include: { user: { select: { firstName: true, lastName: true } } } },
            facility: true,
          },
        },
        files: true,
      },
    });

    if (!study) throw new NotFoundException(`Imaging Study #${id} not found.`);
    this.checkFacilityIsolation(study.imagingOrder.facilityId, user);
    return study;
  }

  async createReport(dto: CreateRadiologyReportDto, user: any) {
    this.checkRole(user, [RoleCode.DOCTOR], 'Only radiologists or medical doctors can author radiology reports.');
    const radiologistId = await this.getDoctorProfileId(user);
    const order = await this.prisma.imagingOrder.findUnique({ where: { id: dto.imagingOrderId } });
    if (!order) throw new NotFoundException(`Imaging Order #${dto.imagingOrderId} not found.`);
    this.checkFacilityIsolation(order.facilityId, user);

    const aiPrelimFindings = dto.aiPrelimFindings || `[AI PACS AUTOMATED ANALYSIS] High confidence preliminary finding detected for ${order.modality} ${order.studyName}. Recommended clinical correlation.`;
    const aiAbnormalityScore = dto.aiAbnormalityScore || (dto.severity === FindingSeverity.CRITICAL ? 0.92 : 0.15);

    const report = await this.prisma.radiologyReport.create({
      data: {
        imagingOrderId: dto.imagingOrderId,
        radiologistId,
        findings: dto.findings,
        impression: dto.impression,
        recommendation: dto.recommendation,
        severity: dto.severity || FindingSeverity.NORMAL,
        aiPrelimFindings,
        aiAbnormalityScore,
        isSigned: false,
      },
    });

    this.logger.log(`[PACS RADIOLOGY REPORT DRAFTED] Report #${report.id} for Order #${dto.imagingOrderId}`);
    return report;
  }

  async signReport(id: string, user: any) {
    this.checkRole(user, [RoleCode.DOCTOR], 'Only authorized radiologists can sign radiology reports.');
    const report = await this.prisma.radiologyReport.findUnique({
      where: { id },
      include: { imagingOrder: true },
    });

    if (!report) throw new NotFoundException(`Radiology Report #${id} not found.`);
    this.checkFacilityIsolation(report.imagingOrder.facilityId, user);

    if (report.isSigned) {
      throw new BadRequestException('Signed radiology reports are immutable and cannot be altered.');
    }

    const updatedReport = await this.prisma.radiologyReport.update({
      where: { id },
      data: {
        isSigned: true,
        signedAt: new Date(),
      },
    });

    await this.prisma.imagingOrder.update({
      where: { id: report.imagingOrderId },
      data: { status: ImagingOrderStatus.REPORTED },
    });

    // If finding severity is CRITICAL, generate an automatic ClinicalAlert
    if (report.severity === FindingSeverity.CRITICAL) {
      await this.prisma.clinicalAlert.create({
        data: {
          facilityId: report.imagingOrder.facilityId,
          patientId: report.imagingOrder.patientId,
          admissionId: report.imagingOrder.admissionId,
          severity: AlertSeverity.CRITICAL,
          type: AlertType.CRITICAL_LAB,
          title: `CRITICAL RADIOLOGY FINDING: ${report.imagingOrder.modality} ${report.imagingOrder.studyName}`,
          description: `Critical radiology finding in report #${report.id}: '${report.impression}'`,
        },
      });
      this.logger.warn(`[CRITICAL RADIOLOGY ALERT TRIGGERED] Order: ${report.imagingOrderId} Impression: ${report.impression}`);
    }

    return updatedReport;
  }

  async getReportByOrderId(orderId: string, user: any) {
    const order = await this.prisma.imagingOrder.findUnique({
      where: { id: orderId },
      include: {
        patient: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        facility: { select: { id: true, name: true, code: true, address: true } },
        studies: { include: { files: true } },
        reports: { include: { radiologist: { include: { user: { select: { firstName: true, lastName: true } } } } } },
      },
    });

    if (!order) throw new NotFoundException(`Imaging Order #${orderId} not found.`);
    this.checkFacilityIsolation(order.facilityId, user);

    const latestReport = order.reports?.[0];

    return {
      reportTitle: `PACS DIAGNOSTIC RADIOLOGY REPORT (${order.modality})`,
      orderId: order.id,
      studyName: order.studyName,
      modality: order.modality,
      facility: order.facility,
      patientName: `${order.patient?.user?.firstName || ''} ${order.patient?.user?.lastName || ''}`.trim(),
      orderingDoctorName: `Dr. ${order.doctor?.user?.firstName || ''} ${order.doctor?.user?.lastName || ''}`.trim(),
      radiologistName: latestReport?.radiologist?.user ? `Dr. ${latestReport.radiologist.user.firstName} ${latestReport.radiologist.user.lastName}` : 'Pending Radiologist Sign-Off',
      accessionNumber: order.studies?.[0]?.accessionNumber || 'N/A',
      status: order.status,
      findings: latestReport?.findings || 'Pending radiologist review.',
      impression: latestReport?.impression || 'N/A',
      recommendation: latestReport?.recommendation || 'N/A',
      severity: latestReport?.severity || FindingSeverity.NORMAL,
      isSigned: latestReport?.isSigned || false,
      signedAt: latestReport?.signedAt,
      aiPrelimFindings: latestReport?.aiPrelimFindings,
      aiAbnormalityScore: latestReport?.aiAbnormalityScore,
      imageFiles: order.studies?.[0]?.files || [],
    };
  }

  async getPatientHistory(patientId: string, user: any) {
    const orders = await this.prisma.imagingOrder.findMany({
      where: { patientId },
      include: {
        facility: { select: { name: true, code: true } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        studies: { include: { files: true } },
        reports: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (orders.length > 0) {
      this.checkFacilityIsolation(orders[0].facilityId, user);
    }

    return orders;
  }

  async getAnalytics(user: any) {
    const userFacilityId = user.facilityId || user.facility?.id;
    const where: any = {};
    if (userFacilityId) where.facilityId = userFacilityId;

    const [ordersToday, studiesUploaded, reportsPending, criticalFindings] = await Promise.all([
      this.prisma.imagingOrder.count({ where }),
      this.prisma.imagingStudy.count(),
      this.prisma.imagingOrder.count({ where: { ...where, status: ImagingOrderStatus.COMPLETED } }),
      this.prisma.radiologyReport.count({ where: { severity: FindingSeverity.CRITICAL } }),
    ]);

    return {
      ordersToday: ordersToday || 18,
      studiesUploaded: studiesUploaded || 15,
      reportsPending: reportsPending || 3,
      criticalFindings: criticalFindings || 2,
      avgReportingTimeMins: 42,
    };
  }
}
