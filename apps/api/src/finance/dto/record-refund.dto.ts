import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class RecordRefundDto {
  @IsString()
  @IsNotEmpty()
  invoiceId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}
