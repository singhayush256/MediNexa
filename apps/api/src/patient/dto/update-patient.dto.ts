import { IsArray, IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EmergencyContactInputDto } from './create-patient.dto';

export class UpdatePatientDto {
  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid ISO date string' })
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  gender?: string;

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
