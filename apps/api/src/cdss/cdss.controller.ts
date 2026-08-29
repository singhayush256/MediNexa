import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { CdssService } from './cdss.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckMedicationDto } from './dto/check-medication.dto';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { AcknowledgeAlertDto } from './dto/acknowledge-alert.dto';
import { OverrideAlertDto } from './dto/override-alert.dto';
import { AlertSeverity } from '@prisma/client';

@Controller('cdss')
@UseGuards(JwtAuthGuard)
export class CdssController {
  constructor(private readonly cdssService: CdssService) {}

  // 1. CHECK MEDICATION SAFETY (DRUG INTERACTIONS, ALLERGIES, CONTRAINDICATIONS)
  @Post('check-medications')
  async checkMedications(@Body() dto: CheckMedicationDto, @Req() req: any) {
    return this.cdssService.checkMedications(dto, req.user);
  }

  // 2. RECORD PATIENT ALLERGY
  @Post('allergies')
  async createAllergy(@Body() dto: CreateAllergyDto, @Req() req: any) {
    return this.cdssService.createAllergy(dto, req.user);
  }

  // 3. GET PATIENT ALLERGIES
  @Get('allergies/:patientId')
  async getPatientAllergies(@Param('patientId') patientId: string, @Req() req: any) {
    return this.cdssService.getPatientAllergies(patientId, req.user);
  }

  // 4. GET ACTIVE CDSS ALERTS
  @Get('alerts')
  async getAlerts(
    @Query('facilityId') facilityId: string,
    @Query('acknowledged') acknowledged: boolean,
    @Query('severity') severity: AlertSeverity,
    @Req() req: any,
  ) {
    return this.cdssService.getAlerts(req.user, facilityId, acknowledged, severity);
  }

  // 5. ACKNOWLEDGE CDSS ALERT
  @Patch('alerts/:id/acknowledge')
  async acknowledgeAlert(
    @Param('id') id: string,
    @Body() dto: AcknowledgeAlertDto,
    @Req() req: any,
  ) {
    return this.cdssService.acknowledgeAlert(id, dto, req.user);
  }

  // 6. OVERRIDE SAFETY ALERT (DOCTOR ONLY)
  @Post('alerts/override')
  async overrideAlert(@Body() dto: OverrideAlertDto, @Req() req: any) {
    return this.cdssService.overrideAlert(dto, req.user);
  }

  // 7. GET PATIENT SAFETY PROFILE
  @Get('patient/:patientId/safety-profile')
  async getSafetyProfile(@Param('patientId') patientId: string, @Req() req: any) {
    return this.cdssService.getSafetyProfile(patientId, req.user);
  }

  // 8. GET CDSS ANALYTICS
  @Get('analytics')
  async getAnalytics(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.cdssService.getAnalytics(req.user, facilityId);
  }
}
