import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ClaimType } from '@prisma/client';

export class CreateInsuranceClaimDto {
  @IsNotEmpty()
  @IsString()
  patientId!: string;

  @IsOptional()
  @IsString()
  admissionId?: string;

  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsOptional()
  @IsString()
  insuranceProviderId?: string;

  @IsOptional()
  @IsString()
  patientInsuranceId?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsEnum(ClaimType)
  claimType?: ClaimType;

  @IsNotEmpty()
  @IsNumber()
  amountClaimed!: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
