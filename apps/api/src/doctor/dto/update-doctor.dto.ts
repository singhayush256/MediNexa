import { IsOptional, IsString } from 'class-validator';

export class UpdateDoctorDto {
  @IsOptional()
  @IsString()
  specialtyId?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
