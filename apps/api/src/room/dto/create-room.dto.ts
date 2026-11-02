import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { RoomType } from '@medinexa/types';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty({ message: 'Ward ID is required' })
  wardId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Room number is required' })
  roomNumber!: string;

  @IsEnum(RoomType, { message: 'Room type must be a valid RoomType enum' })
  roomType!: RoomType;

  @IsOptional()
  @IsString()
  floor?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Capacity must be at least 1' })
  capacity?: number;
}
