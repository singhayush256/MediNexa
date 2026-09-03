import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CommandCenterService } from './command-center.service';
import { CreateExecutiveAlertDto } from './dto/create-alert.dto';
import { RoleCode } from '@medinexa/types';

@Controller('command-center')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, 'ADMIN', 'SUPER_ADMIN')
export class CommandCenterController {
  constructor(private readonly commandCenterService: CommandCenterService) {}

  @Get('dashboard')
  async getDashboard(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.commandCenterService.getDashboard(req.user, facilityId);
  }

  @Get('revenue')
  async getRevenue(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.commandCenterService.getRevenue(req.user, facilityId);
  }

  @Get('occupancy')
  async getOccupancy(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.commandCenterService.getOccupancy(req.user, facilityId);
  }

  @Get('patient-flow')
  async getPatientFlow(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.commandCenterService.getPatientFlow(req.user, facilityId);
  }

  @Get('doctor-performance')
  async getDoctorPerformance(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.commandCenterService.getDoctorPerformance(req.user, facilityId);
  }

  @Get('lab-performance')
  async getLabPerformance(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.commandCenterService.getLabPerformance(req.user, facilityId);
  }

  @Get('pharmacy-performance')
  async getPharmacyPerformance(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.commandCenterService.getPharmacyPerformance(req.user, facilityId);
  }

  @Get('emergency-performance')
  async getEmergencyPerformance(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.commandCenterService.getEmergencyPerformance(req.user, facilityId);
  }

  @Get('telemedicine-performance')
  async getTelemedicinePerformance(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.commandCenterService.getTelemedicinePerformance(req.user, facilityId);
  }

  @Get('alerts')
  async getAlerts(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.commandCenterService.getAlerts(req.user, facilityId);
  }

  @Post('alerts')
  async createAlert(@Body() dto: CreateExecutiveAlertDto, @Req() req: any) {
    return this.commandCenterService.createAlert(dto, req.user);
  }

  @Post('alerts/:id/acknowledge')
  async acknowledgeAlert(@Param('id') id: string, @Req() req: any) {
    return this.commandCenterService.acknowledgeAlert(id, req.user);
  }

  @Post('alerts/:id/resolve')
  async resolveAlert(@Param('id') id: string, @Req() req: any) {
    return this.commandCenterService.resolveAlert(id, req.user);
  }
}
