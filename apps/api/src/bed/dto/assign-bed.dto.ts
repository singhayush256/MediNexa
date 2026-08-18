import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AssignBedDto {
  @IsString()
  @IsNotEmpty({ message: 'Patient ID is required' })
  patientId!: string;

  @IsOptional()
  @IsString()
  reservationId?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
