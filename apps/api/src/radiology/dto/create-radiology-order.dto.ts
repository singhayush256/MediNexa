import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ImagingModality } from '@prisma/client';

export class CreateRadiologyOrderDto {
  @IsNotEmpty()
  @IsString()
  patientId!: string;

  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsString()
  admissionId?: string;

  @IsNotEmpty()
  @IsEnum(ImagingModality)
  modality!: ImagingModality;

  @IsOptional()
  @IsString()
  studyName?: string;

  @IsOptional()
  @IsString()
  clinicalIndication?: string;

  @IsOptional()
  @IsString()
  priority?: string; // STAT, URGENT, ROUTINE
}

export class CreateImagingOrderDto extends CreateRadiologyOrderDto {}
