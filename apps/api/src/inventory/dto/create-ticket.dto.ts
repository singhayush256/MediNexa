import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { MaintenancePriority } from '@prisma/client';

export class CreateMaintenanceTicketDto {
  @IsNotEmpty()
  @IsString()
  assetId!: string;

  @IsNotEmpty()
  @IsString()
  issueDescription!: string;

  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;

  @IsOptional()
  @IsString()
  assignedTo?: string;
}

export class ResolveMaintenanceTicketDto {
  @IsNotEmpty()
  @IsString()
  resolutionNotes!: string;
}
