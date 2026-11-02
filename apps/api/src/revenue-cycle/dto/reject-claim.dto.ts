import { IsNotEmpty, IsString } from 'class-validator';

export class RejectClaimDto {
  @IsNotEmpty()
  @IsString()
  remarks!: string;
}
