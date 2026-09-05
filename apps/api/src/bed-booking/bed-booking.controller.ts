import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BedBookingService } from './bed-booking.service';
import { CreateBedBookingDto } from './dto/create-bed-booking.dto';
import { UpdateBedBookingStatusDto } from './dto/update-bed-booking-status.dto';
import { AllocateBedDto } from './dto/allocate-bed.dto';
import { ConvertToAdmissionDto } from './dto/convert-to-admission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode, BedBookingStatus } from '@medinexa/types';

@Controller('bed-bookings')
export class BedBookingController {
  constructor(private readonly bedBookingService: BedBookingService) {}

  @Post()
  async createBooking(@Body() dto: CreateBedBookingDto, @Request() req: any) {
    return this.bedBookingService.createBooking(dto, req?.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyBookings(@Request() req: any) {
    return this.bedBookingService.getMyBookings(req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.NURSE, RoleCode.RECEPTIONIST, RoleCode.DOCTOR)
  @Get()
  async getBookings(
    @Query('facilityId') facilityId?: string,
    @Query('status') status?: BedBookingStatus,
    @Query('bedType') bedType?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
    @Request() req?: any,
  ) {
    return this.bedBookingService.getBookings(
      { facilityId, status, bedType, priority, search },
      req?.user,
    );
  }

  @Post('process-expirations')
  async processExpirations(@Query('facilityId') facilityId?: string) {
    return this.bedBookingService.expireStaleBookings(facilityId);
  }

  @Get(':id')
  async getBookingById(@Param('id') id: string) {
    return this.bedBookingService.getBookingById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.NURSE, RoleCode.RECEPTIONIST)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBedBookingStatusDto,
    @Request() req: any,
  ) {
    return this.bedBookingService.updateStatus(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.NURSE, RoleCode.RECEPTIONIST)
  @Post(':id/allocate-bed')
  async allocateBed(
    @Param('id') id: string,
    @Body() dto: AllocateBedDto,
    @Request() req: any,
  ) {
    return this.bedBookingService.allocateBed(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.NURSE, RoleCode.RECEPTIONIST, RoleCode.DOCTOR)
  @Post(':id/convert-to-admission')
  async convertToAdmission(
    @Param('id') id: string,
    @Body() dto: ConvertToAdmissionDto,
    @Request() req: any,
  ) {
    return this.bedBookingService.convertToAdmission(id, dto, req.user);
  }
}
