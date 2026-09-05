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
} from '@nestjs/common';
import { EmergencyVisitStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmergencyService } from './emergency.service';
import { CreateEmergencyVisitDto } from './dto/create-emergency-visit.dto';
import { CreateTriageAssessmentDto } from './dto/create-triage-assessment.dto';
import { UpdateEmergencyVisitDto } from './dto/update-emergency-visit.dto';
import { OneClickSosDto } from './dto/one-click-sos.dto';

@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Get('nearest-critical-beds')
  async getNearestCriticalBeds(
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('bedType') bedType?: string,
    @Query('radiusKm') radiusKm?: number,
  ) {
    return this.emergencyService.findNearestCriticalBeds({
      latitude,
      longitude,
      bedType,
      radiusKm,
    });
  }

  @Post('one-click-sos')
  async triggerOneClickSos(@Body() dto: OneClickSosDto, @Req() req: any) {
    return this.emergencyService.triggerOneClickSos(dto, req?.user);
  }

  @Get('tracking/:dispatchId')
  async getAmbulanceTracking(@Param('dispatchId') dispatchId: string) {
    return this.emergencyService.getLiveAmbulanceTracking(dispatchId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('visit')
  async createVisit(@Body() dto: CreateEmergencyVisitDto, @Req() req: any) {
    return this.emergencyService.createVisit(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('triage')
  async createTriageAssessment(
    @Body() dto: CreateTriageAssessmentDto,
    @Req() req: any,
  ) {
    return this.emergencyService.createTriageAssessment(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('queue')
  async getEmergencyQueue(@Req() req: any, @Query('facilityId') facilityId?: string) {
    return this.emergencyService.getEmergencyQueue(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    return this.emergencyService.getAnalytics(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/start-treatment')
  async startTreatment(
    @Param('id') id: string,
    @Body() dto: UpdateEmergencyVisitDto,
    @Req() req: any,
  ) {
    return this.emergencyService.updateVisitStatus(
      id,
      EmergencyVisitStatus.IN_TREATMENT,
      dto,
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/admit')
  async admitPatient(
    @Param('id') id: string,
    @Body() dto: UpdateEmergencyVisitDto,
    @Req() req: any,
  ) {
    return this.emergencyService.updateVisitStatus(
      id,
      EmergencyVisitStatus.ADMITTED,
      dto,
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/discharge')
  async dischargePatient(
    @Param('id') id: string,
    @Body() dto: UpdateEmergencyVisitDto,
    @Req() req: any,
  ) {
    return this.emergencyService.updateVisitStatus(
      id,
      EmergencyVisitStatus.DISCHARGED,
      dto,
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/transfer')
  async transferPatient(
    @Param('id') id: string,
    @Body() dto: UpdateEmergencyVisitDto,
    @Req() req: any,
  ) {
    return this.emergencyService.updateVisitStatus(
      id,
      EmergencyVisitStatus.TRANSFERRED,
      dto,
      req.user,
    );
  }
}
