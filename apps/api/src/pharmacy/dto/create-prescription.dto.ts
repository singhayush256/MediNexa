import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class PrescriptionItemInputDto {
  @IsString()
  @IsNotEmpty({ message: 'Medication ID is required' })
  medicationId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Dosage is required' })
  dosage!: string;

  @IsString()
  @IsNotEmpty({ message: 'Frequency is required' })
  frequency!: string;

  @IsString()
  @IsNotEmpty({ message: 'Route is required' })
  route!: string;

  @IsString()
  @IsNotEmpty({ message: 'Duration is required' })
  duration!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  refillsAllowed?: number;
}

export class CreatePrescriptionDto {
  @IsString()
  @IsNotEmpty({ message: 'Encounter ID is required' })
  encounterId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemInputDto)
  items!: PrescriptionItemInputDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
