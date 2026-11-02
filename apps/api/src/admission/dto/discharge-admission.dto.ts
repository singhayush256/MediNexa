import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DischargeAdmissionDto {
  @IsString()
  @IsNotEmpty({ message: 'Discharge reason is required' })
  dischargeReason!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
