import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TransferAdmissionDto {
  @IsString()
  @IsNotEmpty({ message: 'Target bed ID is required' })
  targetBedId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
