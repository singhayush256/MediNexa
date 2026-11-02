import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LabOrderPriority } from '@medinexa/types';

export class CreateLabOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'Encounter ID is required' })
  encounterId!: string;

  @IsArray({ message: 'testIds must be an array of LabTest IDs' })
  @ArrayMinSize(1, { message: 'At least one lab test must be selected' })
  testIds!: string[];

  @IsOptional()
  @IsEnum(LabOrderPriority, { message: 'Priority must be a valid LabOrderPriority enum' })
  priority?: LabOrderPriority;

  @IsOptional()
  @IsString()
  clinicalNotes?: string;
}
