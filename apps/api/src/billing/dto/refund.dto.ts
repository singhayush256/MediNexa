import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class ProcessRefundDto {
  @IsNotEmpty()
  @IsString()
  invoiceId!: string;

  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsNotEmpty()
  @IsString()
  reason!: string;
}
