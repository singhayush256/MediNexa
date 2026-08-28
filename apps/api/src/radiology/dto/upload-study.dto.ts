import { IsNotEmpty, IsString, IsOptional, IsInt, IsArray } from 'class-validator';

export class FileInputDto {
  @IsNotEmpty()
  @IsString()
  fileName!: string;

  @IsNotEmpty()
  @IsString()
  fileUrl!: string;

  @IsOptional()
  @IsInt()
  fileSize?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;
}

export class UploadStudyDto {
  @IsNotEmpty()
  @IsString()
  imagingOrderId!: string;

  @IsOptional()
  @IsString()
  dicomStudyUid?: string;

  @IsOptional()
  @IsInt()
  imageCount?: number;

  @IsOptional()
  @IsArray()
  files?: FileInputDto[];
}
