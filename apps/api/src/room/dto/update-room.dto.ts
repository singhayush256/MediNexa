import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { RoomType, RoomStatus } from '@medinexa/types';

export class UpdateRoomDto {
  @IsOptional()
  @IsEnum(RoomType)
  roomType?: RoomType;

  @IsOptional()
  @IsString()
  floor?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;
}
