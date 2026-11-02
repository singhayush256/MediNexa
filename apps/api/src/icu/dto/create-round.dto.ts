import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateRoundDto {
  @IsNotEmpty()
  @IsString()
  patientId!: string;

  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsNotEmpty()
  @IsString()
  diagnosis!: string;

  @IsNotEmpty()
  @IsString()
  assessment!: string;

  @IsNotEmpty()
  @IsString()
  treatmentPlan!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
