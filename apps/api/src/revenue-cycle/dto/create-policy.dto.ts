import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePatientPolicyDto {
  @IsNotEmpty()
  @IsString()
  patientId!: string;

  @IsNotEmpty()
  @IsString()
  insuranceProviderId!: string;

  @IsNotEmpty()
  @IsString()
  policyNumber!: string;

  @IsOptional()
  @IsString()
  memberId?: string;

  @IsNotEmpty()
  @IsNumber()
  coverageAmount!: number;

  @IsOptional()
  validFrom?: string | Date;

  @IsNotEmpty()
  validTill!: string | Date;
}
