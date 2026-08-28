import { IsNotEmpty, IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class RecordPaymentDto {
  @IsNotEmpty()
  @IsString()
  invoiceId!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsNotEmpty()
  @IsString()
  paymentMethod!: string; // CASH, CARD, UPI, NET_BANKING, INSURANCE, CHEQUE

  @IsOptional()
  @IsString()
  transactionReference?: string;
}
