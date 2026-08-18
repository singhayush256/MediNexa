import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EncounterType } from '@medinexa/types';

export class CreateEncounterDto {
  @IsString()
  @IsNotEmpty({ message: 'Patient ID is required' })
  patientId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Doctor ID is required' })
  doctorId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Facility ID is required' })
  facilityId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Department ID is required' })
  departmentId!: string;

  @IsOptional()
  @IsString()
  admissionId?: string;

  @IsEnum(EncounterType, { message: 'Encounter type must be a valid EncounterType enum' })
  encounterType!: EncounterType;

  @IsOptional()
  @IsString()
  reasonForVisit?: string;
}
