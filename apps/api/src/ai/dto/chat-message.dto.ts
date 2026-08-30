import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class ChatMessageDto {
  @IsNotEmpty()
  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  taskType?: string;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}
