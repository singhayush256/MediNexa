import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WardService } from '../ward/ward.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomStatus } from '@medinexa/types';

@Injectable()
export class RoomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wardService: WardService,
  ) {}

  async getRooms(filters: { wardId?: string; facilityId?: string; status?: RoomStatus }) {
    const where: any = {};
    if (filters.wardId) where.wardId = filters.wardId;
    if (filters.status) where.status = filters.status;
    if (filters.facilityId) where.ward = { facilityId: filters.facilityId };

    const rooms = await this.prisma.room.findMany({
      where,
      include: {
        ward: {
          select: { id: true, name: true, code: true, facilityId: true },
        },
        _count: { select: { beds: true } },
      },
      orderBy: { roomNumber: 'asc' },
    });

    return rooms.map((r) => ({
      ...r,
      totalBeds: r._count.beds,
    }));
  }

  async getRoomById(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        ward: {
          include: { facility: true, department: true },
        },
        beds: true,
        _count: { select: { beds: true } },
      },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID '${id}' not found`);
    }

    return {
      ...room,
      totalBeds: room._count.beds,
    };
  }

  async createRoom(dto: CreateRoomDto, requestingUser: any) {
    // 1. Verify ward existence
    const ward = await this.prisma.ward.findUnique({ where: { id: dto.wardId } });
    if (!ward) {
      throw new BadRequestException(`Ward with ID '${dto.wardId}' not found`);
    }

    // 2. Multi-hospital security validation
    await this.wardService.validateFacilityAccess(ward.facilityId, requestingUser);

    // 3. Duplicate room number check within same ward
    const existingRoom = await this.prisma.room.findUnique({
      where: {
        wardId_roomNumber: {
          wardId: dto.wardId,
          roomNumber: dto.roomNumber,
        },
      },
    });

    if (existingRoom) {
      throw new BadRequestException(
        `Room number '${dto.roomNumber}' already exists in ward '${ward.name}'`,
      );
    }

    return this.prisma.room.create({
      data: {
        wardId: dto.wardId,
        roomNumber: dto.roomNumber,
        roomType: dto.roomType,
        floor: dto.floor || ward.floor || null,
        capacity: dto.capacity || 1,
        status: RoomStatus.ACTIVE,
      },
      include: {
        ward: true,
      },
    });
  }

  async updateRoom(id: string, dto: UpdateRoomDto, requestingUser: any) {
    const room = await this.getRoomById(id);

    // Multi-hospital security validation
    await this.wardService.validateFacilityAccess(room.ward.facilityId, requestingUser);

    return this.prisma.room.update({
      where: { id },
      data: {
        roomType: dto.roomType,
        floor: dto.floor,
        capacity: dto.capacity,
        status: dto.status,
      },
      include: {
        ward: true,
      },
    });
  }
}
