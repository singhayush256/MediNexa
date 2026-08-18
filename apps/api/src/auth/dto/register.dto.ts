import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { RoleCode } from '@medinexa/types';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(RoleCode, { message: 'Role must be a valid MediNexa role' })
  @IsNotEmpty({ message: 'Role is required' })
  role!: RoleCode;
}
