import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { SampleType } from '@prisma/client';

export class SampleCollectionDto {
  @IsNotEmpty()
  @IsString()
  labOrderId!: string;

  @IsNotEmpty()
  @IsEnum(SampleType)
  sampleType!: SampleType;

  @IsOptional()
  @IsString()
  barcode?: string;
}
