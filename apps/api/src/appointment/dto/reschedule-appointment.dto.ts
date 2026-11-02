import { IsString, IsOptional } from 'class-validator';

export class RescheduleAppointmentDto {
  @IsString()
  appointmentDate!: string;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
