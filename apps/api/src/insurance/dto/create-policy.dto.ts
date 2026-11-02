import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { InsuranceType, PolicyStatus } from '@prisma/client';

export class CreatePolicyDto {
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsString()
  @IsNotEmpty()
  insuranceProviderId!: string;

  @IsString()
  @IsNotEmpty()
  policyNumber!: string;

  @IsString()
  @IsOptional()
  memberId?: string;

  @IsNumber()
  @IsNotEmpty()
  coverageAmount!: number;

  @IsEnum(InsuranceType)
  @IsOptional()
  insuranceType?: InsuranceType;

  @IsEnum(PolicyStatus)
  @IsOptional()
  policyStatus?: PolicyStatus;

  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @IsDateString()
  @IsNotEmpty()
  validTill!: string;
}

export class UpdatePolicyDto {
  @IsNumber()
  @IsOptional()
  coverageAmount?: number;

  @IsNumber()
  @IsOptional()
  utilizedAmount?: number;

  @IsEnum(InsuranceType)
  @IsOptional()
  insuranceType?: InsuranceType;

  @IsEnum(PolicyStatus)
  @IsOptional()
  policyStatus?: PolicyStatus;

  @IsDateString()
  @IsOptional()
  validTill?: string;
}
