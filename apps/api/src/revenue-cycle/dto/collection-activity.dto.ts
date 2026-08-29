import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateCollectionActivityDto {
  @IsNotEmpty()
  @IsString()
  receivableId!: string;

  @IsNotEmpty()
  @IsString()
  activityType!: string; // CALL, EMAIL, SMS, LEGAL_NOTICE, VISIT

  @IsNotEmpty()
  @IsString()
  notes!: string;

  @IsOptional()
  @IsString()
  nextFollowUpDate?: string;
}
