import { IsNotEmpty, IsString, IsOptional, IsEmail, IsNumber } from 'class-validator';

export class CreateGuestBookingDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsNotEmpty()
  @IsString()
  doctorId!: string;

  @IsNotEmpty()
  @IsString()
  facilityId!: string;

  @IsNotEmpty()
  @IsString()
  appointmentDate!: string;

  @IsNotEmpty()
  @IsString()
  startTime!: string;

  @IsNotEmpty()
  @IsString()
  endTime!: string;

  @IsNotEmpty()
  @IsString()
  reason!: string;

  @IsNotEmpty()
  @IsString()
  verificationToken!: string;
}
