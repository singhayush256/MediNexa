import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ScheduleStatus } from '@medinexa/types';

export class CreateDoctorScheduleDto {
  @IsString()
  doctorId!: string;

  @IsString()
  facilityId!: string;

  @IsString()
  departmentId!: string;

  @IsNumber()
  dayOfWeek!: number;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsOptional()
  @IsNumber()
  slotDurationMinutes?: number;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;
}
