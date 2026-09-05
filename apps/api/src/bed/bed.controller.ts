import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { BedService } from './bed.service';
import { CreateBedDto } from './dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto';
import { ReserveBedDto } from './dto/reserve-bed.dto';
import { AssignBedDto } from './dto/assign-bed.dto';
import { ReleaseBedDto } from './dto/release-bed.dto';
import { CleanBedDto } from './dto/clean-bed.dto';
import { MaintenanceBedDto } from './dto/maintenance-bed.dto';
import { TransferBedDto } from './dto/transfer-bed.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode, BedType, BedStatus } from '@medinexa/types';

@Controller('beds')
export class BedController {
  constructor(private readonly bedService: BedService) {}

  @Get()
  async getBeds(
    @Query('facilityId') facilityId?: string,
    @Query('wardId') wardId?: string,
    @Query('roomId') roomId?: string,
    @Query('bedType') bedType?: BedType,
    @Query('status') status?: BedStatus,
    @Request() req?: any,
  ) {
    return this.bedService.getBeds({ facilityId, wardId, roomId, bedType, status }, req?.user);
  }

  @Get('available')
  async getAvailableBeds(
    @Query('facilityId') facilityId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('wardId') wardId?: string,
    @Query('roomId') roomId?: string,
    @Query('bedType') bedType?: BedType,
    @Query('genderPolicy') genderPolicy?: string,
    @Request() req?: any,
  ) {
    return this.bedService.getAvailableBeds(
      {
        facilityId,
        departmentId,
        wardId,
        roomId,
        bedType,
        genderPolicy,
      },
      req?.user,
    );
  }

  @Get('analytics/occupancy')
  async getOccupancyAnalytics(
    @Query('facilityId') facilityId?: string,
    @Request() req?: any,
  ) {
    return this.bedService.getOccupancyAnalytics(facilityId, req?.user);
  }

  @Get('reports/occupancy')
  async getOccupancyReports(
    @Query('facilityId') facilityId?: string,
    @Query('timeframe') timeframe?: string,
    @Request() req?: any,
  ) {
    return this.bedService.getOccupancyReports(facilityId, timeframe, req?.user);
  }

  @Get(':id/history')
  async getBedHistory(@Param('id') id: string) {
    return this.bedService.getBedHistory(id);
  }

  @Get(':id')
  async getBedById(@Param('id') id: string) {
    return this.bedService.getBedById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post()
  async createBed(@Body() dto: CreateBedDto, @Request() req: any) {
    return this.bedService.createBed(dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Patch(':id')
  async updateBed(
    @Param('id') id: string,
    @Body() dto: UpdateBedDto,
    @Request() req: any,
  ) {
    return this.bedService.updateBed(id, dto, req.user);
  }

  // =========================================================================
  // DAY 5 OPERATIONAL LIFECYCLE ENDPOINTS
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.RECEPTIONIST, RoleCode.NURSE, RoleCode.DOCTOR)
  @Post(':id/reserve')
  async reserveBed(
    @Param('id') id: string,
    @Body() dto: ReserveBedDto,
    @Request() req: any,
  ) {
    return this.bedService.reserveBed(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.RECEPTIONIST, RoleCode.NURSE, RoleCode.DOCTOR)
  @Post(':id/cancel-reservation')
  async cancelReservation(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: any,
  ) {
    return this.bedService.cancelReservation(id, reason, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.RECEPTIONIST, RoleCode.NURSE, RoleCode.DOCTOR)
  @Post(':id/assign')
  async assignBed(
    @Param('id') id: string,
    @Body() dto: AssignBedDto,
    @Request() req: any,
  ) {
    return this.bedService.assignBed(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.RECEPTIONIST, RoleCode.NURSE, RoleCode.DOCTOR)
  @Post(':id/release')
  async releaseBed(
    @Param('id') id: string,
    @Body() dto: ReleaseBedDto,
    @Request() req: any,
  ) {
    return this.bedService.releaseBed(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.NURSE, RoleCode.RECEPTIONIST, RoleCode.DOCTOR)
  @Post(':id/clean')
  async cleanBed(
    @Param('id') id: string,
    @Body() dto: CleanBedDto,
    @Request() req: any,
  ) {
    return this.bedService.cleanBed(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.NURSE, RoleCode.RECEPTIONIST, RoleCode.DOCTOR)
  @Post(':id/maintenance')
  async setMaintenance(
    @Param('id') id: string,
    @Body() dto: MaintenanceBedDto,
    @Request() req: any,
  ) {
    return this.bedService.setMaintenance(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.NURSE, RoleCode.RECEPTIONIST, RoleCode.DOCTOR)
  @Post(':id/maintenance/complete')
  async completeMaintenance(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: any,
  ) {
    return this.bedService.completeMaintenance(id, reason, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.NURSE, RoleCode.RECEPTIONIST, RoleCode.DOCTOR)
  @Post(':id/transfer')
  async transferBed(
    @Param('id') id: string,
    @Body() dto: TransferBedDto,
    @Request() req: any,
  ) {
    return this.bedService.transferBed(id, dto, req.user);
  }

  /**
   * Direct Bed Status Update for Nurse, Receptionist, Doctor, Admin
   * Synchronizes bed status immediately across all views
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.RECEPTIONIST, RoleCode.NURSE, RoleCode.DOCTOR)
  @Patch(':id/status')
  async updateBedStatusDirect(
    @Param('id') id: string,
    @Body() body: { status: BedStatus; reason?: string },
    @Request() req: any,
  ) {
    return this.bedService.updateBedStatusDirect(id, body.status, body.reason, req.user);
  }
}
