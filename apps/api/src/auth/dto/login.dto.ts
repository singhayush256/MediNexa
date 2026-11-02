import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Email, Staff ID, or Employee ID is required' })
  @IsString()
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
