import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommandCenterService } from './command-center.service';
import { CreateExecutiveAlertDto } from './dto/create-alert.dto';

@Controller('command-center')
export class CommandCenterController {
  constructor(private readonly commandCenterService: CommandCenterService) {}

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async getDashboard(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.commandCenterService.getDashboard(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('revenue')
  async getRevenue(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.commandCenterService.getRevenue(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('occupancy')
  async getOccupancy(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.commandCenterService.getOccupancy(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('patient-flow')
  async getPatientFlow(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.commandCenterService.getPatientFlow(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('doctor-performance')
  async getDoctorPerformance(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.commandCenterService.getDoctorPerformance(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('lab-performance')
  async getLabPerformance(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.commandCenterService.getLabPerformance(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pharmacy-performance')
  async getPharmacyPerformance(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.commandCenterService.getPharmacyPerformance(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('emergency-performance')
  async getEmergencyPerformance(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.commandCenterService.getEmergencyPerformance(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('telemedicine-performance')
  async getTelemedicinePerformance(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.commandCenterService.getTelemedicinePerformance(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('alerts')
  async getAlerts(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.commandCenterService.getAlerts(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('alerts')
  async createAlert(@Body() dto: CreateExecutiveAlertDto, @Req() req: any) {
    return this.commandCenterService.createAlert(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('alerts/:id/acknowledge')
  async acknowledgeAlert(@Param('id') id: string, @Req() req: any) {
    return this.commandCenterService.acknowledgeAlert(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('alerts/:id/resolve')
  async resolveAlert(@Param('id') id: string, @Req() req: any) {
    return this.commandCenterService.resolveAlert(id, req.user);
  }
}
