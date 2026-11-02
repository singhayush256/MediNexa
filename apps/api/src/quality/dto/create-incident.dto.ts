import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { IncidentSeverity } from '@prisma/client';

export class CreateIncidentDto {
  @IsNotEmpty()
  @IsString()
  incidentType!: string;

  @IsOptional()
  @IsEnum(IncidentSeverity)
  severity?: IncidentSeverity;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsString()
  incidentDate?: string;
}
