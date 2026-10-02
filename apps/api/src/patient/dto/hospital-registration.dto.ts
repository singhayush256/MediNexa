import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHospitalRegistrationDto {
  @IsString()
  @IsNotEmpty({ message: 'patientId or global UHID is required' })
  patientId!: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
