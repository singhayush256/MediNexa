import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateJournalEntryDto {
  @IsString()
  @IsNotEmpty()
  debitAccountId!: string;

  @IsString()
  @IsNotEmpty()
  creditAccountId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  narration!: string;
}
