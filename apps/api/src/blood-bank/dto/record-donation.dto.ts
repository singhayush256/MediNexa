import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { BloodComponent } from '@prisma/client';

export class RecordDonationDto {
  @IsString()
  @IsNotEmpty()
  donorId!: string;

  @IsString()
  @IsOptional()
  facilityId?: string;

  @IsNumber()
  @Min(10)
  hemoglobin!: number; // e.g. 13.5 g/dL

  @IsString()
  @IsOptional()
  bloodPressure?: string;

  @IsNumber()
  @IsOptional()
  weight?: number; // kg

  @IsString()
  @IsOptional()
  infectiousScreening?: string; // NEGATIVE or POSITIVE

  @IsString()
  @IsOptional()
  screeningNotes?: string;

  @IsEnum(BloodComponent)
  @IsOptional()
  component?: BloodComponent; // defaults to PACKED_RBC
}
