import { IsOptional, IsString } from 'class-validator';

export class StartTrialDto {
  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsString()
  organizationName?: string;

  @IsOptional()
  @IsString()
  planCode?: string;
}
