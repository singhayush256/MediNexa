import { IsNotEmpty, IsString } from 'class-validator';

export class SendChatMessageDto {
  @IsNotEmpty()
  @IsString()
  sessionId!: string;

  @IsNotEmpty()
  @IsString()
  message!: string;
}
