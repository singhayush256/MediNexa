import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum, IsDateString } from 'class-validator';
import { BloodGroup } from '@prisma/client';

export class RegisterDonorDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(BloodGroup)
  bloodGroup!: BloodGroup;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  facilityId?: string;
}
