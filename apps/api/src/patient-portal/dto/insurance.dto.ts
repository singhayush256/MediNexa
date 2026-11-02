import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreatePatientInsuranceDto {
  @IsNotEmpty()
  @IsString()
  providerName!: string;

  @IsOptional()
  @IsString()
  policyholderName?: string;

  @IsNotEmpty()
  @IsString()
  policyNumber!: string;

  @IsOptional()
  @IsString()
  memberId?: string;

  @IsOptional()
  @IsString()
  policyType?: string;

  @IsOptional()
  coverageAmount?: number;

  @IsOptional()
  sumInsured?: number;

  @IsOptional()
  @IsString()
  validFrom?: string;

  @IsNotEmpty()
  @IsString()
  validTill!: string;

  @IsOptional()
  @IsString()
  tpaDetails?: string;

  @IsOptional()
  @IsString()
  customerSupportContact?: string;

  @IsOptional()
  @IsString()
  coveredDependants?: string;

  @IsOptional()
  @IsString()
  policyDocumentUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePatientInsuranceDto {
  @IsOptional()
  @IsString()
  providerName?: string;

  @IsOptional()
  @IsString()
  policyholderName?: string;

  @IsOptional()
  @IsString()
  policyNumber?: string;

  @IsOptional()
  @IsString()
  memberId?: string;

  @IsOptional()
  @IsString()
  policyType?: string;

  @IsOptional()
  coverageAmount?: number;

  @IsOptional()
  sumInsured?: number;

  @IsOptional()
  @IsString()
  validFrom?: string;

  @IsOptional()
  @IsString()
  validTill?: string;

  @IsOptional()
  @IsString()
  tpaDetails?: string;

  @IsOptional()
  @IsString()
  customerSupportContact?: string;

  @IsOptional()
  @IsString()
  coveredDependants?: string;

  @IsOptional()
  @IsString()
  policyDocumentUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
