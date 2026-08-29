import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateCodeBlueDto {
  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsNotEmpty()
  @IsString()
  eventLocation!: string;

  @IsNotEmpty()
  @IsString()
  eventSummary!: string;

  @IsOptional()
  @IsString()
  outcome?: string;
}
