import { IsOptional, IsString } from 'class-validator';

export class RunAiAnalysisDto {
  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsString()
  patientId?: string;
}
