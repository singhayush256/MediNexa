import { IsNotEmpty, IsString } from 'class-validator';

export class AmendClinicalNoteDto {
  @IsString()
  @IsNotEmpty({ message: 'Amended content is required' })
  content!: string;

  @IsString()
  @IsNotEmpty({ message: 'Amendment reason is required' })
  reason!: string;
}
