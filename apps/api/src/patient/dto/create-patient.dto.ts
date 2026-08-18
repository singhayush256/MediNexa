import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class EmergencyContactInputDto {
  @IsString()
  @IsNotEmpty({ message: 'Emergency contact name is required' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Emergency contact relationship is required' })
  relationship!: string;

  @IsString()
  @IsNotEmpty({ message: 'Emergency contact phone is required' })
  phone!: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class CreatePatientDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsDateString({}, { message: 'Date of birth must be a valid ISO date string' })
  @IsNotEmpty({ message: 'Date of birth is required' })
  dateOfBirth!: string;

  @IsString()
  @IsNotEmpty({ message: 'Gender is required' })
  gender!: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactInputDto)
  emergencyContacts?: EmergencyContactInputDto[];
}
