import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ScheduleStudyDto {
  @IsNotEmpty()
  @IsString()
  scheduledAt!: string;

  @IsOptional()
  @IsString()
  technicianId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
