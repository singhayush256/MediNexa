import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateCapaDto {
  @IsOptional()
  @IsString()
  auditId?: string;

  @IsOptional()
  @IsString()
  incidentId?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsNotEmpty()
  @IsString()
  correctiveAction!: string;

  @IsNotEmpty()
  @IsString()
  preventiveAction!: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;
}
