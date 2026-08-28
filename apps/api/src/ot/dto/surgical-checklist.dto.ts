import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class SurgicalChecklistDto {
  @IsNotEmpty()
  @IsString()
  surgeryId!: string;

  @IsOptional()
  @IsBoolean()
  signInCompleted?: boolean;

  @IsOptional()
  @IsBoolean()
  timeOutCompleted?: boolean;

  @IsOptional()
  @IsBoolean()
  signOutCompleted?: boolean;
}
