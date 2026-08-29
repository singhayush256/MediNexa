import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ClaimPaymentDto {
  @IsNotEmpty()
  @IsNumber()
  amountPaid!: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
