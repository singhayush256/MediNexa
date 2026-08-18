import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class ReserveBedDto {
  @IsString()
  @IsNotEmpty({ message: 'Patient ID is required' })
  patientId!: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Expiration time must be at least 1 minute' })
  expiresInMinutes?: number;

  @IsOptional()
  @IsString()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
