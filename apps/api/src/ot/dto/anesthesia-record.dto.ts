import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { AnesthesiaType } from '@prisma/client';

export class AnesthesiaRecordDto {
  @IsNotEmpty()
  @IsString()
  surgeryId!: string;

  @IsNotEmpty()
  @IsEnum(AnesthesiaType)
  anesthesiaType!: AnesthesiaType;

  @IsOptional()
  @IsString()
  preOpAssessment?: string;

  @IsOptional()
  @IsString()
  intraOpVitals?: string;

  @IsOptional()
  @IsString()
  complications?: string;
}
