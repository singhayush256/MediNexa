import { IsOptional, IsString } from 'class-validator';

export class UpdateDischargeSummaryDto {
  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  treatmentProvided?: string;

  @IsOptional()
  @IsString()
  proceduresPerformed?: string;

  @IsOptional()
  @IsString()
  medicationsOnDischarge?: string;

  @IsOptional()
  @IsString()
  followUpInstructions?: string;

  @IsOptional()
  @IsString()
  dischargeCondition?: string;
}
