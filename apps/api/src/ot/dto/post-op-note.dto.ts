import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class PostOpNoteDto {
  @IsNotEmpty()
  @IsString()
  surgeryId!: string;

  @IsOptional()
  @IsString()
  pacuStatus?: string;

  @IsNotEmpty()
  @IsString()
  recoveryInstructions!: string;
}
