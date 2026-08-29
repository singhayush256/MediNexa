import { IsNotEmpty, IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateVendorPaymentDto {
  @IsNotEmpty()
  @IsString()
  vendorInvoiceId!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string; // NEFT, RTGS, WIRE, CHEQUE, UPI

  @IsOptional()
  @IsString()
  paymentReference?: string;
}
