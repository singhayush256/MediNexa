import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';

export class ControlledAuditDto {
  @IsNotEmpty()
  @IsString()
  drugMasterId!: string;

  @IsNotEmpty()
  @IsString()
  drugBatchId!: string;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsNotEmpty()
  @IsString()
  action!: string; // "DISPENSE" | "DISCARD" | "AUDIT_CHECK"

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity!: number;

  @IsNotEmpty()
  @IsString()
  witnessNurseId!: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
