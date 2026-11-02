import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LabTestItemInputDto {
  @IsNotEmpty()
  @IsString()
  testName!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  referenceRange?: string;

  @IsOptional()
  @IsString()
  unit?: string;
}

export class CreateLabOrderDto {
  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  encounterId?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsString()
  admissionId?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  clinicalNotes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabTestItemInputDto)
  tests?: LabTestItemInputDto[];

  @IsOptional()
  @IsArray()
  testIds?: string[];
}
