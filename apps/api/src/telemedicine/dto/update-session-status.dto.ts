import { IsOptional, IsString } from 'class-validator';

export class UpdateSessionStatusDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
