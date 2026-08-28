import { IsNotEmpty, IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateClaimDto {
  @IsNotEmpty()
  @IsString()
  invoiceId!: string;

  @IsNotEmpty()
  @IsString()
  providerId!: string;

  @IsNotEmpty()
  @IsString()
  patientId!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  claimAmount!: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class ProcessClaimDto {
  @IsOptional()
  @IsNumber()
  approvedAmount?: number;

  @IsOptional()
  @IsNumber()
  rejectedAmount?: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
