import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { AttachmentCategory } from '@prisma/client';

export class UploadAttachmentDto {
  @IsNotEmpty()
  @IsString()
  patientId!: string;

  @IsOptional()
  @IsEnum(AttachmentCategory)
  category?: AttachmentCategory;

  @IsOptional()
  @IsString()
  encounterId?: string;

  @IsOptional()
  @IsString()
  admissionId?: string;
}
