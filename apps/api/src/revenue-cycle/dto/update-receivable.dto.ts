import { IsOptional, IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { CollectionStatus } from '@prisma/client';

export class UpdateReceivableDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  outstandingAmount?: number;

  @IsOptional()
  @IsEnum(CollectionStatus)
  collectionStatus?: CollectionStatus;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;
}
