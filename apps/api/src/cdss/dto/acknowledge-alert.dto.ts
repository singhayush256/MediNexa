import { IsString, IsOptional } from 'class-validator';

export class AcknowledgeAlertDto {
  @IsString()
  @IsOptional()
  notes?: string;
}
