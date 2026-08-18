import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { LabTestCategory } from '@medinexa/types';

export class CreateLabTestDto {
  @IsString()
  @IsNotEmpty({ message: 'Lab test code is required' })
  code!: string;

  @IsString()
  @IsNotEmpty({ message: 'Lab test name is required' })
  name!: string;

  @IsEnum(LabTestCategory, { message: 'Category must be a valid LabTestCategory enum' })
  category!: LabTestCategory;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'Specimen type is required' })
  specimenType!: string;

  @IsNumber()
  @Min(1)
  turnaroundTimeMinutes!: number;

  @IsNumber()
  @Min(0)
  price!: number;
}
