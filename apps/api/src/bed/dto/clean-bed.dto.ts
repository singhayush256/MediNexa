import { IsOptional, IsString } from 'class-validator';

export class CleanBedDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
