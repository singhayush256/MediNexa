import { IsOptional, IsString } from 'class-validator';

export class UpdateEmergencyVisitDto {
  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
