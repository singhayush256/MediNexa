import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class IssueBloodDto {
  @IsString()
  @IsNotEmpty()
  requestId!: string;

  @IsString()
  @IsNotEmpty()
  unitId!: string;

  @IsString()
  @IsOptional()
  issuedToStaffName?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}
