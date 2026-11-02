import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TransferBedDto {
  @IsString()
  @IsNotEmpty({ message: 'Target bed ID is required' })
  targetBedId!: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
