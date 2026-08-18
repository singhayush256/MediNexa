import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class DispensePrescriptionDto {
  @IsString()
  @IsNotEmpty({ message: 'Prescription Item ID is required' })
  prescriptionItemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
