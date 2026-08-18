import { IsOptional, IsString } from 'class-validator';

export class ReleaseBedDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
