import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class RiskAnalysisDto {
  @IsNotEmpty()
  @IsString()
  symptoms!: string;

  @IsOptional()
  @IsString()
  vitals?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsString()
  triageLevel?: string;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;
}
