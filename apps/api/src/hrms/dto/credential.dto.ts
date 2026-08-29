import { IsNotEmpty, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateCredentialDto {
  @IsNotEmpty()
  @IsString()
  employeeId!: string;

  @IsNotEmpty()
  @IsString()
  credentialType!: string; // Medical License, Nursing License, Pharmacy Registration, Lab Certification

  @IsNotEmpty()
  @IsString()
  licenseNumber!: string;

  @IsNotEmpty()
  @IsDateString()
  issueDate!: string;

  @IsNotEmpty()
  @IsDateString()
  expiryDate!: string;

  @IsOptional()
  @IsString()
  verificationStatus?: string;
}
