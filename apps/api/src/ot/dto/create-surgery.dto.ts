import { IsNotEmpty, IsString, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SurgeryPriority, SurgeryStatus } from '@prisma/client';

export class SurgicalTeamMemberDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNotEmpty()
  @IsString()
  role!: string;
}

export class CreateSurgeryDto {
  @IsNotEmpty()
  @IsString()
  otId!: string;

  @IsNotEmpty()
  @IsString()
  patientId!: string;

  @IsNotEmpty()
  @IsString()
  leadSurgeonId!: string;

  @IsOptional()
  @IsString()
  anesthetistId?: string;

  @IsNotEmpty()
  @IsString()
  procedureName!: string;

  @IsOptional()
  @IsEnum(SurgeryPriority)
  priority?: SurgeryPriority;

  @IsOptional()
  @IsEnum(SurgeryStatus)
  status?: SurgeryStatus;

  @IsNotEmpty()
  @IsString()
  scheduledStartTime!: string;

  @IsNotEmpty()
  @IsString()
  scheduledEndTime!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SurgicalTeamMemberDto)
  teamMembers?: SurgicalTeamMemberDto[];
}
