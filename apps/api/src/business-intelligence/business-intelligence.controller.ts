import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { BusinessIntelligenceService } from './business-intelligence.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bi')
@UseGuards(JwtAuthGuard)
export class BusinessIntelligenceController {
  constructor(private readonly biService: BusinessIntelligenceService) {}

  // 1. EXECUTIVE COMMAND CENTER DASHBOARD
  @Get('executive-dashboard')
  async getExecutiveDashboard(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.biService.getExecutiveDashboard(req.user, facilityId);
  }

  // 2. REVENUE TRENDS & CHARTS
  @Get('revenue-trends')
  async getRevenueTrends(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.biService.getRevenueTrends(req.user, facilityId);
  }

  // 3. BED ANALYTICS & OCCUPANCY
  @Get('bed-analytics')
  async getBedAnalytics(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.biService.getBedAnalytics(req.user, facilityId);
  }

  // 4. DOCTOR PRODUCTIVITY LEADERBOARD
  @Get('doctor-productivity')
  async getDoctorProductivity(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.biService.getDoctorProductivity(req.user, facilityId);
  }

  // 5. PATIENT FLOW FUNNEL
  @Get('patient-flow')
  async getPatientFlow(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.biService.getPatientFlow(req.user, facilityId);
  }

  // 6. FINANCIAL SUMMARY
  @Get('financial-summary')
  async getFinancialSummary(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.biService.getFinancialSummary(req.user, facilityId);
  }

  // 7. AGGREGATED KPI ANALYTICS
  @Get('analytics')
  async getAggregatedAnalytics(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.biService.getAggregatedAnalytics(req.user, facilityId);
  }
}
