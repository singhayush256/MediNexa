import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateInsuranceProviderDto {
  @IsOptional()
  @IsString()
  providerName?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  contactDetails?: string;

  @IsOptional()
  @IsString()
  claimEmail?: string;

  @IsOptional()
  @IsString()
  policyValidationRules?: string;
}
