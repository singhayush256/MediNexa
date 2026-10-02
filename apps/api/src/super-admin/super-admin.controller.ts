import {
  Controller,
  Get,
  Post,
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
}
