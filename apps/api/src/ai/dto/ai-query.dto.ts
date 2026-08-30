import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class AiQueryDto {
  @IsNotEmpty()
  @IsString()
  prompt!: string;

  @IsOptional()
  @IsString()
  taskType?: string;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}
