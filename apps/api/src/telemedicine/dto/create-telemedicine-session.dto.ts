import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTelemedicineSessionDto {
  @IsNotEmpty()
  @IsString()
  patientId!: string;

  @IsNotEmpty()
  @IsString()
  doctorId!: string;

  @IsOptional()
  @IsString()
  appointmentId?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsString()
  scheduledStartTime?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
