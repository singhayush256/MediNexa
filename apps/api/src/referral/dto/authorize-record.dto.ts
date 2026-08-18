import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { RecordAuthorizationType } from '@medinexa/types';

export class AuthorizeRecordAccessDto {
  @IsEnum(RecordAuthorizationType, { message: 'Authorization type must be a valid RecordAuthorizationType enum' })
  authorizationType!: RecordAuthorizationType;

  @IsOptional()
  @IsNumber()
  expiresInDays?: number;
}
