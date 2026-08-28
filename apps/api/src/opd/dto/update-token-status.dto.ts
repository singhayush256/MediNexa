import { IsOptional, IsString } from 'class-validator';

export class UpdateTokenStatusDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
