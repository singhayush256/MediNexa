import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class GenerateDischargeSummaryDto {
  @IsNotEmpty()
  @IsString()
  diagnosisSummary!: string;

  @IsNotEmpty()
  @IsString()
  treatmentSummary!: string;

  @IsNotEmpty()
  @IsString()
  dischargeInstructions!: string;

  @IsNotEmpty()
  @IsString()
  followUpPlan!: string;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;
}
