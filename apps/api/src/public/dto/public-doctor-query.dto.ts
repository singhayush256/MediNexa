import { IsOptional, IsString } from 'class-validator';

export class PublicDoctorQueryDto {
  @IsOptional()
  @IsString()
  specialtyId?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
