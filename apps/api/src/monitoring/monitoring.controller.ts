import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { VitalsStreamDto } from './dto/vitals-stream.dto';
import { AcknowledgeAlertDto } from './dto/acknowledge-alert.dto';
import { UpdateDeviceStatusDto } from './dto/update-device-status.dto';
import { DeviceStatus, DeviceType, AlertSeverity } from '@prisma/client';

@Controller('monitoring')
@UseGuards(JwtAuthGuard)
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  // 1. REGISTER MEDICAL DEVICE
  @Post('devices')
  async registerDevice(@Body() dto: RegisterDeviceDto, @Req() req: any) {
    return this.monitoringService.registerDevice(dto, req.user);
  }

  // 2. LIST FACILITY DEVICES
  @Get('devices')
  async listDevices(
    @Query('facilityId') facilityId: string,
    @Query('status') status: DeviceStatus,
    @Query('type') type: DeviceType,
    @Req() req: any,
  ) {
    return this.monitoringService.listDevices(req.user, facilityId, status, type);
  }

  // 3. UPDATE DEVICE STATUS
  @Patch('devices/:id/status')
  async updateDeviceStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDeviceStatusDto,
    @Req() req: any,
  ) {
    return this.monitoringService.updateDeviceStatus(id, dto, req.user);
  }

  // 4. PUSH REAL-TIME VITALS STREAM
  @Post('vitals')
  async pushVitals(@Body() dto: VitalsStreamDto, @Req() req: any) {
    return this.monitoringService.pushVitals(dto, req.user);
  }

  // 5. PATIENT VITAL HISTORY
  @Get('patient/:id/vitals')
  async getPatientVitals(
    @Param('id') patientId: string,
    @Query('limit') limit: number,
    @Req() req: any,
  ) {
    return this.monitoringService.getPatientVitals(patientId, req.user, limit);
  }

  // 6. VITAL TREND ANALYTICS
  @Get('patient/:id/trends')
  async getPatientTrends(@Param('id') patientId: string, @Req() req: any) {
    return this.monitoringService.getPatientTrends(patientId, req.user);
  }

  // 7. ACTIVE ALERTS DASHBOARD
  @Get('alerts')
  async getAlerts(
    @Query('facilityId') facilityId: string,
    @Query('acknowledged') acknowledged: boolean,
    @Query('severity') severity: AlertSeverity,
    @Req() req: any,
  ) {
    return this.monitoringService.getAlerts(req.user, facilityId, acknowledged, severity);
  }

  // 8. ACKNOWLEDGE ALERT
  @Patch('alerts/:id/acknowledge')
  async acknowledgeAlert(
    @Param('id') id: string,
    @Body() dto: AcknowledgeAlertDto,
    @Req() req: any,
  ) {
    return this.monitoringService.acknowledgeAlert(id, dto, req.user);
  }

  // 9. MONITORING ANALYTICS
  @Get('analytics')
  async getAnalytics(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.monitoringService.getAnalytics(req.user, facilityId);
  }
}
