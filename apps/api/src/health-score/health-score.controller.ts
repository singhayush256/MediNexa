import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HealthScoreService } from './health-score.service';
import {
  CreateFamilyDoctorDto,
  CreateEmergencyFamilyDto,
  UpdateEmergencyThresholdDto,
  TriggerSosDto,
} from './dto/guardian.dto';

@UseGuards(JwtAuthGuard)
@Controller('health-score')
export class HealthScoreController {
  constructor(private readonly healthScoreService: HealthScoreService) {}

  // 1. Current Live Health Score
  @Get('me')
  async getMyHealthScore(@Req() req: any, @Query('patientId') patientId?: string) {
    return this.healthScoreService.getPatientHealthScore(req.user, patientId);
  }

  // 2. Force Recalculate Live Score
  @Post('recalculate')
  async recalculateScore(@Req() req: any, @Query('patientId') patientId?: string) {
    const patient = await this.healthScoreService.resolvePatientProfile(req.user, patientId);
    await this.healthScoreService.calculateAndPersist(patient.id);
    return this.healthScoreService.getPatientHealthScore(req.user, patient.id);
  }

  // 3. Health History Timeline (Today, Yesterday, 7d, 30d, 6m, 1y)
  @Get('history')
  async getHistory(@Req() req: any, @Query('range') range?: string, @Query('patientId') patientId?: string) {
    return this.healthScoreService.getHealthHistory(req.user, range || '7d', patientId);
  }

  // 4. Health Analytics & Risk Trends
  @Get('analytics')
  async getAnalytics(@Req() req: any, @Query('patientId') patientId?: string) {
    return this.healthScoreService.getHealthAnalytics(req.user, patientId);
  }

  // 5. Emergency Guardian - Family Doctors
  @Get('guardian/doctors')
  async getFamilyDoctors(@Req() req: any) {
    return this.healthScoreService.getFamilyDoctors(req.user);
  }

  @Post('guardian/doctors')
  async addFamilyDoctor(@Req() req: any, @Body() dto: CreateFamilyDoctorDto) {
    return this.healthScoreService.addFamilyDoctor(req.user, dto);
  }

  @Delete('guardian/doctors/:id')
  async removeFamilyDoctor(@Req() req: any, @Param('id') id: string) {
    return this.healthScoreService.removeFamilyDoctor(req.user, id);
  }

  // 6. Emergency Guardian - Family Members & Priority Levels
  @Get('guardian/family')
  async getEmergencyFamily(@Req() req: any) {
    return this.healthScoreService.getEmergencyFamilyMembers(req.user);
  }

  @Post('guardian/family')
  async addEmergencyFamily(@Req() req: any, @Body() dto: CreateEmergencyFamilyDto) {
    return this.healthScoreService.addEmergencyFamilyMember(req.user, dto);
  }

  @Delete('guardian/family/:id')
  async deleteEmergencyFamily(@Req() req: any, @Param('id') id: string) {
    return this.healthScoreService.deleteEmergencyFamilyMember(req.user, id);
  }

  // 7. Emergency Guardian - Configurable Thresholds
  @Get('guardian/thresholds')
  async getThresholds(@Req() req: any) {
    return this.healthScoreService.getEmergencyThresholds(req.user);
  }

  @Put('guardian/thresholds')
  async updateThresholds(@Req() req: any, @Body() dto: UpdateEmergencyThresholdDto) {
    return this.healthScoreService.updateEmergencyThresholds(req.user, dto);
  }

  // 8. Emergency Guardian - Manual SOS Trigger with GPS
  @Post('guardian/sos')
  async triggerSos(@Req() req: any, @Body() dto: TriggerSosDto) {
    return this.healthScoreService.triggerEmergencySos(req.user, dto);
  }

  // 9. Doctor Risk Monitoring (For Doctor Dashboard)
  @Get('doctor/monitoring')
  async getDoctorRiskMonitoring(@Req() req: any) {
    return this.healthScoreService.getDoctorRiskMonitoring(req.user);
  }

  // 10. Admin Health Monitoring Center (For Admin / Command Center)
  @Get('admin/center')
  async getAdminHealthMonitoringCenter() {
    return this.healthScoreService.getAdminHealthMonitoringCenter();
  }
}
