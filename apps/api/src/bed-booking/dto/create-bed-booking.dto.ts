import { IsNotEmpty, IsOptional, IsString, IsEnum, IsEmail, IsDateString } from 'class-validator';
import { BedType } from '@medinexa/types';

export class CreateBedBookingDto {
  @IsString()
  @IsNotEmpty({ message: 'Facility ID is required' })
  facilityId!: string;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Patient full name is required' })
  patientName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Contact phone number is required' })
  patientPhone!: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address format' })
  patientEmail?: string;

  @IsEnum(BedType, { message: 'Valid bed type is required' })
  bedType!: BedType;

  @IsOptional()
  @IsString()
  priority?: string; // NORMAL, URGENT, HIGH

  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @IsOptional()
  @IsString()
  medicalCondition?: string;

  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
