import { IsNotEmpty, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class RecordPaymentDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  paidAmount!: number;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
