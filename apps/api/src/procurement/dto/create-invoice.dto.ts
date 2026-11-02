import { IsNotEmpty, IsString, IsNumber, Min, IsDateString, IsOptional } from 'class-validator';

export class CreateVendorInvoiceDto {
  @IsNotEmpty()
  @IsString()
  invoiceNumber!: string;

  @IsNotEmpty()
  @IsString()
  vendorId!: string;

  @IsNotEmpty()
  @IsString()
  purchaseOrderId!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  invoiceAmount!: number;

  @IsNotEmpty()
  @IsDateString()
  dueDate!: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
