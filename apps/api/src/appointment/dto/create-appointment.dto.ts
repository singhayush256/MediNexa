import { IsString, IsOptional, IsEnum } from 'class-validator';
import { AppointmentType } from '@medinexa/types';

export class CreateAppointmentDto {
  @IsString()
  patientId!: string;

  @IsString()
  doctorId!: string;

  @IsString()
  facilityId!: string;

  @IsString()
  departmentId!: string;

  @IsOptional()
  @IsString()
  specialtyId?: string;

  @IsString()
  appointmentDate!: string;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsEnum(AppointmentType)
  type!: AppointmentType;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
