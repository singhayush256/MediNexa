import { IsNotEmpty, IsString, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';

export class CreateRFQDto {
  @IsNotEmpty()
  @IsString()
  requisitionId!: string;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsNotEmpty()
  @IsDateString()
  submissionDeadline!: string;
}

export class SubmitQuotationResponseDto {
  @IsNotEmpty()
  @IsString()
  vendorId!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quotedAmount!: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  deliveryDays!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
