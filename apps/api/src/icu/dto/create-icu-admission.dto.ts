import { IsNotEmpty, IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { IcuPatientStatus } from '@prisma/client';

export class CreateIcuAdmissionDto {
  @IsNotEmpty()
  @IsString()
  patientId!: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsString()
  admissionId?: string;

  @IsOptional()
  @IsString()
  bedId?: string;

  @IsOptional()
  @IsEnum(IcuPatientStatus)
  status?: IcuPatientStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  apacheScore?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sofaScore?: number;
}
