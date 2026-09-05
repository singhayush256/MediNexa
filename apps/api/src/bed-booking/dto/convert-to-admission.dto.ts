import { IsOptional, IsString } from 'class-validator';

export class ConvertToAdmissionDto {
  @IsOptional()
  @IsString()
  bedId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  admittingDoctorId?: string;
}
