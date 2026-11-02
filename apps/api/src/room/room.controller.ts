import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode, RoomStatus } from '@medinexa/types';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async getRooms(
    @Query('wardId') wardId?: string,
    @Query('facilityId') facilityId?: string,
    @Query('status') status?: RoomStatus,
    @Request() req?: any,
  ) {
    return this.roomService.getRooms({ wardId, facilityId, status }, req?.user);
  }

  @Get(':id')
  async getRoomById(@Param('id') id: string) {
    return this.roomService.getRoomById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post()
  async createRoom(@Body() dto: CreateRoomDto, @Request() req: any) {
    return this.roomService.createRoom(dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Patch(':id')
  async updateRoom(
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
    @Request() req: any,
  ) {
    return this.roomService.updateRoom(id, dto, req.user);
  }
}
