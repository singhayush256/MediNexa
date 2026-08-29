import { IsNotEmpty, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { IcuPatientStatus } from '@prisma/client';

export class UpdateAdmissionStatusDto {
  @IsNotEmpty()
  @IsEnum(IcuPatientStatus)
  status!: IcuPatientStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  apacheScore?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sofaScore?: number;
}
