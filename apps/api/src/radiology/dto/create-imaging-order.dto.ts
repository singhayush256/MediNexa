import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ImagingModality } from '@prisma/client';

export class CreateImagingOrderDto {
  @IsNotEmpty()
  @IsString()
  patientId!: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsString()
  admissionId?: string;

  @IsNotEmpty()
  @IsEnum(ImagingModality)
  modality!: ImagingModality;

  @IsNotEmpty()
  @IsString()
  studyName!: string;

  @IsOptional()
  @IsString()
  clinicalIndication?: string;
}
