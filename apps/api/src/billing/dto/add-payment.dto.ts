import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class AddPaymentDto {
  @IsNotEmpty()
  @IsString()
  invoiceId!: string;

  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  transactionReference?: string;
}

export class RecordPaymentDto extends AddPaymentDto {}
