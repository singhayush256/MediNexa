import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateDischargeSummaryDto {
  @IsNotEmpty()
  @IsString()
  admissionId!: string;

  @IsNotEmpty()
  @IsString()
  chiefComplaint!: string;

  @IsNotEmpty()
  @IsString()
  diagnosis!: string;

  @IsNotEmpty()
  @IsString()
  treatmentProvided!: string;

  @IsNotEmpty()
  @IsString()
  medicationsOnDischarge!: string;

  @IsOptional()
  @IsString()
  proceduresPerformed?: string;

  @IsOptional()
  @IsString()
  followUpInstructions?: string;

  @IsOptional()
  @IsString()
  dischargeCondition?: string;
}
