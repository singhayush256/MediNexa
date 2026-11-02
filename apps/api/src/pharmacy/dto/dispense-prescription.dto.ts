import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class DispensePrescriptionDto {
  @IsString()
  @IsNotEmpty({ message: 'Prescription Item ID is required' })
  prescriptionItemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  @IsNotEmpty({ message: 'Batch number is required for medication dispensing' })
  batchNumber!: string;

  @IsString()
  @IsNotEmpty({ message: 'Expiration date is required for medication dispensing' })
  expirationDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
