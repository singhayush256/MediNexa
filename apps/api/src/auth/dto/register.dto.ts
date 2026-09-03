import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, IsBoolean } from 'class-validator';

export class RegisterDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-~`+=])[A-Za-z\d!@#$%^&*(),.?":{}|<>_\-~`+=]{8,}$/, {
    message: 'Password requirements not met: minimum 8 characters, one uppercase, one lowercase, one number, and one special character',
  })
  password!: string;

  @IsOptional()
  @IsString()
  confirmPassword?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  roleCode?: string;

  @IsOptional()
  @IsBoolean()
  termsAccepted?: boolean;
}
