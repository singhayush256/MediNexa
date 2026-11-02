import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { NoteType } from '@medinexa/types';

export class CreateClinicalNoteDto {
  @IsEnum(NoteType, { message: 'Note type must be a valid NoteType enum' })
  noteType!: NoteType;

  @IsString()
  @IsNotEmpty({ message: 'Note content is required' })
  content!: string;
}
