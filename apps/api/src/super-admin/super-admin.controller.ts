import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SuperAdminService, CreateHospitalDto, PlatformSettingsDto } from './super-admin.service';
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

  @Post('hospitals')
  @HttpCode(HttpStatus.CREATED)
  async createHospital(@Body() dto: CreateHospitalDto) {
    return this.superAdminService.createHospital(dto);
  }

  @Patch('hospitals/:id/toggle-status')
  @HttpCode(HttpStatus.OK)
  async toggleHospitalStatus(@Param('id') id: string) {
    return this.superAdminService.toggleHospitalStatus(id);
  }

  @Delete('hospitals/:id')
  @HttpCode(HttpStatus.OK)
  async deleteHospital(@Param('id') id: string) {
    return this.superAdminService.deleteHospital(id);
  }

  @Get('subscriptions')
  @HttpCode(HttpStatus.OK)
  async getSubscriptions() {
    return this.superAdminService.getSubscriptions();
  }

  @Patch('settings')
  @HttpCode(HttpStatus.OK)
  async updateSettings(@Body() settings: Partial<PlatformSettingsDto>) {
    return this.superAdminService.updateSettings(settings);
  }
}
