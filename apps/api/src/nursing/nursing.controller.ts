import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { MedicationStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NursingService } from './nursing.service';
import { CreateNursingShiftDto } from './dto/create-nursing-shift.dto';
import { CreateVitalsFlowsheetDto } from './dto/create-vitals-flowsheet.dto';
import { AdministerMedicationDto } from './dto/administer-medication.dto';
import { UpdateMarStatusDto } from './dto/update-mar-status.dto';
import { RoleCode } from '@medinexa/types';

@Controller('nursing')
export class NursingController {
  constructor(private readonly nursingService: NursingService) {}

  private checkNurseOrAdminRole(user: any) {
    const role = user.roleCode || user.role?.code;
    if (role === RoleCode.RECEPTIONIST) {
      throw new ForbiddenException('Access denied: Receptionist role is not authorized for nursing operations.');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('shifts')
  async createShift(@Body() dto: CreateNursingShiftDto, @Req() req: any) {
    this.checkNurseOrAdminRole(req.user);
    return this.nursingService.createShift(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('shifts')
  async getShifts(@Req() req: any, @Query('facilityId') facilityId?: string) {
    this.checkNurseOrAdminRole(req.user);
    return this.nursingService.getShifts(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('shifts/:id/complete')
  async completeShift(
    @Param('id') id: string,
    @Body('handoverNotes') handoverNotes: string,
    @Req() req: any,
  ) {
    this.checkNurseOrAdminRole(req.user);
    return this.nursingService.completeShift(id, handoverNotes, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('vitals')
  async createVitals(@Body() dto: CreateVitalsFlowsheetDto, @Req() req: any) {
    this.checkNurseOrAdminRole(req.user);
    return this.nursingService.createVitals(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('vitals/:admissionId')
  async getVitalsHistory(@Param('admissionId') admissionId: string, @Req() req: any) {
    this.checkNurseOrAdminRole(req.user);
    return this.nursingService.getVitalsHistory(admissionId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mar/administer')
  async administerMedication(@Body() dto: AdministerMedicationDto, @Req() req: any) {
    this.checkNurseOrAdminRole(req.user);
    return this.nursingService.administerMedication(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('mar/:id/missed')
  async markMissed(
    @Param('id') id: string,
    @Body() dto: UpdateMarStatusDto,
    @Req() req: any,
  ) {
    this.checkNurseOrAdminRole(req.user);
    return this.nursingService.updateMarStatus(id, MedicationStatus.MISSED, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('mar/:id/refused')
  async markRefused(
    @Param('id') id: string,
    @Body() dto: UpdateMarStatusDto,
    @Req() req: any,
  ) {
    this.checkNurseOrAdminRole(req.user);
    return this.nursingService.updateMarStatus(id, MedicationStatus.REFUSED, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('mar/:id/held')
  async markHeld(
    @Param('id') id: string,
    @Body() dto: UpdateMarStatusDto,
    @Req() req: any,
  ) {
    this.checkNurseOrAdminRole(req.user);
    return this.nursingService.updateMarStatus(id, MedicationStatus.HELD, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mar/:admissionId')
  async getMarTimeline(@Param('admissionId') admissionId: string, @Req() req: any) {
    this.checkNurseOrAdminRole(req.user);
    return this.nursingService.getMarTimeline(admissionId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    this.checkNurseOrAdminRole(req.user);
    return this.nursingService.getAnalytics(req.user);
  }
}
