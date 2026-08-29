import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class RecordTransfusionDto {
  @IsString()
  @IsNotEmpty()
  requestId!: string;

  @IsString()
  @IsNotEmpty()
  unitId!: string;

  @IsString()
  @IsOptional()
  witnessNurseId?: string;

  @IsBoolean()
  @IsOptional()
  adverseReaction?: boolean;

  @IsString()
  @IsOptional()
  reactionDetails?: string;

  @IsString()
  @IsOptional()
  preVitals?: string;

  @IsString()
  @IsOptional()
  postVitals?: string;
}
