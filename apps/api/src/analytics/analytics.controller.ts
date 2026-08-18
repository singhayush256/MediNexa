import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '@medinexa/types';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverviewAnalytics(@Request() req: any) {
    return this.analyticsService.getOverviewAnalytics(req.user);
  }

  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Get('facility/:facilityId')
  async getFacilityAnalytics(@Param('facilityId') facilityId: string, @Request() req: any) {
    return this.analyticsService.getFacilityAnalytics(facilityId, req.user);
  }

  @Roles(RoleCode.DOCTOR, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Get('appointments')
  async getAppointmentAnalytics(@Request() req: any) {
    return this.analyticsService.getAppointmentAnalytics(req.user);
  }

  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Get('beds')
  async getBedAnalytics(@Request() req: any) {
    return this.analyticsService.getBedAnalytics(req.user);
  }
}
