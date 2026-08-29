import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateCorporateInvoiceDto {
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @IsNotEmpty()
  @IsString()
  contractId!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsNotEmpty()
  @IsString()
  dueDate!: string;

  @IsOptional()
  @IsString()
  status?: string;
}
