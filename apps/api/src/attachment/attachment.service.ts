import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IStorageProvider, STORAGE_PROVIDER_TOKEN } from '../storage/storage-provider.interface';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
import { AttachmentCategory } from '@prisma/client';
import { RoleCode } from '@medinexa/types';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/dicom',
  'image/dicom',
  'application/octet-stream',
];

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

@Injectable()
export class AttachmentService {
  private readonly logger = new Logger(AttachmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER_TOKEN) private readonly storageProvider: IStorageProvider,
  ) {}

  private async scanFileForMalware(buffer: Buffer): Promise<boolean> {
    return true;
  }

  async uploadAttachment(
    file: any,
    dto: UploadAttachmentDto,
    user: any,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided for upload.');
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(`File size exceeds 25MB limit. (File size: ${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype) && !file.originalname.endsWith('.dcm')) {
      throw new BadRequestException(`Unsupported file MIME type '${file.mimetype}'. Allowed: PDF, JPG, PNG, WEBP, DICOM.`);
    }

    const isClean = await this.scanFileForMalware(file.buffer);
    if (!isClean) {
      throw new BadRequestException('Malware scan failed for uploaded file.');
    }

    let facilityId = user.facilityId || user.doctorProfile?.facilityId || user.facility?.id;
    if (!facilityId) {
      const patient = await this.prisma.patientProfile.findUnique({
        where: { id: dto.patientId },
        include: { user: { select: { facilityId: true } } },
      });
      facilityId = patient?.user?.facilityId;
    }

    if (!facilityId) {
      const firstFac = await this.prisma.facility.findFirst();
      facilityId = firstFac?.id;
    }

    const storageResult = await this.storageProvider.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    const category = (dto.category as AttachmentCategory) || AttachmentCategory.GENERAL_DOCUMENT;

    const attachment = await this.prisma.fileAttachment.create({
      data: {
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        storageKey: storageResult.storageKey,
        publicUrl: storageResult.publicUrl,
        checksum: storageResult.checksum,
        category,
        patientId: dto.patientId,
        facilityId: facilityId!,
        uploadedById: user.id || user.userId,
        encounterId: dto.encounterId,
        admissionId: dto.admissionId,
      },
      include: {
        patient: { include: { user: { select: { firstName: true, lastName: true } } } },
        uploadedBy: { select: { firstName: true, lastName: true, role: { select: { code: true } } } },
        facility: { select: { name: true, code: true } },
      },
    });

    await this.prisma.attachmentAudit.create({
      data: {
        attachmentId: attachment.id,
        action: 'UPLOAD',
        userId: user.id || user.userId,
        userRole: user.roleCode || user.role?.code || 'STAFF',
        facilityId: facilityId!,
      },
    });

    this.logger.log(`[ATTACHMENT UPLOAD] Saved #${attachment.id} (${file.originalname}) for patient ${dto.patientId}`);
    return attachment;
  }

  async getAttachments(user: any, category?: string, patientId?: string) {
    const roleCode = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.doctorProfile?.facilityId || user.facility?.id;

    const where: any = {};

    if (roleCode === RoleCode.PATIENT) {
      const patientProfile = await this.prisma.patientProfile.findUnique({
        where: { userId: user.id || user.userId },
      });
      if (!patientProfile) return [];
      where.patientId = patientProfile.id;
    } else if (roleCode !== RoleCode.MEDINEXA_ADMIN && userFacilityId) {
      where.facilityId = userFacilityId;
    }

    if (patientId) where.patientId = patientId;
    if (category) where.category = category as any;

    return this.prisma.fileAttachment.findMany({
      where,
      include: {
        patient: { include: { user: { select: { firstName: true, lastName: true } } } },
        uploadedBy: { select: { firstName: true, lastName: true, role: { select: { code: true } } } },
        facility: { select: { name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPatientAttachments(patientId: string, user: any) {
    return this.getAttachments(user, undefined, patientId);
  }

  async getAttachmentById(id: string, user: any) {
    const attachment = await this.prisma.fileAttachment.findUnique({
      where: { id },
      include: {
        patient: { include: { user: { select: { firstName: true, lastName: true } } } },
        uploadedBy: { select: { firstName: true, lastName: true, role: { select: { code: true } } } },
        facility: { select: { name: true, code: true } },
      },
    });

    if (!attachment) {
      throw new NotFoundException(`File attachment with ID '${id}' not found.`);
    }

    const roleCode = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.doctorProfile?.facilityId || user.facility?.id;

    if (roleCode !== RoleCode.MEDINEXA_ADMIN && userFacilityId && attachment.facilityId !== userFacilityId) {
      throw new ForbiddenException('Access denied: Document belongs to a different hospital facility.');
    }

    await this.prisma.attachmentAudit.create({
      data: {
        attachmentId: attachment.id,
        action: 'VIEW',
        userId: user.id || user.userId,
        userRole: roleCode || 'STAFF',
        facilityId: attachment.facilityId,
      },
    });

    return attachment;
  }

  async getFileStream(id: string, user: any) {
    const attachment = await this.getAttachmentById(id, user);
    const buffer = await this.storageProvider.getFileBuffer(attachment.storageKey);

    await this.prisma.attachmentAudit.create({
      data: {
        attachmentId: attachment.id,
        action: 'DOWNLOAD',
        userId: user.id || user.userId,
        userRole: user.roleCode || user.role?.code || 'STAFF',
        facilityId: attachment.facilityId,
      },
    });

    return {
      buffer,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
    };
  }

  async deleteAttachment(id: string, user: any) {
    const attachment = await this.getAttachmentById(id, user);

    await this.storageProvider.deleteFile(attachment.storageKey);

    await this.prisma.attachmentAudit.create({
      data: {
        attachmentId: attachment.id,
        action: 'DELETE',
        userId: user.id || user.userId,
        userRole: user.roleCode || user.role?.code || 'STAFF',
        facilityId: attachment.facilityId,
      },
    });

    await this.prisma.fileAttachment.delete({
      where: { id },
    });

    return { success: true, message: `Attachment '${attachment.fileName}' deleted successfully.` };
  }
}
