import { IsOptional, IsString } from 'class-validator';

export class VerifyReportDto {
  @IsOptional()
  @IsString()
  verificationNotes?: string;
}
