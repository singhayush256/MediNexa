import { IsNotEmpty, IsString, IsEnum, IsOptional, IsInt, Min, IsArray } from 'class-validator';
import { ImagingModality } from '@prisma/client';

export class UploadStudyDto {
  @IsOptional()
  @IsString()
  radiologyOrderId?: string;

  @IsOptional()
  @IsString()
  imagingOrderId?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  accessionNumber?: string;

  @IsOptional()
  @IsString()
  studyUid?: string;

  @IsOptional()
  @IsString()
  dicomStudyUid?: string;

  @IsOptional()
  @IsEnum(ImagingModality)
  modality?: ImagingModality;

  @IsOptional()
  @IsInt()
  @Min(1)
  imageCount?: number;

  @IsOptional()
  @IsString()
  seriesUid?: string;

  @IsOptional()
  @IsString()
  seriesDescription?: string;

  @IsOptional()
  @IsString()
  storageLocation?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  performedAt?: string;

  @IsOptional()
  @IsString()
  technicianId?: string;

  @IsOptional()
  @IsArray()
  files?: Array<{
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    mimeType?: string;
  }>;
}
