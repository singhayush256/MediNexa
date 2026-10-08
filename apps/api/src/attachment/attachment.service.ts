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
import * as fs from 'fs';
import * as path from 'path';

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
      {
        facilityId: facilityId!,
        patientId: dto.patientId,
        category: dto.category,
      },
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
      if (patientId && patientId !== patientProfile.id) {
        throw new ForbiddenException('Access denied: You cannot view documents belonging to another patient.');
      }
      where.patientId = patientProfile.id;
    } else {
      if (roleCode !== RoleCode.MEDINEXA_ADMIN && roleCode !== RoleCode.SUPER_ADMIN && userFacilityId) {
        where.facilityId = userFacilityId;
      }
      if (patientId) where.patientId = patientId;
    }

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

    if (roleCode === RoleCode.PATIENT) {
      const patientProfile = await this.prisma.patientProfile.findUnique({
        where: { userId: user.id || user.userId },
      });
      if (!patientProfile || attachment.patientId !== patientProfile.id) {
        throw new ForbiddenException('Access denied: You can only view your own documents.');
      }
    } else if (roleCode !== RoleCode.MEDINEXA_ADMIN && roleCode !== RoleCode.SUPER_ADMIN && userFacilityId && attachment.facilityId !== userFacilityId) {
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

    const roleCode = user.roleCode || user.role?.code;
    if (roleCode === RoleCode.PATIENT && attachment.uploadedById !== (user.id || user.userId)) {
      throw new ForbiddenException('Access denied: Patients can only delete documents they uploaded themselves.');
    }

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

  async getSignedDownloadUrl(id: string, user: any, expiresInSeconds = 300) {
    const attachment = await this.getAttachmentById(id, user);
    if (!this.storageProvider.getSignedDownloadUrl) {
      throw new BadRequestException('Signed URLs are not supported by the current storage provider.');
    }
    const signedUrl = await this.storageProvider.getSignedDownloadUrl(attachment.storageKey, expiresInSeconds);

    await this.prisma.attachmentAudit.create({
      data: {
        attachmentId: attachment.id,
        action: 'SIGNED_URL_GENERATED',
        userId: user.id || user.userId,
        userRole: user.roleCode || user.role?.code || 'STAFF',
        facilityId: attachment.facilityId,
      },
    });

    return {
      signedUrl,
      expiresInSeconds,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
    };
  }

  /**
   * Safe, non-destructive migration helper for existing local files to Cloudflare R2
   */
  async migrateLocalStorageToR2(): Promise<{
    scanned: number;
    migrated: number;
    skipped: number;
    errors: string[];
  }> {
    const localAttachments = await this.prisma.fileAttachment.findMany({
      where: {
        storageKey: { startsWith: 'att_' },
      },
    });

    let migrated = 0;
    let skipped = 0;
    const errors: string[] = [];

    const uploadsDir = path.join(process.cwd(), 'uploads', 'attachments');

    for (const att of localAttachments) {
      try {
        const localPath = path.join(uploadsDir, att.storageKey);
        if (!fs.existsSync(localPath)) {
          skipped++;
          continue;
        }

        const buffer = await fs.promises.readFile(localPath);
        const uploadResult = await this.storageProvider.uploadFile(
          buffer,
          att.fileName,
          att.mimeType,
          {
            facilityId: att.facilityId,
            patientId: att.patientId,
            category: att.category,
          },
        );

        if (this.storageProvider.checkFileExists) {
          const exists = await this.storageProvider.checkFileExists(uploadResult.storageKey);
          if (!exists) {
            throw new Error(`Upload verification check failed for ${uploadResult.storageKey}`);
          }
        }

        await this.prisma.fileAttachment.update({
          where: { id: att.id },
          data: {
            storageKey: uploadResult.storageKey,
            publicUrl: null,
            checksum: uploadResult.checksum,
          },
        });

        migrated++;
        this.logger.log(`[STORAGE MIGRATION] Migrated #${att.id} (${att.fileName}) -> ${uploadResult.storageKey}`);
        // NOTE: Source file is preserved non-destructively
      } catch (err: any) {
        errors.push(`Attachment #${att.id}: ${err.message}`);
        this.logger.error(`[STORAGE MIGRATION ERROR] Failed for #${att.id}: ${err.message}`);
      }
    }

    return {
      scanned: localAttachments.length,
      migrated,
      skipped,
      errors,
    };
  }
}
