import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class RecordPaymentDto {
  @IsString()
  @IsNotEmpty()
  invoiceId!: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod!: string; // CASH, CARD, UPI, NET_BANKING, INSURANCE

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @IsOptional()
  transactionReference?: string;
}
