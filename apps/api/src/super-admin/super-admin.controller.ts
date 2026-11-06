import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SuperAdminService, CreateSuperAdminHospitalDto } from './super-admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '@medinexa/types';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleCode.MEDINEXA_ADMIN, 'SUPER_ADMIN')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('overview')
  @HttpCode(HttpStatus.OK)
  async getOverview() {
    return this.superAdminService.getPlatformOverview();
  }

  @Get('hospitals')
  @HttpCode(HttpStatus.OK)
  async getHospitals() {
    return this.superAdminService.getHospitals();
  }

  @Get('hospitals/:id')
  @HttpCode(HttpStatus.OK)
  async getHospitalById(@Param('id') id: string) {
    return this.superAdminService.getHospitalById(id);
  }

  @Post('hospitals')
  @HttpCode(HttpStatus.CREATED)
  async createHospital(
    @Body() dto: CreateSuperAdminHospitalDto,
    @Request() req: any,
  ) {
    return this.superAdminService.createHospital(dto, req.user);
  }

  @Get('subscriptions')
  @HttpCode(HttpStatus.OK)
  async getSubscriptions() {
    return this.superAdminService.getSubscriptions();
  }

  @Get('analytics/platform')
  @HttpCode(HttpStatus.OK)
  async getPlatformAnalytics() {
    return this.superAdminService.getPlatformAnalytics();
  }

  @Post('hospitals/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approveHospital(@Param('id') id: string, @Request() req: any) {
    return this.superAdminService.approveHospital(id, req.user);
  }

  @Post('hospitals/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectHospital(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: any,
  ) {
    return this.superAdminService.rejectHospital(id, reason || 'Application did not meet accreditation criteria', req.user);
  }

  @Post('hospitals/:id/suspend')
  @HttpCode(HttpStatus.OK)
  async suspendHospital(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: any,
  ) {
    return this.superAdminService.suspendHospital(id, reason || 'Compliance investigation or subscription lapse', req.user);
  }

  @Post('hospitals/:id/reactivate')
  @HttpCode(HttpStatus.OK)
  async reactivateHospital(@Param('id') id: string, @Request() req: any) {
    return this.superAdminService.reactivateHospital(id, req.user);
  }

  @Patch('hospitals/:id/toggle-status')
  @HttpCode(HttpStatus.OK)
  async toggleHospitalStatus(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: any,
  ) {
    return this.superAdminService.toggleHospitalStatus(id, reason, req.user);
  }

  @Delete('hospitals/:id')
  @HttpCode(HttpStatus.OK)
  async deleteHospital(@Param('id') id: string, @Request() req: any) {
    return this.superAdminService.decommissionHospital(id, req.user);
  }

  @Get('plans')
  @HttpCode(HttpStatus.OK)
  async getSubscriptionPlans() {
    return this.superAdminService.getSubscriptionPlans();
  }

  @Post('plans')
  @HttpCode(HttpStatus.CREATED)
  async createSubscriptionPlan(@Body() dto: any) {
    return this.superAdminService.createSubscriptionPlan(dto);
  }

  @Post('plans/:id')
  @HttpCode(HttpStatus.OK)
  async updateSubscriptionPlan(@Param('id') id: string, @Body() dto: any) {
    return this.superAdminService.updateSubscriptionPlan(id, dto);
  }
}
