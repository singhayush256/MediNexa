import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMedicationDto {
  @IsString()
  @IsNotEmpty({ message: 'Medication code is required' })
  code!: string;

  @IsString()
  @IsNotEmpty({ message: 'Generic name is required' })
  genericName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Brand name is required' })
  brandName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Strength is required' })
  strength!: string;

  @IsString()
  @IsNotEmpty({ message: 'Dosage form is required' })
  dosageForm!: string;

  @IsString()
  @IsNotEmpty({ message: 'Route is required' })
  route!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsBoolean()
  prescriptionRequired?: boolean;
}
