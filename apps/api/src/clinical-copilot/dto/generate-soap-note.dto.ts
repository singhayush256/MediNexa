import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class GenerateSoapNoteDto {
  @IsNotEmpty()
  @IsString()
  chiefComplaint!: string;

  @IsNotEmpty()
  @IsString()
  symptoms!: string;

  @IsNotEmpty()
  @IsString()
  diagnosis!: string;

  @IsOptional()
  @IsString()
  medications?: string;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;
}
