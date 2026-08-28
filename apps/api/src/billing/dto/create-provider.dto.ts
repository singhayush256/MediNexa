import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateInsuranceProviderDto {
  @IsNotEmpty()
  @IsString()
  providerName!: string;

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
