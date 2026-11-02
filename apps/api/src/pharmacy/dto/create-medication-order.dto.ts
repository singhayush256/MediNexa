import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MedicationOrderItemDto {
  @IsNotEmpty()
  @IsString()
  medicineName!: string;

  @IsNotEmpty()
  @IsString()
  dosage!: string;

  @IsNotEmpty()
  @IsString()
  frequency!: string;

  @IsNotEmpty()
  @IsString()
  duration!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateMedicationOrderDto {
  @IsNotEmpty()
  @IsString()
  patientId!: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsString()
  prescriptionId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicationOrderItemDto)
  items!: MedicationOrderItemDto[];
}
