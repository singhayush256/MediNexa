import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ClaimType } from '@prisma/client';

export class CreateClaimDto {
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsString()
  @IsOptional()
  admissionId?: string;

  @IsString()
  @IsOptional()
  insuranceProviderId?: string;

  @IsString()
  @IsOptional()
  policyId?: string;

  @IsNumber()
  @IsNotEmpty()
  totalClaimAmount!: number;

  @IsEnum(ClaimType)
  @IsOptional()
  claimType?: ClaimType;

  @IsString()
  @IsOptional()
  facilityId?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}
